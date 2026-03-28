

## Recommendation: Continue Development on `/v3`

### Why V3
V3 already implements all 9 modules from the PRD, both verticals (visa + defence), real auth, and the correct design language. The remaining gaps are primarily backend integration items that the frontend is already scaffolded to support.

### Remaining PRD Gaps to Close

**Frontend gaps (can build now):**
1. **OSINT Scanner real-time progress** — currently simulated with `setInterval`. PRD requires WebSocket-style live updates. Can simulate more realistically with streaming fetch.
2. **Document OCR field extraction view** — Documents tab exists but OCR extraction results are mock. Need richer extracted-fields display with confidence scores per field.
3. **Role-based routing** — PRD specifies admin/officer/supervisor roles with different access. V3 currently shows everything to all users. Need role gates on admin-only features (Settings > Team, system config).
4. **Audit log export** — PRD P1 requires exportable audit trail. Case history exists but no CSV/PDF export button.
5. **Bulk case import from CSV** — PRD P1 item. Not implemented.

**Backend gaps (need FastAPI deployment or edge functions):**
6. **Real OSINT scanning** — Sherlock/Maigret/Holehe integration exists in `/backend` but isn't deployed. Could create edge function proxies or deploy the Docker backend.
7. **Persistent case data** — all data is mock. Need database tables for cases, findings, scans, events.
8. **File upload storage** — document uploads are UI-only. Need storage bucket integration.

### Proposed Next Steps (Priority Order)

#### Step 1: Database Schema for V3
Create tables matching the PRD data model: `cases`, `osint_findings`, `case_documents`, `case_events`, `osint_scans`. Migrate from mock data to real database queries.

#### Step 2: Role-Based Access Control
Add `user_roles` table, create `has_role` function, gate Settings/Team and admin features behind role checks. Show role badge in sidebar from database.

#### Step 3: CRUD Operations
Wire case actions (approve/reject/escalate) to real database updates. Create case events on each action for audit trail. Add case creation flow.

#### Step 4: Document Upload
Use file storage for passport scans, bank statements. Track OCR status per document. Display extracted fields with confidence scores.

#### Step 5: Audit Log Export
Add CSV/PDF export for case history and system-wide audit trail.

#### Step 6: Edge Function OSINT
Create edge functions wrapping the OSINT scanning logic (or proxy to the FastAPI backend if deployed). Wire the Scanner page to trigger real scans.

### What to Do with `/p2` and `/platform`
- **`/platform`**: Archive or remove. Superseded by V3.
- **`/p2`**: Keep the B2C applicant portal (`/p2/apply/*`) if you want a public-facing application submission flow. The B2G dashboard portions are redundant with V3.

### Technical Notes
- Database tables will use Lovable Cloud (Supabase) with RLS policies
- Auth already works via Supabase — just need role assignment
- Mock data in `src/data/v3/mockData.ts` serves as the seeding reference for database migration
- No changes needed to the V3 UI architecture — it's already structured for real data swapping

