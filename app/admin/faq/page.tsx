"use client";

import { useState, useEffect } from "react";

interface FaqItem { id: string; question: string; answer: string; order: number; isActive: boolean; }

const EMPTY = { question: "", answer: "", order: 0, isActive: true };

export default function AdminFaqPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FaqItem | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    // Fetch all including inactive for admin
    fetch("/api/faq?all=true").then((r) => r.json()).then((d) => setFaqs(d.data?.faqs || [])).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm({ ...EMPTY, order: faqs.length + 1 }); setShowForm(true); };
  const openEdit = (faq: FaqItem) => { setEditing(faq); setForm({ question: faq.question, answer: faq.answer, order: faq.order, isActive: faq.isActive }); setShowForm(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const url = editing ? `/api/faq/${editing.id}` : "/api/faq";
    const method = editing ? "PUT" : "POST";
    
    const parsedOrder = parseInt(form.order?.toString() || "0");
    const safeOrder = isNaN(parsedOrder) ? 0 : parsedOrder;

    try {
      const res = await fetch(url, { 
        method, 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ ...form, order: safeOrder }) 
      });
      const data = await res.json();
      
      if (res.ok && data.success) { 
        setShowForm(false); 
        load(); 
      } else {
        alert(data.error || "Gagal menyimpan FAQ");
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus FAQ ini?")) return;
    await fetch(`/api/faq/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div>
      <div className="admin-header-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>Manajemen FAQ</h1>
          <p style={{ color: "var(--text-secondary)" }}>{faqs.length} pertanyaan</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd} id="admin-add-faq-btn">➕ Tambah FAQ</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}><div className="spinner" /></div>
        ) : faqs.map((faq) => (
          <div key={faq.id} id={`faq-admin-row-${faq.id}`} className="admin-faq-card" style={{ background: "var(--surface)", borderRadius: "var(--radius-lg)", padding: "1.5rem", border: "1px solid var(--border)", display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, flexShrink: 0, fontSize: "0.875rem" }}>
              {faq.order}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, marginBottom: "0.5rem" }}>{faq.question}</div>
              <div style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.6 }}>{faq.answer}</div>
            </div>
            <div className="admin-faq-actions" style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
              <span className={`badge ${faq.isActive ? "badge-success" : "badge-error"}`}>{faq.isActive ? "Aktif" : "Nonaktif"}</span>
              <button className="btn btn-sm btn-outline" onClick={() => openEdit(faq)} id={`edit-faq-${faq.id}`}>Edit</button>
              <button className="btn btn-sm btn-danger" onClick={() => handleDelete(faq.id)} id={`delete-faq-${faq.id}`}>Hapus</button>
            </div>
          </div>
        ))}
        {!loading && faqs.length === 0 && (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)", background: "var(--surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)" }}>
            Belum ada FAQ. Klik "Tambah FAQ" untuk memulai.
          </div>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editing ? "Edit FAQ" : "Tambah FAQ Baru"}</h3>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.25rem" }} id="close-faq-modal">✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="faq-question">Pertanyaan *</label>
                  <input id="faq-question" className="form-control" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="faq-answer">Jawaban *</label>
                  <textarea id="faq-answer" className="form-control" rows={4} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} required />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="faq-order">Urutan</label>
                    <input id="faq-order" type="number" className="form-control" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) })} min={0} />
                  </div>
                  <div className="form-group" style={{ justifyContent: "flex-end" }}>
                    <label className="form-label">Status</label>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", height: "46px" }}>
                      <input type="checkbox" id="faq-active" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} style={{ width: 18, height: 18 }} />
                      Aktif / Tampilkan
                    </label>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                  <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)} id="cancel-faq-form">Batal</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting} id="save-faq-form">
                    {submitting ? "Menyimpan..." : "Simpan"}
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
