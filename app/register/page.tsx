"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) { router.push("/profile"); router.refresh(); }
      else setError(data.error || "Registrasi gagal");
    } catch { setError("Terjadi kesalahan jaringan"); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--gradient-hero)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: 460 }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <Link href="/" style={{ fontFamily: "Sora, sans-serif", fontSize: "1.75rem", fontWeight: 800, color: "white", textDecoration: "none" }}>
            🚗 RentalKu
          </Link>
        </div>

        <div style={{ background: "white", borderRadius: "var(--radius-2xl)", padding: "2.5rem", boxShadow: "var(--shadow-xl)" }}>
          <h2 style={{ marginBottom: "0.5rem" }}>Buat Akun Baru</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", fontSize: "0.9375rem" }}>
            Sudah punya akun?{" "}
            <Link href="/login" style={{ color: "var(--primary)", fontWeight: 600 }} id="register-login-link">Masuk</Link>
          </p>

          {error && <div className="alert alert-error" style={{ marginBottom: "1.25rem" }} id="register-error">❌ {error}</div>}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div className="form-group">
              <label className="form-label" htmlFor="register-name">Nama Lengkap *</label>
              <input id="register-name" type="text" className="form-control" placeholder="John Doe"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required minLength={2} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="register-email">Email *</label>
              <input id="register-email" type="email" className="form-control" placeholder="email@contoh.com"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="register-phone">No. HP</label>
              <input id="register-phone" type="tel" className="form-control" placeholder="08123456789"
                value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="register-password">Password *</label>
              <input id="register-password" type="password" className="form-control" placeholder="Minimal 6 karakter"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} id="register-submit"
              style={{ width: "100%", justifyContent: "center", padding: "0.875rem" }}>
              {loading ? "Mendaftar..." : "Buat Akun →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
