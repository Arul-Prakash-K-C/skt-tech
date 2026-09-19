<script lang="ts">
	import Seo from '$lib/components/ui/Seo.svelte';
	import Breadcrumbs from '$lib/components/ui/Breadcrumbs.svelte';
	import SanityImage from '$lib/components/ui/SanityImage.svelte';
	import RichText from '$lib/components/ui/RichText.svelte';
	import ContactPrompt from '$lib/components/sections/ContactPrompt.svelte';
	import PrintProcess from '$lib/components/about/PrintProcess.svelte';
	import { reveal } from '$lib/utils/motion';
	import { countUp, scrollProgress, smoothScroll } from '$lib/utils/scroll-fx';
	import 'lenis/dist/lenis.css';

	let { data } = $props();

	const about = $derived(data.about);
	// The headline rises in word by word, so each word gets its own mask
	const words = $derived(about.heading.split(/\s+/));
</script>

<Seo
	title={about.seo?.title ?? 'About us'}
	description={about.seo?.description ?? about.intro}
	image={about.seo?.image ?? about.image}
/>

<div class="contents" {@attach smoothScroll}></div>

<header class="shell pt-6 pb-12 md:pt-8 md:pb-16">
	<Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'About' }]} />
	<div class="mt-8 grid gap-8 md:mt-12 lg:grid-cols-12">
		<h1 class="display lg:col-span-8" aria-label={about.heading}>
			{#each words as word, i (i)}<span class="word" aria-hidden="true"
					><span style:--i={i}>{word}</span></span
				>{' '}{/each}
		</h1>
		{#if about.intro}<p class="lede intro lg:col-span-4 lg:self-end">{about.intro}</p>{/if}
	</div>
</header>

{#if about.image}
	<div class="shell">
		<!-- Opens from a narrow window to full width as it scrolls into view -->
		<div class="lead" {@attach scrollProgress([0, 1], [0.5, 0.5])}>
			<div class="lead-img">
				<SanityImage
					image={about.image}
					width={1280}
					aspect={21 / 9}
					sizes="(min-width: 1344px) 80rem, 100vw"
					priority
					class="h-full w-full object-cover"
				/>
			</div>
		</div>
	</div>
{/if}

{#if about.facts?.length}
	<div class="shell">
		<dl class="grid border-b border-line sm:grid-cols-3">
			{#each about.facts as fact, i (fact._key)}
				<div
					class={[
						'flex flex-col py-6 sm:py-8',
						i > 0 && 'border-t border-line sm:border-t-0 sm:border-l sm:pl-8'
					]}
				>
					<dt class="text-sm text-muted sm:mt-1">{fact.label}</dt>
					<dd
						class="num -order-1 text-3xl font-semibold [font-variation-settings:'wdth'_112] md:text-4xl"
					>
						<span {@attach countUp}>{fact.value}</span>
					</dd>
				</div>
			{/each}
		</dl>
	</div>
{/if}

{#if about.body?.length}
	<section class="shell grid gap-8 py-16 md:py-24 lg:grid-cols-12" aria-labelledby="story">
		<h2 id="story" class="h2 lg:col-span-4">How we work</h2>
		<RichText
			value={about.body}
			class="text-[1.0625rem] leading-relaxed lg:col-span-7 lg:col-start-6"
		/>
	</section>
{/if}

{#if about.values?.length}
	<section class="border-t border-line bg-stock/60 py-16 md:py-24" aria-labelledby="values">
		<div class="shell">
			<h2 id="values" class="h2">What customers can count on</h2>
			<ul class="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
				{#each about.values as v, i (v._key)}
					<li class="border-t-2 border-ink pt-5" {@attach reveal(i)}>
						<h3 class="h3">{v.title}</h3>
						{#if v.text}<p class="mt-2 text-ink-2">{v.text}</p>{/if}
					</li>
				{/each}
			</ul>
		</div>
	</section>
{/if}

{#if about.process?.length}
	<PrintProcess title="From first call to first card" steps={about.process} />
{/if}

{#if about.sectors?.length || about.milestones?.length}
	<section class="border-t border-line py-16 md:py-24">
		<div class="shell grid gap-14 lg:grid-cols-12">
			{#if about.sectors?.length}
				<div class="lg:col-span-5">
					<h2 class="h2">Who we work with</h2>
					<ul class="mt-8 grid border-t border-line">
						{#each about.sectors as sector (sector)}
							<li
								class="border-b border-line py-3.5 text-lg font-medium [font-variation-settings:'wdth'_108]"
							>
								{sector}
							</li>
						{/each}
					</ul>
				</div>
			{/if}
			{#if about.milestones?.length}
				<div class="lg:col-span-6 lg:col-start-7">
					<h2 class="h2">Along the way</h2>
					<ol class="timeline mt-8" {@attach scrollProgress([0, 0.8], [1, 0.6])}>
						{#each about.milestones as m, i (m._key)}
							<li
								class="relative pb-8 pl-8 last:pb-0"
								style:--at={(i / Math.max(1, about.milestones.length - 1)) * 0.92 + 0.02}
							>
								<span class="dot" aria-hidden="true"></span>
								<p class="num text-sm font-semibold text-cyan">{m.year}</p>
								<h3 class="mt-1 text-lg font-semibold">{m.title}</h3>
								{#if m.text}<p class="mt-1 text-ink-2">{m.text}</p>{/if}
							</li>
						{/each}
					</ol>
				</div>
			{/if}
		</div>
	</section>
{/if}

<ContactPrompt
	heading="Planning a new ID card programme?"
	text="Tell us how many people need cards and what the cards should do. We will suggest a setup and send a quote."
	cta={{ label: 'Start a conversation', href: '/contact' }}
	settings={data.settings}
/>

<style>
	/* Headline: each word rises out of its own mask, one after another */
	.word {
		display: inline-block;
		overflow: hidden;
		vertical-align: top;
		padding-bottom: 0.08em;
		margin-bottom: -0.08em;
	}
	.word > span {
		display: inline-block;
		animation: rise 900ms var(--ease-out) both;
		animation-delay: calc(120ms + var(--i) * 55ms);
	}
	@keyframes rise {
		from {
			transform: translateY(105%);
		}
	}
	.intro {
		animation: fade-up 900ms var(--ease-out) 500ms both;
	}
	@keyframes fade-up {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
	}

	/* Lead image: a narrow window that opens to full width while the photo
	   inside settles from a slight zoom */
	.lead {
		--progress: 1;
		aspect-ratio: 21 / 9;
		overflow: hidden;
		border-radius: var(--radius-lg);
		background: var(--color-shade);
		clip-path: inset(
			0 calc((1 - var(--progress)) * 9%) round calc(var(--radius-lg) + (1 - var(--progress)) * 24px)
		);
	}
	.lead-img {
		height: 100%;
		transform: scale(calc(1 + (1 - var(--progress)) * 0.14));
		will-change: transform;
	}

	/* Timeline: the line draws itself as you scroll and each milestone's dot
	   fills once the line has reached it */
	.timeline {
		--progress: 1;
		position: relative;
		margin-left: 0.3125rem;
	}
	.timeline::before,
	.timeline::after {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 2px;
		margin-left: -1px;
		background: var(--color-line);
	}
	.timeline::after {
		background: linear-gradient(
			var(--color-process-cyan),
			var(--color-holo-violet),
			var(--color-process-magenta)
		);
		transform-origin: top;
		transform: scaleY(var(--progress));
	}
	.dot {
		position: absolute;
		z-index: 1;
		left: -0.4375rem;
		top: 0.3125rem;
		width: 0.875rem;
		height: 0.875rem;
		border-radius: 50%;
		background: var(--color-paper);
		border: 2px solid var(--color-line-strong);
		transition:
			background-color var(--dur-3) var(--ease-out),
			border-color var(--dur-3) var(--ease-out),
			transform var(--dur-3) var(--ease-spring);
	}
	/* Filled once the line passes this milestone: 0 before, 1 after */
	.dot::after {
		content: '';
		position: absolute;
		inset: -2px;
		border-radius: 50%;
		background: var(--color-process-magenta);
		box-shadow: 0 0 0 4px rgb(228 0 124 / 0.15);
		opacity: clamp(0, (var(--progress) - var(--at)) * 30, 1);
	}

	@media (prefers-reduced-motion: reduce) {
		.word > span,
		.intro {
			animation: none;
		}
	}
</style>
