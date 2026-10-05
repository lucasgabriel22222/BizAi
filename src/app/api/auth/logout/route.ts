import { NextResponse } from "next/server";
import { clearSessionCookie, getSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST() {
  const session = await getSession();
  if (session?.userId) {
    await logAudit({
      userId: session.userId,
      action: "logout",
      details: { email: session.email },
    });
  }
  await clearSessionCookie();
  return NextResponse.json({ success: true });
}

