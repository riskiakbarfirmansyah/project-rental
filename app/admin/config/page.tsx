"use client";

import { useState, useEffect } from "react";

const CONFIG_FIELDS = [
  { section: "Identitas Website", fields: [
    { key: "site_name", label: "Nama Website", type: "text" },
    { key: "site_tagline", label: "Tagline", type: "text" },
    { key: "site_description", label: "Deskripsi Website", type: "textarea" },
  ]},
  { section: "Halaman Utama (Hero)", fields: [
    { key: "hero_title", label: "Judul Hero", type: "text" },
    { key: "hero_subtitle", label: "Subjudul Hero", type: "textarea" },
  ]},
  { section: "Tentang Kami", fields: [
    { key: "about_title", label: "Judul Halaman About", type: "text" },
    { key: "about_description", label: "Deskripsi Perusahaan", type: "textarea" },
    { key: "about_vision", label: "Visi Perusahaan", type: "textarea" },
    { key: "about_mission", label: "Misi Perusahaan", type: "textarea" },
  ]},
  { section: "Kontak & Sosial Media", fields: [
    { key: "contact_phone", label: "Nomor Telepon", type: "text" },
    { key: "contact_email", label: "Email", type: "text" },
    { key: "contact_address", label: "Alamat", type: "textarea" },
    { key: "contact_hours", label: "Jam Operasional", type: "text" },
    { key: "whatsapp", label: "Nomor WhatsApp (tanpa +)", type: "text" },
    { key: "instagram", label: "Instagram", type: "text" },
    { key: "facebook", label: "Facebook", type: "text" },
  ]},
  { section: "Statistik (Tampilan Home)", fields: [
    { key: "years_experience", label: "Tahun Pengalaman", type: "text" },
    { key: "total_fleet", label: "Total Armada", type: "text" },
    { key: "happy_customers", label: "Pelanggan Puas", type: "text" },
    { key: "service_areas", label: "Kota Layanan", type: "text" },
  ]},
];

export default function AdminConfigPage() {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/config").then((r) => r.json()).then((d) => {
      setConfig(d.data?.config || {});
    }).finally(() => setLoading(false));
  }, []);

  const handleChange = (key: string, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true); setSaved(false);
    const configs = Object.entries(config).map(([key, value]) => ({ key, value }));
    const res = await fetch("/api/config", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ configs }),
    });
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    setSaving(false);
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>Konfigurasi Website</h1>
          <p style={{ color: "var(--text-secondary)" }}>Edit semua konten website dari sini</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          {saved && <span className="badge badge-success">✓ Tersimpan!</span>}
          <button className="btn btn-primary" onClick={handleSave} disabled={saving} id="save-config-btn">
            {saving ? "Menyimpan..." : "💾 Simpan Semua"}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {CONFIG_FIELDS.map((section) => (
          <div key={section.section} style={{ background: "var(--surface)", borderRadius: "var(--radius-xl)", padding: "2rem", border: "1px solid var(--border)" }}>
            <h3 style={{ marginBottom: "1.5rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--primary)", display: "inline-block" }} />
              {section.section}
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
              {section.fields.map((field) => (
                <div key={field.key} className="form-group" style={{ margin: 0, gridColumn: field.type === "textarea" ? "1 / -1" : "auto" }}>
                  <label className="form-label" htmlFor={`config-${field.key}`}>{field.label}</label>
                  {field.type === "textarea" ? (
                    <textarea id={`config-${field.key}`} className="form-control" rows={3}
                      value={config[field.key] || ""}
                      onChange={(e) => handleChange(field.key, e.target.value)} />
                  ) : (
                    <input id={`config-${field.key}`} type="text" className="form-control"
                      value={config[field.key] || ""}
                      onChange={(e) => handleChange(field.key, e.target.value)} />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
        <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={saving} id="save-config-btn-bottom">
          {saving ? "Menyimpan..." : "💾 Simpan Semua Perubahan"}
        </button>
      </div>
    </div>
  );
}
