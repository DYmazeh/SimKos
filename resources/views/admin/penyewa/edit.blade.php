<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Edit Penyewa — {{ $penyewa->nama_lengkap }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-3xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
                <form method="POST" action="{{ route('admin.penyewa.update', $penyewa) }}">
                    @csrf @method('PUT')

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="md:col-span-2">
                            <x-input-label for="nama_lengkap" value="Nama Lengkap" />
                            <x-text-input id="nama_lengkap" name="nama_lengkap" type="text"
                                          class="block mt-1 w-full" :value="old('nama_lengkap', $penyewa->nama_lengkap)" required autofocus />
                            <x-input-error :messages="$errors->get('nama_lengkap')" class="mt-2" />
                        </div>

                        <div>
                            <x-input-label for="no_hp" value="No. HP" />
                            <x-text-input id="no_hp" name="no_hp" type="tel"
                                          class="block mt-1 w-full" :value="old('no_hp', $penyewa->no_hp)" required />
                            <x-input-error :messages="$errors->get('no_hp')" class="mt-2" />
                        </div>

                        <div>
                            <x-input-label for="no_ktp" value="No. KTP" />
                            <x-text-input id="no_ktp" name="no_ktp" type="text"
                                          class="block mt-1 w-full" :value="old('no_ktp', $penyewa->no_ktp)" maxlength="30" />
                            <x-input-error :messages="$errors->get('no_ktp')" class="mt-2" />
                        </div>

                        <div class="md:col-span-2">
                            <x-input-label for="alamat_asal" value="Alamat Asal" />
                            <textarea id="alamat_asal" name="alamat_asal" rows="2" maxlength="1000"
                                      class="block mt-1 w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-md shadow-sm">{{ old('alamat_asal', $penyewa->alamat_asal) }}</textarea>
                            <x-input-error :messages="$errors->get('alamat_asal')" class="mt-2" />
                        </div>
                    </div>

                    <div class="flex items-center gap-3 mt-6">
                        <x-primary-button>Simpan Perubahan</x-primary-button>
                        <a href="{{ route('admin.penyewa.show', $penyewa) }}" class="text-sm text-gray-600 dark:text-gray-400 hover:underline">Batal</a>
                    </div>
                </form>
            </div>
        </div>
    </div>
</x-app-layout>
