import { getEnv } from "@/lib/env";

export interface TurnstileVerificationResult {
  success: boolean;
  error?: string;
}

/**
 * Validates a Cloudflare Turnstile token server-side.
 * If TURNSTILE_SECRET_KEY is not configured (e.g. in development), the check passes gracefully.
 */
export async function verifyTurnstileToken(
  token?: string,
  remoteIp?: string
): Promise<TurnstileVerificationResult> {
  const env = getEnv();

  // If Turnstile is not configured or in development mode without secret, allow bypass
  if (!env.TURNSTILE_SECRET_KEY) {
    return { success: true };
  }

  if (!token) {
    return {
      success: false,
      error: "Anti-abuse verification token is missing. Please complete the verification challenge.",
    };
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", env.TURNSTILE_SECRET_KEY);
    formData.append("response", token);
    if (remoteIp) {
      formData.append("remoteip", remoteIp);
    }

    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!response.ok) {
      return { success: false, error: `Turnstile verification failed with HTTP ${response.status}` };
    }

    const data = await response.json();
    if (!data.success) {
      return {
        success: false,
        error: "Anti-abuse verification failed or challenge expired. Please retry.",
      };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Error verifying Turnstile token:", err);
    return { success: false, error: "Unable to verify security challenge. Please try again." };
  }
}
