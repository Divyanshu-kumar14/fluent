/**
 * Canonical System Voice Names
 *
 * The authoritative list of built-in voice names. Used by the seed script
 * to create/update system voice records in the database. The order here
 * determines the processing order during seeding.
 *
 * To add a new system voice:
 *   1. Add the name to this array.
 *   2. Place the matching .wav file in scripts/system-voices/<Name>.wav.
 *   3. Add metadata in scripts/seed-system-voices.ts.
 *   4. Run the seed script.
 */

export const CANONICAL_SYSTEM_VOICE_NAMES = [
  "Aaron",
  "Abigail",
  "Anaya",
  "Andy",
  "Archer",
  "Brian",
  "Chloe",
  "Dylan",
  "Emmanuel",
  "Ethan",
  "Evelyn",
  "Gavin",
  "Gordon",
  "Ivan",
  "Laura",
  "Lucy",
  "Madison",
  "Marisol",
  "Meera",
  "Walter",
] as const;