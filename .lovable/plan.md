

# Portolan Platform: 5-Phase Strategic Roadmap (Updated)
## With vizesepetim.com API Integration

---

## Executive Summary

This updated plan now includes the **vizesepetim.com API integration** as a priority in Phase 1. vizesepetim.com is Turkey's visa matching platform that connects applicants with agencies. They will provide applicant data (mobile number, IP address, gender, target country) which will flow into the Portolan platform for fraud detection and risk analysis.

---

## NEW: vizesepetim.com Integration Overview

**What is vizesepetim.com?**
- Turkish platform ("Türkiye'nin güvenilir vize platformu") that matches visa applicants with approved agencies
- Supports Schengen, USA, UK, Canada, and other destinations
- Has 6+ verified agencies and handles tourist, business, and student visas

**Data to be received from their API:**
| Field | Type | Purpose |
|-------|------|---------|
| `mobile_number` | string | Identity correlation, duplicate detection |
| `ip_address` | string | Geolocation analysis, VPN/proxy detection |
| `gender` | string | Profile validation |
| `target_country` | string | Destination risk scoring |

**Integration Value:**
- Cross-reference applicants between agencies to detect visa mill patterns
- Flag same mobile/IP used across multiple "unrelated" applications
- Geographic anomaly detection (IP location vs claimed residence)

---

## 5-Phase Strategic Roadmap

### Phase 1: Data Architecture + vizesepetim.com Integration (Days 1-3)

**Goal**: Create cross-module data linkage AND establish external data ingestion pipeline from vizesepetim.com.

#### 1A: vizesepetim.com API Integration

| Task | Priority | Effort |
|------|----------|--------|
| Create `vizesepetim_applicants` table for incoming data | Critical | 1h |
| Build `vizesepetim-webhook` edge function to receive data | Critical | 3h |
| Implement HMAC signature verification for webhook security | Critical | 2h |
| Create junction table linking vizesepetim data to fraud nodes | High | 2h |
| Add IP geolocation lookup (flag VPN/proxy) | High | 2h |
| Create automatic entity generation from incoming applicants | High | 3h |

**Database Schema:**
```text
vizesepetim_applicants
├── id (uuid, primary key)
├── external_id (text, unique) -- vizesepetim's applicant ID
├── mobile_number_hash (text) -- SHA-256 for privacy
├── ip_address (text)
├── ip_country (text) -- resolved geolocation
├── gender (text)
├── target_country (text)
├── is_vpn (boolean) -- flagged if detected
├── linked_entity_id (text, FK → demo_fraud_nodes.node_id)
├── created_at (timestamp)
└── metadata (jsonb) -- for future fields
```

**Edge Function: `vizesepetim-webhook`**
- Receives POST requests with signed payloads
- Validates HMAC-SHA256 signature using shared secret
- Hashes mobile number before storage (privacy compliance)
- Performs IP geolocation lookup
- Creates/links to entity in fraud graph
- Returns 200 OK with processing status

#### 1B: Internal Data Architecture Unification

| Task | Priority | Effort |
|------|----------|--------|
| Create `entity_documents` junction table | High | 2h |
| Create `platform_audit_log` table | High | 2h |
| Implement cross-module navigation (entity → documents → case) | Critical | 4h |
| Update PlatformContext for selection persistence | High | 3h |

**Deliverables:**
- Webhook endpoint at `/functions/v1/vizesepetim-webhook`
- Incoming applicant data visible in Nautica graph
- Mobile number correlation flags duplicate applications
- IP geolocation flags geographic anomalies

---

### Phase 2: Analytical Capabilities (Days 4-7)

**Goal**: Add graph analytics including vizesepetim correlation patterns.

| Task | Priority | Effort |
|------|----------|--------|
| **Path Analysis**: Select 2 nodes → show shortest path | Critical | 8h |
| **vizesepetim Correlation Panel**: Show applicants sharing mobile/IP | Critical | 4h |
| **Time Slider**: Filter graph by date range | High | 6h |
| **Risk Score Filter**: Hide low-risk nodes | High | 3h |
| **Cluster Metrics**: Network topology (star/mesh/chain) | Medium | 4h |
| **Explainable Flags**: Show WHY each entity is flagged | Critical | 6h |

