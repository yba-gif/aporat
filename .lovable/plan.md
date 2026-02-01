# Portolan Platform: 5-Phase Completion Plan

## Executive Summary

A comprehensive plan to transform the Portolan demo platform from prototype to production-ready product demonstration, fixing logical inconsistencies and implementing award-winning UX patterns used by enterprise GovTech leaders.

---

## Current State Analysis

### Critical Issues Identified

1. **Disconnected Data Flow**: Maris documents don't connect to Nautica graph entities
2. **Static Demo Data**: No cohesive narrative tying all three modules together
3. **Missing Navigation Context**: Users don't understand where they are in the workflow
4. **Inconsistent Entity Types**: ApplicantPanel still references `document` type instead of `company`
5. **No Cross-Module Linking**: Clicking a flagged entity in Nautica should open related documents in Maris
6. **Alert Panel Disconnected**: Alerts don't link to actual graph nodes or cases
7. **Vault Statistics Hardcoded**: Numbers don't reflect actual database state
8. **Missing User Journey**: No guided flow demonstrating Maris → Nautica → Meridian pipeline
9. **Case Management Isolated**: Cases don't link to graph entities or documents
10. **No Unified Command Experience**: Each module has its own navigation pattern

---

## Tooling Strategy (Data Sovereignty First)

### Core Principle
All tools must either be **self-hosted** or use **zero-knowledge/E2EE architecture** to ensure no third party can access sensitive demo or production data.

### Required Tools by Category

| Category | Tool | Type | Purpose |
|----------|------|------|---------|
| **Code & DevOps** | GitLab CE | Self-hosted | Version control, CI/CD pipelines |
| **Project Management** | Plane | Self-hosted | Issue tracking, sprint planning |
| **Team Communication** | Mattermost | Self-hosted | Internal chat, incident response |
| **External Comms** | Element (Matrix) | Self-hosted | Secure client/gov communication |
| **Documents** | Nextcloud | Self-hosted | Internal file sharing, collaboration |
| **External Sharing** | Tresorit | E2EE SaaS | Secure document sharing with clients |
| **Design** | Penpot | Self-hosted | UI/UX design, prototyping |
| **Diagrams** | Excalidraw | Self-hosted | Whiteboarding, architecture diagrams |
| **Analytics** | Plausible | Self-hosted | Marketing site analytics |
| **Product Analytics** | PostHog | Self-hosted | Feature usage, user flows |
| **Secrets** | Infisical | Self-hosted | API keys, credentials management |
| **Passwords** | Vaultwarden | Self-hosted | Team password management |
| **Knowledge Base** | Outline | Self-hosted | Internal documentation, wiki |
| **Local AI** | Ollama | Self-hosted | Private LLM inference |
| **Email** | Proton Mail | E2EE SaaS | External email (zero-knowledge) |

---

## Phase 1: Data Architecture & Cohesive Demo Narrative (Days 1-2)

### Goal
Create a unified demo dataset with a compelling fraud investigation story that spans all three modules.

### Tools Required
- **Lovable Cloud**: Database migrations and seed data
- **Penpot**: Design data flow diagrams
- **Outline**: Document the demo scenario narrative

### Tasks

#### 1.1 Define Demo Scenario
- **Primary Case**: "CASE-2026-4829 - Ahmad Rezaee"
  - Applicant flagged by Nautica for visa mill association
  - Documents in Maris vault with tamper detection alerts
  - Active workflow in Meridian awaiting supervisor approval

#### 1.2 Database Schema Alignment
```sql
-- Add case_id to vault_documents for cross-module linking
ALTER TABLE vault_documents ADD COLUMN case_id text;
ALTER TABLE vault_documents ADD COLUMN entity_id text;

-- Add case_id to demo_fraud_nodes for graph-case linking
ALTER TABLE demo_fraud_nodes ADD COLUMN case_id text;
```

#### 1.3 Seed Cohesive Demo Data
- 1 primary fraud network (8-12 entities)
- 6 vault documents linked to the case
- 1 active case with full workflow history
- Cross-linked entities, documents, and cases

