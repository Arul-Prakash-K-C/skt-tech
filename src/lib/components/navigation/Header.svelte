<script lang="ts" module>
	export const NAV = [
		{ href: '/products', label: 'Products' },
		{ href: '/brands', label: 'Brands' },
		{ href: '/gallery', label: 'Gallery' },
		{ href: '/events', label: 'Events' },
		{ href: '/about', label: 'About' }
	];
</script>

<script lang="ts">
	import { page } from '$app/state';
	import { afterNavigate, goto } from '$app/navigation';
	import type { Category, SiteSettings } from '$lib/sanity/types';
	import Logo from '$lib/components/ui/Logo.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { phoneHref } from '$lib/utils/format';
	import MobileNav from './MobileNav.svelte';
	import RubberSegment from './RubberSegment.svelte';

	interface Props {
		settings: SiteSettings;
		categories: Pick<Category, '_id' | 'title' | 'slug'>[];
	}

	let { settings, categories }: Props = $props();

	let scrollY = $state(0);
	let productsOpen = $state(false);
	let mobileOpen = $state(false);
	let productsWrap: HTMLElement | undefined = $state();

	const isActive = (href: string) =>
		page.url.pathname === href || page.url.pathname.startsWith(`${href}/`);

	const navItems = $derived(
		NAV.map((n) => ({
			value: n.href,
			label: n.label,
			href: n.href,
			// Products carries the categories submenu toggle inside its own slot
			accessory: n.href === '/products' && categories.length > 0
		}))
	);
	let menuButton: HTMLButtonElement | undefined = $state();

	function closeMenu(refocus = false) {
		productsOpen = false;
		if (refocus) menuButton?.focus();
	}
	// '' on pages outside the main nav (home, contact): the thumb fades out.
	const activeHref = $derived(NAV.find((n) => isActive(n.href))?.href ?? '');

	afterNavigate(() => {
		productsOpen = false;
		mobileOpen = false;
	});

	function onWindowClick(e: MouseEvent) {
		if (productsOpen && productsWrap && !productsWrap.contains(e.target as Node))
			productsOpen = false;
	}
</script>

<svelte:window
	bind:scrollY
	onclick={onWindowClick}
	onkeydown={(e) => e.key === 'Escape' && productsOpen && closeMenu(true)}
/>

<a href="#main" class="skip">Skip to content</a>

