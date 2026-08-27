import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

function isNewSupabaseApiKey(value: string): boolean {
  return value.startsWith('sb_publishable_') || value.startsWith('sb_secret_');
}

function createSupabaseFetch(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== 'undefined' && input instanceof Request ? input.headers : undefined,
    );

    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }

    if (isNewSupabaseApiKey(supabaseKey) && headers.get('Authorization') === `Bearer ${supabaseKey}`) {
      headers.delete('Authorization');
    }

    headers.set('apikey', supabaseKey);
    return fetch(input, { ...init, headers });
  };
}

function getEnvVar(name: string): string | undefined {
  if (typeof process !== 'undefined' && process.env && process.env[name]) {
    return process.env[name];
  }
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[name]) {
      return import.meta.env[name];
    }
  } catch {}
  return undefined;
}

function createSupabaseAdminClient() {
  const SUPABASE_URL =
    getEnvVar('SUPABASE_URL') ||
    getEnvVar('VITE_SUPABASE_URL') ||
    'https://placeholder-supabase.supabase.co';
  const SUPABASE_SERVICE_ROLE_KEY =
    getEnvVar('SUPABASE_SERVICE_ROLE_KEY') ||
    getEnvVar('VITE_SUPABASE_SERVICE_ROLE_KEY') ||
    getEnvVar('SUPABASE_PUBLISHABLE_KEY') ||
    getEnvVar('VITE_SUPABASE_PUBLISHABLE_KEY') ||
    'placeholder-service-key';

  return createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    global: {
      fetch: createSupabaseFetch(SUPABASE_SERVICE_ROLE_KEY),
    },
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

let _supabaseAdmin: ReturnType<typeof createSupabaseAdminClient> | undefined;

export const supabaseAdmin = new Proxy({} as ReturnType<typeof createSupabaseAdminClient>, {
  get(_, prop, receiver) {
    if (!_supabaseAdmin) _supabaseAdmin = createSupabaseAdminClient();
    return Reflect.get(_supabaseAdmin, prop, receiver);
  },
});
