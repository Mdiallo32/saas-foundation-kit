import { http, HttpResponse } from "msw";

const SUPABASE_URL = "https://lioapursmdspniwcqwjh.supabase.co";

// Mock data - using snake_case as returned from Supabase
const mockClients = [
  {
    id: "1",
    name: "Sarah Chen",
    email: "sarah@example.com",
    phone: "555-0001",
    address: "123 Main St",
    type: "physical" as const,
    national_number: "12345678901",
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "Carter & Associates LLP",
    email: "contact@carter.com",
    phone: "555-0002",
    address: "456 Park Ave",
    type: "company" as const,
    vat_number: "FR12345678901",
    created_at: "2025-01-02T00:00:00Z",
  },
];

const mockMatters = [
  {
    id: "m12345",
    firm_id: "firm-1",
    client_id: "1",
    title: "Contract Review",
    status: "active",
    description: "Review and negotiate service agreement",
    budget_cents: 500000,
    created_at: "2025-01-05T00:00:00Z",
    updated_at: "2025-01-05T00:00:00Z",
  },
  {
    id: "m67890",
    firm_id: "firm-1",
    client_id: "2",
    title: "Litigation Support",
    status: "pending",
    description: "Assist with ongoing litigation",
    budget_cents: 1000000,
    created_at: "2025-01-03T00:00:00Z",
    updated_at: "2025-01-03T00:00:00Z",
  },
];

const mockProfile = {
  id: "user-1",
  firm_id: "firm-1",
  email: "vous@cabinet.com",
  name: "Test User",
  role: "admin",
  hourly_rate: 25000,
  avatar_r2_key: null,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
};

const mockAuthSession = {
  access_token: "mock-access-token",
  token_type: "bearer",
  expires_in: 3600,
  refresh_token: "mock-refresh-token",
  user: {
    id: "user-1",
    aud: "authenticated",
    role: "authenticated",
    email: "vous@cabinet.com",
    email_confirmed_at: "2025-01-01T00:00:00Z",
    phone: "",
    phone_confirmed_at: null,
    user_metadata: {},
    app_metadata: {},
    identities: null,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
};

export const handlers = [
  // Auth handlers
  http.post(`${SUPABASE_URL}/auth/v1/token`, async ({ request }) => {
    const body = await request.json() as Record<string, string>;

    if (
      body.email === "vous@cabinet.com" &&
      body.password === "password"
    ) {
      return HttpResponse.json(mockAuthSession);
    }

    return HttpResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    );
  }),

  http.post(`${SUPABASE_URL}/auth/v1/logout`, () => {
    return HttpResponse.json({});
  }),

  http.get(`${SUPABASE_URL}/auth/v1/user`, ({ request }) => {
    const authHeader = request.headers.get("authorization");
    if (authHeader?.includes("mock-access-token")) {
      return HttpResponse.json(mockAuthSession.user);
    }
    return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
  }),

  // Clients endpoints
  http.get(`${SUPABASE_URL}/rest/v1/clients`, ({ request }) => {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return HttpResponse.json(mockClients);
  }),

  http.get(`${SUPABASE_URL}/rest/v1/clients/:id`, ({ params, request }) => {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = mockClients.find((c) => c.id === params.id);
    if (!client) {
      return HttpResponse.json(
        { error: "Not found" },
        { status: 404 }
      );
    }
    return HttpResponse.json(client);
  }),

  http.post(`${SUPABASE_URL}/rest/v1/clients`, async ({ request }) => {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const newClient = await request.json();
    const client = {
      id: String(mockClients.length + 1),
      ...newClient,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockClients.push(client);
    return HttpResponse.json(client, { status: 201 });
  }),

  // Matters endpoints
  http.get(`${SUPABASE_URL}/rest/v1/matters`, ({ request }) => {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return HttpResponse.json(mockMatters);
  }),

  http.get(`${SUPABASE_URL}/rest/v1/matters/:id`, ({ params, request }) => {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const matter = mockMatters.find((m) => m.id === params.id);
    if (!matter) {
      return HttpResponse.json(
        { error: "Not found" },
        { status: 404 }
      );
    }
    return HttpResponse.json(matter);
  }),

  // Profiles endpoints
  http.get(`${SUPABASE_URL}/rest/v1/profiles/:id`, ({ params, request }) => {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (params.id === mockProfile.id) {
      return HttpResponse.json(mockProfile);
    }

    return HttpResponse.json(
      { error: "Not found" },
      { status: 404 }
    );
  }),

  http.patch(`${SUPABASE_URL}/rest/v1/profiles/:id`, async ({ params, request }) => {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (params.id !== mockProfile.id) {
      return HttpResponse.json(
        { error: "Not found" },
        { status: 404 }
      );
    }

    const updates = await request.json();
    const updated = {
      ...mockProfile,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    return HttpResponse.json(updated);
  }),
];
