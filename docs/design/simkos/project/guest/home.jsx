/* SimKos Home v2 — clean, light-blue radial + dark capabilities section */

const SAMPLE_KAMAR = [
  { nomor: "A-101", tipe: "standard", harga: 950000, luas: 9, lantai: 1, fasilitas: ["WiFi", "Kasur", "Lemari", "Kipas"], deskripsi: "Kamar standar di lantai 1, dekat ruang bersama dan dapur." },
  { nomor: "A-204", tipe: "deluxe",   harga: 1450000, luas: 12, lantai: 2, fasilitas: ["WiFi", "AC", "Kasur", "Meja kerja"], deskripsi: "Kamar deluxe dengan AC dan meja kerja, cocok untuk kerja remote." },
  { nomor: "B-301", tipe: "vip",      harga: 1850000, luas: 16, lantai: 3, fasilitas: ["WiFi", "AC", "KM dalam", "Balkon"], deskripsi: "VIP dengan kamar mandi dalam dan balkon menghadap timur." },
  { nomor: "A-105", tipe: "standard", harga: 950000, luas: 9, lantai: 1, fasilitas: ["WiFi", "Kasur", "Lemari"], deskripsi: "Standar lantai 1 dengan ventilasi baik, dekat pintu keluar." },
  { nomor: "B-202", tipe: "deluxe",   harga: 1450000, luas: 12, lantai: 2, fasilitas: ["WiFi", "AC", "Meja kerja"], deskripsi: "Deluxe lantai 2, jendela besar menghadap taman." },
  { nomor: "B-305", tipe: "vip",      harga: 1950000, luas: 18, lantai: 3, fasilitas: ["WiFi", "AC", "KM dalam", "Balkon"], deskripsi: "VIP unit pojok, lebih tenang dengan balkon luas." },
];

const formatRp = (n) => "Rp " + n.toLocaleString("id-ID");

