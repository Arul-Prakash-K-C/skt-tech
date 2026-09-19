<script lang="ts">
	import type { Category, SiteSettings } from '$lib/sanity/types';
	import Logo from '$lib/components/ui/Logo.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { phoneHref } from '$lib/utils/format';
	import { modal } from '$lib/utils/dialog';

	interface Props {
		open: boolean;
		nav: { href: string; label: string }[];
		categories: Pick<Category, '_id' | 'title' | 'slug'>[];
		settings: SiteSettings;
		isActive: (href: string) => boolean;
	}

	let { open = $bindable(), nav, categories, settings, isActive }: Props = $props();
</script>

<dialog
	data-lenis-prevent
	{@attach modal(open)}
	class="sheet"
	aria-label="Menu"
	onclose={() => (open = false)}
	onclick={(e) => e.target === e.currentTarget && (open = false)}
>
	<div class="panel">
		<div
			class="flex h-(--header-h) items-center justify-between border-b border-line px-(--gutter)"
		>
			<Logo name={settings.companyName} />
			<button
				class="grid size-10 place-items-center rounded-sm hover:bg-shade"
				aria-label="Close menu"
				onclick={() => (open = false)}
			>
				<Icon name="close" size={22} />
			</button>
		</div>

		<nav aria-label="Mobile" class="flex-1 overflow-y-auto px-(--gutter) py-6">
			<ul class="grid">
				{#each nav as item, i (item.href)}
					<li style:--i={i}>
						<a
							href={item.href}
							class={['big-link', isActive(item.href) && 'active']}
							aria-current={isActive(item.href) ? 'page' : undefined}
						>
							{item.label}
						</a>
						{#if item.href === '/products' && categories.length}
							<ul class="mb-3 flex flex-wrap gap-2 pt-1">
								{#each categories as c (c._id)}
									<li>
										<a href="/products?category={c.slug}" class="chip">{c.title}</a>
									</li>
								{/each}
							</ul>
						{/if}
					</li>
				{/each}
			</ul>
		</nav>

		<div class="grid gap-3 border-t border-line p-(--gutter)">
			<Button href="/contact" size="lg">Request a quote</Button>
			{#if settings.phone}
				<Button href="tel:{phoneHref(settings.phone)}" variant="secondary" size="lg">
					<Icon name="phone" size={18} />
					<span class="num">Call {settings.phone}</span>
				</Button>
			{/if}
		</div>
	</div>
</dialog>

<style>
	.sheet {
		margin: 0;
		padding: 0;
		border: 0;
		width: 100%;
		max-width: 100%;
		height: 100dvh;
		max-height: 100dvh;
		background: transparent;
	}
	.sheet::backdrop {
		background: rgb(15 34 51 / 0.4);
		opacity: 0;
		transition:
			opacity var(--dur-3) var(--ease-out),
			display var(--dur-3) allow-discrete,
			overlay var(--dur-3) allow-discrete;
	}
	.sheet[open]::backdrop {
		opacity: 1;
	}
	@starting-style {
		.sheet[open]::backdrop {
			opacity: 0;
		}
	}

	.panel {
		display: flex;
		flex-direction: column;
		height: 100%;
		margin-left: auto;
		width: min(100%, 28rem);
		background: var(--color-paper);
		transform: translateX(100%);
		transition: transform var(--dur-3) var(--ease-out);
	}
	.sheet[open] .panel {
		transform: none;
	}
	@starting-style {
		.sheet[open] .panel {
			transform: translateX(100%);
		}
	}

	.big-link {
		display: block;
		padding-block: 0.625rem;
		font-size: 1.875rem;
		font-weight: 600;
		font-variation-settings: 'wdth' 116;
		letter-spacing: -0.02em;
		color: var(--color-ink-2);
	}
	.big-link.active {
		color: var(--color-cyan);
	}
	.chip {
		display: inline-flex;
		align-items: center;
		height: 2.25rem;
		padding-inline: 0.875rem;
		border: 1px solid var(--color-line-strong);
		border-radius: 999px;
		font-size: 0.875rem;
		color: var(--color-ink-2);
		background: var(--color-stock);
	}
</style>
