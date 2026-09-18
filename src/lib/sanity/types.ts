/**
 * Front-end shapes returned by the GROQ projections in `queries.ts`.
 * Queries project Sanity documents into these flat, UI-ready types so
 * components never deal with raw `_ref`s or asset documents.
 */

import type { PortableTextBlock } from '@portabletext/types';

export type { PortableTextBlock };

/** Normalised image: a Sanity asset (`ref` set) or a static fallback (`url` only). */
export interface Img {
	ref?: string;
	url: string;
	alt?: string;
	width?: number;
	height?: number;
	lqip?: string;
	hotspot?: { x: number; y: number; width: number; height: number };
	crop?: { top: number; bottom: number; left: number; right: number };
}

export interface Cta {
	label: string;
	href: string;
}

export interface Seo {
	title?: string;
	description?: string;
	image?: Img;
	noIndex?: boolean;
}

export interface SiteSettings {
	companyName: string;
	legalName?: string;
	tagline?: string;
	description?: string;
	phone?: string;
	whatsapp?: string;
	email?: string;
	address?: string;
	mapUrl?: string;
	hours?: string;
	gstin?: string;
	social?: { _key: string; platform: string; url: string }[];
	footerNote?: string;
	defaultSeo?: Seo;
}

export interface HeroSlide {
	_key: string;
	heading: string;
	subtitle?: string;
	image?: Img;
	primaryCta?: Cta;
	secondaryCta?: Cta;
}

export interface Offer {
	_key: string;
	title: string;
	description?: string;
	image?: Img;
	cta?: Cta;
	validUntil?: string;
}

export interface Category {
	_id: string;
	title: string;
	slug: string;
	description?: string;
	image?: Img;
	productCount?: number;
}

export interface BrandSummary {
	_id: string;
	name: string;
	slug: string;
	logo?: Img;
}

export interface Brand extends BrandSummary {
	description?: string;
	website?: string;
	categories?: { title: string; slug: string }[];
	productCount?: number;
}

export type Availability = 'in-stock' | 'on-order' | 'out-of-stock';

export interface ProductCard {
	_id: string;
	name: string;
	slug: string;
	model?: string;
	shortDescription?: string;
	image?: Img;
	mrp?: number;
	discount?: number;
	availability: Availability;
	featured?: boolean;
	category?: { title: string; slug: string };
	brand?: { name: string; slug: string };
	orderRank?: number;
}

export interface SpecRow {
	_key: string;
	label: string;
	value: string;
}

export interface SpecGroup {
	_key: string;
	title: string;
	rows: SpecRow[];
}

export interface ProductDocument {
	_key: string;
	title: string;
	url: string;
	size?: number;
	extension?: string;
}

export interface ComparedProduct extends ProductCard {
	specGroups?: SpecGroup[];
}

export interface ProductDetail extends ProductCard {
	images: Img[];
	overview?: PortableTextBlock[];
	features?: string[];
	specGroups?: SpecGroup[];
	comparison?: {
		intro?: string;
		attributes: string[];
		products: ComparedProduct[];
	};
	documents?: ProductDocument[];
	related: ProductCard[];
	seo?: Seo;
	_updatedAt?: string;
}

export type GalleryCategory = 'installations' | 'products' | 'events' | 'workshop';

export interface GalleryItem {
	_id: string;
	title: string;
	description?: string;
	category: GalleryCategory;
	date?: string;
	image: Img;
}

export interface EventSummary {
	_id: string;
	title: string;
	slug: string;
	startDate: string;
	endDate?: string;
	location?: string;
	summary?: string;
	coverImage?: Img;
}

export interface EventDetail extends EventSummary {
	description?: PortableTextBlock[];
	gallery?: Img[];
	registrationUrl?: string;
	registrationLabel?: string;
	seo?: Seo;
}

export interface HomePage {
	heroSlides: HeroSlide[];
	offers: Offer[];
	categoriesHeading?: string;
	categoriesIntro?: string;
	featuredHeading?: string;
	featuredIntro?: string;
	featuredProducts: ProductCard[];
	brands: BrandSummary[];
	categories: Category[];
	upcomingEvents: EventSummary[];
	contactPrompt?: { heading: string; text?: string; cta?: Cta };
	seo?: Seo;
}

export interface Milestone {
	_key: string;
	year: string;
	title: string;
	text?: string;
}

export interface ValueItem {
	_key: string;
	title: string;
	text?: string;
}

export interface AboutPage {
	heading: string;
	intro?: string;
	image?: Img;
	body?: PortableTextBlock[];
	facts?: { _key: string; value: string; label: string }[];
	values?: ValueItem[];
	process?: ValueItem[];
	sectors?: string[];
	milestones?: Milestone[];
	seo?: Seo;
}

export interface SitemapEntry {
	href: string;
	updatedAt?: string;
}
