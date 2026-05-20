import { Link, usePage } from '@inertiajs/react';
import {
    forwardRef,
    useState,
    type ChangeEvent,
    type CSSProperties,
    type InputHTMLAttributes,
    type ReactNode,
} from 'react';

/* ============================================================
   ICONS (ported 1:1 from design components.jsx)
   ============================================================ */
type IconName =
    | 'arrow-right' | 'arrow-left' | 'chevron-down' | 'check' | 'x'
    | 'lock' | 'mail' | 'user' | 'phone' | 'eye' | 'eye-off'
    | 'shield' | 'bed' | 'wallet' | 'receipt' | 'map-pin'
    | 'wifi' | 'calendar' | 'clock' | 'upload' | 'home' | 'logo-wa'
    | 'search' | 'edit' | 'trash' | 'plus' | 'image' | 'info'
    | 'wave' | 'card' | 'receipt-search' | 'sparkles' | 'download' | 'ban' | 'refresh' | 'menu'
    | 'ac' | 'toilet' | 'desk' | 'closet' | 'parking' | 'fan' | 'send' | 'alert-circle' | 'expand';

type IconProps = {
    name: IconName;
    size?: number;
    stroke?: number;
    className?: string;
    style?: CSSProperties;
};

export const Icon = ({ name, size = 18, stroke = 1.6, className = '', style }: IconProps) => {
    const props = {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none' as const,
        stroke: 'currentColor',
        strokeWidth: stroke,
        strokeLinecap: 'round' as const,
        strokeLinejoin: 'round' as const,
        className,
        style,
        'aria-hidden': true,
    };
    switch (name) {
        case 'arrow-right': return <svg {...props}><path d="M5 12h14M13 5l7 7-7 7"/></svg>;
        case 'arrow-left':  return <svg {...props}><path d="M19 12H5M11 19l-7-7 7-7"/></svg>;
        case 'chevron-down':return <svg {...props}><path d="M6 9l6 6 6-6"/></svg>;
        case 'check':       return <svg {...props}><path d="M5 12l5 5L20 7"/></svg>;
        case 'x':           return <svg {...props}><path d="M18 6L6 18M6 6l12 12"/></svg>;
        case 'lock':        return <svg {...props}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>;
        case 'mail':        return <svg {...props}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>;
        case 'user':        return <svg {...props}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>;
        case 'phone':       return <svg {...props}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7a2 2 0 0 1 1.72 2.03z"/></svg>;
        case 'eye':         return <svg {...props}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>;
        case 'eye-off':     return <svg {...props}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-6.5 0-10-7-10-7a18.45 18.45 0 0 1 4.06-5.06M9.9 5.08A9.94 9.94 0 0 1 12 5c6.5 0 10 7 10 7a18.6 18.6 0 0 1-2.16 3.19M1 1l22 22M14.12 14.12A3 3 0 1 1 9.88 9.88"/></svg>;
        case 'shield':      return <svg {...props}><path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z"/><path d="M9 12l2 2 4-4"/></svg>;
        case 'bed':         return <svg {...props}><path d="M3 18V8M21 18v-5a3 3 0 0 0-3-3H3M3 14h18M3 18h18"/><circle cx="7.5" cy="11.5" r="1.5"/></svg>;
        case 'wallet':      return <svg {...props}><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M16 14h2"/></svg>;
        case 'receipt':     return <svg {...props}><path d="M6 2h12v20l-3-2-3 2-3-2-3 2V2z"/><path d="M9 7h6M9 11h6M9 15h4"/></svg>;
        case 'map-pin':     return <svg {...props}><path d="M12 22s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>;
        case 'wifi':        return <svg {...props}><path d="M5 12.55a11 11 0 0 1 14 0M2 8.82a16 16 0 0 1 20 0M8.5 16.43a6 6 0 0 1 7 0"/><circle cx="12" cy="20" r="0.5" fill="currentColor"/></svg>;
        case 'calendar':    return <svg {...props}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>;
        case 'clock':       return <svg {...props}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>;
        case 'upload':      return <svg {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>;
        case 'home':        return <svg {...props}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>;
        case 'logo-wa':     return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className} style={style}><path d="M17.5 14.4c-.3-.1-1.7-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-1 1.2-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.4.1-.6l.5-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-1-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.1-1.4-.1-.1-.3-.2-.5-.3M12 22h0a10 10 0 0 1-5-1.4L2 22l1.4-5A10 10 0 0 1 22 12c0 5.5-4.5 10-10 10m8.4-18.4A11.8 11.8 0 0 0 .2 17.4L0 24l6.7-1.8a12 12 0 0 0 5.4 1.4h0a12 12 0 0 0 8.3-20.4"/></svg>;
        case 'search':      return <svg {...props}><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>;
        case 'edit':        return <svg {...props}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
        case 'trash':       return <svg {...props}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>;
        case 'plus':        return <svg {...props}><path d="M12 5v14M5 12h14"/></svg>;
        case 'image':       return <svg {...props}><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="11" r="1.5"/><path d="M21 15l-4.5-4.5L7 21"/></svg>;
        case 'info':        return <svg {...props}><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>;
        case 'wave':        return <svg {...props}><path d="M7 11V6a1.5 1.5 0 1 1 3 0v4M10 10V4.5a1.5 1.5 0 1 1 3 0V10M13 9.5V5a1.5 1.5 0 1 1 3 0v7"/><path d="M16 7.5a1.5 1.5 0 0 1 3 0v6.5a8 8 0 0 1-8 8h-1a8 8 0 0 1-7.16-4.42L2 15.5a1.5 1.5 0 0 1 2.7-1.3l1.3 2.3"/></svg>;
        case 'card':        return <svg {...props}><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/></svg>;
        case 'receipt-search': return <svg {...props}><path d="M4 4h12v16l-3-2-3 2-3-2-3 2V4z"/><circle cx="18" cy="14" r="3"/><path d="M20.5 16.5L23 19"/></svg>;
        case 'sparkles':    return <svg {...props}><path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5z"/><path d="M19 14l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2zM5 4l.7 1.5L7 6.2 5.7 6.9 5 8.4l-.7-1.5L3 6.2l1.3-.7z"/></svg>;
        case 'download':    return <svg {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>;
        case 'ban':         return <svg {...props}><circle cx="12" cy="12" r="10"/><path d="M4.93 4.93l14.14 14.14"/></svg>;
        case 'refresh':     return <svg {...props}><path d="M3 12a9 9 0 0 1 15.5-6.3L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.5 6.3L3 16M3 21v-5h5"/></svg>;
        case 'menu':        return <svg {...props}><path d="M3 6h18M3 12h18M3 18h18"/></svg>;
        case 'ac':          return <svg {...props}><rect x="2" y="5" width="20" height="9" rx="2"/><path d="M6 14v2M10 14v3M14 14v2M18 14v3M6 9h12"/></svg>;
        case 'toilet':      return <svg {...props}><path d="M4 3h10v9H4z"/><path d="M14 5h4l2 7h-6"/><path d="M5 12v5a3 3 0 0 0 3 3h3a3 3 0 0 0 3-3v-5"/></svg>;
        case 'desk':        return <svg {...props}><path d="M2 9h20M5 9v11M19 9v11M8 9V7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M9 14h6"/></svg>;
        case 'closet':      return <svg {...props}><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M12 3v18M9 11h.01M15 11h.01"/></svg>;
        case 'parking':     return <svg {...props}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/></svg>;
        case 'fan':         return <svg {...props}><circle cx="12" cy="12" r="2"/><path d="M12 10c0-4-2-7-5-7s-3 3-3 5 3 4 8 4M14 12c4 0 7-2 7-5s-3-3-5-3-4 3-4 8M12 14c0 4 2 7 5 7s3-3 3-5-3-4-8-4M10 12c-4 0-7 2-7 5s3 3 5 3 4-3 4-8"/></svg>;
        case 'send':        return <svg {...props}><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>;
        case 'alert-circle': return <svg {...props}><circle cx="12" cy="12" r="10"/><path d="M12 8v5M12 16h.01"/></svg>;
        case 'expand':      return <svg {...props}><path d="M3 8V3h5M21 8V3h-5M3 16v5h5M21 16v5h-5"/></svg>;
        default: return null;
    }
};

/* ============================================================
   BRAND MARK — pakai image logo kalau ada, fallback ke gradient SVG
   ============================================================ */
export const Brand = ({
    size = 28,
    light = false,
    showText = true,
}: {
    size?: number;
    light?: boolean;
    showText?: boolean;
}) => {
    const [imgFailed, setImgFailed] = useState(false);
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            {imgFailed ? (
                <span className="brand-mark" style={{ width: size, height: size }} aria-hidden="true" />
            ) : (
                <img
                    src="/images/brand/logo.png"
                    alt="SimKos"
                    width={size}
                    height={size}
                    onError={() => setImgFailed(true)}
                    style={{
                        width: size,
                        height: size,
                        objectFit: 'contain',
                        filter: light ? 'brightness(0) invert(1)' : 'none',
                    }}
                />
            )}
            {showText && (
                <span style={{ fontSize: 19, fontWeight: 600, letterSpacing: '-0.02em', color: light ? '#f5f3ed' : 'var(--ink-900)' }}>
                    SimKos
                </span>
            )}
        </span>
    );
};

