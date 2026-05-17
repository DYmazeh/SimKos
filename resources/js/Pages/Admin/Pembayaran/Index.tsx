import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Icon, Pill, formatRp, formatDateTime } from '@/components/ui';
import type { PageProps } from '@/types/inertia';

type PembayaranRow = {
    id: number;
    tagihan_id: number;
    penyewa_nama: string;
    penyewa_id: number | null;
    kamar_nomor: string;
    periode: string;
    jumlah_bayar: number;
    tgl_bayar: string;
    metode: string;
    status_verifikasi: 'pending' | 'approved' | 'rejected';
    bukti_transfer_url: string | null;
};

type IndexProps = PageProps<{
    pembayaran: PembayaranRow[];
    kpi: { pending: number; approved: number; rejected: number };
    filters: { status: string; q?: string };
    pagination: { current_page: number; last_page: number; total: number; from: number; to: number };
}>;

const formatDate = formatDateTime;

const statusMeta = (status: PembayaranRow['status_verifikasi']): { label: string; tone: 'warning' | 'success' | 'neutral' } => {
    if (status === 'approved') return { label: 'Disetujui', tone: 'success' };
    if (status === 'rejected') return { label: 'Ditolak', tone: 'neutral' };
    return { label: 'Menunggu', tone: 'warning' };
};

const KPICard = ({ label, value, accent }: { label: string; value: number; accent: 'warning' | 'success' | 'danger' }) => {
    const color = accent === 'warning' ? '#8a6c10' : accent === 'success' ? 'var(--success)' : 'var(--danger)';
    const bg = accent === 'warning' ? 'rgba(200,158,42,0.10)' : accent === 'success' ? 'rgba(31,143,91,0.10)' : 'rgba(210,68,50,0.10)';
    return (
        <div style={{
            background: 'white', borderRadius: 14, padding: 20,
            border: '1px solid rgba(11,13,26,0.06)',
            boxShadow: '0 1px 2px rgba(11,13,26,0.03)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
        }}>
            <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, color: 'var(--ink-500)', marginBottom: 6 }}>{label}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--ink-900)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
                    {value}
                </div>
            </div>
            <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: bg, color, display: 'grid', placeItems: 'center', flex: '0 0 auto',
            }}>
                <Icon name={accent === 'warning' ? 'clock' : accent === 'success' ? 'check' : 'x'} size={22} stroke={accent === 'success' || accent === 'danger' ? 2.4 : 1.6} />
            </div>
        </div>
    );
};

