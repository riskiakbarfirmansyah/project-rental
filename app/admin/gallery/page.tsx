"use client";

import { useState, useEffect, useRef } from "react";

interface GalleryItem { id: string; title: string; description?: string; imageUrl: string; car?: { name: string; brand: string }; }

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", description: "", imageUrl: "" });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/gallery").then((r) => r.json()).then((d) => setItems(d.data?.items || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData(); fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.success) setForm((f) => ({ ...f, imageUrl: data.data.url }));
    setUploading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.imageUrl) return alert("Upload gambar terlebih dahulu");
    setSubmitting(true);
    const res = await fetch("/api/gallery", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { setForm({ title: "", description: "", imageUrl: "" }); load(); }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus item galeri ini?")) return;
    await fetch(`/api/gallery/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>Manajemen Galeri</h1>
        <p style={{ color: "var(--text-secondary)" }}>{items.length} item foto</p>
      </div>

      {/* Add Form */}
      <div style={{ background: "var(--surface)", borderRadius: "var(--radius-xl)", padding: "2rem", border: "1px solid var(--border)", marginBottom: "2rem" }}>
        <h3 style={{ marginBottom: "1.5rem" }}>Tambah Foto Baru</h3>
        <form onSubmit={handleAdd} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "1rem", alignItems: "flex-end" }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" htmlFor="gallery-title">Judul *</label>
            <input id="gallery-title" className="form-control" placeholder="Nama foto" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" htmlFor="gallery-desc">Deskripsi</label>
            <input id="gallery-desc" className="form-control" placeholder="Deskripsi opsional" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Gambar *</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input type="file" ref={fileRef} accept="image/*" onChange={handleUpload} style={{ display: "none" }} id="gallery-file" />
              <button type="button" onClick={() => fileRef.current?.click()} className="btn btn-outline btn-sm" id="gallery-upload-btn">
                {uploading ? "⏳" : "📁 Upload"}
              </button>
              {form.imageUrl && <span style={{ fontSize: "0.8125rem", color: "var(--success)", alignSelf: "center" }}>✓ OK</span>}
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting || uploading} id="gallery-add-btn">
            {submitting ? "..." : "Tambah"}
          </button>
        </form>
      </div>

      {/* Gallery grid */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}><div className="spinner" /></div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.25rem" }}>
          {items.map((item) => (
            <div key={item.id} id={`gallery-card-${item.id}`} style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid var(--border)", background: "var(--surface)" }}>
              <div style={{ height: 160, background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem" }}>🖼️</div>
              <div style={{ padding: "0.875rem" }}>
                <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "0.25rem" }}>{item.title}</div>
                {item.description && <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>{item.description}</div>}
                <button onClick={() => handleDelete(item.id)} className="btn btn-sm btn-danger" id={`delete-gallery-${item.id}`} style={{ width: "100%" }}>
                  🗑️ Hapus
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
              📸 Belum ada foto di galeri
            </div>
          )}
        </div>
      )}
    </div>
  );
}
