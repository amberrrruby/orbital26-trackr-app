- text highlight color is bad
- (warn) applications page: switching status changes layout of header, might want to fix the header column.
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
