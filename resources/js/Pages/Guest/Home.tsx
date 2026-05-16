import { Head, usePage } from '@inertiajs/react';
import { TopNav, Footer, waLink } from '@/components/ui';
import { Slide } from '@/components/guest/parts';
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

            <TopNav authenticated={!!auth.user} />

            <main className="snap-scroll-root bg-radial">
                <Slide id="top" bgImage="/images/kos/hero-exterior.jpg">
                    <Hero available={kamarTersediaCount} startingPrice={priceRange.min} waUrl={waUrl} />
                </Slide>

                <Slide>
                    <KamarFeaturedSection kamar={kamarFeatured} />
                </Slide>

                <Slide>
                    <GaleriSection />
                </Slide>

                <Slide>
                    <LokasiSection alamat={profil.alamat} />
                </Slide>

                <Slide dark>
                    <CaraKerjaSection />
                </Slide>

                <Slide>
                    <BiayaSection minPrice={priceRange.min} maxPrice={priceRange.max} />
                </Slide>

                <Slide>
                    <TestimoniSection items={testimoni} />
                </Slide>

                <Slide>
                    <PeraturanSection items={faqPeraturan} />
                </Slide>

                <Slide>
                    <FaqSection items={faqUmum} />
                </Slide>

                <Slide>
                    <KontakSection waUrl={waUrl} phone={profil.wa_number} />
                </Slide>

                <Footer dark />
            </main>

            <StickyWA waNumber={profil.wa_number} />
        </>
    );
}
