<?php

namespace App\Http\Controllers\Penyewa;

use App\Http\Controllers\Controller;
use App\Models\Tagihan;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class DashboardController extends Controller
{
    public function __invoke(): View
    {
        $user = Auth::user();
        $penyewa = $user->penyewa()->with(['sewaAktif.kamar'])->first();

        $tagihan = collect();
        if ($penyewa) {
            $tagihan = Tagihan::query()
                ->whereHas('sewa', fn ($q) => $q->where('penyewa_id', $penyewa->id))
                ->with(['sewa.kamar', 'pembayaran' => fn ($q) => $q->latest()])
                ->orderBy('periode', 'desc')
                ->limit(12)
                ->get();
        }

        return view('penyewa.dashboard', compact('penyewa', 'tagihan'));
    }
}
