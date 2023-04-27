import { createClient } from "@supabase/supabase-js";
import { Database } from "../../../app/src/types/database.ts";
import "dotenv/load";

export const supabaseClient = createClient<Database>(
  // Supabase API URL - env var exported by default when deployed.
  Deno.env.get("SUPABASE_URL") ?? "",
  // Supabase API ANON KEY - env var exported by default when deployed.
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);
