"use client";

import { useState, useEffect, useRef } from "react";

interface Car {
  id: string; name: string; brand: string; type: string;
  pricePerDay: number; seats: number; transmission: string; fuel: string;
  description: string; isAvailable: boolean; withDriverOnly: boolean; imageUrl?: string;
}

const TRANSMISSIONS = ["MANUAL", "AUTOMATIC"];
const FUELS = ["BENSIN", "DIESEL", "ELECTRIC", "HYBRID"];

const EMPTY_FORM = {
  name: "", brand: "", pricePerDay: "0", seats: "5",
  transmission: "AUTOMATIC", fuel: "BENSIN", description: "",
  imageUrl: "", isAvailable: true, withDriverOnly: false,
};

export default function AdminCarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Car | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Modern UI states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("DEFAULT");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const load = () => {
    setLoading(true);
    fetch("/api/cars?limit=100")
      .then((r) => r.json())
      .then((d) => setCars(d.data?.cars || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setError(""); setShowForm(true); };
  const openEdit = (car: Car) => {
    setEditing(car);
    setForm({
      name: car.name, brand: car.brand,
      pricePerDay: Number(car.pricePerDay).toLocaleString("id-ID"), seats: String(car.seats), transmission: car.transmission,
      fuel: car.fuel, description: car.description,
      imageUrl: car.imageUrl || "", isAvailable: car.isAvailable,
      withDriverOnly: car.withDriverOnly || false,
    });
    setError("");
    setShowForm(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.success) setForm((f) => ({ ...f, imageUrl: data.data.url }));
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setError("");
    const payload = {
      ...form,
      pricePerDay: parseInt(String(form.pricePerDay).replace(/\D/g, "")) || 0,
      seats: parseInt(String(form.seats)) || 1,
    };
    console.log("[Cars] Submitting payload:", JSON.stringify(payload));
    const url = editing ? `/api/cars/${editing.id}` : "/api/cars";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json();
    console.log("[Cars] API response:", JSON.stringify(data));
    if (data.success) { setShowForm(false); load(); }
    else setError(data.error || "Gagal menyimpan");
    setSubmitting(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus mobil "${name}"? Data booking terkait juga akan terhapus.`)) return;
    await fetch(`/api/cars/${id}`, { method: "DELETE" });
    load();
  };

  const toggleAvailable = async (car: Car) => {
    await fetch(`/api/cars/${car.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isAvailable: !car.isAvailable }) });
    load();
  };

  // Filtered & Sorted cars
  const filteredCars = cars
    .filter((car) => {
      const matchSearch =
        car.name.toLowerCase().includes(search.toLowerCase()) ||
        car.brand.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "AVAILABLE" && car.isAvailable) ||
        (statusFilter === "UNAVAILABLE" && !car.isAvailable);
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === "PRICE_ASC") return a.pricePerDay - b.pricePerDay;
      if (sortBy === "PRICE_DESC") return b.pricePerDay - a.pricePerDay;
      return 0;
    });

  // Calculate statistics
  const totalCars = cars.length;
  const availableCarsCount = cars.filter((c) => c.isAvailable).length;
  const unavailableCarsCount = totalCars - availableCarsCount;
  const avgPrice = totalCars > 0 ? Math.round(cars.reduce((sum, c) => sum + c.pricePerDay, 0) / totalCars) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      
      {/* Scope Style Injector */}
      <style dangerouslySetInnerHTML={{ __html: `
        .modern-title {
          font-family: 'Sora', sans-serif;
          font-weight: 800;
          color: var(--text-primary);
          font-size: 2rem;
          letter-spacing: -0.02em;
        }
        .stats-mini-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.25rem;
        }
        .stat-card-mini {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: var(--shadow-sm);
          transition: var(--transition);
        }
        .stat-card-mini:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
          border-color: var(--border-dark);
        }
        .stat-icon-wrapper {
          width: 46px;
          height: 46px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
        }
        .filter-container {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 1rem;
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          align-items: center;
          justify-content: space-between;
          box-shadow: var(--shadow-sm);
        }
        .search-box-custom {
          position: relative;
          flex: 1;
          min-width: 260px;
        }
        .search-box-custom input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          border: 1px solid var(--border);
          border-radius: 12px;
          outline: none;
          font-family: inherit;
          font-size: 0.875rem;
          color: var(--text-primary);
          transition: var(--transition);
        }
        .search-box-custom input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(23, 23, 23, 0.05);
        }
        .search-icon-custom {
          position: absolute;
          left: 0.875rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          display: flex;
          align-items: center;
        }
        .filter-select-custom {
          padding: 0.75rem 2rem 0.75rem 1rem;
          border: 1px solid var(--border);
          border-radius: 12px;
          background-color: var(--surface);
          font-family: inherit;
          font-size: 0.875rem;
          color: var(--text-primary);
          outline: none;
          cursor: pointer;
          transition: var(--transition);
          min-width: 140px;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23737373' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          background-size: 1rem;
        }
        .filter-select-custom:focus {
          border-color: var(--primary);
        }
        .view-toggle-btn {
          display: flex;
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 3px;
          gap: 2px;
        }
        .view-toggle-btn button {
          border: none;
          background: transparent;
          padding: 0.5rem;
          border-radius: 9px;
          cursor: pointer;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
        }
        .view-toggle-btn button.active {
          background: var(--surface);
          color: var(--text-primary);
          box-shadow: var(--shadow-sm);
        }
        .car-grid-modern {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }
        .car-card-modern {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: var(--shadow-sm);
          transition: var(--transition-slow);
          display: flex;
          flex-direction: column;
          position: relative;
        }
        .car-card-modern:hover {
          transform: translateY(-6px);
          box-shadow: var(--shadow-xl);
          border-color: var(--border-dark);
        }
        .car-card-image-box {
          position: relative;
          height: 180px;
          background: #fdfdfd;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          border-bottom: 1px solid var(--border);
        }
        .car-card-img {
          max-width: 85%;
          max-height: 80%;
          object-fit: contain;
          transition: var(--transition-slow);
        }
        .car-card-modern:hover .car-card-img {
          transform: scale(1.06);
        }
        .car-card-floating-badge {
          position: absolute;
          top: 0.875rem;
          left: 0.875rem;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(8px);
          padding: 0.25rem 0.65rem;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-primary);
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--border);
          z-index: 10;
        }
        .car-card-avail-badge {
          position: absolute;
          top: 0.875rem;
          right: 0.875rem;
          box-shadow: var(--shadow-sm);
          z-index: 10;
        }
        .car-card-body {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          flex: 1;
          gap: 1rem;
        }
        .car-card-title {
          font-family: 'Sora', sans-serif;
          font-size: 1.0625rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .car-card-brand {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.15rem;
        }
        .car-specs-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.375rem;
        }
        .car-spec-badge {
          background: var(--surface-2);
          border: 1px solid var(--border);
          padding: 0.25rem 0.5rem;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        .car-card-price-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
          padding-top: 0.875rem;
          border-top: 1px solid var(--border);
        }
        .car-price-bold {
          font-family: 'Sora', sans-serif;
          font-size: 1.125rem;
          font-weight: 800;
          color: var(--text-primary);
        }
        .car-card-actions {
          display: flex;
          gap: 0.375rem;
        }
        .btn-icon-only {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border);
          background: var(--surface);
          cursor: pointer;
          color: var(--text-secondary);
          transition: var(--transition);
        }
        .btn-icon-only:hover {
          background: var(--surface-2);
          color: var(--text-primary);
        }
        .btn-icon-only.btn-delete-custom:hover {
          background: var(--error-light);
          color: var(--error);
          border-color: var(--error-light);
        }
        .btn-icon-only.btn-edit-custom:hover {
          background: var(--primary-light);
          color: var(--primary);
          border-color: var(--border-dark);
        }
        .ios-toggle {
          position: relative;
          display: inline-block;
          width: 40px;
          height: 22px;
        }
        .ios-toggle input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .ios-toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: var(--border-dark);
          transition: .2s ease-in-out;
          border-radius: 22px;
        }
        .ios-toggle-slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .2s ease-in-out;
          border-radius: 50%;
          box-shadow: var(--shadow-sm);
        }
        input:checked + .ios-toggle-slider {
          background-color: var(--success);
        }
        input:checked + .ios-toggle-slider:before {
          transform: translateX(18px);
        }
        .custom-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1.5rem;
          animation: fadeIn 0.15s ease-out;
        }
        .custom-modal-window {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          width: 100%;
          max-width: 640px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: var(--shadow-xl);
          animation: scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .custom-modal-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .custom-modal-body {
          padding: 1.5rem;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.96); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .drag-upload-area {
          border: 2px dashed var(--border-dark);
          border-radius: 12px;
          padding: 1.5rem;
          text-align: center;
          cursor: pointer;
          transition: var(--transition);
          background: var(--surface-2);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
        .drag-upload-area:hover {
          border-color: var(--primary);
          background: var(--surface);
        }
        .image-preview-wrapper {
          position: relative;
          width: 100%;
          height: 140px;
          background: #fbfbfb;
          border-radius: 12px;
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .image-preview-wrapper img {
          max-height: 85%;
          max-width: 85%;
          object-fit: contain;
        }
        .btn-remove-image {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: var(--error);
          color: white;
          border: none;
          width: 26px;
          height: 26px;
          border-radius: 99px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-sm);
        }
        .modern-table-wrapper {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: var(--shadow-sm);
        }
        .modern-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .modern-table th {
          background: var(--surface-2);
          padding: 0.875rem 1.25rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          border-bottom: 1px solid var(--border);
        }
        .modern-table td {
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--border);
          font-size: 0.875rem;
          color: var(--text-primary);
        }
        .modern-table tr:last-child td {
          border-bottom: none;
        }
        .modern-table tr:hover td {
          background: var(--surface-2);
        }
        .spinner-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 250px;
        }
        .empty-state {
          padding: 4rem 2rem;
          text-align: center;
          border: 1px dashed var(--border);
          border-radius: 16px;
          color: var(--text-secondary);
        }
      ` }} />

      {/* ── TOP HEADER SECTION ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 className="modern-title">Manajemen Mobil</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
            Kelola data armada dan status operasional kendaraan rental Anda.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAdd} id="admin-add-car-btn" style={{ borderRadius: "12px", padding: "0.75rem 1.25rem" }}>
          <span style={{ fontSize: "1.1rem" }}>➕</span> Tambah Mobil
        </button>
      </div>

      {/* ── SUMMARY STATS WIDGETS ── */}
      <div className="stats-mini-grid">
        <div className="stat-card-mini">
          <div className="stat-icon-wrapper" style={{ background: "rgba(23,23,23,0.06)", color: "var(--text-primary)" }}>
            🚗
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Total Armada</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)" }}>{totalCars} Unit</div>
          </div>
        </div>
        <div className="stat-card-mini">
          <div className="stat-icon-wrapper" style={{ background: "rgba(22,163,74,0.1)", color: "var(--success)" }}>
            ✓
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Tersedia</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--success)" }}>{availableCarsCount} Unit</div>
          </div>
        </div>
        <div className="stat-card-mini">
          <div className="stat-icon-wrapper" style={{ background: "rgba(220,38,38,0.1)", color: "var(--error)" }}>
            ✗
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Sedang Disewa</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--error)" }}>{unavailableCarsCount} Unit</div>
          </div>
        </div>
        <div className="stat-card-mini">
          <div className="stat-icon-wrapper" style={{ background: "rgba(64,64,64,0.1)", color: "var(--secondary)" }}>
            💰
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Rata-rata Tarif</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)" }}>Rp {avgPrice.toLocaleString("id-ID")}</div>
          </div>
        </div>
      </div>

      {/* ── SEARCH, FILTERS, & VIEW TOGGLE BAR ── */}
      <div className="filter-container">
        {/* Search */}
        <div className="search-box-custom">
          <span className="search-icon-custom">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Cari brand atau nama mobil..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filters & Sorting */}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
          {/* Status Filter */}
          <select
            className="filter-select-custom"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Semua Status</option>
            <option value="AVAILABLE">Tersedia</option>
            <option value="UNAVAILABLE">Tidak Tersedia</option>
          </select>

          {/* Sorting */}
          <select
            className="filter-select-custom"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ minWidth: "160px" }}
          >
            <option value="DEFAULT">Urutkan: Default</option>
            <option value="PRICE_ASC">Tarif: Termurah</option>
            <option value="PRICE_DESC">Tarif: Termahal</option>
          </select>

          {/* Grid/List Toggle */}
          <div className="view-toggle-btn">
            <button
              className={viewMode === "grid" ? "active" : ""}
              onClick={() => setViewMode("grid")}
              title="Grid View"
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              className={viewMode === "list" ? "active" : ""}
              onClick={() => setViewMode("list")}
              title="List View"
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── CARS MAIN CONTAINER ── */}
      {loading ? (
        <div className="spinner-wrapper">
          <div className="spinner" />
        </div>
      ) : filteredCars.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🔍</div>
          <h3 style={{ marginBottom: "0.5rem" }}>Tidak Ada Mobil Ditemukan</h3>
          <p>Coba ubah kata kunci pencarian atau sesuaikan filter yang sedang aktif.</p>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="car-grid-modern">
          {filteredCars.map((car) => (
            <div key={car.id} className="car-card-modern" id={`admin-car-row-${car.id}`}>
              {/* Image Container */}
              <div className="car-card-image-box">
                {/* Availability Toggle */}
                <div className="car-card-avail-badge">
                  <label className="ios-toggle">
                    <input
                      type="checkbox"
                      checked={car.isAvailable}
                      onChange={() => toggleAvailable(car)}
                      id={`toggle-avail-${car.id}`}
                    />
                    <span className="ios-toggle-slider"></span>
                  </label>
                </div>

                <img
                  src={car.imageUrl || "/images/placeholder-car.png"}
                  alt={car.name}
                  className="car-card-img"
                  onError={(e) => {
                    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23d4d4d4' stroke-width='1'%3E%3Crect x='2' y='5' width='20' height='14' rx='2'/%3E%3Ccircle cx='7' cy='15' r='2'/%3E%3Ccircle cx='17' cy='15' r='2'/%3E%3C/svg%3E";
                  }}
                />
              </div>

              {/* Card Body */}
              <div className="car-card-body">
                <div>
                  <div className="car-card-brand">{car.brand}</div>
                  <h3 className="car-card-title">{car.name}</h3>
                </div>

                {/* Specs badges */}
                <div className="car-specs-row">
                  <span className="car-spec-badge" title="Kapasitas Kursi">
                    👥 {car.seats} Kursi
                  </span>
                  <span className="car-spec-badge" title="Transmisi" style={{ textTransform: "capitalize" }}>
                    ⚙️ {car.transmission.toLowerCase()}
                  </span>
                  <span className="car-spec-badge" title="Bahan Bakar" style={{ textTransform: "capitalize" }}>
                    ⛽ {car.fuel.toLowerCase()}
                  </span>
                  {car.withDriverOnly && (
                    <span className="car-spec-badge" title="Hanya Dengan Supir" style={{ background: "rgba(37,99,235,0.1)", color: "#2563eb", borderColor: "#bfdbfe" }}>
                      👨‍✈️ Dengan Supir
                    </span>
                  )}
                </div>

                {/* Price & Actions */}
                <div className="car-card-price-section">
                  <div>
                    <span className="car-price-bold">Rp {car.pricePerDay.toLocaleString("id-ID")}</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "0.25rem" }}>/ hari</span>
                  </div>

                  <div className="car-card-actions">
                    <button
                      className="btn-icon-only btn-edit-custom"
                      onClick={() => openEdit(car)}
                      id={`edit-car-${car.id}`}
                      title="Edit Mobil"
                    >
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-2.036a5 5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      className="btn-icon-only btn-delete-custom"
                      onClick={() => handleDelete(car.id, car.name)}
                      id={`delete-car-${car.id}`}
                      title="Hapus Mobil"
                    >
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="modern-table-wrapper">
          <table className="modern-table">
            <thead>
              <tr>
                <th style={{ width: "40%" }}>Kendaraan</th>
                <th>Harga / Hari</th>
                <th>Kapasitas</th>
                <th>Status</th>
                <th style={{ width: "12%", textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredCars.map((car) => (
                <tr key={car.id} id={`admin-car-row-${car.id}`}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
                      <div style={{
                        width: "60px", height: "40px", background: "#fafafa", borderRadius: "6px",
                        border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden"
                      }}>
                        <img
                          src={car.imageUrl || "/images/placeholder-car.png"}
                          alt={car.name}
                          style={{ maxWidth: "90%", maxHeight: "90%", objectFit: "contain" }}
                          onError={(e) => {
                            e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='30' viewBox='0 0 24 24' fill='none' stroke='%23d4d4d4' stroke-width='1'%3E%3Crect x='2' y='5' width='20' height='14' rx='2'/%3E%3C/svg%3E";
                          }}
                        />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{car.brand} {car.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>
                          <span style={{ textTransform: "capitalize" }}>{car.transmission.toLowerCase()}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                    Rp {car.pricePerDay.toLocaleString("id-ID")}
                  </td>
                  <td style={{ fontWeight: 500 }}>
                    {car.seats} Kursi
                    {car.withDriverOnly && <div style={{ fontSize: "0.7rem", color: "#2563eb", marginTop: "0.25rem", fontWeight: 700 }}>👨‍✈️ Wajib Supir</div>}
                  </td>
                  <td>
                    <label className="ios-toggle">
                      <input
                        type="checkbox"
                        checked={car.isAvailable}
                        onChange={() => toggleAvailable(car)}
                        id={`toggle-avail-${car.id}`}
                      />
                      <span className="ios-toggle-slider"></span>
                    </label>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.375rem", justifyContent: "center" }}>
                      <button
                        className="btn-icon-only btn-edit-custom"
                        onClick={() => openEdit(car)}
                        id={`edit-car-${car.id}`}
                        title="Edit Mobil"
                      >
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-2.036a5 5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        className="btn-icon-only btn-delete-custom"
                        onClick={() => handleDelete(car.id, car.name)}
                        id={`delete-car-${car.id}`}
                        title="Hapus Mobil"
                      >
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── MODAL FORM ADD / EDIT ── */}
      {showForm && (
        <div className="custom-modal-backdrop" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="custom-modal-window">
            {/* Modal Header */}
            <div className="custom-modal-header">
              <h3 style={{ fontSize: "1.125rem", fontWeight: 800, margin: 0, fontFamily: "Sora, sans-serif" }}>
                {editing ? "Edit Informasi Kendaraan" : "Tambah Armada Baru"}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.125rem", color: "var(--text-muted)" }}
                id="close-car-modal"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="custom-modal-body">
              {error && (
                <div className="alert alert-error" style={{ marginBottom: "1.25rem", borderRadius: "10px", fontSize: "0.875rem" }}>
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  
                  {/* Brand */}
                  <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                    <label className="form-label" htmlFor="car-brand" style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Brand *</label>
                    <input
                      id="car-brand"
                      className="form-control"
                      placeholder="Contoh: Toyota, Honda"
                      value={form.brand}
                      onChange={(e) => setForm({ ...form, brand: e.target.value })}
                      required
                      style={{ borderRadius: "10px" }}
                    />
                  </div>

                  {/* Model */}
                  <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                    <label className="form-label" htmlFor="car-name" style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Nama Model *</label>
                    <input
                      id="car-name"
                      className="form-control"
                      placeholder="Contoh: Avanza, Civic"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      style={{ borderRadius: "10px" }}
                    />
                  </div>

                  {/* Tarif Sewa */}
                  <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                    <label className="form-label" htmlFor="car-price" style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Tarif per Hari (Rp) *</label>
                    <input
                      id="car-price"
                      type="text"
                      className="form-control"
                      placeholder="350.000"
                      value={form.pricePerDay}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, "");
                        const formatted = raw ? parseInt(raw, 10).toLocaleString("id-ID") : "";
                        setForm({ ...form, pricePerDay: formatted });
                      }}
                      required
                      style={{ borderRadius: "10px" }}
                    />
                  </div>

                  {/* Kapasitas Kursi */}
                  <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                    <label className="form-label" htmlFor="car-seats" style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Kapasitas (Kursi) *</label>
                    <input
                      id="car-seats"
                      type="number"
                      className="form-control"
                      value={form.seats}
                      onChange={(e) => setForm({ ...form, seats: e.target.value })}
                      min={1}
                      max={30}
                      required
                      style={{ borderRadius: "10px" }}
                    />
                  </div>

                  {/* Transmisi */}
                  <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                    <label className="form-label" htmlFor="car-transmission" style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Transmisi *</label>
                    <select
                      id="car-transmission"
                      className="form-control"
                      value={form.transmission}
                      onChange={(e) => setForm({ ...form, transmission: e.target.value })}
                      style={{ borderRadius: "10px" }}
                    >
                      {TRANSMISSIONS.map((t) => (
                        <option key={t} value={t}>{t === "AUTOMATIC" ? "Otomatis" : "Manual"}</option>
                      ))}
                    </select>
                  </div>

                  {/* Bahan Bakar */}
                  <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                    <label className="form-label" htmlFor="car-fuel" style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Bahan Bakar *</label>
                    <select
                      id="car-fuel"
                      className="form-control"
                      value={form.fuel}
                      onChange={(e) => setForm({ ...form, fuel: e.target.value })}
                      style={{ borderRadius: "10px" }}
                    >
                      {FUELS.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>

                </div>

                {/* Pengaturan Tambahan */}
                <div className="form-group" style={{ display: "flex", gap: "0.75rem", alignItems: "center", padding: "1rem", background: "var(--surface-2)", borderRadius: "10px", border: "1px solid var(--border)" }}>
                  <label className="ios-toggle">
                    <input
                      type="checkbox"
                      checked={form.withDriverOnly || false}
                      onChange={(e) => setForm({ ...form, withDriverOnly: e.target.checked })}
                      id="car-with-driver-only"
                    />
                    <span className="ios-toggle-slider"></span>
                  </label>
                  <div>
                    <div style={{ fontSize: "0.875rem", fontWeight: 700 }}>Hanya dengan Supir (Tidak Bisa Lepas Kunci)</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>Aktifkan ini jika mobil hanya diizinkan untuk disewa beserta supir. Pilihan lepas kunci akan disembunyikan.</div>
                  </div>
                </div>

                {/* Deskripsi */}
                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                  <label className="form-label" htmlFor="car-description" style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Deskripsi Singkat</label>
                  <textarea
                    id="car-description"
                    className="form-control"
                    rows={3}
                    placeholder="Tuliskan deskripsi lengkap atau keunggulan mobil ini..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    style={{ borderRadius: "10px", padding: "0.75rem" }}
                  />
                </div>

                {/* Upload Gambar */}
                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                  <label className="form-label" style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Gambar Utama</label>
                  
                  {form.imageUrl ? (
                    /* Image preview mode */
                    <div className="image-preview-wrapper">
                      <img src={form.imageUrl} alt="Car Preview" />
                      <button
                        type="button"
                        className="btn-remove-image"
                        onClick={() => setForm({ ...form, imageUrl: "" })}
                        title="Hapus Gambar"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    /* Upload Area */
                    <div className="drag-upload-area" onClick={() => fileRef.current?.click()}>
                      <div style={{ fontSize: "1.75rem" }}>📁</div>
                      <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                        {uploading ? "Mengunggah..." : "Pilih file gambar untuk diunggah"}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        Mendukung file PNG, JPG, JPEG maks 5MB
                      </div>
                      <input
                        type="file"
                        ref={fileRef}
                        accept="image/*"
                        onChange={handleUpload}
                        style={{ display: "none" }}
                        id="car-image-file"
                      />
                      <button type="button" className="btn btn-outline btn-sm" id="car-upload-img" style={{ display: "none" }}>
                        Upload
                      </button>
                    </div>
                  )}
                </div>

                {/* Modal Footer Actions */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.75rem", borderTop: "1px solid var(--border)", paddingTop: "1.25rem" }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setShowForm(false)}
                    id="cancel-car-form"
                    style={{ borderRadius: "10px", padding: "0.65rem 1.25rem" }}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                    id="save-car-form"
                    style={{ borderRadius: "10px", padding: "0.65rem 1.25rem" }}
                  >
                    {submitting ? "Menyimpan..." : (editing ? "Simpan Perubahan" : "Tambah Mobil")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}