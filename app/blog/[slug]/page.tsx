import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import sanitizeHtml from "sanitize-html";
import { prisma } from "@/lib/prisma";
import BlogShareButtons from "@/components/BlogShareButtons";

export const dynamic = "force-dynamic";

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

  const cleanContent = sanitizeHtml(post.content, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'u', 's', 'h1', 'h2']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt', 'width', 'height', 'class', 'style'],
      '*': ['class', 'style'],
    },
    allowedStyles: {
      '*': {
        'text-align': [/^left$/, /^right$/, /^center$/, /^justify$/],
      },
    },
  });

  const dateStr = post.publishedAt || post.createdAt;
  const formattedDate = new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const tagsList = post.tags
    ? post.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <>
      <Navbar />

      <style dangerouslySetInnerHTML={{ __html: `
        /* ── Hero ── */
        .blog-hero {
          position: relative;
          width: 100%;
          height: 60vh;
          min-height: 380px;
          max-height: 520px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }
        .blog-hero-fallback {
          background: var(--gradient-hero);
        }
        .blog-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(0,0,0,0.05) 0%,
            rgba(0,0,0,0.15) 35%,
            rgba(0,0,0,0.65) 65%,
            rgba(0,0,0,0.93) 100%
          );
          z-index: 1;
        }
        .blog-back-link {
          position: absolute;
          top: 1.75rem;
          left: 1.5rem;
          z-index: 3;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: rgba(255,255,255,0.7);
          font-size: 0.875rem;
          font-weight: 500;
          text-decoration: none;
          transition: color 0.2s;
          backdrop-filter: blur(4px);
          background: rgba(0,0,0,0.25);
          padding: 0.4rem 0.9rem;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.15);
        }
        .blog-back-link:hover { color: white; background: rgba(0,0,0,0.45); }
        .blog-hero-content {
          position: relative;
          z-index: 2;
          padding: 0 2rem 3.5rem;
          max-width: 900px;
          margin: 0 auto;
          width: 100%;
        }
        .blog-category-pill {
          display: inline-block;
          background: var(--primary);
          color: white;
          padding: 0.3rem 1rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          margin-bottom: 1.25rem;
        }
        .blog-hero-title {
          font-size: clamp(2rem, 5vw, 3.25rem);
          font-weight: 900;
          color: white;
          line-height: 1.15;
          letter-spacing: -0.025em;
          margin: 0;
          text-shadow: 0 2px 24px rgba(0,0,0,0.35);
        }

        /* ── Byline ── */
        .blog-byline {
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 10;
          backdrop-filter: blur(8px);
        }
        .blog-byline-inner {
          max-width: 860px;
          margin: 0 auto;
          padding: 1rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .blog-author {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .blog-author-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 800;
          font-size: 1rem;
          flex-shrink: 0;
          overflow: hidden;
        }
        .blog-author-name {
          font-weight: 700;
          font-size: 0.9375rem;
          color: var(--text-primary);
          line-height: 1.3;
        }
        .blog-author-date {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-top: 0.1rem;
        }
        .blog-share {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .blog-share-label {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-right: 0.25rem;
        }
        .blog-share-btn {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 1px solid var(--border);
          background: var(--surface-2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          color: var(--text-primary);
        }
        .blog-share-btn:hover {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
          transform: scale(1.1);
        }

        /* ── Article Body ── */
        .blog-article-body {
          padding: 3.5rem 2rem 6rem;
          max-width: 860px;
          margin: 0 auto;
        }
        .blog-prose {
          color: var(--text-primary);
          line-height: 1.85;
          font-size: 1.125rem;
        }
        .blog-prose p { margin-bottom: 1.75rem; color: var(--text-secondary); }
        .blog-prose h1 { font-size: 2.25rem; font-weight: 800; margin: 3rem 0 1.25rem; line-height: 1.2; color: var(--text-primary); letter-spacing: -0.02em; }
        .blog-prose h2 { font-size: 1.75rem; font-weight: 700; margin: 2.5rem 0 1rem; line-height: 1.3; color: var(--text-primary); letter-spacing: -0.01em; }
        .blog-prose h3 { font-size: 1.375rem; font-weight: 600; margin: 2rem 0 0.75rem; color: var(--text-primary); }
        .blog-prose a { color: var(--primary); text-decoration: underline; text-underline-offset: 4px; }
        .blog-prose a:hover { color: var(--primary-dark); }
        .blog-prose ul { list-style-type: disc; padding-left: 2rem; margin-bottom: 1.75rem; color: var(--text-secondary); }
        .blog-prose ol { list-style-type: decimal; padding-left: 2rem; margin-bottom: 1.75rem; color: var(--text-secondary); }
        .blog-prose li { margin-bottom: 0.5rem; }
        .blog-prose blockquote {
          border-left: 4px solid var(--primary);
          padding: 1.25rem 1.5rem 1.25rem 2rem;
          color: var(--text-primary);
          font-style: italic;
          margin: 2.5rem 0;
          background: var(--surface-2);
          border-radius: 0 12px 12px 0;
          font-size: 1.25rem;
        }
        .blog-prose blockquote p:last-child { margin-bottom: 0; }
        .blog-prose hr { border: none; border-top: 1px solid var(--border); margin: 3rem 0; }
        .blog-prose img {
          max-width: 100%;
          height: auto;
          border-radius: 16px;
          margin: 2.5rem auto;
          display: block;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
        }

        /* ── Tags ── */
        .blog-tags-section {
          margin-top: 4rem;
          padding-top: 2rem;
          border-top: 1px solid var(--border);
        }
        .blog-tag {
          background: var(--surface-2);
          color: var(--text-secondary);
          padding: 0.35rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          border: 1px solid var(--border);
          transition: all 0.2s;
          cursor: default;
        }
        .blog-tag:hover { background: var(--primary-light); color: var(--primary); border-color: var(--primary); }

        /* ── Responsive ── */
        @media (max-width: 640px) {
          .blog-hero { height: 50vh; min-height: 320px; }
          .blog-hero-content { padding: 0 1rem 2rem; }
          .blog-back-link { left: 1rem; top: 1.25rem; }
          .blog-article-body { padding: 2rem 1rem 4rem; }
          .blog-byline-inner { padding: 0.875rem 1rem; }
          .blog-share-label { display: none; }
        }
      `}} />

      <article>

        {/* ── 1. HERO: Cover Image penuh + Judul di bawahnya ── */}
        <div className={`blog-hero${!post.imageUrl ? " blog-hero-fallback" : ""}`}>
          {post.imageUrl && (
            <Image
              src={post.imageUrl}
              alt={post.title}
              fill
              style={{ objectFit: "cover", objectPosition: post.imageFocalPoint ?? "50% 50%" }}
              priority
              sizes="100vw"
            />
          )}
          <div className="blog-hero-overlay" />

          <Link href="/blog" className="blog-back-link">
            ← Kembali ke Blog
          </Link>

          <div className="blog-hero-content">
            {post.category && (
              <span className="blog-category-pill">{post.category}</span>
            )}
            <h1 className="blog-hero-title">{post.title}</h1>
          </div>
        </div>

        {/* ── 2. BYLINE: Author + Tanggal + Share (sticky) ── */}
        <div className="blog-byline">
          <div className="blog-byline-inner">
            <div className="blog-author">
              <div className="blog-author-avatar">
                {post.author.avatar ? (
                  <Image
                    src={post.author.avatar}
                    alt={post.author.name}
                    width={40}
                    height={40}
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  post.author.name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <div className="blog-author-name">{post.author.name}</div>
                <div className="blog-author-date">{formattedDate}</div>
              </div>
            </div>

            <BlogShareButtons title={post.title} />
          </div>
        </div>

        {/* ── 3. KONTEN ARTIKEL ── */}
        <div className="blog-article-body">
          <div
            className="blog-prose"
            dangerouslySetInnerHTML={{ __html: cleanContent }}
          />

          {tagsList.length > 0 && (
            <div className="blog-tags-section">
              <h4 style={{ fontSize: "0.8125rem", marginBottom: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 700 }}>
                Tags
              </h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {tagsList.map((tag, i) => (
                  <span key={i} className="blog-tag">#{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>

      </article>

      <Footer />
    </>
  );
}
