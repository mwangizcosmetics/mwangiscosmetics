"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { signInWithEmail } from "@/lib/supabase/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { loginSchema, type LoginFormValues } from "@/lib/validators/auth";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  const [rememberMe, setRememberMe] = useState(true);

  const onSubmit = async (values: LoginFormValues) => {
    const { error } = await signInWithEmail(values);

    if (error) {
      toast.error(error.message || "Unable to log in right now");
      return;
    }

    toast.success("Welcome back to MWANGIZ Cosmetics");
    const nextPath = searchParams.get("next");
    let fallbackPath = "/account";

    if (!nextPath) {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const isAdminFromMetadata =
          user.app_metadata?.role === "admin" ||
          user.user_metadata?.role === "admin" ||
          user.user_metadata?.is_admin === true;

        if (isAdminFromMetadata) {
          fallbackPath = "/admin";
        } else {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .maybeSingle();

          if (profile?.role === "admin") {
            fallbackPath = "/admin";
          }
        }
      }
    }

    router.push(nextPath || fallbackPath);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
        {errors.email ? <p className="text-xs text-[#a11f2f]">{errors.email.message}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" placeholder="Enter your password" {...register("password")} />
        {errors.password ? <p className="text-xs text-[#a11f2f]">{errors.password.message}</p> : null}
      </div>
      <div className="flex items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
          <Checkbox
            checked={rememberMe}
            onCheckedChange={(checked) => {
              const nextValue = Boolean(checked);
              setRememberMe(nextValue);
              setValue("rememberMe", nextValue);
            }}
          />
          Remember me
        </label>
        <Link href="/auth/signup" className="text-sm font-medium text-[var(--brand-900)] hover:text-[var(--brand-700)]">
          Forgot password?
        </Link>
      </div>
      <Button type="submit" className="h-11 w-full rounded-full" disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}
