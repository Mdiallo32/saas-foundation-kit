import { supabase } from "@/lib/supabase";
import { uploadToR2 } from "@/lib/r2";
import { Client, Matter, Timesheet, Invoice, Collaborator, MatterStatus } from "@/types";

// --- Mappers (DB snake_case → TS camelCase) ---

const mapClient = (row: Record<string, unknown>): Client => ({
    id: row.id as string,
    name: row.name as string,
    email: (row.email as string) ?? "",
    phone: (row.phone as string) ?? "",
    address: (row.address as string) ?? "",
    type: (row.type as Client["type"]) ?? "company",
    vatNumber: row.vat_number as string | undefined,
    nationalNumber: row.national_number as string | undefined,
    createdAt: ((row.created_at as string) ?? "").split("T")[0],
});

const mapMatter = (row: Record<string, unknown>): Matter => ({
    id: row.id as string,
    title: ((row.title ?? row.name) as string) ?? "",
    clientId: row.client_id as string,
    budgetTotal: (row.budget_total as number) ?? 0,
    budgetUsed: (row.budget_used as number) ?? 0,
    hourlyRate: (row.hourly_rate as number) ?? 0,
    status: (row.status as MatterStatus) ?? "open",
});

const mapTimesheet = (row: Record<string, unknown>): Timesheet => ({
    id: row.id as string,
    matterId: row.matter_id as string,
    description: (row.description as string) ?? "",
    hours: Number(row.hours ?? 0),
    rate: (row.rate as number) ?? 0,
    date: (row.date as string) ?? "",
    user: (row.profile_id as string) ?? "",
});

const mapInvoice = (row: Record<string, unknown>): Invoice => ({
    id: row.id as string,
    matterId: row.matter_id as string,
    reference: (row.reference as string) ?? "",
    amountHT: (row.amount_ht as number) ?? 0,
    vatRate: (row.vat_rate as number) ?? 21,
    status: (row.status as Invoice["status"]) ?? "draft",
    kind: (row.kind as Invoice["kind"]) ?? "final",
    issuedAt: (row.issued_at as string) ?? "",
    dueDate: (row.due_date as string) ?? undefined,
    paidAt: (row.paid_at as string | null) ?? null,
    archivedAt: (row.archived_at as string | null) ?? null,
});

const mapCollaborator = (row: Record<string, unknown>, matterIds: string[] = []): Collaborator => ({
    id: row.id as string,
    name: ((row.name ?? row.email) as string) ?? "",
    email: (row.email as string) ?? "",
    role: (row.role as string) ?? "lawyer",
    hourlyRate: (row.hourly_rate as number) ?? 0,
    avatar: row.avatar_r2_key as string | undefined,
    matterIds,
});

// --- Helper: get current user profile ---
// Uses getSession() (local cache) instead of getUser() (network call) to avoid
// an auth server round-trip on every mutation.

const getCurrentProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error("Not authenticated");

    const { data: profile, error } = await supabase
        .from("profiles")
        .select("id, firm_id, role")
        .eq("id", session.user.id)
        .single();

    if (error || !profile) throw new Error("Profile not found");
    return profile;
};

// --- Settings ---

const DEFAULT_SETTINGS = {
    firmName: "Carter & Associates LLP",
    slogan: "Trusted counsel, measurable results.",
    vat: "GB123456789",
    address: "12 King's Road, London EC2V 8AB",
    email: "info@carterassociates.com",
    phone: "+44 20 7946 0958",
    paymentTerms: 14,
    vatRate: 21,
    invoicePrefix: "INV-",
    invoiceFooter: "Payment is due within the specified terms. Late payments may incur interest as permitted by law.",
    showSlogan: true,
};