<header class={['header', scrollY > 8 && 'scrolled']}>
	<!-- Three columns with equal outer tracks, so the menu sits on the page's
	     true centre whatever the widths of the logo and the actions -->
	<div
		class="shell grid h-(--header-h) grid-cols-[1fr_auto] items-center gap-4 lg:grid-cols-[1fr_auto_1fr] lg:gap-6"
	>
		<a href="/" class="justify-self-start" aria-label="{settings.companyName} home">
			<Logo name={settings.companyName} />
		</a>

		<nav aria-label="Main" class="hidden justify-self-center lg:block">
			<RubberSegment
				items={navItems}
				value={activeHref}
				onnavigate={(href) => goto(href)}
				trackColor="rgb(15 34 51 / 0.055)"
				thumbColor="var(--color-ink)"
				textColor="var(--color-ink-2)"
				activeTextColor="#ffffff"
				size="lg"
				radius={12}
				inset={3}
				equalSlots={false}
				stretch={100}
				squash={3}
				speed={1}
				glide={75}
				draggable
				animateExternal
			>
				{#snippet accessory({ copy })}
					{#if copy}
						<!-- Decorative twin inside the thumb, in the active colour -->
						<span class="grid size-7 place-items-center">
							<Icon
								name="chevron-down"
								size={16}
								class={['transition-transform duration-300', productsOpen && 'rotate-180']}
							/>
						</span>
					{:else}
						<span class="contents" bind:this={productsWrap}>
							<button
								bind:this={menuButton}
								class="pointer-events-auto grid size-7 place-items-center rounded-[8px] transition-colors hover:bg-ink/10 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-cyan"
								aria-expanded={productsOpen}
								aria-controls="products-menu"
								aria-label="Product categories"
								onclick={() => (productsOpen = !productsOpen)}
							>
								<Icon
									name="chevron-down"
									size={16}
									class={['transition-transform duration-300', productsOpen && 'rotate-180']}
								/>
							</button>
							<div
								id="products-menu"
								class="menu pointer-events-auto"
								data-open={productsOpen}
								inert={!productsOpen}
							>
								<ul class="grid gap-0.5">
									{#each categories as c (c._id)}
										<li>
											<a class="menu-link" href="/products?category={c.slug}">{c.title}</a>
										</li>
									{/each}
								</ul>
								<a href="/products" class="menu-all">All products</a>
							</div>
						</span>
					{/if}
				{/snippet}
			</RubberSegment>
		</nav>

		<div class="flex items-center justify-end gap-2">
			{#if settings.phone}
				<a
					href="tel:{phoneHref(settings.phone)}"
					class="hidden items-center gap-2 px-2 text-sm font-medium text-ink-2 transition-colors hover:text-ink xl:flex"
				>
					<Icon name="phone" size={17} />
					<span class="num">{settings.phone}</span>
				</a>
			{/if}
			<Button href="/contact" size="sm" class="hidden sm:inline-flex">Request a quote</Button>
			<button
				class="grid size-10 place-items-center rounded-sm text-ink transition-colors hover:bg-shade lg:hidden"
				aria-label="Open menu"
				aria-haspopup="dialog"
				aria-expanded={mobileOpen}
				onclick={() => (mobileOpen = true)}
			>
				<Icon name="menu" size={22} />
			</button>
		</div>
	</div>
</header>

<MobileNav bind:open={mobileOpen} nav={NAV} {categories} {settings} {isActive} />

<style>
	.skip {
		position: absolute;
		left: 1rem;
		top: -3rem;
		z-index: 60;
		background: var(--color-ink);
		color: white;
		padding: 0.625rem 1rem;
		border-radius: var(--radius-sm);
		transition: top var(--dur-2) var(--ease-out);
	}
	.skip:focus {
		top: 0.75rem;
	}

	.header {
		position: sticky;
		top: 0;
		z-index: 40;
		background: rgb(243 245 246 / 0.86);
		backdrop-filter: saturate(1.4) blur(12px);
		-webkit-backdrop-filter: saturate(1.4) blur(12px);
		border-bottom: 1px solid transparent;
		transition:
			border-color var(--dur-3) var(--ease-out),
			background-color var(--dur-3) var(--ease-out);
		view-transition-name: header;
	}
	.scrolled {
		border-bottom-color: var(--color-line);
		background: rgb(255 255 255 / 0.9);
	}

	.menu {
		position: absolute;
		/* Hangs from the Products slot: aligned to the track's outer left edge */
		top: calc(100% + 0.75rem);
		left: -3px;
		z-index: 50;
		width: 17rem;
		padding: 0.5rem;
		background: var(--color-stock);
		border: 1px solid var(--color-line);
		border-radius: var(--radius-card);
		box-shadow: var(--shadow-float);
		opacity: 0;
		transform: translateY(-6px);
		pointer-events: none;
		transition:
			opacity var(--dur-2) var(--ease-out),
			transform var(--dur-2) var(--ease-out);
	}
	.menu[data-open='true'] {
		opacity: 1;
		transform: none;
		pointer-events: auto;
	}
	.menu-link {
		display: block;
		padding: 0.5625rem 0.75rem;
		border-radius: var(--radius-sm);
		font-size: 0.9375rem;
		color: var(--color-ink-2);
		transition: background-color var(--dur-1) var(--ease-out);
	}
	.menu-link:hover {
		background: var(--color-paper);
		color: var(--color-ink);
	}
	.menu-all {
		display: block;
		margin-top: 0.375rem;
		padding: 0.75rem;
		border-top: 1px solid var(--color-line);
		font-size: 0.875rem;
		font-weight: 580;
		color: var(--color-cyan);
	}
</style>
