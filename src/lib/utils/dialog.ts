import type { Attachment } from 'svelte/attachments';
import { pauseSmoothScroll, resumeSmoothScroll } from './smooth-scroll';

/**
 * Drives a native <dialog> as a modal from a boolean. Using `showModal()`
 * gives focus trapping, Esc to close and an inert background for free.
 * Re-runs whenever `open` changes. While open, smooth scrolling is paused
 * so the wheel can't move the page behind the dialog.
 */
export function modal(open: boolean): Attachment<HTMLDialogElement> {
	return (dialog) => {
		if (open && !dialog.open) dialog.showModal();
		if (!open && dialog.open) dialog.close();
		if (!open) return;
		pauseSmoothScroll();
		return () => resumeSmoothScroll();
	};
}
