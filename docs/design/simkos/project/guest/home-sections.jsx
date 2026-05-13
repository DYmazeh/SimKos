/* Home content sections — galeri, biaya, lokasi, cara kerja, testimoni, peraturan, FAQ, tentang, owner CTA */

/* ——— Photo placeholder (reusable, not striped slop) ——— */
const PhotoPlaceholder = ({ label, height = 160, accent = "blue", icon = "home" }) => {
  const gradients = {
    blue:   "linear-gradient(135deg, #eff6ff, #dbeafe)",
    slate:  "linear-gradient(135deg, #f1f5f9, #e2e8f0)",
    warm:   "linear-gradient(135deg, #fef3c7, #fde68a)",
    teal:   "linear-gradient(135deg, #ccfbf1, #99f6e4)",
    rose:   "linear-gradient(135deg, #ffe4e6, #fecdd3)",
  };
  return (
    <div style={{
      height, background: gradients[accent] || gradients.blue,
      borderRadius: 14, position: "relative", overflow: "hidden",
      border: "1px solid rgba(11,13,26,0.05)",
      display: "grid", placeItems: "center",
    }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(60% 80% at 30% 20%, rgba(255,255,255,0.5), transparent)" }}/>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, color: "rgba(11,13,26,0.35)" }}>
        <Icon name={icon} size={28} stroke={1.4}/>
        <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</span>
      </div>
    </div>
  );
};

/* ——— Section header helper ——— */
const SectionHeader = ({ kicker, title, desc, dark = false, align = "left" }) => (
  <div style={{ marginBottom: 32, textAlign: align, maxWidth: align === "center" ? "60ch" : undefined, marginLeft: align === "center" ? "auto" : 0, marginRight: align === "center" ? "auto" : 0 }}>
    <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.10em", textTransform: "uppercase", color: dark ? "var(--teal-500)" : "var(--blue-600)", margin: 0 }}>{kicker}</p>
    <h2 style={{ fontSize: "clamp(26px, 3.2vw, 36px)", lineHeight: 1.15, letterSpacing: "-0.025em", fontWeight: 500, color: dark ? "var(--dark-text)" : "var(--ink-900)", margin: "8px 0 0", maxWidth: "22ch" }}>
      {title}
    </h2>
    {desc && <p style={{ fontSize: 16, lineHeight: 1.6, color: dark ? "var(--dark-muted)" : "var(--ink-500)", margin: "12px 0 0", maxWidth: "52ch" }}>{desc}</p>}
  </div>
);

/* ——— GALERI PROPERTI ——— */
const GaleriSection = () => {
  const items = [
    { label: "Tampak depan", accent: "blue",  icon: "home",     span: 2 },
    { label: "Ruang bersama", accent: "slate", icon: "home" },
    { label: "Dapur",         accent: "warm",  icon: "home" },
    { label: "Parkir",        accent: "teal",  icon: "home" },
    { label: "Area cuci",     accent: "rose",  icon: "home" },
  ];
  return (
    <section style={{ padding: "64px 24px" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <SectionHeader kicker="Properti" title="Lihat kos sebelum datang." desc="Foto fasilitas umum yang tersedia untuk seluruh penghuni."/>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gridAutoRows: "180px", gap: 12 }} className="gal-grid">
          {items.map((it, i) => (
            <div key={i} style={{ gridColumn: it.span === 2 ? "span 2" : "span 1" }}>
              <PhotoPlaceholder label={it.label} accent={it.accent} icon={it.icon} height="100%"/>
            </div>
          ))}
        </div>
      </div>
      <style>{`@media (max-width: 720px) { .gal-grid { grid-template-columns: 1fr 1fr !important; } .gal-grid > div { grid-column: span 1 !important; } }`}</style>
    </section>
  );
};

/* ——— STRUKTUR BIAYA ——— */
const BiayaSection = () => {
  const rows = [
    { item: "Sewa bulanan", value: "Sesuai tipe kamar (Rp 950rb – Rp 1,95jt)", note: "Standard / Deluxe / VIP" },
    { item: "Deposit",      value: "1× sewa bulanan",                            note: "Dikembalikan saat keluar bila tanpa kerusakan" },
    { item: "Listrik",      value: "Flat Rp 75.000 / bulan",                     note: "Sudah termasuk dalam tagihan" },
    { item: "Air & WiFi",   value: "Termasuk",                                    note: "Tanpa biaya tambahan" },
    { item: "Kebersihan",   value: "Termasuk 2× / minggu",                       note: "Area umum dibersihkan oleh petugas" },
    { item: "Denda telat",  value: "Rp 25.000 / 3 hari",                          note: "Berlaku setelah jatuh tempo lewat" },
  ];
  return (
    <section style={{ padding: "64px 24px", background: "rgba(255,255,255,0.5)", backdropFilter: "blur(4px)", borderTop: "1px solid rgba(11,13,26,0.04)" }}>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <SectionHeader kicker="Struktur biaya" title="Semua biaya, terbuka di muka." desc="Tidak ada biaya tersembunyi. Semua komponen pembayaran tertera di sini sebelum Anda booking."/>
        <div className="card-solid" style={{ padding: 0, overflow: "hidden" }}>
          {rows.map((r, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "180px 1fr 220px", gap: 24,
              padding: "16px 24px",
              borderTop: i > 0 ? "1px solid rgba(11,13,26,0.06)" : 0,
              alignItems: "center",
            }} className="biaya-row">
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-900)" }}>{r.item}</div>
              <div className="num" style={{ fontSize: 15, color: "var(--ink-800)" }}>{r.value}</div>
              <div style={{ fontSize: 13, color: "var(--ink-500)" }}>{r.note}</div>
            </div>
          ))}
        </div>
      </div>
      <style>{`@media (max-width: 720px) { .biaya-row { grid-template-columns: 1fr !important; gap: 4px !important; padding: 14px 18px !important; } }`}</style>
    </section>
  );
};

