import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { blogSchema } from "@/lib/validations";
import { requireAdmin } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: { author: { select: { id: true, name: true, avatar: true } } },
    });
    if (!post) return errorResponse("Artikel tidak ditemukan", 404);
    return successResponse({ post });
  } catch (error) {
    console.error("Get post error:", error);
    return errorResponse("Terjadi kesalahan server", 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return errorResponse(auth.error, auth.status);

    const { slug } = await params;
    const body = await request.json();
    const parsed = blogSchema.partial().safeParse(body);
    if (!parsed.success) return errorResponse(parsed.error.issues[0].message);

    const dataToUpdate: any = { ...parsed.data };
    if (dataToUpdate.publishedAt !== undefined) {
      dataToUpdate.publishedAt = dataToUpdate.publishedAt ? new Date(dataToUpdate.publishedAt) : null;
    }

    const post = await prisma.blogPost.update({ where: { slug }, data: dataToUpdate });
    return successResponse({ post });
  } catch (error) {
    console.error("Update post error:", error);
    return errorResponse("Terjadi kesalahan server", 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return errorResponse(auth.error, auth.status);

    const { slug } = await params;
    await prisma.blogPost.delete({ where: { slug } });
    return successResponse({ message: "Artikel berhasil dihapus" });
  } catch (error) {
    console.error("Delete post error:", error);
    return errorResponse("Terjadi kesalahan server", 500);
  }
}
