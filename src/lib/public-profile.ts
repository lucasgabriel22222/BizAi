import { prisma } from "./prisma";
import { ReviewStatus } from "@prisma/client";
import { mergeLandingConfig } from "./landing-defaults";
import type { PublicLandingData } from "./landing-types";

export async function getPublicProfile(slug: string): Promise<PublicLandingData | null> {
  const user = await prisma.user.findUnique({
    where: { slug },
    include: {
      settings: true,
      reviews: {
        where: { status: ReviewStatus.APPROVED },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          authorName: true,
          rating: true,
          comment: true,
          createdAt: true,
        },
      },
    },
  });

  if (!user || user.settings?.landingPublished === false) {
    return null;
  }

  const officeLine = [
    user.settings?.officeAddress,
    user.settings?.officeCity,
    user.settings?.officeState,
  ]
    .filter(Boolean)
    .join(", ");

  const config = mergeLandingConfig(user.settings?.landingConfig, user.name, user.specialty);

  if (officeLine && config.booking.info[0]) {
    config.booking.info[0].subtitle = officeLine;
  }

  if (user.settings?.defaultDuration) {
    const dur = `${user.settings.defaultDuration} minutos por sessão`;
    if (config.booking.info[2]) config.booking.info[2].subtitle = dur;
  }

  if (user.settings?.education && config.credentials[0]) {
    config.credentials[0].value = user.settings.education;
  }
  if (user.settings?.specializationText && config.credentials[1]) {
    config.credentials[1].value = user.settings.specializationText;
  }
  if (config.profileCard.crp && user.settings) {
    config.profileCard.crp = config.profileCard.crp;
  }

  return {
    name: user.name,
    specialty: user.specialty,
    slug: user.slug,
    avatar: user.avatar,
    config,
    reviews: user.reviews.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    })),
    defaultPrice: user.settings?.defaultPrice ?? 200,
    defaultDuration: user.settings?.defaultDuration ?? 50,
  };
}
