import type { CSSProperties } from 'react';

/**
 * Shimmer skeleton placeholder. Pakai sebagai loading state:
 *   <Skeleton width="60%" height={20} />
 *   <SkeletonCard /> -- card-shaped placeholder
 *   <SkeletonTable rows={5} /> -- table loading state
 */
export const Skeleton = ({ width = '100%', height = 16, radius = 8, style }: {
    width?: string | number;
    height?: string | number;
    radius?: number;
    style?: CSSProperties;
}) => (
    <div className="skeleton-shimmer" style={{
        width, height, borderRadius: radius,
        background: 'linear-gradient(90deg, var(--ink-100) 0%, var(--ink-50) 50%, var(--ink-100) 100%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-pulse 1.4s ease-in-out infinite',
        ...style,
    }} />
);

export const SkeletonCard = ({ height = 110 }: { height?: number }) => (
    <div style={{
        background: 'white', borderRadius: 14, padding: 20,
        border: '1px solid rgba(11,13,26,0.06)',
        display: 'flex', flexDirection: 'column', gap: 10,
    }}>
        <Skeleton width="40%" height={14} />
        <Skeleton width="70%" height={Math.floor(height * 0.3)} />
    </div>
);

export const SkeletonTable = ({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) => (
    <div style={{
        background: 'white', borderRadius: 14, overflow: 'hidden',
        border: '1px solid rgba(11,13,26,0.06)',
    }}>
        {/* header */}
        <div style={{ padding: '14px 20px', background: 'var(--ink-50)', display: 'flex', gap: 16 }}>
            {Array.from({ length: cols }).map((_, i) => (
                <Skeleton key={i} width={`${Math.floor(100 / cols) - 2}%`} height={11} />
            ))}
        </div>
        {/* rows */}
        {Array.from({ length: rows }).map((_, r) => (
            <div key={r} style={{
                padding: '14px 20px',
                display: 'flex', gap: 16, alignItems: 'center',
                borderTop: '1px solid rgba(11,13,26,0.06)',
            }}>
                {Array.from({ length: cols }).map((_, c) => (
                    <Skeleton key={c} width={`${Math.floor(100 / cols) - 2}%`} height={14} />
                ))}
            </div>
        ))}
    </div>
);
