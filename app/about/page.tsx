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


  const missionPoints = (
    config.about_mission ||
    "Memberikan pelayanan terbaik (unit, customer service, administrasi) * Keamanan, kenyamanan, keselamatan berkendara dan kepuasan pelanggan prioritas kami * Siap menerima masukan & melakukan perubahan ke arah yang lebih baik"
  )
    .split("*")
    .map((p) => p.trim())
    .filter(Boolean);

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
          background: "radial-gradient(ellipse at 70% 50%, rgba(255,255,255,0.05) 0%, transparent 70%)",
          pointerEvents: "none"
        }} />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: 680 }}>

            <h1 style={{ color: "white", marginBottom: "1.25rem" }}>
              {config.about_title || "Tentang Bella Belly Trans Co"}
            </h1>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1.125rem", lineHeight: 1.8 }}>
              {config.about_description || "Bella Belly Trans Co hadir sebagai penyedia layanan sewa mobil terpercaya."}
            </p>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="section" style={{ background: "var(--bg)" }}>
        <div className="container">
          {/* Header */}
          <div className="section-header">
            <span className="section-label">Visi &amp; Misi</span>
            <h2 className="section-title">Komitmen Kami untuk Anda</h2>
            <p className="section-subtitle">
              {config.about_description || "Sejak 2025 berkomitmen untuk melayani pemenuhan kebutuhan transportasi yang nyaman serta kesiapan armada prima"}
            </p>
          </div>

          {/* Visi & Misi Cards — side by side */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", alignItems: "stretch" }}>

            {/* Visi Card */}
            <div style={{
              padding: "2rem",
              background: "var(--surface)",
              borderRadius: "var(--radius-xl)",
              borderTop: "4px solid var(--text-primary)",
              borderRight: "1px solid var(--border)",
              borderBottom: "1px solid var(--border)",
              borderLeft: "1px solid var(--border)",
              boxShadow: "var(--shadow-sm)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "var(--radius-lg)",
                  background: "var(--text-primary)", color: "white", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "1.25rem", flexShrink: 0,
                }}>🎯</div>
                <h3 style={{ color: "var(--text-primary)", fontSize: "1.25rem", margin: 0 }}>Visi Kami</h3>
              </div>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, margin: 0 }}>
                {config.about_vision || "Menjadi perusahaan rental mobil terdepan yang mengutamakan kepuasan dan keselamatan pelanggan."}
              </p>
            </div>

            {/* Misi Card */}
            <div style={{
              padding: "2rem",
              background: "var(--surface)",
              borderRadius: "var(--radius-xl)",
              borderTop: "4px solid var(--text-primary)",
              borderRight: "1px solid var(--border)",
              borderBottom: "1px solid var(--border)",
              borderLeft: "1px solid var(--border)",
              boxShadow: "var(--shadow-sm)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "var(--radius-lg)",
                  background: "var(--text-primary)", color: "white", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "1.25rem", flexShrink: 0,
                }}>🚀</div>
                <h3 style={{ color: "var(--text-primary)", fontSize: "1.25rem", margin: 0 }}>Misi Kami</h3>
              </div>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                {missionPoints.map((point, i) => (
                  <li key={i} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                    <span style={{
                      width: 22, height: 22, borderRadius: "50%",
                      background: "var(--text-primary)", display: "flex", alignItems: "center",
                      justifyContent: "center", flexShrink: 0,
                      fontSize: "0.7rem", color: "white", fontWeight: 700,
                      marginTop: "0.2rem",
                    }}>✓</span>
                    <span style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Value Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginTop: "2.5rem" }}>
            {[
              { icon: "🛡️", title: config.about_val1_title || "Keamanan", desc: config.about_val1_desc || "Armada berstandar keamanan tinggi" },
              { icon: "⭐", title: config.about_val2_title || "Kualitas", desc: config.about_val2_desc || "Perawatan rutin setiap bulan" },
              { icon: "💎", title: config.about_val3_title || "Premium", desc: config.about_val3_desc || "Pengalaman berkendara mewah" },
              { icon: "🤝", title: config.about_val4_title || "Kepercayaan", desc: config.about_val4_desc || "5000+ pelanggan puas" },
            ].map((v) => (
              <div key={v.title} style={{
                padding: "1.5rem", borderRadius: "var(--radius-lg)",
                background: "var(--surface)", border: "1px solid var(--border)",
                textAlign: "center", transition: "var(--transition)",
              }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{v.icon}</div>
                <div style={{ fontWeight: 700, marginBottom: "0.5rem" }}>{v.title}</div>
                <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>{v.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ragam Pelayanan */}
      <section className="section" style={{ background: "var(--bg)" }}>
        <div className="container">
          <div className="section-header">
            <span className="section-label">Ragam Pelayanan</span>
            <h2 className="section-title">Layanan Transportasi Terlengkap</h2>
            <p className="section-subtitle">Kami menyediakan berbagai pilihan sewa mobil fleksibel untuk memenuhi segala kebutuhan perjalanan Anda.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
            {[
              {
                title: config.about_srv1_title || "Pilihan Waktu Sewa",
                icon: "📅",
                desc: config.about_srv1_desc || "Harian / Mingguan / Bulanan / Tahunan"
              },
              {
                title: config.about_srv2_title || "Opsi Pengemudi",
                icon: "🔑",
                desc: config.about_srv2_desc || "Dengan Driver / Non-Driver (Lepas Kunci)"
              },
              {
                title: config.about_srv3_title || "Paket Lengkap All In",
                icon: "⛽",
                desc: config.about_srv3_desc || "Sudah Termasuk Unit Mobil, Driver & Bahan Bakar (BBM)"
              },
              {
                title: config.about_srv4_title || "Kategori Perjalanan",
                icon: "🏢",
                desc: config.about_srv4_desc || "Perseorangan / Perusahaan / Instansi / Dinas / Perjalanan Bisnis"
              },
              {
                title: config.about_srv5_title || "Kesiapan Layanan",
                icon: "🕐",
                desc: config.about_srv5_desc || "Layanan Operasional Siap 24 Jam per 7 Hari Seminggu"
              },
              {
                title: config.about_srv6_title || "Layanan Transportasi Hub",
                icon: "✈️",
                desc: config.about_srv6_desc || "Antar-Jemput Bandara, Stasiun Kereta Api, dan Pelabuhan"
              }
            ].map((s) => (
              <div key={s.title} style={{
                padding: "2rem",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-xl)",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                boxShadow: "var(--shadow-sm)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "var(--radius-md)", fontSize: "1.25rem",
                    background: "var(--primary-light)", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    color: "var(--primary)"
                  }}>{s.icon}</div>
                  <h3 style={{ fontSize: "1.125rem", margin: 0, fontWeight: 700 }}>{s.title}</h3>
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Guarantees */}
      <section className="section" style={{ background: "var(--surface)" }}>
        <div className="container">
          <div className="section-header">
            <span className="section-label">Komitmen Layanan</span>
            <h2 className="section-title">Jaminan Kenyamanan &amp; Keamanan Anda</h2>
            <p className="section-subtitle">Kami memberikan garansi layanan terbaik di setiap perjalanan untuk kenyamanan ekstra Anda.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem" }}>
            {[
              {
                title: config.about_grt1_title || "Perawatan Bengkel Resmi",
                icon: "🔧",
                desc: config.about_grt1_desc || "Setiap unit armada diservis secara berkala hanya di bengkel dealer resmi untuk memastikan performa mesin dan fitur keselamatan berkendara selalu dalam kondisi 100% prima."
              },
              {
                title: config.about_grt2_title || "Kabin Steril & Harum",
                icon: "✨",
                desc: config.about_grt2_desc || "Jaminan kebersihan maksimal. Kabin mobil disemprot disinfektan sebelum diserahkan, bebas dari bekas asap rokok, harum segar mewah, dan bersih layaknya mobil baru."
              },
              {
                title: config.about_grt3_title || "Layanan Darurat 24 Jam",
                icon: "🛡️",
                desc: config.about_grt3_desc || "Bantuan darurat di jalan raya (roadside assistance) siaga 24/7 beserta jaminan penggantian unit cadangan instan jika terjadi kendala teknis tak terduga selama masa sewa."
              }
            ].map((g) => (
              <div key={g.title} className="card" style={{ padding: "2.5rem 2rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div style={{
                  width: 56, height: 56, borderRadius: "var(--radius-lg)", fontSize: "1.75rem",
                  background: "var(--primary-light)", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  color: "var(--primary)", alignSelf: "center"
                }}>
                  {g.icon}
                </div>
                <h3 style={{ fontSize: "1.25rem", margin: 0, fontWeight: 700, textAlign: "center" }}>{g.title}</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.75, margin: 0, textAlign: "center" }}>{g.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
