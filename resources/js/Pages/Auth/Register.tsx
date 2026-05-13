import { Head, Link, useForm } from '@inertiajs/react';
import { useMemo, type FormEvent } from 'react';
import { AuthShell, Field, Input, PasswordInput, Icon } from '@/components/ui';

type RegisterForm = {
    name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
};

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
    });

    const strength = useMemo(() => {
        const p = data.password;
        let s = 0;
        if (p.length >= 8) s++;
        if (/[A-Z]/.test(p)) s++;
        if (/[0-9]/.test(p)) s++;
        if (/[^A-Za-z0-9]/.test(p)) s++;
        return s;
    }, [data.password]);

    const strengthLabel = ['Lemah', 'Cukup', 'Baik', 'Kuat'][Math.max(0, strength - 1)] || '—';
    const strengthTone = strength >= 3 ? 'var(--success)' : strength === 2 ? 'var(--warning)' : 'var(--danger)';

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthShell title="Daftarkan akun Anda" kicker="Penyewa baru">
            <Head title="Daftar" />

            <p style={{ margin: 0, marginBottom: 22, color: 'var(--ink-500)', fontSize: 15 }}>
                Setelah daftar, admin akan menautkan akun Anda ke kamar yang sudah disepakati.
            </p>

            <form onSubmit={submit} noValidate style={{ display: 'grid', gap: 14 }}>
                <Field label="Nama lengkap" htmlFor="name" error={errors.name}>
                    <Input
                        id="name"
                        icon="user"
                        placeholder="Sesuai KTP"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        autoFocus
                        required
                        autoComplete="name"
                    />
                </Field>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="reg-row">
                    <Field label="Email" htmlFor="email" error={errors.email}>
                        <Input
                            id="email"
                            type="email"
                            icon="mail"
                            placeholder="nama@email.com"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="email"
                            inputMode="email"
                        />
                    </Field>
                    <Field label="No. WhatsApp" htmlFor="phone" helper="Untuk pengingat tagihan." error={errors.phone}>
                        <Input
                            id="phone"
                            type="tel"
                            icon="phone"
                            placeholder="08xxxxxxxxxx"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            required
                            autoComplete="tel"
                            inputMode="tel"
                        />
                    </Field>
                </div>

                <Field
                    label="Kata sandi"
                    htmlFor="password"
                    helper="Minimal 8 karakter, kombinasi huruf & angka."
                    error={errors.password}
                >
                    <PasswordInput
                        id="password"
                        placeholder="Buat kata sandi baru"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        autoComplete="new-password"
                    />
                </Field>

                {data.password && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: -6 }}>
                        <div style={{ flex: 1, display: 'flex', gap: 4 }}>
                            {[0, 1, 2, 3].map((i) => (
                                <div key={i} style={{
                                    flex: 1, height: 4, borderRadius: 999,
                                    background: i < strength ? strengthTone : 'rgba(11,13,26,0.08)',
                                    transition: 'background 240ms var(--ease)',
                                }} />
                            ))}
                        </div>
                        <span style={{ fontSize: 12, color: strengthTone, fontWeight: 500, minWidth: 50, textAlign: 'right' }}>{strengthLabel}</span>
                    </div>
                )}

                <Field
                    label="Ulangi kata sandi"
                    htmlFor="password_confirmation"
                    error={data.password_confirmation && data.password_confirmation !== data.password ? 'Kata sandi tidak sama.' : errors.password_confirmation}
                >
                    <PasswordInput
                        id="password_confirmation"
                        placeholder="Ketik ulang kata sandi"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        autoComplete="new-password"
                    />
                </Field>

                <p style={{ fontSize: 12.5, color: 'var(--ink-500)', margin: 0, marginTop: 4 }}>
                    Dengan mendaftar, Anda setuju dengan syarat penyewa dan kebijakan privasi SimKos.
                </p>

                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 8 }} disabled={processing}>
                    {processing ? <span className="spinner" /> : <Icon name="check" size={16} />}
                    {processing ? 'Mendaftarkan…' : 'Buat akun'}
                </button>
            </form>

            <p style={{ margin: '18px 0 0', fontSize: 13.5, color: 'var(--ink-500)', textAlign: 'center' }}>
                Sudah punya akun?{' '}
                <Link href={route('login')} style={{ color: 'var(--blue-600)', fontWeight: 500 }}>
                    Masuk
                </Link>
            </p>

            <style>{`@media (max-width: 540px) { .reg-row { grid-template-columns: 1fr !important; } }`}</style>
        </AuthShell>
    );
}
