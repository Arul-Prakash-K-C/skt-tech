import type { Handle, HandleServerError } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event, {
		// Only preload JS/CSS; fonts are preloaded explicitly in the root layout.
		preload: ({ type }) => type === 'js' || type === 'css'
	});

	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('X-Frame-Options', 'SAMEORIGIN');
	response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

	return response;
};

export const handleError: HandleServerError = ({ error, event, status }) => {
	if (status !== 404) console.error(`[${event.url.pathname}]`, error);
	return { message: status === 404 ? 'Not found' : 'Internal error' };
};
