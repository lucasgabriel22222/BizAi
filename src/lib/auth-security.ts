/**
 * Anti-abuse helpers — prepared for Redis/Upstash in production.
 */

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "tempmail.com",
  "10minutemail.com",
  "yopmail.com",
  "throwaway.email",
  "fakeinbox.com",
  "trashmail.com",
  "getnada.com",
  "maildrop.cc",
  "dispostable.com",
  "temp-mail.org",
]);

type RateBucket = { count: number; resetAt: number };
const rateBuckets = new Map<string, RateBucket>();

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isGmailAlias(email: string) {
  const normalized = normalizeEmail(email);
  const [local, domain] = normalized.split("@");
  if (!local || !domain) return false;
  if (domain !== "gmail.com" && domain !== "googlemail.com") return false;
  return local.includes("+");
}

export function isDisposableEmail(email: string) {
  const normalized = normalizeEmail(email);
  const domain = normalized.split("@")[1];
  if (!domain) return true;
  return DISPOSABLE_DOMAINS.has(domain);
}

export function validateSignupEmail(email: string): string | null {
  const normalized = normalizeEmail(email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return "Email inválido";
  }
  if (isGmailAlias(normalized)) {
    return "Aliases com '+' no Gmail não são permitidos";
  }
  if (isDisposableEmail(normalized)) {
    return "Emails temporários não são permitidos";
  }
  return null;
}

export function sanitizeText(input: string, max = 200) {
  return input.replace(/[<>]/g, "").trim().slice(0, max);
}

export function checkRateLimit(
  key: string,
  limit = 10,
  windowMs = 60_000
): { ok: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const bucket = rateBuckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (bucket.count >= limit) {
    return { ok: false, retryAfterMs: bucket.resetAt - now };
  }

  bucket.count += 1;
  return { ok: true };
}

export function getClientIp(headers: Headers) {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}
