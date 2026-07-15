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
  PENDING_CONFIRMATION: "Pending",
  CONFIRMED: "Dikonfirmasi",
  CANCELLED: "Dibatalkan",
  COMPLETED: "Selesai"
};

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

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [search, setSearch] = useState("");

  // Modal States
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
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

  // Stats calculation
  const totalCount = bookings.length;
  const pendingCount = bookings.filter(b => b.status === "PENDING_CONFIRMATION").length;
  const confirmedCount = bookings.filter(b => b.status === "CONFIRMED").length;
  const completedCount = bookings.filter(b => b.status === "COMPLETED").length;

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "PENDING_CONFIRMATION":
        return { bg: "rgba(245, 158, 11, 0.08)", text: "#d97706", border: "rgba(245, 158, 11, 0.2)" };
      case "CONFIRMED":
        return { bg: "rgba(16, 185, 129, 0.08)", text: "#059669", border: "rgba(16, 185, 129, 0.2)" };
      case "COMPLETED":
        return { bg: "rgba(59, 130, 246, 0.08)", text: "#2563eb", border: "rgba(59, 130, 246, 0.2)" };
      case "CANCELLED":
        return { bg: "rgba(239, 68, 68, 0.08)", text: "#dc2626", border: "rgba(239, 68, 68, 0.2)" };
      default:
        return { bg: "var(--surface-2)", text: "var(--text-secondary)", border: "var(--border)" };
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      
      {/* Dynamic Styling */}
      <style dangerouslySetInnerHTML={{ __html: `
        .bookings-title {
          font-family: 'Sora', sans-serif;
          font-weight: 800;
          color: var(--text-primary);
          font-size: 2rem;
          letter-spacing: -0.02em;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
        }
        @media (max-width: 992px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 576px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
        .stat-card-modern {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 1.25rem 1.5rem;
          box-shadow: var(--shadow-sm);
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .stat-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          flex-shrink: 0;
        }
        .filter-pill {
          padding: 0.5rem 1.25rem;
          border-radius: 30px;
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 0.8125rem;
          cursor: pointer;
          transition: var(--transition);
        }
        .filter-pill:hover {
          background: var(--surface-2);
          color: var(--text-primary);
        }
        .filter-pill.active {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
          box-shadow: 0 4px 12px rgba(23, 23, 23, 0.15);
        }
        .search-bar-modern {
          width: 100%;
          max-width: 320px;
          padding: 0.6rem 1rem 0.6rem 2.5rem;
          border: 1px solid var(--border);
          border-radius: 10px;
          font-family: inherit;
          font-size: 0.875rem;
          outline: none;
          color: var(--text-primary);
          background: var(--surface);
          transition: var(--transition);
        }
        .search-bar-modern:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(23, 23, 23, 0.05);
        }
        .search-wrapper-modern {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
          max-width: 320px;
        }
        .search-icon-modern {
          position: absolute;
          left: 0.875rem;
          color: var(--text-secondary);
          pointer-events: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .table-container-modern {
          width: 100%;
          overflow-x: auto;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          box-shadow: var(--shadow-sm);
        }
        .table-modern {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          min-width: 1100px;
        }
        .table-modern th {
          background: var(--surface-2);
          padding: 1.125rem 1.25rem;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-secondary);
          border-bottom: 1px solid var(--border);
          white-space: nowrap;
        }
        .table-modern td {
          padding: 1.25rem;
          border-bottom: 1px solid var(--border);
          font-size: 0.875rem;
          color: var(--text-primary);
          vertical-align: middle;
          white-space: nowrap;
        }
        .table-modern tr:last-child td {
          border-bottom: none;
        }
        .table-modern tr:hover td {
          background: rgba(23, 23, 23, 0.015);
        }
        .badge-pill-modern {
          padding: 0.3rem 0.875rem;
          border-radius: 30px;
          font-size: 0.75rem;
          font-weight: 700;
          border: 1px solid;
          display: inline-block;
          text-align: center;
        }
        .action-btn-modern {
          border: 1px solid var(--border);
          background: transparent;
          cursor: pointer;
          padding: 0.45rem 0.875rem;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 600;
          transition: var(--transition);
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          white-space: nowrap;
        }
        .action-btn-modern:hover {
          background: var(--surface-2);
          color: var(--text-primary);
        }
        .action-btn-danger {
          border-color: rgba(239, 68, 68, 0.2);
          color: #dc2626;
        }
        .action-btn-danger:hover {
          background: rgba(239, 68, 68, 0.05);
          color: #b91c1c;
        }
        .modal-glass {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 24px;
          box-shadow: var(--shadow-xl);
          width: 100%;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          animation: modalSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          overflow: hidden;
        }
        @keyframes modalSlideUp {
          from { transform: translateY(24px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .modal-body-scrollable {
          overflow-y: auto;
          flex: 1;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .modal-grid-details {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.25rem;
        }
        @media (max-width: 576px) {
          .modal-grid-details {
            grid-template-columns: 1fr;
          }
        }
        .modal-detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .modal-detail-label {
          font-size: 0.675rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-secondary);
        }
        .modal-detail-val {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }
      ` }} />

      {/* ── TOP HEADER SECTION ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 className="bookings-title">Manajemen Booking</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
            Kelola, setujui, batalkan, atau ekspor data pesanan sewa mobil pelanggan.
          </p>
        </div>
        <button onClick={exportToCSV} className="btn btn-primary" id="btn-export-excel" style={{ borderRadius: "12px", padding: "0.75rem 1.25rem", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
          📥 Ekspor Excel/CSV
        </button>
      </div>

      {/* ── METRICS SUMMARY STATS ── */}
      <div className="stats-grid">
        
        <div className="stat-card-modern">
          <div className="stat-icon-wrapper" style={{ background: "rgba(23, 23, 23, 0.05)", color: "var(--text-primary)" }}>
            📋
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>Total Pesanan</div>
            <div style={{ fontSize: "1.375rem", fontWeight: 800, fontFamily: "Sora, sans-serif" }}>{totalCount}</div>
          </div>
        </div>

        <div className="stat-card-modern">
          <div className="stat-icon-wrapper" style={{ background: "rgba(245, 158, 11, 0.1)", color: "#d97706" }}>
            ⏳
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>Persetujuan Pending</div>
            <div style={{ fontSize: "1.375rem", fontWeight: 800, fontFamily: "Sora, sans-serif", color: "#d97706" }}>{pendingCount}</div>
          </div>
        </div>

        <div className="stat-card-modern">
          <div className="stat-icon-wrapper" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#059669" }}>
            ✅
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>Dikonfirmasi</div>
            <div style={{ fontSize: "1.375rem", fontWeight: 800, fontFamily: "Sora, sans-serif", color: "#059669" }}>{confirmedCount}</div>
          </div>
        </div>

        <div className="stat-card-modern">
          <div className="stat-icon-wrapper" style={{ background: "rgba(59, 130, 246, 0.1)", color: "#2563eb" }}>
            🎉
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>Selesai</div>
            <div style={{ fontSize: "1.375rem", fontWeight: 800, fontFamily: "Sora, sans-serif", color: "#2563eb" }}>{completedCount}</div>
          </div>
        </div>

      </div>

      {/* ── FILTER & SEARCH BAR ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
        
        {/* Status Filters */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`filter-pill ${filterStatus === s ? "active" : ""}`}
              id={`filter-status-${s}`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="search-wrapper-modern">
          <span className="search-icon-modern">🔍</span>
          <input
            type="text"
            placeholder="Cari nama, WA, atau mobil..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-bar-modern"
            id="search-booking"
          />
        </div>

      </div>

      {/* ── DATA TABLE CONTAINER ── */}
      <div className="table-container-modern">
        <table className="table-modern">
          <thead>
            <tr>
              <th>ID Booking</th>
              <th>Customer</th>
              <th>Mobil</th>
              <th>Tanggal Ambil</th>
              <th>Durasi</th>
              <th>Total Biaya</th>
              <th>Admin Penerima</th>
              <th>Status</th>
              <th style={{ textAlign: "right", paddingRight: "1.5rem" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: "4rem" }}>
                  <div className="spinner" style={{ margin: "0 auto" }} />
                </td>
              </tr>
            ) : bookings.map((b) => {
              const badge = getStatusBadgeStyle(b.status);
              return (
                <tr key={b.id} id={`booking-row-${b.id}`}>
                  {/* ID */}
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontSize: "0.75rem",
                          color: "var(--text-secondary)",
                          fontWeight: 500
                        }}
                      >
                        #{b.id.substring(0, 8)}...
                      </span>
                      <button
                        onClick={() => {
                          copyToClipboard(b.id).then(() => {
                            setCopiedId(b.id);
                            setTimeout(() => setCopiedId(null), 2000);
                          });
                        }}
                        style={{
                          background: copiedId === b.id ? "rgba(16, 185, 129, 0.1)" : "var(--surface-2)",
                          border: `1px solid ${copiedId === b.id ? "#10b981" : "var(--border)"}`,
                          color: copiedId === b.id ? "#10b981" : "var(--text-primary)",
                          borderRadius: "6px",
                          cursor: "pointer",
                          padding: "0.2rem 0.4rem",
                          fontSize: "0.7rem",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.2rem",
                          transition: "all 0.2s ease"
                        }}
                        title="Salin ID Booking"
                      >
                        {copiedId === b.id ? "✓ Disalin" : "📋 Salin"}
                      </button>
                    </div>
                  </td>

                  {/* Customer */}
                  <td>
                    <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{b.customerName}</div>
                    <a href={`https://wa.me/${b.customerWa.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer" style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.25rem", marginTop: "0.25rem" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#25D366" style={{ display: "inline-block" }}>
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                      </svg>
                      <span style={{ fontSize: "0.8125rem" }}>{b.customerWa}</span>
                    </a>
                  </td>

                  {/* Car */}
                  <td>
                    <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{b.carBrand} {b.carName}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                      <span>{b.carType}</span>
                      <span style={{ color: "var(--border)" }}>•</span>
                      <span style={{ fontWeight: 700, color: b.driverOption === "lepas_kunci" ? "#0284c7" : "#059669" }}>
                        {b.driverOption === "lepas_kunci" ? "Lepas Kunci" : "Dengan Supir"}
                      </span>
                    </div>
                  </td>

                  {/* Pickup Date */}
                  <td>
                    <div style={{ fontWeight: 600 }}>
                      {new Date(b.pickupDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </td>

                  {/* Duration */}
                  <td style={{ fontWeight: 600 }}>
                    {b.duration} hari
                  </td>

                  {/* Price */}
                  <td style={{ fontWeight: 800, color: "var(--text-primary)" }}>
                    Rp {b.totalPrice.toLocaleString("id-ID")}
                  </td>

                  {/* Admin */}
                  <td>
                    <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{b.selectedAdminName}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.15rem" }}>WA: {b.selectedAdminWa}</div>
                  </td>

                  {/* Status */}
                  <td>
                    <span className="badge-pill-modern" style={{ backgroundColor: badge.bg, color: badge.text, borderColor: badge.border }}>
                      {STATUS_LABELS[b.status] || b.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td style={{ paddingRight: "1.5rem" }}>
                    <div style={{ display: "flex", gap: "0.375rem", justifyContent: "flex-end" }}>
                      <button onClick={() => setViewingBooking(b)} className="action-btn-modern">
                        🔍 Detail
                      </button>
                      <button onClick={() => handleEditClick(b)} className="action-btn-modern" style={{ color: "var(--primary)", borderColor: "rgba(23, 23, 23, 0.15)" }}>
                        ✏️ Edit
                      </button>
                      <button onClick={() => handleDelete(b.id, b.customerName)} className="action-btn-modern action-btn-danger">
                        🗑️ Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!loading && bookings.length === 0 && (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", color: "var(--text-secondary)", padding: "4rem" }}>
                  ☕ Tidak ada data booking yang cocok dengan pencarian Anda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── VIEW DETAIL MODAL ── */}
      {viewingBooking && (
        <div className="modal-overlay" onClick={() => setViewingBooking(null)} style={{ background: "rgba(10, 10, 10, 0.4)", backdropFilter: "blur(8px)", zIndex: 1000 }}>
          <div className="modal-glass" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
            
            <div className="modal-header" style={{ padding: "1.5rem 2rem", borderBottom: "1px solid var(--border)" }}>
              <h3 style={{ margin: 0, fontFamily: "Sora, sans-serif", fontWeight: 800 }}>Detail Riwayat Booking</h3>
              <button onClick={() => setViewingBooking(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.25rem", color: "var(--text-secondary)" }}>✕</button>
            </div>

            {/* Scrollable Modal Body */}
            <div className="modal-body-scrollable">
              
              <div className="modal-grid-details">
                <div className="modal-detail-item">
                  <span className="modal-detail-label">ID Booking</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.15rem" }}>
                    <p className="modal-detail-val" style={{ fontFamily: "monospace", fontSize: "0.8125rem", color: "var(--text-secondary)", margin: 0 }}>
                      {viewingBooking.id}
                    </p>
                    <button
                      onClick={() => {
                        copyToClipboard(viewingBooking.id).then(() => {
                          setCopiedId(viewingBooking.id);
                          setTimeout(() => setCopiedId(null), 2000);
                        });
                      }}
                      style={{
                        background: copiedId === viewingBooking.id ? "rgba(16, 185, 129, 0.1)" : "var(--surface-2)",
                        border: `1px solid ${copiedId === viewingBooking.id ? "#10b981" : "var(--border)"}`,
                        color: copiedId === viewingBooking.id ? "#10b981" : "var(--text-primary)",
                        borderRadius: "6px",
                        cursor: "pointer",
                        padding: "0.2rem 0.4rem",
                        fontSize: "0.7rem",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.2rem",
                        transition: "all 0.2s ease"
                      }}
                      title="Salin ID Booking"
                    >
                      {copiedId === viewingBooking.id ? "✓ Disalin" : "📋 Salin"}
                    </button>
                  </div>
                </div>
                <div className="modal-detail-item">
                  <span className="modal-detail-label">Status Transaksi</span>
                  <div>
                    <span className="badge-pill-modern" style={{ 
                      backgroundColor: getStatusBadgeStyle(viewingBooking.status).bg, 
                      color: getStatusBadgeStyle(viewingBooking.status).text, 
                      borderColor: getStatusBadgeStyle(viewingBooking.status).border 
                    }}>
                      {STATUS_LABELS[viewingBooking.status]}
                    </span>
                  </div>
                </div>

                <div className="modal-detail-item">
                  <span className="modal-detail-label">Nama Pelanggan</span>
                  <p className="modal-detail-val">{viewingBooking.customerName}</p>
                  <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>WA: {viewingBooking.customerWa}</span>
                </div>
                <div className="modal-detail-item">
                  <span className="modal-detail-label">Kendaraan</span>
                  <p className="modal-detail-val">{viewingBooking.carBrand} {viewingBooking.carName}</p>
                  <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>Tahun {viewingBooking.carYear} · {viewingBooking.carType}</span>
                </div>

                <div className="modal-detail-item">
                  <span className="modal-detail-label">Tanggal Penjemputan</span>
                  <p className="modal-detail-val" style={{ fontSize: "0.875rem" }}>
                    {new Date(viewingBooking.pickupDate).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                <div className="modal-detail-item">
                  <span className="modal-detail-label">Estimasi Pengembalian</span>
                  <p className="modal-detail-val" style={{ fontSize: "0.875rem" }}>
                    {new Date(viewingBooking.endDate).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>

                <div className="modal-detail-item">
                  <span className="modal-detail-label">Durasi & Layanan</span>
                  <p className="modal-detail-val">{viewingBooking.duration} hari</p>
                  <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                    Layanan: {viewingBooking.driverOption === "lepas_kunci" ? "Lepas Kunci (Tanpa Supir)" : "Dengan Supir"}
                  </span>
                </div>
                <div className="modal-detail-item">
                  <span className="modal-detail-label">Rincian Biaya</span>
                  <p className="modal-detail-val" style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                    Tarif Harian: Rp {viewingBooking.pricePerDay.toLocaleString("id-ID")}
                  </p>
                  <span style={{ fontWeight: 800, color: "var(--primary)", fontSize: "1rem" }}>
                    Total: Rp {viewingBooking.totalPrice.toLocaleString("id-ID")}
                  </span>
                </div>

                <div className="modal-detail-item">
                  <span className="modal-detail-label">Admin Penerima</span>
                  <p className="modal-detail-val">{viewingBooking.selectedAdminName}</p>
                  <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>WA: {viewingBooking.selectedAdminWa}</span>
                </div>
                <div className="modal-detail-item">
                  <span className="modal-detail-label">Waktu Order</span>
                  <p className="modal-detail-val" style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--text-secondary)" }}>
                    {new Date(viewingBooking.createdAt).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <span className="modal-detail-label">Alamat / Lokasi Penjemputan</span>
                <p style={{ margin: 0, background: "var(--surface-2)", padding: "0.875rem 1rem", borderRadius: "12px", fontSize: "0.875rem", lineHeight: 1.5, color: "var(--text-primary)" }}>
                  {viewingBooking.pickupLocation}
                </p>
              </div>

              {viewingBooking.customerNote && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <span className="modal-detail-label">Catatan Pelanggan</span>
                  <p style={{ margin: 0, background: "var(--surface-2)", padding: "0.875rem 1rem", borderRadius: "12px", fontSize: "0.875rem", lineHeight: 1.5, color: "var(--text-primary)" }}>
                    {viewingBooking.customerNote}
                  </p>
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <span className="modal-detail-label">Catatan Internal Admin</span>
                <p style={{ margin: 0, background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.15)", color: "#b45309", padding: "0.875rem 1rem", borderRadius: "12px", fontSize: "0.875rem", lineHeight: 1.5 }}>
                  {viewingBooking.adminNote || "Tidak ada catatan internal dari admin."}
                </p>
              </div>

            </div>

            <div className="modal-footer" style={{ padding: "1.25rem 2rem", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", background: "var(--surface-2)", flexShrink: 0 }}>
              <button onClick={() => setViewingBooking(null)} className="btn btn-primary btn-sm" style={{ borderRadius: "8px" }}>
                Tutup Rincian
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── EDIT MODAL ── */}
      {editingBooking && (
        <div className="modal-overlay" onClick={() => setEditingBooking(null)} style={{ background: "rgba(10, 10, 10, 0.4)", backdropFilter: "blur(8px)", zIndex: 1000 }}>
          <div className="modal-glass" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
            
            <div className="modal-header" style={{ padding: "1.5rem 2rem", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
              <h3 style={{ margin: 0, fontFamily: "Sora, sans-serif", fontWeight: 800 }}>Sunting Data Booking</h3>
              <button onClick={() => setEditingBooking(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.25rem", color: "var(--text-secondary)" }}>✕</button>
            </div>

            {/* Scrollable Form */}
            <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
              <div className="modal-body-scrollable">
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: "0.75rem", fontWeight: 700 }}>Nama Customer *</label>
                    <input type="text" className="form-control" required
                      value={editForm.customerName}
                      onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })}
                      style={{ borderRadius: "10px", padding: "0.65rem 0.875rem" }}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: "0.75rem", fontWeight: 700 }}>No. WhatsApp Customer *</label>
                    <input type="text" className="form-control" required
                      value={editForm.customerWa}
                      onChange={(e) => setEditForm({ ...editForm, customerWa: e.target.value })}
                      style={{ borderRadius: "10px", padding: "0.65rem 0.875rem" }}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: "0.75rem", fontWeight: 700 }}>Pilih Kendaraan *</label>
                    <select className="form-control" required
                      value={editForm.carId}
                      onChange={(e) => setEditForm({ ...editForm, carId: e.target.value })}
                      style={{ borderRadius: "10px", padding: "0.65rem 0.875rem", height: "auto" }}
                    >
                      {cars.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.brand} {c.name} (Rp {c.pricePerDay.toLocaleString("id-ID")}/hari)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: "0.75rem", fontWeight: 700 }}>Tanggal Ambil *</label>
                    <input type="date" className="form-control" required
                      value={editForm.pickupDate}
                      onChange={(e) => setEditForm({ ...editForm, pickupDate: e.target.value })}
                      style={{ borderRadius: "10px", padding: "0.65rem 0.875rem" }}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: "0.75rem", fontWeight: 700 }}>Durasi Sewa (Hari) *</label>
                    <input type="number" className="form-control" required min={1}
                      value={editForm.duration}
                      onChange={(e) => setEditForm({ ...editForm, duration: parseInt(e.target.value) || 1 })}
                      style={{ borderRadius: "10px", padding: "0.65rem 0.875rem" }}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: "0.75rem", fontWeight: 700 }}>Pilihan Driver *</label>
                    <select className="form-control" required
                      value={editForm.driverOption}
                      onChange={(e) => setEditForm({ ...editForm, driverOption: e.target.value })}
                      style={{ borderRadius: "10px", padding: "0.65rem 0.875rem", height: "auto" }}
                    >
                      <option value="lepas_kunci">Lepas Kunci</option>
                      <option value="dengan_supir">Dengan Supir</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: "0.75rem", fontWeight: 700 }}>Nama Admin Penerima *</label>
                    <input type="text" className="form-control" required
                      value={editForm.selectedAdminName}
                      onChange={(e) => setEditForm({ ...editForm, selectedAdminName: e.target.value })}
                      style={{ borderRadius: "10px", padding: "0.65rem 0.875rem" }}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: "0.75rem", fontWeight: 700 }}>No. WA Admin Penerima *</label>
                    <input type="text" className="form-control" required
                      value={editForm.selectedAdminWa}
                      onChange={(e) => setEditForm({ ...editForm, selectedAdminWa: e.target.value })}
                      style={{ borderRadius: "10px", padding: "0.65rem 0.875rem" }}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: "0.75rem", fontWeight: 700 }}>Lokasi Penjemputan *</label>
                  <input type="text" className="form-control" required
                    value={editForm.pickupLocation}
                    onChange={(e) => setEditForm({ ...editForm, pickupLocation: e.target.value })}
                    style={{ borderRadius: "10px", padding: "0.65rem 0.875rem" }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: "0.75rem", fontWeight: 700 }}>Status Transaksi *</label>
                  <select className="form-control" required
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    style={{ borderRadius: "10px", padding: "0.65rem 0.875rem", height: "auto" }}
                  >
                    {STATUS_OPTIONS.filter(s => s !== "ALL").map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: "0.75rem", fontWeight: 700 }}>Catatan Tambahan Admin</label>
                  <textarea className="form-control" rows={3} placeholder="Instruksi khusus, info supir, atau catatan admin..."
                    value={editForm.adminNote}
                    onChange={(e) => setEditForm({ ...editForm, adminNote: e.target.value })}
                    style={{ borderRadius: "10px", padding: "0.75rem", fontSize: "0.875rem" }}
                  />
                </div>

              </div>

              <div className="modal-footer" style={{ padding: "1.25rem 2rem", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: "0.75rem", background: "var(--surface-2)", flexShrink: 0 }}>
                <button type="button" onClick={() => setEditingBooking(null)} className="btn btn-sm btn-ghost" style={{ borderRadius: "8px", background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
                  Batal
                </button>
                <button type="submit" className="btn btn-sm btn-primary" style={{ borderRadius: "8px" }}>
                  Simpan Perubahan
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
