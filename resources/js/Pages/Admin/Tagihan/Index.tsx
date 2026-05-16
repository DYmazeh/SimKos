import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Icon, Pill, formatRp } from '@/components/ui';
import type { PageProps } from '@/types/inertia';

type PenyewaRow = {
    id: number;
    nama_lengkap: string;
    kamar_nomor: string;
    total_tagihan: number;
    total_belum_lunas: number;
    status: 'lunas' | 'menunggu_verifikasi' | 'belum_bayar';
    wa_link: string | null;
};

type Kpi = {
    total_penyewa: number;
    lunas_pembayaran: number;
    belum_bayar_tagihan: number;
};

type IndexProps = PageProps<{
    penyewaRows: PenyewaRow[];
    kpi: Kpi;
    filters: { q: string };
    pagination: { current_page: number; last_page: number; total: number; from: number; to: number };
}>;

const Avatar = ({ name }: { name: string }) => {
    const initial = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
    return (
        <div style={{
            width: 36, height: 36, borderRadius: 999,
            background: 'linear-gradient(135deg, var(--blue-400), var(--blue-700))',
            color: 'white', display: 'grid', placeItems: 'center',
            fontSize: 12, fontWeight: 600, flex: '0 0 auto',
        }}>{initial}</div>
    );
};

const statusMeta = (status: PenyewaRow['status']): { label: string; tone: 'success' | 'warning' | 'info' } => {
    if (status === 'lunas') return { label: 'LUNAS', tone: 'success' };
    if (status === 'menunggu_verifikasi') return { label: 'MENUNGGU KONFIRMASI', tone: 'info' };
    return { label: 'BELUM BAYAR', tone: 'warning' };
};

