import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { supabaseClient } from "../_shared/supabaseClient.ts";

serve(async (req) => {
  const { type, purchase } = await req.json();
  const { id: rampId, finalTxHash } = purchase;
  console.log(type, purchase);

  const { data: activities } = await supabaseClient.from("activities").select().eq("metadata->>ramp_id", rampId);
  const transaction = activities?.[0];

  if (transaction) {
    if (type == "RELEASED") {
      await supabaseClient
        .from("activities")
        .update({ hash: finalTxHash, status: "completed" })
        .eq("id", transaction.id);
    } else if (type == "ERROR")
      await supabaseClient.from("activities").update({ status: "failed", hash: finalTxHash }).eq("id", transaction.id);
  }
  return new Response();
});
