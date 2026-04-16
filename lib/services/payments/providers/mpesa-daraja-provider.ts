import { initiateDarajaStkPush } from "@/lib/services/payments/daraja";
import type {
  PaymentInitiationRequest,
  PaymentInitiationResult,
  PaymentProviderAdapter,
} from "@/lib/services/payments/types";

export const mpesaDarajaProvider: PaymentProviderAdapter = {
  provider: "mpesa_daraja",
  supports(method) {
    return method === "mpesa";
  },
  async initiatePayment(
    request: PaymentInitiationRequest,
  ): Promise<PaymentInitiationResult> {
    if (!request.phone) {
      return {
        ok: false,
        status: "failed",
        errorMessage: "Phone number is required for M-Pesa STK push.",
      };
    }

    const result = await initiateDarajaStkPush({
      amount: request.amount,
      phone: request.phone,
      accountReference: request.accountReference,
      transactionDesc:
        request.description ?? `MWANGIZ ${request.orderId.slice(-6)}`,
      callbackUrl: request.callbackUrl,
    });

    if (!result.ok) {
      return {
        ok: false,
        status: "failed",
        errorMessage: result.errorMessage ?? "Failed to initiate STK push.",
        rawResponse: result.rawResponse,
      };
    }

    return {
      ok: true,
      status: result.mocked ? "success" : "pending",
      mocked: result.mocked,
      checkoutRequestId: result.checkoutRequestId,
      merchantRequestId: result.merchantRequestId,
      customerMessage: result.customerMessage,
      rawResponse: result.rawResponse,
    };
  },
};

