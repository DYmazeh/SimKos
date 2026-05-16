import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { Icon, Pill } from '@/components/ui';
import type { PageProps } from '@/types/inertia';

type KomplenItem = {
    id: number;
    judul: string;
    deskripsi: string;
    status: 'menunggu' | 'diproses' | 'selesai';
    kamar_nomor: string;
    created_at: string;
    resolved_at: string | null;
};

type IndexProps = PageProps<{
    komplen: KomplenItem[];
}>;

const KICKER: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase',
    color: 'var(--blue-600)', margin: 0,
};

const fmt = (s: string) => new Date(s).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

const statusTone = (s: KomplenItem['status']): 'warning' | 'info' | 'success' => {
    if (s === 'menunggu') return 'warning';
    if (s === 'diproses') return 'info';
    return 'success';
};

const statusLabel = (s: KomplenItem['status']) => {
    if (s === 'menunggu') return 'Menunggu';
    if (s === 'diproses') return 'Sedang diproses';
    return 'Selesai';
};

export default function KomplenIndex() {
    const { props } = usePage<IndexProps>();
    const { komplen } = props;

    const aktif = komplen.filter((k) => k.status !== 'selesai');
    const selesai = komplen.filter((k) => k.status === 'selesai');

    return (
        <AuthenticatedLayout>
            <Head title="Komplen" />

            {/* ───── Header ───── */}
            <header style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <p style={KICKER}>Komplen</p>
                    <h1 className="h-1" style={{ margin: '6px 0 8px' }}>Ajukan keluhan ke pengelola.</h1>
                    <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--ink-500)', margin: 0, maxWidth: '58ch' }}>
                        Sampaikan keluhan terkait kamar atau fasilitas. Pengelola akan menindaklanjuti secepat mungkin.
                    </p>
                </div>
                <Link href={route('penyewa.komplen.create')} className="btn btn-primary btn-sm">
                    <Icon name="plus" size={15} stroke={2.2} /> Buat komplen baru
                </Link>
            </header>

            {/* ───── Komplen aktif ───── */}
            {aktif.length > 0 && (
                <section style={{ marginBottom: 24 }}>
                    <h2 className="h-2" style={{ margin: '0 0 12px' }}>Sedang berjalan</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {aktif.map((k) => <KomplenCard key={k.id} komplen={k} />)}
                    </div>
                </section>
            )}

            {/* ───── Riwayat selesai ───── */}
            <section>
                <h2 className="h-2" style={{ margin: '0 0 12px' }}>
                    {selesai.length > 0 ? 'Riwayat selesai' : 'Belum ada komplen selesai'}
                </h2>
                {selesai.length === 0 && aktif.length === 0 ? (
                    <div style={{
                        background: 'white', borderRadius: 14, padding: 56, textAlign: 'center',
                        border: '1px solid rgba(11,13,26,0.06)',
                    }}>
                        <div style={{
                            width: 56, height: 56, borderRadius: 14,
                            background: 'var(--ink-50)', color: 'var(--ink-400)',
                            display: 'inline-grid', placeItems: 'center', marginBottom: 12,
                        }}>
                            <Icon name="alert-circle" size={26} />
                        </div>
                        <p style={{ margin: 0, fontSize: 15, color: 'var(--ink-800)', fontWeight: 500 }}>Belum ada komplen.</p>
                        <p style={{ margin: '6px 0 18px', fontSize: 13, color: 'var(--ink-500)' }}>
                            Kalau ada keluhan terkait kamar/fasilitas, ajukan di sini.
                        </p>
                        <Link href={route('penyewa.komplen.create')} className="btn btn-primary btn-sm">
                            <Icon name="plus" size={15} stroke={2.2} /> Buat komplen pertama
                        </Link>
                    </div>
                ) : selesai.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {selesai.map((k) => <KomplenCard key={k.id} komplen={k} />)}
                    </div>
                ) : null}
            </section>
        </AuthenticatedLayout>
    );
}

const KomplenCard = ({ komplen }: { komplen: KomplenItem }) => {
    const accentColor = komplen.status === 'menunggu' ? '#c89e2a' :
        komplen.status === 'diproses' ? 'var(--blue-600)' : 'var(--success)';
    return (
        <article style={{
            background: 'white', borderRadius: 14, padding: 20,
            border: '1px solid rgba(11,13,26,0.06)',
            boxShadow: '0 1px 2px rgba(11,13,26,0.03)',
            borderLeftWidth: 4, borderLeftColor: accentColor, borderLeftStyle: 'solid',
        }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: 15.5, fontWeight: 600, color: 'var(--ink-900)' }}>{komplen.judul}</h3>
                    <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 4 }}>
                        Kamar {komplen.kamar_nomor} · diajukan {fmt(komplen.created_at)}
                        {komplen.resolved_at && ` · selesai ${fmt(komplen.resolved_at)}`}
                    </div>
                </div>
                <Pill tone={statusTone(komplen.status)} dot={komplen.status === 'menunggu' ? 'pulse' : true}>
                    {statusLabel(komplen.status)}
                </Pill>
            </header>
            <p style={{ margin: 0, fontSize: 13.5, color: 'var(--ink-700)', lineHeight: 1.6 }}>{komplen.deskripsi}</p>
        </article>
    );
};
