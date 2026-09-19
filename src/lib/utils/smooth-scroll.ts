import Lenis from 'lenis';
import { prefersReducedMotion } from './motion';

/**
 * Site-wide smooth (inertial) wheel scrolling, via Lenis. Started once by the
 * root layout. Touch keeps the browser's native scrolling, and reduced motion
 * turns it off entirely.
 *
 * Anything that needs the page to hold still (modal dialogs, navigation)
 * pauses it; pauses nest, so it only resumes when the last one ends.
 */

let lenis: Lenis | undefined;
let pauses = 0;

export function startSmoothScroll(): () => void {
	if (lenis || prefersReducedMotion()) return () => {};
	lenis = new Lenis({
		autoRaf: true,
		lerp: 0.1,
		wheelMultiplier: 0.9,
		// Scrollable boxes inside the page (filters, tabs, dialogs) scroll natively
		allowNestedScroll: true
	});
	return () => {
		lenis?.destroy();
		lenis = undefined;
		pauses = 0;
	};
}

export function pauseSmoothScroll() {
	pauses++;
	lenis?.stop();
}

export function resumeSmoothScroll() {
	pauses = Math.max(0, pauses - 1);
	// start() also re-syncs with wherever the page actually is now
	if (pauses === 0) lenis?.start();
}
