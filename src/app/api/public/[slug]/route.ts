import { NextResponse } from "next/server";
import { getPublicProfile } from "@/lib/public-profile";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const profile = await getPublicProfile(slug);

  if (!profile) {
    return NextResponse.json({ error: "Página não encontrada" }, { status: 404 });
  }

  return NextResponse.json(profile);
}
