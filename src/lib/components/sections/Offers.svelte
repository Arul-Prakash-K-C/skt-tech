<script lang="ts">
	import type { Offer } from '$lib/sanity/types';
	import SanityImage from '$lib/components/ui/SanityImage.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import { formatDate } from '$lib/utils/format';
	import { reveal } from '$lib/utils/motion';

	interface Props {
		offers: Offer[];
	}

	let { offers }: Props = $props();
</script>

<ul class={['grid gap-5', offers.length > 1 && 'lg:grid-cols-2']}>
	{#each offers as offer, i (offer._key)}
		<li class="offer" {@attach reveal(i)}>
			{#if offer.image}
				<div class="art">
					<SanityImage
						image={offer.image}
						width={360}
						sizes="(min-width: 1024px) 18rem, 40vw"
						class="h-full w-full object-contain"
					/>
				</div>
			{/if}
			<div class="flex flex-col p-6 md:p-8">
				<div class="flex flex-wrap items-center gap-2">
					<Badge tone="deal">Offer</Badge>
					{#if offer.validUntil}<span class="meta">Until {formatDate(offer.validUntil)}</span>{/if}
				</div>
				<h3 class="h3 mt-4">{offer.title}</h3>
				{#if offer.description}<p class="mt-2 text-muted">{offer.description}</p>{/if}
				{#if offer.cta}
					<div class="mt-auto pt-6">
						<Button href={offer.cta.href} variant="secondary" size="sm">{offer.cta.label}</Button>
					</div>
				{/if}
			</div>
		</li>
	{/each}
</ul>

<style>
	.offer {
		display: grid;
		background: var(--color-stock);
		border: 1px solid var(--color-line);
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
		padding: 1rem;
		/* A magenta panel edge marks promotional content */
		background: linear-gradient(90deg, var(--color-magenta) 0 4px, var(--color-magenta-soft) 4px);
	}
	@media (min-width: 640px) {
		.art {
			aspect-ratio: auto;
			min-height: 100%;
		}
	}
</style>