const KpiCard = ({ label, value, sub, accent }: { label: string; value: string | number; sub: string; accent: 'blue' | 'green' | 'red' }) => {
    const color = accent === 'blue' ? 'var(--blue-600)' : accent === 'green' ? 'var(--success)' : 'var(--danger)';
    return (
        <div style={{
            background: 'white', borderRadius: 14, padding: '18px 22px',
            border: '1px solid rgba(11,13,26,0.06)',
            borderLeftWidth: 4, borderLeftColor: color, borderLeftStyle: 'solid',
            boxShadow: '0 1px 2px rgba(11,13,26,0.03)',
        }}>
            <div style={{
                fontSize: 11, fontWeight: 600, color: 'var(--ink-500)',
                textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>{label}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
                <span style={{ fontSize: 30, fontWeight: 700, color: 'var(--ink-900)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
                    {value}
                </span>
                <span style={{ fontSize: 13, color: 'var(--ink-500)' }}>{sub}</span>
            </div>
        </div>
    );
};

export default function TagihanIndex() {
    const { props } = usePage<IndexProps>();
    const { penyewaRows, kpi, filters, pagination } = props;
    const [q, setQ] = useState(filters.q || '');

    useEffect(() => {
        const t = setTimeout(() => {
            router.get(route('admin.tagihan.index'), { q }, { preserveState: true, preserveScroll: true, replace: true });
        }, 350);
        return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q]);

    return (
        <AdminLayout title="Pembayaran">
            <Head title="Tagihan" />

            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" style={{ fontSize: 13, color: 'var(--ink-500)', marginBottom: 18 }}>
                <span>Pembayaran</span>
                <span style={{ color: 'var(--ink-300)', margin: '0 8px' }}>/</span>
                <span style={{ color: 'var(--ink-900)', fontWeight: 600 }}>Tagihan</span>
            </nav>

            {/* KPI cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 22 }}>
                <KpiCard label="Total Tagihan" value={kpi.total_penyewa} sub="Penyewa" accent="blue" />
                <KpiCard label="Sudah Lunas" value={kpi.lunas_pembayaran} sub="Pembayaran" accent="green" />
                <KpiCard label="Belum Bayar" value={kpi.belum_bayar_tagihan} sub="Tagihan" accent="red" />
            </div>

            {/* Card: search + table */}
            <section style={{
                background: 'white', borderRadius: 14, overflow: 'hidden',
                border: '1px solid rgba(11,13,26,0.06)',
                boxShadow: '0 1px 2px rgba(11,13,26,0.03)',
            }}>
                <header style={{ padding: '16px 22px', borderBottom: '1px solid rgba(11,13,26,0.06)' }}>
                    <div style={{ position: 'relative', maxWidth: 360 }}>
                        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-400)' }}>
                            <Icon name="search" size={16} />
                        </span>
                        <input type="search" placeholder="Cari nama atau kamar..."
                            value={q} onChange={(e) => setQ(e.target.value)}
                            style={{ width: '100%', height: 40, paddingLeft: 40, paddingRight: 14, borderRadius: 10, border: '1px solid rgba(11,13,26,0.10)', fontSize: 13.5, background: 'var(--ink-50)' }} />
                    </div>
                </header>

                {penyewaRows.length === 0 ? (
                    <div style={{ padding: 56, textAlign: 'center' }}>
                        <div style={{
                            width: 48, height: 48, borderRadius: 12,
                            background: 'var(--ink-50)', color: 'var(--ink-400)',
                            display: 'inline-grid', placeItems: 'center', marginBottom: 10,
                        }}>
                            <Icon name="receipt" size={22} />
                        </div>
                        <p style={{ margin: 0, color: 'var(--ink-800)', fontWeight: 500 }}>
                            {q ? 'Tidak ada penyewa cocok dengan pencarian.' : 'Belum ada tagihan tercatat.'}
                        </p>
                        <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--ink-500)' }}>
                            Tagihan akan otomatis dibuat H-3 sebelum jatuh tempo.
                        </p>
                    </div>
                ) : (
                    <div style={{ overflow: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    {['No', 'Nama Penyewa', 'Kamar', 'Jumlah', 'Status', 'Aksi'].map((h, i) => (
                                        <th key={h} style={{
                                            padding: '14px 22px',
                                            textAlign: i === 5 ? 'center' : 'left',
                                            fontSize: 11, fontWeight: 600, color: 'var(--ink-500)',
                                            textTransform: 'uppercase', letterSpacing: '0.06em',
                                            background: 'var(--ink-50)',
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {penyewaRows.map((row, i) => {
                                    const meta = statusMeta(row.status);
                                    return (
                                        <tr key={row.id} style={{ borderTop: '1px solid rgba(11,13,26,0.06)' }}>
                                            <td style={{ padding: '14px 22px', color: 'var(--ink-400)', fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>
                                                {pagination.from + i}
                                            </td>
                                            <td style={{ padding: '14px 22px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <Avatar name={row.nama_lengkap} />
                                                    <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-900)' }}>{row.nama_lengkap}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '14px 22px', fontSize: 13.5, color: 'var(--ink-700)' }}>{row.kamar_nomor}</td>
                                            <td style={{ padding: '14px 22px', fontSize: 14, fontWeight: 600, color: 'var(--ink-900)', fontVariantNumeric: 'tabular-nums' }}>
                                                {row.total_belum_lunas > 0 ? formatRp(row.total_belum_lunas) : formatRp(0)}
                                            </td>
                                            <td style={{ padding: '14px 22px' }}>
                                                <Pill tone={meta.tone}>{meta.label}</Pill>
                                            </td>
                                            <td style={{ padding: '14px 22px', textAlign: 'center' }}>
                                                <div style={{ display: 'inline-flex', gap: 8 }}>
                                                    <Link href={route('admin.tagihan.penyewa', row.id)}
                                                        aria-label={`Detail tagihan ${row.nama_lengkap}`}
                                                        style={{
                                                            display: 'inline-grid', placeItems: 'center',
                                                            width: 34, height: 34, borderRadius: 8,
                                                            background: 'var(--blue-50)', color: 'var(--blue-700)',
                                                        }}>
                                                        <Icon name="eye" size={15} />
                                                    </Link>
                                                    {row.wa_link && (
                                                        <a href={row.wa_link} target="_blank" rel="noopener noreferrer"
                                                            aria-label={`Hubungi ${row.nama_lengkap} via WhatsApp`}
                                                            style={{
                                                                display: 'inline-grid', placeItems: 'center',
                                                                width: 34, height: 34, borderRadius: 8,
                                                                background: 'rgba(31,143,91,0.10)', color: 'var(--success)',
                                                            }}>
                                                            <Icon name="logo-wa" size={15} />
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
                )}

                {/* Pagination */}
                {penyewaRows.length > 0 && pagination.last_page > 1 && (
                    <div style={{
                        padding: '14px 22px', borderTop: '1px solid rgba(11,13,26,0.06)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        flexWrap: 'wrap', gap: 12,
                    }}>
                        <div style={{ fontSize: 13, color: 'var(--ink-500)', fontVariantNumeric: 'tabular-nums' }}>
                            Menampilkan {pagination.from}-{pagination.to} dari {pagination.total} data
                        </div>
                        <div style={{ display: 'flex', gap: 4 }}>
                            <button disabled={pagination.current_page <= 1}
                                onClick={() => router.get(route('admin.tagihan.index'), { q, page: pagination.current_page - 1 }, { preserveScroll: true })}
                                style={{
                                    width: 32, height: 32, borderRadius: 8,
                                    border: '1px solid rgba(11,13,26,0.10)', background: 'white',
                                    color: pagination.current_page <= 1 ? 'var(--ink-300)' : 'var(--ink-700)',
                                    cursor: pagination.current_page <= 1 ? 'not-allowed' : 'pointer',
                                    display: 'grid', placeItems: 'center',
                                }}>
                                <Icon name="arrow-left" size={14} />
                            </button>
                            {Array.from({ length: Math.min(pagination.last_page, 5) }).map((_, idx) => {
                                const page = idx + 1;
                                const active = page === pagination.current_page;
                                return (
                                    <button key={page}
                                        onClick={() => router.get(route('admin.tagihan.index'), { q, page }, { preserveScroll: true })}
                                        style={{
                                            minWidth: 32, height: 32, padding: '0 8px', borderRadius: 8,
                                            border: active ? 0 : '1px solid rgba(11,13,26,0.10)',
                                            background: active ? 'var(--blue-600)' : 'white',
                                            color: active ? 'white' : 'var(--ink-700)',
                                            fontWeight: active ? 600 : 500, fontSize: 13,
                                            cursor: 'pointer', fontVariantNumeric: 'tabular-nums',
                                        }}>
                                        {page}
                                    </button>
                                );
                            })}
                            {pagination.last_page > 5 && (
                                <>
                                    <span style={{ padding: '6px 4px', color: 'var(--ink-300)' }}>…</span>
                                    <button onClick={() => router.get(route('admin.tagihan.index'), { q, page: pagination.last_page }, { preserveScroll: true })}
                                        style={{ minWidth: 32, height: 32, borderRadius: 8, border: '1px solid rgba(11,13,26,0.10)', background: 'white', cursor: 'pointer', fontSize: 13 }}>
                                        {pagination.last_page}
                                    </button>
                                </>
                            )}
                            <button disabled={pagination.current_page >= pagination.last_page}
                                onClick={() => router.get(route('admin.tagihan.index'), { q, page: pagination.current_page + 1 }, { preserveScroll: true })}
                                style={{
                                    width: 32, height: 32, borderRadius: 8,
                                    border: '1px solid rgba(11,13,26,0.10)', background: 'white',
                                    color: pagination.current_page >= pagination.last_page ? 'var(--ink-300)' : 'var(--ink-700)',
                                    cursor: pagination.current_page >= pagination.last_page ? 'not-allowed' : 'pointer',
                                    display: 'grid', placeItems: 'center',
                                }}>
                                <Icon name="arrow-right" size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </section>
        </AdminLayout>
    );
}
