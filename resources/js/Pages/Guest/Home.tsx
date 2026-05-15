import { Head, usePage } from '@inertiajs/react';
import { TopNav, Footer, waLink } from '@/components/ui';
import Reveal from '@/components/Reveal';
import {
    Hero,
    GaleriSection,
    KamarFeaturedSection,
    BiayaSection,
    LokasiSection,
    CaraKerjaSection,
    TestimoniSection,
    PeraturanSection,
    FaqSection,
    TentangSection,
    OwnerSection,
    KontakSection,
    StickyWA,
    type KamarSummary,
    type TestimoniItem,
    type FaqItem,
    type ProfilKos,
} from '@/components/guest/sections';
import type { PageProps } from '@/types/inertia';

type HomeProps = PageProps<{
    kamarFeatured: KamarSummary[];
    kamarTersediaCount: number;
    priceRange: { min: number; max: number };
    testimoni: TestimoniItem[];
    faqUmum: FaqItem[];
    faqPeraturan: FaqItem[];
    profil: ProfilKos;
}>;

export default function Home() {
    const { props } = usePage<HomeProps>();
    const { kamarFeatured, kamarTersediaCount, priceRange, testimoni, faqUmum, faqPeraturan, profil, auth } = props;

    const waUrl = waLink(profil.wa_number, `Halo ${profil.pengelola_nama}, saya ingin bertanya soal kamar kos.`);

    return (
        <>
            <Head title="Beranda" />

            <div className="bg-radial" style={{ minHeight: '100vh' }}>
                <TopNav authenticated={!!auth.user} />
                {/* Hero langsung visible (above-the-fold) — gunakan animasi internal CSS */}
                <Hero available={kamarTersediaCount} startingPrice={priceRange.min} waUrl={waUrl} />
                <Reveal direction="up" distance={32}>
                    <KamarFeaturedSection kamar={kamarFeatured} />
                </Reveal>
            </div>

            <Reveal direction="up"><GaleriSection /></Reveal>
            <Reveal direction="up"><BiayaSection minPrice={priceRange.min} maxPrice={priceRange.max} /></Reveal>
            <Reveal direction="up"><LokasiSection alamat={profil.alamat} /></Reveal>

            {/* Dark sections */}
            <Reveal direction="up"><CaraKerjaSection /></Reveal>
            <Reveal direction="scale"><OwnerSection /></Reveal>

            {/* Back to light */}
            <Reveal direction="up"><TestimoniSection items={testimoni} /></Reveal>
            <Reveal direction="up"><PeraturanSection items={faqPeraturan} /></Reveal>
            <Reveal direction="up"><FaqSection items={faqUmum} /></Reveal>
            <Reveal direction="up"><TentangSection profil={profil} /></Reveal>
            <Reveal direction="up"><KontakSection waUrl={waUrl} phone={profil.wa_number} /></Reveal>

            <Footer dark />
            <StickyWA waNumber={profil.wa_number} />
        </>
    );
}
