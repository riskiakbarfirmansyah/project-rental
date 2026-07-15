import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { gallerySchema } from "@/lib/validations";
import { requireAdmin } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/utils";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return errorResponse(auth.error, auth.status);

    const { id } = await params;
    const body = await request.json();
    const parsed = gallerySchema.partial().safeParse(body);
    if (!parsed.success) return errorResponse(parsed.error.issues[0].message);

    const item = await prisma.galleryItem.update({ where: { id }, data: parsed.data });
    return successResponse({ item });
  } catch (error) {
    console.error("Update gallery error:", error);
    return errorResponse("Terjadi kesalahan server", 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return errorResponse(auth.error, auth.status);

    const { id } = await params;
    await prisma.galleryItem.delete({ where: { id } });
    return successResponse({ message: "Item galeri berhasil dihapus" });
  } catch (error) {
    console.error("Delete gallery error:", error);
    return errorResponse("Terjadi kesalahan server", 500);
  }
}
