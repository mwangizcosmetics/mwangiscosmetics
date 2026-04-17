import { Suspense } from "react";

import { AdminAccessForm } from "@/components/admin/admin-access-form";
import { AuthShell } from "@/components/shared/auth-shell";

export default function AdminAccessPage() {
  return (
    <AuthShell
      title="Admin Access Link"
      description="Enter the authorized admin email to receive a secure sign-in link."
      alternateLabel="Need regular account login?"
      alternateHref="/auth/login"
    >
      <Suspense fallback={null}>
        <AdminAccessForm />
      </Suspense>
    </AuthShell>
  );
}
