import { env } from '$env/dynamic/public';

/**
 * Public Sanity project coordinates. These are safe to expose — they are
 * needed in the browser to build image CDN URLs. Tokens never live here.
 */
export const sanityConfig = {
	projectId: env.PUBLIC_SANITY_PROJECT_ID ?? '',
	dataset: env.PUBLIC_SANITY_DATASET || 'production',
	apiVersion: env.PUBLIC_SANITY_API_VERSION || '2026-09-01'
};

/** False until a project id is configured; the site then serves bundled sample content. */
export const isSanityConfigured = /^[a-z0-9-]+$/.test(sanityConfig.projectId);
