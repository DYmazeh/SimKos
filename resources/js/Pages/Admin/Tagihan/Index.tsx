import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Icon, formatRp } from '@/components/ui';
import type { PageProps } from '@/types/inertia';

type Status = 'belum_bayar' | 'menunggu_verifikasi' | 'lunas' | 'terlambat';

type TagihanRow = {
    id: number;
    penyewa_nama: string;
    kamar_nomor: string;
    jumlah: number;
    periode: string;
    tgl_jatuh_tempo: string;
    status: Status;
    wa_link: string | null;
};

type IndexProps = PageProps<{
    tagihan: TagihanRow[];
    kpi: { total: number; lunas: number; belum_bayar: number };
    filters: { status: string; periode: string };
    periodeOptions: string[];
    pagination: { current_page: number; last_page: number; total: number; from: number; to: number };
}>;

const statusMeta: Record<Status, { label: string; color: string; bg: string }> = {
    lunas: { label: 'LUNAS', color: '#15803D', bg: '#DCFCE7' },
    menunggu_verifikasi: { label: 'MENUNGGU KONFIRMASI', color: '#92400E', bg: '#FEF3C7' },
    belum_bayar: { label: 'BELUM BAYAR', color: '#991B1B', bg: '#FEE2E2' },
    terlambat: { label: 'TERLAMBAT', color: '#991B1B', bg: '#FEE2E2' },
};

const formatPeriode = (s: string) => {
    const d = new Date(s);
    return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
};

