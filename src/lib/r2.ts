import { supabase } from "@/lib/supabase";

export type R2UploadKind = "firm_logo" | "profile_avatar" | "invoice_pdf";

/**
 * Request a signed PUT URL from the edge function, upload the file directly
 * to Cloudflare R2, and return the resulting object key for storage.
 */
export async function uploadToR2(
    kind: R2UploadKind,
    entityId: string,
    file: File,
): Promise<string> {
    const { data, error } = await supabase.functions.invoke<{ signedUrl: string; key: string }>(
        "r2-sign-put",
        { body: { kind, entityId } },
    );

    if (error || !data?.signedUrl) {
        throw new Error(error?.message ?? "Failed to get upload URL");
    }

    const uploadRes = await fetch(data.signedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
    });

    if (!uploadRes.ok) {
        throw new Error(`R2 upload failed: ${uploadRes.status} ${uploadRes.statusText}`);
    }

    return data.key;
}

/**
 * Request a signed GET URL for reading an R2 object.
 * URLs expire after 1 hour — use useSignedUrl() to cache and auto-refresh them.
 */
export async function getSignedDownloadUrl(key: string): Promise<string> {
    const { data, error } = await supabase.functions.invoke<{ signedUrl: string }>(
        "r2-sign-get",
        { body: { key } },
    );

    if (error || !data?.signedUrl) {
        throw new Error(error?.message ?? "Failed to get download URL");
    }

    return data.signedUrl;
}
