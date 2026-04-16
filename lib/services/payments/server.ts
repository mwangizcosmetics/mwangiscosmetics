import { mpesaDarajaProvider } from "@/lib/services/payments/providers/mpesa-daraja-provider";
import type {
  PaymentInitiationRequest,
  PaymentInitiationResult,
  PaymentProviderAdapter,
} from "@/lib/services/payments/types";

const providers: PaymentProviderAdapter[] = [mpesaDarajaProvider];

export async function initiatePaymentWithProvider(
  request: PaymentInitiationRequest,
): Promise<PaymentInitiationResult> {
  const provider = providers.find((candidate) => candidate.provider === request.provider);
  if (!provider) {
    return {
      ok: false,
      status: "failed",
      errorMessage: `Payment provider ${request.provider} is not configured.`,
    };
  }

  if (!provider.supports(request.method)) {
    return {
      ok: false,
      status: "failed",
      errorMessage: `${request.method} is not supported by ${request.provider}.`,
    };
  }

  return provider.initiatePayment(request);
}

