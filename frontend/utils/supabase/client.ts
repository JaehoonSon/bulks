import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/database.types";

let browserClient: SupabaseClient<Database> | null = null;

export function createClient(): SupabaseClient<Database> {
  if (browserClient) return browserClient;
  // Create a supabase client on the browser with project's credentials (singleton)
  browserClient = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
  return browserClient;
}
