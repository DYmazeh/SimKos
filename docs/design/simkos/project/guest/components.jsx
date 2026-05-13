/* Shared UI primitives — SimKos guest v2 */

const Icon = ({ name, size = 18, stroke = 1.6, className = "" }) => {
  const props = {
    width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: stroke,
    strokeLinecap: "round", strokeLinejoin: "round",
    className, "aria-hidden": "true",
  };
  switch (name) {
    case "arrow-right": return <svg {...props}><path d="M5 12h14M13 5l7 7-7 7"/></svg>;
    case "arrow-left":  return <svg {...props}><path d="M19 12H5M11 19l-7-7 7-7"/></svg>;
    case "chevron-down":return <svg {...props}><path d="M6 9l6 6 6-6"/></svg>;
    case "check":       return <svg {...props}><path d="M5 12l5 5L20 7"/></svg>;
    case "x":           return <svg {...props}><path d="M18 6L6 18M6 6l12 12"/></svg>;
    case "lock":        return <svg {...props}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>;
    case "mail":        return <svg {...props}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>;
    case "user":        return <svg {...props}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>;
    case "phone":       return <svg {...props}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7a2 2 0 0 1 1.72 2.03z"/></svg>;
    case "eye":         return <svg {...props}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>;
    case "eye-off":     return <svg {...props}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-6.5 0-10-7-10-7a18.45 18.45 0 0 1 4.06-5.06M9.9 5.08A9.94 9.94 0 0 1 12 5c6.5 0 10 7 10 7a18.6 18.6 0 0 1-2.16 3.19M1 1l22 22M14.12 14.12A3 3 0 1 1 9.88 9.88"/></svg>;
    case "shield":      return <svg {...props}><path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z"/><path d="M9 12l2 2 4-4"/></svg>;
    case "bed":         return <svg {...props}><path d="M3 18V8M21 18v-5a3 3 0 0 0-3-3H3M3 14h18M3 18h18"/><circle cx="7.5" cy="11.5" r="1.5"/></svg>;
    case "wallet":      return <svg {...props}><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M16 14h2"/></svg>;
    case "receipt":     return <svg {...props}><path d="M6 2h12v20l-3-2-3 2-3-2-3 2V2z"/><path d="M9 7h6M9 11h6M9 15h4"/></svg>;
    case "map-pin":     return <svg {...props}><path d="M12 22s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>;
    case "wifi":        return <svg {...props}><path d="M5 12.55a11 11 0 0 1 14 0M2 8.82a16 16 0 0 1 20 0M8.5 16.43a6 6 0 0 1 7 0"/><circle cx="12" cy="20" r="0.5" fill="currentColor"/></svg>;
    case "calendar":    return <svg {...props}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>;
    case "clock":       return <svg {...props}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>;
    case "upload":      return <svg {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>;
    case "home":        return <svg {...props}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>;
    case "logo-wa":     return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}><path d="M17.5 14.4c-.3-.1-1.7-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-1 1.2-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.4.1-.6l.5-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-1-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.1-1.4-.1-.1-.3-.2-.5-.3M12 22h0a10 10 0 0 1-5-1.4L2 22l1.4-5A10 10 0 0 1 22 12c0 5.5-4.5 10-10 10m8.4-18.4A11.8 11.8 0 0 0 .2 17.4L0 24l6.7-1.8a12 12 0 0 0 5.4 1.4h0a12 12 0 0 0 8.3-20.4"/></svg>;
    default: return null;
  }
};

const Brand = ({ size = 28, light = false }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
    <span className="brand-mark" style={{ width: size, height: size }} aria-hidden="true"></span>
    <span style={{ fontSize: 19, fontWeight: 600, letterSpacing: "-0.02em", color: light ? "#f5f3ed" : "var(--ink-900)" }}>SimKos</span>
  </span>
);

const Pill = ({ tone = "neutral", children, dot, className = "" }) => (
  <span className={`pill pill-${tone} ${className}`}>
    {dot && <span style={{
      width: 6, height: 6, borderRadius: 999,
      background: tone === "success" ? "var(--success)" : tone === "warning" ? "var(--warning)" : tone === "info" ? "var(--blue-500)" : "var(--ink-500)"
    }} className={dot === "pulse" ? "pulse-dot" : ""} aria-hidden="true"/>}
    {children}
  </span>
);

const Field = ({ label, htmlFor, helper, error, children }) => (
  <div className="field">
    <label className="label" htmlFor={htmlFor}>{label}</label>
    {children}
    {error ? <p className="error" role="alert">{error}</p> : helper ? <p className="helper">{helper}</p> : null}
  </div>
);

