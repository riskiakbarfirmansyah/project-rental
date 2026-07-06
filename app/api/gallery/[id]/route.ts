import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/utils";

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