export const getSettings = async () => {
    try {
        // Single joined query: profiles → firms (avoids two sequential round-trips)
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return DEFAULT_SETTINGS;

        const { data, error } = await supabase
            .from("profiles")
            .select("firms(*)")
            .eq("id", session.user.id)
            .single();

        if (error || !data) return DEFAULT_SETTINGS;
        const firm = (data as Record<string, unknown>).firms as Record<string, unknown> | null;
        if (!firm) return DEFAULT_SETTINGS;

        return {
            firmName: (firm.name as string) ?? DEFAULT_SETTINGS.firmName,
            slogan: (firm.slogan as string) ?? DEFAULT_SETTINGS.slogan,
            vat: (firm.vat as string) ?? DEFAULT_SETTINGS.vat,
            address: (firm.address as string) ?? DEFAULT_SETTINGS.address,
            email: (firm.email as string) ?? DEFAULT_SETTINGS.email,
            phone: (firm.phone as string) ?? DEFAULT_SETTINGS.phone,
            paymentTerms: (firm.payment_terms as number) ?? DEFAULT_SETTINGS.paymentTerms,
            vatRate: (firm.vat_rate as number) ?? DEFAULT_SETTINGS.vatRate,
            invoicePrefix: (firm.invoice_prefix as string) ?? DEFAULT_SETTINGS.invoicePrefix,
            invoiceFooter: (firm.invoice_footer as string) ?? DEFAULT_SETTINGS.invoiceFooter,
            showSlogan: (firm.show_slogan as boolean) ?? DEFAULT_SETTINGS.showSlogan,
        };
    } catch {
        return DEFAULT_SETTINGS;
    }
};

export const updateSettings = async (payload: typeof DEFAULT_SETTINGS) => {
    const profile = await getCurrentProfile();

    const { error } = await supabase
        .from("firms")
        .update({
            name: payload.firmName,
            slogan: payload.slogan,
            vat: payload.vat,
            address: payload.address,
            email: payload.email,
            phone: payload.phone,
            payment_terms: payload.paymentTerms,
            vat_rate: payload.vatRate,
            invoice_prefix: payload.invoicePrefix,
            invoice_footer: payload.invoiceFooter,
            show_slogan: payload.showSlogan,
            updated_at: new Date().toISOString(),
        })
        .eq("id", profile.firm_id);

    if (error) throw error;
    return payload;
};

// --- Clients ---

export const listClients = async (): Promise<Client[]> => {
    const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []).map(mapClient);
};

export const getClient = async (id: string): Promise<Client | undefined> => {
    const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", id)
        .single();

    if (error) return undefined;
    return mapClient(data as Record<string, unknown>);
};

export const createClient = async (payload: Omit<Client, "id" | "createdAt">): Promise<Client> => {
    const profile = await getCurrentProfile();

    const { data, error } = await supabase
        .from("clients")
        .insert({
            firm_id: profile.firm_id,
            name: payload.name,
            email: payload.email,
            phone: payload.phone,
            address: payload.address,
            type: payload.type,
            vat_number: payload.vatNumber,
            national_number: payload.nationalNumber,
        })
        .select()
        .single();

    if (error) throw error;
    return mapClient(data as Record<string, unknown>);
};

