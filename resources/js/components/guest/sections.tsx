import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Icon, Pill, formatRp, waLink } from '@/components/ui';
import { PhotoPlaceholder, SectionHeader, Accordion } from '@/components/guest/parts';

/* ============================================================
   TYPES
   ============================================================ */
export type KamarSummary = {
    id: number;
    nomor_kamar: string;
    tipe: string;
    harga_bulanan: number;
    status: string;
    luas_m2: number | null;
    lantai: number | null;
    fasilitas: string[] | null;
    deskripsi: string | null;
    deposit: number | null;
    min_sewa_bulan: number;
    foto: string[] | null;
};

export type TestimoniItem = {
    id: number;
    nama_penghuni: string;
    peran: string | null;
    isi: string;
    rating: number;
};

export type FaqItem = {
    id: number;
    pertanyaan: string;
    jawaban: string;
    kategori: 'umum' | 'peraturan';
};

export type ProfilKos = {
    nama: string;
    alamat: string;
    wa_number: string;
    pengelola_nama: string;
    pengelola_sejak: string;
    pengelola_bio: string;
};

/* ============================================================
   HERO — no dashboard preview, CTA: Lihat kamar + Chat WA
   ============================================================ */
export const Hero = ({
    available,
    startingPrice,
    waUrl,
}: {
    available: number;
    startingPrice: number;
    waUrl: string | null;
}) => (
    <section style={{ paddingTop: 56, paddingBottom: 56 }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
            <div className="pill pill-neutral" style={{ marginBottom: 20 }}>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--success)' }} className="pulse-dot" />
                {available} kamar tersedia · mulai {formatRp(startingPrice)}/bln
            </div>

            <h1 className="h-display" style={{ margin: 0, marginBottom: 16, color: 'var(--ink-900)', maxWidth: '20ch', marginLeft: 'auto', marginRight: 'auto' }}>
                Kos yang dikelola,<br />
                <span style={{ background: 'linear-gradient(120deg, var(--ink-900), var(--blue-600) 80%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
                    jelas dan tenang.
                </span>
            </h1>

            <p style={{ fontSize: 18, lineHeight: 1.6, color: 'var(--ink-500)', maxWidth: '52ch', margin: '0 auto 28px' }}>
                Satu sistem untuk data kamar, penyewa, tagihan, dan verifikasi pembayaran.
                Transparan untuk penghuni, efisien untuk pengelola.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Link href={route('guest.kamar.index')} className="btn btn-primary btn-lg">
                    Lihat kamar
                    <Icon name="arrow-right" size={16} />
                </Link>
                {waUrl && (
                    <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-lg">
                        <Icon name="logo-wa" size={16} />
                        Chat WhatsApp
                    </a>
                )}
            </div>
        </div>
    </section>
);

/* ============================================================
   GALERI PROPERTI — fasilitas umum
   ============================================================ */
export const GaleriSection = () => {
    const items: Array<{ label: string; accent: 'blue' | 'slate' | 'warm' | 'teal' | 'rose'; span?: number }> = [
        { label: 'Tampak depan', accent: 'blue', span: 2 },
        { label: 'Ruang bersama', accent: 'slate' },
        { label: 'Dapur', accent: 'warm' },
        { label: 'Parkir', accent: 'teal' },
        { label: 'Area cuci', accent: 'rose' },
    ];
    return (
        <section style={{ padding: '64px 24px' }}>
            <div style={{ maxWidth: 1120, margin: '0 auto' }}>
                <SectionHeader kicker="Properti" title="Lihat kos sebelum datang." desc="Foto fasilitas umum yang tersedia untuk seluruh penghuni." />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridAutoRows: '180px', gap: 12 }} className="gal-grid">
                    {items.map((it, i) => (
                        <div key={i} style={{ gridColumn: it.span === 2 ? 'span 2' : 'span 1' }}>
                            <PhotoPlaceholder label={it.label} accent={it.accent} height="100%" />
                        </div>
                    ))}
                </div>
            </div>
            <style>{`@media (max-width: 720px) { .gal-grid { grid-template-columns: 1fr 1fr !important; } .gal-grid > div { grid-column: span 1 !important; } }`}</style>
        </section>
    );
};