/* ============================================================
   PILL
   ============================================================ */
type PillTone = 'neutral' | 'success' | 'warning' | 'info' | 'danger';

export const Pill = ({
    tone = 'neutral',
    children,
    dot,
    className = '',
}: {
    tone?: PillTone;
    children: ReactNode;
    dot?: boolean | 'pulse';
    className?: string;
}) => (
    <span className={`pill pill-${tone} ${className}`}>
        {dot && (
            <span
                style={{
                    width: 6,
                    height: 6,
                    borderRadius: 999,
                    background:
                        tone === 'success' ? 'var(--success)' :
                        tone === 'warning' ? 'var(--warning)' :
                        tone === 'info' ? 'var(--blue-500)' :
                        tone === 'danger' ? 'var(--danger)' :
                        'var(--ink-500)',
                }}
                className={dot === 'pulse' ? 'pulse-dot' : ''}
                aria-hidden="true"
            />
        )}
        {children}
    </span>
);

/* ============================================================
   FIELD / INPUT
   ============================================================ */
export const Field = ({
    label,
    htmlFor,
    helper,
    error,
    children,
}: {
    label: ReactNode;
    htmlFor?: string;
    helper?: string;
    error?: string | null;
    children: ReactNode;
}) => (
    <div className="field">
        <label className="label" htmlFor={htmlFor}>{label}</label>
        {children}
        {error ? <p className="error" role="alert">{error}</p> : helper ? <p className="helper">{helper}</p> : null}
    </div>
);

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
    icon?: IconName;
    suffix?: ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(({ icon, suffix, ...props }, ref) => {
    if (!icon && !suffix) return <input ref={ref} className="input" {...props} />;
    return (
        <div style={{ position: 'relative' }}>
            {icon && (
                <span style={{
                    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--ink-400)', pointerEvents: 'none', display: 'inline-flex',
                }} aria-hidden="true">
                    <Icon name={icon} size={16} />
                </span>
            )}
            <input
                ref={ref}
                className="input"
                style={{ paddingLeft: icon ? 44 : undefined, paddingRight: suffix ? 44 : undefined, ...((props as { style?: React.CSSProperties }).style ?? {}) }}
                {...props}
            />
            {suffix && <span style={{ position: 'absolute', right: 6, top: 5 }}>{suffix}</span>}
        </div>
    );
});
Input.displayName = 'Input';

