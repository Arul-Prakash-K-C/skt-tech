<script lang="ts">
	import type { BrandSummary } from '$lib/sanity/types';
	import BrandMark from './BrandMark.svelte';

	interface Props {
		brands: BrandSummary[];
	}

	let { brands }: Props = $props();
</script>

{#if brands.length}
	<section aria-labelledby="brands-strip" class="border-y border-line bg-stock">
		<div class="shell flex flex-col gap-6 py-8 md:flex-row md:items-center md:gap-12">
			<h2 id="brands-strip" class="shrink-0 text-sm text-muted md:max-w-[11rem]">
				Authorised reseller and service partner for
			</h2>
			<ul class="flex flex-wrap items-center gap-x-10 gap-y-5 md:flex-1 md:justify-between">
				{#each brands as b (b._id)}
					<li>
						<a
							href="/products?brand={b.slug}"
							class="block text-ink-2 opacity-75 grayscale transition duration-300 hover:text-ink hover:opacity-100 hover:grayscale-0"
							aria-label="{b.name} products"
						>
							<BrandMark name={b.name} logo={b.logo} height={28} />
						</a>
					</li>
				{/each}
			</ul>
		</div>
	</section>
{/if}
