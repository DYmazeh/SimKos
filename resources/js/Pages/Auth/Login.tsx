import { Head, Link, useForm } from '@inertiajs/react';
import { type FormEvent, useState } from 'react';
import { Brand, Field, Input, PasswordInput, Checkbox } from '@/components/ui';

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

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('login'));
    };

    const [bgFailed, setBgFailed] = useState(false);

    return (
        <>
            <Head title="Masuk" />

            <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '5fr 7fr', background: '#F8FAFC' }} className="login-grid">
                {/* ───── LEFT: branding + image hero ───── */}
                <aside style={{
                    position: 'relative',
                    overflow: 'hidden',
                    background: bgFailed
                        ? 'linear-gradient(160deg, #0b1220 0%, #1E3A8A 60%, #2563EB 100%)'
                        : '#0b1220',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: 48,
                    color: 'white',
                }} className="login-left">
                    {/* Background image with fallback */}
                    {!bgFailed && (
                        <img
                            src="/images/kos/login-side.jpg"
                            alt=""
                            onError={() => setBgFailed(true)}
                            style={{
                                position: 'absolute', inset: 0,
                                width: '100%', height: '100%',
                                objectFit: 'cover', display: 'block',
                                opacity: 0.55,
                            }}
                        />
                    )}
                    {/* Dark overlay for readability */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(180deg, rgba(11,18,32,0.4) 0%, rgba(11,18,32,0.85) 100%)',
                    }} aria-hidden="true" />

                    <div style={{ position: 'relative', maxWidth: 420 }}>
                        <div style={{ marginBottom: 32 }}>
                            <Brand size={64} light />
                        </div>
                        <h2 style={{ fontSize: 26, fontWeight: 600, margin: '0 0 14px', lineHeight: 1.25, letterSpacing: '-0.02em' }}>
                            Hunian modern di kawasan<br />strategis Kedaton.
                        </h2>
                        <p style={{ fontSize: 15, lineHeight: 1.65, color: 'rgba(255,255,255,0.82)', margin: 0 }}>
                            Kelola data kamar, penyewa, dan tagihan dalam satu platform yang efisien dan transparan.
                        </p>
                    </div>
                </aside>

                {/* ───── RIGHT: form ───── */}
                <main style={{ display: 'grid', placeItems: 'center', padding: 32 }}>
                    <div style={{ width: '100%', maxWidth: 420 }}>
                        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#0F172A', margin: '0 0 8px', letterSpacing: '-0.025em' }}>
                            Selamat Datang
                        </h1>
                        <p style={{ fontSize: 15, color: '#64748B', margin: '0 0 32px' }}>
                            Masuk ke akun Anda untuk melanjutkan.
                        </p>

                        {status && (
                            <div role="status" style={{
                                marginBottom: 16, padding: 12, borderRadius: 10,
                                background: '#DCFCE7', color: '#166534', fontSize: 13,
                            }}>✓ {status}</div>
                        )}

                        <form onSubmit={submit} noValidate style={{ display: 'grid', gap: 16 }}>
                            <Field label="Alamat Email" htmlFor="email" error={errors.email}>
                                <Input
                                    id="email"
                                    type="email"
                                    icon="mail"
                                    placeholder="nama@email.com"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    autoComplete="username"
                                    autoFocus
                                    required
                                />
                            </Field>

                            <Field
                                label={
                                    <span style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                        <span>Kata Sandi</span>
                                        {canResetPassword && (
                                            <Link href={route('password.request')}
                                                style={{ fontSize: 13, color: '#2563EB', fontWeight: 500 }}>
                                                Lupa Password?
                                            </Link>
                                        )}
                                    </span>
                                }
                                htmlFor="password"
                                error={errors.password}
                            >
                                <PasswordInput
                                    id="password"
                                    placeholder="••••••••"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    autoComplete="current-password"
                                />
                            </Field>

                            <Checkbox
                                id="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                            >
                                Ingat Saya
                            </Checkbox>

                            <button type="submit"
                                style={{
                                    width: '100%',
                                    background: '#2563EB',
                                    color: 'white',
                                    height: 48,
                                    borderRadius: 10,
                                    fontSize: 15,
                                    fontWeight: 600,
                                    border: 0,
                                    cursor: 'pointer',
                                    marginTop: 4,
                                    transition: 'background 180ms',
                                }} disabled={processing}>
                                {processing ? 'Memeriksa…' : 'Masuk'}
                            </button>
                        </form>

                        <p style={{ margin: '32px 0 0', fontSize: 14, color: '#64748B', textAlign: 'center' }}>
                            Butuh bantuan?{' '}
                            <a href="https://wa.me/6281385748661?text=Halo,%20saya%20butuh%20bantuan%20masuk%20ke%20SIMKOS" target="_blank" rel="noopener noreferrer"
                                style={{ color: '#2563EB', fontWeight: 500, textDecoration: 'underline' }}>
                                Hubungi Admin
                            </a>
                        </p>
                    </div>
                </main>

                <style>{`
                    @media (max-width: 860px) {
                        .login-grid { grid-template-columns: 1fr !important; }
                        .login-left { display: none !important; }
                    }
                `}</style>
            </div>
        </>
    );
}
