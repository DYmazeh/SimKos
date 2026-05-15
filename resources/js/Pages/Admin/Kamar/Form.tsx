import { Head, Link, useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Field } from '@/components/ui';
import type { PageProps } from '@/types/inertia';

type KamarItem = {
    id: number;
    nomor_kamar: string;
    tipe: string;
    harga_bulanan: number;
    status: string;
    deskripsi: string | null;
    fasilitas: string[];
    luas_m2: number | null;
    lantai: number | null;
    foto: Array<{ id: number; url: string }>;
};

type FormProps = PageProps<{
    mode: 'create' | 'edit';
    kamar: KamarItem | null;
}>;

const FASILITAS_OPTIONS = ['WiFi', 'AC', 'KM Dalam', 'Kasur', 'Lemari', 'Meja'];

export default function KamarForm() {
    const { props } = usePage<FormProps>();
    const { mode, kamar } = props;
    const isEdit = mode === 'edit' && kamar !== null;

    const form = useForm({
        nomor_kamar: kamar?.nomor_kamar ?? '',
        tipe: kamar?.tipe ?? 'standar',
        harga_bulanan: kamar?.harga_bulanan ?? 0,
        status: kamar?.status ?? 'tersedia',
        deskripsi: kamar?.deskripsi ?? '',
        fasilitas: kamar?.fasilitas ?? [],
        luas_m2: kamar?.luas_m2 ?? '',
        lantai: kamar?.lantai ?? '',
    });

    const toggleFasilitas = (f: string) => {
        const next = form.data.fasilitas.includes(f)
            ? form.data.fasilitas.filter((x) => x !== f)
            : [...form.data.fasilitas, f];
        form.setData('fasilitas', next);
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (isEdit && kamar) {
            form.put(route('admin.kamar.update', kamar.id));
        } else {
            form.post(route('admin.kamar.store'));
        }
    };

    return (
        <AdminLayout
            title={isEdit ? 'Edit Kamar' : 'Tambah Kamar Baru'}
            breadcrumb={
                <span>
                    <Link href={route('admin.kamar.index')} style={{ color: '#64748B' }}>Kamar</Link>
                    {' / '}
                    <span style={{ color: '#2563EB' }}>{isEdit ? `Edit ${kamar?.nomor_kamar}` : 'Tambah Kamar'}</span>
                </span>
            }
        >
            <Head title={isEdit ? `Edit Kamar ${kamar?.nomor_kamar}` : 'Tambah Kamar'} />

            <form onSubmit={submit}>
                <div style={{ background: 'white', borderRadius: 14, padding: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <h3 style={{ margin: '0 0 24px', fontSize: 17, fontWeight: 700, color: '#0F172A' }}>Detail Kamar</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }} className="kamar-form-grid">
                        {/* LEFT column */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            <Field label="Nomor Kamar" htmlFor="nomor_kamar" error={form.errors.nomor_kamar}>
                                <input id="nomor_kamar" type="text" className="input"
                                    value={form.data.nomor_kamar}
                                    onChange={(e) => form.setData('nomor_kamar', e.target.value)}
                                    placeholder="Contoh: A01" required
                                    style={{ borderRadius: 10 }} />
                            </Field>

                            <Field label="Tipe" htmlFor="tipe" error={form.errors.tipe}>
                                <select id="tipe" className="input"
                                    value={form.data.tipe} onChange={(e) => form.setData('tipe', e.target.value)}
                                    style={{ borderRadius: 10 }}>
                                    <option value="standar">Standar</option>
                                    <option value="deluxe">Deluxe</option>
                                    <option value="vip">VIP</option>
                                </select>
                            </Field>

                            <Field label="Harga Sewa / Bulan" htmlFor="harga" error={form.errors.harga_bulanan}>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: 14, top: 12, fontSize: 14, color: '#94A3B8' }}>Rp</span>
                                    <input id="harga" type="number" className="input"
                                        value={form.data.harga_bulanan || ''}
                                        onChange={(e) => form.setData('harga_bulanan', Number(e.target.value))}
                                        placeholder="0" min="0"
                                        style={{ borderRadius: 10, paddingLeft: 40 }} />
                                </div>
                            </Field>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <Field label="Luas (m²)" htmlFor="luas" error={form.errors.luas_m2}>
                                    <input id="luas" type="number" className="input"
                                        value={form.data.luas_m2 || ''}
                                        onChange={(e) => form.setData('luas_m2', e.target.value ? Number(e.target.value) : '')}
                                        placeholder="0" min="0"
                                        style={{ borderRadius: 10 }} />
                                </Field>
                                <Field label="Lantai" htmlFor="lantai" error={form.errors.lantai}>
                                    <input id="lantai" type="number" className="input"
                                        value={form.data.lantai || ''}
                                        onChange={(e) => form.setData('lantai', e.target.value ? Number(e.target.value) : '')}
                                        placeholder="0" min="0"
                                        style={{ borderRadius: 10 }} />
                                </Field>
                            </div>

                            <Field label="Status" htmlFor="status" error={form.errors.status}>
                                <select id="status" className="input"
                                    value={form.data.status} onChange={(e) => form.setData('status', e.target.value)}
                                    style={{ borderRadius: 10 }}>
                                    <option value="tersedia">Kosong (Tersedia)</option>
                                    <option value="terisi">Terisi</option>
                                    <option value="maintenance">Maintenance</option>
                                </select>
                            </Field>
                        </div>

                        {/* RIGHT column */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            <Field label="Fasilitas" htmlFor="fasilitas">
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 2 }}>
                                    {FASILITAS_OPTIONS.map((f) => {
                                        const checked = form.data.fasilitas.includes(f);
                                        return (
                                            <label key={f} style={{
                                                display: 'flex', alignItems: 'center', gap: 10,
                                                cursor: 'pointer', userSelect: 'none', fontSize: 14, color: '#475569',
                                            }}>
                                                <span style={{
                                                    width: 18, height: 18, borderRadius: 4,
                                                    background: checked ? '#2563EB' : 'transparent',
                                                    border: checked ? 'none' : '1.5px solid #CBD5E1',
                                                    display: 'inline-grid', placeItems: 'center',
                                                    transition: 'all 180ms',
                                                }}>
                                                    {checked && (
                                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M5 12l5 5L20 7" />
                                                        </svg>
                                                    )}
                                                </span>
                                                <input type="checkbox" checked={checked} onChange={() => toggleFasilitas(f)}
                                                    style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }} />
                                                {f}
                                            </label>
                                        );
                                    })}
                                </div>
                            </Field>

                            <Field label="Deskripsi" htmlFor="deskripsi" error={form.errors.deskripsi}>
                                <textarea id="deskripsi"
                                    value={form.data.deskripsi}
                                    onChange={(e) => form.setData('deskripsi', e.target.value)}
                                    placeholder="Tuliskan deskripsi lengkap kamar di sini..."
                                    rows={5} maxLength={1000}
                                    style={{
                                        width: '100%', padding: 14, borderRadius: 10,
                                        border: '1px solid #E5E7EB', fontSize: 14, color: '#0F172A',
                                        fontFamily: 'inherit', resize: 'vertical',
                                    }} />
                            </Field>
                        </div>
                    </div>

                    {/* Foto upload section (visible only in edit mode) */}
                    {isEdit && kamar && (
                        <div style={{ marginTop: 28, paddingTop: 28, borderTop: '1px solid #F1F5F9' }}>
                            <label style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', display: 'block', marginBottom: 10 }}>
                                Foto Kamar ({kamar.foto.length}/5)
                            </label>
                            <div style={{
                                border: '2px dashed #CBD5E1', borderRadius: 12,
                                padding: 24, textAlign: 'center', background: '#F8FAFC',
                            }}>
                                <div style={{
                                    width: 48, height: 48, borderRadius: 12,
                                    background: '#EFF6FF', color: '#2563EB',
                                    display: 'inline-grid', placeItems: 'center', marginBottom: 8,
                                }}>
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                                    </svg>
                                </div>
                                <div style={{ fontSize: 14, fontWeight: 500, color: '#0F172A' }}>Upload Foto (maks. 5)</div>
                                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>JPG, PNG maks 5MB</div>
                                <form action={route('admin.kamar.foto.store', kamar.id)} method="POST" encType="multipart/form-data" style={{ marginTop: 12 }}>
                                    <input type="hidden" name="_token" value={(document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null)?.content ?? ''} />
                                    <input type="file" name="foto" accept="image/jpeg,image/png,image/webp"
                                        onChange={(e) => (e.currentTarget.form as HTMLFormElement).submit()}
                                        style={{ fontSize: 13 }} />
                                </form>
                            </div>

                            {kamar.foto.length > 0 && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10, marginTop: 14 }}>
                                    {kamar.foto.map((f) => (
                                        <div key={f.id} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', aspectRatio: '4/3' }}>
                                            <img src={f.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <Link
                                                href={route('admin.kamar.foto.destroy', { kamar: kamar.id, foto_kamar: f.id })}
                                                method="delete"
                                                as="button"
                                                style={{
                                                    position: 'absolute', top: 6, right: 6,
                                                    width: 22, height: 22, borderRadius: 999,
                                                    background: '#EF4444', color: 'white', border: 0,
                                                    display: 'grid', placeItems: 'center', cursor: 'pointer',
                                                }} aria-label="Hapus foto">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M18 6L6 18M6 6l12 12" />
                                                </svg>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer buttons */}
                <div style={{
                    background: 'white', borderRadius: 14, padding: 20,
                    marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 12,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}>
                    <Link href={route('admin.kamar.index')}
                        style={{
                            padding: '11px 22px', borderRadius: 10,
                            border: '1px solid #E5E7EB', color: '#475569',
                            fontSize: 14, fontWeight: 500,
                        }}>
                        Batal
                    </Link>
                    <button type="submit" disabled={form.processing}
                        style={{
                            padding: '11px 28px', borderRadius: 10,
                            background: '#2563EB', color: 'white',
                            border: 0, cursor: 'pointer',
                            fontSize: 14, fontWeight: 600,
                        }}>
                        {form.processing ? 'Menyimpan…' : isEdit ? 'Simpan Perubahan' : 'Simpan'}
                    </button>
                </div>
            </form>

            <style>{`
                @media (max-width: 720px) {
                    .kamar-form-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
                }
            `}</style>
        </AdminLayout>
    );
}
