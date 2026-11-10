import { useMemo } from 'react';

const PALETTES: [string, string][] = [
  ['#ff8a4c', '#7a1f0b'],
  ['#ffc14d', '#8a3b06'],
  ['#4ed6b8', '#0d3f47'],
  ['#8f7bff', '#241a54'],
  ['#ff6f91', '#4b1027'],
  ['#5ec8ff', '#0b2a4a'],
  ['#a6e05a', '#1f3a12'],
  ['#ffa07a', '#3a1533'],
  ['#f7d774', '#3b2a06'],
  ['#7ad7c3', '#123b33'],
  ['#c78bff', '#2d1050'],
  ['#ff9466', '#40211a'],
];

function hashSeed(seed: string): number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

function glyphFor(title: string): string {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return 'MM';
  const telugu = /[\u0c00-\u0c7f]/.test(title);
  if (telugu) return title.trim().slice(0, 2);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

interface ArtworkProps {
  seed: string;
  title: string;
  round?: boolean;
  tiny?: boolean;
  className?: string;
  glyph?: string;
}

/**
 * Generated cover art: deterministic gradient + pattern per catalogue id, so the
 * prototype needs no licensed artwork and no image downloads on low-end phones.
 */
export function Artwork({ seed, title, round, tiny, className = '', glyph }: ArtworkProps) {
  const { from, to, angle } = useMemo(() => {
    const hash = hashSeed(seed);
    const [a, b] = PALETTES[hash % PALETTES.length];
    return { from: a, to: b, angle: 115 + (hash % 70) };
  }, [seed]);

  return (
    <div
      className={`artwork ${round ? 'artwork--round' : ''} ${tiny ? 'artwork--tiny' : ''} ${className}`}
      style={{ background: `linear-gradient(${angle}deg, ${from}, ${to})` }}
      aria-hidden="true"
    >
      <span className="artwork__rings" />
      <span className="artwork__waves" />
      <span className="artwork__glyph">{glyph ?? glyphFor(title)}</span>
    </div>
  );
}
