<button
    {{ $attributes->merge([
        'type' => 'button',
        'class' => '
            inline-flex items-center justify-center gap-2
            h-10 px-6
            bg-transparent text-fg-primary
            border border-border rounded-pill
            text-lg font-medium
            transition-colors duration-fast ease-standard
            hover:bg-surface-muted
            focus:outline-none focus-visible:ring-2 focus-visible:ring-surface-raised focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base
            disabled:opacity-50 disabled:pointer-events-none
        ',
    ]) }}
>
    {{ $slot }}
</button>
