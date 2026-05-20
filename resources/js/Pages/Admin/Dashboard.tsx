import { Head, Link, usePage } from '@inertiajs/react';
import AdminLayout from '@/components/AdminLayout';
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
    status: 'belum_bayar' | 'terlambat' | 'menunggu_verifikasi' | 'lunas';
    wa_link: string;
};

type PembayaranTerbaruItem = {
    id: number;
    tagihan_id: number;
    penyewa_nama: string;
    kamar_nomor: string;
    periode: string | null;
    jumlah_bayar: number;
    tgl_jatuh_tempo: string | null;
    status_verifikasi: 'pending' | 'approved' | 'rejected';
    tagihan_status: 'belum_bayar' | 'terlambat' | 'menunggu_verifikasi' | 'lunas' | null;
};

type KamarAkanKosongItem = {
    id: number;
    kamar_id: number | null;
    kamar_nomor: string;
    tipe: string;
    penyewa_nama: string;
    tgl_selesai: string;
    sisa_hari: number;
};

type DashboardProps = PageProps<{
    stats: Stats;
    reminderList: ReminderItem[];
    reminderTotalCount: number;
    pembayaranTerbaru: PembayaranTerbaruItem[];
    pembayaranPendingCount: number;
    kamarAkanKosong: KamarAkanKosongItem[];
    kamarAkanKosongTotal: number;
}>;

const formatDate = (s: string | null) => s
    ? new Date(s).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

/* Status text untuk Peringatan Jatuh Tempo (dynamic based on tgl_jatuh_tempo) */
const reminderStatus = (item: ReminderItem) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(item.tgl_jatuh_tempo);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: `Terlambat ${Math.abs(diffDays)} hari`, tone: 'warning' as const };
    if (diffDays === 0) return { label: 'Jatuh Tempo Hari Ini', tone: 'warning' as const };
    if (diffDays === 1) return { label: 'Jatuh Tempo Besok', tone: 'warning' as const };
    return { label: `H-${diffDays} Jatuh Tempo`, tone: 'info' as const };
};

const verifikasiPill = (status: PembayaranTerbaruItem['status_verifikasi'], _tagihanStatus: PembayaranTerbaruItem['tagihan_status']) => {
    if (status === 'approved') return { label: 'Lunas', tone: 'success' as const };
    if (status === 'pending') return { label: 'Menunggu', tone: 'warning' as const };
    // Rejected = admin sudah explicit menolak bukti transfer. Tampilkan
    // "Ditolak" (tone danger), bukan "Belum Bayar" — penyewa sudah coba bayar
    // tapi diverifikasi tidak valid, jadi misleading kalau disebut belum bayar.
    if (status === 'rejected') return { label: 'Ditolak', tone: 'danger' as const };
    return { label: 'Lunas', tone: 'success' as const };
};

const Avatar = ({ name }: { name: string }) => {
    const initial = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
    return (
        <div style={{
            width: 36, height: 36, borderRadius: 999,
            background: 'linear-gradient(135deg, var(--blue-400), var(--blue-700))',
            color: 'white', display: 'grid', placeItems: 'center',
            fontSize: 12, fontWeight: 600, flex: '0 0 auto',
            letterSpacing: '-0.01em',
        }}>{initial}</div>
    );
};

const KPI = ({ label, value, accent, icon }: {
    label: string;
    value: string | number;
    accent: 'blue' | 'green' | 'amber' | 'indigo';
    icon: 'home' | 'check' | 'user' | 'wallet';
}) => {
    const palette = {
        blue:   { bg: 'var(--blue-50)',  fg: 'var(--blue-700)'   },
        green:  { bg: 'rgba(31,143,91,0.10)',  fg: 'var(--success)' },
        amber:  { bg: 'rgba(200,158,42,0.12)', fg: '#8a6c10'  },
        indigo: { bg: 'var(--blue-50)',  fg: 'var(--blue-700)'   },
    }[accent];
    return (
        <div style={{
            background: 'white', borderRadius: 14, padding: 18,
            border: '1px solid rgba(11,13,26,0.06)',
            boxShadow: '0 1px 2px rgba(11,13,26,0.03)',
            display: 'flex', alignItems: 'center', gap: 14,
        }}>
            <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: palette.bg, color: palette.fg,
                display: 'grid', placeItems: 'center', flex: '0 0 auto',
            }}>
                <Icon name={icon === 'wallet' ? 'wallet' : icon === 'home' ? 'home' : icon === 'check' ? 'check' : 'user'} size={22} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 13, color: 'var(--ink-500)', marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink-900)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {value}
                </div>
            </div>
        </div>
    );
};

