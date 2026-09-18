<script lang="ts">
	import { page } from '$app/state';
	import { env } from '$env/dynamic/public';
	import Seo from '$lib/components/ui/Seo.svelte';
	import Breadcrumbs from '$lib/components/ui/Breadcrumbs.svelte';
	import SanityImage from '$lib/components/ui/SanityImage.svelte';
	import RichText from '$lib/components/ui/RichText.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { formatDateRange, formatTime } from '$lib/utils/format';
	import { breadcrumbLd, eventLd } from '$lib/utils/seo';
	import { revealImage } from '$lib/utils/motion';

	let { data } = $props();

	const event = $derived(data.event);
	const origin = $derived(env.PUBLIC_SITE_URL || page.url.origin);
	const hasTime = $derived(/T\d{2}:\d{2}/.test(event.startDate));
	const external = $derived(!!event.registrationUrl && /^https?:/.test(event.registrationUrl));
	const crumbs = $derived([
		{ name: 'Home', href: '/' },
		{ name: 'Events', href: '/events' },
		{ name: event.title, href: `/events/${event.slug}` }
	]);
</script>

<Seo
	title={event.seo?.title ?? event.title}
	description={event.seo?.description ?? event.summary}
	image={event.seo?.image ?? event.coverImage}
	type="article"
	noIndex={event.seo?.noIndex}
	schema={[eventLd(event, origin), breadcrumbLd(origin, crumbs)]}
/>

<article>
	<header class="shell pt-6 md:pt-8">
		<Breadcrumbs items={crumbs} />
		<div class="mt-8 grid gap-10 lg:grid-cols-12 lg:items-end">
			<div class="lg:col-span-7">
				{#if data.isPast}<Badge tone="muted">This event has ended</Badge>{:else}<Badge tone="info"
						>Upcoming</Badge
					>{/if}
				<h1 class="h1 mt-4">{event.title}</h1>
				{#if event.summary}<p class="lede mt-4">{event.summary}</p>{/if}
			</div>
			<dl class="grid gap-4 rounded-card border border-line bg-stock p-6 lg:col-span-5">
				<div class="flex gap-3">
					<dt><Icon name="calendar" size={20} class="mt-0.5 text-cyan" label="Date" /></dt>
					<dd>
						<span class="block font-medium">{formatDateRange(event.startDate, event.endDate)}</span>
						{#if hasTime}
							<span class="num text-sm text-muted"
								>{formatTime(event.startDate)}{event.endDate
									? ` to ${formatTime(event.endDate)}`
									: ''} IST</span
							>
						{/if}
					</dd>
				</div>
				{#if event.location}
					<div class="flex gap-3">
						<dt><Icon name="pin" size={20} class="mt-0.5 text-cyan" label="Location" /></dt>
						<dd class="font-medium">{event.location}</dd>
					</div>
				{/if}
				{#if event.registrationUrl && !data.isPast}
					<Button
						href={event.registrationUrl}
						size="lg"
						class="mt-2"
						target={external ? '_blank' : undefined}
						rel={external ? 'noopener noreferrer' : undefined}
					>
						{event.registrationLabel ?? 'Register'}
					</Button>
				{/if}
			</dl>
		</div>
	</header>

	{#if event.coverImage}
		<div class="shell mt-10 md:mt-14">
			<div class="overflow-hidden rounded-lg bg-shade" {@attach revealImage}>
				<SanityImage
					image={event.coverImage}
					width={1280}
					aspect={16 / 7}
					sizes="(min-width: 1344px) 80rem, 100vw"
					priority
					class="w-full"
				/>
			</div>
		</div>
	{/if}

	{#if event.description?.length}
		<div class="shell py-12 md:py-16">
			<RichText value={event.description} class="text-[1.0625rem] leading-relaxed" />
		</div>
	{/if}

	{#if event.gallery?.length}
		<section class="border-t border-line py-12 md:py-16" aria-labelledby="event-photos">
			<div class="shell">
				<h2 id="event-photos" class="h2">Photos</h2>
				<ul class="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
					{#each event.gallery as img, i (img.ref ?? img.url + i)}
						<li class="overflow-hidden rounded-card bg-shade" {@attach revealImage}>
							<SanityImage
								image={img}
								width={440}
								aspect={3 / 2}
								sizes="(min-width: 768px) 30vw, 50vw"
								class="h-full w-full object-cover"
							/>
						</li>
					{/each}
				</ul>
			</div>
		</section>
	{/if}

	<div class="shell pb-16">
		<a href="/events" class="link text-sm">All events</a>
	</div>
</article>
