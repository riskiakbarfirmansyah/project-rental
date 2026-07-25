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
  { section: "Tentang Kami (Utama)", fields: [
    { key: "about_title", label: "Judul Halaman About", type: "text" },
    { key: "about_description", label: "Deskripsi Perusahaan", type: "textarea" },
    { key: "about_vision", label: "Visi Perusahaan", type: "textarea" },
    { key: "about_mission", label: "Misi Perusahaan (Gunakan tanda * untuk memisahkan poin)", type: "textarea" },
  ]},
  { section: "Tentang Kami (Nilai)", fields: [
    { key: "about_val1_title", label: "Nilai 1: Judul", type: "text" },
    { key: "about_val1_desc", label: "Nilai 1: Deskripsi", type: "textarea" },
    { key: "about_val2_title", label: "Nilai 2: Judul", type: "text" },
    { key: "about_val2_desc", label: "Nilai 2: Deskripsi", type: "textarea" },
    { key: "about_val3_title", label: "Nilai 3: Judul", type: "text" },
    { key: "about_val3_desc", label: "Nilai 3: Deskripsi", type: "textarea" },
    { key: "about_val4_title", label: "Nilai 4: Judul", type: "text" },
    { key: "about_val4_desc", label: "Nilai 4: Deskripsi", type: "textarea" },
  ]},
  { section: "Tentang Kami (Layanan)", fields: [
    { key: "about_srv1_title", label: "Layanan 1: Judul", type: "text" },
    { key: "about_srv1_desc", label: "Layanan 1: Deskripsi", type: "textarea" },
    { key: "about_srv2_title", label: "Layanan 2: Judul", type: "text" },
    { key: "about_srv2_desc", label: "Layanan 2: Deskripsi", type: "textarea" },
    { key: "about_srv3_title", label: "Layanan 3: Judul", type: "text" },
    { key: "about_srv3_desc", label: "Layanan 3: Deskripsi", type: "textarea" },
    { key: "about_srv4_title", label: "Layanan 4: Judul", type: "text" },
    { key: "about_srv4_desc", label: "Layanan 4: Deskripsi", type: "textarea" },
    { key: "about_srv5_title", label: "Layanan 5: Judul", type: "text" },
    { key: "about_srv5_desc", label: "Layanan 5: Deskripsi", type: "textarea" },
    { key: "about_srv6_title", label: "Layanan 6: Judul", type: "text" },
    { key: "about_srv6_desc", label: "Layanan 6: Deskripsi", type: "textarea" },
  ]},
  { section: "Tentang Kami (Komitmen)", fields: [
    { key: "about_grt1_title", label: "Komitmen 1: Judul", type: "text" },
    { key: "about_grt1_desc", label: "Komitmen 1: Deskripsi", type: "textarea" },
    { key: "about_grt2_title", label: "Komitmen 2: Judul", type: "text" },
    { key: "about_grt2_desc", label: "Komitmen 2: Deskripsi", type: "textarea" },
    { key: "about_grt3_title", label: "Komitmen 3: Judul", type: "text" },
    { key: "about_grt3_desc", label: "Komitmen 3: Deskripsi", type: "textarea" },
  ]},
  { section: "Halaman Booking (Pemesanan)", fields: [
    { key: "booking_promo_title", label: "Judul Promo / Info", type: "text" },
    { key: "booking_promo_desc", label: "Isi Promo (Gunakan tanda * untuk memisahkan poin)", type: "textarea" },
    { key: "booking_admin1_name", label: "Nama Admin 1 (Default: Admin 1)", type: "text" },
    { key: "booking_admin1_wa", label: "WhatsApp Admin 1 (628...)", type: "text" },
    { key: "booking_admin2_name", label: "Nama Admin 2 (Default: Admin 2)", type: "text" },
    { key: "booking_admin2_wa", label: "WhatsApp Admin 2 (628...)", type: "text" },
    { key: "booking_admin3_name", label: "Nama Admin 3 (Opsional)", type: "text" },
    { key: "booking_admin3_wa", label: "WhatsApp Admin 3 (Opsional)", type: "text" },
  ]},
  { section: "Kontak & Sosial Media", fields: [
    { key: "contact_phone", label: "Nomor Telepon", type: "text" },
    { key: "contact_email", label: "Email", type: "text" },
    { key: "contact_address", label: "Alamat", type: "textarea" },
    { key: "contact_hours", label: "Jam Operasional", type: "text" },
    { key: "whatsapp", label: "Nomor WhatsApp (tanpa +)", type: "text" },
    { key: "instagram", label: "Instagram", type: "text" },
    { key: "facebook", label: "Facebook", type: "text" },
    { key: "google_maps_embed", label: "Google Maps Embed URL (src dari iframe)", type: "textarea" },
  ]},
];

