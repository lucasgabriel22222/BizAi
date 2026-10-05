"use client";

import { useState } from "react";
import { Sparkles, MessageSquare, Send, Bot, User, Check, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface Message {
  sender: "patient" | "ai";
  text: string;
}

export default function AIAssistantPage() {
  const [loading, setLoading] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { sender: "ai", text: "Olá! Como posso te ajudar hoje sobre os atendimentos da clínica?" },
  ]);

  // Form states
  const [aiConfig, setAiConfig] = useState({
    name: "Melina",
    prompt: "Seja acolhedora, explique que o Dr. atende ansiedade e depressão e direcione para o agendamento.",
    tone: "Acolhedor e Empático",
    specialties: "Ansiedade, Depressão, TCC",
    price: "200.00",
    address: "Av. Paulista, 1000 - Bela Vista, São Paulo",
    online: true,
    hours: "Segunda a Sexta, das 08h às 19h",
    active: true,
  });

  const handleSaveConfig = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Configurações do Assistente IA salvas!");
    }, 1500);
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;

    const patientMsg = chatInput;
    setMessages((prev) => [...prev, { sender: "patient", text: patientMsg }]);
    setChatInput("");

    // Resposta simulada de altíssima fidelidade contextualmente alinhada com as configs inseridas
    setTimeout(() => {
      let answer = "";
      const lower = patientMsg.toLowerCase();

      if (lower.includes("valor") || lower.includes("preço") || lower.includes("custa") || lower.includes("quanto")) {
        answer = `Olá! A consulta com o Dr. tem o valor padrão de R$ ${aiConfig.price}. Gostaria que eu te enviasse o link para agendarmos uma sessão?`;
      } else if (lower.includes("onde") || lower.includes("endereço") || lower.includes("local") || lower.includes("fica")) {
        answer = `O consultório físico está localizado na ${aiConfig.address}.${aiConfig.online ? " Também realizamos consultas 100% online por videoconferência segura!" : ""} O que prefere?`;
      } else if (lower.includes("horário") || lower.includes("horas") || lower.includes("agenda")) {
        answer = `Os horários de atendimento são: ${aiConfig.hours}. Podemos verificar uma data disponível na nossa agenda online!`;
      } else {
        answer = `Com certeza! Dr. atende as especialidades de ${aiConfig.specialties}. Com base no que você relatou, acredito que podemos te ajudar muito. Vamos iniciar um acompanhamento agendando um horário?`;
      }

      setMessages((prev) => [...prev, { sender: "ai", text: answer }]);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-brand bg-clip-text text-transparent flex items-center gap-2">
          IA de Atendimento
          <Sparkles className="h-6 w-6 text-primary animate-pulse" />
        </h1>
        <p className="text-sm text-muted-foreground">
          Configure a assistente virtual inteligente da sua clínica para responder pacientes e agendar consultas.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Coluna Configurações */}
        <div className="space-y-6 lg:col-span-3">
          <Card className="border-white/10 bg-card/60 backdrop-blur-xl shadow-glass">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-lg">Personalidade e Conhecimento</CardTitle>
                <CardDescription>Defina o tom e as informações da clínica</CardDescription>
              </div>
              <button
                onClick={handleSaveConfig}
                disabled={loading}
                className="rounded-xl bg-gradient-brand px-4 py-2 text-xs font-bold text-white shadow-glass transition-all hover:brightness-105"
              >
                {loading ? "Salvando..." : "Salvar Dados"}
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">Nome da Assistente</label>
                  <input
                    type="text"
                    value={aiConfig.name}
                    onChange={(e) => setAiConfig({ ...aiConfig, name: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">Tom de Voz</label>
                  <input
                    type="text"
                    value={aiConfig.tone}
                    onChange={(e) => setAiConfig({ ...aiConfig, tone: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">Especialidades</label>
                  <input
                    type="text"
                    value={aiConfig.specialties}
                    onChange={(e) => setAiConfig({ ...aiConfig, specialties: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">Valor da Consulta (R$)</label>
                  <input
                    type="number"
                    value={aiConfig.price}
                    onChange={(e) => setAiConfig({ ...aiConfig, price: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Endereço do Consultório Físico</label>
                <input
                  type="text"
                  value={aiConfig.address}
                  onChange={(e) => setAiConfig({ ...aiConfig, address: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">Horários de Atendimento</label>
                  <input
                    type="text"
                    value={aiConfig.hours}
                    onChange={(e) => setAiConfig({ ...aiConfig, hours: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-2 pt-8">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={aiConfig.online}
                      onChange={(e) => setAiConfig({ ...aiConfig, online: e.target.checked })}
                      className="rounded border-white/10 bg-white/5 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-white">Realiza atendimento online</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Instruções Personalizadas (Prompt)</label>
                <textarea
                  value={aiConfig.prompt}
                  onChange={(e) => setAiConfig({ ...aiConfig, prompt: e.target.value })}
                  rows={4}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Sandbox Chat */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-white/10 bg-card/60 backdrop-blur-xl shadow-glass flex flex-col h-[520px]">
            <CardHeader className="border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 text-primary">
                  <Bot className="h-5 w-5" />
                </span>
                <div>
                  <CardTitle className="text-sm font-bold text-white">Sandbox do Assistente</CardTitle>
                  <CardDescription className="text-[10px]">Simule perguntas do paciente</CardDescription>
                </div>
              </div>
            </CardHeader>
            
            {/* Mensagens de Chat */}
            <CardContent className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-3 max-w-[85%] ${
                    msg.sender === "patient" ? "ml-auto flex-row-reverse" : "mr-auto"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                      msg.sender === "patient" ? "bg-white/10 text-white" : "bg-primary/20 text-primary"
                    }`}
                  >
                    {msg.sender === "patient" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </span>
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                      msg.sender === "patient"
                        ? "bg-primary text-white"
                        : "bg-white/5 border border-white/10 text-white"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </CardContent>

            {/* Input de Chat */}
            <div className="border-t border-white/10 p-4 flex gap-2">
              <input
                type="text"
                placeholder="Pergunte ex: Qual o valor da consulta?"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white focus:outline-none focus:border-primary placeholder-white/30"
              />
              <button
                onClick={handleSendChat}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-glass hover:brightness-105 transition-all"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
