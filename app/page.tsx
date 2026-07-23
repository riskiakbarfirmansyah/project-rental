import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhyUsFeatures from "@/components/WhyUsFeatures";
import HeroSection from "@/components/HeroSection";
import ReviewsSection from "@/components/ReviewsSection";
import ScrollReveal from "@/components/ScrollReveal";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Bella Belly Trans Co",
};

const DEFAULT_MAPS_URL = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3959.4643530059825!2d110.43101067365318!3d-7.072036992930665!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e708f0077870a03%3A0xc7f930af53eb3867!2sBella%20Belly%20Trans%20Co!5e0!3m2!1sen!2sid!4v1783429219539!5m2!1sen!2sid";

const DEFAULT_REVIEWS = [
  {
    id: "default-1",
    reviewerName: "Rizky Pratama",
    reviewerAvatar: "R",
    rating: 5,
    content: "Pelayanan sangat memuaskan, mobil bersih dan harum. Driver ramah dan paham rute Semarang dengan baik. Sangat direkomendasikan!",
    source: "Google Review",
    reviewDate: "1 minggu lalu",
    isVisible: true,
  },
  {
    id: "default-2",
    reviewerName: "Dewi Anggraini",
    reviewerAvatar: "D",
    rating: 5,
    content: "Proses booking cepat dan tidak ribet. Unit Avanza 2025 yang kami sewa dalam kondisi prima seperti baru. Pasti akan sewa di sini lagi.",
    source: "Google Review",
    reviewDate: "2 minggu lalu",
    isVisible: true,
  },
  {
    id: "default-3",
    reviewerName: "Budi Santoso",
    reviewerAvatar: "B",
    rating: 5,
    content: "Harga terjangkau dengan fasilitas all in yang sangat membantu perjalanan dinas kami di Semarang. Sukses terus Bella Belly Trans Co!",
    source: "Google Review",
    reviewDate: "1 bulan lalu",
    isVisible: true,
  },
];

