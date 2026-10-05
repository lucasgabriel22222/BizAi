import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const netlifyToken = process.env.NETLIFY_AUTH_TOKEN;
    const now = new Date();

    // 1. Busca assinaturas expiradas ou canceladas
    const expiredSubscriptions = await prisma.subscription.findMany({
      where: {
        OR: [
          { status: "cancelled" },
          { status: "inactive" },
          { expiresAt: { lt: now } },
        ],
      },
      select: {
        userId: true,
        status: true,
        expiresAt: true,
      },
    });

    const deactivatedSites: string[] = [];

    for (const sub of expiredSubscriptions) {
      try {
        const landingConfig = await (prisma as any).landingConfig?.findUnique({
          where: { userId: sub.userId },
        });

        if (landingConfig && landingConfig.netlifySiteId) {
          // Chama a API do Netlify para deletar/desativar o site
          if (netlifyToken) {
            await fetch(`https://api.netlify.com/api/v1/sites/${landingConfig.netlifySiteId}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${netlifyToken}`,
              },
            }).catch(() => {});
          }

          // Atualiza o registro no banco de dados para publicado = false
          await (prisma as any).landingConfig.update({
            where: { userId: sub.userId },
            data: {
              published: false,
              publishedUrl: null,
              netlifySiteId: null,
            },
          });

          deactivatedSites.push(sub.userId);
        }
      } catch (err) {
        console.error(`Erro ao desativar site para o usuário ${sub.userId}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      processed: expiredSubscriptions.length,
      deactivatedSites,
    });
  } catch (error: any) {
    console.error("Erro na verificação de inadimplência Netlify:", error);
    return NextResponse.json(
      { error: error?.message || "Erro interno na verificação de assinaturas." },
      { status: 500 }
    );
  }
}
