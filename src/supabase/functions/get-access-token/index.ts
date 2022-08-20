import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import * as jose from "https://deno.land/x/jose@v4.8.3/index.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { GetAccessTokenRequest, GetAccessTokenResponse } from "./type.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    console.log("OPTIONS called");

    return new Response("ok", { headers: corsHeaders });
  }

  const { user_id, id_token }: GetAccessTokenRequest = await req.json();

  try {
    const jwks = jose.createRemoteJWKSet(new URL("https://api.openlogin.com/jwks"));
    const jwtDecoded = await jose.jwtVerify(id_token, jwks, { algorithms: ["ES256"] });

    const { iat, email, exp, name } = jwtDecoded.payload;

    const encoder = new TextEncoder();
    const buffer = encoder.encode(Deno.env.get("JWT_KEY") ?? "");

    const token = {
      aud: "authenticated",
      sub: user_id,
      iat,
      exp,
      email,
      name,
    };

    const jwt = await new jose.SignJWT(token).setProtectedHeader({ alg: "HS256" }).sign(buffer);

    const response: GetAccessTokenResponse = {
      access_token: jwt,
    };

    return new Response(JSON.stringify(response), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify(error), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
