"use client";

const features = [
  { icon: "🛡️", title: "Asuransi Lengkap", desc: "Setiap kendaraan kami dilengkapi dengan asuransi penuh untuk ketenangan pikiran Anda selama perjalanan." },
  { icon: "📞", title: "Layanan 24/7", desc: "Tim kami siap membantu Anda kapan saja. Hubungi kami di nomor darurat yang selalu aktif 24 jam." },
  { icon: "✅", title: "Mobil Terawat", desc: "Armada kami mendapatkan perawatan rutin setiap bulan untuk memastikan kondisi prima saat Anda gunakan." },
  { icon: "💰", title: "Harga Transparan", desc: "Tidak ada biaya tersembunyi. Harga yang Anda lihat adalah harga yang Anda bayar, tanpa kejutan." },
  { icon: "🚀", title: "Proses Cepat", desc: "Booking mudah dan cepat, konfirmasi dalam hitungan menit. Tidak perlu antri panjang." },
  { icon: "📍", title: "Jemput & Antar", desc: "Layanan antar-jemput ke lokasi Anda. Kami datang ke tempat Anda, bukan sebaliknya." },
];

export default function WhyUsFeatures() {
  return (
    <div className="why-us-grid">
      {features.map((f) => (
        <div
          key={f.title}
          style={{
            padding: "2rem", borderRadius: "var(--radius-xl)",
            background: "var(--bg)", border: "1px solid var(--border)",
            transition: "var(--transition)", cursor: "default",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLDivElement;
            el.style.background = "var(--primary-light)";
            el.style.borderColor = "var(--primary)";
            el.style.transform = "translateY(-4px)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLDivElement;
            el.style.background = "var(--bg)";
            el.style.borderColor = "var(--border)";
            el.style.transform = "";
          }}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>{f.icon}</div>
          <h3 style={{ fontSize: "1.125rem", marginBottom: "0.75rem" }}>{f.title}</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.7 }}>{f.desc}</p>
        </div>
      ))}
    </div>
  );
}
