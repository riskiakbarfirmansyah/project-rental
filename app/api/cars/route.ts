import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { carSchema } from "@/lib/validations";
import { requireAdmin } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const type = searchParams.get("type");
    const available = searchParams.get("available");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (available === "true") where.isAvailable = true;
    if (minPrice || maxPrice) {
      where.pricePerDay = {};
      if (minPrice) (where.pricePerDay as Record<string, number>).gte = parseInt(minPrice);
      if (maxPrice) (where.pricePerDay as Record<string, number>).lte = parseInt(maxPrice);
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { brand: { contains: search } },
      ];
    }

    const [cars, total] = await Promise.all([
      prisma.car.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.car.count({ where }),
    ]);

    return successResponse({
      cars,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Get cars error:", error);
    return errorResponse("Terjadi kesalahan server", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return errorResponse(auth.error, auth.status);

    const body = await request.json();
    const parsed = carSchema.safeParse(body);
    if (!parsed.success) return errorResponse(parsed.error.errors[0].message);

    const { features, images, ...rest } = parsed.data;
    const car = await prisma.car.create({
      data: {
        ...rest,
        features: JSON.stringify(features),
        images: JSON.stringify(images),
      },
    });

    return successResponse({ car }, 201);
  } catch (error) {
    console.error("Create car error:", error);
    return errorResponse("Terjadi kesalahan server", 500);
  }
}
