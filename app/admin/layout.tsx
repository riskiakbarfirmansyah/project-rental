"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/traffic", label: "Analitik Traffic", icon: "📈" },
  { href: "/admin/cars", label: "Mobil", icon: "🚗" },
  { href: "/admin/bookings", label: "Booking", icon: "📅" },
  { href: "/admin/blog", label: "Blog", icon: "📝" },
  { href: "/admin/gallery", label: "Galeri", icon: "🖼️" },
  { href: "/admin/reviews", label: "Review", icon: "⭐" },
  { href: "/admin/faq", label: "FAQ", icon: "❓" },
  { href: "/admin/config", label: "Konfigurasi", icon: "⚙️" },
];

//buat deploy
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Auth guard — redirect to /login if not admin
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data.user.role === "ADMIN") {
          setIsAuthorized(true);
        } else {
          router.replace("/login");
        }
      })
      .catch(() => {
        router.replace("/login");
      })
      .finally(() => setAuthChecked(true));
  }, [router]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const sidebarWidth = 260;

  // Show loading while checking auth
  if (!authChecked || !isAuthorized) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: "100vh", background: "var(--bg)",
        flexDirection: "column", gap: "1rem",
      }}>
        <div style={{
          width: 40, height: 40, border: "3px solid var(--border)",
          borderTopColor: "var(--primary)", borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  //dumb saja buat deploy
  return (
    <div className="admin-layout" style={{ position: "relative", minHeight: "100vh" }}>
      
      {/* Mobile Top Header */}
      {isMobile && (
        <header
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: "60px",
            background: "var(--surface)",
            borderBottom: "1px solid var(--border)",
            zIndex: 90,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 1rem",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.2rem",
                color: "var(--text-primary)",
              }}
              aria-label="Toggle Sidebar"
            >
              {sidebarOpen ? "✕" : "☰"}
            </button>
            <span style={{ fontWeight: 800, fontSize: "1rem", fontFamily: "Sora, sans-serif" }}>
              Admin Panel
            </span>
          </div>

          <Link href="/" style={{ fontSize: "0.8125rem", color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>
            🌐 Website
          </Link>
        </header>
      )}

      {/* Backdrop for Mobile */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(4px)",
            zIndex: 998,
            animation: "fadeIn 0.2s ease",
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        className="admin-sidebar"
        style={{
          position: "fixed",
          top: 0,
          left: sidebarOpen ? 0 : -sidebarWidth,
          transition: "left 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          width: sidebarWidth,
          height: "100vh",
          zIndex: 999,
          background: "var(--surface)",
          borderRight: "1px solid var(--border)",
          boxShadow: isMobile && sidebarOpen ? "5px 0 25px rgba(0,0,0,0.15)" : "none",
        }}
      >
        <div className="admin-sidebar-brand" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)" }}>
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
            }}
            title="Tutup Sidebar"
          >
            ✕
          </button>
        </div>

        <nav className="admin-nav" style={{ flex: 1, padding: "1rem 0.75rem", display: "flex", flexDirection: "column", gap: "0.35rem", overflowY: "auto" }}>
          {navItems.map((item) => {
            const isActive = item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}
                onClick={() => { if (isMobile) setSidebarOpen(false); }}
                className={`admin-nav-item ${isActive ? "active" : ""}`}
                id={`admin-nav-${item.label.toLowerCase().replace(/\s/g, "-")}`}>
                <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: "1rem 0.75rem", borderTop: "1px solid var(--border)" }}>
          <Link href="/"
            onClick={() => { if (isMobile) setSidebarOpen(false); }}
            style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", color: "var(--text-secondary)", fontSize: "0.9rem", borderRadius: "var(--radius-md)", transition: "var(--transition)", fontWeight: 500 }}
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

      {/* Desktop Toggle Button */}
      {!isMobile && !sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          style={{
            position: "fixed",
            top: "2.5rem",
            left: "1.5rem",
            zIndex: 900,
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-sm)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.2rem",
            color: "var(--text-primary)",
            transition: "all 0.3s ease"
          }}
          aria-label="Buka Sidebar"
          title="Buka Sidebar"
        >
          ☰
        </button>
      )}

      {/* Main Content */}
      <main
        className="admin-content"
        style={{
          marginLeft: isMobile ? 0 : (sidebarOpen ? sidebarWidth : 0),
          padding: isMobile ? "5rem 1rem 2rem 1rem" : (sidebarOpen ? "2.5rem 3rem" : "2.5rem 3rem 2.5rem 5rem"),
          transition: "margin-left 0.3s cubic-bezier(0.16, 1, 0.3, 1), padding 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          minHeight: "100vh",
          maxWidth: "100%",
          overflowX: "hidden",
        }}
      >
        {children}
      </main>
    </div>
  );
}
