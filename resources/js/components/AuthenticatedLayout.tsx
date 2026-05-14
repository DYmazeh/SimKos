import { Link, router, usePage } from '@inertiajs/react';
import { useState, type ReactNode } from 'react';
import { Brand, Pill, Icon } from '@/components/ui';
import type { PageProps } from '@/types/inertia';

type NavItem = { label: string; href: string; active?: boolean };

export default function AuthenticatedLayout({
    header,
    children,
}: {
    header?: ReactNode;
    children: ReactNode;
}) {
    const { props, url } = usePage<PageProps>();
    const { auth, flash } = props;
    const user = auth.user;
    const [menuOpen, setMenuOpen] = useState(false);

    if (!user) {
        // safety: kalau auth.user null (mis. session expired), redirect login
        if (typeof window !== 'undefined') router.visit(route('login'));
        return null;
    }

    const isAdmin = user.roles.includes('admin');
    const isPenyewa = user.roles.includes('penyewa');

    const navItems: NavItem[] = isAdmin
        ? [
            { label: 'Dashboard', href: route('admin.dashboard'), active: url.startsWith('/admin/dashboard') },
            { label: 'Kamar', href: route('admin.kamar.index'), active: url.startsWith('/admin/kamar') },
            { label: 'Penyewa', href: route('admin.penyewa.index'), active: url.startsWith('/admin/penyewa') },
            { label: 'Tagihan', href: route('admin.tagihan.index'), active: url.startsWith('/admin/tagihan') },
            { label: 'Verifikasi', href: route('admin.pembayaran.index'), active: url.startsWith('/admin/pembayaran') },
            { label: 'Laporan', href: route('admin.laporan.keuangan'), active: url.startsWith('/admin/laporan') },
          ]
        : isPenyewa
        ? [
            { label: 'Dashboard', href: route('penyewa.dashboard'), active: url.startsWith('/penyewa/dashboard') },
            { label: 'Riwayat', href: route('penyewa.riwayat'), active: url.startsWith('/penyewa/riwayat') },
          ]
        : [];

    const logout = () => {
        router.post(route('logout'));
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--ink-50)' }}>
            <nav className="nav-scrim" style={{ position: 'sticky', top: 0, zIndex: 30 }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                        <Link href="/"><Brand /></Link>
                        <nav aria-label="Navigasi utama" style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="app-nav">
                            {navItems.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    style={{
                                        padding: '8px 14px',
                                        borderRadius: 8,
                                        fontSize: 14,
                                        fontWeight: 500,
                                        color: item.active ? 'var(--ink-900)' : 'var(--ink-500)',
                                        background: item.active ? 'rgba(11,13,26,0.06)' : 'transparent',
                                        transition: 'all 180ms var(--ease)',
                                    }}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => setMenuOpen((m) => !m)}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: 10,
                                padding: '6px 12px', borderRadius: 999,
                                border: '1px solid rgba(11,13,26,0.08)',
                                background: 'white', cursor: 'pointer',
                                fontSize: 14,
                            }}
                        >
                            <div style={{
                                width: 28, height: 28, borderRadius: 999,
                                background: 'var(--blue-100)', color: 'var(--blue-700)',
                                display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 600,
                            }}>
                                {user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <span style={{ color: 'var(--ink-700)' }}>{user.name}</span>
                            <Icon name="chevron-down" size={14} />
                        </button>

                        {menuOpen && (
                            <>
                                <div
                                    onClick={() => setMenuOpen(false)}
                                    style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                                />
                                <div style={{
                                    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                                    minWidth: 220, padding: 8, zIndex: 50,
                                    background: 'white', border: '1px solid rgba(11,13,26,0.08)',
                                    borderRadius: 12, boxShadow: 'var(--shadow-4)',
                                }}>
                                    <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(11,13,26,0.06)' }}>
                                        <div style={{ fontSize: 13, fontWeight: 600 }}>{user.name}</div>
                                        <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>{user.email}</div>
                                        <div style={{ marginTop: 6 }}>
                                            <Pill tone={isAdmin ? 'info' : 'success'}>
                                                {isAdmin ? 'Admin' : 'Penyewa'}
                                            </Pill>
                                        </div>
                                    </div>
                                    <Link href={route('profile.edit')}
                                        style={{ display: 'block', padding: '8px 12px', fontSize: 14, color: 'var(--ink-700)', borderRadius: 6 }}>
                                        Profil saya
                                    </Link>
                                    <button onClick={logout}
                                        style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', fontSize: 14, color: 'var(--danger)', borderRadius: 6, background: 'none', border: 0, cursor: 'pointer' }}>
                                        Keluar
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <style>{`
                    @media (max-width: 720px) { .app-nav { display: none !important; } }
                `}</style>
            </nav>

            {header && (
                <header style={{ background: 'white', borderBottom: '1px solid rgba(11,13,26,0.06)' }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 24px' }}>{header}</div>
                </header>
            )}

            <main style={{ flex: 1, padding: '24px' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    {flash.success && (
                        <div role="status" style={{
                            marginBottom: 16, padding: 12, borderRadius: 12,
                            background: 'rgba(31,143,91,0.08)', border: '1px solid rgba(31,143,91,0.18)',
                            color: 'var(--success)', fontSize: 14,
                        }}>
                            ✓ {flash.success}
                        </div>
                    )}
                    {flash.error && (
                        <div role="alert" style={{
                            marginBottom: 16, padding: 12, borderRadius: 12,
                            background: 'rgba(210,68,50,0.06)', border: '1px solid rgba(210,68,50,0.18)',
                            color: 'var(--danger)', fontSize: 14,
                        }}>
                            {flash.error}
                        </div>
                    )}
                    {children}
                </div>
            </main>
        </div>
    );
}
