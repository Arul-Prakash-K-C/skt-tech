/**
 * Content repository — the only module routes use to read content.
 *
 *   Sanity Content Lake → GROQ (queries.ts) → sanityFetch → here → load() → components
 *
 * When Sanity is not configured yet, the same shapes come from
 * `sample-content.ts`, so the site is fully browsable during setup.
 */

import { isSanityConfigured } from '$lib/sanity/config';
import { sanityFetch } from '$lib/sanity/client.server';
import {
	ABOUT_QUERY,
	BRANDS_QUERY,
	EVENTS_QUERY,
	EVENT_QUERY,
	GALLERY_QUERY,
	HOME_QUERY,
	NAV_CATEGORIES_QUERY,
	PRODUCTS_QUERY,
	PRODUCT_QUERY,
	SETTINGS_QUERY,
	SITEMAP_QUERY
} from '$lib/sanity/queries';
import type {
	AboutPage,
	Brand,
	BrandSummary,
	Category,
	EventDetail,
	EventSummary,
	GalleryItem,
	HomePage,
	ProductCard,
	ProductDetail,
	SiteSettings,
	SitemapEntry
} from '$lib/sanity/types';
import * as sample from './sample-content';

const FALLBACK_SETTINGS: SiteSettings = { companyName: 'SKT Technologies' };

const toSummary = ({
	description,
	gallery,
	registrationUrl,
	registrationLabel,
	seo,
	...e
}: EventDetail): EventSummary => e;
const isUpcoming = (e: EventSummary) => new Date(e.endDate ?? e.startDate).getTime() >= Date.now();
const offerIsLive = (o: { validUntil?: string }) =>
	!o.validUntil || new Date(`${o.validUntil}T23:59:59+05:30`).getTime() >= Date.now();

export async function getSettings(): Promise<SiteSettings> {
	if (!isSanityConfigured) return sample.settings;
	return (await sanityFetch<SiteSettings | null>(SETTINGS_QUERY)) ?? FALLBACK_SETTINGS;
}

export async function getNavCategories(): Promise<Pick<Category, '_id' | 'title' | 'slug'>[]> {
	if (!isSanityConfigured)
		return sample.categories.map(({ _id, title, slug }) => ({ _id, title, slug }));
	return sanityFetch(NAV_CATEGORIES_QUERY);
}

export async function getHome(): Promise<HomePage> {
	if (!isSanityConfigured) {
		return {
			heroSlides: sample.heroSlides,
			offers: sample.offers.filter(offerIsLive),
			categoriesHeading: 'Everything an ID card programme needs',
			categoriesIntro:
				'From the printer on the desk to the lanyard around the neck — one supplier, one invoice.',
			featuredHeading: 'Most requested this season',
			featuredIntro: 'Printers and consumables our customers reorder most often.',
			featuredProducts: sample.productCards.filter((p) => p.featured).slice(0, 8),
			brands: sample.brands,
			categories: sample.categories.map((c) => ({
				...c,
				productCount: sample.productCards.filter((p) => p.category?.slug === c.slug).length
			})),
			upcomingEvents: sample.events.filter(isUpcoming).map(toSummary).sort(byStartAsc).slice(0, 3),
			contactPrompt: {
				heading: 'Not sure which printer you need?',
				text: 'Tell us how many cards you print and what they need to do. We will reply with two or three options and a quote, usually within a working day.',
				cta: { label: 'Get a recommendation', href: '/contact' }
			}
		};
	}

	const res = await sanityFetch<{
		page: Partial<HomePage> | null;
		featuredProducts: ProductCard[];
		brands: BrandSummary[];
		categories: Category[];
		upcomingEvents: EventSummary[];
	}>(HOME_QUERY);

	return {
		...res.page,
		heroSlides: res.page?.heroSlides ?? [],
		offers: (res.page?.offers ?? []).filter(offerIsLive),
		featuredProducts: res.featuredProducts,
		brands: res.brands,
		categories: res.categories,
		upcomingEvents: res.upcomingEvents
	};
}

