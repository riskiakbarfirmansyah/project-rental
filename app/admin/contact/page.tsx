"use client";

import { useState, useEffect } from "react";

interface ContactMessage {
  id: string; name: string; email: string; phone?: string;
  subject: string; message: string; isRead: boolean; createdAt: string;
}

export default function AdminContactPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [filter, setFilter] = useState("all");

  const load = () => {
    setLoading(true);
    fetch("/api/contact").then((r) => r.json()).then((d) => setMessages(d.data?.messages || [])).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const markRead = async (id: string) => {
    await fetch(`/api/contact/${id}`, { method: "PATCH" });
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, isRead: true } : m));
    if (selected?.id === id) setSelected((s) => s ? { ...s, isRead: true } : null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus pesan ini?")) return;
    await fetch(`/api/contact/${id}`, { method: "DELETE" });
    setSelected(null);
    load();
  };

  const openMessage = (msg: ContactMessage) => {
    setSelected(msg);
    if (!msg.isRead) markRead(msg.id);
  };

  const filtered = filter === "unread" ? messages.filter((m) => !m.isRead)
    : filter === "read" ? messages.filter((m) => m.isRead)
    : messages;

  const unread = messages.filter((m) => !m.isRead).length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>Pesan Masuk</h1>
          <p style={{ color: "var(--text-secondary)" }}>{messages.length} pesan · {unread} belum dibaca</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {[{ v: "all", l: "Semua" }, { v: "unread", l: "Belum Dibaca" }, { v: "read", l: "Sudah Dibaca" }].map((f) => (
            <button key={f.v} onClick={() => setFilter(f.v)} id={`filter-contact-${f.v}`}
              style={{ padding: "0.5rem 1rem", borderRadius: "var(--radius-full)", border: "1.5px solid", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem", transition: "var(--transition)", background: filter === f.v ? "var(--primary)" : "transparent", borderColor: filter === f.v ? "var(--primary)" : "var(--border)", color: filter === f.v ? "white" : "var(--text-secondary)" }}>
              {f.l}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "1.5rem" }}>
        {/* Message list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}><div className="spinner" /></div>
          ) : filtered.map((msg) => (
            <div key={msg.id} id={`contact-msg-${msg.id}`} onClick={() => openMessage(msg)}
              style={{
                padding: "1.25rem", borderRadius: "var(--radius-lg)", cursor: "pointer",
                border: `1.5px solid ${selected?.id === msg.id ? "var(--primary)" : "var(--border)"}`,
                background: selected?.id === msg.id ? "var(--primary-light)" : msg.isRead ? "var(--surface)" : "var(--warning-light)",
                transition: "var(--transition)"
              }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.375rem" }}>
                <span style={{ fontWeight: msg.isRead ? 500 : 800 }}>{msg.name}</span>
                {!msg.isRead && <span className="badge badge-warning" style={{ fontSize: "0.7rem" }}>Baru</span>}
              </div>
              <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.25rem" }}>{msg.subject}</div>
              <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {msg.message}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                {new Date(msg.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </div>
          ))}
          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>Tidak ada pesan</div>
          )}
        </div>

        {/* Detail */}
        {selected ? (
          <div style={{ background: "var(--surface)", borderRadius: "var(--radius-xl)", padding: "2rem", border: "1px solid var(--border)", position: "sticky", top: "1rem", alignSelf: "flex-start" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <h3>{selected.subject}</h3>
              <button onClick={() => handleDelete(selected.id)} className="btn btn-sm btn-danger" id={`delete-msg-${selected.id}`}>🗑️ Hapus</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Nama</div>
                <div style={{ fontWeight: 700 }}>{selected.name}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Email</div>
                <div style={{ fontWeight: 700 }}><a href={`mailto:${selected.email}`}>{selected.email}</a></div>
              </div>
              {selected.phone && (
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Telepon</div>
                  <div style={{ fontWeight: 700 }}>{selected.phone}</div>
                </div>
              )}
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Tanggal</div>
                <div>{new Date(selected.createdAt).toLocaleString("id-ID")}</div>
              </div>
            </div>
            <div style={{ padding: "1.25rem", background: "var(--surface-2)", borderRadius: "var(--radius-lg)", lineHeight: 1.8, color: "var(--text-secondary)" }}>
              {selected.message}
            </div>
            <div style={{ marginTop: "1.25rem", display: "flex", gap: "0.75rem" }}>
              <a href={`mailto:${selected.email}?subject=Re: ${selected.subject}`} className="btn btn-primary btn-sm" id={`reply-msg-${selected.id}`}>
                ✉️ Balas via Email
              </a>
              {selected.phone && (
                <a href={`https://wa.me/${selected.phone?.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" id={`whatsapp-msg-${selected.id}`}>
                  💬 WhatsApp
                </a>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface-2)", borderRadius: "var(--radius-xl)", border: "1px dashed var(--border)", padding: "4rem", color: "var(--text-muted)", textAlign: "center" }}>
            <div>
              <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>📨</div>
              <p>Pilih pesan untuk melihat detail</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
