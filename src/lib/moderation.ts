const BLOCKED_PATTERNS = [
  /\b(porra|caralho|merda|buceta|puta|fdp|vsf|viado|arrombad|idiota|imbecil)\b/gi,
  /\b(fuck|shit|bitch|asshole|dick|pussy)\b/gi,
  /(http|https):\/\//gi,
  /<script/gi,
];

const SPAM_PATTERNS = [
  /(.)\1{6,}/,
  /[A-Z]{12,}/,
  /\d{10,}/,
];

export interface ModerationResult {
  allowed: boolean;
  reason?: string;
}

export function moderateReviewComment(comment: string): ModerationResult {
  const trimmed = comment.trim();

  if (trimmed.length < 10) {
    return { allowed: false, reason: "O comentário deve ter pelo menos 10 caracteres." };
  }

  if (trimmed.length > 800) {
    return { allowed: false, reason: "O comentário é muito longo (máximo 800 caracteres)." };
  }

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        allowed: false,
        reason: "Seu comentário contém linguagem inadequada e não foi publicado.",
      };
    }
  }

  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        allowed: false,
        reason: "Seu comentário parece spam e não foi publicado.",
      };
    }
  }

  return { allowed: true };
}

export function maskAuthorName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Paciente";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1].charAt(0).toUpperCase()}.`;
}
