import { NextResponse } from "next/server";

import {
  processMpesaCallbackPayload,
  verifyMpesaCallbackRequest,
} from "@/lib/services/payments/callback";

function accepted() {
  return NextResponse.json({
    ResultCode: 0,
    ResultDesc: "Accepted",
  });
}

export async function POST(request: Request) {
  let payload: unknown = {};
  try {
    payload = await request.json();
  } catch {
    const processed = await processMpesaCallbackPayload({
      payload: {},
      securityValid: false,
      rejectionReason: "Malformed callback JSON body.",
    });

    if (process.env.NODE_ENV !== "production") {
      console.warn("Rejected malformed M-Pesa callback", processed.status);
    }

    return NextResponse.json(
      {
        ResultCode: 1,
        ResultDesc: "Invalid callback payload",
      },
      { status: 400 },
    );
  }

  const verification = verifyMpesaCallbackRequest(request);
  const processed = await processMpesaCallbackPayload({
    payload,
    securityValid: verification.valid,
    rejectionReason: verification.reason,
  });

  if (!verification.valid) {
    console.warn("Rejected M-Pesa callback due to invalid secret token.");
    return NextResponse.json(
      {
        ResultCode: 1,
        ResultDesc: "Unauthorized callback",
      },
      { status: 401 },
    );
  }

  if (processed.status === "rpc_error") {
    console.error("M-Pesa callback processing RPC error.");
    return NextResponse.json(
      {
        ResultCode: 1,
        ResultDesc: "Temporary processing error",
      },
      { status: 500 },
    );
  }

  if (process.env.NODE_ENV !== "production" && processed.status !== "processed_success") {
    console.info("Processed M-Pesa callback with non-success status", processed);
  }

  // Daraja expects a quick acknowledgment response.
  return accepted();
}
