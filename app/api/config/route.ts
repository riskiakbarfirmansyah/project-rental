import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/utils";

export async function GET() {
  try {
    const configs = await prisma.siteConfig.findMany();
    const configMap = configs.reduce((acc, c) => ({ ...acc, [c.key]: c.value }), {} as Record<string, string>);
    return successResponse({ config: configMap });
  } catch (error) {
    console.error("Get config error:", error);
    return errorResponse("Terjadi kesalahan server", 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return errorResponse(auth.error, auth.status);

    const body = await request.json();
    const { configs } = body as { configs: { key: string; value: string }[] };

    if (!Array.isArray(configs)) return errorResponse("Format tidak valid");

    await Promise.all(
      configs.map((c) =>
        prisma.siteConfig.upsert({
          where: { key: c.key },
          update: { value: c.value },
          create: { key: c.key, value: c.value },
        })
      )
    );

    return successResponse({ message: "Konfigurasi berhasil disimpan" });
  } catch (error) {
    console.error("Update config error:", error);
    return errorResponse("Terjadi kesalahan server", 500);
  }
}
