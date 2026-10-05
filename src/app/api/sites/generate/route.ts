import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateContentWithGemini } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const {
      nome_empresa,
      ramo_atividade,
      numero_whatsapp,
      endereco,
      servicos,
      cor_marca,
      descricao,
    } = body;

    if (!nome_empresa || !ramo_atividade || !numero_whatsapp) {
      return NextResponse.json(
        { error: "Nome da empresa, ramo de atividade e WhatsApp são obrigatórios." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        subscription: true,
        settings: true,
      },
    });

    const isPro = user?.subscription?.status === "active" || user?.subscription?.plan === "Pro";
    const currentSettings = user?.settings;
    const landingConfigObj = (currentSettings?.landingConfig as any) || {};

    if (!isPro && (landingConfigObj.has_generated_free_site || (landingConfigObj.generations_count || 0) >= 1)) {
      return NextResponse.json(
        {
          error: "Você já utilizou sua geração gratuita de site. Para desbloquear edições e gerar novos sites, assine o plano BizAI.",
          limitReached: true,
        },
        { status: 403 }
      );
    }

    // Formata o número do WhatsApp apenas com dígitos
    const cleanPhone = numero_whatsapp.replace(/\D/g, "");

    // Prompt de Sistema para o Gemini com saída JSON estrita
    const systemPrompt = `Você é um desenvolvedor frontend sênior especialista em páginas de alta conversão (landing pages).
Sua tarefa é criar uma landing page completa, responsiva, moderna e otimizada para dispositivos móveis usando HTML5 puro e Tailwind CSS (via CDN).

Você DEVE retornar a resposta estritamente em formato JSON válido, sem marcações adicionais, sem blocos \`\`\`json, no seguinte esquema exato:

{
  "nome_projeto": "string",
  "html_code": "string contendo todo o código HTML5 completo...",
  "status": "sucesso"
}

Diretrizes obrigatórias para o código HTML em 'html_code':
1. Inclua o script CDN do Tailwind CSS no <head>: <script src="https://cdn.tailwindcss.com"></script>
2. Adicione font Inter via Google Fonts e suporte a ícones Lucide/FontAwesome via CDN se necessário.
3. Estrutura completa da landing page:
   - Header limpo com logomarca da empresa e botão estilizado de WhatsApp.
   - Seção Hero (Apresentação) impactante com título forte, subtítulo persuasivo e chamada para ação (CTA) direto para o WhatsApp.
   - Seção de Serviços/Produtos com os preços informados organizados em cards modernos com sombras e bordas arredondadas.
   - Seção de Diferenciais/Sobre a empresa com ícones e destaque para a proposta de valor.
   - Botão Flutuante fixo de WhatsApp no canto inferior direito com pulso/animação suave.
   - Rodapé completo com endereço, informações da empresa e direitos reservados.
4. Use a cor informada (${cor_marca || "#10B981"}) para os botões principais, gradientes, ícones e elementos de destaque.
5. O link do WhatsApp DEVE estar formatado exatamente assim: https://wa.me/${cleanPhone}?text=Ol%C3%A1,%20vim%20pelo%20site!
6. O código HTML deve ser 100% autônomo, sem dependências locais, bonito, profissional e pronto para publicação.`;

    const userPayload = JSON.stringify(
      {
        nome_empresa,
        ramo_atividade,
        numero_whatsapp: cleanPhone,
        endereco: endereco || "Atendimento local e online",
        servicos: servicos || "Serviços sob consulta",
        cor_marca: cor_marca || "#10B981",
        descricao: descricao || "",
      },
      null,
      2
    );

    // Executa a geração via Gemini REST com rotação de chaves
    const rawText = await generateContentWithGemini(
      systemPrompt,
      `Dados do Cliente para Geração:\n${userPayload}`
    );

    // Limpa possíveis blocos de marcação ```json
    let cleanedText = rawText.trim();
    if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```(json)?/, "").replace(/```$/, "").trim();
    }

    let parsedJSON;
    try {
      parsedJSON = JSON.parse(cleanedText);
    } catch (e) {
      console.error("Erro ao analisar JSON do Gemini:", rawText);
      return NextResponse.json(
        { error: "O modelo não retornou um JSON válido. Tente novamente." },
        { status: 500 }
      );
    }

    const htmlCode = parsedJSON.html_code;
    if (!htmlCode) {
      return NextResponse.json(
        { error: "Código HTML não foi gerado pelo modelo." },
        { status: 500 }
      );
    }

    const slug = user?.slug || session.userId.slice(0, 8);

    // Atualiza flag de geração gratuita e salva o código HTML no banco
    try {
      const updatedConfig = {
        ...landingConfigObj,
        has_generated_free_site: true,
        generations_count: (landingConfigObj.generations_count || 0) + 1,
        customHtml: htmlCode,
        nome_empresa,
        descricao,
      };

      await prisma.userSettings.upsert({
        where: { userId: session.userId },
        create: {
          userId: session.userId,
          landingPublished: true,
          landingHeadline: nome_empresa,
          landingBio: descricao,
          landingConfig: updatedConfig,
        },
        update: {
          landingPublished: true,
          landingHeadline: nome_empresa,
          landingBio: descricao,
          landingConfig: updatedConfig,
        },
      });

      if ((prisma as any).landingConfig) {
        await (prisma as any).landingConfig.upsert({
          where: { userId: session.userId },
          create: {
            userId: session.userId,
            customHtml: htmlCode,
            published: true,
          },
          update: {
            customHtml: htmlCode,
            published: true,
          },
        });
      }
    } catch (err) {
      console.error("Erro ao salvar landing page no banco:", err);
    }

    return NextResponse.json({
      success: true,
      nome_projeto: parsedJSON.nome_projeto || nome_empresa,
      html_code: htmlCode,
      publicUrl: `/agendar/${slug}`,
    });
  } catch (error: any) {
    console.error("Erro na API de geração de landing page:", error);
    return NextResponse.json(
      { error: error?.message || "Erro interno ao gerar a landing page." },
      { status: 500 }
    );
  }
}
