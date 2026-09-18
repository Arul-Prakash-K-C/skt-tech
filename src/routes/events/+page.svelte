<script lang="ts">
	import Seo from '$lib/components/ui/Seo.svelte';
	import PageHeader from '$lib/components/sections/PageHeader.svelte';
	import EventRow from '$lib/components/events/EventRow.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import SanityImage from '$lib/components/ui/SanityImage.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { formatDateRange } from '$lib/utils/format';
	import { reveal } from '$lib/utils/motion';

	let { data } = $props();

	const intro =
		'Demo days, trade shows and campus visits where you can see printers working and bring your own card designs.';
</script>

<Seo title="Events" description={intro} />

<PageHeader title="Events" {intro} crumbs={[{ name: 'Home', href: '/' }, { name: 'Events' }]} />

<section class="shell py-12 md:py-16" aria-labelledby="upcoming">
	<h2 id="upcoming" class="h2">Upcoming</h2>
	{#if data.upcoming.length}
		<div class="mt-6 divide-y divide-line border-y border-line">
			{#each data.upcoming as event (event._id)}
				<EventRow {event} />
			{/each}
		</div>
	{:else}
		<div class="mt-6">
			<EmptyState
				title="No events scheduled right now"
				text="We can arrange a private demo at our office or your campus instead."
			>
				<Button href="/contact?subject=Private%20demo">Book a demo</Button>
			</EmptyState>
		</div>
	{/if}
</section>

{#if data.past.length}
	<section class="border-t border-line bg-stock/60 py-12 md:py-16" aria-labelledby="past">
		<div class="shell">
			<h2 id="past" class="h2">Past events</h2>
			<ul class="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
				{#each data.past as event, i (event._id)}
					<li class="group relative" {@attach reveal(i % 3)}>
						<div class="aspect-[3/2] overflow-hidden rounded-card bg-shade">
							<SanityImage
								image={event.coverImage}
								width={440}
								aspect={3 / 2}
								sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
								class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
							/>
						</div>
						<h3 class="h3 mt-4">
							<a
								href="/events/{event.slug}"
								class="group-hover:underline group-hover:decoration-cyan group-hover:underline-offset-4 after:absolute after:inset-0"
								>{event.title}</a
							>
						</h3>
						<p class="meta mt-1">
							{formatDateRange(event.startDate, event.endDate)}{event.location
								? `, ${event.location}`
								: ''}
						</p>
					</li>
				{/each}
			</ul>
		</div>
	</section>
{/if}
