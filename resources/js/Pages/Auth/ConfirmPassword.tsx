import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { AuthShell, Field, PasswordInput, Icon } from '@/components/ui';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({ password: '' });
    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('password.confirm'), { onFinish: () => reset('password') });
    };
    return (
        <AuthShell title="Konfirmasi kata sandi" kicker="Area sensitif" narrow>
            <Head title="Konfirmasi Kata Sandi" />

            <div style={{
                margin: '4px 0 22px', padding: 14, borderRadius: 12,
                background: 'rgba(200,158,42,0.08)', border: '1px solid rgba(200,158,42,0.20)',
                color: '#7a5e08', fontSize: 13.5, display: 'flex', gap: 10, alignItems: 'flex-start',
            }}>
                <Icon name="shield" size={18} />
                <span>Halaman ini butuh konfirmasi tambahan. Masukkan kata sandi Anda untuk lanjut.</span>
            </div>

            <form onSubmit={submit} noValidate style={{ display: 'grid', gap: 14 }}>
                <Field label="Kata Sandi" htmlFor="password" error={errors.password}>
                    <PasswordInput id="password" placeholder="Kata sandi Anda" value={data.password}
                        onChange={(e) => setData('password', e.target.value)} autoFocus />
                </Field>
                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}
                    disabled={processing || !data.password}>
                    {processing ? <span className="spinner" /> : <Icon name="check" size={16} />}
                    {processing ? 'Mengonfirmasi…' : 'Konfirmasi'}
                </button>
            </form>
        </AuthShell>
    );
}
