<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		intro?: string;
		id?: string;
		action?: Snippet;
		inverse?: boolean;
	}

	let { title, intro, id, action, inverse = false }: Props = $props();
</script>

<div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-10">
	<div>
		<h2 {id} class={['h2 max-w-[22ch]', inverse && 'text-white']}>{title}</h2>
		{#if intro}
			<p class={['mt-3 max-w-xl', inverse ? 'text-white/70' : 'text-muted']}>{intro}</p>
		{/if}
	</div>
	{#if action}<div class="shrink-0">{@render action()}</div>{/if}
</div>
