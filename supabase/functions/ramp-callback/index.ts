import * as Sentry from "Sentry";
import { serve } from "std/server";
import { supabaseClient } from "../_shared/supabaseClient.ts";

Sentry.init({
  environment: Deno.env.get("ENV") ?? "",
  dsn: Deno.env.get("SENTRY_DSN") ?? "",
});

serve(async (req) => {
  const { type, purchase } = await req.json();
  const { id: rampId, finalTxHash } = purchase;
  console.log(type, purchase);

  const { data: transaction, error } = await supabaseClient
    .from("activities")
    .select()
    .eq("metadata->>ramp_id", rampId)
    .single();

  if (error) Sentry.captureException(error);

  if (transaction) {
    if (type === "RELEASED") {
      const { error } = await supabaseClient
        .from("activities")
        .update({ hash: finalTxHash, status: "completed" })
        .eq("id", transaction.id);

      if (error) Sentry.captureException(error);
    } else if (type === "ERROR") {
      const { error } = await supabaseClient
        .from("activities")
        .update({ status: "failed", hash: finalTxHash })
        .eq("id", transaction.id);

      if (error) {
        Sentry.captureException(error);
      }
    }
  }
  return new Response();
});
