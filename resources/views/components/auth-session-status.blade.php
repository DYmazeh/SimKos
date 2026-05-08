@props(['status'])

@if ($status)
    <div
        {{ $attributes->merge([
            'class' => 'mb-5 px-5 py-3 rounded-xs border border-state-success/40 bg-state-success/15 text-md text-fg-secondary',
            'role' => 'status',
        ]) }}
    >
        {{ $status }}
    </div>
@endif
