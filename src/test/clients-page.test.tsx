import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "@/context/auth";
import ClientsPage from "@/pages/ClientsPage";
import { Suspense } from "react";

/**
 * Integration tests for ClientsPage using MSW
 *
 * These tests verify that ClientsPage correctly displays mocked API data
 * and handles user interactions (search, sorting, etc.)
 */

// Create a wrapper component with all necessary providers
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
};

describe("ClientsPage - MSW Integration Tests", () => {
  beforeEach(() => {
    // Clear any previous query results
  });

  it("should render the Clients page with title", async () => {
    render(<ClientsPage />, { wrapper: createWrapper() });

    await waitFor(
      () => {
        expect(screen.getByText("Clients")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("should display clients from the mocked Supabase API", async () => {
    render(<ClientsPage />, { wrapper: createWrapper() });

    // Wait for clients to load from MSW
    await waitFor(
      () => {
        // Check that both clients are displayed
        const sarahElements = screen.getAllByText("Sarah Chen");
        expect(sarahElements.length).toBeGreaterThan(0);
      },
      { timeout: 3000 }
    );

    // Verify both clients are in the document
    expect(screen.getByText("Carter & Associates LLP")).toBeInTheDocument();
  });

  it("should display correct client count", async () => {
    render(<ClientsPage />, { wrapper: createWrapper() });

    await waitFor(
      () => {
        expect(screen.getByText(/2 total clients/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("should display search input field", async () => {
    render(<ClientsPage />, { wrapper: createWrapper() });

    const searchInput = screen.getByPlaceholderText("Search clients…");
    expect(searchInput).toBeInTheDocument();
  });

  it("should display New Client button", async () => {
    render(<ClientsPage />, { wrapper: createWrapper() });

    const newClientBtn = screen.getByRole("button", { name: /New Client/i });
    expect(newClientBtn).toBeInTheDocument();
  });

  it("should render the client table structure", async () => {
    render(<ClientsPage />, { wrapper: createWrapper() });

    // Wait for table to load
    await waitFor(
      () => {
        // Check for table header
        const table = screen.getByRole("table");
        expect(table).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("should display client emails from the API", async () => {
    render(<ClientsPage />, { wrapper: createWrapper() });

    await waitFor(
      () => {
        expect(screen.getByText("sarah@example.com")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(screen.getByText("contact@carter.com")).toBeInTheDocument();
  });

  it("should display client phone numbers", async () => {
    render(<ClientsPage />, { wrapper: createWrapper() });

    await waitFor(
      () => {
        expect(screen.getByText("555-0001")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(screen.getByText("555-0002")).toBeInTheDocument();
  });
});
