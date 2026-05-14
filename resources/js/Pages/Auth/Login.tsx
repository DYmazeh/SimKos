import { Head, Link, useForm } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import { AuthShell, Field, Input, PasswordInput, Checkbox, Icon } from '@/components/ui';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

export default function Login({ status, canResetPassword }: { status?: string; canResetPassword?: boolean }) {
    const { data, setData, post, processing, errors } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: true,
    });
    const [showStatus] = useState(!!status);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <AuthShell title="Masuk ke SimKos" kicker="Selamat datang" narrow>
            <Head title="Masuk" />

            <p style={{ margin: 0, marginBottom: 22, color: 'var(--ink-500)', fontSize: 15 }}>
                Gunakan akun yang sudah didaftarkan oleh admin kos.
            </p>

            {showStatus && (
                <div role="status" style={{
                    marginBottom: 14, padding: 12, borderRadius: 10,
                    background: 'rgba(31,143,91,0.10)', color: 'var(--success)', fontSize: 13,
                }}>
                    ✓ {status}
                </div>
            )}

            <form onSubmit={submit} noValidate style={{ display: 'grid', gap: 14 }}>
                <Field label="Email Anda" htmlFor="email" error={errors.email}>
                    <Input
                        id="email"
                        type="email"
                        icon="mail"
                        placeholder="nama@email.com"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        autoComplete="username"
                        autoFocus
                        inputMode="email"
                        required
                    />
                </Field>

                <Field
                    label={
                        <span style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            <span>Kata Sandi Anda</span>
                            {canResetPassword && (
                                <Link href={route('password.request')}
                                    style={{ fontSize: 13, color: 'var(--blue-600)' }}>
                                    Lupa kata sandi?
                                </Link>
                            )}
                        </span>
                    }
                    htmlFor="password"
                    error={errors.password}
                >
                    <PasswordInput
                        id="password"
                        placeholder="Minimal 8 karakter"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        autoComplete="current-password"
                    />
                </Field>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                    <Checkbox
                        id="remember"
                        checked={data.remember}
                        onChange={(e) => setData('remember', e.target.checked)}
                    >
                        Ingat saya di perangkat ini
                    </Checkbox>
                </div>

                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 8 }} disabled={processing}>
                    {processing ? <span className="spinner" aria-hidden="true" /> : <Icon name="arrow-right" size={16} />}
                    {processing ? 'Memeriksa…' : 'Masuk'}
                </button>
            </form>

            <p style={{ margin: '22px 0 0', fontSize: 13.5, color: 'var(--ink-500)', textAlign: 'center' }}>
                Belum punya akun? Hubungi pemilik kos untuk didaftarkan.
            </p>
        </AuthShell>
    );
}
