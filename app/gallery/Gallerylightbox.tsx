"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  car?: { name: string; brand: string };
}

/* ─── CSS injected once into the document ─────────────────────────────────── */
const GALLERY_STYLES = `
  /* Respect prefers-reduced-motion */
  @media (prefers-reduced-motion: reduce) {
    .gal-item, .gal-lightbox, .gal-img-wrap, .gal-nav-btn, .gal-close-btn {
      animation: none !important;
      transition: none !important;
    }
  }

  /* ── Grid item entrance ── */
  @keyframes galFadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .gal-item {
    opacity: 0;
    animation: galFadeUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    border-radius: var(--radius-lg);
    overflow: hidden;
    border: 1px solid var(--border);
    background: var(--surface);
    display: flex;
    flex-direction: column;
    transition: box-shadow 0.35s ease, transform 0.35s ease, border-color 0.35s ease;
    will-change: transform, box-shadow;
  }
  .gal-item:hover {
    transform: translateY(-6px);
    box-shadow: 0 16px 48px rgba(0,0,0,0.13);
    border-color: var(--border-dark, #d4d4d4);
  }

  /* ── Image button inside card ── */
  .gal-img-btn {
    position: relative;
    width: 100%;
    height: 240px;
    flex-shrink: 0;
    background: var(--primary-light);
    border: none;
    padding: 0;
    cursor: pointer;
    display: block;
    overflow: hidden;
  }
  .gal-img-btn img {
    transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1) !important;
    will-change: transform;
  }
  .gal-item:hover .gal-img-btn img {
    transform: scale(1.07) !important;
  }

  /* overlay dimmer */
  .gal-img-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0);
    transition: background 0.35s ease;
    pointer-events: none;
  }
  .gal-item:hover .gal-img-btn::after {
    background: rgba(0,0,0,0.18);
  }

  /* zoom icon on hover */
  .gal-zoom-icon {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.75rem;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 2;
    pointer-events: none;
  }
  .gal-item:hover .gal-zoom-icon {
    opacity: 1;
  }

  /* ── Lightbox backdrop ── */
  @keyframes galBackdropIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes galBackdropOut {
    from { opacity: 1; }
    to   { opacity: 0; }
  }

  .gal-lightbox {
    position: fixed;
    inset: 0;
    z-index: 1000;
    background: rgba(10, 15, 30, 0.92);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    backdrop-filter: blur(8px);
    animation: galBackdropIn 0.3s ease forwards;
  }
  .gal-lightbox.closing {
    animation: galBackdropOut 0.25s ease forwards;
  }

  /* ── Lightbox content ── */
  @keyframes galContentIn {
    from { opacity: 0; transform: scale(0.93) translateY(16px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes galContentOut {
    from { opacity: 1; transform: scale(1) translateY(0); }
    to   { opacity: 0; transform: scale(0.93) translateY(16px); }
  }
  @keyframes galImgSlideLeft {
    from { opacity: 0; transform: translateX(40px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes galImgSlideRight {
    from { opacity: 0; transform: translateX(-40px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  .gal-content {
    position: relative;
    width: 100%;
    max-width: 900px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    animation: galContentIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
  .gal-lightbox.closing .gal-content {
    animation: galContentOut 0.25s ease forwards;
  }

  .gal-img-wrap {
    position: relative;
    width: 100%;
    height: 70vh;
    border-radius: var(--radius-lg);
    overflow: hidden;
    background: #000;
  }
  .gal-img-wrap.slide-left  { animation: galImgSlideLeft  0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  .gal-img-wrap.slide-right { animation: galImgSlideRight 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards; }

  /* ── Lightbox buttons ── */
  .gal-close-btn, .gal-nav-btn {
    border: 1px solid rgba(255,255,255,0.22);
    background: rgba(255,255,255,0.1);
    color: white;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.25s ease, border-color 0.25s ease, transform 0.2s ease;
    backdrop-filter: blur(4px);
  }
  .gal-close-btn:hover, .gal-nav-btn:hover {
    background: rgba(255,255,255,0.22);
    border-color: rgba(255,255,255,0.4);
    transform: scale(1.1);
  }
  .gal-close-btn:active, .gal-nav-btn:active {
    transform: scale(0.95);
  }
  .gal-close-btn {
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    width: 42px;
    height: 42px;
    font-size: 1.15rem;
    z-index: 10;
  }
  .gal-nav-btn {
    position: absolute;
    top: 50%;
    width: 46px;
    height: 46px;
    font-size: 1.6rem;
    line-height: 1;
  }
  .gal-nav-btn.prev { left: 1.25rem;  transform: translateY(-50%); }
  .gal-nav-btn.next { right: 1.25rem; transform: translateY(-50%); }
  .gal-nav-btn.prev:hover { transform: translateY(-50%) scale(1.1); }
  .gal-nav-btn.next:hover { transform: translateY(-50%) scale(1.1); }
  .gal-nav-btn.prev:active { transform: translateY(-50%) scale(0.95); }
  .gal-nav-btn.next:active { transform: translateY(-50%) scale(0.95); }

  /* counter indicator */
  .gal-counter {
    position: absolute;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 6px;
  }
  .gal-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(255,255,255,0.35);
    transition: background 0.25s ease, transform 0.25s ease;
  }
  .gal-dot.active {
    background: white;
    transform: scale(1.4);
  }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .gal-img-wrap { height: 55vw; min-height: 220px; }
    .gal-nav-btn.prev { left: 0.5rem; }
    .gal-nav-btn.next { right: 0.5rem; }
  }
`;

