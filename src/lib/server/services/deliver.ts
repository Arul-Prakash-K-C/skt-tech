import { dev } from '$app/environment';
import type { Enquiry } from './enquiry';
import { appendEnquiryRow, isSheetsConfigured } from './sheets/google-sheets';
import { isEmailConfigured, sendEnquiryEmail } from './email/resend';

export type DeliveryResult =
	{ ok: true; channels: string[] } | { ok: false; reason: 'not-configured' | 'failed' };

/**
 * Sends an enquiry to every configured channel in parallel:
 *
 *   validated enquiry ─┬─→ Google Sheets (lead log)
 *                      └─→ Resend (email to sales)
 *
 * Succeeds if at least one channel accepted it, so a Sheets outage never
 * loses a lead that email delivered (and vice versa). Failures are logged.
 */
export async function deliverEnquiry(
	enquiry: Enquiry,
	meta: { page: string; productUrl?: string }
): Promise<DeliveryResult> {
	const receivedAt = new Date();
	const jobs: { name: string; run: () => Promise<void> }[] = [];

	if (isSheetsConfigured())
		jobs.push({
			name: 'sheets',
			run: () => appendEnquiryRow(enquiry, { receivedAt, page: meta.page })
		});
	if (isEmailConfigured())
		jobs.push({ name: 'email', run: () => sendEnquiryEmail(enquiry, { receivedAt, ...meta }) });

	if (!jobs.length) {
		if (dev) {
			console.info(
				'[contact] No delivery channels configured; enquiry logged in dev only:',
				enquiry
			);
			return { ok: true, channels: ['dev-log'] };
		}
		console.error(
			'[contact] No delivery channels configured (set RESEND_* and/or GOOGLE_* env vars).'
		);
		return { ok: false, reason: 'not-configured' };
	}

	const results = await Promise.allSettled(jobs.map((j) => j.run()));
	const delivered: string[] = [];
	results.forEach((r, i) => {
		if (r.status === 'fulfilled') delivered.push(jobs[i].name);
		else console.error(`[contact] ${jobs[i].name} delivery failed:`, r.reason);
	});

	return delivered.length ? { ok: true, channels: delivered } : { ok: false, reason: 'failed' };
}