const SECTION_ICONS = ["🌐", "🚀", "🏢", "💎", "🚗", "🛡️", "📝", "📞"];

export default function AdminConfigPage() {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

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

  const currentSection = CONFIG_FIELDS[activeTab];

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
        .settings-layout {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 2rem;
          align-items: start;
        }
        @media (max-width: 868px) {
          .settings-layout {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }
        .settings-sidebar {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 0.75rem;
          box-shadow: var(--shadow-sm);
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .settings-tab-btn {
          border: none;
          background: transparent;
          text-align: left;
          padding: 0.875rem 1.25rem;
          border-radius: 12px;
          font-family: inherit;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          transition: var(--transition);
        }
        .settings-tab-btn:hover {
          background: var(--surface-2);
          color: var(--text-primary);
        }
        .settings-tab-btn.active {
          background: var(--primary);
          color: white;
        }
        .settings-content-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 2rem;
          box-shadow: var(--shadow-sm);
          animation: slideUp 0.25s ease-out;
        }
        @keyframes slideUp {
          from { transform: translateY(8px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .settings-section-title {
          font-family: 'Sora', sans-serif;
          font-size: 1.25rem;
          font-weight: 800;
          margin-bottom: 1.5rem;
          padding-bottom: 0.875rem;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .form-control-modern {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid var(--border);
          border-radius: 10px;
          font-family: inherit;
          font-size: 0.875rem;
          outline: none;
          color: var(--text-primary);
          transition: var(--transition);
        }
        .form-control-modern:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(23, 23, 23, 0.05);
        }
        .form-label-modern {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-primary);
          margin-bottom: 0.375rem;
          display: block;
        }
        .toast-saved-banner {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          background: var(--success);
          color: white;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.875rem;
          box-shadow: var(--shadow-xl);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          animation: slideInRight 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          z-index: 1000;
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      ` }} />

      {/* ── TOP HEADER SECTION ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 className="modern-title">Konfigurasi Website</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
            Sesuaikan konten visual, teks, kontak, dan statistik website utama Anda dari sini.
          </p>
        </div>
      </div>

      {/* ── SETTINGS SPLIT LAYOUT ── */}
      <div className="settings-layout">
        
        {/* Left Side: Navigation Sidebar */}
        <div className="settings-sidebar">
          {CONFIG_FIELDS.map((section, idx) => (
            <button
              key={section.section}
              className={`settings-tab-btn ${activeTab === idx ? "active" : ""}`}
              onClick={() => setActiveTab(idx)}
            >
              <span style={{ fontSize: "1.1rem" }}>{SECTION_ICONS[idx]}</span>
              <span>{section.section}</span>
            </button>
          ))}
        </div>

        {/* Right Side: Active Settings Form */}
        <div className="settings-content-card">
          <h3 className="settings-section-title">
            <span style={{ fontSize: "1.25rem" }}>{SECTION_ICONS[activeTab]}</span>
            {currentSection.section}
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.25rem" }}>
              {currentSection.fields.map((field) => (
                <div key={field.key} className="form-group" style={{ margin: 0 }}>
                  <label className="form-label-modern" htmlFor={`config-${field.key}`}>{field.label}</label>
                  {field.type === "textarea" ? (
                    <textarea
                      id={`config-${field.key}`}
                      className="form-control-modern"
                      rows={4}
                      value={config[field.key] || ""}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      placeholder={`Masukkan ${field.label.toLowerCase()}...`}
                      style={{ padding: "0.75rem" }}
                    />
                  ) : (
                    <input
                      id={`config-${field.key}`}
                      type="text"
                      className="form-control-modern"
                      value={config[field.key] || ""}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      placeholder={`Masukkan ${field.label.toLowerCase()}...`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Bottom Actions for current card */}
            <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid var(--border)", paddingTop: "1.5rem", marginTop: "0.5rem" }}>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving}
                id="save-config-btn"
                style={{ borderRadius: "10px", padding: "0.65rem 1.5rem" }}
              >
                {saving ? "Menyimpan..." : "💾 Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Floating Save Success Banner */}
      {saved && (
        <div className="toast-saved-banner">
          <span>✓</span> Konfigurasi berhasil disimpan ke database!
        </div>
      )}
      
    </div>
  );
}
