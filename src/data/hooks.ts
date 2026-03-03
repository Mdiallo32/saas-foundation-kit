import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "./query-keys";
import * as repo from "./repo";
import { MatterStatus, Timesheet, Invoice, Client, Matter } from "@/types";

// --- Queries ---

export const useClients = () => {
    return useSuspenseQuery({
        queryKey: QUERY_KEYS.clients,
        queryFn: repo.listClients,
    });
};

export const useClient = (id: string) => {
    return useSuspenseQuery({
        queryKey: QUERY_KEYS.client(id),
        queryFn: () => repo.getClient(id),
    });
};

export const useMatters = () => {
    return useSuspenseQuery({
        queryKey: QUERY_KEYS.matters,
        queryFn: repo.listMatters,
    });
};

export const useMatter = (id: string) => {
    return useSuspenseQuery({
        queryKey: QUERY_KEYS.matter(id),
        queryFn: () => repo.getMatter(id),
    });
};

export const useTimesheets = (matterId: string) => {
    return useSuspenseQuery({
        queryKey: QUERY_KEYS.timesheets(matterId),
        queryFn: () => repo.listTimesheets(matterId),
    });
};

export const useInvoices = (matterId?: string) => {
    return useSuspenseQuery({
        queryKey: matterId ? QUERY_KEYS.invoices(matterId) : ["invoices"],
        queryFn: () => repo.listInvoices(matterId),
    });
};

export const useInvoice = (id: string) => {
    return useQuery({
        queryKey: ["invoice", id],
        queryFn: () => repo.getInvoice(id),
    });
};

export const useTeam = () => {
    return useSuspenseQuery({
        queryKey: QUERY_KEYS.team,
        queryFn: repo.listTeam,
    });
};

export const useSettings = () => {
    return useQuery({
        queryKey: QUERY_KEYS.settings,
        queryFn: repo.getSettings,
    });
};

// --- Mutations ---

export const useUpdateSettings = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: repo.updateSettings,
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
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.invoices(matterId) });
        },
    });
};

export const useMarkInvoicePaid = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: repo.markInvoicePaid,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.invoices(data.matterId) });
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
        onSuccess: (data: Invoice) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.invoices(data.matterId) });
        },
    });
};

export const useUpdateInvoice = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...payload }: { id: string } & Partial<Invoice>) =>
            repo.updateInvoice(id, payload),
        onSuccess: (data: Invoice) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.invoices(data.matterId) });
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
        },
    });
};

export const useUpdateMatterStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: MatterStatus }) =>
            repo.updateMatterStatus(id, status),
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
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.invoices(data.matterId) });
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
        },
    });
};
