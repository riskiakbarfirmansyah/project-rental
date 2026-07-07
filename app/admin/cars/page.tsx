"use client";

import { useState, useEffect, useRef } from "react";

interface Car {
  id: string; name: string; brand: string; year: number; type: string;
  pricePerDay: number; seats: number; transmission: string; fuel: string;
  description: string; features: string; isAvailable: boolean; imageUrl?: string;
}

const CAR_TYPES = ["SEDAN", "SUV", "MPV", "PICKUP", "MINIBUS", "SPORT"];
const TRANSMISSIONS = ["MANUAL", "AUTOMATIC"];
const FUELS = ["BENSIN", "DIESEL", "ELECTRIC", "HYBRID"];
const TYPE_LABELS: Record<string, string> = { SEDAN: "Sedan", SUV: "SUV", MPV: "MPV", PICKUP: "Pickup", MINIBUS: "Minibus", SPORT: "Sport" };

const EMPTY_FORM = {
  name: "", brand: "", year: "2023", type: "SUV", pricePerDay: "0", seats: "5",
  transmission: "AUTOMATIC", fuel: "BENSIN", description: "", features: "",
  imageUrl: "", isAvailable: true,
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
    const features: string[] = (() => { try { return JSON.parse(car.features); } catch { return []; } })();
    setForm({
      name: car.name, brand: car.brand, year: String(car.year), type: car.type,
      pricePerDay: String(car.pricePerDay), seats: String(car.seats), transmission: car.transmission,
      fuel: car.fuel, description: car.description, features: features.join(", "),
      imageUrl: car.imageUrl || "", isAvailable: car.isAvailable,
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
      year: parseInt(String(form.year)) || 2023,
      pricePerDay: parseInt(String(form.pricePerDay)) || 0,
      seats: parseInt(String(form.seats)) || 1,
      features: form.features.split(",").map((f) => f.trim()).filter(Boolean),
      images: [],
    };
    const url = editing ? `/api/cars/${editing.id}` : "/api/cars";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json();
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

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>Manajemen Mobil</h1>
          <p style={{ color: "var(--text-secondary)" }}>{cars.length} total unit kendaraan</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd} id="admin-add-car-btn">
          ➕ Tambah Mobil
        </button>
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Kendaraan</th>
              <th>Tipe</th>
              <th>Harga/Hari</th>
              <th>Kapasitas</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}><div className="spinner" style={{ margin: "0 auto" }} /></td></tr>
            ) : cars.map((car) => (
              <tr key={car.id} id={`admin-car-row-${car.id}`}>
                <td>
                  <div style={{ fontWeight: 700 }}>{car.brand} {car.name}</div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{car.year} · {car.transmission}</div>
                </td>
                <td><span className="badge badge-primary">{TYPE_LABELS[car.type] || car.type}</span></td>
                <td style={{ fontWeight: 700, color: "var(--primary)" }}>
                  Rp {car.pricePerDay.toLocaleString("id-ID")}
                </td>
                <td>{car.seats} Orang</td>
                <td>
                  <button onClick={() => toggleAvailable(car)} id={`toggle-avail-${car.id}`}
                    className={`badge ${car.isAvailable ? "badge-success" : "badge-error"}`}
                    style={{ cursor: "pointer", border: "none" }}>
                    {car.isAvailable ? "✓ Tersedia" : "✗ Tidak"}
                  </button>
                </td>
                <td>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button className="btn btn-sm btn-outline" onClick={() => openEdit(car)} id={`edit-car-${car.id}`}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(car.id, car.name)} id={`delete-car-${car.id}`}>Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && cars.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>Belum ada mobil</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal" style={{ maxWidth: 680 }}>
            <div className="modal-header">
              <h3>{editing ? "Edit Mobil" : "Tambah Mobil Baru"}</h3>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.25rem" }} id="close-car-modal">✕</button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-error" style={{ marginBottom: "1rem" }}>{error}</div>}
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="car-brand">Brand *</label>
                    <input id="car-brand" className="form-control" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="car-name">Nama Model *</label>
                    <input id="car-name" className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="car-year">Tahun *</label>
                    <input id="car-year" type="number" className="form-control" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} min={1990} max={2026} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="car-type">Tipe *</label>
                    <select id="car-type" className="form-control" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                      {CAR_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="car-price">Harga/Hari (Rp) *</label>
                    <input id="car-price" type="number" className="form-control" value={form.pricePerDay} onChange={(e) => setForm({ ...form, pricePerDay: e.target.value })} min={0} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="car-seats">Kapasitas (kursi) *</label>
                    <input id="car-seats" type="number" className="form-control" value={form.seats} onChange={(e) => setForm({ ...form, seats: e.target.value })} min={1} max={20} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="car-transmission">Transmisi *</label>
                    <select id="car-transmission" className="form-control" value={form.transmission} onChange={(e) => setForm({ ...form, transmission: e.target.value })}>
                      {TRANSMISSIONS.map((t) => <option key={t} value={t}>{t === "AUTOMATIC" ? "Otomatis" : "Manual"}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="car-fuel">Bahan Bakar *</label>
                    <select id="car-fuel" className="form-control" value={form.fuel} onChange={(e) => setForm({ ...form, fuel: e.target.value })}>
                      {FUELS.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="car-description">Deskripsi *</label>
                  <textarea id="car-description" className="form-control" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="car-features">Fitur (pisahkan dengan koma)</label>
                  <input id="car-features" className="form-control" placeholder="AC, GPS, Bluetooth, Kamera Mundur" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Gambar Utama</label>
                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                    <input type="file" ref={fileRef} accept="image/*" onChange={handleUpload} style={{ display: "none" }} id="car-image-file" />
                    <button type="button" onClick={() => fileRef.current?.click()} className="btn btn-outline btn-sm" id="car-upload-img">
                      {uploading ? "Mengupload..." : "📁 Upload Gambar"}
                    </button>
                    {form.imageUrl && <span style={{ fontSize: "0.875rem", color: "var(--success)" }}>✓ {form.imageUrl}</span>}
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
                  <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)} id="cancel-car-form">Batal</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting} id="save-car-form">
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