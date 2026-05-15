import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

type Direction = 'up' | 'down' | 'left' | 'right' | 'fade' | 'scale';

type RevealProps = {
    children: ReactNode;
    direction?: Direction;
    delay?: number;     // ms
    duration?: number;  // ms
    distance?: number;  // px (translate amount)
    threshold?: number; // 0..1
    once?: boolean;
    className?: string;
    style?: CSSProperties;
    as?: keyof JSX.IntrinsicElements;
};

/**
 * <Reveal direction="up" delay={100}>...</Reveal>
 *
 * Element starts hidden (opacity 0 + transform), then animates into view
 * when it enters the viewport. Uses IntersectionObserver, respects
 * prefers-reduced-motion.
 */
export default function Reveal({
    children,
    direction = 'up',
    delay = 0,
    duration = 600,
    distance = 24,
    threshold = 0.15,
    once = true,
    className = '',
    style,
    as: Tag = 'div',
}: RevealProps) {
    const ref = useRef<HTMLElement | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        // Respect prefers-reduced-motion
        if (typeof window !== 'undefined' &&
            window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
            setVisible(true);
            return;
        }

        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    if (once) obs.unobserve(entry.target);
                } else if (!once) {
                    setVisible(false);
                }
            },
            { threshold, rootMargin: '0px 0px -40px 0px' },
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold, once]);

    const initialTransform = (() => {
        if (visible) return 'translate3d(0,0,0) scale(1)';
        switch (direction) {
            case 'up':    return `translate3d(0,${distance}px,0)`;
            case 'down':  return `translate3d(0,-${distance}px,0)`;
            case 'left':  return `translate3d(${distance}px,0,0)`;
            case 'right': return `translate3d(-${distance}px,0,0)`;
            case 'scale': return 'scale(0.96)';
            case 'fade':
            default:      return 'translate3d(0,0,0)';
        }
    })();

    return (
        <Tag
            ref={ref as never}
            className={className}
            style={{
                opacity: visible ? 1 : 0,
                transform: initialTransform,
                transition: `opacity ${duration}ms cubic-bezier(.2,.8,.2,1) ${delay}ms, transform ${duration}ms cubic-bezier(.2,.8,.2,1) ${delay}ms`,
                willChange: 'opacity, transform',
                ...style,
            }}
        >
            {children}
        </Tag>
    );
}
