"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await createClient();

  if (supabase) {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error("Não foi possível encerrar a sessão.");
    }
  }

  redirect("/login");
}