**vizesepetim-specific analytics:**
- "5 applicants share this mobile number across 3 agencies"
- "IP 185.x.x.x used by 12 applicants in 24 hours (possible fraud farm)"
- "Claimed residence: Tehran, IP location: Istanbul (VPN likely)"

**Deliverables:**
- Path analysis between two selected nodes
- Timeline scrubber for temporal analysis
- vizesepetim correlation alerts in entity dossier

---

### Phase 3: Operational Workflow (Days 8-10)

**Goal**: Make Meridian usable for case decisions with vizesepetim data.

| Task | Priority | Effort |
|------|----------|--------|
| **Red Flag Summary**: Top 3 reasons including vizesepetim signals | Critical | 4h |
| **Auto-Decision Justification**: Include external data signals | High | 6h |
| **PDF Export**: One-page case summary with vizesepetim flags | Critical | 6h |
| **Batch Document Upload**: Multi-file upload with progress | High | 4h |
| **vizesepetim Data Panel**: Show raw external data in dossier | High | 3h |

**Deliverables:**
- Case summary shows "Source: vizesepetim.com" attribution
- Refusal justification includes "Mobile number linked to 3 other applications"
- PDF export with external data section

---

### Phase 4: Demo Infrastructure (Days 11-12)

**Goal**: Bulletproof demo including simulated vizesepetim data flow.

| Task | Priority | Effort |
|------|----------|--------|
| **Demo Controls Panel** (`?demo=true`) | Critical | 4h |
| **vizesepetim Webhook Simulator**: Button to inject test applicants | Critical | 2h |
| **Scenario Presets**: Include "External Data Fraud Ring" scenario | High | 3h |
| **Update Guided Tour**: Include vizesepetim integration step | High | 2h |
| **Turkish Localization**: Critical UI labels | High | 4h |

**Demo Script Addition:**
"Watch as a new applicant arrives from vizesepetim.com in real-time... Notice how the system immediately correlates their mobile number with an existing flagged network."

**Deliverables:**
- Simulated webhook button triggers live data ingestion
- New tour step explaining external data integration
- Demo scenario showing fraud detection across platforms

---

### Phase 5: Security & Sovereignty (Days 13-14)

**Goal**: Secure external data handling and RBAC.

| Task | Priority | Effort |
|------|----------|--------|
| **HMAC Webhook Verification**: Document and test | Critical | 2h |
| **vizesepetim Secret Management**: Store API key securely | Critical | 1h |
| **Basic RBAC**: Analyst vs Supervisor roles | Critical | 6h |
| **Audit Trail**: Log all webhook receipts | High | 3h |
| **Data Retention Policy**: Auto-purge vizesepetim data after X days | Medium | 2h |
| **API Documentation**: Create integration spec for vizesepetim | Critical | 3h |

**Security Deliverables:**
- Webhook signature validation documented
- No raw mobile numbers stored (only hashes)
- Complete audit log of external data ingestion
- Integration spec PDF for vizesepetim team

---

## Technical Implementation Details

### New Database Tables

```text
┌─────────────────────────────────────────────────────────────────┐
│  vizesepetim_applicants                                        │
├─────────────────────────────────────────────────────────────────┤
│  ├── id (uuid, primary key)                                    │
│  ├── external_id (text, unique)                                │
│  ├── mobile_number_hash (text) -- SHA-256 hashed               │
│  ├── ip_address (text)                                         │
│  ├── ip_country (text) -- resolved via geolocation             │
│  ├── ip_is_vpn (boolean) -- VPN/proxy detection flag           │
│  ├── gender (text: 'male' | 'female' | 'other')                │
│  ├── target_country (text)                                     │
│  ├── linked_entity_id (text, FK → demo_fraud_nodes.node_id)    │
│  ├── processed_at (timestamp)                                  │
│  ├── metadata (jsonb)                                          │
│  └── created_at (timestamp, default now())                     │
├─────────────────────────────────────────────────────────────────┤
│  entity_documents (junction table)                             │
├─────────────────────────────────────────────────────────────────┤
│  ├── id (uuid, primary key)                                    │
│  ├── entity_id (text, FK → demo_fraud_nodes.node_id)          │
│  ├── document_id (uuid, FK → vault_documents.id)              │
│  └── linked_at (timestamp)                                     │
├─────────────────────────────────────────────────────────────────┤
│  platform_audit_log                                            │
├─────────────────────────────────────────────────────────────────┤
│  ├── id (uuid, primary key)                                    │
│  ├── action (text: 'webhook_received', 'entity_created', etc.) │
│  ├── source (text: 'vizesepetim', 'system', 'user')           │
│  ├── target_id (text)                                          │
│  ├── user_role (text)                                          │
│  ├── context (jsonb)                                           │
│  └── created_at (timestamp)                                    │
└─────────────────────────────────────────────────────────────────┘
```