const Input = React.forwardRef(({ icon, suffix, ...props }, ref) => {
  if (!icon && !suffix) return <input ref={ref} className="input" {...props} />;
  return (
    <div style={{ position: "relative" }}>
      {icon && <span style={{ position: "absolute", left: 14, top: 13, color: "var(--ink-400)" }} aria-hidden="true"><Icon name={icon} size={18}/></span>}
      <input ref={ref} className="input" style={{ paddingLeft: icon ? 42 : undefined, paddingRight: suffix ? 44 : undefined }} {...props}/>
      {suffix && <span style={{ position: "absolute", right: 6, top: 5 }}>{suffix}</span>}
    </div>
  );
});

const PasswordInput = (props) => {
  const [show, setShow] = React.useState(false);
  return (
    <Input {...props} type={show ? "text" : "password"} icon="lock"
      suffix={
        <button type="button" onClick={() => setShow(s => !s)}
          aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
          style={{ background: "transparent", border: 0, color: "var(--ink-400)", padding: "8px 10px", borderRadius: 8, cursor: "pointer" }}>
          <Icon name={show ? "eye-off" : "eye"} size={18}/>
        </button>
      }
    />
  );
};

const Checkbox = ({ id, checked, onChange, children }) => (
  <label htmlFor={id} style={{ display: "inline-flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none" }}>
    <span style={{
      width: 18, height: 18, borderRadius: 5,
      border: `1.5px solid ${checked ? "var(--blue-600)" : "rgba(11,13,26,0.18)"}`,
      background: checked ? "var(--blue-600)" : "white",
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      transition: "all 180ms var(--ease)",
    }}>
      {checked && <Icon name="check" size={12} stroke={3}/>}
    </span>
    <input id={id} type="checkbox" checked={checked} onChange={onChange} style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 0, height: 0 }}/>
    <span style={{ fontSize: 14, color: "var(--ink-700)" }}>{children}</span>
  </label>
);

/* Top nav */
const TopNav = ({ onNav }) => (
  <header className="nav-scrim" style={{ position: "sticky", top: 0, zIndex: 30 }}>
    <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px" }}>
      <button onClick={() => onNav("home")} style={{ background: "none", border: 0, padding: 0 }} aria-label="SimKos beranda">
        <Brand/>
      </button>
      <nav aria-label="Navigasi utama" style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <a href="#kamar" onClick={(e) => { e.preventDefault(); onNav("home", "kamar"); }} className="nav-a">Kamar</a>
        <a href="#tentang" onClick={(e) => { e.preventDefault(); onNav("home", "tentang"); }} className="nav-a">Tentang</a>
        <a href="#kontak" onClick={(e) => { e.preventDefault(); onNav("home", "kontak"); }} className="nav-a">Kontak</a>
        <button className="btn btn-ghost btn-sm" onClick={() => onNav("login")}>Masuk</button>
      </nav>
    </div>
    <style>{`
      .nav-a { color: var(--ink-500); font-size: 14.5px; padding: 6px 4px; border-radius: 6px; transition: color 180ms; }
      .nav-a:hover { color: var(--ink-900); }
      @media (max-width: 640px) { .nav-a { display: none; } }
    `}</style>
  </header>
);

/* Footer */
const Footer = ({ onNav, dark = false }) => (
  <footer style={{
    borderTop: dark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(11,13,26,0.08)",
    background: dark ? "var(--dark-bg)" : "rgba(255,255,255,0.5)",
    backdropFilter: dark ? "none" : "blur(10px)",
  }}>
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: "24px", display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, color: dark ? "var(--dark-muted)" : "var(--ink-500)", fontSize: 13 }}>
        <Brand size={22} light={dark}/>
        <span style={{ opacity: 0.5 }}>·</span>
        <span>© 2026 Sistem Informasi Manajemen Kos</span>
      </div>
      <div style={{ display: "flex", gap: 18, fontSize: 13, color: dark ? "var(--dark-muted)" : "var(--ink-500)" }}>
        <a href="#" onClick={(e) => { e.preventDefault(); onNav("login"); }}>Masuk Penyewa</a>
        <a href="#">Bantuan</a>
      </div>
    </div>
  </footer>
);

/* Auth page shell */
const AuthShell = ({ title, kicker, children, onNav, narrow = false }) => (
  <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }} className="bg-radial">
    <TopNav onNav={onNav}/>
    <main style={{ flex: 1, display: "grid", placeItems: "center", padding: "60px 24px" }}>
      <div className="card fade-up" style={{ width: "100%", maxWidth: narrow ? 420 : 480, padding: 36 }}>
        {kicker && (
          <p style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--blue-600)", margin: 0, marginBottom: 10 }}>
            {kicker}
          </p>
        )}
        <h1 className="h-1" style={{ margin: 0, marginBottom: 8 }}>{title}</h1>
        {children}
      </div>
    </main>
    <Footer onNav={onNav}/>
  </div>
);

Object.assign(window, {
  Icon, Brand, Pill, Field, Input, PasswordInput, Checkbox,
  TopNav, Footer, AuthShell,
});
