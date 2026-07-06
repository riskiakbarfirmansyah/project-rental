"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { if (d.success) setUser(d.data.user); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  };

  const links = [
    { href: "/", label: "Home" },
    { href: "/about", label: "Tentang Kami" },
    { href: "/services", label: "Layanan" },
    { href: "/gallery", label: "Galeri" },
    { href: "/blog", label: "Blog" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Kontak" },
  ];

  return (
    <nav className="navbar" style={{ boxShadow: scrolled ? "var(--shadow-md)" : "none" }}>
      <div className="container">
        <div className="navbar-inner">
          <Link href="/" className="navbar-brand" id="navbar-brand">
            <span style={{ fontSize: "1.5rem" }}>🚗</span>
            Rental<span className="brand-dot">Ku</span>
          </Link>

          {/* Desktop links */}
          <ul className="navbar-links" style={{ display: "flex" }}>
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={pathname === l.href ? "active" : ""}
                  id={`nav-${l.href.replace("/", "") || "home"}`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="navbar-actions">
            {user ? (
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                {user.role === "ADMIN" && (
                  <Link href="/admin" className="btn btn-sm btn-outline" id="nav-admin">
                    Dashboard
                  </Link>
                )}
                <Link href="/profile" id="nav-profile" style={{
                  display: "flex", alignItems: "center", gap: "0.5rem",
                  padding: "0.375rem 0.875rem", background: "var(--surface-2)",
                  borderRadius: "var(--radius-full)", fontSize: "0.9rem",
                  fontWeight: 600, color: "var(--text-primary)"
                }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: "50%", background: "var(--gradient-primary)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "white", fontSize: "0.75rem", fontWeight: 700
                  }}>
                    {user.name[0].toUpperCase()}
                  </span>
                  {user.name.split(" ")[0]}
                </Link>
                <button onClick={handleLogout} className="btn btn-sm" id="nav-logout"
                  style={{ background: "var(--error-light)", color: "var(--error)", border: "none" }}>
                  Keluar
                </button>
              </div>
            ) : (
              <>
                <Link href="/login" className="btn btn-sm btn-outline" id="nav-login">Masuk</Link>
                <Link href="/register" className="btn btn-sm btn-primary" id="nav-register">Daftar</Link>
              </>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              id="nav-menu-toggle"
              style={{
                display: "none", background: "none", border: "none", cursor: "pointer",
                padding: "0.5rem", borderRadius: "var(--radius-sm)"
              }}
              className="mobile-menu-btn"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {menuOpen
                  ? <path d="M18 6 6 18M6 6l12 12" />
                  : <path d="M3 12h18M3 6h18M3 18h18" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div style={{
            borderTop: "1px solid var(--border)", padding: "1rem 0",
            display: "flex", flexDirection: "column", gap: "0.25rem"
          }}>
            {links.map((l) => (
              <Link key={l.href} href={l.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  padding: "0.75rem 1rem", borderRadius: "var(--radius-md)",
                  color: pathname === l.href ? "var(--primary)" : "var(--text-secondary)",
                  background: pathname === l.href ? "var(--primary-light)" : "transparent",
                  fontWeight: 500
                }}>
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
