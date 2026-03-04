/**
 * Text-to-Speech Layout
 *
 * Shared layout for all /text-to-speech routes.
 * Adds a page header and flex container that the child pages fill.
 */

import { TextToSpeechLayout } from "@/features/text-to-speech/views/text-to-speech-layout";

export default function Layout({ 
  children
}: { 
  children: React.ReactNode
}) {
  return <TextToSpeechLayout>{children}</TextToSpeechLayout>;
};