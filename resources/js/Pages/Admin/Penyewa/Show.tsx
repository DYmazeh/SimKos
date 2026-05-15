import { Head, Link, usePage } from '@inertiajs/react';
import AdminLayout from '@/components/AdminLayout';
import { formatRp } from '@/components/ui';
import type { PageProps } from '@/types/inertia';

type SewaItem = {
    id: number;
    kamar_nomor: string;
    tipe: string;
    tgl_mulai: string;
    tgl_selesai: string | null;
    harga_disepakati: number;
    status: string;
    jumlah_tagihan: number;
};

type ShowProps = PageProps<{
    penyewa: {
        id: number;
        nama_lengkap: string;
        no_ktp: string | null;
        no_hp: string;
        alamat_asal: string | null;
        catatan: string | null;
        status_aktif: string;
        user: { email: string; verified: boolean } | null;
        sewa: SewaItem[];
    };
}>;

const statusPill = (status: string) => {
    const map: Record<string, { label: string; bg: string; color: string }> = {
        aktif: { label: 'Aktif', bg: '#DCFCE7', color: '#15803D' },
        selesai: { label: 'Selesai', bg: '#F1F5F9', color: '#475569' },
        dibatalkan: { label: 'Dibatalkan', bg: '#FEE2E2', color: '#991B1B' },
    };
    return map[status] ?? map.selesai;
};

const fmt = (s: string) => new Date(s).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

