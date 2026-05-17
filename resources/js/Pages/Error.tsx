import { Head, Link } from '@inertiajs/react';
import { Icon } from '@/components/ui';

type Props = {
    status: 403 | 404 | 419 | 500 | 503;
};

const meta: Record<Props['status'], { title: string; heading: string; description: string; icon: React.ComponentProps<typeof Icon>['name'] }> = {
    403: {
        title: 'Akses Ditolak',
        heading: 'Hmm, halaman ini bukan untukmu.',
        description: 'Akun Anda tidak punya izin untuk membuka halaman ini. Kalau merasa ini keliru, hubungi pengelola.',
        icon: 'alert-circle',
    },
    404: {
        title: 'Halaman Tidak Ditemukan',
        heading: 'Halaman yang dicari tidak ada.',
        description: 'Mungkin sudah dipindah atau salah link. Coba balik ke beranda.',
        icon: 'info',
    },
    419: {
        title: 'Sesi Berakhir',
        heading: 'Sesi Anda sudah habis.',
        description: 'Demi keamanan, sesi otomatis berakhir setelah idle terlalu lama. Silakan login ulang.',
        icon: 'info',
    },
    500: {
        title: 'Kesalahan Server',
        heading: 'Ada sesuatu yang error di sisi kami.',
        description: 'Tim teknis sudah diberi tahu. Coba muat ulang sebentar lagi atau hubungi pengelola jika persisten.',
        icon: 'alert-circle',
    },
    503: {
        title: 'Layanan Sedang Maintenance',
        heading: 'Server sedang dalam pemeliharaan.',
        description: 'Aplikasi tidak tersedia sementara. Coba lagi dalam beberapa menit.',
        icon: 'info',
    },
};

export default function Error({ status }: Props) {
    const m = meta[status] ?? meta[500];

    return (
        <>
            <Head title={`${status} · ${m.title}`} />
            <main style={{
                minHeight: '100vh',
                display: 'grid', placeItems: 'center',
                padding: '32px 24px',
                background: 'linear-gradient(180deg, #f8fafc 0%, #eef2f8 100%)',
                color: 'var(--ink-900)',
            }}>
                <div style={{
                    maxWidth: 520, width: '100%', textAlign: 'center',
                    background: 'white', borderRadius: 20, padding: '48px 32px',
                    border: '1px solid rgba(11,13,26,0.06)',
                    boxShadow: '0 4px 24px rgba(11,13,26,0.06)',
                }}>
                    <div style={{
                        width: 72, height: 72, borderRadius: 18,
                        background: status >= 500 ? 'rgba(210,68,50,0.10)' : 'var(--blue-50)',
                        color: status >= 500 ? 'var(--danger)' : 'var(--blue-700)',
                        display: 'inline-grid', placeItems: 'center', marginBottom: 18,
                    }}>
                        <Icon name={m.icon} size={36} />
                    </div>
                    <p style={{
                        margin: 0, fontSize: 13, fontWeight: 700, letterSpacing: '0.14em',
                        textTransform: 'uppercase', color: 'var(--ink-500)',
                    }}>
                        Error {status}
                    </p>
                    <h1 style={{
                        margin: '10px 0 12px', fontSize: 26, lineHeight: 1.25, fontWeight: 700,
                        color: 'var(--ink-900)',
                    }}>{m.heading}</h1>
                    <p style={{
                        margin: 0, fontSize: 15, lineHeight: 1.6, color: 'var(--ink-500)',
                        maxWidth: '40ch', marginInline: 'auto',
                    }}>{m.description}</p>
                    <div style={{ marginTop: 26, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link href="/" className="btn btn-primary btn-sm">
                            <Icon name="arrow-left" size={15} /> Ke Beranda
                        </Link>
                        {status === 419 && (
                            <Link href={route('login')} className="btn btn-ghost btn-sm">
                                Login ulang
                            </Link>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}
