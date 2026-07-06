import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, requireAdmin } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) return errorResponse("Unauthorized", 401);

    const { id } = await params;
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        car: true,
      },
    });

    if (!booking) return errorResponse("Booking tidak ditemukan", 404);
    if (user.role !== "ADMIN" && booking.userId !== user.id) {
      return errorResponse("Forbidden", 403);
    }

    return successResponse({ booking });
  } catch (error) {
    console.error("Get booking error:", error);
    return errorResponse("Terjadi kesalahan server", 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return errorResponse(auth.error, auth.status);

    const { id } = await params;
    const { status } = await request.json();

    const validStatuses = ["PENDING", "CONFIRMED", "ONGOING", "COMPLETED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return errorResponse("Status tidak valid");
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
    });

    return successResponse({ booking });
  } catch (error) {
    console.error("Update booking error:", error);
    return errorResponse("Terjadi kesalahan server", 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) return errorResponse("Unauthorized", 401);

    const { id } = await params;
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) return errorResponse("Booking tidak ditemukan", 404);

    if (user.role !== "ADMIN" && booking.userId !== user.id) {
      return errorResponse("Forbidden", 403);
    }

    if (booking.status === "ONGOING" || booking.status === "COMPLETED") {
      return errorResponse("Booking yang sedang berjalan tidak bisa dibatalkan");
    }

    await prisma.booking.update({ where: { id }, data: { status: "CANCELLED" } });
    return successResponse({ message: "Booking berhasil dibatalkan" });
  } catch (error) {
    console.error("Cancel booking error:", error);
    return errorResponse("Terjadi kesalahan server", 500);
  }
}
