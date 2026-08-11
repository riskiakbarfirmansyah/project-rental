import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { blogSchema } from "@/lib/validations";
import { requireAdmin, getAuthUser } from "@/lib/auth";
import { successResponse, errorResponse, generateSlug } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "9");
    const skip = (page - 1) * limit;

    const user = await getAuthUser();
    const isAdmin = user?.role === "ADMIN";
    const where = isAdmin ? {} : { isPublished: true };

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        include: { author: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.blogPost.count({ where }),
    ]);

    return successResponse({
      posts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Get blog error:", error);
    return errorResponse("Terjadi kesalahan server", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return errorResponse(auth.error, auth.status);

    const body = await request.json();
    const parsed = blogSchema.safeParse(body);
    if (!parsed.success) return errorResponse(parsed.error.issues[0].message);

    const { title, slug, publishedAt, ...rest } = parsed.data;
    const finalSlug = slug || generateSlug(title);

    const existing = await prisma.blogPost.findUnique({ where: { slug: finalSlug } });
    if (existing) {
      return errorResponse("Slug sudah digunakan", 409);
    }

    const post = await prisma.blogPost.create({
      data: { 
        title, 
        slug: finalSlug, 
        ...rest, 
        publishedAt: publishedAt ? new Date(publishedAt) : null,
        authorId: auth.user.id 
      },
      include: { author: { select: { id: true, name: true } } },
    });

    revalidatePath("/blog");
    return successResponse({ post }, 201);
  } catch (error) {
    console.error("Create blog error:", error);
    return errorResponse("Terjadi kesalahan server", 500);
  }
}
