import { error } from '@sveltejs/kit';
import { getProduct } from '$lib/server/content';
import { CMS_CACHE } from '$lib/server/cache';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, setHeaders }) => {
	const product = await getProduct(params.slug);
	if (!product) error(404, 'Product not found');
	setHeaders(CMS_CACHE);
	return { product };
};
