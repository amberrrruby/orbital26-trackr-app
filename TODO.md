- unify "go back" button logic / breadcrumbing
- further check and split DB retrieval logic: make them all be in `/app/actions` but not on the TSX page itself
- settings UI: some hardcoded UI components, for example toast. replace UI hardcodes before the palette page commit
- page for runtime errors, loading (async loading AND page switching loading), http method errors to cover the nextjs defaults

- text highlight color is bad
- (nitpick) applications page: switching status changes layout of header, might want to fix the header column.
- ux: clicking on the applications row should bring to details page.
- add appl:
  - status dropdown box and pill highlights don't align. seems like it might be taken straight from edit modal?
- edit appl:
  - ux: clicking outside modal should exit. currently: doesn't
  - ux: no success feedback

- `/applications/page.tsx` UI error component required

click-user-icon-popup window still covered

icon border fix

clicking outside modal:

- still able to access beyond modal, as if it's a popup not a modal
- no ux: click beyond modal to quit

mini issue: filter-by-status none should also show message, but different

Unify `FAILURE` error message instead of writing `"Something went wrong"` everywhere?

Add resume page: "comma separated" text is larger than "tags" text - fix

Resume display notes: better formatting for `\n`
