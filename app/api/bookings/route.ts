import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { bookingSchema } from "@/lib/validations";
import { requireAuth, getAuthUser } from "@/lib/auth";
import { successResponse, errorResponse, calculateDays } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return errorResponse("Unauthorized", 401);

    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (user.role !== "ADMIN") where.userId = user.id;
    if (status) where.status = status;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          car: { select: { id: true, name: true, brand: true, imageUrl: true, pricePerDay: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    return successResponse({
      bookings,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Get bookings error:", error);
    return errorResponse("Terjadi kesalahan server", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if ("error" in auth) return errorResponse(auth.error, auth.status);

    const body = await request.json();
    const parsed = bookingSchema.safeParse(body);
    if (!parsed.success) return errorResponse(parsed.error.errors[0].message);

    const { carId, startDate, endDate, pickupLocation, notes } = parsed.data;

    const car = await prisma.car.findUnique({ where: { id: carId } });
    if (!car) return errorResponse("Mobil tidak ditemukan", 404);
    if (!car.isAvailable) return errorResponse("Mobil tidak tersedia", 400);

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) return errorResponse("Tanggal selesai harus setelah tanggal mulai");

    const totalDays = calculateDays(startDate, endDate);
    const totalPrice = totalDays * car.pricePerDay;

    // Check for conflicting bookings
    const conflict = await prisma.booking.findFirst({
      where: {
        carId,
        status: { in: ["CONFIRMED", "ONGOING"] },
        OR: [
          { startDate: { lte: end }, endDate: { gte: start } },
        ],
      },
    });
    if (conflict) return errorResponse("Mobil sudah dibooking pada tanggal tersebut", 409);

    const booking = await prisma.booking.create({
      data: {
        userId: auth.user.id,
        carId,
        startDate: start,
        endDate: end,
        totalDays,
        totalPrice,
        pickupLocation,
        notes,
      },
      include: {
        car: { select: { name: true, brand: true, imageUrl: true } },
      },
    });

    return successResponse({ booking }, 201);
  } catch (error) {
    console.error("Create booking error:", error);
    return errorResponse("Terjadi kesalahan server", 500);
  }
}
