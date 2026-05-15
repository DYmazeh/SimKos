import { Link, router, usePage } from '@inertiajs/react';
import { useState, type ReactNode } from 'react';
import { Icon } from '@/components/ui';
import type { PageProps } from '@/types/inertia';

type NavItem = {
    label: string;
    href: string;
    icon: 'home' | 'bed' | 'user' | 'wallet' | 'receipt' | 'shield';
    active?: boolean;
    badge?: number | string;
    children?: Array<{ label: string; href: string; active?: boolean; badge?: number | string }>;
};

export default function AdminLayout({
    title,
    children,
    breadcrumb,
}: {
    title: string;
    children: ReactNode;
    breadcrumb?: ReactNode;
}) {
    const { props, url } = usePage<PageProps>();
    const { auth, flash } = props;
    const user = auth.user;
    const [pembayaranOpen, setPembayaranOpen] = useState(
        url.startsWith('/admin/tagihan') || url.startsWith('/admin/pembayaran'),
    );
    const [profileOpen, setProfileOpen] = useState(false);

    if (!user) {
        if (typeof window !== 'undefined') router.visit(route('login'));
        return null;
    }

    const logout = () => router.post(route('logout'));

    const navItems: NavItem[] = [
        {
            label: 'Dashboard',
            href: route('admin.dashboard'),
            icon: 'home',
            active: url === '/admin/dashboard',
        },
        {
            label: 'Kamar',
            href: route('admin.kamar.index'),
            icon: 'bed',
            active: url.startsWith('/admin/kamar'),
        },
        {
            label: 'Penyewa',
            href: route('admin.penyewa.index'),
            icon: 'user',
            active: url.startsWith('/admin/penyewa'),
        },
        {
            label: 'Pembayaran',
            href: route('admin.tagihan.index'),
            icon: 'wallet',
            active: url.startsWith('/admin/tagihan') || url.startsWith('/admin/pembayaran'),
            children: [
                { label: 'Tagihan', href: route('admin.tagihan.index'), active: url.startsWith('/admin/tagihan') },
                { label: 'Konfirmasi Bayar', href: route('admin.pembayaran.index'), active: url.startsWith('/admin/pembayaran') },
            ],
        },
        {
            label: 'Laporan',
            href: route('admin.laporan.keuangan'),
            icon: 'receipt',
            active: url.startsWith('/admin/laporan'),
        },
    ];

    const initial = user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

    return (
        <div className="admin-shell" style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex' }}>
            {/* ───── SIDEBAR ───── */}
            <aside style={{
                width: 240,
                background: 'white',
                borderRight: '1px solid #E5E7EB',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                zIndex: 30,
            }} className="admin-sidebar">
                {/* Brand */}
                <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                            display: 'grid', placeItems: 'center',
                        }}>
                            <Icon name="home" size={18} stroke={2} style={{ color: 'white' }} />
                        </div>
                        <span style={{ fontSize: 20, fontWeight: 700, color: '#2563EB', letterSpacing: '0.04em' }}>
                            SIMKOS
                        </span>
                    </Link>
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, padding: '12px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {navItems.map((item) => {
                        const isOpen = item.children && (pembayaranOpen || item.active);
                        return (
                            <div key={item.label}>
                                {item.children ? (
                                    <button
                                        onClick={() => setPembayaranOpen((o) => !o)}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '10px 12px',
                                            borderRadius: 8,
                                            background: item.active ? '#EFF6FF' : 'transparent',
                                            color: item.active ? '#2563EB' : '#475569',
                                            fontWeight: item.active ? 600 : 500,
                                            fontSize: 14,
                                            border: 0,
                                            cursor: 'pointer',
                                            borderLeft: item.active ? '3px solid #2563EB' : '3px solid transparent',
                                            marginLeft: -3,
                                            paddingLeft: 15,
                                        }}
                                    >
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <Icon name={item.icon} size={18} />
                                            {item.label}
                                        </span>
                                        <Icon name="chevron-down" size={14} style={{ transform: isOpen ? 'rotate(180deg)' : undefined, transition: 'transform 180ms' }} />
                                    </button>
                                ) : (
                                    <Link
                                        href={item.href}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 12,
                                            padding: '10px 12px',
                                            borderRadius: 8,
                                            background: item.active ? '#EFF6FF' : 'transparent',
                                            color: item.active ? '#2563EB' : '#475569',
                                            fontWeight: item.active ? 600 : 500,
                                            fontSize: 14,
                                            borderLeft: item.active ? '3px solid #2563EB' : '3px solid transparent',
                                            marginLeft: -3,
                                            paddingLeft: 15,
                                            transition: 'all 180ms',
                                        }}
                                    >
                                        <Icon name={item.icon} size={18} />
                                        {item.label}
                                    </Link>
                                )}

                                {/* Sub items */}
                                {item.children && isOpen && (
                                    <div style={{ marginLeft: 32, marginTop: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        {item.children.map((sub) => (
                                            <Link
                                                key={sub.label}
                                                href={sub.href}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    padding: '7px 12px',
                                                    fontSize: 13,
                                                    borderRadius: 6,
                                                    color: sub.active ? '#2563EB' : '#64748B',
                                                    fontWeight: sub.active ? 600 : 500,
                                                    background: sub.active ? '#F1F5F9' : 'transparent',
                                                }}
                                            >
                                                {sub.label}
                                                {sub.badge != null && (
                                                    <span style={{
                                                        background: '#EF4444', color: 'white',
                                                        fontSize: 10, fontWeight: 600,
                                                        padding: '2px 7px', borderRadius: 999,
                                                    }}>{sub.badge}</span>
                                                )}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div style={{ padding: '16px 12px', borderTop: '1px solid #E5E7EB' }}>
                    <button
                        onClick={logout}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '10px 12px',
                            borderRadius: 8,
                            background: 'transparent',
                            color: '#EF4444',
                            fontWeight: 500,
                            fontSize: 14,
                            border: 0,
                            cursor: 'pointer',
                        }}
                    >
                        <Icon name="arrow-right" size={18} />
                        Keluar
                    </button>
                </div>
            </aside>

            {/* ───── MAIN ───── */}
            <div style={{ flex: 1, marginLeft: 240, display: 'flex', flexDirection: 'column' }} className="admin-main">
                {/* Topbar */}
                <header style={{
                    background: '#F8FAFC',
                    padding: '20px 32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    borderBottom: '1px solid transparent',
                }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        {breadcrumb && (
                            <div style={{ fontSize: 13, color: '#64748B', marginBottom: 4 }}>
                                {breadcrumb}
                            </div>
                        )}
                        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0F172A', margin: 0 }}>{title}</h1>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        {/* Notif bell */}
                        <button style={{
                            position: 'relative', width: 40, height: 40,
                            display: 'grid', placeItems: 'center',
                            background: 'white', border: '1px solid #E5E7EB',
                            borderRadius: 999, cursor: 'pointer',
                            color: '#475569',
                        }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                            </svg>
                            <span style={{
                                position: 'absolute', top: 8, right: 9,
                                width: 8, height: 8, borderRadius: 999,
                                background: '#EF4444',
                            }} />
                        </button>

                        {/* Profile */}
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setProfileOpen((o) => !o)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    background: 'transparent', border: 0, cursor: 'pointer',
                                    padding: 0,
                                }}
                            >
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{user.name}</div>
                                    <div style={{ fontSize: 11, color: '#64748B' }}>
                                        {user.roles.includes('admin') ? 'Super Admin' : 'Penyewa'}
                                    </div>
                                </div>
                                <div style={{
                                    width: 40, height: 40, borderRadius: 999,
                                    background: 'linear-gradient(135deg, #60A5FA, #2563EB)',
                                    color: 'white', display: 'grid', placeItems: 'center',
                                    fontSize: 14, fontWeight: 600,
                                }}>{initial}</div>
                            </button>

                            {profileOpen && (
                                <>
                                    <div onClick={() => setProfileOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
                                    <div style={{
                                        position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                                        minWidth: 200, padding: 6, zIndex: 50,
                                        background: 'white', border: '1px solid #E5E7EB',
                                        borderRadius: 10, boxShadow: '0 10px 25px -10px rgba(0,0,0,0.15)',
                                    }}>
                                        <Link href={route('profile.edit')}
                                            style={{ display: 'block', padding: '10px 14px', fontSize: 14, color: '#0F172A', borderRadius: 6 }}>
                                            Profil saya
                                        </Link>
                                        <button onClick={logout}
                                            style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', fontSize: 14, color: '#EF4444', borderRadius: 6, background: 'none', border: 0, cursor: 'pointer' }}>
                                            Keluar
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Flash messages */}
                {(flash.success || flash.error) && (
                    <div style={{ padding: '0 32px', marginTop: -8 }}>
                        {flash.success && (
                            <div role="status" style={{
                                padding: 12, borderRadius: 10, marginBottom: 12,
                                background: '#DCFCE7', color: '#166534',
                                border: '1px solid #BBF7D0', fontSize: 14,
                            }}>✓ {flash.success}</div>
                        )}
                        {flash.error && (
                            <div role="alert" style={{
                                padding: 12, borderRadius: 10, marginBottom: 12,
                                background: '#FEE2E2', color: '#991B1B',
                                border: '1px solid #FECACA', fontSize: 14,
                            }}>{flash.error}</div>
                        )}
                    </div>
                )}

                {/* Content */}
                <main style={{ flex: 1, padding: '8px 32px 32px' }}>{children}</main>
            </div>

            {/* Responsive */}
            <style>{`
                @media (max-width: 900px) {
                    .admin-sidebar { width: 72px !important; }
                    .admin-sidebar nav span:not(.icon), .admin-sidebar .brand-text { display: none !important; }
                    .admin-main { margin-left: 72px !important; }
                }
            `}</style>
        </div>
    );
}
