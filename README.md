# Orbital 26 Trackr app

Notes:

- Vitest, Playwright, CI setup are AI-suggested templates - will tweak in the future as required.
- Migrations use 5432 for now since 6543 doesn't seem to connect. Fix: `prisma.config.ts` `datasource`.
- Use `./lib/env` for checked env-vars.

Test user:

```
some.user@test.mail
S0M3testP@$$W0RD
```

Todo: Make a separate database for testing, and one for production release.

README pending update after push, will add and link issue.

Follow-ups:

- UI polish
- confirmation email link destination custom route
- form-level password validation (e.g. "your password is too weak")
- write tests for auth (email-password, google; change password and ensure all non-PW sessions have that component disabled; delete account, ensure all foreign key linked records are wiped)
