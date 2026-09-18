import { Resend } from 'resend';
import { env } from '$env/dynamic/private';
import type { Enquiry } from '../enquiry';

/**
 * Notifies the sales inbox of a new enquiry via Resend. The customer's address
 * is set as reply-to, so staff can answer straight from their mail client.
 * No auto-reply is sent to the submitted address, so the form can't be used
 * to send mail to third parties.
 */

export const isEmailConfigured = () =>
	!!(env.RESEND_API_KEY && env.CONTACT_TO_EMAIL && env.CONTACT_FROM_EMAIL);

let client: Resend | undefined;

const escape = (s: string) =>
	s.replace(
		/[&<>"']/g,
		(c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!
	);

function render(e: Enquiry, meta: { receivedAt: Date; page: string; productUrl?: string }) {
	const rows: [string, string][] = [
		['Name', e.name],
		['Email', e.email],
		['Phone', e.phone || '—'],
		['Company', e.company || '—'],
		['Subject', e.subject],
		...(e.product ? ([['Product', meta.productUrl ?? e.product]] as [string, string][]) : []),
		['Received', meta.receivedAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })]
	];

	const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#f3f5f6;font-family:Arial,Helvetica,sans-serif;color:#0f2233">
<table role="presentation" width="100%" style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #d5dbe0;border-radius:12px;border-collapse:separate">
<tr><td style="padding:24px 28px;border-bottom:4px solid #07719a">
<p style="margin:0;font-size:13px;color:#4e5d6b">New website enquiry</p>
<h1 style="margin:6px 0 0;font-size:20px;line-height:1.3">${escape(e.subject)}</h1></td></tr>
<tr><td style="padding:20px 28px"><table role="presentation" width="100%" style="border-collapse:collapse;font-size:14px">
${rows.map(([k, v]) => `<tr><td style="padding:8px 0;color:#4e5d6b;width:110px;vertical-align:top">${k}</td><td style="padding:8px 0">${escape(v)}</td></tr>`).join('')}
</table></td></tr>
<tr><td style="padding:0 28px 28px"><p style="margin:0 0 8px;font-size:13px;color:#4e5d6b">Message</p>
<div style="white-space:pre-wrap;font-size:15px;line-height:1.55;background:#f3f5f6;border-radius:8px;padding:16px">${escape(e.message)}</div>
<p style="margin:20px 0 0;font-size:12px;color:#7a8793">Reply to this email to answer ${escape(e.name)} directly. Sent from ${escape(meta.page)}.</p></td></tr>
</table></body></html>`;

	const text = [
		...rows.map(([k, v]) => `${k}: ${v}`),
		'',
		e.message,
		'',
		`Sent from ${meta.page}`
	].join('\n');
	return { html, text };
}

export async function sendEnquiryEmail(
	enquiry: Enquiry,
	meta: { receivedAt: Date; page: string; productUrl?: string }
) {
	client ??= new Resend(env.RESEND_API_KEY);
	const { html, text } = render(enquiry, meta);

	const { error } = await client.emails.send({
		from: env.CONTACT_FROM_EMAIL!,
		to: env
			.CONTACT_TO_EMAIL!.split(',')
			.map((s) => s.trim())
			.filter(Boolean),
		replyTo: `${enquiry.name.replace(/[<>"]/g, '')} <${enquiry.email}>`,
		subject: `Enquiry: ${enquiry.subject}`.slice(0, 180),
		html,
		text
	});
	if (error) throw new Error(`Resend: ${error.name}: ${error.message}`);
}
