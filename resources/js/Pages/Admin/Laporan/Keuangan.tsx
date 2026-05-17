import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import AdminLayout from '@/components/AdminLayout';
import { formatRp } from '@/components/ui';
import type { PageProps } from '@/types/inertia';

type ChartPoint = { month: string; value: number; value_juta: number };

type PemasukanRow = {
    id: number;
    penyewa_nama: string;
    kamar_nomor: string;
    jumlah_bayar: number;
    tgl_bayar: string;
    status: 'pending' | 'approved' | 'rejected';
};

type Props = PageProps<{
    kpi: { total_pendapatan: number; kamar_terisi: number; total_kamar: number; tunggakan_count: number };
    chart: ChartPoint[];
    pemasukan: PemasukanRow[];
    filters: { mode: 'bulanan' | 'tahunan'; periode: string; tahun: string; bulan: string };
    tahunOptions: string[];
}>;

const BULAN = [
    { v: '1', l: 'Januari' }, { v: '2', l: 'Februari' }, { v: '3', l: 'Maret' },
    { v: '4', l: 'April' }, { v: '5', l: 'Mei' }, { v: '6', l: 'Juni' },
    { v: '7', l: 'Juli' }, { v: '8', l: 'Agustus' }, { v: '9', l: 'September' },
    { v: '10', l: 'Oktober' }, { v: '11', l: 'November' }, { v: '12', l: 'Desember' },
];

const formatDate = (s: string) => new Date(s).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

