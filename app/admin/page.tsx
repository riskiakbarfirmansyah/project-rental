"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Stats {
  totalCars: number; availableCars: number; totalUsers: number;
  totalBookings: number; pendingBookings: number; confirmedBookings: number;
  completedBookings: number; cancelledBookings: number;
  unreadMessages: number; totalRevenue: number;
}

interface RecentBooking {
  id: string; status: string; totalPrice: number; createdAt: string;
  user: { name: string; email: string };
  car: { name: string; brand: string };
}

const STATUS_BADGE: Record<string, string> = {
  PENDING: "badge-warning", CONFIRMED: "badge-info",
  ONGOING: "badge-primary", COMPLETED: "badge-success", CANCELLED: "badge-error"
};
const STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu", CONFIRMED: "Dikonfirmasi",
  ONGOING: "Berlangsung", COMPLETED: "Selesai", CANCELLED: "Dibatalkan"
};

export default function AdminDashboard() {
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

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", marginBottom: "0.375rem" }}>Dashboard</h1>
        <p style={{ color: "var(--text-secondary)" }}>Selamat datang di panel admin RentalKu</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.25rem", marginBottom: "2rem" }}>
        {[
          { label: "Total Mobil", value: stats?.totalCars || 0, sub: `${stats?.availableCars || 0} tersedia`, icon: "🚗", color: "var(--primary)" },
          { label: "Total Pengguna", value: stats?.totalUsers || 0, sub: "Customer terdaftar", icon: "👥", color: "#7c3aed" },
          { label: "Total Booking", value: stats?.totalBookings || 0, sub: `${stats?.pendingBookings || 0} menunggu`, icon: "📅", color: "var(--secondary)" },
          { label: "Total Pendapatan", value: `Rp ${((stats?.totalRevenue || 0) / 1000000).toFixed(1)}jt`, sub: "Dari booking aktif", icon: "💰", color: "var(--success)" },
        ].map((s) => (
          <div key={s.label} className="stat-card" id={`stat-${s.label.toLowerCase().replace(/\s/g, "-")}`}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div>
                <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.375rem" }}>
                  {s.label}
                </p>
                <div style={{ fontFamily: "Sora, sans-serif", fontSize: "1.875rem", fontWeight: 800, color: s.color }}>
                  {s.value}
                </div>
              </div>
              <div style={{
                width: 48, height: 48, borderRadius: "var(--radius-md)",
                background: `${s.color}18`, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "1.375rem"
              }}>
                {s.icon}
              </div>
            </div>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Booking status summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Menunggu", count: stats?.pendingBookings || 0, badge: "badge-warning" },
          { label: "Dikonfirmasi", count: stats?.confirmedBookings || 0, badge: "badge-info" },
          { label: "Selesai", count: stats?.completedBookings || 0, badge: "badge-success" },
          { label: "Dibatalkan", count: stats?.cancelledBookings || 0, badge: "badge-error" },
        ].map((s) => (
          <div key={s.label} style={{ background: "var(--surface)", borderRadius: "var(--radius-lg)", padding: "1.25rem", border: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className={`badge ${s.badge}`}>{s.label}</span>
            <span style={{ fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "1.375rem" }}>{s.count}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem" }}>
        {/* Recent Bookings */}
        <div className="table-container">
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "1rem" }}>Booking Terbaru</h3>
            <Link href="/admin/bookings" className="btn btn-sm btn-outline" id="admin-see-all-bookings">Lihat Semua</Link>
          </div>
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Mobil</th>
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((b) => (
                <tr key={b.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{b.user.name}</div>
                    <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{b.user.email}</div>
                  </td>
                  <td>{b.car.brand} {b.car.name}</td>
                  <td><span className={`badge ${STATUS_BADGE[b.status]}`}>{STATUS_LABEL[b.status]}</span></td>
                  <td style={{ fontWeight: 700, color: "var(--primary)" }}>
                    Rp {b.totalPrice.toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
              {recentBookings.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>
                    Belum ada booking
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Quick actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ background: "var(--surface)", borderRadius: "var(--radius-lg)", padding: "1.5rem", border: "1px solid var(--border)" }}>
            <h3 style={{ fontSize: "1rem", marginBottom: "1.25rem" }}>Aksi Cepat</h3>
            {[
              { href: "/admin/cars", label: "➕ Tambah Mobil", id: "admin-add-car" },
              { href: "/admin/blog", label: "✍️ Tulis Artikel", id: "admin-write-blog" },
              { href: "/admin/gallery", label: "📸 Upload Foto", id: "admin-upload-photo" },
              { href: "/admin/faq", label: "❓ Tambah FAQ", id: "admin-add-faq" },
            ].map((a) => (
              <Link key={a.href} href={a.href} id={a.id}
                style={{
                  display: "block", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)", fontWeight: 600, color: "var(--text-primary)",
                  textDecoration: "none", marginBottom: "0.5rem", transition: "var(--transition)",
                  fontSize: "0.9375rem"
                }}>
                {a.label}
              </Link>
            ))}
          </div>

          {stats && stats.unreadMessages > 0 && (
            <Link href="/admin/contact" id="admin-unread-messages" style={{
              display: "flex", alignItems: "center", gap: "1rem", padding: "1.25rem",
              background: "var(--warning-light)", border: "1px solid rgba(245,158,11,0.3)",
              borderRadius: "var(--radius-lg)", textDecoration: "none"
            }}>
              <span style={{ fontSize: "1.5rem" }}>📨</span>
              <div>
                <div style={{ fontWeight: 700, color: "#92400e" }}>Pesan Baru!</div>
                <div style={{ fontSize: "0.875rem", color: "#92400e" }}>{stats.unreadMessages} pesan belum dibaca</div>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
