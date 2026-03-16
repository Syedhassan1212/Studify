"use server";

import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export type AuthState = {
  error?: string;
  message?: string;
};

export async function signIn(_: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function signUp(_: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await supabaseServer();
  const { error, data } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: error.message };
  }

  if (data?.session) {
    redirect("/dashboard");
  }

  // If email confirmation is disabled, some setups still require a manual sign-in.
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    return {
      message:
        "Account created. Please confirm your email (if required) and then sign in.",
    };
  }

  redirect("/dashboard");
}
