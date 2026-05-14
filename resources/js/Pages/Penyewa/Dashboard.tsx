import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { Pill, formatRp } from '@/components/ui';
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

export default function PenyewaDashboard() {
    const { props } = usePage<PenyewaDashboardProps>();
    const { penyewa, tagihan, auth } = props;

    return (
        <AuthenticatedLayout
            header={<h2 className="h-2" style={{ margin: 0 }}>Dashboard Penyewa</h2>}
        >
            <Head title="Dashboard Penyewa" />

            <div className="card-solid" style={{ padding: 24, marginBottom: 20 }}>
                <p style={{ margin: 0, color: 'var(--ink-700)' }}>
                    Halo, <strong>{auth.user?.name}</strong> 👋
                </p>
            </div>

            {/* Status Sewa */}
            <div className="card-solid" style={{ padding: 24, marginBottom: 20 }}>
                <h3 className="h-3" style={{ margin: '0 0 14px' }}>Status Sewa</h3>
                {penyewa?.sewa_aktif ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, fontSize: 14 }}>
                        <div>
                            <div style={{ color: 'var(--ink-500)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Kamar</div>
                            <div style={{ fontWeight: 600, marginTop: 4 }}>{penyewa.sewa_aktif.kamar_nomor} · {penyewa.sewa_aktif.tipe.toUpperCase()}</div>
                        </div>
                        <div>
                            <div style={{ color: 'var(--ink-500)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sejak</div>
                            <div style={{ fontWeight: 600, marginTop: 4 }}>{formatDate(penyewa.sewa_aktif.tgl_mulai)}</div>
                        </div>
                        <div>
                            <div style={{ color: 'var(--ink-500)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Harga / bulan</div>
                            <div style={{ fontWeight: 600, marginTop: 4 }}>{formatRp(penyewa.sewa_aktif.harga_disepakati)}</div>
                        </div>
                        <div>
                            <div style={{ color: 'var(--ink-500)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</div>
                            <div style={{ marginTop: 4 }}><Pill tone="success">{penyewa.sewa_aktif.status}</Pill></div>
                        </div>
                    </div>
                ) : (
                    <p style={{ margin: 0, color: 'var(--ink-500)', fontSize: 14 }}>
                        Anda belum terdaftar sebagai penyewa kamar aktif. Silakan hubungi pengelola kos untuk pendaftaran kamar.
                    </p>
                )}
            </div>

            {/* Tagihan */}
            <div className="card-solid" style={{ padding: 0 }}>
                <div style={{ padding: 20, borderBottom: '1px solid rgba(11,13,26,0.06)' }}>
                    <h3 className="h-3" style={{ margin: 0 }}>Tagihan Anda</h3>
                </div>
                {tagihan.length === 0 ? (
                    <div style={{ padding: 32, textAlign: 'center', color: 'var(--ink-500)', fontSize: 14 }}>
                        Belum ada tagihan.
                    </div>
                ) : (
                    <div style={{ overflow: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                            <thead>
                                <tr style={{ background: 'var(--ink-50)', borderBottom: '1px solid rgba(11,13,26,0.06)' }}>
                                    <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, textTransform: 'uppercase', color: 'var(--ink-500)' }}>Periode</th>
                                    <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, textTransform: 'uppercase', color: 'var(--ink-500)' }}>Jumlah</th>
                                    <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, textTransform: 'uppercase', color: 'var(--ink-500)' }}>Jatuh Tempo</th>
                                    <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, textTransform: 'uppercase', color: 'var(--ink-500)' }}>Status</th>
                                    <th style={{ padding: '10px 16px', textAlign: 'right', fontSize: 11, textTransform: 'uppercase', color: 'var(--ink-500)' }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tagihan.map((t) => (
                                    <tr key={t.id} style={{ borderBottom: '1px solid rgba(11,13,26,0.04)' }}>
                                        <td style={{ padding: '12px 16px' }}>{formatMonthFull(t.periode)}</td>
                                        <td style={{ padding: '12px 16px' }}>{formatRp(t.jumlah)}</td>
                                        <td style={{ padding: '12px 16px', fontSize: 13 }}>{formatDate(t.tgl_jatuh_tempo)}</td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <Pill tone={statusTone[t.status]}>{statusLabel[t.status]}</Pill>
                                            {t.latest_rejected_catatan && ['belum_bayar', 'terlambat'].includes(t.status) && (
                                                <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4, fontStyle: 'italic' }}>
                                                    Bukti sebelumnya ditolak: "{t.latest_rejected_catatan}"
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                            {['belum_bayar', 'terlambat'].includes(t.status) ? (
                                                <Link href={route('penyewa.tagihan.bayar.create', t.id)}
                                                    className="btn btn-primary btn-sm">
                                                    💳 Bayar
                                                </Link>
                                            ) : t.status === 'menunggu_verifikasi' ? (
                                                <span style={{ fontSize: 12, color: 'var(--warning)', fontStyle: 'italic' }}>
                                                    Menunggu verifikasi
                                                </span>
                                            ) : (
                                                <span style={{ fontSize: 12, color: 'var(--success)' }}>✓ Lunas</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
