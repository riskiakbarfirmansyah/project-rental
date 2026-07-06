"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface User { id: string; name: string; email: string; role: string; phone?: string; }
interface Booking {
  id: string; startDate: string; endDate: string; totalDays: number;
  totalPrice: number; status: string; pickupLocation: string;
  car: { name: string; brand: string; imageUrl?: string };
  createdAt: string;
}

const STATUS_LABELS: Record<string, { label: string; class: string }> = {
  PENDING: { label: "Menunggu", class: "badge-warning" },
  CONFIRMED: { label: "Dikonfirmasi", class: "badge-info" },
  ONGOING: { label: "Berlangsung", class: "badge-primary" },
  COMPLETED: { label: "Selesai", class: "badge-success" },
  CANCELLED: { label: "Dibatalkan", class: "badge-error" },
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/bookings").then((r) => r.json()),
    ]).then(([meData, bookingsData]) => {
      if (!meData.success) { router.push("/login"); return; }
      setUser(meData.data.user);
      setBookings(bookingsData.data?.bookings || []);
    }).finally(() => setLoading(false));
  }, [router]);

  const handleCancel = async (id: string) => {
    if (!confirm("Yakin ingin membatalkan booking ini?")) return;
    const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: "CANCELLED" } : b));
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="spinner" />
    </div>
  );

  if (!user) return null;

  return (
    <>
      <Navbar />

      <section style={{ background: "var(--gradient-hero)", padding: "4rem 0 3rem" }}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%", background: "var(--secondary)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "2rem", fontWeight: 800, color: "white", fontFamily: "Sora, sans-serif"
            }}>
              {user.name[0]}
            </div>
            <div>
              <h1 style={{ color: "white", fontSize: "1.75rem", marginBottom: "0.25rem" }}>
                Halo, {user.name}! 👋
              </h1>
              <p style={{ color: "rgba(255,255,255,0.7)" }}>{user.email} · {user.role === "ADMIN" ? "Administrator" : "Customer"}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 style={{ marginBottom: "2rem" }}>Riwayat Booking</h2>

          {bookings.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem", background: "var(--surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📋</div>
              <h3 style={{ marginBottom: "0.75rem", color: "var(--text-secondary)" }}>Belum ada booking</h3>
              <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>Mulai sewa mobil untuk perjalanan Anda!</p>
              <a href="/services" className="btn btn-primary" id="profile-browse-cars">Lihat Armada</a>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {bookings.map((b) => {
                const statusInfo = STATUS_LABELS[b.status] || { label: b.status, class: "badge-info" };
                return (
                  <div key={b.id} id={`booking-card-${b.id}`} style={{
                    background: "var(--surface)", borderRadius: "var(--radius-xl)",
                    border: "1px solid var(--border)", padding: "1.5rem",
                    display: "flex", gap: "1.5rem", alignItems: "flex-start"
                  }}>
                    <div style={{
                      width: 60, height: 60, borderRadius: "var(--radius-md)", background: "var(--primary-light)",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", flexShrink: 0
                    }}>
                      🚗
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
                        <div>
                          <h3 style={{ fontSize: "1.0625rem", marginBottom: "0.375rem" }}>
                            {b.car.brand} {b.car.name}
                          </h3>
                          <span className={`badge ${statusInfo.class}`}>{statusInfo.label}</span>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontFamily: "Sora, sans-serif", fontSize: "1.25rem", fontWeight: 800, color: "var(--primary)" }}>
                            Rp {b.totalPrice.toLocaleString("id-ID")}
                          </div>
                          <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{b.totalDays} hari</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "1.5rem", marginTop: "1rem", fontSize: "0.875rem", color: "var(--text-secondary)", flexWrap: "wrap" }}>
                        <span>📅 {new Date(b.startDate).toLocaleDateString("id-ID")} — {new Date(b.endDate).toLocaleDateString("id-ID")}</span>
                        <span>📍 {b.pickupLocation}</span>
                      </div>
                    </div>
                    {(b.status === "PENDING") && (
                      <button onClick={() => handleCancel(b.id)} className="btn btn-sm btn-danger" id={`cancel-booking-${b.id}`}>
                        Batalkan
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
