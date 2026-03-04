import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.44.4";
import { S3Client, GetObjectCommand } from "npm:@aws-sdk/client-s3@3.621.0";
import { getSignedUrl } from "npm:@aws-sdk/s3-request-presigner@3.621.0";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_ANON_KEY") ?? "",
            {
                global: {
                    headers: { Authorization: req.headers.get("Authorization")! },
                },
            }
        );

        // Verify authenticated user
        const {
            data: { user },
            error: userError,
        } = await supabaseClient.auth.getUser();

        if (userError || !user) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const { key } = await req.json();

        if (!key) {
            return new Response(
                JSON.stringify({ error: "Missing 'key'" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Verify firm membership using the current authenticated user's profile
        const { data: profile, error: profileError } = await supabaseClient
            .from("profiles")
            .select("firm_id")
            .eq("id", user.id)
            .single();

        if (profileError || !profile || !profile.firm_id) {
            return new Response(JSON.stringify({ error: "User is not part of a firm" }), {
                status: 403,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const firmId = profile.firm_id;

        // Verify access based on key path prefixes
        const pathParts = key.split("/");

        if (key.startsWith("firms/")) {
            // Key format: firms/{firmId}/...
            const keyFirmId = pathParts[1];
            if (keyFirmId !== firmId) {
                return new Response(JSON.stringify({ error: "Forbidden: Firm mismatch" }), {
                    status: 403,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                });
            }
        } else if (key.startsWith("profiles/")) {
            // Key format: profiles/{userId}/...
            const keyUserId = pathParts[1];
            if (keyUserId !== user.id) {
                return new Response(JSON.stringify({ error: "Forbidden: Profile mismatch" }), {
                    status: 403,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                });
            }
        } else {
            return new Response(JSON.stringify({ error: "Invalid key format" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // Connect to Cloudflare R2
        const r2Client = new S3Client({
            region: "auto",
            endpoint: `https://${Deno.env.get("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: Deno.env.get("R2_ACCESS_KEY_ID") ?? "",
                secretAccessKey: Deno.env.get("R2_SECRET_ACCESS_KEY") ?? "",
            },
        });

        const command = new GetObjectCommand({
            Bucket: Deno.env.get("R2_BUCKET_NAME"),
            Key: key,
        });

        // Generate signed GET URL
        const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });

        return new Response(JSON.stringify({ signedUrl }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
