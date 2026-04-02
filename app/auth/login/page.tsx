import { Suspense } from "react";

import { AuthShell } from "@/components/shared/auth-shell";
import { LoginForm } from "@/components/account/login-form";

export default function LoginPage() {
  return (
    <AuthShell
      title="Sign in to your account"
      description="Access your beauty bag, orders, wishlist, and saved addresses."
      alternateLabel="New to MWANGIZ?"
      alternateHref="/auth/signup"
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
