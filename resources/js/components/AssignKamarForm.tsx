import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { CurrencyInput, Field, formatRp } from '@/components/ui';

type KamarOption = { id: number; nomor_kamar: string; tipe: string; harga_bulanan: number };
type PenyewaOption = { id: number; nama_lengkap: string; no_hp: string };

type Props =
    | { mode: 'kamar'; kamar: { id: number; harga_bulanan: number }; penyewaOptions: PenyewaOption[] }
    | { mode: 'penyewa'; penyewaId: number; kamarOptions: KamarOption[] };

const todayLocal = (): string => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/**
 * Form assign penyewa ke kamar. Dipakai di dua halaman lewat prop `mode`:
 * - mode 'kamar'   : kamar fixed, admin memilih penyewa yang belum punya kamar.
 * - mode 'penyewa' : penyewa fixed, admin memilih kamar yang tersedia.
 * Keduanya POST ke route penyewa-centric `admin.penyewa.sewa.store`.
 */
const AssignKamarForm = (props: Props): React.ReactElement => {
    const [penyewaId, setPenyewaId] = useState<number | ''>('');
    const [overrideHarga, setOverrideHarga] = useState(false);

    const form = useForm<{ kamar_id: number | ''; tgl_mulai: string; tgl_selesai: string; harga_disepakati: string }>({
        kamar_id: props.mode === 'kamar' ? props.kamar.id : '',
        tgl_mulai: todayLocal(),
        tgl_selesai: '',
        harga_disepakati: '',
    });

    // Harga default mengikuti kamar yang dipilih (mode penyewa) atau kamar ini (mode kamar).
    const selectedKamar =
        props.mode === 'kamar'
            ? props.kamar
            : props.kamarOptions.find((k) => k.id === Number(form.data.kamar_id));
    const defaultHarga = selectedKamar ? selectedKamar.harga_bulanan : '';

    // SewaController mengembalikan errors.assign untuk kegagalan domain (kamar keburu terisi, dll).
    const assignError = (form.errors as Record<string, string | undefined>).assign;

    const targetPenyewa = props.mode === 'penyewa' ? props.penyewaId : penyewaId;
    const canSubmit = Boolean(targetPenyewa) && Boolean(form.data.kamar_id) && !form.processing;

    const submit = (e: React.FormEvent): void => {
        e.preventDefault();
        if (!targetPenyewa || !form.data.kamar_id) return;

        form.transform((data) => ({
            kamar_id: Number(data.kamar_id),
            tgl_mulai: data.tgl_mulai,
            ...(data.tgl_selesai ? { tgl_selesai: data.tgl_selesai } : {}),
            ...(overrideHarga && data.harga_disepakati ? { harga_disepakati: Number(data.harga_disepakati) } : {}),
        }));
        form.post(route('admin.penyewa.sewa.store', targetPenyewa), { preserveScroll: true });
    };

    return (
        <form onSubmit={submit} style={{ display: 'grid', gap: 14 }}>
            {props.mode === 'kamar' ? (
                <Field label="Pilih penyewa" htmlFor="assign-penyewa">
                    <select
                        id="assign-penyewa"
                        className="input"
                        value={penyewaId}
                        onChange={(e) => setPenyewaId(e.target.value ? Number(e.target.value) : '')}
                    >
                        <option value="">— Pilih penyewa yang belum punya kamar —</option>
                        {props.penyewaOptions.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.nama_lengkap} · {p.no_hp}
                            </option>
                        ))}
                    </select>
                </Field>
            ) : (
                <Field label="Pilih kamar" htmlFor="assign-kamar" error={form.errors.kamar_id}>
                    <select
                        id="assign-kamar"
                        className="input"
                        value={form.data.kamar_id}
                        onChange={(e) => {
                            form.setData('kamar_id', e.target.value ? Number(e.target.value) : '');
                            setOverrideHarga(false);
                        }}
                    >
                        <option value="">— Pilih kamar tersedia —</option>
                        {props.kamarOptions.map((k) => (
                            <option key={k.id} value={k.id}>
                                {k.nomor_kamar} · {k.tipe.toUpperCase()} · {formatRp(k.harga_bulanan)}
                            </option>
                        ))}
                    </select>
                </Field>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Field label="Tanggal mulai sewa" htmlFor="assign-tgl" error={form.errors.tgl_mulai}>
                    <input
                        id="assign-tgl"
                        type="date"
                        className="input"
                        value={form.data.tgl_mulai}
                        onChange={(e) => form.setData('tgl_mulai', e.target.value)}
                    />
                </Field>

                <Field label="Tanggal akhir sewa" htmlFor="assign-tgl-selesai" error={form.errors.tgl_selesai}>
                    <input
                        id="assign-tgl-selesai"
                        type="date"
                        className="input"
                        value={form.data.tgl_selesai}
                        min={form.data.tgl_mulai || undefined}
                        onChange={(e) => form.setData('tgl_selesai', e.target.value)}
                    />
                </Field>
            </div>

            <Field label="Harga disepakati / bulan" htmlFor="assign-harga" error={form.errors.harga_disepakati}>
                <div style={{ display: 'flex', gap: 8 }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <span style={{ position: 'absolute', left: 14, top: 12, fontSize: 14, color: 'var(--ink-400)' }}>Rp</span>
                            <CurrencyInput
                                id="assign-harga"
                                className="input"
                                value={overrideHarga ? form.data.harga_disepakati : defaultHarga}
                                onValueChange={(n) => form.setData('harga_disepakati', String(n))}
                                disabled={!overrideHarga}
                                placeholder="1.500.000"
                                style={{
                                    paddingLeft: 36,
                                    fontVariantNumeric: 'tabular-nums',
                                    background: overrideHarga ? 'white' : 'var(--ink-50)',
                                }}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => setOverrideHarga((o) => !o)}
                            className="btn btn-ghost btn-sm"
                            style={{ whiteSpace: 'nowrap' }}
                        >
                            {overrideHarga ? 'Reset' : 'Ubah harga'}
                        </button>
                    </div>
                </Field>

            {assignError && <p className="error" role="alert">{assignError}</p>}

            <div>
                <button type="submit" className="btn btn-primary btn-sm" disabled={!canSubmit}>
                    {form.processing ? 'Menyimpan…' : 'Assign kamar'}
                </button>
            </div>
        </form>
    );
};

export default AssignKamarForm;
