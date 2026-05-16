import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Icon, Pill, formatRp } from '@/components/ui';
import { confirmDialog } from '@/components/ConfirmDialog';
import type { PageProps } from '@/types/inertia';

type KamarDetail = {
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
    peraturan: string | null;
    deposit: number;
    min_sewa_bulan: number;
};

type RiwayatItem = {
    id: number;
    penyewa_nama: string;
    periode: string;
    status: string;
    jumlah_tagihan: number;
};

type KomplenItem = {
    id: number;
    penyewa_nama: string;
    judul: string;
    deskripsi: string;
    status: 'menunggu' | 'diproses' | 'selesai';
    created_at: string;
    resolved_at: string | null;
    foto: Array<{ id: number; url: string }>;
};

type ShowProps = PageProps<{
    kamar: KamarDetail;
    riwayatSewa: RiwayatItem[];
    komplenList: KomplenItem[];
}>;

const statusKamarMeta = (status: string): { label: string; tone: 'success' | 'warning' | 'neutral' } => {
    if (status === 'terisi') return { label: 'Terisi', tone: 'success' };
    if (status === 'tersedia') return { label: 'Kosong', tone: 'warning' };
    return { label: 'Maintenance', tone: 'neutral' };
};

const sewaStatusTone = (status: string): 'success' | 'neutral' | 'warning' => {
    if (status === 'aktif') return 'success';
    if (status === 'dibatalkan') return 'warning';
    return 'neutral';
};

const komplenTone = (status: KomplenItem['status']): 'warning' | 'info' | 'success' => {
    if (status === 'menunggu') return 'warning';
    if (status === 'diproses') return 'info';
    return 'success';
};

const komplenLabel = (status: KomplenItem['status']) => {
    if (status === 'menunggu') return 'Menunggu';
    if (status === 'diproses') return 'Diproses';
    return 'Selesai';
};

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

const fmt = (s: string) => new Date(s).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

