"""
Chatterbox TTS API — Text-to-speech with voice cloning on Modal.

This module defines a serverless GPU-powered TTS API that:
  1. Loads the ChatterboxTurboTTS model on an A10G GPU.
  2. Exposes a FastAPI `/generate` endpoint to synthesize speech from text.
  3. Reads reference voice audio files from a Cloudflare R2 bucket mount.
  4. Uses API key authentication to protect the endpoint.
"""

import modal
import os
from dotenv import load_dotenv

load_dotenv()

# ──────────────────────────────────────────
# Usage examples (run from project root):
# ──────────────────────────────────────────
# Add R2 tokens:
#   modal secret create cloudflare-r2 \
#     AWS_ACCESS_KEY_ID=<r2-access-key-id> \
#     AWS_SECRET_ACCESS_KEY=<r2-secret-access-key>
#
# Test locally:
#   modal run chatterbox_tts.py \
#     --prompt "Hello from Chatterbox [chuckle]." \
#     --voice-key "voices/system/<voice-id>"
#
# Test via cURL:
#   curl -X POST "https://<your-modal-endpoint>/generate" \
#     -H "Content-Type: application/json" \
#     -H "X-Api-Key: <your-api-key>" \
#     -d '{"prompt": "Hello from Chatterbox [chuckle].", "voice_key": "voices/system/<voice-id>"}' \
#     --output output.wav

# ── Cloudflare R2 cloud bucket mount (read-only) ──
# Replaces Modal Volumes for serving reference voice .wav files.

R2_BUCKET_NAME = os.getenv("R2_BUCKET_NAME")
R2_ACCOUNT_ID = os.getenv("R2_ACCOUNT_ID")
R2_MOUNT_PATH = "/r2"
r2_bucket = modal.CloudBucketMount(
    R2_BUCKET_NAME,
    bucket_endpoint_url=f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
    secret=modal.Secret.from_name("cloudflare-r2"),
    read_only=True,
)

# ── Modal application setup ──
# Build a slim Debian image with the required Python packages.
image = modal.Image.debian_slim(python_version="3.10").uv_pip_install(
    "chatterbox-tts==0.1.6",
    "fastapi[standard]==0.124.4",
    "peft==0.18.0",
)
app = modal.App("chatterbox-tts", image=image)

# ── Deferred imports ──
# These are only loaded inside the Modal container at runtime.
with image.imports():
    import io
    import os
    from pathlib import Path

    import torchaudio as ta
    from chatterbox.tts_turbo import ChatterboxTurboTTS
    from fastapi import (
        Depends,
        FastAPI,
        HTTPException,
        Security,
    )
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import StreamingResponse
    from fastapi.security import APIKeyHeader
    from pydantic import BaseModel, Field

    # ── API key authentication scheme ──
    api_key_scheme = APIKeyHeader(
        name="x-api-key",
        scheme_name="ApiKeyAuth",
        auto_error=False,
    )

    def verify_api_key(x_api_key: str | None = Security(api_key_scheme)):
        """Validate the x-api-key header against the CHATTERBOX_API_KEY secret."""
        expected = os.environ.get("CHATTERBOX_API_KEY", "")
        if not expected or x_api_key != expected:
            raise HTTPException(status_code=403, detail="Invalid API key")
        return x_api_key

    class TTSRequest(BaseModel):
        """Request body schema for text-to-speech generation."""

        prompt: str = Field(..., min_length=1, max_length=5000)
        voice_key: str = Field(..., min_length=1, max_length=300)
        temperature: float = Field(default=0.8, ge=0.0, le=2.0)
        top_p: float = Field(default=0.95, ge=0.0, le=1.0)
        top_k: int = Field(default=1000, ge=1, le=10000)
        repetition_penalty: float = Field(default=1.2, ge=1.0, le=2.0)
        norm_loudness: bool = Field(default=True)


