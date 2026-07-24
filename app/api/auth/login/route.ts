import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";
import { signJwt } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message);
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return errorResponse("Email tidak terdaftar. Silakan periksa kembali atau hubungi administrator.", 401);
    }

    let isValid = false;
    try {
      isValid = await bcrypt.compare(password, user.password);
    } catch {
      isValid = false;
    }

    // Fallback: Jika data user dimasukkan manual via Supabase Table Editor tanpa di-hash
    if (!isValid && user.password === password) {
      isValid = true;
      try {
        const hashedPassword = await bcrypt.hash(password, 12);
        await prisma.user.update({
          where: { id: user.id },
          data: { password: hashedPassword },
        });
      } catch (err) {
        console.error("Auto-hash password error:", err);
      }
    }

    if (!isValid) {
      return errorResponse("Password salah. Silakan coba lagi.", 401);
    }

    const token = await signJwt({ userId: user.id, email: user.email, role: user.role });

    const response = successResponse({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
      },
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return errorResponse("Terjadi kesalahan server", 500);
  }
}
