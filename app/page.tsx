import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhyUsFeatures from "@/components/WhyUsFeatures";
import HeroSection from "@/components/HeroSection";
import ReviewsSection from "@/components/ReviewsSection";

export const metadata: Metadata = {
  title: "Bella Belly Trans Co",
};

export default async function HomePage() {
  // Ambil data server-side
  let cars: {id: string; name: string; brand: string; type: string; pricePerDay: number; seats: number; transmission: string; imageUrl?: string}[] = [];
  let config: Record<string, string> = {};
  let reviews: {id: string; reviewerName: string; reviewerAvatar?: string; rating: number; content: string; source: string; reviewDate?: string}[] = [];

  try {
    const [carsRes, configRes, reviewsRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/cars?limit=6&available=true`, { cache: "no-store" }),
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/config`, { cache: "no-store" }),
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/reviews`, { cache: "no-store" }),
    ]);
    if (carsRes.ok) {
      const data = await carsRes.json();
      cars = data.data?.cars || [];
    }
    if (configRes.ok) {
      const data = await configRes.json();
      config = data.data?.config || {};
    }
    if (reviewsRes.ok) {
      const data = await reviewsRes.json();
      reviews = (data.data?.reviews || []).filter((r: {isVisible: boolean}) => r.isVisible);
    }
  } catch {
    // silently fail
  }



  return (
    <>
      <Navbar />

      <HeroSection
        heroTitle={config.hero_title}
        heroSubtitle={config.hero_subtitle}
      />

      {/* FEATURED CARS */}
      <section className="section" style={{ background: "var(--bg)" }}>
        <div className="container">
          <div className="section-header">
            <span className="section-label">Armada Pilihan</span>
            <h2 className="section-title">Mobil Tersedia untuk Anda</h2>
            <p className="section-subtitle">
              Pilihan kendaraan berkualitas tinggi dengan perawatan rutin. Tersedia untuk berbagai kebutuhan perjalanan Anda.
            </p>
          </div>

          {cars.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.75rem" }}>
              {cars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🚗</div>
              <p>Belum ada mobil tersedia saat ini.</p>
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: "3rem" }}>
            <a href="/services" className="btn btn-primary btn-lg" id="home-see-all-cars">
              Lihat Semua Armada →
            </a>
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="section" style={{ background: "var(--surface)" }}>
        <div className="container">
          <div className="section-header">
            <span className="section-label">Mengapa Kami</span>
            <h2 className="section-title">Keunggulan Bella Belly Trans Co</h2>
            <p className="section-subtitle">
              Kami hadir dengan layanan terbaik untuk memastikan perjalanan Anda nyaman dan aman.
            </p>
          </div>

          <WhyUsFeatures />
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
        </div>
      </section>

      {/* Reviews & Google Maps */}
      <ReviewsSection
        reviews={reviews}
        mapsEmbedUrl={config.google_maps_embed || undefined}
      />

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
