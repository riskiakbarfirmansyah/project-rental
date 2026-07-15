"use client";

import { useState, useEffect } from "react";

interface Review {
  id: string;
  reviewerName: string;
  reviewerAvatar?: string;
  rating: number;
  content: string;
  source: string;
  reviewDate?: string;
  isVisible: boolean;
  order: number;
}

const EMPTY_FORM = {
  reviewerName: "", reviewerAvatar: "", rating: 5,
  content: "", source: "Google", reviewDate: "", isVisible: true, order: 0,
};

const Stars = ({ rating }: { rating: number }) => (
  <span style={{ color: "#f59e0b", fontSize: "1rem", letterSpacing: 1 }}>
    {"★".repeat(rating)}{"☆".repeat(5 - rating)}
  </span>
);

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Review | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    fetch("/api/reviews")
      .then((r) => r.json())
      .then((d) => setReviews(d.data?.reviews || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowForm(true);
  };

  const openEdit = (r: Review) => {
    setEditing(r);
    setForm({
      reviewerName: r.reviewerName,
      reviewerAvatar: r.reviewerAvatar || "",
      rating: r.rating,
      content: r.content,
      source: "Google",
      reviewDate: r.reviewDate || "",
      isVisible: r.isVisible,
      order: r.order,
    });
    setError("");
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setError("");
    const url = editing ? `/api/reviews/${editing.id}` : "/api/reviews";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, source: "Google", rating: Number(form.rating), order: Number(form.order) }),
    });
    const data = await res.json();
    if (data.success) { setShowForm(false); load(); }
    else setError(data.error || "Gagal menyimpan");
    setSubmitting(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus review dari "${name}"?`)) return;
    await fetch(`/api/reviews/${id}`, { method: "DELETE" });
    load();
  };

  const toggleVisible = async (r: Review) => {
    await fetch(`/api/reviews/${r.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isVisible: !r.isVisible }),
    });
    load();
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>Manajemen Review</h1>
          <p style={{ color: "var(--text-secondary)" }}>{reviews.length} review · Ditampilkan di halaman utama & tentang kami</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd} id="add-review-btn">
          ⭐ Tambah Review
        </button>
      </div>

      {/* Info box */}
      <div style={{
        background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.2)",
        borderRadius: "var(--radius-lg)", padding: "1rem 1.25rem", marginBottom: "1.5rem",
        display: "flex", gap: "0.75rem", alignItems: "flex-start",
      }}>
        <span style={{ fontSize: "1.25rem" }}>💡</span>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", margin: 0, lineHeight: 1.6 }}>
          Copy-paste review langsung dari Google Maps. Isi nama reviewer, rating bintang, dan isi review.
          Kamu bisa atur urutan tampil dengan field <strong>Urutan</strong> (angka kecil tampil lebih dulu).
          Toggle <strong>Tampilkan</strong> untuk sembunyikan review tanpa menghapusnya.
        </p>
      </div>

      {/* Review Cards */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}><div className="spinner" /></div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {reviews.map((r) => (
            <div key={r.id} id={`review-card-${r.id}`} style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-xl)", padding: "1.25rem",
              display: "flex", gap: "1.25rem", alignItems: "flex-start",
              opacity: r.isVisible ? 1 : 0.5,
            }}>
              {/* Avatar */}
              <div style={{
                width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                background: "var(--primary)", display: "flex", alignItems: "center",
                justifyContent: "center", fontWeight: 700, color: "white", fontSize: "1.125rem",
              }}>
                {r.reviewerAvatar || r.reviewerName.charAt(0).toUpperCase()}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.25rem" }}>
                  <span style={{ fontWeight: 700 }}>{r.reviewerName}</span>
                  <Stars rating={r.rating} />
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", background: "var(--bg)", padding: "0.125rem 0.5rem", borderRadius: "var(--radius-full)" }}>
                    Google Review
                  </span>
                  {r.reviewDate && <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{r.reviewDate}</span>}
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, margin: 0 }}>{r.content}</p>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                <button
                  onClick={() => toggleVisible(r)}
                  className={`badge ${r.isVisible ? "badge-success" : "badge-error"}`}
                  style={{ cursor: "pointer", border: "none" }}
                  id={`toggle-review-${r.id}`}
                >
                  {r.isVisible ? "✓ Tampil" : "✗ Sembunyikan"}
                </button>
                <button className="btn btn-sm btn-outline" onClick={() => openEdit(r)} id={`edit-review-${r.id}`}>Edit</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(r.id, r.reviewerName)} id={`delete-review-${r.id}`}>Hapus</button>
              </div>
            </div>
          ))}
          {reviews.length === 0 && (
            <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
              ⭐ Belum ada review. Klik "Tambah Review" untuk mulai.
            </div>
          )}
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h3>{editing ? "Edit Review" : "Tambah Review"}</h3>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.25rem" }} id="close-review-modal">✕</button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-error" style={{ marginBottom: "1rem" }}>{error}</div>}
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="rv-name">Nama Reviewer *</label>
                    <input id="rv-name" className="form-control" placeholder="Budi Santoso"
                      value={form.reviewerName} onChange={(e) => setForm({ ...form, reviewerName: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="rv-date">Tanggal Review</label>
                    <input id="rv-date" className="form-control" placeholder="Juli 2025"
                      value={form.reviewDate} onChange={(e) => setForm({ ...form, reviewDate: e.target.value })} />
                  </div>
                </div>

                {/* Rating Stars Picker */}
                <div className="form-group">
                  <label className="form-label">Rating *</label>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star} type="button"
                        onClick={() => setForm({ ...form, rating: star })}
                        style={{
                          fontSize: "1.75rem", background: "none", border: "none",
                          cursor: "pointer", color: star <= form.rating ? "#f59e0b" : "var(--border)",
                          transition: "color 0.15s", padding: "0 0.125rem",
                        }}
                      >★</button>
                    ))}
                    <span style={{ alignSelf: "center", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                      ({form.rating}/5)
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="rv-content">Isi Review *</label>
                  <textarea id="rv-content" className="form-control" rows={4}
                    placeholder="Copy-paste isi review dari Google Maps..."
                    value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="rv-order">Urutan Tampil</label>
                    <input id="rv-order" type="number" className="form-control" min={0}
                      value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tampilkan?</label>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem", cursor: "pointer" }}>
                      <input type="checkbox" checked={form.isVisible} onChange={(e) => setForm({ ...form, isVisible: e.target.checked })} />
                      <span style={{ fontSize: "0.875rem" }}>Ya, tampilkan</span>
                    </label>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
                  <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)} id="cancel-review">Batal</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting} id="save-review">
                    {submitting ? "Menyimpan..." : (editing ? "Simpan Perubahan" : "Tambah Review")}
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
