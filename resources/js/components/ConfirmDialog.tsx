import { useEffect, useState, type ReactNode } from 'react';
import { Icon } from '@/components/ui';

type ConfirmOpts = {
    title: string;
    description?: ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    tone?: 'danger' | 'warning' | 'info';
};

type Pending = ConfirmOpts & {
    resolve: (ok: boolean) => void;
};

let pushPending: ((p: Pending) => void) | null = null;

/**
 * Promise-based confirm dialog. Usage:
 *   const ok = await confirmDialog({ title: 'Hapus kamar?', tone: 'danger' });
 *   if (!ok) return;
 *
 * On-brand replacement untuk browser `confirm()`.
 */
export const confirmDialog = (opts: ConfirmOpts): Promise<boolean> =>
    new Promise((resolve) => {
        if (!pushPending) {
            // Container belum ter-mount — fallback ke native confirm
            resolve(window.confirm(`${opts.title}\n${opts.description ?? ''}`));
            return;
        }
        pushPending({ ...opts, resolve });
    });

const TONE_STYLE: Record<NonNullable<ConfirmOpts['tone']>, { iconColor: string; iconBg: string; confirmBg: string; confirmHover: string; icon: 'alert-circle' | 'info' }> = {
    danger: { iconColor: 'var(--danger)', iconBg: 'rgba(210,68,50,0.10)', confirmBg: 'var(--danger)', confirmHover: '#9d3525', icon: 'alert-circle' },
    warning: { iconColor: '#8a6c10', iconBg: 'rgba(200,158,42,0.12)', confirmBg: '#a78a1e', confirmHover: '#806918', icon: 'alert-circle' },
    info: { iconColor: 'var(--blue-700)', iconBg: 'var(--blue-50)', confirmBg: 'var(--blue-600)', confirmHover: 'var(--blue-700)', icon: 'info' },
};

/**
 * Mount sekali di root app (app.tsx).
 */
export default function ConfirmContainer() {
    const [pending, setPending] = useState<Pending | null>(null);

    useEffect(() => {
        pushPending = (p) => setPending(p);
        return () => { pushPending = null; };
    }, []);

    if (!pending) return null;

    const tone = pending.tone ?? 'info';
    const style = TONE_STYLE[tone];

    const close = (ok: boolean) => {
        pending.resolve(ok);
        setPending(null);
    };

    return (
        <div role="dialog" aria-modal="true" aria-labelledby="confirm-title"
            style={{
                position: 'fixed', inset: 0, zIndex: 9000,
                background: 'rgba(11,13,26,0.55)', backdropFilter: 'blur(6px)',
                display: 'grid', placeItems: 'center', padding: 16,
            }}
            onClick={() => close(false)}>
            <div onClick={(e) => e.stopPropagation()} className="toast-enter"
                style={{
                    background: 'white', borderRadius: 16, padding: 24,
                    maxWidth: 440, width: '100%',
                    boxShadow: '0 24px 64px -16px rgba(11,13,26,0.4)',
                }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: style.iconBg, color: style.iconColor,
                        display: 'grid', placeItems: 'center', flex: '0 0 auto',
                    }}>
                        <Icon name={style.icon} size={22} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 id="confirm-title" style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--ink-900)' }}>
                            {pending.title}
                        </h3>
                        {pending.description && (
                            <p style={{ margin: '6px 0 0', fontSize: 13.5, color: 'var(--ink-500)', lineHeight: 1.6 }}>
                                {pending.description}
                            </p>
                        )}
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
                    <button onClick={() => close(false)} className="btn btn-ghost btn-sm">
                        {pending.cancelLabel ?? 'Batal'}
                    </button>
                    <button onClick={() => close(true)}
                        style={{
                            padding: '8px 16px', borderRadius: 10,
                            background: style.confirmBg, color: 'white',
                            border: 0, cursor: 'pointer',
                            fontSize: 14, fontWeight: 600,
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            boxShadow: `0 6px 16px -6px ${style.confirmBg}80`,
                            transition: 'all 180ms var(--ease)',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = style.confirmHover)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = style.confirmBg)}>
                        {pending.confirmLabel ?? 'Konfirmasi'}
                    </button>
                </div>
            </div>
        </div>
    );
}