export const PasswordInput = (props: Omit<InputProps, 'icon' | 'suffix' | 'type'>) => {
    const [show, setShow] = useState(false);
    return (
        <Input
            {...props}
            type={show ? 'text' : 'password'}
            icon="lock"
            suffix={
                <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'}
                    style={{ background: 'transparent', border: 0, color: 'var(--ink-400)', padding: '8px 10px', borderRadius: 8, cursor: 'pointer' }}
                >
                    <Icon name={show ? 'eye-off' : 'eye'} size={18} />
                </button>
            }
        />
    );
};

/* ============================================================
   CHECKBOX
   ============================================================ */
export const Checkbox = ({
    id,
    checked,
    onChange,
    children,
}: {
    id: string;
    checked: boolean;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    children: ReactNode;
}) => (
    <label htmlFor={id} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
        <span style={{
            width: 18, height: 18, borderRadius: 5,
            border: `1.5px solid ${checked ? 'var(--blue-600)' : 'rgba(11,13,26,0.18)'}`,
            background: checked ? 'var(--blue-600)' : 'white',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 180ms var(--ease)',
            color: 'white',
        }}>
            {checked && <Icon name="check" size={12} stroke={3} />}
        </span>
        <input id={id} type="checkbox" checked={checked} onChange={onChange}
            style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }} />
        <span style={{ fontSize: 14, color: 'var(--ink-700)' }}>{children}</span>
    </label>
);

/* ============================================================
   TOP NAV (guest) — floating capsule (Perplexity-inspired)
   ============================================================ */
