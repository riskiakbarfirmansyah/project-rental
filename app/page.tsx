import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhyUsFeatures from "@/components/WhyUsFeatures";

export const metadata: Metadata = {
  title: "Home",
};

export default async function HomePage() {
  // Ambil data server-side
  let cars: {id: string; name: string; brand: string; type: string; pricePerDay: number; seats: number; transmission: string; imageUrl?: string}[] = [];
  let config: Record<string, string> = {};

  try {
    const [carsRes, configRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/cars?limit=6&available=true`, { cache: "no-store" }),
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/config`, { cache: "no-store" }),
    ]);
    if (carsRes.ok) {
      const data = await carsRes.json();
      cars = data.data?.cars || [];
    }
    if (configRes.ok) {
      const data = await configRes.json();
      config = data.data?.config || {};
    }
  } catch {
    // silently fail
  }

  const stats = [
    { number: config.years_experience || "6+", label: "Tahun Pengalaman", icon: "🏆" },
    { number: config.total_fleet || "50+", label: "Armada Mobil", icon: "🚗" },
    { number: config.happy_customers || "5000+", label: "Pelanggan Puas", icon: "😊" },
    { number: config.service_areas || "20+", label: "Kota Layanan", icon: "📍" },
  ];

  return (
    <>
      <Navbar />

      {/* HERO */}
      <section className="hero">
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: 700 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              padding: "0.5rem 1.25rem", background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)", borderRadius: "var(--radius-full)",
              color: "rgba(255,255,255,0.9)", fontSize: "0.875rem", fontWeight: 600,
              backdropFilter: "blur(10px)", marginBottom: "1.75rem",
              letterSpacing: "0.04em"
            }}>
              ✨ Terpercaya Sejak 2018
            </div>

            <h1 style={{ color: "white", marginBottom: "1.5rem", lineHeight: 1.15 }}>
              {config.hero_title || "Sewa Mobil Mudah, Aman & Terpercaya"}
            </h1>
            <p style={{
              fontSize: "1.125rem", color: "rgba(255,255,255,0.75)",
              lineHeight: 1.8, marginBottom: "2.5rem", maxWidth: 540
            }}>
              {config.hero_subtitle || "Tersedia berbagai pilihan armada mobil berkualitas dengan harga terjangkau. Pesan sekarang dan nikmati perjalanan Anda!"}
            </p>

            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <a href="/services" className="btn btn-secondary btn-lg" id="hero-cta-services">
                🚗 Lihat Armada
              </a>
              <a href="/contact" className="btn btn-ghost btn-lg" id="hero-cta-contact">
                📞 Hubungi Kami
              </a>
            </div>

            {/* Stats bar */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem",
              marginTop: "4rem", paddingTop: "2.5rem",
              borderTop: "1px solid rgba(255,255,255,0.15)"
            }}>
              {stats.map((s) => (
                <div key={s.label}>
                  <div style={{ fontSize: "1.875rem", fontFamily: "Sora, sans-serif", fontWeight: 800, color: "var(--secondary)" }}>
                    {s.number}
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.6)", marginTop: "0.25rem" }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative float element */}
        <div style={{
          position: "absolute", right: "8%", top: "50%", transform: "translateY(-50%)",
          width: 380, height: 380, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245,158,11,0.15) 0%, rgba(26,86,219,0.1) 60%, transparent 80%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "12rem", animation: "float 4s ease-in-out infinite",
          pointerEvents: "none"
        }}>
          🚙
        </div>
      </section>

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
            <h2 className="section-title">Keunggulan RentalKu</h2>
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
          background: "radial-gradient(ellipse, rgba(245,158,11,0.1) 0%, transparent 70%)",
          pointerEvents: "none"
        }} />
        <div className="container" style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
          <h2 style={{ color: "white", marginBottom: "1.25rem" }}>
            Siap Memulai Perjalanan Anda?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1.125rem", maxWidth: 500, margin: "0 auto 2.5rem" }}>
            Pesan sekarang dan dapatkan pengalaman berkendara yang nyaman dan aman bersama RentalKu.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/services" className="btn btn-secondary btn-lg" id="cta-book-now">
              Pesan Sekarang
            </a>
            <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer"
              className="btn btn-ghost btn-lg" id="cta-whatsapp">
              💬 Chat WhatsApp
            </a>
          </div>
        </div>
      </section>

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
