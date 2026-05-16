import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Icon, formatRp } from '@/components/ui';
import type { PageProps } from '@/types/inertia';

type Pembayaran = {
    id: number;
    tgl_bayar: string;
    jumlah_bayar: number;
    metode: string;
    bukti_transfer_url: string | null;
    status_verifikasi: 'pending' | 'approved' | 'rejected';
    verified_at: string | null;
    verifikator_nama: string | null;
    catatan: string | null;
};

type ShowProps = PageProps<{
    tagihan: {
        id: number;
        penyewa_nama: string;
        penyewa_id: number;
        kamar_nomor: string;
        jumlah: number;
        periode: string;
        tgl_jatuh_tempo: string;
        status: 'belum_bayar' | 'menunggu_verifikasi' | 'lunas' | 'terlambat';
        pembayaran: Pembayaran[];
    };
}>;

const formatDate = (s: string) => new Date(s).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
const formatPeriode = (s: string) => new Date(s).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

const statusMeta = (status: string) => ({
    belum_bayar: { label: 'Belum Bayar', color: '#991B1B', bg: '#FEE2E2' },
    menunggu_verifikasi: { label: 'Menunggu Verifikasi', color: '#92400E', bg: '#FEF3C7' },
    lunas: { label: 'Lunas', color: '#15803D', bg: '#DCFCE7' },
    terlambat: { label: 'Terlambat', color: '#991B1B', bg: '#FEE2E2' },
}[status] ?? { label: status, color: '#475569', bg: '#F1F5F9' });

