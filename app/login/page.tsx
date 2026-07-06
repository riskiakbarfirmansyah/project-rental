"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        if (data.data.user.role === "ADMIN") router.push("/admin");
        else router.push("/profile");
        router.refresh();
      } else setError(data.error || "Login gagal");
    } catch { setError("Terjadi kesalahan jaringan"); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--gradient-hero)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <Link href="/" style={{
            fontFamily: "Sora, sans-serif", fontSize: "1.75rem", fontWeight: 800, color: "white", textDecoration: "none"
          }}>
            🚗 RentalKu
          </Link>
        </div>

        <div style={{ background: "white", borderRadius: "var(--radius-2xl)", padding: "2.5rem", boxShadow: "var(--shadow-xl)" }}>
          <h2 style={{ marginBottom: "0.5rem" }}>Masuk ke Akun</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", fontSize: "0.9375rem" }}>
            Belum punya akun?{" "}
            <Link href="/register" style={{ color: "var(--primary)", fontWeight: 600 }} id="login-register-link">
              Daftar sekarang
            </Link>
          </p>

          {error && <div className="alert alert-error" style={{ marginBottom: "1.25rem" }} id="login-error">❌ {error}</div>}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email</label>
              <input id="login-email" type="email" className="form-control" placeholder="email@contoh.com"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <input id="login-password" type="password" className="form-control" placeholder="••••••••"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} id="login-submit"
              style={{ width: "100%", justifyContent: "center", padding: "0.875rem" }}>
              {loading ? "Memproses..." : "Masuk →"}
            </button>
          </form>

          <div style={{ marginTop: "1.5rem", padding: "1rem", background: "var(--surface-2)", borderRadius: "var(--radius-md)", fontSize: "0.875rem" }}>
            <p style={{ fontWeight: 600, marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Akun demo:</p>
            <p style={{ color: "var(--text-muted)" }}>Admin: admin@rentalku.com / admin123</p>
            <p style={{ color: "var(--text-muted)" }}>Customer: budi@example.com / customer123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
