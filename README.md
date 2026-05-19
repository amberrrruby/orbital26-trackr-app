# Orbital 26 Trackr app

Notes:

- Vitest, Playwright, CI setup are AI-suggested templates - will tweak in the future as required.
- Migrations use 5432 for now since 6543 doesn't seem to connect. Fix: `prisma.config.ts` `datasource`.
- Use `./lib/env` for checked env-vars.
