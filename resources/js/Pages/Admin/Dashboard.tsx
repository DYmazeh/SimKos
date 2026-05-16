import { Head, Link, usePage } from '@inertiajs/react';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import AdminLayout from '@/components/AdminLayout';
import { Icon, formatRp } from '@/components/ui';
import type { PageProps } from '@/types/inertia';

type Stats = {
    total_kamar: number;
    kamar_terisi: number;
    kamar_tersedia: number;
    kamar_maintenance: number;
    sewa_aktif: number;
    tagihan_jatuh_tempo_horizon: number;
    menunggu_verifikasi: number;
    pemasukan_bulan_ini: number;
};

type ReminderItem = {
    id: number;
    penyewa_nama: string;
    penyewa_avatar?: string | null;
    kamar_nomor: string;
    periode: string;
    jumlah: number;
    tgl_jatuh_tempo: string;
    status: 'belum_bayar' | 'terlambat' | 'menunggu_verifikasi' | 'lunas';
    wa_link: string | null;
};

type VerifikasiItem = {
    id: number;
    tagihan_id: number;
    penyewa_nama: string;
    kamar_nomor: string;
    periode: string;
    jumlah_bayar: number;
};

type AdminDashboardProps = PageProps<{
    stats: Stats;
    reminderList: ReminderItem[];
    verifikasiList: VerifikasiItem[];
    reminderDays: number;
    revenueChart?: Array<{ month: string; value: number }>;
}>;

// 6 bulan terakhir fallback kalau backend belum kirim revenueChart
const DEFAULT_REVENUE = [
    { month: 'Jan', value: 4200 },
    { month: 'Feb', value: 5100 },
    { month: 'Mar', value: 4700 },
    { month: 'Apr', value: 6200 },
    { month: 'Mei', value: 5800 },
    { month: 'Jun', value: 7100 },
];

const StatusPill = ({ status }: { status: ReminderItem['status'] }) => {
    const map: Record<ReminderItem['status'], { label: string; bg: string; color: string }> = {
        lunas: { label: 'Lunas', bg: '#DCFCE7', color: '#15803D' },
        menunggu_verifikasi: { label: 'Menunggu', bg: '#FEF3C7', color: '#92400E' },
        belum_bayar: { label: 'Belum Bayar', bg: '#FEE2E2', color: '#991B1B' },
        terlambat: { label: 'Terlambat', bg: '#FEE2E2', color: '#991B1B' },
    };
    const s = map[status];
    return (
        <span style={{
            display: 'inline-block', padding: '4px 12px',
            borderRadius: 999, fontSize: 12, fontWeight: 600,
            background: s.bg, color: s.color,
        }}>{s.label}</span>
    );
};

const Avatar = ({ name }: { name: string }) => {
    const initial = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
    return (
        <div style={{
            width: 32, height: 32, borderRadius: 999,
            background: 'linear-gradient(135deg, #93C5FD, #2563EB)',
            color: 'white', display: 'grid', placeItems: 'center',
            fontSize: 11, fontWeight: 600, flexShrink: 0,
        }}>{initial}</div>
    );
};

