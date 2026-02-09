

# Plan: Complete Social Intelligence Panel

## Current State

The Social Intelligence panel (`SocialIntelligencePanel.tsx`) exists as a basic prototype within the Nautica module. It is accessible via a dropdown toggle ("Social Intel" vs "Network Graph") in the Nautica header. However, it has several significant gaps compared to the maturity level of the other platform components (Maris, Nautica Graph, Meridian, VizesepetimPanel).

### What exists today:
- A static panel with 2 hardcoded demo entities (Mehmet Yilmaz, Ahmad Rezaee)
- Social profile cards for Instagram, LinkedIn, Telegram with risk indicators
- A static "Network Connections" list
- A basic "Risk Propagation Path" diagram (a horizontal flow: Applicant -> Agency -> Owner -> Social Network)
- A "Run OSINT Scan" button that fakes a 3-second spinner and does nothing
- No connection to PlatformContext (entities cannot be navigated to from other modules)
- No localization (English-only)
- No integration with the Guided Tour (the tour references `[data-tour="social-panel"]` but the step just points at the container; it doesn't switch the Nautica view to "social" first)

### What the other panels have that this one lacks:
- Integration with PlatformContext (click-through navigation to graph, documents, cases)
- Turkish localization via the i18n system
- Rich demo data tied to the Ahmad Rezaee fraud case
- Tabbed sub-views for organized information
- RBAC awareness via RoleGate

---

## Implementation Steps

### Step 1: Connect to PlatformContext

Wire the panel into the shared state so it can participate in cross-module navigation:
- Import `usePlatform` and use `selectedEntityId` to auto-select the relevant entity when navigating from the graph or dossier
- Make "Network Connections" items clickable -- navigating to the entity in the Nautica graph via `navigateToEntity()`
- Add a "View in Graph" button per entity that switches back to graph view and selects the node

### Step 2: Expand Demo Data

Enrich the hardcoded demo data to align with the Ahmad Rezaee fraud case narrative:
- Add 2-3 more entities (e.g., Dmitri Volkov, the Apex Travel Agency owner) to show a broader network
- Add richer social profiles: Twitter/X accounts, Facebook profiles
- Include more risk indicators (e.g., "Account follows 5 known visa coaching channels", "Employment listed differs from visa application")
- Add a "Risk Timeline" per entity showing when social signals were detected

### Step 3: Add Tabbed Layout

Restructure the main content area with tabs for better information architecture (matching the pattern used in EntityDossier's DossierTabs):
- **Profile** tab: Current entity overview with risk narrative, social profiles, and risk indicators
- **Network** tab: Social connections with risk scores, shared connections, and click-through to graph
- **OSINT Findings** tab: Detailed OSINT results organized by source (Instagram analysis, LinkedIn verification, Telegram group membership)
- **Risk Flow** tab: The risk propagation diagram, enhanced with animated flow indicators

### Step 4: Enhance the OSINT Scan Simulation

Make the "Run OSINT Scan" button produce visible, staged results:
- Show a multi-step progress indicator (similar to Maris document ingestion pipeline): "Scanning Instagram...", "Cross-referencing LinkedIn...", "Analyzing Telegram groups...", "Generating risk assessment..."
- After the scan completes, surface new risk indicators on the selected entity
- Log the action to the audit system via `useAuditLog`

### Step 5: Add Risk Heatmap Visualization

Replace the simple horizontal flow diagram with a more compelling visualization:
- A mini network diagram showing social connections with risk heat (color-coded by risk severity)
- Show risk flow direction with animated gradient lines
- Include a summary card: "X social accounts analyzed, Y risk indicators found, Z connections to flagged entities"

### Step 6: Add Turkish Localization

Extend the i18n translation keys for the Social Intelligence panel:
- Add keys: `socialIntelligence`, `osintAnalysis`, `socialProfiles`, `riskPropagation`, `networkConnections`, `runOsintScan`, `scanning`, `profile`, `osintFindings`, `riskFlow`, `socialMedia`, `riskIndicators`, `sanctionedConnections`, `flaggedGroups`
- Add Turkish translations: "Sosyal İstihbarat", "OSINT Analizi", "Sosyal Profiller", "Risk Yayilimi", "Ag Baglantilari", "OSINT Tarasi Baslat", "Taraniyor...", "Profil", "OSINT Bulgulari", "Risk Akisi", "Sosyal Medya", "Risk Gostergeleri", "Yaptirimsiz Baglantilar", "Isaretli Gruplar"
- Apply `useLocale` hook to all UI strings in the panel

### Step 7: Fix Tour Integration

Update the guided tour step for Social Intelligence:
- Add an `action` callback to the `social-intel` tour step (similar to how the vizesepetim step clicks the External tab)
- The action should programmatically switch the Nautica view to 'social' mode
- This requires either lifting `setNauticaView` into PlatformContext or passing it through the tour action callback

### Step 8: Add RBAC Awareness

Wrap sensitive sections with the RoleGate component:
- The "Run OSINT Scan" button should require at least `analyst` role
- Detailed social profiles (account handles, follower counts) should require at least `analyst` role
- Risk indicators should be visible to `viewer` but with redacted details

---

## Technical Details

### Files to Create
- None (all changes are to existing files)

### Files to Modify
1. **`src/components/platform/SocialIntelligencePanel.tsx`** -- Major rewrite: PlatformContext integration, tabbed layout, expanded demo data, OSINT scan simulation, risk heatmap, localization, RBAC
2. **`src/lib/i18n.ts`** -- Add ~15 new translation keys for both English and Turkish
3. **`src/components/platform/tour/ahmadRezaeeTour.ts`** -- Add `action` callback to the `social-intel` step to switch Nautica view
4. **`src/pages/Platform.tsx`** -- Lift `nauticaView` state setter to be accessible from tour actions (either via PlatformContext or a ref callback)
5. **`src/contexts/PlatformContext.tsx`** -- Optionally add `nauticaView` and `setNauticaView` to shared context so the tour and cross-module navigation can trigger view switches

### Dependencies
- No new npm packages needed
- Uses existing: `lucide-react`, `@/components/ui/*`, `@/lib/i18n`, `@/contexts/PlatformContext`, `@/hooks/useAuditLog`, `@/components/platform/RoleGate`

### Risk Considerations
- The panel uses only hardcoded demo data (no new database tables needed)
- OSINT scan is purely simulated -- no external API calls
- Tour action must handle the case where the user is already in social view

