<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		tone?: 'neutral' | 'ok' | 'warn' | 'muted' | 'deal' | 'info';
		dot?: boolean;
		children: Snippet;
		class?: string;
	}

	let { tone = 'neutral', dot = false, children, class: className = '' }: Props = $props();
</script>

<span class={['badge', `badge-${tone}`, className]}>
	{#if dot}<span class="dot" aria-hidden="true"></span>{/if}
	{@render children()}
</span>

<style>
	.badge {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		height: 1.5rem;
		padding-inline: 0.5rem;
		border-radius: var(--radius-xs);
		font-size: 0.75rem;
		font-weight: 560;
		line-height: 1;
		white-space: nowrap;
	}
	.dot {
		width: 0.4375rem;
		height: 0.4375rem;
		border-radius: 50%;
		background: currentColor;
	}
	.badge-neutral {
		background: var(--color-shade);
		color: var(--color-ink-2);
	}
	.badge-info {
		background: var(--color-cyan-soft);
		color: var(--color-cyan-strong);
	}
	.badge-ok {
		background: var(--color-ok-soft);
		color: var(--color-ok);
	}
	.badge-warn {
		background: var(--color-warn-soft);
		color: var(--color-warn);
	}
	.badge-muted {
		background: var(--color-shade);
		color: var(--color-muted);
	}
	.badge-deal {
		background: var(--color-magenta);
		color: white;
	}
</style>
