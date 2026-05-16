import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Icon, Pill } from '@/components/ui';
import { confirmDialog } from '@/components/ConfirmDialog';
import type { PageProps } from '@/types/inertia';

type PenyewaRow = {
    id: number;
    nama_lengkap: string;
    no_ktp: string | null;
    no_hp: string;
    kamar_aktif: string | null;
    periode_sewa: string | null;
    status_aktif: 'aktif' | 'nonaktif';
    punya_akun: boolean;
};

type IndexProps = PageProps<{
    penyewa: PenyewaRow[];
    filters: { q: string };
    pagination: { current_page: number; last_page: number; total: number; from: number; to: number };
}>;

const KICKER: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase',
    color: 'var(--blue-600)', margin: 0,
};

const TH: React.CSSProperties = {
    padding: '14px 20px', textAlign: 'left',
    fontSize: 11, fontWeight: 600, color: 'var(--ink-500)',
    textTransform: 'uppercase', letterSpacing: '0.06em',
    background: 'var(--ink-50)',
};

const TD: React.CSSProperties = {
    padding: '14px 20px', borderTop: '1px solid rgba(11,13,26,0.06)',
    fontSize: 14, color: 'var(--ink-800)',
};

const ICON_BTN: React.CSSProperties = {
    width: 32, height: 32, borderRadius: 8,
    background: 'rgba(11,13,26,0.04)', color: 'var(--ink-700)',
    border: 0, cursor: 'pointer',
    display: 'grid', placeItems: 'center',
    transition: 'all 180ms var(--ease)',
};

