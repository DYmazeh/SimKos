import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Icon, formatRp } from '@/components/ui';
import { confirmDialog } from '@/components/ConfirmDialog';
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
    komplen_aktif_count: number;
};

type Pagination = { current_page: number; last_page: number; total: number; from: number; to: number };

type IndexProps = PageProps<{
    kamar: Kamar[];
    pagination: Pagination;
    filters: { q: string; status: string; tipe: string };
}>;

const statusMeta: Record<Kamar['status'], { label: string; color: string; bg: string }> = {
    tersedia: { label: 'Kosong', color: '#8a6c10', bg: '#F59E0B' },
    terisi: { label: 'Terisi', color: '#176f44', bg: '#10B981' },
    maintenance: { label: 'Maintenance', color: '#475569', bg: '#94A3B8' },
};

/* Map fasilitas string → Icon name (sesuai Icon enum di ui.tsx) */
const fasilitasIcon = (label: string): React.ComponentProps<typeof Icon>['name'] => {
    const key = label.toLowerCase();
    if (key.includes('wifi')) return 'wifi';
    if (key.includes('ac')) return 'ac';
    if (key.includes('km') || key.includes('kamar mandi') || key.includes('toilet')) return 'toilet';
    if (key.includes('kasur') || key.includes('bed')) return 'bed';
    if (key.includes('meja') || key.includes('desk')) return 'desk';
    if (key.includes('lemari') || key.includes('closet')) return 'closet';
    if (key.includes('parkir')) return 'parking';
    if (key.includes('kipas') || key.includes('fan')) return 'fan';
    return 'info';
};