/* ============================================================
   KAMAR FEATURED — di home, 3-6 kamar tersedia
   ============================================================ */
export const KamarFeaturedSection = ({ kamar }: { kamar: KamarSummary[] }) => (
    <section id="kamar" style={{ scrollMarginTop: 80, paddingTop: 64, paddingBottom: 72, background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(4px)', borderTop: '1px solid rgba(11,13,26,0.04)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 24px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'end', gap: 16, marginBottom: 28 }}>
                <div>
                    <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--blue-600)', margin: 0 }}>Kamar tersedia</p>
                    <h2 className="h-1" style={{ margin: 0, marginTop: 4 }}>Pilih kamar yang sesuai.</h2>
                </div>
                <Link href={route('guest.kamar.index')} className="btn btn-ghost btn-sm">
                    Lihat semua <Icon name="arrow-right" size={14} />
                </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {kamar.slice(0, 6).map((k) => <KamarCard key={k.id} kamar={k} />)}
            </div>
        </div>
    </section>
);

/* ============================================================
   KAMAR CARD (re-used di home + list)
   ============================================================ */
export const KamarCard = ({ kamar }: { kamar: KamarSummary }) => {
    const tipeColor: 'warning' | 'info' | 'neutral' =
        kamar.tipe === 'vip' ? 'warning' : kamar.tipe === 'deluxe' ? 'info' : 'neutral';
    return (
        <Link
            href={route('guest.kamar.show', { kamar: kamar.id })}
            className="card-solid kamar-card"
            style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
        >
            <div style={{ height: 140, background: 'linear-gradient(135deg, var(--ink-50), var(--blue-50))', position: 'relative', borderBottom: '1px solid rgba(11,13,26,0.05)' }}>
                <div className="stripe" style={{ position: 'absolute', inset: 0, opacity: 0.5 }} />
                <div style={{ position: 'absolute', top: 12, left: 12 }}>
                    <Pill tone={tipeColor}>{kamar.tipe.toUpperCase()}</Pill>
                </div>
                {kamar.status === 'tersedia' && (
                    <div style={{ position: 'absolute', top: 12, right: 12 }}>
                        <Pill tone="success" dot="pulse">Tersedia</Pill>
                    </div>
                )}
            </div>

            <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                    <h3 className="h-2" style={{ margin: 0, fontSize: 18 }}>Kamar {kamar.nomor_kamar}</h3>
                    <span style={{ fontSize: 12, color: 'var(--ink-400)' }}>
                        {kamar.lantai && `Lt. ${kamar.lantai}`}{kamar.lantai && kamar.luas_m2 && ' · '}{kamar.luas_m2 && `${kamar.luas_m2} m²`}
                    </span>
                </div>
                {kamar.deskripsi && (
                    <p style={{ margin: 0, color: 'var(--ink-500)', fontSize: 13.5, lineHeight: 1.5, flex: 1 }}>{kamar.deskripsi}</p>
                )}

                {kamar.fasilitas && kamar.fasilitas.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                        {kamar.fasilitas.slice(0, 4).map((f, i) => (
                            <span key={i} style={{ fontSize: 11.5, padding: '3px 8px', borderRadius: 999, color: 'var(--ink-700)', background: 'var(--ink-50)', border: '1px solid rgba(11,13,26,0.05)' }}>{f}</span>
                        ))}
                    </div>
                )}

                <div style={{ paddingTop: 10, borderTop: '1px solid rgba(11,13,26,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                    <div>
                        <span className="num" style={{ fontSize: 20, fontWeight: 600 }}>{formatRp(kamar.harga_bulanan)}</span>
                        <span style={{ fontSize: 12, color: 'var(--ink-400)', marginLeft: 4 }}>/ bulan</span>
                    </div>
                    <span style={{ fontSize: 13, color: 'var(--blue-600)', fontWeight: 500 }}>Detail →</span>
                </div>
            </div>

            <style>{`
                .kamar-card { transition: transform 180ms var(--ease), box-shadow 240ms var(--ease); }
                .kamar-card:hover { transform: translateY(-2px); box-shadow: 0 12px 32px -12px rgba(11,13,26,0.15); }
            `}</style>
        </Link>
    );
};

/* ============================================================
   STRUKTUR BIAYA
   ============================================================ */
export const BiayaSection = ({ minPrice, maxPrice }: { minPrice: number; maxPrice: number }) => {
    const rows = [
        { item: 'Sewa bulanan', value: `${formatRp(minPrice)} – ${formatRp(maxPrice)}`, note: 'Sesuai tipe kamar (Standar / Deluxe / VIP)' },
        { item: 'Deposit', value: '1× sewa bulanan', note: 'Dikembalikan saat keluar bila tanpa kerusakan' },
        { item: 'Listrik', value: 'Flat Rp 75.000 / bulan', note: 'Sudah termasuk dalam tagihan' },
        { item: 'Air & WiFi', value: 'Termasuk', note: 'Tanpa biaya tambahan' },
        { item: 'Kebersihan', value: 'Termasuk 2× / minggu', note: 'Area umum dibersihkan oleh petugas' },
        { item: 'Denda telat', value: 'Rp 25.000 / 3 hari', note: 'Berlaku setelah jatuh tempo lewat' },
    ];
    return (
        <section style={{ padding: '64px 24px', background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(4px)', borderTop: '1px solid rgba(11,13,26,0.04)' }}>
            <div style={{ maxWidth: 920, margin: '0 auto' }}>
                <SectionHeader kicker="Struktur biaya" title="Semua biaya, terbuka di muka." desc="Tidak ada biaya tersembunyi. Semua komponen pembayaran tertera di sini sebelum Anda booking." />
                <div className="card-solid" style={{ padding: 0, overflow: 'hidden' }}>
                    {rows.map((r, i) => (
                        <div key={i} style={{
                            display: 'grid', gridTemplateColumns: '180px 1fr 220px', gap: 24,
                            padding: '16px 24px',
                            borderTop: i > 0 ? '1px solid rgba(11,13,26,0.06)' : 0,
                            alignItems: 'center',
                        }} className="biaya-row">
                            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-900)' }}>{r.item}</div>
                            <div className="num" style={{ fontSize: 15, color: 'var(--ink-800)' }}>{r.value}</div>
                            <div style={{ fontSize: 13, color: 'var(--ink-500)' }}>{r.note}</div>
                        </div>
                    ))}
                </div>
            </div>
            <style>{`@media (max-width: 720px) { .biaya-row { grid-template-columns: 1fr !important; gap: 4px !important; padding: 14px 18px !important; } }`}</style>
        </section>
    );
};

/* ============================================================
   LOKASI & SEKITAR
   ============================================================ */
export const LokasiSection = ({ alamat }: { alamat: string }) => {
    const landmarks: Array<{ name: string; distance: string; icon: 'map-pin' | 'shield' | 'home' | 'wallet' }> = [
        { name: 'Kampus UGM', distance: '8 menit motor', icon: 'map-pin' },
        { name: 'Halte TransJogja', distance: '3 menit jalan kaki', icon: 'map-pin' },
        { name: 'Indomaret', distance: '1 menit jalan kaki', icon: 'map-pin' },
        { name: 'RS Sardjito', distance: '12 menit motor', icon: 'shield' },
        { name: 'Masjid', distance: '5 menit jalan kaki', icon: 'home' },
        { name: 'Pasar Demangan', distance: '6 menit motor', icon: 'wallet' },
        { name: 'ATM BCA & BNI', distance: '2 menit jalan kaki', icon: 'wallet' },
        { name: 'Warung makan', distance: 'Banyak di sekitar', icon: 'home' },
    ];
    const mapUrl = `https://www.google.com/maps/search/${encodeURIComponent(alamat)}`;
    return (
        <section style={{ padding: '64px 24px' }}>
            <div style={{ maxWidth: 1120, margin: '0 auto' }}>
                <SectionHeader kicker="Lokasi" title="Strategis di pusat aktivitas." desc={`${alamat}. Dekat kampus, transportasi umum, dan kebutuhan harian.`} />
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, alignItems: 'stretch' }} className="lokasi-grid">
                    <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(11,13,26,0.08)', background: 'var(--ink-50)', position: 'relative', minHeight: 340 }}>
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)' }}>
                            <svg viewBox="0 0 400 340" preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
                                <path d="M0,220 L120,180 L240,210 L400,160" stroke="rgba(255,255,255,0.7)" strokeWidth="14" fill="none" strokeLinecap="round" />
                                <path d="M0,80 L160,120 L300,60 L400,100" stroke="rgba(255,255,255,0.5)" strokeWidth="10" fill="none" strokeLinecap="round" />
                                <path d="M180,0 L160,340" stroke="rgba(255,255,255,0.4)" strokeWidth="8" fill="none" />
                                <circle cx="200" cy="170" r="12" fill="var(--blue-600)" stroke="white" strokeWidth="3" />
                                <circle cx="200" cy="170" r="22" fill="var(--blue-600)" opacity="0.2" />
                            </svg>
                        </div>
                        <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                            <div style={{ padding: '10px 14px', borderRadius: 12, background: 'white', boxShadow: 'var(--shadow-2)', fontSize: 13 }}>
                                <div style={{ fontSize: 11, color: 'var(--ink-400)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Lokasi</div>
                                <div style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{alamat}</div>
                            </div>
                            <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">Buka di Maps</a>
                        </div>
                    </div>

                    <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-800)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tempat penting terdekat</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            {landmarks.map((l, i) => (
                                <div key={i} style={{ padding: '12px 14px', borderRadius: 12, background: 'white', border: '1px solid rgba(11,13,26,0.06)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--blue-600)', marginBottom: 4 }}>
                                        <Icon name={l.icon} size={14} />
                                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-900)' }}>{l.name}</span>
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--ink-500)', marginLeft: 22 }}>{l.distance}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <style>{`@media (max-width: 860px) { .lokasi-grid { grid-template-columns: 1fr !important; } }`}</style>
        </section>
    );
};

/* ============================================================
   CARA KERJA — DARK template (replaces Kemampuan)
   ============================================================ */
export const CaraKerjaSection = () => {
    const steps: Array<{ n: string; icon: 'phone' | 'calendar' | 'user' | 'upload' | 'receipt' | 'shield'; title: string; desc: string }> = [
        { n: '01', icon: 'phone', title: 'Hubungi pengelola', desc: 'Pilih kamar yang sesuai, lalu hubungi pengelola melalui WhatsApp. Anda dapat menjadwalkan survei langsung ke lokasi.' },
        { n: '02', icon: 'calendar', title: 'Sepakati dan booking', desc: 'Setelah harga dan tanggal masuk disepakati, pengelola mendaftarkan akun Anda ke dalam sistem.' },
        { n: '03', icon: 'user', title: 'Akses dashboard penyewa', desc: 'Masuk ke SimKos untuk melihat tagihan bulan berjalan, riwayat pembayaran, dan dokumen kontrak digital Anda.' },
        { n: '04', icon: 'upload', title: 'Bayar dan verifikasi', desc: 'Transfer sesuai tagihan, unggah bukti pembayaran. Admin memverifikasi dan status berubah otomatis.' },
        { n: '05', icon: 'receipt', title: 'Riwayat tersimpan', desc: 'Seluruh pembayaran tercatat dan dapat diakses kapan saja. Tidak perlu menyimpan kuitansi fisik.' },
        { n: '06', icon: 'shield', title: 'Selesai dan tenang', desc: 'Pengingat tagihan dikirim otomatis via WhatsApp menjelang jatuh tempo. Tidak ada yang terlewat.' },
    ];
    return (
        <section id="cara" style={{ scrollMarginTop: 80, background: 'var(--dark-bg)', padding: '80px 24px' }}>
            <div style={{ maxWidth: 1120, margin: '0 auto' }}>
                <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--teal-500)', margin: 0 }}>Cara kerja</p>
                <h2 style={{ fontSize: 'clamp(28px, 4vw, 38px)', lineHeight: 1.15, letterSpacing: '-0.025em', fontWeight: 500, color: 'var(--dark-text)', margin: '8px 0 0', maxWidth: '22ch' }}>
                    Dari hubungi pengelola hingga tagihan terverifikasi.
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '48px 40px', marginTop: 56 }} className="cara-grid">
                    {steps.map((s) => (
                        <div key={s.n}>
                            <div style={{
                                width: 52, height: 52, borderRadius: 14,
                                background: 'var(--dark-card)', border: '1px solid var(--dark-border)',
                                display: 'grid', placeItems: 'center',
                                color: 'var(--dark-muted)', marginBottom: 16,
                                position: 'relative',
                            }}>
                                <Icon name={s.icon} size={22} stroke={1.4} />
                                <span className="num" style={{ position: 'absolute', top: -8, right: -8, fontSize: 10, fontWeight: 600, color: 'var(--teal-500)', background: 'var(--dark-bg)', padding: '2px 6px', borderRadius: 999, border: '1px solid var(--dark-border)' }}>{s.n}</span>
                            </div>
                            <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--dark-text)', margin: 0, marginBottom: 6 }}>{s.title}</h3>
                            <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--dark-muted)', margin: 0 }}>{s.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
            <style>{`
                @media (max-width: 860px) { .cara-grid { grid-template-columns: 1fr 1fr !important; } }
                @media (max-width: 540px) { .cara-grid { grid-template-columns: 1fr !important; } }
            `}</style>
        </section>
    );
};

