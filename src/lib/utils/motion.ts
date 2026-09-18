import type { Attachment } from 'svelte/attachments';

/**
 * Scroll-reveal attachments. One shared IntersectionObserver for the page;
 * elements reveal once and are then unobserved. Styles live in layout.css
 * (`[data-reveal]`, `[data-reveal-img]`) and switch off under
 * prefers-reduced-motion. Without JS nothing is ever hidden.
 */

let observer: IntersectionObserver | undefined;

function getObserver() {
	observer ??= new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				const el = entry.target as HTMLElement;
				if (el.hasAttribute('data-reveal')) el.dataset.reveal = 'in';
				if (el.hasAttribute('data-reveal-img')) el.dataset.revealImg = 'in';
				observer!.unobserve(el);
			}
		},
		{ rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
	);
	return observer;
}

/** Fade and rise. `index` staggers siblings 70 ms apart. */
export function reveal(index = 0): Attachment<HTMLElement> {
	return (el) => {
		el.dataset.reveal = '';
		if (index) el.style.setProperty('--reveal-i', String(index));
		const io = getObserver();
		io.observe(el);
		return () => io.unobserve(el);
	};
}

/** Left-to-right wipe, like a print pass. */
export const revealImage: Attachment<HTMLElement> = (el) => {
	el.dataset.revealImg = '';
	const io = getObserver();
	io.observe(el);
	return () => io.unobserve(el);
};

/**
 * Subtle scroll parallax: the element drifts by `strength` × its distance from
 * the viewport centre. Transform-only and rAF-throttled; off for reduced motion.
 */
export function parallax(strength = 0.08): Attachment<HTMLElement> {
	return (el) => {
		if (prefersReducedMotion()) return;
		let frame = 0;
		const update = () => {
			frame = 0;
			const r = el.parentElement!.getBoundingClientRect();
			const offset = r.top + r.height / 2 - innerHeight / 2;
			el.style.transform = `translate3d(0, ${(-offset * strength).toFixed(1)}px, 0) scale(1.08)`;
		};
		const onScroll = () => (frame ||= requestAnimationFrame(update));
		update();
		addEventListener('scroll', onScroll, { passive: true });
		return () => {
			removeEventListener('scroll', onScroll);
			cancelAnimationFrame(frame);
		};
	};
}

export const prefersReducedMotion = () =>
	typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
