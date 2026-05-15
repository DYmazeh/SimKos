import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { Field, Input, PasswordInput, Checkbox } from '@/components/ui';

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

    return (
        <>
            <Head title="Masuk" />

            <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '5fr 7fr', background: '#F8FAFC' }} className="login-grid">
                {/* ───── LEFT: branding + photo ───── */}
                <aside style={{
                    position: 'relative',
                    overflow: 'hidden',
                    background: 'linear-gradient(160deg, #1E3A8A 0%, #2563EB 60%, #3B82F6 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: 48,
                    color: 'white',
                }} className="login-left">
                    {/* Subtle building shape (SVG) */}
                    <svg viewBox="0 0 600 800" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.15 }}>
                        <rect x="80" y="200" width="180" height="380" fill="white" />
                        {[240, 310, 380, 450].map((y) => (
                            <g key={y}>
                                <rect x="100" y={y} width="30" height="40" fill="#1E3A8A" />
                                <rect x="150" y={y} width="30" height="40" fill="#1E3A8A" />
                                <rect x="200" y={y} width="30" height="40" fill="#1E3A8A" />
                            </g>
                        ))}
                        <rect x="320" y="280" width="160" height="300" fill="white" />
                        {[320, 380, 440].map((y) => (
                            <g key={y}>
                                <rect x="340" y={y} width="28" height="38" fill="#1E3A8A" />
                                <rect x="385" y={y} width="28" height="38" fill="#1E3A8A" />
                                <rect x="430" y={y} width="28" height="38" fill="#1E3A8A" />
                            </g>
                        ))}
                        <rect x="0" y="580" width="600" height="220" fill="white" opacity="0.1" />
                    </svg>

                    <div style={{ position: 'relative', maxWidth: 380 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
                            <div style={{
                                width: 56, height: 56, borderRadius: 14,
                                background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
                                border: '1px solid rgba(255,255,255,0.25)',
                                display: 'grid', placeItems: 'center',
                            }}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" />
                                </svg>
                            </div>
                            <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.02em' }}>SIMKOS</div>
                        </div>
                        <h2 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 12px', lineHeight: 1.3 }}>
                            Sistem Informasi Manajemen Kos-Kosan
                        </h2>
                        <p style={{ fontSize: 15, lineHeight: 1.6, color: 'rgba(255,255,255,0.85)', margin: 0 }}>
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
