import type { Metadata } from "next";
import "./globals.css";
import PageViewTracker from "@/components/PageViewTracker";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: {
    template: "%s | Bella Belly Trans Co",
    default: "Bella Belly Trans Co",
  },
  description:
    "Layanan sewa mobil terpercaya dengan armada lengkap dan harga terjangkau. Siap melayani perjalanan bisnis dan wisata Anda.",
  keywords: ["sewa mobil", "rental mobil", "rental kendaraan", "sewa mobil semarang", "rental mobil semarang", "sewa mobil murah", "rental mobil murah"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        <PageViewTracker />
        {children}
        <Analytics />
      </body>
    </html>
  );
}

