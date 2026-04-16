import { Buffer } from "node:buffer";

interface DarajaCredentials {
  consumerKey: string;
  consumerSecret: string;
  shortCode: string;
  passKey: string;
  callbackUrl?: string;
  mode: "sandbox" | "live";
}

interface StkPushInput {
  amount: number;
  phone: string;
  accountReference: string;
  transactionDesc: string;
  callbackUrl: string;
}

export interface DarajaStkPushResult {
  ok: boolean;
  mocked?: boolean;
  checkoutRequestId?: string;
  merchantRequestId?: string;
  customerMessage?: string;
  rawResponse?: Record<string, unknown>;
  errorMessage?: string;
}

function getDarajaBaseUrl(mode: DarajaCredentials["mode"]) {
  return mode === "live"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";
}

function getTimestamp() {
  const now = new Date();
  const yyyy = now.getFullYear().toString();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const sec = String(now.getSeconds()).padStart(2, "0");
  return `${yyyy}${mm}${dd}${hh}${min}${sec}`;
}

export function normalizeKenyanPhone(phone: string) {
  const cleaned = phone.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+254")) {
    return `254${cleaned.slice(4)}`;
  }
  if (cleaned.startsWith("254")) {
    return cleaned;
  }
  if (cleaned.startsWith("0")) {
    return `254${cleaned.slice(1)}`;
  }
  return cleaned;
}

function getCredentials(): DarajaCredentials | null {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  const shortCode = process.env.MPESA_SHORTCODE;
  const passKey = process.env.MPESA_PASSKEY;
  const callbackUrl = process.env.MPESA_CALLBACK_URL;
  const mode = process.env.MPESA_ENV === "live" ? "live" : "sandbox";

  if (!consumerKey || !consumerSecret || !shortCode || !passKey) {
    return null;
  }

  return {
    consumerKey,
    consumerSecret,
    shortCode,
    passKey,
    callbackUrl,
    mode,
  };
}

async function requestAccessToken(
  credentials: DarajaCredentials,
): Promise<string | null> {
  const baseUrl = getDarajaBaseUrl(credentials.mode);
  const auth = Buffer.from(
    `${credentials.consumerKey}:${credentials.consumerSecret}`,
  ).toString("base64");

  const response = await fetch(
    `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
    {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as { access_token?: string };
  return data.access_token ?? null;
}

export async function initiateDarajaStkPush(
  input: StkPushInput,
): Promise<DarajaStkPushResult> {
  const credentials = getCredentials();

  if (!credentials) {
    return {
      ok: true,
      mocked: true,
      checkoutRequestId: `mock-checkout-${Date.now()}`,
      merchantRequestId: `mock-merchant-${Date.now()}`,
      customerMessage:
        "M-Pesa sandbox credentials missing. Running in mock pending mode.",
      rawResponse: {
        mocked: true,
      },
    };
  }

  try {
    const accessToken = await requestAccessToken(credentials);
    if (!accessToken) {
      return {
        ok: false,
        errorMessage: "Unable to acquire Daraja access token.",
      };
    }

    const timestamp = getTimestamp();
    const password = Buffer.from(
      `${credentials.shortCode}${credentials.passKey}${timestamp}`,
    ).toString("base64");
    const baseUrl = getDarajaBaseUrl(credentials.mode);

    const response = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: credentials.shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.round(input.amount),
        PartyA: normalizeKenyanPhone(input.phone),
        PartyB: credentials.shortCode,
        PhoneNumber: normalizeKenyanPhone(input.phone),
        CallBackURL: input.callbackUrl,
        AccountReference: input.accountReference.slice(0, 12),
        TransactionDesc: input.transactionDesc.slice(0, 18),
      }),
      cache: "no-store",
    });

    const raw = (await response.json()) as Record<string, unknown>;
    if (!response.ok) {
      return {
        ok: false,
        errorMessage:
          (raw.errorMessage as string | undefined) ??
          "Daraja STK push request failed.",
        rawResponse: raw,
      };
    }

    return {
      ok: true,
      checkoutRequestId: raw.CheckoutRequestID as string | undefined,
      merchantRequestId: raw.MerchantRequestID as string | undefined,
      customerMessage: raw.CustomerMessage as string | undefined,
      rawResponse: raw,
    };
  } catch (error) {
    return {
      ok: false,
      errorMessage:
        error instanceof Error
          ? error.message
          : "Unexpected Daraja request error.",
    };
  }
}

