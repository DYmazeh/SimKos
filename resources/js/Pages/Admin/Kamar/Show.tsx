import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Icon, formatRp } from '@/components/ui';
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

type ShowProps = PageProps<{
    kamar: KamarDetail;
    riwayatSewa: RiwayatItem[];
}>;

const statusPill = (status: string) => {
    const map: Record<string, { label: string; bg: string; color: string }> = {
        tersedia: { label: 'Kosong', bg: '#DCFCE7', color: '#15803D' },
        terisi: { label: 'Aktif', bg: '#DCFCE7', color: '#15803D' },
        maintenance: { label: 'Maintenance', bg: '#FEF3C7', color: '#92400E' },
        aktif: { label: 'Aktif', bg: '#DCFCE7', color: '#15803D' },
        selesai: { label: 'Selesai', bg: '#F1F5F9', color: '#475569' },
        dibatalkan: { label: 'Dibatalkan', bg: '#FEE2E2', color: '#991B1B' },
    };
    return map[status] ?? map.tersedia;
};

const fasilitasIcon = (f: string) => {
    const map: Record<string, JSX.Element> = {
        'WiFi': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14 0M2 8.82a16 16 0 0 1 20 0M8.5 16.43a6 6 0 0 1 7 0" /><circle cx="12" cy="20" r="0.5" fill="currentColor" /></svg>,
        'AC': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6" /></svg>,
        'KM Dalam': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6a3 3 0 1 1 6 0M4 11h16v8a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z" /></svg>,
    };
    return map[f] ?? <span style={{ fontSize: 11 }}>📦</span>;
};

