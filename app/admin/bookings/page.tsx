"use client";

import { useState, useEffect, useRef } from "react";

interface Booking {
  id: string;
  carId: string;
  carName: string;
  carBrand: string;
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

const BULAN_INDONESIA = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const HARI_INDONESIA = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function formatTanggalIndo(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return `${d.getDate()}/${BULAN_INDONESIA[d.getMonth()]}/${d.getFullYear()}`;
}

function formatTanggalIndoLengkap(dateStr: string): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  const hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  return `${hari[d.getDay()]}, ${d.getDate()} ${BULAN_INDONESIA[d.getMonth()]} ${d.getFullYear()}`;
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

/* ─── Custom Date Picker untuk Admin Filter ─── */
function AdminDatePickerFilter({
  value,
  onChange,
  onClear,
}: {
  value: string;
  onChange: (val: string) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const selectDay = (day: number) => {
    const selected = new Date(viewYear, viewMonth, day);
    selected.setHours(12, 0, 0, 0);
    const yyyy = selected.getFullYear();
    const mm = String(selected.getMonth() + 1).padStart(2, "0");
    const dd = String(selected.getDate()).padStart(2, "0");
    onChange(`${yyyy}-${mm}-${dd}`);
    setOpen(false);
  };

  const selectedDate = value ? new Date(value) : null;

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div ref={ref} style={{ position: "relative", width: "100%", maxWidth: 260 }}>
      <div style={{ display: "flex", gap: "0.375rem", alignItems: "center" }}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          style={{
            flex: 1,
            padding: "0.6rem 0.875rem",
            borderRadius: "10px",
            border: "1px solid var(--border)",
            background: value ? "var(--primary-light)" : "var(--surface)",
            color: value ? "var(--primary-dark)" : "var(--text-primary)",
            fontWeight: 600,
            fontSize: "0.8125rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.5rem",
            transition: "var(--transition)",
            outline: "none",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
            <span>📅</span>
            <span>{value ? formatTanggalIndo(value) : "Filter Tanggal..."}</span>
          </span>
          <span style={{ fontSize: "0.75rem", opacity: 0.6 }}>▼</span>
        </button>

        {value && (
          <button
            type="button"
            onClick={onClear}
            title="Hapus Filter Tanggal"
            style={{
              padding: "0.6rem 0.75rem",
              borderRadius: "10px",
              border: "1px solid var(--border)",
              background: "var(--surface-2)",
              color: "var(--text-secondary)",
              fontWeight: 700,
              fontSize: "0.8125rem",
              cursor: "pointer",
              transition: "var(--transition)"
            }}
          >
            ✕
          </button>
        )}
      </div>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", right: 0, left: 0,
          zIndex: 200, background: "var(--surface)",
          border: "1px solid var(--border)", borderRadius: "16px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
          padding: "1rem", minWidth: 280,
          animation: "datePickerIn 0.2s ease",
        }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <button type="button" onClick={prevMonth}
              style={{
                width: 30, height: 30, borderRadius: "50%",
                border: "1px solid var(--border)", background: "var(--surface-2)",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.8125rem", color: "var(--text-primary)"
              }}>◀</button>
            <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--text-primary)" }}>
              {BULAN_INDONESIA[viewMonth]} {viewYear}
            </span>
            <button type="button" onClick={nextMonth}
              style={{
                width: 30, height: 30, borderRadius: "50%",
                border: "1px solid var(--border)", background: "var(--surface-2)",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.8125rem", color: "var(--text-primary)"
              }}>▶</button>
          </div>

          {/* Day headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px", marginBottom: "4px" }}>
            {HARI_INDONESIA.map((h) => (
              <div key={h} style={{ textAlign: "center", fontSize: "0.6875rem", fontWeight: 700, color: "var(--text-muted)", padding: "4px 0" }}>{h}</div>
            ))}
          </div>

          {/* Days grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}>
            {cells.map((day, i) => {
              if (day === null) return <div key={`e-${i}`} />;
              const isSelected = selectedDate &&
                selectedDate.getDate() === day &&
                selectedDate.getMonth() === viewMonth &&
                selectedDate.getFullYear() === viewYear;
              const isToday =
                today.getDate() === day &&
                today.getMonth() === viewMonth &&
                today.getFullYear() === viewYear;

              return (
                <button
                  type="button"
                  key={day}
                  onClick={() => selectDay(day)}
                  style={{
                    width: "100%", aspectRatio: "1", borderRadius: "8px",
                    border: isToday && !isSelected ? "2px solid var(--primary)" : "2px solid transparent",
                    background: isSelected ? "var(--primary)" : "transparent",
                    color: isSelected ? "white" : "var(--text-primary)",
                    fontWeight: isSelected || isToday ? 700 : 500,
                    fontSize: "0.8125rem",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.15s ease"
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Quick actions */}
          <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button type="button" onClick={() => {
              const t = new Date();
              selectDay(t.getDate());
              setViewMonth(t.getMonth());
              setViewYear(t.getFullYear());
            }}
              style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--primary)", background: "none", border: "none", cursor: "pointer" }}>
              Hari Ini
            </button>
            {value && (
              <button type="button" onClick={() => { onClear(); setOpen(false); }}
                style={{ fontSize: "0.75rem", fontWeight: 600, color: "#dc2626", background: "none", border: "none", cursor: "pointer" }}>
                Reset
              </button>
            )}
            <button type="button" onClick={() => setOpen(false)}
              style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer" }}>
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterDate, setFilterDate] = useState("");
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
    if (filterDate) params.set("date", filterDate);
    if (search) params.set("search", search);

