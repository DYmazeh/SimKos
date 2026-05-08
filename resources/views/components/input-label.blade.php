@props(['value' => null])

<label {{ $attributes->merge(['class' => 'block text-md font-medium text-fg-primary mb-2']) }}>
    {{ $value ?? $slot }}
</label>
