"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const REVIEW_AVATARS = ["👨‍💼", "👩‍💻", "👨‍🎓", "👩‍🦱"];

export default function HeroSection({ heroTitle, heroSubtitle }: { heroTitle?: string; heroSubtitle?: string }) {
  const router = useRouter();
  const [pickupLocation, setPickupLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [carType, setCarType] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (carType) params.set("type", carType);
    router.push(`/services?${params.toString()}`);
  };

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

            {/* Trust badge */}
            <div className="hero-trust-badge">
              <span className="hero-trust-dot" />
              <span>Layanan Aktif 24/7 · Tersedia Sekarang</span>
            </div>

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
                  <span className="hero-rating-num">4.9</span>
                </div>
                <div className="hero-rating-label">dari 1.200+ ulasan pelanggan</div>
              </div>
            </div>

            {/* Search / booking bar */}
            <div className="hero-search-bar">
              <div className="hero-search-field">
                <div className="hero-search-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div className="hero-search-field-inner">
                  <label className="hero-search-label">Lokasi Penjemputan</label>
                  <input
                    type="text"
                    placeholder="Masukkan kota atau lokasi"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="hero-search-input"
                    id="hero-pickup"
                  />
                </div>
              </div>

              <div className="hero-search-divider" />

              <div className="hero-search-field">
                <div className="hero-search-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <div className="hero-search-field-inner">
                  <label className="hero-search-label">Tanggal Mulai</label>
                  <input
                    type="date"
                    min={today}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="hero-search-input"
                    id="hero-start-date"
                  />
                </div>
              </div>

              <div className="hero-search-divider" />

              <div className="hero-search-field">
                <div className="hero-search-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <div className="hero-search-field-inner">
                  <label className="hero-search-label">Jenis Mobil</label>
                  <select
                    value={carType}
                    onChange={(e) => setCarType(e.target.value)}
                    className="hero-search-input"
                    id="hero-car-type"
                    style={{ appearance: "none", cursor: "pointer" }}
                  >
                    <option value="">Semua tipe</option>
                    <option value="SEDAN">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="MPV">MPV</option>
                    <option value="MINIBUS">Minibus</option>
                    <option value="SPORT">Sport</option>
                  </select>
                </div>
              </div>

              <button onClick={handleSearch} className="hero-search-btn" id="hero-search-submit">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                Cari
              </button>
            </div>

            {/* Quick stats */}
            <div className="hero-quick-stats">
              <div className="hero-quick-stat">
                <div className="hero-quick-stat-num">50+</div>
                <div className="hero-quick-stat-label">Unit Armada</div>
              </div>
              <div className="hero-quick-stat-sep" />
              <div className="hero-quick-stat">
                <div className="hero-quick-stat-num">5.000+</div>
                <div className="hero-quick-stat-label">Pelanggan</div>
              </div>
              <div className="hero-quick-stat-sep" />
              <div className="hero-quick-stat">
                <div className="hero-quick-stat-num">20+</div>
                <div className="hero-quick-stat-label">Kota Layanan</div>
              </div>
              <div className="hero-quick-stat-sep" />
              <div className="hero-quick-stat">
                <div className="hero-quick-stat-num">6 Thn</div>
                <div className="hero-quick-stat-label">Pengalaman</div>
              </div>
            </div>
          </div>

          {/* ── RIGHT VISUAL ── */}
          <div className="hero-v2-visual">

            {/* Main car display */}
            <div className="hero-car-showcase">
              <div className="hero-car-glow" />
              <div className="hero-car-emoji">🚙</div>

              {/* Floating card - price */}
              <div className="hero-float-card hero-float-price">
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #1a56db, #1e3a8a)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem"
                  }}>🚗</div>
                  <div>
                    <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.6)", fontWeight: 600, letterSpacing: "0.04em" }}>MULAI DARI</div>
                    <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 800, color: "white", fontSize: "1.125rem", lineHeight: 1 }}>
                      Rp 250rb<span style={{ fontSize: "0.75rem", fontWeight: 400, color: "rgba(255,255,255,0.6)" }}>/hari</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating card - availability */}
              <div className="hero-float-card hero-float-avail">
                <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: "50%", background: "#10b981",
                    boxShadow: "0 0 0 3px rgba(16,185,129,0.2)", flexShrink: 0
                  }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "white" }}>32 unit tersedia</div>
                    <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.55)" }}>Siap dijemput hari ini</div>
                  </div>
                </div>
              </div>

              {/* Floating card - review */}
              <div className="hero-float-card hero-float-review">
                <div style={{ fontSize: "0.8125rem", color: "#f59e0b", marginBottom: "0.25rem" }}>★★★★★</div>
                <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "white", marginBottom: "0.1rem" }}>Pelayanan Luar Biasa!</div>
                <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)" }}>— Andi S., Jakarta</div>
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
