<script lang="ts">
	import type { Category, SiteSettings } from '$lib/sanity/types';
	import Logo from '$lib/components/ui/Logo.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { phoneHref } from '$lib/utils/format';

	interface Props {
		settings: SiteSettings;
		categories: Pick<Category, '_id' | 'title' | 'slug'>[];
	}

	let { settings, categories }: Props = $props();

	const year = new Date().getFullYear();

	const company = [
		{ href: '/about', label: 'About us' },
		{ href: '/brands', label: 'Brands we carry' },
		{ href: '/gallery', label: 'Gallery' },
		{ href: '/events', label: 'Events' },
		{ href: '/contact', label: 'Contact' }
	];
</script>

<footer class="footer">
	<!-- The ribbon: Y M C K panels in print order -->
	<div class="ribbon" aria-hidden="true">
		<span style:background="var(--color-process-yellow)"></span>
		<span style:background="var(--color-process-magenta)"></span>
		<span style:background="var(--color-process-cyan)"></span>
		<span style:background="#5d6b78"></span>
	</div>

	<div class="shell grid gap-12 py-14 md:grid-cols-12 md:py-20">
		<div class="md:col-span-5">
			<Logo name={settings.companyName} inverse />
			{#if settings.description}
				<p class="mt-5 max-w-md text-[0.9375rem] leading-relaxed text-white/70">
					{settings.description}
				</p>
			{/if}
			<ul class="mt-7 grid gap-3 text-[0.9375rem]">
				{#if settings.phone}
					<li>
						<a class="contact" href="tel:{phoneHref(settings.phone)}">
							<Icon name="phone" size={18} /><span class="num">{settings.phone}</span>
						</a>
					</li>
				{/if}
				{#if settings.whatsapp}
					<li>
						<a
							class="contact"
							href="https://wa.me/{phoneHref(settings.whatsapp).replace('+', '')}"
							target="_blank"
							rel="noopener noreferrer"
						>
							<Icon name="whatsapp" size={18} />WhatsApp
						</a>
					</li>
				{/if}
				{#if settings.email}
					<li>
						<a class="contact" href="mailto:{settings.email}"
							><Icon name="mail" size={18} />{settings.email}</a
						>
					</li>
				{/if}
			</ul>
		</div>

		<nav class="md:col-span-3" aria-labelledby="footer-products">
			<h2 id="footer-products" class="col-title">Products</h2>
			<ul class="grid gap-2.5">
				{#each categories as c (c._id)}
					<li><a class="flink" href="/products?category={c.slug}">{c.title}</a></li>
				{/each}
				<li><a class="flink" href="/products">All products</a></li>
			</ul>
		</nav>

		<nav class="md:col-span-2" aria-labelledby="footer-company">
			<h2 id="footer-company" class="col-title">Company</h2>
			<ul class="grid gap-2.5">
				{#each company as l (l.href)}
					<li><a class="flink" href={l.href}>{l.label}</a></li>
				{/each}
			</ul>
		</nav>

		<div class="md:col-span-2">
			<h2 class="col-title">Visit</h2>
			{#if settings.address}
				<address class="text-[0.9375rem] leading-relaxed text-white/70 not-italic">
					{settings.address}
				</address>
			{/if}
			{#if settings.hours}<p class="mt-3 text-sm text-white/60">{settings.hours}</p>{/if}
			{#if settings.mapUrl}
				<a
					class="flink mt-3 inline-flex items-center gap-1.5 text-sm"
					href={settings.mapUrl}
					target="_blank"
					rel="noopener noreferrer"
				>
					Open in Maps <Icon name="external" size={14} />
				</a>
			{/if}
		</div>
	</div>

	<div class="border-t border-white/10">
		<div
			class="shell flex flex-col gap-2 py-6 text-[0.8125rem] text-white/50 md:flex-row md:justify-between"
		>
			<p class="flex flex-wrap gap-x-5 gap-y-1">
				<span>© {year} {settings.legalName ?? settings.companyName}</span>
				{#if settings.gstin}<span class="num">GSTIN {settings.gstin}</span>{/if}
			</p>
			<p class="max-w-xl md:text-right">
				<a
					class="credit"
					href="https://www.symphozen.com"
					target="_blank"
					rel="noopener noreferrer"
				>
					Powered by SymphoZen Labs
				</a>
			</p>
		</div>
	</div>
</footer>

<style>
	.footer {
		position: relative;
		background: var(--color-ink);
		color: white;
		view-transition-name: footer;
	}
	.ribbon {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		height: 4px;
	}
	.col-title {
		margin-bottom: 1rem;
		font-size: 0.875rem;
		font-weight: 600;
		color: white;
	}
	.flink {
		color: rgb(255 255 255 / 0.7);
		font-size: 0.9375rem;
		transition: color var(--dur-2) var(--ease-out);
	}
	.flink:hover {
		color: white;
	}
	.contact {
		display: inline-flex;
		align-items: center;
		gap: 0.625rem;
		color: rgb(255 255 255 / 0.85);
		transition: color var(--dur-2) var(--ease-out);
	}
	.contact:hover {
		color: #8fd3ee;
	}
	.credit {
		color: inherit;
		transition: color var(--dur-2) var(--ease-out);
	}
	.credit:hover {
		color: white;
	}
</style>
