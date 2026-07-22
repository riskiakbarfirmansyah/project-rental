"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const year = new Date().getFullYear();
  const [config, setConfig] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setConfig(d.data.config || {});
      })
      .catch(() => {});
  }, []);

  const waNumber = (config.whatsapp || "6281325485262").replace(/[^0-9]/g, "");
  const instagramVal = config.instagram || "@bellabellyrentalmobilsmg";
  const tiktokVal = config.TikTok || "@bellabellyrentalmobilsmg";

  const instagramUser = instagramVal.trim().replace("@", "");
  const tiktokUser = tiktokVal.trim().startsWith("@") ? tiktokVal.trim() : `@${tiktokVal.trim()}`;

  const socialLinks = [
    { icon: "📱", label: "WhatsApp", href: `https://wa.me/${waNumber}` },
    { icon: "📸", label: "Instagram", href: `https://www.instagram.com/${instagramUser}/` },
    { icon: "🎵", label: "TikTok", href: `https://www.tiktok.com/${tiktokUser}` },
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
            <div className="footer-brand" style={{ marginBottom: "0.75rem" }}>
              <Image
                src="/images/logo-no-bg.png"
                alt="Bella Belly Trans Co"
                width={180}
                height={62}
                className="footer-logo"
                style={{ display: "block" }}
              />
            </div>
            <p className="footer-description" style={{ marginTop: 0, marginBottom: "1rem" }}>
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

          {/* Kontak */}
          <div className="footer-column">
            <h4>Kontak</h4>
            <div className="footer-contact">
              <p>📞 {config.contact_phone || "+62 813-2548-5262"}</p>
              <p>📍 {config.contact_address || "Jl. Sawunggaling Selatan No 48 Semarang"}</p>
              <p>🕐 {config.contact_hours || "Senin - Minggu, 08:00 - 20:00 WIB"}</p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div>
            <p>© {year} Kayta Co. All rights reserved.</p>
          </div>
          {/* <div className="footer-bottom-links">
            <Link href="/privacy">Kebijakan Privasi</Link>
            <Link href="/terms">Syarat & Ketentuan</Link>
          </div> */}
        </div>
      </div>
    </footer>
  );
}