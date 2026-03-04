/**
 * Mobile Breakpoint Hook
 *
 * Returns `true` when the viewport width is below 1024px.
 * Uses a media query listener to reactively update on window resize.
 */

import * as React from "react"

/** Breakpoint in pixels — below this is considered "mobile". */
const MOBILE_BREAKPOINT = 1024

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Create a media query that matches below the breakpoint
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    // Set the initial value on mount
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  // Returns false during SSR (undefined → false) to avoid hydration mismatch
  return !!isMobile
}