/* ——— LOKASI & SEKITAR ——— */
const LokasiSection = () => {
  const landmarks = [
    { name: "Kampus UGM",       distance: "8 menit motor",     icon: "map-pin" },
    { name: "Halte TransJogja", distance: "3 menit jalan kaki", icon: "map-pin" },
    { name: "Indomaret",        distance: "1 menit jalan kaki", icon: "map-pin" },
    { name: "RS Sardjito",      distance: "12 menit motor",    icon: "shield" },
    { name: "Masjid",           distance: "5 menit jalan kaki", icon: "home" },
    { name: "Pasar Demangan",   distance: "6 menit motor",     icon: "wallet" },
    { name: "ATM BCA & BNI",    distance: "2 menit jalan kaki", icon: "wallet" },
    { name: "Warung makan",     distance: "Banyak di sekitar",  icon: "home" },
  ];
  return (
    <section style={{ padding: "64px 24px" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <SectionHeader kicker="Lokasi" title="Strategis di pusat aktivitas." desc="Jl. Mawar No. 12, Yogyakarta. Dekat kampus, transportasi umum, dan kebutuhan harian."/>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24, alignItems: "stretch" }} className="lokasi-grid">
          <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid rgba(11,13,26,0.08)", background: "var(--ink-50)", position: "relative", minHeight: 340 }}>
            {/* Map placeholder */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #e0f2fe, #bae6fd)" }}>
              <svg viewBox="0 0 400 340" preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block" }}>
                <path d="M0,220 L120,180 L240,210 L400,160" stroke="rgba(255,255,255,0.7)" strokeWidth="14" fill="none" strokeLinecap="round"/>
                <path d="M0,80 L160,120 L300,60 L400,100" stroke="rgba(255,255,255,0.5)" strokeWidth="10" fill="none" strokeLinecap="round"/>
                <path d="M180,0 L160,340" stroke="rgba(255,255,255,0.4)" strokeWidth="8" fill="none"/>
                <circle cx="200" cy="170" r="12" fill="var(--blue-600)" stroke="white" strokeWidth="3"/>
                <circle cx="200" cy="170" r="22" fill="var(--blue-600)" opacity="0.2"/>
              </svg>
            </div>
            <div style={{ position: "absolute", bottom: 16, left: 16, right: 16, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div style={{ padding: "10px 14px", borderRadius: 12, background: "white", boxShadow: "var(--shadow-2)", fontSize: 13 }}>
                <div style={{ fontSize: 11, color: "var(--ink-400)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Lokasi</div>
                <div style={{ fontWeight: 600, color: "var(--ink-900)" }}>Jl. Mawar No. 12, Yogyakarta</div>
              </div>
              <a href="#" className="btn btn-ghost btn-sm">Buka di Maps</a>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-800)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>Tempat penting terdekat</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {landmarks.map((l, i) => (
                <div key={i} style={{ padding: "12px 14px", borderRadius: 12, background: "white", border: "1px solid rgba(11,13,26,0.06)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--blue-600)", marginBottom: 4 }}>
                    <Icon name={l.icon} size={14}/>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-900)" }}>{l.name}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ink-500)", marginLeft: 22 }}>{l.distance}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style>{`@media (max-width: 860px) { .lokasi-grid { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
};

/* ——— CARA KERJA (DARK template — replaces Kemampuan) ——— */
const CaraKerjaSection = () => {
  const steps = [
    { n: "01", icon: "phone",    title: "Hubungi pengelola",       desc: "Pilih kamar yang sesuai, lalu hubungi pengelola melalui WhatsApp. Anda dapat menjadwalkan survei langsung ke lokasi." },
    { n: "02", icon: "calendar", title: "Sepakati dan booking",    desc: "Setelah harga dan tanggal masuk disepakati, pengelola mendaftarkan akun Anda ke dalam sistem." },
    { n: "03", icon: "user",     title: "Akses dashboard penyewa", desc: "Masuk ke SimKos untuk melihat tagihan bulan berjalan, riwayat pembayaran, dan dokumen kontrak digital Anda." },
    { n: "04", icon: "upload",   title: "Bayar dan verifikasi",    desc: "Transfer sesuai tagihan, unggah bukti pembayaran. Admin memverifikasi dan status berubah otomatis." },
    { n: "05", icon: "receipt",  title: "Riwayat tersimpan",       desc: "Seluruh pembayaran tercatat dan dapat diakses kapan saja. Tidak perlu menyimpan kuitansi fisik." },
    { n: "06", icon: "shield",   title: "Selesai dan tenang",      desc: "Pengingat tagihan dikirim otomatis via WhatsApp menjelang jatuh tempo. Tidak ada yang terlewat." },
  ];
  return (
    <section id="cara" style={{ scrollMarginTop: 80, background: "var(--dark-bg)", padding: "80px 24px" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--teal-500)", margin: 0 }}>Cara kerja</p>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 38px)", lineHeight: 1.15, letterSpacing: "-0.025em", fontWeight: 500, color: "var(--dark-text)", margin: "8px 0 0", maxWidth: "22ch" }}>
          Dari hubungi pengelola hingga tagihan terverifikasi.
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "48px 40px", marginTop: 56 }} className="cara-grid">
          {steps.map((s) => (
            <div key={s.n}>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: "var(--dark-card)", border: "1px solid var(--dark-border)",
                display: "grid", placeItems: "center",
                color: "var(--dark-muted)", marginBottom: 16,
                position: "relative",
              }}>
                <Icon name={s.icon} size={22} stroke={1.4}/>
                <span className="num" style={{ position: "absolute", top: -8, right: -8, fontSize: 10, fontWeight: 600, color: "var(--teal-500)", background: "var(--dark-bg)", padding: "2px 6px", borderRadius: 999, border: "1px solid var(--dark-border)" }}>{s.n}</span>
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 600, color: "var(--dark-text)", margin: 0, marginBottom: 6 }}>{s.title}</h3>
              <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--dark-muted)", margin: 0 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 860px) { .cara-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 540px) { .cara-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
};

/* ——— TESTIMONI ——— */
const TestimoniSection = () => {
  const items = [
    { initial: "RH", name: "Rizky H.",  role: "Mahasiswa · 1 tahun",  rating: 5, quote: "Pengelolaan jelas. Saya tahu kapan harus bayar, bagaimana caranya, dan bukti pembayaran tersimpan rapi. Tidak ada drama soal tagihan." },
    { initial: "AN", name: "Anisa N.",  role: "Karyawan · 8 bulan",    rating: 5, quote: "Notifikasi WhatsApp sangat membantu. Saya sering lupa tanggal, tapi sistemnya selalu mengingatkan tepat waktu." },
    { initial: "DP", name: "Damar P.",  role: "Mahasiswa · 6 bulan",   rating: 4, quote: "Lokasi strategis, dekat ke kampus dan warung makan. Kamarnya bersih dan WiFi cepat untuk kuliah online." },
  ];
  return (
    <section style={{ padding: "64px 24px" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <SectionHeader kicker="Testimoni" title="Apa kata penghuni kami." desc="Pengalaman langsung dari penghuni yang sudah tinggal bersama kami."/>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="test-grid">
          {items.map((t, i) => (
            <div key={i} className="card-solid" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", gap: 2 }}>
                {[...Array(5)].map((_, j) => (
                  <svg key={j} width="14" height="14" viewBox="0 0 24 24" fill={j < t.rating ? "#f59e0b" : "rgba(11,13,26,0.10)"}>
                    <path d="M12 2l2.4 7.2H22l-6 4.6 2.4 7.2L12 16.8 5.6 21l2.4-7.2L2 9.2h7.6z"/>
                  </svg>
                ))}
              </div>
              <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--ink-800)", margin: 0, flex: 1 }}>"{t.quote}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 12, borderTop: "1px solid rgba(11,13,26,0.06)" }}>
                <div style={{ width: 36, height: 36, borderRadius: 999, background: "var(--blue-100)", color: "var(--blue-700)", display: "grid", placeItems: "center", fontSize: 13, fontWeight: 600 }}>{t.initial}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-900)" }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-500)" }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 20, fontSize: 13, color: "var(--ink-500)", textAlign: "center" }}>
          <span style={{ fontWeight: 600, color: "var(--ink-900)" }}>4.8 / 5</span> rata-rata dari 27 penghuni
        </div>
      </div>
      <style>{`@media (max-width: 860px) { .test-grid { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
};

/* ——— ACCORDION (shared) ——— */
const Accordion = ({ items }) => {
  const [open, setOpen] = React.useState(0);
  return (
    <div className="card-solid" style={{ padding: 0, overflow: "hidden" }}>
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={i} style={{ borderTop: i > 0 ? "1px solid rgba(11,13,26,0.06)" : 0 }}>
            <button onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen}
              style={{
                width: "100%", background: "transparent", border: 0, padding: "18px 24px",
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
                textAlign: "left", cursor: "pointer",
              }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: "var(--ink-900)" }}>{it.q}</span>
              <span style={{ color: "var(--ink-400)", transition: "transform 200ms var(--ease)", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                <Icon name="chevron-down" size={18}/>
              </span>
            </button>
            {isOpen && (
              <div style={{ padding: "0 24px 20px", fontSize: 14.5, lineHeight: 1.65, color: "var(--ink-500)" }}>
                {it.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

/* ——— PERATURAN ——— */
const PeraturanSection = () => {
  const rules = [
    { q: "Tamu menginap", a: "Tamu (saudara/orang tua) diperbolehkan menginap maksimal 2 malam dengan pemberitahuan ke admin. Tamu lawan jenis tidak diperkenankan masuk kamar." },
    { q: "Jam malam dan akses", a: "Gerbang depan ditutup pukul 23.00. Penghuni mendapat kartu akses untuk masuk-keluar 24 jam dengan mencatat di log keamanan." },
    { q: "Pasangan suami-istri", a: "Kami menerima pasutri dengan menunjukkan dokumen pernikahan yang sah. Sewa kamar VIP direkomendasikan untuk pasutri." },
    { q: "Hewan peliharaan", a: "Untuk menjaga kenyamanan bersama, hewan peliharaan tidak diperkenankan tinggal di area kos." },
    { q: "Merokok", a: "Dilarang merokok di dalam kamar. Tersedia area khusus merokok di teras belakang." },
    { q: "Masa minimum sewa", a: "Minimum sewa 3 bulan untuk tipe Standard, 1 bulan untuk Deluxe dan VIP. Sewa dibayar di muka per bulan." },
  ];
  return (
    <section style={{ padding: "64px 24px", background: "rgba(255,255,255,0.5)", backdropFilter: "blur(4px)", borderTop: "1px solid rgba(11,13,26,0.04)" }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <SectionHeader kicker="Peraturan kos" title="Aturan yang menjaga kenyamanan bersama." desc="Kebijakan ini berlaku untuk seluruh penghuni dan disepakati saat penandatanganan kontrak."/>
        <Accordion items={rules}/>
      </div>
    </section>
  );
};

/* ——— FAQ ——— */
const FaqSection = () => {
  const faqs = [
    { q: "Apakah listrik dan air sudah termasuk?", a: "Air dan WiFi sepenuhnya termasuk. Listrik flat Rp 75.000 per bulan sudah masuk dalam tagihan, tidak perlu membayar terpisah ke PLN." },
    { q: "Bagaimana cara membayar bulan pertama?", a: "Pada saat booking, Anda membayar deposit (1× sewa) dan sewa bulan pertama. Pembayaran dilakukan via transfer bank, bukti diunggah ke dashboard." },
    { q: "Apa yang terjadi jika saya keluar di tengah bulan?", a: "Sewa berlaku per bulan penuh dan tidak diprorata. Deposit akan dikembalikan setelah pengecekan kondisi kamar, paling lambat 7 hari setelah check-out." },
    { q: "Apakah tersedia parkir motor dan mobil?", a: "Parkir motor tersedia gratis untuk seluruh penghuni. Parkir mobil terbatas, silakan tanyakan ketersediaan ke pengelola." },
    { q: "Bagaimana sistem laundry?", a: "Tersedia area cuci-jemur gratis di lantai 1. Mesin cuci koin tersedia dengan biaya Rp 5.000 per cuci." },
    { q: "Apakah ada batasan check-in?", a: "Check-in dapat dilakukan 24 jam dengan koordinasi sebelumnya ke pengelola. Pengelola akan menyiapkan kunci dan dokumen." },
  ];
  return (
    <section style={{ padding: "64px 24px" }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <SectionHeader kicker="Pertanyaan umum" title="Hal yang sering ditanyakan." desc="Jika pertanyaan Anda belum terjawab di sini, silakan hubungi pengelola langsung."/>
        <Accordion items={faqs}/>
      </div>
    </section>
  );
};

/* ——— TENTANG PENGELOLA ——— */
const TentangSection = () => (
  <section style={{ padding: "64px 24px", background: "rgba(255,255,255,0.5)", backdropFilter: "blur(4px)", borderTop: "1px solid rgba(11,13,26,0.04)" }}>
    <div style={{ maxWidth: 920, margin: "0 auto" }}>
      <div className="card-solid" style={{ padding: 36, display: "grid", gridTemplateColumns: "200px 1fr", gap: 32, alignItems: "center" }} className="tentang-card">
        <div style={{ width: 200, height: 200, borderRadius: 16, overflow: "hidden" }}>
          <PhotoPlaceholder label="Foto pengelola" accent="slate" icon="user" height={200}/>
        </div>
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--blue-600)", margin: 0 }}>Pengelola</p>
          <h2 style={{ fontSize: 28, lineHeight: 1.2, letterSpacing: "-0.02em", fontWeight: 600, margin: "8px 0 4px" }}>Bu Sari Ningsih</h2>
          <p style={{ fontSize: 14, color: "var(--ink-500)", margin: 0 }}>Mengelola Kos Mawar sejak 2018 · Yogyakarta</p>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--ink-700)", margin: "16px 0 0" }}>
            Saya percaya kos yang baik adalah rumah kedua. Selama enam tahun mengelola Kos Mawar,
            prinsip kami sederhana: jujur soal biaya, responsif terhadap keluhan, dan menjaga
            properti agar selalu nyaman untuk seluruh penghuni.
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 18, flexWrap: "wrap" }}>
            <Pill tone="info">6 tahun pengalaman</Pill>
            <Pill tone="success" dot>Selalu responsif</Pill>
          </div>
        </div>
      </div>
    </div>
    <style>{`@media (max-width: 720px) { .tentang-card { grid-template-columns: 1fr !important; padding: 24px !important; text-align: center; } .tentang-card > div:first-child { margin: 0 auto; } }`}</style>
  </section>
);

/* ——— OWNER CTA (untuk pemilik kos) ——— */
const OwnerSection = ({ onNav }) => (
  <section style={{ padding: "0 24px 80px", background: "var(--dark-bg)" }}>
    <div style={{ maxWidth: 1120, margin: "0 auto" }}>
      <div style={{ padding: "40px 44px", borderRadius: 22, background: "var(--dark-card)", border: "1px solid var(--dark-border)", display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 32, alignItems: "center" }} className="owner-grid">
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--teal-500)", margin: 0 }}>Untuk pemilik kos</p>
          <h2 style={{ fontSize: "clamp(24px, 3vw, 30px)", lineHeight: 1.2, letterSpacing: "-0.02em", fontWeight: 500, color: "var(--dark-text)", margin: "8px 0 12px" }}>
            Punya kos? Kelola dengan SimKos.
          </h2>
          <p style={{ fontSize: 15, color: "var(--dark-muted)", margin: 0, maxWidth: "46ch", lineHeight: 1.6 }}>
            Hentikan kerja manual dengan buku catatan. Kelola data kamar, penyewa, tagihan, dan
            verifikasi pembayaran dari satu dashboard. Mulai gratis hingga 5 kamar.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 22 }}>
            <button className="btn btn-lg" onClick={() => onNav("login")} style={{ background: "white", color: "var(--ink-900)" }}>
              Coba dashboard <Icon name="arrow-right" size={16}/>
            </button>
            <a href="#" className="btn btn-lg" style={{ background: "transparent", border: "1px solid var(--dark-border)", color: "var(--dark-text)" }}>
              Pelajari fitur
            </a>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { v: "12 / 14", l: "Kamar terisi" },
            { v: "18,4jt",  l: "Pendapatan bulan ini" },
            { v: "3 pending", l: "Verifikasi menunggu" },
            { v: "100%",    l: "Riwayat tercatat" },
          ].map((s, i) => (
            <div key={i} style={{ padding: 14, borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid var(--dark-border)" }}>
              <div className="num" style={{ fontSize: 22, fontWeight: 600, color: "var(--dark-text)", letterSpacing: "-0.02em" }}>{s.v}</div>
              <div style={{ fontSize: 12, color: "var(--dark-muted)", marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
    <style>{`@media (max-width: 800px) { .owner-grid { grid-template-columns: 1fr !important; padding: 28px !important; } }`}</style>
  </section>
);

/* ——— KONTAK (light, simpler) ——— */
const KontakSection = () => (
  <section id="kontak" style={{ scrollMarginTop: 80, padding: "72px 24px" }}>
    <div style={{ maxWidth: 920, margin: "0 auto", textAlign: "center" }}>
      <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--blue-600)", margin: 0 }}>Kontak</p>
      <h2 className="h-1" style={{ margin: "8px 0 12px", maxWidth: "20ch", marginLeft: "auto", marginRight: "auto" }}>
        Siap menjadi penghuni? Hubungi kami.
      </h2>
      <p style={{ fontSize: 16, color: "var(--ink-500)", margin: "0 auto", maxWidth: "48ch", lineHeight: 1.6 }}>
        Anda berkomunikasi langsung dengan pengelola, tanpa perantara atau biaya tambahan.
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 28, justifyContent: "center" }}>
        <a href="https://wa.me/" className="btn btn-primary btn-lg">
          <Icon name="logo-wa" size={16}/> Chat WhatsApp
        </a>
        <a href="tel:" className="btn btn-ghost btn-lg">
          <Icon name="phone" size={16}/> 0812-3456-7890
        </a>
      </div>
      <p style={{ fontSize: 13, color: "var(--ink-400)", margin: "20px 0 0" }}>
        Senin – Minggu, 08.00 – 21.00 WIB
      </p>
    </div>
  </section>
);

/* ——— STICKY WHATSAPP ——— */
const StickyWA = () => {
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!visible) return null;
  return (
    <a href="https://wa.me/" className="fade-up" style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 40,
      width: 56, height: 56, borderRadius: 999,
      background: "#25D366", color: "white",
      display: "grid", placeItems: "center",
      boxShadow: "0 8px 24px -8px rgba(37,211,102,0.5), 0 0 0 4px rgba(37,211,102,0.15)",
      transition: "transform 180ms var(--ease)",
    }}
    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"}
    onMouseLeave={e => e.currentTarget.style.transform = ""}
    aria-label="Chat via WhatsApp">
      <Icon name="logo-wa" size={26}/>
    </a>
  );
};

Object.assign(window, {
  PhotoPlaceholder, SectionHeader, Accordion,
  GaleriSection, BiayaSection, LokasiSection,
  CaraKerjaSection, TestimoniSection,
  PeraturanSection, FaqSection,
  TentangSection, OwnerSection, KontakSection,
  StickyWA,
});
