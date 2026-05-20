import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { CurrencyInput, TopNav, Footer, formatRp, waLink } from '@/components/ui';
import { SectionHeader } from '@/components/guest/parts';
import { KamarCard, StickyWA, type KamarSummary, type ProfilKos } from '@/components/guest/sections';
import type { PageProps } from '@/types/inertia';

type Filters = {
    status: string;
    tipe: string;
    min_harga: number | null;
    max_harga: number | null;
    sort: string;
};

type KamarIndexProps = PageProps<{
    kamar: KamarSummary[];
    filters: Filters;
    profil: ProfilKos;
}>;

export default function KamarIndex() {
    const { props } = usePage<KamarIndexProps>();
    const { kamar, filters, profil, auth } = props;

    const [status, setStatus] = useState(filters.status || 'all');
    const [tipe, setTipe] = useState(filters.tipe || '');
    const [minHarga, setMinHarga] = useState<string>(filters.min_harga?.toString() || '');
    const [maxHarga, setMaxHarga] = useState<string>(filters.max_harga?.toString() || '');
    const [sort, setSort] = useState(filters.sort || 'harga_asc');

    // Debounce filter submission
    useEffect(() => {
        const t = setTimeout(() => {
            const params: Record<string, string | number> = { status, sort };
            if (tipe) params.tipe = tipe;
            if (minHarga) params.min_harga = Number(minHarga);
            if (maxHarga) params.max_harga = Number(maxHarga);
            router.get(route('guest.kamar.index'), params, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 400);
        return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, tipe, minHarga, maxHarga, sort]);

    return (
        <>
            <Head title="Daftar Kamar" />

            <div className="bg-radial" style={{ minHeight: '100vh' }}>
                <TopNav authenticated={!!auth.user} />

                <section style={{ padding: '48px 24px' }}>
                    <div style={{ maxWidth: 1120, margin: '0 auto' }}>
                        <SectionHeader
                            kicker="Katalog kamar"
                            title="Semua kamar yang kami kelola."
                            desc={`${kamar.length} kamar ditampilkan. Filter sesuai kebutuhan Anda.`}
                        />

                        {/* Filter bar */}
                        <div className="card-solid" style={{ padding: 20, marginBottom: 24 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, alignItems: 'end' }}>
                                <div className="field">
                                    <label className="label" htmlFor="f-status">Status</label>
                                    <select id="f-status" className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
                                        <option value="all">Semua</option>
                                        <option value="tersedia">Tersedia</option>
                                        <option value="terisi">Terisi</option>
                                    </select>
                                </div>
                                <div className="field">
                                    <label className="label" htmlFor="f-tipe">Tipe</label>
                                    <select id="f-tipe" className="input" value={tipe} onChange={(e) => setTipe(e.target.value)}>
                                        <option value="">Semua tipe</option>
                                        <option value="standar">Standar</option>
                                        <option value="deluxe">Deluxe</option>
                                        <option value="vip">VIP</option>
                                    </select>
                                </div>
                                <div className="field">
                                    <label className="label" htmlFor="f-min">Harga min (Rp)</label>
                                    <CurrencyInput id="f-min" className="input" placeholder="0"
                                        value={minHarga} onValueChange={(n) => setMinHarga(n === 0 ? '' : String(n))} />
                                </div>
                                <div className="field">
                                    <label className="label" htmlFor="f-max">Harga maks (Rp)</label>
                                    <CurrencyInput id="f-max" className="input" placeholder="∞"
                                        value={maxHarga} onValueChange={(n) => setMaxHarga(n === 0 ? '' : String(n))} />
                                </div>
                                <div className="field">
                                    <label className="label" htmlFor="f-sort">Urutkan</label>
                                    <select id="f-sort" className="input" value={sort} onChange={(e) => setSort(e.target.value)}>
                                        <option value="harga_asc">Termurah</option>
                                        <option value="harga_desc">Termahal</option>
                                        <option value="nomor">Nomor kamar</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Grid kamar */}
                        {kamar.length === 0 ? (
                            <div className="card-solid" style={{ padding: 48, textAlign: 'center', color: 'var(--ink-500)' }}>
                                Tidak ada kamar yang cocok dengan filter Anda.{' '}
                                <button
                                    type="button"
                                    onClick={() => { setStatus('all'); setTipe(''); setMinHarga(''); setMaxHarga(''); }}
                                    style={{ background: 'none', border: 0, color: 'var(--blue-600)', cursor: 'pointer', fontWeight: 500 }}
                                >
                                    Reset filter
                                </button>
                            </div>
                        ) : (
                            <>
                                <p style={{ fontSize: 13, color: 'var(--ink-500)', margin: '0 0 12px' }}>
                                    Menampilkan <strong style={{ color: 'var(--ink-900)' }}>{kamar.length}</strong> kamar
                                    {(filters.min_harga || filters.max_harga) && (
                                        <> · {formatRp(filters.min_harga ?? 0)}{filters.max_harga ? ` – ${formatRp(filters.max_harga)}` : '+'}</>
                                    )}
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                                    {kamar.map((k) => <KamarCard key={k.id} kamar={k} />)}
                                </div>
                            </>
                        )}
                    </div>
                </section>
            </div>

            <Footer />
            <StickyWA waNumber={profil.wa_number} />
        </>
    );
}
