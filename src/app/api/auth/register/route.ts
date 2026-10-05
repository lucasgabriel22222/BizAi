import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createToken, hashPassword, setSessionCookie } from "@/lib/auth";
import { premiumRegisterSchema } from "@/lib/validators";
import { slugify } from "@/lib/utils";
import { logAudit } from "@/lib/audit";
import { EmailNotificationService } from "@/lib/emails";
import {
  checkRateLimit,
  getClientIp,
  sanitizeText,
  validateSignupEmail,
} from "@/lib/auth-security";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);
    const rate = checkRateLimit(`register:${ip}`, 8, 60_000);
    if (!rate.ok) {
      return NextResponse.json(
        { error: "Muitas tentativas. Aguarde um momento." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = premiumRegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password, specialty, slug: rawSlug } = parsed.data;

    const emailErr = validateSignupEmail(email);
    if (emailErr) {
      return NextResponse.json({ error: emailErr }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 409 });
    }

    const slug = slugify(rawSlug) || slugify(name);
    const slugExists = await prisma.user.findUnique({ where: { slug } });
    if (slugExists) {
      return NextResponse.json({ error: "Este link já está em uso" }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name: sanitizeText(name, 120),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        slug,
        specialty: sanitizeText(specialty || "Psicologia", 80),
        settings: { create: {} },
        subscription: {
          create: {
            plan: "Starter",
            status: "trial",
            trialStartedAt: new Date(),
            trialEndsAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 dia
            startedAt: new Date(),
          },
        },
      },
    });

    // Registra log de auditoria
    await logAudit({
      userId: user.id,
      action: "register",
      ipAddress: ip,
      details: { email: user.email, plan: "Starter", status: "trial" },
    });

    // Enviar email de boas-vindas assincronamente
    EmailNotificationService.sendWelcomeTrialEmail(user.email, user.name).catch(console.error);

    const token = await createToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    await setSessionCookie(token);

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, slug: user.slug },
    });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

