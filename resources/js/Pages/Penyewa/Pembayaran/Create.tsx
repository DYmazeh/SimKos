import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { Field, Icon, Input, Pill, formatRp } from '@/components/ui';
import type { PageProps } from '@/types/inertia';

type Tagihan = {
    id: number;
    periode: string;
    tgl_jatuh_tempo: string;
    jumlah: number;
    status: string;
    kamar_nomor: string;
    tipe: string;
};

type Rekening = {
    bank: string | null;
    nomor: string | null;
    nama: string | null;
};

type CreateProps = PageProps<{
    tagihan: Tagihan;
    rekening: Rekening;
}>;

const KICKER: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase',
    color: 'var(--blue-600)', margin: 0,
};

const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
    <section style={{
        background: 'white', borderRadius: 16,
        border: '1px solid rgba(11,13,26,0.06)',
        boxShadow: '0 1px 2px rgba(11,13,26,0.03)',
        ...style,
    }}>
        {children}
    </section>
);

const fmt = (s: string) => new Date(s).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
const fmtMonth = (s: string) => new Date(s).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

export default function PembayaranCreate() {
    const { props } = usePage<CreateProps>();
    const { tagihan, rekening } = props;
    const today = new Date().toISOString().slice(0, 10);

    const form = useForm<{
        tgl_bayar: string;
        jumlah_bayar: string;
        metode: 'transfer' | 'tunai';
        bukti: File | null;
        catatan: string;
    }>({
        tgl_bayar: today,
        jumlah_bayar: String(tagihan.jumlah),
        metode: 'transfer',
        bukti: null,
        catatan: '',
    });

    const [buktiPreview, setBuktiPreview] = useState<{ url: string; name: string; isPdf: boolean } | null>(null);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post(route('penyewa.tagihan.bayar.store', tagihan.id), { forceFormData: true });
    };

    const copyRekening = () => {
        if (rekening.nomor) {
            navigator.clipboard?.writeText(rekening.nomor);
        }
    };

    const hasRekening = !!(rekening.bank && rekening.nomor);

    return (
        <AuthenticatedLayout>
            <Head title={`Bayar - ${fmtMonth(tagihan.periode)}`} />

            {/* ───── Header dengan breadcrumb ───── */}
            <header style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 13, color: 'var(--ink-500)', margin: '0 0 6px' }}>
                    <Link href={route('penyewa.dashboard')} style={{ color: 'var(--ink-500)' }}>Dashboard</Link>
                    <span style={{ color: 'var(--ink-300)', margin: '0 8px' }}>/</span>
                    <span style={{ color: 'var(--blue-600)' }}>Upload bukti transfer</span>
                </p>
                <h1 className="h-1" style={{ margin: '0 0 8px' }}>
                    Bayar tagihan {fmtMonth(tagihan.periode)}.
                </h1>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--ink-500)', margin: 0, maxWidth: '56ch' }}>
                    Transfer ke rekening pengelola, lalu upload bukti di sini. Admin akan verifikasi segera.
                </p>
            </header>

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 900 }}>
                {/* ───── Detail tagihan ───── */}
                <Card style={{ padding: 24 }}>
                    <header style={{ marginBottom: 16 }}>
                        <p style={KICKER}>Detail tagihan</p>
                    </header>
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12,
                    }}>
                        <Tile label="Kamar" value={tagihan.kamar_nomor} sub={tagihan.tipe.toUpperCase()} />
                        <Tile label="Periode" value={fmtMonth(tagihan.periode)} />
                        <Tile label="Jatuh tempo" value={fmt(tagihan.tgl_jatuh_tempo)} />
                        <Tile label="Jumlah" value={formatRp(tagihan.jumlah)} accent />
                    </div>
                </Card>

                {/* ───── Instruksi rekening (kalau ada) ───── */}
                {hasRekening && (
                    <Card style={{ padding: 24, background: 'var(--blue-50)', borderColor: 'rgba(37,99,235,0.16)' }}>
                        <header style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Icon name="card" size={20} style={{ color: 'var(--blue-700)' }} />
                            <h2 className="h-2" style={{ margin: 0, color: 'var(--blue-700)' }}>Transfer ke rekening berikut</h2>
                        </header>
                        <div style={{ display: 'grid', gap: 10, fontSize: 14 }}>
                            <RekRow label="Bank" value={rekening.bank ?? '-'} />
                            <RekRow label="No. rekening" value={rekening.nomor ?? '-'} mono action={
                                <button type="button" onClick={copyRekening} className="btn btn-ghost btn-sm" style={{ background: 'white' }}>
                                    Salin
                                </button>
                            } />
                            <RekRow label="Atas nama" value={rekening.nama ?? '-'} />
                            <RekRow label="Nominal" value={formatRp(tagihan.jumlah)} mono bold />
                        </div>
                    </Card>
                )}

                {/* ───── Form upload ───── */}
                <Card style={{ padding: 28 }}>
                    <header style={{ marginBottom: 22 }}>
                        <p style={KICKER}>Bukti transfer</p>
                        <h2 className="h-2" style={{ margin: '4px 0 0' }}>Konfirmasi pembayaran.</h2>
                    </header>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }} className="pay-grid">
                        <Field label="Tanggal bayar" htmlFor="tgl" error={form.errors.tgl_bayar}>
                            <Input id="tgl" type="date" required max={today}
                                value={form.data.tgl_bayar}
                                onChange={(e) => form.setData('tgl_bayar', e.target.value)} />
                        </Field>

                        <Field label="Jumlah dibayar" htmlFor="jumlah" error={form.errors.jumlah_bayar}>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: 14, top: 12, fontSize: 14, color: 'var(--ink-400)' }}>Rp</span>
                                <input id="jumlah" type="number" required min={1} className="input"
                                    value={form.data.jumlah_bayar}
                                    onChange={(e) => form.setData('jumlah_bayar', e.target.value)}
                                    style={{ paddingLeft: 36, fontVariantNumeric: 'tabular-nums' }} />
                            </div>
                        </Field>

                        <Field label="Metode bayar" htmlFor="metode" error={form.errors.metode}>
                            <select id="metode" className="input" required
                                value={form.data.metode}
                                onChange={(e) => form.setData('metode', e.target.value as 'transfer' | 'tunai')}>
                                <option value="transfer">Transfer bank</option>
                                <option value="tunai">Tunai (langsung ke pengelola)</option>
                            </select>
                        </Field>

                        <Field label="Catatan (opsional)" htmlFor="catatan">
                            <Input id="catatan" type="text" maxLength={500}
                                value={form.data.catatan}
                                onChange={(e) => form.setData('catatan', e.target.value)}
                                placeholder="Mis. bayar untuk periode tertentu…" />
                        </Field>

                        <Field label="File bukti transfer" htmlFor="bukti" error={form.errors.bukti as unknown as string}
                            helper="JPG, PNG, atau PDF — maks 5MB">
                            <div style={{ gridColumn: 'span 2' }}>
                                {buktiPreview ? (
                                    <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(11,13,26,0.08)' }}>
                                        {buktiPreview.isPdf ? (
                                            <div style={{
                                                padding: 32, background: 'var(--ink-50)',
                                                display: 'flex', alignItems: 'center', gap: 14,
                                            }}>
                                                <div style={{
                                                    width: 48, height: 48, borderRadius: 12,
                                                    background: 'white', color: 'var(--blue-700)',
                                                    display: 'grid', placeItems: 'center',
                                                }}>
                                                    <Icon name="receipt" size={22} />
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {buktiPreview.name}
                                                    </div>
                                                    <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>PDF · siap dikirim</div>
                                                </div>
                                            </div>
                                        ) : (
                                            <img src={buktiPreview.url} alt="Preview bukti"
                                                style={{ width: '100%', maxHeight: 360, objectFit: 'contain', background: 'var(--ink-50)', display: 'block' }} />
                                        )}
                                        <button type="button"
                                            onClick={() => { setBuktiPreview(null); form.setData('bukti', null); }}
                                            aria-label="Ganti file"
                                            style={{
                                                position: 'absolute', top: 8, right: 8,
                                                width: 32, height: 32, borderRadius: 999,
                                                background: 'rgba(11,13,26,0.78)', color: 'white',
                                                border: 0, cursor: 'pointer', backdropFilter: 'blur(6px)',
                                                display: 'grid', placeItems: 'center',
                                            }}>
                                            <Icon name="x" size={15} stroke={2.4} />
                                        </button>
                                    </div>
                                ) : (
                                    <label htmlFor="bukti_input" style={{
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
                                            <Icon name="upload" size={24} />
                                        </div>
                                        <div style={{ fontSize: 14.5, color: 'var(--ink-900)', fontWeight: 500 }}>Klik untuk pilih file bukti</div>
                                        <div style={{ fontSize: 12.5, color: 'var(--ink-400)', marginTop: 4 }}>Screenshot transfer, foto resi, atau e-receipt PDF</div>
                                    </label>
                                )}
                                <input id="bukti_input" type="file" required
                                    accept="image/jpeg,image/png,application/pdf"
                                    style={{ display: 'none' }}
                                    onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) {
                                            const isPdf = f.type === 'application/pdf';
                                            setBuktiPreview({ url: URL.createObjectURL(f), name: f.name, isPdf });
                                            form.setData('bukti', f);
                                        }
                                    }} />
                            </div>
                        </Field>
                    </div>
                </Card>

                {/* ───── Action footer ───── */}
                <Card style={{ padding: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ fontSize: 13, color: 'var(--ink-500)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon name="info" size={14} />
                        Status berubah ke <Pill tone="info">Menunggu verifikasi</Pill> setelah dikirim.
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <Link href={route('penyewa.dashboard')} className="btn btn-link">Batal</Link>
                        <button type="submit" disabled={form.processing || !form.data.bukti}
                            className="btn btn-primary">
                            {form.processing ? 'Mengirim…' : 'Kirim bukti'}
                            {!form.processing && <Icon name="arrow-right" size={15} />}
                        </button>
                    </div>
                </Card>
            </form>

            <style>{`
                @media (max-width: 720px) {
                    .pay-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </AuthenticatedLayout>
    );
}

const Tile = ({ label, value, sub, accent = false }: { label: string; value: string; sub?: string; accent?: boolean }) => (
    <div style={{
        padding: 14, borderRadius: 12,
        background: accent ? 'var(--blue-50)' : 'var(--ink-50)',
        border: `1px solid ${accent ? 'rgba(37,99,235,0.1)' : 'rgba(11,13,26,0.04)'}`,
    }}>
        <div style={{
            fontSize: 10.5, color: accent ? 'var(--blue-700)' : 'var(--ink-400)',
            textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600,
        }}>{label}</div>
        <div style={{
            marginTop: 4, fontSize: 14.5, fontWeight: 600,
            color: accent ? 'var(--blue-700)' : 'var(--ink-900)',
            fontVariantNumeric: 'tabular-nums',
        }}>{value}</div>
        {sub && (
            <div style={{ marginTop: 2, fontSize: 11, color: 'var(--ink-500)', letterSpacing: '0.04em' }}>
                {sub}
            </div>
        )}
    </div>
);

const RekRow = ({ label, value, mono = false, bold = false, action }: {
    label: string; value: string; mono?: boolean; bold?: boolean; action?: React.ReactNode;
}) => (
    <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        padding: '8px 12px', background: 'white', borderRadius: 10,
        border: '1px solid rgba(37,99,235,0.10)',
    }}>
        <span style={{ fontSize: 13, color: 'var(--ink-500)' }}>{label}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
                fontWeight: bold ? 700 : 500,
                color: bold ? 'var(--blue-700)' : 'var(--ink-900)',
                fontFamily: mono ? 'Geist Mono, monospace' : 'inherit',
                fontVariantNumeric: 'tabular-nums',
                fontSize: 14,
            }}>{value}</span>
            {action}
        </span>
    </div>
);
