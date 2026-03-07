/**
 * Quick Actions Data
 *
 * Static list of quick-action cards displayed on the dashboard.
 * Each action pre-fills the TTS page with a sample text snippet
 * so users can try different use-cases (story, ad, podcast, etc.).
 */

/** Shape of a single quick-action card. */
export interface QuickAction {
  title: string;
  description: string;
  /** Name of the mapped lucide icon */
  iconName: string;
  /** Tailwind color classes for the wrapper and icon (e.g. text-blue-500 bg-blue-500/10) */
  iconColorClass: string;
  /** Hover glow class for the card border */
  hoverBorderClass: string;
  /** Link to the TTS page with pre-filled text via query param. */
  href: string;
};

export const quickActions: QuickAction[] = [
  {
    title: "Narrate a Story",
    description: "Bring characters to life with expressive AI narration",
    iconName: "book-open",
    iconColorClass: "text-blue-500 bg-blue-500/10",
    hoverBorderClass: "group-hover:border-blue-500/50 group-hover:shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)]",
    href: "/text-to-speech?text=In a village tucked between mist-covered mountains, there lived an old clockmaker whose clocks never told the right time — but they always told the truth. One rainy evening, a stranger walked in and asked for a clock that could show him his future.",
  },
  {
    title: "Record an Ad",
    description: "Create professional advertisements with lifelike AI voices",
    iconName: "megaphone",
    iconColorClass: "text-purple-500 bg-purple-500/10",
    hoverBorderClass: "group-hover:border-purple-500/50 group-hover:shadow-[0_0_20px_-5px_rgba(168,85,247,0.3)]",
    href: "/text-to-speech?text=Introducing BrightBean Coffee — the smoothest roast you'll ever taste. Sourced from high-altitude farms, slow-roasted to perfection, and delivered fresh to your door every single week. Wake up to something extraordinary. Try BrightBean today and get your first bag free.",
  },
  {
    title: "Direct a Movie Scene",
    description: "Generate dramatic dialogue for film and video",
    iconName: "clapperboard",
    iconColorClass: "text-rose-500 bg-rose-500/10",
    hoverBorderClass: "group-hover:border-rose-500/50 group-hover:shadow-[0_0_20px_-5px_rgba(244,63,94,0.3)]",
    href: "/text-to-speech?text=The rain hammered against the window as she turned to face him. You knew, didn't you? she whispered, her voice barely holding together. He stepped forward, jaw clenched. I did what I had to do. The silence between them was louder than the storm outside.",
  },
  {
    title: "Voice a Game Character",
    description: "Build immersive worlds with dynamic character voices",
    iconName: "gamepad-2",
    iconColorClass: "text-amber-500 bg-amber-500/10",
    hoverBorderClass: "group-hover:border-amber-500/50 group-hover:shadow-[0_0_20px_-5px_rgba(245,158,11,0.3)]",
    href: "/text-to-speech?text=Listen up, adventurer. The realm of Ashenvale is crumbling, and the Crystal of Eternity has been shattered into seven pieces. You are the only one who can reassemble it. Gather your courage, sharpen your blade, and meet me at the Gates of Dawn. Time is not on our side.",
  },
  {
    title: "Introduce Your Podcast",
    description: "Hook your listeners from the very first second",
    iconName: "podcast",
    iconColorClass: "text-indigo-500 bg-indigo-500/10",
    hoverBorderClass: "group-hover:border-indigo-500/50 group-hover:shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)]",
    href: "/text-to-speech?text=Hey everyone, welcome back to another episode of The Curious Mind — the podcast where we dig into the stories, science, and strange ideas that shape our world. I'm your host, and today we have an incredible guest who's going to challenge everything you thought you knew.",
  },
  {
    title: "Guide a Meditation",
    description: "Craft soothing, calming audio for wellness content",
    iconName: "sparkles",
    iconColorClass: "text-emerald-500 bg-emerald-500/10",
    hoverBorderClass: "group-hover:border-emerald-500/50 group-hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]",
    href: "/text-to-speech?text=Close your eyes and take a deep breath in. Hold it gently... and release. Feel the weight of the day slowly melting away. With each breath, you're sinking deeper into calm. There is nowhere else you need to be. Just here. Just now. Breathe in peace, breathe out tension.",
  },
];