import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/utils";
import { z } from "zod";

const reviewSchema = z.object({
  reviewerName: z.string().min(1, "Nama reviewer wajib diisi"),
  reviewerAvatar: z.string().optional(),
  rating: z.number().int().min(1).max(5).default(5),
  content: z.string().min(5, "Isi review minimal 5 karakter"),
  source: z.string().default("Google"),
  reviewDate: z.string().optional(),
  isVisible: z.boolean().default(true),
  order: z.number().int().default(0),
});

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    return successResponse({ reviews });
  } catch (error) {
    console.error("Get reviews error:", error);
    return errorResponse("Terjadi kesalahan server", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return errorResponse(auth.error, auth.status);

    const body = await request.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) return errorResponse(parsed.error.issues[0].message);

    const review = await prisma.review.create({ data: parsed.data });
    return successResponse({ review }, 201);
  } catch (error) {
    console.error("Create review error:", error);
    return errorResponse("Terjadi kesalahan server", 500);
  }
}
