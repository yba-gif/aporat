

## Plan: Clean up V3 TopBar

**What**: Remove the notification bell (with badge) and the user avatar/initials from the right side of the top bar, since these are already present in the left sidebar.

**Changes** — single file `src/components/v3/V3TopBar.tsx`:

1. Remove the `Bell` import and `supabase` import (no longer needed for user initials)
2. Remove the `initials` state and `useEffect` that fetches user email
3. Remove the entire right-side `div` (lines 72-89) containing the bell button and avatar
4. Change layout from `justify-between` to `justify-between` with just breadcrumb + search (or use a simpler flex layout with the search pushed right via `ml-auto`)

The top bar will retain only the breadcrumb and the search button.

