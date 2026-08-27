import { createMiddleware } from '@tanstack/react-start';
import { supabase } from './client';

export const attachSupabaseAuth = createMiddleware({ type: 'function' }).client(
  async ({ next }) => {
    try {
      const sessionRes = await supabase.auth?.getSession?.();
      const token = sessionRes?.data?.session?.access_token;
      return next({
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch {
      return next();
    }
  },
);
