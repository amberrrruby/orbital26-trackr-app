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

Todo: `layout.tsx`:

```typescript
export const metadata: Metadata = {
  title: "Trackr",
  description: "Trackr Description", // TODO: change
};
```

To implementers: **please check `/components` for components, and `/palette/page.tsx` for implementation examples if needed**
