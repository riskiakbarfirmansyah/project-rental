import type { Metadata } from "next";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = { title: "Galeri" };

export default async function GalleryPage() {
  let items: { id: string; title: string; description?: string; imageUrl: string; car?: { name: string; brand: string } }[] = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/gallery`, { cache: "no-store" });
    if (res.ok) { const d = await res.json(); items = d.data?.items || []; }
  } catch {}

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section style={{ background: "var(--gradient-hero)", padding: "5rem 0 3rem" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <h1 style={{ color: "white", marginBottom: "1rem" }}>Galeri Armada Kami</h1>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1.125rem", maxWidth: 500, margin: "0 auto" }}>
            Lihat koleksi lengkap armada kendaraan kami yang terawat dan siap melayani perjalanan Anda.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {items.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
              {items.map((item) => (
                <div key={item.id} id={`gallery-item-${item.id}`} style={{
                  borderRadius: "var(--radius-lg)", overflow: "hidden",
                  border: "1px solid var(--border)", transition: "var(--transition)",
                  background: "var(--surface)", display: "flex", flexDirection: "column",
                }}>
                  {/* Uniform image height */}
                  <div style={{
                    position: "relative",
                    width: "100%",
                    height: 240,
                    flexShrink: 0,
                    background: "var(--primary-light)",
                  }}>
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      style={{ objectFit: "cover" }}
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>

                  <div style={{ padding: "1.25rem", flex: 1 }}>
                    <h3 style={{ fontSize: "1rem", marginBottom: "0.375rem" }}>{item.title}</h3>
                    {item.description && (
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>{item.description}</p>
                    )}
                    {item.car && (
                      <div style={{ marginTop: "0.75rem" }}>
                        <span className="badge badge-primary">{item.car.brand} {item.car.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "4rem" }}>
              <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📸</div>
              <h3 style={{ color: "var(--text-secondary)" }}>Galeri belum tersedia</h3>
              <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>Admin belum menambahkan foto galeri.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
