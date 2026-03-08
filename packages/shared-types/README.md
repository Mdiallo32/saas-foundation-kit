# Shared Types

Shared TypeScript types used across frontend and backend.

## Usage

### Frontend
```ts
import { Client, Matter, Invoice } from "@mantra/shared-types";

function renderClient(client: Client) {
  return <h1>{client.name}</h1>;
}
```

### Backend
```ts
import { Client, Matter } from "@mantra/shared-types";

app.post("/clients", async (req) => {
  const client: Client = {
    id: crypto.randomUUID(),
    name: req.body.name,
    email: req.body.email,
    // ...
  };
});
```

## Types Included

- `Client` — Firm client
- `Matter` — Legal matter/case
- `Invoice` — Invoice document
- `Timesheet` — Billable hours
- `Collaborator` — Team member
- `User` — Authenticated user
- `Role` — Role type: "admin" | "lawyer" | "billing"

See `src/types/` for detailed definitions.

---

**Status**: Stable (updated as data models change)
