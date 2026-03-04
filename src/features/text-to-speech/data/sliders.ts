/**
 * TTS Parameter Slider Definitions
 *
 * Defines the configuration for each slider in the Settings panel.
 * Each slider controls a TTS model parameter with user-friendly labels:
 *   - Creativity (temperature)
 *   - Voice Variety (topP)
 *   - Expression Range (topK)
 *   - Natural Flow (repetitionPenalty)
 */

/** Shape of a single slider configuration. */
interface Slider {
  /** Matches the corresponding TTS form field name. */
  id: "temperature" | "topP" | "topK" | "repetitionPenalty";
  /** User-facing label displayed above the slider. */
  label: string;
  /** Left-side label (low end of the slider). */
  leftLabel: string;
  /** Right-side label (high end of the slider). */
  rightLabel: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
};

export const sliders: Slider[] = [
  {
    id: "temperature",
    label: "Creativity",
    leftLabel: "Consistent",
    rightLabel: "Expressive",
    min: 0,
    max: 2,
    step: 0.1,
    defaultValue: 0.8,
  },
    {
    id: "topP",
    label: "Voice Variety",
    leftLabel: "Stable",
    rightLabel: "Dynamic",
    min: 0,
    max: 1,
    step: 0.05,
    defaultValue: 0.95,
  },
  {
    id: "topK",
    label: "Expression Range",
    leftLabel: "Subtle",
    rightLabel: "Dramatic",
    min: 1,
    max: 10000,
    step: 100,
    defaultValue: 1000,
  },
  {
    id: "repetitionPenalty",
    label: "Natural Flow",
    leftLabel: "Rhythmic",
    rightLabel: "Varied",
    min: 1,
    max: 2,
    step: 0.1,
    defaultValue: 1.2,
  },
];