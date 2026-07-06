import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { gallerySchema } from "@/lib/validations";
import { requireAdmin } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/utils";

export async function GET() {
  try {
    const items = await prisma.galleryItem.findMany({
      include: { car: { select: { id: true, name: true, brand: true } } },
      orderBy: { createdAt: "desc" },
    });
    return successResponse({ items });
  } catch (error) {
    console.error("Get gallery error:", error);
    return errorResponse("Terjadi kesalahan server", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return errorResponse(auth.error, auth.status);

    const body = await request.json();
    const parsed = gallerySchema.safeParse(body);
    if (!parsed.success) return errorResponse(parsed.error.errors[0].message);

    const item = await prisma.galleryItem.create({ data: parsed.data });
    return successResponse({ item }, 201);
  } catch (error) {
    console.error("Create gallery error:", error);
    return errorResponse("Terjadi kesalahan server", 500);
  }
}
