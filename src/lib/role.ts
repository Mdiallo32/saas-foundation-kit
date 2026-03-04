/**
 * Temporary UI compatibility shim for legacy role data.
 */

/**
 * Maps legacy 'master' role to 'admin' for internal state/data handling.
 * Use this when reading roles from storage/API.
 */
export const normalizeRole = (role?: string): string => {
    if (!role) return "lawyer"; // default fallback
    const normalized = role.toLowerCase();
    if (normalized === "master") return "admin";
    return normalized;
};

/**
 * Formats a role string for UI display.
 * Maps 'master' -> 'Admin' and capitalizes others.
 */
export const formatUserRole = (role?: string): string => {
    const normalized = normalizeRole(role);
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};
