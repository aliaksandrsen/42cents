# 42cents - AI agent instructions

Purpose: capture the repo's real patterns so agents can ship changes fast. Stay factual—reflect what exists today.

## Stack & layout

- Next.js App Router (src/app), React 19, Tailwind v4, shadcn-style UI in `src/components/ui/*`.
- Auth: Clerk. `src/middleware.ts` protects `/dashboard(.*)`; `RootLayout` wires `ClerkProvider`, `SignedIn/Out`.
- Data: Postgres via Drizzle ORM + Neon HTTP driver. Config in `drizzle.config.ts`; schema in `src/db/schema.ts`; client in `src/db/index.ts`.
- TS path alias: `@/*` → `src/*`.

## Domain model

- `categories(id, name, type 'income'|'expense')`
- `transactions(id, userId, description, amount NUMERIC, transactionDate DATE, categoryId FK)`
  - NUMERIC is handled as string in Drizzle; server converts number → `toString()` before insert.

## Data flow pattern

- Server loaders in `src/data/*` are server-only (import `server-only`). Example: `getCategories()`.
- Server page fetches, passes plain props to a client form.
  - Example: `app/dashboard/transactions/new/page.tsx` → `getCategories()` → `<NewTransactionForm categories={...} />`.
- Client forms use `react-hook-form` + `zod` with custom wrappers in `src/components/ui/form.tsx`.
  - Selects use string values; coerce to numbers with `z.coerce.number()`; set `value={String(field.value)}`.
  - Dates in the form are `Date`; format to `yyyy-MM-dd` before server calls using `date-fns/format`.
- Server Actions colocated with pages (e.g., `app/.../actions.ts`): `'use server'` + `auth()` + zod validation + Drizzle insert.
  - Example: `createTransaction` returns `{ id }` or `{ error, message }` and persists with `amount: data.amount.toString()`.

## Validation

- Client-side schema (UX): `transactionFormSchema` in `components/transaction-form.tsx` includes UI-only `transactionType`.
- Server-side source of truth: `validation/transactionSchema.ts` (date bounds, lengths, positivity). Never trust client-only fields.

## Auth & routing

- `/dashboard/**` requires auth via middleware. In server actions read `const { userId } = await auth()`; return an error object if missing.

## Workflows

- Dev/Build/Lint: `npm run dev`, `npm run build`, `npm start`, `npm run lint` (see `package.json`).
- Drizzle: schema lives in TS; `drizzle.config.ts` points to `./src/db/schema.ts` and outputs to `./drizzle`. Use Drizzle Kit to generate/apply SQL with `DATABASE_URL` set.
- Seed: `src/seed.ts` inserts default categories using the Neon HTTP driver; run it after provisioning DB and setting `DATABASE_URL`.
- Env: requires `DATABASE_URL` and Clerk env vars for Next.js integration.

## Gotchas

- Keep `db` access and `src/data/*` imports on the server. Don't import them in client components.
- `transactionType` is a UI filter only; it is not persisted.
- Always coerce numbers from select inputs; react-hook-form fields are strings by default.
- Dates: client blocks future; server schema enforces min/max. Persist as `yyyy-MM-dd`.

## Extending features (happy-path checklist)

1. Update `src/db/schema.ts` and run Drizzle migrations;
2. Add server zod schema in `src/validation/*`;
3. Implement a server action with `'use server'` + Clerk auth;
4. Build a form with `ui/form` wrappers;
5. Fetch on the server (`src/data/*`) and pass props to the client form.
