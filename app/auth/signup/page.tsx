import { AuthShell } from "@/components/shared/auth-shell";
import { SignupForm } from "@/components/account/signup-form";

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your account"
      description="Join MWANGIZ Cosmetics to enjoy faster checkout and order tracking."
      alternateLabel="Already have an account?"
      alternateHref="/auth/login"
    >
      <SignupForm />
    </AuthShell>
  );
}
