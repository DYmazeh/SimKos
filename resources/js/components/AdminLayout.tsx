import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { Icon } from '@/components/ui';
import type { PageProps } from '@/types/inertia';

type NavItem = {
    label: string;
    href: string;
    icon: 'home' | 'bed' | 'user' | 'wallet' | 'receipt' | 'shield';
    active?: boolean;
    children?: Array<{ label: string; href: string; active?: boolean }>;
};

const PIN_KEY = 'simkos.sidebar.pinned';

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

    /* ───── Sidebar visibility ───── */
    // pinned (persisted) | hovering (transient)
    const [pinned, setPinned] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem(PIN_KEY) === '1';
    });
    const [hovering, setHovering] = useState(false);
    const visible = pinned || hovering;

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(PIN_KEY, pinned ? '1' : '0');
        }
    }, [pinned]);

    if (!user) {
        if (typeof window !== 'undefined') router.visit(route('login'));
        return null;
    }

    const logout = () => router.post(route('logout'));

    const navItems: NavItem[] = [
        { label: 'Dashboard', href: route('admin.dashboard'), icon: 'home', active: url === '/admin/dashboard' },
        { label: 'Kamar', href: route('admin.kamar.index'), icon: 'bed', active: url.startsWith('/admin/kamar') },
        { label: 'Penyewa', href: route('admin.penyewa.index'), icon: 'user', active: url.startsWith('/admin/penyewa') },
        {
            label: 'Pembayaran', href: route('admin.tagihan.index'), icon: 'wallet',
            active: url.startsWith('/admin/tagihan') || url.startsWith('/admin/pembayaran'),
            children: [
                { label: 'Tagihan', href: route('admin.tagihan.index'), active: url.startsWith('/admin/tagihan') },
                { label: 'Konfirmasi Bayar', href: route('admin.pembayaran.index'), active: url.startsWith('/admin/pembayaran') },
            ],
        },
        { label: 'Laporan', href: route('admin.laporan.keuangan'), icon: 'receipt', active: url.startsWith('/admin/laporan') },
    ];

    const initial = user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
    const unreadCount = (user as { unread_notif_count?: number }).unread_notif_count ?? 0;

    return (
        <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
            {/* ───── Edge hover trigger (always visible, transparent) ───── */}
            {!pinned && (
                <div
                    onMouseEnter={() => setHovering(true)}
                    style={{
                        position: 'fixed',
                        top: 0, left: 0, bottom: 0,
                        width: 12,
                        zIndex: 35,
                        cursor: 'pointer',
                        // tipis biru saat di-hover supaya user tahu ada trigger zone
                        background: hovering ? 'transparent' : 'linear-gradient(90deg, rgba(37,99,235,0.06) 0%, transparent 100%)',
                        transition: 'background 200ms',
                    }}
                    aria-label="Buka menu navigasi"
                />
            )}

            {/* Edge indicator pill (dot) saat sidebar tertutup */}
            {!pinned && !hovering && (
                <div style={{
                    position: 'fixed', top: 24, left: 4,
                    width: 4, height: 60, borderRadius: 999,
                    background: 'linear-gradient(180deg, #2563EB, #60A5FA)',
                    zIndex: 35,
                    pointerEvents: 'none',
                    boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
                }} />
            )}

            {/* Overlay saat sidebar visible & not pinned */}
            {visible && !pinned && (
                <div
                    onClick={() => setHovering(false)}
                    style={{
                        position: 'fixed', inset: 0,
                        background: 'rgba(11,13,26,0.18)',
                        backdropFilter: 'blur(2px)',
                        zIndex: 28,
                        animation: 'fade-up 200ms ease-out both',
                    }}
                />
            )}

            {/* ───── SIDEBAR ───── */}
            <aside
                onMouseEnter={() => setHovering(true)}
                onMouseLeave={() => setHovering(false)}
                style={{
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
                    transform: visible ? 'translateX(0)' : 'translateX(-240px)',
                    transition: 'transform 280ms cubic-bezier(.2,.8,.2,1), box-shadow 280ms',
                    boxShadow: visible && !pinned ? '0 10px 40px -10px rgba(11,13,26,0.25)' : 'none',
                }}
            >
                {/* Brand + Pin toggle */}
                <div style={{ padding: '16px 20px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                            display: 'grid', placeItems: 'center',
                        }}>
                            <Icon name="home" size={18} stroke={2} style={{ color: 'white' }} />
                        </div>
                        <span style={{ fontSize: 20, fontWeight: 700, color: '#2563EB', letterSpacing: '0.04em' }}>SIMKOS</span>
                    </Link>
                    <button
                        onClick={() => { setPinned((p) => !p); if (pinned) setHovering(false); }}
                        title={pinned ? 'Lepas pin (auto-hide sidebar)' : 'Pin sidebar (tetap terlihat)'}
                        aria-label={pinned ? 'Unpin sidebar' : 'Pin sidebar'}
                        style={{
                            width: 28, height: 28, borderRadius: 8,
                            background: pinned ? '#EFF6FF' : 'transparent',
                            color: pinned ? '#2563EB' : '#94A3B8',
                            border: 0, cursor: 'pointer',
                            display: 'grid', placeItems: 'center',
                            transition: 'all 200ms',
                        }}
                    >
                        {pinned ? (
                            // Pin filled
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/></svg>
                        ) : (
                            // Pin outline
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79L17 13V8a4 4 0 0 0-2-3.46L13 4V3a1 1 0 0 0-2 0v1L9 4.54A4 4 0 0 0 7 8v5l-.89.45A2 2 0 0 0 5 15.24V17z"/></svg>
                        )}
                    </button>
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, padding: '4px 12px', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
                    {navItems.map((item) => {
                        const isOpen = item.children && (pembayaranOpen || item.active);
                        return (
                            <div key={item.label}>
                                {item.children ? (
                                    <button
                                        onClick={() => setPembayaranOpen((o) => !o)}
                                        style={navItemStyle(item.active)}
                                    >
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <Icon name={item.icon} size={18} />
                                            {item.label}
                                        </span>
                                        <Icon name="chevron-down" size={14}
                                            style={{ transform: isOpen ? 'rotate(180deg)' : undefined, transition: 'transform 180ms' }} />
                                    </button>
                                ) : (
                                    <Link href={item.href} style={navItemStyle(item.active)}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <Icon name={item.icon} size={18} />
                                            {item.label}
                                        </span>
                                    </Link>
                                )}
                                {item.children && isOpen && (
                                    <div style={{ marginLeft: 32, marginTop: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        {item.children.map((sub) => (
                                            <Link key={sub.label} href={sub.href}
                                                style={{
                                                    display: 'block',
                                                    padding: '7px 12px', fontSize: 13,
                                                    borderRadius: 6,
                                                    color: sub.active ? '#2563EB' : '#64748B',
                                                    fontWeight: sub.active ? 600 : 500,
                                                    background: sub.active ? '#F1F5F9' : 'transparent',
                                                    transition: 'background 180ms',
                                                }}>
                                                {sub.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div style={{ padding: '12px 12px 16px', borderTop: '1px solid #E5E7EB' }}>
                    <button onClick={logout}
                        style={{
                            width: '100%',
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '10px 12px', borderRadius: 8,
                            background: 'transparent', color: '#EF4444',
                            fontWeight: 500, fontSize: 14, border: 0, cursor: 'pointer',
                            transition: 'background 180ms',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#FEE2E2')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                        <Icon name="arrow-right" size={18} />
                        Keluar
                    </button>
                </div>
            </aside>

            {/* ───── MAIN ───── */}
            <div
                style={{
                    marginLeft: pinned ? 240 : 0,
                    transition: 'margin-left 280ms cubic-bezier(.2,.8,.2,1)',
                    display: 'flex', flexDirection: 'column',
                    minHeight: '100vh',
                }}
            >
                {/* Topbar */}
                <header style={{
                    background: '#F8FAFC', padding: '20px 32px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: 16,
                }}>
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 14 }}>
                        {/* Sidebar toggle button (selalu visible) */}
                        {!pinned && (
                            <button
                                onClick={() => setPinned(true)}
                                aria-label="Tampilkan sidebar"
                                style={{
                                    width: 36, height: 36, borderRadius: 8,
                                    background: 'white', border: '1px solid #E5E7EB',
                                    color: '#475569', cursor: 'pointer',
                                    display: 'grid', placeItems: 'center',
                                }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                            </button>
                        )}
                        <div>
                            {breadcrumb && <div style={{ fontSize: 13, color: '#64748B', marginBottom: 4 }}>{breadcrumb}</div>}
                            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0F172A', margin: 0 }}>{title}</h1>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        {/* Bell */}
                        <button style={{
                            position: 'relative', width: 40, height: 40,
                            display: 'grid', placeItems: 'center',
                            background: 'white', border: '1px solid #E5E7EB',
                            borderRadius: 999, cursor: 'pointer', color: '#475569',
                            transition: 'all 180ms',
                        }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                            </svg>
                            {unreadCount > 0 && (
                                <span style={{
                                    position: 'absolute', top: -2, right: -2,
                                    minWidth: 18, height: 18, padding: '0 5px',
                                    borderRadius: 999,
                                    background: '#EF4444', color: 'white',
                                    fontSize: 10, fontWeight: 700,
                                    display: 'grid', placeItems: 'center',
                                    border: '2px solid #F8FAFC',
                                }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                            )}
                        </button>

                        {/* Profile dropdown */}
                        <div style={{ position: 'relative' }}>
                            <button onClick={() => setProfileOpen((o) => !o)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    background: 'transparent', border: 0, cursor: 'pointer', padding: 0,
                                }}>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{user.name}</div>
                                    <div style={{ fontSize: 11, color: '#64748B' }}>
                                        {user.roles.includes('admin') ? 'Super Admin' : 'Penyewa'}
                                    </div>
                                </div>
                                {(user as { avatar_url?: string | null }).avatar_url ? (
                                    <img src={(user as { avatar_url?: string }).avatar_url!}
                                        alt={user.name}
                                        style={{ width: 40, height: 40, borderRadius: 999, objectFit: 'cover' }} />
                                ) : (
                                    <div style={{
                                        width: 40, height: 40, borderRadius: 999,
                                        background: 'linear-gradient(135deg, #60A5FA, #2563EB)',
                                        color: 'white', display: 'grid', placeItems: 'center',
                                        fontSize: 14, fontWeight: 600,
                                    }}>{initial}</div>
                                )}
                            </button>

                            {profileOpen && (
                                <>
                                    <div onClick={() => setProfileOpen(false)}
                                        style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
                                    <div className="toast-enter" style={{
                                        position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                                        minWidth: 220, padding: 6, zIndex: 50,
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

                {/* Flash banner */}
                {(flash.success || flash.error) && (
                    <div style={{ padding: '0 32px', marginTop: -8 }}>
                        {flash.success && (
                            <div className="toast-enter" role="status" style={{
                                padding: 12, borderRadius: 10, marginBottom: 12,
                                background: '#DCFCE7', color: '#166534',
                                border: '1px solid #BBF7D0', fontSize: 14,
                            }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Icon name="check" size={15} stroke={2.4} /> {flash.success}</span></div>
                        )}
                        {flash.error && (
                            <div className="toast-enter" role="alert" style={{
                                padding: 12, borderRadius: 10, marginBottom: 12,
                                background: '#FEE2E2', color: '#991B1B',
                                border: '1px solid #FECACA', fontSize: 14,
                            }}>{flash.error}</div>
                        )}
                    </div>
                )}

                <main style={{ flex: 1, padding: '8px 32px 32px' }}>{children}</main>
            </div>
        </div>
    );
}

const navItemStyle = (active?: boolean): CSSProperties => ({
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 12px',
    paddingLeft: 15,
    marginLeft: -3,
    borderRadius: 8,
    background: active ? '#EFF6FF' : 'transparent',
    color: active ? '#2563EB' : '#475569',
    fontWeight: active ? 600 : 500,
    fontSize: 14,
    border: 0,
    cursor: 'pointer',
    borderLeft: active ? '3px solid #2563EB' : '3px solid transparent',
    transition: 'all 180ms cubic-bezier(.2,.8,.2,1)',
    textDecoration: 'none',
});
