/**
 * Imports only the sample gallery items (with their images) into Sanity, to
 * try the gallery page and its reel without seeding the whole site.
 *
 *   npm run seed:gallery        (needs SANITY_WRITE_TOKEN in studio/.env)
 *
 * Safe to re-run: items are matched by title and updated, and each image is
 * uploaded once (Sanity de-duplicates identical assets).
 */
import { createClient } from '@sanity/client';
import { readFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import { gallery } from '../../src/lib/server/sample-content.ts';

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET ?? 'production';
const token = process.env.SANITY_WRITE_TOKEN;

if (!projectId || !token) {
	console.error('Set SANITY_STUDIO_PROJECT_ID and SANITY_WRITE_TOKEN (an Editor token from sanity.io/manage) in studio/.env.');
	process.exit(1);
}

const client = createClient({ projectId, dataset, token, apiVersion: '2026-09-01', useCdn: false });
const staticDir = resolve(import.meta.dirname, '../../static');

console.log(`Adding gallery items to ${projectId}/${dataset}…`);

for (const [i, g] of gallery.entries()) {
	const file = resolve(staticDir, `.${g.image.url}`);
	const asset = await client.assets.upload('image', await readFile(file), { filename: basename(file) });
	const doc = {
		title: g.title,
		description: g.description,
		category: g.category,
		date: g.date,
		displayOrder: (i + 1) * 10,
		image: { _type: 'image', alt: g.image.alt, asset: { _type: 'reference', _ref: asset._id } }
	};
	const existing = await client.fetch<string | null>(`*[_type == "galleryItem" && title == $title][0]._id`, { title: g.title });
	if (existing) await client.patch(existing).set(doc).commit();
	else await client.create({ _type: 'galleryItem', ...doc });
	console.log(`  ✓ ${g.title}`);
}

console.log(`Done: ${gallery.length} gallery items published.`);
