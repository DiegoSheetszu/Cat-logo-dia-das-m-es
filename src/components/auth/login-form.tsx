"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginSchema, type LoginValues } from "@/lib/auth/schemas";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginValues) {
    const supabase = createClient();

    if (!supabase) {
      setFormError("O acesso ainda não foi conectado ao Supabase. Configure as variáveis de ambiente para entrar.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    const { error } = await supabase.auth.signInWithPassword(values);

    if (error) {
      setFormError("Não foi possível entrar. Confira o e-mail e a senha ou fale com o administrador.");
      setIsSubmitting(false);
      return;
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
      {!configured && (
        <div className="inline-notice" role="status">
          O Supabase ainda não está configurado. Configure o acesso para entrar no sistema.
        </div>
      )}
      <label>
        E-mail
        <input autoComplete="email" type="email" {...register("email")} />
        {errors.email && <small className="field-error">{errors.email.message}</small>}
      </label>
      <label>
        Senha
        <input autoComplete="current-password" type="password" {...register("password")} />
        {errors.password && <small className="field-error">{errors.password.message}</small>}
      </label>
      {formError && <p className="form-error" role="alert">{formError}</p>}
      <button className="primary-button login-submit" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Entrando..." : "Entrar no sistema"}
      </button>
    </form>
  );
}
