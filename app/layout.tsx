import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | RentalKu",
    default: "RentalKu — Sewa Mobil Terpercaya",
  },
  description:
    "Layanan sewa mobil terpercaya dengan armada lengkap dan harga terjangkau. Siap melayani perjalanan bisnis dan wisata Anda.",
  keywords: ["sewa mobil", "rental mobil", "rental kendaraan", "rentalku"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
