import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

// Supabase admin client (service role) for sending emails
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, data } = body;

    // MP sends different event types; we care about payment events
    if (type !== "payment") {
      return NextResponse.json({ ok: true });
    }

    const paymentId = data?.id;
    if (!paymentId) {
      return NextResponse.json({ ok: true });
    }

    // Fetch payment details from MP
    const payment = await new Payment(client).get({ id: paymentId });

    if (payment.status !== "approved") {
      return NextResponse.json({ ok: true });
    }

    // Get user id from external_reference or metadata
    const userId =
      (payment.external_reference as string) ||
      (payment.metadata as any)?.user_id;

    if (!userId) {
      console.error("MP Webhook: no userId found in payment", payment.id);
      return NextResponse.json({ error: "no user id" }, { status: 400 });
    }

    // Deploy automático do site no Netlify se houver rascunho pendente de pagamento
    const currentSettings = await prisma.userSettings.findUnique({
      where: { userId },
    });
    const landingConfigObj = (currentSettings?.landingConfig as any) || {};

    if (landingConfigObj.pendingSubdomain && landingConfigObj.pendingHtmlCode) {
      try {
        const deployRes = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/netlify/deploy`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subdomain: landingConfigObj.pendingSubdomain,
            htmlCode: landingConfigObj.pendingHtmlCode,
          }),
        });
        const deployData = await deployRes.json();
        if (deployData.success && deployData.publishedUrl) {
          const updatedLandingConfig = {
            ...landingConfigObj,
            siteStatus: "PUBLICADO",
            publishedUrl: deployData.publishedUrl,
            netlifySiteId: deployData.siteId,
            pendingSubdomain: null,
            pendingHtmlCode: null,
          };
          await prisma.userSettings.update({
            where: { userId },
            data: {
              landingConfig: updatedLandingConfig,
              landingPublished: true,
            },
          });
        }
      } catch (deployErr) {
        console.error("Erro no deploy pós-pagamento via Netlify:", deployErr);
      }
    }

    // Ativa plano BizAI Pro e cobrança recorrente de R$ 197,00/mês
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        plan: "BizAI Pro (R$ 197/mês)",
        status: "active",
        trialStartedAt: now,
        trialEndsAt: now,
        startedAt: now,
        expiresAt,
      },
      update: {
        plan: "BizAI Pro (R$ 197/mês)",
        status: "active",
        startedAt: now,
        expiresAt,
      },
    });

    // Send email via Supabase auth (uses the configured email template)
    // Note: Supabase doesn't have a direct "send custom email" without Resend.
    // For now we log and can add Resend later.
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      console.log(
        `✅ Pro plan activated for ${user.email} (payment ${payment.id})`
      );
      // TODO: integrate Resend or SMTP to send welcome email
      // await sendProWelcomeEmail(user.email, user.name);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("MP Webhook error:", error);
    return NextResponse.json({ error: "webhook error" }, { status: 500 });
  }
}

// MP sends GET to validate the webhook URL during setup
export async function GET() {
  return NextResponse.json({ ok: true });
}
