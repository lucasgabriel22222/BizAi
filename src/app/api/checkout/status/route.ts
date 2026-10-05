import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const paymentId = searchParams.get("id");

    if (!paymentId) {
      return NextResponse.json({ error: "ID de pagamento não fornecido" }, { status: 400 });
    }

    const payment = await new Payment(client).get({ id: Number(paymentId) });

    if (payment.status === "approved") {
      // Ativar plano Pro para o usuário
      const userId =
        (payment.external_reference as string) ||
        (payment.metadata as any)?.user_id;

      if (userId && userId !== "anon_checkout") {
        const now = new Date();
        const expiresAt = new Date(now);
        expiresAt.setMonth(expiresAt.getMonth() + 1);

        await prisma.subscription.upsert({
          where: { userId },
          create: {
            userId,
            plan: "Pro",
            status: "active",
            trialStartedAt: now,
            trialEndsAt: now,
            startedAt: now,
            expiresAt,
          },
          update: {
            plan: "Pro",
            status: "active",
            startedAt: now,
            expiresAt,
          },
        });
      }
    }

    return NextResponse.json({
      status: payment.status,
      statusDetail: payment.status_detail,
    });
  } catch (error: any) {
    console.error("Erro ao consultar status do pagamento:", error);
    return NextResponse.json(
      { error: error?.message || "Erro ao consultar pagamento" },
      { status: 500 }
    );
  }
}
