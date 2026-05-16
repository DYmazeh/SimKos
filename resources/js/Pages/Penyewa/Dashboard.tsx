import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { Icon, Pill, formatRp } from '@/components/ui';
import type { PageProps } from '@/types/inertia';

type SewaAktif = {
    kamar_nomor: string;
    tipe: string;
    tgl_mulai: string;
    harga_disepakati: number;
    status: string;
};

type PenyewaData = {
    id: number;
    nama_lengkap: string;
    no_hp: string;
    sewa_aktif: SewaAktif | null;
};

type TagihanItem = {
    id: number;
    periode: string;
    jumlah: number;
    tgl_jatuh_tempo: string;
    status: 'belum_bayar' | 'menunggu_verifikasi' | 'lunas' | 'terlambat';
    latest_rejected_catatan: string | null;
};

type PenyewaDashboardProps = PageProps<{
    penyewa: PenyewaData | null;
    tagihan: TagihanItem[];
}>;

const formatDate = (s: string) => new Date(s).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
const formatMonthFull = (s: string) => new Date(s).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

const statusLabel: Record<string, string> = {
    belum_bayar: 'Belum bayar',
    menunggu_verifikasi: 'Menunggu verifikasi',
    lunas: 'Lunas',
    terlambat: 'Terlambat',
};
const statusTone: Record<string, 'neutral' | 'success' | 'warning' | 'info'> = {
    belum_bayar: 'warning',
    menunggu_verifikasi: 'info',
    lunas: 'success',
    terlambat: 'warning',
};

const KICKER: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase',
    color: 'var(--blue-600)', margin: 0,
};

const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
    <section style={{
        background: 'white', borderRadius: 16,
        border: '1px solid rgba(11,13,26,0.06)',
        boxShadow: '0 1px 2px rgba(11,13,26,0.03)',
        ...style,
    }}>
        {children}
    </section>
);

