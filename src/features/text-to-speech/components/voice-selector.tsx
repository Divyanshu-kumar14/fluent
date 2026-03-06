/**
 * Voice Selector Component
 *
 * A dropdown select for choosing a TTS voice, integrated with the TTS form context.
 * Groups voices into:
 *   - Selected Voice (shown if the current voice ID doesn't match any available voice)
 *   - Team Voices (custom org-uploaded voices)
 *   - Built-in Voices (system-wide voices)
 *
 * Each option shows a DiceBear avatar and the voice name + category label.
 */
"use client";

import { useStore } from "@tanstack/react-form";

import { 
  VOICE_CATEGORY_LABELS
} from "@/features/voices/data/voice-categories";

import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTypedAppFormContext } from "@/hooks/use-app-form";
import { VoiceAvatar } from "@/components/voice-avatar/voice-avatar";

import { useTTSVoices } from "../contexts/tts-voices-context";
import { ttsFormOptions } from "./text-to-speech-form";

export function VoiceSelector() {
  const { 
    customVoices, 
    systemVoices, 
    allVoices: voices
  } = useTTSVoices();

  const form = useTypedAppFormContext(ttsFormOptions);
  const voiceId = useStore(form.store, (s) => s.values.voiceId);
  const isSubmitting = useStore(form.store, (s) => s.isSubmitting);

  // Find the currently selected voice in the available list
  const selectedVoice = voices.find((v) => v.id === voiceId);
  // If voiceId is set but not in the list, the voice was likely deleted
  const hasMissingSelectedVoice = Boolean(voiceId) && !selectedVoice;

  // Resolve the display voice (selected, missing/unavailable, or first available)
  const currentVoice = selectedVoice
    ? selectedVoice
    : hasMissingSelectedVoice
      ? {
        id: voiceId,
        name: "Unavailable voice",
        category: null as null,
      }
      : voices[0];

  return (
    <Field>
      <FieldLabel>Voice style</FieldLabel>
      <Select
        value={voiceId}
        onValueChange={(v) => form.setFieldValue("voiceId", v)}
        disabled={isSubmitting}
      >
        {/* Trigger — shows the currently selected voice */}
        <SelectTrigger className="w-full h-auto gap-1 rounded-lg bg-background px-2 py-1">
          <SelectValue>
            {currentVoice && (
              <>
                <VoiceAvatar 
                  seed={currentVoice.id}
                  name={currentVoice.name}
                />
                <span className="truncate text-sm font-medium tracking-tight">
                  {currentVoice.name}
                  {currentVoice.category &&
                    ` - ${VOICE_CATEGORY_LABELS[currentVoice.category]}`
                  }
                </span>
              </>
            )}
          </SelectValue>
        </SelectTrigger>

        {/* Dropdown content — grouped by voice type */}
        <SelectContent>
          {/* Show the "unavailable" voice at the top if the ID doesn't match */}
          {hasMissingSelectedVoice && currentVoice && (
            <>
              <SelectGroup>
                <SelectLabel>Selected Voice</SelectLabel>
                <SelectItem value={currentVoice.id}>
                  <VoiceAvatar
                    seed={currentVoice.id}
                    name={currentVoice.name}
                  />
                  <span className="truncate text-sm font-medium">
                    {currentVoice.name}
                    {currentVoice.category &&
                      ` - ${VOICE_CATEGORY_LABELS[currentVoice.category]}`}
                  </span>
                </SelectItem>
              </SelectGroup>
              {(customVoices.length > 0 || systemVoices.length > 0) && (
                <SelectSeparator />
              )}
            </>
          )}

          {/* Team Voices — custom voices uploaded by the org */}
          {customVoices.length > 0 && (
            <SelectGroup>
              <SelectLabel>Team Voices</SelectLabel>
              {customVoices.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  <VoiceAvatar seed={v.id} name={v.name} />
                  <span className="truncate text-sm font-medium">
                    {v.name} - {VOICE_CATEGORY_LABELS[v.category]}
                  </span>
                </SelectItem>
              ))}
            </SelectGroup>
          )}

          {/* Separator between custom and system voices */}
          {customVoices.length > 0 && systemVoices.length > 0 && (
            <SelectSeparator />
          )}

          {/* Built-in Voices — platform-wide system voices */}
          {systemVoices.length > 0 && (
            <SelectGroup>
              <SelectLabel>Built-in Voices</SelectLabel>
              {systemVoices.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  <VoiceAvatar seed={v.id} name={v.name} />
                  <span className="truncate text-sm font-medium">
                    {v.name} - {VOICE_CATEGORY_LABELS[v.category]}
                  </span>
                </SelectItem>
              ))}
            </SelectGroup>
          )}
        </SelectContent>
      </Select>
    </Field>
  );
};