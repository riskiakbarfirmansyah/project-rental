import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/utils";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return errorResponse(auth.error, auth.status);

    const { id } = await params;
    const message = await prisma.contactMessage.update({
      where: { id },
      data: { isRead: true },
    });

    return successResponse({ message });
  } catch (error) {
    console.error("Mark read error:", error);
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
    await prisma.contactMessage.delete({ where: { id } });
    return successResponse({ message: "Pesan berhasil dihapus" });
  } catch (error) {
    console.error("Delete contact error:", error);
    return errorResponse("Terjadi kesalahan server", 500);
  }
}
