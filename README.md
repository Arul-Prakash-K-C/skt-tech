# SKT Technologies — website

Product and company website for SKT Technologies (ID card printers, ribbons, PVC/RFID/NFC cards, lanyards and accessories, Chennai).

**Stack:** SvelteKit 2 · Svelte 5 (runes) · TypeScript · Tailwind CSS 4 · Sanity (content) · Resend (email) · Google Sheets (lead log)

```
Sanity Studio ─→ Content Lake ─→ GROQ (src/lib/sanity/queries.ts)
                                   ↓
                     src/lib/server/content.ts   (server-only repository)
                                   ↓
                     +page.server.ts load()  ─→  Svelte components  ─→  browser

Contact form ─→ form action (server) ─→ validate ─→ spam checks ─┬─→ Google Sheets
                                                                  └─→ Resend ─→ sales inbox
```

## Quick start

```bash
npm install
cp .env.example .env      # everything optional for local development
npm run dev
```

With `PUBLIC_SANITY_PROJECT_ID` empty the site runs on **bundled sample content** (`src/lib/server/sample-content.ts`, artwork in `static/samples/`), so every page is browsable before the CMS is set up. With no email/Sheets keys, enquiries are logged to the dev console.

| Script | |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run check` | Type and Svelte checks |
| `npm run build` / `npm run preview` | Production build / preview |

## Connecting Sanity

1. Create a project at [sanity.io/manage](https://www.sanity.io/manage) and note the project id.
2. Set up the Studio:
   ```bash
   cd studio
   npm install
   cp .env.example .env        # set SANITY_STUDIO_PROJECT_ID
   npm run dev                 # http://localhost:3333
   ```
3. Optional — import the sample content as a starting point (needs an **Editor** API token, never committed):
   ```bash
   SANITY_WRITE_TOKEN=sk... npm run seed
   ```
4. In the website `.env`, set `PUBLIC_SANITY_PROJECT_ID` (and dataset). The site now reads only from Sanity.
5. Add your site's origin under **API → CORS origins** only if you later add client-side queries (the site currently queries Sanity from the server only).
6. `npm run deploy` in `studio/` hosts the Studio at `https://<SANITY_STUDIO_HOST>.sanity.studio`.

### Content model

| Document | Notes |
| --- | --- |
| **Home page** (singleton) | Hero slides (heading, subtitle, banner image, 2 CTAs), offers with end dates, section headings, closing CTA, SEO |
| **About page** (singleton) | Heading, intro, image, story, key facts, commitments, process steps, sectors, milestones |
| **Company & site settings** (singleton) | Name, contact details, address, hours, GSTIN, footer note, default SEO |
| **Product** | Name, slug, model, category →, brand →, short description, images, MRP, discount %, availability, featured, overview, key features, spec groups, comparison (products → + spec labels), documents, related products → |
| **Product category** | Shared taxonomy for products and brands |
| **Brand** | Name, slug, categories →, logo, description, website, display order, active |
| **Gallery item** | Image, title, description, category, date, display order |
| **Event** | Title, slug, published, start/end, location, summary, cover, description, photos, registration link |

Notes for editors:
- The **first product image** is used on cards; product shots on a plain background look best.
- The **comparison table** reads values from each product's own specifications — list the spec *labels* to compare (e.g. "Resolution"); nothing is typed twice.
- Hero slide images are shown as the face of an ID card (1.586 : 1), so card designs crop best. Set the hotspot.
- Pages are cached at the CDN for 5 minutes, so edits appear within ~5 minutes of publishing.

## Contact form

Configure either channel or both; an enquiry succeeds if at least one channel accepts it, and failures are logged.

**Resend** — verify your sending domain in Resend, then set `RESEND_API_KEY`, `CONTACT_TO_EMAIL` (comma-separated) and `CONTACT_FROM_EMAIL`. Emails set the customer as reply-to. No auto-reply is sent to the submitted address, so the form can't be used to send mail to third parties.

