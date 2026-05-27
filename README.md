# Orbital 26 Trackr app

Notes:

- Vitest, Playwright, CI setup are AI-suggested templates - will tweak in the future as required.
- Migrations use 5432 for now since 6543 doesn't seem to connect. Fix: `prisma.config.ts` `datasource`.
- Use `@/lib/env` for checked env-vars.

Test user:

```
some.user@test.mail
S0M3testP@$$W0RD
```

# THIS COMMIT IS A SCAFFOLD FOR RESUME CRUD, WHEN THE SCHEMA IS NOT YET FINALIZED.

Todos:

- IMPORTANT: find a thumbnail generation provider for PDF to complete resume creation workflow.
- unify "go back" button logic / breadcrumbing
- further check and split DB retrieval logic: make them all be in `/app/actions` but not on the TSX page itself
- when resume schema added, recheck full route
- page.tsx and ApplicationTable.tsx - where to place data fetching logic? if there are other components to render on page.tsx? use client directive where?
  - data fetching belongs to the component (allows for streaming if multiple components on the page require long async). if interactivity needed:

  ```
  page.tsx WRAPS: (
    ServerComponent (fetching) WRAPS:
      ClientComponent (interactivity)
  )
  ```

- audit and decision needed: in server actions and auth wrappers, do I redirect if unauthorized, or do I throw AppError? when is AppAuthError used?
- settings UI: some hardcoded UI components, for example toast. replace UI hardcodes before the palette page commit
- page for runtime errors, loading (async loading AND page switching loading), http method errors to cover the nextjs defaults
- make sure all entities have @unique marked in `schema.prisma` for better lookup

---

- `layout.tsx`:

```typescript
export const metadata: Metadata = {
  title: "Trackr",
  description: "Trackr Description", // TODO: change
};
```

To implementers: **please check `/components` for components, and `/palette/page.tsx` for implementation examples if needed**
