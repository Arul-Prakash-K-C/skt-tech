/**
 * Soft process-colour backdrops (cyan, magenta, yellow, mint, violet). A key,
 * such as a category slug, always maps to the same tint, so a category keeps
 * its colour wherever it appears.
 */
export const TINTS = ['#e3f4fb', '#fce6f1', '#fff4cc', '#e0f7f0', '#eeeafe'] as const;

export function tintFor(key: string) {
	let h = 0;
	for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
	return TINTS[h % TINTS.length];
}
