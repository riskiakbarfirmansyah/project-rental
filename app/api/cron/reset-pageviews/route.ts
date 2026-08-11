import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * Cron job: Membersihkan data page views lama setiap jam 00:00 WIB.
 * Data yang dihapus = semua record LEBIH DARI 30 HARI yang lalu.
 * Data 30 hari terakhir (termasuk kemarin & 7 hari) tetap disimpan untuk analytics.
 * Dipanggil oleh Vercel Cron sesuai konfigurasi di vercel.json.
 */
export async function GET(request: NextRequest) {
  // Verifikasi cron secret atau header otomatis Vercel Cron
  const authHeader = request.headers.get("authorization");
  const isVercelCron = request.headers.get("x-vercel-cron") === "1";
  if (process.env.CRON_SECRET && !isVercelCron && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
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

    // Hapus page views yang lebih dari 30 hari yang lalu
    // Ini menjaga data kemarin, 7 hari, dan 30 hari tetap ada untuk analytics
    const thirtyDaysAgo = new Date(todayStartWIB);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const deleted = await prisma.pageView.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo,
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
