import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/blog/${slug}`, { cache: "no-store" });
    if (res.ok) { const d = await res.json(); return { title: d.data?.post?.title || "Artikel" }; }
  } catch {}
  return { title: "Artikel" };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let post: { title: string; content: string; excerpt: string; createdAt: string; author: { name: string } } | null = null;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/blog/${slug}`, { cache: "no-store" });
    if (res.ok) { const d = await res.json(); post = d.data?.post; }
  } catch {}

  if (!post) notFound();

  return (
    <>
      <Navbar />

      <article>
        <div style={{ background: "var(--gradient-hero)", padding: "5rem 0 3rem" }}>
          <div className="container" style={{ maxWidth: 780 }}>
            <a href="/blog" style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
              ← Kembali ke Blog
            </a>
            <h1 style={{ color: "white", marginBottom: "1.25rem" }}>{post.title}</h1>
            <div style={{ display: "flex", gap: "1.5rem", color: "rgba(255,255,255,0.65)", fontSize: "0.9rem" }}>
              <span>📅 {new Date(post.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
              <span>✍️ {post.author.name}</span>
            </div>
          </div>
        </div>

        <div style={{ padding: "3rem 0" }}>
          <div className="container" style={{ maxWidth: 780 }}>
            <div style={{
              padding: "2.5rem", background: "var(--surface)", borderRadius: "var(--radius-xl)",
              border: "1px solid var(--border)", lineHeight: 1.8,
              color: "var(--text-secondary)", fontSize: "1.0625rem"
            }}>
              {post.content.split("\n").map((line, i) => (
                <p key={i} style={{ marginBottom: "1rem" }}>{line}</p>
              ))}
            </div>
          </div>
        </div>
      </article>

      <Footer />
    </>
  );
}