export const updateClient = async (id: string, payload: Partial<Omit<Client, "id" | "createdAt">>): Promise<Client> => {
    const { data, error } = await supabase
        .from("clients")
        .update({
            ...(payload.name !== undefined && { name: payload.name }),
            ...(payload.email !== undefined && { email: payload.email }),
            ...(payload.phone !== undefined && { phone: payload.phone }),
            ...(payload.address !== undefined && { address: payload.address }),
            ...(payload.type !== undefined && { type: payload.type }),
            ...(payload.vatNumber !== undefined && { vat_number: payload.vatNumber }),
            ...(payload.nationalNumber !== undefined && { national_number: payload.nationalNumber }),
            updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return mapClient(data as Record<string, unknown>);
};

// --- Matters ---

export const listMatters = async (): Promise<Matter[]> => {
    const { data, error } = await supabase
        .from("matters")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []).map(mapMatter);
};

export const getMatter = async (id: string): Promise<Matter | undefined> => {
    const { data, error } = await supabase
        .from("matters")
        .select("*")
        .eq("id", id)
        .single();

    if (error) return undefined;
    return mapMatter(data as Record<string, unknown>);
};

export const createMatter = async (payload: Omit<Matter, "id" | "budgetUsed">): Promise<Matter> => {
    const profile = await getCurrentProfile();

    const { data, error } = await supabase
        .from("matters")
        .insert({
            firm_id: profile.firm_id,
            client_id: payload.clientId,
            title: payload.title,
            budget_total: payload.budgetTotal,
            budget_used: 0,
            hourly_rate: payload.hourlyRate,
            status: payload.status,
        })
        .select()
        .single();

    if (error) throw error;
    return mapMatter(data as Record<string, unknown>);
};

export const updateMatterStatus = async (id: string, status: MatterStatus): Promise<Matter> => {
    const { data, error } = await supabase
        .from("matters")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return mapMatter(data as Record<string, unknown>);
};

// --- Timesheets ---

export const listTimesheets = async (matterId: string): Promise<Timesheet[]> => {
    const { data, error } = await supabase
        .from("timesheets")
        .select("*")
        .eq("matter_id", matterId)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []).map(mapTimesheet);
};

export const createTimesheet = async (matterId: string, payload: Omit<Timesheet, "id" | "matterId">): Promise<Timesheet> => {
    const profile = await getCurrentProfile();

    const { data, error } = await supabase
        .from("timesheets")
        .insert({
            firm_id: profile.firm_id,
            matter_id: matterId,
            profile_id: profile.id,  // profile.id === session user id — no second getUser() needed
            description: payload.description,
            hours: payload.hours,
            rate: payload.rate,
            date: payload.date,
        })
        .select()
        .single();

    if (error) throw error;

    // Atomic increment — avoids race condition from read-then-write
    await supabase.rpc("increment_matter_budget_used", {
        p_matter_id: matterId,
        p_increment: payload.hours * payload.rate,
    });

    return mapTimesheet(data as Record<string, unknown>);
};

// --- Invoices ---

export const getInvoice = async (id: string): Promise<Invoice> => {
    const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("id", id)
        .single();

    if (error) throw new Error("Invoice not found");
    return mapInvoice(data as Record<string, unknown>);
};

