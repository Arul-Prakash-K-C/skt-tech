# Project handoff: SKT Technologies website

This file is for an AI coding agent (or developer) taking over this project. It covers what the project is, what has been built, the rules the owner set, the decisions already made, known gotchas, and what is left to do. Read it together with `README.md`, which holds the setup and editor documentation.

State as of **2026-09-19**. Branch `mouly`; main branch is `master`.

---

## 1. What this is

A premium B2B marketing and catalogue website for **SKT Technologies** in Chennai, India. The company sells:
- ID card printers,
- printer ribbons,
- PVC, RFID and NFC cards,
- lanyards and accessories.

Visitors browse products and send enquiries. There is **no cart or checkout**; prices are shown as MRP plus discount (INR), and the call to action is "Request a quote".

**Pages:**

| Route | Contents |
| --- | --- |
| `/` | Home: hero carousel, offers, categories, featured products, brands, closing CTA |
| `/about` | About page |
| `/brands` | Brand list |
| `/products` | Catalogue with filters and sort, stored in URL search params |
| `/products/[slug]` | Product detail: gallery, specs, comparison table, documents, related products |
| `/gallery` | Photo grid with a lightbox |
| `/events` | Upcoming and past events |
| `/events/[slug]` | Event detail |
| `/contact` | Enquiry form |
| `/sitemap.xml`, `/robots.txt` | Generated |

## 2. Owner's rules (follow these)

1. **Do not copy** the reference site pvccardprintings.com, in design or text.
2. **No hardcoded CMS content in components.** Every piece of text, image, price and contact detail comes from Sanity through the server repository. Structural UI labels, such as "All products" or nav route names, are fine.
3. **Secrets stay server-side.** Private keys are read only through `$env/dynamic/private` inside `src/lib/server/**`, and nothing secret goes into client bundles. The only env vars with a `PUBLIC_` prefix are the site URL, the indexing flag and the Sanity project id, dataset and API version, none of which are secret.
4. **Motion must have a purpose** and must respect `prefers-reduced-motion`.
5. **SEO:** sitemap, robots, canonical URLs, Open Graph, JSON-LD.
6. `npm run check` and `npm run build` **must both pass** before you call work done.
7. The owner prefers you **work autonomously** and not ask permission for routine steps. They are not a deep Sanity expert, so explain CMS steps plainly and in numbered steps.

## 3. Stack

| Layer | Tools |
| --- | --- |
| Framework | SvelteKit 2 on Vite 8; Svelte 5 with **runes only** (`$state`, `$derived`, `$props`, `$effect`, snippets, `{@attach}`); no legacy `export let` or stores for local state |
| Language | TypeScript 6 |
| Styling | Tailwind CSS 4 via `@tailwindcss/vite` (CSS-first config, `@theme` tokens in `src/routes/layout.css`, no `tailwind.config.js`) |
| Content | Sanity: `@sanity/client` 8 and `@sanity/image-url`; `@portabletext/svelte` for rich text |
| Animation | `motion` 13, the vanilla API (`animate`, `motionValue`), not framer-motion |
| Font | Archivo variable, self-hosted via `@fontsource-variable/archivo` |
| Email | Resend |
| Lead log | Google Sheets REST API with a service-account JWT (no googleapis SDK) |
| Adapter | `@sveltejs/adapter-auto` |

The agent skills installed in `.claude/skills/` are frontend-design, svelte-code-writer, svelte-core-bestpractices, sanity-best-practices, content-modeling-best-practices and portable-text-serialization. Use them.

## 4. Architecture

```
Sanity Studio (studio/) → Content Lake → GROQ (src/lib/sanity/queries.ts)
        → src/lib/server/content.ts (repository, server only)
        → +page.server.ts / +layout.server.ts load()
        → Svelte components → browser

Contact form → form action (src/routes/contact/+page.server.ts)
        → validate → spam checks → deliver.ts ─┬→ google-sheets.ts
                                                └→ resend.ts
```

**Key files**

