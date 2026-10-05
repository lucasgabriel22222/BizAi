import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardLayoutClient } from "@/components/layout/dashboard-layout-client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { subscription: true },
  });

  if (!user) redirect("/login");

  let activePlan = "Starter";
  let subscriptionStatus = "trial";

  if (user.ownerId) {
    const ownerSub = await prisma.subscription.findUnique({
      where: { userId: user.ownerId },
    });
    if (ownerSub) {
      activePlan = ownerSub.plan;
      subscriptionStatus = ownerSub.status;
    }
  } else if (user.subscription) {
    activePlan = user.subscription.plan;
    subscriptionStatus = user.subscription.status;
  }

  return (
    <DashboardLayoutClient
      userName={user.name}
      userEmail={user.email}
      userSlug={user.slug}
      userRole={user.role}
      activePlan={activePlan}
      subscriptionStatus={subscriptionStatus}
    >
      {children}
    </DashboardLayoutClient>
  );
}
