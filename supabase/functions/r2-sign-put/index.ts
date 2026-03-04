import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.44.4";
import { S3Client, PutObjectCommand } from "npm:@aws-sdk/client-s3@3.621.0";
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
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
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

        const { kind, entityId } = await req.json();

        if (!kind || !entityId) {
            return new Response(
                JSON.stringify({ error: "Missing 'kind' or 'entityId'" }),
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
        let key = "";
        const randomSuffix = crypto.randomUUID();

        // Verify access depending on kind
        if (kind === "firm_logo") {
            if (entityId !== firmId) {
                return new Response(JSON.stringify({ error: "Forbidden: Firm mismatch" }), {
                    status: 403,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                });
            }
            key = `firms/${firmId}/logos/${randomSuffix}`;
        } else if (kind === "profile_avatar") {
            if (entityId !== user.id) {
                return new Response(JSON.stringify({ error: "Forbidden: User mismatch" }), {
                    status: 403,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                });
            }
            key = `profiles/${user.id}/avatars/${randomSuffix}`;
        } else if (kind === "invoice_pdf") {
            // Must verify invoice belongs to user's firm
            const { data: invoice } = await supabaseClient
                .from("invoices")
                .select("firm_id")
                .eq("id", entityId)
                .single();

            if (!invoice || invoice.firm_id !== firmId) {
                return new Response(
                    JSON.stringify({ error: "Forbidden: Invoice mismatch or not found" }),
                    { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
                );
            }
            key = `firms/${firmId}/invoices/${entityId}/pdfs/${randomSuffix}`;
        } else {
            return new Response(JSON.stringify({ error: "Invalid kind" }), {
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

        const command = new PutObjectCommand({
            Bucket: Deno.env.get("R2_BUCKET_NAME"),
            Key: key,
        });

        // Generate signed PUT URL
        const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });

        return new Response(JSON.stringify({ signedUrl, key }), {
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
