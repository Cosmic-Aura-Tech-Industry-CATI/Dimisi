import { signInWithGoogleOAuth } from "@/lib/google-auth";

export const lovable = {
  auth: {
    signInWithOAuth: async (
      provider: "google" | "apple" | "microsoft",
      opts?: { redirect_uri?: string },
    ) => {
      if (provider === "google") {
        const res = await signInWithGoogleOAuth({ redirectUri: opts?.redirect_uri });
        return {
          error: res.error ? new Error(res.error) : null,
          redirected: !!res.redirected,
          tokens: res.user ? { user: res.user } : null,
        };
      }
      return { error: null, redirected: false, tokens: null };
    },
  },
};
