import { NextRequest, NextResponse } from "next/server";
import { getSession, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canUseMultiUsers } from "@/lib/features";
import { logAudit } from "@/lib/audit";
import { getClientIp } from "@/lib/auth-security";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    const tenantOwnerId = user?.ownerId || session.userId;

    const team = await prisma.user.findMany({
      where: {
        OR: [
          { id: tenantOwnerId },
          { ownerId: tenantOwnerId },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        specialty: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ team });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Obter dados do usuário logado
    const currentUser = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { subscription: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Validar permissão (Plano Max e deve ser Owner/Psychologist)
    const activeSub = currentUser.subscription 
      ? { plan: currentUser.subscription.plan, status: currentUser.subscription.status } 
      : undefined;
      
    if (!canUseMultiUsers(activeSub)) {
      return NextResponse.json(
        { error: "Disponível apenas no plano Max." },
        { status: 403 }
      );
    }

    if (currentUser.role !== "PSYCHOLOGIST" && currentUser.role !== "owner") {
      return NextResponse.json({ error: "Apenas donos de conta podem gerenciar a equipe" }, { status: 403 });
    }

    const { name, email, password, role, specialty } = await request.json();

    if (!["secretary", "staff"].includes(role)) {
      return NextResponse.json({ error: "Função inválida" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      // Se já está cadastrado, vamos apenas vinculá-lo à clínica
      const updatedMember = await prisma.user.update({
        where: { id: existing.id },
        data: {
          ownerId: session.userId,
          role: role as any,
          specialty: specialty || existing.specialty,
        },
      });

      const ip = getClientIp(request.headers);
      await logAudit({
        userId: session.userId,
        action: "add_team_member",
        ipAddress: ip,
        details: { memberId: updatedMember.id, role, existingUser: true },
      });

      return NextResponse.json({
        success: true,
        member: {
          id: updatedMember.id,
          name: updatedMember.name,
          email: updatedMember.email,
          role: updatedMember.role,
        },
      });
    }

    const hashedPassword = await hashPassword(password);
    const slug = `${currentUser.slug}-${role}-${Math.random().toString(36).substring(2, 6)}`;

    // Criar membro da equipe vinculado ao tenant (ownerId)
    const newMember = await prisma.user.create({
      data: {
        name,
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        slug,
        role: role as any,
        specialty: specialty || "Colaborador",
        ownerId: session.userId, // Vinculado diretamente ao owner
        settings: { create: {} },
      },
    });

    // Auditoria
    const ip = getClientIp(request.headers);
    await logAudit({
      userId: session.userId,
      action: "add_team_member",
      ipAddress: ip,
      details: { memberId: newMember.id, role },
    });

    return NextResponse.json({
      success: true,
      member: {
        id: newMember.id,
        name: newMember.name,
        email: newMember.email,
        role: newMember.role,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID necessário" }, { status: 400 });
    }

    const userToDelete = await prisma.user.findUnique({ where: { id } });
    if (!userToDelete) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    if (userToDelete.ownerId !== session.userId) {
      return NextResponse.json({ error: "Não autorizado a remover este usuário" }, { status: 403 });
    }

    // Apenas desvincula ou remove o registro
    await prisma.user.delete({ where: { id } });

    const ip = getClientIp(request.headers);
    await logAudit({
      userId: session.userId,
      action: "delete_team_member",
      ipAddress: ip,
      details: { memberId: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
