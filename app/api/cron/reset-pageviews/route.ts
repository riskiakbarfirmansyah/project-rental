import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * Cron job: Reset (hapus) data page views setiap jam 00:00 WIB.
 * Data yang dihapus = semua record SEBELUM hari ini (WIB).
 * Dipanggil oleh Vercel Cron sesuai konfigurasi di vercel.json.
 */
export async function GET(request: NextRequest) {
  // Verifikasi cron secret agar tidak bisa dipanggil sembarangan
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Hitung awal hari ini (00:00 WIB = UTC+7)
    const now = new Date();
    // Offset WIB = UTC+7 = 7 * 60 = 420 menit
    const wibOffset = 7 * 60;
    const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
    const wibNow = new Date(utcMs + wibOffset * 60000);
    
    // Awal hari WIB dalam UTC
    const todayStartWIB = new Date(
      Date.UTC(wibNow.getFullYear(), wibNow.getMonth(), wibNow.getDate()) - wibOffset * 60000
    );

    // Hapus semua page views sebelum hari ini WIB
    const deleted = await prisma.pageView.deleteMany({
      where: {
        createdAt: {
          lt: todayStartWIB,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Deleted ${deleted.count} old page view records`,
      deletedBefore: todayStartWIB.toISOString(),
    });
  } catch (error) {
    console.error("Cron reset-pageviews error:", error);
    return NextResponse.json(
      { error: "Failed to reset page views" },
      { status: 500 }
    );
  }
}