/* ============================================================
   TESTIMONI
   ============================================================ */
export const TestimoniSection = ({ items }: { items: TestimoniItem[] }) => {
    if (items.length === 0) return null;
    const avgRating = items.reduce((sum, t) => sum + t.rating, 0) / items.length;
    return (
        <section style={{ padding: '64px 24px' }}>
            <div style={{ maxWidth: 1120, margin: '0 auto' }}>
                <SectionHeader kicker="Testimoni" title="Apa kata penghuni kami." desc="Pengalaman langsung dari penghuni yang sudah tinggal bersama kami." />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="test-grid">
                    {items.map((t) => {
                        const initial = t.nama_penghuni.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
                        return (
                            <div key={t.id} className="card-solid" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
                                <div style={{ display: 'flex', gap: 2 }}>
                                    {[...Array(5)].map((_, j) => (
                                        <svg key={j} width="14" height="14" viewBox="0 0 24 24" fill={j < t.rating ? '#f59e0b' : 'rgba(11,13,26,0.10)'}>
                                            <path d="M12 2l2.4 7.2H22l-6 4.6 2.4 7.2L12 16.8 5.6 21l2.4-7.2L2 9.2h7.6z" />
                                        </svg>
                                    ))}
                                </div>
                                <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--ink-800)', margin: 0, flex: 1 }}>"{t.isi}"</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 12, borderTop: '1px solid rgba(11,13,26,0.06)' }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 999, background: 'var(--blue-100)', color: 'var(--blue-700)', display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 600 }}>{initial}</div>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-900)' }}>{t.nama_penghuni}</div>
                                        <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>{t.peran}</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div style={{ marginTop: 20, fontSize: 13, color: 'var(--ink-500)', textAlign: 'center' }}>
                    <span style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{avgRating.toFixed(1)} / 5</span> rata-rata dari {items.length} penghuni
                </div>
            </div>
            <style>{`@media (max-width: 860px) { .test-grid { grid-template-columns: 1fr !important; } }`}</style>
        </section>
    );
};

/* ============================================================
   PERATURAN (accordion)
   ============================================================ */
export const PeraturanSection = ({ items }: { items: FaqItem[] }) => {
    if (items.length === 0) return null;
    return (
        <section style={{ padding: '64px 24px', background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(4px)', borderTop: '1px solid rgba(11,13,26,0.04)' }}>
            <div style={{ maxWidth: 820, margin: '0 auto' }}>
                <SectionHeader kicker="Peraturan kos" title="Aturan yang menjaga kenyamanan bersama." desc="Kebijakan ini berlaku untuk seluruh penghuni dan disepakati saat penandatanganan kontrak." />
                <Accordion items={items.map((i) => ({ q: i.pertanyaan, a: i.jawaban }))} />
            </div>
        </section>
    );
};

/* ============================================================
   FAQ (accordion)
   ============================================================ */
export const FaqSection = ({ items }: { items: FaqItem[] }) => {
    if (items.length === 0) return null;
    return (
        <section style={{ padding: '64px 24px' }}>
            <div style={{ maxWidth: 820, margin: '0 auto' }}>
                <SectionHeader kicker="Pertanyaan umum" title="Hal yang sering ditanyakan." desc="Jika pertanyaan Anda belum terjawab di sini, silakan hubungi pengelola langsung." />
                <Accordion items={items.map((i) => ({ q: i.pertanyaan, a: i.jawaban }))} />
            </div>
        </section>
    );
};

/* ============================================================
   TENTANG PENGELOLA
   ============================================================ */
export const TentangSection = ({ profil }: { profil: ProfilKos }) => (
    <section id="tentang" style={{ scrollMarginTop: 80, padding: '64px 24px', background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(4px)', borderTop: '1px solid rgba(11,13,26,0.04)' }}>
        <div style={{ maxWidth: 920, margin: '0 auto' }}>
            <div className="card-solid tentang-card" style={{ padding: 36, display: 'grid', gridTemplateColumns: '200px 1fr', gap: 32, alignItems: 'center' }}>
                <div style={{ width: 200, height: 200, borderRadius: 16, overflow: 'hidden' }}>
                    <PhotoPlaceholder label="Foto pengelola" accent="slate" icon="user" height={200} />
                </div>
                <div>
                    <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--blue-600)', margin: 0 }}>Pengelola</p>
                    <h2 style={{ fontSize: 28, lineHeight: 1.2, letterSpacing: '-0.02em', fontWeight: 600, margin: '8px 0 4px' }}>{profil.pengelola_nama}</h2>
                    <p style={{ fontSize: 14, color: 'var(--ink-500)', margin: 0 }}>
                        Mengelola {profil.nama} sejak {profil.pengelola_sejak}
                    </p>
                    <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--ink-700)', margin: '16px 0 0' }}>
                        {profil.pengelola_bio}
                    </p>
                    <div style={{ display: 'flex', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
                        <Pill tone="info">{(2026 - parseInt(profil.pengelola_sejak || '2018'))} tahun pengalaman</Pill>
                        <Pill tone="success" dot>Selalu responsif</Pill>
                    </div>
                </div>
            </div>
        </div>
        <style>{`@media (max-width: 720px) { .tentang-card { grid-template-columns: 1fr !important; padding: 24px !important; text-align: center; } .tentang-card > div:first-child { margin: 0 auto; } }`}</style>
    </section>
);

/* ============================================================
   OWNER CTA (dark — untuk pemilik kos)
   ============================================================ */
export const OwnerSection = () => (
    <section style={{ padding: '0 24px 80px', background: 'var(--dark-bg)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
            <div className="owner-grid" style={{ padding: '40px 44px', borderRadius: 22, background: 'var(--dark-card)', border: '1px solid var(--dark-border)', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 32, alignItems: 'center' }}>
                <div>
                    <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--teal-500)', margin: 0 }}>Untuk pemilik kos</p>
                    <h2 style={{ fontSize: 'clamp(24px, 3vw, 30px)', lineHeight: 1.2, letterSpacing: '-0.02em', fontWeight: 500, color: 'var(--dark-text)', margin: '8px 0 12px' }}>
                        Punya kos? Kelola dengan SimKos.
                    </h2>
                    <p style={{ fontSize: 15, color: 'var(--dark-muted)', margin: 0, maxWidth: '46ch', lineHeight: 1.6 }}>
                        Hentikan kerja manual dengan buku catatan. Kelola data kamar, penyewa, tagihan, dan
                        verifikasi pembayaran dari satu dashboard.
                    </p>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 22 }}>
                        <Link href={route('login')} className="btn btn-lg" style={{ background: 'white', color: 'var(--ink-900)' }}>
                            Coba dashboard <Icon name="arrow-right" size={16} />
                        </Link>
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {[
                        { v: 'Otomatis', l: 'Generate tagihan bulanan' },
                        { v: 'Reminder', l: 'WhatsApp jelang jatuh tempo' },
                        { v: 'Verifikasi', l: 'Bukti transfer dari penyewa' },
                        { v: 'Laporan', l: 'Pemasukan & rekap penghuni' },
                    ].map((s, i) => (
                        <div key={i} style={{ padding: 14, borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--dark-border)' }}>
                            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--dark-text)', letterSpacing: '-0.01em' }}>{s.v}</div>
                            <div style={{ fontSize: 12, color: 'var(--dark-muted)', marginTop: 4, lineHeight: 1.4 }}>{s.l}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        <style>{`@media (max-width: 800px) { .owner-grid { grid-template-columns: 1fr !important; padding: 28px !important; } }`}</style>
    </section>
);

/* ============================================================
   KONTAK
   ============================================================ */
export const KontakSection = ({ waUrl, phone }: { waUrl: string | null; phone: string }) => (
    <section id="kontak" style={{ scrollMarginTop: 80, padding: '72px 24px' }}>
        <div style={{ maxWidth: 920, margin: '0 auto', textAlign: 'center' }}>
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--blue-600)', margin: 0 }}>Kontak</p>
            <h2 className="h-1" style={{ margin: '8px 0 12px', maxWidth: '20ch', marginLeft: 'auto', marginRight: 'auto' }}>
                Siap menjadi penghuni? Hubungi kami.
            </h2>
            <p style={{ fontSize: 16, color: 'var(--ink-500)', margin: '0 auto', maxWidth: '48ch', lineHeight: 1.6 }}>
                Anda berkomunikasi langsung dengan pengelola, tanpa perantara atau biaya tambahan.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 28, justifyContent: 'center' }}>
                {waUrl && (
                    <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg">
                        <Icon name="logo-wa" size={16} /> Chat WhatsApp
                    </a>
                )}
                <a href={`tel:${phone}`} className="btn btn-ghost btn-lg">
                    <Icon name="phone" size={16} /> {phone}
                </a>
            </div>
            <p style={{ fontSize: 13, color: 'var(--ink-400)', margin: '20px 0 0' }}>
                Senin – Minggu, 08.00 – 21.00 WIB
            </p>
        </div>
    </section>
);

/* ============================================================
   STICKY WHATSAPP
   ============================================================ */
export const StickyWA = ({ waNumber }: { waNumber: string }) => {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 600);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);
    const url = waLink(waNumber, 'Halo, saya ingin bertanya soal kos.');
    if (!visible || !url) return null;
    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="fade-up"
            style={{
                position: 'fixed', bottom: 24, right: 24, zIndex: 40,
                width: 56, height: 56, borderRadius: 999,
                background: '#25D366', color: 'white',
                display: 'grid', placeItems: 'center',
                boxShadow: '0 8px 24px -8px rgba(37,211,102,0.5), 0 0 0 4px rgba(37,211,102,0.15)',
                transition: 'transform 180ms var(--ease)',
            }}
            aria-label="Chat via WhatsApp"
        >
            <Icon name="logo-wa" size={26} />
        </a>
    );
};
