import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { Icon, Pill, formatRp } from '@/components/ui';
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
    kamar_nomor: string;
    periode: string;
    jumlah: number;
    tgl_jatuh_tempo: string;
    status: 'belum_bayar' | 'terlambat';
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
}>;

const formatDate = (s: string) => {
    const d = new Date(s);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatMonth = (s: string) => {
    const d = new Date(s);
    return d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
};

const daysUntil = (s: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(s);
    target.setHours(0, 0, 0, 0);
    return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export default function AdminDashboard() {
    const { props } = usePage<AdminDashboardProps>();
    const { stats, reminderList, verifikasiList, reminderDays, auth } = props;

    const cards = [
        { label: 'Total Kamar', value: stats.total_kamar, color: '#3b82f6' },
        { label: 'Kamar Terisi', value: stats.kamar_terisi, color: '#10b981' },
        { label: 'Kamar Tersedia', value: stats.kamar_tersedia, color: '#f59e0b' },
        { label: 'Maintenance', value: stats.kamar_maintenance, color: '#6b7280' },
        { label: 'Sewa Aktif', value: stats.sewa_aktif, color: '#6366f1' },
        { label: 'Perlu Diingatkan', value: stats.tagihan_jatuh_tempo_horizon, color: '#f43f5e' },
        { label: 'Menunggu Verifikasi', value: stats.menunggu_verifikasi, color: '#a855f7' },
        { label: 'Pemasukan Bulan Ini', value: formatRp(stats.pemasukan_bulan_ini), color: '#14b8a6' },
    ];

    return (
        <AuthenticatedLayout
            header={<h2 className="h-2" style={{ margin: 0 }}>Dashboard Admin</h2>}
        >
            <Head title="Dashboard Admin" />

            <div className="card-solid" style={{ padding: 24, marginBottom: 20 }}>
                <p style={{ margin: 0, color: 'var(--ink-700)' }}>
                    Halo, <strong>{auth.user?.name}</strong> 👋 — Selamat datang kembali di SimKos.
                </p>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
                {cards.map((c, i) => (
                    <div key={i} className="card-solid" style={{ padding: 16, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <div style={{ width: 4, height: 44, borderRadius: 2, background: c.color }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, color: 'var(--ink-500)', marginBottom: 4 }}>{c.label}</div>
                            <div style={{ fontSize: 22, fontWeight: 600 }}>{c.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Reminder list */}
            <div className="card-solid" style={{ padding: 0, marginBottom: 20 }}>
                <div style={{ padding: 20, borderBottom: '1px solid rgba(11,13,26,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                        <h3 className="h-3" style={{ margin: 0 }}>📋 Pengingat Pembayaran</h3>
                        <p style={{ fontSize: 12, color: 'var(--ink-500)', margin: '4px 0 0' }}>
                            Tagihan jatuh tempo dalam {reminderDays} hari ke depan atau sudah lewat
                        </p>
                    </div>
                    <Link href={route('admin.tagihan.index', { status: 'terlambat' })}
                        className="btn btn-link" style={{ fontSize: 13, color: 'var(--blue-600)' }}>
                        Lihat semua →
                    </Link>
                </div>

                {reminderList.length === 0 ? (
                    <div style={{ padding: 32, textAlign: 'center', color: 'var(--ink-500)' }}>
                        🎉 Tidak ada tagihan yang perlu diingatkan saat ini.
                    </div>
                ) : (
                    <div style={{ overflow: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(11,13,26,0.06)', background: 'var(--ink-50)' }}>
                                    <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, textTransform: 'uppercase', color: 'var(--ink-500)', letterSpacing: '0.05em' }}>Penyewa</th>
                                    <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, textTransform: 'uppercase', color: 'var(--ink-500)', letterSpacing: '0.05em' }}>Kamar</th>
                                    <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, textTransform: 'uppercase', color: 'var(--ink-500)', letterSpacing: '0.05em' }}>Periode</th>
                                    <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, textTransform: 'uppercase', color: 'var(--ink-500)', letterSpacing: '0.05em' }}>Jumlah</th>
                                    <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, textTransform: 'uppercase', color: 'var(--ink-500)', letterSpacing: '0.05em' }}>Jatuh Tempo</th>
                                    <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, textTransform: 'uppercase', color: 'var(--ink-500)', letterSpacing: '0.05em' }}>Status</th>
                                    <th style={{ padding: '10px 16px', textAlign: 'right', fontSize: 11, textTransform: 'uppercase', color: 'var(--ink-500)', letterSpacing: '0.05em' }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reminderList.map((t) => {
                                    const days = daysUntil(t.tgl_jatuh_tempo);
                                    return (
                                        <tr key={t.id} style={{ borderBottom: '1px solid rgba(11,13,26,0.04)', background: t.status === 'terlambat' ? 'rgba(244,63,94,0.04)' : 'transparent' }}>
                                            <td style={{ padding: '12px 16px', fontWeight: 500 }}>{t.penyewa_nama}</td>
                                            <td style={{ padding: '12px 16px' }}>{t.kamar_nomor}</td>
                                            <td style={{ padding: '12px 16px', fontSize: 12 }}>{formatMonth(t.periode)}</td>
                                            <td style={{ padding: '12px 16px' }}>{formatRp(t.jumlah)}</td>
                                            <td style={{ padding: '12px 16px', fontSize: 12 }}>
                                                <div>{formatDate(t.tgl_jatuh_tempo)}</div>
                                                <div style={{ color: 'var(--ink-500)', fontSize: 11 }}>
                                                    {days < 0 ? <span style={{ color: 'var(--danger)', fontWeight: 500 }}>Lewat {Math.abs(days)} hari</span>
                                                    : days === 0 ? <span style={{ color: 'var(--warning)', fontWeight: 500 }}>Hari ini</span>
                                                    : `${days} hari lagi`}
                                                </div>
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <Pill tone={t.status === 'terlambat' ? 'warning' : 'neutral'}>
                                                    {t.status === 'terlambat' ? 'Terlambat' : 'Belum bayar'}
                                                </Pill>
                                            </td>
                                            <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                                {t.wa_link ? (
                                                    <a href={t.wa_link} target="_blank" rel="noopener noreferrer"
                                                        style={{
                                                            display: 'inline-flex', alignItems: 'center', gap: 6,
                                                            padding: '6px 12px', borderRadius: 999,
                                                            background: '#25D366', color: 'white',
                                                            fontSize: 12, fontWeight: 500,
                                                        }}>
                                                        <Icon name="logo-wa" size={14} /> Ingatkan
                                                    </a>
                                                ) : (
                                                    <span style={{ fontSize: 11, color: 'var(--ink-400)' }}>No HP invalid</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Verifikasi list */}
            <div className="card-solid" style={{ padding: 0 }}>
                <div style={{ padding: 20, borderBottom: '1px solid rgba(11,13,26,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="h-3" style={{ margin: 0 }}>🧾 Bukti Menunggu Verifikasi</h3>
                    <Link href={route('admin.pembayaran.index')} className="btn btn-link" style={{ fontSize: 13, color: 'var(--blue-600)' }}>
                        Lihat semua →
                    </Link>
                </div>
                {verifikasiList.length === 0 ? (
                    <div style={{ padding: 32, textAlign: 'center', color: 'var(--ink-500)', fontSize: 14 }}>
                        Tidak ada bukti pembayaran yang menunggu verifikasi.
                    </div>
                ) : (
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                        {verifikasiList.map((v) => (
                            <li key={v.id} style={{ padding: 16, borderBottom: '1px solid rgba(11,13,26,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 500 }}>{v.penyewa_nama}</div>
                                    <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>
                                        Kamar {v.kamar_nomor} · {formatMonth(v.periode)} · {formatRp(v.jumlah_bayar)}
                                    </div>
                                </div>
                                <Link href={route('admin.tagihan.show', v.tagihan_id)} className="btn btn-primary btn-sm">
                                    Verifikasi →
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
