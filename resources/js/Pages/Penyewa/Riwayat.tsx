import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { Icon, Pill, formatRp } from '@/components/ui';
import type { PageProps } from '@/types/inertia';

type PembayaranRow = {
    id: number;
    tgl_bayar: string | null;
    periode: string | null;
    kamar_nomor: string;
    jumlah_bayar: number;
    metode: string;
    status_verifikasi: 'pending' | 'approved' | 'rejected';
    catatan: string | null;
};

type RiwayatProps = PageProps<{
    pembayaran: PembayaranRow[];
    pagination: { current_page: number; last_page: number; total: number; from: number; to: number };
}>;

const KICKER: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase',
    color: 'var(--blue-600)', margin: 0,
};

const fmt = (s: string | null) => s ? new Date(s).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtMonth = (s: string | null) => s ? new Date(s).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) : '—';

const statusMeta = (s: PembayaranRow['status_verifikasi']) => {
    if (s === 'approved') return { label: 'Disetujui', tone: 'success' as const, icon: 'check' as const };
    if (s === 'rejected') return { label: 'Ditolak',   tone: 'warning' as const, icon: 'ban' as const };
    return { label: 'Menunggu', tone: 'info' as const, icon: 'clock' as const };
};

export default function PenyewaRiwayat() {
    const { props } = usePage<RiwayatProps>();
    const { pembayaran, pagination } = props;

    const totalDisetujui = pembayaran
        .filter((p) => p.status_verifikasi === 'approved')
        .reduce((sum, p) => sum + p.jumlah_bayar, 0);

    return (
        <AuthenticatedLayout>
            <Head title="Riwayat Pembayaran" />

            {/* ───── Header ───── */}
            <header style={{ marginBottom: 24 }}>
                <p style={KICKER}>Histori</p>
                <h1 className="h-1" style={{ margin: '6px 0 8px' }}>Riwayat pembayaran.</h1>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--ink-500)', margin: 0, maxWidth: '56ch' }}>
                    Semua bukti transfer yang pernah kamu kirim beserta status verifikasinya.
                </p>
            </header>

            {/* ───── Summary stats ───── */}
            {pembayaran.length > 0 && (
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 14, marginBottom: 24,
                }}>
                    <SummaryTile
                        kicker="Total pembayaran"
                        value={String(pagination.total)}
                        sub="Kiriman bukti tercatat"
                        icon="receipt"
                    />
                    <SummaryTile
                        kicker="Total disetujui"
                        value={formatRp(totalDisetujui)}
                        sub={`${pembayaran.filter((p) => p.status_verifikasi === 'approved').length} bukti diterima`}
                        icon="check"
                        accent
                    />
                    <SummaryTile
                        kicker="Menunggu verifikasi"
                        value={String(pembayaran.filter((p) => p.status_verifikasi === 'pending').length)}
                        sub="Bukti dalam antrian"
                        icon="clock"
                    />
                </div>
            )}

            {/* ───── Riwayat table ───── */}
            <section style={{
                background: 'white', borderRadius: 16, overflow: 'hidden',
                border: '1px solid rgba(11,13,26,0.06)',
                boxShadow: '0 1px 2px rgba(11,13,26,0.03)',
            }}>
                {pembayaran.length === 0 ? (
                    <div style={{
                        padding: 56, textAlign: 'center',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                    }}>
                        <div style={{
                            width: 56, height: 56, borderRadius: 14,
                            background: 'var(--ink-50)', color: 'var(--ink-400)',
                            display: 'grid', placeItems: 'center',
                        }}>
                            <Icon name="receipt-search" size={26} />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: 15, color: 'var(--ink-800)', fontWeight: 500 }}>Belum ada riwayat pembayaran.</p>
                            <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--ink-500)', maxWidth: '40ch' }}>
                                Setelah kamu upload bukti transfer pertama, riwayat akan muncul di sini.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div style={{ overflow: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    {['Tgl Bayar', 'Periode', 'Kamar', 'Jumlah', 'Metode', 'Status', 'Catatan'].map((h) => (
                                        <th key={h} style={{
                                            padding: '14px 20px', textAlign: 'left',
                                            fontSize: 11, fontWeight: 600, color: 'var(--ink-500)',
                                            textTransform: 'uppercase', letterSpacing: '0.06em',
                                            background: 'var(--ink-50)',
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {pembayaran.map((p) => {
                                    const meta = statusMeta(p.status_verifikasi);
                                    return (
                                        <tr key={p.id} style={{ borderTop: '1px solid rgba(11,13,26,0.06)' }}>
                                            <td style={{ padding: '14px 20px', fontSize: 13, color: 'var(--ink-800)', fontVariantNumeric: 'tabular-nums' }}>
                                                {fmt(p.tgl_bayar)}
                                            </td>
                                            <td style={{ padding: '14px 20px', fontSize: 13, color: 'var(--ink-500)' }}>
                                                {fmtMonth(p.periode)}
                                            </td>
                                            <td style={{ padding: '14px 20px' }}>
                                                <Pill tone="info">{p.kamar_nomor}</Pill>
                                            </td>
                                            <td style={{ padding: '14px 20px', fontWeight: 500, color: 'var(--ink-900)', fontVariantNumeric: 'tabular-nums', fontSize: 14 }}>
                                                {formatRp(p.jumlah_bayar)}
                                            </td>
                                            <td style={{ padding: '14px 20px', fontSize: 12.5, color: 'var(--ink-500)', textTransform: 'capitalize' }}>
                                                {p.metode}
                                            </td>
                                            <td style={{ padding: '14px 20px' }}>
                                                <Pill tone={meta.tone}>
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                        <Icon name={meta.icon} size={11} stroke={2.2} />
                                                        {meta.label}
                                                    </span>
                                                </Pill>
                                            </td>
                                            <td style={{ padding: '14px 20px', fontSize: 12.5, color: 'var(--ink-500)', maxWidth: 240 }}>
                                                {p.catatan
                                                    ? <span style={{ fontStyle: 'italic' }}>"{p.catatan}"</span>
                                                    : <span style={{ color: 'var(--ink-300)' }}>—</span>}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {pembayaran.length > 0 && pagination.last_page > 1 && (
                    <div style={{
                        padding: '14px 20px', borderTop: '1px solid rgba(11,13,26,0.06)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        flexWrap: 'wrap', gap: 12,
                    }}>
                        <div style={{ fontSize: 13, color: 'var(--ink-500)', fontVariantNumeric: 'tabular-nums' }}>
                            Halaman <strong style={{ color: 'var(--ink-900)' }}>{pagination.current_page}</strong> dari <strong style={{ color: 'var(--ink-900)' }}>{pagination.last_page}</strong>
                        </div>
                        <div style={{ display: 'flex', gap: 4 }}>
                            <button disabled={pagination.current_page <= 1}
                                onClick={() => router.get(route('penyewa.riwayat'), { page: pagination.current_page - 1 }, { preserveScroll: true })}
                                style={pageBtnStyle(pagination.current_page <= 1)} aria-label="Halaman sebelumnya">
                                <Icon name="arrow-left" size={14} />
                            </button>
                            <button disabled={pagination.current_page >= pagination.last_page}
                                onClick={() => router.get(route('penyewa.riwayat'), { page: pagination.current_page + 1 }, { preserveScroll: true })}
                                style={pageBtnStyle(pagination.current_page >= pagination.last_page)} aria-label="Halaman berikutnya">
                                <Icon name="arrow-right" size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </section>
        </AuthenticatedLayout>
    );
}

const pageBtnStyle = (disabled: boolean): React.CSSProperties => ({
    width: 32, height: 32, borderRadius: 8,
    border: '1px solid rgba(11,13,26,0.10)',
    background: 'white', color: disabled ? 'var(--ink-300)' : 'var(--ink-700)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'grid', placeItems: 'center',
});

const SummaryTile = ({ kicker, value, sub, icon, accent = false }: {
    kicker: string;
    value: string;
    sub: string;
    icon: 'receipt' | 'check' | 'clock';
    accent?: boolean;
}) => (
    <div style={{
        padding: 16, borderRadius: 14,
        background: accent ? 'var(--blue-50)' : 'white',
        border: `1px solid ${accent ? 'rgba(37,99,235,0.16)' : 'rgba(11,13,26,0.06)'}`,
        display: 'flex', alignItems: 'flex-start', gap: 14,
    }}>
        <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: accent ? 'white' : 'var(--ink-50)',
            color: accent ? 'var(--blue-700)' : 'var(--ink-500)',
            display: 'grid', placeItems: 'center', flex: '0 0 auto',
        }}>
            <Icon name={icon} size={18} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
                fontSize: 10.5, fontWeight: 600,
                color: accent ? 'var(--blue-700)' : 'var(--ink-500)',
                textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0,
            }}>{kicker}</p>
            <p style={{
                margin: '4px 0 2px', fontSize: 17, fontWeight: 600,
                color: 'var(--ink-900)', fontVariantNumeric: 'tabular-nums',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{value}</p>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-500)' }}>{sub}</p>
        </div>
    </div>
);