- **`src/lib/sanity/config.ts`**: `isSanityConfigured`. It is true when `PUBLIC_SANITY_PROJECT_ID` is set.
- **`src/lib/sanity/client.server.ts`**: `sanityFetch()`. Server only, uses the CDN, and takes an optional read token.
- **`src/lib/sanity/queries.ts`**
  - All GROQ lives here.
  - Images are always projected through the `IMG` fragment into `{ref, url, alt, hotspot, crop, width, height, lqip}`.
  - Product cards use `CARD_FIELDS` / `PRODUCT_CARD`.
- **`src/lib/sanity/image.ts`**
  - `imageUrl(img, {width, aspect})` builds a CDN URL with hotspot crop and `auto('format')`. When there is no `ref` it returns the static URL, which is how the sample images work.
  - Also exports `imageSrcset` and `imageRatio`.
- **`src/lib/sanity/types.ts`**: flat UI types that components consume. Components never see raw Sanity documents.
- **`src/lib/server/content.ts`**
  - The repository: `getSettings`, `getNavCategories`, `getHome`, `getCatalogue`, `getProduct`, `getBrands`, `getGallery`, `getEvents`, `getEvent`, `getAbout`, `getSitemapEntries`.
  - When Sanity is not configured it returns `sample-content.ts`, with artwork in `static/samples/`.
  - `getHome` filters out expired offers.
- **`src/lib/server/cache.ts`**: `CMS_CACHE` headers. Pages are CDN-cached for about 5 minutes.
- **`src/lib/server/services/`**
  - `enquiry.ts`: validation.
  - `form-token.ts`: HMAC "rendered at" token with a minimum fill time of 2 s.
  - `rate-limit.ts`: 5 submissions per 10 minutes per IP, in memory.
  - `deliver.ts`: succeeds if at least one channel accepts the enquiry.
  - `email/resend.ts`.
  - `sheets/google-sheets.ts`: writes with `valueInputOption=RAW` and escapes formulas.
- **`src/lib/utils/`**
  - `format.ts`: INR, dates, pricing, availability.
  - `catalogue.ts`: URL filters, sort and facets.
  - `motion.ts`: the `reveal`, `revealImage` and `parallax` attachments.
  - `dialog.ts`: the `modal` attachment for `<dialog>`.
  - `seo.ts`: JSON-LD builders.
- **`src/hooks.server.ts`**: security headers, and error logging that skips 404s.
- **`src/app.html`**: declares `@layer theme, base, components, utilities;` **before** anything else. Do not remove it (see Gotchas). It also contains the inline script that adds the `js` class to `<html>`.

**Components** live in `src/lib/components/`: `ui/`, `navigation/`, `layout/`, `hero/`, `products/`, `brands/`, `gallery/`, `events/`, `forms/`, `sections/`.

- **`hero/HeroPrint.svelte`** is the signature moment. The slide image is shown as the face of a CR80 ID card (aspect 1.586, rendered via `SanityImage width={640} aspect={1.586}`). A print head carrying Y/M/C/K ribbon panels "prints" it, then a gloss sweep follows. Slides autoplay every 7 s, with a progress bar, arrows and a pause control.
- **`navigation/RubberSegment.svelte`** is a Svelte 5 + Tailwind port of the React Bits "RubberSegment" control: a thumb with a spring and stretch that slides between nav items.
  - The thumb is animated with `motion`.
  - It is draggable, with flick glide, and supports the keyboard.
  - **Link mode:** the `onnavigate` prop postpones navigation until the thumb lands (tap 0.35 s, drag 0.25 s). Without that delay, rendering the next page blocks the main thread and freezes the spring mid-flight.
  - Items can set `accessory: true`. The `accessory` snippet is then rendered twice: live (`copy: false`), and as a decorative twin inside the thumb (`copy: true`) so it picks up the active text colour.
- **`navigation/Header.svelte`**
  - Uses RubberSegment for desktop nav, from the `lg` breakpoint up.
  - The **Products** item carries the categories dropdown: a chevron button (`aria-label="Product categories"`) plus `#products-menu`, anchored inside the Products slot at `left:-3px; top: calc(100% + .75rem)`.
  - Escape closes the menu and refocuses the chevron. A click outside closes it.
  - The dropdown must stay attached to Products. It was previously at the end of the nav, and the owner asked for it to be moved.
