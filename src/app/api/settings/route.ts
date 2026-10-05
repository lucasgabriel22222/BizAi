import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { settingsSchema } from "@/lib/validators";
import { hashPassword } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      settings: true,
      galleryImages: { orderBy: { sortOrder: "asc" } },
      reviews: { orderBy: { createdAt: "desc" } },
    },
  });

  return NextResponse.json({ user });
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await request.json();
  const { password, currentPassword, landingConfig, ...settingsData } = body;

  if (password && currentPassword) {
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    const { verifyPassword } = await import("@/lib/auth");
    if (!(await verifyPassword(currentPassword, user.password))) {
      return NextResponse.json({ error: "Senha atual incorreta" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: session.userId },
      data: { password: await hashPassword(password) },
    });
  }

  const parsed = settingsSchema.safeParse(settingsData);
  if (parsed.success && Object.keys(parsed.data).length > 0) {
    const { name, specialty, avatar, ...settings } = parsed.data;

    const userUpdate: { name?: string; specialty?: string; avatar?: string | null } = {};
    if (name) userUpdate.name = name;
    if (specialty) userUpdate.specialty = specialty;
    if (avatar !== undefined) userUpdate.avatar = avatar || null;

    if (Object.keys(userUpdate).length > 0) {
      await prisma.user.update({
        where: { id: session.userId },
        data: userUpdate,
      });
    }

    await prisma.userSettings.upsert({
      where: { userId: session.userId },
      update: { ...settings, ...(landingConfig !== undefined && { landingConfig }) },
      create: { userId: session.userId, ...settings, landingConfig: landingConfig ?? undefined },
    });
  } else if (landingConfig !== undefined) {
    await prisma.userSettings.upsert({
      where: { userId: session.userId },
      update: { landingConfig },
      create: { userId: session.userId, landingConfig },
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      settings: true,
      galleryImages: { orderBy: { sortOrder: "asc" } },
      reviews: { orderBy: { createdAt: "desc" } },
    },
  });

  return NextResponse.json({ user });
}
