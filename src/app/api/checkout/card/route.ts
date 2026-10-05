import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const body = await req.json();
    const { token, issuer_id, payment_method_id, installments, email, docType, docNumber, phone, amount } = body;

    const payerEmail = email || session?.email || "cliente@exemplo.com";

    const payment = new Payment(client);

    const result = await payment.create({
      body: {
        transaction_amount: Number(amount) || 97.0,
        token,
        description: "Assinatura BizAi Pro - Mensal",
        installments: Number(installments) || 1,
        payment_method_id,
        issuer_id,
        payer: {
          email: payerEmail,
          phone: phone ? { number: phone.replace(/\D/g, "") } : undefined,
          identification: {
            type: docType || "CPF",
            number: docNumber ? docNumber.replace(/\D/g, "") : "00000000000",
          },
        },
        external_reference: session?.userId || "anon_checkout",
        metadata: {
          user_id: session?.userId || null,
        },
      },
    });

    if (result.status === "approved" && session?.userId) {
      const now = new Date();
      const expiresAt = new Date(now);
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      await prisma.subscription.upsert({
        where: { userId: session.userId },
        create: {
          userId: session.userId,
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

    if (result.status === "approved") {
      return NextResponse.json({
        success: true,
        status: result.status,
        paymentId: result.id,
      });
    }

    return NextResponse.json({
      success: false,
      status: result.status,
      statusDetail: result.status_detail,
      message: "Pagamento não aprovado. Verifique os dados do cartão.",
    });
  } catch (error: any) {
    console.error("Erro no processamento do cartão:", error);
    return NextResponse.json(
      { error: error?.message || "Falha ao processar pagamento de cartão" },
      { status: 500 }
    );
  }
}

