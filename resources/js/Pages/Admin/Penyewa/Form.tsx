import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState, type FormEvent, type ReactNode } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Field, Icon, Input, Checkbox, PasswordInput, formatRp } from '@/components/ui';
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

const KICKER: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase',
    color: 'var(--blue-600)', margin: 0,
};

/* ───── Card section dengan kicker + judul ───── */
const Card = ({ kicker, title, desc, children }: { kicker: string; title: string; desc?: string; children: ReactNode }) => (
    <section style={{
        background: 'white', borderRadius: 16, padding: 28,
        border: '1px solid rgba(11,13,26,0.06)',
        boxShadow: '0 1px 2px rgba(11,13,26,0.03)',
    }}>
        <header style={{ marginBottom: 22 }}>
            <p style={KICKER}>{kicker}</p>
            <h2 className="h-2" style={{ margin: '4px 0 0', color: 'var(--ink-900)' }}>{title}</h2>
            {desc && <p style={{ margin: '6px 0 0', fontSize: 13.5, color: 'var(--ink-500)', lineHeight: 1.6 }}>{desc}</p>}
        </header>
        {children}
    </section>
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
    const [overrideHarga, setOverrideHarga] = useState(false);

    const form = useForm<{
        nama_lengkap: string; no_ktp: string; no_hp: string;
        alamat_asal: string; catatan: string;
        foto_ktp: File | null;
        buat_akun: boolean; email: string; password: string;
        kamar_id: string; harga_disepakati: string;
        tgl_mulai: string; tgl_selesai: string;
    }>({
        nama_lengkap: penyewa?.nama_lengkap ?? '',
        no_ktp: penyewa?.no_ktp ?? '',
        no_hp: penyewa?.no_hp ?? '',
        alamat_asal: penyewa?.alamat_asal ?? '',
        catatan: penyewa?.catatan ?? '',
        foto_ktp: null,
        buat_akun: !isEdit,
        email: '',
        password: !isEdit ? generatePassword() : '',
        kamar_id: '',
        harga_disepakati: '',
        tgl_mulai: '',
        tgl_selesai: '',
    });

    const [ktpPreview, setKtpPreview] = useState<string | null>(null);

    const selectedKamar = kamarTersedia.find((k) => String(k.id) === String(form.data.kamar_id));
    const effectiveHarga = overrideHarga ? form.data.harga_disepakati : (selectedKamar?.harga_bulanan ?? '');

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (isEdit && penyewa) {
            form.put(route('admin.penyewa.update', penyewa.id));
        } else {
            form.post(route('admin.penyewa.store'), { forceFormData: true });
        }
    };

    return (
        <AdminLayout
            title={isEdit ? `Edit ${penyewa?.nama_lengkap}` : 'Tambah Penyewa Baru'}
            breadcrumb={
                <span>
                    <Link href={route('admin.penyewa.index')} style={{ color: 'var(--ink-500)' }}>Penyewa</Link>
                    <span style={{ color: 'var(--ink-300)', margin: '0 8px' }}>/</span>
                    <span style={{ color: 'var(--blue-600)' }}>{isEdit ? `Edit ${penyewa?.nama_lengkap}` : 'Tambah Penyewa'}</span>
                </span>
            }
        >
            <Head title={isEdit ? `Edit ${penyewa?.nama_lengkap}` : 'Tambah Penyewa'} />

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1000, margin: '0 auto' }}>
                {/* ───── Data Pribadi ───── */}
                <Card kicker="Profil" title="Data pribadi penyewa." desc="Informasi identitas dasar yang tersimpan dalam catatan kos.">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }} className="penyewa-grid">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <Field label="Nama lengkap" htmlFor="nama" error={form.errors.nama_lengkap}>
                                <Input id="nama" type="text"
                                    value={form.data.nama_lengkap}
                                    onChange={(e) => form.setData('nama_lengkap', e.target.value)}
                                    placeholder="Sesuai KTP" required />
                            </Field>

                            <Field label="NIK (16 digit)" htmlFor="nik" error={form.errors.no_ktp}>
                                <Input id="nik" type="text" inputMode="numeric" pattern="\d*" maxLength={16}
                                    value={form.data.no_ktp}
                                    onChange={(e) => form.setData('no_ktp', e.target.value.replace(/\D/g, ''))}
                                    placeholder="16 digit pada KTP"
                                    style={{ fontVariantNumeric: 'tabular-nums' }} />
                            </Field>

                            <Field label="No HP / WhatsApp" htmlFor="hp" error={form.errors.no_hp}>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px', height: 44,
                                    borderRadius: 10, border: '1px solid rgba(11,13,26,0.12)', background: 'white',
                                }}>
                                    <span style={{
                                        fontSize: 14, color: 'var(--ink-400)',
                                        borderRight: '1px solid rgba(11,13,26,0.08)', paddingRight: 10,
                                    }}>+62</span>
                                    <input id="hp" type="tel" inputMode="numeric" required
                                        value={form.data.no_hp.replace(/^(\+62|62|0)/, '')}
                                        onChange={(e) => form.setData('no_hp', '0' + e.target.value.replace(/\D/g, ''))}
                                        placeholder="812345678"
                                        style={{ flex: 1, border: 0, outline: 'none', fontSize: 14, background: 'transparent' }} />
                                </div>
                            </Field>

                            <Field label="Alamat asal (opsional)" htmlFor="alamat_asal">
                                <Input id="alamat_asal" type="text"
                                    value={form.data.alamat_asal}
                                    onChange={(e) => form.setData('alamat_asal', e.target.value)}
                                    placeholder="Kota / kabupaten asal" />
                            </Field>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <Field label="Foto KTP (opsional)" htmlFor="foto_ktp" error={form.errors.foto_ktp as unknown as string}>
                                {ktpPreview ? (
                                    <div style={{ position: 'relative' }}>
                                        <img src={ktpPreview} alt="Preview KTP"
                                            style={{
                                                width: '100%', maxHeight: 200, objectFit: 'cover',
                                                borderRadius: 12, border: '1px solid rgba(11,13,26,0.08)',
                                            }} />
                                        <button type="button"
                                            onClick={() => { setKtpPreview(null); form.setData('foto_ktp', null); }}
                                            aria-label="Hapus foto"
                                            style={{
                                                position: 'absolute', top: 8, right: 8,
                                                width: 28, height: 28, borderRadius: 999,
                                                background: 'rgba(11,13,26,0.7)', color: 'white',
                                                border: 0, cursor: 'pointer', backdropFilter: 'blur(4px)',
                                                display: 'grid', placeItems: 'center',
                                            }}>
                                            <Icon name="x" size={14} stroke={2.5} />
                                        </button>
                                    </div>
                                ) : (
                                    <label htmlFor="foto_ktp_input" style={{
                                        display: 'block', cursor: 'pointer', textAlign: 'center',
                                        border: '2px dashed rgba(11,13,26,0.15)', borderRadius: 12,
                                        padding: 32, background: 'var(--ink-50)',
                                        transition: 'all 180ms var(--ease)',
                                    }}
                                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--blue-400)'; e.currentTarget.style.background = 'rgba(96,165,250,0.05)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(11,13,26,0.15)'; e.currentTarget.style.background = 'var(--ink-50)'; }}>
                                        <div style={{
                                            width: 48, height: 48, borderRadius: 12,
                                            background: 'white', color: 'var(--blue-600)',
                                            display: 'inline-grid', placeItems: 'center', marginBottom: 10,
                                            border: '1px solid rgba(11,13,26,0.06)',
                                        }}>
                                            <Icon name="image" size={22} />
                                        </div>
                                        <div style={{ fontSize: 14, color: 'var(--ink-900)', fontWeight: 500 }}>Klik untuk upload foto</div>
                                        <div style={{ fontSize: 12, color: 'var(--ink-400)', marginTop: 4 }}>JPG, PNG, WebP — maks 5MB</div>
                                    </label>
                                )}
                                <input id="foto_ktp_input" type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    style={{ display: 'none' }}
                                    onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) {
                                            setKtpPreview(URL.createObjectURL(f));
                                            form.setData('foto_ktp', f);
                                        }
                                    }} />
                            </Field>

                            <Field label="Catatan (opsional)" htmlFor="catatan">
                                <textarea id="catatan" className="input"
                                    value={form.data.catatan}
                                    onChange={(e) => form.setData('catatan', e.target.value)}
                                    placeholder="Keterangan tambahan…"
                                    rows={4} maxLength={500}
                                    style={{ fontFamily: 'inherit', resize: 'vertical', height: 'auto', padding: 12 }} />
                            </Field>
                        </div>
                    </div>
                </Card>

                {/* ───── Kontrak Sewa ───── */}
                {!isEdit && (
                    <Card kicker="Kontrak" title="Sewa kamar (opsional)." desc="Bisa diisi sekarang atau di-skip — kontrak juga bisa dibuat dari halaman detail penyewa.">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="penyewa-grid">
                            <Field label="Pilih kamar" htmlFor="kamar">
                                <select id="kamar" className="input"
                                    value={form.data.kamar_id}
                                    onChange={(e) => { form.setData('kamar_id', e.target.value); setOverrideHarga(false); }}>
                                    <option value="">— Belum tugaskan kamar —</option>
                                    {kamarTersedia.map((k) => (
                                        <option key={k.id} value={k.id}>
                                            {k.nomor_kamar} · {k.tipe.toUpperCase()} · {formatRp(k.harga_bulanan)}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            <Field label="Harga disepakati / bulan" htmlFor="harga">
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <span style={{
                                            position: 'absolute', left: 14, top: 12,
                                            fontSize: 14, color: 'var(--ink-400)',
                                        }}>Rp</span>
                                        <input id="harga" type="number" className="input"
                                            value={overrideHarga ? form.data.harga_disepakati : effectiveHarga}
                                            onChange={(e) => form.setData('harga_disepakati', e.target.value)}
                                            disabled={!overrideHarga}
                                            placeholder="1500000"
                                            style={{ paddingLeft: 36, fontVariantNumeric: 'tabular-nums', background: overrideHarga ? 'white' : 'var(--ink-50)' }} />
                                    </div>
                                    <button type="button" onClick={() => setOverrideHarga((o) => !o)}
                                        className="btn btn-ghost btn-sm" style={{ whiteSpace: 'nowrap' }}>
                                        {overrideHarga ? 'Reset' : 'Ubah harga'}
                                    </button>
                                </div>
                            </Field>

                            <Field label="Tanggal mulai sewa" htmlFor="tgl_mulai">
                                <Input id="tgl_mulai" type="date"
                                    value={form.data.tgl_mulai}
                                    onChange={(e) => form.setData('tgl_mulai', e.target.value)} />
                            </Field>

                            <Field label="Tanggal akhir sewa (opsional)" htmlFor="tgl_selesai">
                                <Input id="tgl_selesai" type="date"
                                    value={form.data.tgl_selesai}
                                    onChange={(e) => form.setData('tgl_selesai', e.target.value)} />
                            </Field>
                        </div>
                    </Card>
                )}

                {/* ───── Akun Login ───── */}
                {!isEdit && (
                    <Card kicker="Akun" title="Akses login penyewa." desc="Penyewa dapat login dengan akun ini untuk melihat tagihan dan riwayat sewa.">
                        <Checkbox id="buat_akun"
                            checked={form.data.buat_akun}
                            onChange={(e) => form.setData('buat_akun', e.target.checked)}>
                            Buat akun login untuk penyewa ini
                        </Checkbox>

                        {form.data.buat_akun && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 18 }} className="penyewa-grid">
                                <Field label="Email" htmlFor="email" error={form.errors.email}>
                                    <Input id="email" type="email" icon="mail"
                                        value={form.data.email}
                                        onChange={(e) => form.setData('email', e.target.value)}
                                        placeholder="penyewa@contoh.com" />
                                </Field>

                                <Field label="Password awal" htmlFor="pwd" error={form.errors.password}
                                    helper="Penyewa dapat mengganti password setelah login pertama.">
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <div style={{ flex: 1 }}>
                                            <PasswordInput id="pwd"
                                                value={form.data.password}
                                                onChange={(e) => form.setData('password', e.target.value)}
                                                style={{ fontFamily: 'Geist Mono, monospace' }} />
                                        </div>
                                        <button type="button" onClick={() => form.setData('password', generatePassword())}
                                            className="btn btn-ghost btn-sm" style={{ whiteSpace: 'nowrap' }}>
                                            Auto-generate
                                        </button>
                                    </div>
                                </Field>
                            </div>
                        )}
                    </Card>
                )}

                {/* ───── Action footer ───── */}
                <div style={{
                    background: 'white', borderRadius: 16, padding: 18,
                    border: '1px solid rgba(11,13,26,0.06)',
                    boxShadow: '0 1px 2px rgba(11,13,26,0.03)',
                    display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap',
                }}>
                    <Link href={route('admin.penyewa.index')} className="btn btn-ghost btn-sm">
                        <Icon name="arrow-left" size={14} /> Kembali
                    </Link>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <Link href={route('admin.penyewa.index')} className="btn btn-link">Batal</Link>
                        <button type="submit" disabled={form.processing} className="btn btn-primary">
                            {form.processing ? 'Menyimpan…' : (isEdit ? 'Simpan perubahan' : 'Simpan penyewa')}
                            {!form.processing && <Icon name="arrow-right" size={15} />}
                        </button>
                    </div>
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