**Google Sheets**
1. In Google Cloud, create a service account and a JSON key; enable the Google Sheets API.
2. Create a sheet with a tab named `Enquiries` (or set `GOOGLE_SHEET_NAME`). Suggested header row: `Received, Name, Email, Phone, Company, Subject, Message, Product, Page`.
3. Share the sheet with the service account's email as **Editor**.
4. Set `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY` (keep the `\n` escapes, in quotes) and `GOOGLE_SHEET_ID` (from the sheet URL).

Rows are written with `valueInputOption=RAW` and cells starting with `= + - @` are escaped, so submitted text can never run as a formula.

**Spam protection:** hidden honeypot field, a signed "form rendered at" token with a minimum fill time (set `CONTACT_FORM_SECRET` in production), link-stuffing check, and a per-IP rate limit (5 per 10 minutes, per server instance). Spam gets a normal-looking success response. Validation runs first, so real people always see their errors.

All keys are read through `$env/dynamic/private` in `src/lib/server/**`, which SvelteKit refuses to bundle for the browser.

## Project structure

```
src/
├── lib/
│   ├── components/
│   │   ├── ui/           Button, Badge, Price, Icon, SanityImage, Seo, RichText, Breadcrumbs…
│   │   ├── navigation/   Header (desktop + products menu), MobileNav (<dialog>)
│   │   ├── layout/       Footer
│   │   ├── hero/         HeroPrint — the printing-card hero
│   │   ├── products/     ProductCard, ProductGrid, ProductFilters, ProductGallery, SpecTable, ComparisonTable
│   │   ├── brands/ gallery/ events/ forms/ sections/
│   ├── sanity/           config, client.server.ts, queries.ts (GROQ), image.ts, types.ts
│   ├── server/           content.ts (repository), sample-content.ts, cache.ts
│   │   └── services/     enquiry validation, form token, rate limit, deliver, email/resend, sheets/google-sheets
│   └── utils/            format (₹, dates, pricing), catalogue (filter/sort/facets), motion, dialog, seo (JSON-LD)
└── routes/               /, about, brands, products, products/[slug], gallery, events, events/[slug], contact,
                          sitemap.xml, robots.txt
studio/                   Sanity Studio: schemaTypes/, structure.ts, seed/
```

## Design system

- **Idea:** the CR80 ID card (85.6 × 54 mm, ratio 1.586) is the layout unit, and the dye-sub ribbon panels (Y, M, C, K) are the colour vocabulary. The one signature moment is the hero card being "printed" by a print head carrying the four panels, followed by a gloss (overlay) sweep.
- **Type:** Archivo variable. Headlines use the expanded width axis; body text is normal width; prices and specs use tabular figures.
- **Colour tokens** (`src/routes/layout.css`): ink `#0F2233`, paper `#F3F5F6`, action cyan `#07719A`, magenta `#B8235A` for discounts only, yellow only inside the ribbon mark.
- **Motion:** 120/220/380/700 ms with one easing family. Scroll reveals are used sparingly, images wipe in like a print pass, and page transitions use the View Transitions API with a shared product image from card to detail page. Everything is disabled under `prefers-reduced-motion`, and the hero carousel has a pause control.

## SEO

Per-page titles and descriptions (overridable per document in Sanity), canonical URLs, Open Graph, `sitemap.xml` built from Sanity, `robots.txt` (`PUBLIC_ALLOW_INDEXING=false` for staging), and JSON-LD for `LocalBusiness`, `Product` (with offer and availability), `Event` and `BreadcrumbList`. Set `PUBLIC_SITE_URL` in production.

## Deployment

`@sveltejs/adapter-auto` detects Vercel, Netlify and Cloudflare. For a plain Node server, switch to `@sveltejs/adapter-node`. Set the environment variables from `.env.example` on the host.

## Before launch

Everything in the sample content is placeholder and must be replaced in Sanity — in particular the **phone/WhatsApp number and email** (`+91 44 0000 0000`, `enquiry@example.com`), the company history, facts and milestones on the About page, prices and specifications, events, and the illustrated product images (swap in real product photos and brand logos).
