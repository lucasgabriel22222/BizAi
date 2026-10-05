import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsView } from "@/components/settings/settings-view";

export default async function SitePage() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return null;

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      settings: true,
      galleryImages: { orderBy: { sortOrder: "asc" } },
      reviews: { orderBy: { createdAt: "desc" } },
      subscription: true,
    },
  });

  if (!user) return null;

  return (
    <SettingsView
      user={{
        ...user,
        reviews: user.reviews.map((r) => ({
          ...r,
          createdAt: r.createdAt.toISOString(),
        })),
      }}
    />
  );
}
