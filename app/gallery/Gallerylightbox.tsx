"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  car?: { name: string; brand: string };
}

export default function GalleryLightbox({ items }: { items: GalleryItem[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const activeItem = activeIndex !== null ? items[activeIndex] : null;

  const close = () => setActiveIndex(null);
  const showPrev = () => setActiveIndex((i) => (i === null ? null : (i - 1 + items.length) % items.length));
  const showNext = () => setActiveIndex((i) => (i === null ? null : (i + 1) % items.length));

  // Tutup pakai tombol Escape, navigasi pakai tombol panah kiri/kanan
  useEffect(() => {
    if (activeIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, items.length]);

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
        {items.map((item, idx) => (
          <div key={item.id} id={`gallery-item-${item.id}`} style={{
            borderRadius: "var(--radius-lg)", overflow: "hidden",
            border: "1px solid var(--border)", transition: "var(--transition)",
            background: "var(--surface)", display: "flex", flexDirection: "column",
          }}>
            {/* Uniform image height, klik untuk memperbesar */}
            <button
              onClick={() => setActiveIndex(idx)}
              aria-label={`Lihat ${item.title} lebih besar`}
              style={{
                position: "relative",
                width: "100%",
                height: 240,
                flexShrink: 0,
                background: "var(--primary-light)",
                border: "none",
                padding: 0,
                cursor: "zoom-in",
                display: "block",
              }}
            >
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </button>

            <div style={{ padding: "1.25rem", flex: 1 }}>
              <h3 style={{ fontSize: "1rem", marginBottom: "0.375rem" }}>{item.title}</h3>
              {item.description && (
                <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>{item.description}</p>
              )}
              {item.car && (
                <div style={{ marginTop: "0.75rem" }}>
                  <span className="badge badge-primary">{item.car.brand} {item.car.name}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox overlay */}
      {activeItem && (
        <div
          onClick={close}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(15, 23, 42, 0.9)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "2rem",
          }}
        >
          {/* Tombol tutup */}
          <button
            onClick={close}
            aria-label="Tutup"
            style={{
              position: "absolute", top: "1.5rem", right: "1.5rem",
              width: 40, height: 40, borderRadius: "50%",
              background: "rgba(255,255,255,0.1)", color: "white",
              border: "1px solid rgba(255,255,255,0.2)",
              fontSize: "1.25rem", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            ✕
          </button>

          {/* Tombol prev */}
          {items.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); showPrev(); }}
              aria-label="Sebelumnya"
              style={{
                position: "absolute", left: "1.5rem", top: "50%", transform: "translateY(-50%)",
                width: 44, height: 44, borderRadius: "50%",
                background: "rgba(255,255,255,0.1)", color: "white",
                border: "1px solid rgba(255,255,255,0.2)",
                fontSize: "1.5rem", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              ‹
            </button>
          )}

          {/* Konten gambar */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 900,
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <div style={{
              position: "relative",
              width: "100%",
              height: "70vh",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
              background: "#000",
            }}>
              <Image
                src={activeItem.imageUrl}
                alt={activeItem.title}
                fill
                style={{ objectFit: "contain" }}
                sizes="90vw"
              />
            </div>
            <div style={{ textAlign: "center", color: "white" }}>
              <h3 style={{ fontSize: "1.125rem", marginBottom: "0.25rem" }}>{activeItem.title}</h3>
              {activeItem.description && (
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.875rem" }}>{activeItem.description}</p>
              )}
              {activeItem.car && (
                <div style={{ marginTop: "0.5rem" }}>
                  <span className="badge badge-primary">{activeItem.car.brand} {activeItem.car.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tombol next */}
          {items.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); showNext(); }}
              aria-label="Selanjutnya"
              style={{
                position: "absolute", right: "1.5rem", top: "50%", transform: "translateY(-50%)",
                width: 44, height: 44, borderRadius: "50%",
                background: "rgba(255,255,255,0.1)", color: "white",
                border: "1px solid rgba(255,255,255,0.2)",
                fontSize: "1.5rem", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              ›
            </button>
          )}
        </div>
      )}
    </>
  );
}