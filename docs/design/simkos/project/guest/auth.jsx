/* Auth screens — login / register / forgot / reset / verify / confirm */

const SocialDivider = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "8px 0 4px" }}>
    <div style={{ flex: 1, height: 1, background: "rgba(11,13,26,0.08)" }}/>
    <span style={{ fontSize: 12, color: "var(--ink-400)" }}>atau</span>
    <div style={{ flex: 1, height: 1, background: "rgba(11,13,26,0.08)" }}/>
  </div>
);

const LoginScreen = ({ onNav, onLogin }) => {
  const [email, setEmail] = React.useState("");
  const [pass, setPass] = React.useState("");
  const [remember, setRemember] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const submit = (e) => {
    e.preventDefault();
    setError(null);
    if (!email || !pass) { setError("Email dan password wajib diisi."); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (pass.length < 4) { setError("Email atau password tidak cocok."); return; }
      onLogin && onLogin(email);
    }, 900);
  };

  return (
    <AuthShell onNav={onNav} kicker="Selamat datang" title="Masuk ke SimKos" narrow>
      <p style={{ margin: 0, marginBottom: 22, color: "var(--ink-500)", fontSize: 15 }}>
        Gunakan akun yang sudah didaftarkan oleh admin kos.
      </p>

      {error && (
        <div role="alert" style={{
          padding: 12, marginBottom: 14, borderRadius: 12,
          background: "rgba(210,68,50,0.06)", border: "1px solid rgba(210,68,50,0.18)",
          color: "var(--danger)", fontSize: 13.5,
        }}>
          {error}
        </div>
      )}

      <form onSubmit={submit} noValidate style={{ display: "grid", gap: 14 }}>
        <Field label="Email" htmlFor="email">
          <Input id="email" type="email" icon="mail" placeholder="nama@email.com"
            value={email} onChange={(e) => setEmail(e.target.value)}
            autoComplete="username" autoFocus inputMode="email"
          />
        </Field>

        <Field
          label={
            <span style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
              <span>Password</span>
              <button type="button" onClick={() => onNav("forgot")} className="btn-link"
                style={{ background: "none", border: 0, padding: 0, fontSize: 13, color: "var(--blue-600)", cursor: "pointer" }}>
                Lupa password?
              </button>
            </span>
          }
          htmlFor="password"
        >
          <PasswordInput id="password" placeholder="Minimal 8 karakter" value={pass}
            onChange={(e) => setPass(e.target.value)} autoComplete="current-password"/>
        </Field>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2 }}>
          <Checkbox id="remember" checked={remember} onChange={(e) => setRemember(e.target.checked)}>
            Ingat saya di perangkat ini
          </Checkbox>
        </div>

        <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: 8 }} disabled={loading}>
          {loading ? <span className="spinner" aria-hidden="true"/> : <Icon name="arrow-right" size={16}/>}
          {loading ? "Memeriksa…" : "Masuk"}
        </button>
      </form>

      <p style={{ margin: 0, marginTop: 22, fontSize: 13.5, color: "var(--ink-500)", textAlign: "center" }}>
        Belum punya akun? <button type="button" onClick={() => onNav("register")} style={{ background: "none", border: 0, color: "var(--blue-600)", cursor: "pointer", fontWeight: 500 }}>Daftar sebagai penyewa</button>
      </p>

      <p style={{ margin: 0, marginTop: 8, fontSize: 12, color: "var(--ink-400)", textAlign: "center" }}>
        Atau hubungi pemilik kos untuk didaftarkan langsung.
      </p>

      <style>{`
        .spinner { width: 16px; height: 16px; border-radius: 999px; border: 2px solid rgba(255,255,255,.35); border-top-color: white; animation: spin 700ms linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </AuthShell>
  );
};

const RegisterScreen = ({ onNav }) => {
  const [form, setForm] = React.useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const strength = (() => {
    const p = form.password;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();
  const strengthLabel = ["Lemah", "Cukup", "Baik", "Kuat"][Math.max(0, strength - 1)] || "—";
  const strengthTone = strength >= 3 ? "var(--success)" : strength === 2 ? "var(--warning)" : "var(--danger)";

  const submit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSubmitted(true); }, 900);
  };

  if (submitted) {
    return (
      <AuthShell onNav={onNav} kicker="Pendaftaran" title="Cek email kamu" narrow>
        <p style={{ marginTop: 8, marginBottom: 22, color: "var(--ink-500)", fontSize: 15 }}>
          Kami sudah mengirim link verifikasi ke <strong style={{ color: "var(--ink-900)" }}>{form.email}</strong>. Klik linknya untuk mengaktifkan akun.
        </p>
        <button className="btn btn-primary btn-lg" style={{ width: "100%" }} onClick={() => onNav("verify")}>
          Lihat halaman verifikasi
        </button>
        <button className="btn btn-link" style={{ marginTop: 14, width: "100%" }} onClick={() => onNav("login")}>
          ← Kembali ke masuk
        </button>
      </AuthShell>
    );
  }

  return (
    <AuthShell onNav={onNav} kicker="Penyewa baru" title="Daftarkan akun kamu">
      <p style={{ margin: 0, marginBottom: 22, color: "var(--ink-500)", fontSize: 15 }}>
        Setelah daftar, admin akan menautkan akunmu ke kamar yang sudah disepakati.
      </p>

      <form onSubmit={submit} noValidate style={{ display: "grid", gap: 14 }}>
        <Field label="Nama lengkap" htmlFor="name">
          <Input id="name" icon="user" placeholder="Sesuai KTP" value={form.name} onChange={set("name")} autoFocus required/>
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="reg-row">
          <Field label="Email" htmlFor="email">
            <Input id="email" type="email" icon="mail" placeholder="nama@email.com" value={form.email} onChange={set("email")} required autoComplete="email"/>
          </Field>
          <Field label="No. WhatsApp" htmlFor="phone" helper="Untuk pengingat tagihan.">
            <Input id="phone" type="tel" icon="phone" placeholder="0812-3456-7890" value={form.phone} onChange={set("phone")} required autoComplete="tel" inputMode="tel"/>
          </Field>
        </div>

        <Field label="Password" htmlFor="password" helper="Minimal 8 karakter, kombinasi huruf & angka.">
          <PasswordInput id="password" placeholder="Buat password baru" value={form.password} onChange={set("password")} autoComplete="new-password"/>
        </Field>

        {form.password && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: -6 }}>
            <div style={{ flex: 1, display: "flex", gap: 4 }}>
              {[0,1,2,3].map(i => (
                <div key={i} style={{
                  flex: 1, height: 4, borderRadius: 999,
                  background: i < strength ? strengthTone : "rgba(11,13,26,0.08)",
                  transition: "background 240ms var(--ease)",
                }}/>
              ))}
            </div>
            <span style={{ fontSize: 12, color: strengthTone, fontWeight: 500, minWidth: 50, textAlign: "right" }}>{strengthLabel}</span>
          </div>
        )}

        <Field label="Ulangi password" htmlFor="confirm"
          error={form.confirm && form.confirm !== form.password ? "Password tidak sama." : null}>
          <PasswordInput id="confirm" placeholder="Ketik ulang password" value={form.confirm} onChange={set("confirm")}/>
        </Field>

        <p style={{ fontSize: 12.5, color: "var(--ink-500)", margin: 0, marginTop: 4 }}>
          Dengan mendaftar, kamu setuju dengan <a href="#" style={{ color: "var(--blue-600)" }}>syarat penyewa</a> dan <a href="#" style={{ color: "var(--blue-600)" }}>kebijakan privasi</a> SimKos.
        </p>

        <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: 8 }} disabled={loading}>
          {loading ? <span className="spinner"/> : <Icon name="check" size={16}/>}
          {loading ? "Mendaftarkan…" : "Buat akun"}
        </button>
      </form>

      <p style={{ margin: 0, marginTop: 18, fontSize: 13.5, color: "var(--ink-500)", textAlign: "center" }}>
        Sudah punya akun? <button type="button" onClick={() => onNav("login")} style={{ background: "none", border: 0, color: "var(--blue-600)", cursor: "pointer", fontWeight: 500 }}>Masuk</button>
      </p>

      <style>{`@media (max-width: 540px) { .reg-row { grid-template-columns: 1fr !important; } }`}</style>
    </AuthShell>
  );
};

const ForgotScreen = ({ onNav }) => {
  const [email, setEmail] = React.useState("");
  const [sent, setSent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const submit = (e) => {
    e.preventDefault(); setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 900);
  };
  return (
    <AuthShell onNav={onNav} kicker="Reset password" title={sent ? "Link sudah dikirim" : "Lupa password?"} narrow>
      {sent ? (
        <>
          <p style={{ margin: 0, marginBottom: 22, color: "var(--ink-500)", fontSize: 15 }}>
            Cek inbox <strong style={{ color: "var(--ink-900)" }}>{email}</strong> dan klik link reset password. Link berlaku 60 menit.
          </p>
          <button className="btn btn-ghost btn-lg" style={{ width: "100%" }} onClick={() => setSent(false)}>
            Kirim ulang ke email lain
          </button>
          <button className="btn btn-link" style={{ marginTop: 14, width: "100%" }} onClick={() => onNav("login")}>
            ← Kembali ke masuk
          </button>
        </>
      ) : (
        <>
          <p style={{ margin: 0, marginBottom: 22, color: "var(--ink-500)", fontSize: 15 }}>
            Masukkan email yang terdaftar. Kami kirim link untuk membuat password baru.
          </p>
          <form onSubmit={submit} noValidate style={{ display: "grid", gap: 14 }}>
            <Field label="Email" htmlFor="email">
              <Input id="email" type="email" icon="mail" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus/>
            </Field>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%" }} disabled={loading || !email}>
              {loading ? <span className="spinner"/> : <Icon name="mail" size={16}/>}
              {loading ? "Mengirim…" : "Kirim link reset"}
            </button>
          </form>
          <button className="btn btn-link" style={{ marginTop: 14, width: "100%" }} onClick={() => onNav("login")}>
            ← Kembali ke masuk
          </button>
        </>
      )}
    </AuthShell>
  );
};

const ResetScreen = ({ onNav }) => {
  const [pass, setPass] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const submit = (e) => {
    e.preventDefault();
    if (pass !== confirm || pass.length < 8) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setDone(true); }, 900);
  };
  if (done) return (
    <AuthShell onNav={onNav} kicker="Berhasil" title="Password baru tersimpan" narrow>
      <p style={{ margin: 0, marginBottom: 22, color: "var(--ink-500)", fontSize: 15 }}>
        Sekarang kamu bisa masuk dengan password baru.
      </p>
      <button className="btn btn-primary btn-lg" style={{ width: "100%" }} onClick={() => onNav("login")}>
        Masuk sekarang <Icon name="arrow-right" size={16}/>
      </button>
    </AuthShell>
  );
  return (
    <AuthShell onNav={onNav} kicker="Reset password" title="Buat password baru" narrow>
      <p style={{ margin: 0, marginBottom: 22, color: "var(--ink-500)", fontSize: 15 }}>
        Untuk akun <strong style={{ color: "var(--ink-900)" }}>kamu@email.com</strong>. Pakai sesuatu yang kamu ingat.
      </p>
      <form onSubmit={submit} noValidate style={{ display: "grid", gap: 14 }}>
        <Field label="Password baru" htmlFor="pass" helper="Minimal 8 karakter.">
          <PasswordInput id="pass" placeholder="Password baru" value={pass} onChange={(e) => setPass(e.target.value)} autoFocus/>
        </Field>
        <Field label="Ulangi password baru" htmlFor="confirm"
          error={confirm && confirm !== pass ? "Password tidak sama." : null}>
          <PasswordInput id="confirm" placeholder="Ketik ulang" value={confirm} onChange={(e) => setConfirm(e.target.value)}/>
        </Field>
        <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%" }} disabled={loading || !pass || pass !== confirm || pass.length < 8}>
          {loading ? <span className="spinner"/> : <Icon name="check" size={16}/>}
          {loading ? "Menyimpan…" : "Simpan password baru"}
        </button>
      </form>
    </AuthShell>
  );
};

const VerifyScreen = ({ onNav }) => {
  const [resent, setResent] = React.useState(false);
  return (
    <AuthShell onNav={onNav} kicker="Verifikasi" title="Cek email kamu sekarang" narrow>
      <div style={{
        margin: "4px 0 22px", padding: 18, borderRadius: 14,
        background: "var(--blue-100)", border: "1px solid rgba(59,130,246,0.18)",
        display: "flex", gap: 14, alignItems: "flex-start",
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: "white", color: "var(--blue-600)",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <Icon name="mail" size={18}/>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-900)" }}>Link verifikasi sudah dikirim</div>
          <div style={{ fontSize: 13, color: "var(--ink-700)", marginTop: 2 }}>
            Buka inbox kamu dan klik link verifikasi. Link berlaku 24 jam.
          </div>
        </div>
      </div>

      {resent && (
        <div role="status" style={{
          marginBottom: 14, padding: 10, borderRadius: 10,
          background: "rgba(31,143,91,0.10)", color: "var(--success)", fontSize: 13,
        }}>
          ✓ Link baru sudah dikirim ulang ke email kamu.
        </div>
      )}

      <button className="btn btn-primary btn-lg" style={{ width: "100%" }} onClick={() => setResent(true)}>
        Kirim ulang link verifikasi
      </button>
      <button className="btn btn-link" style={{ marginTop: 14, width: "100%" }} onClick={() => onNav("home")}>
        Keluar dan kembali ke beranda
      </button>
    </AuthShell>
  );
};

const ConfirmScreen = ({ onNav }) => {
  const [pass, setPass] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const submit = (e) => {
    e.preventDefault(); setLoading(true);
    setTimeout(() => setLoading(false), 700);
  };
  return (
    <AuthShell onNav={onNav} kicker="Area sensitif" title="Konfirmasi password" narrow>
      <div style={{
        margin: "4px 0 22px", padding: 14, borderRadius: 12,
        background: "rgba(200,158,42,0.08)", border: "1px solid rgba(200,158,42,0.20)",
        color: "#7a5e08", fontSize: 13.5, display: "flex", gap: 10, alignItems: "flex-start",
      }}>
        <Icon name="shield" size={18}/>
        <span>Halaman ini butuh konfirmasi tambahan. Masukkan password kamu untuk lanjut.</span>
      </div>
      <form onSubmit={submit} noValidate style={{ display: "grid", gap: 14 }}>
        <Field label="Password" htmlFor="pw">
          <PasswordInput id="pw" placeholder="Password kamu" value={pass} onChange={(e) => setPass(e.target.value)} autoFocus/>
        </Field>
        <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%" }} disabled={loading || !pass}>
          {loading ? <span className="spinner"/> : <Icon name="check" size={16}/>}
          {loading ? "Mengonfirmasi…" : "Konfirmasi"}
        </button>
      </form>
    </AuthShell>
  );
};

Object.assign(window, { LoginScreen, RegisterScreen, ForgotScreen, ResetScreen, VerifyScreen, ConfirmScreen });
