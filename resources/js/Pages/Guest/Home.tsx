import { Head, usePage } from '@inertiajs/react';
import { TopNav, Footer, waLink } from '@/components/ui';
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
                <Hero available={kamarTersediaCount} startingPrice={priceRange.min} waUrl={waUrl} />
                <KamarFeaturedSection kamar={kamarFeatured} />
            </div>

            <GaleriSection />
            <BiayaSection minPrice={priceRange.min} maxPrice={priceRange.max} />
            <LokasiSection alamat={profil.alamat} />

            {/* Dark sections */}
            <CaraKerjaSection />
            <OwnerSection />

            {/* Back to light */}
            <TestimoniSection items={testimoni} />
            <PeraturanSection items={faqPeraturan} />
            <FaqSection items={faqUmum} />
            <TentangSection profil={profil} />
            <KontakSection waUrl={waUrl} phone={profil.wa_number} />

            <Footer dark />
            <StickyWA waNumber={profil.wa_number} />
        </>
    );
}
