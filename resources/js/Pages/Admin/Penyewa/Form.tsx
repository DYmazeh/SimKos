import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Field, formatRp } from '@/components/ui';
import type { PageProps } from '@/types/inertia';

type KamarOption = { id: number; nomor_kamar: string; tipe: string; harga_bulanan: number };

type PenyewaItem = {
    id: number;
    nama_lengkap: string;
    no_ktp: string | null;
    no_hp: string;
    alamat_asal: string | null;
    catatan: string | null;
};

type FormProps = PageProps<{
    mode: 'create' | 'edit';
    penyewa: PenyewaItem | null;
    kamarTersedia: KamarOption[];
}>;

/* Section header dengan blue bar di kiri */
const SectionTitle = ({ title }: { title: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <span style={{ width: 4, height: 18, borderRadius: 2, background: '#2563EB' }} />
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0F172A' }}>{title}</h3>
    </div>
);

const generatePassword = () => {
    const words = ['Tenant', 'Kos', 'Penyewa', 'Welcome'];
    const word = words[Math.floor(Math.random() * words.length)];
    const num = Math.floor(Math.random() * 9000) + 1000;
    return `${word}@${num}`;
};

export default function PenyewaForm() {
    const { props } = usePage<FormProps>();
    const { mode, penyewa, kamarTersedia } = props;
    const isEdit = mode === 'edit' && penyewa !== null;
    const [showPwd, setShowPwd] = useState(false);
    const [overrideHarga, setOverrideHarga] = useState(false);

    const form = useForm({
        nama_lengkap: penyewa?.nama_lengkap ?? '',
        no_ktp: penyewa?.no_ktp ?? '',
        no_hp: penyewa?.no_hp ?? '',
        alamat_asal: penyewa?.alamat_asal ?? '',
        catatan: penyewa?.catatan ?? '',
        // Akun login (hanya di create)
        buat_akun: !isEdit,
        email: '',
        password: !isEdit ? generatePassword() : '',
        // Kontrak (hanya di create — Sewa belum di-handle di store, tapi form siap)
        kamar_id: '',
        harga_disepakati: '',
        tgl_mulai: '',
        tgl_selesai: '',
    });

    const selectedKamar = kamarTersedia.find((k) => String(k.id) === String(form.data.kamar_id));
    const effectiveHarga = overrideHarga ? form.data.harga_disepakati : (selectedKamar?.harga_bulanan ?? '');

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (isEdit && penyewa) {
            form.put(route('admin.penyewa.update', penyewa.id));
        } else {
            form.post(route('admin.penyewa.store'));
        }
    };

    return (
        <AdminLayout
            title={isEdit ? 'Edit Penyewa' : 'Tambah Penyewa Baru'}
            breadcrumb={
                <span>
                    <Link href={route('admin.penyewa.index')} style={{ color: '#64748B' }}>Penyewa</Link>
                    {' / '}
                    <span style={{ color: '#2563EB' }}>{isEdit ? `Edit ${penyewa?.nama_lengkap}` : 'Tambah Penyewa'}</span>
                </span>
            }
        >
            <Head title={isEdit ? `Edit ${penyewa?.nama_lengkap}` : 'Tambah Penyewa'} />

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1000, margin: '0 auto' }}>
                {/* ───── Data Pribadi ───── */}
                <div style={{ background: 'white', borderRadius: 14, padding: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <SectionTitle title="Data Pribadi" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }} className="penyewa-grid">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <Field label="Nama Lengkap" htmlFor="nama" error={form.errors.nama_lengkap}>
                                <input id="nama" type="text" className="input"
                                    value={form.data.nama_lengkap}
                                    onChange={(e) => form.setData('nama_lengkap', e.target.value)}
                                    placeholder="Masukkan nama lengkap" required
                                    style={{ borderRadius: 10 }} />
                            </Field>

                            <Field label="NIK (16 digit)" htmlFor="nik" error={form.errors.no_ktp}>
                                <input id="nik" type="text" className="input" inputMode="numeric" pattern="\d*"
                                    maxLength={16}
                                    value={form.data.no_ktp}
                                    onChange={(e) => form.setData('no_ktp', e.target.value.replace(/\D/g, ''))}
                                    placeholder="Masukkan NIK sesuai KTP"
                                    style={{ borderRadius: 10, fontVariantNumeric: 'tabular-nums' }} />
                            </Field>

                            <Field label="No HP / WhatsApp" htmlFor="hp" error={form.errors.no_hp}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px', height: 44, borderRadius: 10, border: '1px solid #E5E7EB', background: 'white' }}>
                                    <span style={{ fontSize: 14, color: '#94A3B8', borderRight: '1px solid #E5E7EB', paddingRight: 10 }}>+62</span>
                                    <input id="hp" type="tel" inputMode="numeric"
                                        value={form.data.no_hp.replace(/^(\+62|62|0)/, '')}
                                        onChange={(e) => form.setData('no_hp', '0' + e.target.value.replace(/\D/g, ''))}
                                        placeholder="812345678"
                                        style={{ flex: 1, border: 0, outline: 'none', fontSize: 14, background: 'transparent' }} required />
                                </div>
                            </Field>

                            {!isEdit && (
                                <Field label="Email (untuk akun login)" htmlFor="email" error={form.errors.email}>
                                    <input id="email" type="email" className="input"
                                        value={form.data.email}
                                        onChange={(e) => form.setData('email', e.target.value)}
                                        placeholder="example@mail.com"
                                        style={{ borderRadius: 10 }} />
                                </Field>
                            )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <Field label="Foto KTP" htmlFor="foto_ktp">
                                <label htmlFor="foto_ktp_input" style={{
                                    display: 'block', cursor: 'pointer',
                                    border: '2px dashed #CBD5E1', borderRadius: 12,
                                    padding: 32, textAlign: 'center', background: '#F8FAFC',
                                }}>
                                    <div style={{ width: 48, height: 48, borderRadius: 12, background: '#EFF6FF', color: '#2563EB', display: 'inline-grid', placeItems: 'center', marginBottom: 8 }}>
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="8.5" cy="11" r="1.5" /><path d="M21 15l-4.5-4.5L7 21" />
                                        </svg>
                                    </div>
                                    <div style={{ fontSize: 14, color: '#2563EB', fontWeight: 500 }}>Klik untuk upload foto</div>
                                    <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>JPG, PNG maks 5MB</div>
                                </label>
                                <input id="foto_ktp_input" type="file" accept="image/*" style={{ display: 'none' }} />
                                <p style={{ margin: '6px 0 0', fontSize: 11, color: '#94A3B8' }}>(Upload KTP akan diaktifkan saat handler backend tersedia)</p>
                            </Field>

                            <Field label="Catatan (opsional)" htmlFor="catatan">
                                <textarea id="catatan"
                                    value={form.data.catatan}
                                    onChange={(e) => form.setData('catatan', e.target.value)}
                                    placeholder="Keterangan tambahan mengenai penyewa..."
                                    rows={4} maxLength={500}
                                    style={{
                                        width: '100%', padding: 14, borderRadius: 10,
                                        border: '1px solid #E5E7EB', fontSize: 14,
                                        fontFamily: 'inherit', resize: 'vertical',
                                    }} />
                            </Field>
                        </div>
                    </div>
                </div>

                {/* ───── Kontrak Sewa ───── */}
                {!isEdit && (
                    <div style={{ background: 'white', borderRadius: 14, padding: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                        <SectionTitle title="Kontrak Sewa" />
                        <p style={{ margin: '0 0 16px', fontSize: 12, color: '#94A3B8' }}>
                            (Kontrak akan dibuat setelah penyewa disimpan via halaman detail penyewa)
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="penyewa-grid">
                            <Field label="Pilih Kamar" htmlFor="kamar">
                                <select id="kamar" className="input"
                                    value={form.data.kamar_id}
                                    onChange={(e) => { form.setData('kamar_id', e.target.value); setOverrideHarga(false); }}
                                    style={{ borderRadius: 10 }}>
                                    <option value="">Pilih kamar yang tersedia</option>
                                    {kamarTersedia.map((k) => (
                                        <option key={k.id} value={k.id}>
                                            {k.nomor_kamar} · {k.tipe.toUpperCase()} · {formatRp(k.harga_bulanan)}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            <Field label="Harga Disepakati" htmlFor="harga">
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <span style={{ position: 'absolute', left: 14, top: 12, fontSize: 14, color: '#94A3B8' }}>Rp</span>
                                        <input id="harga" type="number"
                                            value={overrideHarga ? form.data.harga_disepakati : effectiveHarga}
                                            onChange={(e) => form.setData('harga_disepakati', e.target.value)}
                                            disabled={!overrideHarga}
                                            placeholder="1.500.000"
                                            className="input"
                                            style={{ borderRadius: 10, paddingLeft: 40, background: overrideHarga ? 'white' : '#F8FAFC' }} />
                                    </div>
                                    <button type="button" onClick={() => setOverrideHarga((o) => !o)}
                                        style={{
                                            padding: '0 16px', borderRadius: 10,
                                            border: '1px solid #2563EB', color: '#2563EB',
                                            background: 'transparent', cursor: 'pointer',
                                            fontSize: 13, fontWeight: 500,
                                        }}>{overrideHarga ? 'Reset' : 'Ubah'}</button>
                                </div>
                            </Field>

                            <Field label="Tanggal Mulai Sewa" htmlFor="tgl_mulai">
                                <input id="tgl_mulai" type="date" className="input"
                                    value={form.data.tgl_mulai}
                                    onChange={(e) => form.setData('tgl_mulai', e.target.value)}
                                    style={{ borderRadius: 10 }} />
                            </Field>

                            <Field label="Tanggal Akhir Sewa" htmlFor="tgl_selesai">
                                <input id="tgl_selesai" type="date" className="input"
                                    value={form.data.tgl_selesai}
                                    onChange={(e) => form.setData('tgl_selesai', e.target.value)}
                                    style={{ borderRadius: 10 }} />
                            </Field>
                        </div>
                    </div>
                )}

                {/* ───── Akun Login ───── */}
                {!isEdit && (
                    <div style={{ background: 'white', borderRadius: 14, padding: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                        <SectionTitle title="Akun Login" />
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, alignItems: 'end' }}>
                            <Field label="Password Awal" htmlFor="pwd" error={form.errors.password}>
                                <div style={{ position: 'relative' }}>
                                    <input id="pwd" type={showPwd ? 'text' : 'password'} className="input"
                                        value={form.data.password}
                                        onChange={(e) => form.setData('password', e.target.value)}
                                        style={{ borderRadius: 10, fontFamily: 'Geist Mono, monospace', paddingRight: 44 }} />
                                    <button type="button" onClick={() => setShowPwd((s) => !s)}
                                        style={{ position: 'absolute', right: 12, top: 11, background: 'transparent', border: 0, color: '#94A3B8', cursor: 'pointer' }}>
                                        {showPwd ? '🙈' : '👁️'}
                                    </button>
                                </div>
                            </Field>
                            <button type="button" onClick={() => form.setData('password', generatePassword())}
                                style={{
                                    height: 44, padding: '0 16px', borderRadius: 10,
                                    border: '1px solid #2563EB', color: '#2563EB',
                                    background: 'transparent', cursor: 'pointer',
                                    fontSize: 13, fontWeight: 500,
                                }}>Auto-Generate</button>
                        </div>
                        <p style={{ margin: '8px 0 0', fontSize: 12, color: '#64748B', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
                            Password dapat diganti penyewa setelah login pertama.
                        </p>
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 16, fontSize: 13, color: '#475569', cursor: 'pointer' }}>
                            <input type="checkbox" checked={form.data.buat_akun}
                                onChange={(e) => form.setData('buat_akun', e.target.checked)} />
                            Buat akun login untuk penyewa ini
                        </label>
                    </div>
                )}

                {/* Footer */}
                <div style={{ background: 'white', borderRadius: 14, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                    <Link href={route('admin.penyewa.index')}
                        style={{
                            padding: '11px 22px', borderRadius: 10,
                            color: '#475569', fontSize: 14, fontWeight: 500,
                        }}>Batal</Link>
                    <button type="submit" disabled={form.processing}
                        style={{
                            padding: '11px 28px', borderRadius: 10,
                            background: '#2563EB', color: 'white',
                            border: 0, cursor: 'pointer',
                            fontSize: 14, fontWeight: 600,
                        }}>
                        {form.processing ? 'Menyimpan…' : (isEdit ? 'Simpan Perubahan' : 'Simpan Penyewa')}
                    </button>
                </div>
            </form>

            <style>{`
                @media (max-width: 768px) {
                    .penyewa-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </AdminLayout>
    );
}
