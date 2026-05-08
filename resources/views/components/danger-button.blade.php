<button
    {{ $attributes->merge([
        'type' => 'submit',
        'class' => '
            inline-flex items-center justify-center gap-2
            h-10 px-6
            bg-state-danger text-fg-secondary
            rounded-pill text-lg font-medium
            transition-all duration-fast ease-standard
            hover:-translate-y-px
            active:translate-y-0
            focus:outline-none focus-visible:ring-2 focus-visible:ring-state-danger focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base
            disabled:opacity-50 disabled:pointer-events-none
        ',
    ]) }}
>
    {{ $slot }}
</button>
