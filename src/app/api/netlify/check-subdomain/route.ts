import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const rawSubdomain = searchParams.get("subdomain") || "";
    const subdomain = rawSubdomain.toLowerCase().trim().replace(/[^a-z0-9-]/g, "");

    if (!subdomain || subdomain.length < 3) {
      return NextResponse.json(
        { available: false, error: "Subdomínio deve conter pelo menos 3 caracteres alfanuméricos." },
        { status: 400 }
      );
    }

    const netlifyToken = process.env.NETLIFY_AUTH_TOKEN;
    if (!netlifyToken) {
      return NextResponse.json(
        { available: true, message: "Modo simulado: NETLIFY_AUTH_TOKEN não configurado." }
      );
    }

    // Consulta se o site com esse nome/slug já existe no Netlify
    const netlifyRes = await fetch(`https://api.netlify.com/api/v1/sites/${subdomain}.netlify.app`, {
      headers: {
        Authorization: `Bearer ${netlifyToken}`,
      },
    });

    if (netlifyRes.status === 404) {
      // 404 significa que o subdomínio está LIVRE/DISPONÍVEL
      return NextResponse.json({ available: true, subdomain });
    } else if (netlifyRes.ok) {
      // 200 significa que o site JÁ EXISTE (indisponível)
      return NextResponse.json({ available: false, subdomain, message: "Este subdomínio já está em uso." });
    }

    // Caso o endpoint retorne 403/401 por outro motivo ou site com nome exato não encontrado via search
    const searchRes = await fetch(`https://api.netlify.com/api/v1/sites?name=${subdomain}`, {
      headers: {
        Authorization: `Bearer ${netlifyToken}`,
      },
    });

    if (searchRes.ok) {
      const sites = await searchRes.json();
      const exists = Array.isArray(sites) && sites.some((s: any) => s.name === subdomain || s.custom_domain === `${subdomain}.netlify.app`);
      return NextResponse.json({ available: !exists, subdomain });
    }

    return NextResponse.json({ available: true, subdomain });
  } catch (error: any) {
    console.error("Erro ao verificar subdomínio no Netlify:", error);
    return NextResponse.json(
      { error: "Falha ao verificar disponibilidade do subdomínio." },
      { status: 500 }
    );
  }
}
