"use client";

import { useState } from "react";
import Image from "next/image";
import { Trash2, Plus, ImageIcon, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface GalleryImage {
  id: string;
  imageUrl: string;
  caption?: string | null;
}

interface GallerySettingsTabProps {
  initialImages: GalleryImage[];
}

export function GallerySettingsTab({ initialImages }: GallerySettingsTabProps) {
  const [images, setImages] = useState(initialImages);
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const addImageFromUrl = async (imageUrl: string) => {
    const res = await fetch("/api/settings/gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl, caption: caption || undefined }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setImages((prev) => [...prev, data.image]);
    setCaption("");
    return data.image as GalleryImage;
  };

  const addImage = async () => {
    if (!url.trim()) {
      toast.error("Informe a URL da imagem");
      return;
    }
    setLoading(true);
    try {
      await addImageFromUrl(url.trim());
      setUrl("");
      toast.success("Imagem adicionada!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao adicionar");
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File) => {
    if (images.length >= 12) {
      toast.error("Máximo de 12 imagens na galeria");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/settings/gallery/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error);

      await addImageFromUrl(uploadData.imageUrl);
      toast.success("Imagem enviada e adicionada!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar imagem");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (id: string) => {
    const res = await fetch(`/api/settings/gallery/${id}`, { method: "DELETE" });
    if (res.ok) {
      setImages((prev) => prev.filter((i) => i.id !== id));
      toast.success("Imagem removida");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-brand-purple" />
          Galeria de fotos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Adicione fotos do consultório, da equipe ou imagens que representem seu trabalho (máx. 12).
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="URL da imagem"
            placeholder="https://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <Input
            label="Legenda (opcional)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={addImage} loading={loading} disabled={images.length >= 12}>
            <Plus className="h-4 w-4" />
            Adicionar por link
          </Button>
          <label className="inline-flex">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void uploadFile(file);
                e.currentTarget.value = "";
              }}
              disabled={uploading || images.length >= 12}
            />
            <span className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-border/50 bg-background/50 px-4 py-2 text-sm font-medium">
              <Upload className="h-4 w-4" />
              {uploading ? "Enviando..." : "Enviar do dispositivo"}
            </span>
          </label>
        </div>
        <p className="text-xs text-muted-foreground">
          No celular, toque em &quot;Enviar do dispositivo&quot; para escolher da galeria ou tirar foto.
        </p>

        {images.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((img) => (
              <div
                key={img.id}
                className="relative aspect-video overflow-hidden rounded-xl border border-border/50"
              >
                <Image src={img.imageUrl} alt="" fill className="object-cover" unoptimized />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute right-2 top-2 h-8 w-8"
                  onClick={() => removeImage(img.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                {img.caption && (
                  <p className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-xs text-white">
                    {img.caption}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
