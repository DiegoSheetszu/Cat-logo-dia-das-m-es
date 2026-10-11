import Image from "next/image";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { getSupabaseConfig } from "@/lib/supabase/config";

export const metadata = { title: "Criar nova senha" };

export default function ResetPasswordPage() {
  return (
    <main className="login-screen">
      <div className="login-layout">
        <section className="login-story" aria-label="Doçuras da Lara">
          <Image className="login-logo" src="/brand/logo-docuras-da-lara.jpeg" alt="Logo Doçuras da Lara" width={64} height={64} priority />
          <div>
            <h2>Sua conta, protegida.</h2>
            <p>Escolha uma nova senha para continuar cuidando das encomendas.</p>
          </div>
        </section>
        <section className="login-panel">
          <div className="login-heading">
            <p className="eyebrow">Acesso da equipe</p>
            <h1>Crie uma nova senha</h1>
            <p>Use pelo menos 8 caracteres e confirme a senha escolhida.</p>
          </div>
          <ResetPasswordForm configured={Boolean(getSupabaseConfig())} />
        </section>
      </div>
    </main>
  );
}
