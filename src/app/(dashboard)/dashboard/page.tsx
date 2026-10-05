import { getCurrentUser } from "@/lib/auth";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return <DashboardContent userSlug={user.slug} />;
}
