import { Head, Link, useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { Field, Icon, Input } from '@/components/ui';
import type { PageProps } from '@/types/inertia';

type Kamar = {
    id: number;
    nomor_kamar: string;
    tipe: string;
};

type CreateProps = PageProps<{
    kamar: Kamar;
}>;

const KICKER: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase',
    color: 'var(--blue-600)', margin: 0,
};

export default function KomplenCreate() {
    const { props } = usePage<CreateProps>();
    const { kamar } = props;

    const form = useForm({
        judul: '',
        deskripsi: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post(route('penyewa.komplen.store'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Buat Komplen" />

            {/* Header */}
            <header style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 13, color: 'var(--ink-500)', margin: '0 0 6px' }}>
                    <Link href={route('penyewa.komplen.index')} style={{ color: 'var(--ink-500)' }}>Komplen</Link>
                    <span style={{ color: 'var(--ink-300)', margin: '0 8px' }}>/</span>
                    <span style={{ color: 'var(--blue-600)' }}>Buat baru</span>
                </p>
                <h1 className="h-1" style={{ margin: '0 0 8px' }}>Sampaikan keluhan kamu.</h1>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--ink-500)', margin: 0, maxWidth: '58ch' }}>
                    Jelaskan masalah dengan jelas supaya pengelola bisa menindaklanjuti dengan tepat.
                </p>
            </header>

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 720 }}>
                {/* Kamar info card */}
                <section style={{
                    background: 'var(--blue-50)', borderRadius: 14, padding: 18,
                    border: '1px solid rgba(37,99,235,0.16)',
                    display: 'flex', alignItems: 'center', gap: 14,
                }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: 'white', color: 'var(--blue-700)',
                        display: 'grid', placeItems: 'center', flex: '0 0 auto',
                    }}>
                        <Icon name="bed" size={20} />
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: 'var(--blue-700)' }}>
                            Komplen untuk kamar yang kamu tempati
                        </p>
                        <p style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 600, color: 'var(--ink-900)' }}>
                            Kamar {kamar.nomor_kamar} · {kamar.tipe.toUpperCase()}
                        </p>
                    </div>
                </section>

                {/* Form fields */}
                <section style={{
                    background: 'white', borderRadius: 14, padding: 24,
                    border: '1px solid rgba(11,13,26,0.06)',
                    boxShadow: '0 1px 2px rgba(11,13,26,0.03)',
                    display: 'flex', flexDirection: 'column', gap: 16,
                }}>
                    <div>
                        <p style={KICKER}>Detail</p>
                        <h2 className="h-2" style={{ margin: '4px 0 0' }}>Isi komplen.</h2>
                    </div>

                    <Field label="Judul singkat" htmlFor="judul" error={form.errors.judul}
                        helper="Contoh: AC tidak dingin, Pintu kamar mandi rusak, dll.">
                        <Input id="judul" type="text" required minLength={5} maxLength={200}
                            value={form.data.judul}
                            onChange={(e) => form.setData('judul', e.target.value)}
                            placeholder="Tuliskan ringkas masalahnya" />
                    </Field>

                    <Field label="Deskripsi lengkap" htmlFor="deskripsi" error={form.errors.deskripsi}
                        helper="Jelaskan kapan masalah terjadi, dampak ke kamu, dan apa yang sudah kamu coba.">
                        <textarea id="deskripsi" className="input" required minLength={10} maxLength={2000}
                            value={form.data.deskripsi}
                            onChange={(e) => form.setData('deskripsi', e.target.value)}
                            placeholder="Tuliskan detail komplen di sini…"
                            rows={6}
                            style={{ fontFamily: 'inherit', resize: 'vertical', height: 'auto', padding: 12 }} />
                    </Field>
                </section>

                {/* Action footer */}
                <div style={{
                    background: 'white', borderRadius: 14, padding: 16,
                    border: '1px solid rgba(11,13,26,0.06)',
                    boxShadow: '0 1px 2px rgba(11,13,26,0.03)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
                }}>
                    <Link href={route('penyewa.komplen.index')} className="btn btn-ghost btn-sm">
                        <Icon name="arrow-left" size={14} /> Kembali
                    </Link>
                    <button type="submit" disabled={form.processing} className="btn btn-primary">
                        {form.processing ? 'Mengirim…' : 'Kirim komplen'}
                        {!form.processing && <Icon name="arrow-right" size={15} />}
                    </button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
