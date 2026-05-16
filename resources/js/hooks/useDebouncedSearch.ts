import { router } from '@inertiajs/react';
import { useEffect, useRef } from 'react';

/**
 * Debounced search hook dengan cancellation. Pakai untuk live-search di table
 * supaya request lama auto-canceled saat user terus mengetik.
 *
 * @example
 *   useDebouncedSearch(q, route('admin.kamar.index'), { delay: 350 });
 */
export function useDebouncedSearch(
    value: string,
    url: string,
    options: {
        delay?: number;
        extraParams?: Record<string, string | number | undefined>;
    } = {},
) {
    const { delay = 350, extraParams = {} } = options;
    const cancelRef = useRef<{ cancel: () => void } | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            // Cancel pending request kalau ada
            cancelRef.current?.cancel?.();

            router.get(url, { q: value, ...extraParams }, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onStart: (visit) => {
                    cancelRef.current = { cancel: () => visit.cancel?.() };
                },
                onFinish: () => {
                    cancelRef.current = null;
                },
            });
        }, delay);

        return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, url, delay]);
}
