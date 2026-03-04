/**
 * CSS Class Name Utility
 *
 * Merges Tailwind CSS classes with proper precedence using
 * clsx (conditional class names) + tailwind-merge (deduplication).
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/** Merge class names, resolving Tailwind conflicts (last one wins). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
