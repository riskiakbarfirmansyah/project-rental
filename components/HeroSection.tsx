"use client";

const REVIEW_AVATARS = ["👨‍💼", "👩‍💻", "👨‍🎓", "👩‍🦱"];

interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  content: string;
}

export default function HeroSection({
  heroTitle,
  heroSubtitle,
  featuredReview
}: {
  heroTitle?: string;
  heroSubtitle?: string;
  featuredReview?: Review | null;
}) {
  return (
    <section className="hero-v2">
      {/* Background mesh gradient */}
      <div className="hero-bg-mesh" />
      <div className="hero-bg-glow hero-bg-glow-1" />
      <div className="hero-bg-glow hero-bg-glow-2" />

      <div className="container" style={{ position: "relative", zIndex: 2 }}>
        <div className="hero-v2-layout">

          {/* ── LEFT CONTENT ── */}
          <div className="hero-v2-content">



            {/* Headline */}
            <h1 className="hero-v2-title">
              {heroTitle ? heroTitle : (
                <>
                  Sewa Mobil<br />
                  <span className="hero-title-accent">Tanpa Ribet,</span><br />
                  Langsung Jalan
                </>
              )}
            </h1>

            <p className="hero-v2-subtitle">
              {heroSubtitle || "Armada lengkap, harga transparan, booking dalam 2 menit. Lebih dari 5.000 pelanggan telah mempercayai kami."}
            </p>

            {/* Social proof */}
            <div className="hero-social-proof">
              <div className="hero-avatars">
                {REVIEW_AVATARS.map((a, i) => (
                  <div key={i} className="hero-avatar" style={{ zIndex: REVIEW_AVATARS.length - i }}>
                    {a}
                  </div>
                ))}
              </div>
              <div>
                <div className="hero-stars">
                  {"★★★★★".split("").map((s, i) => (
                    <span key={i} style={{ color: "#f59e0b" }}>{s}</span>
                  ))}
                  <span className="hero-rating-num">4.7</span>
                </div>
                <div className="hero-rating-label">dari Google Review</div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="hero-quick-stats" style={{ marginBottom: "0.5rem" }}>
              <div className="hero-quick-stat">
                <div className="hero-quick-stat-num">Tahun Muda</div>
                <div className="hero-quick-stat-label">Armada Terbaru</div>
              </div>
              <div className="hero-quick-stat-sep" />
              <div className="hero-quick-stat">
                <div className="hero-quick-stat-num">Instan</div>
                <div className="hero-quick-stat-label">Konfirmasi WA</div>
              </div>
              <div className="hero-quick-stat-sep" />
              <div className="hero-quick-stat">
                <div className="hero-quick-stat-num">99%</div>
                <div className="hero-quick-stat-label">Kepuasan Pelanggan</div>
              </div>
              <div className="hero-quick-stat-sep" />
              <div className="hero-quick-stat">
                <div className="hero-quick-stat-num">Gratis*</div>
                <div className="hero-quick-stat-label">Antar-Jemput</div>
              </div>
            </div>
            
            <div style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.4)", fontStyle: "italic", marginLeft: "2px" }}>
              *Syarat dan ketentuan berlaku untuk area tertentu
            </div>
          </div>

          {/* ── RIGHT VISUAL ── */}
          <div className="hero-v2-visual">

            {/* Main car display */}
            <div className="hero-car-showcase">
              <div className="hero-car-glow" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/hero-car.png"
                alt="Toyota Avanza"
                style={{
                  position: "relative",
                  zIndex: 1,
                  width: "115%",
                  height: "auto",
                  maxWidth: "540px",
                  objectFit: "contain",
                  animation: "carFloat 5s ease-in-out infinite",
                  filter: "drop-shadow(0 20px 35px rgba(0,0,0,0.35))",
                  userSelect: "none"
                }}
              />

              {/* Floating card - price */}
              <div className="hero-float-card hero-float-price" style={{
                background: "rgba(17, 17, 17, 0.8)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "16px",
                padding: "0.75rem 1rem",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                left: "2%"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: "10px", 
                    background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(29, 78, 216, 0.35)",
                    flexShrink: 0
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
                      <circle cx="7" cy="17" r="2" />
                      <circle cx="17" cy="17" r="2" />
                      <path d="M7 17h10" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.625rem", color: "rgba(255, 255, 255, 0.5)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.15rem" }}>
                      Tarif Sewa
                    </div>
                    <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 800, color: "white", fontSize: "1rem", lineHeight: 1.1 }}>
                      Mulai 250.000-an
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating card - availability */}
              <div className="hero-float-card hero-float-avail">
                <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: "50%", background: "rgba(37,211,102,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "white" }}>Armada siap digunakan</div>
                    <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.55)" }}>Booking mudah via Whatsapp</div>
                  </div>
                </div>
              </div>

              {/* Floating card - review */}
              <div className="hero-float-card hero-float-review">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                  <span style={{ fontSize: "0.8125rem", color: "#f59e0b" }}>
                    {"★".repeat(featuredReview ? featuredReview.rating : 5)}
                  </span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </div>
                <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "white", marginBottom: "0.1rem", wordBreak: "break-word" }}>
                  {featuredReview
                    ? (featuredReview.content.length > 55
                        ? `${featuredReview.content.substring(0, 52)}...`
                        : featuredReview.content)
                    : "Trusted! Unit is okay, clean & fragrant"}
                </div>
                <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)" }}>
                  — {featuredReview ? featuredReview.reviewerName : "Andres Dwi Saputro"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave bottom */}
      <div className="hero-wave">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="var(--bg)" />
        </svg>
      </div>
    </section>
  );
}
