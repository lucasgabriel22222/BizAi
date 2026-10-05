"use client";

import { useState, useEffect } from "react";
import { 
  Sparkles, 
  Globe, 
  Smartphone, 
  Monitor, 
  ExternalLink, 
  CheckCircle2, 
  XCircle,
  Loader2, 
  Wand2, 
  Palette, 
  MapPin, 
  Phone, 
  Building2, 
  Copy,
  Check,
  UploadCloud,
  X,
  Instagram,
  Facebook,
  Video,
  Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

const NICHOS_CATEGORIZADOS = [
  {
    categoria: "Saúde & Bem-Estar",
    opcoes: ["Médico / Clínica", "Dentista / Odontologia", "Psicólogo / Terapeuta", "Fisioterapeuta", "Nutricionista"],
  },
  {
    categoria: "Estética & Beleza",
    opcoes: ["Barbearia", "Salão de Beleza", "Clínica de Estética", "Design de Sobrancelhas / Cílios", "Spa / Massagem"],
  },
  {
    categoria: "Automotivo",
    opcoes: ["Lava Jato / Estética Automotiva", "Borracharia", "Oficina Mecânica", "Auto Elétrica"],
  },
  {
    categoria: "Alimentação & Gastronomia",
    opcoes: ["Restaurante", "Lanchonete / Hamburgueria", "Pizzaria", "Confeitaria / Doceria"],
  },
  {
    categoria: "Serviços & Comércio",
    opcoes: ["Academia / Personal Trainer", "Pet Shop / Banho e Tosa", "Advocacia / Escritório", "Contabilidade"],
  },
];

const CORES_RECOMENDADAS = [
  { name: "Verde Esmeralda", hex: "#10B981" },
  { name: "Azul Elétrico", hex: "#2563EB" },
  { name: "Roxo Premium", hex: "#8B5CF6" },
  { name: "Vermelho Ouro", hex: "#EF4444" },
  { name: "Âmbar Luxo", hex: "#F59E0B" },
  { name: "Rosa Moderno", hex: "#EC4899" },
  { name: "Monocromático Preto", hex: "#09090B" },
];

export function LandingPageGenerator() {
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [copied, setCopied] = useState(false);

  // Form State - Informações Básicas
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [ramoAtividade, setRamoAtividade] = useState("Médico / Clínica");
  const [ramoCustom, setRamoCustom] = useState("");
  const [numeroWhatsapp, setNumeroWhatsapp] = useState("");
  const [endereco, setEndereco] = useState("");
  const [servicos, setServicos] = useState("");
  const [corMarca, setCorMarca] = useState("#10B981");
  const [descricao, setDescricao] = useState("");

  // Form State - Redes Sociais & Links de Integração
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [facebook, setFacebook] = useState("");
  const [googleMaps, setGoogleMaps] = useState("");

  // Resultado da geração e publicação
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);

  // Modal Publicação State
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [subdomain, setSubdomain] = useState("");
  const [checkingSubdomain, setCheckingSubdomain] = useState(false);
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);
  const [deploying, setDeploying] = useState(false);

  // Chat & Status de Publicação
  const [siteStatus, setSiteStatus] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [sendingChat, setSendingChat] = useState(false);

  // Carrega configurações existentes, status do site e mensagens do chat ao iniciar
  useEffect(() => {
    fetch("/api/sites/save-pending")
      .then((res) => res.json())
      .then((data) => {
        if (data.htmlCode) {
          setGeneratedHtml(data.htmlCode);
        }
        if (data.publishedUrl) {
          setPublicUrl(data.publishedUrl);
        }
        if (data.subdomain) {
          setSubdomain(data.subdomain);
        }
        setSiteStatus(data.siteStatus);
        setChatMessages(data.chatMessages || []);
      })
      .catch(() => {});

    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        const landingConfig = data?.user?.settings?.landingConfig || {};
        if (landingConfig.socials) {
          setInstagram(landingConfig.socials.instagram || "");
          setTiktok(landingConfig.socials.tiktok || "");
          setFacebook(landingConfig.socials.facebook || "");
          setGoogleMaps(landingConfig.socials.googleMaps || "");
        }
      })
      .catch(() => {});
  }, []);

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setSendingChat(true);
    try {
      const res = await fetch("/api/sites/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: chatInput.trim() }),
      });
      const data = await res.json();
      if (data.success && data.chatMessages) {
        setChatMessages(data.chatMessages);
        setChatInput("");
        toast.success("Solicitação de alteração enviada ao suporte com sucesso!");
      } else {
        toast.error(data.error || "Falha ao enviar mensagem.");
      }
    } catch {
      toast.error("Erro ao enviar mensagem para o suporte.");
    } finally {
      setSendingChat(false);
    }
  };

  // Auto-gera sugestão de subdomínio a partir do nome da empresa
  useEffect(() => {
    if (nomeEmpresa) {
      const suggested = nomeEmpresa
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      setSubdomain(suggested);
    }
  }, [nomeEmpresa]);

  // Checagem em Tempo Real do Subdomínio
  useEffect(() => {
    if (!subdomain || subdomain.length < 3 || !publishModalOpen) {
      setSubdomainAvailable(null);
      return;
    }

    setCheckingSubdomain(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/netlify/check-subdomain?subdomain=${encodeURIComponent(subdomain)}`);
        const data = await res.json();
        setSubdomainAvailable(data.available);
      } catch {
        setSubdomainAvailable(null);
      } finally {
        setCheckingSubdomain(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [subdomain, publishModalOpen]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    const nichoFinal = ramoAtividade === "Outro" ? ramoCustom : ramoAtividade;

    if (!nomeEmpresa.trim() || !nichoFinal.trim() || !numeroWhatsapp.trim()) {
      toast.error("Preencha o Nome da Empresa, Nicho e WhatsApp.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/sites/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome_empresa: nomeEmpresa.trim(),
          ramo_atividade: nichoFinal.trim(),
          numero_whatsapp: numeroWhatsapp.trim(),
          endereco: endereco.trim(),
          servicos: servicos.trim(),
          cor_marca: corMarca,
          descricao: descricao.trim(),
          redes_sociais: {
            instagram: instagram.trim(),
            tiktok: tiktok.trim(),
            facebook: facebook.trim(),
            google_maps: googleMaps.trim(),
          },
        }),
      });

      const data = await res.json();

      if (data.success && data.html_code) {
        setGeneratedHtml(data.html_code);
        if (data.publicUrl) {
          setPublicUrl(data.publicUrl);
        }
        toast.success("Landing page gerada com sucesso!");
      } else {
        toast.error(data.error || "Falha ao gerar o site. Tente novamente.");
      }
    } catch {
      toast.error("Ocorreu um erro de conexão com a IA.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDeploy = async () => {
    if (!subdomainAvailable || !subdomain.trim() || !generatedHtml) {
      toast.error("Escolha um subdomínio válido e disponível.");
      return;
    }

    setDeploying(true);
    try {
      // Salva o rascunho do site para publicação pendente
      await fetch("/api/sites/save-pending", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subdomain: subdomain.trim(),
          htmlCode: generatedHtml,
        }),
      }).catch(() => {});

      setPublishModalOpen(false);
      toast.info("Redirecionando para a tela de pagamento...");
      window.location.href = `/checkout/transparent?type=site&subdomain=${encodeURIComponent(subdomain.trim())}`;
    } catch {
      toast.error("Erro ao conectar com o serviço de checkout.");
    } finally {
      setDeploying(false);
    }
  };

  const handleCopyLink = () => {
    if (!publicUrl) return;
    const finalUrl = publicUrl.startsWith("http")
      ? publicUrl
      : `${window.location.origin}${publicUrl}`;
    
    navigator.clipboard.writeText(finalUrl);
    setCopied(true);
    toast.success("Link do site copiado!");
    setTimeout(() => setCopied(false), 3000);
  };

  const handleOpenPublishedSite = () => {
    if (!publicUrl) return;
    const finalUrl = publicUrl.startsWith("http")
      ? publicUrl
      : `${window.location.origin}${publicUrl}`;
    window.open(finalUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header explicativo */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
            <Wand2 className="h-7 w-7 text-emerald-500" />
            Criador & Personalização do Site
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Preencha os dados do seu negócio e redes sociais. Crie uma Landing Page moderna e publique no seu subdomínio.
          </p>
        </div>

        {/* Botões de Ação do Site */}
        <div className="flex items-center gap-2 flex-wrap">
          {generatedHtml && (
            <Button
              onClick={() => setPublishModalOpen(true)}
              className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
            >
              <UploadCloud className="h-4 w-4" />
              Publicar Site
            </Button>
          )}

          {publicUrl && (
            <>
              <Button variant="outline" size="sm" onClick={handleCopyLink} className="gap-1.5 text-xs">
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copiado!" : "Copiar Link"}
              </Button>

              <Button
                size="sm"
                variant="secondary"
                className="gap-1.5 text-xs font-semibold"
                onClick={handleOpenPublishedSite}
              >
                <ExternalLink className="h-4 w-4" />
                Ver Site Publicado
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Formulário de Captação (Lado Esquerdo) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-5 w-5 text-emerald-500" />
                Informações do Negócio & Redes Sociais
              </CardTitle>
              <CardDescription className="text-xs">
                Insira as redes e dados para serem exibidos nos links do site.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleGenerate} className="space-y-4 text-xs">
                
                {/* Nome da Empresa */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-muted-foreground">Nome da Empresa / Profissional *</label>
                  <Input
                    placeholder="Ex: Clínica Dr. Lucas Silva"
                    value={nomeEmpresa}
                    onChange={(e) => setNomeEmpresa(e.target.value)}
                    required
                  />
                </div>

                {/* Nicho / Ramo */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-muted-foreground">Nicho / Ramo de Atuação *</label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                    value={ramoAtividade}
                    onChange={(e) => setRamoAtividade(e.target.value)}
                  >
                    {NICHOS_CATEGORIZADOS.map((cat) => (
                      <optgroup key={cat.categoria} label={cat.categoria}>
                        {cat.opcoes.map((op) => (
                          <option key={op} value={op}>
                            {op}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                    <option value="Outro">Outro (Digitar personalizado...)</option>
                  </select>
                </div>

                {ramoAtividade === "Outro" && (
                  <div className="space-y-1.5">
                    <label className="font-semibold text-muted-foreground">Especifique o seu Nicho *</label>
                    <Input
                      placeholder="Ex: Consultoria em TI"
                      value={ramoCustom}
                      onChange={(e) => setRamoCustom(e.target.value)}
                      required
                    />
                  </div>
                )}

                {/* WhatsApp */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-muted-foreground">WhatsApp para Contato (com DDD) *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="(11) 99999-9999"
                      value={numeroWhatsapp}
                      onChange={(e) => setNumeroWhatsapp(e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                {/* Endereço */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-muted-foreground">Endereço Completo ou Cidade</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Av. Paulista, 1000 - São Paulo, SP"
                      value={endereco}
                      onChange={(e) => setEndereco(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* REDES SOCIAIS & INTEGRACÕES */}
                <div className="pt-2 border-t border-border/60 space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Share2 className="h-3.5 w-3.5 text-emerald-500" />
                    Redes Sociais & Links (Opcional)
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                        <Instagram className="h-3 w-3 text-pink-500" />
                        Instagram
                      </label>
                      <Input
                        placeholder="@seuusuario ou https://..."
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                        className="text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                        <Video className="h-3 w-3 text-purple-500" />
                        TikTok
                      </label>
                      <Input
                        placeholder="@seuusuario"
                        value={tiktok}
                        onChange={(e) => setTiktok(e.target.value)}
                        className="text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                        <Facebook className="h-3 w-3 text-blue-500" />
                        Facebook
                      </label>
                      <Input
                        placeholder="https://facebook.com/..."
                        value={facebook}
                        onChange={(e) => setFacebook(e.target.value)}
                        className="text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-red-500" />
                        Google Maps
                      </label>
                      <Input
                        placeholder="https://maps.google.com/..."
                        value={googleMaps}
                        onChange={(e) => setGoogleMaps(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Serviços & Preços */}
                <div className="space-y-1.5 pt-2 border-t border-border/60">
                  <label className="font-semibold text-muted-foreground">Serviços / Produtos & Preços</label>
                  <Textarea
                    placeholder="Ex:&#10;- Consulta Geral: R$ 150&#10;- Tratamento Completo: R$ 400&#10;- Avaliação Grátis"
                    value={servicos}
                    onChange={(e) => setServicos(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Cor da Marca */}
                <div className="space-y-2">
                  <label className="font-semibold text-muted-foreground flex items-center gap-1.5">
                    <Palette className="h-4 w-4 text-muted-foreground" />
                    Cor Principal da Marca
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={corMarca}
                      onChange={(e) => setCorMarca(e.target.value)}
                      className="h-9 w-12 cursor-pointer rounded border border-border bg-transparent"
                    />
                    <Input
                      value={corMarca}
                      onChange={(e) => setCorMarca(e.target.value)}
                      className="font-mono text-xs max-w-[100px]"
                    />
                  </div>
                  {/* Paleta rápida */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {CORES_RECOMENDADAS.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        title={c.name}
                        onClick={() => setCorMarca(c.hex)}
                        className={`h-6 w-6 rounded-full border border-white/20 transition-transform ${corMarca === c.hex ? "scale-125 ring-2 ring-foreground" : "hover:scale-110"}`}
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                  </div>
                </div>

                {/* Descrição / Diferencial */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-muted-foreground">Descrição Breve ou Diferencial da Empresa</label>
                  <Textarea
                    placeholder="Ex: Somos uma empresa especializada com atendimento de excelência, profissionais certificados e ambiente climatizado."
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    rows={2}
                  />
                </div>

                {/* Botão Submeter */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 text-xs font-bold gap-2 bg-emerald-600 hover:bg-emerald-500 text-white mt-4"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Criando Landing Page...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Criar Site</span>
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Pré-visualização com Iframe (Lado Direito) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3">
            <div className="flex items-center gap-2 text-xs font-bold">
              <Globe className="h-4 w-4 text-emerald-500" />
              <span>Pré-visualização ao Vivo</span>
            </div>

            <div className="flex items-center gap-1 bg-muted p-1 rounded-lg border border-border">
              <button
                type="button"
                onClick={() => setViewMode("desktop")}
                className={`p-1.5 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${viewMode === "desktop" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Monitor className="h-4 w-4" />
                <span className="hidden sm:inline">Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("mobile")}
                className={`p-1.5 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${viewMode === "mobile" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Smartphone className="h-4 w-4" />
                <span className="hidden sm:inline">Mobile</span>
              </button>
            </div>
          </div>

          {/* Container do Iframe */}
          <div className="relative border border-border bg-black/90 rounded-2xl overflow-hidden shadow-xl min-h-[550px] flex items-center justify-center">
            {loading ? (
              <div className="flex flex-col items-center justify-center space-y-4 text-center p-8">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                  <Sparkles className="h-6 w-6 text-emerald-500 absolute inset-0 m-auto animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Criando seu site...</h3>
                  <p className="text-xs text-neutral-400 mt-1 max-w-sm">
                    A IA está desenvolvendo a estrutura, adicionando os botões de redes sociais e configurando o link direto de conversão.
                  </p>
                </div>
              </div>
            ) : generatedHtml ? (
              <div className={`transition-all duration-300 w-full h-[600px] flex justify-center bg-white ${viewMode === "mobile" ? "max-w-[375px] my-4 rounded-3xl border-8 border-neutral-800 shadow-2xl overflow-hidden" : "w-full"}`}>
                <iframe
                  srcDoc={generatedHtml}
                  title="Pré-visualização da Landing Page"
                  className="w-full h-full border-0"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-3 text-center p-8 text-muted-foreground">
                <Globe className="h-12 w-12 text-muted-foreground/30" />
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Nenhum site gerado ainda</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                    Preencha as informações da sua empresa e clique em "Criar Site" para visualizar a sua landing page aqui.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* CHAT DE AJUSTES & SOLICITAÇÃO DE ALTERAÇÕES DO SITE */}
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-500" />
                  Chat de Ajustes & Alterações no Site
                </span>
                {siteStatus && (
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    siteStatus === "PUBLICADO" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" :
                    siteStatus === "PENDENTE" ? "bg-amber-500/10 text-amber-500 border-amber-500/30" :
                    "bg-muted text-muted-foreground border-border"
                  }`}>
                    {siteStatus === "PUBLICADO" ? "● Site Publicado no Ar" :
                     siteStatus === "PENDENTE" ? "● Em Análise pelo Suporte" : "Rascunho"}
                  </span>
                )}
              </CardTitle>
              <CardDescription className="text-xs">
                Escreva abaixo qualquer mudança que queira fazer no site (trocar texto, fotos, cores ou botões) e envie para o suporte ajustar para você.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-[180px] overflow-y-auto rounded-xl border border-border bg-muted/30 p-3 space-y-2 text-xs">
                {chatMessages.length === 0 ? (
                  <p className="text-muted-foreground text-center py-10">
                    Nenhuma mensagem ainda. Digite sua solicitação de alteração abaixo!
                  </p>
                ) : (
                  chatMessages.map((msg: any) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2 leading-relaxed ${
                          msg.sender === "user"
                            ? "bg-emerald-600 text-white rounded-br-none"
                            : "bg-card border border-border text-foreground rounded-bl-none shadow-sm"
                        }`}
                      >
                        {msg.sender === "user" && <p className="text-[10px] font-bold opacity-80 mb-0.5">Você</p>}
                        {msg.sender === "system" && <p className="text-[10px] font-bold text-emerald-500 mb-0.5">Suporte BizAi</p>}
                        <p>{msg.text}</p>
                      </div>
                      <span className="text-[9px] text-muted-foreground mt-0.5 px-1">
                        {new Date(msg.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSendChatMessage} className="flex gap-2">
                <Input
                  placeholder="Ex: Quero trocar o título para 'Clínica Especializada' e colocar meu WhatsApp..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="text-xs"
                />
                <Button type="submit" disabled={sendingChat || !chatInput.trim()} size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-1 text-xs shrink-0">
                  {sendingChat ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Enviar Solicitação"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* MODAL: PUBLICAR E VERIFICAR SUBDOMÍNIO */}
      {publishModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setPublishModalOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <UploadCloud className="h-5 w-5 text-emerald-500" />
                Publicar Site
              </h3>
              <p className="text-xs text-muted-foreground">
                Escolha o nome do seu site para criar a URL pública.
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-muted-foreground">Nome do Subdomínio *</label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="ex: lukinhas-pet-shop"
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    className="font-mono text-xs"
                  />
                  <span className="text-xs font-mono text-muted-foreground shrink-0">.netlify.app</span>
                </div>

                {/* Feedback de Validação em Tempo Real */}
                {checkingSubdomain && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-500" />
                    <span>Verificando disponibilidade...</span>
                  </div>
                )}

                {!checkingSubdomain && subdomainAvailable === true && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Subdomínio {subdomain}.netlify.app está disponível!</span>
                  </div>
                )}

                {!checkingSubdomain && subdomainAvailable === false && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-red-500 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
                    <XCircle className="h-4 w-4 shrink-0" />
                    <span>Este subdomínio já está em uso, escolha outro.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Resumo de Ativação do Domínio */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-foreground">
                <span>Resumo da Ativação</span>
                <span className="text-emerald-500 text-sm">R$ 397,00 (Pagamento Único)</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Ativação do Domínio, Hospedagem de Alta Performance e Certificado SSL de Segurança.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="w-full text-xs"
                onClick={() => setPublishModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmDeploy}
                disabled={!subdomainAvailable || deploying || checkingSubdomain}
                className="w-full text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50"
              >
                {deploying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Gerando Checkout...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-4 w-4" />
                    <span>Pagar e Publicar</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
