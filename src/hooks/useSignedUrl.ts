import { useQuery } from "@tanstack/react-query";
import { getSignedDownloadUrl } from "@/lib/r2";

// R2 signed URLs expire after 60 min — refresh at 50 min to avoid stale images
const SIGNED_URL_STALE_MS = 50 * 60 * 1000;

/**
 * Returns a cached signed download URL for an R2 object key.
 * Returns undefined when key is null/undefined (no file stored yet).
 * Automatically refreshes before the 1-hour R2 expiry.
 */
export function useSignedUrl(key: string | null | undefined): string | undefined {
    const { data } = useQuery({
        queryKey: ["signedUrl", key],
        queryFn: () => getSignedDownloadUrl(key!),
        enabled: !!key,
        staleTime: SIGNED_URL_STALE_MS,
        gcTime: SIGNED_URL_STALE_MS + 5 * 60 * 1000,
        retry: 1,
    });

    return data;
}
