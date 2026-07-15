"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/cars", label: "Mobil", icon: "🚗" },
  { href: "/admin/bookings", label: "Booking", icon: "📅" },
  { href: "/admin/blog", label: "Blog", icon: "📝" },
  { href: "/admin/gallery", label: "Galeri", icon: "🖼️" },
  { href: "/admin/reviews", label: "Review", icon: "⭐" },
  { href: "/admin/faq", label: "FAQ", icon: "❓" },
  { href: "/admin/config", label: "Konfigurasi", icon: "⚙️" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const sidebarWidth = 260;

  return (
    <div className="admin-layout" style={{ position: "relative" }}>
      {/* Floating Burger Menu Button (Visible when sidebar is closed) */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          style={{
            position: "fixed",
            top: "1.5rem",
            left: "1.5rem",
            zIndex: 99,
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-md)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.25rem",
            color: "var(--text-primary)",
            transition: "all 0.2s ease"
          }}
          title="Buka Sidebar"
        >
          ☰
        </button>
      )}

      {/* Sidebar */}
      <aside
        className="admin-sidebar"
        style={{
          left: sidebarOpen ? 0 : -sidebarWidth,
          transition: "left 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          width: sidebarWidth,
        }}
      >
        <div className="admin-sidebar-brand" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
              }}
            >
              <Image
                src="/images/logo-no-bg.png"
                alt="Bella Belly Trans Co"
                width={180}
                height={62}
                style={{
                  width: "80px",
                  height: "auto",
                  objectFit: "contain",
                  filter: "grayscale(100%) brightness(0)",
                }}
              />
            </Link>
            <p style={{ color: "var(--text-muted)", fontSize: "0.7rem", marginTop: "0.25rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>
              Admin Panel
            </p>
          </div>

          {/* Close Sidebar Button */}
          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              width: "32px",
              height: "32px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.875rem",
              color: "var(--text-secondary)",
              transition: "var(--transition)"
            }}
            title="Tutup Sidebar"
          >
            ◀
          </button>
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

        <div style={{ padding: "1rem 0.75rem", borderTop: "1px solid var(--border)" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", color: "var(--text-secondary)", fontSize: "0.9rem", borderRadius: "var(--radius-md)", transition: "var(--transition)", fontWeight: 500 }}
            id="admin-nav-front"
            className="admin-nav-item-bottom">
            🌐 Lihat Website
          </Link>
          <button onClick={handleLogout} id="admin-logout"
            className="admin-nav-item-bottom"
            style={{ width: "100%", display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", color: "var(--error)", background: "none", border: "none", cursor: "pointer", fontSize: "0.9rem", fontFamily: "inherit", borderRadius: "var(--radius-md)", transition: "var(--transition)", fontWeight: 600 }}>
            🚪 Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className="admin-content"
        style={{
          marginLeft: sidebarOpen ? sidebarWidth : 0,
          paddingLeft: sidebarOpen ? "3rem" : "5rem",
          transition: "margin-left 0.3s cubic-bezier(0.16, 1, 0.3, 1), padding-left 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {children}
      </main>
    </div>
  );
}
