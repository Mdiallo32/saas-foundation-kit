# Development Guide

Comprehensive guide for developing Mantra locally and understanding the codebase.

---

## Table of Contents

1. [Local Setup](#local-setup)
2. [Project Structure Navigation](#project-structure-navigation)
3. [Common Tasks](#common-tasks)
4. [Debugging](#debugging)
5. [Code Style & Conventions](#code-style--conventions)
6. [Testing](#testing)
7. [Git Workflow](#git-workflow)

---

## Local Setup

### Prerequisites

```bash
# Check Node.js version (need 18+)
node --version

# Check npm version (need 9+)
npm --version

# Optional: pnpm for faster installs
npm install -g pnpm
```

### First Time Setup

```bash
# 1. Clone repository
git clone https://github.com/mantrasaas/mantra.git
cd mantra

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env.local

# 4. Start development server
npm run dev

# Opens at http://localhost:8080
```

### Project Root Scripts

```bash
# Frontend
npm run dev              # Start frontend on 8080
npm run build            # Production build
npm run preview          # Preview production build
npm run lint             # Lint code
npm run test             # Run tests once
npm run test:watch      # Watch mode

# Backend (when started)
npm run dev:backend     # Start backend on 3001
npm run build:backend   # Build backend
```

---

## Project Structure Navigation

### Frontend (`apps/frontend/`)

```
src/
├── components/
│   ├── ui/                      # shadcn/ui components
│   │   └── button.tsx           # Use <Button /> in forms
│   ├── boundaries/              # Error + suspense boundaries
│   │   ├── page-boundary.tsx   # Wrap all pages
│   │   └── api-error-boundary.tsx
│   ├── clients/                 # Client-specific UI
│   │   ├── ClientTable.tsx      # List view
│   │   ├── ClientFormModal.tsx  # Create/edit
│   │   └── ClientDetailCard.tsx # Detail view
│   ├── dashboard/               # Home page
│   ├── finance/                 # Finance dashboard
│   ├── invoices/                # Invoice UI
│   ├── matters/                 # Matter management
│   ├── nav/                     # Navigation UI
│   ├── settings/                # Settings forms
│   └── team/                    # Team management
├── data/
│   ├── repo.ts                  # Mock repository
│   ├── hooks.ts                 # TanStack Query hooks
│   └── query-keys.ts            # Query key definitions
├── context/
│   ├── auth.tsx                 # Auth context
│   └── theme.tsx                # Theme context (future)
├── hooks/                       # Custom React hooks
├── layouts/
│   ├── AppLayout.tsx            # Main layout (sidebar + content)
│   └── AuthLayout.tsx           # Login layout (future)
├── lib/
│   ├── utils.ts                 # cn() utility
│   ├── money.ts                 # EUR formatting
│   ├── id-generators.ts         # ID creation
│   ├── mock-clients.ts          # Mock data
│   ├── mock-matters.ts          # Mock data
│   └── mock-team.ts             # Mock data
├── pages/                       # Route pages
│   ├── Index.tsx                # Home/dashboard
│   ├── ClientsPage.tsx          # Clients list
│   ├── ClientDetailPage.tsx     # Client detail
│   ├── MattersPage.tsx          # Matters list
│   ├── MatterDetailPage.tsx     # Matter detail
│   ├── FinancePage.tsx          # Finance dashboard
│   ├── InvoiceDetailPage.tsx    # Invoice detail
│   ├── TeamPage.tsx             # Team management
│   ├── SettingsPage.tsx         # Settings
│   ├── ProfilePage.tsx          # User profile
│   ├── LoginPage.tsx            # Login (future)
│   └── NotFound.tsx             # 404
├── types/
│   └── index.ts                 # TypeScript definitions
├── test/
│   ├── setup.ts                 # Test configuration
│   └── mocks/                   # Test utilities
├── App.tsx                      # Root routes
└── main.tsx                     # Entry point
```

### When to Edit What

| Task | File |
|------|------|
| Add new page | `src/pages/NewPage.tsx` |
| Add form | `src/components/{domain}/FormModal.tsx` |
| Add UI widget | `src/components/ui/{component}.tsx` (via shadcn) |
| Add data query | `src/data/hooks.ts` |
| Add mock data | `src/lib/mock-{domain}.ts` |
| Update types | `src/types/index.ts` |
| Add custom hook | `src/hooks/use{Name}.ts` |
| Add utility | `src/lib/{utility}.ts` |

---

## Common Tasks

### Add a New Page

1. **Create page component**:
   ```tsx
   // apps/frontend/src/pages/NewPage.tsx
   import { PageBoundary } from "@/components/boundaries/page-boundary";
   import { useNewData } from "@/data/hooks";

   export default function NewPage() {
     const { data } = useNewData();

     return (
       <PageBoundary>
         <div>
           <h1>New Page</h1>
           {/* Content */}
         </div>
       </PageBoundary>
     );
   }
   ```

2. **Add route**:
   ```tsx
   // apps/frontend/src/App.tsx
   import NewPage from "@/pages/NewPage";

   export default function App() {
     return (
       <BrowserRouter>
         <Routes>
           {/* ... */}
           <Route path="/new" element={<NewPage />} />
         </Routes>
       </BrowserRouter>
     );
   }
   ```

3. **Add navigation link**:
   ```tsx
   // apps/frontend/src/components/nav/AppSidebar.tsx
   <Link to="/new">New</Link>
   ```

### Add a New Query

1. **Create repository function**:
   ```tsx
   // apps/frontend/src/data/repo.ts
   export async function listNewItems() {
     await delay(500); // Simulate network
     return store.newItems || [];
   }
   ```

2. **Add query key**:
   ```ts
   // apps/frontend/src/data/query-keys.ts
   export const QUERY_KEYS = {
     newItems: ["newItems"] as const,
     newItem: (id: string) => ["newItem", id] as const,
   };
   ```

3. **Create hook**:
   ```tsx
   // apps/frontend/src/data/hooks.ts
   export const useNewItems = () => {
     return useSuspenseQuery({
       queryKey: QUERY_KEYS.newItems,
       queryFn: repo.listNewItems,
       ...QUERY_RETRY,
     });
   };
   ```

4. **Use in component**:
   ```tsx
   const { data: items } = useNewItems();
   ```

### Add a New Form

1. **Define Zod schema**:
   ```tsx
   import * as z from "zod";

   const formSchema = z.object({
     name: z.string().min(1, "Name is required"),
     email: z.string().email("Invalid email"),
   });

   type FormData = z.infer<typeof formSchema>;
   ```

2. **Create form component**:
   ```tsx
   import { useForm } from "react-hook-form";
   import { zodResolver } from "@hookform/resolvers/zod";
   import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

   export function NewForm({ onSubmit }: { onSubmit: (data: FormData) => void }) {
     const form = useForm<FormData>({
       resolver: zodResolver(formSchema),
       defaultValues: { name: "", email: "" },
     });

     return (
       <Form {...form}>
         <form onSubmit={form.handleSubmit(onSubmit)}>
           <FormField
             control={form.control}
             name="name"
             render={({ field }) => (
               <FormItem>
                 <FormLabel>Name</FormLabel>
                 <FormControl>
                   <Input {...field} />
                 </FormControl>
                 <FormMessage />
               </FormItem>
             )}
           />
           <Button type="submit">Submit</Button>
         </form>
       </Form>
     );
   }
   ```

### Add a shadcn Component

```bash
# Add component to project
npx shadcn-ui@latest add button

# Component installed to apps/frontend/src/components/ui/
```

### Add a Type

```tsx
// apps/frontend/src/types/index.ts

export interface NewItem {
  id: string;
  name: string;
  createdAt: Date;
}
```

### Update Mock Data

```tsx
// apps/frontend/src/lib/mock-items.ts

export const MOCK_ITEMS: Item[] = [
  {
    id: "item-1",
    name: "Item 1",
    createdAt: new Date(),
  },
];
```

Then use in repo:

```tsx
// apps/frontend/src/data/repo.ts
import { MOCK_ITEMS } from "@/lib/mock-items";

const store = {
  items: [...MOCK_ITEMS],
};
```

---

## Debugging

### Browser DevTools

1. **React DevTools Extension**:
   ```
   Chrome: Install "React Developer Tools"
   Firefox: Install "React Developer Tools"
   ```
   Then inspect components, props, hooks state.

2. **Console**:
   ```tsx
   // Add anywhere in React code
   console.log("Value:", value);

   // In mounted component
   useEffect(() => {
     console.log("Component mounted");
   }, []);
   ```

### Network Debugging

1. **Open DevTools** → Network tab
2. **Filter** for XHR requests
3. **Check** request/response payloads

### Component State

```tsx
// Use React DevTools profiler
// Or log in component

function MyComponent() {
  const [value, setValue] = useState("");

  console.log("Current value:", value);

  return <input value={value} onChange={(e) => setValue(e.target.value)} />;
}
```

### Query State

```tsx
// Apps/frontend/src/data/hooks.ts
const { data, isLoading, error } = useClients();

console.log("Loading:", isLoading);
console.log("Error:", error);
console.log("Data:", data);
```

### Local Storage

```tsx
// In browser console
localStorage.getItem("firm_settings")
localStorage.setItem("firm_settings", JSON.stringify({...}))
localStorage.removeItem("firm_settings")
localStorage.clear()
```

---

## Code Style & Conventions

### File Naming

```
Components:         PascalCase          ClientTable.tsx
Pages:              PascalCase          ClientsPage.tsx
Hooks:              camelCase           useClients.ts
Utilities:          camelCase           formatMoney.ts
Types/Interfaces:   PascalCase          Client.ts
Constants:          UPPER_SNAKE_CASE    QUERY_KEYS.ts
```

### Component Structure

```tsx
// 1. Imports
import { useState } from "react";
import { useClients } from "@/data/hooks";
import { Button } from "@/components/ui/button";

// 2. Types (if needed)
interface Props {
  clientId: string;
}

// 3. Component
export function MyComponent({ clientId }: Props) {
  // 4. State
  const [isOpen, setIsOpen] = useState(false);

  // 5. Data hooks
  const { data: client } = useClient(clientId);

  // 6. Handlers
  const handleClick = () => {
    setIsOpen(true);
  };

  // 7. Render
  return (
    <div>
      <h1>{client.name}</h1>
      <Button onClick={handleClick}>Open</Button>
    </div>
  );
}
```

### Styling

```tsx
// ✅ Good: Use cn() for conditional classes
<Button className={cn("px-4", isActive && "bg-blue-500")} />

// ✅ Good: Tailwind utilities
<div className="flex items-center gap-4 p-6">

// ❌ Bad: Inline styles
<div style={{ display: "flex", gap: "16px" }} />

// ❌ Bad: Global CSS classes
<div className="my-custom-class" />
```

### TypeScript

```tsx
// ✅ Good: Type function parameters
function formatMoney(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}

// ✅ Good: Type hook returns
export function useClients() {
  const query = useSuspenseQuery<Client[]>(/*...*/);
  return query;
}

// ❌ Bad: any type
const value: any = "string";

// ❌ Bad: Implicit any
function formatMoney(cents) { }
```

### Error Messages

```tsx
// ✅ Good: User-friendly, actionable
"Email address is required"
"Hourly rate must be between €50 and €500"

// ❌ Bad: Technical jargon
"INVALID_FORM_SUBMISSION"
"Missing required field: email"
```

### Exports

```tsx
// ✅ Good: Named exports (easier to refactor)
export function Button() { }
export function Input() { }

import { Button, Input } from "@/components/ui";

// ❌ Avoid: Default exports (harder to refactor)
export default function Button() { }

import Button from "@/components/ui/button";
```

---

## Testing

### Running Tests

```bash
# All tests
npm run test

# Watch mode (re-run on changes)
npm run test:watch

# Single file
npx vitest run src/components/__tests__/ClientTable.test.tsx

# With UI runner
npm run test -- --ui
```

### Writing Tests

```tsx
// apps/frontend/src/components/__tests__/ClientTable.test.tsx

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ClientTable } from "@/components/clients/ClientTable";

describe("ClientTable", () => {
  const mockClients = [
    { id: "1", name: "Sarah Chen", email: "sarah@example.com" },
  ];

  it("renders client list", () => {
    render(<ClientTable clients={mockClients} />);

    expect(screen.getByText("Sarah Chen")).toBeInTheDocument();
  });

  it("shows empty state when no clients", () => {
    render(<ClientTable clients={[]} />);

    expect(screen.getByText("No clients found")).toBeInTheDocument();
  });
});
```

### Test Best Practices

1. **Test behavior, not implementation**:
   ```tsx
   // ✅ Good: Test what user sees
   expect(screen.getByText("Sarah Chen")).toBeInTheDocument();

   // ❌ Bad: Test internal state
   expect(component.state.clients.length).toBe(1);
   ```

2. **Use semantic queries**:
   ```tsx
   // ✅ Good: How user finds elements
   screen.getByRole("button", { name: "Save" })
   screen.getByLabelText("Email")
   screen.getByText("Client Name")

   // ❌ Bad: Implementation details
   screen.getByTestId("save-btn")
   container.querySelector(".client-form")
   ```

3. **Test error cases**:
   ```tsx
   it("shows error when API fails", async () => {
     // Mock failed query
     const { rerender } = render(<Component />);

     // Wait for error state
     expect(screen.getByText("Failed to load")).toBeInTheDocument();
   });
   ```

---

## Git Workflow

### Branch Naming

```bash
# Features
git checkout -b feat/new-feature

# Bug fixes
git checkout -b fix/broken-thing

# Maintenance
git checkout -b chore/update-deps
```

### Commit Messages

```bash
# Features
git commit -m "feat: add client form validation"

# Fixes
git commit -m "fix: prevent duplicate client creation"

# Docs
git commit -m "docs: update README with API examples"

# Tests
git commit -m "test: add ClientTable unit tests"

# Refactoring (no behavior change)
git commit -m "refactor: simplify useClients hook"
```

### Pull Requests

1. **Push branch**:
   ```bash
   git push -u origin feat/my-feature
   ```

2. **Create PR on GitHub**:
   - Clear title
   - Description of changes
   - Link to issues
   - Screenshot if UI change

3. **Code review**:
   - Address feedback
   - Update PR with new commits
   - Merge when approved

### Before Committing

```bash
# Check code style
npm run lint

# Run tests
npm run test

# Review changes
git diff
```

---

## Keyboard Shortcuts

### VS Code

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+P` | Command palette |
| `Ctrl+P` | Quick file open |
| `Ctrl+H` | Find and replace |
| `Ctrl+K Ctrl+C` | Comment line |
| `Shift+Alt+Down` | Copy line down |
| `Ctrl+Shift+K` | Delete line |

### Browser DevTools

| Shortcut | Action |
|----------|--------|
| `F12` | Toggle DevTools |
| `Ctrl+Shift+I` | Open DevTools |
| `Ctrl+Shift+C` | Element picker |
| `Ctrl+Shift+J` | Console |

---

## Performance Tips

### Development Performance

1. **Use HMR** (hot module reload) — Changes appear instantly
2. **React DevTools** — Profile components
3. **Network throttling** — Chrome DevTools → Network tab
4. **Console logs** — Remove before commit

### Production Performance

1. **Production build** — `npm run build` (optimizes bundle)
2. **Disable React Strict Mode** — Only for dev
3. **Code splitting** — Routes loaded on-demand
4. **Image optimization** — Use WebP format

---

## Troubleshooting

### Port in Use

```bash
# macOS/Linux
lsof -i :8080 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### Dependencies Broken

```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

```bash
# Rebuild
npx tsc --noEmit

# Clear cache
rm -rf node_modules/.vite
```

### Tests Failing

```bash
# Clear Vitest cache
npm run test -- --clearCache

# Run single test
npx vitest run specific-test.test.ts
```

---

**Last Updated**: March 2026
