import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import type { ReactElement } from 'react';

const appName = import.meta.env.VITE_APP_NAME || 'SIMKOS';

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
        root.render(<App {...props} /> as ReactElement);
    },
    progress: {
        color: '#2563eb',
        showSpinner: false,
    },
});
