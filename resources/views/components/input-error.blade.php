@props(['messages'])

@if ($messages)
    <ul
        {{ $attributes->merge([
            'class' => 'mt-2 text-md text-state-danger space-y-1',
            'role' => 'alert',
        ]) }}
    >
        @foreach ((array) $messages as $message)
            <li>{{ $message }}</li>
        @endforeach
    </ul>
@endif
