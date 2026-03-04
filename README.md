<p align="center">
  <img src="public/logo.svg" alt="Fluent Logo" width="120" />
</p>

<h1 align="center">Fluent</h1>

<p align="center">
  <b>AI-powered text-to-speech platform with voice cloning</b>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#scripts">Scripts</a> •
  <a href="#environment-variables">Environment Variables</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#license">License</a>
</p>

---

## Features

- 🎙️ **Text-to-Speech Generation** — Convert text to natural-sounding speech with fine-grained control over temperature, top-p, top-k, and repetition penalty.
- 🗣️ **Voice Cloning** — Upload a reference audio clip and create a custom voice that mirrors it.
- 📚 **Voice Library** — Browse system-provided voices across categories like Audiobook, Conversational, Podcast, Meditation, and more.
- 🏢 **Multi-Tenant (Org-Based)** — Built on Clerk organizations so teams can manage their own voices and generation history.
- 📊 **Dashboard** — View generation history, manage voices, and monitor usage at a glance.
- 🔊 **In-Browser Audio Playback** — Preview generated audio inline with a waveform player powered by wavesurfer.js.

---

## Tech Stack

| Layer              | Technology                                                                                           |
| ------------------ | ---------------------------------------------------------------------------------------------------- |
| **Framework**      | [Next.js 16](https://nextjs.org) (App Router)                                                        |
| **Language**       | TypeScript                                                                                           |
| **Styling**        | [Tailwind CSS 4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)                       |
| **API Layer**      | [tRPC v11](https://trpc.io) + [TanStack React Query](https://tanstack.com/query)                     |
| **Database**       | PostgreSQL via [Prisma ORM v7](https://www.prisma.io)                                                |
| **Auth**           | [Clerk](https://clerk.com) (org-based multi-tenancy)                                                 |
| **Object Storage** | [Cloudflare R2](https://developers.cloudflare.com/r2) (voice files & generated audio)                |
| **TTS Engine**     | [Chatterbox TTS](https://github.com/resemble-ai/chatterbox) on [Modal](https://modal.com) (A10G GPU) |
| **Audio Player**   | [wavesurfer.js](https://wavesurfer-js.org)                                                           |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Next.js App                        │
│  ┌──────────┐  ┌───────────┐  ┌──────────────────────┐  │
│  │  Clerk   │  │   tRPC    │  │   React + Tailwind   │  │
│  │  Auth    │  │  Routers  │  │   UI Components      │  │
│  └────┬─────┘  └─────┬─────┘  └──────────────────────┘  │
│       │              │                                  │
│       ▼              ▼                                  │
│  ┌──────────┐  ┌───────────┐                            │
│  │  Prisma  │  │  R2 SDK   │                            │
│  │  Client  │  │  Client   │                            │
│  └────┬─────┘  └─────┬─────┘                            │
└───────┼──────────────┼──────────────────────────────────┘
        │              │
        ▼              ▼
   PostgreSQL    Cloudflare R2        Modal (GPU)
   (Database)    (Audio Storage)      Chatterbox TTS
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** (comes with Node.js)
- **PostgreSQL** database (or a hosted instance like [Prisma Accelerate](https://www.prisma.io/accelerate))
- **Clerk** account for authentication
- **Cloudflare R2** bucket for audio file storage
- **Modal** account for GPU-powered TTS inference

### 1. Clone the repository

```bash
git clone https://github.com/Divyanshu-kumar14/fluent.git
cd fluent
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

See [Environment Variables](#environment-variables) for the full list of required values.

### 4. Set up the database

```bash
npx prisma migrate dev
```

### 5. (Optional) Seed system voices

```bash
npx tsx scripts/seed-system-voices.ts
```

### 6. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
fluent/
├── prisma/
│   ├── schema.prisma          # Database models (Voice, Generation)
│   └── migrations/            # SQL migration history
├── scripts/
│   ├── seed-system-voices.ts  # Seed built-in voices into the DB
│   └── sync-api.ts            # Generate TS types from Chatterbox OpenAPI spec
├── src/
│   ├── app/                   # Next.js App Router pages & layouts
│   │   ├── (dashboard)/       # Authenticated dashboard routes
│   │   ├── api/               # API route handlers (tRPC)
│   │   ├── sign-in/           # Clerk sign-in page
│   │   └── sign-up/           # Clerk sign-up page
│   ├── components/            # Reusable UI components (shadcn/ui based)
│   ├── features/              # Feature modules
│   │   ├── dashboard/         # Dashboard views & components
│   │   ├── text-to-speech/    # TTS generation UI, hooks, & data fetching
│   │   └── voices/            # Voice management
│   ├── generated/             # Auto-generated Prisma Client
│   ├── hooks/                 # Shared React hooks
│   ├── lib/                   # Core utilities
│   │   ├── chatterbox-client.ts  # HTTP client for the TTS API
│   │   ├── db.ts              # Prisma database client
│   │   ├── env.ts             # Validated env vars (t3-env)
│   │   ├── r2.ts              # Cloudflare R2 S3-compatible client
│   │   └── utils.ts           # General helpers
│   ├── trpc/                  # tRPC setup
│   │   ├── routers/           # API routers (voices, generations)
│   │   ├── init.ts            # tRPC initialization & middleware
│   │   ├── client.tsx         # Client-side tRPC provider
│   │   └── server.tsx         # Server-side tRPC caller
│   └── types/                 # TypeScript type definitions
├── chatterbox_tts.py          # Modal GPU service for Chatterbox TTS
├── package.json
└── tsconfig.json
```

---

## Scripts

| Command                          | Description                                                  |
| -------------------------------- | ------------------------------------------------------------ |
| `npm run dev`                    | Start the Next.js development server                         |
| `npm run build`                  | Create an optimized production build                         |
| `npm run start`                  | Run the production server                                    |
| `npm run lint`                   | Run ESLint                                                   |
| `npm run sync-api`               | Regenerate TypeScript types from the Chatterbox OpenAPI spec |
| `modal deploy chatterbox_tts.py` | Deploy the TTS service to Modal                              |
| `modal run chatterbox_tts.py`    | Smoke-test the TTS service locally via Modal                 |

---

## Environment Variables

Create a `.env` file in the project root. **Never commit this file** (it's already in `.gitignore`).

| Variable                              | Description                                          |
| ------------------------------------- | ---------------------------------------------------- |
| `DATABASE_URL`                        | PostgreSQL connection string                         |
| `APP_URL`                             | Public URL of the app (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`   | Clerk publishable key                                |
| `CLERK_SECRET_KEY`                    | Clerk secret key                                     |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`       | Sign-in route (e.g. `/sign-in`)                      |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL`       | Sign-up route (e.g. `/sign-up`)                      |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | Redirect after sign-in (e.g. `/`)                    |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | Redirect after sign-up (e.g. `/`)                    |
| `R2_ACCOUNT_ID`                       | Cloudflare account ID                                |
| `R2_ACCESS_KEY_ID`                    | R2 API access key ID                                 |
| `R2_SECRET_ACCESS_KEY`                | R2 API secret access key                             |
| `R2_BUCKET_NAME`                      | R2 bucket name                                       |
| `CHATTERBOX_API_URL`                  | URL of the deployed Modal TTS service                |
| `CHATTERBOX_API_KEY`                  | API key for authenticating with the TTS service      |

<details>
<summary><strong>.env.example</strong></summary>

```env
# ─── Database ───
DATABASE_URL="postgresql://user:password@localhost:5432/fluent"

# ─── App ───
APP_URL=http://localhost:3000

# ─── Clerk Auth ───
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# ─── Cloudflare R2 ───
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=

# ─── Chatterbox TTS ───
CHATTERBOX_API_URL=https://your-modal-endpoint.modal.run
CHATTERBOX_API_KEY=
```

</details>

---

## TTS Service (Modal)

The file `chatterbox_tts.py` defines a serverless GPU service on [Modal](https://modal.com) that:

1. Loads the **Chatterbox Turbo TTS** model onto an A10G GPU.
2. Mounts the R2 bucket (read-only) to serve reference voice audio.
3. Exposes a FastAPI `/generate` endpoint protected by API key auth.

### Deploy

```bash
# Set up Modal secrets (one-time)
modal secret create cloudflare-r2 \
  AWS_ACCESS_KEY_ID=<your-r2-access-key> \
  AWS_SECRET_ACCESS_KEY=<your-r2-secret-key>

modal secret create chatterbox-api-key \
  CHATTERBOX_API_KEY=<your-api-key>

modal secret create hf-token \
  HF_TOKEN=<your-huggingface-token>

# Deploy
modal deploy chatterbox_tts.py
```

### Test

```bash
modal run chatterbox_tts.py \
  --prompt "Hello from Chatterbox." \
  --voice-key "voices/system/default.wav"
```

---

## Database Schema

The app uses two core models:

- **Voice** — A voice profile (system or custom) with a reference audio file in R2.
- **Generation** — A TTS generation record linking text input, voice settings, and the output audio in R2.

Run `npx prisma studio` to browse your data visually.

---

## Deployment

### Next.js App

Deploy to [Vercel](https://vercel.com) (recommended) or any Node.js hosting provider:

```bash
npm run build
npm run start
```

Set all [environment variables](#environment-variables) in your hosting provider's dashboard.

### TTS Service

Deploy to Modal with `modal deploy chatterbox_tts.py`. See the [TTS Service section](#tts-service-modal) above.

---

## License

This project is private. All rights reserved.
