import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/components/AdminLayout';
import { formatRp } from '@/components/ui';
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
    filters: { status: string };
    pagination: { current_page: number; last_page: number; total: number; from: number; to: number };
}>;

const formatDate = (s: string) => new Date(s).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
const formatPeriode = (s: string) => new Date(s).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

export default function PembayaranIndex() {
    const { props } = usePage<IndexProps>();
    const { pembayaran, kpi, filters, pagination } = props;

    const switchTab = (status: 'pending' | 'approved' | 'rejected') => {
        router.get(route('admin.pembayaran.index'), { status }, { preserveState: true });
    };

    return (
        <AdminLayout title="Konfirmasi Pembayaran">
            <Head title="Konfirmasi Pembayaran" />

            {/* KPI cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }} className="kpi-row">
                <KPICard label="Menunggu Konfirmasi" value={kpi.pending} accent="#F59E0B" />
                <KPICard label="Sudah Disetujui" value={kpi.approved} accent="#10B981" />
                <KPICard label="Ditolak" value={kpi.rejected} accent="#EF4444" />
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                {([
                    { v: 'pending', l: `Pending (${kpi.pending})` },
                    { v: 'approved', l: 'Disetujui' },
                    { v: 'rejected', l: 'Ditolak' },
                ] as const).map((t) => {
                    const active = filters.status === t.v;
                    return (
                        <button key={t.v} onClick={() => switchTab(t.v)}
                            style={{
                                padding: '8px 18px', borderRadius: 999,
                                background: active ? '#2563EB' : 'white',
                                color: active ? 'white' : '#475569',
                                fontSize: 13, fontWeight: 600,
                                border: active ? 0 : '1px solid #E5E7EB',
                                cursor: 'pointer',
                            }}>{t.l}</button>
                    );
                })}
            </div>

            {/* Table */}
            <div style={{ background: 'white', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ overflow: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                        <thead>
                            <tr style={{ background: '#F8FAFC' }}>
                                {['No', 'Tgl Bayar', 'Penyewa / Kamar', 'Periode', 'Jumlah', 'Bukti', 'Aksi'].map((h) => (
                                    <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {pembayaran.length === 0 ? (
                                <tr><td colSpan={7} style={{ padding: 48, textAlign: 'center', color: '#94A3B8' }}>
                                    Tidak ada pembayaran <strong>{filters.status}</strong>.
                                </td></tr>
                            ) : pembayaran.map((p, i) => (
                                <tr key={p.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                                    <td style={{ padding: '14px 20px', color: '#94A3B8', fontSize: 13 }}>{pagination.from + i}</td>
                                    <td style={{ padding: '14px 20px', color: '#475569', fontSize: 13 }}>{formatDate(p.tgl_bayar)}</td>
                                    <td style={{ padding: '14px 20px' }}>
                                        <div style={{ fontWeight: 500, color: '#0F172A' }}>{p.penyewa_nama}</div>
                                        <div style={{ fontSize: 12, color: '#94A3B8' }}>Kamar {p.kamar_nomor}</div>
                                    </td>
                                    <td style={{ padding: '14px 20px', color: '#475569', fontSize: 13 }}>{formatPeriode(p.periode)}</td>
                                    <td style={{ padding: '14px 20px', color: '#0F172A', fontWeight: 500 }}>{formatRp(p.jumlah_bayar)}</td>
                                    <td style={{ padding: '14px 20px' }}>
                                        {p.bukti_transfer_url ? (
                                            <a href={p.bukti_transfer_url} target="_blank" rel="noopener noreferrer"
                                                style={{ color: '#2563EB', fontSize: 13, textDecoration: 'underline' }}>Lihat</a>
                                        ) : <span style={{ color: '#CBD5E1', fontSize: 13 }}>—</span>}
                                    </td>
                                    <td style={{ padding: '14px 20px' }}>
                                        <Link href={route('admin.tagihan.show', p.tagihan_id)}
                                            style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                                padding: '6px 14px', borderRadius: 8,
                                                background: '#2563EB', color: 'white',
                                                fontSize: 12, fontWeight: 600,
                                            }}>Detail →</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <style>{`@media (max-width: 768px) { .kpi-row { grid-template-columns: 1fr !important; } }`}</style>
        </AdminLayout>
    );
}

const KPICard = ({ label, value, accent }: { label: string; value: number; accent: string }) => (
    <div style={{ background: 'white', borderRadius: 14, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
            <div style={{ fontSize: 12, color: '#64748B', marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#0F172A' }}>{value}</div>
        </div>
        <div style={{ width: 40, height: 40, borderRadius: 999, background: `${accent}1A`, display: 'grid', placeItems: 'center', color: accent }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
        </div>
    </div>
);
