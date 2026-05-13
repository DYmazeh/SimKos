import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { AuthShell, Field, Input, Icon } from '@/components/ui';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({ email: '' });
    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('password.email'));
    };
    return (
        <AuthShell title="Lupa kata sandi?" kicker="Reset kata sandi" narrow>
            <Head title="Lupa Kata Sandi" />

            <p style={{ margin: 0, marginBottom: 22, color: 'var(--ink-500)', fontSize: 15 }}>
                Masukkan email Anda yang terdaftar. Kami kirim link untuk membuat kata sandi baru.
            </p>

            {status && (
                <div role="status" style={{ marginBottom: 14, padding: 12, borderRadius: 10, background: 'rgba(31,143,91,0.10)', color: 'var(--success)', fontSize: 13 }}>
                    ✓ {status}
                </div>
            )}

            <form onSubmit={submit} noValidate style={{ display: 'grid', gap: 14 }}>
                <Field label="Email Anda" htmlFor="email" error={errors.email}>
                    <Input id="email" type="email" icon="mail" placeholder="nama@email.com"
                        value={data.email} onChange={(e) => setData('email', e.target.value)} required autoFocus />
                </Field>
                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={processing || !data.email}>
                    {processing ? <span className="spinner" /> : <Icon name="mail" size={16} />}
                    {processing ? 'Mengirim…' : 'Kirim link reset'}
                </button>
            </form>

            <Link href={route('login')} className="btn btn-link" style={{ marginTop: 14, width: '100%', display: 'block', textAlign: 'center' }}>
                ← Kembali ke masuk
            </Link>
        </AuthShell>
    );
}
