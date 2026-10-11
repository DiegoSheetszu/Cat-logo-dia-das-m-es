"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function ResetPasswordForm({ configured }: { configured: boolean }) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updated, setUpdated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    if (password !== confirmation) {
      setError("As senhas não coincidem.");
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setError("O serviço de acesso ainda não está configurado.");
      return;
    }

    setIsSubmitting(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setIsSubmitting(false);

    if (updateError) {
      setError("O link é inválido ou expirou. Solicite uma nova recuperação de senha.");
      return;
    }

    setMessage("Senha atualizada. Você já pode entrar com a nova senha.");
    await supabase.auth.signOut({ scope: "local" });
    setUpdated(true);
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      {!configured && <div className="inline-notice" role="status">O acesso ainda não foi conectado ao Supabase.</div>}
      <label>
        Nova senha
        <input
          autoComplete="new-password"
          minLength={8}
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
      </label>
      <label>
        Confirme a nova senha
        <input
          autoComplete="new-password"
          minLength={8}
          onChange={(event) => setConfirmation(event.target.value)}
          required
          type="password"
          value={confirmation}
        />
      </label>
      {message && <p className="auth-feedback" role="status">{message}</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
      {!updated && (
        <button className="login-submit" disabled={isSubmitting || !configured} type="submit">
          {isSubmitting ? "Salvando..." : "Salvar nova senha"}
        </button>
      )}
      <Link className="text-link" href="/login">{updated ? "Ir para entrar" : "Voltar para entrar"}</Link>
    </form>
  );
}
