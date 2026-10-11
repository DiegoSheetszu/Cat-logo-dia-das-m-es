import { AppShell } from "@/components/shared/app-shell";
import { SetupNotice } from "@/components/shared/setup-notice";
import { requireMembership } from "@/lib/auth/session";
import Link from "next/link";
import { signOut } from "@/app/actions/auth";

export default async function ProtectedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const access = await requireMembership();

  if (access.status === "setup-required") {
    return <SetupNotice title="Falta conectar o espaço de trabalho" message="A estrutura do sistema está pronta. Para acessar as telas internas, conecte o projeto Supabase seguindo as etapas abaixo." />;
  }

  if (access.status === "membership-required") {
    return (
      <main className="setup-screen">
        <section className="setup-card">
          <p className="eyebrow">Acesso da equipe</p>
          <h1>Seu acesso está sendo preparado.</h1>
          <p>A conta {access.email} foi autenticada, mas ainda não está associada à organização Doçuras da Lara. Peça ao administrador para concluir a configuração do perfil.</p>
          <Link className="text-link" href="/login">Voltar para a entrada</Link>
        </section>
      </main>
    );
  }

  const fullName = access.profile.full_name;
  const userName = typeof fullName === "string" && fullName.trim()
    ? fullName.trim()
    : access.user.email ?? "Equipe";

  return (
    <AppShell userName={userName} organizationName={access.membership.organizationName} signOutAction={signOut}>
      {children}
    </AppShell>
  );
}
