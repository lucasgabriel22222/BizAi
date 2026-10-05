import { prisma } from "@/lib/prisma";
import { createToken, hashPassword, setSessionCookie } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { randomBytes } from "crypto";
import { sanitizeText } from "@/lib/auth-security";

interface SyncUserInput {
  email: string;
  name: string;
  slug?: string;
  specialty?: string;
}

export async function syncPrismaUserAndSession(input: SyncUserInput) {
  const email = input.email.trim().toLowerCase();
  const name = sanitizeText(input.name, 120);
  let slug = input.slug ? slugify(input.slug) : slugify(name);

  if (!slug) slug = `user-${Date.now()}`;

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    const slugTaken = await prisma.user.findUnique({ where: { slug } });
    if (slugTaken) slug = `${slug}-${Date.now().toString(36)}`;

    const randomPassword = randomBytes(32).toString("hex");
    user = await prisma.user.create({
      data: {
        name,
        email,
        password: await hashPassword(randomPassword),
        slug,
        specialty: sanitizeText(input.specialty || "Psicologia", 80),
        settings: { create: {} },
      },
    });
  } else if (input.slug) {
    const desired = slugify(input.slug);
    const taken = await prisma.user.findFirst({
      where: { slug: desired, NOT: { id: user.id } },
    });
    if (!taken && desired) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { slug: desired },
      });
    }
  }

  const token = await createToken({
    userId: user.id,
    email: user.email,
    name: user.name,
  });

  await setSessionCookie(token);

  return user;
}
