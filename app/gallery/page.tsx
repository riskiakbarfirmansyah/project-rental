import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GalleryLightbox from "@/app/gallery/Gallerylightbox";

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
            <GalleryLightbox items={items} />
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