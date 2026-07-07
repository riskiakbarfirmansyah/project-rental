"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success && data.data.user.role === "ADMIN") {
        router.push("/admin");
        router.refresh();
      } else if (data.success) {
        setError("Akses dibatasi. Halaman ini khusus untuk administrator.");
      } else {
        setError(data.error || "Email atau password salah.");
      }
    } catch {
      setError("Terjadi masalah koneksi. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      background: "#fff"
    }}>
      
      {/* ── SEBELAH KIRI (Visual & Branding - 55%) ── */}
      <div className="login-visual-panel" style={{
        flex: "1.2",
        background: "#030712",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "3.5rem",
        overflow: "hidden"
      }}>
        {/* Glow Effects */}
        <div style={{
          position: "absolute", width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(26,86,219,0.15) 0%, transparent 70%)",
          top: "-10%", left: "-10%", pointerEvents: "none"
        }} />
        <div style={{
          position: "absolute", width: 450, height: 450, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)",
          bottom: "-5%", right: "-5%", pointerEvents: "none"
        }} />

        {/* Top: Brand Logo */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <a href="/" style={{ display: "inline-block", textDecoration: "none" }}>
            <Image
              src="/images/logo-no-bg.png"
              alt="Logo"
              width={110}
              height={38}
              priority
              style={{ width: 110, height: "auto", filter: "brightness(0) invert(1)" }}
            />
          </a>
        </div>

        {/* Middle: Brand Tagline / Info */}
        <div style={{ position: "relative", zIndex: 2, maxWidth: 480, margin: "auto 0" }}>
          <span style={{
            display: "inline-block", padding: "0.375rem 0.875rem",
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "var(--radius-full)", color: "rgba(255,255,255,0.75)",
            fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.05em",
            textTransform: "uppercase", marginBottom: "1.5rem"
          }}>
            🔐 Portal Administrasi
          </span>
          <h2 style={{
            color: "white", fontSize: "clamp(2rem, 3.5vw, 2.75rem)",
            fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.03em",
            marginBottom: "1rem"
          }}>
            Pantau & Kelola<br />
            Layanan Rental Mobil<br />
            Anda Lebih Mudah.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.9375rem", lineHeight: 1.6, marginBottom: "2rem" }}>
            Pantau status armada, kelola pemesanan lepas kunci atau dengan supir, dan edit konten landing page secara instan dalam satu platform terpusat.
          </p>

          {/* Feature List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {[
              "Kelola status armada mobil & ketersediaan secara real-time",
              "Pantau detail order sewa masuk dari pelanggan",
              "Ubah data konfigurasi nomor WA, tagline, & kontak langsung",
            ].map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{
                  width: 20, height: 20, borderRadius: "50%", background: "rgba(26,86,219,0.2)",
                  color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.75rem", fontWeight: 700
                }}>✓</div>
                <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.875rem", fontWeight: 500 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Copy & Info */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.75rem" }}>
            © {new Date().getFullYear()} Bella Belly Trans Co. Hak Cipta Dilindungi.
          </p>
        </div>
      </div>

      {/* ── SEBELAH KANAN (Form Login - 45%) ── */}
      <div style={{
        flex: "1",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "3.5rem",
        background: "var(--surface)",
        minWidth: 420
      }}>
        
        {/* Top: Back to Website Link */}
        <div style={{ textAlign: "right" }}>
          <a href="/" style={{
            fontSize: "0.875rem", fontWeight: 700, color: "var(--text-secondary)",
            textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.375rem",
            transition: "var(--transition)"
          }}
          className="back-link-hover">
            <span>← Kembali ke Website</span>
          </a>
        </div>

        {/* Middle: Login Form Card */}
        <div style={{ maxWidth: 360, width: "100%", margin: "auto" }}>
          <div style={{ marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              Masuk Dashboard
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
              Silakan masukkan email dan password admin Anda.
            </p>
          </div>

          {/* Alert Error */}
          {error && (
            <div id="login-error" style={{
              padding: "0.875rem 1rem", marginBottom: "1.5rem",
              background: "#fee2e2", border: "1px solid #fecaca",
              borderRadius: "var(--radius-md)", color: "#b91c1c",
              fontSize: "0.8125rem", display: "flex", gap: "0.5rem", alignItems: "center",
              fontWeight: 600
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            
            {/* Email Input */}
            <div className="form-group">
              <label className="form-label" htmlFor="login-email" style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Email Admin
              </label>
              <input
                id="login-email"
                type="email"
                placeholder="admin@mail.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                style={{
                  width: "100%", padding: "0.875rem 1rem",
                  border: "1.5px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--text-primary)", fontSize: "0.9375rem",
                  outline: "none", fontFamily: "inherit",
                  transition: "var(--transition)"
                }}
                onFocus={(e) => { e.target.style.borderColor = "var(--primary)"; e.target.style.boxShadow = "0 0 0 3px rgba(26,86,219,0.08)"; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            {/* Password Input */}
            <div className="form-group">
              <label className="form-label" htmlFor="login-password" style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Password
              </label>
              <input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                style={{
                  width: "100%", padding: "0.875rem 1rem",
                  border: "1.5px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--text-primary)", fontSize: "0.9375rem",
                  outline: "none", fontFamily: "inherit",
                  transition: "var(--transition)"
                }}
                onFocus={(e) => { e.target.style.borderColor = "var(--primary)"; e.target.style.boxShadow = "0 0 0 3px rgba(26,86,219,0.08)"; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="login-submit"
              disabled={loading}
              style={{
                width: "100%", padding: "0.875rem",
                background: loading
                  ? "#9ca3af"
                  : "var(--text-primary)",
                border: "none", borderRadius: "var(--radius-md)",
                color: "white", fontFamily: "inherit",
                fontWeight: 700, fontSize: "0.9375rem",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "var(--transition)",
                display: "flex", alignItems: "center",
                justifyContent: "center", gap: "0.5rem",
                boxShadow: "0 4px 12px rgba(15,23,42,0.15)",
                marginTop: "0.5rem"
              }}
              onMouseEnter={(e) => { if(!loading) e.currentTarget.style.background = "#1e293b"; }}
              onMouseLeave={(e) => { if(!loading) e.currentTarget.style.background = "var(--text-primary)"; }}
            >
              {loading ? (
                <>
                  <span className="login-spinner" />
                  Memproses...
                </>
              ) : (
                "Masuk ke Dashboard"
              )}
            </button>
          </form>
        </div>

        {/* Bottom: Warning */}
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
            Akses portal ini dibatasi hanya untuk staf resmi Bella Belly Trans Co.
          </p>
        </div>
      </div>

      <style>{`
        .login-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          display: inline-block;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .back-link-hover:hover {
          color: var(--primary) !important;
        }
        @media (max-width: 900px) {
          .login-visual-panel {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
