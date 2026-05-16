import { Head, useForm, usePage } from '@inertiajs/react';
import { useMemo, useState, type FormEvent } from 'react';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { Icon, Field, PasswordInput } from '@/components/ui';
import type { PageProps } from '@/types/inertia';

type EditProps = PageProps<{
    user: { name: string; email: string; phone: string | null; avatar_url: string | null };
    status?: string;
}>;

export default function ProfileEdit() {
    const { props } = usePage<EditProps>();
    const { user, auth } = props;

    /* ---- Profil form (multipart untuk avatar) ---- */
    const profil = useForm<{
        name: string; email: string; phone: string;
        avatar: File | null; _method: string;
    }>({
        name: user.name,
        email: user.email,
        phone: user.phone ?? '',
        avatar: null,
        _method: 'patch',
    });

    const submitProfil = (e: FormEvent) => {
        e.preventDefault();
        profil.post(route('profile.update'), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => profil.setData('avatar', null),
        });
    };

    /* ---- Password form ---- */
    const pwd = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submitPwd = (e: FormEvent) => {
        e.preventDefault();
        pwd.put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => pwd.reset(),
        });
    };

    const strength = useMemo(() => {
        const p = pwd.data.password;
        let s = 0;
        if (p.length >= 8) s++;
        if (/[A-Z]/.test(p)) s++;
        if (/[0-9]/.test(p)) s++;
        if (/[^A-Za-z0-9]/.test(p)) s++;
        return s;
    }, [pwd.data.password]);

    const strengthMeta = [
        { label: 'Lemah', color: '#EF4444' },
        { label: 'Cukup', color: '#F59E0B' },
        { label: 'Baik', color: '#10B981' },
        { label: 'Kuat', color: '#10B981' },
    ][Math.max(0, strength - 1)] ?? { label: '—', color: '#CBD5E1' };

    const [photoPreview, setPhotoPreview] = useState<string | null>(user.avatar_url);
    const initial = user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

    return (
        <AuthenticatedLayout header={<h2 className="h-2" style={{ margin: 0 }}>Profil Saya</h2>}>
            <Head title="Profil Saya" />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 920, margin: '0 auto' }}>
                {/* ───── Card: Informasi Pribadi ───── */}
                <section style={{ background: 'white', borderRadius: 14, padding: 32, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#0F172A' }}>Informasi Pribadi</h2>
                    <p style={{ margin: '4px 0 24px', fontSize: 13, color: '#64748B' }}>
                        Perbarui foto profil dan detail akun Anda di sini.
                    </p>

                    <form onSubmit={submitProfil}>
                        {/* Foto profil */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
                            <div style={{ position: 'relative' }}>
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Foto profil" style={{ width: 96, height: 96, borderRadius: 999, objectFit: 'cover' }} />
                                ) : (
                                    <div style={{
                                        width: 96, height: 96, borderRadius: 999,
                                        background: 'linear-gradient(135deg, #93C5FD, #2563EB)',
                                        color: 'white', display: 'grid', placeItems: 'center',
                                        fontSize: 32, fontWeight: 600,
                                    }}>{initial}</div>
                                )}
                                <label htmlFor="avatar-upload" style={{
                                    position: 'absolute', bottom: 0, right: 0,
                                    width: 32, height: 32, borderRadius: 999,
                                    background: '#2563EB', color: 'white',
                                    display: 'grid', placeItems: 'center',
                                    cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                                    border: '3px solid white',
                                }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" />
                                    </svg>
                                </label>
                                <input id="avatar-upload" type="file" accept="image/jpeg,image/png,image/webp,image/gif" style={{ display: 'none' }}
                                    onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) {
                                            setPhotoPreview(URL.createObjectURL(f));
                                            profil.setData('avatar', f);
                                        }
                                    }} />
                            </div>
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>Foto Profil</div>
                                <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                                    Format JPG, GIF, WebP atau PNG. Ukuran maksimal 2MB.
                                </div>
                                {profil.errors.avatar && (
                                    <div style={{ fontSize: 12, color: '#EF4444', marginTop: 6 }}>{profil.errors.avatar}</div>
                                )}
                                {profil.data.avatar && (
                                    <div style={{ fontSize: 12, color: 'var(--success)', marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                        <Icon name="check" size={14} stroke={2.4} />
                                        Foto siap diunggah saat Simpan Perubahan diklik
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gap: 16 }}>
                            <Field label="Nama Lengkap" htmlFor="name" error={profil.errors.name}>
                                <input id="name" type="text" className="input"
                                    value={profil.data.name}
                                    onChange={(e) => profil.setData('name', e.target.value)}
                                    style={{ borderRadius: 10 }}
                                    required />
                            </Field>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="profil-row">
                                <Field label="Email" htmlFor="email" error={profil.errors.email}>
                                    <input id="email" type="email" className="input"
                                        value={profil.data.email}
                                        onChange={(e) => profil.setData('email', e.target.value)}
                                        style={{ borderRadius: 10 }}
                                        required />
                                </Field>
                                <Field label="No HP" htmlFor="phone" error={profil.errors.phone}>
                                    <input id="phone" type="tel" className="input"
                                        value={profil.data.phone}
                                        onChange={(e) => profil.setData('phone', e.target.value)}
                                        placeholder="0812-3456-7890"
                                        style={{ borderRadius: 10 }} />
                                </Field>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, paddingTop: 20, borderTop: '1px solid #F1F5F9' }}>
                            <button type="submit" disabled={profil.processing}
                                style={{
                                    background: '#2563EB', color: 'white',
                                    padding: '11px 24px', borderRadius: 10,
                                    fontSize: 14, fontWeight: 600, border: 0, cursor: 'pointer',
                                }}>
                                {profil.processing ? 'Menyimpan…' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </form>
                </section>

                {/* ───── Card: Ganti Password ───── */}
                <section style={{ background: 'white', borderRadius: 14, padding: 32, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#0F172A' }}>Ganti Password</h2>
                    <p style={{ margin: '4px 0 24px', fontSize: 13, color: '#64748B' }}>
                        Amankan akun Anda dengan menggunakan password yang kuat.
                    </p>

                    <form onSubmit={submitPwd} style={{ display: 'grid', gap: 16 }}>
                        <Field label="Password Lama" htmlFor="current_password" error={pwd.errors.current_password}>
                            <PasswordInput
                                id="current_password"
                                value={pwd.data.current_password}
                                onChange={(e) => pwd.setData('current_password', e.target.value)}
                                placeholder="••••••••"
                                autoComplete="current-password"
                            />
                        </Field>

                        <Field label="Password Baru" htmlFor="password" error={pwd.errors.password}>
                            <PasswordInput
                                id="password"
                                value={pwd.data.password}
                                onChange={(e) => pwd.setData('password', e.target.value)}
                                placeholder="Buat password baru"
                                autoComplete="new-password"
                            />
                        </Field>

                        {pwd.data.password && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: -8 }}>
                                <div style={{ flex: 1, display: 'flex', gap: 4 }}>
                                    {[0, 1, 2, 3].map((i) => (
                                        <div key={i} style={{
                                            flex: 1, height: 4, borderRadius: 999,
                                            background: i < strength ? strengthMeta.color : '#E5E7EB',
                                            transition: 'background 200ms',
                                        }} />
                                    ))}
                                </div>
                                <span style={{ fontSize: 11, fontWeight: 600, color: strengthMeta.color, textTransform: 'uppercase', minWidth: 50, textAlign: 'right' }}>
                                    {strengthMeta.label}
                                </span>
                            </div>
                        )}

                        <Field label="Konfirmasi Password Baru" htmlFor="password_confirmation"
                            error={pwd.data.password_confirmation && pwd.data.password_confirmation !== pwd.data.password ? 'Password tidak sama.' : pwd.errors.password_confirmation}>
                            <PasswordInput
                                id="password_confirmation"
                                value={pwd.data.password_confirmation}
                                onChange={(e) => pwd.setData('password_confirmation', e.target.value)}
                                placeholder="Ketik ulang password baru"
                                autoComplete="new-password"
                            />
                        </Field>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8, paddingTop: 20, borderTop: '1px solid #F1F5F9' }}>
                            <button type="submit"
                                disabled={pwd.processing || !pwd.data.current_password || !pwd.data.password || pwd.data.password !== pwd.data.password_confirmation}
                                style={{
                                    background: 'transparent', color: '#2563EB',
                                    border: '1px solid #2563EB',
                                    padding: '11px 24px', borderRadius: 10,
                                    fontSize: 14, fontWeight: 600, cursor: 'pointer',
                                }}>
                                {pwd.processing ? 'Memperbarui…' : 'Ubah Password'}
                            </button>
                        </div>
                    </form>
                </section>
            </div>

            <style>{`
                @media (max-width: 640px) {
                    .profil-row { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
