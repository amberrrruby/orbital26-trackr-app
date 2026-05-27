- unify "go back" button logic / breadcrumbing
- further check and split DB retrieval logic: make them all be in `/app/actions` but not on the TSX page itself
- `TODO: RESUME` laid down, grep to check for changes
- page.tsx and ApplicationTable.tsx - where to place data fetching logic? if there are other components to render on page.tsx? use client directive where?
- audit and decision needed: in server actions, do I redirect if unauthorized, or do I throw AppError? when is AppAuthError used?
- settings UI: some hardcoded UI components, for example toast. replace UI hardcodes before the palette page commit
- page for runtime errors, loading (async loading AND page switching loading), http method errors to cover the nextjs defaults
- make sure all entities have @unique marked in `schema.prisma` for better lookup
- should server action authentication wrappers redirect straight away, or return some error? (currently most do redirect)

26/05/2026:
Planning implemention for resumes: backend fetching, displaying on frontend, infinite scroll component
Reminder: cleanup actions file, currently too granular "one file per method"
just throw or Result for UI-ing the error?

27/05/2026:
Thinking about how to present errors - error pages? toasts?

    - error.tsx as a fallback (pending), and a parameterized `<ErrorDisplay />` component.

Planning action for Resume creations: upload file, generate thumbnail, then only submitting the form data.
Finding a suitable provider for thumbnail generation.
6 hours on resume CRUD
