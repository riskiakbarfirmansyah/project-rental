import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { faqSchema } from "@/lib/validations";
import { requireAdmin } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fetchAll = searchParams.get("all") === "true";
    
    const faqs = await prisma.faqItem.findMany({
      where: fetchAll ? {} : { isActive: true },
      orderBy: { order: "asc" },
    });
    return successResponse({ faqs });
  } catch (error) {
    console.error("Get FAQ error:", error);
    return errorResponse("Terjadi kesalahan server", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return errorResponse(auth.error, auth.status);

    const body = await request.json();
    const parsed = faqSchema.safeParse(body);
    if (!parsed.success) return errorResponse(parsed.error.issues[0].message);

    const faq = await prisma.faqItem.create({ data: parsed.data });
    return successResponse({ faq }, 201);
  } catch (error) {
    console.error("Create FAQ error:", error);
    return errorResponse("Terjadi kesalahan server", 500);
  }
}
