import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { BalanceQuery, BalancesReponse } from "./type.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    console.log("OPTIONS called");

    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { chain_id, address, quote }: BalanceQuery = await req.json();
    const convalentKey = Deno.env.get("COVALENT_KEY");

    const jsonResponse = await fetch(
      `https://api.covalenthq.com/v1/${chain_id}/address/${address}/balances_v2/?quote-currency=${quote}&format=JSON&nft=false&no-nft-fetch=false&key=${convalentKey}`
    );
    const { data: balances, error: covError, error_message } = await jsonResponse.json();

    if (covError) {
      throw new Error(error_message);
    }

    const filteredBalances: BalancesReponse = balances?.items?.filter((b: BalancesReponse) => b.type !== "dust");

    return new Response(JSON.stringify(filteredBalances), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
