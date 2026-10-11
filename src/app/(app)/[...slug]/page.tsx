import { notFound } from "next/navigation";
import { WorkspaceModule } from "@/components/workspace/workspace-module";
import { requireMembership } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { loadWorkspaceData } from "@/lib/workspace/queries";

const modules = new Set([
  "products", "technical-sheets", "categories", "orders", "agenda", "production", "supplies", "suppliers",
  "purchases", "inventory", "customers", "campaigns", "finance", "revenue", "expenses", "cash-flow", "analytics", "sales", "settings", "more",
]);

export default async function ModulePage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const key = slug[0];
  if (!key || !modules.has(key) || (slug.length > 1 && !(slug.length === 2 && slug[1] === "new" && ["orders", "sales", "production", "purchases", "expenses"].includes(key)))) notFound();

  const access = await requireMembership();
  if (access.status !== "ready") notFound();
  const client = await createClient();
  if (!client) notFound();
  const data = await loadWorkspaceData(client, access.membership.organizationId, key, access.user.id);
  return <WorkspaceModule data={data} />;
}
