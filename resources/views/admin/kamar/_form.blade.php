@csrf
<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
        <x-input-label for="nomor_kamar" value="Nomor Kamar" />
        <x-text-input id="nomor_kamar" name="nomor_kamar" type="text"
                      class="block mt-1 w-full"
                      :value="old('nomor_kamar', $kamar->nomor_kamar)"
                      required maxlength="20" autofocus />
        <x-input-error :messages="$errors->get('nomor_kamar')" class="mt-2" />
    </div>

    <div>
        <x-input-label for="tipe" value="Tipe" />
        <select id="tipe" name="tipe" required
                class="block mt-1 w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm">
            @foreach (['standar' => 'Standar', 'deluxe' => 'Deluxe', 'vip' => 'VIP'] as $val => $label)
                <option value="{{ $val }}" @selected(old('tipe', $kamar->tipe) === $val)>{{ $label }}</option>
            @endforeach
        </select>
        <x-input-error :messages="$errors->get('tipe')" class="mt-2" />
    </div>

    <div>
        <x-input-label for="harga_bulanan" value="Harga / Bulan (Rp)" />
        <x-text-input id="harga_bulanan" name="harga_bulanan" type="number" min="0"
                      class="block mt-1 w-full"
                      :value="old('harga_bulanan', $kamar->harga_bulanan)"
                      required />
        <x-input-error :messages="$errors->get('harga_bulanan')" class="mt-2" />
    </div>

    <div>
        <x-input-label for="status" value="Status" />
        <select id="status" name="status" required
                class="block mt-1 w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm">
            @foreach (['tersedia' => 'Tersedia', 'terisi' => 'Terisi', 'maintenance' => 'Maintenance'] as $val => $label)
                <option value="{{ $val }}" @selected(old('status', $kamar->status) === $val)>{{ $label }}</option>
            @endforeach
        </select>
        <x-input-error :messages="$errors->get('status')" class="mt-2" />
    </div>

    <div class="md:col-span-2">
        <x-input-label for="deskripsi" value="Deskripsi (opsional)" />
        <textarea id="deskripsi" name="deskripsi" rows="3" maxlength="1000"
                  class="block mt-1 w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm">{{ old('deskripsi', $kamar->deskripsi) }}</textarea>
        <x-input-error :messages="$errors->get('deskripsi')" class="mt-2" />
    </div>
</div>

<div class="flex items-center gap-3 mt-6">
    <x-primary-button>{{ $submitLabel ?? 'Simpan' }}</x-primary-button>
    <a href="{{ route('admin.kamar.index') }}"
       class="text-sm text-gray-600 dark:text-gray-400 hover:underline">Batal</a>
</div>