export default function TagihanIndex() {
    const { props } = usePage<IndexProps>();
    const { tagihan, kpi, filters, periodeOptions, pagination } = props;
    const [showGenerate, setShowGenerate] = useState(false);

    const goPage = (page: number) => router.get(route('admin.tagihan.index'), { ...filters, page }, { preserveScroll: true });

    return (
        <AdminLayout title="Tagihan Pembayaran">
            <Head title="Tagihan Pembayaran" />

            {/* Periode picker right-aligned */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <select
                    value={filters.periode}
                    onChange={(e) => router.get(route('admin.tagihan.index'), { ...filters, periode: e.target.value }, { preserveState: true })}
                    style={{
                        height: 38, padding: '0 14px',
                        borderRadius: 10, border: '1px solid #E5E7EB',
                        fontSize: 13, fontWeight: 500, color: '#0F172A',
                        background: 'white', cursor: 'pointer',
                    }}>
                    {periodeOptions.map((p) => (
                        <option key={p} value={p}>📅 {formatPeriode(p + '-01')}</option>
                    ))}
                </select>
            </div>

            {/* KPI cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }} className="kpi-row">
                <KPICard label="TOTAL TAGIHAN" value={kpi.total} unit="Penyewa" accent="#2563EB" />
                <KPICard label="SUDAH LUNAS" value={kpi.lunas} unit="Pembayaran" accent="#10B981" />
                <KPICard label="BELUM BAYAR" value={kpi.belum_bayar} unit="Tagihan" accent="#EF4444" />
            </div>

            {/* Toolbar + table card */}
            <div style={{ background: 'white', borderRadius: 14, padding: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 240, maxWidth: 400 }}>
                        <span style={{ position: 'absolute', left: 14, top: 11, color: '#94A3B8' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                        </span>
                        <input type="search" placeholder="Cari nama atau kamar..."
                            style={{ width: '100%', height: 40, paddingLeft: 38, paddingRight: 14, borderRadius: 10, border: '1px solid #E5E7EB', fontSize: 14, background: '#F8FAFC' }} />
                    </div>
                    <button onClick={() => setShowGenerate(true)}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '10px 18px', background: '#2563EB', color: 'white',
                            borderRadius: 10, fontSize: 13, fontWeight: 600,
                            border: 0, cursor: 'pointer',
                        }}>
                        + Tambah Tagihan
                    </button>
                </div>

                <div style={{ overflow: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                        <thead>
                            <tr style={{ background: '#F8FAFC' }}>
                                {['No', 'Nama Penyewa', 'Kamar', 'Jumlah', 'Status', 'Aksi'].map((h) => (
                                    <th key={h} style={{
                                        padding: '12px 24px', textAlign: 'left',
                                        fontSize: 11, fontWeight: 600, color: '#64748B',
                                        textTransform: 'uppercase', letterSpacing: '0.05em',
                                    }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {tagihan.length === 0 ? (
                                <tr><td colSpan={6} style={{ padding: 48, textAlign: 'center', color: '#94A3B8' }}>
                                    Belum ada tagihan untuk periode {formatPeriode(filters.periode + '-01')}.{' '}
                                    <button onClick={() => setShowGenerate(true)} style={{ color: '#2563EB', background: 'none', border: 0, cursor: 'pointer', fontWeight: 500 }}>
                                        Generate sekarang →
                                    </button>
                                </td></tr>
                            ) : tagihan.map((t, i) => {
                                const meta = statusMeta[t.status];
                                return (
                                    <tr key={t.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                                        <td style={{ padding: '14px 24px', color: '#94A3B8', fontSize: 13 }}>{pagination.from + i}</td>
                                        <td style={{ padding: '14px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <Avatar name={t.penyewa_nama} />
                                                <span style={{ fontWeight: 500, color: '#0F172A' }}>{t.penyewa_nama}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '14px 24px', color: '#475569' }}>{t.kamar_nomor}</td>
                                        <td style={{ padding: '14px 24px', color: '#0F172A', fontWeight: 500 }}>{formatRp(t.jumlah)}</td>
                                        <td style={{ padding: '14px 24px' }}>
                                            <span style={{
                                                display: 'inline-block', padding: '4px 12px',
                                                background: meta.bg, color: meta.color,
                                                borderRadius: 999, fontSize: 10.5, fontWeight: 700,
                                                letterSpacing: '0.03em',
                                            }}>{meta.label}</span>
                                        </td>
                                        <td style={{ padding: '14px 24px' }}>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <Link href={route('admin.tagihan.show', t.id)}
                                                    style={{ width: 30, height: 30, borderRadius: 8, background: '#EFF6FF', color: '#2563EB', display: 'grid', placeItems: 'center' }}
                                                    aria-label="Lihat">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>
                                                </Link>
                                                {t.wa_link && t.status !== 'lunas' && (
                                                    <a href={t.wa_link} target="_blank" rel="noopener noreferrer"
                                                        style={{ width: 30, height: 30, borderRadius: 8, background: '#DCFCE7', color: '#16A34A', display: 'grid', placeItems: 'center' }}
                                                        aria-label="WhatsApp">
                                                        <Icon name="logo-wa" size={14} />
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {tagihan.length > 0 && (
                    <div style={{ padding: '16px 24px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                        <div style={{ fontSize: 13, color: '#64748B' }}>
                            Menampilkan {pagination.to - pagination.from + 1} dari {pagination.total} data
                        </div>
                        <div style={{ display: 'flex', gap: 4 }}>
                            <button disabled={pagination.current_page <= 1} onClick={() => goPage(pagination.current_page - 1)}
                                style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E5E7EB', background: 'white', cursor: 'pointer' }}>‹</button>
                            {Array.from({ length: Math.min(pagination.last_page, 3) }).map((_, i) => {
                                const page = i + 1;
                                const active = page === pagination.current_page;
                                return (
                                    <button key={page} onClick={() => goPage(page)}
                                        style={{
                                            width: 32, height: 32, borderRadius: 8,
                                            border: active ? 0 : '1px solid #E5E7EB',
                                            background: active ? '#2563EB' : 'white',
                                            color: active ? 'white' : '#475569',
                                            fontWeight: active ? 600 : 500,
                                            cursor: 'pointer', fontSize: 13,
                                        }}>{page}</button>
                                );
                            })}
                            {pagination.last_page > 3 && <span style={{ padding: '4px 6px', color: '#94A3B8' }}>…</span>}
                            <button disabled={pagination.current_page >= pagination.last_page} onClick={() => goPage(pagination.current_page + 1)}
                                style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E5E7EB', background: 'white', cursor: 'pointer' }}>›</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Generate tagihan modal */}
            {showGenerate && <GenerateModal periode={filters.periode} onClose={() => setShowGenerate(false)} />}

            <style>{`
                @media (max-width: 768px) { .kpi-row { grid-template-columns: 1fr !important; } }
            `}</style>
        </AdminLayout>
    );
}

const KPICard = ({ label, value, unit, accent }: { label: string; value: number; unit: string; accent: string }) => (
    <div style={{
        background: 'white', borderRadius: 14, padding: 20,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        borderLeft: `4px solid ${accent}`,
    }}>
        <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600, letterSpacing: '0.05em', marginBottom: 8 }}>{label}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 32, fontWeight: 700, color: '#0F172A' }}>{value}</span>
            <span style={{ fontSize: 13, color: '#94A3B8' }}>{unit}</span>
        </div>
    </div>
);

const Avatar = ({ name }: { name: string }) => {
    const i = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
    return (
        <div style={{ width: 32, height: 32, borderRadius: 999, background: 'linear-gradient(135deg, #93C5FD, #2563EB)', color: 'white', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 600, flexShrink: 0 }}>{i}</div>
    );
};

const GenerateModal = ({ periode, onClose }: { periode: string; onClose: () => void }) => {
    const form = useForm({ periode });
    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post(route('admin.tagihan.generate'), { onSuccess: onClose });
    };
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'grid', placeItems: 'center', padding: 24, background: 'rgba(11,13,26,0.4)' }} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div style={{ background: 'white', borderRadius: 14, padding: 28, maxWidth: 440, width: '100%' }}>
                <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>Generate Tagihan Bulanan</h3>
                <p style={{ margin: '0 0 20px', fontSize: 13, color: '#64748B' }}>
                    Sistem akan membuat tagihan otomatis untuk semua penyewa dengan sewa aktif pada periode yang dipilih.
                </p>
                <form onSubmit={submit}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>Periode</label>
                    <input type="month" value={form.data.periode} onChange={(e) => form.setData('periode', e.target.value)}
                        className="input" style={{ borderRadius: 10, marginTop: 6 }} required />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                        <button type="button" onClick={onClose}
                            style={{ padding: '10px 18px', borderRadius: 10, color: '#475569', background: 'none', border: 0, cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>Batal</button>
                        <button type="submit" disabled={form.processing}
                            style={{ padding: '10px 22px', borderRadius: 10, background: '#2563EB', color: 'white', border: 0, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                            {form.processing ? 'Memproses…' : 'Generate Tagihan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
