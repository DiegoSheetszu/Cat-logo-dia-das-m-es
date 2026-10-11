import Image from "next/image";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { getSupabaseConfig } from "@/lib/supabase/config";

export const metadata = { title: "Recuperar senha" };

export default function ForgotPasswordPage() {
  return (
    <main className="login-screen">
      <div className="login-layout">
        <section className="login-story" aria-label="Doçuras da Lara">
          <Image className="login-logo" src="/brand/logo-docuras-da-lara.jpeg" alt="Logo Doçuras da Lara" width={64} height={64} priority />
          <div>
            <h2>Um novo começo, com carinho.</h2>
            <p>Vamos ajudar você a recuperar o acesso ao sistema.</p>
          </div>
        </section>
        <section className="login-panel">
          <div className="login-heading">
            <p className="eyebrow">Acesso da equipe</p>
            <h1>Recuperar senha</h1>
            <p>Informe seu e-mail e enviaremos um link para cadastrar uma nova senha.</p>
          </div>
          <ForgotPasswordForm configured={Boolean(getSupabaseConfig())} />
        </section>
      </div>
    </main>
  );
}
