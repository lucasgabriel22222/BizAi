"use client";

import { useState } from "react";
import { Star, Trash2, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface Review {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  status: string;
  createdAt: string;
}

interface ReviewsSettingsTabProps {
  initialReviews: Review[];
}

export function ReviewsSettingsTab({ initialReviews }: ReviewsSettingsTabProps) {
  const [reviews, setReviews] = useState(initialReviews);

  const removeReview = async (id: string) => {
    if (!confirm("Excluir este feedback da sua página?")) return;
    const res = await fetch(`/api/settings/reviews/${id}`, { method: "DELETE" });
    if (res.ok) {
      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast.success("Feedback removido");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-brand-purple" />
          Feedbacks dos pacientes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Apenas pacientes com consulta concluída podem avaliar. Comentários com linguagem
          inadequada são bloqueados automaticamente.
        </p>

        {reviews.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">Nenhum feedback ainda</p>
        ) : (
          reviews.map((r) => (
            <div
              key={r.id}
              className="flex flex-col gap-3 rounded-xl border border-border/50 p-4 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{r.authorName}</p>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className={cn(
                          "h-3.5 w-3.5",
                          n <= r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
                        )}
                      />
                    ))}
                  </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
                <p className="mt-2 text-xs text-muted-foreground/60">
                  {format(new Date(r.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive shrink-0"
                onClick={() => removeReview(r.id)}
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
