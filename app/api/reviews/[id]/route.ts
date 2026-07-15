import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/utils";
import { z } from "zod";

const updateSchema = z.object({
  reviewerName: z.string().min(1).optional(),
  reviewerAvatar: z.string().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  content: z.string().min(5).optional(),
  source: z.string().optional(),
  reviewDate: z.string().optional(),
  isVisible: z.boolean().optional(),
  order: z.number().int().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return errorResponse(auth.error, auth.status);

    const { id } = await params;
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return errorResponse(parsed.error.issues[0].message);

    const review = await prisma.review.update({ where: { id }, data: parsed.data });
    return successResponse({ review });
  } catch (error) {
    console.error("Update review error:", error);
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
    await prisma.review.delete({ where: { id } });
    return successResponse({ message: "Review berhasil dihapus" });
  } catch (error) {
    console.error("Delete review error:", error);
    return errorResponse("Terjadi kesalahan server", 500);
  }
}