export default function PenyewaShow() {
    const { props } = usePage<ShowProps>();
    const { penyewa } = props;
    const initial = penyewa.nama_lengkap.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
    const sewaAktif = penyewa.sewa.find((s) => s.status === 'aktif');

    return (
        <AdminLayout
            title={penyewa.nama_lengkap}
            breadcrumb={
                <span>
                    <Link href={route('admin.penyewa.index')} style={{ color: '#64748B' }}>Penyewa</Link>
                    {' / '}
                    <span style={{ color: '#2563EB' }}>Detail</span>
                </span>
            }
        >
            <Head title={penyewa.nama_lengkap} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginBottom: 16 }} className="penyewa-show-grid">
                {/* Profile card */}
                <div style={{ background: 'white', borderRadius: 14, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', textAlign: 'center' }}>
                    <div style={{
                        width: 96, height: 96, borderRadius: 999, margin: '0 auto 16px',
                        background: 'linear-gradient(135deg, #93C5FD, #2563EB)',
                        color: 'white', display: 'grid', placeItems: 'center',
                        fontSize: 32, fontWeight: 700,
                    }}>{initial}</div>
                    <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700, color: '#0F172A' }}>{penyewa.nama_lengkap}</h3>
                    <div style={{ fontSize: 13, color: '#64748B', marginBottom: 12 }}>{penyewa.no_hp}</div>
                    <span style={{
                        display: 'inline-block', padding: '4px 12px',
                        background: penyewa.status_aktif === 'aktif' ? '#DCFCE7' : '#F1F5F9',
                        color: penyewa.status_aktif === 'aktif' ? '#15803D' : '#64748B',
                        borderRadius: 999, fontSize: 12, fontWeight: 600,
                    }}>{penyewa.status_aktif === 'aktif' ? 'Aktif' : 'Nonaktif'}</span>

                    <div style={{ marginTop: 20, textAlign: 'left', fontSize: 13 }}>
                        {[
                            { l: 'NIK', v: penyewa.no_ktp ?? '—' },
                            { l: 'Email', v: penyewa.user?.email ?? '— Tidak punya akun' },
                            { l: 'Alamat Asal', v: penyewa.alamat_asal ?? '—' },
                        ].map((r) => (
                            <div key={r.l} style={{ padding: '8px 0', borderTop: '1px solid #F1F5F9' }}>
                                <div style={{ color: '#94A3B8', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{r.l}</div>
                                <div style={{ color: '#0F172A', fontWeight: 500, marginTop: 2 }}>{r.v}</div>
                            </div>
                        ))}
                        {penyewa.catatan && (
                            <div style={{ padding: '8px 0', borderTop: '1px solid #F1F5F9' }}>
                                <div style={{ color: '#94A3B8', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Catatan</div>
                                <p style={{ margin: '4px 0 0', color: '#475569', fontStyle: 'italic' }}>"{penyewa.catatan}"</p>
                            </div>
                        )}
                    </div>

                    <Link href={route('admin.penyewa.edit', penyewa.id)}
                        style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            width: '100%', marginTop: 16, padding: '10px 16px',
                            borderRadius: 10, border: '1px solid #2563EB',
                            color: '#2563EB', fontSize: 13, fontWeight: 600,
                        }}>Edit Profil</Link>
                </div>

                {/* Sewa */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Sewa aktif */}
                    <div style={{ background: 'white', borderRadius: 14, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                        <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#0F172A' }}>Sewa Aktif</h3>
                        {sewaAktif ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
                                {[
                                    { l: 'Kamar', v: `${sewaAktif.kamar_nomor} (${sewaAktif.tipe.toUpperCase()})` },
                                    { l: 'Tgl Mulai', v: fmt(sewaAktif.tgl_mulai) },
                                    { l: 'Tgl Selesai', v: sewaAktif.tgl_selesai ? fmt(sewaAktif.tgl_selesai) : 'Belum ditentukan' },
                                    { l: 'Harga / bulan', v: formatRp(sewaAktif.harga_disepakati) },
                                ].map((r) => (
                                    <div key={r.l} style={{ padding: 12, background: '#F8FAFC', borderRadius: 10 }}>
                                        <div style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{r.l}</div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', marginTop: 2 }}>{r.v}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ margin: 0, fontSize: 14, color: '#94A3B8' }}>
                                Belum ada sewa aktif. Tugaskan kamar dari halaman penyewa (form Tambah/Edit dengan section Kontrak Sewa).
                            </p>
                        )}
                    </div>

                    {/* Riwayat */}
                    <div style={{ background: 'white', borderRadius: 14, padding: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                        <div style={{ padding: '16px 24px', borderBottom: '1px solid #F1F5F9' }}>
                            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0F172A' }}>Riwayat Sewa</h3>
                        </div>
                        {penyewa.sewa.length === 0 ? (
                            <div style={{ padding: 24, textAlign: 'center', color: '#94A3B8', fontSize: 14 }}>
                                Belum ada riwayat.
                            </div>
                        ) : (
                            <div style={{ overflow: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                    <thead>
                                        <tr style={{ background: '#F8FAFC' }}>
                                            {['Kamar', 'Periode', 'Harga', 'Status', 'Tagihan'].map((h) => (
                                                <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {penyewa.sewa.map((s) => {
                                            const meta = statusPill(s.status);
                                            return (
                                                <tr key={s.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                                                    <td style={{ padding: '12px 20px', fontWeight: 500 }}>{s.kamar_nomor}</td>
                                                    <td style={{ padding: '12px 20px', color: '#475569', fontSize: 12 }}>
                                                        {fmt(s.tgl_mulai)} — {s.tgl_selesai ? fmt(s.tgl_selesai) : 'sekarang'}
                                                    </td>
                                                    <td style={{ padding: '12px 20px' }}>{formatRp(s.harga_disepakati)}</td>
                                                    <td style={{ padding: '12px 20px' }}>
                                                        <span style={{
                                                            display: 'inline-block', padding: '3px 10px',
                                                            background: meta.bg, color: meta.color,
                                                            borderRadius: 999, fontSize: 11, fontWeight: 600,
                                                        }}>{meta.label}</span>
                                                    </td>
                                                    <td style={{ padding: '12px 20px', color: '#475569' }}>{s.jumlah_tagihan} tagihan</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 900px) {
                    .penyewa-show-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </AdminLayout>
    );
}
