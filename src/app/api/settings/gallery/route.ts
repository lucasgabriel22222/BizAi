import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { galleryImageSchema } from "@/lib/validators";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const images = await prisma.profileGalleryImage.findMany({
    where: { userId: session.userId },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json({ images });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await request.json();
  const parsed = galleryImageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const count = await prisma.profileGalleryImage.count({
    where: { userId: session.userId },
  });

  if (count >= 12) {
    return NextResponse.json({ error: "Máximo de 12 imagens na galeria" }, { status: 400 });
  }

  const image = await prisma.profileGalleryImage.create({
    data: {
      userId: session.userId,
      imageUrl: parsed.data.imageUrl,
      caption: parsed.data.caption,
      sortOrder: count,
    },
  });

  return NextResponse.json({ image });
}