export default function KamarShow() {
    const { props } = usePage<ShowProps>();
    const { kamar, riwayatSewa, komplenList } = props;
    const [activeFoto, setActiveFoto] = useState(0);
    const mainFoto = kamar.foto[activeFoto] ?? null;
    const statusMeta = statusKamarMeta(kamar.status);

    const onDelete = async () => {
        const ok = await confirmDialog({
            title: `Hapus kamar ${kamar.nomor_kamar}?`,
            description: 'Kamar di-soft-delete — bisa di-restore dari halaman audit log dalam 30 hari.',
            tone: 'danger',
            confirmLabel: 'Ya, hapus',
        });
        if (!ok) return;
        router.delete(route('admin.kamar.destroy', kamar.id));
    };

    const onUpdateKomplenStatus = (komplen: KomplenItem, nextStatus: 'diproses' | 'selesai') => {
        router.patch(route('admin.komplain.update-status', komplen.id), { status: nextStatus }, { preserveScroll: true });
    };

    return (
        <AdminLayout title="Manajemen Kamar">
            <Head title={`Kamar ${kamar.nomor_kamar}`} />

            {/* ───── Header: breadcrumb + back button ───── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
                <nav aria-label="Breadcrumb" style={{ fontSize: 13, color: 'var(--ink-500)' }}>
                    <Link href={route('admin.kamar.index')} style={{ color: 'var(--ink-500)' }}>Manajemen Kamar</Link>
                    <span style={{ color: 'var(--ink-300)', margin: '0 8px' }}>/</span>
                    <span style={{ color: 'var(--blue-600)', fontWeight: 500 }}>Detail Kamar</span>
                </nav>
                <Link href={route('admin.kamar.index')} className="btn btn-ghost btn-sm">
                    <Icon name="arrow-left" size={14} /> Kembali
                </Link>
            </div>

            {/* ───── Hero: gallery + info ───── */}
            <div className="kamar-hero" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, marginBottom: 20 }}>
                {/* Galeri */}
                <div style={{
                    background: 'white', borderRadius: 14, padding: 14,
                    border: '1px solid rgba(11,13,26,0.06)',
                    boxShadow: '0 1px 2px rgba(11,13,26,0.03)',
                }}>
                    <div style={{
                        aspectRatio: '4/3', borderRadius: 10, overflow: 'hidden',
                        background: 'var(--ink-50)', marginBottom: 10, position: 'relative',
                    }}>
                        {mainFoto ? (
                            <img src={mainFoto.url} alt={`Foto kamar ${kamar.nomor_kamar}`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: 'var(--ink-300)' }}>
                                <Icon name="bed" size={64} stroke={1.4} />
                            </div>
                        )}
                        {/* Carousel arrows */}
                        {kamar.foto.length > 1 && (
                            <>
                                <button onClick={() => setActiveFoto((i) => (i - 1 + kamar.foto.length) % kamar.foto.length)}
                                    aria-label="Foto sebelumnya"
                                    style={{
                                        position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                                        width: 36, height: 36, borderRadius: 999,
                                        background: 'rgba(255,255,255,0.9)', border: 0, cursor: 'pointer',
                                        display: 'grid', placeItems: 'center', backdropFilter: 'blur(6px)',
                                    }}>
                                    <Icon name="arrow-left" size={16} />
                                </button>
                                <button onClick={() => setActiveFoto((i) => (i + 1) % kamar.foto.length)}
                                    aria-label="Foto berikutnya"
                                    style={{
                                        position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                                        width: 36, height: 36, borderRadius: 999,
                                        background: 'rgba(255,255,255,0.9)', border: 0, cursor: 'pointer',
                                        display: 'grid', placeItems: 'center', backdropFilter: 'blur(6px)',
                                    }}>
                                    <Icon name="arrow-right" size={16} />
                                </button>
                            </>
                        )}
                    </div>
                    {kamar.foto.length > 1 && (
                        <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
                            {kamar.foto.map((f, i) => (
                                <button key={f.id} onClick={() => setActiveFoto(i)}
                                    style={{
                                        width: 80, height: 60,
                                        borderRadius: 8, overflow: 'hidden',
                                        border: i === activeFoto ? '2px solid var(--blue-600)' : '2px solid transparent',
                                        cursor: 'pointer', padding: 0, background: 'transparent',
                                        flexShrink: 0,
                                    }}>
                                    <img src={f.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div style={{
                    background: 'white', borderRadius: 14, padding: 26,
                    border: '1px solid rgba(11,13,26,0.06)',
                    boxShadow: '0 1px 2px rgba(11,13,26,0.03)',
                    display: 'flex', flexDirection: 'column',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: 'var(--ink-900)', letterSpacing: '-0.02em' }}>
                                Kamar {kamar.nomor_kamar}
                            </h2>
                            <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                                <Pill tone="info">{kamar.tipe.toUpperCase()}</Pill>
                                <Pill tone={statusMeta.tone}>{statusMeta.label}</Pill>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right', flex: '0 0 auto' }}>
                            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink-900)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
                                {formatRp(kamar.harga_bulanan)}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--ink-400)' }}>/ bulan</div>
                        </div>
                    </div>

                    {/* Spec */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
                        <div style={{ padding: 12, background: 'var(--ink-50)', borderRadius: 10, border: '1px solid rgba(11,13,26,0.04)' }}>
                            <div style={{ fontSize: 10.5, color: 'var(--ink-400)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Lantai</div>
                            <div style={{ fontSize: 16, fontWeight: 600, marginTop: 4, color: 'var(--ink-900)' }}>{kamar.lantai ?? '—'}</div>
                        </div>
                        <div style={{ padding: 12, background: 'var(--ink-50)', borderRadius: 10, border: '1px solid rgba(11,13,26,0.04)' }}>
                            <div style={{ fontSize: 10.5, color: 'var(--ink-400)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Luas</div>
                            <div style={{ fontSize: 16, fontWeight: 600, marginTop: 4, color: 'var(--ink-900)' }}>{kamar.luas_m2 ? `${kamar.luas_m2} m²` : '—'}</div>
                        </div>
                    </div>

                    {/* Fasilitas */}
                    {kamar.fasilitas.length > 0 && (
                        <div style={{ marginTop: 18 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-900)', marginBottom: 8 }}>Fasilitas Kamar</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {kamar.fasilitas.map((f, i) => (
                                    <span key={i} style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 6,
                                        padding: '6px 12px', borderRadius: 999,
                                        background: 'var(--blue-50)', color: 'var(--blue-700)',
                                        fontSize: 12.5, fontWeight: 500,
                                    }}>
                                        <Icon name={fasilitasIcon(f)} size={14} /> {f}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Deskripsi */}
                    {kamar.deskripsi && (
                        <div style={{ marginTop: 18 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-900)', marginBottom: 6 }}>Deskripsi</div>
                            <p style={{ margin: 0, fontSize: 13.5, color: 'var(--ink-700)', lineHeight: 1.65 }}>{kamar.deskripsi}</p>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 10, marginTop: 'auto', paddingTop: 20 }}>
                        <Link href={route('admin.kamar.edit', kamar.id)} className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                            <Icon name="edit" size={14} /> Edit Kamar
                        </Link>
                        <button onClick={onDelete} className="btn btn-ghost btn-sm"
                            style={{ flex: 1, justifyContent: 'center', color: 'var(--danger)', borderColor: 'rgba(210,68,50,0.30)' }}>
                            <Icon name="trash" size={14} /> Hapus Kamar
                        </button>
                    </div>
                </div>
            </div>

            {/* ───── Riwayat Penyewa ───── */}
            <section style={{
                background: 'white', borderRadius: 14, marginBottom: 20, overflow: 'hidden',
                border: '1px solid rgba(11,13,26,0.06)',
                boxShadow: '0 1px 2px rgba(11,13,26,0.03)',
            }}>
                <header style={{ padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--ink-900)' }}>Riwayat Penyewa</h3>
                </header>

                {riwayatSewa.length === 0 ? (
                    <div style={{ padding: '24px 22px 32px', textAlign: 'center', color: 'var(--ink-400)', fontSize: 14 }}>
                        Belum ada riwayat sewa untuk kamar ini.
                    </div>
                ) : (
                    <div style={{ overflow: 'auto', borderTop: '1px solid rgba(11,13,26,0.06)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    {['No', 'Nama', 'Periode Sewa', 'Status Kontrak', 'Tagihan'].map((h) => (
                                        <th key={h} style={{
                                            padding: '12px 22px', textAlign: 'left',
                                            fontSize: 11, fontWeight: 600, color: 'var(--ink-500)',
                                            textTransform: 'uppercase', letterSpacing: '0.06em',
                                            background: 'var(--ink-50)',
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {riwayatSewa.map((r, i) => (
                                    <tr key={r.id} style={{ borderTop: '1px solid rgba(11,13,26,0.06)' }}>
                                        <td style={{ padding: '14px 22px', color: 'var(--ink-400)', fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>{i + 1}</td>
                                        <td style={{ padding: '14px 22px', fontWeight: 500, color: 'var(--ink-900)', fontSize: 14 }}>{r.penyewa_nama}</td>
                                        <td style={{ padding: '14px 22px', color: 'var(--ink-500)', fontSize: 13 }}>{r.periode}</td>
                                        <td style={{ padding: '14px 22px' }}>
                                            <Pill tone={sewaStatusTone(r.status)}>{r.status === 'aktif' ? 'Aktif' : r.status === 'dibatalkan' ? 'Dibatalkan' : 'Selesai'}</Pill>
                                        </td>
                                        <td style={{ padding: '14px 22px', color: 'var(--ink-500)', fontSize: 13 }}>{r.jumlah_tagihan} tagihan</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* ───── Riwayat Komplen ───── */}
            <section style={{
                background: 'white', borderRadius: 14, overflow: 'hidden',
                border: '1px solid rgba(11,13,26,0.06)',
                boxShadow: '0 1px 2px rgba(11,13,26,0.03)',
            }}>
                <header style={{ padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--ink-900)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        <Icon name="alert-circle" size={16} style={{ color: 'var(--warning)' }} />
                        Riwayat Komplen
                    </h3>
                    {komplenList.filter((k) => k.status !== 'selesai').length > 0 && (
                        <span style={{
                            padding: '3px 10px', borderRadius: 999,
                            background: 'rgba(200,158,42,0.12)', color: '#8a6c10',
                            fontSize: 11.5, fontWeight: 600,
                        }}>
                            {komplenList.filter((k) => k.status !== 'selesai').length} komplen aktif
                        </span>
                    )}
                </header>

                {komplenList.length === 0 ? (
                    <div style={{ padding: '24px 22px 32px', textAlign: 'center', color: 'var(--ink-400)', fontSize: 14 }}>
                        Belum ada komplen untuk kamar ini.
                    </div>
                ) : (
                    <div style={{ overflow: 'auto', borderTop: '1px solid rgba(11,13,26,0.06)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    {['Tgl', 'Penyewa', 'Judul', 'Status', 'Aksi'].map((h, i) => (
                                        <th key={h} style={{
                                            padding: '12px 22px',
                                            textAlign: i === 4 ? 'right' : 'left',
                                            fontSize: 11, fontWeight: 600, color: 'var(--ink-500)',
                                            textTransform: 'uppercase', letterSpacing: '0.06em',
                                            background: 'var(--ink-50)',
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {komplenList.map((k) => (
                                    <tr key={k.id} style={{ borderTop: '1px solid rgba(11,13,26,0.06)', verticalAlign: 'top' }}>
                                        <td style={{ padding: '14px 22px', color: 'var(--ink-500)', fontSize: 13, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                                            {fmt(k.created_at)}
                                        </td>
                                        <td style={{ padding: '14px 22px', fontWeight: 500, color: 'var(--ink-900)', fontSize: 14 }}>{k.penyewa_nama}</td>
                                        <td style={{ padding: '14px 22px', fontSize: 13, color: 'var(--ink-700)', maxWidth: 380 }}>
                                            <div style={{ fontWeight: 500, color: 'var(--ink-900)', marginBottom: 4 }}>{k.judul}</div>
                                            <div style={{ fontSize: 12.5, color: 'var(--ink-500)', lineHeight: 1.55 }}>{k.deskripsi}</div>
                                            {k.foto.length > 0 && (
                                                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                                                    {k.foto.map((f) => (
                                                        <a key={f.id} href={f.url} target="_blank" rel="noopener noreferrer"
                                                            style={{ display: 'block', width: 56, height: 42, borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(11,13,26,0.08)' }}>
                                                            <img src={f.url} alt="Foto bukti komplen" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        </a>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: '14px 22px' }}>
                                            <Pill tone={komplenTone(k.status)}>{komplenLabel(k.status)}</Pill>
                                        </td>
                                        <td style={{ padding: '14px 22px', textAlign: 'right' }}>
                                            {k.status === 'menunggu' && (
                                                <button onClick={() => onUpdateKomplenStatus(k, 'diproses')}
                                                    className="btn btn-ghost btn-sm">
                                                    Tandai Diproses
                                                </button>
                                            )}
                                            {k.status === 'diproses' && (
                                                <button onClick={() => onUpdateKomplenStatus(k, 'selesai')}
                                                    className="btn btn-primary btn-sm">
                                                    <Icon name="check" size={13} stroke={2.4} /> Tandai Selesai
                                                </button>
                                            )}
                                            {k.status === 'selesai' && (
                                                <span style={{ fontSize: 12, color: 'var(--ink-400)' }}>
                                                    Selesai {k.resolved_at ? fmt(k.resolved_at) : ''}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <style>{`
                @media (max-width: 900px) {
                    .kamar-hero { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </AdminLayout>
    );
}
