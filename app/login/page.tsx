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
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Sora, sans-serif",
      background: "#fafafa",
      padding: "1.5rem"
    }}>
      <div style={{
        maxWidth: "400px",
        width: "100%",
        background: "#ffffff",
        border: "1px solid #e5e5e5",
        borderRadius: "12px",
        padding: "2.5rem 2rem",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.03)"
      }}>
        {/* Logo */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem" }}>
          <a href="/">
            <Image
              src="/images/logo-no-bg.png"
              alt="Logo"
              width={140}
              height={48}
              priority
              style={{ width: 140, height: "auto" }}
            />
          </a>
        </div>

        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111111", letterSpacing: "-0.03em", margin: 0 }}>
            Login Admin
          </h1>
          <p style={{ color: "#666666", fontSize: "0.875rem", marginTop: "0.5rem", margin: "0.5rem 0 0 0" }}>
            Silakan masuk untuk mengelola sistem rental.
          </p>
        </div>

        {/* Alert Error */}
        {error && (
          <div id="login-error" style={{
            padding: "0.75rem 1rem",
            marginBottom: "1.5rem",
            background: "#fee2e2",
            border: "1px solid #fecaca",
            borderRadius: "6px",
            color: "#b91c1c",
            fontSize: "0.8125rem",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            <label htmlFor="login-email" style={{ fontSize: "0.75rem", fontWeight: 700, color: "#111111", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Email
            </label>
            <input
              id="login-email"
              type="email"
              placeholder="admin@rentalku.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                border: "1px solid #e5e5e5",
                borderRadius: "6px",
                color: "#111111",
                fontSize: "0.875rem",
                outline: "none",
                transition: "border-color 0.2s ease"
              }}
              onFocus={(e) => e.target.style.borderColor = "#111111"}
              onBlur={(e) => e.target.style.borderColor = "#e5e5e5"}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            <label htmlFor="login-password" style={{ fontSize: "0.75rem", fontWeight: 700, color: "#111111", textTransform: "uppercase", letterSpacing: "0.05em" }}>
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
                width: "100%",
                padding: "0.75rem 1rem",
                border: "1px solid #e5e5e5",
                borderRadius: "6px",
                color: "#111111",
                fontSize: "0.875rem",
                outline: "none",
                transition: "border-color 0.2s ease"
              }}
              onFocus={(e) => e.target.style.borderColor = "#111111"}
              onBlur={(e) => e.target.style.borderColor = "#e5e5e5"}
            />
          </div>

          <button
            type="submit"
            id="login-submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.75rem",
              background: loading ? "#9ca3af" : "#111111",
              border: "none",
              borderRadius: "6px",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "0.875rem",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.2s ease",
              marginTop: "0.5rem"
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#222222"; }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "#111111"; }}
          >
            {loading ? "Memproses..." : "Masuk Dashboard"}
          </button>
        </form>

        {/* Back Link */}
        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <a href="/" style={{
            fontSize: "0.8125rem",
            fontWeight: 600,
            color: "#666666",
            textDecoration: "none",
            transition: "color 0.2s ease"
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = "#111111"}
          onMouseLeave={(e) => e.currentTarget.style.color = "#666666"}
          >
            ← Kembali ke Beranda
          </a>
        </div>
      </div>
    </div>
  );
}
