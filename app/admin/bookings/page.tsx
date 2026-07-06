"use client";

import { useState, useEffect } from "react";

interface Booking {
  id: string; status: string; totalPrice: number; totalDays: number;
  startDate: string; endDate: string; pickupLocation: string; createdAt: string;
  user: { name: string; email: string; phone?: string };
  car: { name: string; brand: string };
}

const STATUS_OPTIONS = ["PENDING", "CONFIRMED", "ONGOING", "COMPLETED", "CANCELLED"];
const STATUS_LABELS: Record<string, string> = { PENDING: "Menunggu", CONFIRMED: "Dikonfirmasi", ONGOING: "Berlangsung", COMPLETED: "Selesai", CANCELLED: "Dibatalkan" };
const STATUS_BADGE: Record<string, string> = { PENDING: "badge-warning", CONFIRMED: "badge-info", ONGOING: "badge-primary", COMPLETED: "badge-success", CANCELLED: "badge-error" };

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  const load = (status?: string) => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "100" });
    if (status && status !== "all") params.set("status", status);
    fetch(`/api/bookings?${params}`)
      .then((r) => r.json())
      .then((d) => setBookings(d.data?.bookings || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const changeStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/bookings/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) load(filterStatus !== "all" ? filterStatus : undefined);
  };

  const handleFilter = (status: string) => {
    setFilterStatus(status);
    load(status !== "all" ? status : undefined);
  };

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>Manajemen Booking</h1>
        <p style={{ color: "var(--text-secondary)" }}>{bookings.length} total booking</p>
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        {[{ value: "all", label: "Semua" }, ...STATUS_OPTIONS.map((s) => ({ value: s, label: STATUS_LABELS[s] }))].map((f) => (
          <button key={f.value} onClick={() => handleFilter(f.value)} id={`filter-booking-${f.value}`}
            style={{
              padding: "0.5rem 1rem", borderRadius: "var(--radius-full)", border: "1.5px solid",
              cursor: "pointer", fontWeight: 600, fontSize: "0.875rem", transition: "var(--transition)",
              background: filterStatus === f.value ? "var(--primary)" : "transparent",
              borderColor: filterStatus === f.value ? "var(--primary)" : "var(--border)",
              color: filterStatus === f.value ? "white" : "var(--text-secondary)",
            }}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Mobil</th>
              <th>Tanggal</th>
              <th>Total</th>
              <th>Status</th>
              <th>Ubah Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}><div className="spinner" style={{ margin: "0 auto" }} /></td></tr>
            ) : bookings.map((b) => (
              <tr key={b.id} id={`booking-row-${b.id}`}>
                <td>
                  <div style={{ fontWeight: 700 }}>{b.user.name}</div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{b.user.email}</div>
                  {b.user.phone && <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{b.user.phone}</div>}
                </td>
                <td>{b.car.brand} {b.car.name}</td>
                <td>
                  <div style={{ fontSize: "0.875rem" }}>
                    {new Date(b.startDate).toLocaleDateString("id-ID")}
                  </div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                    s/d {new Date(b.endDate).toLocaleDateString("id-ID")} · {b.totalDays} hari
                  </div>
                </td>
                <td style={{ fontWeight: 700, color: "var(--primary)" }}>
                  Rp {b.totalPrice.toLocaleString("id-ID")}
                </td>
                <td><span className={`badge ${STATUS_BADGE[b.status]}`}>{STATUS_LABELS[b.status]}</span></td>
                <td>
                  <select value={b.status} onChange={(e) => changeStatus(b.id, e.target.value)}
                    className="form-control" id={`change-status-${b.id}`}
                    style={{ fontSize: "0.8125rem", padding: "0.375rem 0.75rem", maxWidth: 150 }}>
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {!loading && bookings.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>Tidak ada booking</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