- **`navigation/MobileNav.svelte`**: a `<dialog>` drawer for small screens.

**Design system** (tokens in `src/routes/layout.css`):
- **Layout unit:** the CR80 card, 85.6 × 54 mm (ratio 1.586).
- **Colours:** named after the dye-sub ribbon panels: ink `#0F2233`, paper `#F3F5F6`, action cyan `#07719A`. Magenta `#B8235A` is used only for discounts; yellow only inside the ribbon mark.
- **Type:** Archivo. Headlines use the expanded width axis (`.display`, `.h1`–`.h3`); prices and specs use tabular figures (`.num`).
- **Motion:** durations are `--dur-1` to `--dur-4` (120/220/380/700 ms) with a single easing family.
  - Scroll reveal uses `[data-reveal]`, and image wipes use `[data-reveal-img]`.
  - Page transitions use the View Transitions API, and the product image is shared between the card and the detail page.
  - Everything is disabled under reduced motion.

**Sanity Studio** lives in `studio/`, as a separate npm project.
- `sanity.config.ts`.
- `structure.ts` defines three singletons: `siteSettings`, `homePage`, `aboutPage`.
- `schemaTypes/objects/shared.ts`: `imageWithAlt` (hotspot on; missing alt text is a warning), `cta`, `seo`, `richText`.
- `schemaTypes/documents/singletons.ts`: home, about and settings.
- `catalogue.ts`: product, category, brand.
- `media.ts`: galleryItem, event.
- `seed/seed.ts` imports the sample content into Sanity.

The content model table is in `README.md`.

## 5. Environment and current setup state

- **Sanity project id:** `mns0wnr4`, dataset `production`.
- **Root `.env`** (git-ignored):
  - Filled: `PUBLIC_SITE_URL`, `PUBLIC_ALLOW_INDEXING`, `PUBLIC_SANITY_PROJECT_ID`, `PUBLIC_SANITY_DATASET`, `PUBLIC_SANITY_API_VERSION`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`, `GOOGLE_SHEET_NAME`.
  - **Empty:** `SANITY_API_READ_TOKEN` (fine while the dataset is public), `RESEND_API_KEY`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_SHEET_ID`, `CONTACT_FORM_SECRET`.
- **`studio/.env`** (git-ignored):
  - Filled: `SANITY_STUDIO_PROJECT_ID`, `SANITY_STUDIO_DATASET`.
  - Empty: `SANITY_STUDIO_HOST`, `SANITY_WRITE_TOKEN`.
- **The Sanity dataset is currently EMPTY** (0 documents on 2026-09-19). Because a project id is set, the site no longer falls back to sample content, so most pages render empty sections or hide them. This is expected until content is added or seeded.
- The Studio runs locally with `cd studio && npm run dev` at http://localhost:3333. The owner has it open on the Home page singleton.
- Without Resend or Sheets keys, enquiries are logged to the server console in dev.

**Never print, commit, or send the values in either `.env` file.** Refer to keys by name only.

## 6. Commands

```bash
# website (repo root)
npm run dev          # http://localhost:5173
npm run check        # must be 0 errors / 0 warnings
npm run build
npm run preview

# studio
cd studio
npm run dev          # http://localhost:3333
npm run typecheck
npx sanity schema validate
npm run seed         # needs SANITY_WRITE_TOKEN (Editor token) in studio/.env
npm run deploy       # needs SANITY_STUDIO_HOST
```

The environment is Windows 11. Both PowerShell and Git Bash are available; in PowerShell, use `;` rather than `&&`.

## 7. Gotchas already solved (do not reintroduce)

