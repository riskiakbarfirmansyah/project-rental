import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/utils";

function getStartOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return errorResponse(auth.error, auth.status);

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "7d"; // "1d" | "7d" | "30d"

    const now = new Date();
    const todayStart = getStartOfDay(now);

    // --- Determine day range ---
    let days = 7;
    if (range === "1d") days = 1;
    else if (range === "30d") days = 30;

    // --- Build daily breakdown ---
    const dailyData: { date: string; label: string; views: number; uniqueIps: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const dayStart = new Date(todayStart);
      dayStart.setDate(dayStart.getDate() - i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const [views, uniqueResult] = await Promise.all([
        prisma.pageView.count({
          where: { createdAt: { gte: dayStart, lt: dayEnd } },
        }),
        prisma.pageView.groupBy({
          by: ["ipAddress"],
          where: { createdAt: { gte: dayStart, lt: dayEnd } },
        }),
      ]);

      const d = dayStart;
      const label =
        days === 1
          ? `${String(d.getHours()).padStart(2, "0")}:00` // hourly label if 1 day
          : `${d.getDate()}/${d.getMonth() + 1}`;

      dailyData.push({
        date: dayStart.toISOString().split("T")[0],
        label,
        views,
        uniqueIps: uniqueResult.length,
      });
    }

    // --- Hourly breakdown for "yesterday" (1d mode) ---
    let hourlyData: { hour: string; views: number }[] = [];
    if (range === "1d") {
      const yesterday = new Date(todayStart);
      yesterday.setDate(yesterday.getDate() - 1);

      for (let h = 0; h < 24; h++) {
        const hourStart = new Date(yesterday);
        hourStart.setHours(h, 0, 0, 0);
        const hourEnd = new Date(hourStart);
        hourEnd.setHours(h + 1, 0, 0, 0);

        const count = await prisma.pageView.count({
          where: { createdAt: { gte: hourStart, lt: hourEnd } },
        });

        hourlyData.push({
          hour: `${String(h).padStart(2, "0")}:00`,
          views: count,
        });
      }
    }

    // --- Summary stats ---
    const rangeStart = new Date(todayStart);
    rangeStart.setDate(rangeStart.getDate() - days);

    const [totalInRange, uniqueInRange] = await Promise.all([
      prisma.pageView.count({ where: { createdAt: { gte: rangeStart } } }),
      prisma.pageView.groupBy({
        by: ["ipAddress"],
        where: { createdAt: { gte: rangeStart } },
      }),
    ]);

    // --- Yesterday summary ---
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const [yesterdayViews, yesterdayUnique] = await Promise.all([
      prisma.pageView.count({ where: { createdAt: { gte: yesterdayStart, lt: todayStart } } }),
      prisma.pageView.groupBy({
        by: ["ipAddress"],
        where: { createdAt: { gte: yesterdayStart, lt: todayStart } },
      }),
    ]);

    // --- Today summary ---
    const [todayViews, todayUnique] = await Promise.all([
      prisma.pageView.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.pageView.groupBy({
        by: ["ipAddress"],
        where: { createdAt: { gte: todayStart } },
      }),
    ]);

    // --- Top pages (in range) ---
    const topPages = await prisma.pageView.groupBy({
      by: ["page"],
      where: { createdAt: { gte: rangeStart } },
      _count: { page: true },
      orderBy: { _count: { page: "desc" } },
      take: 10,
    });

    // --- Referrers (in range) ---
    const topReferrers = await prisma.pageView.groupBy({
      by: ["referrer"],
      where: { createdAt: { gte: rangeStart }, referrer: { not: null } },
      _count: { referrer: true },
      orderBy: { _count: { referrer: "desc" } },
      take: 5,
    });

    // --- Peak hour (today) ---
    const hourCounts: Record<number, number> = {};
    const todayRecords = await prisma.pageView.findMany({
      where: { createdAt: { gte: todayStart } },
      select: { createdAt: true },
    });
    todayRecords.forEach((r) => {
      const h = r.createdAt.getHours();
      hourCounts[h] = (hourCounts[h] || 0) + 1;
    });
    const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];

    return successResponse({
      range,
      days,
      dailyData,
      hourlyData,
      summary: {
        today: { views: todayViews, uniqueIps: todayUnique.length },
        yesterday: { views: yesterdayViews, uniqueIps: yesterdayUnique.length },
        inRange: { views: totalInRange, uniqueIps: uniqueInRange.length },
        peakHour: peakHour ? `${String(peakHour[0]).padStart(2, "0")}:00 (${peakHour[1]} views)` : "-",
      },
      topPages: topPages.map((p) => ({ page: p.page, count: p._count.page })),
      topReferrers: topReferrers.map((r) => ({
        referrer: r.referrer || "Direct",
        count: r._count.referrer,
      })),
    });
  } catch (error) {
    console.error("Traffic stats error:", error);
    return errorResponse("Gagal mengambil data traffic", 500);
  }
}
