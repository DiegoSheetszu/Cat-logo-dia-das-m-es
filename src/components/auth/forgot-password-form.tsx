"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm({ configured }: { configured: boolean }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    const supabase = createClient();
    if (!supabase) {
      setError("O serviço de acesso ainda não está configurado.");
      return;
    }

    setIsSubmitting(true);
    const { error: requestError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setIsSubmitting(false);

    if (requestError) {
      setError("Não foi possível enviar o link. Confira o e-mail e tente novamente.");
      return;
    }

    setMessage("Se este e-mail estiver cadastrado, você receberá um link para criar uma nova senha.");
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      {!configured && <div className="inline-notice" role="status">O acesso ainda não foi conectado ao Supabase.</div>}
      <label>
        E-mail cadastrado
        <input
          autoComplete="email"
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
      </label>
      {message && <p className="auth-feedback" role="status">{message}</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="login-submit" disabled={isSubmitting || !configured} type="submit">
        {isSubmitting ? "Enviando link..." : "Enviar link de recuperação"}
      </button>
      <Link className="text-link" href="/login">Voltar para entrar</Link>
    </form>
  );
}
