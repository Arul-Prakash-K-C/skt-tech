import { error } from '@sveltejs/kit';
import { getEvent } from '$lib/server/content';
import { CMS_CACHE } from '$lib/server/cache';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, setHeaders }) => {
	const event = await getEvent(params.slug);
	if (!event) error(404, 'Event not found');
	setHeaders(CMS_CACHE);
	return { event, isPast: new Date(event.endDate ?? event.startDate).getTime() < Date.now() };
};
