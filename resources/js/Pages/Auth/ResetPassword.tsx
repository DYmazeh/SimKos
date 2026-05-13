import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { AuthShell, Field, Input, PasswordInput, Icon } from '@/components/ui';

export default function ResetPassword({ email, token }: { email: string; token: string }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token,
        email,
        password: '',
        password_confirmation: '',
    });
    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('password.store'), { onFinish: () => reset('password', 'password_confirmation') });
    };
    return (
        <AuthShell title="Buat kata sandi baru" kicker="Reset kata sandi" narrow>
            <Head title="Reset Kata Sandi" />

            <p style={{ margin: 0, marginBottom: 22, color: 'var(--ink-500)', fontSize: 15 }}>
                Untuk akun <strong style={{ color: 'var(--ink-900)' }}>{email}</strong>. Gunakan kata sandi yang Anda ingat.
            </p>

            <form onSubmit={submit} noValidate style={{ display: 'grid', gap: 14 }}>
                <Field label="Kata sandi baru" htmlFor="password" helper="Minimal 8 karakter." error={errors.password}>
                    <PasswordInput id="password" placeholder="Kata sandi baru" value={data.password}
                        onChange={(e) => setData('password', e.target.value)} autoFocus />
                </Field>
                <Field label="Ulangi kata sandi baru" htmlFor="password_confirmation"
                    error={data.password_confirmation && data.password_confirmation !== data.password ? 'Kata sandi tidak sama.' : errors.password_confirmation}>
                    <PasswordInput id="password_confirmation" placeholder="Ketik ulang"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)} />
                </Field>
                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}
                    disabled={processing || !data.password || data.password !== data.password_confirmation}>
                    {processing ? <span className="spinner" /> : <Icon name="check" size={16} />}
                    {processing ? 'Menyimpan…' : 'Simpan kata sandi baru'}
                </button>
            </form>
        </AuthShell>
    );
}
