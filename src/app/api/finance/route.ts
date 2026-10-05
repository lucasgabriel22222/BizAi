import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getFinancialStats } from "@/lib/stats";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  const stats = await getFinancialStats(
    session.userId,
    start ? new Date(start) : undefined,
    end ? new Date(end) : undefined
  );

  return NextResponse.json(stats);
}
