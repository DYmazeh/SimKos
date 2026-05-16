import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { Icon, Pill, formatRp } from '@/components/ui';
import type { PageProps } from '@/types/inertia';

type Kamar = {
    id: number;
    nomor_kamar: string;
    tipe: string;
    harga_bulanan: number;
    deskripsi: string | null;
    fasilitas: string[];
    luas_m2: number | null;
    lantai: number | null;
    peraturan: string | null;
    deposit: number;
    foto: Array<{ id: number; url: string }>;
};

type ShowProps = PageProps<{
    kamar: Kamar;
    sewa: { tgl_mulai: string; tgl_selesai: string | null; harga_disepakati: number };
    pengelola: { nama: string; wa_number: string };
}>;

const KICKER: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase',
    color: 'var(--blue-600)', margin: 0,
};

const fasilitasIcon = (label: string): React.ComponentProps<typeof Icon>['name'] => {
    const key = label.toLowerCase();
    if (key.includes('wifi')) return 'wifi';
    if (key.includes('ac')) return 'ac';
    if (key.includes('km') || key.includes('toilet')) return 'toilet';
    if (key.includes('kasur') || key.includes('bed')) return 'bed';
    if (key.includes('meja') || key.includes('desk')) return 'desk';
    if (key.includes('lemari') || key.includes('closet')) return 'closet';
    if (key.includes('parkir')) return 'parking';
    if (key.includes('kipas') || key.includes('fan')) return 'fan';
    return 'info';
};

const fmt = (s: string) => new Date(s).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

