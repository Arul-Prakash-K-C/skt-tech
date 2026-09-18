/**
 * Small fixed-window rate limiter. In-memory, so it is per server instance —
 * enough to blunt a single abusive client. Put a platform WAF/rate limit in
 * front for anything stronger.
 */
const hits = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, limit = 5, windowMs = 10 * 60 * 1000) {
	const now = Date.now();
	if (hits.size > 5000) {
		for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
	}
	const entry = hits.get(key);
	if (!entry || entry.reset < now) {
		hits.set(key, { count: 1, reset: now + windowMs });
		return { ok: true };
	}
	entry.count += 1;
	return { ok: entry.count <= limit, retryAfter: Math.ceil((entry.reset - now) / 1000) };
}