export default function PenyewaDashboard() {
    const { props } = usePage<PenyewaDashboardProps>();
    const { penyewa, tagihan, auth } = props;
    const firstName = (auth.user?.name ?? '').split(' ')[0];

    const totalBelum = tagihan.filter((t) => t.status === 'belum_bayar' || t.status === 'terlambat')
        .reduce((sum, t) => sum + t.jumlah, 0);
    const adaTerlambat = tagihan.some((t) => t.status === 'terlambat');

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard Penyewa" />

            {/* ───── Greeting ───── */}
            <header style={{ marginBottom: 24 }}>
                <p style={KICKER}>Beranda</p>
                <h1 className="h-1" style={{ margin: '6px 0 8px', display: 'inline-flex', alignItems: 'center', gap: 12 }}>
                    Halo, {firstName || 'Penyewa'}.
                    <span style={{ color: 'var(--warning)' }} aria-hidden="true">
                        <Icon name="wave" size={28} stroke={1.6} />
                    </span>
                </h1>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--ink-500)', margin: 0, maxWidth: '56ch' }}>
                    Pantau status sewa kamar dan tagihan bulanan kamu. Upload bukti transfer langsung dari sini.
                </p>
            </header>

            {/* ───── Quick stats row ───── */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 14, marginBottom: 24,
            }}>
                <StatCard
                    kicker="Tagihan aktif"
                    value={totalBelum > 0 ? formatRp(totalBelum) : 'Lunas'}
                    sub={totalBelum > 0 ? `${tagihan.filter((t) => t.status === 'belum_bayar' || t.status === 'terlambat').length} tagihan menunggu` : 'Tidak ada tunggakan'}
                    tone={adaTerlambat ? 'warning' : totalBelum > 0 ? 'info' : 'success'}
                    icon={adaTerlambat ? 'info' : totalBelum > 0 ? 'wallet' : 'check'}
                />
                <StatCard
                    kicker="Kamar"
                    value={penyewa?.sewa_aktif?.kamar_nomor ?? '—'}
                    sub={penyewa?.sewa_aktif?.tipe ? `Tipe ${penyewa.sewa_aktif.tipe.toUpperCase()}` : 'Belum ada sewa aktif'}
                    tone="neutral"
                    icon="bed"
                />
                <StatCard
                    kicker="Sewa sejak"
                    value={penyewa?.sewa_aktif ? formatDate(penyewa.sewa_aktif.tgl_mulai) : '—'}
                    sub={penyewa?.sewa_aktif ? `${formatRp(penyewa.sewa_aktif.harga_disepakati)} / bulan` : 'Hubungi pengelola'}
                    tone="neutral"
                    icon="calendar"
                />
            </div>

            {/* ───── Status sewa (detail) ───── */}
            {penyewa?.sewa_aktif && (
                <Card style={{ padding: 28, marginBottom: 18 }}>
                    <header style={{ marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                        <div>
                            <p style={KICKER}>Sewa berjalan</p>
                            <h2 className="h-2" style={{ margin: '4px 0 0' }}>Status kamar.</h2>
                        </div>
                        <Pill tone="success" dot="pulse">Sedang aktif</Pill>
                    </header>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                        gap: 12,
                    }}>
                        <Tile label="Kamar" value={`${penyewa.sewa_aktif.kamar_nomor}`} sub={penyewa.sewa_aktif.tipe.toUpperCase()} />
                        <Tile label="Mulai sewa" value={formatDate(penyewa.sewa_aktif.tgl_mulai)} />
                        <Tile label="Harga / bulan" value={formatRp(penyewa.sewa_aktif.harga_disepakati)} accent />
                    </div>
                </Card>
            )}

            {/* ───── Tagihan ───── */}
            <Card style={{ overflow: 'hidden' }}>
                <header style={{
                    padding: '22px 28px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    flexWrap: 'wrap', gap: 12,
                }}>
                    <div>
                        <p style={KICKER}>Pembayaran</p>
                        <h2 className="h-2" style={{ margin: '4px 0 0' }}>Tagihan kamu.</h2>
                    </div>
                    <Link href={route('penyewa.riwayat')} className="btn btn-ghost btn-sm">
                        Lihat riwayat <Icon name="arrow-right" size={14} />
                    </Link>
                </header>

                {tagihan.length === 0 ? (
                    <div style={{
                        padding: '24px 28px 40px',
                        textAlign: 'center', color: 'var(--ink-500)',
                    }}>
                        <div style={{
                            width: 48, height: 48, borderRadius: 12,
                            background: 'var(--ink-50)', color: 'var(--ink-400)',
                            display: 'inline-grid', placeItems: 'center', marginBottom: 10,
                        }}>
                            <Icon name="receipt" size={22} />
                        </div>
                        <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-800)', fontWeight: 500 }}>Belum ada tagihan.</p>
                        <p style={{ margin: '4px 0 0', fontSize: 13 }}>Tagihan bulanan akan muncul di sini sesuai jadwal.</p>
                    </div>
                ) : (
                    <div style={{ overflow: 'auto', borderTop: '1px solid rgba(11,13,26,0.06)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    {['Periode', 'Jumlah', 'Jatuh tempo', 'Status', 'Aksi'].map((h, i) => (
                                        <th key={h} style={{
                                            padding: '14px 24px',
                                            textAlign: i === 4 ? 'right' : 'left',
                                            fontSize: 11, fontWeight: 600, color: 'var(--ink-500)',
                                            textTransform: 'uppercase', letterSpacing: '0.06em',
                                            background: 'var(--ink-50)',
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {tagihan.map((t) => (
                                    <tr key={t.id} style={{ borderTop: '1px solid rgba(11,13,26,0.06)' }}>
                                        <td style={{ padding: '16px 24px', fontWeight: 500, color: 'var(--ink-900)', fontSize: 14 }}>
                                            {formatMonthFull(t.periode)}
                                        </td>
                                        <td style={{ padding: '16px 24px', color: 'var(--ink-800)', fontSize: 14, fontVariantNumeric: 'tabular-nums' }}>
                                            {formatRp(t.jumlah)}
                                        </td>
                                        <td style={{ padding: '16px 24px', color: 'var(--ink-500)', fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>
                                            {formatDate(t.tgl_jatuh_tempo)}
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <Pill tone={statusTone[t.status]} dot={t.status === 'terlambat' ? 'pulse' : true}>
                                                {statusLabel[t.status]}
                                            </Pill>
                                            {t.latest_rejected_catatan && ['belum_bayar', 'terlambat'].includes(t.status) && (
                                                <div style={{
                                                    fontSize: 11.5, color: 'var(--danger)', marginTop: 6,
                                                    fontStyle: 'italic', maxWidth: '32ch',
                                                }}>
                                                    Bukti sebelumnya ditolak: "{t.latest_rejected_catatan}"
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                            {['belum_bayar', 'terlambat'].includes(t.status) ? (
                                                <Link href={route('penyewa.tagihan.bayar.create', t.id)}
                                                    className="btn btn-primary btn-sm">
                                                    <Icon name="card" size={14} /> Bayar
                                                </Link>
                                            ) : t.status === 'menunggu_verifikasi' ? (
                                                <span style={{
                                                    fontSize: 12.5, color: 'var(--blue-700)',
                                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                                }}>
                                                    <Icon name="clock" size={13} /> Menunggu verifikasi
                                                </span>
                                            ) : (
                                                <span style={{
                                                    fontSize: 12.5, color: 'var(--success)',
                                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                                }}>
                                                    <Icon name="check" size={13} stroke={2.4} /> Lunas
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </AuthenticatedLayout>
    );
}

/* ───── Subcomponents ───── */

const StatCard = ({ kicker, value, sub, tone, icon }: {
    kicker: string;
    value: string;
    sub: string;
    tone: 'success' | 'warning' | 'info' | 'neutral';
    icon: 'wallet' | 'check' | 'info' | 'bed' | 'calendar';
}) => {
    const palette: Record<typeof tone, { bg: string; fg: string; border: string }> = {
        success: { bg: 'rgba(31,143,91,0.08)', fg: 'var(--success)', border: 'rgba(31,143,91,0.18)' },
        warning: { bg: 'rgba(200,158,42,0.10)', fg: '#8a6c10', border: 'rgba(200,158,42,0.22)' },
        info:    { bg: 'var(--blue-50)', fg: 'var(--blue-700)', border: 'rgba(37,99,235,0.16)' },
        neutral: { bg: 'white', fg: 'var(--ink-800)', border: 'rgba(11,13,26,0.06)' },
    };
    const p = palette[tone];
    return (
        <div style={{
            padding: 18, borderRadius: 14,
            background: p.bg, border: `1px solid ${p.border}`,
            display: 'flex', alignItems: 'flex-start', gap: 14,
        }}>
            <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'white', color: p.fg,
                display: 'grid', placeItems: 'center', flex: '0 0 auto',
                boxShadow: '0 1px 2px rgba(11,13,26,0.04)',
            }}>
                <Icon name={icon} size={20} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{
                    fontSize: 10.5, fontWeight: 600, color: p.fg,
                    textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0,
                }}>{kicker}</p>
                <p style={{
                    margin: '4px 0 2px', fontSize: 18, fontWeight: 600,
                    color: 'var(--ink-900)', fontVariantNumeric: 'tabular-nums',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{value}</p>
                <p style={{ margin: 0, fontSize: 12.5, color: 'var(--ink-500)' }}>{sub}</p>
            </div>
        </div>
    );
};

const Tile = ({ label, value, sub, accent = false }: { label: string; value: string; sub?: string; accent?: boolean }) => (
    <div style={{
        padding: 14, borderRadius: 12,
        background: accent ? 'var(--blue-50)' : 'var(--ink-50)',
        border: `1px solid ${accent ? 'rgba(37,99,235,0.1)' : 'rgba(11,13,26,0.04)'}`,
    }}>
        <div style={{
            fontSize: 10.5, color: accent ? 'var(--blue-700)' : 'var(--ink-400)',
            textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600,
        }}>{label}</div>
        <div style={{
            marginTop: 4, fontSize: 15, fontWeight: 600,
            color: accent ? 'var(--blue-700)' : 'var(--ink-900)',
            fontVariantNumeric: 'tabular-nums',
        }}>{value}</div>
        {sub && (
            <div style={{ marginTop: 2, fontSize: 11, color: 'var(--ink-500)', letterSpacing: '0.04em' }}>
                {sub}
            </div>
        )}
    </div>
);
