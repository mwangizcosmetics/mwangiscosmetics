"use client";

import type { LoginFormValues, SignupFormValues } from "@/lib/validators/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

export async function signInWithEmail(values: LoginFormValues) {
  const supabase = getSupabaseBrowserClient();
  return supabase.auth.signInWithPassword({
    email: values.email,
    password: values.password,
  });
}

export async function signUpWithEmail(values: SignupFormValues) {
  const supabase = getSupabaseBrowserClient();
  return supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      data: {
        full_name: values.fullName,
        phone: values.phone,
      },
    },
  });
}

export async function signOut() {
  const supabase = getSupabaseBrowserClient();
  return supabase.auth.signOut();
}