| Problem | Cause | Fix in place |
| --- | --- | --- |
| Tailwind utilities lost to component styles | Cascade layer order was not fixed | `@layer theme, base, components, utilities;` in `app.html`; `Button` styles are inside `@layer components` |
| Gallery images never appeared | IntersectionObserver treats a fully `clip-path`-clipped target as invisible | Clip the **child** of `[data-reveal-img]`, and observe the parent |
| Horizontal overflow of 181 px on mobile product pages | The sr-only caption escaped the scroller | `position: relative` on `.scroller` in ProductGallery |
| Real users who typed fast got a fake "success" | Spam checks ran before validation; fill time was too strict | Validation runs first; `MIN_SECONDS = 2` |
| Nav thumb froze mid-animation | Page render blocked the main thread | RubberSegment link mode delays `goto` until the thumb lands |
| Nav thumb flickered or ghosted during page transitions | Header was snapshotted by the View Transition | Header view-transition group has animation disabled and its old snapshot hidden (`layout.css`) |
| Products dropdown at the end of the nav | Placement | Moved into the Products slot via the `accessory` snippet |
| Studio "connection refused" | No `studio/.env`, Studio not running | `studio/.env` created; run `npm run dev` in `studio/` |

Other things to know:
- Offers have end dates; expired ones are filtered on the server.
- The product comparison table reads values from each product's own spec groups by **label**; editors list only the labels to compare.

## 8. What is left to do

The build is feature-complete; `check` and `build` passed at the last run. Remaining work is mostly content, credentials, launch and polish.

### Content (required, so the site is not blank)
1. Create an **Editor** API token at sanity.io/manage → project `mns0wnr4` → API → Tokens. Put it in `studio/.env` as `SANITY_WRITE_TOKEN`, then run `cd studio && npm run seed` to import the sample content. Afterwards the token can be removed or revoked.
2. Replace **all placeholder content** in the Studio:
   - phone/WhatsApp (`+91 44 0000 0000`) and email (`enquiry@example.com`),
   - address, hours and GSTIN in **Company & site settings**,
   - About page history, facts and milestones,
   - product prices and specs,
   - events,
   - the illustrated sample images: swap in real product photos and brand logos.
3. Hero slide images are cropped to 1.586 : 1 around the hotspot. Card designs or centred subjects work best.
4. Remember to click **Publish**. Drafts are not shown on the site.

### Credentials and integrations
5. **Resend:** verify the sending domain, then set `RESEND_API_KEY`, `CONTACT_TO_EMAIL` and `CONTACT_FROM_EMAIL`.
6. **Google Sheets:** create a service account and key, enable the Sheets API, create an `Enquiries` tab, and share the sheet with the service account as Editor. Then set `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY` and `GOOGLE_SHEET_ID`.
7. Set `CONTACT_FORM_SECRET` to a long random string in production.
8. Test the contact form end to end, with both channels configured.

### Deployment
9. Choose a host (Vercel, Netlify or Cloudflare work with adapter-auto; for a Node server, use adapter-node). Set every variable from `.env.example` on the host.
10. Set `PUBLIC_SITE_URL` to the real domain. Set `PUBLIC_ALLOW_INDEXING=false` on staging and `true` in production.
11. Deploy the Studio (`SANITY_STUDIO_HOST` + `npm run deploy`), or host it elsewhere, and invite editors in sanity.io/manage.
12. Optional: a Sanity webhook that triggers a redeploy or cache purge on publish. Today edits appear within about 5 minutes through the CDN cache.
13. After launch, submit `sitemap.xml` to Google Search Console.

### Nice-to-have / possible improvements
- Live preview or Visual Editing in the Studio (Presentation tool). Not built.
- Rate limiting is in memory per instance. For multi-instance hosting, move it to a shared store such as Upstash or KV.
- Real brand logos in SVG for `BrandMark` / `BrandStrip`.
- Run a Lighthouse and accessibility pass on the real content, especially image weights and LCP on the hero.
- An analytics decision, if the owner wants analytics. Only privacy-friendly options, and nothing is added yet.

## 9. Definition of done for any change

- `npm run check` reports 0 errors and 0 warnings; `npm run build` succeeds.
- If Studio files changed: `cd studio && npm run typecheck && npx sanity schema validate`.
- No secret appears in `.svelte-kit/output/client` (grep for key names and values).
- New content is fetched through a GROQ query in `queries.ts` → a repository function in `content.ts` → a `load` function. It is not hardcoded, and has a matching sample entry in `sample-content.ts` so the no-CMS mode keeps working.
- New motion has a reduced-motion fallback.
- Layout works at 360 px width with no horizontal scroll.
- Keyboard and focus work, including Escape and focus return for any menu or dialog.
