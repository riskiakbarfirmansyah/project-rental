import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { carSchema } from "@/lib/validations";
import { requireAdmin } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const car = await prisma.car.findUnique({ where: { id } });
    if (!car) return errorResponse("Mobil tidak ditemukan", 404);
    return successResponse({ car });
  } catch (error) {
    console.error("Get car error:", error);
    return errorResponse("Terjadi kesalahan server", 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return errorResponse(auth.error, auth.status);

    const { id } = await params;
    const body = await request.json();
    const parsed = carSchema.partial().safeParse(body);
    if (!parsed.success) return errorResponse(parsed.error.errors[0].message);

    const { features, images, ...rest } = parsed.data;
    const updateData: Record<string, unknown> = { ...rest };
    if (features !== undefined) updateData.features = JSON.stringify(features);
    if (images !== undefined) updateData.images = JSON.stringify(images);

    const car = await prisma.car.update({ where: { id }, data: updateData });
    return successResponse({ car });
  } catch (error) {
    console.error("Update car error:", error);
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
    await prisma.car.delete({ where: { id } });
    return successResponse({ message: "Mobil berhasil dihapus" });
  } catch (error) {
    console.error("Delete car error:", error);
    return errorResponse("Terjadi kesalahan server", 500);
  }
}
