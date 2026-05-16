import { Head, usePage } from '@inertiajs/react';
import { TopNav, Footer, waLink } from '@/components/ui';
import { Slide } from '@/components/guest/parts';
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
                    <Reveal direction="up" distance={18} duration={520}>
                        <Hero available={kamarTersediaCount} startingPrice={priceRange.min} waUrl={waUrl} />
                    </Reveal>
                </Slide>

                <Slide>
                    <Reveal direction="up" distance={20}>
                        <KamarFeaturedSection kamar={kamarFeatured} />
                    </Reveal>
                </Slide>

                <Slide>
                    <Reveal direction="up" distance={20}>
                        <GaleriSection />
                    </Reveal>
                </Slide>

                <Slide>
                    <Reveal direction="up" distance={20}>
                        <LokasiSection alamat={profil.alamat} />
                    </Reveal>
                </Slide>

                <Slide dark>
                    <Reveal direction="up" distance={20}>
                        <CaraKerjaSection />
                    </Reveal>
                </Slide>

                <Slide>
                    <Reveal direction="up" distance={20}>
                        <BiayaSection minPrice={priceRange.min} maxPrice={priceRange.max} />
                    </Reveal>
                </Slide>

                <Slide>
                    <Reveal direction="up" distance={20}>
                        <TestimoniSection items={testimoni} />
                    </Reveal>
                </Slide>

                <Slide>
                    <Reveal direction="up" distance={20}>
                        <PeraturanSection items={faqPeraturan} />
                    </Reveal>
                </Slide>

                <Slide>
                    <Reveal direction="up" distance={20}>
                        <FaqSection items={faqUmum} />
                    </Reveal>
                </Slide>

                <Slide>
                    <Reveal direction="up" distance={20}>
                        <KontakSection waUrl={waUrl} phone={profil.wa_number} />
                    </Reveal>
                </Slide>

                <Footer dark />
            </main>

            <StickyWA waNumber={profil.wa_number} />
        </>
    );
}
