import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/components/AdminLayout';
import AssignKamarForm from '@/components/AssignKamarForm';
import { Icon, Pill, formatRp } from '@/components/ui';
import { confirmDialog } from '@/components/ConfirmDialog';
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
        foto_ktp_url: string | null;
        status_aktif: string;
        user: { email: string; verified: boolean } | null;
        sewa: SewaItem[];
    };
    kamarTersedia: Array<{ id: number; nomor_kamar: string; tipe: string; harga_bulanan: number }>;
}>;

const KICKER: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase',
    color: 'var(--blue-600)', margin: 0,
};

const sewaTone = (status: string): 'success' | 'neutral' | 'warning' => {
    if (status === 'aktif') return 'success';
    if (status === 'dibatalkan') return 'warning';
    return 'neutral';
};

const sewaLabel = (status: string) => {
    if (status === 'aktif') return 'Aktif';
    if (status === 'dibatalkan') return 'Dibatalkan';
    return 'Selesai';
};

const fmt = (s: string) => new Date(s).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

export default function PenyewaShow() {
    const { props } = usePage<ShowProps>();
    const { penyewa, kamarTersedia } = props;
    const initial = penyewa.nama_lengkap.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
    const sewaAktif = penyewa.sewa.find((s) => s.status === 'aktif');
    const isAktif = penyewa.status_aktif === 'aktif';

    const onDeactivate = async () => {
        const desc = sewaAktif
            ? `Sewa aktif (Kamar ${sewaAktif.kamar_nomor}) akan diakhiri otomatis dan kamar ditandai kosong. Data riwayat tetap tersimpan.`
            : 'Penyewa akan ditandai nonaktif. Data riwayat tetap tersimpan.';
        const ok = await confirmDialog({
            title: `Nonaktifkan ${penyewa.nama_lengkap}?`,
            description: desc,
            tone: 'warning',
            confirmLabel: 'Ya, nonaktifkan',
        });
        if (!ok) return;
        router.patch(route('admin.penyewa.deactivate', penyewa.id), {}, { preserveScroll: true });
    };

    const onReactivate = async () => {
        const ok = await confirmDialog({
            title: `Aktifkan kembali ${penyewa.nama_lengkap}?`,
            description: 'Status penyewa akan kembali "aktif". Buat kontrak sewa baru kalau penyewa kembali menempati kamar.',
            tone: 'info',
            confirmLabel: 'Ya, aktifkan',
        });
        if (!ok) return;
        router.patch(route('admin.penyewa.reactivate', penyewa.id), {}, { preserveScroll: true });
    };

    return (
        <AdminLayout title={penyewa.nama_lengkap}>
            <Head title={penyewa.nama_lengkap} />

            {/* Header: breadcrumb + back button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
                <nav aria-label="Breadcrumb" style={{ fontSize: 13, color: 'var(--ink-500)' }}>
                    <Link href={route('admin.penyewa.index')} style={{ color: 'var(--ink-500)' }}>Penyewa</Link>
                    <span style={{ color: 'var(--ink-300)', margin: '0 8px' }}>/</span>
                    <span style={{ color: 'var(--blue-600)', fontWeight: 500 }}>Detail</span>
                </nav>
                <Link href={route('admin.penyewa.index')} className="btn btn-ghost btn-sm">
                    <Icon name="arrow-left" size={14} /> Kembali
                </Link>
            </div>

            <div className="penyewa-show-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
                {/* ───── Profile card ───── */}
                <aside style={{
                    background: 'white', borderRadius: 16, padding: 28,
                    border: '1px solid rgba(11,13,26,0.06)',
                    boxShadow: '0 1px 2px rgba(11,13,26,0.03)',
                    height: 'fit-content',
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <div style={{
                            width: 92, height: 92, borderRadius: 999, marginBottom: 16,
                            background: 'linear-gradient(135deg, var(--blue-400), var(--blue-700))',
                            color: 'white', display: 'grid', placeItems: 'center',
                            fontSize: 30, fontWeight: 600, letterSpacing: '-0.02em',
                            boxShadow: '0 4px 16px -4px rgba(37,99,235,0.4)',
                        }}>{initial}</div>
                        <h2 className="h-2" style={{ margin: '0 0 6px' }}>{penyewa.nama_lengkap}</h2>
                        <p style={{ margin: '0 0 14px', fontSize: 13.5, color: 'var(--ink-500)', fontVariantNumeric: 'tabular-nums' }}>
                            {penyewa.no_hp}
                        </p>
                        <Pill tone={penyewa.status_aktif === 'aktif' ? 'success' : 'neutral'}
                            dot={penyewa.status_aktif === 'aktif' ? 'pulse' : true}>
                            {penyewa.status_aktif === 'aktif' ? 'Aktif' : 'Nonaktif'}
                        </Pill>
                    </div>

                    {/* Detail rows */}
                    <dl style={{ margin: '24px 0 0', padding: 0 }}>
                        <DetailRow label="NIK" value={penyewa.no_ktp ?? '—'} mono />
                        <DetailRow label="Email" value={penyewa.user?.email ?? <span style={{ color: 'var(--ink-400)' }}>— Tidak punya akun</span>} />
                        <DetailRow label="Alamat asal" value={penyewa.alamat_asal ?? '—'} />
                        {penyewa.catatan && (
                            <DetailRow label="Catatan" value={
                                <span style={{ fontStyle: 'italic', color: 'var(--ink-500)' }}>"{penyewa.catatan}"</span>
                            } />
                        )}
                    </dl>

                    {/* Foto KTP — klik untuk buka full size di tab baru */}
                    <div style={{
                        marginTop: 20, paddingTop: 18,
                        borderTop: '1px solid rgba(11,13,26,0.06)',
                    }}>
                        <div style={{
                            fontSize: 11, color: 'var(--ink-400)', fontWeight: 500,
                            textTransform: 'uppercase', letterSpacing: '0.06em',
                            marginBottom: 10,
                        }}>Foto KTP</div>
                        {penyewa.foto_ktp_url ? (
                            <a href={penyewa.foto_ktp_url} target="_blank" rel="noopener noreferrer"
                                style={{
                                    display: 'block', borderRadius: 10, overflow: 'hidden',
                                    border: '1px solid rgba(11,13,26,0.08)', cursor: 'zoom-in',
                                    aspectRatio: '85/54',
                                    background: 'var(--ink-50)',
                                }}>
                                <img src={penyewa.foto_ktp_url} alt={`KTP ${penyewa.nama_lengkap}`}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </a>
                        ) : (
                            <div style={{
                                padding: '18px 14px', borderRadius: 10,
                                background: 'var(--ink-50)', border: '1px dashed rgba(11,13,26,0.12)',
                                textAlign: 'center', color: 'var(--ink-400)', fontSize: 12.5,
                            }}>
                                Belum ada foto KTP diunggah.
                            </div>
                        )}
                    </div>

                    <Link href={route('admin.penyewa.edit', penyewa.id)}
                        className="btn btn-ghost btn-sm"
                        style={{ width: '100%', marginTop: 20, justifyContent: 'center' }}>
                        <Icon name="edit" size={14} /> Edit profil
                    </Link>
                    {isAktif ? (
                        <button onClick={onDeactivate}
                            className="btn btn-ghost btn-sm"
                            style={{
                                width: '100%', marginTop: 8, justifyContent: 'center',
                                color: 'var(--danger)', borderColor: 'rgba(210,68,50,0.20)',
                            }}>
                            <Icon name="user" size={14} /> Nonaktifkan penyewa
                        </button>
                    ) : (
                        <button onClick={onReactivate}
                            className="btn btn-ghost btn-sm"
                            style={{
                                width: '100%', marginTop: 8, justifyContent: 'center',
                                color: 'var(--blue-700)',
                            }}>
                            <Icon name="user" size={14} /> Aktifkan kembali
                        </button>
                    )}
                </aside>

                {/* ───── Sewa stack ───── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Sewa aktif */}
                    <section style={{
                        background: 'white', borderRadius: 16, padding: 28,
                        border: '1px solid rgba(11,13,26,0.06)',
                        boxShadow: '0 1px 2px rgba(11,13,26,0.03)',
                    }}>
                        <header style={{ marginBottom: 20 }}>
                            <p style={KICKER}>Kontrak berjalan</p>
                            <h2 className="h-2" style={{ margin: '4px 0 0' }}>Sewa aktif.</h2>
                        </header>
                        {sewaAktif ? (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                                gap: 12,
                            }}>
                                <StatTile label="Kamar" value={`${sewaAktif.kamar_nomor}`} sub={sewaAktif.tipe.toUpperCase()} />
                                <StatTile label="Mulai" value={fmt(sewaAktif.tgl_mulai)} />
                                <StatTile label="Selesai" value={sewaAktif.tgl_selesai ? fmt(sewaAktif.tgl_selesai) : 'Belum ditentukan'} />
                                <StatTile label="Harga / bulan" value={formatRp(sewaAktif.harga_disepakati)} accent />
                            </div>
                        ) : !isAktif ? (
                            <EmptyState
                                icon="bed"
                                title="Belum ada sewa aktif."
                                desc="Penyewa berstatus nonaktif. Aktifkan kembali dulu untuk bisa menugaskan kamar."
                            />
                        ) : kamarTersedia.length > 0 ? (
                            <>
                                <p style={{ margin: '0 0 16px', fontSize: 13.5, color: 'var(--ink-500)', lineHeight: 1.6 }}>
                                    Penyewa ini belum menempati kamar. Pilih kamar tersedia untuk membuat kontrak sewa.
                                </p>
                                <AssignKamarForm mode="penyewa" penyewaId={penyewa.id} kamarOptions={kamarTersedia} />
                            </>
                        ) : (
                            <EmptyState
                                icon="bed"
                                title="Belum ada sewa aktif."
                                desc="Tidak ada kamar berstatus tersedia untuk di-assign. Tambah kamar baru atau kosongkan kamar dulu."
                            />
                        )}
                    </section>

                    {/* Riwayat */}
                    <section style={{
                        background: 'white', borderRadius: 16, overflow: 'hidden',
                        border: '1px solid rgba(11,13,26,0.06)',
                        boxShadow: '0 1px 2px rgba(11,13,26,0.03)',
                    }}>
                        <header style={{ padding: '20px 28px 16px' }}>
                            <p style={KICKER}>Histori</p>
                            <h2 className="h-2" style={{ margin: '4px 0 0' }}>Riwayat sewa.</h2>
                        </header>
                        {penyewa.sewa.length === 0 ? (
                            <div style={{ padding: '0 28px 24px' }}>
                                <EmptyState icon="receipt" title="Belum ada riwayat." desc="Kontrak yang dibuat untuk penyewa ini akan muncul di sini." />
                            </div>
                        ) : (
                            <div style={{ overflow: 'auto', borderTop: '1px solid rgba(11,13,26,0.06)' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr>
                                            {['Kamar', 'Periode', 'Harga', 'Status', 'Tagihan'].map((h) => (
                                                <th key={h} style={{
                                                    padding: '14px 20px', textAlign: 'left',
                                                    fontSize: 11, fontWeight: 600, color: 'var(--ink-500)',
                                                    textTransform: 'uppercase', letterSpacing: '0.06em',
                                                    background: 'var(--ink-50)',
                                                }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {penyewa.sewa.map((s) => (
                                            <tr key={s.id} style={{ borderTop: '1px solid rgba(11,13,26,0.06)' }}>
                                                <td style={{ padding: '14px 20px', fontWeight: 500, color: 'var(--ink-900)', fontSize: 14 }}>
                                                    {s.kamar_nomor}
                                                    <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--ink-400)', letterSpacing: '0.04em' }}>
                                                        {s.tipe.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '14px 20px', color: 'var(--ink-500)', fontSize: 12.5, fontVariantNumeric: 'tabular-nums' }}>
                                                    {fmt(s.tgl_mulai)} — {s.tgl_selesai ? fmt(s.tgl_selesai) : 'sekarang'}
                                                </td>
                                                <td style={{ padding: '14px 20px', color: 'var(--ink-800)', fontSize: 13.5, fontVariantNumeric: 'tabular-nums' }}>
                                                    {formatRp(s.harga_disepakati)}
                                                </td>
                                                <td style={{ padding: '14px 20px' }}>
                                                    <Pill tone={sewaTone(s.status)}>{sewaLabel(s.status)}</Pill>
                                                </td>
                                                <td style={{ padding: '14px 20px', color: 'var(--ink-500)', fontSize: 13 }}>
                                                    {s.jumlah_tagihan} tagihan
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
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

/* ───── Subcomponents ───── */

const DetailRow = ({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) => (
    <div style={{
        display: 'flex', flexDirection: 'column', gap: 2,
        padding: '12px 0',
        borderTop: '1px solid rgba(11,13,26,0.06)',
    }}>
        <dt style={{
            fontSize: 11, color: 'var(--ink-400)',
            textTransform: 'uppercase', letterSpacing: '0.06em',
            fontWeight: 500,
        }}>{label}</dt>
        <dd style={{
            margin: 0, fontSize: 14, color: 'var(--ink-900)', fontWeight: 500,
            fontVariantNumeric: mono ? 'tabular-nums' : undefined,
            wordBreak: 'break-word',
        }}>{value}</dd>
    </div>
);

const StatTile = ({ label, value, sub, accent = false }: { label: string; value: string; sub?: string; accent?: boolean }) => (
    <div style={{
        padding: 14, borderRadius: 12,
        background: accent ? 'var(--blue-50)' : 'var(--ink-50)',
        border: `1px solid ${accent ? 'rgba(37,99,235,0.1)' : 'rgba(11,13,26,0.04)'}`,
    }}>
        <div style={{
            fontSize: 10.5, color: accent ? 'var(--blue-700)' : 'var(--ink-400)',
            textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600,
        }}>{label}</div>
        <div style={{
            marginTop: 4, fontSize: 14.5, fontWeight: 600,
            color: accent ? 'var(--blue-700)' : 'var(--ink-900)',
            fontVariantNumeric: 'tabular-nums',
        }}>{value}</div>
        {sub && (
            <div style={{ marginTop: 2, fontSize: 11, color: 'var(--ink-500)', letterSpacing: '0.04em' }}>
                {sub}
            </div>
        )}
    </div>
);

const EmptyState = ({ icon, title, desc }: { icon: 'bed' | 'receipt' | 'user'; title: string; desc: string }) => (
    <div style={{
        padding: '24px 16px', textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        color: 'var(--ink-500)',
    }}>
        <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: 'var(--ink-50)', color: 'var(--ink-400)',
            display: 'grid', placeItems: 'center',
        }}>
            <Icon name={icon} size={22} />
        </div>
        <div>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-800)', fontWeight: 500 }}>{title}</p>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--ink-500)', maxWidth: '40ch' }}>{desc}</p>
        </div>
    </div>
);