export default function AdminDashboard() {
    const { props } = usePage<DashboardProps>();
    const { stats, reminderList, reminderTotalCount, pembayaranTerbaru, pembayaranPendingCount, kamarAkanKosong, kamarAkanKosongTotal } = props;

    return (
        <AdminLayout title="Dashboard">
            <Head title="Dashboard Admin" />

            {/* ───── KPI cards ───── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 22 }}>
                <KPI label="Total Kamar" value={stats.total_kamar} accent="blue" icon="home" />
                <KPI label="Kamar Terisi" value={stats.kamar_terisi} accent="green" icon="check" />
                <KPI label="Kamar Kosong" value={stats.kamar_tersedia} accent="amber" icon="user" />
                <KPI label="Pendapatan Bulan Ini" value={formatRp(stats.pemasukan_bulan_ini)} accent="indigo" icon="wallet" />
            </div>

            {/* ───── Peringatan Jatuh Tempo ───── */}
            <section style={{
                background: 'white', borderRadius: 14, marginBottom: 22, overflow: 'hidden',
                border: '1px solid rgba(11,13,26,0.06)',
                boxShadow: '0 1px 2px rgba(11,13,26,0.03)',
                position: 'relative',
            }}>
                {/* Red vertical accent */}
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'var(--danger)' }} />
                <header style={{
                    padding: '18px 22px 14px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    flexWrap: 'wrap', gap: 12,
                }}>
                    <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--ink-900)', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                        <Icon name="alert-circle" size={18} style={{ color: 'var(--danger)' }} />
                        Peringatan Jatuh Tempo
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {reminderTotalCount > 0 && (
                            <span style={{
                                padding: '4px 10px', borderRadius: 999,
                                background: 'rgba(210,68,50,0.10)', color: 'var(--danger)',
                                fontSize: 11.5, fontWeight: 600,
                            }}>
                                {reminderTotalCount} Tagihan Mendesak
                            </span>
                        )}
                        <Link href={route('admin.tagihan.index')} style={{ fontSize: 13, color: 'var(--blue-600)', fontWeight: 500 }}>
                            Lihat semua →
                        </Link>
                    </div>
                </header>
                {reminderList.length === 0 ? (
                    <div style={{ padding: '24px 22px 28px', textAlign: 'center', color: 'var(--ink-500)' }}>
                        <Icon name="check" size={22} style={{ color: 'var(--success)' }} stroke={2.4} />
                        <p style={{ margin: '6px 0 0', fontSize: 14 }}>Tidak ada tagihan mendesak. Semua tagihan dalam horizon H-3 sudah diproses.</p>
                    </div>
                ) : (
                    <div>
                        {reminderList.map((item) => {
                            const status = reminderStatus(item);
                            const isUrgent = status.label.startsWith('Terlambat') || status.label.includes('Hari Ini');
                            return (
                                <div key={item.id} style={{
                                    padding: '14px 22px',
                                    display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
                                    borderTop: '1px solid rgba(11,13,26,0.06)',
                                }}>
                                    <Avatar name={item.penyewa_nama} />
                                    <div style={{ flex: 1, minWidth: 180 }}>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-900)' }}>{item.penyewa_nama}</div>
                                        <div style={{ fontSize: 12.5, color: 'var(--ink-500)' }}>
                                            Kamar {item.kamar_nomor} · {formatRp(item.jumlah)}
                                        </div>
                                    </div>
                                    <Pill tone={status.tone} dot={isUrgent ? 'pulse' : true}>{status.label}</Pill>
                                    <a href={item.wa_link} target="_blank" rel="noopener noreferrer"
                                        style={{
                                            display: 'inline-flex', alignItems: 'center', gap: 6,
                                            padding: '8px 14px', borderRadius: 8,
                                            background: 'var(--success)', color: 'white',
                                            fontSize: 13, fontWeight: 600, textDecoration: 'none',
                                            transition: 'all 180ms var(--ease)',
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = '#176f44')}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--success)')}>
                                        <Icon name="logo-wa" size={14} />
                                        {isUrgent ? 'Tagih Sekarang' : 'Ingatkan'}
                                    </a>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* ───── Kamar Akan Kosong (30 hari) ───── */}
            <section style={{
                background: 'white', borderRadius: 14, marginBottom: 22, overflow: 'hidden',
                border: '1px solid rgba(11,13,26,0.06)',
                boxShadow: '0 1px 2px rgba(11,13,26,0.03)',
                position: 'relative',
            }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'var(--blue-600)' }} />
                <header style={{
                    padding: '18px 22px 14px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    flexWrap: 'wrap', gap: 12,
                }}>
                    <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--ink-900)', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                        <Icon name="bed" size={18} style={{ color: 'var(--blue-600)' }} />
                        Kamar Akan Kosong (30 Hari ke Depan)
                    </h2>
                    {kamarAkanKosongTotal > 0 && (
                        <span style={{
                            padding: '4px 10px', borderRadius: 999,
                            background: 'var(--blue-50)', color: 'var(--blue-700)',
                            fontSize: 11.5, fontWeight: 600,
                        }}>
                            {kamarAkanKosongTotal} kamar
                        </span>
                    )}
                </header>
                {kamarAkanKosong.length === 0 ? (
                    <div style={{ padding: '24px 22px 28px', textAlign: 'center', color: 'var(--ink-500)' }}>
                        <p style={{ margin: 0, fontSize: 14 }}>Tidak ada kontrak sewa yang akan berakhir dalam 30 hari ke depan.</p>
                    </div>
                ) : (
                    <div>
                        {kamarAkanKosong.map((item) => {
                            const isUrgent = item.sisa_hari <= 7;
                            return (
                                <div key={item.id} style={{
                                    padding: '14px 22px',
                                    display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
                                    borderTop: '1px solid rgba(11,13,26,0.06)',
                                }}>
                                    <div style={{
                                        width: 36, height: 36, borderRadius: 10,
                                        background: 'var(--blue-50)', color: 'var(--blue-700)',
                                        display: 'grid', placeItems: 'center', flex: '0 0 auto',
                                        fontWeight: 700, fontSize: 13, letterSpacing: '-0.02em',
                                    }}>{item.kamar_nomor}</div>
                                    <div style={{ flex: 1, minWidth: 180 }}>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-900)' }}>
                                            Kamar {item.kamar_nomor}
                                            <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--ink-400)', fontWeight: 500, letterSpacing: '0.04em' }}>
                                                {item.tipe.toUpperCase()}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: 12.5, color: 'var(--ink-500)' }}>
                                            {item.penyewa_nama} · Sewa s/d {formatDate(item.tgl_selesai)}
                                        </div>
                                    </div>
                                    <Pill tone={isUrgent ? 'warning' : 'info'} dot={isUrgent ? 'pulse' : true}>
                                        {item.sisa_hari === 0 ? 'Berakhir Hari Ini' : `Sisa ${item.sisa_hari} hari`}
                                    </Pill>
                                    {item.kamar_id && (
                                        <Link href={route('admin.kamar.show', item.kamar_id)}
                                            style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                                padding: '8px 14px', borderRadius: 8,
                                                background: 'var(--blue-50)', color: 'var(--blue-700)',
                                                fontSize: 13, fontWeight: 600, textDecoration: 'none',
                                            }}>
                                            <Icon name="send" size={14} /> Detail
                                        </Link>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* ───── Pembayaran Terbaru ───── */}
            <section style={{
                background: 'white', borderRadius: 14, overflow: 'hidden',
                border: '1px solid rgba(11,13,26,0.06)',
                boxShadow: '0 1px 2px rgba(11,13,26,0.03)',
            }}>
                <header style={{
                    padding: '18px 22px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    flexWrap: 'wrap', gap: 12,
                }}>
                    <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--ink-900)' }}>Pembayaran Terbaru</h2>
                    {pembayaranPendingCount > 0 && (
                        <Link href={route('admin.pembayaran.index')} style={{ fontSize: 13, color: 'var(--blue-600)', fontWeight: 500 }}>
                            {pembayaranPendingCount} menunggu konfirmasi →
                        </Link>
                    )}
                </header>

                {pembayaranTerbaru.length === 0 ? (
                    <div style={{ padding: '24px 22px 32px', textAlign: 'center', color: 'var(--ink-500)' }}>
                        <p style={{ margin: 0, fontSize: 14 }}>Belum ada pembayaran masuk.</p>
                    </div>
                ) : (
                    <div style={{ overflow: 'auto', borderTop: '1px solid rgba(11,13,26,0.06)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    {['Nama Penyewa', 'Kamar', 'Jumlah', 'Jatuh Tempo', 'Status', 'Aksi'].map((h, i) => (
                                        <th key={h} style={{
                                            padding: '12px 20px', textAlign: i === 5 ? 'center' : 'left',
                                            fontSize: 11, fontWeight: 600, color: 'var(--ink-500)',
                                            textTransform: 'uppercase', letterSpacing: '0.06em',
                                            background: 'var(--ink-50)',
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {pembayaranTerbaru.map((p) => {
                                    const meta = verifikasiPill(p.status_verifikasi, p.tagihan_status);
                                    return (
                                        <tr key={p.id} style={{ borderTop: '1px solid rgba(11,13,26,0.06)' }}>
                                            <td style={{ padding: '12px 20px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <Avatar name={p.penyewa_nama} />
                                                    <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-900)' }}>{p.penyewa_nama}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '12px 20px', fontSize: 13.5, color: 'var(--ink-700)' }}>{p.kamar_nomor}</td>
                                            <td style={{ padding: '12px 20px', fontSize: 14, fontWeight: 600, color: 'var(--ink-900)', fontVariantNumeric: 'tabular-nums' }}>
                                                {formatRp(p.jumlah_bayar)}
                                            </td>
                                            <td style={{ padding: '12px 20px', fontSize: 12.5, color: 'var(--ink-500)', fontVariantNumeric: 'tabular-nums' }}>
                                                {formatDate(p.tgl_jatuh_tempo)}
                                            </td>
                                            <td style={{ padding: '12px 20px' }}>
                                                <Pill tone={meta.tone}>{meta.label}</Pill>
                                            </td>
                                            <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                                                <Link href={route('admin.pembayaran.show', p.id)}
                                                    aria-label={`Detail pembayaran ${p.penyewa_nama}`}
                                                    style={{
                                                        display: 'inline-grid', placeItems: 'center',
                                                        width: 34, height: 34, borderRadius: 8,
                                                        background: 'var(--blue-50)', color: 'var(--blue-700)',
                                                        transition: 'all 160ms var(--ease)',
                                                    }}>
                                                    <Icon name="send" size={15} stroke={2} />
                                                </Link>
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
