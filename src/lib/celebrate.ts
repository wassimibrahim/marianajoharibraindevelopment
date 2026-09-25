/** Global celebration triggers. The canvases listen; anyone can call. */

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

export function launchFireworks(intensity = 1): void {
  if (typeof window === "undefined" || prefersReducedMotion()) return;
  window.dispatchEvent(new CustomEvent("lab:fireworks", { detail: { intensity } }));
}

export async function confettiBurst(style: "petals" | "classic" | "hearts" = "classic"): Promise<void> {
  if (typeof window === "undefined" || prefersReducedMotion()) return;
  const confetti = (await import("canvas-confetti")).default;
  const colors = ["#f7b3c8", "#d9467a", "#c9b8f0", "#8c6bd1", "#bfddf5", "#4f8fcb", "#e8c77a", "#ffffff"];
  if (style === "classic") {
    const base = { spread: 70, ticks: 220, gravity: 0.9, scalar: 0.95, colors, disableForReducedMotion: true };
    confetti({ ...base, particleCount: 70, origin: { x: 0.15, y: 0.75 }, angle: 60 });
    confetti({ ...base, particleCount: 70, origin: { x: 0.85, y: 0.75 }, angle: 120 });
    return;
  }
  const glyphs = style === "hearts" ? ["❤️", "💗", "✨"] : ["🌸", "🌷", "🌼", "🪻", "🌺"];
  const shapes = glyphs.map((text) => confetti.shapeFromText({ text, scalar: 2.2 }));
  confetti({
    shapes,
    scalar: 2.2,
    particleCount: 26,
    spread: 110,
    startVelocity: 32,
    ticks: 260,
    gravity: 0.7,
    origin: { x: 0.5, y: 0.55 },
    flat: true,
    disableForReducedMotion: true,
  });
}
