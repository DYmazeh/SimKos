import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Icon, Pill, formatRp } from '@/components/ui';
import type { PageProps } from '@/types/inertia';

type Pembayaran = {
    id: number;
    kode_transaksi: string;
    penyewa_nama: string;
    kamar_nomor: string;
    kamar_lantai: number | null;
    periode: string | null;
    jumlah_bayar: number;
    tgl_jatuh_tempo: string | null;
    tgl_upload: string;
    metode: string;
    status_verifikasi: 'pending' | 'approved' | 'rejected';
    bukti_transfer_url: string | null;
    catatan: string | null;
    verified_at: string | null;
    verifikator_nama: string | null;
};

type ShowProps = PageProps<{
    pembayaran: Pembayaran;
}>;

const fmt = (s: string | null) => s
    ? new Date(s).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';
const fmtMonth = (s: string | null) => s
    ? new Date(s).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
    : '—';
const fmtDateTime = (s: string) => new Date(s).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function PembayaranShow() {
    const { props } = usePage<ShowProps>();
    const { pembayaran } = props;
    const isPending = pembayaran.status_verifikasi === 'pending';
    const [imgFullscreen, setImgFullscreen] = useState(false);

    const rejectForm = useForm({ catatan: '' });

    const approve = () => {
        if (!confirm('Konfirmasi pembayaran sebagai lunas?')) return;
        router.patch(route('admin.pembayaran.approve', pembayaran.id));
    };

    const reject = (e: FormEvent) => {
        e.preventDefault();
        if (!rejectForm.data.catatan.trim()) {
            alert('Wajib isi alasan penolakan.');
            return;
        }
        rejectForm.patch(route('admin.pembayaran.reject', pembayaran.id), { preserveScroll: true });
    };

    return (
        <AdminLayout title="Konfirmasi Pembayaran">
            <Head title={`Detail Pembayaran — ${pembayaran.penyewa_nama}`} />

            {/* Breadcrumb + Back */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
                <nav aria-label="Breadcrumb" style={{ fontSize: 13, color: 'var(--ink-500)' }}>
                    <Link href={route('admin.pembayaran.index')} style={{ color: 'var(--ink-500)' }}>Konfirmasi Pembayaran</Link>
                    <span style={{ color: 'var(--ink-300)', margin: '0 8px' }}>/</span>
                    <span style={{ color: 'var(--blue-600)', fontWeight: 500 }}>Detail Pembayaran</span>
                </nav>
                <Link href={route('admin.pembayaran.index')} className="btn btn-ghost btn-sm">
                    <Icon name="arrow-left" size={14} /> Kembali
                </Link>
            </div>

            {/* Card detail */}
            <section style={{
                background: 'white', borderRadius: 14, padding: 26,
                border: '1px solid rgba(11,13,26,0.06)',
                boxShadow: '0 1px 2px rgba(11,13,26,0.03)',
            }}>
                {/* Header card */}
                <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 22 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{
                            width: 38, height: 38, borderRadius: 999,
                            background: 'var(--blue-50)', color: 'var(--blue-700)',
                            display: 'grid', placeItems: 'center',
                        }}>
                            <Icon name="info" size={20} />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--ink-900)' }}>Detail Konfirmasi Pembayaran</h2>
                            <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
                                ID TRANSAKSI {pembayaran.kode_transaksi}
                            </div>
                        </div>
                    </div>
                    {pembayaran.status_verifikasi !== 'pending' && (
                        <Pill tone={pembayaran.status_verifikasi === 'approved' ? 'success' : 'warning'}>
                            {pembayaran.status_verifikasi === 'approved' ? 'Sudah disetujui' : 'Ditolak'}
                        </Pill>
                    )}
                </header>

                {/* Content grid */}
                <div className="pay-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    {/* INFO TAGIHAN */}
                    <div style={{ borderLeft: '4px solid var(--blue-600)', paddingLeft: 16 }}>
                        <h3 style={{ margin: '0 0 16px', fontSize: 12, fontWeight: 700, color: 'var(--blue-700)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            Info Tagihan
                        </h3>
                        <dl style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <Row label="Nama Penyewa" value={pembayaran.penyewa_nama} />
                            <Row label="Unit Kamar" value={pembayaran.kamar_lantai ? `${pembayaran.kamar_nomor} (Lantai ${pembayaran.kamar_lantai})` : pembayaran.kamar_nomor} />
                            <Row label="Periode Sewa" value={fmtMonth(pembayaran.periode)} />
                            <Row label="Jumlah Pembayaran" value={formatRp(pembayaran.jumlah_bayar)} accent="blue" bold />
                            <Row label="Batas Jatuh Tempo" value={fmt(pembayaran.tgl_jatuh_tempo)} accent="danger" />
                            <Row label="Tanggal Upload Bukti" value={fmtDateTime(pembayaran.tgl_upload)} />
                        </dl>
                    </div>

                    {/* BUKTI TRANSFER */}
                    <div style={{ borderLeft: '4px solid var(--blue-600)', paddingLeft: 16 }}>
                        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h3 style={{ margin: 0, fontSize: 12, fontWeight: 700, color: 'var(--blue-700)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                Bukti Transfer
                            </h3>
                            {pembayaran.bukti_transfer_url && (
                                <button onClick={() => setImgFullscreen(true)}
                                    style={{ background: 'transparent', border: 0, color: 'var(--blue-600)', fontSize: 12, fontWeight: 500, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                    <Icon name="expand" size={12} /> Perbesar
                                </button>
                            )}
                        </header>
                        {pembayaran.bukti_transfer_url ? (
                            <>
                                <button onClick={() => setImgFullscreen(true)}
                                    style={{
                                        display: 'block', width: '100%', padding: 0, border: 0,
                                        background: 'var(--ink-50)', borderRadius: 10, overflow: 'hidden',
                                        cursor: 'zoom-in', marginBottom: 12,
                                    }}>
                                    <img src={pembayaran.bukti_transfer_url} alt="Bukti transfer"
                                        style={{ width: '100%', maxHeight: 280, objectFit: 'cover', display: 'block' }} />
                                </button>
                                <a href={route('admin.pembayaran.download', pembayaran.id)}
                                    className="btn btn-ghost btn-sm"
                                    style={{ width: '100%', justifyContent: 'center', color: 'var(--blue-700)', borderColor: 'rgba(37,99,235,0.3)' }}>
                                    <Icon name="download" size={14} /> Download Bukti
                                </a>
                            </>
                        ) : (
                            <div style={{
                                padding: 32, textAlign: 'center', background: 'var(--ink-50)', borderRadius: 10,
                                color: 'var(--ink-400)', fontSize: 13,
                            }}>
                                Tidak ada file bukti.
                            </div>
                        )}
                    </div>
                </div>

                {/* Catatan / Alasan Penolakan */}
                {isPending && (
                    <form onSubmit={reject} style={{ marginTop: 28 }}>
                        <label htmlFor="catatan" style={{ display: 'block', fontSize: 13.5, fontWeight: 500, color: 'var(--ink-900)', marginBottom: 6 }}>
                            Catatan / Alasan Penolakan
                        </label>
                        <textarea id="catatan" className="input"
                            value={rejectForm.data.catatan}
                            onChange={(e) => rejectForm.setData('catatan', e.target.value)}
                            placeholder="Contoh: Bukti transfer kurang jelas, Jumlah nominal tidak sesuai, dll…"
                            rows={3} maxLength={500}
                            style={{ fontFamily: 'inherit', resize: 'vertical', height: 'auto', padding: 12 }} />
                        <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--danger)', fontStyle: 'italic' }}>
                            * Wajib diisi jika menolak pembayaran
                        </p>

                        {/* Action buttons */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
                            <button type="submit" disabled={rejectForm.processing}
                                style={{
                                    padding: '10px 20px', borderRadius: 10,
                                    background: 'white', color: 'var(--danger)',
                                    border: '1px solid var(--danger)', cursor: 'pointer',
                                    fontSize: 14, fontWeight: 600,
                                    display: 'inline-flex', alignItems: 'center', gap: 8,
                                }}>
                                <Icon name="x" size={14} stroke={2.4} /> Tolak Pembayaran
                            </button>
                            <button type="button" onClick={approve}
                                style={{
                                    padding: '10px 20px', borderRadius: 10,
                                    background: 'var(--success)', color: 'white',
                                    border: 0, cursor: 'pointer',
                                    fontSize: 14, fontWeight: 600,
                                    display: 'inline-flex', alignItems: 'center', gap: 8,
                                    boxShadow: '0 6px 16px -6px rgba(31,143,91,0.45)',
                                }}>
                                <Icon name="check" size={14} stroke={2.4} /> Terima &amp; Konfirmasi Lunas
                            </button>
                        </div>
                    </form>
                )}

                {/* Already verified info */}
                {!isPending && (pembayaran.verified_at || pembayaran.catatan) && (
                    <div style={{
                        marginTop: 24, padding: 16, borderRadius: 12,
                        background: pembayaran.status_verifikasi === 'approved' ? 'rgba(31,143,91,0.06)' : 'rgba(210,68,50,0.06)',
                        border: `1px solid ${pembayaran.status_verifikasi === 'approved' ? 'rgba(31,143,91,0.20)' : 'rgba(210,68,50,0.20)'}`,
                    }}>
                        <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-700)' }}>
                            <strong>{pembayaran.status_verifikasi === 'approved' ? 'Disetujui' : 'Ditolak'}</strong>
                            {pembayaran.verifikator_nama && ` oleh ${pembayaran.verifikator_nama}`}
                            {pembayaran.verified_at && ` pada ${pembayaran.verified_at}`}
                        </p>
                        {pembayaran.catatan && (
                            <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--ink-700)', fontStyle: 'italic' }}>
                                "{pembayaran.catatan}"
                            </p>
                        )}
                    </div>
                )}
            </section>

            {/* Fullscreen image modal */}
            {imgFullscreen && pembayaran.bukti_transfer_url && (
                <div onClick={() => setImgFullscreen(false)}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 100,
                        background: 'rgba(11,13,26,0.92)', backdropFilter: 'blur(8px)',
                        display: 'grid', placeItems: 'center', padding: 32, cursor: 'zoom-out',
                    }}>
                    <img src={pembayaran.bukti_transfer_url} alt="Bukti transfer fullscreen"
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 12, boxShadow: '0 16px 48px -16px rgba(0,0,0,0.5)' }} />
                </div>
            )}

            <style>{`
                @media (max-width: 768px) {
                    .pay-detail-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </AdminLayout>
    );
}

const Row = ({ label, value, accent, bold }: { label: string; value: React.ReactNode; accent?: 'blue' | 'danger'; bold?: boolean }) => {
    const color = accent === 'blue' ? 'var(--blue-700)' : accent === 'danger' ? 'var(--danger)' : 'var(--ink-900)';
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '4px 0' }}>
            <dt style={{ fontSize: 13, color: 'var(--ink-500)' }}>{label}</dt>
            <dd style={{ margin: 0, fontSize: 13.5, color, fontWeight: bold ? 700 : 500, textAlign: 'right' }}>{value}</dd>
        </div>
    );
};
