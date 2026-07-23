import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "FAQ" };

export default async function FaqPage() {
  let faqs: { id: string; question: string; answer: string }[] = [];
  try {
    faqs = await prisma.faqItem.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });
  } catch (error) {
    console.error("FaqPage DB fetch error:", error);
  }

  return (
    <>
      <Navbar />

      <section style={{ background: "var(--gradient-hero)", padding: "5rem 0 3rem" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <h1 style={{ color: "white", marginBottom: "1rem" }}>Pertanyaan yang Sering Ditanyakan</h1>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1.125rem", maxWidth: 500, margin: "0 auto" }}>
            Temukan jawaban dari pertanyaan umum seputar layanan rental mobil kami.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 800 }}>
          {faqs.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {faqs.map((faq, i) => (
                <details key={faq.id} id={`faq-${faq.id}`} style={{
                  background: "var(--surface)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius-lg)", overflow: "hidden"
                }}>
                  <summary style={{
                    padding: "1.5rem", cursor: "pointer", fontWeight: 700,
                    fontSize: "1.0625rem", display: "flex", justifyContent: "space-between",
                    alignItems: "center", listStyle: "none", userSelect: "none"
                  }}>
                    <span style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                      <span style={{
                        width: 32, height: 32, borderRadius: "50%",
                        background: "var(--primary-light)", color: "var(--primary)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.875rem", fontWeight: 800, flexShrink: 0
                      }}>
                        {i + 1}
                      </span>
                      {faq.question}
                    </span>
                    <span style={{ color: "var(--primary)", fontSize: "1.25rem", flexShrink: 0 }}>+</span>
                  </summary>
                  <div style={{ padding: "0 1.5rem 1.5rem 4.5rem" }}>
                    <p style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>{faq.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>❓</div>
              <p>Belum ada FAQ tersedia.</p>
            </div>
          )}

          {/* CTA */}
          <div style={{
            marginTop: "3rem", padding: "2.5rem", textAlign: "center",
            background: "var(--primary-light)", borderRadius: "var(--radius-xl)",
            border: "1px solid rgba(26,86,219,0.2)"
          }}>
            <h3 style={{ color: "var(--primary-dark)", marginBottom: "0.75rem" }}>Masih Ada Pertanyaan?</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              Tim kami siap membantu menjawab pertanyaan Anda.
            </p>
            <a href="/contact" className="btn btn-primary" id="faq-contact-cta">
              Hubungi Kami
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
