"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/cars", label: "Mobil", icon: "🚗" },
  { href: "/admin/bookings", label: "Booking", icon: "📅" },
  { href: "/admin/blog", label: "Blog", icon: "📝" },
  { href: "/admin/gallery", label: "Galeri", icon: "🖼️" },
  { href: "/admin/faq", label: "FAQ", icon: "❓" },
  { href: "/admin/contact", label: "Pesan Masuk", icon: "📨" },
  { href: "/admin/config", label: "Konfigurasi", icon: "⚙️" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <Link href="/" style={{ fontFamily: "Sora, sans-serif", fontSize: "1.25rem", fontWeight: 800, color: "white", textDecoration: "none" }}>
            🚗 RentalKu
          </Link>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", marginTop: "0.25rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Admin Panel
          </p>
        </div>

        <nav className="admin-nav">
          {navItems.map((item) => {
            const isActive = item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}
                className={`admin-nav-item ${isActive ? "active" : ""}`}
                id={`admin-nav-${item.label.toLowerCase().replace(/\s/g, "-")}`}>
                <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: "1rem 0.75rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", color: "rgba(255,255,255,0.5)", fontSize: "0.9rem", borderRadius: "var(--radius-md)", transition: "var(--transition)" }}
            id="admin-nav-front">
            🌐 Lihat Website
          </Link>
          <button onClick={handleLogout} id="admin-logout"
            style={{ width: "100%", display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", color: "rgba(239,68,68,0.8)", background: "none", border: "none", cursor: "pointer", fontSize: "0.9rem", fontFamily: "inherit", borderRadius: "var(--radius-md)", transition: "var(--transition)" }}>
            🚪 Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-content">
        {children}
      </main>
    </div>
  );
}