export default function KamarIndex() {
    const { props } = usePage<IndexProps>();
    const { kamar, filters, pagination } = props;
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

    const onDelete = async (k: Kamar) => {
        const ok = await confirmDialog({
            title: `Hapus kamar ${k.nomor_kamar}?`,
            description: 'Riwayat sewa terkait kamar ini akan ikut terhapus. Tindakan ini bisa dibatalkan dari log audit dalam 30 hari.',
            tone: 'danger',
            confirmLabel: 'Ya, hapus',
        });
        if (!ok) return;
        router.delete(route('admin.kamar.destroy', k.id));
    };

    return (
        <AdminLayout title="Manajemen Kamar">
            <Head title="Manajemen Kamar" />

            {/* Toolbar */}
            <div style={{ background: 'white', borderRadius: 14, padding: 16, marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', border: '1px solid rgba(11,13,26,0.06)' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
                    <span style={{ position: 'absolute', left: 14, top: 12, color: 'var(--ink-400)' }}>
                        <Icon name="search" size={16} />
                    </span>
                    <input type="search" placeholder="Cari nomor kamar..."
                        value={q} onChange={(e) => setQ(e.target.value)}
                        style={{ width: '100%', height: 42, paddingLeft: 40, paddingRight: 14, borderRadius: 10, border: '1px solid #E5E7EB', fontSize: 14, background: 'var(--ink-50)' }} />
                </div>
                <select value={status} onChange={(e) => setStatus(e.target.value)}
                    style={{ height: 42, padding: '0 14px', borderRadius: 10, border: '1px solid #E5E7EB', fontSize: 14, background: 'white', color: 'var(--ink-700)' }}>
                    <option value="">Semua Status</option>
                    <option value="tersedia">Kosong</option>
                    <option value="terisi">Terisi</option>
                    <option value="maintenance">Maintenance</option>
                </select>
                <select value={tipe} onChange={(e) => setTipe(e.target.value)}
                    style={{ height: 42, padding: '0 14px', borderRadius: 10, border: '1px solid #E5E7EB', fontSize: 14, background: 'white', color: 'var(--ink-700)' }}>
                    <option value="">Semua Tipe</option>
                    <option value="standar">Standar</option>
                    <option value="deluxe">Deluxe</option>
                    <option value="vip">VIP</option>
                </select>
                <Link href={route('admin.kamar.create')} className="btn btn-primary btn-sm">
                    <Icon name="plus" size={16} stroke={2.2} /> Tambah Kamar
                </Link>
            </div>

            {/* Grid */}
            {kamar.length === 0 ? (
                <div style={{ background: 'white', borderRadius: 14, padding: 64, textAlign: 'center', color: 'var(--ink-400)', border: '1px solid rgba(11,13,26,0.06)' }}>
                    Belum ada kamar dengan filter ini.{' '}
                    <Link href={route('admin.kamar.create')} style={{ color: 'var(--blue-600)', fontWeight: 500 }}>Tambah sekarang →</Link>
                </div>
            ) : (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 16 }}>
                        {kamar.map((k) => (
                            <KamarCard key={k.id} kamar={k} onDelete={onDelete} />
                        ))}
                    </div>
                    {pagination.last_page > 1 && (
                        <div style={{
                            marginTop: 16, padding: 14, background: 'white', borderRadius: 12,
                            border: '1px solid rgba(11,13,26,0.06)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            flexWrap: 'wrap', gap: 12,
                        }}>
                            <div style={{ fontSize: 13, color: 'var(--ink-500)', fontVariantNumeric: 'tabular-nums' }}>
                                Menampilkan {pagination.from}–{pagination.to} dari {pagination.total} kamar
                            </div>
                            <div style={{ display: 'flex', gap: 4 }}>
                                <button disabled={pagination.current_page <= 1}
                                    onClick={() => router.get(route('admin.kamar.index'), { q, status, tipe, page: pagination.current_page - 1 }, { preserveScroll: true })}
                                    style={pageBtnStyle(pagination.current_page <= 1)} aria-label="Halaman sebelumnya">
                                    <Icon name="arrow-left" size={14} />
                                </button>
                                <button disabled={pagination.current_page >= pagination.last_page}
                                    onClick={() => router.get(route('admin.kamar.index'), { q, status, tipe, page: pagination.current_page + 1 }, { preserveScroll: true })}
                                    style={pageBtnStyle(pagination.current_page >= pagination.last_page)} aria-label="Halaman berikutnya">
                                    <Icon name="arrow-right" size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </AdminLayout>
    );
}

const pageBtnStyle = (disabled: boolean): React.CSSProperties => ({
    width: 44, height: 44, borderRadius: 10,
    border: '1px solid rgba(11,13,26,0.10)',
    background: 'white', color: disabled ? 'var(--ink-300)' : 'var(--ink-700)',
    display: 'grid', placeItems: 'center', cursor: disabled ? 'not-allowed' : 'pointer',
});

const KamarCard = ({ kamar, onDelete }: { kamar: Kamar; onDelete: (k: Kamar) => void }) => {
    const meta = statusMeta[kamar.status];
    const isTerisi = kamar.status === 'terisi';

    return (
        <div style={{
            background: 'white', borderRadius: 14, overflow: 'hidden',
            border: '1px solid rgba(11,13,26,0.06)',
            boxShadow: '0 1px 2px rgba(11,13,26,0.03)',
            display: 'flex', flexDirection: 'column',
            position: 'relative',
        }}>
            {/* Komplen badge */}
            {kamar.komplen_aktif_count > 0 && (
                <Link href={route('admin.kamar.show', kamar.id)}
                    style={{
                        position: 'absolute', top: 10, right: 10, zIndex: 2,
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '4px 10px',
                        background: 'rgba(210,68,50,0.95)', color: 'white',
                        borderRadius: 999, fontSize: 11, fontWeight: 600,
                        boxShadow: '0 2px 8px -2px rgba(210,68,50,0.5)',
                        textDecoration: 'none',
                    }}
                    title="Ada komplen aktif">
                    <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: 999, background: 'white' }} />
                    {kamar.komplen_aktif_count} komplen
                </Link>
            )}

            {/* Foto */}
            <Link href={route('admin.kamar.show', kamar.id)}
                style={{ display: 'block', height: 160, position: 'relative', background: 'var(--ink-50)' }}>
                {kamar.foto.length > 0 ? (
                    <img src={kamar.foto[0].url} alt={`Kamar ${kamar.nomor_kamar}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: 'var(--ink-300)' }}>
                        <Icon name="bed" size={40} stroke={1.5} />
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
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--ink-900)' }}>Kamar {kamar.nomor_kamar}</h3>
                        <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-900)' }}>
                                {formatRp(kamar.harga_bulanan)}
                            </span>
                            <span style={{ fontSize: 11, color: 'var(--ink-400)', marginLeft: 2 }}>/bln</span>
                        </div>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 2 }}>
                        Tipe {kamar.tipe.charAt(0).toUpperCase() + kamar.tipe.slice(1)}
                    </div>
                </div>

                {/* Fasilitas icons */}
                {kamar.fasilitas.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, color: 'var(--blue-600)' }}>
                        {kamar.fasilitas.slice(0, 5).map((f, i) => (
                            <span key={i} title={f} style={{ display: 'inline-flex', alignItems: 'center' }}>
                                <Icon name={fasilitasIcon(f)} size={14} />
                            </span>
                        ))}
                    </div>
                )}

                {/* Footer */}
                <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid rgba(11,13,26,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {isTerisi ? (
                        <span style={{ fontSize: 12, color: 'var(--ink-700)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                            <Icon name="user" size={13} /> Terisi
                        </span>
                    ) : (
                        <span style={{ fontSize: 12, color: 'var(--ink-400)' }}>
                            Tersedia untuk disewa
                        </span>
                    )}
                    <div style={{ display: 'flex', gap: 6 }}>
                        <Link href={route('admin.kamar.edit', kamar.id)}
                            style={{
                                width: 44, height: 44, borderRadius: 10,
                                background: 'var(--blue-50)', color: 'var(--blue-700)',
                                display: 'grid', placeItems: 'center',
                            }} aria-label="Edit">
                            <Icon name="edit" size={18} />
                        </Link>
                        <button onClick={() => onDelete(kamar)}
                            style={{
                                width: 44, height: 44, borderRadius: 10,
                                background: 'rgba(210,68,50,0.10)', color: 'var(--danger)',
                                display: 'grid', placeItems: 'center',
                                border: 0, cursor: 'pointer',
                            }} aria-label="Hapus">
                            <Icon name="trash" size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
