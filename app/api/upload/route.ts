import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/utils";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return errorResponse(auth.error, auth.status);

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) return errorResponse("File tidak ditemukan");

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return errorResponse("Format file tidak didukung. Gunakan JPG, PNG, atau WebP");
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return errorResponse("Ukuran file maksimal 5MB");
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split(".").pop();
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);

    const url = `/uploads/${filename}`;
    return successResponse({ url }, 201);
  } catch (error) {
    console.error("Upload error:", error);
    return errorResponse("Terjadi kesalahan saat upload", 500);
  }
}
