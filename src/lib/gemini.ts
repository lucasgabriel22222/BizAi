// Pool de 5 chaves de API do Gemini para Load Balancing (Round-Robin)
export function getRotatedGeminiKey(): string {
  const keys = [
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
    process.env.GEMINI_API_KEY_5,
    process.env.GEMINI_API_KEY,
  ].filter((k) => k && k.trim().length > 10) as string[];

  if (keys.length === 0) {
    throw new Error(
      "Nenhuma chave de API do Gemini encontrada. Por favor, adicione GEMINI_API_KEY_1=AIzaSy... no seu arquivo .env"
    );
  }

  // Rotação Round-Robin / Aleatória entre as chaves disponíveis
  const key = keys[Math.floor(Math.random() * keys.length)];
  return key;
}

/**
 * Realiza uma solicitação REST para os modelos do Gemini com a ordem de prioridade oficial:
 * 1. gemini-3.8-flash (Engenharia de software de longo prazo, modelo principal mais inteligente)
 * 2. gemini-3.7-flash (Programação avançada e execução de várias etapas)
 * 3. gemini-3.6-flash (Equilibrado entre velocidade e recursos multimodais)
 * 4. gemini-3.5-flash (Desempenho fundamental para cargas rotineiras)
 * 5. gemini-3.5-flash-lite (Opção mais rápida para alta capacidade)
 * 6. gemini-3.1-flash-lite (Eficiência de custo extrema)
 */
export async function generateContentWithGemini(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const apiKey = getRotatedGeminiKey();
  
  // Ordem de modelos exata fornecida para fallback em caso de alta demanda
  const models = [
    "gemini-3.8-flash",
    "gemini-3.7-flash",
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite"
  ];
  
  let lastErrorMsg = "";

  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  { text: `${systemPrompt}\n\n${userMessage}` }
                ]
              }
            ],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.7,
            }
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return text;
        }

        const errorData = await response.json().catch(() => ({}));
        const msg = errorData?.error?.message || `Erro HTTP ${response.status}`;
        lastErrorMsg = msg;

        // Se o modelo específico estiver indisponível ou com sobrecarga, tenta o próximo modelo da lista
        if (
          msg.includes("high demand") || 
          msg.includes("quota") || 
          msg.includes("not available") ||
          msg.includes("not found") ||
          response.status === 429 ||
          response.status === 404
        ) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          break; // Pula para o próximo modelo da lista
        }

        if (msg.includes("API key not valid")) {
          throw new Error("A chave GEMINI_API_KEY_1 no arquivo .env é inválida. Verifique sua chave no Google AI Studio.");
        }
      } catch (err: any) {
        lastErrorMsg = err?.message || "Erro desconhecido";
        if (err?.message?.includes("API key not valid")) {
          throw err;
        }
      }
    }
  }

  if (lastErrorMsg.includes("high demand")) {
    throw new Error("Os servidores do Gemini estão com alta demanda temporária. Por favor, aguarde alguns segundos e clique em Gerar novamente.");
  }

  throw new Error(`Não foi possível gerar a landing page: ${lastErrorMsg}`);
}
