/**
 * TTS Text Input Panel Component
 *
 * The main text input area for the TTS editor page.
 * Wired to the TTS form via TanStack Form context.
 *
 * Features:
 *   - Full-height textarea with a fade-to-transparent bottom overlay.
 *   - Responsive action bar: full-width button on mobile, inline on desktop.
 *   - Cost estimate badge and character counter (desktop only, shown when typing).
 */
"use client";

import { useStore } from "@tanstack/react-form";
import { Coins } from "lucide-react";
import { useEffect } from "react";
import { useFocusModeStore } from "@/features/text-to-speech/stores/focus-mode-store";

import { SettingsDrawer } from "./settings/settings-drawer";
import { HistoryDrawer } from "./history-drawer";
import { VoiceSelectorButton } from "./voices/voice-selector-button";
import { PromptSuggestions } from "./prompt-suggestions";

import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useTypedAppFormContext } from "@/hooks/use-app-form";

import { 
    COST_PER_UNIT, 
    TEXT_MAX_LENGTH } 
    from "@/features/text-to-speech/data/constants";

import { 
    ttsFormOptions } 
    from "./text-to-speech-form";

import { GenerateButton } from "@/features/text-to-speech/components/generate-button";

export function TextInputPanel() {
    
    const form = useTypedAppFormContext(ttsFormOptions);

    // Subscribe to relevant form state slices for reactivity
    const text = useStore(form.store, (s) => s.values.text);
    const isSubmitting = useStore(form.store, (s) => s.isSubmitting);
    const isValid = useStore(form.store, (s) => s.isValid); 
    
    // Focus Mode state
    const isFocusMode = useFocusModeStore((s) => s.isFocusMode);
    const setFocusMode = useFocusModeStore((s) => s.setFocusMode);

    useEffect(() => {
        if (isFocusMode) {
            document.body.setAttribute("data-focus-mode", "true");
        } else {
            document.body.removeAttribute("data-focus-mode");
        }
    }, [isFocusMode]);
    
    return (
        <div className="flex h-full min-h-0 flex-col flex-1">
            {/* Text Input Area — absolutely positioned to fill the flex container */}
            <div 
                 className="relative min-h-0 flex-1"
                 onMouseLeave={() => setFocusMode(false)}
            >
                <form.Field name="text">
                    {(field) => (
                <Textarea
                    value={field.state.value}
                    onChange={(e) => {
                        field.handleChange(e.target.value);
                        setFocusMode(true);
                    }}
                    onFocus={() => {
                        if (field.state.value.trim().length > 0) {
                            setFocusMode(true);
                        }
                    }}
                    onBlur={() => setFocusMode(false)}
                    placeholder="Start typing or paste your text here..."
                    className={`absolute inset-0 resize-none border-0 bg-transparent p-4 pb-6 lg:p-6 lg:pb-8 text-base! leading-relaxed tracking-tight shadow-none wrap-break-word focus-visible:ring-0 transition-all duration-500 ease-in-out ${
                        isFocusMode ? "text-2xl! lg:text-3xl! pt-24 lg:pt-32 text-center" : ""
                    }`}
                    maxLength={TEXT_MAX_LENGTH}
                    disabled={isSubmitting}
                />
                )}
                </form.Field>
                {/* Bottom fade overlay — prevents text from touching the action bar */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-linear-to-t from-background to-transparent" 
                />
            </div>

            {/* Action bar */}
            <div className="shrink-0 p-4 lg:p-6 fade-on-focus">
                {/* Mobile layout: full-width generate button */}
                <div className="flex flex-col gap-3 lg:hidden">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <SettingsDrawer >
                                <VoiceSelectorButton />
                            </SettingsDrawer>
                            <HistoryDrawer />
                        </div>
                        {text.length > 0 && (
                            <p className={`text-xs tracking-tight ${text.length > TEXT_MAX_LENGTH ? 'text-destructive' : ''}`}>
                                {text.length.toLocaleString()}
                                <span className="text-muted-foreground">
                                    &nbsp;/&nbsp;{TEXT_MAX_LENGTH.toLocaleString()}
                                </span>
                            </p>
                        )}
                    </div>
                    <GenerateButton 
                        className="w-full"
                        disabled={!isValid || isSubmitting}
                        isSubmitting={isSubmitting}
                        onSubmit={() => form.handleSubmit()}
                    />
                </div>

                {/* Desktop layout: cost estimate + counter + inline generate button */}
                {text.length > 0 ? (
                    <div className="hidden items-center justify-between lg:flex">
                        {/* Cost estimate badge */}
                        <Badge variant="outline" className="gap-1.5 border-dashed">
                            <Coins className="size-3 text-chart-5" />
                            <span className="text-xs">
                                <span className="tabular-nums">
                                    ${(text.length * COST_PER_UNIT).toFixed(4)}
                                    </span>&nbsp;
                                estimated
                            </span>
                        </Badge>
                        <div className="flex items-center gap-3">
                            {/* Character counter */}
                            <p className="text-xs tracking-tight">
                                {text.length.toLocaleString()}
                                <span className="text-muted-foreground">
                                    &nbsp;/&nbsp;{TEXT_MAX_LENGTH.toLocaleString()} 
                                    characters
                                </span>
                            </p>
                            <GenerateButton 
                                size = "sm"
                                disabled={!isValid || isSubmitting}
                                isSubmitting={isSubmitting}
                                onSubmit={() => form.handleSubmit()}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="hidden lg:block">
                        <PromptSuggestions 
                            onSelect={(prompt) => form.setFieldValue("text", prompt)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};