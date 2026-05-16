import { Head, Link, usePage } from '@inertiajs/react';
import AdminLayout from '@/components/AdminLayout';
import { Icon, Pill, formatRp } from '@/components/ui';
import type { PageProps } from '@/types/inertia';

type TagihanItem = {
    id: number;
    periode: string;
    kamar_nomor: string;
    jumlah: number;
    tgl_jatuh_tempo: string;
    status: 'belum_bayar' | 'menunggu_verifikasi' | 'lunas' | 'terlambat';
    pembayaran_count: number;
    wa_link: string;
};

type PenyewaProps = PageProps<{
    penyewa: {
        id: number;
        nama_lengkap: string;
        no_hp: string;
        kamar_aktif: string | null;
    };
    tagihan: TagihanItem[];
}>;

const fmtMonth = (s: string) => new Date(s).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
const fmtDate = (s: string) => new Date(s).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

const statusMeta = (status: TagihanItem['status']): { label: string; tone: 'success' | 'warning' | 'info' | 'neutral' } => {
    if (status === 'lunas') return { label: 'Lunas', tone: 'success' };
    if (status === 'menunggu_verifikasi') return { label: 'Menunggu konfirmasi', tone: 'info' };
    if (status === 'terlambat') return { label: 'Terlambat', tone: 'warning' };
    return { label: 'Belum bayar', tone: 'warning' };
};

export default function TagihanPerPenyewa() {
    const { props } = usePage<PenyewaProps>();
    const { penyewa, tagihan } = props;
    const initial = penyewa.nama_lengkap.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

    const totalBelum = tagihan
        .filter((t) => ['belum_bayar', 'terlambat'].includes(t.status))
        .reduce((sum, t) => sum + t.jumlah, 0);

    return (
        <AdminLayout title="Pembayaran">
            <Head title={`Tagihan — ${penyewa.nama_lengkap}`} />

            {/* Breadcrumb + Back */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
                <nav aria-label="Breadcrumb" style={{ fontSize: 13, color: 'var(--ink-500)' }}>
                    <Link href={route('admin.tagihan.index')} style={{ color: 'var(--ink-500)' }}>Tagihan</Link>
                    <span style={{ color: 'var(--ink-300)', margin: '0 8px' }}>/</span>
                    <span style={{ color: 'var(--blue-600)', fontWeight: 500 }}>{penyewa.nama_lengkap}</span>
                </nav>
                <Link href={route('admin.tagihan.index')} className="btn btn-ghost btn-sm">
                    <Icon name="arrow-left" size={14} /> Kembali
                </Link>
            </div>

            {/* Penyewa header card */}
            <section style={{
                background: 'white', borderRadius: 14, padding: 22, marginBottom: 18,
                border: '1px solid rgba(11,13,26,0.06)',
                boxShadow: '0 1px 2px rgba(11,13,26,0.03)',
                display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap',
            }}>
                <div style={{
                    width: 56, height: 56, borderRadius: 999,
                    background: 'linear-gradient(135deg, var(--blue-400), var(--blue-700))',
                    color: 'white', display: 'grid', placeItems: 'center',
                    fontSize: 18, fontWeight: 600, flex: '0 0 auto',
                }}>{initial}</div>
                <div style={{ flex: 1, minWidth: 200 }}>
                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--ink-900)' }}>{penyewa.nama_lengkap}</h2>
                    <div style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 4 }}>
                        {penyewa.kamar_aktif ? `Kamar ${penyewa.kamar_aktif}` : 'Tidak ada sewa aktif'} · {penyewa.no_hp}
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                        Total Belum Lunas
                    </div>
                    <div style={{
                        fontSize: 22, fontWeight: 700, color: totalBelum > 0 ? 'var(--danger)' : 'var(--success)',
                        fontVariantNumeric: 'tabular-nums', marginTop: 4,
                    }}>
                        {totalBelum > 0 ? formatRp(totalBelum) : 'Lunas semua'}
                    </div>
                </div>
            </section>

            {/* Tagihan list */}
            <section style={{
                background: 'white', borderRadius: 14, overflow: 'hidden',
                border: '1px solid rgba(11,13,26,0.06)',
                boxShadow: '0 1px 2px rgba(11,13,26,0.03)',
            }}>
                <header style={{ padding: '18px 22px', borderBottom: '1px solid rgba(11,13,26,0.06)' }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--ink-900)' }}>Riwayat Tagihan</h3>
                </header>

                {tagihan.length === 0 ? (
                    <div style={{ padding: 48, textAlign: 'center', color: 'var(--ink-500)', fontSize: 14 }}>
                        Belum ada tagihan tercatat untuk penyewa ini.
                    </div>
                ) : (
                    <div style={{ overflow: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    {['Periode', 'Kamar', 'Jumlah', 'Jatuh Tempo', 'Status', 'Aksi'].map((h, i) => (
                                        <th key={h} style={{
                                            padding: '14px 22px',
                                            textAlign: i === 5 ? 'right' : 'left',
                                            fontSize: 11, fontWeight: 600, color: 'var(--ink-500)',
                                            textTransform: 'uppercase', letterSpacing: '0.06em',
                                            background: 'var(--ink-50)',
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {tagihan.map((t) => {
                                    const meta = statusMeta(t.status);
                                    return (
                                        <tr key={t.id} style={{ borderTop: '1px solid rgba(11,13,26,0.06)' }}>
                                            <td style={{ padding: '14px 22px', fontWeight: 500, color: 'var(--ink-900)', fontSize: 14 }}>{fmtMonth(t.periode)}</td>
                                            <td style={{ padding: '14px 22px', fontSize: 13, color: 'var(--ink-700)' }}>{t.kamar_nomor}</td>
                                            <td style={{ padding: '14px 22px', fontSize: 14, fontWeight: 600, color: 'var(--ink-900)', fontVariantNumeric: 'tabular-nums' }}>
                                                {formatRp(t.jumlah)}
                                            </td>
                                            <td style={{ padding: '14px 22px', fontSize: 12.5, color: 'var(--ink-500)', fontVariantNumeric: 'tabular-nums' }}>
                                                {fmtDate(t.tgl_jatuh_tempo)}
                                            </td>
                                            <td style={{ padding: '14px 22px' }}>
                                                <Pill tone={meta.tone}>{meta.label}</Pill>
                                            </td>
                                            <td style={{ padding: '14px 22px', textAlign: 'right' }}>
                                                <div style={{ display: 'inline-flex', gap: 8 }}>
                                                    <Link href={route('admin.tagihan.show', t.id)}
                                                        aria-label="Detail tagihan"
                                                        style={{
                                                            display: 'inline-grid', placeItems: 'center',
                                                            width: 32, height: 32, borderRadius: 8,
                                                            background: 'var(--blue-50)', color: 'var(--blue-700)',
                                                        }}>
                                                        <Icon name="eye" size={14} />
                                                    </Link>
                                                    {['belum_bayar', 'terlambat'].includes(t.status) && (
                                                        <a href={t.wa_link} target="_blank" rel="noopener noreferrer"
                                                            aria-label="Ingatkan via WhatsApp"
                                                            style={{
                                                                display: 'inline-grid', placeItems: 'center',
                                                                width: 32, height: 32, borderRadius: 8,
                                                                background: 'rgba(31,143,91,0.10)', color: 'var(--success)',
                                                            }}>
                                                            <Icon name="logo-wa" size={14} />
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </AdminLayout>
    );
}
