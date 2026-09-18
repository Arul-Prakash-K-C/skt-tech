import { createSign } from 'node:crypto';
import { env } from '$env/dynamic/private';
import type { Enquiry } from '../enquiry';

/**
 * Appends enquiries to a Google Sheet using a service account.
 * No SDK: a signed JWT is exchanged for an access token (cached until expiry)
 * and the Sheets REST API is called directly. Credentials stay server-side.
 *
 * Setup: share the sheet with GOOGLE_SERVICE_ACCOUNT_EMAIL as an Editor.
 */

const SCOPE = 'https://www.googleapis.com/auth/spreadsheets';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';

let cached: { token: string; expires: number } | undefined;

export const isSheetsConfigured = () =>
	!!(env.GOOGLE_SERVICE_ACCOUNT_EMAIL && env.GOOGLE_PRIVATE_KEY && env.GOOGLE_SHEET_ID);

const b64url = (input: string | Buffer) => Buffer.from(input).toString('base64url');

async function accessToken(): Promise<string> {
	if (cached && cached.expires > Date.now() + 60_000) return cached.token;

	const now = Math.floor(Date.now() / 1000);
	const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
	const claims = b64url(
		JSON.stringify({
			iss: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
			scope: SCOPE,
			aud: TOKEN_URL,
			iat: now,
			exp: now + 3600
		})
	);
	// Keys pasted into env vars usually carry literal "\n" sequences.
	const key = env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n');
	const signature = createSign('RSA-SHA256').update(`${header}.${claims}`).sign(key, 'base64url');

	const res = await fetch(TOKEN_URL, {
		method: 'POST',
		headers: { 'content-type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
			assertion: `${header}.${claims}.${signature}`
		}),
		signal: AbortSignal.timeout(8000)
	});
	if (!res.ok) throw new Error(`Google token request failed: ${res.status} ${await res.text()}`);

	const json = (await res.json()) as { access_token: string; expires_in: number };
	cached = { token: json.access_token, expires: Date.now() + json.expires_in * 1000 };
	return json.access_token;
}

/** Neutralise spreadsheet formula injection (=, +, -, @ at the start of a cell). */
const cell = (v: string) => (/^[=+\-@\t\r]/.test(v) ? `'${v}` : v);

export async function appendEnquiryRow(enquiry: Enquiry, meta: { receivedAt: Date; page: string }) {
	const sheet = env.GOOGLE_SHEET_NAME || 'Enquiries';
	const range = encodeURIComponent(`${sheet}!A:I`);
	const url = `https://sheets.googleapis.com/v4/spreadsheets/${env.GOOGLE_SHEET_ID}/values/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;

	const row = [
		meta.receivedAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
		enquiry.name,
		enquiry.email,
		enquiry.phone,
		enquiry.company,
		enquiry.subject,
		enquiry.message,
		enquiry.product,
		meta.page
	].map(cell);

	const res = await fetch(url, {
		method: 'POST',
		headers: {
			authorization: `Bearer ${await accessToken()}`,
			'content-type': 'application/json'
		},
		body: JSON.stringify({ values: [row] }),
		signal: AbortSignal.timeout(8000)
	});
	if (!res.ok) throw new Error(`Google Sheets append failed: ${res.status} ${await res.text()}`);
}
