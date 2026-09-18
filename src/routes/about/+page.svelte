<script lang="ts">
	import Seo from '$lib/components/ui/Seo.svelte';
	import Breadcrumbs from '$lib/components/ui/Breadcrumbs.svelte';
	import SanityImage from '$lib/components/ui/SanityImage.svelte';
	import RichText from '$lib/components/ui/RichText.svelte';
	import ContactPrompt from '$lib/components/sections/ContactPrompt.svelte';
	import { parallax, reveal } from '$lib/utils/motion';

	let { data } = $props();

	const about = $derived(data.about);
</script>

<Seo
	title={about.seo?.title ?? 'About us'}
	description={about.seo?.description ?? about.intro}
	image={about.seo?.image ?? about.image}
/>

<header class="shell pt-6 pb-12 md:pt-8 md:pb-16">
	<Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'About' }]} />
	<div class="mt-8 grid gap-8 md:mt-12 lg:grid-cols-12">
		<h1 class="display lg:col-span-8">{about.heading}</h1>
		{#if about.intro}<p class="lede lg:col-span-4 lg:self-end">{about.intro}</p>{/if}
	</div>
</header>

{#if about.image}
	<div class="shell">
		<div class="overflow-hidden rounded-lg bg-shade" style="aspect-ratio: 21 / 9">
			<div class="h-full will-change-transform" {@attach parallax(0.06)}>
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
					<dd class="num -order-1 text-2xl font-semibold [font-variation-settings:'wdth'_112]">
						{fact.value}
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
	<section class="shell py-16 md:py-24" aria-labelledby="process">
		<h2 id="process" class="h2">From first call to first card</h2>
		<!-- A real sequence, so it is numbered -->
		<ol class="steps mt-10">
			{#each about.process as step, i (step._key)}
				<li class="step" {@attach reveal(i)}>
					<span class="n num" aria-hidden="true">{i + 1}</span>
					<h3 class="h3 mt-5">{step.title}</h3>
					{#if step.text}<p class="mt-2 text-ink-2">{step.text}</p>{/if}
				</li>
			{/each}
		</ol>
	</section>
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
					<ol class="timeline mt-8">
						{#each about.milestones as m (m._key)}
							<li class="relative pb-8 pl-8 last:pb-0">
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
	.steps {
		display: grid;
		gap: 2.5rem;
	}
	@media (min-width: 768px) {
		.steps {
			grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
			gap: 2rem;
		}
	}
	.step {
		position: relative;
	}
	/* The card path: a line running between the numbered stations */
	@media (min-width: 768px) {
		.step::before {
			content: '';
			position: absolute;
			top: 1.25rem;
			left: 3.25rem;
			right: -1rem;
			height: 1px;
			background: var(--color-line-strong);
		}
		.step:last-child::before {
			display: none;
		}
	}
	.n {
		display: grid;
		place-items: center;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 50%;
		border: 1.5px solid var(--color-ink);
		font-weight: 620;
		background: var(--color-paper);
	}
	.timeline {
		border-left: 1px solid var(--color-line-strong);
		margin-left: 0.3125rem;
	}
	.dot {
		position: absolute;
		left: -0.375rem;
		top: 0.3125rem;
		width: 0.75rem;
		height: 0.75rem;
		border-radius: 50%;
		background: var(--color-paper);
		border: 2px solid var(--color-cyan);
	}
</style>
