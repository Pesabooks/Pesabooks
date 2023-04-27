import { createClient } from "@supabase/supabase-js";
import "dotenv/load";
import { Database } from "../database.ts";

export const supabaseClient = createClient<Database>(
  // Supabase API URL - env var exported by default when deployed.
  Deno.env.get("SUPABASE_URL") ?? "",
  // Supabase API ANON KEY - env var exported by default when deployed.
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);
