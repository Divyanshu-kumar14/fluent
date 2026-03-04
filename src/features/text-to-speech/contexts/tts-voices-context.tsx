/**
 * TTS Voices React Context
 *
 * Provides the available voices (custom + system) to all TTS components
 * via React context. This avoids prop drilling and lets any component
 * access the voice list with `useTTSVoices()`.
 */
"use client";

import { createContext, useContext } from "react";
import type { inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "@/trpc/routers/_app";

/** Single voice item — inferred from the tRPC voices.getAll response. */
type TTSVoiceItem =
  inferRouterOutputs<AppRouter>["voices"]["getAll"]["custom"][number];

/** Shape of the context value — custom voices, system voices, and a merged list. */
interface TTSVoicesContextValue {
  customVoices: TTSVoiceItem[];
  systemVoices: TTSVoiceItem[];
  allVoices: TTSVoiceItem[];
};

const TTSVoicesContext = createContext<TTSVoicesContextValue | null>(null);

/** Provider — wrap TTS views with this to supply the voice list. */
export function TTSVoicesProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: TTSVoicesContextValue;
}) {
  return (
    <TTSVoicesContext.Provider value={value}>
      {children}
    </TTSVoicesContext.Provider>
  );
};

/** Hook — access the voice list from any TTS child component. */
export function useTTSVoices() {
  const context = useContext(TTSVoicesContext);

  if (!context) {
    throw new Error("useTTSVoices must be used within a TTSVoicesProvider");
  }

  return context;
};