export const TopNav = ({ authenticated = false }: { authenticated?: boolean }) => {
    // Anchor link ke section homepage (#cara-kerja, #lokasi, #kontak) hanya valid
    // saat user berada di /. Di halaman lain (mis. /kamar), kita prefix dengan '/'
    // supaya browser navigate ke home dulu, baru scroll ke hash target.
    const url = usePage().url;
    const onHome = url === '/' || url.startsWith('/?') || url.startsWith('/#');
    const anchorHref = (hash: string) => onHome ? `#${hash}` : `/#${hash}`;

    return (
        <div className="nav-capsule-wrap">
            <nav className="nav-capsule" aria-label="Navigasi utama">
                <Link href="/" aria-label="SimKos beranda" style={{ display: 'inline-flex', padding: '2px 6px 2px 2px' }}>
                    <Brand size={32} light showText={false} />
                </Link>
                <div className="nav-capsule-divider" />
                <Link href={route('guest.kamar.index')} className="nav-link">Kamar</Link>
                <a href={anchorHref('cara-kerja')} className="nav-link hide-on-mobile">Cara Kerja</a>
                <a href={anchorHref('lokasi')} className="nav-link hide-on-mobile">Lokasi</a>
                <a href={anchorHref('kontak')} className="nav-link hide-on-mobile">Kontak</a>
                <div className="nav-capsule-divider" />
                {authenticated ? (
                    <Link href={route('dashboard')} className="nav-capsule-cta">
                        Dashboard <Icon name="arrow-right" size={14} stroke={2.2} />
                    </Link>
                ) : (
                    <Link href={route('login')} className="nav-capsule-cta">Masuk</Link>
                )}
            </nav>
        </div>
    );
};

/* ============================================================
   FOOTER — 4 kolom dengan navigasi penting
   ============================================================ */
