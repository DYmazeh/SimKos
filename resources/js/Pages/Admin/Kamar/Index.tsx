import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Icon, formatRp } from '@/components/ui';
import type { PageProps } from '@/types/inertia';

type Kamar = {
    id: number;
    nomor_kamar: string;
    tipe: string;
    harga_bulanan: number;
    status: 'tersedia' | 'terisi' | 'maintenance';
    deskripsi: string | null;
    fasilitas: string[];
    luas_m2: number | null;
    lantai: number | null;
    foto: Array<{ id: number; url: string }>;
};

type IndexProps = PageProps<{
    kamar: Kamar[];
    filters: { q: string; status: string; tipe: string };
}>;

const statusMeta: Record<Kamar['status'], { label: string; color: string; bg: string }> = {
    tersedia: { label: 'Kosong', color: '#15803D', bg: '#10B981' },
    terisi: { label: 'Terisi', color: '#15803D', bg: '#10B981' },
    maintenance: { label: 'Maintenance', color: '#92400E', bg: '#F59E0B' },
};

const fasilitasIcons: Record<string, JSX.Element> = {
    'WiFi': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14 0M2 8.82a16 16 0 0 1 20 0M8.5 16.43a6 6 0 0 1 7 0" /><circle cx="12" cy="20" r="0.5" fill="currentColor" /></svg>,
    'AC': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" /></svg>,
    'KM Dalam': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6a3 3 0 1 1 6 0M4 11h16v8a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z" /></svg>,
    'Kasur': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18V8M21 18v-5a3 3 0 0 0-3-3H3M3 14h18M3 18h18" /><circle cx="7.5" cy="11.5" r="1.5" /></svg>,
    'Meja': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8h18M3 20l3-12M21 20l-3-12M7 14h10" /></svg>,
    'Lemari': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="5" y="3" width="14" height="18" rx="1" /><path d="M5 12h14M10 7v2M10 17v2" /></svg>,
};