export const listInvoices = async (matterId?: string): Promise<Invoice[]> => {
    let query = supabase
        .from("invoices")
        .select("*")
        .is("archived_at", null)
        .order("created_at", { ascending: false });

    if (matterId) {
        query = query.eq("matter_id", matterId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(mapInvoice);
};

export const updateInvoice = async (id: string, payload: Partial<Invoice>): Promise<Invoice> => {
    const { data, error } = await supabase
        .from("invoices")
        .update({
            ...(payload.status !== undefined && { status: payload.status }),
            ...(payload.paidAt !== undefined && { paid_at: payload.paidAt }),
            ...(payload.archivedAt !== undefined && { archived_at: payload.archivedAt }),
            ...(payload.amountHT !== undefined && { amount_ht: payload.amountHT }),
            ...(payload.vatRate !== undefined && { vat_rate: payload.vatRate }),
            ...(payload.dueDate !== undefined && { due_date: payload.dueDate }),
            updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return mapInvoice(data as Record<string, unknown>);
};

export const createProvisionInvoice = async (matterId: string, payload: Pick<Invoice, "amountHT" | "issuedAt">): Promise<Invoice> => {
    const profile = await getCurrentProfile();

    const { data: matter } = await supabase
        .from("matters")
        .select("client_id")
        .eq("id", matterId)
        .single();

    const dueDate = new Date(payload.issuedAt);
    dueDate.setDate(dueDate.getDate() + 30);

    const reference = `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;

    const { data, error } = await supabase
        .from("invoices")
        .insert({
            firm_id: profile.firm_id,
            client_id: (matter as Record<string, unknown>)?.client_id,
            matter_id: matterId,
            reference,
            amount_ht: payload.amountHT,
            vat_rate: 21,
            status: "draft",
            kind: "provision",
            issued_at: payload.issuedAt,
            due_date: dueDate.toISOString().split("T")[0],
        })
        .select()
        .single();

    if (error) throw error;
    return mapInvoice(data as Record<string, unknown>);
};

export const markInvoicePaid = async (id: string): Promise<Invoice> => {
    const { data, error } = await supabase
        .from("invoices")
        .update({
            status: "paid",
            paid_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    const invoice = mapInvoice(data as Record<string, unknown>);

    // Atomic increment — avoids race condition from read-then-write
    if (invoice.kind === "provision" && invoice.matterId) {
        await supabase.rpc("increment_matter_budget_total", {
            p_matter_id: invoice.matterId,
            p_increment: invoice.amountHT,
        });
    }

    return invoice;
};

export const archiveInvoice = async (id: string): Promise<Invoice> => {
    return updateInvoice(id, { archivedAt: new Date().toISOString() });
};

// --- Team ---

export const listTeam = async (): Promise<Collaborator[]> => {
    // Run independent queries in parallel
    const [profilesResult, assignmentsResult] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("assignments").select("profile_id, matter_id"),
    ]);

    if (profilesResult.error) throw profilesResult.error;

    const matterIdsByProfile: Record<string, string[]> = {};
    for (const a of assignmentsResult.data ?? []) {
        const rec = a as Record<string, unknown>;
        const pid = rec.profile_id as string;
        if (!matterIdsByProfile[pid]) matterIdsByProfile[pid] = [];
        matterIdsByProfile[pid].push(rec.matter_id as string);
    }

    return (profilesResult.data ?? []).map((p) =>
        mapCollaborator(p as Record<string, unknown>, matterIdsByProfile[p.id as string] ?? [])
    );
};

export const createCollaborator = async (payload: Omit<Collaborator, "id" | "matterIds">): Promise<Collaborator> => {
    const profile = await getCurrentProfile();

    const { data, error } = await supabase
        .from("profiles")
        .insert({
            firm_id: profile.firm_id,
            name: payload.name,
            email: payload.email,
            role: payload.role,
            hourly_rate: payload.hourlyRate,
        })
        .select()
        .single();

    if (error) throw error;
    return mapCollaborator(data as Record<string, unknown>);
};

export const updateCollaborator = async (id: string, payload: Partial<Collaborator>): Promise<Collaborator> => {
    const { data, error } = await supabase
        .from("profiles")
        .update({
            ...(payload.name !== undefined && { name: payload.name }),
            ...(payload.email !== undefined && { email: payload.email }),
            ...(payload.role !== undefined && { role: payload.role }),
            ...(payload.hourlyRate !== undefined && { hourly_rate: payload.hourlyRate }),
            ...(payload.avatar !== undefined && { avatar_r2_key: payload.avatar }),
            updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return mapCollaborator(data as Record<string, unknown>);
};

// --- Current User ---

export const getCurrentUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return { name: "Guest", email: "", role: "lawyer" as const };

    const { data: profile } = await supabase
        .from("profiles")
        .select("name, email, role")
        .eq("id", session.user.id)
        .single();

    return {
        name: (profile?.name as string) ?? session.user.email ?? "User",
        email: (profile?.email as string) ?? session.user.email ?? "",
        role: ((profile?.role as string) ?? "lawyer") as "admin" | "lawyer" | "billing",
    };
};

// --- Avatar Upload ---

/**
 * Upload a new profile avatar to R2 and persist the key in the profiles table.
 * Returns the R2 object key so callers can update signed URL caches.
 */
export const uploadAvatar = async (file: File): Promise<string> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error("Not authenticated");

    const key = await uploadToR2("profile_avatar", session.user.id, file);

    const { error } = await supabase
        .from("profiles")
        .update({ avatar_r2_key: key, updated_at: new Date().toISOString() })
        .eq("id", session.user.id);

    if (error) throw error;
    return key;
};
