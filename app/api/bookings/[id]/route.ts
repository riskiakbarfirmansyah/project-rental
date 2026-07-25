import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/utils";

// GET /api/bookings/[id] - Get detail booking (admin only)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return errorResponse(auth.error || "Akses ditolak", auth.status);

    const { id } = await params;
    const booking = await prisma.booking.findUnique({
      where: { id }
    });

    if (!booking) return errorResponse("Booking tidak ditemukan", 404);

    return successResponse({ booking });
  } catch (error) {
    console.error("Get booking error:", error);
    return errorResponse("Terjadi kesalahan server", 500);
  }
}

// PUT /api/bookings/[id] - Edit booking (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return errorResponse(auth.error || "Akses ditolak", auth.status);

    const { id } = await params;
    const body = await request.json();

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) return errorResponse("Booking tidak ditemukan", 404);

    let pricePerDay = booking.pricePerDay;
    let carName = booking.carName;
    let carBrand = booking.carBrand;
    let carType = booking.carType;

    if (body.carId && body.carId !== booking.carId) {
      const car = await prisma.car.findUnique({ where: { id: body.carId } });
      if (!car) return errorResponse("Mobil tidak ditemukan", 404);
      pricePerDay = car.pricePerDay;
      carName = car.name;
      carBrand = car.brand;
      carType = car.type;
    }

    const duration = body.duration !== undefined ? parseInt(body.duration) : booking.duration;
    const totalPrice = pricePerDay * duration;

    let pickupDate = booking.pickupDate;
    if (body.pickupDate) {
      pickupDate = new Date(body.pickupDate);
    }

    const endDate = new Date(pickupDate);
    endDate.setDate(endDate.getDate() + duration);

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        customerName: body.customerName !== undefined ? body.customerName : booking.customerName,
        customerWa: body.customerWa !== undefined ? body.customerWa : booking.customerWa,
        carId: body.carId !== undefined ? body.carId : booking.carId,
        carName,
        carBrand,
        carType,
        pickupDate,
        duration,
        endDate,
        pickupLocation: body.pickupLocation !== undefined ? body.pickupLocation : booking.pickupLocation,
        driverOption: body.driverOption !== undefined ? body.driverOption : booking.driverOption,
        selectedAdminName: body.selectedAdminName !== undefined ? body.selectedAdminName : booking.selectedAdminName,
        selectedAdminWa: body.selectedAdminWa !== undefined ? body.selectedAdminWa : booking.selectedAdminWa,
        pricePerDay,
        totalPrice,
        status: body.status !== undefined ? body.status : booking.status,
        customerNote: body.customerNote !== undefined ? body.customerNote : booking.customerNote,
        adminNote: body.adminNote !== undefined ? body.adminNote : booking.adminNote,
      }
    });

    return successResponse({ booking: updated });
  } catch (error) {
    console.error("Update booking error:", error);
    return errorResponse("Terjadi kesalahan server", 500);
  }
}

// DELETE /api/bookings/[id] - Delete booking (admin only)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return errorResponse(auth.error || "Akses ditolak", auth.status);

    const { id } = await params;
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) return errorResponse("Booking tidak ditemukan", 404);

    await prisma.booking.delete({ where: { id } });
    return successResponse({ message: "Booking berhasil dihapus" });
  } catch (error) {
    console.error("Delete booking error:", error);
    return errorResponse("Terjadi kesalahan server", 500);
  }
}
