import { supabase } from "../supabase/client";

type SignInOptions = {
  redirect_uri?: string;
  extraParams?: Record<string, string>;
};

/** Direct Supabase OAuth - replaces the removed @lovable.dev/cloud-auth-js dependency. */
export const lovable = {
  auth: {
    signInWithOAuth: async (
      provider: "google" | "apple" | "microsoft",
      opts?: SignInOptions,
    ) => {
      const redirectTo = opts?.redirect_uri ?? window.location.origin;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider === "microsoft" ? "azure" : provider,
        options: {
          redirectTo,
          queryParams: opts?.extraParams,
        },
      });

      if (error) return { error, redirected: false, tokens: null };
      // signInWithOAuth always redirects the browser
      return { error: null, redirected: !!data.url, tokens: null };
    },
  },
};