#### 1.4 UI Updates
- Update ApplicantPanel interface to use `company` instead of `document`
- Ensure FilterPanel, CommandBar, and all components use consistent types

---

## Phase 2: Unified Navigation & Global Context (Days 3-4)

### Goal
Implement a global context system where selecting an entity in any module propagates context across all modules.

### Tools Required
- **Penpot**: Design navigation patterns and command palette
- **Excalidraw**: Sketch information architecture
- **Plane**: Track implementation tasks

### Tasks

#### 2.1 Global State Management
Create a unified context that tracks:
```typescript
interface GlobalContext {
  selectedCase: CaseInfo | null;
  selectedEntity: EntityInfo | null;
  selectedDocument: DocumentInfo | null;
  activeAlerts: Alert[];
  breadcrumb: BreadcrumbItem[];
}
```

#### 2.2 Global Command Palette (⌘K)
Move command bar to platform level:
- Search across entities, documents, cases
- Quick actions: "Open in Maris", "View in Nautica", "Go to Case"
- Recent items and bookmarks

#### 2.3 Contextual Breadcrumb
Add persistent breadcrumb below header:
```
Platform > Nautica > Entity: Ahmad Rezaee > Linked Documents (3)
```

#### 2.4 Cross-Module Deep Links
- Clicking "View Documents" on an entity opens Maris filtered to that entity
- Clicking "View Network" on a document opens Nautica centered on that entity
- Clicking "Open Case" navigates to Meridian with case selected

#### 2.5 Unified Top Bar
Redesign header with:
- Module tabs (not sidebar) for faster switching
- Global search always visible
- Notification center with categorized alerts
- User avatar with role indicator

---

## Phase 3: Module-Level UX Refinements (Days 5-7)

### Goal
Polish each module to feel like a cohesive, professional GovTech tool.

### Tools Required
- **Penpot**: High-fidelity mockups for each module
- **PostHog**: Set up feature flags for A/B testing refinements
- **Mattermost**: Collect internal feedback on UX changes
- **Plane**: Sprint board for refinement tasks

### 3.1 Maris Refinements

#### Evidence Vault
- [ ] Real document counts from database
- [ ] Thumbnail previews for documents
- [ ] Quick actions: Download, View, Link to Case
- [ ] Batch selection mode
- [ ] Search and filter by type, date, entity

#### Ingestion Flow
- [ ] Replace simulation with actual file upload
- [ ] Show real SHA-256 hash after upload
- [ ] Auto-link to selected case if in context
- [ ] Success state with "View in Vault" action

#### Integrity Panel
- [ ] Connect alerts to actual documents
- [ ] Click alert → open document detail
- [ ] Resolution actions: Dismiss, Investigate, Escalate

### 3.2 Nautica Refinements

#### Graph Interactions
- [ ] Double-click to drill into entity dossier
- [ ] Right-click context menu: View Docs, Open Case, Add to Watchlist
- [ ] Keyboard navigation: Arrow keys to traverse, Enter to select
- [ ] Path highlighting: Show shortest path between two selected nodes

#### Entity Dossier (Right Panel)
- [ ] Tabbed interface: Overview, Documents, Timeline, Notes
- [ ] Documents tab shows linked vault items (clickable)
- [ ] Timeline tab shows chronological events
- [ ] Notes tab for analyst annotations (demo mode: read-only)

#### Cluster Detection
- [ ] Visual cluster boundaries (subtle convex hull or glow)
- [ ] Cluster summary tooltip: "Visa Mill - 8 entities, 94 avg risk"
- [ ] "Expand cluster" / "Collapse cluster" toggle

### 3.3 Meridian Refinements

#### Case Management
- [ ] Case detail view (not just workflow)
- [ ] Linked entities summary with risk indicators
- [ ] Linked documents summary with integrity status
- [ ] Activity log with all actions taken

#### Decision Workflow
- [ ] Interactive decision buttons (simulate approve/reject)
- [ ] Confirmation dialogs with impact summary
- [ ] After action: Show "Decision recorded" success state
- [ ] Workflow history with collapsible completed steps

#### Policy Rules
- [ ] Policy simulation: "If enabled, X cases would be affected"
- [ ] Rule effectiveness metrics (false positive rate, etc.)
- [ ] Rule dependencies visualization