    fetch(`/api/bookings?${params}`)
      .then((r) => r.json())
      .then((d) => setBookings(d.data?.bookings || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [filterStatus, filterDate, search]);

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
      formatTanggalIndo(b.pickupDate),
      b.duration,
      formatTanggalIndo(b.endDate),
      b.pickupLocation,
      b.driverOption === "lepas_kunci" ? "Lepas Kunci" : "Dengan Supir",
      b.pricePerDay,
      b.totalPrice,
      `${b.selectedAdminName} (${b.selectedAdminWa})`,
      b.status,
      b.customerNote || "",
      b.adminNote || "",
      formatTanggalIndo(b.createdAt)
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
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem", width: "100%", maxWidth: "100%", overflowX: "hidden" }}>
      
      {/* Dynamic Responsive Styling */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes datePickerIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .bookings-title {
          font-family: 'Sora', sans-serif;
          font-weight: 800;
          color: var(--text-primary);
          font-size: 1.875rem;
          letter-spacing: -0.02em;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }

        .stat-card-modern {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 1.125rem 1.25rem;
          box-shadow: var(--shadow-sm);
          display: flex;
          align-items: center;
          gap: 0.875rem;
        }

        .stat-icon-wrapper {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          flex-shrink: 0;
        }

        .controls-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          background: var(--surface);
          padding: 1.25rem;
          border-radius: 18px;
          border: 1px solid var(--border);
          box-shadow: var(--shadow-sm);
        }

        .controls-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .status-pills-row {
          display: flex;
          gap: 0.375rem;
          flex-wrap: wrap;
          overflow-x: auto;
          padding-bottom: 2px;
        }

        .filter-pill {
          padding: 0.45rem 1rem;
          border-radius: 30px;
          border: 1px solid var(--border);
          background: var(--surface-2);
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 0.8125rem;
          cursor: pointer;
          transition: var(--transition);
          white-space: nowrap;
        }

        .filter-pill:hover {
          background: var(--surface);
          color: var(--text-primary);
        }

        .filter-pill.active {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
          box-shadow: 0 4px 12px rgba(23, 23, 23, 0.15);
        }

        .search-and-date-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
          width: 100%;
        }

        .search-bar-modern {
          flex: 1;
          min-width: 220px;
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
          flex: 1;
          min-width: 220px;
        }

        .search-icon-modern {
          position: absolute;
          left: 0.875rem;
          color: var(--text-secondary);
          pointer-events: none;
        }

        /* Table view for Desktop */
        .desktop-table-container {
          width: 100%;
          overflow-x: auto;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 18px;
          box-shadow: var(--shadow-sm);
        }

        .table-modern {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          min-width: 1050px;
        }

