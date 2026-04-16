import type { CurrencyCode, PaymentMethod, PaymentProvider } from "@/lib/types/ecommerce";

export interface PaymentInitiationRequest {
  method: PaymentMethod;
  provider: PaymentProvider;
  amount: number;
  currency: CurrencyCode;
  phone?: string;
  orderId: string;
  accountReference: string;
  description?: string;
  callbackUrl: string;
}

export interface PaymentInitiationResult {
  ok: boolean;
  status: "pending" | "success" | "failed";
  mocked?: boolean;
  checkoutRequestId?: string;
  merchantRequestId?: string;
  providerReference?: string;
  customerMessage?: string;
  rawResponse?: Record<string, unknown>;
  errorMessage?: string;
}

export interface PaymentProviderAdapter {
  provider: PaymentProvider;
  supports(method: PaymentMethod): boolean;
  initiatePayment(request: PaymentInitiationRequest): Promise<PaymentInitiationResult>;
}

