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
    const { email, firstName, lastName, docType, docNumber, phone, amount, subdomain, htmlCode } = body;

    const payerEmail = email || session?.email || "cliente@exemplo.com";
    const payerName = firstName || session?.name || "Cliente";

    if (session?.userId && subdomain && htmlCode) {
      // Salva rascunho com status PENDENTE_PAGAMENTO no banco
      const currentSettings = await prisma.userSettings.findUnique({
        where: { userId: session.userId },
      });
      const landingConfig = {
        ...((currentSettings?.landingConfig as any) || {}),
        pendingSubdomain: subdomain,
        pendingHtmlCode: htmlCode,
        siteStatus: "PENDENTE_PAGAMENTO",
      };
      await prisma.userSettings.upsert({
        where: { userId: session.userId },
        create: {
          userId: session.userId,
          landingConfig,
        },
        update: {
          landingConfig,
        },
      });
    }

    const payment = new Payment(client);

    const result = await payment.create({
      body: {
        transaction_amount: Number(amount) || 397.0,
        description: "Ativação de Domínio, Hospedagem e SSL - BizAI",
        payment_method_id: "pix",
        payer: {
          email: payerEmail,
          first_name: payerName,
          last_name: lastName || "BizAi",
          phone: phone ? { number: phone.replace(/\D/g, "") } : undefined,
          identification: {
            type: docType || "CPF",
            number: docNumber ? docNumber.replace(/\D/g, "") : "00000000000",
          },
        },
        external_reference: session?.userId || "anon_checkout",
        metadata: {
          user_id: session?.userId || null,
          subdomain: subdomain || null,
        },
      },
    });

    const qrCode = result.point_of_interaction?.transaction_data?.qr_code;
    const qrCodeBase64 = result.point_of_interaction?.transaction_data?.qr_code_base64;

    return NextResponse.json({
      paymentId: result.id,
      status: result.status,
      qrCode,
      qrCodeBase64,
      ticketUrl: result.point_of_interaction?.transaction_data?.ticket_url,
    });
  } catch (error: any) {
    console.error("Erro ao gerar PIX Mercado Pago:", error);
    return NextResponse.json(
      { error: error?.message || "Falha ao gerar o PIX" },
      { status: 500 }
    );
  }
}

