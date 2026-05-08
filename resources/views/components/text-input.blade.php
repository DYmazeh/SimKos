@props(['disabled' => false])

<input
    @disabled($disabled)
    {{ $attributes->merge([
        'class' => '
            w-full h-10 px-4
            bg-surface-muted text-fg-primary placeholder:text-fg-tertiary
            border border-border rounded-xs
            transition-colors duration-fast ease-standard
            hover:border-fg-tertiary
            focus:outline-none focus:border-surface-raised focus:ring-2 focus:ring-surface-raised focus:ring-offset-2 focus:ring-offset-surface-base
            disabled:opacity-50 disabled:cursor-not-allowed
            aria-[invalid=true]:border-state-danger aria-[invalid=true]:focus:ring-state-danger
        '
    ]) }}
>
