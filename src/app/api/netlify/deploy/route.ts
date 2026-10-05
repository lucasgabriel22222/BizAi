import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { subdomain, htmlCode } = body;

    if (!subdomain || !htmlCode) {
      return NextResponse.json(
        { error: "Subdomínio e código HTML são obrigatórios." },
        { status: 400 }
      );
    }

    const cleanSubdomain = subdomain.toLowerCase().trim().replace(/[^a-z0-9-]/g, "");
    const netlifyToken = process.env.NETLIFY_AUTH_TOKEN;

    if (!netlifyToken) {
      return NextResponse.json(
        { error: "NETLIFY_AUTH_TOKEN não está configurado nas variáveis de ambiente." },
        { status: 500 }
      );
    }

    // 1. Verificar se o usuário já tem um site criado no Netlify para reutilizar o siteId
    let siteId: string | null = null;
    let siteUrl = `https://${cleanSubdomain}.netlify.app`;

    try {
      const userConfig = await (prisma as any).landingConfig?.findUnique({
        where: { userId: session.userId },
      });
      if (userConfig?.netlifySiteId) {
        siteId = userConfig.netlifySiteId;
      }
    } catch {
      // continua
    }

    // 2. Se o siteId ainda não existe, cria um novo site no Netlify
    if (!siteId) {
      const createSiteRes = await fetch("https://api.netlify.com/api/v1/sites", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${netlifyToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: cleanSubdomain,
        }),
      });

      if (!createSiteRes.ok) {
        const errJson = await createSiteRes.json().catch(() => ({}));
        // Se o nome já existir, tenta criar sem forçar o nome e aceitar o nome gerado ou erro
        if (createSiteRes.status === 422 || errJson?.errors?.name) {
          const fallbackCreate = await fetch("https://api.netlify.com/api/v1/sites", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${netlifyToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
          });

          if (!fallbackCreate.ok) {
            return NextResponse.json(
              { error: "Não foi possível registrar o site no Netlify." },
              { status: 500 }
            );
          }
          const fallbackData = await fallbackCreate.json();
          siteId = fallbackData.id;
          siteUrl = fallbackData.ssl_url || fallbackData.url;
        } else {
          return NextResponse.json(
            { error: errJson?.message || "Erro ao criar site no Netlify." },
            { status: 500 }
          );
        }
      } else {
        const siteData = await createSiteRes.json();
        siteId = siteData.id;
        siteUrl = siteData.ssl_url || siteData.url || `https://${cleanSubdomain}.netlify.app`;
      }
    }

    // 3. Fazer Deploy dos Arquivos (index.html) no Netlify via API de arquivos com Sha1
    const fileContentBuffer = Buffer.from(htmlCode, "utf-8");
    const sha1Hash = crypto.createHash("sha1").update(fileContentBuffer).digest("hex");

    // Prepara o manifesto do deploy
    const deployManifestRes = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/deploys`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${netlifyToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        files: {
          "/index.html": sha1Hash,
        },
      }),
    });

    if (!deployManifestRes.ok) {
      const deployErr = await deployManifestRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: deployErr?.message || "Erro ao iniciar o deploy no Netlify." },
        { status: 500 }
      );
    }

    const deployData = await deployManifestRes.json();
    const deployId = deployData.id;

    // Se o arquivo precisa ser enviado (está na lista de required)
    if (deployData.required && deployData.required.includes(sha1Hash)) {
      const uploadRes = await fetch(
        `https://api.netlify.com/api/v1/deploys/${deployId}/files/index.html`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${netlifyToken}`,
            "Content-Type": "application/octet-stream",
          },
          body: fileContentBuffer,
        }
      );

      if (!uploadRes.ok) {
        return NextResponse.json(
          { error: "Erro ao enviar o código HTML do site para o Netlify." },
          { status: 500 }
        );
      }
    }

    // 4. Salva a URL do Netlify e os metadados no Banco de Dados
    try {
      if ((prisma as any).landingConfig) {
        await (prisma as any).landingConfig.upsert({
          where: { userId: session.userId },
          create: {
            userId: session.userId,
            customHtml: htmlCode,
            publishedUrl: siteUrl,
            netlifySiteId: siteId,
            netlifySubdomain: cleanSubdomain,
            published: true,
          },
          update: {
            customHtml: htmlCode,
            publishedUrl: siteUrl,
            netlifySiteId: siteId,
            netlifySubdomain: cleanSubdomain,
            published: true,
          },
        });
      }

      // Salva no userSettings para atualização em tempo real no painel
      const currentSettings = await prisma.userSettings.findUnique({
        where: { userId: session.userId },
      });

      const updatedLandingConfig = {
        ...((currentSettings?.landingConfig as any) || {}),
        publishedUrl: siteUrl,
        netlifySiteId: siteId,
        netlifySubdomain: cleanSubdomain,
        landingPublished: true,
      };

      await prisma.userSettings.upsert({
        where: { userId: session.userId },
        create: {
          userId: session.userId,
          landingConfig: updatedLandingConfig,
          landingPublished: true,
        },
        update: {
          landingConfig: updatedLandingConfig,
          landingPublished: true,
        },
      });
    } catch (err) {
      console.error("Erro ao salvar URL no banco:", err);
    }

    return NextResponse.json({
      success: true,
      siteId,
      publishedUrl: siteUrl,
      subdomain: cleanSubdomain,
    });
  } catch (error: any) {
    console.error("Erro ao realizar deploy no Netlify:", error);
    return NextResponse.json(
      { error: error?.message || "Falha na publicação via Netlify." },
      { status: 500 }
    );
  }
}
