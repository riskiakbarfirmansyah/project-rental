"use client";

import { useState, useEffect, useCallback } from "react";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface DailyData {
  date: string;
  label: string;
  views: number;
  uniqueIps: number;
}
interface HourlyData { hour: string; views: number; }
interface PageStat  { page: string; count: number; }
interface RefStat   { referrer: string; count: number; }

interface TrafficData {
  range: string;
  days: number;
  dailyData: DailyData[];
  hourlyData: HourlyData[];
  summary: {
    today:     { views: number; uniqueIps: number };
    yesterday: { views: number; uniqueIps: number };
    inRange:   { views: number; uniqueIps: number };
    peakHour:  string;
  };
  topPages: PageStat[];
  topReferrers: RefStat[];
}

/* ─────────────────────────────────────────────
   Sparkline / Area Chart (pure SVG)
───────────────────────────────────────────── */
function AreaChart({
  data, color, gradId, height = 100,
}: {
  data: number[]; color: string; gradId: string; height?: number;
}) {
  const W = 600, H = height;
  const max = Math.max(...data, 1);
  const step = data.length > 1 ? W / (data.length - 1) : W;

  const pts = data.map((v, i) => [i * step, H - (v / max) * H * 0.9]);
  const polyline = pts.map(([x, y]) => `${x},${y}`).join(" ");

  const area =
    `M${pts[0][0]},${H} ` +
    pts.map(([x, y]) => `L${x},${y}`).join(" ") +
    ` L${pts[pts.length - 1][0]},${H} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{ width: "100%", height }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={data.length <= 10 ? 4 : 0} fill={color} />
      ))}
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Bar Chart (pure SVG)
───────────────────────────────────────────── */
function BarChart({
  data, color, labelKey, valueKey, height = 180,
}: {
  data: Record<string, any>[];
  color: string;
  labelKey: string;
  valueKey: string;
  height?: number;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const W = 600;
  const max = Math.max(...data.map((d) => d[valueKey] as number), 1);
  const barW = Math.max(10, (W / data.length) * 0.6);
  const gap   = W / data.length;

  return (
    <div style={{ position: "relative", overflow: "hidden" }}>
      <svg viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none" style={{ width: "100%", height }}>
        {data.map((d, i) => {
          const val = d[valueKey] as number;
          const bh  = (val / max) * (height - 24);
          const x   = gap * i + (gap - barW) / 2;
          const y   = height - bh - 20;
          const isH = hovered === i;
          return (
            <g key={i}>
              <rect
                x={x} y={y} width={barW} height={bh}
                rx="4" ry="4"
                fill={isH ? color : `${color}99`}
                style={{ transition: "fill 0.15s" }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              />
              {isH && (
                <text x={x + barW / 2} y={y - 4} textAnchor="middle"
                  fontSize="10" fill={color} fontWeight="700">
                  {val}
                </text>
              )}
            </g>
          );
        })}

        {/* X-axis labels */}
        {data.map((d, i) => (
          <text
            key={`l-${i}`}
            x={gap * i + gap / 2}
            y={height - 4}
            textAnchor="middle"
            fontSize="9"
            fill="#94a3b8"
          >
            {data.length <= 14 ? String(d[labelKey]).slice(-5) : (i % 3 === 0 ? String(d[labelKey]).slice(-5) : "")}
          </text>
        ))}
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Mini Stat Card
───────────────────────────────────────────── */
function MiniStat({
  label, value, sub, icon, color, trend,
}: {
  label: string; value: string | number; sub: string;
  icon: string; color: string; trend?: "up" | "down" | "neutral";
}) {
  const trendColor = trend === "up" ? "#10b981" : trend === "down" ? "#ef4444" : "#94a3b8";
  const trendIcon  = trend === "up" ? "↑" : trend === "down" ? "↓" : "→";
  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-xl)", padding: "1.5rem",
      boxShadow: "var(--shadow-sm)", display: "flex", flexDirection: "column", gap: "0.5rem",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {label}
        </span>
        <span style={{ fontSize: "1.25rem" }}>{icon}</span>
      </div>
      <div style={{ fontFamily: "Sora, sans-serif", fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.1 }}>
        {value}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
        {trend && (
          <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: trendColor }}>
            {trendIcon}
          </span>
        )}
        <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>{sub}</span>
      </div>
      <div style={{ height: 4, background: "var(--border)", borderRadius: 2, marginTop: "0.25rem" }}>
        <div style={{ height: "100%", width: "70%", background: color, borderRadius: 2 }} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
type Range = "1d" | "7d" | "30d";

export default function AdminTrafficPage() {
  const [range, setRange]     = useState<Range>("7d");
  const [data, setData]       = useState<TrafficData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [activeChart, setActiveChart] = useState<"views" | "unique">("views");

  const fetchTraffic = useCallback(async (r: Range) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/traffic?range=${r}`);
      const json = await res.json();
      if (json.success) setData(json.data);
      else setError(json.error || "Gagal memuat data traffic");
    } catch {
      setError("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTraffic(range); }, [range, fetchTraffic]);

  const RANGE_LABELS: Record<Range, string> = {
    "1d": "Kemarin (per-jam)",
    "7d": "7 Hari Terakhir",
    "30d": "30 Hari Terakhir",
  };

  const chartData = range === "1d" && data?.hourlyData?.length
    ? data.hourlyData.map((h) => ({ label: h.hour, views: h.views, uniqueIps: 0 }))
    : data?.dailyData || [];

  const maxViews  = Math.max(...chartData.map((d) => d.views), 1);
  const totalInRange = data?.summary.inRange.views || 0;
  const prevTrend = data
    ? data.summary.today.views >= data.summary.yesterday.views ? "up" : "down"
    : "neutral";

  /* ── Render ── */
  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
      <div className="spinner" />
    </div>
  );

  if (error) return (
    <div style={{ padding: "4rem", textAlign: "center", color: "var(--error)" }}>
      <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
      <p>{error}</p>
      <button className="btn btn-outline" onClick={() => fetchTraffic(range)} style={{ marginTop: "1rem" }}>
        Coba Lagi
      </button>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

      {/* ── Scoped Styles ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        .traffic-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          padding: 1.75rem;
          box-shadow: var(--shadow-sm);
        }
        .range-btn {
          padding: 0.5rem 1.125rem;
          border-radius: 10px;
          border: 1.5px solid var(--border);
          background: var(--surface-2);
          color: var(--text-secondary);
          font-family: inherit;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .range-btn.active {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
        }
        .range-btn:hover:not(.active) {
          border-color: var(--primary);
          color: var(--primary);
        }
        .chart-tab {
          padding: 0.375rem 1rem;
          border-radius: 8px;
          border: none;
          background: transparent;
          font-family: inherit;
          font-size: 0.8125rem;
          font-weight: 600;
          cursor: pointer;
          color: var(--text-muted);
          transition: all 0.15s;
        }
        .chart-tab.active {
          background: var(--surface-2);
          color: var(--text-primary);
        }
        .page-row {
          display: flex;
          align-items: center;
          gap: 0.875rem;
          padding: 0.875rem 1rem;
          border-radius: 12px;
          transition: background 0.15s;
        }
        .page-row:hover { background: var(--surface-2); }
        .stats-grid-4 {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
        }
        @media (max-width: 900px) {
          .stats-grid-4 { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .stats-grid-4 { grid-template-columns: 1fr; }
        }
        .traffic-split {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1.5rem;
        }
        @media (max-width: 900px) {
          .traffic-split { grid-template-columns: 1fr; }
        }
      ` }} />

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", paddingBottom: "1.5rem", borderBottom: "1px solid var(--border)" }}>
        <div>
          <h1 style={{ fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "2rem", letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
            📊 Analitik Traffic
          </h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem", fontSize: "0.9375rem" }}>
            Pantau kunjungan, halaman populer, dan tren traffic website secara real-time.
          </p>
        </div>

        {/* Range Selector */}
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "0.375rem" }}>
          {(["1d", "7d", "30d"] as Range[]).map((r) => (
            <button key={r} className={`range-btn ${range === r ? "active" : ""}`}
              id={`traffic-range-${r}`} onClick={() => setRange(r)}>
              {r === "1d" ? "Kemarin" : r === "7d" ? "7 Hari" : "30 Hari"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="stats-grid-4">
        <MiniStat
          label="Hari Ini" icon="☀️" color="#f59e0b"
          value={data?.summary.today.views.toLocaleString("id-ID") || "0"}
          sub={`${data?.summary.today.uniqueIps || 0} IP unik`}
          trend={prevTrend as any}
        />
        <MiniStat
          label="Kemarin" icon="🌙" color="#8b5cf6"
          value={data?.summary.yesterday.views.toLocaleString("id-ID") || "0"}
          sub={`${data?.summary.yesterday.uniqueIps || 0} IP unik`}
        />
        <MiniStat
          label={`Total ${RANGE_LABELS[range]}`} icon="📈" color="#3b82f6"
          value={totalInRange.toLocaleString("id-ID")}
          sub={`${data?.summary.inRange.uniqueIps || 0} IP unik`}
        />
        <MiniStat
          label="Jam Tersibuk" icon="⚡" color="#10b981"
          value={data?.summary.peakHour?.split(" ")[0] || "-"}
          sub={data?.summary.peakHour || "Belum ada data hari ini"}
        />
      </div>

      {/* ── Main Area Chart ── */}
      <div className="traffic-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
          <div>
            <h3 style={{ fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "1.125rem" }}>
              Grafik Kunjungan — {RANGE_LABELS[range]}
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem", marginTop: "0.25rem" }}>
              {range === "1d" ? "Data per jam untuk hari kemarin" : `Data kunjungan ${data?.days} hari terakhir`}
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.25rem", background: "var(--surface-2)", borderRadius: 10, padding: "0.25rem" }}>
            <button className={`chart-tab ${activeChart === "views" ? "active" : ""}`}
              onClick={() => setActiveChart("views")}>📄 Total Views</button>
            {range !== "1d" && (
              <button className={`chart-tab ${activeChart === "unique" ? "active" : ""}`}
                onClick={() => setActiveChart("unique")}>👤 IP Unik</button>
            )}
          </div>
        </div>

        {/* Y-axis guides */}
        <div style={{ position: "relative" }}>
          {[0.75, 0.5, 0.25].map((pct) => (
            <div key={pct} style={{
              position: "absolute", left: 0, right: 0,
              top: `${(1 - pct) * 100}%`,
              borderTop: "1px dashed var(--border)",
              display: "flex", alignItems: "center",
            }}>
              <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)", background: "var(--surface)", paddingRight: "0.375rem", marginTop: "-9px" }}>
                {Math.round(maxViews * pct)}
              </span>
            </div>
          ))}

          <AreaChart
            data={chartData.map((d) => activeChart === "views" ? d.views : (d as DailyData).uniqueIps ?? 0)}
            color={activeChart === "views" ? "#3b82f6" : "#8b5cf6"}
            gradId={`grad-${activeChart}`}
            height={160}
          />
        </div>

        {/* X Labels */}
        {chartData.length > 0 && (
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "0.5rem",
            padding: "0 0.5rem",
          }}>
            {chartData.filter((_, i) => {
              const show = chartData.length <= 10 ? true : i % Math.ceil(chartData.length / 10) === 0;
              return show || i === chartData.length - 1;
            }).map((d, i) => (
              <span key={i} style={{ fontSize: "0.6875rem", color: "var(--text-muted)", fontWeight: 600 }}>
                {d.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Bar Chart (Daily) + Top Pages ── */}
      <div className="traffic-split">

        {/* Bar Chart */}
        <div className="traffic-card">
          <h3 style={{ fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "1.125rem", marginBottom: "0.5rem" }}>
            📊 Bar Chart Harian
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem", marginBottom: "1.25rem" }}>
            Perbandingan views per hari dalam rentang waktu dipilih.
          </p>
          {chartData.length > 0 ? (
            <BarChart
              data={chartData}
              color="#3b82f6"
              labelKey="label"
              valueKey="views"
              height={180}
            />
          ) : (
            <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📭</div>
              <p>Belum ada data traffic untuk rentang ini.</p>
            </div>
          )}
        </div>

        {/* Top Pages */}
        <div className="traffic-card" style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <h3 style={{ fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "1.125rem", marginBottom: "0.25rem" }}>
            🔥 Halaman Terpopuler
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem", marginBottom: "1rem" }}>
            Top 10 halaman dengan views terbanyak.
          </p>
          {(data?.topPages || []).length === 0 ? (
            <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "2rem" }}>Belum ada data</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {(data?.topPages || []).map((p, i) => {
                const pct = totalInRange > 0 ? (p.count / totalInRange) * 100 : 0;
                const maxCount = data?.topPages[0]?.count || 1;
                const barPct = (p.count / maxCount) * 100;
                return (
                  <div key={i} className="page-row">
                    <span style={{
                      width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                      background: i === 0 ? "#f59e0b" : i === 1 ? "#94a3b8" : i === 2 ? "#cd7c2f" : "var(--surface-2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.6875rem", fontWeight: 800, color: i < 3 ? "white" : "var(--text-muted)"
                    }}>
                      {i + 1}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-primary)",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                      }}>
                        {p.page === "/" ? "🏠 Beranda" : p.page}
                      </div>
                      <div style={{ height: 4, background: "var(--border)", borderRadius: 2, marginTop: "0.25rem" }}>
                        <div style={{ height: "100%", width: `${barPct}%`, background: "#3b82f6", borderRadius: 2, transition: "width 0.5s ease" }} />
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: "0.875rem", fontWeight: 800, color: "var(--text-primary)" }}>{p.count}</div>
                      <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>{pct.toFixed(1)}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>



    </div>
  );
}
