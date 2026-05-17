import { type CSSProperties } from 'react';
import { Icon } from '@/components/ui';

export type Foto = { id: number; url: string };

type Props = {
    foto: Foto[];
    /** Total height of the grid container in px. Default 200. */
    height?: number;
};

/**
 * Adaptive photo grid untuk komplain:
 *   1 foto  → hero besar (full width)
 *   2 foto  → 2-column grid (50/50)
 *   3 foto  → bento (1 besar kiri 2/3 + 2 kecil stacked kanan 1/3)
 *
 * Hover state: subtle zoom + expand icon overlay supaya jelas bisa di-klik.
 * Klik → buka full image di tab baru (target=_blank).
 */
export function KomplenFotoGrid({ foto, height = 200 }: Props) {
    if (foto.length === 0) return null;

    const containerBase: CSSProperties = {
        display: 'grid',
        gap: 8,
        height,
        width: '100%',
    };

    if (foto.length === 1) {
        return (
            <div style={{ ...containerBase, gridTemplateColumns: '1fr' }}>
                <FotoTile foto={foto[0]} />
            </div>
        );
    }

    if (foto.length === 2) {
        return (
            <div style={{ ...containerBase, gridTemplateColumns: '1fr 1fr' }}>
                <FotoTile foto={foto[0]} />
                <FotoTile foto={foto[1]} />
            </div>
        );
    }

    // 3+ foto → bento
    return (
        <div
            style={{
                ...containerBase,
                gridTemplateColumns: '2fr 1fr',
                gridTemplateRows: '1fr 1fr',
            }}
        >
            <div style={{ gridRow: 'span 2', minHeight: 0 }}>
                <FotoTile foto={foto[0]} />
            </div>
            <FotoTile foto={foto[1]} />
            {foto[2] && (
                <FotoTile
                    foto={foto[2]}
                    extraCount={foto.length > 3 ? foto.length - 3 : 0}
                />
            )}
        </div>
    );
}

/* ───── Foto tile dengan hover state ───── */
function FotoTile({ foto, extraCount = 0 }: { foto: Foto; extraCount?: number }) {
    return (
        <a
            href={foto.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Lihat foto bukti dalam ukuran penuh"
            style={{
                position: 'relative',
                display: 'block',
                width: '100%',
                height: '100%',
                borderRadius: 12,
                overflow: 'hidden',
                border: '1px solid rgba(11,13,26,0.06)',
                background: 'var(--ink-50)',
                cursor: 'zoom-in',
                isolation: 'isolate',
            }}
            onMouseEnter={(e) => {
                const img = e.currentTarget.querySelector('img');
                const overlay = e.currentTarget.querySelector('[data-overlay]') as HTMLElement;
                if (img) img.style.transform = 'scale(1.05)';
                if (overlay) overlay.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
                const img = e.currentTarget.querySelector('img');
                const overlay = e.currentTarget.querySelector('[data-overlay]') as HTMLElement;
                if (img) img.style.transform = 'scale(1)';
                if (overlay) overlay.style.opacity = '0';
            }}
        >
            <img
                src={foto.url}
                alt="Foto bukti komplen"
                loading="lazy"
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 380ms cubic-bezier(.2,.8,.2,1)',
                }}
            />
            {/* Hover overlay: ada icon expand supaya jelas bisa di-klik */}
            <div
                data-overlay
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(11,13,26,0) 50%, rgba(11,13,26,0.45) 100%)',
                    opacity: 0,
                    transition: 'opacity 220ms ease',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'flex-end',
                    padding: 10,
                    pointerEvents: 'none',
                }}
            >
                <div
                    style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.95)',
                        color: 'var(--ink-900)',
                        display: 'grid',
                        placeItems: 'center',
                        backdropFilter: 'blur(8px)',
                        boxShadow: '0 2px 8px -2px rgba(0,0,0,0.2)',
                    }}
                >
                    <Icon name="expand" size={14} stroke={2} />
                </div>
            </div>
            {extraCount > 0 && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(11,13,26,0.55)',
                        color: 'white',
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: 18,
                        fontWeight: 700,
                        letterSpacing: '-0.01em',
                        pointerEvents: 'none',
                    }}
                >
                    +{extraCount}
                </div>
            )}
        </a>
    );
}
