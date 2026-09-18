import type { Attachment } from 'svelte/attachments';

/**
 * Drives a native <dialog> as a modal from a boolean. Using `showModal()`
 * gives focus trapping, Esc to close and an inert background for free.
 * Re-runs whenever `open` changes.
 */
export function modal(open: boolean): Attachment<HTMLDialogElement> {
	return (dialog) => {
		if (open && !dialog.open) dialog.showModal();
		if (!open && dialog.open) dialog.close();
	};
}
