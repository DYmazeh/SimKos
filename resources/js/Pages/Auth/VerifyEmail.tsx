import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { AuthShell, Icon } from '@/components/ui';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});
    const resend = (e: FormEvent) => {
        e.preventDefault();
        post(route('verification.send'));
    };
    return (
        <AuthShell title="Cek email Anda sekarang" kicker="Verifikasi" narrow>
            <Head title="Verifikasi Email" />

            <div style={{
                margin: '4px 0 22px', padding: 18, borderRadius: 14,
                background: 'var(--blue-100)', border: '1px solid rgba(59,130,246,0.18)',
                display: 'flex', gap: 14, alignItems: 'flex-start',
            }}>
                <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: 'white', color: 'var(--blue-600)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                }}>
                    <Icon name="mail" size={18} />
                </div>
                <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-900)' }}>Link verifikasi sudah dikirim</div>
                    <div style={{ fontSize: 13, color: 'var(--ink-700)', marginTop: 2 }}>
                        Buka inbox Anda dan klik link verifikasi. Link berlaku 24 jam.
                    </div>
                </div>
            </div>

            {status === 'verification-link-sent' && (
                <div role="status" style={{ marginBottom: 14, padding: 10, borderRadius: 10, background: 'rgba(31,143,91,0.10)', color: 'var(--success)', fontSize: 13 }}>
                    ✓ Link baru sudah dikirim ulang ke email Anda.
                </div>
            )}

            <form onSubmit={resend}>
                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={processing}>
                    {processing ? 'Mengirim…' : 'Kirim ulang link verifikasi'}
                </button>
            </form>

            <Link href={route('logout')} method="post" as="button"
                className="btn btn-link" style={{ marginTop: 14, width: '100%', display: 'block', textAlign: 'center' }}>
                Keluar dan kembali ke beranda
            </Link>
        </AuthShell>
    );
}
