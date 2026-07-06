"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Car {
  id: string; name: string; brand: string; year: number; type: string;
  pricePerDay: number; seats: number; transmission: string; fuel: string;
  description: string; features: string; imageUrl?: string;
}

export default function BookingPage({ params }: { params: Promise<{ carId: string }> }) {
  const { carId } = use(params);
  const router = useRouter();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    startDate: "", endDate: "", pickupLocation: "", notes: "",
  });

  useEffect(() => {
    fetch(`/api/cars/${carId}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setCar(d.data.car); })
      .finally(() => setLoading(false));
  }, [carId]);

  const totalDays = form.startDate && form.endDate
    ? Math.max(0, Math.ceil((new Date(form.endDate).getTime() - new Date(form.startDate).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;
  const totalPrice = car ? totalDays * car.pricePerDay : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setError("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ carId, ...form }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/profile");
      } else if (data.error?.includes("Unauthorized")) {
        router.push("/login");
      } else {
        setError(data.error || "Gagal membuat booking");
      }
    } catch { setError("Terjadi kesalahan jaringan"); }
    finally { setSubmitting(false); }
  };

  const features: string[] = (() => { try { return JSON.parse(car?.features || "[]"); } catch { return []; } })();
  const today = new Date().toISOString().split("T")[0];

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="spinner" />
    </div>
  );

  if (!car) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1rem" }}>
      <div style={{ fontSize: "4rem" }}>🔍</div>
      <h2>Mobil tidak ditemukan</h2>
      <a href="/services" className="btn btn-primary">Kembali ke Katalog</a>
    </div>
  );

  return (
    <>
      <Navbar />

      <section style={{ background: "var(--gradient-hero)", padding: "4rem 0 3rem" }}>
        <div className="container">
          <a href="/services" style={{ color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
            ← Kembali ke Katalog
          </a>
          <h1 style={{ color: "white" }}>Booking {car.brand} {car.name}</h1>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "3rem" }}>
            {/* Car info */}
            <div>
              <div style={{ background: "var(--primary-light)", borderRadius: "var(--radius-xl)", height: 240, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "6rem", marginBottom: "1.5rem" }}>
                🚗
              </div>

              <div style={{ background: "var(--surface)", borderRadius: "var(--radius-xl)", padding: "1.75rem", border: "1px solid var(--border)" }}>
                <h2 style={{ marginBottom: "0.5rem" }}>{car.brand} {car.name}</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", marginBottom: "1.5rem", lineHeight: 1.7 }}>{car.description}</p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                  {[
                    { icon: "👥", label: "Kapasitas", value: `${car.seats} Penumpang` },
                    { icon: "⚙️", label: "Transmisi", value: car.transmission === "AUTOMATIC" ? "Otomatis" : "Manual" },
                    { icon: "⛽", label: "Bahan Bakar", value: car.fuel },
                    { icon: "📅", label: "Tahun", value: car.year.toString() },
                  ].map((spec) => (
                    <div key={spec.label} style={{ padding: "0.875rem", background: "var(--surface-2)", borderRadius: "var(--radius-md)" }}>
                      <div style={{ fontSize: "1.25rem", marginBottom: "0.375rem" }}>{spec.icon}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{spec.label}</div>
                      <div style={{ fontWeight: 700, fontSize: "0.9375rem" }}>{spec.value}</div>
                    </div>
                  ))}
                </div>

                {features.length > 0 && (
                  <div>
                    <h4 style={{ marginBottom: "0.75rem", fontSize: "0.9375rem" }}>Fitur & Fasilitas</h4>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                      {features.map((f: string) => (
                        <span key={f} style={{ padding: "0.375rem 0.875rem", background: "var(--primary-light)", color: "var(--primary)", borderRadius: "var(--radius-full)", fontSize: "0.8125rem", fontWeight: 600 }}>
                          ✓ {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Booking Form */}
            <div>
              <div style={{ background: "var(--surface)", borderRadius: "var(--radius-xl)", padding: "2rem", border: "1px solid var(--border)", position: "sticky", top: "90px" }}>
                <h3 style={{ marginBottom: "1.75rem" }}>Detail Pemesanan</h3>

                {error && <div className="alert alert-error" style={{ marginBottom: "1.25rem" }} id="booking-error">❌ {error}</div>}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="booking-start">Tanggal Mulai *</label>
                      <input id="booking-start" type="date" className="form-control"
                        min={today} value={form.startDate}
                        onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="booking-end">Tanggal Selesai *</label>
                      <input id="booking-end" type="date" className="form-control"
                        min={form.startDate || today} value={form.endDate}
                        onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="booking-pickup">Lokasi Penjemputan *</label>
                    <input id="booking-pickup" type="text" className="form-control"
                      placeholder="Contoh: Bandara Soekarno-Hatta" value={form.pickupLocation}
                      onChange={(e) => setForm({ ...form, pickupLocation: e.target.value })} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="booking-notes">Catatan (opsional)</label>
                    <textarea id="booking-notes" className="form-control" rows={3}
                      placeholder="Permintaan khusus..." value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                  </div>

                  {/* Price Summary */}
                  {totalDays > 0 && (
                    <div style={{ background: "var(--primary-light)", borderRadius: "var(--radius-lg)", padding: "1.25rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.9375rem" }}>
                        <span style={{ color: "var(--text-secondary)" }}>Rp {car.pricePerDay.toLocaleString("id-ID")} × {totalDays} hari</span>
                        <span style={{ fontWeight: 700 }}>Rp {totalPrice.toLocaleString("id-ID")}</span>
                      </div>
                      <div style={{ borderTop: "1px solid rgba(26,86,219,0.2)", paddingTop: "0.75rem", display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontWeight: 700, color: "var(--primary-dark)" }}>Total Pembayaran</span>
                        <span style={{ fontFamily: "Sora, sans-serif", fontSize: "1.25rem", fontWeight: 800, color: "var(--primary)" }}>
                          Rp {totalPrice.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary btn-lg" disabled={submitting || totalDays === 0}
                    id="booking-submit" style={{ width: "100%", justifyContent: "center" }}>
                    {submitting ? "Memproses..." : `Pesan Sekarang ${totalDays > 0 ? `— Rp ${totalPrice.toLocaleString("id-ID")}` : ""}`}
                  </button>

                  <p style={{ textAlign: "center", fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                    * Anda harus login untuk melakukan booking
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
