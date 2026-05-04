<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Tambah Penyewa</h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-3xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
                <form method="POST" action="{{ route('admin.penyewa.store') }}" x-data="{ buatAkun: {{ old('buat_akun') ? 'true' : 'false' }} }">
                    @csrf

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="md:col-span-2">
                            <x-input-label for="nama_lengkap" value="Nama Lengkap" />
                            <x-text-input id="nama_lengkap" name="nama_lengkap" type="text"
                                          class="block mt-1 w-full" :value="old('nama_lengkap')" required autofocus />
                            <x-input-error :messages="$errors->get('nama_lengkap')" class="mt-2" />
                        </div>

                        <div>
                            <x-input-label for="no_hp" value="No. HP (WhatsApp)" />
                            <x-text-input id="no_hp" name="no_hp" type="tel"
                                          class="block mt-1 w-full" :value="old('no_hp')" placeholder="08xxxxxxxxxx" required />
                            <x-input-error :messages="$errors->get('no_hp')" class="mt-2" />
                        </div>

                        <div>
                            <x-input-label for="no_ktp" value="No. KTP (opsional)" />
                            <x-text-input id="no_ktp" name="no_ktp" type="text"
                                          class="block mt-1 w-full" :value="old('no_ktp')" maxlength="30" />
                            <x-input-error :messages="$errors->get('no_ktp')" class="mt-2" />
                        </div>

                        <div class="md:col-span-2">
                            <x-input-label for="alamat_asal" value="Alamat Asal (opsional)" />
                            <textarea id="alamat_asal" name="alamat_asal" rows="2" maxlength="1000"
                                      class="block mt-1 w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-md shadow-sm">{{ old('alamat_asal') }}</textarea>
                            <x-input-error :messages="$errors->get('alamat_asal')" class="mt-2" />
                        </div>

                        <div class="md:col-span-2 border-t border-gray-200 dark:border-gray-700 pt-4">
                            <label class="inline-flex items-center gap-2">
                                <input type="checkbox" name="buat_akun" value="1" x-model="buatAkun"
                                       class="rounded border-gray-300 dark:border-gray-700 text-indigo-600 focus:ring-indigo-500">
                                <span class="text-sm text-gray-700 dark:text-gray-300">Sekaligus buat akun login penyewa</span>
                            </label>
                        </div>

                        <template x-if="buatAkun">
                            <div class="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <x-input-label for="email" value="Email login" />
                                    <x-text-input id="email" name="email" type="email" class="block mt-1 w-full" :value="old('email')" />
                                    <x-input-error :messages="$errors->get('email')" class="mt-2" />
                                </div>
                                <div>
                                    <x-input-label for="password" value="Password awal" />
                                    <x-text-input id="password" name="password" type="text" class="block mt-1 w-full font-mono" :value="old('password')" />
                                    <p class="mt-1 text-xs text-gray-500">Catat & berikan ke penyewa — bisa diganti sendiri nanti.</p>
                                    <x-input-error :messages="$errors->get('password')" class="mt-2" />
                                </div>
                            </div>
                        </template>
                    </div>

                    <div class="flex items-center gap-3 mt-6">
                        <x-primary-button>Tambah Penyewa</x-primary-button>
                        <a href="{{ route('admin.penyewa.index') }}" class="text-sm text-gray-600 dark:text-gray-400 hover:underline">Batal</a>
                    </div>
                </form>
            </div>
        </div>
    </div>
</x-app-layout>
