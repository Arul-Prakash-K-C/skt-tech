<script lang="ts">
	import Icon from './Icon.svelte';

	interface Props {
		items: { name: string; href?: string }[];
	}

	let { items }: Props = $props();
</script>

<nav aria-label="Breadcrumb">
	<ol class="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-muted">
		{#each items as item, i (item.name + i)}
			<li class="flex items-center gap-1.5">
				{#if i > 0}<Icon name="chevron-right" size={14} class="text-subtle" />{/if}
				{#if item.href && i < items.length - 1}
					<a href={item.href} class="transition-colors hover:text-ink">{item.name}</a>
				{:else}
					<span aria-current="page" class="line-clamp-1 text-ink-2">{item.name}</span>
				{/if}
			</li>
		{/each}
	</ol>
</nav>