        .table-modern th {
          background: var(--surface-2);
          padding: 1rem 1.125rem;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-secondary);
          border-bottom: 1px solid var(--border);
          white-space: nowrap;
        }

        .table-modern td {
          padding: 1.125rem;
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
          padding: 0.3rem 0.75rem;
          border-radius: 30px;
          font-size: 0.75rem;
          font-weight: 700;
          border: 1px solid;
          display: inline-block;
          text-align: center;
          white-space: nowrap;
        }

        .action-btn-modern {
          border: 1px solid var(--border);
          background: transparent;
          cursor: pointer;
          padding: 0.4rem 0.75rem;
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

        /* Mobile Cards View */
        .mobile-cards-container {
          display: none;
          flex-direction: column;
          gap: 1rem;
        }

        .booking-mobile-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 1.25rem;
          box-shadow: var(--shadow-sm);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .booking-mobile-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 0.75rem;
          padding-bottom: 0.875rem;
          border-bottom: 1px solid var(--border);
        }

        .booking-mobile-card-body {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .booking-mobile-info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.84rem;
        }

        .booking-mobile-card-footer {
          display: flex;
          gap: 0.5rem;
          padding-top: 0.875rem;
          border-top: 1px solid var(--border);
          justify-content: flex-end;
        }

        /* Modal styling */
        .modal-glass {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          box-shadow: var(--shadow-xl);
          width: 100%;
          max-height: 90vh;
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
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .modal-grid-details {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .modal-detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .modal-detail-label {
          font-size: 0.6875rem;
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

        /* Media Queries */
        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .desktop-table-container {
            display: none;
          }
          .mobile-cards-container {
            display: flex;
          }
          .bookings-title {
            font-size: 1.5rem;
          }
          .modal-grid-details {
            grid-template-columns: 1fr;
          }
          .search-and-date-row {
            flex-direction: column;
            align-items: stretch;
          }
          .search-wrapper-modern {
            width: 100%;
            max-width: none;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          .booking-mobile-card-footer {
            flex-wrap: wrap;
          }
          .booking-mobile-card-footer button {
            flex: 1;
            justify-content: center;
          }
        }
      ` }} />

      {/* ── TOP HEADER SECTION ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 className="bookings-title">Manajemen Booking</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Kelola, setujui, batalkan, atau ekspor data pesanan sewa mobil pelanggan.
          </p>
        </div>
        <button onClick={exportToCSV} className="btn btn-primary" id="btn-export-excel" style={{ borderRadius: "12px", padding: "0.65rem 1.125rem", display: "inline-flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
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
            <div style={{ fontSize: "1.25rem", fontWeight: 800, fontFamily: "Sora, sans-serif" }}>{totalCount}</div>
          </div>
        </div>

        <div className="stat-card-modern">
          <div className="stat-icon-wrapper" style={{ background: "rgba(245, 158, 11, 0.1)", color: "#d97706" }}>
            ⏳
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>Pending</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 800, fontFamily: "Sora, sans-serif", color: "#d97706" }}>{pendingCount}</div>
          </div>
        </div>

        <div className="stat-card-modern">
          <div className="stat-icon-wrapper" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#059669" }}>
            ✅
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>Dikonfirmasi</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 800, fontFamily: "Sora, sans-serif", color: "#059669" }}>{confirmedCount}</div>
          </div>
        </div>

        <div className="stat-card-modern">
          <div className="stat-icon-wrapper" style={{ background: "rgba(59, 130, 246, 0.1)", color: "#2563eb" }}>
            🎉
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>Selesai</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 800, fontFamily: "Sora, sans-serif", color: "#2563eb" }}>{completedCount}</div>
          </div>
        </div>

      </div>

      {/* ── FILTER & SEARCH BAR SECTION ── */}
      <div className="controls-wrapper">
        
        {/* Status Filters Pill Row */}
        <div className="status-pills-row">
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

        {/* Search & Date Filter Row */}
        <div className="search-and-date-row">
          
          {/* Search bar */}
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

          {/* Date Filter Picker (Format 11/Juli/2026) */}
          <AdminDatePickerFilter
            value={filterDate}
            onChange={(val) => setFilterDate(val)}
            onClear={() => setFilterDate("")}
          />

        </div>

      </div>

      {/* ── DESKTOP DATA TABLE VIEW ── */}
      <div className="desktop-table-container">
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
              <th style={{ textAlign: "right", paddingRight: "1.25rem" }}>Aksi</th>
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

                  {/* Pickup Date (Format 11/Juli/2026) */}
                  <td>
                    <div style={{ fontWeight: 600 }}>
                      {formatTanggalIndo(b.pickupDate)}
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
                  <td style={{ paddingRight: "1.25rem" }}>
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
                  ☕ Tidak ada data booking yang cocok dengan filter Anda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── MOBILE CARDS VIEW ── */}
      <div className="mobile-cards-container">
        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <div className="spinner" style={{ margin: "0 auto" }} />
          </div>
        ) : bookings.map((b) => {
          const badge = getStatusBadgeStyle(b.status);
          return (
            <div key={b.id} className="booking-mobile-card">
              
              {/* Header */}
              <div className="booking-mobile-card-header">
                <div>
                  <span style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.2rem" }}>
                    #{b.id.substring(0, 10)}...
                  </span>
                  <div style={{ fontWeight: 800, fontSize: "1rem", color: "var(--text-primary)" }}>{b.customerName}</div>
                </div>
                <span className="badge-pill-modern" style={{ backgroundColor: badge.bg, color: badge.text, borderColor: badge.border }}>
                  {STATUS_LABELS[b.status] || b.status}
                </span>
              </div>

              {/* Body */}
              <div className="booking-mobile-card-body">
                <div className="booking-mobile-info-row">
                  <span style={{ color: "var(--text-secondary)" }}>🚗 Mobil:</span>
                  <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{b.carBrand} {b.carName}</span>
                </div>
                <div className="booking-mobile-info-row">
                  <span style={{ color: "var(--text-secondary)" }}>📅 Tanggal Ambil:</span>
                  <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{formatTanggalIndo(b.pickupDate)}</span>
                </div>
                <div className="booking-mobile-info-row">
                  <span style={{ color: "var(--text-secondary)" }}>⏱ Durasi & Layanan:</span>
                  <span style={{ fontWeight: 600 }}>{b.duration} hari ({b.driverOption === "lepas_kunci" ? "Lepas Kunci" : "Supir"})</span>
                </div>
                <div className="booking-mobile-info-row">
                  <span style={{ color: "var(--text-secondary)" }}>📱 WhatsApp:</span>
                  <a href={`https://wa.me/${b.customerWa.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer" style={{ color: "#25D366", fontWeight: 700, textDecoration: "none" }}>
                    {b.customerWa}
                  </a>
                </div>
                <div className="booking-mobile-info-row" style={{ paddingTop: "0.375rem", borderTop: "1px dashed var(--border)" }}>
                  <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>💰 Total Biaya:</span>
                  <span style={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--primary)" }}>
                    Rp {b.totalPrice.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="booking-mobile-card-footer">
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

            </div>
          );
        })}

        {!loading && bookings.length === 0 && (
          <div style={{ textAlign: "center", color: "var(--text-secondary)", padding: "3rem", background: "var(--surface)", borderRadius: "16px", border: "1px solid var(--border)" }}>
            ☕ Tidak ada data booking yang cocok dengan filter Anda.
          </div>
        )}
      </div>

      {/* ── VIEW DETAIL MODAL ── */}
      {viewingBooking && (
        <div className="modal-overlay" onClick={() => setViewingBooking(null)} style={{ background: "rgba(10, 10, 10, 0.4)", backdropFilter: "blur(8px)", zIndex: 1000 }}>
          <div className="modal-glass" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
            
            <div className="modal-header" style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "1.125rem" }}>Detail Riwayat Booking</h3>
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
                  <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>{viewingBooking.carType}</span>
                </div>

                <div className="modal-detail-item">
                  <span className="modal-detail-label">Tanggal Penjemputan</span>
                  <p className="modal-detail-val" style={{ fontSize: "0.875rem" }}>
                    {formatTanggalIndoLengkap(viewingBooking.pickupDate)}
                  </p>
                </div>

                <div className="modal-detail-item">
                  <span className="modal-detail-label">Estimasi Pengembalian</span>
                  <p className="modal-detail-val" style={{ fontSize: "0.875rem" }}>
                    {formatTanggalIndoLengkap(viewingBooking.endDate)}
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
                    {formatTanggalIndoLengkap(viewingBooking.createdAt)}
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

            <div className="modal-footer" style={{ padding: "1rem 1.5rem", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", background: "var(--surface-2)", flexShrink: 0 }}>
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
            
            <div className="modal-header" style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
              <h3 style={{ margin: 0, fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "1.125rem" }}>Sunting Data Booking</h3>
              <button onClick={() => setEditingBooking(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.25rem", color: "var(--text-secondary)" }}>✕</button>
            </div>

            {/* Scrollable Form */}
            <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
              <div className="modal-body-scrollable">
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
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

              <div className="modal-footer" style={{ padding: "1rem 1.5rem", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: "0.75rem", background: "var(--surface-2)", flexShrink: 0 }}>
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
