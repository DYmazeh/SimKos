import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import type { ReactElement } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import ToastContainer from '@/components/Toast';
import ConfirmContainer from '@/components/ConfirmDialog';
import FlashToastWatcher from '@/components/FlashToastWatcher';

const appName = import.meta.env.VITE_APP_NAME || 'SIMKOS';

// ——— Smooth scroll (Lenis) ———
// Init Lenis instance on document root. Re-init after Inertia navigations so
// halaman baru tetap dapat momentum scroll. Anchor link & scrollTo otomatis
// di-handle via element interception oleh Lenis.
let lenis: Lenis | null = null;
function initLenis() {
    lenis?.destroy();
    lenis = new Lenis({
        duration: 1.1,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
    });
    const raf = (time: number) => {
        lenis?.raf(time);
        requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
}
if (typeof window !== 'undefined') {
    initLenis();
    router.on('navigate', () => {
        // halaman baru: scroll ke top + re-init biar listener fresh
        window.scrollTo(0, 0);
        initLenis();
    });
}

createInertiaApp({
    title: (title) => (title ? `${title} · ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            import.meta.glob('./Pages/**/*.tsx') as any,
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <>
                <App {...props} />
                <ToastContainer />
                <ConfirmContainer />
                <FlashToastWatcher />
            </> as ReactElement,
        );
    },
    progress: {
        color: '#2563eb',
        showSpinner: false,
    },
});