export default function PenyewaIndex() {
    const { props } = usePage<IndexProps>();
    const { penyewa, filters, pagination } = props;
    const [q, setQ] = useState(filters.q || '');

    useEffect(() => {
        const t = setTimeout(() => {
            router.get(route('admin.penyewa.index'), { q }, { preserveState: true, preserveScroll: true, replace: true });
        }, 350);
        return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q]);

    const onDelete = async (p: PenyewaRow) => {
        const ok = await confirmDialog({
            title: `Hapus penyewa ${p.nama_lengkap}?`,
            description: 'Data sewa & tagihan terkait penyewa ini akan tetap tercatat di audit log.',
            tone: 'danger',
            confirmLabel: 'Ya, hapus',
        });
        if (!ok) return;
        router.delete(route('admin.penyewa.destroy', p.id));
    };

    return (
        <AdminLayout title="Manajemen Penyewa">
            <Head title="Manajemen Penyewa" />

            {/* ───── Page header (kicker pattern, mirip guest SectionHeader) ───── */}
            <header style={{ marginBottom: 28 }}>
                <p style={KICKER}>Penyewa</p>
                <h1 className="h-1" style={{ margin: '6px 0 8px' }}>Kelola data penghuni.</h1>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--ink-500)', margin: 0, maxWidth: '58ch' }}>
                    Pantau profil, kamar yang ditempati, status sewa, dan akses akun login setiap penyewa dalam satu daftar terpusat.
                </p>
            </header>

            {/* ───── Toolbar ───── */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 260, maxWidth: 480 }}>
                    <span style={{ position: 'absolute', left: 14, top: 12, color: 'var(--ink-400)' }} aria-hidden="true">
                        <Icon name="search" size={18} />
                    </span>
                    <input
                        type="search"
                        className="input"
                        placeholder="Cari nama atau NIK penyewa..."
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        style={{ paddingLeft: 42 }}
                    />
                </div>
                <Link href={route('admin.penyewa.create')} className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }}>
                    <Icon name="plus" size={16} stroke={2.2} />
                    Tambah Penyewa
                </Link>
            </div>

            {/* ───── Table card ───── */}
            <div style={{
                background: 'white', borderRadius: 16, overflow: 'hidden',
                border: '1px solid rgba(11,13,26,0.06)',
                boxShadow: '0 1px 2px rgba(11,13,26,0.03)',
            }}>
                <div style={{ overflow: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={TH}>No</th>
                                <th style={TH}>Nama Penyewa</th>
                                <th style={TH}>NIK</th>
                                <th style={TH}>No HP</th>
                                <th style={TH}>Kamar</th>
                                <th style={TH}>Kontrak</th>
                                <th style={TH}>Status</th>
                                <th style={{ ...TH, textAlign: 'right' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {penyewa.length === 0 ? (
                                <tr>
                                    <td colSpan={8} style={{ padding: 56, textAlign: 'center', color: 'var(--ink-400)' }}>
                                        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                                            <div style={{
                                                width: 48, height: 48, borderRadius: 12,
                                                background: 'var(--ink-50)', color: 'var(--ink-400)',
                                                display: 'grid', placeItems: 'center',
                                            }}>
                                                <Icon name="user" size={22} />
                                            </div>
                                            <p style={{ margin: 0, fontSize: 14 }}>Tidak ada penyewa ditemukan.</p>
                                            {q && <p style={{ margin: 0, fontSize: 12 }}>Coba kata kunci lain.</p>}
                                        </div>
                                    </td>
                                </tr>
                            ) : penyewa.map((p, i) => (
                                <tr key={p.id} style={{ transition: 'background 160ms' }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(11,13,26,0.015)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                                    <td style={{ ...TD, color: 'var(--ink-400)', fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>
                                        {String(pagination.from + i).padStart(2, '0')}
                                    </td>
                                    <td style={{ ...TD, fontWeight: 500, color: 'var(--ink-900)' }}>{p.nama_lengkap}</td>
                                    <td style={{ ...TD, color: 'var(--ink-500)', fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>
                                        {p.no_ktp ?? <span style={{ color: 'var(--ink-300)' }}>—</span>}
                                    </td>
                                    <td style={{ ...TD, color: 'var(--ink-500)', fontSize: 13 }}>{p.no_hp}</td>
                                    <td style={TD}>
                                        {p.kamar_aktif
                                            ? <Pill tone="info">{p.kamar_aktif}</Pill>
                                            : <span style={{ color: 'var(--ink-300)' }}>—</span>}
                                    </td>
                                    <td style={{ ...TD, color: 'var(--ink-500)', fontSize: 12.5 }}>
                                        {p.periode_sewa ?? <span style={{ color: 'var(--ink-300)' }}>—</span>}
                                    </td>
                                    <td style={TD}>
                                        <Pill tone={p.status_aktif === 'aktif' ? 'success' : 'neutral'} dot={p.status_aktif === 'aktif' ? 'pulse' : true}>
                                            {p.status_aktif === 'aktif' ? 'Aktif' : 'Nonaktif'}
                                        </Pill>
                                    </td>
                                    <td style={{ ...TD, textAlign: 'right' }}>
                                        <div style={{ display: 'inline-flex', gap: 6 }}>
                                            <Link href={route('admin.penyewa.show', p.id)} style={ICON_BTN} aria-label={`Lihat ${p.nama_lengkap}`}>
                                                <Icon name="eye" size={15} />
                                            </Link>
                                            <Link href={route('admin.penyewa.edit', p.id)} style={ICON_BTN} aria-label={`Edit ${p.nama_lengkap}`}>
                                                <Icon name="edit" size={15} />
                                            </Link>
                                            <button onClick={() => onDelete(p)} style={{ ...ICON_BTN, color: '#b14242' }} aria-label={`Hapus ${p.nama_lengkap}`}>
                                                <Icon name="trash" size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination footer */}
                {penyewa.length > 0 && (
                    <div style={{
                        padding: '14px 20px', borderTop: '1px solid rgba(11,13,26,0.06)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        flexWrap: 'wrap', gap: 12,
                    }}>
                        <div style={{ fontSize: 13, color: 'var(--ink-500)', fontVariantNumeric: 'tabular-nums' }}>
                            Menampilkan <strong style={{ color: 'var(--ink-900)' }}>{pagination.from}</strong>–<strong style={{ color: 'var(--ink-900)' }}>{pagination.to}</strong> dari <strong style={{ color: 'var(--ink-900)' }}>{pagination.total}</strong> entri
                        </div>
                        <Pagination
                            current={pagination.current_page}
                            last={pagination.last_page}
                            onGo={(page) => router.get(route('admin.penyewa.index'), { q, page }, { preserveScroll: true })}
                        />
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

/* ───── Pagination subcomponent ───── */
const Pagination = ({ current, last, onGo }: { current: number; last: number; onGo: (page: number) => void }) => {
    const pageBtn = (page: number, active = false) => (
        <button key={page} onClick={() => onGo(page)}
            style={{
                minWidth: 32, height: 32, padding: '0 8px', borderRadius: 8,
                border: active ? 0 : '1px solid rgba(11,13,26,0.10)',
                background: active ? 'var(--blue-600)' : 'white',
                color: active ? 'white' : 'var(--ink-700)',
                fontWeight: active ? 600 : 500, fontSize: 13,
                cursor: 'pointer', fontVariantNumeric: 'tabular-nums',
                transition: 'all 160ms var(--ease)',
            }}>
            {page}
        </button>
    );
    const arrow = (dir: 'prev' | 'next', disabled: boolean) => (
        <button disabled={disabled}
            onClick={() => onGo(dir === 'prev' ? current - 1 : current + 1)}
            style={{
                width: 32, height: 32, borderRadius: 8,
                border: '1px solid rgba(11,13,26,0.10)',
                background: 'white', color: disabled ? 'var(--ink-300)' : 'var(--ink-700)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                display: 'grid', placeItems: 'center',
            }}
            aria-label={dir === 'prev' ? 'Halaman sebelumnya' : 'Halaman berikutnya'}>
            <Icon name={dir === 'prev' ? 'arrow-left' : 'arrow-right'} size={14} />
        </button>
    );
    const shown = Math.min(last, 4);
    return (
        <div style={{ display: 'flex', gap: 4 }}>
            {arrow('prev', current <= 1)}
            {Array.from({ length: shown }).map((_, i) => pageBtn(i + 1, i + 1 === current))}
            {last > 4 && (
                <>
                    <span style={{ padding: '6px 4px', color: 'var(--ink-300)' }}>…</span>
                    {pageBtn(last, last === current)}
                </>
            )}
            {arrow('next', current >= last)}
        </div>
    );
};
