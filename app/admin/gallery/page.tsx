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

  // Client-side search state
  const [search, setSearch] = useState("");

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

  // Filtered gallery items based on search
  const filteredItems = items.filter((item) => {
    return (
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(search.toLowerCase()))
    );
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      
      {/* Local scoped styling */}
      <style dangerouslySetInnerHTML={{ __html: `
        .modern-title {
          font-family: 'Sora', sans-serif;
          font-weight: 800;
          color: var(--text-primary);
          font-size: 2rem;
          letter-spacing: -0.02em;
        }
        .gallery-uploader-panel {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 1.5rem;
          box-shadow: var(--shadow-sm);
        }
        .gallery-upload-form {
          display: grid;
          grid-template-columns: 1.2fr 1.5fr 1fr auto;
          gap: 1.25rem;
          align-items: flex-end;
        }
        @media (max-width: 992px) {
          .gallery-upload-form {
            grid-template-columns: 1fr 1fr;
          }
          .gallery-upload-form button[type="submit"] {
            grid-column: span 2;
          }
        }
        @media (max-width: 576px) {
          .gallery-upload-form {
            grid-template-columns: 1fr;
          }
          .gallery-upload-form button[type="submit"] {
            grid-column: span 1;
          }
        }
        .upload-input-box {
          position: relative;
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 0.75rem 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          transition: var(--transition);
        }
        .upload-input-box:hover {
          border-color: var(--primary);
          background: var(--surface);
        }
        .search-container-gallery {
          position: relative;
          max-width: 320px;
          width: 100%;
        }
        .search-container-gallery input {
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
        .search-container-gallery input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(23, 23, 23, 0.05);
        }
        .search-icon-gallery {
          position: absolute;
          left: 0.875rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          display: flex;
          align-items: center;
        }
        .gallery-grid-modern {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
          gap: 1.5rem;
        }
        .gallery-card-modern {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: var(--shadow-sm);
          transition: var(--transition-slow);
          display: flex;
          flex-direction: column;
          position: relative;
        }
        .gallery-card-modern:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-xl);
          border-color: var(--border-dark);
        }
        .gallery-card-img-box {
          position: relative;
          height: 160px;
          overflow: hidden;
          background: var(--surface-2);
        }
        .gallery-card-img {
          object-fit: cover;
          transition: var(--transition-slow);
        }
        .gallery-card-modern:hover .gallery-card-img {
          transform: scale(1.05);
        }
        .gallery-card-body {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
        }
        .gallery-card-title {
          font-family: 'Sora', sans-serif;
          font-weight: 700;
          font-size: 0.9375rem;
          color: var(--text-primary);
          margin: 0;
        }
        .gallery-card-desc {
          font-size: 0.8125rem;
          color: var(--text-secondary);
          flex: 1;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.4;
        }
        .gallery-card-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }
        .btn-gallery-action {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.375rem;
          padding: 0.5rem;
          font-size: 0.8125rem;
          font-weight: 600;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--surface);
          cursor: pointer;
          color: var(--text-secondary);
          transition: var(--transition);
        }
        .btn-gallery-action:hover {
          background: var(--surface-2);
          color: var(--text-primary);
          border-color: var(--border-dark);
        }
        .btn-gallery-action.btn-delete:hover {
          background: var(--error-light);
          color: var(--error);
          border-color: var(--error-light);
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
          max-width: 520px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: var(--shadow-xl);
          animation: scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.96); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .preview-bubble {
          width: 36px;
          height: 36px;
          border-radius: 6px;
          overflow: hidden;
          position: relative;
          border: 1px solid var(--border);
          background: white;
        }
        .preview-bubble img {
          object-fit: cover;
        }
      ` }} />

      {/* ── TOP HEADER SECTION ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 className="modern-title">Manajemen Galeri</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
            Kelola foto dokumentasi armada mobil dan aktivitas sewa untuk galeri website.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "var(--primary-light)", padding: "0.5rem 1rem", borderRadius: "10px" }}>
          <span style={{ fontSize: "1.25rem" }}>🖼️</span>
          <span style={{ fontWeight: 700, fontSize: "0.875rem" }}>{items.length} Foto Aktif</span>
        </div>
      </div>

      {/* ── ADD NEW PHOTO FORM ── */}
      <div className="gallery-uploader-panel">
        <h3 style={{ fontSize: "1rem", fontWeight: 800, fontFamily: "Sora, sans-serif", marginBottom: "1.25rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>
          Tambah Foto Baru
        </h3>
        
        <form onSubmit={handleAdd} className="gallery-upload-form">
          {/* Judul */}
          <div className="form-group" style={{ margin: 0, display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            <label className="form-label" htmlFor="gallery-title" style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Judul *</label>
            <input
              id="gallery-title"
              className="form-control"
              placeholder="Contoh: Unit Avanza 2025"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              style={{ borderRadius: "10px" }}
            />
          </div>

          {/* Deskripsi */}
          <div className="form-group" style={{ margin: 0, display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            <label className="form-label" htmlFor="gallery-desc" style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Deskripsi Singkat</label>
            <input
              id="gallery-desc"
              className="form-control"
              placeholder="Contoh: Kondisi dalam mobil bersih dan wangi"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              style={{ borderRadius: "10px" }}
            />
          </div>

          {/* Upload Button */}
          <div className="form-group" style={{ margin: 0, display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            <label className="form-label" style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>File Foto *</label>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <input
                type="file"
                ref={fileRef}
                accept="image/*"
                onChange={handleUpload}
                style={{ display: "none" }}
                id="gallery-file"
              />
              
              <div className="upload-input-box" onClick={() => fileRef.current?.click()} style={{ flex: 1 }}>
                <span>📁</span>
                <span id="gallery-upload-btn" style={{ fontSize: "0.8125rem", fontWeight: 600 }}>
                  {uploading ? "Mengupload..." : "Pilih File"}
                </span>
              </div>

              {form.imageUrl && (
                <div className="preview-bubble" title="Pratinjau gambar">
                  <Image src={form.imageUrl} alt="Upload Preview" fill />
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting || uploading}
            id="gallery-add-btn"
            style={{ borderRadius: "12px", height: "42px", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            {submitting ? "Menyimpan..." : "✓ Tambahkan Foto"}
          </button>
        </form>
      </div>

      {/* ── SEARCH & GRID BAR ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div className="search-container-gallery">
          <span className="search-icon-gallery">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Cari foto galeri..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── PHOTO GRID ── */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
          <div className="spinner" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div style={{ padding: "4rem 2rem", textAlign: "center", border: "1px dashed var(--border)", borderRadius: "20px", color: "var(--text-secondary)" }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>📸</div>
          <h3 style={{ marginBottom: "0.25rem" }}>Tidak Ada Foto</h3>
          <p>Belum ada foto galeri yang cocok dengan kata kunci pencarian Anda.</p>
        </div>
      ) : (
        <div className="gallery-grid-modern">
          {filteredItems.map((item) => (
            <div key={item.id} className="gallery-card-modern" id={`gallery-card-${item.id}`}>
              {/* Photo Box */}
              <div className="gallery-card-img-box">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="gallery-card-img"
                  sizes="(max-width: 768px) 50vw, 25vw"
                  priority={false}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>

              {/* Photo Info */}
              <div className="gallery-card-body">
                <h4 className="gallery-card-title">{item.title}</h4>
                <p className="gallery-card-desc">
                  {item.description || "Tidak ada deskripsi"}
                </p>
                
                {/* Actions */}
                <div className="gallery-card-actions">
                  <button
                    onClick={() => openEdit(item)}
                    className="btn-gallery-action"
                    id={`edit-gallery-${item.id}`}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="btn-gallery-action btn-delete"
                    id={`delete-gallery-${item.id}`}
                  >
                    🗑️ Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── EDIT PHOTO MODAL ── */}
      {editItem && (
        <div
          className="custom-modal-backdrop"
          onClick={(e) => e.target === e.currentTarget && setEditItem(null)}
        >
          <div className="custom-modal-window">
            {/* Modal Header */}
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 800, margin: 0, fontFamily: "Sora, sans-serif" }}>
                Edit Foto Galeri
              </h3>
              <button
                onClick={() => setEditItem(null)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.125rem", color: "var(--text-muted)" }}
                id="close-edit-gallery-modal"
              >✕</button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "1.5rem" }}>
              <form onSubmit={handleEdit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                
                {/* Photo Preview */}
                <div style={{ position: "relative", width: "100%", height: 200, borderRadius: "12px", overflow: "hidden", background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                  <Image
                    src={editForm.imageUrl || editItem.imageUrl}
                    alt={editForm.title}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="520px"
                  />
                </div>

                {/* Title */}
                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                  <label className="form-label" htmlFor="edit-gallery-title" style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Judul *</label>
                  <input
                    id="edit-gallery-title"
                    className="form-control"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    required
                    style={{ borderRadius: "10px" }}
                  />
                </div>

                {/* Description */}
                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                  <label className="form-label" htmlFor="edit-gallery-desc" style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Deskripsi</label>
                  <input
                    id="edit-gallery-desc"
                    className="form-control"
                    placeholder="Deskripsi opsional"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    style={{ borderRadius: "10px" }}
                  />
                </div>

                {/* Change photo */}
                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                  <label className="form-label" style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Ganti Foto (Opsional)</label>
                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                    <input
                      type="file"
                      ref={editFileRef}
                      accept="image/*"
                      onChange={handleEditUpload}
                      style={{ display: "none" }}
                      id="edit-gallery-file"
                    />
                    <button
                      type="button"
                      onClick={() => editFileRef.current?.click()}
                      className="btn btn-outline btn-sm"
                      id="edit-gallery-upload-btn"
                      style={{ borderRadius: "10px", padding: "0.5rem 1rem" }}
                    >
                      {editUploading ? "⏳ Mengupload..." : "📁 Ganti Foto"}
                    </button>
                    {editForm.imageUrl !== editItem.imageUrl && (
                      <span style={{ fontSize: "0.8125rem", color: "var(--success)", fontWeight: 600 }}>✓ Foto baru dipilih</span>
                    )}
                  </div>
                </div>

                {/* Modal actions */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem", borderTop: "1px solid var(--border)", paddingTop: "1.25rem" }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setEditItem(null)}
                    id="cancel-edit-gallery"
                    style={{ borderRadius: "10px", padding: "0.65rem 1.25rem" }}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={editSubmitting || editUploading}
                    id="save-edit-gallery"
                    style={{ borderRadius: "10px", padding: "0.65rem 1.25rem" }}
                  >
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