export default function LaporanKeuangan() {
    const { props } = usePage<Props>();
    const { kpi, chart, pemasukan, filters, tahunOptions } = props;
    const [tab, setTab] = useState<'ringkasan' | 'riwayat'>('ringkasan');

    const applyFilter = (next: { mode?: 'bulanan' | 'tahunan'; bulan?: string; tahun?: string }) => {
        const mode = next.mode ?? filters.mode;
        const bulan = next.bulan ?? filters.bulan;
        const tahun = next.tahun ?? filters.tahun;
        const params: Record<string, string> = { mode, tahun };
        if (mode === 'bulanan') params.bulan = bulan;
        router.get(route('admin.laporan.keuangan'), params, { preserveState: true, preserveScroll: true, replace: true });
    };

    const periodeLabel = filters.mode === 'tahunan'
        ? `Tahun ${filters.tahun}`
        : `${BULAN.find((b) => b.v === filters.bulan)?.l ?? 'Bulan'} ${filters.tahun}`;

    const exportParams: Record<string, string> = { mode: filters.mode, tahun: filters.tahun };
    if (filters.mode === 'bulanan') exportParams.bulan = filters.bulan;

    return (
        <AdminLayout title="Laporan Keuangan">
            <Head title="Laporan Keuangan" />

            {/* Filter bar */}
            <div style={{ background: 'white', borderRadius: 14, padding: 16, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                    {/* Segmented toggle: Bulanan / Tahunan */}
                    <div style={{ display: 'inline-flex', background: '#F1F5F9', borderRadius: 10, padding: 3 }}>
                        {(['bulanan', 'tahunan'] as const).map((m) => {
                            const active = filters.mode === m;
                            return (
                                <button key={m} type="button" onClick={() => applyFilter({ mode: m })}
                                    style={{
                                        padding: '8px 16px', borderRadius: 8,
                                        background: active ? 'white' : 'transparent',
                                        color: active ? '#2563EB' : '#64748B',
                                        border: 0, cursor: 'pointer',
                                        fontSize: 13, fontWeight: active ? 700 : 500,
                                        boxShadow: active ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                                        transition: 'all 150ms',
                                    }}>
                                    {m === 'bulanan' ? 'Bulanan' : 'Tahunan'}
                                </button>
                            );
                        })}
                    </div>
                    <select value={filters.bulan} onChange={(e) => applyFilter({ bulan: e.target.value })}
                        disabled={filters.mode === 'tahunan'}
                        style={{
                            height: 40, padding: '0 14px', borderRadius: 10, border: '1px solid #E5E7EB',
                            fontSize: 14, background: filters.mode === 'tahunan' ? '#F8FAFC' : 'white',
                            color: filters.mode === 'tahunan' ? '#94A3B8' : '#0F172A',
                            fontWeight: 500, minWidth: 140,
                            cursor: filters.mode === 'tahunan' ? 'not-allowed' : 'pointer',
                        }}>
                        {BULAN.map((b) => <option key={b.v} value={b.v}>{b.l}</option>)}
                    </select>
                    <select value={filters.tahun} onChange={(e) => applyFilter({ tahun: e.target.value })}
                        style={{ height: 40, padding: '0 14px', borderRadius: 10, border: '1px solid #E5E7EB', fontSize: 14, background: 'white', color: '#0F172A', fontWeight: 500 }}>
                        {tahunOptions.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <a href={route('admin.laporan.pdf', { type: 'keuangan', ...exportParams })}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '10px 18px', borderRadius: 10,
                            border: '1px solid #2563EB', color: '#2563EB',
                            fontSize: 13, fontWeight: 600,
                        }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                        Export PDF
                    </a>
                    <a href={route('admin.laporan.excel', { type: 'keuangan', ...exportParams })}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '10px 18px', borderRadius: 10,
                            border: '1px solid #2563EB', color: '#2563EB',
                            fontSize: 13, fontWeight: 600,
                        }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="9" y1="15" x2="15" y2="15" /></svg>
                        Export Excel
                    </a>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB', marginBottom: 16 }}>
                {([
                    { v: 'ringkasan', l: 'Ringkasan' },
                    { v: 'riwayat', l: 'Riwayat' },
                ] as const).map((t) => {
                    const active = tab === t.v;
                    return (
                        <button key={t.v} onClick={() => setTab(t.v)}
                            style={{
                                padding: '12px 22px',
                                fontSize: 14, fontWeight: active ? 700 : 500,
                                color: active ? '#2563EB' : '#64748B',
                                background: 'transparent', border: 0, cursor: 'pointer',
                                borderBottom: active ? '2px solid #2563EB' : '2px solid transparent',
                            }}>{t.l}</button>
                    );
                })}
            </div>

            {tab === 'ringkasan' ? (
                <>
                    {/* KPI 3 card */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }} className="kpi-row">
                        <KPICard label="Total Pendapatan" value={formatRp(kpi.total_pendapatan)} accent="#2563EB" />
                        <KPICard label="Kamar Terisi" value={`${kpi.kamar_terisi}/${kpi.total_kamar}`} accent="#10B981" />
                        <KPICard label="Tunggakan" value={`${kpi.tunggakan_count} penyewa`} accent="#EF4444" />
                    </div>

                    {/* Bar chart */}
                    <div style={{ background: 'white', borderRadius: 14, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', marginBottom: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0F172A' }}>Grafik Pendapatan Bulanan</h3>
                            <span style={{ fontSize: 12, color: '#64748B', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ width: 10, height: 10, borderRadius: 2, background: '#2563EB' }} />
                                Pendapatan (Juta Rp)
                            </span>
                        </div>
                        <ResponsiveContainer width="100%" height={320}>
                            <BarChart data={chart} margin={{ top: 16, right: 16, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false}
                                    tickFormatter={(v) => `${v}M`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }}
                                    formatter={(v: number) => [`${v.toFixed(1)} juta`, 'Pendapatan']}
                                />
                                <Bar dataKey="value_juta" fill="#2563EB" radius={[6, 6, 0, 0]} maxBarSize={48} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Detail tabel pemasukan */}
                    <div style={{ background: 'white', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9' }}>
                            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0F172A' }}>Detail Pembayaran {periodeLabel}</h3>
                        </div>
                        <DetailTable rows={pemasukan} />
                    </div>
                </>
            ) : (
                <div style={{ background: 'white', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9' }}>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0F172A' }}>Riwayat Pembayaran {periodeLabel}</h3>
                    </div>
                    <DetailTable rows={pemasukan} />
                </div>
            )}

            <style>{`
                @media (max-width: 768px) { .kpi-row { grid-template-columns: 1fr !important; } }
            `}</style>
        </AdminLayout>
    );
}

const KPICard = ({ label, value, accent }: { label: string; value: string; accent: string }) => (
    <div style={{
        background: 'white', borderRadius: 14, padding: 20,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        borderLeft: `4px solid ${accent}`,
    }}>
        <div style={{ fontSize: 13, color: '#64748B', marginBottom: 6 }}>{label}</div>
        <div style={{ fontSize: 26, fontWeight: 700, color: '#0F172A' }}>{value}</div>
    </div>
);

const DetailTable = ({ rows }: { rows: PemasukanRow[] }) => (
    <div style={{ overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
                <tr style={{ background: '#F8FAFC' }}>
                    {['No', 'Nama Penyewa', 'Kamar', 'Jumlah (Rp)', 'Tanggal Bayar', 'Status'].map((h) => (
                        <th key={h} style={{ padding: '12px 24px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.length === 0 ? (
                    <tr><td colSpan={6} style={{ padding: 48, textAlign: 'center', color: '#94A3B8' }}>
                        Tidak ada transaksi disetujui di periode ini.
                    </td></tr>
                ) : rows.map((r, i) => (
                    <tr key={r.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '14px 24px', color: '#94A3B8', fontSize: 13 }}>{i + 1}</td>
                        <td style={{ padding: '14px 24px', fontWeight: 500, color: '#0F172A' }}>{r.penyewa_nama}</td>
                        <td style={{ padding: '14px 24px', color: '#475569' }}>{r.kamar_nomor}</td>
                        <td style={{ padding: '14px 24px', color: '#0F172A', fontWeight: 600 }}>{r.jumlah_bayar.toLocaleString('id-ID')}</td>
                        <td style={{ padding: '14px 24px', color: '#475569', fontSize: 13 }}>{formatDate(r.tgl_bayar)}</td>
                        <td style={{ padding: '14px 24px' }}>
                            <span style={{
                                display: 'inline-block', padding: '3px 10px',
                                background: '#DCFCE7', color: '#15803D',
                                borderRadius: 999, fontSize: 11.5, fontWeight: 600,
                            }}>Lunas</span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);