# ── Chatterbox GPU service class ──
@app.cls(
    gpu="a10g",
    scaledown_window=60 * 5,  # Keep warm for 5 minutes after last request
    secrets=[
        modal.Secret.from_name("hf-token"),
        modal.Secret.from_name("chatterbox-api-key"),
        modal.Secret.from_name("cloudflare-r2"),
    ],
    volumes={R2_MOUNT_PATH: r2_bucket},
)
@modal.concurrent(max_inputs=10)  # Allow up to 10 concurrent requests per container
class Chatterbox:
    @modal.enter()
    def load_model(self):
        """Load the ChatterboxTurboTTS model into GPU memory on container start."""
        self.model = ChatterboxTurboTTS.from_pretrained(device="cuda")

    @modal.asgi_app()
    def serve(self):
        """Create and return the FastAPI application with the /generate endpoint."""
        web_app = FastAPI(
            title="Chatterbox TTS API",
            description="Text-to-speech with voice cloning",
            docs_url="/docs",
            dependencies=[Depends(verify_api_key)],
        )
        web_app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

        @web_app.post("/generate", responses={200: {"content": {"audio/wav": {}}}})
        def generate_speech(request: TTSRequest):
            """
            Generate speech audio from the given text prompt and reference voice.

            Reads the reference voice .wav from the R2 mount, synthesises speech
            via the loaded model, and streams back the result as audio/wav.
            """
            # Resolve the reference voice file from the R2 mount
            voice_path = Path(R2_MOUNT_PATH) / request.voice_key
            if not voice_path.exists():
                raise HTTPException(
                    status_code=400,
                    detail=f"Voice not found at '{request.voice_key}'",
                )

            try:
                # Call the generate method locally (same container, no RPC overhead)
                audio_bytes = self.generate.local(
                    request.prompt,
                    str(voice_path),
                    request.temperature,
                    request.top_p,
                    request.top_k,
                    request.repetition_penalty,
                    request.norm_loudness,
                )
                return StreamingResponse(
                    io.BytesIO(audio_bytes),
                    media_type="audio/wav",
                )
            except Exception as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to generate audio: {e}",
                )

        return web_app

    @modal.method()
    def generate(
        self,
        prompt: str,
        audio_prompt_path: str,
        temperature: float = 0.8,
        top_p: float = 0.95,
        top_k: int = 1000,
        repetition_penalty: float = 1.2,
        norm_loudness: bool = True,
    ):
        """
        Run TTS inference and return raw WAV bytes.

        This method can be invoked either locally (.local()) from the ASGI
        endpoint or remotely (.remote()) from the local entrypoint for testing.
        """
        wav = self.model.generate(
            prompt,
            audio_prompt_path=audio_prompt_path,
            temperature=temperature,
            top_p=top_p,
            top_k=top_k,
            repetition_penalty=repetition_penalty,
            norm_loudness=norm_loudness,
        )

        # Serialize the waveform tensor to an in-memory WAV buffer
        buffer = io.BytesIO()
        ta.save(buffer, wav, self.model.sr, format="wav")
        buffer.seek(0)
        return buffer.read()


# ── Local test entrypoint ──
# Run via: modal run chatterbox_tts.py --prompt "..." --voice-key "..."
@app.local_entrypoint()
def test(
    prompt: str = "Chatterbox running on Modal [chuckle].",
    voice_key: str = "voices/system/default.wav",
    output_path: str = "/tmp/chatterbox-tts/output.wav",
    temperature: float = 0.8,
    top_p: float = 0.95,
    top_k: int = 1000,
    repetition_penalty: float = 1.2,
    norm_loudness: bool = True,
):
    """Quick smoke-test: runs inference remotely and saves the WAV locally."""
    import pathlib

    chatterbox = Chatterbox()
    audio_prompt_path = f"{R2_MOUNT_PATH}/{voice_key}"
    audio_bytes = chatterbox.generate.remote(
        prompt=prompt,
        audio_prompt_path=audio_prompt_path,
        temperature=temperature,
        top_p=top_p,
        top_k=top_k,
        repetition_penalty=repetition_penalty,
        norm_loudness=norm_loudness,
    )

    output_file = pathlib.Path(output_path)
    output_file.parent.mkdir(parents=True, exist_ok=True)
    output_file.write_bytes(audio_bytes)
    print(f"Audio saved to {output_file}")