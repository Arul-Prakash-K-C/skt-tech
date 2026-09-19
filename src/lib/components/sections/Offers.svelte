<script lang="ts">
	import type { Offer } from '$lib/sanity/types';
	import SanityImage from '$lib/components/ui/SanityImage.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { formatDate } from '$lib/utils/format';

	interface Props {
		offers: Offer[];
	}

	let { offers }: Props = $props();

	// Each offer's artwork sits on a different process ink
	const INKS = [
		'var(--color-process-yellow)',
		'var(--color-process-cyan)',
		'var(--color-process-magenta)'
	];
</script>

<ul class={['grid gap-5', offers.length > 1 && 'lg:grid-cols-2']}>
	{#each offers as offer, i (offer._key)}
		<li class="offer">
			{#if offer.image}
				<div class="art" style:--ink={INKS[i % INKS.length]}>
					<SanityImage
						image={offer.image}
						width={360}
						sizes="(min-width: 1024px) 18rem, 40vw"
						class="h-full w-full object-contain drop-shadow-[0_18px_24px_rgb(15_34_51/0.35)]"
					/>
				</div>
			{/if}
			<div class="flex flex-col p-6 md:p-8">
				{#if offer.validUntil}
					<p class="text-sm text-white/60">Until {formatDate(offer.validUntil)}</p>
				{/if}
				<h3 class="h3 mt-2 text-white">{offer.title}</h3>
				{#if offer.description}<p class="mt-3 text-white/72">{offer.description}</p>{/if}
				{#if offer.cta}
					<div class="mt-auto pt-7">
						<Button href={offer.cta.href} variant="accent" size="sm">{offer.cta.label}</Button>
					</div>
				{/if}
			</div>
		</li>
	{/each}
</ul>

<style>
	.offer {
		display: grid;
		background: var(--color-ink);
		border-radius: var(--radius-lg);
		overflow: hidden;
	}
	@media (min-width: 640px) {
		.offer {
			grid-template-columns: minmax(10rem, 40%) 1fr;
		}
	}
	.art {
		aspect-ratio: 4 / 3;
		margin: 0.5rem;
		padding: 1.25rem;
		border-radius: calc(var(--radius-lg) - 0.5rem);
		background:
			radial-gradient(70% 60% at 50% 45%, rgb(255 255 255 / 0.45), transparent 70%), var(--ink);
	}
	@media (min-width: 640px) {
		.art {
			aspect-ratio: auto;
			min-height: calc(100% - 1rem);
			margin-right: 0;
		}
	}
</style>
