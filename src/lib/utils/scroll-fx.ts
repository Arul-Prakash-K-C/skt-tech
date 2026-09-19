import type { Attachment } from 'svelte/attachments';
import { animate, inView } from 'motion';
import { prefersReducedMotion } from './motion';

/**
 * Scroll-driven effects for long-form pages. Each one writes a CSS custom
 * property or text and leaves the styling to CSS. All are no-ops under
 * prefers-reduced-motion, so the static markup is always the fallback.
 */

/**
 * An edge pair: a point on the element (0 = top, 1 = bottom) meeting a point
 * in the viewport (0 = top, 1 = bottom). `[0, 1]` is "element top reaches
 * viewport bottom"; `[0.5, 0.5]` is "element centre at viewport centre".
 */
export type Edge = [element: number, viewport: number];

/**
 * Calls `onProgress` with 0–1 as the page scrolls the element from edge `a`
 * to edge `b`. One passive listener, throttled to animation frames.
 */
export function trackScroll(
	el: HTMLElement,
	a: Edge,
	b: Edge,
	onProgress: (p: number) => void
): () => void {
	let frame = 0;
	const measure = () => {
		frame = 0;
		const r = el.getBoundingClientRect();
		const vh = innerHeight;
		// Distance still to scroll before each edge pair lines up
		const toA = r.top + a[0] * r.height - a[1] * vh;
		const toB = r.top + b[0] * r.height - b[1] * vh;
		const p = toA === toB ? 1 : toA / (toA - toB);
		onProgress(Math.min(1, Math.max(0, p)));
	};
	const schedule = () => (frame ||= requestAnimationFrame(measure));
	measure();
	addEventListener('scroll', schedule, { passive: true });
	addEventListener('resize', schedule);
	return () => {
		cancelAnimationFrame(frame);
		removeEventListener('scroll', schedule);
		removeEventListener('resize', schedule);
	};
}

/** Writes the element's scroll progress between two edge pairs to `--progress`. */
export function scrollProgress(a: Edge = [0, 1], b: Edge = [0.5, 0.5]): Attachment<HTMLElement> {
	return (el) => {
		if (prefersReducedMotion()) return;
		return trackScroll(el, a, b, (p) => el.style.setProperty('--progress', p.toFixed(4)));
	};
}

/**
 * Counts the leading number of the element's text up from zero the first
 * time it scrolls into view ("48 h" counts 0 → 48 and keeps " h").
 */
export const countUp: Attachment<HTMLElement> = (el) => {
	const text = el.textContent?.trim() ?? '';
	const match = text.match(/^(\d+(?:[.,]\d+)?)(.*)$/s);
	if (!match || prefersReducedMotion()) return;
	const target = Number(match[1].replace(',', '.'));
	const decimals = match[1].split(/[.,]/)[1]?.length ?? 0;
	const rest = match[2];
	let controls: ReturnType<typeof animate> | undefined;

	const stop = inView(
		el,
		() => {
			controls = animate(0, target, {
				duration: 1.4,
				ease: [0.2, 0.7, 0.2, 1],
				onUpdate: (v) => (el.textContent = v.toFixed(decimals) + rest)
			});
		},
		{ amount: 0.6 }
	);
	return () => {
		stop();
		controls?.stop();
		el.textContent = text;
	};
};
