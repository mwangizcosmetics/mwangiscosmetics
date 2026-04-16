import type { Json } from "@/lib/supabase/database.types";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role-client";

interface CallbackVerificationResult {
  valid: boolean;
  reason?: string;
}

interface CallbackProcessResult {
  ok: boolean;
  status:
    | "processed_success"
    | "processed_failed"
    | "duplicate"
    | "payment_not_found"
    | "invalid_payload"
    | "rejected"
    | "rpc_error";
  raw?: Record<string, unknown>;
}

function getCallbackTokenFromRequest(request: Request) {
  const url = new URL(request.url);
  const tokenFromQuery = url.searchParams.get("token");
  const tokenFromHeader = request.headers.get("x-mwangiz-callback-token");
  return tokenFromHeader ?? tokenFromQuery ?? "";
}

export function verifyMpesaCallbackRequest(request: Request): CallbackVerificationResult {
  const expectedSecret = process.env.MPESA_CALLBACK_SECRET;
  if (!expectedSecret) {
    return { valid: true };
  }

  const actualToken = getCallbackTokenFromRequest(request);
  if (!actualToken || actualToken !== expectedSecret) {
    return {
      valid: false,
      reason: "Invalid callback secret token.",
    };
  }

  return { valid: true };
}

export async function processMpesaCallbackPayload(input: {
  payload: unknown;
  securityValid: boolean;
  rejectionReason?: string;
}): Promise<CallbackProcessResult> {
  try {
    const supabase = getSupabaseServiceRoleClient();
    const { data, error } = await supabase.rpc("process_mpesa_callback", {
      p_payload: (input.payload ?? {}) as Json,
      p_security_valid: input.securityValid,
      p_rejection_reason: input.rejectionReason ?? null,
    });

    if (error) {
      console.error("Mpesa callback RPC failure", {
        error: error.message,
      });
      return {
        ok: false,
        status: "rpc_error",
      };
    }

    const normalized = (data ?? {}) as Record<string, unknown>;
    const status = (normalized.status ?? "rpc_error") as CallbackProcessResult["status"];
    const ok = Boolean(normalized.ok);

    return {
      ok,
      status,
      raw: normalized,
    };
  } catch (error) {
    console.error("Mpesa callback processing exception", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return {
      ok: false,
      status: "rpc_error",
    };
  }
}