---

## Phase 4: Real-Time Features & Polish (Days 8-10)

### Goal
Add real-time features and micro-interactions that make the platform feel alive.

### Tools Required
- **Lovable Cloud Realtime**: WebSocket subscriptions for live updates
- **PostHog**: Track user engagement with new features
- **Plausible**: Monitor demo page performance
- **Ollama**: Local AI for smart suggestions (optional)

### Tasks

#### 4.1 Real-Time Updates
- [ ] Supabase Realtime for new alerts
- [ ] Toast notifications for high-priority events
- [ ] Subtle pulse animation on updated items

#### 4.2 Skeleton Loading States
- [ ] Replace loading spinners with skeleton placeholders
- [ ] Progressive loading for large data sets
- [ ] Optimistic updates for user actions

#### 4.3 Empty States
- [ ] Meaningful empty states with actions
- [ ] "No documents match filters" with clear filter button
- [ ] "No cases assigned to you" with browse action

#### 4.4 Keyboard Shortcuts
```
⌘K      - Global search
⌘1/2/3  - Switch modules (Maris/Nautica/Meridian)
⌘E      - Toggle entity panel
Esc     - Close modals/panels
?       - Show keyboard shortcuts help
```

#### 4.5 Micro-Animations
- [ ] Page transitions with subtle fade
- [ ] Panel collapse/expand with smooth easing
- [ ] Selection state with scale feedback
- [ ] Loading progress with determinate bars where possible

---

## Phase 5: Storytelling Mode & Demo Polish (Days 11-14)

### Goal
Create a guided demo experience that tells the fraud detection story.

### Tools Required
- **Penpot**: Design guided tour UI components
- **Nextcloud**: Store demo assets and presentation materials
- **Tresorit**: Securely share demo with external stakeholders
- **Element**: Coordinate demo delivery with gov clients
- **Outline**: Document demo scripts and talking points

### Tasks

#### 5.1 Guided Tour Mode
Optional walkthrough for first-time viewers:
1. "Meet Ahmad Rezaee - a flagged applicant"
2. "Nautica detected his connection to a visa mill network"
3. "Maris sealed his documents with integrity alerts"
4. "Meridian manages the investigation workflow"

#### 5.2 Demo Controls Panel (Hidden)
Accessible via `?demo=true` query param:
- Reset demo data button
- Trigger sample alerts
- Simulate time progression
- Toggle between scenarios

#### 5.3 Presentation Mode
For live demos:
- Larger fonts and higher contrast
- Hide technical details (IDs, hashes)
- Spotlight effect on current focus
- Click-to-advance for scripted demos

#### 5.4 Final Polish
- [ ] Favicon and meta tags
- [ ] Print/export styles for case reports
- [ ] Error boundaries with graceful fallbacks
- [ ] Performance optimization (memo, lazy loading)
- [ ] Accessibility audit (ARIA labels, focus management)

---

## Infrastructure Setup Checklist

### Immediate (Before Phase 1)
- [ ] **Plane** - Set up project board with phases as milestones
- [ ] **Outline** - Create documentation workspace
- [ ] **Penpot** - Initialize design project with components

### During Development (Phase 1-3)
- [ ] **GitLab CE** - Set up CI/CD for automated deployments
- [ ] **Mattermost** - Create channels: #platform-dev, #feedback, #bugs
- [ ] **Infisical** - Migrate secrets from current management
- [ ] **PostHog** - Integrate analytics SDK

### Pre-Demo (Phase 4-5)
- [ ] **Plausible** - Set up marketing site tracking
- [ ] **Tresorit** - Create secure share folder for demo assets
- [ ] **Element** - Set up secure room for gov stakeholder comms

---

## Tool Deployment Options

### Option A: Single-Server Stack (Budget)
Deploy all self-hosted tools on one powerful VPS:
- **Provider**: Hetzner (Germany) or OVH (France)
- **Spec**: 8 vCPU, 32GB RAM, 500GB NVMe
- **Cost**: ~€50-80/month
- **Tools**: Docker Compose with all services