export default async function HomePage() {
  let cars: {id: string; name: string; brand: string; type: string; pricePerDay: number; seats: number; transmission: string; imageUrl?: string}[] = [];
  let config: Record<string, string> = {};
  let reviews: {id: string; reviewerName: string; reviewerAvatar?: string; rating: number; content: string; source: string; reviewDate?: string}[] = [];

  try {
    const [carsData, configsData, reviewsData] = await Promise.all([
      prisma.car.findMany({
        where: { isAvailable: true },
        take: 6,
        orderBy: { createdAt: "desc" },
      }),
      prisma.siteConfig.findMany(),
      prisma.review.findMany({
        where: { isVisible: true },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      }),
    ]);

    cars = carsData.map((c) => ({
      id: c.id,
      name: c.name,
      brand: c.brand,
      type: c.type,
      pricePerDay: Number(c.pricePerDay),
      seats: c.seats,
      transmission: c.transmission,
      imageUrl: c.imageUrl || undefined,
    }));

    reviews = reviewsData.length > 0
      ? reviewsData.map((r) => ({
          id: r.id,
          reviewerName: r.reviewerName,
          reviewerAvatar: r.reviewerAvatar || undefined,
          rating: r.rating,
          content: r.content,
          source: r.source,
          reviewDate: r.reviewDate || undefined,
        }))
      : DEFAULT_REVIEWS;
  } catch (error) {
    console.error("HomePage DB fetch error:", error);
    reviews = DEFAULT_REVIEWS;
  }

  const mapsUrl = config.google_maps_embed || DEFAULT_MAPS_URL;



  return (
    <>
      <Navbar />

      <HeroSection
        heroTitle={config.hero_title}
        heroSubtitle={config.hero_subtitle}
        featuredReview={reviews[0] || null}
      />

      {/* FEATURED CARS */}
      <section className="section" style={{ background: "var(--bg)" }}>
        <div className="container">
          <ScrollReveal direction="up">
            <div className="section-header">
              <span className="section-label">Armada Pilihan</span>
              <h2 className="section-title">Mobil Tersedia untuk Anda</h2>
              <p className="section-subtitle">
                Pilihan kendaraan berkualitas tinggi dengan perawatan rutin. Tersedia untuk berbagai kebutuhan perjalanan Anda.
              </p>
            </div>
          </ScrollReveal>

          {cars.length > 0 ? (
            <ScrollReveal direction="up" delay={150}>
              <div className="cars-grid">
                {cars.map((car) => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>
            </ScrollReveal>
          ) : (
            <ScrollReveal direction="up" delay={150}>
              <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🚗</div>
                <p>Belum ada mobil tersedia saat ini.</p>
              </div>
            </ScrollReveal>
          )}

          <ScrollReveal direction="up" delay={250}>
            <div style={{ textAlign: "center", marginTop: "3rem" }}>
              <a href="/services" className="btn btn-primary btn-lg" id="home-see-all-cars">
                Lihat Semua Armada →
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* WHY US */}
      <section className="section" style={{ background: "var(--surface)" }}>
        <div className="container">
          <ScrollReveal direction="up">
            <div className="section-header">
              <span className="section-label">Mengapa Kami</span>
              <h2 className="section-title">Keunggulan Bella Belly Trans Co</h2>
              <p className="section-subtitle">
                Kami hadir dengan layanan terbaik untuk memastikan perjalanan Anda nyaman dan aman.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={150}>
            <WhyUsFeatures />
          </ScrollReveal>
        </div>
      </section>

      {/* CTA BOOKING */}
      <section style={{
        background: "var(--gradient-hero)", padding: "5rem 0",
        position: "relative", overflow: "hidden"
      }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "80%", height: "200%",
          background: "radial-gradient(ellipse, rgba(255,255,255,0.05) 0%, transparent 70%)",
          pointerEvents: "none"
        }} />
        <div className="container" style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
          <ScrollReveal direction="up">
            <h2 style={{ color: "white", marginBottom: "1.25rem" }}>
              Siap Memulai Perjalanan Anda?
            </h2>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1.125rem", maxWidth: 500, margin: "0 auto 2.5rem" }}>
              Pesan sekarang dan dapatkan pengalaman berkendara yang nyaman dan aman bersama Bella Belly Trans Co.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <a href="/services" className="btn btn-secondary btn-lg" id="cta-book-now">
                Pesan Sekarang
              </a>
              <a href="https://wa.me/6281325485262" target="_blank" rel="noopener noreferrer"
                className="btn btn-ghost btn-lg" id="cta-whatsapp">
                💬 Chat WhatsApp
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Reviews & Google Maps */}
      <ScrollReveal direction="up">
        <ReviewsSection
          reviews={reviews}
          mapsEmbedUrl={mapsUrl}
        />
      </ScrollReveal>

      <Footer />
    </>
  );
}

function CarCard({ car }: { car: { id: string; name: string; brand: string; type: string; pricePerDay: number; seats: number; transmission: string; imageUrl?: string } }) {
  const typeLabels: Record<string, string> = {
    SEDAN: "Sedan", SUV: "SUV", MPV: "MPV", PICKUP: "Pickup", MINIBUS: "Minibus", SPORT: "Sport"
  };

  return (
    <div className="car-card" id={`car-card-${car.id}`}>
      <div className="car-card-img-placeholder">
        {car.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={car.imageUrl} alt={car.name} className="car-card-img" />
        ) : (
          <span>🚗</span>
        )}
      </div>
      <div className="car-card-body">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
          <div>
            <h3 style={{ fontSize: "1.125rem", marginBottom: "0.25rem" }}>{car.brand} {car.name}</h3>
            <span className="badge badge-primary">{typeLabels[car.type] || car.type}</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem", margin: "1rem 0", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
          <span>👥 {car.seats} kursi</span>
          <span>⚙️ {car.transmission === "AUTOMATIC" ? "Matic" : "Manual"}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "1.25rem" }}>
          <div className="car-price">
            Rp {car.pricePerDay.toLocaleString("id-ID")}
            <span>/hari</span>
          </div>
          <a href={`/booking/${car.id}`} className="btn btn-primary btn-sm" id={`book-${car.id}`}>
            Pesan
          </a>
        </div>
      </div>
    </div>
  );
}
