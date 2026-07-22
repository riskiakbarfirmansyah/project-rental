import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = { title: "Kontak" };

export default async function ContactPage() {
  // Ambil config untuk kontak yang bisa diubah admin
  let config: Record<string, string> = {};
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/config`,
      { cache: "no-store" }
    );
    if (res.ok) {
      const d = await res.json();
      config = d.data?.config || {};
    }
  } catch {}

  const phone    = config.contact_phone    || "+62 813-2548-5262";
  const address  = config.contact_address  || "Jl. Sawunggaling Selatan No 48 Semarang";
  const hours    = config.contact_hours    || "Senin – Minggu, 08:00 – 20:00 WIB";
  const waNumber = (config.whatsapp || "6281325485262").replace(/[^0-9]/g, "");

  const contacts = [
    { icon: "📞", label: "Telepon",          value: phone,   href: `tel:${phone.replace(/\s|-/g, "")}` },
    { icon: "📍", label: "Alamat",           value: address, href: "#" },
    { icon: "🕐", label: "Jam Operasional",  value: hours,   href: "#" },
  ];

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section style={{
        background: "var(--gradient-hero)",
        padding: "5rem 0 3.5rem", textAlign: "center"
      }}>
        <div className="container">
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            padding: "0.375rem 1rem", marginBottom: "1.25rem",
            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "var(--radius-full)", color: "rgba(255,255,255,0.75)",
            fontSize: "0.8125rem", fontWeight: 600
          }}>
            📍 Kami Siap Melayani Anda
          </div>
          <h1 style={{ color: "white", marginBottom: "1rem" }}>Hubungi Kami</h1>
          <p style={{
            color: "rgba(255,255,255,0.6)", fontSize: "1.0625rem",
            maxWidth: 480, margin: "0 auto"
          }}>
            Punya pertanyaan atau ingin memesan? Jangan ragu menghubungi kami karena tim kami siap membantu.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="section">
        <div className="container" style={{ maxWidth: 860 }}>

          {/* Grid info kontak */}
          <div className="grid-2-col" style={{ marginBottom: "2.5rem" }}>
            {contacts.map((c) => (
              <a
                key={c.label}
                href={c.href}
                id={`contact-${c.label.toLowerCase().replace(/\s/g, "-")}`}
                style={{
                  display: "flex", alignItems: "center", gap: "1.125rem",
                  padding: "1.5rem", borderRadius: "var(--radius-xl)",
                  background: "var(--surface)", border: "1px solid var(--border)",
                  textDecoration: "none", transition: "var(--transition)",
                  boxShadow: "var(--shadow-sm)"
                }}
              >
                <div style={{
                  width: 52, height: 52, flexShrink: 0,
                  borderRadius: "var(--radius-md)",
                  background: "var(--surface-2)",
                  display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "1.375rem"
                }}>
                  {c.icon}
                </div>
                <div>
                  <div style={{
                    fontSize: "0.75rem", fontWeight: 700,
                    color: "var(--text-muted)", textTransform: "uppercase",
                    letterSpacing: "0.06em", marginBottom: "0.3rem"
                  }}>
                    {c.label}
                  </div>
                  <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.9375rem", lineHeight: 1.4 }}>
                    {c.value}
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* WhatsApp CTA — menonjol */}
          <div style={{
            borderRadius: "var(--radius-2xl)",
            background: "linear-gradient(135deg, #171717 0%, #0a0a0a 100%)",
            padding: "3rem 2.5rem",
            display: "flex", flexDirection: "column", alignItems: "center",
            textAlign: "center", gap: "0",
            position: "relative", overflow: "hidden",
            boxShadow: "var(--shadow-lg)"
          }}>
            {/* dekorasi lingkaran */}
            <div style={{
              position: "absolute", width: 280, height: 280, borderRadius: "50%",
              background: "rgba(255,255,255,0.04)", top: -80, right: -60,
              pointerEvents: "none"
            }} />
            <div style={{
              position: "absolute", width: 180, height: 180, borderRadius: "50%",
              background: "rgba(255,255,255,0.04)", bottom: -50, left: -40,
              pointerEvents: "none"
            }} />

            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "2rem", marginBottom: "1.25rem",
              backdropFilter: "blur(8px)"
            }}>
              💬
            </div>

            <h2 style={{ color: "white", fontSize: "1.625rem", marginBottom: "0.75rem" }}>
              Chat Langsung via WhatsApp
            </h2>
            <p style={{
              color: "rgba(255,255,255,0.65)", fontSize: "1rem",
              maxWidth: 420, lineHeight: 1.7, marginBottom: "2rem"
            }}>
              Respons lebih cepat! Admin kami siap membalas pesan WhatsApp Anda setiap hari mulai jam 08.00 – 20.00 WIB.
            </p>

            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
              <a
                href={`https://wa.me/${waNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                id="contact-whatsapp-btn"
                style={{
                  display: "inline-flex", alignItems: "center", gap: "0.625rem",
                  padding: "0.9rem 2.25rem",
                  background: "white", color: "#15803d",
                  borderRadius: "var(--radius-full)",
                  fontWeight: 800, fontSize: "1rem",
                  textDecoration: "none", transition: "var(--transition)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.2)"
                }}
              >
                {/* WhatsApp SVG icon */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                </svg>
                Chat WhatsApp Sekarang
              </a>
            </div>
          </div>

        </div>
      </section>
      <Footer />
    </>
  );
}
