// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "std/server";
import { corsHeaders } from "../_shared/cors.ts";
import { SendInvitationRequest } from "./type.ts";
import * as Sentry from "Sentry";

Sentry.init({
  environment: Deno.env.get("ENV") ?? "",
  dsn: Deno.env.get("SENTRY_DSN") ?? "",
});

const apiKey = Deno.env.get("SENDGRID_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const { invitee, invitee_email, inviter, group, url }: SendInvitationRequest = await req.json();

  try {
    const mail = {
      from: {
        name: "Pesabooks",
        email: "info@pesabooks.com",
      },
      personalizations: [
        {
          to: [
            {
              email: invitee_email,
            },
          ],
          dynamic_template_data: {
            invitee,
            inviter,
            group,
            url,
          },
        },
      ],
      template_id: "d-1dd4bf74007341c5a7bf71f9416bef1d",
    };

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

  return new Response(null, { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
