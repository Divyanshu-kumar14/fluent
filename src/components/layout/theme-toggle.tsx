"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="w-9 h-9 opacity-50 relative overflow-hidden">
        <Sun className="absolute inset-0 m-auto h-5 w-5 opacity-0" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  const handleToggle = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTheme(isDark ? "light" : "dark");
    
    // Reset the animation state after the full 700ms timeline
    setTimeout(() => {
      setIsAnimating(false);
    }, 700);
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className={`relative w-9 h-9 overflow-hidden transition-colors ${
        isAnimating ? "theme-glow-animation ring-2 ring-primary/20" : ""
      }`}
      onClick={handleToggle}
      aria-label="Toggle theme"
    >
      {/* 
        Phase 2: Background Overlay Crossfade (150ms-600ms)
        Uses delaying to wait for phase 1 
      */}
      <div 
        className={`absolute inset-0 transition-opacity duration-500 delay-150 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isDark 
            ? 'opacity-100 bg-slate-900/10' 
            : 'opacity-0 bg-amber-100/20'
        }`} 
      />

      {/* 
        Phase 1: Icon translation and scaling (0-150ms)
      */}
      <Sun 
        className={`absolute inset-0 m-auto h-5 w-5 text-amber-500 transition-all duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isDark 
            ? 'scale-50 translate-y-4 opacity-0' 
            : 'scale-100 translate-y-0 opacity-100'
        }`} 
      />
      <Moon 
        className={`absolute inset-0 m-auto h-5 w-5 text-indigo-400 transition-all duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isDark 
            ? 'scale-100 translate-y-0 opacity-100' 
            : 'scale-50 -translate-y-4 opacity-0'
        }`} 
      />
      
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
