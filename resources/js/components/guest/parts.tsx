import { useState, type ReactNode } from 'react';
import { Icon } from '@/components/ui';

/* ============================================================
   PhotoPlaceholder — reusable gradient placeholder (until real photos)
   ============================================================ */
type Accent = 'blue' | 'slate' | 'warm' | 'teal' | 'rose';

export const PhotoPlaceholder = ({
    label,
    height = 160,
    accent = 'blue',
    icon = 'home',
}: {
    label: string;
    height?: number | string;
    accent?: Accent;
    icon?: 'home' | 'user' | 'bed';
}) => {
    const gradients: Record<Accent, string> = {
        blue: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
        slate: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
        warm: 'linear-gradient(135deg, #fef3c7, #fde68a)',
        teal: 'linear-gradient(135deg, #ccfbf1, #99f6e4)',
        rose: 'linear-gradient(135deg, #ffe4e6, #fecdd3)',
    };
    return (
        <div style={{
            height,
            background: gradients[accent],
            borderRadius: 14,
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid rgba(11,13,26,0.05)',
            display: 'grid',
            placeItems: 'center',
        }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(60% 80% at 30% 20%, rgba(255,255,255,0.5), transparent)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: 'rgba(11,13,26,0.35)' }}>
                <Icon name={icon} size={28} stroke={1.4} />
                <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</span>
            </div>
        </div>
    );
};

/* ============================================================
   SectionHeader
   ============================================================ */
export const SectionHeader = ({
    kicker,
    title,
    desc,
    dark = false,
    align = 'left',
}: {
    kicker: string;
    title: string;
    desc?: string;
    dark?: boolean;
    align?: 'left' | 'center';
}) => (
    <div style={{
        marginBottom: 32,
        textAlign: align,
        maxWidth: align === 'center' ? '60ch' : undefined,
        marginLeft: align === 'center' ? 'auto' : 0,
        marginRight: align === 'center' ? 'auto' : 0,
    }}>
        <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase', color: dark ? 'var(--teal-500)' : 'var(--blue-600)', margin: 0 }}>{kicker}</p>
        <h2 style={{ fontSize: 'clamp(26px, 3.2vw, 36px)', lineHeight: 1.15, letterSpacing: '-0.025em', fontWeight: 500, color: dark ? 'var(--dark-text)' : 'var(--ink-900)', margin: '8px 0 0', maxWidth: '22ch' }}>
            {title}
        </h2>
        {desc && <p style={{ fontSize: 16, lineHeight: 1.6, color: dark ? 'var(--dark-muted)' : 'var(--ink-500)', margin: '12px 0 0', maxWidth: '52ch' }}>{desc}</p>}
    </div>
);

/* ============================================================
   Accordion — shared by Peraturan + FAQ
   ============================================================ */
export const Accordion = ({ items }: { items: Array<{ q: string; a: ReactNode | string }> }) => {
    const [open, setOpen] = useState<number>(0);
    return (
        <div className="card-solid" style={{ padding: 0, overflow: 'hidden' }}>
            {items.map((it, i) => {
                const isOpen = open === i;
                return (
                    <div key={i} style={{ borderTop: i > 0 ? '1px solid rgba(11,13,26,0.06)' : 0 }}>
                        <button
                            onClick={() => setOpen(isOpen ? -1 : i)}
                            aria-expanded={isOpen}
                            style={{
                                width: '100%', background: 'transparent', border: 0, padding: '18px 24px',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                                textAlign: 'left', cursor: 'pointer',
                            }}
                        >
                            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-900)' }}>{it.q}</span>
                            <span style={{ color: 'var(--ink-400)', transition: 'transform 200ms var(--ease)', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                <Icon name="chevron-down" size={18} />
                            </span>
                        </button>
                        {isOpen && (
                            <div style={{ padding: '0 24px 20px', fontSize: 14.5, lineHeight: 1.65, color: 'var(--ink-500)' }}>
                                {it.a}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
