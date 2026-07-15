import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { bookingSchema } from "@/lib/validations";
import { requireAdmin } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/utils";

// GET /api/bookings - Get all bookings for admin
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return errorResponse(auth.error || "Akses ditolak", auth.status);

    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: any = {};
    
    if (status && status !== "ALL") {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { id: { contains: search } },
        { customerName: { contains: search } },
        { customerWa: { contains: search } },
        { carName: { contains: search } },
        { carBrand: { contains: search } }
      ];
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    return successResponse({
      bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get bookings error:", error);
    return errorResponse("Terjadi kesalahan server", 500);
  }
}

// POST /api/bookings - Create new booking from customer form
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = bookingSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message);
    }

    const {
      carId,
      customerName,
      customerWa,
      pickupDate,
      duration,
      pickupLocation,
      driverOption,
      selectedAdminName,
      selectedAdminWa,
      customerNote,
    } = parsed.data;

    // Fetch car details
    const car = await prisma.car.findUnique({ where: { id: carId } });
    if (!car) {
      return errorResponse("Mobil tidak ditemukan", 404);
    }

    const pricePerDay = car.pricePerDay;
    const totalPrice = pricePerDay * duration;

    // Calculate end date
    const start = new Date(pickupDate);
    const end = new Date(start);
    end.setDate(end.getDate() + duration);

    const booking = await prisma.booking.create({
      data: {
        carId,
        carName: car.name,
        carBrand: car.brand,
        carYear: car.year,
        carType: car.type,
        customerName,
        customerWa,
        pickupDate: start,
        duration,
        endDate: end,
        pickupLocation,
        driverOption,
        selectedAdminName,
        selectedAdminWa,
        pricePerDay,
        totalPrice,
        customerNote: customerNote || null,
        status: "PENDING_CONFIRMATION",
      },
    });

    return successResponse({ booking }, 201);
  } catch (error) {
    console.error("Create booking error:", error);
    return errorResponse("Terjadi kesalahan server", 500);
  }
}
