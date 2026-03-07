import { z } from "zod";
import { TEXT_MAX_LENGTH } from "./constants";

export const GenerationInputSchema = z.object({
  text: z.string().min(1).max(TEXT_MAX_LENGTH),
  voiceId: z.string().min(1),
  temperature: z.number().min(0).max(2).default(0.8),
  topP: z.number().min(0).max(1).default(0.95),
  topK: z.number().min(1).max(10000).default(1000),
  repetitionPenalty: z.number().min(1).max(2).default(1.2),
});

export type GenerationInput = z.infer<typeof GenerationInputSchema>;

export const VoiceQuerySchema = z.object({
  query: z.string().trim().optional(),
});

export type VoiceQuery = z.infer<typeof VoiceQuerySchema>;

export const VoiceDeleteSchema = z.object({
  id: z.string(),
});

export type VoiceDelete = z.infer<typeof VoiceDeleteSchema>;
