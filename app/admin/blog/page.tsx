"use client";

import { useState, useEffect } from "react";

interface BlogPost {
  id: string; title: string; slug: string; excerpt: string;
  isPublished: boolean; createdAt: string;
  author: { name: string };
}

const EMPTY = { title: "", excerpt: "", content: "", imageUrl: "", isPublished: false };

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editSlug, setEditSlug] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    fetch("/api/blog?limit=50")
      .then((r) => r.json())
      .then((d) => setPosts(d.data?.posts || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditSlug(null); setForm(EMPTY); setError(""); setShowForm(true); };
  const openEdit = async (slug: string) => {
    const res = await fetch(`/api/blog/${slug}`);
    const d = await res.json();
    if (d.success) {
      const p = d.data.post;
      setForm({ title: p.title, excerpt: p.excerpt, content: p.content, imageUrl: p.imageUrl || "", isPublished: p.isPublished });
      setEditSlug(slug);
      setError("");
      setShowForm(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setError("");
    const url = editSlug ? `/api/blog/${editSlug}` : "/api/blog";
    const method = editSlug ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    if (data.success) { setShowForm(false); load(); }
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>Manajemen Blog</h1>
          <p style={{ color: "var(--text-secondary)" }}>{posts.length} artikel</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd} id="admin-add-blog-btn">✍️ Tulis Artikel</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr><th>Judul</th><th>Penulis</th><th>Tanggal</th><th>Status</th><th>Aksi</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: "center", padding: "2rem" }}><div className="spinner" style={{ margin: "0 auto" }} /></td></tr>
            ) : posts.map((p) => (
              <tr key={p.id} id={`blog-row-${p.id}`}>
                <td>
                  <div style={{ fontWeight: 700, maxWidth: 320 }}>{p.title}</div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>/{p.slug}</div>
                </td>
                <td>{p.author.name}</td>
                <td style={{ fontSize: "0.875rem" }}>{new Date(p.createdAt).toLocaleDateString("id-ID")}</td>
                <td>
                  <button onClick={() => togglePublish(p)} id={`toggle-publish-${p.id}`}
                    className={`badge ${p.isPublished ? "badge-success" : "badge-warning"}`}
                    style={{ cursor: "pointer", border: "none" }}>
                    {p.isPublished ? "✓ Dipublikasi" : "⏸ Draft"}
                  </button>
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

      {/* Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal" style={{ maxWidth: 720 }}>
            <div className="modal-header">
              <h3>{editSlug ? "Edit Artikel" : "Tulis Artikel Baru"}</h3>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.25rem" }} id="close-blog-modal">✕</button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-error" style={{ marginBottom: "1rem" }}>{error}</div>}
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="blog-title">Judul *</label>
                  <input id="blog-title" className="form-control" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="blog-excerpt">Ringkasan *</label>
                  <textarea id="blog-excerpt" className="form-control" rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="blog-content">Konten *</label>
                  <textarea id="blog-content" className="form-control" rows={10} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required style={{ fontFamily: "monospace" }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontWeight: 600 }}>
                    <input type="checkbox" id="blog-published" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} style={{ width: 18, height: 18 }} />
                    Publikasikan sekarang
                  </label>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                  <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)} id="cancel-blog-form">Batal</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting} id="save-blog-form">
                    {submitting ? "Menyimpan..." : (editSlug ? "Simpan" : "Publikasikan")}
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
