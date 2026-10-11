import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireMembership() {
  const supabase = await createClient();

  if (!supabase) {
    return { status: "setup-required" as const };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: memberships, error: membershipError } = await supabase
    .from("organization_memberships")
    .select("organization_id, role")
    .eq("user_id", user.id)
    .limit(1);

  if (membershipError) {
    throw new Error("Não foi possível carregar o acesso da sua conta.");
  }

  const membership = memberships?.[0];

  if (!membership) {
    return { status: "membership-required" as const, email: user.email ?? "" };
  }

  const [organizationResult, profileResult] = await Promise.all([
    supabase
      .from("organizations")
      .select("name")
      .eq("id", membership.organization_id)
      .single(),
    supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", user.id)
      .single(),
  ]);

  if (organizationResult.error || profileResult.error) {
    throw new Error("Não foi possível carregar o perfil da equipe.");
  }

  return {
    status: "ready" as const,
    user,
    profile: profileResult.data,
    membership: {
      organizationId: membership.organization_id,
      role: membership.role,
      organizationName: organizationResult.data.name,
    },
  };
}
