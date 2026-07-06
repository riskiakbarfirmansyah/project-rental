"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) { setSuccess(true); setForm({ name: "", email: "", phone: "", subject: "", message: "" }); }
      else setError(data.error || "Gagal mengirim pesan");
    } catch { setError("Terjadi kesalahan jaringan"); }
    finally { setLoading(false); }
  };

  const contacts = [
    { icon: "📞", label: "Telepon", value: "+62 812-3456-7890", href: "tel:+6281234567890" },
    { icon: "✉️", label: "Email", value: "info@rentalku.com", href: "mailto:info@rentalku.com" },
    { icon: "📍", label: "Alamat", value: "Jl. Sudirman No. 1, Jakarta Pusat", href: "#" },
    { icon: "🕐", label: "Jam Operasional", value: "Senin - Minggu, 08:00 - 20:00 WIB", href: "#" },
  ];

  return (
    <>
      <Navbar />

      <section style={{ background: "var(--gradient-hero)", padding: "5rem 0 3rem" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <h1 style={{ color: "white", marginBottom: "1rem" }}>Hubungi Kami</h1>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1.125rem", maxWidth: 500, margin: "0 auto" }}>
            Kami siap membantu Anda. Kirim pesan atau hubungi langsung melalui kontak di bawah ini.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "3rem" }}>
            {/* Kontak info */}
            <div>
              <h3 style={{ marginBottom: "1.75rem" }}>Informasi Kontak</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {contacts.map((c) => (
                  <a key={c.label} href={c.href} id={`contact-info-${c.label.toLowerCase()}`} style={{
                    display: "flex", gap: "1rem", padding: "1.25rem",
                    background: "var(--surface)", borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--border)", textDecoration: "none",
                    transition: "var(--transition)"
                  }}>
                    <span style={{
                      width: 44, height: 44, flexShrink: 0, borderRadius: "var(--radius-md)",
                      background: "var(--primary-light)", display: "flex",
                      alignItems: "center", justifyContent: "center", fontSize: "1.25rem"
                    }}>
                      {c.icon}
                    </span>
                    <div>
                      <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{c.label}</div>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)", marginTop: "0.25rem" }}>{c.value}</div>
                    </div>
                  </a>
                ))}
              </div>

              <div style={{ marginTop: "2rem", padding: "1.5rem", background: "var(--secondary-light)", borderRadius: "var(--radius-lg)", border: "1px solid rgba(245,158,11,0.2)" }}>
                <h4 style={{ color: "#92400e", marginBottom: "0.75rem" }}>💬 Chat WhatsApp</h4>
                <p style={{ color: "#92400e", fontSize: "0.9rem", marginBottom: "1rem" }}>
                  Respons lebih cepat melalui WhatsApp kami.
                </p>
                <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm" id="contact-whatsapp">
                  Buka WhatsApp
                </a>
              </div>
            </div>

            {/* Form */}
            <div style={{ background: "var(--surface)", borderRadius: "var(--radius-xl)", padding: "2.5rem", border: "1px solid var(--border)" }}>
              <h3 style={{ marginBottom: "2rem" }}>Kirim Pesan</h3>

              {success && (
                <div className="alert alert-success" style={{ marginBottom: "1.5rem" }} id="contact-success">
                  ✅ Pesan berhasil dikirim! Kami akan menghubungi Anda segera.
                </div>
              )}
              {error && (
                <div className="alert alert-error" style={{ marginBottom: "1.5rem" }} id="contact-error">
                  ❌ {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="contact-name">Nama Lengkap *</label>
                    <input id="contact-name" type="text" className="form-control" placeholder="John Doe"
                      value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="contact-email">Email *</label>
                    <input id="contact-email" type="email" className="form-control" placeholder="john@example.com"
                      value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="contact-phone">Nomor HP</label>
                    <input id="contact-phone" type="tel" className="form-control" placeholder="08123456789"
                      value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="contact-subject">Subjek *</label>
                    <input id="contact-subject" type="text" className="form-control" placeholder="Pertanyaan saya..."
                      value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="contact-message">Pesan *</label>
                  <textarea id="contact-message" className="form-control" rows={5} placeholder="Tulis pesan Anda di sini..."
                    value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading} id="contact-submit">
                  {loading ? "Mengirim..." : "Kirim Pesan 📨"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
