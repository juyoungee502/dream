export function getSupabaseBrowserEnv() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  };
}

export function getSupabaseServerEnv() {
  return {
    ...getSupabaseBrowserEnv(),
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  };
}

export function hasSupabaseBrowserEnv() {
  const { url, anonKey } = getSupabaseBrowserEnv();
  return Boolean(url && anonKey);
}

export function hasSupabaseAdminEnv() {
  const { url, serviceRoleKey } = getSupabaseServerEnv();
  return Boolean(url && serviceRoleKey);
}