export default function PenyewaKamarSaya() {
    const { props } = usePage<ShowProps>();
    const { kamar, sewa, pengelola } = props;
    const [activeFoto, setActiveFoto] = useState(0);
    const mainFoto = kamar.foto[activeFoto] ?? null;

    const waLink = `https://wa.me/${pengelola.wa_number.replace(/^0/, '62').replace(/\D/g, '')}?text=${encodeURIComponent(`Halo ${pengelola.nama}, saya penyewa kamar ${kamar.nomor_kamar}.`)}`;

    return (
        <AuthenticatedLayout>
            <Head title="Kamar Saya" />

            {/* Header */}
            <header style={{ marginBottom: 24 }}>
                <p style={KICKER}>Kamar Saya</p>
                <h1 className="h-1" style={{ margin: '6px 0 8px' }}>Kamar {kamar.nomor_kamar}.</h1>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--ink-500)', margin: 0, maxWidth: '58ch' }}>
                    Info detail tentang kamar yang kamu tempati: foto, fasilitas, peraturan, dan kontak pengelola.
                </p>
            </header>

            <div className="kamar-saya-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
                {/* Galeri */}
                <div style={{
                    background: 'white', borderRadius: 14, padding: 14,
                    border: '1px solid rgba(11,13,26,0.06)',
                    boxShadow: '0 1px 2px rgba(11,13,26,0.03)',
                }}>
                    <div style={{
                        aspectRatio: '4/3', borderRadius: 10, overflow: 'hidden',
                        background: 'var(--ink-50)', marginBottom: 10,
                    }}>
                        {mainFoto ? (
                            <img src={mainFoto.url} alt={`Kamar ${kamar.nomor_kamar}`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: 'var(--ink-300)' }}>
                                <Icon name="bed" size={64} stroke={1.4} />
                            </div>
                        )}
                    </div>
                    {kamar.foto.length > 1 && (
                        <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
                            {kamar.foto.map((f, i) => (
                                <button key={f.id} onClick={() => setActiveFoto(i)}
                                    style={{
                                        width: 80, height: 60, borderRadius: 8, overflow: 'hidden',
                                        border: i === activeFoto ? '2px solid var(--blue-600)' : '2px solid transparent',
                                        cursor: 'pointer', padding: 0, background: 'transparent', flexShrink: 0,
                                    }}>
                                    <img src={f.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div style={{
                    background: 'white', borderRadius: 14, padding: 24,
                    border: '1px solid rgba(11,13,26,0.06)',
                    boxShadow: '0 1px 2px rgba(11,13,26,0.03)',
                    display: 'flex', flexDirection: 'column',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <Pill tone="info">{kamar.tipe.toUpperCase()}</Pill>
                        <Pill tone="success" dot="pulse">Sewa aktif</Pill>
                    </div>

                    <div style={{ marginBottom: 18 }}>
                        <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--ink-900)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
                            {formatRp(sewa.harga_disepakati)}
                        </div>
                        <div style={{ fontSize: 12.5, color: 'var(--ink-500)' }}>/ bulan · disewa sejak {fmt(sewa.tgl_mulai)}</div>
                    </div>

                    {/* Spec */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
                        <Tile label="Lantai" value={kamar.lantai?.toString() ?? '—'} />
                        <Tile label="Luas" value={kamar.luas_m2 ? `${kamar.luas_m2} m²` : '—'} />
                    </div>

                    {/* Fasilitas */}
                    {kamar.fasilitas.length > 0 && (
                        <div style={{ marginBottom: 18 }}>
                            <p style={{ ...KICKER, marginBottom: 8 }}>Fasilitas</p>
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

                    {/* CTA Hubungi pengelola */}
                    <a href={waLink} target="_blank" rel="noopener noreferrer"
                        style={{
                            marginTop: 'auto',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            padding: '12px 20px', borderRadius: 10,
                            background: 'var(--success)', color: 'white',
                            fontSize: 14, fontWeight: 600, textDecoration: 'none',
                            boxShadow: '0 6px 16px -6px rgba(31,143,91,0.4)',
                            transition: 'all 180ms var(--ease)',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#176f44')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--success)')}>
                        <Icon name="logo-wa" size={16} />
                        Hubungi pengelola ({pengelola.nama})
                    </a>
                </div>
            </div>

            {/* Deskripsi */}
            {kamar.deskripsi && (
                <section style={{
                    background: 'white', borderRadius: 14, padding: 24, marginTop: 18,
                    border: '1px solid rgba(11,13,26,0.06)',
                    boxShadow: '0 1px 2px rgba(11,13,26,0.03)',
                }}>
                    <p style={KICKER}>Tentang kamar</p>
                    <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--ink-700)', lineHeight: 1.65 }}>
                        {kamar.deskripsi}
                    </p>
                </section>
            )}

            {/* Peraturan */}
            {kamar.peraturan && (
                <section style={{
                    background: 'white', borderRadius: 14, padding: 24, marginTop: 18,
                    border: '1px solid rgba(11,13,26,0.06)',
                    boxShadow: '0 1px 2px rgba(11,13,26,0.03)',
                }}>
                    <p style={{ ...KICKER, color: 'var(--warning)' }}>Peraturan</p>
                    <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--ink-700)', lineHeight: 1.65, whiteSpace: 'pre-line' }}>
                        {kamar.peraturan}
                    </p>
                </section>
            )}

            {/* Deposit info */}
            {kamar.deposit > 0 && (
                <section style={{
                    background: 'var(--blue-50)', borderRadius: 14, padding: 18, marginTop: 18,
                    border: '1px solid rgba(37,99,235,0.16)',
                    display: 'flex', alignItems: 'center', gap: 14,
                }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: 'white', color: 'var(--blue-700)',
                        display: 'grid', placeItems: 'center', flex: '0 0 auto',
                    }}>
                        <Icon name="shield" size={20} />
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--blue-700)' }}>Deposit kamar</p>
                        <p style={{ margin: '2px 0 0', fontSize: 14, color: 'var(--ink-700)' }}>
                            {formatRp(kamar.deposit)} — dikembalikan saat keluar bila tanpa kerusakan.
                        </p>
                    </div>
                </section>
            )}

            <style>{`
                @media (max-width: 900px) {
                    .kamar-saya-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </AuthenticatedLayout>
    );
}

const Tile = ({ label, value }: { label: string; value: string }) => (
    <div style={{
        padding: 12, borderRadius: 10,
        background: 'var(--ink-50)', border: '1px solid rgba(11,13,26,0.04)',
    }}>
        <div style={{
            fontSize: 10.5, color: 'var(--ink-400)',
            textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600,
        }}>{label}</div>
        <div style={{ marginTop: 4, fontSize: 16, fontWeight: 600, color: 'var(--ink-900)' }}>{value}</div>
    </div>
);
