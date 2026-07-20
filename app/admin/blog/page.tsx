"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import RichTextEditor from "@/components/RichTextEditor";

interface BlogPost {
  id: string; title: string; slug: string; excerpt: string;
  isPublished: boolean; createdAt: string; publishedAt?: string | null;
  category?: string | null; tags?: string | null;
  author: { name: string };
  imageUrl?: string | null;
}

const EMPTY = { 
  title: "", excerpt: "", content: "", imageUrl: "", 
  category: "", tags: "", metaTitle: "", metaDescription: "",
  publishedAt: "", isPublished: false 
};

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editSlug, setEditSlug] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  // Cover Image upload state
  const coverFileRef = useRef<HTMLInputElement>(null);
  const [coverUploading, setCoverUploading] = useState(false);

  // Auto-save & dirty state
  const [isDirty, setIsDirty] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const formRef = useRef(form);

  useEffect(() => { formRef.current = form; }, [form]);

  const load = () => {
    setLoading(true);
    fetch("/api/blog?limit=50")
      .then((r) => r.json())
      .then((d) => setPosts(d.data?.posts || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  // Before unload warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && showForm) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, showForm]);

  // Auto-save logic (only if editing existing post)
  useEffect(() => {
    if (!editSlug || !isDirty || !showForm) return;

    const timeout = setTimeout(async () => {
      setAutoSaveStatus("saving");
      try {
        const payload = { ...formRef.current };
        // Don't auto-publish if it's currently a draft
        const res = await fetch(`/api/blog/${editSlug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setAutoSaveStatus("saved");
          setIsDirty(false);
          setTimeout(() => setAutoSaveStatus("idle"), 2000);
        }
      } catch (e) {
        console.error("Auto-save failed", e);
        setAutoSaveStatus("idle");
      }
    }, 5000); // 5 seconds debounce

    return () => clearTimeout(timeout);
  }, [form, editSlug, isDirty, showForm]);

  const openAdd = () => { 
    setEditSlug(null); setForm(EMPTY); setError(""); setShowForm(true); setIsDirty(false); 
  };
  
  const openEdit = async (slug: string) => {
    const res = await fetch(`/api/blog/${slug}`);
    const d = await res.json();
    if (d.success) {
      const p = d.data.post;
      setForm({ 
        title: p.title || "", 
        excerpt: p.excerpt || "", 
        content: p.content || "", 
        imageUrl: p.imageUrl || "", 
        category: p.category || "",
        tags: p.tags || "",
        metaTitle: p.metaTitle || "",
        metaDescription: p.metaDescription || "",
        publishedAt: p.publishedAt ? new Date(p.publishedAt).toISOString().slice(0, 16) : "",
        isPublished: p.isPublished 
      });
      setEditSlug(slug);
      setError("");
      setShowForm(true);
      setIsDirty(false);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) return alert("Format file harus JPG, PNG, atau WEBP");
    if (file.size > 5 * 1024 * 1024) return alert("Ukuran maksimal file 5MB");

    setCoverUploading(true);
    const fd = new FormData(); fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success) {
        handleFieldChange("imageUrl", data.data.url);
      } else alert(data.error);
    } catch (err) {
      alert("Gagal mengunggah cover image");
    } finally {
      setCoverUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent, isPublishedValue: boolean) => {
    e.preventDefault();
    if (!form.title.trim()) return setError("Judul wajib diisi");
    
    setSubmitting(true); setError("");
    const url = editSlug ? `/api/blog/${editSlug}` : "/api/blog";
    const method = editSlug ? "PUT" : "POST";
    
    const payload = { 
      ...form, 
      isPublished: isPublishedValue,
      publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : null
    };

    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json();
    
    if (data.success) { 
      setIsDirty(false);
      setShowForm(false); 
      load(); 
    }
    else setError(data.error || "Gagal menyimpan");
    setSubmitting(false);
  };

  const handleDelete = async (slug: string, title: string) => {
    if (!confirm(`Hapus artikel "${title}"?`)) return;
    await fetch(`/api/blog/${slug}`, { method: "DELETE" });
    load();
  };

  const togglePublish = async (post: BlogPost) => {
    await fetch(`/api/blog/${post.slug}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !post.isPublished }),
    });
    load();
  };

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>Manajemen Blog</h1>
          <p style={{ color: "var(--text-secondary)" }}>{posts.length} artikel</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd} id="admin-add-blog-btn">✍️ Tulis Artikel</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr><th>Judul & Cover</th><th>Kategori</th><th>Status</th><th>Tanggal Publikasi</th><th>Aksi</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: "center", padding: "2rem" }}><div className="spinner" style={{ margin: "0 auto" }} /></td></tr>
            ) : posts.map((p) => (
              <tr key={p.id} id={`blog-row-${p.id}`}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    {p.imageUrl ? (
                      <div style={{ width: 60, height: 40, position: "relative", borderRadius: 4, overflow: "hidden", background: "#f1f5f9" }}>
                        <Image src={p.imageUrl} alt={p.title} fill style={{ objectFit: "cover" }} sizes="60px" />
                      </div>
                    ) : (
                      <div style={{ width: 60, height: 40, background: "#f1f5f9", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", color: "#94a3b8" }}>No Img</div>
                    )}
                    <div>
                      <div style={{ fontWeight: 700, maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</div>
                      <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>/{p.slug}</div>
                    </div>
                  </div>
                </td>
                <td style={{ fontSize: "0.875rem" }}>{p.category || "-"}</td>
                <td>
                  <button onClick={() => togglePublish(p)} id={`toggle-publish-${p.id}`}
                    className={`badge ${p.isPublished ? "badge-success" : "badge-warning"}`}
                    style={{ cursor: "pointer", border: "none" }}>
                    {p.isPublished ? "✓ Published" : "⏸ Draft"}
                  </button>
                </td>
                <td style={{ fontSize: "0.875rem" }}>
                  {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString("id-ID", { year: "numeric", month: "short", day: "numeric" }) : "-"}
                </td>
                <td>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button className="btn btn-sm btn-outline" onClick={() => openEdit(p.slug)} id={`edit-blog-${p.id}`}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.slug, p.title)} id={`delete-blog-${p.id}`}>Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && posts.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>Belum ada artikel</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Editor Modal Overlay */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "var(--surface)", display: "flex", flexDirection: "column", animation: "fadeUp 0.3s ease forwards" }}>
          
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            .editor-layout { display: flex; flex-direction: column; align-items: center; padding: 2rem 1rem; height: calc(100vh - 70px); overflow-y: auto; background: var(--surface-2); }
            .editor-container { width: 100%; max-width: 800px; display: flex; flex-direction: column; gap: 2rem; }
            .editor-main { display: flex; flex-direction: column; gap: 1.5rem; }
            .editor-settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
            @media (max-width: 768px) { .editor-settings-grid { grid-template-columns: 1fr; } }
            .panel { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 1.5rem; }
            .panel h3 { font-size: 1rem; font-weight: 700; margin-bottom: 1rem; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; }
          `}} />

          {/* Header */}
          <div style={{ borderBottom: "1px solid var(--border)", padding: "1rem 2rem", background: "var(--surface)" }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1rem" }}>
                <button onClick={() => { if(!isDirty || confirm("Ada perubahan yang belum disimpan. Yakin ingin keluar?")) setShowForm(false) }} className="btn btn-sm btn-outline">
                  ← Kembali
                </button>
                <h2 style={{ fontSize: "1.25rem", margin: 0 }}>{editSlug ? "Edit Artikel" : "Tulis Artikel Baru"}</h2>
                
                {autoSaveStatus !== "idle" && (
                  <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {autoSaveStatus === "saving" ? "Menyimpan..." : "✓ Tersimpan"}
                  </span>
                )}
              </div>
              
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                <button type="button" className="btn btn-outline" onClick={(e) => handleSubmit(e, false)} disabled={submitting}>
                  Simpan Draft
                </button>
                <button type="button" className="btn btn-primary" onClick={(e) => handleSubmit(e, true)} disabled={submitting}>
                  Publikasikan
                </button>
              </div>
            </div>
          </div>

          <div className="editor-layout">
            <div className="editor-container">
              {error && <div className="alert alert-error">{error}</div>}
              
              {/* Main Content Column */}
              <div className="editor-main">
                <div className="form-group" style={{ margin: 0 }}>
                  <input 
                    className="form-control" 
                    placeholder="Judul Artikel..." 
                    value={form.title} 
                    onChange={(e) => handleFieldChange("title", e.target.value)} 
                    style={{ fontSize: "2.5rem", fontWeight: 800, padding: "1rem 0", height: "auto", border: "none", background: "transparent", borderBottom: "2px dashed var(--border)", borderRadius: 0 }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <RichTextEditor 
                    content={form.content}
                    onChange={(content) => handleFieldChange("content", content)}
                  />
                </div>
              </div>

              <hr style={{ border: "none", borderTop: "1px dashed var(--border)", margin: "1rem 0" }} />
              
              <h3 style={{ fontSize: "1.25rem", margin: 0 }}>Pengaturan Artikel</h3>

              {/* Settings Grid */}
              <div className="editor-settings-grid">
                
                {/* Cover Image */}
                <div className="panel">
                  <h3>Cover Image</h3>
                  {form.imageUrl ? (
                    <div style={{ position: "relative", width: "100%", height: 160, borderRadius: 8, overflow: "hidden", marginBottom: "1rem", border: "1px solid var(--border)" }}>
                      <Image src={form.imageUrl} alt="Cover" fill style={{ objectFit: "cover" }} sizes="340px" />
                      <button 
                        onClick={() => handleFieldChange("imageUrl", "")}
                        style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.5)", color: "white", border: "none", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >✕</button>
                    </div>
                  ) : (
                    <div style={{ height: 160, borderRadius: 8, border: "2px dashed var(--border)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem", background: "var(--surface-2)" }}>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Belum ada cover image</span>
                    </div>
                  )}
                  <input type="file" ref={coverFileRef} accept="image/*" onChange={handleCoverUpload} style={{ display: "none" }} />
                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    style={{ width: "100%" }} 
                    onClick={() => coverFileRef.current?.click()}
                    disabled={coverUploading}
                  >
                    {coverUploading ? "Mengunggah..." : form.imageUrl ? "Ganti Gambar" : "Unggah Gambar"}
                  </button>
                </div>

                {/* Excerpt */}
                <div className="panel">
                  <h3>Ringkasan / Excerpt</h3>
                  <textarea 
                    className="form-control" 
                    rows={6} 
                    value={form.excerpt} 
                    onChange={(e) => handleFieldChange("excerpt", e.target.value)} 
                    placeholder="Ringkasan singkat tentang artikel ini (akan ditampilkan di daftar blog)..."
                    style={{ resize: "none" }}
                  />
                </div>

                {/* Taxonomy */}
                <div className="panel">
                  <h3>Kategori & Tag</h3>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: "0.75rem" }}>Kategori</label>
                    <input 
                      className="form-control" 
                      placeholder="Misal: Tips & Trik"
                      value={form.category}
                      onChange={(e) => handleFieldChange("category", e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: "0.75rem" }}>Tags</label>
                    <input 
                      className="form-control" 
                      placeholder="Misal: mobil, sewa, liburan"
                      value={form.tags}
                      onChange={(e) => handleFieldChange("tags", e.target.value)}
                    />
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>Pisahkan dengan koma.</p>
                  </div>
                </div>

                {/* SEO */}
                <div className="panel">
                  <h3>SEO Metadata</h3>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: "0.75rem" }}>Meta Title</label>
                    <input 
                      className="form-control" 
                      placeholder="Judul untuk mesin pencari..."
                      value={form.metaTitle}
                      onChange={(e) => handleFieldChange("metaTitle", e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: "0.75rem" }}>Meta Description</label>
                    <textarea 
                      className="form-control" 
                      rows={3}
                      placeholder="Deskripsi singkat untuk SEO..."
                      value={form.metaDescription}
                      onChange={(e) => handleFieldChange("metaDescription", e.target.value)}
                    />
                  </div>
                </div>

                {/* Status & Date */}
                <div className="panel" style={{ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: "0.75rem" }}>Status Artikel</label>
                    <select 
                      className="form-control" 
                      value={form.isPublished ? "published" : "draft"}
                      onChange={(e) => handleFieldChange("isPublished", e.target.value === "published")}
                    >
                      <option value="draft">Draft (Sembunyikan)</option>
                      <option value="published">Published (Tampilkan)</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: "0.75rem" }}>Tanggal Publikasi</label>
                    <input 
                      type="datetime-local" 
                      className="form-control" 
                      value={form.publishedAt}
                      onChange={(e) => handleFieldChange("publishedAt", e.target.value)}
                    />
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>Bisa dikosongkan untuk tanggal otomatis.</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
