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

    if (!file || typeof file === "string") {
      return errorResponse("File tidak ditemukan");
    }

    const fileName = file.name || "image.jpg";
    const fileType = (file.type || "").toLowerCase();
    const ext = fileName.includes(".") ? fileName.split(".").pop()?.toLowerCase() || "jpg" : "jpg";

    const allowedExtensions = ["jpg", "jpeg", "png", "webp", "gif", "jfif", "heic", "svg"];
    const allowedMimeTypes = [
      "image/jpeg", "image/jpg", "image/png", "image/webp",
      "image/gif", "image/pjpeg", "image/jfif", "image/heic", "image/svg+xml"
    ];

    const isMimeValid = fileType ? allowedMimeTypes.includes(fileType) : false;
    const isExtValid = allowedExtensions.includes(ext);

    if (!isMimeValid && !isExtValid) {
      return errorResponse("Format file tidak didukung. Gunakan foto berformat JPG, PNG, WEBP, GIF, atau JFIF.");
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return errorResponse("Ukuran file maksimal 10MB.");
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const cleanExt = ext.replace(/[^a-zA-Z0-9]/g, "") || "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}.${cleanExt}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);

    const url = `/uploads/${filename}`;
    return successResponse({ url }, 201);
  } catch (error: any) {
    console.error("Upload error:", error);
    return errorResponse(error?.message || "Terjadi kesalahan saat upload", 500);
  }
}
