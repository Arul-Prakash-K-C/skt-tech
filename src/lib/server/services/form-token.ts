import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { env } from '$env/dynamic/private';

/**
 * Signed "form rendered at" timestamp. Bots that post directly without
 * loading the page have no valid token; bots that submit instantly fail the
 * minimum-time check. Uses CONTACT_FORM_SECRET, or a per-process secret.
 */
const secret = env.CONTACT_FORM_SECRET || randomBytes(32).toString('hex');

const sign = (ts: string) => createHmac('sha256', secret).update(ts).digest('base64url');

export function issueFormToken(now = Date.now()) {
	const ts = String(now);
	return `${ts}.${sign(ts)}`;
}

/** Returns the signed timestamp, or null when the token is missing or forged. */
export function readFormToken(token: FormDataEntryValue | null): number | null {
	const [ts, sig] = String(token ?? '').split('.');
	if (!ts || !sig || !/^\d+$/.test(ts)) return null;
	const expected = Buffer.from(sign(ts));
	const given = Buffer.from(sig);
	if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
	return Number(ts);
}
