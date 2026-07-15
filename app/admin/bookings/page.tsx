"use client";

import { useState, useEffect } from "react";

interface Booking {
  id: string;
  carId: string;
  carName: string;
  carBrand: string;
  carYear: number;
  carType: string;
  customerName: string;
  customerWa: string;
  pickupDate: string;
  duration: number;
  endDate: string;
  pickupLocation: string;
  driverOption: string;
  selectedAdminName: string;
  selectedAdminWa: string;
  pricePerDay: number;
  totalPrice: number;
  status: string;
  customerNote?: string;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

interface Car {
  id: string;
  name: string;
  brand: string;
  pricePerDay: number;
}

const STATUS_OPTIONS = ["ALL", "PENDING_CONFIRMATION", "CONFIRMED", "CANCELLED", "COMPLETED"];
const STATUS_LABELS: Record<string, string> = {
  ALL: "Semua",
  PENDING_CONFIRMATION: "Menunggu Konfirmasi",
  CONFIRMED: "Dikonfirmasi",
  CANCELLED: "Dibatalkan",
  COMPLETED: "Selesai"
};
const STATUS_BADGE: Record<string, string> = {
  PENDING_CONFIRMATION: "badge-warning",
  CONFIRMED: "badge-success",
  CANCELLED: "badge-error",
  COMPLETED: "badge-info"
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [search, setSearch] = useState("");

  // Modal States
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [editForm, setEditForm] = useState({
    customerName: "",
    customerWa: "",
    carId: "",
    pickupDate: "",
    duration: 1,
    pickupLocation: "",
    driverOption: "lepas_kunci",
    selectedAdminName: "",
    selectedAdminWa: "",
    status: "PENDING_CONFIRMATION",
    adminNote: "",
  });

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "100" });
    if (filterStatus !== "ALL") params.set("status", filterStatus);
    if (search) params.set("search", search);

    fetch(`/api/bookings?${params}`)
      .then((r) => r.json())
      .then((d) => setBookings(d.data?.bookings || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [filterStatus, search]);

  useEffect(() => {
    // Fetch cars for the editing dropdown
    fetch("/api/cars?limit=100")
      .then((r) => r.json())
      .then((d) => setCars(d.data?.cars || []));
  }, []);

  const handleDelete = async (id: string, customer: string) => {
    if (!confirm(`Hapus data booking atas nama "${customer}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
    if (res.ok) {
      load();
    } else {
      const data = await res.json();
      alert(data.error || "Gagal menghapus booking");
    }
  };

  const handleEditClick = (booking: Booking) => {
    setEditingBooking(booking);
    setEditForm({
      customerName: booking.customerName,
      customerWa: booking.customerWa,
      carId: booking.carId,
      pickupDate: booking.pickupDate.split("T")[0],
      duration: booking.duration,
      pickupLocation: booking.pickupLocation,
      driverOption: booking.driverOption,
      selectedAdminName: booking.selectedAdminName,
      selectedAdminWa: booking.selectedAdminWa,
      status: booking.status,
      adminNote: booking.adminNote || "",
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;

    const res = await fetch(`/api/bookings/${editingBooking.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });

    if (res.ok) {
      setEditingBooking(null);
      load();
    } else {
      const data = await res.json();
      alert(data.error || "Gagal mengupdate booking");
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Booking ID", "Customer", "WhatsApp", "Mobil", "Tanggal Ambil", "Durasi (Hari)", 
      "Tanggal Selesai", "Lokasi", "Pilihan Sewa", "Harga/Hari", "Total Harga", 
      "Admin Tujuan", "Status", "Catatan Customer", "Catatan Admin", "Created At"
    ];

    const rows = bookings.map(b => [
      b.id,
      b.customerName,
      b.customerWa,
      `${b.carBrand} ${b.carName}`,
      new Date(b.pickupDate).toLocaleDateString("id-ID"),
      b.duration,
      new Date(b.endDate).toLocaleDateString("id-ID"),
      b.pickupLocation,
      b.driverOption === "lepas_kunci" ? "Lepas Kunci" : "Dengan Supir",
      b.pricePerDay,
      b.totalPrice,
      `${b.selectedAdminName} (${b.selectedAdminWa})`,
      b.status,
      b.customerNote || "",
      b.adminNote || "",
      new Date(b.createdAt).toLocaleDateString("id-ID")
    ]);

    const csvContent = "\uFEFF" + [
      headers.join(","),
      ...rows.map(e => e.map(val => {
        const strVal = String(val).replace(/"/g, '""');
        return `"${strVal}"`;
      }).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Data_Booking_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>Manajemen Booking</h1>
          <p style={{ color: "var(--text-secondary)" }}>{bookings.length} total booking ditemukan</p>
        </div>
        <button onClick={exportToCSV} className="btn btn-primary" id="btn-export-excel" style={{ gap: "0.5rem" }}>
          📥 Export Excel/CSV
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center", marginBottom: "2rem" }}>
        {/* Status Filter */}
        <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap", flex: 1 }}>
          {STATUS_OPTIONS.map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)} id={`filter-status-${s}`}
              style={{
                padding: "0.5rem 1rem", borderRadius: "var(--radius-full)", border: "1.5px solid",
                cursor: "pointer", fontWeight: 600, fontSize: "0.8125rem", transition: "var(--transition)",
                background: filterStatus === s ? "var(--primary)" : "transparent",
                borderColor: filterStatus === s ? "var(--primary)" : "var(--border)",
                color: filterStatus === s ? "white" : "var(--text-secondary)",
              }}>
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <input
          type="text"
          placeholder="🔍 Cari nama, wa, atau mobil..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-control"
          id="search-booking"
          style={{ maxWidth: 300, minWidth: 200 }}
        />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID Booking</th>
              <th>Customer</th>
              <th>Mobil</th>
              <th>Pengambilan</th>
              <th>Durasi</th>
              <th>Total Biaya</th>
              <th>Admin</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: "3rem" }}>
                  <div className="spinner" style={{ margin: "0 auto" }} />
                </td>
              </tr>
            ) : bookings.map((b) => (
              <tr key={b.id} id={`booking-row-${b.id}`}>
                <td style={{ fontSize: "0.8125rem", fontFamily: "monospace", color: "var(--text-muted)" }}>
                  {b.id}
                </td>
                <td>
                  <div style={{ fontWeight: 700 }}>{b.customerName}</div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{b.customerWa}</div>
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>{b.carBrand} {b.carName}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{b.carType} · {b.driverOption === "lepas_kunci" ? "Lepas Kunci" : "Dengan Supir"}</div>
                </td>
                <td>
                  <div style={{ fontSize: "0.875rem" }}>
                    {new Date(b.pickupDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                </td>
                <td style={{ fontWeight: 600 }}>{b.duration} hari</td>
                <td style={{ fontWeight: 700, color: "var(--primary)" }}>
                  Rp {b.totalPrice.toLocaleString("id-ID")}
                </td>
                <td>
                  <div style={{ fontSize: "0.875rem" }}>{b.selectedAdminName}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>+{b.selectedAdminWa}</div>
                </td>
                <td>
                  <span className={`badge ${STATUS_BADGE[b.status] || "badge-info"}`}>
                    {STATUS_LABELS[b.status] || b.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", gap: "0.375rem" }}>
                    <button onClick={() => setViewingBooking(b)} className="btn btn-sm btn-ghost" style={{ background: "var(--surface-2)", color: "var(--text-primary)", border: "1px solid var(--border)", padding: "0.25rem 0.5rem" }}>
                      Detail
                    </button>
                    <button onClick={() => handleEditClick(b)} className="btn btn-sm btn-outline" style={{ padding: "0.25rem 0.5rem" }}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(b.id, b.customerName)} className="btn btn-sm btn-danger" style={{ padding: "0.25rem 0.5rem" }}>
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && bookings.length === 0 && (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", color: "var(--text-muted)", padding: "3rem" }}>
                  Tidak ada data booking ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* VIEW DETAIL MODAL */}
      {viewingBooking && (
        <div className="modal-overlay" onClick={() => setViewingBooking(null)}>
          <div className="modal" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detail Booking</h3>
              <button onClick={() => setViewingBooking(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.25rem" }}>✕</button>
            </div>
            <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>ID Booking</label>
                  <p style={{ fontFamily: "monospace", fontSize: "0.875rem" }}>{viewingBooking.id}</p>
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Status</label>
                  <div>
                    <span className={`badge ${STATUS_BADGE[viewingBooking.status]}`}>
                      {STATUS_LABELS[viewingBooking.status]}
                    </span>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Customer</label>
                  <p style={{ fontWeight: 700 }}>{viewingBooking.customerName}</p>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>{viewingBooking.customerWa}</p>
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Mobil</label>
                  <p style={{ fontWeight: 700 }}>{viewingBooking.carBrand} {viewingBooking.carName}</p>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>{viewingBooking.carYear} · {viewingBooking.carType}</p>
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Tanggal Ambil</label>
                  <p>{new Date(viewingBooking.pickupDate).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Estimasi Selesai</label>
                  <p>{new Date(viewingBooking.endDate).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Durasi</label>
                  <p>{viewingBooking.duration} hari</p>
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Pilihan Sewa</label>
                  <p>{viewingBooking.driverOption === "lepas_kunci" ? "Lepas Kunci (tanpa supir)" : "Dengan Supir"}</p>
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Harga Sewa/Hari</label>
                  <p>Rp {viewingBooking.pricePerDay.toLocaleString("id-ID")}</p>
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Total Estimasi Biaya</label>
                  <p style={{ fontWeight: 700, color: "var(--primary)" }}>Rp {viewingBooking.totalPrice.toLocaleString("id-ID")}</p>
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Admin Tujuan</label>
                  <p>{viewingBooking.selectedAdminName} ({viewingBooking.selectedAdminWa})</p>
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Waktu Pemesanan</label>
                  <p>{new Date(viewingBooking.createdAt).toLocaleString("id-ID")}</p>
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Lokasi Penjemputan</label>
                <p style={{ background: "var(--surface-2)", padding: "0.75rem", borderRadius: "var(--radius-md)" }}>{viewingBooking.pickupLocation}</p>
              </div>

              {viewingBooking.customerNote && (
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Catatan Pelanggan</label>
                  <p style={{ background: "var(--surface-2)", padding: "0.75rem", borderRadius: "var(--radius-md)", fontSize: "0.875rem" }}>{viewingBooking.customerNote}</p>
                </div>
              )}

              <div>
                <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Catatan Internal Admin</label>
                <p style={{ background: "#fef3c7", color: "#92400e", padding: "0.75rem", borderRadius: "var(--radius-md)", fontSize: "0.875rem" }}>
                  {viewingBooking.adminNote || "(Tidak ada catatan)"}
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setViewingBooking(null)} className="btn btn-primary btn-sm">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingBooking && (
        <div className="modal-overlay" onClick={() => setEditingBooking(null)}>
          <div className="modal" style={{ maxWidth: 600 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Data Booking</h3>
              <button onClick={() => setEditingBooking(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.25rem" }}>✕</button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label">Nama Customer *</label>
                    <input type="text" className="form-control" required
                      value={editForm.customerName}
                      onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">No. WhatsApp Customer *</label>
                    <input type="text" className="form-control" required
                      value={editForm.customerWa}
                      onChange={(e) => setEditForm({ ...editForm, customerWa: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pilih Kendaraan *</label>
                    <select className="form-control" required
                      value={editForm.carId}
                      onChange={(e) => setEditForm({ ...editForm, carId: e.target.value })}
                    >
                      {cars.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.brand} {c.name} (Rp {c.pricePerDay.toLocaleString("id-ID")}/hari)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tanggal Ambil *</label>
                    <input type="date" className="form-control" required
                      value={editForm.pickupDate}
                      onChange={(e) => setEditForm({ ...editForm, pickupDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Durasi (Hari) *</label>
                    <input type="number" className="form-control" required min={1}
                      value={editForm.duration}
                      onChange={(e) => setEditForm({ ...editForm, duration: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pilihan Sewa *</label>
                    <select className="form-control" required
                      value={editForm.driverOption}
                      onChange={(e) => setEditForm({ ...editForm, driverOption: e.target.value })}
                    >
                      <option value="lepas_kunci">Lepas Kunci</option>
                      <option value="dengan_supir">Dengan Supir</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Admin Penerima *</label>
                    <input type="text" className="form-control" required
                      value={editForm.selectedAdminName}
                      onChange={(e) => setEditForm({ ...editForm, selectedAdminName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">No. WA Admin *</label>
                    <input type="text" className="form-control" required
                      value={editForm.selectedAdminWa}
                      onChange={(e) => setEditForm({ ...editForm, selectedAdminWa: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Lokasi Penjemputan *</label>
                  <input type="text" className="form-control" required
                    value={editForm.pickupLocation}
                    onChange={(e) => setEditForm({ ...editForm, pickupLocation: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Status Booking *</label>
                  <select className="form-control" required
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  >
                    {STATUS_OPTIONS.filter(s => s !== "ALL").map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Catatan Tambahan Admin</label>
                  <textarea className="form-control" rows={3} placeholder="Masukkan catatan internal atau instruksi supir..."
                    value={editForm.adminNote}
                    onChange={(e) => setEditForm({ ...editForm, adminNote: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setEditingBooking(null)} className="btn btn-sm btn-ghost" style={{ background: "var(--surface-2)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>Batal</button>
                <button type="submit" className="btn btn-sm btn-primary">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