export default function TagihanShow() {
    const { props } = usePage<ShowProps>();
    const { tagihan } = props;
    const [rejectingId, setRejectingId] = useState<number | null>(null);
    const rejectForm = useForm({ catatan: '' });

    const approve = (p: Pembayaran) => {
        if (!confirm('Setujui pembayaran ini?')) return;
        router.patch(route('admin.pembayaran.approve', p.id), {}, { preserveScroll: true });
    };

    const submitReject = (e: FormEvent, pId: number) => {
        e.preventDefault();
        rejectForm.patch(route('admin.pembayaran.reject', pId), {
            preserveScroll: true,
            onSuccess: () => { setRejectingId(null); rejectForm.reset(); },
        });
    };

    const meta = statusMeta(tagihan.status);

    return (
        <AdminLayout
            title={`Tagihan #${tagihan.id}`}
            breadcrumb={
                <span>
                    <Link href={route('admin.tagihan.index')} style={{ color: '#64748B' }}>Tagihan</Link>
                    {' / '}
                    <span style={{ color: '#2563EB' }}>Detail #{tagihan.id}</span>
                </span>
            }
        >
            <Head title={`Tagihan #${tagihan.id}`} />

            {/* Info card */}
            <div style={{ background: 'white', borderRadius: 14, padding: 28, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 20 }}>
                    {[
                        { l: 'Penyewa', v: <Link href={route('admin.penyewa.show', tagihan.penyewa_id)} style={{ color: '#2563EB', fontWeight: 600 }}>{tagihan.penyewa_nama}</Link> },
                        { l: 'Kamar', v: tagihan.kamar_nomor },
                        { l: 'Periode', v: formatPeriode(tagihan.periode) },
                        { l: 'Jatuh Tempo', v: formatDate(tagihan.tgl_jatuh_tempo) },
                        { l: 'Jumlah Tagihan', v: <span style={{ fontWeight: 700, color: '#0F172A' }}>{formatRp(tagihan.jumlah)}</span> },
                        { l: 'Status', v: <span style={{ display: 'inline-block', padding: '4px 12px', background: meta.bg, color: meta.color, borderRadius: 999, fontSize: 12, fontWeight: 600 }}>{meta.label}</span> },
                    ].map((r) => (
                        <div key={r.l}>
                            <div style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{r.l}</div>
                            <div style={{ fontSize: 14, color: '#475569', marginTop: 4 }}>{r.v}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pembayaran list */}
            <div style={{ background: 'white', borderRadius: 14, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700 }}>Riwayat Pembayaran</h3>
                {tagihan.pembayaran.length === 0 ? (
                    <p style={{ margin: 0, fontSize: 14, color: '#94A3B8', textAlign: 'center', padding: 32 }}>
                        Belum ada pembayaran untuk tagihan ini.
                    </p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {tagihan.pembayaran.map((p) => {
                            const pMeta = {
                                pending: { label: 'Pending', color: '#92400E', bg: '#FEF3C7' },
                                approved: { label: 'Disetujui', color: '#15803D', bg: '#DCFCE7' },
                                rejected: { label: 'Ditolak', color: '#991B1B', bg: '#FEE2E2' },
                            }[p.status_verifikasi];
                            const isRejecting = rejectingId === p.id;
                            return (
                                <div key={p.id} style={{
                                    border: '1px solid #E5E7EB', borderRadius: 12, padding: 18,
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
                                        <div>
                                            <div style={{ display: 'flex', gap: 16, alignItems: 'baseline' }}>
                                                <span style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>{formatRp(p.jumlah_bayar)}</span>
                                                <span style={{ display: 'inline-block', padding: '3px 10px', background: pMeta.bg, color: pMeta.color, borderRadius: 999, fontSize: 11, fontWeight: 600 }}>{pMeta.label}</span>
                                            </div>
                                            <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
                                                Bayar: {formatDate(p.tgl_bayar)} · Metode: {p.metode}
                                                {p.verified_at && p.verifikator_nama && (
                                                    <> · Diverifikasi oleh {p.verifikator_nama} pada {p.verified_at}</>
                                                )}
                                            </div>
                                        </div>
                                        {p.bukti_transfer_url && (
                                            <a href={p.bukti_transfer_url} target="_blank" rel="noopener noreferrer"
                                                style={{ fontSize: 13, color: '#2563EB', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                                <Icon name="receipt" size={14} /> Lihat bukti transfer
                                            </a>
                                        )}
                                    </div>

                                    {p.catatan && (
                                        <p style={{ margin: '8px 0', padding: 10, background: '#FEE2E2', borderRadius: 8, fontSize: 13, color: '#991B1B', fontStyle: 'italic' }}>
                                            "{p.catatan}"
                                        </p>
                                    )}

                                    {p.status_verifikasi === 'pending' && !isRejecting && (
                                        <div style={{ display: 'flex', gap: 10, marginTop: 12, paddingTop: 12, borderTop: '1px solid #F1F5F9' }}>
                                            <button onClick={() => approve(p)}
                                                style={{
                                                    padding: '8px 18px', borderRadius: 8,
                                                    background: '#16A34A', color: 'white',
                                                    border: 0, cursor: 'pointer',
                                                    fontSize: 13, fontWeight: 600,
                                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                                }}>
                                                <Icon name="check" size={14} stroke={2.4} /> Terima &amp; Konfirmasi Lunas
                                            </button>
                                            <button onClick={() => setRejectingId(p.id)}
                                                style={{
                                                    padding: '8px 18px', borderRadius: 8,
                                                    background: 'white', color: '#EF4444',
                                                    border: '1px solid #EF4444', cursor: 'pointer',
                                                    fontSize: 13, fontWeight: 600,
                                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                                }}>
                                                <Icon name="x" size={14} stroke={2.4} /> Tolak Pembayaran
                                            </button>
                                        </div>
                                    )}

                                    {isRejecting && (
                                        <form onSubmit={(e) => submitReject(e, p.id)} style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #F1F5F9' }}>
                                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#0F172A', marginBottom: 6 }}>
                                                Alasan penolakan (wajib)
                                            </label>
                                            <textarea
                                                value={rejectForm.data.catatan}
                                                onChange={(e) => rejectForm.setData('catatan', e.target.value)}
                                                rows={3} maxLength={500} required
                                                placeholder="Mis. Nominal tidak sesuai, bukti buram, dst."
                                                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, fontFamily: 'inherit', resize: 'vertical' }} />
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
                                                <button type="button" onClick={() => { setRejectingId(null); rejectForm.reset(); }}
                                                    style={{ padding: '8px 16px', borderRadius: 8, background: 'none', color: '#475569', border: 0, cursor: 'pointer', fontSize: 13 }}>Batal</button>
                                                <button type="submit" disabled={rejectForm.processing || !rejectForm.data.catatan}
                                                    style={{ padding: '8px 18px', borderRadius: 8, background: '#EF4444', color: 'white', border: 0, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                                                    Kirim Penolakan
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
