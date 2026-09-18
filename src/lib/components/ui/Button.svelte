<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';

	type Variant = 'primary' | 'secondary' | 'ghost' | 'inverse';
	type Size = 'sm' | 'md' | 'lg';

	type Props = {
		variant?: Variant;
		size?: Size;
		children: Snippet;
		class?: string;
	} & (
		| ({ href: string } & Omit<HTMLAnchorAttributes, 'class'>)
		| ({ href?: undefined } & Omit<HTMLButtonAttributes, 'class'>)
	);

	let {
		variant = 'primary',
		size = 'md',
		children,
		class: className = '',
		...rest
	}: Props = $props();

	const classes = $derived(['btn', `btn-${variant}`, `btn-${size}`, className]);
</script>

{#if rest.href !== undefined}
	<a class={classes} {...rest as HTMLAnchorAttributes}>{@render children()}</a>
{:else}
	<button class={classes} {...rest as HTMLButtonAttributes}>{@render children()}</button>
{/if}

<style>
	/* In the components layer so utility classes passed via `class` win */
	@layer components {
		.btn {
			position: relative;
			display: inline-flex;
			align-items: center;
			justify-content: center;
			gap: 0.5rem;
			border-radius: var(--radius-sm);
			font-weight: 580;
			font-variation-settings: 'wdth' 104;
			letter-spacing: -0.005em;
			line-height: 1;
			white-space: nowrap;
			text-decoration: none;
			cursor: pointer;
			border: 1.5px solid transparent;
			transition:
				background-color var(--dur-2) var(--ease-out),
				border-color var(--dur-2) var(--ease-out),
				color var(--dur-2) var(--ease-out),
				transform var(--dur-1) var(--ease-out);
			-webkit-tap-highlight-color: transparent;
		}
		.btn:active {
			transform: translateY(1px) scale(0.985);
		}
		.btn:disabled,
		.btn[aria-disabled='true'] {
			opacity: 0.55;
			cursor: not-allowed;
			transform: none;
		}

		.btn-sm {
			height: 2.25rem;
			padding-inline: 0.875rem;
			font-size: 0.875rem;
		}
		.btn-md {
			height: 2.875rem;
			padding-inline: 1.25rem;
			font-size: 0.9375rem;
		}
		.btn-lg {
			height: 3.25rem;
			padding-inline: 1.5rem;
			font-size: 1rem;
		}

		.btn-primary {
			background: var(--color-ink);
			color: white;
		}
		.btn-primary:hover {
			background: var(--color-cyan-strong);
		}

		.btn-secondary {
			background: var(--color-stock);
			color: var(--color-ink);
			border-color: var(--color-line-strong);
		}
		.btn-secondary:hover {
			border-color: var(--color-ink);
		}

		.btn-ghost {
			background: transparent;
			color: var(--color-ink);
			padding-inline: 0.5rem;
		}
		.btn-ghost:hover {
			background: var(--color-shade);
		}

		.btn-inverse {
			background: white;
			color: var(--color-ink);
		}
		.btn-inverse:hover {
			background: var(--color-cyan-soft);
		}
	}
</style>
