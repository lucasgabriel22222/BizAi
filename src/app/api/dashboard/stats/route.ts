import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getPeriodDashboardStats } from "@/lib/stats";
import { resolvePeriod, type PeriodPreset } from "@/lib/period";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const preset = (searchParams.get("period") || "7d") as PeriodPreset;
  const start = searchParams.get("start") || undefined;
  const end = searchParams.get("end") || undefined;

  const period = resolvePeriod(preset, start, end);
  const stats = await getPeriodDashboardStats(session.userId, period);

  return NextResponse.json(stats);
}
