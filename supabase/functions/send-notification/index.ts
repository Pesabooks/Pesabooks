// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "std/server";
import { corsHeaders } from "../_shared/cors.ts";
import { supabaseClient } from "../_shared/supabaseClient.ts";
import { SendNotificationRequest } from "./type.ts";
import Sentry from "Sentry";

Sentry.init({
  environment: Deno.env.get("ENV") ?? "",
  dsn: Deno.env.get("SENTRY_DSN") ?? "",
});

const apiKey = Deno.env.get("SENDGRID_API_KEY");

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const { pool_id, user_id, notification_type, notification_description, notification_data }: SendNotificationRequest =
    await req.json();

  let threshold_info_text = "";

  if (notification_data?.remaining_votes === 0) {
    threshold_info_text = "The proposal is ready to be executed.";
  } else if (notification_data?.remaining_votes === 1) {
    threshold_info_text = "1 more confirmation is required to execute the proposal.";
  } else if (!isNaN(notification_data?.remaining_votes)) {
    threshold_info_text = `${notification_data?.remaining_votes} more confirmations are required to execute the proposal.`;
  }

  let template_id = "";

  switch (notification_type) {
    case "new_proposal":
      template_id = "d-1f5244e7187e4f1da517a85525864334";
      break;
    case "proposal_execution":
      template_id = "d-bce43d0aa2634a13bdb2f633e9ad3684";
      break;
    case "proposal_rejection":
      template_id = "d-95737b921a744d57b5539a38375959d6";
      break;
    case "proposal_confirmation":
      template_id = "d-cba7210c45404cae9189b4589ebd64d5";
      break;
    case "new_deposit":
      template_id = "d-e34d76b8534f4c5ba9bc45c8d0632232";
      break;
  }

  const { data: user } = await supabaseClient.from("users").select("id,username").eq("id", user_id).single();
  const { data: pool } = await supabaseClient.from("pools").select("id,name").eq("id", pool_id).single();

  const { data: recipients } = await supabaseClient
    .from("members")
    .select(" user:users(*)")
    .eq("pool_id", pool_id)
    .eq("active", true)
    .neq("user_id", user_id);

  if (recipients)
    for (const recipient of recipients) {
      try {
        const mail = {
          from: {
            name: "Pesabooks",
            email: "notifications@pesabooks.com",
          },
          personalizations: [
            {
              to: [
                {
                  email: recipient.user.email,
                },
              ],
              dynamic_template_data: {
                recipient: recipient.user.username,
                user: user?.username,
                group: pool?.name,
                url: notification_data?.url,
                description: notification_description,
                threshold_info_text,
              },
            },
          ],
          template_id: template_id,
        };

        console.log("mail", JSON.stringify(mail, null, 2));
        await fetch("https://api.sendgrid.com/v3/mail/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(mail),
        });
      } catch (error) {
        Sentry.captureException(error);
        return new Response(error.message, { headers: corsHeaders, status: 500 });
      }
    }

  return new Response(null, { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
