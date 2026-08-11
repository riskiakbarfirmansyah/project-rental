import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/utils";
import { createServerClient } from "@/lib/supabase-server";

const BUCKET_NAME = "uploads";

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
      "image/gif", "image/pjpeg", "image/jfif", "image/heic", "image/svg+xml",
    ];

    const isMimeValid = fileType ? allowedMimeTypes.includes(fileType) : false;
    const isExtValid = allowedExtensions.includes(ext);

    if (!isMimeValid && !isExtValid) {
      return errorResponse("Format file tidak didukung. Gunakan foto berformat JPG, PNG, WEBP, GIF, atau JFIF.");
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return errorResponse("Ukuran file maksimal 5MB.");
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const cleanExt = ext.replace(/[^a-zA-Z0-9]/g, "") || "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}.${cleanExt}`;
    const mimeType = fileType || `image/${cleanExt === "jpg" ? "jpeg" : cleanExt}`;

    // Upload ke Supabase Storage
    const supabase = createServerClient();
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, buffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      console.error("Supabase Storage upload error:", error);
      return errorResponse(`Gagal upload file: ${error.message}`, 500);
    }

    // Dapatkan public URL
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return successResponse({ url: publicUrlData.publicUrl }, 201);
  } catch (error: any) {
    console.error("Upload error:", error);
    return errorResponse(error?.message || "Terjadi kesalahan saat upload", 500);
  }
}