### Option B: Kubernetes Cluster (Scalable)
Deploy on managed Kubernetes:
- **Provider**: Scaleway Kapsule or Hetzner Cloud
- **Spec**: 3-node cluster, 4 vCPU/8GB each
- **Cost**: ~€150-200/month
- **Tools**: Helm charts for each service

### Option C: Hybrid (Recommended)
- **Self-hosted** (EU VPS): GitLab, Plane, Mattermost, Nextcloud, Outline, Penpot
- **E2EE SaaS**: Proton Mail, Tresorit
- **Lovable Cloud**: Application backend (already configured)

---

## Success Metrics

1. **Flow Continuity**: User can follow a single case from document upload through network detection to case resolution
2. **Data Consistency**: All numbers, entities, and references are interconnected and accurate
3. **Professional Polish**: No dead ends, placeholder text, or disconnected UI elements
4. **Demo Ready**: Can run a 15-minute live demo without encountering issues
5. **Performance**: Graph renders 100+ nodes at 60fps, page transitions < 200ms
6. **Tooling**: 100% of sensitive data flows through self-hosted or E2EE tools

---

## Technical Debt to Address

- [ ] Refactor `NauticaGraph.tsx` (547 lines) into smaller components
- [ ] Refactor `CaseManagement.tsx` (285 lines) into smaller components
- [ ] Refactor `DecisionWorkflow.tsx` (220 lines) into smaller components
- [ ] Centralize demo data definitions
- [ ] Create shared types file for cross-module entities
- [ ] Add unit tests for critical business logic

---

## File Structure Proposal

```
src/
├── components/
│   ├── platform/
│   │   ├── global/
│   │   │   ├── GlobalCommandBar.tsx
│   │   │   ├── Breadcrumb.tsx
│   │   │   ├── NotificationCenter.tsx
│   │   │   └── ModuleTabs.tsx
│   │   ├── maris/
│   │   │   ├── DocumentVault.tsx
│   │   │   ├── DocumentDetail.tsx
│   │   │   ├── IngestFlow.tsx
│   │   │   └── TamperDetection.tsx
│   │   ├── nautica/
│   │   │   ├── GraphCanvas.tsx
│   │   │   ├── GraphControls.tsx
│   │   │   ├── EntityDossier/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── OverviewTab.tsx
│   │   │   │   ├── DocumentsTab.tsx
│   │   │   │   └── TimelineTab.tsx
│   │   │   └── ClusterOverlay.tsx
│   │   └── meridian/
│   │       ├── CaseList.tsx
│   │       ├── CaseDetail.tsx
│   │       ├── WorkflowTracker.tsx
│   │       └── PolicyEditor.tsx
├── context/
│   └── PlatformContext.tsx
├── hooks/
│   ├── usePlatformContext.ts
│   ├── useEntityNavigation.ts
│   └── useKeyboardShortcuts.ts
└── types/
    └── platform.ts
```

---

## Tool Quick Reference

| Need | Tool | Self-Hosted | Zero Data Exposure |
|------|------|-------------|-------------------|
| Code | GitLab CE | ✅ | ✅ |
| Tasks | Plane | ✅ | ✅ |
| Chat | Mattermost | ✅ | ✅ |
| Docs | Nextcloud | ✅ | ✅ |
| Design | Penpot | ✅ | ✅ |
| Analytics | Plausible | ✅ | ✅ |
| Product | PostHog | ✅ | ✅ |
| Secrets | Infisical | ✅ | ✅ |
| Wiki | Outline | ✅ | ✅ |
| AI | Ollama | ✅ | ✅ |
| Email | Proton | ❌ | ✅ (E2EE) |
| Sharing | Tresorit | ❌ | ✅ (E2EE) |

---

## Next Actions

1. **Immediate**: Fix ApplicantPanel `document` → `company` type inconsistency
2. **This Session**: Start Phase 1 with database migrations and seed data
3. **Infrastructure**: Deploy Plane + Outline on EU VPS for project tracking
4. **User Approval Needed**: Confirm Phase 1 scope before implementation

---

*Plan created: 2026-01-28*
*Last updated: 2026-02-01*
*Tools section added: 2026-02-01*
