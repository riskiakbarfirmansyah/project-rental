"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";

interface CoverImageAdjusterProps {
  imageUrl: string;
  focalPoint: string; // "x% y%"
  onChange: (focalPoint: string) => void;
  onRemove: () => void;
  uploading: boolean;
  onUploadClick: () => void;
}

function parseFocal(fp: string) {
  const parts = fp.replace(/%/g, "").split(" ").map(Number);
  return { x: parts[0] ?? 50, y: parts[1] ?? 50 };
}

function focalToString(x: number, y: number) {
  return `${Math.round(x)}% ${Math.round(y)}%`;
}

export default function CoverImageAdjuster({
  imageUrl,
  focalPoint,
  onChange,
  onRemove,
  uploading,
  onUploadClick,
}: CoverImageAdjusterProps) {
  // Local state — diupdate setiap frame saat drag (tidak trigger parent re-render)
  const [localFocal, setLocalFocal] = useState(() => parseFocal(focalPoint));
  const [isDragging, setIsDragging] = useState(false);
  const [showHint, setShowHint] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const startMouse = useRef({ x: 0, y: 0 });
  const startFocal = useRef({ x: 50, y: 50 });
  // Ref to always hold latest localFocal without closure issues
  const localFocalRef = useRef(localFocal);

  // Sync localFocal if focalPoint prop changes from outside (e.g. load existing post)
  useEffect(() => {
    if (!isDragging) {
      const parsed = parseFocal(focalPoint);
      setLocalFocal(parsed);
      localFocalRef.current = parsed;
    }
  }, [focalPoint, isDragging]);

  const beginDrag = useCallback((clientX: number, clientY: number) => {
    setIsDragging(true);
    setShowHint(false);
    startMouse.current = { x: clientX, y: clientY };
    startFocal.current = { ...localFocal };
  }, [localFocal]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    beginDrag(e.clientX, e.clientY);
  }, [beginDrag]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    beginDrag(t.clientX, t.clientY);
  }, [beginDrag]);

  useEffect(() => {
    if (!isDragging) return;

    const move = (clientX: number, clientY: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      // Dragging right → image moves right → focal point decreases (we see more left side)
      const dx = ((clientX - startMouse.current.x) / rect.width) * 100;
      const dy = ((clientY - startMouse.current.y) / rect.height) * 100;
      const newX = Math.max(0, Math.min(100, startFocal.current.x - dx));
      const newY = Math.max(0, Math.min(100, startFocal.current.y - dy));
      // Only update local state — NO parent call here
      const next = { x: newX, y: newY };
      localFocalRef.current = next;
      setLocalFocal(next);
    };

    const onMouseMove = (e: MouseEvent) => move(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => move(e.touches[0].clientX, e.touches[0].clientY);

    const onEnd = () => {
      setIsDragging(false);
      // Read latest value from ref — safe to call onChange here (not inside setState)
      onChange(focalToString(localFocalRef.current.x, localFocalRef.current.y));
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onEnd);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, [isDragging, onChange]);

  const objectPosition = `${localFocal.x.toFixed(1)}% ${localFocal.y.toFixed(1)}%`;

  return (
    <div>
      {/* Preview Container */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        style={{
          position: "relative",
          width: "100%",
          height: 180,
          borderRadius: 10,
          overflow: "hidden",
          marginBottom: "0.5rem",
          border: `2px solid ${isDragging ? "var(--primary)" : "var(--border)"}`,
          cursor: isDragging ? "grabbing" : "grab",
          userSelect: "none",
          background: "#0f172a",
          transition: "border-color 0.2s",
        }}
      >
        <Image
          src={imageUrl}
          alt="Cover preview"
          fill
          draggable={false}
          style={{
            objectFit: "cover",
            objectPosition,
            pointerEvents: "none",
            // No transition during drag for smooth feel
            transition: isDragging ? "none" : "object-position 0.3s ease",
          }}
          sizes="340px"
        />

        {/* Crosshair focal point indicator */}
        <div
          style={{
            position: "absolute",
            left: `${localFocal.x}%`,
            top: `${localFocal.y}%`,
            transform: "translate(-50%, -50%)",
            width: 26,
            height: 26,
            borderRadius: "50%",
            border: "2px solid white",
            boxShadow: "0 0 0 1.5px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.35)",
            pointerEvents: "none",
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(2px)",
          }}
        >
          <svg width="11" height="11" viewBox="0 0 12 12">
            <line x1="6" y1="0" x2="6" y2="12" stroke="white" strokeWidth="1.5" />
            <line x1="0" y1="6" x2="12" y2="6" stroke="white" strokeWidth="1.5" />
            <circle cx="6" cy="6" r="2" fill="white" />
          </svg>
        </div>

        {/* Drag hint */}
        {showHint && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.38)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.35rem",
              zIndex: 3,
              pointerEvents: "none",
            }}
          >
            <div style={{ fontSize: "1.4rem" }}>✋</div>
            <span style={{
              color: "white", fontSize: "0.73rem", fontWeight: 600,
              textShadow: "0 1px 4px rgba(0,0,0,0.8)",
            }}>
              Geser untuk atur posisi
            </span>
          </div>
        )}

        {/* Remove button */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          style={{
            position: "absolute", top: 8, right: 8,
            background: "rgba(0,0,0,0.6)", color: "white",
            border: "none", borderRadius: "50%",
            width: 28, height: 28,
            cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center",
            fontSize: "0.875rem", zIndex: 4,
            backdropFilter: "blur(4px)",
          }}
        >
          ✕
        </button>
      </div>

      {/* Coordinates */}
      <p style={{
        fontSize: "0.71rem", color: "var(--text-muted)",
        marginBottom: "0.75rem", textAlign: "center",
        fontVariantNumeric: "tabular-nums",
      }}>
        {Math.round(localFocal.x)}% ← → · {Math.round(localFocal.y)}% ↑ ↓
      </p>

      <button
        type="button"
        className="btn btn-outline"
        style={{ width: "100%" }}
        onClick={onUploadClick}
        disabled={uploading}
      >
        {uploading ? "Mengunggah..." : "Ganti Gambar"}
      </button>
    </div>
  );
}
