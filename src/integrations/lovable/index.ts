type SignInOptions = {
  redirect_uri?: string;
  extraParams?: Record<string, string>;
};

export const lovable = {
  auth: {
    signInWithOAuth: async (
      _provider: "google" | "apple" | "microsoft",
      _opts?: SignInOptions,
    ) => {
      // Direct client OAuth handler
      return { error: null, redirected: false, tokens: null };
    },
  },
};
