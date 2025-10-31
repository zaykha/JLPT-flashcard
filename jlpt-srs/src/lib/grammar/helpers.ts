// Small helpers for Japanese content

export function normalizeSimple(s?: string): string {
  if (!s) return '';
  return s.normalize('NFKC').replace(/\s+/g, ' ').trim();
}

/**
 * Swap に ↔ で for contrast examples.
 * Safe for undefined/null inputs.
 */
export function swapNiDe(sentence?: string): string {
  const t = sentence ?? '';
  return t
    .replace(/に/g, '§TMP§')
    .replace(/で/g, 'に')
    .replace(/§TMP§/g, 'で');
}

// NOTE: We intentionally removed particle-highlighting helpers.
// If anything still imports them, keep these no-op exports as a safety net:
/** @deprecated no-op; particle highlighting removed */
export function hintParticles(text?: string): string {
  return text ?? '';
}
/** @deprecated no-op; particle highlighting removed */
export function escapeRegExp(s?: string): string {
  return s ?? '';
}
