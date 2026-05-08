@props(['class' => ''])

{{-- SimKos brand mark — stitched square + pill row, inherits currentColor --}}
<svg
    {{ $attributes->merge(['class' => 'w-9 h-9 ' . $class]) }}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    role="presentation"
>
    <rect x="3" y="3" width="34" height="34" rx="10" fill="currentColor" opacity="0.12"/>
    <rect x="3.75" y="3.75" width="32.5" height="32.5" rx="9.25" stroke="currentColor" stroke-opacity="0.45" stroke-width="1.5"/>
    <circle cx="13.5" cy="20" r="2.5" fill="currentColor"/>
    <rect x="18" y="17.5" width="13.5" height="5" rx="2.5" fill="currentColor"/>
</svg>
