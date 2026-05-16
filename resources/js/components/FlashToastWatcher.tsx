import { router } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { toast } from './Toast';

/**
 * Listen ke Inertia navigation events. Saat halaman baru ter-load dengan
 * flash.success / flash.error, otomatis fire toast.
 *
 * Mount sekali di app.tsx setelah ToastContainer.
 */
export default function FlashToastWatcher() {
    const lastSig = useRef<string>('');

    useEffect(() => {
        const handler = (event: { detail: { page: { props: Record<string, unknown> } } }) => {
            const flash = (event.detail.page.props.flash ?? {}) as { success?: string | null; error?: string | null };
            const sig = `${flash.success ?? ''}::${flash.error ?? ''}`;
            if (sig === lastSig.current) return;
            lastSig.current = sig;

            if (flash.success) toast.success(flash.success);
            if (flash.error) toast.error(flash.error);
        };

        const unsub = router.on('success', handler);
        return () => { unsub(); };
    }, []);

    return null;
}
