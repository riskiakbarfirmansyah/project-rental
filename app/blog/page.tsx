import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = { title: "Blog" };

export default async function BlogPage() {
  let posts: {id: string; title: string; slug: string; excerpt: string; imageUrl?: string; createdAt: string; author: {name: string}}[] = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/blog?limit=12`, { cache: "no-store" });
    if (res.ok) { const d = await res.json(); posts = d.data?.posts || []; }
  } catch {}

  return (
    <>
      <Navbar />

      <section style={{ background: "var(--gradient-hero)", padding: "5rem 0 3rem" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <h1 style={{ color: "white", marginBottom: "1rem" }}>Blog & Tips Perjalanan</h1>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1.125rem", maxWidth: 500, margin: "0 auto" }}>
            Tips, panduan, dan informasi menarik seputar sewa mobil dan perjalanan di Indonesia.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {posts.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem" }}>
              {posts.map((post) => (
                <article key={post.id} className="card" id={`blog-${post.id}`}>
                  <div style={{
                    width: "100%", height: 200,
                    background: "linear-gradient(135deg, var(--primary-light) 0%, #dbeafe 100%)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "4rem"
                  }}>
                    📝
                  </div>
                  <div className="card-body">
                    <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                      {new Date(post.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                      &nbsp;· oleh {post.author.name}
                    </p>
                    <h3 style={{ fontSize: "1.0625rem", marginBottom: "0.75rem", lineHeight: 1.4 }}>
                      <a href={`/blog/${post.slug}`} style={{ color: "var(--text-primary)" }}
                        id={`blog-link-${post.id}`}>
                        {post.title}
                      </a>
                    </h3>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                      {post.excerpt}
                    </p>
                    <a href={`/blog/${post.slug}`} className="btn btn-outline btn-sm" id={`blog-read-${post.id}`}>
                      Baca Selengkapnya →
                    </a>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "4rem" }}>
              <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📝</div>
              <h3 style={{ color: "var(--text-secondary)" }}>Belum ada artikel</h3>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
