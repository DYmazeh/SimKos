import { useEffect, useState, type ReactNode } from 'react';
import { Icon } from '@/components/ui';

type ToastTone = 'success' | 'error' | 'info';

type ToastMessage = {
    id: number;
    tone: ToastTone;
    content: ReactNode;
    duration: number;
};

let nextId = 0;
const listeners = new Set<(msg: ToastMessage) => void>();

/**
 * Global toast API. Pakai dari mana saja:
 *   toast.success('Berhasil disimpan');
 *   toast.error('Gagal upload');
 */
export const toast = {
    success: (content: ReactNode, duration = 3500) => emit({ tone: 'success', content, duration }),
    error: (content: ReactNode, duration = 4500) => emit({ tone: 'error', content, duration }),
    info: (content: ReactNode, duration = 3500) => emit({ tone: 'info', content, duration }),
};

const emit = (partial: Omit<ToastMessage, 'id'>) => {
    const msg: ToastMessage = { id: ++nextId, ...partial };
    listeners.forEach((fn) => fn(msg));
};

const TONE_STYLE: Record<ToastTone, { bg: string; fg: string; border: string; icon: 'check' | 'x' | 'info' }> = {
    success: { bg: 'rgba(31,143,91,0.10)', fg: 'var(--success)', border: 'rgba(31,143,91,0.22)', icon: 'check' },
    error: { bg: 'rgba(210,68,50,0.10)', fg: 'var(--danger)', border: 'rgba(210,68,50,0.22)', icon: 'x' },
    info: { bg: 'var(--blue-50)', fg: 'var(--blue-700)', border: 'rgba(37,99,235,0.18)', icon: 'info' },
};

/**
 * Mount sekali di root app (app.tsx).
 * Render fixed top-right (mobile: top-center), auto-dismiss.
 */
export default function ToastContainer() {
    const [items, setItems] = useState<ToastMessage[]>([]);

    useEffect(() => {
        const handler = (msg: ToastMessage) => {
            setItems((prev) => [...prev, msg]);
            setTimeout(() => {
                setItems((prev) => prev.filter((m) => m.id !== msg.id));
            }, msg.duration);
        };
        listeners.add(handler);
        return () => { listeners.delete(handler); };
    }, []);

    const dismiss = (id: number) => setItems((prev) => prev.filter((m) => m.id !== id));

    return (
        <div role="region" aria-label="Notifikasi" style={{
            position: 'fixed', top: 16, right: 16, zIndex: 9999,
            display: 'flex', flexDirection: 'column', gap: 10,
            maxWidth: 'calc(100vw - 32px)', width: 360,
            pointerEvents: 'none',
        }}>
            {items.map((m) => {
                const t = TONE_STYLE[m.tone];
                return (
                    <div key={m.id} role="status" className="toast-enter" style={{
                        pointerEvents: 'auto',
                        background: 'white', borderRadius: 12,
                        border: `1px solid ${t.border}`,
                        boxShadow: '0 8px 24px -8px rgba(11,13,26,0.20)',
                        padding: '12px 14px',
                        display: 'flex', alignItems: 'flex-start', gap: 10,
                    }}>
                        <span style={{
                            width: 28, height: 28, borderRadius: 8,
                            background: t.bg, color: t.fg,
                            display: 'inline-grid', placeItems: 'center', flex: '0 0 auto',
                        }}>
                            <Icon name={t.icon} size={15} stroke={2.4} />
                        </span>
                        <div style={{ flex: 1, minWidth: 0, fontSize: 13.5, color: 'var(--ink-800)', lineHeight: 1.5 }}>
                            {m.content}
                        </div>
                        <button onClick={() => dismiss(m.id)}
                            aria-label="Tutup notifikasi"
                            style={{
                                background: 'transparent', border: 0, cursor: 'pointer',
                                color: 'var(--ink-400)', padding: 4, borderRadius: 6,
                                display: 'inline-flex',
                            }}>
                            <Icon name="x" size={14} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