export const Footer = ({ dark = false }: { dark?: boolean }) => {
    const linkColor = dark ? 'var(--dark-muted)' : 'var(--ink-500)';
    const headColor = dark ? 'var(--dark-text)' : 'var(--ink-900)';
    const dividerColor = dark ? 'rgba(255,255,255,0.06)' : 'rgba(11,13,26,0.08)';
    return (
        <footer style={{
            borderTop: `1px solid ${dividerColor}`,
            background: dark ? 'var(--dark-bg)' : 'rgba(255,255,255,0.6)',
            backdropFilter: dark ? 'none' : 'blur(10px)',
        }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px 24px' }}>
                <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 40, marginBottom: 32 }}>
                    {/* Brand block */}
                    <div>
                        <Brand size={40} light={dark} />
                        <p style={{ fontSize: 13.5, color: linkColor, marginTop: 14, lineHeight: 1.6, maxWidth: '34ch' }}>
                            Hunian modern di kawasan strategis Kedaton, Bandar Lampung. Dekat kampus, fasilitas kesehatan, dan pusat perbelanjaan.
                        </p>
                    </div>

                    {/* Eksplor */}
                    <div>
                        <h4 style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: headColor, margin: '0 0 14px' }}>Eksplor</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <li><Link href={route('guest.kamar.index')} style={{ color: linkColor, fontSize: 13.5 }}>Kamar</Link></li>
                            <li><a href="/#galeri" style={{ color: linkColor, fontSize: 13.5 }}>Galeri</a></li>
                            <li><a href="/#lokasi" style={{ color: linkColor, fontSize: 13.5 }}>Lokasi</a></li>
                            <li><a href="/#faq" style={{ color: linkColor, fontSize: 13.5 }}>FAQ</a></li>
                        </ul>
                    </div>

                    {/* Booking */}
                    <div>
                        <h4 style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: headColor, margin: '0 0 14px' }}>Booking</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <li><a href="/#cara-kerja" style={{ color: linkColor, fontSize: 13.5 }}>Cara Booking</a></li>
                            <li><a href="/#biaya" style={{ color: linkColor, fontSize: 13.5 }}>Biaya & Deposit</a></li>
                            <li><a href="/#peraturan" style={{ color: linkColor, fontSize: 13.5 }}>Peraturan</a></li>
                            <li><Link href={route('login')} style={{ color: linkColor, fontSize: 13.5 }}>Login Penyewa</Link></li>
                        </ul>
                    </div>

                    {/* Hubungi */}
                    <div>
                        <h4 style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: headColor, margin: '0 0 14px' }}>Hubungi</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <li><a href="/#kontak" style={{ color: linkColor, fontSize: 13.5 }}>WhatsApp</a></li>
                            <li><a href="/#kontak" style={{ color: linkColor, fontSize: 13.5 }}>Telepon</a></li>
                            <li><span style={{ color: linkColor, fontSize: 13.5 }}>Senin–Minggu, 08.00–21.00</span></li>
                        </ul>
                    </div>
                </div>

                <div style={{ paddingTop: 20, borderTop: `1px solid ${dividerColor}`, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between', color: linkColor, fontSize: 12.5 }}>
                    <span>© 2026 SimKos · Sistem Informasi Manajemen Kos</span>
                    <span>Dibuat untuk tugas Manajemen Proyek TI — Kelompok 4</span>
                </div>
            </div>
            <style>{`
                @media (max-width: 860px) {
                    .footer-grid { grid-template-columns: 1fr 1fr !important; }
                }
                @media (max-width: 540px) {
                    .footer-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </footer>
    );
};

/* ============================================================
   AUTH SHELL
   ============================================================ */
export const AuthShell = ({
    title,
    kicker,
    children,
    narrow = false,
}: {
    title: string;
    kicker?: string;
    children: ReactNode;
    narrow?: boolean;
}) => (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }} className="bg-radial">
        <TopNav />
        <main style={{ flex: 1, display: 'grid', placeItems: 'center', padding: '60px 24px' }}>
            <div className="card fade-up" style={{ width: '100%', maxWidth: narrow ? 420 : 480, padding: 36 }}>
                {kicker && (
                    <p style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--blue-600)', margin: 0, marginBottom: 10 }}>
                        {kicker}
                    </p>
                )}
                <h1 className="h-1" style={{ margin: 0, marginBottom: 8 }}>{title}</h1>
                {children}
            </div>
        </main>
        <Footer />
    </div>
);

/* ============================================================
   Helpers
   ============================================================ */
export const formatRp = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

/**
 * Input untuk nominal Rupiah — display pakai titik ribuan (200.000), tapi
 * value yang di-emit lewat onValueChange selalu angka murni (200000).
 *
 * Pakai untuk semua field harga/jumlah supaya admin mudah baca digit besar.
 *
 * Contoh:
 *   <CurrencyInput value={form.data.harga} onValueChange={(n) => form.setData('harga', n)} />
 */
type CurrencyInputProps = Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'value' | 'onChange' | 'type' | 'inputMode'
> & {
    value: number | string;
    onValueChange: (numeric: number) => void;
};

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
    ({ value, onValueChange, ...rest }, ref) => {
        const num = value === '' || value === null || value === undefined ? null : Number(value);
        const display = num === null || Number.isNaN(num) ? '' : num.toLocaleString('id-ID');

        return (
            <input
                ref={ref}
                type="text"
                inputMode="numeric"
                value={display}
                onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '');
                    onValueChange(raw === '' ? 0 : Number(raw));
                }}
                {...rest}
            />
        );
    },
);
CurrencyInput.displayName = 'CurrencyInput';

/**
 * Format tanggal ke "17 Mei 2026" — pakai untuk tampilan tanggal saja.
 */
export const formatDate = (input: string | Date | null | undefined): string => {
    if (!input) return '-';
    const d = typeof input === 'string' ? new Date(input) : input;
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

/**
 * Format tanggal+waktu ke "17 Mei 2026, 14:35" — gunakan untuk timestamp event/log.
 * Konsisten dgn backend `format('Y-m-d H:i')` (tanpa detik).
 */
export const formatDateTime = (input: string | Date | null | undefined): string => {
    if (!input) return '-';
    const d = typeof input === 'string' ? new Date(input) : input;
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
};

/**
 * Normalize Indonesian phone → 62xxx (untuk wa.me link).
 * "081234..." → "6281234..."
 */
export const normalizePhone = (raw: string | null | undefined): string | null => {
    if (!raw) return null;
    const digits = raw.replace(/\D+/g, '');
    if (!digits) return null;
    let normalized = digits;
    if (normalized.startsWith('0')) normalized = '62' + normalized.slice(1);
    else if (normalized.startsWith('8')) normalized = '62' + normalized;
    if (normalized.length < 10 || normalized.length > 15) return null;
    return normalized;
};

export const waLink = (phone: string | null | undefined, message?: string): string | null => {
    const n = normalizePhone(phone);
    if (!n) return null;
    const base = `https://wa.me/${n}`;
    return message ? `${base}?text=${encodeURIComponent(message)}` : base;
};