export default function PembayaranIndex() {
    const { props } = usePage<IndexProps>();
    const { pembayaran, kpi, filters, pagination } = props;
    const [q, setQ] = useState(filters.q || '');

    useEffect(() => {
        const t = setTimeout(() => {
            router.get(route('admin.pembayaran.index'), { status: filters.status, q }, {
                preserveState: true, preserveScroll: true, replace: true,
            });
        }, 350);
        return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q]);

    const switchTab = (status: 'pending' | 'approved' | 'rejected') => {
        router.get(route('admin.pembayaran.index'), { status, q }, { preserveState: true });
    };

    const currentStatus = (filters.status || 'pending') as 'pending' | 'approved' | 'rejected';

    return (
        <AdminLayout title="Konfirmasi Pembayaran">
            <Head title="Konfirmasi Pembayaran" />

            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" style={{ fontSize: 13, color: 'var(--ink-500)', marginBottom: 18 }}>
                <span>Pembayaran</span>
                <span style={{ color: 'var(--ink-300)', margin: '0 8px' }}>/</span>
                <span style={{ color: 'var(--ink-900)', fontWeight: 600 }}>Konfirmasi Pembayaran</span>
            </nav>

            {/* KPI cards */}
            <div className="kpi-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 18 }}>
                <KPICard label="Menunggu Konfirmasi" value={kpi.pending} accent="warning" />
                <KPICard label="Sudah Disetujui" value={kpi.approved} accent="success" />
                <KPICard label="Ditolak" value={kpi.rejected} accent="danger" />
            </div>

            {/* Tabs */}
            <div role="tablist" aria-label="Filter status pembayaran" style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                {([
                    { v: 'pending', l: `Menunggu (${kpi.pending})` },
                    { v: 'approved', l: 'Disetujui' },
                    { v: 'rejected', l: 'Ditolak' },
                ] as const).map((t) => {
                    const active = currentStatus === t.v;
                    return (
                        <button key={t.v} onClick={() => switchTab(t.v)}
                            role="tab"
                            aria-selected={active}
                            aria-controls="pembayaran-tabpanel"
                            id={`pembayaran-tab-${t.v}`}
                            tabIndex={active ? 0 : -1}
                            style={{
                                padding: '8px 18px', borderRadius: 999,
                                background: active ? 'var(--blue-600)' : 'white',
                                color: active ? 'white' : 'var(--ink-500)',
                                fontSize: 13, fontWeight: 600,
                                border: active ? 0 : '1px solid rgba(11,13,26,0.10)',
                                cursor: 'pointer',
                            }}>{t.l}</button>
                    );
                })}
            </div>

            {/* Table card */}
            <section
                role="tabpanel"
                id="pembayaran-tabpanel"
                aria-labelledby={`pembayaran-tab-${currentStatus}`}
                style={{
                    background: 'white', borderRadius: 14, overflow: 'hidden',
                    border: '1px solid rgba(11,13,26,0.06)',
                    boxShadow: '0 1px 2px rgba(11,13,26,0.03)',
                }}>
                <header style={{ padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--ink-900)' }}>
                        Daftar {currentStatus === 'pending' ? 'Tunggu Pembayaran' : currentStatus === 'approved' ? 'Pembayaran Disetujui' : 'Pembayaran Ditolak'}
                    </h3>
                    <div style={{ position: 'relative', minWidth: 240 }}>
                        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-400)' }}>
                            <Icon name="search" size={16} />
                        </span>
                        <input type="search" placeholder="Cari penyewa..."
                            value={q} onChange={(e) => setQ(e.target.value)}
                            style={{ width: '100%', height: 38, paddingLeft: 40, paddingRight: 14, borderRadius: 10, border: '1px solid rgba(11,13,26,0.10)', fontSize: 13.5, background: 'var(--ink-50)' }} />
                    </div>
                </header>

                {pembayaran.length === 0 ? (
                    <div style={{ padding: 48, textAlign: 'center', color: 'var(--ink-500)' }}>
                        <div style={{
                            width: 48, height: 48, borderRadius: 12,
                            background: 'var(--ink-50)', color: 'var(--ink-400)',
                            display: 'inline-grid', placeItems: 'center', marginBottom: 10,
                        }}>
                            <Icon name="receipt-search" size={22} />
                        </div>
                        <p style={{ margin: 0, fontSize: 14 }}>
                            Tidak ada pembayaran dalam kategori ini.
                        </p>
                    </div>
                ) : (
                    <div style={{ overflow: 'auto', borderTop: '1px solid rgba(11,13,26,0.06)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    {['No', 'Nama Penyewa', 'Kamar', 'Jumlah (Rp)', 'Tanggal Upload', 'Status', 'Aksi'].map((h, i) => (
                                        <th key={h} style={{
                                            padding: '14px 22px',
                                            textAlign: i === 6 ? 'right' : 'left',
                                            fontSize: 11, fontWeight: 600, color: 'var(--ink-500)',
                                            textTransform: 'uppercase', letterSpacing: '0.06em',
                                            background: 'var(--ink-50)',
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {pembayaran.map((p, i) => {
                                    const meta = statusMeta(p.status_verifikasi);
                                    return (
                                        <tr key={p.id} style={{ borderTop: '1px solid rgba(11,13,26,0.06)' }}>
                                            <td style={{ padding: '14px 22px', color: 'var(--ink-400)', fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>
                                                {pagination.from + i}
                                            </td>
                                            <td style={{ padding: '14px 22px', fontWeight: 600, color: 'var(--ink-900)', fontSize: 14 }}>{p.penyewa_nama}</td>
                                            <td style={{ padding: '14px 22px', fontSize: 13, color: 'var(--ink-700)' }}>{p.kamar_nomor}</td>
                                            <td style={{ padding: '14px 22px', fontWeight: 700, color: 'var(--ink-900)', fontSize: 14, fontVariantNumeric: 'tabular-nums' }}>
                                                {formatRp(p.jumlah_bayar)}
                                            </td>
                                            <td style={{ padding: '14px 22px', fontSize: 12.5, color: 'var(--ink-500)', fontVariantNumeric: 'tabular-nums' }}>
                                                {formatDate(p.tgl_bayar)}
                                            </td>
                                            <td style={{ padding: '14px 22px' }}>
                                                <Pill tone={meta.tone}>{meta.label}</Pill>
                                            </td>
                                            <td style={{ padding: '14px 22px', textAlign: 'right' }}>
                                                <Link href={route('admin.pembayaran.show', p.id)}
                                                    style={{
                                                        fontSize: 13, fontWeight: 600, color: 'var(--blue-600)',
                                                        textDecoration: 'none',
                                                    }}>
                                                    Lihat Detail
                                                </Link>
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
                        padding: '14px 22px', borderTop: '1px solid rgba(11,13,26,0.06)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        flexWrap: 'wrap', gap: 12,
                    }}>
                        <div style={{ fontSize: 13, color: 'var(--ink-500)', fontVariantNumeric: 'tabular-nums' }}>
                            Menampilkan {pagination.from}-{pagination.to} dari {pagination.total} data
                        </div>
                        <div style={{ display: 'flex', gap: 4 }}>
                            <button disabled={pagination.current_page <= 1}
                                onClick={() => router.get(route('admin.pembayaran.index'), { status: filters.status, q, page: pagination.current_page - 1 }, { preserveScroll: true })}
                                style={pageArrowStyle(pagination.current_page <= 1)}>
                                <Icon name="arrow-left" size={14} />
                            </button>
                            {Array.from({ length: Math.min(pagination.last_page, 5) }).map((_, idx) => {
                                const page = idx + 1;
                                const active = page === pagination.current_page;
                                return (
                                    <button key={page}
                                        onClick={() => router.get(route('admin.pembayaran.index'), { status: filters.status, q, page }, { preserveScroll: true })}
                                        style={{
                                            minWidth: 32, height: 32, padding: '0 8px', borderRadius: 8,
                                            border: active ? 0 : '1px solid rgba(11,13,26,0.10)',
                                            background: active ? 'var(--blue-600)' : 'white',
                                            color: active ? 'white' : 'var(--ink-700)',
                                            fontWeight: active ? 600 : 500, fontSize: 13,
                                            cursor: 'pointer', fontVariantNumeric: 'tabular-nums',
                                        }}>
                                        {page}
                                    </button>
                                );
                            })}
                            <button disabled={pagination.current_page >= pagination.last_page}
                                onClick={() => router.get(route('admin.pembayaran.index'), { status: filters.status, q, page: pagination.current_page + 1 }, { preserveScroll: true })}
                                style={pageArrowStyle(pagination.current_page >= pagination.last_page)}>
                                <Icon name="arrow-right" size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </section>

            <style>{`@media (max-width: 768px) { .kpi-row { grid-template-columns: 1fr !important; } }`}</style>
        </AdminLayout>
    );
}

const pageArrowStyle = (disabled: boolean): React.CSSProperties => ({
    width: 32, height: 32, borderRadius: 8,
    border: '1px solid rgba(11,13,26,0.10)', background: 'white',
    color: disabled ? 'var(--ink-300)' : 'var(--ink-700)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'grid', placeItems: 'center',
});
