/* App shell v2 — router + tweaks */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "background": "radial",
  "accentMode": "blue",
  "fontFamily": "geist",
  "cardStyle": "glass"
}/*EDITMODE-END*/;

const FONT_STACKS = {
  geist:     `"Geist", -apple-system, "Helvetica Neue", system-ui, sans-serif`,
  jakarta:   `"Plus Jakarta Sans", -apple-system, "Helvetica Neue", system-ui, sans-serif`,
  helvetica: `"Helvetica Neue", -apple-system, system-ui, sans-serif`,
  serif:     `"Instrument Serif", "Source Serif 4", Georgia, serif`,
};

function applyTweaks(t) {
  const root = document.documentElement;
  root.style.setProperty("--font-sans", FONT_STACKS[t.fontFamily] || FONT_STACKS.geist);
  if (t.accentMode === "blue") {
    root.style.setProperty("--blue-600", "#2563eb");
    root.style.setProperty("--blue-500", "#3b82f6");
    root.style.setProperty("--blue-400", "#60a5fa");
    root.style.setProperty("--teal-500", "#20808d");
  } else if (t.accentMode === "teal") {
    root.style.setProperty("--blue-600", "#0d9488");
    root.style.setProperty("--blue-500", "#14b8a6");
    root.style.setProperty("--blue-400", "#5eead4");
    root.style.setProperty("--teal-500", "#0d9488");
  } else if (t.accentMode === "indigo") {
    root.style.setProperty("--blue-600", "#4f46e5");
    root.style.setProperty("--blue-500", "#6366f1");
    root.style.setProperty("--blue-400", "#818cf8");
    root.style.setProperty("--teal-500", "#4f46e5");
  }
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = React.useState("home");
  const [toast, setToast] = React.useState(null);

  React.useEffect(() => { applyTweaks(t); }, [t.accentMode, t.fontFamily]);

  const onNav = (next, hash) => {
    if (hash) window.__scrollTo = hash;
    setRoute(next);
    if (!hash) window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onContact = (kamar) => {
    setToast(`Membuka WhatsApp untuk Kamar ${kamar.nomor}…`);
    setTimeout(() => setToast(null), 2400);
  };

  const onLogin = (email) => {
    setToast(`Berhasil masuk sebagai ${email} (demo)`);
    setTimeout(() => setToast(null), 2800);
  };

  // Background class for light sections
  const bgClass =
    t.background === "soft" ? "bg-radial-soft" :
    t.background === "mesh" ? "bg-radial-mesh" :
                              "bg-radial";

  // Card style override
  React.useEffect(() => {
    const id = "__card-style-override";
    let s = document.getElementById(id);
    if (!s) { s = document.createElement("style"); s.id = id; document.head.appendChild(s); }
    if (t.cardStyle === "solid") {
      s.textContent = `.card { background: white !important; backdrop-filter: none !important; }`;
    } else if (t.cardStyle === "outlined") {
      s.textContent = `.card { background: rgba(255,255,255,0.4) !important; backdrop-filter: blur(20px) !important; border: 1px solid rgba(11,13,26,0.16) !important; }`;
    } else {
      s.textContent = "";
    }
  }, [t.cardStyle]);

  let screen;
  switch (route) {
    case "login":    screen = <LoginScreen onNav={onNav} onLogin={onLogin}/>; break;
    case "register": screen = <RegisterScreen onNav={onNav}/>; break;
    case "forgot":   screen = <ForgotScreen onNav={onNav}/>; break;
    case "reset":    screen = <ResetScreen onNav={onNav}/>; break;
    case "verify":   screen = <VerifyScreen onNav={onNav}/>; break;
    case "confirm":  screen = <ConfirmScreen onNav={onNav}/>; break;
    default:         screen = <Home onNav={onNav} onContact={onContact}/>; break;
  }

  return (
    <div data-route={route} className={route === "home" ? "" : bgClass} style={{ minHeight: "100vh" }}>
      {screen}

      {/* Toast */}
      {toast && (
        <div role="status" className="fade-up" style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          padding: "12px 20px", borderRadius: 999,
          background: "var(--ink-900)", color: "white",
          fontSize: 14, boxShadow: "var(--shadow-4)", zIndex: 100,
        }}>{toast}</div>
      )}

      {/* Screen jumper */}
      <ScreenJumper route={route} onNav={onNav}/>

      {/* Tweaks */}
      <TweaksPanel title="Tweaks">
        <TweakSection title="Halaman">
          <TweakSelect label="Lompat ke" value={route} options={[
            {value:"home",label:"01 Beranda"},
            {value:"login",label:"02 Masuk"},
            {value:"register",label:"03 Daftar"},
            {value:"forgot",label:"04 Lupa password"},
            {value:"reset",label:"05 Reset password"},
            {value:"verify",label:"06 Verifikasi email"},
            {value:"confirm",label:"07 Konfirmasi password"},
          ]} onChange={(v) => onNav(v)}/>
        </TweakSection>
        <TweakSection title="Tampilan">
          <TweakRadio label="Background" value={t.background} options={[
            { value: "radial", label: "Radial" },
            { value: "soft",   label: "Soft" },
            { value: "mesh",   label: "Mesh" },
          ]} onChange={(v) => setTweak("background", v)}/>
          <TweakRadio label="Aksen" value={t.accentMode} options={[
            { value: "blue",   label: "Blue" },
            { value: "teal",   label: "Teal" },
            { value: "indigo", label: "Indigo" },
          ]} onChange={(v) => setTweak("accentMode", v)}/>
          <TweakRadio label="Card" value={t.cardStyle} options={[
            { value: "glass",    label: "Glass" },
            { value: "solid",    label: "Solid" },
            { value: "outlined", label: "Outlined" },
          ]} onChange={(v) => setTweak("cardStyle", v)}/>
        </TweakSection>
        <TweakSection title="Tipografi">
          <TweakSelect label="Font" value={t.fontFamily} options={[
            {value:"geist",label:"Geist (default)"},
            {value:"jakarta",label:"Plus Jakarta Sans"},
            {value:"helvetica",label:"Helvetica Neue"},
            {value:"serif",label:"Instrument Serif"},
          ]} onChange={(v) => setTweak("fontFamily", v)}/>
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

const ScreenJumper = ({ route, onNav }) => {
  const screens = [
    { k: "home", label: "Beranda" },
    { k: "login", label: "Masuk" },
    { k: "register", label: "Daftar" },
    { k: "forgot", label: "Lupa" },
    { k: "reset", label: "Reset" },
    { k: "verify", label: "Verifikasi" },
    { k: "confirm", label: "Konfirmasi" },
  ];
  return (
    <div style={{
      position: "fixed", left: 16, bottom: 16, zIndex: 60,
      display: "flex", gap: 5, flexWrap: "wrap",
      padding: 5, background: "rgba(255,255,255,0.7)",
      backdropFilter: "blur(14px)",
      border: "1px solid rgba(11,13,26,0.08)",
      borderRadius: 999, boxShadow: "var(--shadow-1)",
      maxWidth: "calc(100vw - 280px)",
    }}>
      {screens.map(s => (
        <button key={s.k} onClick={() => onNav(s.k)} style={{
          padding: "5px 11px", border: 0, borderRadius: 999,
          fontSize: 12, fontWeight: 500, cursor: "pointer",
          background: route === s.k ? "var(--ink-900)" : "transparent",
          color: route === s.k ? "white" : "var(--ink-700)",
          transition: "all 180ms var(--ease)",
        }}>{s.label}</button>
      ))}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
