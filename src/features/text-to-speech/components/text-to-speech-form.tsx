/**
 * Text-to-Speech Form Component
 *
 * Wraps the TTS editor in a TanStack Form instance.
 *
 * Responsibilities:
 *   - Defines the TTS form schema (text, voiceId, slider params).
 *   - Exports shared form options so child components can access the form via context.
 *   - Handles form submission: calls the tRPC `generations.create` mutation,
 *     shows a success toast, and navigates to the generation detail page.
 *
 * Subscription-gated generation (via Polar) is currently disabled.
 */
"use client";

import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { formOptions } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { useAppForm } from "@/hooks/use-app-form";
// import { useCheckout } from "@/features/billing/hooks/use-checkout";

import { TEXT_MAX_LENGTH } from "@/features/text-to-speech/data/constants";

/** Zod schema for TTS form validation. */
const ttsFormSchema = z.object({
  text: z.string().min(1, "Please enter some text").max(TEXT_MAX_LENGTH, "Text must be 1000 characters or less"),
  voiceId: z.string().min(1, "Please select a voice"),
  temperature: z.number(),
  topP: z.number(),
  topK: z.number(),
  repetitionPenalty: z.number(),
});

/** Inferred TypeScript type from the form schema. */
export type TTSFormValues = z.infer<typeof ttsFormSchema>;

/** Default values used when creating a new generation (no pre-fill). */
export const defaultTTSValues: TTSFormValues = {
  text: "",
  voiceId: "",
  temperature: 0.8,
  topP: 0.95,
  topK: 1000,
  repetitionPenalty: 1.2,
};

/**
 * Shared form options — exported so child components can access the form
 * through useTypedAppFormContext(ttsFormOptions).
 */
export const ttsFormOptions = formOptions({
  defaultValues: defaultTTSValues,
});

/**
 * Form provider component. Mount this around the TTS editor to make
 * the form instance available to all child components.
 */
export function TextToSpeechForm({
  children,
  defaultValues,
}: {
  children: React.ReactNode;
  defaultValues?: TTSFormValues;
}) {
  const trpc = useTRPC();
  const router = useRouter();
  const createMutation = useMutation(
    trpc.generations.create.mutationOptions({}),
  );

  // const { checkout } = useCheckout();

  const form = useAppForm({
    ...ttsFormOptions,
    defaultValues: defaultValues ?? defaultTTSValues,
    validators: {
      onSubmit: ttsFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        // Call the generations.create mutation via tRPC
        const data = await createMutation.mutateAsync({
          text: value.text.trim(),
          voiceId: value.voiceId,
          temperature: value.temperature,
          topP: value.topP,
          topK: value.topK,
          repetitionPenalty: value.repetitionPenalty,
        });

        toast.success("Audio generated successfully!");
        // Navigate to the generation detail page to play the result
        router.push(`/text-to-speech/${data.id}`);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to generate audio";
        toast.error(message);
      }
    },
  });

  return <form.AppForm>{children}</form.AppForm>;
};