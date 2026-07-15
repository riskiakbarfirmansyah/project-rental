import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { faqSchema } from "@/lib/validations";
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
    const parsed = faqSchema.partial().safeParse(body);
    if (!parsed.success) return errorResponse(parsed.error.issues[0].message);

    const faq = await prisma.faqItem.update({ where: { id }, data: parsed.data });
    return successResponse({ faq });
  } catch (error) {
    console.error("Update FAQ error:", error);
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
    await prisma.faqItem.delete({ where: { id } });
    return successResponse({ message: "FAQ berhasil dihapus" });
  } catch (error) {
    console.error("Delete FAQ error:", error);
    return errorResponse("Terjadi kesalahan server", 500);
  }
}
