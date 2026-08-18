"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Car {
  id: string; name: string; brand: string; year: number; type: string;
  pricePerDay: number; seats: number; transmission: string; fuel: string;
  description: string; imageUrl?: string; isAvailable: boolean;
}

export default function ServicesPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [config, setConfig] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");

  useEffect(() => {
    const params = new URLSearchParams({ limit: "50" });
    if (search) params.set("search", search);

    setLoading(true);
    Promise.all([
      fetch(`/api/cars?${params}`).then((r) => r.json()),
      fetch("/api/config").then((r) => r.json())
    ]).then(([carsRes, configRes]) => {
      let data: Car[] = carsRes.data?.cars || [];
      if (sort === "price-asc") data = [...data].sort((a, b) => a.pricePerDay - b.pricePerDay);
      if (sort === "price-desc") data = [...data].sort((a, b) => b.pricePerDay - a.pricePerDay);
      setCars(data);
      setConfig(configRes.data?.config || {});
    }).finally(() => setLoading(false));
  }, [search, sort]);

  return (
    <>
      <Navbar />

      {/* Header */}
      <section style={{
        background: "var(--gradient-hero)", padding: "5rem 0 3rem"
      }}>
        <div className="container" style={{ textAlign: "center" }}>
          <h1 style={{ color: "white", marginBottom: "1rem" }}>{config.layanan_title || "Layanan & Harga Sewa Mobil"}</h1>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1.125rem", maxWidth: 500, margin: "0 auto" }}>
            {config.layanan_desc || "Temukan kendaraan yang tepat untuk kebutuhan Anda. Berbagai pilihan tersedia dengan harga kompetitif."}
          </p>
        </div>
      </section>

      {/* Filters */}
      <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "1.5rem 0", position: "sticky", top: 70, zIndex: 50 }}>
        <div className="container">
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
            <input
              type="text" placeholder="🔍 Cari mobil..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control" id="filter-search"
              style={{ flex: 1, minWidth: 200, maxWidth: 300 }}
            />
            <select value={sort} onChange={(e) => setSort(e.target.value)}
              className="form-control" id="filter-sort" style={{ width: "auto", minWidth: 150 }}>
              <option value="default">Urutkan</option>
              <option value="price-asc">Harga: Rendah</option>
              <option value="price-desc">Harga: Tinggi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cars Grid */}
      <section className="section">
        <div className="container">
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
              <div className="spinner" />
            </div>
          ) : cars.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
              <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🔍</div>
              <h3 style={{ marginBottom: "0.5rem" }}>Tidak ditemukan</h3>
              <p>Coba ubah filter pencarian Anda.</p>
            </div>
          ) : (
            <div className="cars-grid">
              {cars.map((car) => (
                <ServiceCarCard key={car.id} car={car} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}

function ServiceCarCard({ car }: { car: Car }) {
  return (
    <div className="car-card" id={`service-car-${car.id}`}>
      <div className="car-card-img-placeholder">
        {car.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={car.imageUrl} alt={car.name} style={{ width: "100%", height: 220, objectFit: "cover" }} />
        ) : (
          <span>🚗</span>
        )}
      </div>

      {!car.isAvailable && (
        <div style={{
          position: "absolute", top: "1rem", right: "1rem",
          padding: "0.375rem 0.75rem", background: "var(--error-light)",
          color: "var(--error)", borderRadius: "var(--radius-full)",
          fontSize: "0.75rem", fontWeight: 700
        }}>
          Tidak Tersedia
        </div>
      )}

      <div className="car-card-body">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
          <div>
            <h3 style={{ fontSize: "1.0625rem", marginBottom: "0.25rem" }}>{car.brand} {car.name}</h3>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <span className="badge" style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}>
                {car.year}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", margin: "0.875rem 0", flexWrap: "wrap", color: "var(--text-secondary)", fontSize: "0.8125rem" }}>
          <span>👥 {car.seats} kursi</span>
          <span>⚙️ {car.transmission === "AUTOMATIC" ? "Matic" : "Manual"}</span>
          <span>⛽ {car.fuel}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div className="car-price">
            Rp {car.pricePerDay.toLocaleString("id-ID")}
            <span>/hari</span>
          </div>
          {car.isAvailable ? (
            <a href={`/booking/${car.id}`} className="btn btn-primary btn-sm" id={`service-book-${car.id}`}>
              Pesan Sekarang
            </a>
          ) : (
            <button className="btn btn-sm" disabled
              style={{ background: "var(--border)", color: "var(--text-muted)", cursor: "not-allowed" }}>
              Tidak Tersedia
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
