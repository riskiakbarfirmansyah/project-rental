"use client";

import { useState, useEffect, use } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Car {
  id: string; name: string; brand: string; year: number; type: string;
  pricePerDay: number; seats: number; transmission: string; fuel: string;
  description: string; withDriverOnly: boolean; imageUrl?: string;
}

interface AdminContact {
  label: string;
  wa: string;
}

const copyToClipboard = (text: string): Promise<void> => {
  if (typeof window === "undefined") return Promise.resolve();
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  // Fallback for non-secure contexts
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand("copy");
  } catch (err) {
    console.warn("Fallback copy failed", err);
  }
  document.body.removeChild(textarea);
  return Promise.resolve();
};

export default function BookingPage({ params }: { params: Promise<{ carId: string }> }) {
  const { carId } = use(params);
  const [car, setCar] = useState<Car | null>(null);

  // Admin 1 diambil dari config (bisa diubah dari admin panel), Admin 2 fixed
  const [admins, setAdmins] = useState<AdminContact[]>([
    { label: "Admin 1", wa: "6281234567890" },
    { label: "Admin 2", wa: "62895633818676" }
  ]);
  const [selectedAdminIdx, setSelectedAdminIdx] = useState(0);
  const adminWa = admins[selectedAdminIdx]?.wa || admins[0].wa;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successBookingId, setSuccessBookingId] = useState("");
  const [successWaUrl, setSuccessWaUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [config, setConfig] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    customerName: "",
    customerWa: "",
    pickupDate: "",
    duration: "1",
    pickupLocation: "",
    driverOption: "lepas_kunci" as "lepas_kunci" | "dengan_supir",
  });

  useEffect(() => {
    Promise.all([
      fetch(`/api/cars/${carId}`).then((r) => r.json()),
      fetch("/api/config").then((r) => r.json()),
    ]).then(([carData, cfgData]) => {
      if (carData.success) {
        setCar(carData.data.car);
        if (carData.data.car.withDriverOnly) {
          setForm(prev => ({ ...prev, driverOption: "dengan_supir" }));
        }
      }
      
      const configData = cfgData.data?.config || {};
      setConfig(configData);

      const wa = configData.whatsapp;
      if (wa) {
        setAdmins((prev) => {
          const updated = [...prev];
          updated[0] = { ...updated[0], wa: wa.replace(/[^0-9]/g, "") };
          return updated;
        });
      }
    }).finally(() => setLoading(false));
  }, [carId]);

  const duration = parseInt(form.duration) || 1;
  const totalPrice = car ? duration * car.pricePerDay : 0;

  // Hitung tanggal selesai
  const endDate = form.pickupDate
    ? (() => {
        const d = new Date(form.pickupDate);
        d.setDate(d.getDate() + duration);
        return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
      })()
    : "-";

  const pickupDateFormatted = form.pickupDate
    ? new Date(form.pickupDate).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : "-";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!car) return;
    setSubmitting(true);
    setError("");

    try {
      const payload = {
        carId: car.id,
        customerName: form.customerName,
        customerWa: form.customerWa,
        pickupDate: form.pickupDate,
        duration: parseInt(form.duration) || 1,
        pickupLocation: form.pickupLocation,
        driverOption: form.driverOption,
        selectedAdminName: admins[selectedAdminIdx]?.label || "Admin",
        selectedAdminWa: adminWa,
        customerNote: "",
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal menyimpan pesanan ke database");
      }

      const bookingId = data.data.booking.id;

      const msg = [
        `🚗 *PEMESANAN SEWA MOBIL*`,
        `━━━━━━━━━━━━━━━━━━━━`,
        `*ID Booking:* ${bookingId}`,
        ``,
        `*Kendaraan:* ${car.brand} ${car.name} (${car.year})`,
        `*Tipe:* ${car.type}`,
        ``,
        `*Detail Pemesan:*`,
        `👤 Nama: ${form.customerName}`,
        `📱 WhatsApp: ${form.customerWa}`,
        ``,
        `*Detail Sewa:*`,
        `📅 Tanggal Ambil: ${pickupDateFormatted}`,
        `⏱ Durasi: ${duration} hari`,
        `🏁 Estimasi Selesai: ${endDate}`,
        `📍 Lokasi Penjemputan: ${form.pickupLocation}`,
        `🔑 Pilihan: ${form.driverOption === "lepas_kunci" ? "Lepas Kunci (tanpa supir)" : "Dengan Supir"}`,
        ``,
        `💰 *Estimasi Biaya:* Rp ${totalPrice.toLocaleString("id-ID")}`,
        `(Rp ${car.pricePerDay.toLocaleString("id-ID")}/hari × ${duration} hari)`,
        ``,
        `Mohon konfirmasi ketersediaan. Terima kasih! 🙏`,
      ].join("\n");

      const waUrl = `https://wa.me/${adminWa}?text=${encodeURIComponent(msg)}`;
      setSuccessBookingId(bookingId);
      setSuccessWaUrl(waUrl);
      window.open(waUrl, "_blank");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan koneksi");
    } finally {
      setSubmitting(false);
    }
  };

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

      {/* Header */}
      <section style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)", padding: "4rem 0 3rem" }}>
        <div className="container">
          <a href="/services" style={{
            color: "rgba(255,255,255,0.6)", display: "inline-flex",
            alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem",
            fontSize: "0.875rem", transition: "var(--transition)"
          }}>
            ← Kembali ke Katalog
          </a>
          <h1 style={{ color: "white", marginBottom: "0.5rem" }}>
            Pesan {car.brand} {car.name}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9375rem" }}>
            Isi form di bawah — pesanan akan dikirim langsung ke WhatsApp admin
          </p>
        </div>
      </section>

      <section className="section" style={{ background: "var(--bg)" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "2.5rem", alignItems: "start" }}>

            {/* ── KIRI: Info Mobil ── */}
            <div style={{ position: "sticky", top: 90 }}>

              {/* Car image */}
              <div style={{
                borderRadius: "var(--radius-xl)", overflow: "hidden",
                background: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)",
                height: 220, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "7rem", marginBottom: "1.25rem"
              }}>
                {car.imageUrl
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={car.imageUrl} alt={car.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : "🚗"}
              </div>

              <div style={{ background: "var(--surface)", borderRadius: "var(--radius-xl)", padding: "1.5rem", border: "1px solid var(--border)" }}>
                <h2 style={{ fontSize: "1.25rem", marginBottom: "0.25rem" }}>{car.brand} {car.name}</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem", marginBottom: "1.25rem" }}>{car.year} · {car.type}</p>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.7, marginBottom: "1.25rem" }}>{car.description}</p>

                {/* Specs */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.25rem" }}>
                  {[
                    { icon: "👥", label: "Kapasitas", val: `${car.seats} orang` },
                    { icon: "⚙️", label: "Transmisi", val: car.transmission === "AUTOMATIC" ? "Matic" : "Manual" },
                    { icon: "⛽", label: "BBM", val: car.fuel },
                    { icon: "📅", label: "Tahun", val: car.year.toString() },
                  ].map((s) => (
                    <div key={s.label} style={{ padding: "0.75rem", background: "var(--surface-2)", borderRadius: "var(--radius-md)" }}>
                      <div style={{ fontSize: "1rem", marginBottom: "0.2rem" }}>{s.icon}</div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
                      <div style={{ fontWeight: 700, fontSize: "0.875rem" }}>{s.val}</div>
                    </div>
                  ))}
                </div>

                {/* Admin contact - mengikuti admin yang dipilih di form */}
                <div style={{
                  marginTop: "1.25rem", padding: "1rem 1.25rem",
                  background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
                  borderRadius: "var(--radius-lg)", border: "1px solid #bbf7d0",
                  display: "flex", alignItems: "center", gap: "0.875rem"
                }}>
                  <div style={{ fontSize: "1.5rem" }}>📞</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "#15803d" }}>
                      Hubungi {admins[selectedAdminIdx]?.label}
                    </div>
                    <div style={{ fontSize: "0.8125rem", color: "#166534" }}>+{adminWa}</div>
                  </div>
                  <a href={`https://wa.me/${adminWa}`} target="_blank" rel="noopener noreferrer"
                    style={{
                      marginLeft: "auto", padding: "0.375rem 0.75rem",
                      background: "#16a34a", color: "white", borderRadius: "var(--radius-full)",
                      fontSize: "0.75rem", fontWeight: 700, textDecoration: "none"
                    }}>
                    Chat
                  </a>
                </div>
              </div>
            </div>

            {/* ── KANAN: Form Pemesanan ── */}
            <div style={{ background: "var(--surface)", borderRadius: "var(--radius-2xl)", border: "1px solid var(--border)", overflow: "hidden" }}>

              {/* Form header */}
              <div style={{ padding: "1.75rem 2rem", background: "linear-gradient(135deg, #0f172a, #1e3a8a)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <h3 style={{ color: "white", marginBottom: "0.375rem", fontSize: "1.25rem" }}>Detail Pemesanan</h3>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.875rem" }}>
                  Lengkapi form → Kirim ke WhatsApp admin → Konfirmasi dalam menit
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>

                {/* Harga per hari */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "1rem 1.25rem", background: "var(--primary-light)",
                  borderRadius: "var(--radius-lg)", border: "1px solid rgba(26,86,219,0.15)"
                }}>
                  <span style={{ fontWeight: 600, color: "var(--primary-dark)", fontSize: "0.9375rem" }}>Harga Sewa</span>
                  <span style={{ fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "1.375rem", color: "var(--primary)" }}>
                    Rp {car.pricePerDay.toLocaleString("id-ID")}
                    <span style={{ fontSize: "0.875rem", fontWeight: 400, color: "var(--text-muted)" }}>/hari</span>
                  </span>
                </div>

                {/* Pilih Admin */}
                <div className="form-group">
                  <label className="form-label">
                    📞 Pilih Admin <span style={{ color: "var(--error)" }}>*</span>
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: `repeat(${admins.length}, 1fr)`, gap: "0.75rem" }}>
                    {admins.map((a, idx) => (
                      <label key={a.label} htmlFor={`radio-admin-${idx}`}
                        style={{
                          display: "flex", flexDirection: "column", gap: "0.25rem",
                          padding: "0.875rem 1rem",
                          border: `2px solid ${selectedAdminIdx === idx ? "var(--primary)" : "var(--border)"}`,
                          borderRadius: "var(--radius-lg)",
                          background: selectedAdminIdx === idx ? "var(--primary-light)" : "var(--surface)",
                          cursor: "pointer", transition: "var(--transition)"
                        }}
                      >
                        <input
                          type="radio" id={`radio-admin-${idx}`}
                          name="adminOption" value={a.wa}
                          checked={selectedAdminIdx === idx}
                          onChange={() => setSelectedAdminIdx(idx)}
                          style={{ display: "none" }}
                        />
                        <span style={{
                          fontWeight: 700, fontSize: "0.9375rem",
                          color: selectedAdminIdx === idx ? "var(--primary-dark)" : "var(--text-primary)"
                        }}>📞 {a.label}</span>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>+{a.wa}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Nama lengkap */}
                <div className="form-group">
                  <label className="form-label" htmlFor="booking-name">
                    👤 Nama Lengkap <span style={{ color: "var(--error)" }}>*</span>
                  </label>
                  <input
                    id="booking-name" type="text" className="form-control"
                    placeholder="Masukkan nama lengkap Anda"
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    required
                  />
                </div>

                {/* No WhatsApp */}
                <div className="form-group">
                  <label className="form-label" htmlFor="booking-wa">
                    📱 No. WhatsApp <span style={{ color: "var(--error)" }}>*</span>
                  </label>
                  <input
                    id="booking-wa" type="tel" className="form-control"
                    placeholder="Contoh: 08123456789"
                    value={form.customerWa}
                    onChange={(e) => setForm({ ...form, customerWa: e.target.value })}
                    required
                  />
                </div>

                {/* Tanggal ambil & Durasi */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="booking-date">
                      📅 Tanggal Ambil <span style={{ color: "var(--error)" }}>*</span>
                    </label>
                    <input
                      id="booking-date" type="date" className="form-control"
                      min={today}
                      value={form.pickupDate}
                      onChange={(e) => setForm({ ...form, pickupDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="booking-duration">
                      ⏱ Durasi Sewa <span style={{ color: "var(--error)" }}>*</span>
                    </label>
                    <select
                      id="booking-duration" className="form-control"
                      value={form.duration}
                      onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    >
                      {[1,2,3,4,5,6,7,10,14,21,30].map((d) => (
                        <option key={d} value={d}>{d} hari</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Estimasi selesai */}
                {form.pickupDate && (
                  <div style={{
                    padding: "0.75rem 1rem", background: "var(--surface-2)",
                    borderRadius: "var(--radius-md)", fontSize: "0.875rem",
                    color: "var(--text-secondary)", display: "flex", gap: "0.5rem", alignItems: "center"
                  }}>
                    <span>🏁</span>
                    <span>Estimasi selesai: <strong style={{ color: "var(--text-primary)" }}>{endDate}</strong></span>
                  </div>
                )}

                {/* Lokasi penjemputan */}
                <div className="form-group">
                  <label className="form-label" htmlFor="booking-pickup">
                    📍 Lokasi Penjemputan <span style={{ color: "var(--error)" }}>*</span>
                  </label>
                  <input
                    id="booking-pickup" type="text" className="form-control"
                    placeholder="Contoh: Bandara Soekarno-Hatta, Jl. Sudirman No. 1..."
                    value={form.pickupLocation}
                    onChange={(e) => setForm({ ...form, pickupLocation: e.target.value })}
                    required
                  />
                </div>

                {/* Pilihan Lepas Kunci / Dengan Supir */}
                <div className="form-group">
                  <label className="form-label">
                    🔑 Pilihan Sewa <span style={{ color: "var(--error)" }}>*</span>
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: car.withDriverOnly ? "1fr" : "1fr 1fr", gap: "0.75rem" }}>
                    {[
                      {
                        value: "lepas_kunci",
                        icon: "🗝️",
                        title: "Lepas Kunci",
                        desc: "Anda mengemudi sendiri"
                      },
                      {
                        value: "dengan_supir",
                        icon: "👨‍✈️",
                        title: "Dengan Supir",
                        desc: "Sudah termasuk supir"
                      },
                    ].map((opt) => {
                      if (car.withDriverOnly && opt.value === "lepas_kunci") return null;
                      return (
                      <label key={opt.value} id={`driver-opt-${opt.value}`}
                        htmlFor={`radio-${opt.value}`}
                        style={{
                          display: "flex", flexDirection: "column", gap: "0.375rem",
                          padding: "1rem 1.125rem",
                          border: `2px solid ${form.driverOption === opt.value ? "var(--primary)" : "var(--border)"}`,
                          borderRadius: "var(--radius-lg)",
                          background: form.driverOption === opt.value ? "var(--primary-light)" : "var(--surface)",
                          cursor: "pointer", transition: "var(--transition)"
                        }}
                      >
                        <input
                          type="radio" id={`radio-${opt.value}`}
                          name="driverOption" value={opt.value}
                          checked={form.driverOption === opt.value}
                          onChange={(e) => setForm({ ...form, driverOption: e.target.value as "lepas_kunci" | "dengan_supir" })}
                          style={{ display: "none" }}
                        />
                        <span style={{ fontSize: "1.5rem" }}>{opt.icon}</span>
                        <span style={{
                          fontWeight: 700, fontSize: "0.9375rem",
                          color: form.driverOption === opt.value ? "var(--primary-dark)" : "var(--text-primary)"
                        }}>{opt.title}</span>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{opt.desc}</span>
                      </label>
                      );
                    })}
                  </div>
                  {car.withDriverOnly && (
                    <div style={{ fontSize: "0.8125rem", color: "#b91c1c", marginTop: "0.75rem", display: "flex", gap: "0.5rem", alignItems: "center", background: "#fef2f2", padding: "0.75rem 1rem", borderRadius: "8px", border: "1px solid #fecaca" }}>
                      <span style={{ fontSize: "1.125rem" }}>ℹ️</span> 
                      <span>Mobil ini merupakan armada khusus yang hanya dapat disewa beserta supir demi kenyamanan dan keamanan Anda.</span>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="alert alert-error" style={{ marginBottom: "0.5rem" }}>
                    ⚠️ {error}
                  </div>
                )}

                {/* Total Estimasi */}
                <div style={{
                  padding: "1.25rem", borderRadius: "var(--radius-lg)",
                  background: "linear-gradient(135deg, #0f172a, #1e3a8a)",
                  display: "flex", justifyContent: "space-between", alignItems: "center"
                }}>
                  <div>
                    <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.8rem", marginBottom: "0.25rem" }}>
                      Rp {car.pricePerDay.toLocaleString("id-ID")} × {duration} hari
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.8125rem" }}>Estimasi total biaya</div>
                  </div>
                  <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "1.625rem", color: "#fbbf24" }}>
                    Rp {totalPrice.toLocaleString("id-ID")}
                  </div>
                </div>

                {/* Info Discount Note */}
                <div style={{ 
                  display: "flex", alignItems: "flex-start", gap: "0.875rem", 
                  padding: "1rem 1.25rem", background: "#f0f9ff", 
                  borderRadius: "var(--radius-md)", border: "1px solid #bae6fd" 
                }}>
                  <div style={{ fontSize: "1.25rem", marginTop: "-0.15rem" }}>💡</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "#0369a1", marginBottom: "0.375rem" }}>
                      {config.booking_promo_title || "Promo & Potongan Harga Khusus"}
                    </div>
                    <div style={{ fontSize: "0.8125rem", color: "#0c4a6e", lineHeight: 1.6 }}>
                      {(() => {
                        const promoParts = (config.booking_promo_desc || "Dapatkan harga spesial (lebih hemat dari estimasi) untuk kondisi berikut: * Penyewaan lebih dari 7 hari * Penyewa yang sedang berulang tahun * Klaim diskon ke admin via WhatsApp setelah pesanan dikirim!").split("*").map(s => s.trim()).filter(Boolean);
                        return (
                          <>
                            {promoParts[0]}
                            {promoParts.length > 1 && (
                              <ul style={{ margin: "0.25rem 0 0.5rem 1.25rem", padding: 0 }}>
                                {promoParts.slice(1).map((pt, i) => (
                                  <li key={i} style={{ paddingLeft: "0.25rem", marginBottom: "0.125rem" }}>{pt}</li>
                                ))}
                              </ul>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  id="booking-submit"
                  className="btn btn-lg"
                  disabled={submitting || !form.pickupDate || !form.customerName || !form.customerWa || !form.pickupLocation}
                  style={{
                    width: "100%", justifyContent: "center",
                    background: "#16a34a",
                    color: "white",
                    boxShadow: "0 4px 20px rgba(22,163,74,0.35)",
                    fontSize: "1rem", gap: "0.625rem"
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
                  </svg>
                  {submitting ? "Menyimpan pesanan..." : "Kirim Pesanan via WhatsApp"}
                </button>

                <p style={{ textAlign: "center", fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                  Dengan menekan tombol di atas, Anda akan diarahkan ke WhatsApp untuk mengirim pesan ke admin. Pesanan dikonfirmasi setelah admin membalas.
                </p>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* Success Modal */}
      {successBookingId && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(10, 10, 10, 0.4)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 9999, padding: "1.5rem"
        }}>
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "24px",
            boxShadow: "var(--shadow-xl)",
            width: "100%", maxWidth: "480px",
            padding: "2rem", display: "flex", flexDirection: "column",
            alignItems: "center", textAlign: "center", gap: "1.25rem",
            animation: "modalSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
          }}>
            <div style={{
              width: "64px", height: "64px", borderRadius: "50%",
              background: "rgba(16, 185, 129, 0.1)", color: "#10b981",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "2rem"
            }}>
              ✓
            </div>
            
            <div>
              <h3 style={{ fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "1.25rem", marginBottom: "0.5rem" }}>
                Pemesanan Berhasil Disimpan!
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.5 }}>
                Silakan salin ID Booking Anda dan klik tombol di bawah untuk melanjutkan pengiriman detail via WhatsApp ke admin kami.
              </p>
            </div>

            {/* Booking ID box */}
            <div style={{
              width: "100%", background: "var(--surface-2)", border: "1px solid var(--border)",
              borderRadius: "14px", padding: "0.875rem 1.125rem", display: "flex",
              alignItems: "center", justifyContent: "space-between", gap: "1rem"
            }}>
              <span style={{ fontFamily: "monospace", fontSize: "0.875rem", fontWeight: 700, color: "var(--text-primary)" }}>
                {successBookingId}
              </span>
              <button
                type="button"
                onClick={() => {
                  copyToClipboard(successBookingId).then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  });
                }}
                style={{
                  background: copied ? "rgba(16, 185, 129, 0.1)" : "var(--surface)",
                  border: `1px solid ${copied ? "#10b981" : "var(--border)"}`,
                  color: copied ? "#10b981" : "var(--text-primary)",
                  borderRadius: "8px", padding: "0.35rem 0.75rem", fontSize: "0.75rem",
                  fontWeight: 600, cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                {copied ? "✓ Disalin" : "📋 Salin"}
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%", marginTop: "0.5rem" }}>
              <a
                href={successWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  setSuccessBookingId("");
                  setSuccessWaUrl("");
                  setForm({
                    customerName: "",
                    customerWa: "",
                    pickupDate: "",
                    duration: "1",
                    pickupLocation: "",
                    driverOption: "lepas_kunci"
                  });
                }}
                style={{
                  background: "#16a34a", color: "white", padding: "0.75rem 1.5rem",
                  borderRadius: "10px", textDecoration: "none", fontWeight: 700,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  gap: "0.5rem", width: "100%", cursor: "pointer"
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
                </svg>
                Hubungi via WhatsApp
              </a>

              <button
                type="button"
                onClick={() => {
                  setSuccessBookingId("");
                  setSuccessWaUrl("");
                  setForm({
                    customerName: "",
                    customerWa: "",
                    pickupDate: "",
                    duration: "1",
                    pickupLocation: "",
                    driverOption: "lepas_kunci"
                  });
                }}
                style={{
                  background: "transparent", border: "1px solid var(--border)",
                  borderRadius: "10px", padding: "0.75rem 1.5rem", fontSize: "0.875rem",
                  fontWeight: 600, cursor: "pointer", color: "var(--text-secondary)"
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}