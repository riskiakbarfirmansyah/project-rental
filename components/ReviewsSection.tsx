interface Review {
  id: string;
  reviewerName: string;
  reviewerAvatar?: string;
  rating: number;
  content: string;
  source: string;
  reviewDate?: string;
}

interface ReviewsSectionProps {
  reviews: Review[];
  mapsEmbedUrl?: string;
  googleRating?: string;
}

const Stars = ({ rating }: { rating: number }) => (
  <span style={{ color: "#f59e0b", fontSize: "1.25rem", letterSpacing: 2 }}>
    {"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}
  </span>
);

const GoogleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const DEFAULT_MAPS_EMBED = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3959.4643530059825!2d110.43101067365318!3d-7.072036992930665!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e708f0077870a03%3A0xc7f930af53eb3867!2sBella%20Belly%20Trans%20Co!5e0!3m2!1sen!2sid!4v1783429219539!5m2!1sen!2sid";

export default function ReviewsSection({ reviews, mapsEmbedUrl, googleRating = "4.7" }: ReviewsSectionProps) {
  const activeMapsUrl = mapsEmbedUrl || DEFAULT_MAPS_EMBED;

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "5.0";

  return (
    <section className="section" style={{ background: "var(--surface)" }}>
      <div className="container">

        {/* Header */}
        <div className="section-header">
          <span className="section-label">Testimoni</span>
          <h2 className="section-title">Apa Kata Pelanggan Kami</h2>
          <p className="section-subtitle">
            Review nyata dari pelanggan yang telah mempercayakan perjalanan mereka kepada kami.
          </p>
        </div>

        {reviews.length > 0 && (
          <>
            {/* Rating Summary */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: "2rem", marginBottom: "3rem", flexWrap: "wrap",
            }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "4rem", fontWeight: 800, color: "var(--text)", lineHeight: 1 }}>
                  {googleRating}
                </div>
                <div style={{ margin: "0.375rem 0" }}>
                  <Stars rating={5} />
                </div>
              </div>

              <div style={{ width: 1, height: 70, background: "var(--border)" }} />

              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                <GoogleIcon />
                <span style={{ fontWeight: 600, color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                  Google Reviews
                </span>
              </div>
            </div>

            {/* Review Cards */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "1.5rem",
              marginBottom: mapsEmbedUrl ? "3rem" : 0,
            }}>
              {reviews.map((r) => (
                <div key={r.id} className="card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {/* Avatar + Nama */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
                    <div style={{
                      width: 46, height: 46, borderRadius: "50%", flexShrink: 0,
                      background: "linear-gradient(135deg, var(--primary), var(--primary-dark, #4338ca))",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700, color: "white", fontSize: "1.125rem",
                    }}>
                      {r.reviewerAvatar || r.reviewerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.9375rem" }}>{r.reviewerName}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginTop: "0.125rem" }}>
                        <GoogleIcon />
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          {r.source}{r.reviewDate ? ` · ${r.reviewDate}` : ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bintang */}
                  <Stars rating={r.rating} />

                  {/* Isi Review */}
                  <p style={{
                    color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.75,
                    flex: 1, margin: 0,
                    display: "-webkit-box", WebkitLineClamp: 5,
                    WebkitBoxOrient: "vertical", overflow: "hidden",
                  }}>
                    &ldquo;{r.content}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Google Maps Embed */}
        {activeMapsUrl && (
          <div style={{
            borderRadius: "var(--radius-xl)", overflow: "hidden",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-md)",
            marginTop: "3rem",
            position: "relative",
            width: "100%",
            paddingBottom: "min(400px, 56.25%)",
            minHeight: "250px",
          }}>
            <iframe
              src={activeMapsUrl}
              width="100%"
              height="100%"
              style={{
                border: 0, display: "block",
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Lokasi Bella Belly Trans Co di Google Maps"
            />
          </div>
        )}
      </div>
    </section>
  );
}
