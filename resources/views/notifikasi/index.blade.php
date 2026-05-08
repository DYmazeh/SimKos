<x-app-layout>
    <x-slot name="header">
        <div class="flex items-center justify-between">
            <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                🔔 Notifikasi
            </h2>
            @if ($notifikasi->where('is_read', false)->count() > 0)
                <form action="{{ route('notifikasi.readAll') }}" method="POST">
                    @csrf
                    <button type="submit" class="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                        Tandai semua sudah dibaca
                    </button>
                </form>
            @endif
        </div>
    </x-slot>

    <div class="py-12">
        <div class="max-w-4xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">

                @if ($notifikasi->isEmpty())
                    <div class="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        Belum ada notifikasi.
                    </div>
                @else
                    <ul class="divide-y divide-gray-100 dark:divide-gray-700">
                        @foreach ($notifikasi as $notif)
                            <li @class([
                                'p-4 flex items-start gap-3 transition hover:bg-gray-50 dark:hover:bg-gray-700/30',
                                'bg-indigo-50/50 dark:bg-indigo-900/10' => !$notif->is_read,
                            ])>
                                {{-- Icon --}}
                                <div @class([
                                    'mt-0.5 w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0',
                                    'bg-blue-100 text-blue-600' => $notif->tipe === 'pembayaran',
                                    'bg-amber-100 text-amber-600' => $notif->tipe === 'tagihan',
                                    'bg-emerald-100 text-emerald-600' => $notif->tipe === 'kontrak',
                                    'bg-gray-100 text-gray-600' => $notif->tipe === 'sistem',
                                ])>
                                    @if ($notif->tipe === 'pembayaran') 💰
                                    @elseif ($notif->tipe === 'tagihan') 📋
                                    @elseif ($notif->tipe === 'kontrak') 📝
                                    @else ⚙️
                                    @endif
                                </div>

                                {{-- Content --}}
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-start justify-between">
                                        <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {{ $notif->judul }}
                                            @unless ($notif->is_read)
                                                <span class="inline-block w-2 h-2 bg-indigo-500 rounded-full ml-1"></span>
                                            @endunless
                                        </p>
                                        <span class="text-xs text-gray-400 whitespace-nowrap ml-2">{{ $notif->created_at->diffForHumans() }}</span>
                                    </div>
                                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{{ $notif->pesan }}</p>

                                    @unless ($notif->is_read)
                                        <form action="{{ route('notifikasi.read', $notif) }}" method="POST" class="mt-2">
                                            @csrf @method('PATCH')
                                            <button type="submit" class="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                                                {{ $notif->url_referensi ? 'Lihat detail →' : 'Tandai dibaca' }}
                                            </button>
                                        </form>
                                    @else
                                        @if ($notif->url_referensi)
                                            <a href="{{ $notif->url_referensi }}" class="text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-2 inline-block">Lihat detail →</a>
                                        @endif
                                    @endunless
                                </div>
                            </li>
                        @endforeach
                    </ul>

                    <div class="p-4">
                        {{ $notifikasi->links() }}
                    </div>
                @endif
            </div>
        </div>
    </div>
</x-app-layout>