### New Edge Function: vizesepetim-webhook

```text
supabase/functions/vizesepetim-webhook/index.ts
├── HMAC-SHA256 signature verification
├── Mobile number SHA-256 hashing
├── IP geolocation lookup (using free service)
├── VPN/proxy detection
├── Entity creation or linking
├── Audit log insertion
└── Response with processing status
```

### New Components

```text
src/
├── components/platform/
│   ├── analytics/
│   │   ├── PathAnalysis.tsx
│   │   ├── TimeSlider.tsx
│   │   └── ClusterMetrics.tsx
│   ├── external/
│   │   ├── VizesepetimPanel.tsx      # Show incoming external data
│   │   ├── CorrelationAlerts.tsx     # Mobile/IP sharing warnings
│   │   └── WebhookSimulator.tsx      # Demo: inject test data
│   ├── export/
│   │   ├── CasePDFExport.tsx
│   │   └── DecisionJustification.tsx
│   └── admin/
│       ├── DemoControlsPanel.tsx
│       └── ScenarioSelector.tsx
└── hooks/
    ├── useVizesepetimData.ts         # Fetch/subscribe to external applicants
    ├── usePathAnalysis.ts
    └── useAuditLog.ts
```

### Webhook Request/Response Format

**Incoming (from vizesepetim.com):**
```json
POST /functions/v1/vizesepetim-webhook
Headers:
  X-Signature: sha256=abc123...
  X-Timestamp: 1707148800
Body:
{
  "applicant_id": "vs-12345",
  "mobile_number": "+905551234567",
  "ip_address": "185.123.45.67",
  "gender": "male",
  "target_country": "Germany"
}
```

**Response:**
```json
{
  "success": true,
  "entity_id": "app-vs-12345",
  "correlations": {
    "mobile_matches": 2,
    "ip_matches": 5
  },
  "flags": ["ip_vpn_detected", "mobile_duplicate"]
}
```

---

## Success Criteria for MFA Demo

| Criterion | Target |
|-----------|--------|
| **vizesepetim Integration** | Live webhook receives data and creates entities in < 2 seconds |
| **Correlation Detection** | Demo shows "This mobile used by 3 other applicants" |
| **Flow Continuity** | vizesepetim applicant → graph node → documents → case decision |
| **Explainability** | Every flag shows source ("vizesepetim: duplicate mobile") |
| **Path Analysis** | Show connection between external applicant and fraud network |
| **Export** | PDF includes "External Data Sources: vizesepetim.com" |
| **Security** | Webhook signature validation demonstrated |

---

## API Secret Required

Before implementation, you will need to provide or receive from vizesepetim.com:
- **VIZESEPETIM_WEBHOOK_SECRET**: Shared secret for HMAC signature verification

This will be stored securely as a backend secret and never exposed to the frontend.

---

## Timeline Summary

```text
Week 1:
├── Days 1-2: vizesepetim webhook + database tables
├── Day 3: Cross-module linking + entity correlation
├── Days 4-5: Path Analysis + vizesepetim correlation panel
├── Days 6-7: Explainable Flags + Time Slider

Week 2:
├── Days 8-9: PDF Export + Red Flag Summary with external data
├── Days 10-11: Demo Controls + Webhook Simulator
├── Days 12-13: RBAC + Audit + Turkish Labels
└── Day 14: Final polish + integration test with vizesepetim
```

---

## Quick Wins for Maximum Demo Impact

1. **Webhook Simulator Button** → Inject a test applicant and watch it appear in the graph
2. **Correlation Badge** → Show "3 linked via mobile" on entity cards
3. **IP Flag Indicator** → Red "VPN" badge when IP is suspicious
4. **External Data Tab** → New tab in EntityDossier showing vizesepetim raw data
5. **Real-time Toast** → "New applicant from vizesepetim.com" notification on webhook receipt

