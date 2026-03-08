# Getting Started with Mantra

Quick start guide to get up and running with the Mantra monorepo.

---

## 📋 Prerequisites

- **Node.js** ≥18 ([download](https://nodejs.org))
- **npm** ≥9 (comes with Node.js)
- **Git** (for version control)
- **Code Editor** (VS Code recommended)

---

## 🚀 Quick Start (5 minutes)

### 1. Clone & Install

```bash
git clone https://github.com/mantrasaas/mantra.git
cd mantra
npm install
```

### 2. Setup Environment

```bash
cp .env.example .env.local
# (No changes needed for local development with mocked data)
```

### 3. Start Frontend

```bash
npm run dev
```

Then open [http://localhost:8080](http://localhost:8080) in your browser.

**That's it!** 🎉

---

## 📚 What's Next?

### Explore the Application

1. **Dashboard** — Overview of clients, matters, and financials
2. **Clients** — Manage client information
3. **Matters** — Track legal cases and budgets
4. **Finance** — View financial metrics and generate invoices
5. **Team** — Manage firm collaborators
6. **Settings** — Configure firm information

All data is mocked and will reset on refresh.

### Read Documentation

- **[Architecture](../ARCHITECTURE.md)** — How the app is structured
- **[Development Guide](../DEVELOPMENT.md)** — How to develop locally
- **[Monorepo Guide](../MONOREPO.md)** — Workspace organization

### Common Tasks

#### Add a New Page

1. Create `apps/frontend/src/pages/NewPage.tsx`
2. Add route in `apps/frontend/src/App.tsx`
3. Add navigation link in `apps/frontend/src/components/nav/AppSidebar.tsx`

#### Add a Query Hook

1. Add function to `apps/frontend/src/data/repo.ts`
2. Add query key to `apps/frontend/src/data/query-keys.ts`
3. Add hook to `apps/frontend/src/data/hooks.ts`
4. Use in component with `const { data } = useYourData()`

#### Style with Tailwind

```tsx
<div className="flex items-center gap-4 p-6 rounded-lg bg-slate-50">
  <h1 className="text-2xl font-bold text-slate-900">Hello</h1>
</div>
```

#### Add a Form

```tsx
import * as z from "zod";
import { useForm } from "react-hook-form";

const schema = z.object({ name: z.string().min(1) });
const form = useForm({ resolver: zodResolver(schema), defaultValues: {} });
```

---

## 🧪 Testing

```bash
# Run tests once
npm run test

# Watch mode
npm run test:watch

# UI runner
npm run test -- --ui
```

Write tests in `src/**/*.test.ts` or `src/**/*.test.tsx`.

---

## 🔍 VS Code Setup (Recommended)

### Extensions

- **ESLint** — Real-time linting
- **Tailwind CSS IntelliSense** — CSS class completion
- **Prettier** — Code formatting
- **Thunder Client** or **REST Client** — API testing

### Settings

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

---

## 📁 File Structure Cheat Sheet

| Task | File |
|------|------|
| Add page | `src/pages/NewPage.tsx` |
| Add component | `src/components/{feature}/Component.tsx` |
| Add form | `src/components/{feature}/FormModal.tsx` |
| Add hook | `src/hooks/useYourHook.ts` |
| Add utility | `src/lib/utility.ts` |
| Add test | `src/**/*.test.tsx` |
| Add mock data | `src/lib/mock-{entity}.ts` |
| Update types | `src/types/index.ts` |

---

## ⌨️ Keyboard Shortcuts

### VS Code
- `Ctrl+Shift+P` — Command palette
- `Ctrl+P` — Quick file open
- `Ctrl+H` — Find & replace
- `Ctrl+K Ctrl+C` — Comment line

### Browser (DevTools)
- `F12` — Open DevTools
- `Ctrl+Shift+I` — Open DevTools
- `Ctrl+Shift+C` — Element picker

---

## 🐛 Troubleshooting

### Port 8080 Already in Use

```bash
# Find and kill process
lsof -i :8080 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### Dependencies Won't Install

```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

```bash
npx tsc --noEmit
```

### Tests Failing

```bash
npm run test -- --clearCache
```

---

## 📞 Getting Help

### Resources

- **[README](../README.md)** — Full project overview
- **[Architecture](../ARCHITECTURE.md)** — Technical deep dive
- **[Development Guide](../DEVELOPMENT.md)** — Development patterns
- **[React Docs](https://react.dev)** — React fundamentals
- **[TypeScript Handbook](https://www.typescriptlang.org/docs)** — TS reference

### Commands

```bash
# Check available npm scripts
npm run

# List installed packages
npm list

# Check for outdated packages
npm outdated
```

---

## ✅ Checklist

- [ ] Node.js ≥18 installed
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] `.env.local` created
- [ ] Frontend running (`npm run dev`)
- [ ] Browser open at http://localhost:8080
- [ ] Can see dashboard with mock data
- [ ] Read README.md
- [ ] Read ARCHITECTURE.md

---

## 🎯 Next Steps

1. **Explore codebase** — Open files, understand patterns
2. **Make a small change** — Add a button, modify a label
3. **Run tests** — Make sure everything still works
4. **Read ARCHITECTURE.md** — Understand the design
5. **Follow the patterns** — Use existing components as examples
6. **Build features** — Start implementing

---

## 💡 Pro Tips

1. **Use React DevTools** — Inspect components and state
2. **Use Browser DevTools** — Debug JavaScript and network
3. **Use TypeScript** — It catches errors before runtime
4. **Write tests** — Especially for logic and edge cases
5. **Read commit history** — Learn from past changes
6. **Ask questions** — Check GitHub discussions

---

**Happy coding!** 🚀

---

*Last Updated: March 2026*
