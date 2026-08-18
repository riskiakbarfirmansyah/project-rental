import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GalleryLightbox from "@/app/gallery/Gallerylightbox";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = { title: "Galeri" };

export default async function GalleryPage() {
  let config: Record<string, string> = {};
  let items: { id: string; title: string; description?: string; imageUrl: string; car?: { name: string; brand: string } }[] = [];
  try {
    const [rawItems, configsData] = await Promise.all([
      prisma.galleryItem.findMany({
        include: {
          car: { select: { name: true, brand: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.siteConfig.findMany()
    ]);
    
    config = configsData.reduce((acc, c) => ({ ...acc, [c.key]: c.value }), {} as Record<string, string>);

    items = rawItems.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description || undefined,
      imageUrl: item.imageUrl,
      car: item.car || undefined,
    }));
  } catch (error) {
    console.error("GalleryPage DB fetch error:", error);
  }

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section style={{ background: "var(--gradient-hero)", padding: "5rem 0 3rem" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <h1 style={{ color: "white", marginBottom: "1rem" }}>{config.galeri_title || "Galeri Armada Kami"}</h1>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1.125rem", maxWidth: 500, margin: "0 auto" }}>
            {config.galeri_desc || "Lihat koleksi lengkap armada kendaraan kami yang terawat dan siap melayani perjalanan Anda."}
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