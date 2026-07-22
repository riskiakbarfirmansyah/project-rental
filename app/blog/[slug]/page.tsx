import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import sanitizeHtml from "sanitize-html";
import { prisma } from "@/lib/prisma";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    select: { title: true, excerpt: true, metaTitle: true, metaDescription: true },
  });
  if (post) {
    return {
      title: post.metaTitle || post.title || "Artikel",
      description: post.metaDescription || post.excerpt,
    };
  }
  return { title: "Artikel" };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: { author: { select: { id: true, name: true, avatar: true } } },
  });

  if (!post) notFound();

  // Sanitize content from Tiptap rich text editor
  const cleanContent = sanitizeHtml(post.content, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'u', 's', 'h1', 'h2']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt', 'width', 'height', 'class', 'style'],
      '*': ['class', 'style']
    },
    allowedStyles: {
      '*': {
        'text-align': [/^left$/, /^right$/, /^center$/, /^justify$/]
      }
    }
  });

  const dateStr = post.publishedAt || post.createdAt;
  const formattedDate = new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  
  // Format tags
  const tagsList = post.tags ? post.tags.split(",").map(t => t.trim()).filter(Boolean) : [];

  return (
    <>
      <Navbar />

      <article>
        {/* Hero Header */}
        <div style={{ background: "var(--gradient-hero)", padding: "5rem 0 3rem" }}>
          <div className="container" style={{ maxWidth: 840 }}>
            <Link href="/blog" className="back-link" style={{ fontSize: "0.9375rem", display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem", textDecoration: "none", transition: "color 0.2s" }}>
              ← Kembali ke Blog
            </Link>
            
            {post.category && (
              <div style={{ marginBottom: "1rem" }}>
                <span style={{ background: "rgba(255,255,255,0.2)", color: "white", padding: "0.35rem 1rem", borderRadius: "20px", fontSize: "0.8125rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  {post.category}
                </span>
              </div>
            )}
            
            <h1 style={{ color: "white", marginBottom: "1.5rem", fontSize: "2.75rem", fontWeight: 800, lineHeight: 1.2 }}>{post.title}</h1>
            
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", color: "rgba(255,255,255,0.7)", fontSize: "0.9375rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                {post.author.avatar ? (
                  <Image src={post.author.avatar} alt={post.author.name} width={32} height={32} style={{ borderRadius: "50%" }} />
                ) : (
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700 }}>
                    {post.author.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span style={{ color: "white", fontWeight: 600 }}>{post.author.name}</span>
              </div>
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>📅 {formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Article Body */}
        <div style={{ padding: "3rem 0 5rem" }}>
          <div className="container" style={{ maxWidth: 840 }}>
            
            {/* Cover Image */}
            {post.imageUrl && (
              <div style={{ position: "relative", width: "100%", height: "450px", borderRadius: "24px", overflow: "hidden", marginBottom: "3rem", boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}>
                <Image src={post.imageUrl} alt={post.title} fill style={{ objectFit: "cover" }} priority sizes="(max-width: 840px) 100vw, 840px" />
              </div>
            )}

            {/* Prose Content */}
            <div 
              className="blog-prose"
              dangerouslySetInnerHTML={{ __html: cleanContent }} 
            />

            {/* Tags */}
            {tagsList.length > 0 && (
              <div style={{ marginTop: "4rem", paddingTop: "2rem", borderTop: "1px solid var(--border)" }}>
                <h4 style={{ fontSize: "1rem", marginBottom: "1rem", color: "var(--text-primary)" }}>Tags:</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {tagsList.map((tag, i) => (
                    <span key={i} style={{ background: "var(--surface-2)", color: "var(--text-secondary)", padding: "0.35rem 1rem", borderRadius: "8px", fontSize: "0.875rem" }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </article>

      {/* Styled Scoped for Prose */}
      <style dangerouslySetInnerHTML={{ __html: `
        .back-link { color: rgba(255,255,255,0.7); }
        .back-link:hover { color: white; }
        .blog-prose {
          color: var(--text-primary);
          line-height: 1.8;
          font-size: 1.125rem;
        }
        .blog-prose p { margin-bottom: 1.5rem; color: var(--text-secondary); }
        .blog-prose h1 { font-size: 2.25rem; font-weight: 800; margin: 2.5rem 0 1rem; line-height: 1.3; color: var(--text-primary); }
        .blog-prose h2 { font-size: 1.875rem; font-weight: 700; margin: 2.5rem 0 1rem; line-height: 1.3; color: var(--text-primary); }
        .blog-prose h3 { font-size: 1.5rem; font-weight: 600; margin: 2rem 0 1rem; line-height: 1.4; color: var(--text-primary); }
        .blog-prose a { color: var(--primary); text-decoration: underline; text-underline-offset: 4px; }
        .blog-prose a:hover { color: var(--primary-dark); }
        .blog-prose ul { list-style-type: disc; padding-left: 2rem; margin-bottom: 1.5rem; color: var(--text-secondary); }
        .blog-prose ol { list-style-type: decimal; padding-left: 2rem; margin-bottom: 1.5rem; color: var(--text-secondary); }
        .blog-prose li { margin-bottom: 0.5rem; }
        .blog-prose blockquote {
          border-left: 5px solid var(--primary);
          padding: 1.5rem 1.5rem 1.5rem 2rem;
          color: var(--text-primary);
          font-style: italic;
          margin: 2.5rem 0;
          background: var(--surface-2);
          border-radius: 0 12px 12px 0;
          font-size: 1.25rem;
        }
        .blog-prose blockquote p:last-child { margin-bottom: 0; }
        .blog-prose hr {
          border: none;
          border-top: 1px solid var(--border);
          margin: 3rem 0;
        }
        .blog-prose img {
          max-width: 100%;
          height: auto;
          border-radius: 16px;
          margin: 2.5rem auto;
          display: block;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
        }
      `}} />

      <Footer />
    </>
  );
}
