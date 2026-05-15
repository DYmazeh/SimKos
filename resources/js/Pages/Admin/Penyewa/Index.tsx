import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import type { PageProps } from '@/types/inertia';

type PenyewaRow = {
    id: number;
    nama_lengkap: string;
    no_ktp: string | null;
    no_hp: string;
    kamar_aktif: string | null;
    periode_sewa: string | null;
    status_aktif: 'aktif' | 'nonaktif';
    punya_akun: boolean;
};

type IndexProps = PageProps<{
    penyewa: PenyewaRow[];
    filters: { q: string };
    pagination: { current_page: number; last_page: number; total: number; from: number; to: number };
}>;

export default function PenyewaIndex() {
    const { props } = usePage<IndexProps>();
    const { penyewa, filters, pagination } = props;
    const [q, setQ] = useState(filters.q || '');

    useEffect(() => {
        const t = setTimeout(() => {
            router.get(route('admin.penyewa.index'), { q }, { preserveState: true, preserveScroll: true, replace: true });
        }, 350);
        return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q]);

    const onDelete = (p: PenyewaRow) => {
        if (!confirm(`Hapus penyewa ${p.nama_lengkap}?`)) return;
        router.delete(route('admin.penyewa.destroy', p.id));
    };

    return (
        <AdminLayout title="Manajemen Penyewa">
            <Head title="Manajemen Penyewa" />

            {/* Toolbar */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 240, maxWidth: 480 }}>
                    <span style={{ position: 'absolute', left: 14, top: 12, color: '#94A3B8' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                    </span>
                    <input type="search" placeholder="Cari nama atau NIK penyewa..."
                        value={q} onChange={(e) => setQ(e.target.value)}
                        style={{ width: '100%', height: 42, paddingLeft: 40, paddingRight: 14, borderRadius: 10, border: '1px solid #E5E7EB', fontSize: 14, background: 'white' }} />
                </div>
                <Link href={route('admin.penyewa.create')}
                    style={{
                        marginLeft: 'auto',
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '11px 18px', background: '#2563EB', color: 'white',
                        borderRadius: 10, fontSize: 14, fontWeight: 600,
                    }}>
                    + Tambah Penyewa
                </Link>
            </div>

            {/* Table */}
            <div style={{ background: 'white', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ overflow: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                        <thead>
                            <tr style={{ background: '#F8FAFC' }}>
                                {['No', 'Nama Penyewa', 'NIK', 'No HP', 'Kamar', 'Kontrak', 'Status', 'Aksi'].map((h, i) => (
                                    <th key={h} style={{
                                        padding: '14px 20px', textAlign: i === 7 ? 'center' : 'left',
                                        fontSize: 11, fontWeight: 600, color: '#64748B',
                                        textTransform: 'uppercase', letterSpacing: '0.05em',
                                    }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {penyewa.length === 0 ? (
                                <tr>
                                    <td colSpan={8} style={{ padding: 48, textAlign: 'center', color: '#94A3B8' }}>
                                        Tidak ada penyewa ditemukan.
                                    </td>
                                </tr>
                            ) : penyewa.map((p, i) => (
                                <tr key={p.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                                    <td style={{ padding: '14px 20px', color: '#94A3B8', fontSize: 13 }}>{String(pagination.from + i).padStart(2, '0')}</td>
                                    <td style={{ padding: '14px 20px', fontWeight: 500, color: '#0F172A' }}>{p.nama_lengkap}</td>
                                    <td style={{ padding: '14px 20px', color: '#475569', fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>{p.no_ktp ?? '—'}</td>
                                    <td style={{ padding: '14px 20px', color: '#475569', fontSize: 13 }}>{p.no_hp}</td>
                                    <td style={{ padding: '14px 20px' }}>
                                        {p.kamar_aktif ? (
                                            <span style={{
                                                display: 'inline-block', padding: '4px 12px',
                                                background: '#EFF6FF', color: '#2563EB',
                                                borderRadius: 8, fontSize: 12, fontWeight: 600,
                                            }}>{p.kamar_aktif}</span>
                                        ) : <span style={{ color: '#CBD5E1' }}>—</span>}
                                    </td>
                                    <td style={{ padding: '14px 20px', color: '#475569', fontSize: 12 }}>
                                        {p.periode_sewa ?? <span style={{ color: '#CBD5E1' }}>—</span>}
                                    </td>
                                    <td style={{ padding: '14px 20px' }}>
                                        <span style={{
                                            display: 'inline-block', padding: '4px 12px',
                                            background: p.status_aktif === 'aktif' ? '#DCFCE7' : '#F1F5F9',
                                            color: p.status_aktif === 'aktif' ? '#15803D' : '#64748B',
                                            borderRadius: 999, fontSize: 12, fontWeight: 600,
                                        }}>{p.status_aktif === 'aktif' ? 'Aktif' : 'Nonaktif'}</span>
                                    </td>
                                    <td style={{ padding: '14px 20px' }}>
                                        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                                            <Link href={route('admin.penyewa.show', p.id)}
                                                style={{ width: 30, height: 30, borderRadius: 8, background: '#EFF6FF', color: '#2563EB', display: 'grid', placeItems: 'center' }}
                                                aria-label="Lihat">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>
                                            </Link>
                                            <Link href={route('admin.penyewa.edit', p.id)}
                                                style={{ width: 30, height: 30, borderRadius: 8, background: '#EFF6FF', color: '#2563EB', display: 'grid', placeItems: 'center' }}
                                                aria-label="Edit">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                            </Link>
                                            <button onClick={() => onDelete(p)}
                                                style={{ width: 30, height: 30, borderRadius: 8, background: '#FEF3C7', color: '#D97706', display: 'grid', placeItems: 'center', border: 0, cursor: 'pointer' }}
                                                aria-label="Hapus">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10" /></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer / pagination */}
                {penyewa.length > 0 && (
                    <div style={{ padding: '16px 20px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                        <div style={{ fontSize: 13, color: '#64748B' }}>
                            Menampilkan {pagination.from} sampai {pagination.to} dari {pagination.total} entri
                        </div>
                        <div style={{ display: 'flex', gap: 4 }}>
                            <button disabled={pagination.current_page <= 1}
                                onClick={() => router.get(route('admin.penyewa.index'), { q, page: pagination.current_page - 1 }, { preserveScroll: true })}
                                style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E5E7EB', background: 'white', cursor: 'pointer' }}>‹</button>
                            {Array.from({ length: Math.min(pagination.last_page, 4) }).map((_, i) => {
                                const page = i + 1;
                                const active = page === pagination.current_page;
                                return (
                                    <button key={page}
                                        onClick={() => router.get(route('admin.penyewa.index'), { q, page }, { preserveScroll: true })}
                                        style={{
                                            width: 32, height: 32, borderRadius: 8,
                                            border: active ? 0 : '1px solid #E5E7EB',
                                            background: active ? '#2563EB' : 'white',
                                            color: active ? 'white' : '#475569',
                                            fontWeight: active ? 600 : 500,
                                            cursor: 'pointer', fontSize: 13,
                                        }}>{page}</button>
                                );
                            })}
                            {pagination.last_page > 4 && (
                                <>
                                    <span style={{ padding: '4px 6px', color: '#94A3B8' }}>…</span>
                                    <button onClick={() => router.get(route('admin.penyewa.index'), { q, page: pagination.last_page }, { preserveScroll: true })}
                                        style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E5E7EB', background: 'white', cursor: 'pointer' }}>
                                        {pagination.last_page}
                                    </button>
                                </>
                            )}
                            <button disabled={pagination.current_page >= pagination.last_page}
                                onClick={() => router.get(route('admin.penyewa.index'), { q, page: pagination.current_page + 1 }, { preserveScroll: true })}
                                style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E5E7EB', background: 'white', cursor: 'pointer' }}>›</button>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
