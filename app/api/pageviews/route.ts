import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/utils";
import { headers } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { page } = body;

    if (!page || typeof page !== "string") {
      return errorResponse("Path halaman diperlukan", 400);
    }

    const headersList = await headers();
    const forwarded = headersList.get("x-forwarded-for");
    const ipAddress = forwarded?.split(",")[0]?.trim() || headersList.get("x-real-ip") || "unknown";
    const userAgent = headersList.get("user-agent") || undefined;
    const referrer = headersList.get("referer") || undefined;

    await prisma.pageView.create({
      data: {
        page,
        ipAddress,
        userAgent,
        referrer,
      },
    });

    return successResponse({ recorded: true });
  } catch (error) {
    console.error("PageView tracking error:", error);
    return successResponse({ recorded: false });
  }
}

export async function GET() {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(todayStart);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(todayStart);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const [totalViews, todayViews, weekViews, monthViews, uniqueVisitorsToday] = await Promise.all([
      prisma.pageView.count(),
      prisma.pageView.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.pageView.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.pageView.count({ where: { createdAt: { gte: monthAgo } } }),
      prisma.pageView.groupBy({
        by: ["ipAddress"],
        where: { createdAt: { gte: todayStart } },
      }),
    ]);

    // Top pages (last 30 days)
    const topPages = await prisma.pageView.groupBy({
      by: ["page"],
      where: { createdAt: { gte: monthAgo } },
      _count: { page: true },
      orderBy: { _count: { page: "desc" } },
      take: 10,
    });

    // Daily views for the past 7 days
    const dailyViews: { date: string; views: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(todayStart);
      dayStart.setDate(dayStart.getDate() - i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const count = await prisma.pageView.count({
        where: {
          createdAt: { gte: dayStart, lt: dayEnd },
        },
      });

      dailyViews.push({
        date: dayStart.toISOString().split("T")[0],
        views: count,
      });
    }

    return successResponse({
      totalViews,
      todayViews,
      weekViews,
      monthViews,
      uniqueVisitorsToday: uniqueVisitorsToday.length,
      topPages: topPages.map((p) => ({ page: p.page, count: p._count.page })),
      dailyViews,
    });
  } catch (error) {
    console.error("PageView stats error:", error);
    return errorResponse("Gagal mengambil data traffic", 500);
  }
}
