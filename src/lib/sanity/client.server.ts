import { createClient, type QueryParams } from '@sanity/client';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import { sanityConfig, isSanityConfigured } from './config';

/**
 * Server-only Sanity client. All CMS reads happen in `load` functions, so no
 * Sanity SDK or token is ever shipped to the browser.
 */
const client = isSanityConfigured
	? createClient({
			projectId: sanityConfig.projectId,
			dataset: sanityConfig.dataset,
			apiVersion: sanityConfig.apiVersion,
			// A token implies a private dataset or drafts; the CDN cannot serve those.
			useCdn: !env.SANITY_API_READ_TOKEN && !dev,
			token: env.SANITY_API_READ_TOKEN || undefined,
			perspective: 'published'
		})
	: null;

export async function sanityFetch<T>(query: string, params: QueryParams = {}): Promise<T> {
	if (!client) throw new Error('Sanity is not configured (PUBLIC_SANITY_PROJECT_ID is empty).');
	return client.fetch<T>(query, params);
}
