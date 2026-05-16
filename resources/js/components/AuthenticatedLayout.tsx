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
    const { auth } = props;
    const user = auth.user;
    const [menuOpen, setMenuOpen] = useState(false);

    if (!user) {
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
            { label: 'Kamar Saya', href: route('penyewa.kamar.show'), active: url.startsWith('/penyewa/kamar-saya') },
            { label: 'Riwayat', href: route('penyewa.riwayat'), active: url.startsWith('/penyewa/riwayat') },
            { label: 'Komplen', href: route('penyewa.komplen.index'), active: url.startsWith('/penyewa/komplen') },
          ]
        : [];

    const logout = () => router.post(route('logout'));
    const initials = user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--ink-50)' }}>
            {/* ───── Floating capsule nav ───── */}
            <div className="nav-capsule-wrap">
                <nav className="nav-capsule" aria-label="Navigasi utama">
                    <Link href="/" aria-label="SimKos beranda" style={{ display: 'inline-flex', padding: '2px 6px 2px 2px' }}>
                        <Brand size={32} light showText={false} />
                    </Link>
                    <div className="nav-capsule-divider" />
                    {navItems.map((item) => (
                        <Link key={item.label} href={item.href}
                            className={`nav-link ${item.active ? 'active' : ''} ${item.label !== 'Dashboard' ? 'hide-on-mobile' : ''}`}>
                            {item.label}
                        </Link>
                    ))}
                    <div className="nav-capsule-divider" />

                    {/* User dropdown trigger */}
                    <button onClick={() => setMenuOpen((m) => !m)} className="nav-capsule-user"
                        aria-haspopup="menu" aria-expanded={menuOpen}>
                        <span className="avatar">{initials}</span>
                        <span className="name" style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user.name}
                        </span>
                        <Icon name="chevron-down" size={13} style={{ opacity: 0.7 }} />
                    </button>
                </nav>

                {/* Dropdown panel */}
                {menuOpen && (
                    <>
                        <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 49 }} />
                        <div role="menu" className="toast-enter" style={{
                            position: 'absolute', right: 0, top: 'calc(100% + 10px)',
                            minWidth: 240, padding: 8, zIndex: 60,
                            background: 'white', border: '1px solid rgba(11,13,26,0.08)',
                            borderRadius: 14, boxShadow: '0 12px 32px -8px rgba(11,13,26,0.25)',
                        }}>
                            <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(11,13,26,0.06)' }}>
                                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-900)' }}>{user.name}</div>
                                <div style={{ fontSize: 12, color: 'var(--ink-500)', marginBottom: 8 }}>{user.email}</div>
                                <Pill tone={isAdmin ? 'info' : 'success'} dot>{isAdmin ? 'Admin' : 'Penyewa'}</Pill>
                            </div>
                            <Link href={route('profile.edit')}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    padding: '10px 12px', fontSize: 14, color: 'var(--ink-700)',
                                    borderRadius: 8, marginTop: 4,
                                }}>
                                <Icon name="user" size={15} /> Profil saya
                            </Link>
                            <button onClick={logout}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left',
                                    padding: '10px 12px', fontSize: 14, color: 'var(--danger)',
                                    borderRadius: 8, background: 'none', border: 0, cursor: 'pointer',
                                }}>
                                <Icon name="arrow-right" size={15} /> Keluar
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* ───── Page header (kalau ada) ───── */}
            {header && (
                <header className="has-floating-nav" style={{ background: 'transparent' }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 24px 0' }}>{header}</div>
                </header>
            )}

            {/* ───── Main content (flash ditangani via global Toast) ───── */}
            <main className={header ? '' : 'has-floating-nav'} style={{ flex: 1, padding: '24px' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    {children}
                </div>
            </main>
        </div>
    );
}
