import Image from "next/image";
import { LoginForm } from "@/components/auth/login-form";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata = { title: "Entrar" };

export default async function LoginPage() {
  const configured = Boolean(getSupabaseConfig());
  const supabase = await createClient();

  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) redirect("/");
  }

  return (
    <main className="login-screen">
      <div className="login-layout">
        <section className="login-story" aria-label="Doçuras da Lara">
          <div>
            <Image
              className="login-logo"
              src="/brand/logo-docuras-da-lara.jpeg"
              alt="Logo Doçuras da Lara"
              width={64}
              height={64}
              priority
            />
          </div>
          <div>
            <h2>Transformamos momentos em doces lembranças.</h2>
            <p>Um espaço organizado para cuidar de cada encomenda com capricho.</p>
          </div>
        </section>
        <section className="login-panel">
          <div className="login-heading">
            <p className="eyebrow">Acesso da equipe</p>
            <h1>Bem-vinda de volta</h1>
            <p>Entre para consultar a rotina e cuidar das encomendas.</p>
          </div>
          <LoginForm configured={configured} />
        </section>
      </div>
    </main>
  );
}