export default function KamarShow() {
    const { props } = usePage<ShowProps>();
    const { kamar, riwayatSewa } = props;
    const [activeFoto, setActiveFoto] = useState(0);
    const mainFoto = kamar.foto[activeFoto] ?? null;

    return (
        <AdminLayout
            title={`Detail ${kamar.nomor_kamar}`}
            breadcrumb={
                <span>
                    <Link href={route('admin.kamar.index')} style={{ color: '#64748B' }}>Kamar</Link>
                    {' / '}
                    <span style={{ color: '#2563EB' }}>Detail {kamar.nomor_kamar}</span>
                </span>
            }
        >
            <Head title={`Kamar ${kamar.nomor_kamar}`} />

            {/* Hero: foto + info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, marginBottom: 20 }} className="kamar-hero">
                {/* Galeri */}
                <div style={{ background: 'white', borderRadius: 14, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div style={{
                        aspectRatio: '4/3', borderRadius: 10, overflow: 'hidden',
                        background: '#F1F5F9', marginBottom: 10,
                    }}>
                        {mainFoto ? (
                            <img src={mainFoto.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: '#CBD5E1' }}>
                                <Icon name="home" size={64} />
                            </div>
                        )}
                    </div>
                    {kamar.foto.length > 1 && (
                        <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
                            {kamar.foto.map((f, i) => (
                                <button key={f.id} onClick={() => setActiveFoto(i)}
                                    style={{
                                        width: 70, height: 56,
                                        borderRadius: 8, overflow: 'hidden',
                                        border: i === activeFoto ? '2px solid #2563EB' : '2px solid transparent',
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
                <div style={{ background: 'white', borderRadius: 14, padding: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#0F172A' }}>
                                Kamar {kamar.nomor_kamar}
                            </h2>
                            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                <span style={{
                                    display: 'inline-block', padding: '4px 12px',
                                    background: statusPill(kamar.status).bg, color: statusPill(kamar.status).color,
                                    borderRadius: 999, fontSize: 12, fontWeight: 600,
                                }}>{statusPill(kamar.status).label}</span>
                                <span style={{
                                    display: 'inline-block', padding: '4px 12px',
                                    background: '#EFF6FF', color: '#2563EB',
                                    borderRadius: 999, fontSize: 12, fontWeight: 600,
                                }}>{kamar.tipe.toUpperCase()}</span>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 22, fontWeight: 700, color: '#0F172A' }}>{formatRp(kamar.harga_bulanan)}</div>
                            <div style={{ fontSize: 12, color: '#94A3B8' }}>/ bulan</div>
                        </div>
                    </div>

                    {/* Spec */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                        <div style={{ padding: 12, background: '#F8FAFC', borderRadius: 10 }}>
                            <div style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lantai</div>
                            <div style={{ fontSize: 16, fontWeight: 600, marginTop: 2 }}>{kamar.lantai ?? '—'}</div>
                        </div>
                        <div style={{ padding: 12, background: '#F8FAFC', borderRadius: 10 }}>
                            <div style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Luas</div>
                            <div style={{ fontSize: 16, fontWeight: 600, marginTop: 2 }}>{kamar.luas_m2 ? `${kamar.luas_m2} m²` : '—'}</div>
                        </div>
                    </div>

                    {/* Fasilitas */}
                    {kamar.fasilitas.length > 0 && (
                        <div style={{ marginTop: 16 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', marginBottom: 8 }}>Fasilitas Tersedia</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {kamar.fasilitas.map((f, i) => (
                                    <span key={i} style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 6,
                                        padding: '6px 12px', borderRadius: 999,
                                        background: '#EFF6FF', color: '#2563EB',
                                        fontSize: 12.5, fontWeight: 500,
                                    }}>
                                        {fasilitasIcon(f)} {f}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Deskripsi */}
                    {kamar.deskripsi && (
                        <div style={{ marginTop: 16 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', marginBottom: 6 }}>Deskripsi</div>
                            <p style={{ margin: 0, fontSize: 13.5, color: '#475569', lineHeight: 1.6 }}>{kamar.deskripsi}</p>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 10, marginTop: 'auto', paddingTop: 20 }}>
                        <Link href={route('admin.kamar.edit', kamar.id)}
                            style={{
                                flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                padding: '11px 16px', borderRadius: 10,
                                border: '1px solid #2563EB', color: '#2563EB',
                                fontSize: 14, fontWeight: 600,
                            }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Edit Kamar
                        </Link>
                    </div>
                </div>
            </div>

            {/* Riwayat Penyewa */}
            <div style={{ background: 'white', borderRadius: 14, padding: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0F172A' }}>Riwayat Penyewa</h3>
                </div>

                {riwayatSewa.length === 0 ? (
                    <div style={{ padding: 32, textAlign: 'center', color: '#94A3B8', fontSize: 14 }}>
                        Belum ada riwayat sewa untuk kamar ini.
                    </div>
                ) : (
                    <div style={{ overflow: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                            <thead>
                                <tr style={{ background: '#F8FAFC' }}>
                                    {['No', 'Nama', 'Periode Sewa', 'Status Kontrak', 'Tagihan'].map((h) => (
                                        <th key={h} style={{ padding: '12px 24px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {riwayatSewa.map((r, i) => {
                                    const meta = statusPill(r.status);
                                    return (
                                        <tr key={r.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                                            <td style={{ padding: '14px 24px', color: '#94A3B8', fontSize: 13 }}>{i + 1}</td>
                                            <td style={{ padding: '14px 24px', fontWeight: 500 }}>{r.penyewa_nama}</td>
                                            <td style={{ padding: '14px 24px', color: '#475569', fontSize: 13 }}>{r.periode}</td>
                                            <td style={{ padding: '14px 24px' }}>
                                                <span style={{
                                                    display: 'inline-block', padding: '4px 10px',
                                                    background: meta.bg, color: meta.color,
                                                    borderRadius: 999, fontSize: 12, fontWeight: 600,
                                                }}>{meta.label}</span>
                                            </td>
                                            <td style={{ padding: '14px 24px', color: '#475569', fontSize: 13 }}>{r.jumlah_tagihan} tagihan</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <style>{`
                @media (max-width: 900px) {
                    .kamar-hero { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </AdminLayout>
    );
}
