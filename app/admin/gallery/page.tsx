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
const EMPTY_ADD_FORM = { title: "", description: "" };

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Add Modal States ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_ADD_FORM);
  const [addFile, setAddFile] = useState<File | null>(null);
  const [addPreviewUrl, setAddPreviewUrl] = useState<string | null>(null);
  const [addUploading, setAddUploading] = useState(false);
  const [addError, setAddError] = useState("");
  const addFileRef = useRef<HTMLInputElement>(null);

  // --- Edit Modal States ---
  const [editItem, setEditItem] = useState<GalleryItem | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [editUploading, setEditUploading] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
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

  // Keyboard accessibility for modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showAddModal && !addUploading) closeAddModal();
        if (editItem && !editUploading && !editSubmitting) setEditItem(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showAddModal, addUploading, editItem, editUploading, editSubmitting]);

  // Cleanup object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (addPreviewUrl) URL.revokeObjectURL(addPreviewUrl);
    };
  }, [addPreviewUrl]);

  // --- Add Handlers ---
  const openAddModal = () => {
    setAddForm(EMPTY_ADD_FORM);
    setAddFile(null);
    if (addPreviewUrl) URL.revokeObjectURL(addPreviewUrl);
    setAddPreviewUrl(null);
    setAddError("");
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setTimeout(() => {
      setAddForm(EMPTY_ADD_FORM);
      setAddFile(null);
      if (addPreviewUrl) URL.revokeObjectURL(addPreviewUrl);
      setAddPreviewUrl(null);
      setAddError("");
    }, 300);
  };

  const handleAddFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddError("");
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setAddError("Format file tidak didukung. Gunakan JPG, PNG, atau WEBP.");
      return;
    }

    // Validate size (e.g., max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setAddError("Ukuran file terlalu besar (Maksimal 5MB).");
      return;
    }

    // Free memory of old preview
    if (addPreviewUrl) URL.revokeObjectURL(addPreviewUrl);

    setAddFile(file);
    setAddPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveAddFile = () => {
    setAddFile(null);
    if (addPreviewUrl) URL.revokeObjectURL(addPreviewUrl);
    setAddPreviewUrl(null);
    if (addFileRef.current) addFileRef.current.value = "";
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");

    if (!addFile) {
      setAddError("Silakan pilih file foto terlebih dahulu.");
      return;
    }
    if (!addForm.title.trim()) {
      setAddError("Judul wajib diisi.");
      return;
    }

    setAddUploading(true);

    try {
      // 1. Upload Image
      const fd = new FormData();
      fd.append("file", addFile);
      const resUpload = await fetch("/api/upload", { method: "POST", body: fd });
      const dataUpload = await resUpload.json();

      if (!resUpload.ok || !dataUpload.success) {
        throw new Error(dataUpload.error || "Gagal mengunggah foto");
      }

      // 2. Save Item
      const payload: Record<string, any> = {
        title: addForm.title.trim(),
        imageUrl: dataUpload.data.url,
      };
      if (addForm.description.trim()) {
        payload.description = addForm.description.trim();
      }

      const resGallery = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const dataGallery = await resGallery.json();
      if (!resGallery.ok || !dataGallery.success) {
        throw new Error(dataGallery.error || "Gagal menyimpan data galeri");
      }

      alert("Foto berhasil ditambahkan!");
      closeAddModal();
      load();
    } catch (err: any) {
      setAddError(err.message || "Terjadi kesalahan sistem");
    } finally {
      setAddUploading(false);
    }
  };

  // --- Edit Handlers ---
  const handleEditUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditUploading(true);
    try {
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success) {
        setEditForm((f) => ({ ...f, imageUrl: data.data.url }));
      } else {
        alert(data.error || "Gagal mengunggah foto");
      }
    } catch (err: any) {
      alert("Gagal mengunggah foto: " + (err.message || "Terjadi kesalahan sistem"));
    } finally {
      setEditUploading(false);
    }
  };

  const openEdit = (item: GalleryItem) => {
    setEditItem(item);
    setEditForm({ title: item.title, description: item.description || "", imageUrl: item.imageUrl });
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    setEditSubmitting(true);
    try {
      const res = await fetch(`/api/gallery/${editItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editForm.title.trim(),
          description: editForm.description.trim() || undefined,
          imageUrl: editForm.imageUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || "Gagal memperbarui galeri");
      } else {
        setEditItem(null);
        load();
      }
    } catch (err: any) {
      alert("Terjadi kesalahan: " + (err.message || "Gagal menyimpan"));
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus item galeri ini?")) return;
    await fetch(`/api/gallery/${id}`, { method: "DELETE" });
    load();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024, sizes = ["Bytes", "KB", "MB"], i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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
      ` }} />

      {/* ── TOP HEADER SECTION ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 className="modern-title">Manajemen Galeri</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
            Kelola foto dokumentasi armada mobil dan aktivitas sewa untuk galeri website.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "var(--primary-light)", padding: "0.5rem 1rem", borderRadius: "10px", color: "var(--primary)" }}>
            <span style={{ fontSize: "1.25rem" }}>🖼️</span>
            <span style={{ fontWeight: 700, fontSize: "0.875rem" }}>{items.length} Foto Aktif</span>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={openAddModal}
            style={{ borderRadius: "10px", height: "40px", padding: "0 1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <span>+</span>
            <span>Tambah Foto</span>
          </button>
        </div>
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

      {/* ── ADD PHOTO MODAL ── */}
      {showAddModal && (
        <div
          className="custom-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget && !addUploading) closeAddModal();
          }}
        >
          <div className="custom-modal-window">
            {/* Modal Header */}
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 800, margin: 0, fontFamily: "Sora, sans-serif" }}>
                Tambah Foto Baru
              </h3>
              <button
                onClick={closeAddModal}
                disabled={addUploading}
                style={{ background: "none", border: "none", cursor: addUploading ? "not-allowed" : "pointer", fontSize: "1.125rem", color: "var(--text-muted)" }}
                aria-label="Tutup"
              >✕</button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "1.5rem" }}>
              {addError && (
                <div style={{ padding: "0.75rem", marginBottom: "1.25rem", background: "var(--error-light)", color: "var(--error)", borderRadius: "8px", fontSize: "0.875rem" }}>
                  {addError}
                </div>
              )}

              <form onSubmit={handleAddSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                
                {/* File Upload Area */}
                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                  <label className="form-label" style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>File Foto *</label>
                  
                  {addPreviewUrl && addFile ? (
                    <div style={{ position: "relative", width: "100%", borderRadius: "12px", overflow: "hidden", background: "var(--surface-2)", border: "1px solid var(--border)", display: "flex", flexDirection: "column" }}>
                      <div style={{ position: "relative", height: 200, width: "100%" }}>
                        <Image
                          src={addPreviewUrl}
                          alt="Preview"
                          fill
                          style={{ objectFit: "cover" }}
                          sizes="520px"
                        />
                      </div>
                      <div style={{ padding: "0.75rem 1rem", background: "var(--surface)", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ overflow: "hidden" }}>
                          <div style={{ fontSize: "0.875rem", fontWeight: 600, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{addFile.name}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{formatFileSize(addFile.size)}</div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveAddFile}
                          disabled={addUploading}
                          className="btn btn-outline btn-sm"
                          style={{ color: "var(--error)", borderColor: "var(--error-light)" }}
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => addFileRef.current?.click()}
                      style={{ 
                        border: "2px dashed var(--border)", borderRadius: "12px", padding: "2.5rem 1rem", 
                        textAlign: "center", cursor: "pointer", background: "var(--surface-2)", transition: "var(--transition)"
                      }}
                      onMouseOver={(e) => e.currentTarget.style.borderColor = "var(--primary)"}
                      onMouseOut={(e) => e.currentTarget.style.borderColor = "var(--border)"}
                    >
                      <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📁</div>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.25rem" }}>Klik untuk memilih foto</div>
                      <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>Maks. 5MB (JPG, PNG, WEBP)</div>
                    </div>
                  )}

                  <input
                    type="file"
                    ref={addFileRef}
                    accept="image/jpeg, image/png, image/webp, image/jpg"
                    onChange={handleAddFileSelect}
                    style={{ display: "none" }}
                    id="add-gallery-file"
                  />
                </div>

                {/* Title */}
                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                  <label className="form-label" htmlFor="add-gallery-title" style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Judul *</label>
                  <input
                    id="add-gallery-title"
                    className="form-control"
                    placeholder="Contoh: Eksterior Avanza 2025"
                    value={addForm.title}
                    onChange={(e) => { setAddForm({ ...addForm, title: e.target.value }); if(addError) setAddError(""); }}
                    required
                    style={{ borderRadius: "10px" }}
                  />
                </div>

                {/* Description */}
                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                  <label className="form-label" htmlFor="add-gallery-desc" style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Deskripsi / Caption (Opsional)</label>
                  <input
                    id="add-gallery-desc"
                    className="form-control"
                    placeholder="Masukkan deskripsi singkat..."
                    value={addForm.description}
                    onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                    style={{ borderRadius: "10px" }}
                  />
                </div>

                {/* Modal actions */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem", borderTop: "1px solid var(--border)", paddingTop: "1.25rem" }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={closeAddModal}
                    disabled={addUploading}
                    style={{ borderRadius: "10px", padding: "0.65rem 1.25rem" }}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={addUploading || !addFile || !addForm.title.trim()}
                    style={{ borderRadius: "10px", padding: "0.65rem 1.25rem" }}
                  >
                    {addUploading ? "Mengunggah..." : "Unggah Foto"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT PHOTO MODAL ── */}
      {editItem && (
        <div
          className="custom-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget && !editUploading && !editSubmitting) setEditItem(null);
          }}
        >
          <div className="custom-modal-window">
            {/* Modal Header */}
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 800, margin: 0, fontFamily: "Sora, sans-serif" }}>
                Edit Foto Galeri
              </h3>
              <button
                onClick={() => setEditItem(null)}
                disabled={editUploading || editSubmitting}
                style={{ background: "none", border: "none", cursor: (editUploading || editSubmitting) ? "not-allowed" : "pointer", fontSize: "1.125rem", color: "var(--text-muted)" }}
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
                      disabled={editUploading || editSubmitting}
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
                    disabled={editUploading || editSubmitting}
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