export default function AdminDashboard() {
    const { props } = usePage<AdminDashboardProps>();
    const { stats, reminderList, revenueChart } = props;

    const kpiCards = [
        { label: 'Total Kamar', value: stats.total_kamar, color: '#3B82F6', icon: <BlueHomeIcon /> },
        { label: 'Kamar Terisi', value: stats.kamar_terisi, color: '#10B981', icon: <GreenCheckIcon /> },
        { label: 'Kamar Kosong', value: stats.kamar_tersedia, color: '#F59E0B', icon: <YellowKeyIcon /> },
        { label: 'Belum Lunas', value: stats.tagihan_jatuh_tempo_horizon, color: '#EF4444', icon: <RedWalletIcon /> },
    ];

    const donutData = [
        { name: 'Terisi', value: stats.kamar_terisi, color: '#2563EB' },
        { name: 'Kosong', value: stats.kamar_tersedia, color: '#F59E0B' },
    ];

    const revenue = (revenueChart && revenueChart.length > 0) ? revenueChart : DEFAULT_REVENUE;

    return (
        <AdminLayout title="Dashboard">
            <Head title="Dashboard Admin" />

            {/* KPI cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
                {kpiCards.map((c, i) => (
                    <div key={i} style={{
                        background: 'white',
                        borderRadius: 14,
                        padding: 20,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    }}>
                        <div>
                            <div style={{ fontSize: 13, color: '#64748B', marginBottom: 6 }}>{c.label}</div>
                            <div style={{ fontSize: 28, fontWeight: 700, color: '#0F172A' }}>{c.value}</div>
                        </div>
                        {c.icon}
                    </div>
                ))}
            </div>

            {/* Charts row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24 }} className="charts-row">
                {/* Line chart pendapatan */}
                <div style={{ background: 'white', borderRadius: 14, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#0F172A' }}>Ringkasan Pendapatan</h3>
                        <span style={{
                            padding: '6px 14px', borderRadius: 999,
                            background: '#F1F5F9', color: '#64748B',
                            fontSize: 12, fontWeight: 500,
                        }}>6 Bulan Terakhir</span>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={revenue} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="revArea" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.5} />
                                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.05} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }}
                                formatter={(v: number) => [`Rp ${v.toLocaleString('id-ID')}`, 'Pendapatan']}
                            />
                            <Area type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={2} fill="url(#revArea)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Donut status kamar */}
                <div style={{ background: 'white', borderRadius: 14, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: '#0F172A' }}>Status Kamar</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie data={donutData} dataKey="value" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
                                {donutData.map((d, i) => <Cell key={i} fill={d.color} />)}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 8 }}>
                        {donutData.map((d) => (
                            <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ width: 10, height: 10, borderRadius: 2, background: d.color }} />
                                <span style={{ fontSize: 12, color: '#475569' }}>{d.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tagihan Terbaru */}
            <div style={{ background: 'white', borderRadius: 14, padding: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#0F172A' }}>Tagihan Terbaru</h3>
                    <Link href={route('admin.tagihan.index')} style={{ fontSize: 13, fontWeight: 500, color: '#2563EB' }}>
                        Lihat Semua
                    </Link>
                </div>

                {reminderList.length === 0 ? (
                    <div style={{ padding: 32, textAlign: 'center', color: '#94A3B8', fontSize: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                        <span style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(31,143,91,0.10)', color: 'var(--success)', display: 'grid', placeItems: 'center' }}>
                            <Icon name="sparkles" size={22} />
                        </span>
                        Tidak ada tagihan yang perlu diingatkan.
                    </div>
                ) : (
                    <div style={{ overflow: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                            <thead>
                                <tr style={{ background: '#F8FAFC' }}>
                                    {['Nama Penyewa', 'Kamar', 'Jumlah', 'Status', 'Aksi'].map((h) => (
                                        <th key={h} style={{ padding: '12px 24px', textAlign: h === 'Aksi' ? 'right' : 'left', fontSize: 11, color: '#64748B', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {reminderList.slice(0, 5).map((t) => (
                                    <tr key={t.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                                        <td style={{ padding: '14px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <Avatar name={t.penyewa_nama} />
                                                <span style={{ fontWeight: 500, color: '#0F172A' }}>{t.penyewa_nama}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '14px 24px', color: '#475569' }}>{t.kamar_nomor}</td>
                                        <td style={{ padding: '14px 24px', color: '#0F172A', fontWeight: 500 }}>{formatRp(t.jumlah)}</td>
                                        <td style={{ padding: '14px 24px' }}><StatusPill status={t.status} /></td>
                                        <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                                            {t.wa_link ? (
                                                <a href={t.wa_link} target="_blank" rel="noopener noreferrer"
                                                    style={{
                                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                        width: 32, height: 32, borderRadius: 8,
                                                        background: '#DCFCE7', color: '#16A34A',
                                                    }} aria-label="Kirim WhatsApp">
                                                    <Icon name="logo-wa" size={16} />
                                                </a>
                                            ) : (
                                                <span style={{ color: '#CBD5E1', fontSize: 12 }}>—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <style>{`
                @media (max-width: 1024px) {
                    .charts-row { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </AdminLayout>
    );
}

/* ============================================================
   KPI inline icons
   ============================================================ */
const BlueHomeIcon = () => (
    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#EFF6FF', color: '#2563EB', display: 'grid', placeItems: 'center' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" />
        </svg>
    </div>
);
const GreenCheckIcon = () => (
    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#D1FAE5', color: '#10B981', display: 'grid', placeItems: 'center' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" />
            <path d="M16 11l2 2 4-4" stroke="#15803D" />
        </svg>
    </div>
);
const YellowKeyIcon = () => (
    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FEF3C7', color: '#D97706', display: 'grid', placeItems: 'center' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="7.5" cy="15.5" r="3.5" /><path d="M21 2l-9.6 9.6M15.5 7.5l3 3" />
        </svg>
    </div>
);
const RedWalletIcon = () => (
    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FEE2E2', color: '#EF4444', display: 'grid', placeItems: 'center' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="6" width="18" height="14" rx="2" /><path d="M3 10h18M16 14h2" />
        </svg>
    </div>
);
