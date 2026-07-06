import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactSchema } from "@/lib/validations";
import { requireAdmin } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/utils";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return errorResponse(auth.error, auth.status);

    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });

    return successResponse({ messages });
  } catch (error) {
    console.error("Get contacts error:", error);
    return errorResponse("Terjadi kesalahan server", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) return errorResponse(parsed.error.errors[0].message);

    const message = await prisma.contactMessage.create({ data: parsed.data });
    return successResponse({ message }, 201);
  } catch (error) {
    console.error("Create contact error:", error);
    return errorResponse("Terjadi kesalahan server", 500);
  }
}
