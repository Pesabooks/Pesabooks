import * as Sentry from "Sentry";
import { serve } from "std/server";
import { corsHeaders } from "../_shared/cors.ts";
import { BalanceQuery } from "./type.ts";

Sentry.init({
  environment: Deno.env.get("ENV") ?? "",
  dsn: Deno.env.get("SENTRY_DSN") ?? "",
});

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
      Sentry.captureException(covError);
      throw new Error(error_message);
    }

    return new Response(JSON.stringify(balances?.items), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    Sentry.captureException(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
