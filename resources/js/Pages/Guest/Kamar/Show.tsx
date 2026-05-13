import { Head, Link, usePage } from '@inertiajs/react';
import { TopNav, Footer, Icon, Pill, formatRp, waLink } from '@/components/ui';
import { PhotoPlaceholder, Accordion } from '@/components/guest/parts';
import { StickyWA, type KamarSummary, type FaqItem, type ProfilKos } from '@/components/guest/sections';
import type { PageProps } from '@/types/inertia';

type KamarDetail = KamarSummary & { peraturan: string | null };

type ShowProps = PageProps<{
    kamar: KamarDetail;
    peraturan: FaqItem[];
    profil: ProfilKos;
}>;

export default function KamarShow() {
    const { props } = usePage<ShowProps>();
    const { kamar, peraturan, profil, auth } = props;

    const tipeColor: 'warning' | 'info' | 'neutral' =
        kamar.tipe === 'vip' ? 'warning' : kamar.tipe === 'deluxe' ? 'info' : 'neutral';

    const waUrl = waLink(
        profil.wa_number,
        `Halo, saya tertarik dengan kamar ${kamar.nomor_kamar} (${kamar.tipe.toUpperCase()}) seharga ${formatRp(kamar.harga_bulanan)}/bulan. Apakah masih tersedia?`,
    );

    const isTersedia = kamar.status === 'tersedia';

    // Galeri: 4 placeholder kalau foto kosong, atau pakai foto real
    const galeriItems = kamar.foto && kamar.foto.length > 0
        ? kamar.foto
        : [null, null, null, null];

    return (
        <>
            <Head title={`Kamar ${kamar.nomor_kamar}`} />

            <div className="bg-radial" style={{ minHeight: '100vh' }}>
                <TopNav authenticated={!!auth.user} />

                <section style={{ padding: '40px 24px' }}>
                    <div style={{ maxWidth: 1120, margin: '0 auto' }}>
                        <Link href={route('guest.kamar.index')} className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }}>
                            <Icon name="arrow-left" size={14} /> Kembali ke daftar kamar
                        </Link>

                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
                            <div>
                                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                                    <Pill tone={tipeColor}>{kamar.tipe.toUpperCase()}</Pill>
                                    {isTersedia ? (
                                        <Pill tone="success" dot="pulse">Tersedia</Pill>
                                    ) : (
                                        <Pill tone="warning">Terisi</Pill>
                                    )}
                                </div>
                                <h1 className="h-display" style={{ margin: 0, fontSize: 'clamp(28px,4vw,40px)' }}>
                                    Kamar {kamar.nomor_kamar}
                                </h1>
                                {kamar.deskripsi && (
                                    <p style={{ fontSize: 16, color: 'var(--ink-500)', margin: '8px 0 0', maxWidth: '60ch' }}>
                                        {kamar.deskripsi}
                                    </p>
                                )}
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div className="num" style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em' }}>
                                    {formatRp(kamar.harga_bulanan)}
                                </div>
                                <div style={{ fontSize: 13, color: 'var(--ink-400)' }}>per bulan</div>
                            </div>
                        </div>

                        {/* Galeri */}
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 8, marginBottom: 32, height: 380 }} className="kamar-galeri">
                            {galeriItems.slice(0, 4).map((src, i) => (
                                <div key={i} style={{ gridColumn: i === 0 ? '1 / span 1' : 'auto', gridRow: i === 0 ? '1 / span 2' : 'auto' }}>
                                    {src ? (
                                        <img src={src} alt={`Foto ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 14, border: '1px solid rgba(11,13,26,0.05)' }} />
                                    ) : (
                                        <PhotoPlaceholder
                                            label={`Foto ${i + 1}`}
                                            accent={(['blue', 'slate', 'warm', 'teal'] as const)[i]}
                                            height="100%"
                                            icon="bed"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Spec + biaya + CTA */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 24, alignItems: 'start' }} className="detail-grid">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                {/* Specs */}
                                <div className="card-solid" style={{ padding: 24 }}>
                                    <h3 className="h-2" style={{ margin: '0 0 14px' }}>Spesifikasi</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                                        {[
                                            { label: 'Lantai', value: kamar.lantai ?? '—' },
                                            { label: 'Luas', value: kamar.luas_m2 ? `${kamar.luas_m2} m²` : '—' },
                                            { label: 'Tipe', value: kamar.tipe.charAt(0).toUpperCase() + kamar.tipe.slice(1) },
                                        ].map((s, i) => (
                                            <div key={i} style={{ padding: '10px 14px', borderRadius: 12, background: 'var(--ink-50)', border: '1px solid rgba(11,13,26,0.04)' }}>
                                                <div style={{ fontSize: 11, color: 'var(--ink-400)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
                                                <div style={{ fontSize: 16, fontWeight: 600, marginTop: 2 }}>{s.value}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Fasilitas */}
                                {kamar.fasilitas && kamar.fasilitas.length > 0 && (
                                    <div className="card-solid" style={{ padding: 24 }}>
                                        <h3 className="h-2" style={{ margin: '0 0 14px' }}>Fasilitas Kamar</h3>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                            {kamar.fasilitas.map((f, i) => (
                                                <span key={i} style={{ fontSize: 13, padding: '6px 14px', borderRadius: 999, color: 'var(--ink-700)', background: 'var(--ink-50)', border: '1px solid rgba(11,13,26,0.06)' }}>{f}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Peraturan khusus kamar */}
                                {kamar.peraturan && (
                                    <div className="card-solid" style={{ padding: 24 }}>
                                        <h3 className="h-2" style={{ margin: '0 0 10px' }}>Peraturan Khusus</h3>
                                        <p style={{ fontSize: 14.5, color: 'var(--ink-700)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-line' }}>{kamar.peraturan}</p>
                                    </div>
                                )}

                                {/* Peraturan umum (accordion) */}
                                {peraturan.length > 0 && (
                                    <div>
                                        <h3 className="h-2" style={{ margin: '0 0 14px' }}>Peraturan Kos</h3>
                                        <Accordion items={peraturan.map((p) => ({ q: p.pertanyaan, a: p.jawaban }))} />
                                    </div>
                                )}
                            </div>

                            {/* Sticky-ish CTA card */}
                            <div className="card-solid" style={{ padding: 24, position: 'sticky', top: 100 }}>
                                <h3 className="h-3" style={{ margin: '0 0 14px' }}>Biaya & Sewa</h3>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--ink-500)' }}>Sewa / bulan</span>
                                        <span className="num" style={{ fontWeight: 600 }}>{formatRp(kamar.harga_bulanan)}</span>
                                    </div>
                                    {kamar.deposit !== null && kamar.deposit > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: 'var(--ink-500)' }}>Deposit</span>
                                            <span className="num" style={{ fontWeight: 600 }}>{formatRp(kamar.deposit)}</span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--ink-500)' }}>Minimum sewa</span>
                                        <span style={{ fontWeight: 600 }}>{kamar.min_sewa_bulan} bulan</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--ink-500)' }}>Listrik & WiFi</span>
                                        <span style={{ fontWeight: 600 }}>Termasuk</span>
                                    </div>
                                </div>

                                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(11,13,26,0.06)', display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: 14, color: 'var(--ink-500)' }}>Bayar pertama</span>
                                    <span className="num" style={{ fontSize: 16, fontWeight: 600 }}>
                                        {formatRp(kamar.harga_bulanan + (kamar.deposit ?? 0))}
                                    </span>
                                </div>

                                {isTersedia && waUrl ? (
                                    <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 20 }}>
                                        <Icon name="logo-wa" size={16} /> Hubungi via WhatsApp
                                    </a>
                                ) : (
                                    <div style={{ marginTop: 20, padding: 14, borderRadius: 12, background: 'rgba(200,158,42,0.08)', border: '1px solid rgba(200,158,42,0.20)', color: '#7a5e08', fontSize: 13.5, textAlign: 'center' }}>
                                        Kamar ini sedang terisi. Lihat kamar lain.
                                    </div>
                                )}

                                <p style={{ fontSize: 12, color: 'var(--ink-400)', textAlign: 'center', margin: '12px 0 0' }}>
                                    Pengelola merespons biasanya dalam 1 jam · Senin–Minggu, 08.00–21.00 WIB
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <Footer />
            <StickyWA waNumber={profil.wa_number} />

            <style>{`
                @media (max-width: 860px) {
                    .kamar-galeri { grid-template-columns: 1fr 1fr !important; grid-template-rows: auto !important; height: auto !important; }
                    .kamar-galeri > div { aspect-ratio: 4/3; }
                    .kamar-galeri > div:first-child { grid-column: 1 / -1 !important; grid-row: auto !important; }
                    .detail-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </>
    );
}
