<script lang="ts">
	import { page } from '$app/state';
	import type { Category, SiteSettings } from '$lib/sanity/types';
	import Logo from '$lib/components/ui/Logo.svelte';
	import Icon, { type IconName } from '$lib/components/ui/Icon.svelte';
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

	const ICONS: Record<string, IconName> = {
		'/products': 'grid',
		'/brands': 'tag',
		'/gallery': 'image',
		'/events': 'calendar',
		'/about': 'info',
		'/contact': 'mail'
	};

	// The rail mirrors every top-level destination, contact included
	const rail = $derived([...nav, { href: '/contact', label: 'Contact' }]);
	const company = $derived(nav.filter((n) => n.href !== '/products'));

	const activeCategory = $derived(
		page.url.pathname === '/products' ? page.url.searchParams.get('category') : null
	);
	const allProductsActive = $derived(
		page.url.pathname.startsWith('/products') && !activeCategory
	);
</script>

<dialog
	data-lenis-prevent
	{@attach modal(open)}
	class="sheet"
	aria-label="Menu"
	onclose={() => (open = false)}
	onclick={(e) => e.target === e.currentTarget && (open = false)}
>
	<div class="drawer">
		<!-- Icon rail -->
		<div class="rail">
			<a href="/" class="rail-home" aria-label="{settings.companyName} home">
				<Logo name={settings.companyName} compact inverse />
			</a>

			<ul class="grid gap-1.5">
				{#each rail as item (item.href)}
					<li>
						<a
							href={item.href}
							class={['rail-link', isActive(item.href) && 'active']}
							aria-label={item.label}
							aria-current={isActive(item.href) ? 'page' : undefined}
						>
							<Icon name={ICONS[item.href] ?? 'arrow'} size={20} />
						</a>
					</li>
				{/each}
			</ul>

			{#if settings.phone}
				<a
					href="tel:{phoneHref(settings.phone)}"
					class="rail-call"
					aria-label="Call {settings.phone}"
				>
					<Icon name="phone" size={19} />
				</a>
			{/if}
		</div>

		<!-- Labelled panel -->
		<div class="panel">
			<div class="flex items-center justify-between px-6 pt-6 pb-2">
				<p class="title">Menu</p>
				<button class="close" aria-label="Close menu" onclick={() => (open = false)}>
					<Icon name="close" size={20} />
				</button>
			</div>

			<nav aria-label="Mobile" class="scroll">
				<section class="group" style:--i={0}>
					<h2 class="group-title">Products</h2>
					<ul class="sub">
						<li>
							<a
								href="/products"
								class={['sub-link', allProductsActive && 'active']}
								aria-current={allProductsActive ? 'page' : undefined}
							>
								All products
							</a>
						</li>
						{#each categories as c (c._id)}
							<li>
								<a
									href="/products?category={c.slug}"
									class={['sub-link', activeCategory === c.slug && 'active']}
									aria-current={activeCategory === c.slug ? 'page' : undefined}
								>
									{c.title}
								</a>
							</li>
						{/each}
					</ul>
				</section>

				<section class="group" style:--i={1}>
					<h2 class="group-title">Company</h2>
					<ul class="sub">
						{#each company as item (item.href)}
							<li>
								<a
									href={item.href}
									class={['sub-link', isActive(item.href) && 'active']}
									aria-current={isActive(item.href) ? 'page' : undefined}
								>
									{item.label}
								</a>
							</li>
						{/each}
					</ul>
				</section>

				<section class="group" style:--i={2}>
					<h2 class="group-title">Get in touch</h2>
					<ul class="sub">
						<li>
							<a
								href="/contact"
								class={['sub-link', isActive('/contact') && 'active']}
								aria-current={isActive('/contact') ? 'page' : undefined}
							>
								Contact us
							</a>
						</li>
						{#if settings.phone}
							<li>
								<a href="tel:{phoneHref(settings.phone)}" class="sub-link num">
									{settings.phone}
								</a>
							</li>
						{/if}
					</ul>
				</section>
			</nav>

			<div class="p-5 pt-3">
				<Button href="/contact" size="lg" class="w-full">
					Request a quote
					<Icon name="arrow" size={18} />
				</Button>
			</div>
		</div>
	</div>
</dialog>

<style>
	/* Only transform and opacity animate, so the open/close runs on the
	   compositor and stays smooth on low-end phones. */
	.sheet {
		margin: 0;
		padding: 0;
		border: 0;
		width: 100%;
		max-width: 100%;
		height: 100dvh;
		max-height: 100dvh;
		background: transparent;
		overflow: hidden;
		/* Keeps the dialog rendered while the close animation plays */
		transition:
			display var(--dur-3) allow-discrete,
			overlay var(--dur-3) allow-discrete;
	}
	.sheet::backdrop {
		background: rgb(15 34 51 / 0.45);
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

	.drawer {
		position: absolute;
		inset: 0.625rem auto 0.625rem 0.625rem;
		display: flex;
		width: min(calc(100% - 1.25rem), 23rem);
		border-radius: 1.75rem;
		overflow: hidden;
		background: var(--color-stock);
		box-shadow: var(--shadow-float);
		contain: layout paint;
		transform: translate3d(calc(-100% - 1rem), 0, 0);
		transition: transform var(--dur-3) var(--ease-out);
		will-change: transform;
	}
	.sheet[open] .drawer {
		transform: none;
	}
	@starting-style {
		.sheet[open] .drawer {
			transform: translate3d(calc(-100% - 1rem), 0, 0);
		}
	}

	/* ---- Rail ---- */
	.rail {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.75rem;
		flex: none;
		width: 4.5rem;
		padding-block: 1.25rem;
		background: var(--color-ink);
		border-radius: 1.75rem;
		color: rgb(255 255 255 / 0.62);
	}
	.rail ul {
		width: 100%;
	}
	.rail-home {
		display: grid;
		place-items: center;
		width: 2.75rem;
		height: 2.75rem;
		border-radius: 0.875rem;
	}
	.rail-link {
		position: relative;
		display: grid;
		place-items: center;
		height: 2.875rem;
		transition: color var(--dur-1) var(--ease-out);
	}
	.rail-link::before {
		content: '';
		position: absolute;
		inset: 0.1875rem 0.75rem;
		border-radius: 0.75rem;
		background: rgb(255 255 255 / 0.1);
		opacity: 0;
		transition: opacity var(--dur-1) var(--ease-out);
	}
	.rail-link:hover,
	.rail-link.active {
		color: white;
	}
	.rail-link:hover::before,
	.rail-link.active::before {
		opacity: 1;
	}
	/* Tab marker on the rail's edge, as in a folder divider */
	.rail-link.active::after {
		content: '';
		position: absolute;
		right: 0;
		top: 50%;
		width: 3px;
		height: 1.375rem;
		margin-top: -0.6875rem;
		border-radius: 3px 0 0 3px;
		background: white;
	}
	.rail-call {
		display: grid;
		place-items: center;
		margin-top: auto;
		width: 2.75rem;
		height: 2.75rem;
		border-radius: 999px;
		background: var(--color-process-yellow);
		color: var(--color-ink);
	}

	/* ---- Panel ---- */
	.panel {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 0;
	}
	.title {
		font-size: 1.5rem;
		font-weight: 600;
		font-variation-settings: 'wdth' 112;
		letter-spacing: -0.015em;
		color: var(--color-ink);
	}
	.close {
		display: grid;
		place-items: center;
		width: 2.5rem;
		height: 2.5rem;
		margin-right: -0.5rem;
		border-radius: 999px;
		color: var(--color-ink-2);
		transition: background-color var(--dur-1) var(--ease-out);
	}
	.close:hover {
		background: var(--color-shade);
	}
	.scroll {
		flex: 1;
		overflow-y: auto;
		overscroll-behavior: contain;
		padding: 0.5rem 0 0.75rem;
	}

	.group {
		padding-top: 1.125rem;
	}
	.sheet[open] .group {
		animation: rise var(--dur-3) var(--ease-out) both;
		animation-delay: calc(80ms + var(--i) * 45ms);
	}
	@keyframes rise {
		from {
			opacity: 0;
			transform: translate3d(-8px, 0, 0);
		}
	}
	.group-title {
		padding-inline: 1.5rem;
		margin-bottom: 0.5rem;
		font-size: 0.6875rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--color-ink);
	}
	/* Guide line the links hang from */
	.sub {
		position: relative;
		display: grid;
	}
	.sub::before {
		content: '';
		position: absolute;
		left: 2rem;
		top: 0.25rem;
		bottom: 0.25rem;
		width: 1px;
		background: var(--color-line);
	}
	.sub-link {
		position: relative;
		display: block;
		padding: 0.5625rem 1.5rem 0.5625rem 2.875rem;
		font-size: 0.9375rem;
		color: var(--color-subtle);
		transition:
			color var(--dur-1) var(--ease-out),
			background-color var(--dur-1) var(--ease-out);
	}
	.sub-link:hover {
		color: var(--color-ink);
		background: var(--color-paper);
	}
	.sub-link.active {
		color: var(--color-cyan);
		font-weight: 560;
		background: var(--color-cyan-soft);
	}
	.sub-link.active::before {
		content: '';
		position: absolute;
		left: calc(2rem - 1px);
		top: 0.5rem;
		bottom: 0.5rem;
		width: 3px;
		border-radius: 3px;
		background: var(--color-cyan);
	}
</style>