export default function KamarIndex() {
    const { props } = usePage<IndexProps>();
    const { kamar, filters } = props;
    const [q, setQ] = useState(filters.q || '');
    const [status, setStatus] = useState(filters.status || '');
    const [tipe, setTipe] = useState(filters.tipe || '');

    useEffect(() => {
        const t = setTimeout(() => {
            router.get(route('admin.kamar.index'), { q, status, tipe }, {
                preserveState: true, preserveScroll: true, replace: true,
            });
        }, 350);
        return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q, status, tipe]);

    const onDelete = (k: Kamar) => {
        if (!confirm(`Hapus kamar ${k.nomor_kamar}?`)) return;
        router.delete(route('admin.kamar.destroy', k.id));
    };

    return (
        <AdminLayout title="Manajemen Kamar">
            <Head title="Manajemen Kamar" />

            {/* Toolbar */}
            <div style={{ background: 'white', borderRadius: 14, padding: 16, marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
                    <span style={{ position: 'absolute', left: 14, top: 12, color: '#94A3B8' }}>
                        <Icon name="map-pin" size={16} />
                    </span>
                    <input type="search" placeholder="Cari nomor kamar, tipe, atau status..."
                        value={q} onChange={(e) => setQ(e.target.value)}
                        style={{ width: '100%', height: 42, paddingLeft: 40, paddingRight: 14, borderRadius: 10, border: '1px solid #E5E7EB', fontSize: 14, background: '#F8FAFC' }} />
                </div>
                <select value={status} onChange={(e) => setStatus(e.target.value)}
                    style={{ height: 42, padding: '0 14px', borderRadius: 10, border: '1px solid #E5E7EB', fontSize: 14, background: 'white', color: '#475569' }}>
                    <option value="">Semua Status</option>
                    <option value="tersedia">Kosong</option>
                    <option value="terisi">Terisi</option>
                    <option value="maintenance">Maintenance</option>
                </select>
                <select value={tipe} onChange={(e) => setTipe(e.target.value)}
                    style={{ height: 42, padding: '0 14px', borderRadius: 10, border: '1px solid #E5E7EB', fontSize: 14, background: 'white', color: '#475569' }}>
                    <option value="">Semua Tipe</option>
                    <option value="standar">Standar</option>
                    <option value="deluxe">Deluxe</option>
                    <option value="vip">VIP</option>
                </select>
                <Link href={route('admin.kamar.create')}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '11px 18px', background: '#2563EB', color: 'white',
                        borderRadius: 10, fontSize: 14, fontWeight: 600,
                    }}>
                    + Tambah Kamar
                </Link>
            </div>

            {/* Grid */}
            {kamar.length === 0 ? (
                <div style={{ background: 'white', borderRadius: 14, padding: 64, textAlign: 'center', color: '#94A3B8', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    Belum ada kamar dengan filter ini.{' '}
                    <Link href={route('admin.kamar.create')} style={{ color: '#2563EB', fontWeight: 500 }}>Tambah sekarang →</Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 16 }}>
                    {kamar.map((k) => (
                        <KamarCard key={k.id} kamar={k} onDelete={onDelete} />
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}

const KamarCard = ({ kamar, onDelete }: { kamar: Kamar; onDelete: (k: Kamar) => void }) => {
    const meta = statusMeta[kamar.status];
    const isTerisi = kamar.status === 'terisi';

    return (
        <div style={{ background: 'white', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
            {/* Foto */}
            <Link href={route('admin.kamar.show', kamar.id)}
                style={{ display: 'block', height: 160, position: 'relative', background: '#F1F5F9' }}>
                {kamar.foto.length > 0 ? (
                    <img src={kamar.foto[0].url} alt={`Kamar ${kamar.nomor_kamar}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: '#CBD5E1' }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M3 18V8M21 18v-5a3 3 0 0 0-3-3H3M3 14h18M3 18h18" /><circle cx="7.5" cy="11.5" r="1.5" />
                        </svg>
                    </div>
                )}
                <div style={{
                    position: 'absolute', top: 10, left: 10,
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '4px 10px',
                    background: 'rgba(255,255,255,0.95)',
                    borderRadius: 999, fontSize: 11, fontWeight: 600,
                    color: meta.color,
                }}>
                    <span style={{ width: 6, height: 6, borderRadius: 999, background: meta.bg }} />
                    {meta.label}
                </div>
            </Link>

            {/* Info */}
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0F172A' }}>Kamar {kamar.nomor_kamar}</h3>
                        <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>
                                {formatRp(kamar.harga_bulanan)}
                            </span>
                            <span style={{ fontSize: 11, color: '#94A3B8', marginLeft: 2 }}>/bln</span>
                        </div>
                    </div>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                        Tipe {kamar.tipe.charAt(0).toUpperCase() + kamar.tipe.slice(1)}
                    </div>
                </div>

                {/* Fasilitas icons */}
                {kamar.fasilitas.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, color: '#2563EB' }}>
                        {kamar.fasilitas.slice(0, 5).map((f, i) => (
                            <span key={i} title={f}>
                                {fasilitasIcons[f] ?? <span style={{ fontSize: 10, padding: '2px 6px', background: '#EFF6FF', borderRadius: 4 }}>{f}</span>}
                            </span>
                        ))}
                    </div>
                )}

                {/* Footer */}
                <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {isTerisi ? (
                        <span style={{ fontSize: 12, color: '#475569' }}>
                            👤 Terisi
                        </span>
                    ) : (
                        <span style={{ fontSize: 12, color: '#94A3B8' }}>
                            Tersedia untuk disewa
                        </span>
                    )}
                    <div style={{ display: 'flex', gap: 6 }}>
                        <Link href={route('admin.kamar.edit', kamar.id)}
                            style={{
                                width: 30, height: 30, borderRadius: 8,
                                background: '#EFF6FF', color: '#2563EB',
                                display: 'grid', placeItems: 'center',
                            }} aria-label="Edit">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                        </Link>
                        <button onClick={() => onDelete(kamar)}
                            style={{
                                width: 30, height: 30, borderRadius: 8,
                                background: '#FEE2E2', color: '#EF4444',
                                display: 'grid', placeItems: 'center',
                                border: 0, cursor: 'pointer',
                            }} aria-label="Hapus">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
