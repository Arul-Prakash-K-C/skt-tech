/**
 * Imports the website's bundled sample content into a Sanity dataset so the
 * editors start from a complete, working site instead of an empty Studio.
 *
 *   SANITY_STUDIO_PROJECT_ID=xxxx SANITY_WRITE_TOKEN=sk... npm run seed
 *
 * - Ordinary documents get Sanity-generated ids; relationships are resolved
 *   by slug lookups (safe to re-run: existing slugs are updated, not duplicated).
 * - Singletons use fixed ids (siteSettings, homePage, aboutPage).
 * - Sample SVGs from /static/samples are uploaded once as image assets.
 */
import { createClient, type SanityClient } from '@sanity/client';
import { readFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import * as sample from '../../src/lib/server/sample-content.ts';

type Img = { url: string; alt?: string };

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET ?? 'production';
const token = process.env.SANITY_WRITE_TOKEN;

if (!projectId || !token) {
	console.error('Set SANITY_STUDIO_PROJECT_ID and SANITY_WRITE_TOKEN (an Editor token from sanity.io/manage).');
	process.exit(1);
}

const client: SanityClient = createClient({ projectId, dataset, token, apiVersion: '2026-09-01', useCdn: false });
const staticDir = resolve(import.meta.dirname, '../../static');

// --- helpers ----------------------------------------------------------------

const assetCache = new Map<string, string>();

async function image(img: Img | undefined) {
	if (!img) return undefined;
	let ref = assetCache.get(img.url);
	if (!ref) {
		const file = resolve(staticDir, `.${img.url}`);
		const asset = await client.assets.upload('image', await readFile(file), { filename: basename(file) });
		ref = asset._id;
		assetCache.set(img.url, ref);
	}
	return { _type: 'image', alt: img.alt, asset: { _type: 'reference', _ref: ref } };
}

const keyed = <T extends object>(items: T[] | undefined, prefix: string) =>
	items?.map((item, i) => ({ _key: `${prefix}${i}`, ...item }));

const ref = (_ref: string) => ({ _type: 'reference', _ref });
const slug = (current: string) => ({ _type: 'slug', current });
const cta = (c?: { label: string; href: string }) => (c ? { _type: 'cta', ...c } : undefined);

/** Create or update a document identified by type + slug; returns its _id. */
async function upsert(type: string, slugValue: string, fields: Record<string, unknown>) {
	const existing = await client.fetch<string | null>(`*[_type == $type && slug.current == $slug][0]._id`, { type, slug: slugValue });
	if (existing) {
		await client.patch(existing).set(fields).commit();
		return existing;
	}
	const created = await client.create({ _type: type, slug: slug(slugValue), ...fields });
	return created._id;
}

async function images(list: Img[] | undefined) {
	const out = [];
	for (const [i, img] of (list ?? []).entries()) out.push({ _key: `img${i}`, ...(await image(img)) });
	return out;
}

// --- import -----------------------------------------------------------------

console.log(`Seeding ${projectId}/${dataset}…`);

const categoryIds = new Map<string, string>();
for (const [i, c] of sample.categories.entries()) {
	categoryIds.set(c.slug, await upsert('category', c.slug, { title: c.title, description: c.description, image: await image(c.image), displayOrder: (i + 1) * 10 }));
}
console.log(`✓ ${categoryIds.size} categories`);

const brandIds = new Map<string, string>();
for (const [i, b] of sample.brands.entries()) {
	brandIds.set(
		b.slug,
		await upsert('brand', b.slug, {
			name: b.name,
			description: b.description,
			website: b.website,
			active: true,
			displayOrder: (i + 1) * 10,
			categories: b.categories?.map((c, j) => ({ _key: `c${j}`, ...ref(categoryIds.get(c.slug)!) }))
		})
	);
}
console.log(`✓ ${brandIds.size} brands`);

// Pass 1: products without product→product references
const productIds = new Map<string, string>();
for (const [i, p] of sample.products.entries()) {
	productIds.set(
		p.slug,
		await upsert('product', p.slug, {
			name: p.name,
			model: p.model,
			shortDescription: p.shortDescription,
			category: p.category ? ref(categoryIds.get(p.category.slug)!) : undefined,
			brand: p.brand ? ref(brandIds.get(p.brand.slug)!) : undefined,
			mrp: p.mrp,
			discount: p.discount ?? 0,
			availability: p.availability,
			featured: !!p.featured,
			displayOrder: (i + 1) * 10,
			images: await images(p.images),
			overview: p.overview,
			features: p.features,
			specGroups: p.specGroups
		})
	);
}

// Pass 2: comparison + related, now that every product has an id
for (const p of sample.products) {
	const id = productIds.get(p.slug)!;
	await client
		.patch(id)
		.set({
			relatedProducts: p.related.map((r, j) => ({ _key: `r${j}`, ...ref(productIds.get(r.slug)!) })),
			...(p.comparison && {
				comparison: {
					intro: p.comparison.intro,
					attributes: p.comparison.attributes,
					products: p.comparison.products.map((c, j) => ({ _key: `c${j}`, ...ref(productIds.get(c.slug)!) }))
				}
			})
		})
		.commit();
}
console.log(`✓ ${productIds.size} products`);

for (const [i, g] of sample.gallery.entries()) {
	const existing = await client.fetch<string | null>(`*[_type == "galleryItem" && title == $title][0]._id`, { title: g.title });
	const doc = { title: g.title, description: g.description, category: g.category, date: g.date, displayOrder: (i + 1) * 10, image: await image(g.image) };
	if (existing) await client.patch(existing).set(doc).commit();
	else await client.create({ _type: 'galleryItem', ...doc });
}
console.log(`✓ ${sample.gallery.length} gallery items`);

for (const e of sample.events) {
	await upsert('event', e.slug, {
		title: e.title,
		published: true,
		startDate: e.startDate,
		endDate: e.endDate,
		location: e.location,
		summary: e.summary,
		coverImage: await image(e.coverImage),
		description: e.description,
		gallery: await images(e.gallery),
		registrationUrl: e.registrationUrl,
		registrationLabel: e.registrationLabel
	});
}
console.log(`✓ ${sample.events.length} events`);

// Singletons (fixed ids)
const s = sample.settings;
await client.createOrReplace({
	_id: 'siteSettings',
	_type: 'siteSettings',
	companyName: s.companyName,
	legalName: s.legalName,
	tagline: s.tagline,
	description: s.description,
	phone: s.phone,
	whatsapp: s.whatsapp,
	email: s.email,
	address: s.address,
	mapUrl: s.mapUrl,
	hours: s.hours,
	gstin: s.gstin,
	footerNote: s.footerNote
});

const home = {
	_id: 'homePage',
	_type: 'homePage',
	heroSlides: [] as unknown[],
	offers: [] as unknown[],
	categoriesHeading: 'Everything an ID card programme needs',
	categoriesIntro: 'From the printer on the desk to the lanyard around the neck — one supplier, one invoice.',
	featuredHeading: 'Most requested this season',
	featuredIntro: 'Printers and consumables our customers reorder most often.',
	contactPrompt: {
		heading: 'Not sure which printer you need?',
		text: 'Tell us how many cards you print and what they need to do. We will reply with two or three options and a quote, usually within a working day.',
		cta: cta({ label: 'Get a recommendation', href: '/contact' })
	}
};
for (const h of sample.heroSlides) {
	home.heroSlides.push({ _key: h._key, _type: 'heroSlide', heading: h.heading, subtitle: h.subtitle, image: await image(h.image), primaryCta: cta(h.primaryCta), secondaryCta: cta(h.secondaryCta) });
}
for (const o of sample.offers) {
	home.offers.push({ _key: o._key, _type: 'offer', title: o.title, description: o.description, image: await image(o.image), cta: cta(o.cta), validUntil: o.validUntil });
}
await client.createOrReplace(home);

const a = sample.about;
await client.createOrReplace({
	_id: 'aboutPage',
	_type: 'aboutPage',
	heading: a.heading,
	intro: a.intro,
	image: await image(a.image),
	body: a.body,
	facts: a.facts,
	values: keyed(a.values?.map(({ _key, ...v }) => ({ _type: 'titledText', ...v })), 'v'),
	process: keyed(a.process?.map(({ _key, ...v }) => ({ _type: 'titledText', ...v })), 'p'),
	sectors: a.sectors,
	milestones: a.milestones
});
console.log('✓ settings, home and about pages');
console.log('Done. Set PUBLIC_SANITY_PROJECT_ID in the website .env to switch from sample content to Sanity.');
