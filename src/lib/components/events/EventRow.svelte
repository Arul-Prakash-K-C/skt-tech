<script lang="ts">
	import type { EventSummary } from '$lib/sanity/types';
	import SanityImage from '$lib/components/ui/SanityImage.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { dateParts, formatDateRange } from '$lib/utils/format';

	interface Props {
		event: EventSummary;
		level?: 'h2' | 'h3';
		showImage?: boolean;
		past?: boolean;
	}

	let { event, level = 'h3', showImage = true, past = false }: Props = $props();

	const leaf = $derived(dateParts(event.startDate));
</script>

<article class={['row group', past && 'past']}>
	<!-- Calendar leaf -->
	<time class="leaf num" datetime={event.startDate}>
		<span class="day">{leaf.day}</span>
		<span class="mon">{leaf.month}</span>
	</time>

	<div class="min-w-0 flex-1">
		<svelte:element this={level} class="h3">
			<a href="/events/{event.slug}" class="stretched">{event.title}</a>
		</svelte:element>
		<p class="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
			<span class="inline-flex items-center gap-1.5"
				><Icon name="calendar" size={15} />{formatDateRange(event.startDate, event.endDate)}</span
			>
			{#if event.location}<span class="inline-flex items-center gap-1.5"
					><Icon name="pin" size={15} />{event.location}</span
				>{/if}
		</p>
		{#if event.summary}<p class="mt-2 max-w-2xl text-ink-2">{event.summary}</p>{/if}
	</div>

	{#if showImage && event.coverImage}
		<div class="cover">
			<SanityImage
				image={event.coverImage}
				width={240}
				aspect={3 / 2}
				sizes="15rem"
				class="h-full w-full object-cover"
			/>
		</div>
	{/if}
</article>

<style>
	.row {
		position: relative;
		display: flex;
		align-items: flex-start;
		gap: 1.25rem;
		padding-block: 1.5rem;
	}
	@media (min-width: 768px) {
		.row {
			gap: 2rem;
			align-items: center;
		}
	}
	.leaf {
		flex-shrink: 0;
		display: grid;
		place-items: center;
		width: 4rem;
		padding-block: 0.625rem 0.5rem;
		border-radius: var(--radius-sm);
		background: var(--color-stock);
		border: 1px solid var(--color-line);
		border-top: 4px solid var(--color-cyan);
		line-height: 1;
	}
	.past .leaf {
		border-top-color: var(--color-line-strong);
	}
	.day {
		font-size: 1.625rem;
		font-weight: 650;
		font-variation-settings: 'wdth' 112;
	}
	.mon {
		margin-top: 0.25rem;
		font-size: 0.8125rem;
		color: var(--color-muted);
	}
	.cover {
		display: none;
		flex-shrink: 0;
		width: 12rem;
		aspect-ratio: 3 / 2;
		border-radius: var(--radius-card);
		overflow: hidden;
		background: var(--color-shade);
	}
	@media (min-width: 768px) {
		.cover {
			display: block;
		}
	}
	.cover :global(img) {
		transition: transform var(--dur-4) var(--ease-out);
	}
	.row:hover .cover :global(img) {
		transform: scale(1.04);
	}
	.stretched {
		text-decoration: underline;
		text-decoration-color: transparent;
		text-underline-offset: 4px;
		text-decoration-thickness: 1.5px;
		transition: text-decoration-color var(--dur-2) var(--ease-out);
	}
	.row:hover .stretched {
		text-decoration-color: var(--color-cyan);
	}
	.stretched::after {
		content: '';
		position: absolute;
		inset: 0;
	}
</style>
