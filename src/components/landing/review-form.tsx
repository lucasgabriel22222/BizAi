"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Star } from "lucide-react";
import { reviewSchema, type ReviewInput } from "@/lib/validators";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ReviewFormProps {
  slug: string;
  onSuccess?: () => void;
  variant?: "default" | "landing";
}

export function ReviewForm({ slug, onSuccess, variant = "default" }: ReviewFormProps) {
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(5);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { slug, rating: 5 },
  });

  const onSubmit = async (data: ReviewInput) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/public/${slug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, rating, slug }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success("Obrigado pelo seu feedback!");
      reset();
      setRating(5);
      onSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar feedback");
    } finally {
      setLoading(false);
    }
  };

  const isLanding = variant === "landing";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn(
        "space-y-4 rounded-2xl p-6",
        isLanding ? "pl-review-form" : "border border-border/50 bg-card/80"
      )}
    >
      <p className={cn("text-sm", isLanding ? "pl-review-hint" : "text-muted-foreground")}>
        Apenas pacientes com consulta concluída podem avaliar (mesmo CPF e email do cadastro).
      </p>

      <div>
        <label className="mb-2 block text-sm font-medium">Sua nota</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => {
                setRating(n);
                setValue("rating", n);
              }}
              className="rounded-lg p-1 transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  "h-8 w-8",
                  n <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"
                )}
              />
            </button>
          ))}
        </div>
      </div>

      <Input label="Nome completo" error={errors.name?.message} {...register("name")} />
      <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
      <Input label="CPF" error={errors.cpf?.message} {...register("cpf")} />
      <Textarea
        label="Seu comentário sobre o atendimento"
        placeholder="Conte como foi sua experiência (mínimo 10 caracteres)"
        error={errors.comment?.message}
        {...register("comment")}
      />

      <Button type="submit" className="w-full" loading={loading}>
        Enviar feedback
      </Button>
    </form>
  );
}
