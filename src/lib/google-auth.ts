/**
 * DIMISI Technologies — Official Google OAuth 2.0 Provider & Session Handler
 * Launches Google's official Account Chooser and synchronizes authenticated identity with MongoDB.
 */
import { getGoogleAuthConfigFn, syncGoogleUserFn } from "./auth.functions";

export interface GoogleUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
}

export interface GoogleAuthResult {
  success: boolean;
  user?: GoogleUser;
  error?: string;
  redirected?: boolean;
}

/**
 * Handles incoming Google OAuth callback tokens from URL hash.
 * Google redirects back to: /auth#access_token=...&id_token=...
 */
export async function handleGoogleOAuthCallback(): Promise<GoogleUser | null> {
  if (typeof window === "undefined") return null;

  try {
    const hash = window.location.hash.substring(1);
    if (!hash) return null;

    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");
    const idToken = params.get("id_token");

    if (!accessToken && !idToken) return null;

    let profileData: {
      sub?: string;
      email?: string;
      name?: string;
      given_name?: string;
      picture?: string;
    } = {};

    // 1. Fetch user info from Google's standard UserInfo endpoint
    if (accessToken) {
      try {
        const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (response.ok) {
          profileData = await response.json();
        }
      } catch (e) {
        console.warn("[Google OAuth] Failed to query userinfo endpoint:", e);
      }
    }

    // 2. Fallback: Parse id_token JWT payload if available
    if (!profileData.email && idToken) {
      try {
        const parts = idToken.split(".");
        if (parts.length === 3) {
          profileData = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
        }
      } catch (e) {
        console.warn("[Google OAuth] Failed to decode id_token:", e);
      }
    }

    if (!profileData.email) {
      console.warn("[Google OAuth] No verified email returned from Google OAuth token.");
      return null;
    }

    const cleanEmail = profileData.email.trim().toLowerCase();
    const userId = `usr-g-${profileData.sub || Date.now().toString(36)}`;
    const fullName =
      profileData.name ||
      profileData.given_name ||
      (cleanEmail ? cleanEmail.split("@")[0] : "Google User");
    const avatarUrl = profileData.picture || null;

    // 3. Synchronize authenticated identity with MongoDB
    try {
      await syncGoogleUserFn({
        data: {
          id: userId,
          email: cleanEmail,
          fullName,
          avatarUrl: avatarUrl || undefined,
        },
      });
    } catch (syncErr) {
      console.warn("[Google OAuth] MongoDB profile sync note:", syncErr);
    }

    const googleUser: GoogleUser = {
      id: userId,
      email: cleanEmail,
      fullName,
      avatarUrl,
    };

    // 4. Persist session for useAuth() hook
    localStorage.setItem(
      "dimisi_admin_session",
      JSON.stringify({
        user: {
          id: googleUser.id,
          email: googleUser.email,
          user_metadata: {
            full_name: googleUser.fullName,
            avatar_url: googleUser.avatarUrl,
            provider: "google",
          },
        },
        token: accessToken || idToken || `token-${Date.now()}`,
        expires_at: Date.now() + 7 * 24 * 60 * 60 * 1000,
      }),
    );

    // 5. Clean up OAuth hash parameters from the browser address bar
    window.history.replaceState(null, "", window.location.pathname);

    // 6. Broadcast authentication state change
    window.dispatchEvent(new Event("dimisi-auth-change"));

    return googleUser;
  } catch (err) {
    console.error("[Google OAuth Callback] Error processing callback:", err);
    return null;
  }
}

/**
 * Initiates Google's official OAuth 2.0 Account Selector Flow.
 * Redirects the user directly to Google's official Account Chooser UI.
 */
export async function signInWithGoogleOAuth(options?: {
  redirectUri?: string;
}): Promise<GoogleAuthResult> {
  if (typeof window === "undefined") {
    return { success: false, error: "Window is not defined" };
  }

  try {
    let clientId: string | null | undefined =
      (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ||
      (typeof process !== "undefined" ? process.env?.VITE_GOOGLE_CLIENT_ID : undefined);

    // If client ID not found in frontend bundle, retrieve from server function
    if (!clientId) {
      try {
        const serverConfig = await getGoogleAuthConfigFn();
        clientId = serverConfig?.clientId;
      } catch {
        clientId = null;
      }
    }

    if (!clientId || clientId.trim() === "" || clientId.includes("placeholder")) {
      return {
        success: false,
        error:
          "Google OAuth is not configured yet. Please configure VITE_GOOGLE_CLIENT_ID in your environment variables.",
      };
    }

    const redirectUri = options?.redirectUri || `${window.location.origin}/auth`;

    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const nonce = Math.random().toString(36).substring(2, 15);

    const params = new URLSearchParams({
      client_id: clientId.trim(),
      redirect_uri: redirectUri,
      response_type: "token id_token",
      scope: "openid email profile",
      prompt: "select_account", // Google's official Account Chooser UI
      nonce,
    });

    // Launch Google official account selector
    window.location.href = `${rootUrl}?${params.toString()}`;
    return { success: true, redirected: true };
  } catch (err: any) {
    console.error("[Google OAuth] Sign in initiation error:", err);
    return {
      success: false,
      error: err?.message || "Unable to launch Google authentication. Please try again.",
    };
  }
}
