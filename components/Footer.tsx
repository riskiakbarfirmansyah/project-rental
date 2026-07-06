import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "3rem" }}>
          {/* Brand */}
          <div>
            <div className="footer-brand" style={{ marginBottom: "1rem" }}>
              🚗 RentalKu
            </div>
            <p style={{ fontSize: "0.9375rem", lineHeight: 1.7, marginBottom: "1.5rem" }}>
              Layanan sewa mobil terpercaya dengan armada lengkap dan harga terjangkau.
              Siap melayani perjalanan bisnis dan wisata Anda.
            </p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              {[
                { icon: "📱", label: "WhatsApp", href: "https://wa.me/6281234567890" },
                { icon: "📸", label: "Instagram", href: "#" },
                { icon: "👥", label: "Facebook", href: "#" },
              ].map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  title={s.label}
                  style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: "rgba(255,255,255,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.1rem", transition: "var(--transition)"
                  }}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Navigasi */}
          <div>
            <h4>Navigasi</h4>
            {[
              { href: "/", label: "Home" },
              { href: "/about", label: "Tentang Kami" },
              { href: "/services", label: "Layanan" },
              { href: "/gallery", label: "Galeri" },
              { href: "/blog", label: "Blog" },
            ].map((l) => (
              <Link key={l.href} href={l.href}>{l.label}</Link>
            ))}
          </div>

          {/* Layanan */}
          <div>
            <h4>Layanan</h4>
            {[
              { href: "/services?type=SUV", label: "Sewa SUV" },
              { href: "/services?type=MPV", label: "Sewa MPV" },
              { href: "/services?type=SEDAN", label: "Sewa Sedan" },
              { href: "/faq", label: "FAQ" },
              { href: "/contact", label: "Kontak Kami" },
            ].map((l) => (
              <Link key={l.href} href={l.href}>{l.label}</Link>
            ))}
          </div>

          {/* Kontak */}
          <div>
            <h4>Kontak</h4>
            <p style={{ fontSize: "0.9375rem", marginBottom: "0.5rem" }}>
              📞 +62 812-3456-7890
            </p>
            <p style={{ fontSize: "0.9375rem", marginBottom: "0.5rem" }}>
              ✉️ info@rentalku.com
            </p>
            <p style={{ fontSize: "0.9375rem", marginBottom: "0.5rem" }}>
              📍 Jl. Sudirman No. 1, Jakarta
            </p>
            <p style={{ fontSize: "0.9375rem" }}>
              🕐 Senin - Minggu, 08:00 - 20:00
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {year} RentalKu. All rights reserved.</p>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <Link href="/privacy" style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.875rem" }}>
              Kebijakan Privasi
            </Link>
            <Link href="/terms" style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.875rem" }}>
              Syarat & Ketentuan
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
