import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/utils";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return errorResponse(auth.error || "Akses ditolak", auth.status);

    const [
      totalCars,
      availableCars,
      totalUsers,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      unreadMessages,
      revenueData,
    ] = await Promise.all([
      prisma.car.count(),
      prisma.car.count({ where: { isAvailable: true } }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: "PENDING_CONFIRMATION" } }),
      prisma.booking.count({ where: { status: "CONFIRMED" } }),
      prisma.booking.count({ where: { status: "COMPLETED" } }),
      prisma.booking.count({ where: { status: "CANCELLED" } }),
      prisma.contactMessage.count({ where: { isRead: false } }),
      prisma.booking.aggregate({
        _sum: { totalPrice: true },
        where: { status: { in: ["COMPLETED", "CONFIRMED"] } },
      }),
    ]);

    // Recent bookings
    const recentBookings = await prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyBookings = await prisma.booking.findMany({
      where: {
        createdAt: { gte: sixMonthsAgo },
        status: { in: ["COMPLETED", "CONFIRMED"] },
      },
      select: { createdAt: true, totalPrice: true },
    });

    const monthlyRevenue: Record<string, number> = {};
    monthlyBookings.forEach((b) => {
      const key = `${b.createdAt.getFullYear()}-${String(b.createdAt.getMonth() + 1).padStart(2, "0")}`;
      monthlyRevenue[key] = (monthlyRevenue[key] || 0) + b.totalPrice;
    });

    return successResponse({
      stats: {
        totalCars,
        availableCars,
        totalUsers,
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        unreadMessages,
        totalRevenue: revenueData._sum.totalPrice || 0,
      },
      recentBookings: recentBookings.map((b) => ({
        id: b.id,
        status: b.status,
        totalPrice: b.totalPrice,
        createdAt: b.createdAt.toISOString(),
        user: { name: b.customerName, email: b.customerWa },
        car: { name: b.carName, brand: b.carBrand },
      })),
      monthlyRevenue,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return errorResponse("Terjadi kesalahan server", 500);
  }
}