export interface Catalogue {
	products: ProductCard[];
	categories: Pick<Category, '_id' | 'title' | 'slug' | 'description'>[];
	brands: BrandSummary[];
}

export async function getCatalogue(): Promise<Catalogue> {
	if (!isSanityConfigured) {
		return {
			products: sample.productCards,
			categories: sample.categories.map(({ _id, title, slug, description }) => ({
				_id,
				title,
				slug,
				description
			})),
			brands: sample.brands.map(({ _id, name, slug, logo }) => ({ _id, name, slug, logo }))
		};
	}
	return sanityFetch<Catalogue>(PRODUCTS_QUERY);
}

export async function getProduct(slug: string): Promise<ProductDetail | null> {
	if (!isSanityConfigured) {
		const p = sample.products.find((p) => p.slug === slug);
		if (!p) return null;
		const sameCategory = sample.productCards.filter(
			(c) => c.category?.slug === p.category?.slug && c._id !== p._id
		);
		return { ...p, related: p.related.length ? p.related : sameCategory.slice(0, 4) };
	}

	const p = await sanityFetch<(ProductDetail & { sameCategory: ProductCard[] }) | null>(
		PRODUCT_QUERY,
		{ slug }
	);
	if (!p) return null;
	const { sameCategory, ...product } = p;
	const related = product.related.filter(Boolean);
	return {
		...product,
		images: product.images?.filter((i) => i?.url) ?? [],
		comparison: product.comparison?.products?.length ? product.comparison : undefined,
		related: related.length ? related : sameCategory
	};
}

export async function getBrands(): Promise<Brand[]> {
	if (!isSanityConfigured) {
		return sample.brands.map((b) => ({
			...b,
			productCount: sample.productCards.filter((p) => p.brand?.slug === b.slug).length
		}));
	}
	return sanityFetch(BRANDS_QUERY);
}

export async function getGallery(): Promise<GalleryItem[]> {
	if (!isSanityConfigured) return sample.gallery;
	return sanityFetch(GALLERY_QUERY);
}

const byStartAsc = (a: EventSummary, b: EventSummary) => a.startDate.localeCompare(b.startDate);

export async function getEvents(): Promise<{ upcoming: EventSummary[]; past: EventSummary[] }> {
	const all = isSanityConfigured
		? await sanityFetch<EventSummary[]>(EVENTS_QUERY)
		: sample.events.map(toSummary);
	return {
		upcoming: all.filter(isUpcoming).sort(byStartAsc),
		past: all.filter((e) => !isUpcoming(e)).sort((a, b) => byStartAsc(b, a))
	};
}

export async function getEvent(slug: string): Promise<EventDetail | null> {
	if (!isSanityConfigured) return sample.events.find((e) => e.slug === slug) ?? null;
	return sanityFetch(EVENT_QUERY, { slug });
}

export async function getAbout(): Promise<AboutPage | null> {
	if (!isSanityConfigured) return sample.about;
	return sanityFetch(ABOUT_QUERY);
}

export async function getSitemapEntries(): Promise<SitemapEntry[]> {
	const staticPaths = [
		'/',
		'/about',
		'/products',
		'/brands',
		'/gallery',
		'/events',
		'/contact'
	].map((href) => ({ href }));

	if (!isSanityConfigured) {
		return [
			...staticPaths,
			...sample.productCards.map((p) => ({ href: `/products/${p.slug}` })),
			...sample.events.map((e) => ({ href: `/events/${e.slug}` }))
		];
	}

	const res = await sanityFetch<{
		products: { slug: string; _updatedAt: string }[];
		events: { slug: string; _updatedAt: string }[];
	}>(SITEMAP_QUERY);

	return [
		...staticPaths,
		...res.products.map((p) => ({ href: `/products/${p.slug}`, updatedAt: p._updatedAt })),
		...res.events.map((e) => ({ href: `/events/${e.slug}`, updatedAt: e._updatedAt }))
	];
}
