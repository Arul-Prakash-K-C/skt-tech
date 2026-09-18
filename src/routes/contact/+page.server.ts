import { fail } from '@sveltejs/kit';
import { getCatalogue } from '$lib/server/content';
import { parseEnquiry, looksLikeSpam } from '$lib/server/services/enquiry';
import { issueFormToken, readFormToken } from '$lib/server/services/form-token';
import { rateLimit } from '$lib/server/services/rate-limit';
import { deliverEnquiry } from '$lib/server/services/deliver';
import type { Actions, PageServerLoad } from './$types';

const MIN_SECONDS = 2;

export const load: PageServerLoad = async ({ url }) => {
	const productSlug = url.searchParams.get('product') ?? '';
	let product: { name: string; slug: string } | undefined;

	if (/^[a-z0-9-]{1,120}$/.test(productSlug)) {
		const { products } = await getCatalogue();
		const p = products.find((p) => p.slug === productSlug);
		if (p) product = { name: p.name, slug: p.slug };
	}

	return {
		token: issueFormToken(),
		product,
		prefillSubject: (
			url.searchParams.get('subject') ?? (product ? `Quote for ${product.name}` : '')
		).slice(0, 150)
	};
};

export const actions: Actions = {
	default: async ({ request, getClientAddress, url }) => {
		const form = await request.formData();
		const { values, errors } = parseEnquiry(form);

		// Validate first: a person who submits too quickly must see their
		// errors, never a fake confirmation.
		if (Object.keys(errors).length) {
			return fail(400, { values, errors });
		}

		// Quietly accept obvious spam so bots get no signal to adapt to.
		if (looksLikeSpam(form, values, MIN_SECONDS, readFormToken(form.get('token')))) {
			return { success: true };
		}

		let ip = 'unknown';
		try {
			ip = getClientAddress();
		} catch {
			/* not available in some adapters/dev setups */
		}
		const limit = rateLimit(`contact:${ip}`);
		if (!limit.ok) {
			return fail(429, {
				values,
				errors: {},
				message: `You’ve sent several enquiries in a short time. Please wait ${Math.ceil((limit.retryAfter ?? 600) / 60)} minutes, or call us.`
			});
		}

		const result = await deliverEnquiry(values, {
			page: url.toString(),
			productUrl: values.product
				? new URL(`/products/${values.product}`, url.origin).toString()
				: undefined
		});

		if (!result.ok) {
			return fail(result.reason === 'not-configured' ? 503 : 502, {
				values,
				errors: {},
				message:
					'We couldn’t send your enquiry just now. Please try again in a few minutes, or call or email us directly.'
			});
		}

		return { success: true };
	}
};
