/**
 * Cloudflare R2 Storage Utilities
 *
 * Provides helper functions for uploading, deleting, and generating
 * pre-signed download URLs for audio files stored in a Cloudflare R2 bucket.
 * Uses the AWS S3 SDK, which is compatible with R2's S3-compatible API.
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "./env";

/** S3-compatible client configured for the Cloudflare R2 endpoint. */
const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

type UploadAudioOptions = {
  buffer: Buffer;
  /** R2 object key (path within the bucket), e.g. "generations/orgs/abc/123" */
  key: string;
  /** MIME type — defaults to "audio/wav" */
  contentType?: string;
};

/** Upload an audio buffer to the R2 bucket. */
export async function uploadAudio({
  buffer,
  key,
  contentType = "audio/wav",
}: UploadAudioOptions): Promise<void> {
  await r2.send(
    new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );
};

/** Delete an audio object from the R2 bucket by its key. */
export async function deleteAudio(key: string): Promise<void> {
  await r2.send(
    new DeleteObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
    }),
  );
};

/**
 * Generate a pre-signed URL for downloading an audio object from R2.
 * The URL is valid for 1 hour (3600 seconds).
 */
export async function getSignedAudioUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
  });
  return getSignedUrl(r2, command, { expiresIn: 3600 });
};