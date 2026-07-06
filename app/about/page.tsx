import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = { title: "Tentang Kami" };

export default async function AboutPage() {
  let config: Record<string, string> = {};
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/config`, { cache: "no-store" });
    if (res.ok) { const d = await res.json(); config = d.data?.config || {}; }
  } catch {}

  const team = [
    { name: "Budi Prasetyo", role: "Founder & CEO", emoji: "👨‍💼", desc: "Lebih dari 15 tahun di industri transportasi." },
    { name: "Siti Rahma", role: "Operations Manager", emoji: "👩‍💻", desc: "Memastikan setiap armada dalam kondisi prima." },
    { name: "Ahmad Fauzi", role: "Customer Service", emoji: "🤝", desc: "Siap membantu 24/7 untuk kebutuhan Anda." },
  ];

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section style={{
        background: "var(--gradient-hero)", padding: "6rem 0 4rem",
        position: "relative", overflow: "hidden"
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 70% 50%, rgba(26,86,219,0.3) 0%, transparent 70%)",
          pointerEvents: "none"
        }} />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: 680 }}>
            <div style={{
              display: "inline-block", padding: "0.375rem 1rem", marginBottom: "1.25rem",
              background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "var(--radius-full)", color: "rgba(255,255,255,0.9)",
              fontSize: "0.875rem", fontWeight: 600
            }}>
              🏆 Tentang Kami
            </div>
            <h1 style={{ color: "white", marginBottom: "1.25rem" }}>
              {config.about_title || "Tentang RentalKu"}
            </h1>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1.125rem", lineHeight: 1.8 }}>
              {config.about_description || "RentalKu hadir sejak 2018 sebagai penyedia layanan sewa mobil terpercaya."}
            </p>
          </div>
        </div>
      </section>

      {/* Vision Mission */}
      <section className="section" style={{ background: "var(--bg)" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }}>
            <div>
              <span className="section-label">Visi & Misi</span>
              <h2 style={{ margin: "1rem 0 1.5rem" }}>Komitmen Kami untuk Anda</h2>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: "2rem" }}>
                {config.about_description || "Kami berkomitmen memberikan layanan rental mobil terbaik di Indonesia dengan standar keamanan dan kenyamanan tertinggi."}
              </p>

              <div style={{ padding: "1.5rem", background: "var(--primary-light)", borderRadius: "var(--radius-lg)", borderLeft: "4px solid var(--primary)" }}>
                <h4 style={{ color: "var(--primary)", marginBottom: "0.75rem" }}>🎯 Visi Kami</h4>
                <p style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
                  {config.about_vision || "Menjadi perusahaan rental mobil terdepan yang mengutamakan kepuasan dan keselamatan pelanggan."}
                </p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              {[
                { icon: "🛡️", title: "Keamanan", desc: "Armada berstandar keamanan tinggi" },
                { icon: "⭐", title: "Kualitas", desc: "Perawatan rutin setiap bulan" },
                { icon: "💎", title: "Premium", desc: "Pengalaman berkendara mewah" },
                { icon: "🤝", title: "Kepercayaan", desc: "5000+ pelanggan puas" },
              ].map((v) => (
                <div key={v.title} style={{
                  padding: "1.5rem", borderRadius: "var(--radius-lg)",
                  background: "var(--surface)", border: "1px solid var(--border)",
                  textAlign: "center", transition: "var(--transition)"
                }}>
                  <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{v.icon}</div>
                  <div style={{ fontWeight: 700, marginBottom: "0.5rem" }}>{v.title}</div>
                  <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>{v.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section" style={{ background: "var(--surface)" }}>
        <div className="container">
          <div className="section-header">
            <span className="section-label">Tim Kami</span>
            <h2 className="section-title">Orang-orang di Balik RentalKu</h2>
            <p className="section-subtitle">Tim profesional yang berdedikasi untuk memberikan pengalaman terbaik bagi Anda.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem" }}>
            {team.map((m) => (
              <div key={m.name} className="card" style={{ textAlign: "center", padding: "2.5rem 1.5rem" }}>
                <div style={{
                  width: 80, height: 80, borderRadius: "50%", fontSize: "2.5rem",
                  background: "var(--primary-light)", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  margin: "0 auto 1.25rem"
                }}>
                  {m.emoji}
                </div>
                <h3 style={{ fontSize: "1.125rem", marginBottom: "0.25rem" }}>{m.name}</h3>
                <p style={{ color: "var(--primary)", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.75rem" }}>{m.role}</p>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
