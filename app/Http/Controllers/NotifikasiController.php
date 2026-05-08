<?php

namespace App\Http\Controllers;

use App\Models\Notifikasi;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class NotifikasiController extends Controller
{
    public function index(Request $request): View
    {
        $notifikasi = $request->user()
            ->notifikasi()
            ->paginate(20);

        return view('notifikasi.index', compact('notifikasi'));
    }

    public function markRead(Request $request, Notifikasi $notifikasi): RedirectResponse
    {
        // Pastikan notifikasi milik user yang sedang login
        if ($notifikasi->user_id !== $request->user()->id) {
            abort(403);
        }

        $notifikasi->update(['is_read' => true]);

        if ($notifikasi->url_referensi) {
            return redirect($notifikasi->url_referensi);
        }

        return back();
    }

    public function markAllRead(Request $request): RedirectResponse
    {
        $request->user()
            ->notifikasi()
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return back()->with('success', 'Semua notifikasi ditandai sudah dibaca.');
    }
}
