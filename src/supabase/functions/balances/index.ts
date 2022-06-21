import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { supabaseClient } from "../_shared/supabaseClient.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    console.log("OPTIONS called");

    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { poolId } = await req.json();

    //Get contracts
    let { data: pools, error } = await supabaseClient.from("pools").select().eq("id", poolId);
    const pool = pools?.[0];

    if (error) {
      return new Response(JSON.stringify(error), { status: 400 });
    }
    const jsonResponse = await fetch(
      `https://api.covalenthq.com/v1/${pool.chain_id}/address/${
        pool.contract_address
      }/balances_v2/?quote-currency=CAD&format=JSON&nft=false&no-nft-fetch=false&key=${Deno.env.get("COVALENT_KEY")}`
    );
    const { data: balances, error: covError, error_message } = await jsonResponse.json();

    if (covError) {
      return new Response(JSON.stringify(covError), { status: 400 });
    }

    const filteredBalances = balances?.items?.filter((b: any) => b.type !== "dust");

    return new Response(JSON.stringify(filteredBalances), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
