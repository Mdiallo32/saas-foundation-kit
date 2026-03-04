# Mantra: Legal Practice Management (AS-IS)

A robust, modern SaaS applications, specifically tailored for **Legal Practice Management** but adaptable for any service-based business. 

## Project Overview

This project provides a comprehensive dashboard for managing clients, matters, team members, and financial invoicing. It is built as a **Single Page Application (SPA)** with a focus on ease of use, clean design, and a solid developer experience.

> [!NOTE]
> This project currently operates in a **Mocked State**. Data is managed in-memory with persistence to `localStorage` for certain settings, making it an ideal starting point for full backend integration.

---

## 🚀 Key Features

### 👥 Client & Matter Management
- **Centralized Client Database**: Complete CRUD operations for client profiles.
- **Matter Tracking**: Manage legal matters (projects) with detailed views, status tracking, and budget monitoring.
- **Matter Details**: Deep-dive into specific matters, including budget utilization (Budget Used vs. Total Budget).

### 💳 Finance & Invoices
- **Financial Dashboard**: Overview of key financial metrics like Monthly Revenue and Pending Invoices.
- **Invoice Generation**: Create **Provision Invoices** with automatic reference generation.
- **Invoice Lifecycle**: Track status from "Draft" to "Sent" and "Paid". 
- **Global Financial Settings**: Support for EUR (€) formatting, customizable VAT rates, and payment terms.

### 👥 Team & Roles
- **Team Management**: List and manage collaborators.
- **Role-Based Views**: Support for role-based logic (Admin/Lawyer).
- **Recent Update**: The legacy "Master" role has been unified into the "Admin" role for better consistency.

### ⚙️ Firm Settings
- **Identity & Contact**: Manage Firm Name, Slogan, Address, and Contact info.
- **Financial Options**: Configure Invoice Prefix, Footer text, Default VAT rate, and Payment terms (Days).

---

## 🛠️ Technology Stack

| Category | Technology |
| :--- | :--- |
| **Frontend Framework** | [Vite](https://vitejs.dev/) + [React 18](https://reactjs.org/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com/) (based on Radix UI) |
| **Data Fetching** | [TanStack Query v5](https://tanstack.com/query/latest) (React Query) |
| **Navigation** | [React Router DOM v6](https://reactrouter.com/) |
| **Forms & Validation** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| **Testing** | [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) |

---

## 📁 Project Structure

```text
src/
├── components/   # UI components (shadcn/ui + custom)
│   ├── boundaries/   # Error & Page loading boundaries
│   ├── dashboard/    # Index/Home page components
│   ├── shared/       # Reusable layout elements
│   └── ui/           # Basic UI primitives (Button, Input, etc.)
├── data/         # Data management (Query hooks & Mock Repository)
├── hooks/        # Custom React hooks
├── layouts/      # Main Application Layouts (Sidebar, Header)
├── lib/          # Utilities (Formatting, Mock data, Constants)
├── pages/        # Application views (Index, Clients, Finance, etc.)
├── types/        # TypeScript definitions
└── App.tsx       # Main router and provider configuration
```

---

## 💻 Getting Started

1. **Install Dependencies**:
   ```sh
   npm install
   ```

2. **Run Development Server**:
   ```sh
   npm run dev
   ```

3. **Run Tests**:
   ```sh
   npm run test
   ```

## 📝 Roadmap & AS-IS State
Currently, all data is managed via the `src/data/repo.ts` module which simulates an API with in-memory storage and `localStorage`. 

- **AS-IS Role Logic**: User roles are "Admin" and "Lawyer".
- **AS-IS Currency**: Hardcoded to **EUR (€)**.
- **AS-IS Data**: Populated with mock clients (Sarah Chen, Carter & Associates LLP, etc.) for demonstration.

---
