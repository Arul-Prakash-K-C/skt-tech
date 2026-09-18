<script lang="ts">
	import type { HTMLInputAttributes, HTMLTextareaAttributes } from 'svelte/elements';
	import Icon from '$lib/components/ui/Icon.svelte';

	type Common = {
		label: string;
		name: string;
		error?: string;
		hint?: string;
		optional?: boolean;
		class?: string;
	};

	type Props = Common &
		(
			| ({ multiline: true } & Omit<HTMLTextareaAttributes, 'name' | 'class'>)
			| ({ multiline?: false } & Omit<HTMLInputAttributes, 'name' | 'class'>)
		);

	let {
		label,
		name,
		error,
		hint,
		optional = false,
		multiline = false,
		class: className = '',
		...rest
	}: Props = $props();

	const id = $derived(`f-${name}`);
	const describedBy = $derived(
		[hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined
	);
</script>

<div class={['field', error && 'invalid', className]}>
	<label for={id} class="label">
		{label}
		{#if optional}<span class="font-normal text-subtle">Optional</span>{/if}
	</label>
	{#if multiline}
		<textarea
			{id}
			{name}
			class="control min-h-40 resize-y py-3"
			aria-invalid={error ? 'true' : undefined}
			aria-describedby={describedBy}
			{...rest as HTMLTextareaAttributes}></textarea>
	{:else}
		<input
			{id}
			{name}
			class="control h-12"
			aria-invalid={error ? 'true' : undefined}
			aria-describedby={describedBy}
			{...rest as HTMLInputAttributes}
		/>
	{/if}
	{#if error}
		<p id="{id}-error" class="error"><Icon name="alert" size={15} class="mt-px" />{error}</p>
	{:else if hint}
		<p id="{id}-hint" class="hint">{hint}</p>
	{/if}
</div>

<style>
	.field {
		display: grid;
		gap: 0.4375rem;
	}
	.label {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		font-size: 0.875rem;
		font-weight: 580;
		color: var(--color-ink);
	}
	.control {
		width: 100%;
		padding-inline: 0.875rem;
		border: 1px solid var(--color-line-strong);
		border-radius: var(--radius-sm);
		background: var(--color-stock);
		font-size: 1rem;
		color: var(--color-ink);
		transition:
			border-color var(--dur-2) var(--ease-out),
			box-shadow var(--dur-2) var(--ease-out);
	}
	.control::placeholder {
		color: var(--color-subtle);
	}
	.control:hover {
		border-color: var(--color-subtle);
	}
	.control:focus {
		outline: none;
		border-color: var(--color-cyan);
		box-shadow: 0 0 0 3px rgb(7 113 154 / 0.18);
	}
	.invalid .control {
		border-color: var(--color-magenta);
	}
	.invalid .control:focus {
		box-shadow: 0 0 0 3px rgb(184 35 90 / 0.15);
	}
	.error {
		display: flex;
		gap: 0.375rem;
		font-size: 0.8125rem;
		color: var(--color-magenta);
	}
	.hint {
		font-size: 0.8125rem;
		color: var(--color-muted);
	}
</style>
