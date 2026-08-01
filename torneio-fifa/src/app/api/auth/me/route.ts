import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { isAdminFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  return NextResponse.json({ isAdmin: isAdminFromRequest(request) });
}
