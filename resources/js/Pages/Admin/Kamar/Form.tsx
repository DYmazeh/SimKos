import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { CurrencyInput, Field, Icon } from '@/components/ui';
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

    const form = useForm<{
        nomor_kamar: string; tipe: string; harga_bulanan: number;
        status: string; deskripsi: string; fasilitas: string[];
        luas_m2: number | string; lantai: number | string;
        foto: File[];
        foto_to_delete: number[];
    }>({
        nomor_kamar: kamar?.nomor_kamar ?? '',
        tipe: kamar?.tipe ?? 'standar',
        harga_bulanan: kamar?.harga_bulanan ?? 0,
        status: kamar?.status ?? 'tersedia',
        deskripsi: kamar?.deskripsi ?? '',
        fasilitas: kamar?.fasilitas ?? [],
        luas_m2: kamar?.luas_m2 ?? '',
        lantai: kamar?.lantai ?? '',
        foto: [],
        foto_to_delete: [],
    });

    const [fotoPreviews, setFotoPreviews] = useState<Array<{ url: string; name: string }>>([]);

    const toggleFasilitas = (f: string) => {
        const next = form.data.fasilitas.includes(f)
            ? form.data.fasilitas.filter((x) => x !== f)
            : [...form.data.fasilitas, f];
        form.setData('fasilitas', next);
    };

    const onFotoInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        const merged = [...form.data.foto, ...files].slice(0, 5);
        form.setData('foto', merged);
        setFotoPreviews(merged.map((f) => ({ url: URL.createObjectURL(f), name: f.name })));
        // Reset input value supaya pilih file yang sama 2× tetap trigger onChange.
        e.target.value = '';
    };

    const removeFotoCreate = (idx: number) => {
        const next = form.data.foto.filter((_, i) => i !== idx);
        form.setData('foto', next);
        setFotoPreviews(next.map((f) => ({ url: URL.createObjectURL(f), name: f.name })));
    };

    // Toggle staging delete untuk foto existing — baru di-commit saat user pencet
    // "Simpan Perubahan". Klik "Batal" (= navigate away) → revert otomatis karena
    // state hilang.
    const toggleDeleteExisting = (id: number) => {
        const list = form.data.foto_to_delete;
        const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
        form.setData('foto_to_delete', next);
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (isEdit && kamar) {
            // forceFormData=true bikin Inertia otomatis convert ke POST + _method=PUT
            // (PHP tidak parse multipart body untuk PUT/PATCH).
            form.put(route('admin.kamar.update', kamar.id), { forceFormData: true });
        } else {
            form.post(route('admin.kamar.store'), { forceFormData: true });
        }
    };

    return (
        <AdminLayout title={isEdit ? 'Edit Kamar' : 'Tambah Kamar Baru'}>
            <Head title={isEdit ? `Edit Kamar ${kamar?.nomor_kamar}` : 'Tambah Kamar'} />

            {/* Header: breadcrumb + back button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
                <nav aria-label="Breadcrumb" style={{ fontSize: 13, color: 'var(--ink-500)' }}>
                    <Link href={route('admin.kamar.index')} style={{ color: 'var(--ink-500)' }}>Manajemen Kamar</Link>
                    <span style={{ color: 'var(--ink-300)', margin: '0 8px' }}>/</span>
                    <span style={{ color: 'var(--blue-600)', fontWeight: 500 }}>{isEdit ? `Edit ${kamar?.nomor_kamar}` : 'Tambah Kamar'}</span>
                </nav>
                <Link href={route('admin.kamar.index')} className="btn btn-ghost btn-sm">
                    <Icon name="arrow-left" size={14} /> Kembali
                </Link>
            </div>

            <form onSubmit={submit}>
                <section style={{
                    background: 'white', borderRadius: 14, padding: 28,
                    border: '1px solid rgba(11,13,26,0.06)',
                    boxShadow: '0 1px 2px rgba(11,13,26,0.03)',
                }}>
                    <h3 style={{ margin: '0 0 22px', fontSize: 17, fontWeight: 700, color: 'var(--ink-900)' }}>Detail Kamar</h3>

                    <div className="kamar-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                        {/* LEFT column */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            <Field label="Nomor Kamar" htmlFor="nomor_kamar" error={form.errors.nomor_kamar}>
                                <input id="nomor_kamar" type="text" className="input"
                                    value={form.data.nomor_kamar}
                                    onChange={(e) => form.setData('nomor_kamar', e.target.value)}
                                    placeholder="Contoh: A01" required />
                            </Field>

                            <Field label="Tipe" htmlFor="tipe" error={form.errors.tipe}>
                                <select id="tipe" className="input"
                                    value={form.data.tipe} onChange={(e) => form.setData('tipe', e.target.value)}>
                                    <option value="standar">Standar</option>
                                    <option value="deluxe">Deluxe</option>
                                    <option value="vip">VIP</option>
                                </select>
                            </Field>

                            <Field label="Harga Sewa / Bulan" htmlFor="harga" error={form.errors.harga_bulanan}>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: 14, top: 12, fontSize: 14, color: 'var(--ink-400)' }}>Rp</span>
                                    <CurrencyInput id="harga" className="input"
                                        value={form.data.harga_bulanan}
                                        onValueChange={(n) => form.setData('harga_bulanan', n)}
                                        placeholder="0"
                                        style={{ paddingLeft: 40, fontVariantNumeric: 'tabular-nums' }} />
                                </div>
                            </Field>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <Field label="Luas (m²)" htmlFor="luas" error={form.errors.luas_m2}>
                                    <input id="luas" type="number" className="input"
                                        value={form.data.luas_m2 || ''}
                                        onChange={(e) => form.setData('luas_m2', e.target.value ? Number(e.target.value) : '')}
                                        placeholder="0" min="0" />
                                </Field>
                                <Field label="Lantai" htmlFor="lantai" error={form.errors.lantai}>
                                    <input id="lantai" type="number" className="input"
                                        value={form.data.lantai || ''}
                                        onChange={(e) => form.setData('lantai', e.target.value ? Number(e.target.value) : '')}
                                        placeholder="0" min="0" />
                                </Field>
                            </div>
                        </div>

                        {/* RIGHT column */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            <Field label="Fasilitas" htmlFor="fasilitas">
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 2 }}>
                                    {FASILITAS_OPTIONS.map((f) => {
                                        const checked = form.data.fasilitas.includes(f);
                                        return (
                                            <label key={f} style={{
                                                display: 'flex', alignItems: 'center', gap: 10,
                                                cursor: 'pointer', userSelect: 'none', fontSize: 14, color: 'var(--ink-700)',
                                                position: 'relative',
                                            }}>
                                                <span style={{
                                                    width: 18, height: 18, borderRadius: 4,
                                                    background: checked ? 'var(--blue-600)' : 'transparent',
                                                    border: checked ? 'none' : '1.5px solid rgba(11,13,26,0.18)',
                                                    display: 'inline-grid', placeItems: 'center', flex: '0 0 auto',
                                                    transition: 'all 180ms var(--ease)',
                                                }}>
                                                    {checked && <Icon name="check" size={11} stroke={3} style={{ color: 'white' }} />}
                                                </span>
                                                <input type="checkbox" checked={checked} onChange={() => toggleFasilitas(f)}
                                                    style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }} />
                                                {f}
                                            </label>
                                        );
                                    })}
                                </div>
                            </Field>

                            <Field label="Deskripsi" htmlFor="deskripsi" error={form.errors.deskripsi}>
                                <textarea id="deskripsi" className="input"
                                    value={form.data.deskripsi}
                                    onChange={(e) => form.setData('deskripsi', e.target.value)}
                                    placeholder="Tuliskan deskripsi lengkap kamar di sini…"
                                    rows={5} maxLength={1000}
                                    style={{
                                        fontFamily: 'inherit', resize: 'vertical', height: 'auto', padding: 12,
                                    }} />
                            </Field>
                        </div>
                    </div>

                    {/* ───── Foto Kamar section (FULL WIDTH, untuk create + edit) ───── */}
                    <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid rgba(11,13,26,0.06)' }}>
                        <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-900)', display: 'block', marginBottom: 12 }}>
                            Foto Kamar
                        </label>

                        {/* Upload area */}
                        <label htmlFor="foto_input" style={{
                            display: 'block', cursor: 'pointer', textAlign: 'center',
                            border: '2px dashed rgba(11,13,26,0.15)', borderRadius: 12,
                            padding: 36, background: 'var(--ink-50)',
                            transition: 'all 180ms var(--ease)',
                        }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--blue-400)'; e.currentTarget.style.background = 'rgba(96,165,250,0.05)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(11,13,26,0.15)'; e.currentTarget.style.background = 'var(--ink-50)'; }}>
                            <div style={{
                                width: 56, height: 56, borderRadius: 14,
                                background: 'white', color: 'var(--blue-600)',
                                display: 'inline-grid', placeItems: 'center', marginBottom: 12,
                                border: '1px solid rgba(11,13,26,0.06)',
                            }}>
                                <Icon name="upload" size={26} />
                            </div>
                            <div style={{ fontSize: 14.5, color: 'var(--ink-900)', fontWeight: 500 }}>Upload Foto (maks. 5)</div>
                            <div style={{ fontSize: 12.5, color: 'var(--ink-400)', marginTop: 4 }}>JPG, PNG maks 5MB</div>
                        </label>
                        <input id="foto_input" type="file" multiple
                            accept="image/jpeg,image/png,image/webp"
                            style={{ display: 'none' }}
                            onChange={onFotoInput} />

                        {/* Existing thumbnails (edit mode) + preview thumbnails (yang baru di-upload).
                            Edit: klik X = stage delete (commit saat Simpan), klik lagi = undo.
                            Create / preview baru: klik X = hapus dari queue upload. */}
                        {((isEdit && kamar && kamar.foto.length > 0) || fotoPreviews.length > 0) && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginTop: 16 }}>
                                {/* Foto existing — staging delete pattern */}
                                {isEdit && kamar?.foto.map((f) => {
                                    const staged = form.data.foto_to_delete.includes(f.id);
                                    return (
                                        <div key={`existing-${f.id}`} style={{
                                            position: 'relative', borderRadius: 10, overflow: 'hidden',
                                            aspectRatio: '4/3',
                                            outline: staged ? '2px solid var(--danger)' : 'none',
                                            outlineOffset: -2,
                                        }}>
                                            <img src={f.url} alt="" style={{
                                                width: '100%', height: '100%', objectFit: 'cover',
                                                opacity: staged ? 0.35 : 1,
                                                filter: staged ? 'grayscale(0.6)' : 'none',
                                                transition: 'opacity 160ms var(--ease), filter 160ms var(--ease)',
                                            }} />
                                            {staged && (
                                                <span style={{
                                                    position: 'absolute', left: 6, bottom: 6,
                                                    padding: '3px 8px', borderRadius: 999,
                                                    background: 'rgba(210,68,50,0.95)', color: 'white',
                                                    fontSize: 10.5, fontWeight: 600, letterSpacing: '0.04em',
                                                    textTransform: 'uppercase',
                                                }}>Akan dihapus</span>
                                            )}
                                            <button type="button" onClick={() => toggleDeleteExisting(f.id)}
                                                aria-label={staged ? 'Batal hapus foto' : 'Tandai foto untuk dihapus'}
                                                title={staged ? 'Klik untuk batal menghapus' : 'Tandai untuk dihapus saat Simpan'}
                                                style={{
                                                    position: 'absolute', top: 6, right: 6,
                                                    width: 24, height: 24, borderRadius: 999,
                                                    background: staged ? 'rgba(31,143,91,0.95)' : 'rgba(210,68,50,0.95)',
                                                    color: 'white', border: 0,
                                                    display: 'grid', placeItems: 'center', cursor: 'pointer',
                                                }}>
                                                <Icon name={staged ? 'refresh' : 'x'} size={13} stroke={2.5} />
                                            </button>
                                        </div>
                                    );
                                })}

                                {/* Foto baru (preview dari upload) — sama UX untuk create & edit */}
                                {fotoPreviews.map((preview, idx) => (
                                    <div key={`new-${idx}`} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', aspectRatio: '4/3' }}>
                                        <img src={preview.url} alt={`Foto baru ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <span style={{
                                            position: 'absolute', left: 6, bottom: 6,
                                            padding: '3px 8px', borderRadius: 999,
                                            background: 'rgba(37,99,235,0.95)', color: 'white',
                                            fontSize: 10.5, fontWeight: 600, letterSpacing: '0.04em',
                                            textTransform: 'uppercase',
                                        }}>Baru</span>
                                        <button type="button" onClick={() => removeFotoCreate(idx)}
                                            aria-label="Hapus foto dari upload queue"
                                            style={{
                                                position: 'absolute', top: 6, right: 6,
                                                width: 24, height: 24, borderRadius: 999,
                                                background: 'rgba(210,68,50,0.95)', color: 'white', border: 0,
                                                display: 'grid', placeItems: 'center', cursor: 'pointer',
                                            }}>
                                            <Icon name="x" size={13} stroke={2.5} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Status field at bottom (per Figma).
                        Catatan: opsi 'Terisi' sengaja tidak ada — status itu dikelola
                        otomatis oleh sistem saat admin daftarkan penyewa baru + kontrak.
                        Kalau kamar saat ini 'terisi', dropdown disabled & nampilkan readonly. */}
                    <div style={{ marginTop: 20, maxWidth: 320 }}>
                        <Field label="Status" htmlFor="status" error={form.errors.status}>
                            {form.data.status === 'terisi' ? (
                                <div className="input" style={{
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    background: 'var(--ink-50)', color: 'var(--ink-500)',
                                    cursor: 'not-allowed',
                                }} title="Status 'Terisi' dikelola otomatis oleh sistem">
                                    <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--success)' }} />
                                    Terisi (dikelola otomatis)
                                </div>
                            ) : (
                                <select id="status" className="input"
                                    value={form.data.status} onChange={(e) => form.setData('status', e.target.value)}>
                                    <option value="tersedia">Kosong (Tersedia)</option>
                                    <option value="maintenance">Maintenance</option>
                                </select>
                            )}
                        </Field>
                    </div>
                </section>

                {/* Footer buttons */}
                <div style={{
                    background: 'white', borderRadius: 14, padding: 18,
                    marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 12, alignItems: 'center',
                    border: '1px solid rgba(11,13,26,0.06)',
                    boxShadow: '0 1px 2px rgba(11,13,26,0.03)',
                }}>
                    <Link href={route('admin.kamar.index')} className="btn btn-ghost btn-sm">Batal</Link>
                    <button type="submit" disabled={form.processing} className="btn btn-primary">
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
