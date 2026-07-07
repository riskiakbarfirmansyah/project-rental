"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  car?: { name: string; brand: string };
}

const EMPTY_FORM = { title: "", description: "", imageUrl: "" };

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editItem, setEditItem] = useState<GalleryItem | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [editUploading, setEditUploading] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/gallery")
      .then((r) => r.json())
      .then((d) => setItems(d.data?.items || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  // Upload for Add form
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

  // Upload for Edit form
  const handleEditUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditUploading(true);
    const fd = new FormData(); fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.success) setEditForm((f) => ({ ...f, imageUrl: data.data.url }));
    setEditUploading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.imageUrl) return alert("Upload gambar terlebih dahulu");
    setSubmitting(true);
    const res = await fetch("/api/gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) { setForm(EMPTY_FORM); load(); }
    setSubmitting(false);
  };

  const openEdit = (item: GalleryItem) => {
    setEditItem(item);
    setEditForm({ title: item.title, description: item.description || "", imageUrl: item.imageUrl });
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    setEditSubmitting(true);
    await fetch(`/api/gallery/${editItem.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    setEditItem(null);
    load();
    setEditSubmitting(false);
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
      <div style={{
        background: "var(--surface)", borderRadius: "var(--radius-xl)",
        padding: "2rem", border: "1px solid var(--border)", marginBottom: "2rem",
      }}>
        <h3 style={{ marginBottom: "1.5rem" }}>Tambah Foto Baru</h3>
        <form onSubmit={handleAdd} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "1rem", alignItems: "flex-end" }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" htmlFor="gallery-title">Judul *</label>
            <input id="gallery-title" className="form-control" placeholder="Nama foto"
              value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" htmlFor="gallery-desc">Deskripsi</label>
            <input id="gallery-desc" className="form-control" placeholder="Deskripsi opsional"
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Gambar *</label>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <input type="file" ref={fileRef} accept="image/*" onChange={handleUpload} style={{ display: "none" }} id="gallery-file" />
              <button type="button" onClick={() => fileRef.current?.click()} className="btn btn-outline btn-sm" id="gallery-upload-btn">
                {uploading ? "⏳ Upload..." : "📁 Upload"}
              </button>
              {form.imageUrl && <span style={{ fontSize: "0.8125rem", color: "var(--success)" }}>✓ OK</span>}
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting || uploading} id="gallery-add-btn">
            {submitting ? "..." : "Tambah"}
          </button>
        </form>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}><div className="spinner" /></div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.25rem" }}>
          {items.map((item) => (
            <div key={item.id} id={`gallery-card-${item.id}`} style={{
              borderRadius: "var(--radius-lg)", overflow: "hidden",
              border: "1px solid var(--border)", background: "var(--surface)",
              display: "flex", flexDirection: "column",
            }}>
              {/* Image */}
              <div style={{ position: "relative", height: 180, background: "var(--primary-light)", flexShrink: 0 }}>
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="(max-width: 768px) 50vw, 25vw"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
              {/* Info */}
              <div style={{ padding: "0.875rem", display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{item.title}</div>
                {item.description && (
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", flex: 1 }}>{item.description}</div>
                )}
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                  <button
                    onClick={() => openEdit(item)}
                    className="btn btn-sm btn-outline"
                    id={`edit-gallery-${item.id}`}
                    style={{ flex: 1 }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="btn btn-sm btn-danger"
                    id={`delete-gallery-${item.id}`}
                    style={{ flex: 1 }}
                  >
                    🗑️ Hapus
                  </button>
                </div>
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

      {/* Edit Modal */}
      {editItem && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setEditItem(null)}
        >
          <div className="modal" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h3>Edit Foto Galeri</h3>
              <button
                onClick={() => setEditItem(null)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.25rem" }}
                id="close-edit-gallery-modal"
              >✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleEdit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {/* Preview current/new image */}
                <div style={{ position: "relative", width: "100%", height: 200, borderRadius: "var(--radius-lg)", overflow: "hidden", background: "var(--primary-light)" }}>
                  <Image
                    src={editForm.imageUrl || editItem.imageUrl}
                    alt={editForm.title}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="520px"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="edit-gallery-title">Judul *</label>
                  <input id="edit-gallery-title" className="form-control"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-gallery-desc">Deskripsi</label>
                  <input id="edit-gallery-desc" className="form-control"
                    placeholder="Deskripsi opsional"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Ganti Foto (opsional)</label>
                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                    <input type="file" ref={editFileRef} accept="image/*" onChange={handleEditUpload} style={{ display: "none" }} id="edit-gallery-file" />
                    <button type="button" onClick={() => editFileRef.current?.click()} className="btn btn-outline btn-sm" id="edit-gallery-upload-btn">
                      {editUploading ? "⏳ Upload..." : "📁 Ganti Foto"}
                    </button>
                    {editForm.imageUrl !== editItem.imageUrl && (
                      <span style={{ fontSize: "0.875rem", color: "var(--success)" }}>✓ Foto baru dipilih</span>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                  <button type="button" className="btn btn-outline" onClick={() => setEditItem(null)} id="cancel-edit-gallery">Batal</button>
                  <button type="submit" className="btn btn-primary" disabled={editSubmitting || editUploading} id="save-edit-gallery">
                    {editSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
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
