import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const carSchema = z.object({
  name: z.string().min(2, "Nama mobil minimal 2 karakter"),
  brand: z.string().min(1, "Brand wajib diisi"),
  year: z.number().int().min(1990).max(new Date().getFullYear() + 1),
  type: z.enum(["SEDAN", "SUV", "MPV", "PICKUP", "MINIBUS", "SPORT"]),
  pricePerDay: z.number().int().min(1, "Harga harus lebih dari 0"),
  seats: z.number().int().min(1).max(20),
  transmission: z.enum(["MANUAL", "AUTOMATIC"]),
  fuel: z.enum(["BENSIN", "DIESEL", "ELECTRIC", "HYBRID"]),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  features: z.array(z.string()).default([]),
  imageUrl: z.string().optional(),
  images: z.array(z.string()).default([]),
  isAvailable: z.boolean().default(true),
});

export const bookingSchema = z.object({
  carId: z.string().min(1, "Pilih mobil terlebih dahulu"),
  startDate: z.string().min(1, "Tanggal mulai wajib diisi"),
  endDate: z.string().min(1, "Tanggal selesai wajib diisi"),
  pickupLocation: z.string().min(3, "Lokasi penjemputan wajib diisi"),
  notes: z.string().optional(),
});

export const blogSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  slug: z.string().min(3).optional(),
  content: z.string().min(10, "Konten minimal 10 karakter"),
  excerpt: z.string().min(10, "Ringkasan minimal 10 karakter"),
  imageUrl: z.string().optional(),
  isPublished: z.boolean().default(false),
});

export const gallerySchema = z.object({
  title: z.string().min(2, "Judul minimal 2 karakter"),
  description: z.string().optional(),
  imageUrl: z.string().min(1, "Gambar wajib diisi"),
  carId: z.string().optional(),
});

export const faqSchema = z.object({
  question: z.string().min(5, "Pertanyaan minimal 5 karakter"),
  answer: z.string().min(10, "Jawaban minimal 10 karakter"),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const contactSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().optional(),
  subject: z.string().min(3, "Subject minimal 3 karakter"),
  message: z.string().min(10, "Pesan minimal 10 karakter"),
});

export const configSchema = z.object({
  configs: z.array(
    z.object({
      key: z.string().min(1),
      value: z.string(),
    })
  ),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CarInput = z.infer<typeof carSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type BlogInput = z.infer<typeof blogSchema>;
export type GalleryInput = z.infer<typeof gallerySchema>;
export type FaqInput = z.infer<typeof faqSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
