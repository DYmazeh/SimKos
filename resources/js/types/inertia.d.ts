import type { Config } from 'ziggy-js';

export type AuthUser = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    roles: string[];
};

export type SharedAuth = {
    user: AuthUser | null;
};

export type Flash = {
    success: string | null;
    error: string | null;
};

export type AppMeta = {
    name: string;
    kos_nama: string;
    kos_alamat: string;
};

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: SharedAuth;
    flash: Flash;
    app: AppMeta;
    ziggy: Config & { location: string };
    errors: Record<string, string>;
};
