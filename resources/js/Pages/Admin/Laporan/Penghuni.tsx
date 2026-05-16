import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/components/AdminLayout';
import { Icon } from '@/components/ui';
import type { PageProps } from '@/types/inertia';

type PenghuniRow = {
    id: number;
    penyewa_nama: string;
    no_hp: string;
    kamar_nomor: string;
    tgl_mulai: string;
    tgl_selesai: string | null;
    status: string;
};

type Props = PageProps<{
    penghuni: PenghuniRow[];
    kpi: { aktif: number; selesai: number };
    filters: { periode: string };
}>;

const formatDate = (s: string) => new Date(s).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

export default function LaporanPenghuni() {
    const { props } = usePage<Props>();
    const { penghuni, kpi, filters } = props;

    return (
        <AdminLayout title="Rekap Penghuni">
            <Head title="Rekap Penghuni" />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                <input type="month"
                    value={filters.periode}
                    onChange={(e) => router.get(route('admin.laporan.penghuni'), { periode: e.target.value }, { preserveScroll: true })}
                    style={{ height: 40, padding: '0 14px', borderRadius: 10, border: '1px solid #E5E7EB', fontSize: 14, background: 'white' }} />

                <div style={{ display: 'flex', gap: 8 }}>
                    <Link href={route('admin.laporan.keuangan', { periode: filters.periode })}
                        style={{ padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 500, color: '#64748B' }}>
                        ← Laporan Keuangan
                    </Link>
                    <a href={route('admin.laporan.pdf', { type: 'penghuni', periode: filters.periode })}
                        style={{ padding: '10px 18px', borderRadius: 10, border: '1px solid #2563EB', color: '#2563EB', fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        <Icon name="download" size={15} /> Export PDF
                    </a>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 16 }}>
                <KPICard label="Penghuni Aktif (saat ini)" value={kpi.aktif} accent="#10B981" />
                <KPICard label="Selesai dalam periode" value={kpi.selesai} accent="#64748B" />
            </div>

            <div style={{ background: 'white', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead>
                        <tr style={{ background: '#F8FAFC' }}>
                            {['Kamar', 'Penyewa', 'No HP', 'Mulai', 'Selesai', 'Status'].map((h) => (
                                <th key={h} style={{ padding: '12px 24px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {penghuni.length === 0 ? (
                            <tr><td colSpan={6} style={{ padding: 48, textAlign: 'center', color: '#94A3B8' }}>Tidak ada penghuni di periode ini.</td></tr>
                        ) : penghuni.map((p) => (
                            <tr key={p.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                                <td style={{ padding: '14px 24px', fontWeight: 500 }}>{p.kamar_nomor}</td>
                                <td style={{ padding: '14px 24px' }}>{p.penyewa_nama}</td>
                                <td style={{ padding: '14px 24px', color: '#475569', fontSize: 13 }}>{p.no_hp}</td>
                                <td style={{ padding: '14px 24px', color: '#475569', fontSize: 13 }}>{formatDate(p.tgl_mulai)}</td>
                                <td style={{ padding: '14px 24px', color: '#475569', fontSize: 13 }}>{p.tgl_selesai ? formatDate(p.tgl_selesai) : '—'}</td>
                                <td style={{ padding: '14px 24px' }}>
                                    <span style={{
                                        display: 'inline-block', padding: '3px 10px',
                                        background: p.status === 'aktif' ? '#DCFCE7' : '#F1F5F9',
                                        color: p.status === 'aktif' ? '#15803D' : '#64748B',
                                        borderRadius: 999, fontSize: 11.5, fontWeight: 600,
                                    }}>{p.status.charAt(0).toUpperCase() + p.status.slice(1)}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}

const KPICard = ({ label, value, accent }: { label: string; value: number; accent: string }) => (
    <div style={{ background: 'white', borderRadius: 14, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', borderLeft: `4px solid ${accent}` }}>
        <div style={{ fontSize: 13, color: '#64748B', marginBottom: 6 }}>{label}</div>
        <div style={{ fontSize: 26, fontWeight: 700, color: '#0F172A' }}>{value}</div>
    </div>
);
