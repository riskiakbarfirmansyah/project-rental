import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Blog" };

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true },
    include: { author: { select: { id: true, name: true, avatar: true } } },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  return (
    <>
      <Navbar />

      <section style={{ background: "var(--gradient-hero)", padding: "6rem 0 4rem" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <h1 style={{ color: "white", marginBottom: "1rem", fontSize: "2.5rem", fontWeight: 800 }}>Blog & Tips Perjalanan</h1>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1.125rem", maxWidth: 600, margin: "0 auto" }}>
            Tips, panduan, dan informasi menarik seputar sewa mobil dan perjalanan di Indonesia.
          </p>
        </div>
      </section>

      <section className="section" style={{ background: "var(--surface-2)", minHeight: "60vh" }}>
        <div className="container">
          {posts.length > 0 ? (
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", 
              gap: "2.5rem" 
            }}>
              {posts.map((post) => {
                const dateStr = post.publishedAt || post.createdAt;
                const formattedDate = new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
                
                return (
                  <article 
                    key={post.id} 
                    className="card blog-card" 
                  >
                    <Link href={`/blog/${post.slug}`} style={{ display: "block", position: "relative", width: "100%", height: 220, overflow: "hidden" }}>
                      {post.imageUrl ? (
                        <Image 
                          src={post.imageUrl} 
                          alt={post.title} 
                          fill 
                          style={{ objectFit: "cover", transition: "transform 0.5s ease" }} 
                          sizes="(max-width: 768px) 100vw, 33vw" 
                        />
                      ) : (
                        <div style={{
                          width: "100%", height: "100%",
                          background: "linear-gradient(135deg, var(--primary-light) 0%, #dbeafe 100%)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "4rem"
                        }}>
                          📝
                        </div>
                      )}
                      
                      {post.category && (
                        <div style={{
                          position: "absolute",
                          top: "1rem",
                          left: "1rem",
                          background: "var(--primary)",
                          color: "white",
                          padding: "0.25rem 0.75rem",
                          borderRadius: "20px",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
                        }}>
                          {post.category}
                        </div>
                      )}
                    </Link>

                    <div className="card-body" style={{ padding: "1.5rem", flex: 1, display: "flex", flexDirection: "column" }}>
                      <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span>📅 {formattedDate}</span>
                        <span>•</span>
                        <span>✍️ {post.author.name}</span>
                      </p>
                      
                      <h3 style={{ fontSize: "1.25rem", marginBottom: "0.75rem", lineHeight: 1.4, fontWeight: 700 }}>
                        <Link href={`/blog/${post.slug}`} style={{ color: "var(--text-primary)", textDecoration: "none" }}>
                          {post.title}
                        </Link>
                      </h3>
                      
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.6, marginBottom: "1.5rem", flex: 1 }}>
                        {post.excerpt}
                      </p>
                      
                      <div style={{ marginTop: "auto" }}>
                        <Link href={`/blog/${post.slug}`} className="btn btn-outline" style={{ width: "100%", justifyContent: "center" }}>
                          Baca Selengkapnya →
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "6rem 2rem", background: "var(--surface)", borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📝</div>
              <h3 style={{ color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Belum ada artikel</h3>
              <p style={{ color: "var(--text-muted)" }}>Nantikan informasi menarik dari kami segera.</p>
            </div>
          )}
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .blog-card {
          border-radius: 16px;
          overflow: hidden;
          border: none;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          background: var(--surface);
        }
        .blog-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.1);
        }
      `}} />

      <Footer />
    </>
  );
}