function useStyleOnce(css: string) {
  const injected = useRef(false);
  useEffect(() => {
    if (injected.current) return;
    injected.current = true;
    const el = document.createElement("style");
    el.setAttribute("data-gallery", "1");
    el.textContent = css;
    document.head.appendChild(el);
    return () => { el.remove(); injected.current = false; };
  }, []);
}

/* ─── Intersection-Observer hook for staggered entrance ──────────────────── */
function useRevealOnScroll(count: number) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      refs.current.forEach(el => el && (el.style.opacity = "1"));
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const delay = parseFloat(el.dataset.delay || "0");
            el.style.animationDelay = `${delay}ms`;
            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.1 }
    );
    refs.current.forEach(el => el && obs.observe(el));
    return () => obs.disconnect();
  }, [count]);
  return refs;
}

/* ─── Main Component ──────────────────────────────────────────────────────── */
export default function GalleryLightbox({ items }: { items: GalleryItem[] }) {
  useStyleOnce(GALLERY_STYLES);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [slideDir, setSlideDir] = useState<"left" | "right" | null>(null);
  const [closing, setClosing] = useState(false);

  const refs = useRevealOnScroll(items.length);

  /* ── Open / close ── */
  const open = (idx: number) => {
    setSlideDir(null);
    setActiveIndex(idx);
    setClosing(false);
  };

  const close = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setActiveIndex(null);
      setClosing(false);
    }, 240);
  }, []);

  /* ── Navigate ── */
  const showPrev = useCallback(() => {
    setSlideDir("right");
    setActiveIndex(i => (i === null ? null : (i - 1 + items.length) % items.length));
  }, [items.length]);

  const showNext = useCallback(() => {
    setSlideDir("left");
    setActiveIndex(i => (i === null ? null : (i + 1) % items.length));
  }, [items.length]);

  /* ── Keyboard ── */
  useEffect(() => {
    if (activeIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape")      close();
      if (e.key === "ArrowLeft")   showPrev();
      if (e.key === "ArrowRight")  showNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIndex, close, showPrev, showNext]);

  /* ── Lock body scroll when lightbox open ── */
  useEffect(() => {
    if (activeIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [activeIndex]);

  const activeItem = activeIndex !== null ? items[activeIndex] : null;

  /* ── Reset slide direction after animation ── */
  useEffect(() => {
    if (slideDir) {
      const t = setTimeout(() => setSlideDir(null), 320);
      return () => clearTimeout(t);
    }
  }, [slideDir, activeIndex]);

  return (
    <>
      {/* ── Gallery Grid ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "1.5rem",
      }}>
        {items.map((item, idx) => (
          <div
            key={item.id}
            id={`gallery-item-${item.id}`}
            className="gal-item"
            ref={el => { refs.current[idx] = el; }}
            data-delay={String(Math.min(idx, 5) * 80)}
          >
            {/* Image button */}
            <button
              className="gal-img-btn"
              onClick={() => open(idx)}
              aria-label={`Lihat ${item.title} lebih besar`}
            >
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <span className="gal-zoom-icon" aria-hidden="true">🔍</span>
            </button>

            {/* Caption */}
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

      {/* ── Lightbox ── */}
      {(activeItem || closing) && activeItem && (
        <div
          className={`gal-lightbox${closing ? " closing" : ""}`}
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Lightbox galeri"
        >
          {/* Close */}
          <button className="gal-close-btn" onClick={close} aria-label="Tutup">✕</button>

          {/* Prev */}
          {items.length > 1 && (
            <button
              className="gal-nav-btn prev"
              onClick={e => { e.stopPropagation(); showPrev(); }}
              aria-label="Foto sebelumnya"
            >
              ‹
            </button>
          )}

          {/* Content */}
          <div className="gal-content" onClick={e => e.stopPropagation()}>
            <div className={`gal-img-wrap${slideDir ? ` slide-${slideDir}` : ""}`}>
              <Image
                key={activeItem.id}
                src={activeItem.imageUrl}
                alt={activeItem.title}
                fill
                style={{ objectFit: "contain" }}
                sizes="90vw"
                priority
              />
            </div>

            {/* Caption */}
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

            {/* Dot indicator */}
            {items.length > 1 && (
              <div className="gal-counter">
                {items.map((_, i) => (
                  <span
                    key={i}
                    className={`gal-dot${i === activeIndex ? " active" : ""}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Next */}
          {items.length > 1 && (
            <button
              className="gal-nav-btn next"
              onClick={e => { e.stopPropagation(); showNext(); }}
              aria-label="Foto berikutnya"
            >
              ›
            </button>
          )}
        </div>
      )}
    </>
  );
}