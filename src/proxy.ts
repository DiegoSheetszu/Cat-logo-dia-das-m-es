import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/catalogo" || request.nextUrl.pathname.startsWith("/catalogo/")) {
    return NextResponse.redirect(new URL("/catalogo-inativo", request.url));
  }

  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
