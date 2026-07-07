import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const year = new Date().getFullYear();

  const socialLinks = [
    { icon: "📱", label: "WhatsApp", href: "https://wa.me/6281234567890" },
    { icon: "📸", label: "Instagram", href: "#" },
    { icon: "👥", label: "Facebook", href: "#" },
  ];

  const navigationLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "Tentang Kami" },
    { href: "/services", label: "Layanan" },
    { href: "/gallery", label: "Galeri" },
    { href: "/blog", label: "Blog" },
  ];

  const serviceLinks = [
    { href: "/services?type=SUV", label: "Sewa SUV" },
    { href: "/services?type=MPV", label: "Sewa MPV" },
    { href: "/services?type=SEDAN", label: "Sewa Sedan" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Kontak Kami" },
  ];

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-main">
            <div className="footer-brand">
              <Image
                src="/images/logo-no-bg.png"
                alt="Bella Belly Trans Co"
                width={180}
                height={62}
                className="footer-logo"
              />
            </div>
            <p className="footer-description">
              Layanan sewa mobil terpercaya dengan armada lengkap dan harga
              terjangkau. Siap melayani perjalanan bisnis dan wisata Anda.
            </p>
            <div className="footer-socials">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.label}
                  className="footer-social-link"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Navigasi */}
          <div className="footer-column">
            <h4>Navigasi</h4>
            <div className="footer-links">
              {navigationLinks.map((l) => (
                <Link key={l.href} href={l.href}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Layanan */}
          <div className="footer-column">
            <h4>Layanan</h4>
            <div className="footer-links">
              {serviceLinks.map((l) => (
                <Link key={l.href} href={l.href}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Kontak */}
          <div className="footer-column">
            <h4>Kontak</h4>
            <div className="footer-contact">
              <p>📞 +62 812-3456-7890</p>
              <p>✉️ info@rentalku.com</p>
              <p>📍 Jl. Sudirman No. 1, Jakarta</p>
              <p>🕐 Senin - Minggu, 08:00 - 20:00</p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {year} Bella Belly Trans Co. All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link href="/privacy">Kebijakan Privasi</Link>
            <Link href="/terms">Syarat & Ketentuan</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}