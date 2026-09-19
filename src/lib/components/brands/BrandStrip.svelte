<script lang="ts">
	import type { BrandSummary } from '$lib/sanity/types';
	import BrandMark from './BrandMark.svelte';

	interface Props {
		brands: BrandSummary[];
	}

	let { brands }: Props = $props();

	// Enough copies that one set is always wider than the viewport; the track
	// slides by exactly one set, so the loop is seamless.
	const copies = $derived(Math.max(2, Math.ceil(12 / Math.max(brands.length, 1))));
</script>

{#if brands.length}
	<section aria-labelledby="brands-strip" class="py-10 md:py-14">
		<h2 id="brands-strip" class="shell text-center text-sm text-muted">
			Authorised reseller and service partner for
		</h2>
		<div class="marquee mt-6" style:--sets={copies}>
			<ul class="track">
				{#each { length: copies } as _, c (c)}
					{#each brands as b (b._id)}
						<li aria-hidden={c > 0 ? 'true' : undefined}>
							<a
								href="/products?brand={b.slug}"
								class="mark"
								aria-label="{b.name} products"
								tabindex={c > 0 ? -1 : undefined}
							>
								<BrandMark name={b.name} logo={b.logo} height={30} />
							</a>
						</li>
					{/each}
				{/each}
			</ul>
		</div>
	</section>
{/if}

<style>
	.marquee {
		overflow: hidden;
		-webkit-mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent);
		mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent);
	}
	.track {
		display: flex;
		width: max-content;
		animation: slide calc(var(--sets) * 14s) linear infinite;
	}
	.marquee:hover .track,
	.marquee:focus-within .track {
		animation-play-state: paused;
	}
	@keyframes slide {
		to {
			transform: translateX(calc(-100% / var(--sets)));
		}
	}
	li {
		padding-inline: clamp(1.75rem, 4vw, 3.5rem);
	}
	.mark {
		display: block;
		color: var(--color-ink-2);
		opacity: 0.55;
		transition:
			opacity var(--dur-2) var(--ease-out),
			color var(--dur-2) var(--ease-out);
	}
	.mark:hover,
	.mark:focus-visible {
		opacity: 1;
		color: var(--color-ink);
	}
	@media (prefers-reduced-motion: reduce) {
		.track {
			animation: none;
			flex-wrap: wrap;
			justify-content: center;
			width: auto;
			row-gap: 1.25rem;
		}
		li[aria-hidden='true'] {
			display: none;
		}
	}
</style>
