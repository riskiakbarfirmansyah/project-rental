import { getAuthUser } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/utils";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) return errorResponse("Unauthorized", 401);
    return successResponse({ user });
  } catch (error) {
    console.error("Me error:", error);
    return errorResponse("Terjadi kesalahan server", 500);
  }
}
