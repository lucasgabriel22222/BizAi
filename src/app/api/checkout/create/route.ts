import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { getSession } from "@/lib/auth";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const body = await req.json().catch(() => ({}));
    const userEmail = body.email || session?.email;
    const phone = body.phone;
    const amount = Number(body.amount) || 97;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const preference = await new Preference(client).create({
      body: {
        items: [
          {
            id: "BizAi-pro-monthly",
            title: "BizAi Pro — Acesso Completo",
            description: "Acesso a todas as funcionalidades da plataforma BizAi",
            quantity: 1,
            unit_price: amount,
            currency_id: "BRL",
          },
        ],
        payer: {
          email: userEmail || "cliente@exemplo.com",
          phone: phone ? { number: phone.replace(/\D/g, "") } : undefined,
        },
        back_urls: {
          success: `${appUrl}/checkout/success`,
          failure: `${appUrl}/checkout/failure`,
          pending: `${appUrl}/checkout/pending`,
        },
        auto_return: "approved",
        notification_url: `${appUrl}/api/checkout/webhook`,
        external_reference: session?.userId || "anon_checkout",
        metadata: {
          user_id: session?.userId || null,
        },
        statement_descriptor: "BizAi PRO",
      },
    });

    return NextResponse.json({
      init_point: preference.init_point,
      sandbox_init_point: preference.sandbox_init_point,
      preference_id: preference.id,
    });
  } catch (error) {
    console.error("Mercado Pago checkout error:", error);
    return NextResponse.json(
      { error: "Erro ao criar checkout" },
      { status: 500 }
    );
  }
}

