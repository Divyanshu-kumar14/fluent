"use client";

import { z } from "zod";
// import { toast } from "sonner";
// import { useRouter } from "next/navigation";
import { formOptions } from "@tanstack/react-form";
// import { useMutation } from "@tanstack/react-query";

// import { useTRPC } from "@/trpc/client";
import { useAppForm } from "@/hooks/use-app-form";
// import { useCheckout } from "@/features/billing/hooks/use-checkout";

const ttsFormSchema = z.object({
  text: z.string().min(1, "Please enter some text"),
  voiceId: z.string().min(1, "Please select a voice"),
  temperature: z.number(),
  topP: z.number(),
  topK: z.number(),
  repetitionPenalty: z.number(),
});

export type TTSFormValues = z.infer<typeof ttsFormSchema>;

export const defaultTTSValues: TTSFormValues = {
  text: "",
  voiceId: "",
  temperature: 0.8,
  topP: 0.95,
  topK: 1000,
  repetitionPenalty: 1.2,
};

export const ttsFormOptions = formOptions({
  defaultValues: defaultTTSValues,
});

export function TextToSpeechForm({
  children,
  defaultValues,
}: {
  children: React.ReactNode;
  defaultValues?: TTSFormValues;
}) {
    const form = useAppForm({
        ...ttsFormOptions,
        defaultValues: defaultValues ?? defaultTTSValues,
        validators: {
            onSubmit: ttsFormSchema,
        },
        onSubmit: async () => {
            // Logic -
        },
    });

    return <form.AppForm>{children}</form.AppForm>;
};