/* ——— HERO ——— */
const Hero = ({ onNav, available, startingPrice }) => (
  <section style={{ paddingTop: 56, paddingBottom: 56 }}>
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 24px", display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 48, alignItems: "center" }} className="hero-grid">
      <div>
        <div className="pill pill-neutral" style={{ marginBottom: 20 }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--success)" }} className="pulse-dot"/>
          {available} kamar tersedia
        </div>

        <h1 className="h-display" style={{ margin: 0, marginBottom: 16, color: "var(--ink-900)" }}>
          Kos yang dikelola,<br/>
          <span style={{ background: "linear-gradient(120deg, var(--ink-900), var(--blue-600) 80%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
            jelas dan tenang.
          </span>
        </h1>

        <p style={{ fontSize: 18, lineHeight: 1.6, color: "var(--ink-500)", maxWidth: "48ch", margin: 0, marginBottom: 28 }}>
          Satu sistem untuk data kamar, penyewa, tagihan, dan verifikasi pembayaran.
          Transparan untuk penghuni, efisien untuk pengelola.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button className="btn btn-primary btn-lg" onClick={() => onNav("home", "kamar")}>
            Lihat kamar
            <Icon name="arrow-right" size={16}/>
          </button>
          <button className="btn btn-ghost btn-lg" onClick={() => onNav("login")}>
            Masuk dashboard
          </button>
        </div>
      </div>

      {/* Mini preview card */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <MiniPreview/>
      </div>
    </div>
    <style>{`@media (max-width: 860px) { .hero-grid { grid-template-columns: 1fr !important; gap: 36px !important; } }`}</style>
  </section>
);

const MiniPreview = () => (
  <div className="card-solid fade-up" style={{ padding: 20, width: "100%", maxWidth: 380 }}>
    <div style={{ display: "flex", gap: 5, marginBottom: 16 }}>
      <span style={{ width: 10, height: 10, borderRadius: 999, background: "#e5546c", opacity: .8 }}/>
      <span style={{ width: 10, height: 10, borderRadius: 999, background: "#e8b53a", opacity: .8 }}/>
      <span style={{ width: 10, height: 10, borderRadius: 999, background: "#3eb38a", opacity: .8 }}/>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
      <div style={{ padding: "10px 12px", borderRadius: 12, background: "var(--ink-50)" }}>
        <div style={{ fontSize: 11, color: "var(--ink-400)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Kamar terisi</div>
        <div className="num" style={{ fontSize: 22, fontWeight: 600, marginTop: 2 }}>12 / 14</div>
      </div>
      <div style={{ padding: "10px 12px", borderRadius: 12, background: "var(--blue-50)" }}>
        <div style={{ fontSize: 11, color: "var(--blue-700)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Pendapatan</div>
        <div className="num" style={{ fontSize: 22, fontWeight: 600, marginTop: 2, color: "var(--blue-700)" }}>18,4jt</div>
      </div>
    </div>
    {[
      { l: "Verifikasi menunggu", v: <Pill tone="warning">3 pending</Pill> },
      { l: "Tagihan jatuh tempo", v: <Pill tone="success">Aman</Pill> },
    ].map((r, i) => (
      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderTop: "1px solid rgba(11,13,26,0.06)" }}>
        <span style={{ fontSize: 13, color: "var(--ink-500)" }}>{r.l}</span>
        {r.v}
      </div>
    ))}
  </div>
);

/* ——— KAMAR SECTION ——— */
const KamarCard = ({ kamar, onDetail }) => {
  const tipeColor = kamar.tipe === "vip" ? "warning" : kamar.tipe === "deluxe" ? "info" : "neutral";
  return (
    <article className="card-solid" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", cursor: "pointer", transition: "transform 180ms var(--ease), box-shadow 240ms var(--ease)" }}
      onClick={() => onDetail(kamar)}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 32px -12px rgba(11,13,26,0.15)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
      role="button" tabIndex={0} aria-label={`Detail kamar ${kamar.nomor}`}
      onKeyDown={e => e.key === "Enter" && onDetail(kamar)}>
      {/* Photo placeholder */}
      <div style={{ height: 120, background: "linear-gradient(135deg, var(--ink-50), var(--blue-50))", position: "relative", borderBottom: "1px solid rgba(11,13,26,0.05)" }}>
        <div className="stripe" style={{ position: "absolute", inset: 0, opacity: 0.5 }}/>
        <div style={{ position: "absolute", top: 12, left: 12 }}>
          <Pill tone={tipeColor}>{kamar.tipe.toUpperCase()}</Pill>
        </div>
      </div>

      <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <h3 className="h-2" style={{ margin: 0, fontSize: 18 }}>Kamar {kamar.nomor}</h3>
          <span style={{ fontSize: 12, color: "var(--ink-400)" }}>Lt. {kamar.lantai} · {kamar.luas} m²</span>
        </div>
        <p style={{ margin: 0, color: "var(--ink-500)", fontSize: 13.5, lineHeight: 1.5, flex: 1 }}>{kamar.deskripsi}</p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {kamar.fasilitas.slice(0, 4).map((f, i) => (
            <span key={i} style={{ fontSize: 11.5, padding: "3px 8px", borderRadius: 999, color: "var(--ink-700)", background: "var(--ink-50)", border: "1px solid rgba(11,13,26,0.05)" }}>{f}</span>
          ))}
        </div>

        <div style={{ paddingTop: 10, borderTop: "1px solid rgba(11,13,26,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
          <div>
            <span className="num" style={{ fontSize: 20, fontWeight: 600 }}>{formatRp(kamar.harga)}</span>
            <span style={{ fontSize: 12, color: "var(--ink-400)", marginLeft: 4 }}>/ bulan</span>
          </div>
          <span style={{ fontSize: 13, color: "var(--blue-600)", fontWeight: 500 }}>
            Lihat detail →
          </span>
        </div>
      </div>
    </article>
  );
};

/* Detail modal */
const KamarDetail = ({ kamar, onClose, onContact }) => {
  if (!kamar) return null;
  const tipeColor = kamar.tipe === "vip" ? "warning" : kamar.tipe === "deluxe" ? "info" : "neutral";

  React.useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "grid", placeItems: "center", padding: 24 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ position: "fixed", inset: 0, background: "rgba(11,13,26,0.4)", backdropFilter: "blur(6px)" }}/>
      <div className="card-solid fade-up" style={{ position: "relative", width: "100%", maxWidth: 560, maxHeight: "90vh", overflow: "auto" }}>
        {/* Photo placeholder */}
        <div style={{ height: 180, background: "linear-gradient(135deg, var(--ink-50), var(--blue-50))", position: "relative", borderRadius: "22px 22px 0 0", borderBottom: "1px solid rgba(11,13,26,0.05)" }}>
          <div className="stripe" style={{ position: "absolute", inset: 0, borderRadius: "22px 22px 0 0", opacity: 0.5 }}/>
          <div style={{ position: "absolute", top: 16, left: 16 }}><Pill tone={tipeColor}>{kamar.tipe.toUpperCase()}</Pill></div>
          <div style={{ position: "absolute", top: 16, right: 16 }}><Pill tone="success" dot="pulse">Tersedia</Pill></div>
          <button onClick={onClose} style={{ position: "absolute", bottom: 12, right: 12, width: 36, height: 36, borderRadius: 999, background: "white", border: "1px solid rgba(11,13,26,0.08)", display: "grid", placeItems: "center", cursor: "pointer", boxShadow: "var(--shadow-1)" }}>
            <Icon name="x" size={16} stroke={2}/>
          </button>
        </div>

        <div style={{ padding: "24px 28px" }}>
          <h2 className="h-1" style={{ margin: 0, fontSize: 28 }}>Kamar {kamar.nomor}</h2>
          <p style={{ margin: 0, marginTop: 4, color: "var(--ink-500)", fontSize: 15 }}>{kamar.deskripsi}</p>

          {/* Specs grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 20 }}>
            {[
              { label: "Lantai", value: kamar.lantai },
              { label: "Luas", value: `${kamar.luas} m²` },
              { label: "Tipe", value: kamar.tipe.charAt(0).toUpperCase() + kamar.tipe.slice(1) },
            ].map((s, i) => (
              <div key={i} style={{ padding: "10px 14px", borderRadius: 12, background: "var(--ink-50)", border: "1px solid rgba(11,13,26,0.04)" }}>
                <div style={{ fontSize: 11, color: "var(--ink-400)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginTop: 2 }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Fasilitas */}
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-800)", marginBottom: 8 }}>Fasilitas</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {kamar.fasilitas.map((f, i) => (
                <span key={i} style={{ fontSize: 13, padding: "5px 12px", borderRadius: 999, color: "var(--ink-700)", background: "var(--ink-50)", border: "1px solid rgba(11,13,26,0.06)" }}>{f}</span>
              ))}
            </div>
          </div>

          {/* Price + CTA */}
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid rgba(11,13,26,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div className="num" style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.02em" }}>{formatRp(kamar.harga)}</div>
              <div style={{ fontSize: 13, color: "var(--ink-400)" }}>per bulan</div>
            </div>
            <button className="btn btn-primary btn-lg" onClick={() => onContact(kamar)}>
              <Icon name="logo-wa" size={16}/> Hubungi via WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const KamarSection = ({ kamar, onDetail, filter, setFilter }) => {
  const types = ["semua", "standard", "deluxe", "vip"];
  const filtered = filter === "semua" ? kamar : kamar.filter(k => k.tipe === filter);
  return (
    <section id="kamar" style={{ scrollMarginTop: 80, paddingTop: 64, paddingBottom: 72, background: "rgba(255,255,255,0.4)", backdropFilter: "blur(4px)", borderTop: "1px solid rgba(11,13,26,0.04)" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "end", gap: 16, marginBottom: 28 }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--blue-600)", margin: 0 }}>Kamar tersedia</p>
            <h2 className="h-1" style={{ margin: 0, marginTop: 4 }}>Pilih kamar yang sesuai.</h2>
          </div>
          <div role="tablist" aria-label="Filter tipe kamar" style={{ display: "inline-flex", gap: 4, padding: 4, background: "white", border: "1px solid rgba(11,13,26,0.08)", borderRadius: 999, boxShadow: "var(--shadow-1)" }}>
            {types.map(t => (
              <button key={t} role="tab" aria-selected={filter === t} onClick={() => setFilter(t)}
                style={{ padding: "7px 14px", fontSize: 13, fontWeight: 500, border: 0, borderRadius: 999, background: filter === t ? "var(--ink-900)" : "transparent", color: filter === t ? "white" : "var(--ink-500)", textTransform: "capitalize", cursor: "pointer", transition: "all 180ms var(--ease)" }}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {filtered.map(k => <KamarCard key={k.nomor} kamar={k} onDetail={onDetail}/>)}
        </div>
        {filtered.length === 0 && (
          <div style={{ padding: 48, textAlign: "center", color: "var(--ink-500)", fontSize: 15 }}>
            Tidak ada kamar untuk tipe ini. Coba tipe lain atau hubungi admin.
          </div>
        )}
      </div>
    </section>
  );
};

/* ——— DARK CAPABILITIES SECTION (like Perplexity reference) ——— */
const CapabilitiesSection = () => {
  const items = [
    { icon: "home",    title: "Manajemen kamar",       desc: "Kelola status, harga, dan fasilitas setiap kamar dari satu halaman. Perubahan langsung terlihat di halaman publik." },
    { icon: "receipt",  title: "Tagihan otomatis",       desc: "Generate tagihan bulanan dengan satu klik. Sistem mencatat jatuh tempo dan menghitung tunggakan secara otomatis." },
    { icon: "shield",   title: "Verifikasi pembayaran",  desc: "Penyewa upload bukti transfer, admin verifikasi. Riwayat pembayaran tersimpan lengkap untuk pelaporan." },
    { icon: "logo-wa",  title: "Pengingat WhatsApp",     desc: "Kirim reminder tagihan langsung ke WhatsApp penyewa. Link pembayaran sudah disertakan dalam pesan." },
    { icon: "upload",   title: "Upload bukti transfer",  desc: "Penyewa mengunggah foto bukti pembayaran langsung dari dashboard. Admin menerima notifikasi untuk verifikasi." },
    { icon: "calendar", title: "Kontrak & riwayat",      desc: "Catat masa sewa, tanggal mulai dan berakhir. Seluruh riwayat penghuni tersimpan rapi per kamar." },
  ];

  return (
    <section id="tentang" style={{ scrollMarginTop: 80, background: "var(--dark-bg)", padding: "80px 24px" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--teal-500)", margin: 0 }}>Kemampuan</p>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 38px)", lineHeight: 1.15, letterSpacing: "-0.025em", fontWeight: 500, color: "var(--dark-text)", margin: 0, marginTop: 8, maxWidth: "20ch" }}>
          Apa yang dapat dilakukan SimKos untuk kos Anda.
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "48px 40px", marginTop: 56 }} className="cap-grid">
          {items.map((item, i) => (
            <div key={i}>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: "var(--dark-card)", border: "1px solid var(--dark-border)",
                display: "grid", placeItems: "center",
                color: "var(--dark-muted)", marginBottom: 16,
              }}>
                <Icon name={item.icon} size={22} stroke={1.4}/>
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 600, color: "var(--dark-text)", margin: 0, marginBottom: 6 }}>{item.title}</h3>
              <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--dark-muted)", margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 860px) { .cap-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 540px) { .cap-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
};

/* ——— STEPS ——— */
const StepsSection = () => {
  const steps = [
    { n: "01", title: "Hubungi pengelola", desc: "Pilih kamar yang sesuai, lalu hubungi pengelola melalui WhatsApp atau datang langsung untuk melihat unit." },
    { n: "02", title: "Sepakati dan booking", desc: "Setelah sepakat dengan kamar dan harga, pengelola mendaftarkan Anda ke sistem dan mengirimkan akses login." },
    { n: "03", title: "Akses dashboard penyewa", desc: "Masuk ke SimKos untuk melihat tagihan bulan berjalan, riwayat pembayaran, dan informasi kontrak Anda." },
    { n: "04", title: "Bayar dan konfirmasi", desc: "Transfer sesuai tagihan, unggah bukti pembayaran. Admin memverifikasi dan status berubah otomatis." },
  ];
  return (
    <section id="cara" style={{ scrollMarginTop: 80, background: "var(--dark-bg)", padding: "0 24px 80px", borderTop: "1px solid var(--dark-border)" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--teal-500)", margin: 0 }}>Cara kerja</p>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 38px)", lineHeight: 1.15, letterSpacing: "-0.025em", fontWeight: 500, color: "var(--dark-text)", margin: 0, marginTop: 8 }}>
          Empat langkah untuk mulai.
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginTop: 40 }} className="steps-grid">
          {steps.map(s => (
            <div key={s.n} style={{ padding: "20px 22px", borderRadius: 16, background: "var(--dark-card)", border: "1px solid var(--dark-border)" }}>
              <span className="num" style={{ fontSize: 13, fontWeight: 600, color: "var(--teal-500)", letterSpacing: "0.04em" }}>{s.n}</span>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--dark-text)", margin: "10px 0 6px" }}>{s.title}</h3>
              <p style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--dark-muted)", margin: 0 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 860px) { .steps-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 540px) { .steps-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
};

/* ——— CONTACT CTA ——— */
const ContactSection = ({ onNav }) => (
  <section id="kontak" style={{ scrollMarginTop: 80, background: "var(--dark-bg)", padding: "0 24px 80px" }}>
    <div style={{ maxWidth: 1120, margin: "0 auto" }}>
      <div style={{ padding: "40px 44px", borderRadius: 22, background: "var(--dark-card)", border: "1px solid var(--dark-border)", display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 40, alignItems: "center" }} className="contact-grid">
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--teal-500)", margin: 0 }}>Kontak</p>
          <h2 style={{ fontSize: "clamp(24px, 3vw, 32px)", lineHeight: 1.15, letterSpacing: "-0.02em", fontWeight: 500, color: "var(--dark-text)", margin: "8px 0 12px" }}>
            Tertarik? Hubungi kami langsung.
          </h2>
          <p style={{ fontSize: 15, color: "var(--dark-muted)", margin: 0, maxWidth: "44ch", lineHeight: 1.6 }}>
            Tanpa perantara, tanpa biaya tambahan. Anda berkomunikasi langsung dengan pengelola kos.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 24 }}>
            <a href="https://wa.me/" className="btn btn-primary btn-lg" style={{ background: "var(--teal-500)", boxShadow: "0 6px 24px -8px rgba(32,128,141,0.40), inset 0 1px 0 rgba(255,255,255,0.15)" }}>
              <Icon name="logo-wa" size={16}/> Chat WhatsApp
            </a>
            <a href="tel:" className="btn btn-lg" style={{ background: "transparent", border: "1px solid var(--dark-border)", color: "var(--dark-text)" }}>
              <Icon name="phone" size={16}/> 0812-3456-7890
            </a>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { icon: "map-pin", t: "Lokasi", d: "Jl. Mawar No. 12, Yogyakarta" },
            { icon: "wifi",    t: "Internet", d: "WiFi 100 Mbps, 24 jam" },
            { icon: "shield",  t: "Keamanan", d: "CCTV & akses kartu" },
            { icon: "wallet",  t: "Pembayaran", d: "Transfer bank, verifikasi < 24 jam" },
          ].map((x, i) => (
            <div key={i} style={{ padding: 14, borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid var(--dark-border)" }}>
              <div style={{ color: "var(--teal-500)", marginBottom: 6 }}><Icon name={x.icon} size={18}/></div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--dark-text)" }}>{x.t}</div>
              <div style={{ fontSize: 12.5, color: "var(--dark-muted)", marginTop: 2 }}>{x.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
    <style>{`@media (max-width: 800px) { .contact-grid { grid-template-columns: 1fr !important; padding: 24px 28px !important; } }`}</style>
  </section>
);

/* ——— HOME ASSEMBLY ——— */
const Home = ({ onNav, onContact }) => {
  const [filter, setFilter] = React.useState("semua");
  const [detailKamar, setDetailKamar] = React.useState(null);
  const available = SAMPLE_KAMAR.length;
  const startingPrice = Math.min(...SAMPLE_KAMAR.map(k => k.harga));

  React.useEffect(() => {
    if (window.__scrollTo) {
      const id = window.__scrollTo;
      window.__scrollTo = null;
      const el = document.getElementById(id);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }
  }, []);

  return (
    <>
      <div className="bg-radial" style={{ minHeight: "100vh" }}>
        <TopNav onNav={onNav}/>
        <Hero onNav={onNav} available={available} startingPrice={startingPrice}/>
        <KamarSection kamar={SAMPLE_KAMAR} onDetail={setDetailKamar} filter={filter} setFilter={setFilter}/>
      </div>
      {/* Dark sections */}
      <CapabilitiesSection/>
      <StepsSection/>
      <ContactSection onNav={onNav}/>
      <Footer onNav={onNav} dark/>

      {/* Detail modal */}
      {detailKamar && (
        <KamarDetail kamar={detailKamar} onClose={() => setDetailKamar(null)} onContact={(k) => { setDetailKamar(null); onContact(k); }}/>
      )}
    </>
  );
};

window.Home = Home;
