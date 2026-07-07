"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Stats {
  totalCars: number;
  availableCars: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
}

interface RecentBooking {
  id: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  user: { name: string; email: string };
  car: { name: string; brand: string };
}

const STATUS_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
  PENDING: { bg: "#fef3c7", color: "#d97706", label: "Menunggu" },
  CONFIRMED: { bg: "#e0f2fe", color: "#0284c7", label: "Dikonfirmasi" },
  ONGOING: { bg: "#e0e7ff", color: "#4f46e5", label: "Berlangsung" },
  COMPLETED: { bg: "#d1fae5", color: "#059669", label: "Selesai" },
  CANCELLED: { bg: "#fee2e2", color: "#dc2626", label: "Dibatalkan" }
};

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setStats(d.data.stats);
          setRecentBookings(d.data.recentBookings);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };



  if (loading) return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="spinner" />
    </div>
  );

  const utilizationRate = stats && stats.totalCars > 0
    ? Math.round(((stats.totalCars - stats.availableCars) / stats.totalCars) * 100)
    : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
      
      {/* ── TOP BAR HEADER ── */}
      <div style={{
        paddingBottom: "1.5rem",
        borderBottom: "1px solid var(--border)"
      }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
          Ringkasan Bisnis
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", marginTop: "0.25rem" }}>
          Kelola armada dan pantau pemesanan aktif Anda secara real-time.
        </p>
      </div>

      {/* ── STATS CARDS GRID (3 Columns) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
        {[
          {
            label: "Total Armada Mobil",
            value: stats?.totalCars || 0,
            sub: `${stats?.availableCars || 0} unit siap disewa hari ini`,
            icon: (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="3" width="22" height="13" rx="2" ry="2" />
                <polygon points="12 12 8 16 16 16 12 12" />
                <line x1="12" y1="3" x2="12" y2="13" />
              </svg>
            ),
            color: "var(--primary)",
            extra: (
              <div style={{ marginTop: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.25rem", fontWeight: 600 }}>
                  <span>Tingkat Ketersediaan</span>
                  <span>{stats && stats.totalCars > 0 ? Math.round((stats.availableCars / stats.totalCars) * 100) : 0}%</span>
                </div>
                <div style={{ width: "100%", height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{
                    width: `${stats && stats.totalCars > 0 ? (stats.availableCars / stats.totalCars) * 100 : 0}%`,
                    height: "100%", background: "var(--primary)", borderRadius: 3
                  }} />
                </div>
              </div>
            )
          },
          {
            label: "Total Pesanan Masuk",
            value: stats?.totalBookings || 0,
            sub: `${stats?.pendingBookings || 0} pemesanan perlu diproses`,
            icon: (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            ),
            color: "var(--secondary)",
            extra: (
              <div style={{ marginTop: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.25rem", fontWeight: 600 }}>
                  <span>Pemesanan Menunggu</span>
                  <span>{stats?.pendingBookings || 0} unit</span>
                </div>
                <div style={{ width: "100%", height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{
                    width: `${stats && stats.totalBookings > 0 ? (stats.pendingBookings / stats.totalBookings) * 100 : 0}%`,
                    height: "100%", background: "var(--secondary)", borderRadius: 3
                  }} />
                </div>
              </div>
            )
          },
          {
            label: "Estimasi Pendapatan",
            value: `Rp ${(stats?.totalRevenue || 0).toLocaleString("id-ID")}`,
            sub: "Total omset terhitung dari sewa aktif",
            icon: (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            ),
            color: "var(--success)",
            extra: (
              <div style={{ marginTop: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.25rem", fontWeight: 600 }}>
                  <span>Tingkat Utilitas Unit</span>
                  <span>{utilizationRate}% terpakai</span>
                </div>
                <div style={{ width: "100%", height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{
                    width: `${utilizationRate}%`,
                    height: "100%", background: "var(--success)", borderRadius: 3
                  }} />
                </div>
              </div>
            )
          }
        ].map((s) => (
          <div
            key={s.label}
            className="stat-card-v2"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-xl)",
              padding: "1.75rem",
              boxShadow: "var(--shadow-sm)",
              transition: "var(--transition)",
              cursor: "default"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
              <div>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {s.label}
                </span>
                <div style={{ fontFamily: "Sora, sans-serif", fontSize: "1.875rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "0.5rem" }}>
                  {s.value}
                </div>
              </div>
              <div style={{
                width: 46, height: 46, borderRadius: "var(--radius-md)",
                background: `${s.color}10`, color: s.color,
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                {s.icon}
              </div>
            </div>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
              {s.sub}
            </p>
            {s.extra}
          </div>
        ))}
      </div>

      {/* ── SPLIT GRID LAYOUT (Left: Bookings, Right: Status & Quick Actions) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1.2fr", gap: "2rem" }}>
        
        {/* ── LEFT: RECENT BOOKINGS TABLE ── */}
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl)",
          overflow: "hidden",
          boxShadow: "var(--shadow-sm)"
        }}>
          <div style={{
            padding: "1.5rem",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--text-primary)" }}>Pemesanan Terbaru</h3>
              <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>Daftar rental masuk dari customer</p>
            </div>
            <Link href="/admin/bookings" className="btn btn-sm btn-outline" id="admin-see-all-bookings"
              style={{ fontWeight: 700, fontSize: "0.8125rem", padding: "0.5rem 1rem" }}>
              Semua Pesanan →
            </Link>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--surface-2)" }}>
                  <th style={{ padding: "1rem 1.5rem", textTransform: "none", letterSpacing: "normal", fontSize: "0.875rem", fontWeight: 700 }}>Customer</th>
                  <th style={{ padding: "1rem 1.5rem", textTransform: "none", letterSpacing: "normal", fontSize: "0.875rem", fontWeight: 700 }}>Kendaraan</th>
                  <th style={{ padding: "1rem 1.5rem", textTransform: "none", letterSpacing: "normal", fontSize: "0.875rem", fontWeight: 700 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b) => {
                  const cfg = STATUS_CONFIG[b.status] || { bg: "#f1f5f9", color: "#475569", label: b.status };
                  return (
                    <tr key={b.id} style={{ borderBottom: "1px solid var(--border)", transition: "var(--transition)" }}>
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <div>
                          <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.9rem" }}>{b.user.name}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{b.user.email}</div>
                        </div>
                      </td>
                      <td style={{ padding: "1rem 1.5rem", fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)" }}>
                        {b.car.brand} {b.car.name}
                      </td>
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <span style={{
                          display: "inline-block", padding: "0.25rem 0.625rem",
                          borderRadius: "var(--radius-md)", fontSize: "0.75rem", fontWeight: 700,
                          backgroundColor: cfg.bg, color: cfg.color
                        }}>
                          {cfg.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {recentBookings.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: "center", color: "var(--text-muted)", padding: "3rem" }}>
                      Belum ada data pemesanan rental mobil.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── RIGHT: SUMMARY & QUICK ACTIONS ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* Booking Status Summary */}
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-xl)",
            padding: "1.5rem",
            boxShadow: "var(--shadow-sm)"
          }}>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "1.25rem" }}>
              Status Rental Saat Ini
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              {[
                { label: "Menunggu Konfirmasi", count: stats?.pendingBookings || 0, cfg: STATUS_CONFIG.PENDING },
                { label: "Pemesanan Disetujui", count: stats?.confirmedBookings || 0, cfg: STATUS_CONFIG.CONFIRMED },
                { label: "Sewa Selesai", count: stats?.completedBookings || 0, cfg: STATUS_CONFIG.COMPLETED },
                { label: "Pemesanan Dibatalkan", count: stats?.cancelledBookings || 0, cfg: STATUS_CONFIG.CANCELLED },
              ].map((item) => (
                <div key={item.label} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.75rem 1rem",
                  background: "var(--surface-2)",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border)"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: item.cfg.color }} />
                    <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)" }}>{item.label}</span>
                  </div>
                  <span style={{ fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "1.125rem", color: "var(--text-primary)" }}>
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Card */}
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-xl)",
            padding: "1.5rem",
            boxShadow: "var(--shadow-sm)"
          }}>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "1.25rem" }}>
              Aksi Cepat
            </h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              {[
                { href: "/admin/cars", label: "Tambah Mobil", icon: "🚗", desc: "Kelola armada", id: "admin-add-car" },
                { href: "/admin/blog", label: "Tulis Blog", icon: "✍️", desc: "Tulis promo/tips", id: "admin-write-blog" },
                { href: "/admin/gallery", label: "Galeri Foto", icon: "🖼️", desc: "Upload foto unit", id: "admin-upload-photo" },
                { href: "/admin/config", label: "Edit Website", icon: "⚙️", desc: "Atur nama/kontak", id: "admin-add-faq" },
              ].map((a) => (
                <Link key={a.href} href={a.href} id={a.id}
                  style={{
                    display: "block",
                    padding: "1rem",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--border)",
                    textDecoration: "none",
                    transition: "var(--transition)",
                    background: "var(--surface-2)"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--primary)";
                    e.currentTarget.style.background = "var(--primary-light)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.background = "var(--surface-2)";
                  }}
                >
                  <div style={{ fontSize: "1.25rem", marginBottom: "0.375rem" }}>{a.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--text-primary)", marginBottom: "0.125rem" }}>{a.label}</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{a.desc}</div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
