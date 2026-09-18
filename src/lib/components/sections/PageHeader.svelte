<script lang="ts">
	import type { Snippet } from 'svelte';
	import Breadcrumbs from '$lib/components/ui/Breadcrumbs.svelte';

	interface Props {
		title: string;
		intro?: string;
		crumbs?: { name: string; href?: string }[];
		aside?: Snippet;
	}

	let { title, intro, crumbs, aside }: Props = $props();
</script>

<header class="border-b border-line bg-stock">
	<div class="shell pt-8 pb-10 md:pt-10 md:pb-14">
		{#if crumbs}<Breadcrumbs items={crumbs} />{/if}
		<div class="mt-6 grid gap-6 md:mt-10 md:grid-cols-12 md:items-end">
			<div class="md:col-span-8">
				<h1 class="h1 max-w-[18ch]">{title}</h1>
				{#if intro}<p class="lede mt-4">{intro}</p>{/if}
			</div>
			{#if aside}<div class="md:col-span-4 md:justify-self-end">{@render aside()}</div>{/if}
		</div>
	</div>
</header>
