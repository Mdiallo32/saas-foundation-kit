import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "./query-keys";
import * as repo from "./repo";
import { MatterStatus, Timesheet, Invoice, Client, Matter, Collaborator } from "@/types";

// --- Retry config ---
// Exponential back-off: 1s → 2s → 4s, capped at 30s.
// Auth errors (401) are not retried — they require user action.
const isRetryable = (failureCount: number, error: unknown): boolean => {
    if (failureCount >= 3) return false;
    if (error instanceof Error && "status" in error) {
        const status = (error as Error & { status: number }).status;
        if (status === 401 || status === 403 || status === 404) return false;
    }
    return true;
};

const QUERY_RETRY = {
    retry: isRetryable,
    retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 30000),
} as const;

const MUTATION_RETRY = {
    retry: isRetryable,
    retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 30000),
} as const;

// --- Queries ---

export const useClients = () => {
    return useSuspenseQuery({
        queryKey: QUERY_KEYS.clients,
        queryFn: repo.listClients,
        ...QUERY_RETRY,
    });
};

export const useClient = (id: string) => {
    return useSuspenseQuery({
        queryKey: QUERY_KEYS.client(id),
        queryFn: () => repo.getClient(id),
        ...QUERY_RETRY,
    });
};

export const useMatters = () => {
    return useSuspenseQuery({
        queryKey: QUERY_KEYS.matters,
        queryFn: repo.listMatters,
        ...QUERY_RETRY,
    });
};

export const useMatter = (id: string) => {
    return useSuspenseQuery({
        queryKey: QUERY_KEYS.matter(id),
        queryFn: () => repo.getMatter(id),
        ...QUERY_RETRY,
    });
};

export const useTimesheets = (matterId: string) => {
    return useSuspenseQuery({
        queryKey: QUERY_KEYS.timesheets(matterId),
        queryFn: () => repo.listTimesheets(matterId),
        ...QUERY_RETRY,
    });
};

export const useInvoices = (matterId?: string) => {
    return useSuspenseQuery({
        queryKey: matterId ? QUERY_KEYS.invoices(matterId) : QUERY_KEYS.allInvoices,
        queryFn: () => repo.listInvoices(matterId),
        ...QUERY_RETRY,
    });
};

export const useInvoice = (id: string) => {
    return useSuspenseQuery({
        queryKey: QUERY_KEYS.invoice(id),
        queryFn: () => repo.getInvoice(id),
        ...QUERY_RETRY,
    });
};

export const useTeam = () => {
    return useSuspenseQuery({
        queryKey: QUERY_KEYS.team,
        queryFn: repo.listTeam,
        ...QUERY_RETRY,
    });
};

export const useSettings = () => {
    return useSuspenseQuery({
        queryKey: QUERY_KEYS.settings,
        queryFn: repo.getSettings,
        ...QUERY_RETRY,
    });
};

export const useUser = () => {
    return useSuspenseQuery({
        queryKey: QUERY_KEYS.currentUser,
        queryFn: repo.getCurrentUser,
        ...QUERY_RETRY,
    });
};

// --- Mutations ---

export const useUpdateSettings = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: repo.updateSettings,
        ...MUTATION_RETRY,
        onSuccess: (data) => {
            queryClient.setQueryData(QUERY_KEYS.settings, data);
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.settings });
        },
    });
};

export const useCreateClient = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: repo.createClient,
        ...MUTATION_RETRY,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clients });
            queryClient.setQueryData(QUERY_KEYS.client(data.id), data);
        },
    });
};

export const useUpdateClient = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...payload }: Partial<Client> & { id: string }) => repo.updateClient(id, payload),
        ...MUTATION_RETRY,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clients });
            queryClient.setQueryData(QUERY_KEYS.client(data.id), data);
        },
    });
};

export const useCreateMatter = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: repo.createMatter,
        ...MUTATION_RETRY,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.matters });
        },
    });
};

export const useCreateTimesheet = (matterId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: Omit<Timesheet, "id" | "matterId">) =>
            repo.createTimesheet(matterId, payload),
        ...MUTATION_RETRY,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.timesheets(matterId) });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.matters });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.matter(matterId) });
        },
    });
};

export const useCreateProvisionInvoice = (matterId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: Pick<Invoice, "amountHT" | "issuedAt">) =>
            repo.createProvisionInvoice(matterId, payload),
        ...MUTATION_RETRY,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.invoices(matterId) });
        },
    });
};

export const useMarkInvoicePaid = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: repo.markInvoicePaid,
        ...MUTATION_RETRY,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.invoices(data.matterId) });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.invoice(data.id) });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.matter(data.matterId) });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.matters });
        },
    });
};

export const useUpdateInvoiceStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: Invoice["status"] }) =>
            repo.updateInvoice(id, { status }),
        ...MUTATION_RETRY,
        onSuccess: (data: Invoice) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.invoices(data.matterId) });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.invoice(data.id) });
        },
    });
};

export const useUpdateInvoice = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...payload }: { id: string } & Partial<Invoice>) =>
            repo.updateInvoice(id, payload),
        ...MUTATION_RETRY,
        onSuccess: (data: Invoice) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.invoices(data.matterId) });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.invoice(data.id) });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allInvoices });
        },
    });
};

export const useUpdateMatterStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: MatterStatus }) =>
            repo.updateMatterStatus(id, status),
        ...MUTATION_RETRY,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.matter(data.id) });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.matters });
        },
    });
};

export const useArchiveInvoice = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: repo.archiveInvoice,
        ...MUTATION_RETRY,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.invoices(data.matterId) });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.invoice(data.id) });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allInvoices });
        },
    });
};

export const useCreateCollaborator = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: repo.createCollaborator,
        ...MUTATION_RETRY,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.team });
        },
    });
};

export const useUpdateCollaborator = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...payload }: Partial<Collaborator> & { id: string }) =>
            repo.updateCollaborator(id, payload),
        ...MUTATION_RETRY,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.team });
        },
    });
};

export const useUploadAvatar = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: repo.uploadAvatar,
        ...MUTATION_RETRY,
        onSuccess: (key) => {
            // Invalidate the signed URL cache for this key so AppSidebar re-fetches
            queryClient.invalidateQueries({ queryKey: ["signedUrl", key] });
            // Team list shows avatars too — keep it in sync
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.team });
        },
    });
};
