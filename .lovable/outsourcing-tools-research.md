# Outsourcing Tools for Data-Sovereign Operations

## Executive Summary

For a GovTech company handling sensitive visa/fraud detection data, this research identifies tools that enable outsourcing operational functions **without exposing raw data** to third parties.

---

## Tool Categories & Recommendations

### 1. Communication & Collaboration

| Tool | Type | Data Exposure | Best For |
|------|------|---------------|----------|
| **Mattermost** | Self-hosted | Zero | Team chat, incident response |
| **Rocket.Chat** | Self-hosted | Zero | Customer support, internal comms |
| **Nextcloud Talk** | Self-hosted | Zero | Video calls, file sharing |
| **Element (Matrix)** | Self-hosted/E2EE | Zero | Secure messaging, gov clients |
| **Proton Mail** | E2EE SaaS | Zero-knowledge | External email |

**Recommendation**: Mattermost for internal, Element for sensitive external comms.

---

### 2. Project Management

| Tool | Type | Data Exposure | Best For |
|------|------|---------------|----------|
| **Plane** | Self-hosted | Zero | Jira alternative, issue tracking |
| **OpenProject** | Self-hosted | Zero | Enterprise PM, Gantt charts |
| **Taiga** | Self-hosted | Zero | Agile/Scrum workflows |
| **Vikunja** | Self-hosted | Zero | Lightweight task management |
| **Focalboard** | Self-hosted | Zero | Notion/Trello alternative |

**Recommendation**: Plane for modern UX, OpenProject for enterprise features.

---

### 3. Document Management & Storage

| Tool | Type | Data Exposure | Best For |
|------|------|---------------|----------|
| **Nextcloud** | Self-hosted | Zero | Full office suite, GDPR compliant |
| **Tresorit** | E2EE SaaS | Zero-knowledge | External sharing with clients |
| **Proton Drive** | E2EE SaaS | Zero-knowledge | Personal/small team storage |
| **Seafile** | Self-hosted | Zero | High-performance file sync |
| **Paperless-ngx** | Self-hosted | Zero | Document scanning/archiving |

**Recommendation**: Nextcloud for internal, Tresorit for external client sharing.

---

### 4. CRM & Sales

| Tool | Type | Data Exposure | Best For |
|------|------|---------------|----------|
| **Twenty** | Self-hosted | Zero | Modern open-source CRM |
| **EspoCRM** | Self-hosted | Zero | Flexible, API-first |
| **SuiteCRM** | Self-hosted | Zero | Salesforce alternative |
| **ERPNext** | Self-hosted | Zero | Full ERP + CRM |
| **Odoo** | Self-hosted | Zero | Modular business suite |

**Recommendation**: Twenty for startups, ERPNext for full business operations.

---

### 5. Analytics & Monitoring

| Tool | Type | Data Exposure | Best For |
|------|------|---------------|----------|
| **Plausible** | Self-hosted | Zero | Privacy-first web analytics |
| **Umami** | Self-hosted | Zero | Simple, fast analytics |
| **Matomo** | Self-hosted | Zero | Full Google Analytics alternative |
| **PostHog** | Self-hosted | Zero | Product analytics, feature flags |
| **Grafana** | Self-hosted | Zero | Infrastructure monitoring |

**Recommendation**: Plausible for marketing, PostHog for product analytics.

---

### 6. Design & Prototyping

| Tool | Type | Data Exposure | Best For |
|------|------|---------------|----------|
| **Penpot** | Self-hosted | Zero | Figma alternative, open source |
| **Excalidraw** | Self-hosted/E2EE | Zero | Whiteboarding, diagrams |
| **Draw.io** | Offline/Self-hosted | Zero | Technical diagrams |

**Recommendation**: Penpot for design, Excalidraw for quick diagrams.

---

### 7. Development & Code

| Tool | Type | Data Exposure | Best For |
|------|------|---------------|----------|
| **GitLab** | Self-hosted | Zero | Full DevOps platform |
| **Gitea** | Self-hosted | Zero | Lightweight Git hosting |
| **Sourcegraph** | Self-hosted | Zero | Code search/intelligence |
| **SonarQube** | Self-hosted | Zero | Code quality analysis |
| **Harbor** | Self-hosted | Zero | Container registry |

**Recommendation**: GitLab CE for full DevOps, Gitea for simplicity.

---

### 8. AI/ML Without Data Exposure

| Approach | Provider | Data Exposure | Best For |
|----------|----------|---------------|----------|
| **Confidential Computing** | Azure/AWS/GCP | Encrypted in-use | Sensitive ML workloads |
| **On-premise LLMs** | Ollama, LocalAI | Zero | Private AI inference |
| **Federated Learning** | Custom | Zero (local training) | Multi-org collaboration |
| **Differential Privacy** | OpenDP | Anonymized only | Statistical analysis |
| **Homomorphic Encryption** | Microsoft SEAL | Encrypted compute | Future-proof security |

**Recommendation**: Ollama for local LLMs, Azure Confidential Computing for cloud ML.

---

### 9. Password & Secrets Management

| Tool | Type | Data Exposure | Best For |
|------|------|---------------|----------|
| **Vaultwarden** | Self-hosted | Zero | Bitwarden-compatible |
| **Infisical** | Self-hosted | Zero | Developer secrets management |
| **HashiCorp Vault** | Self-hosted | Zero | Enterprise secrets/PKI |

**Recommendation**: Vaultwarden for passwords, Infisical for dev secrets.

---

### 10. Notes & Knowledge Base

| Tool | Type | Data Exposure | Best For |
|------|------|---------------|----------|
| **Standard Notes** | E2EE SaaS | Zero-knowledge | Personal notes |
| **Outline** | Self-hosted | Zero | Team wiki/documentation |
| **BookStack** | Self-hosted | Zero | Documentation platform |
| **Obsidian** | Local-first | Zero | Knowledge graphs |

**Recommendation**: Outline for team docs, Obsidian for personal knowledge.

---

## Privacy-Preserving Technologies (Advanced)

### Confidential Computing
- **AWS Clean Rooms**: Collaborate on data without sharing raw data
- **Google Confidential Space**: Secure multi-party computation
- **Azure Confidential Computing**: TEE-based data protection

### Data Masking & Anonymization
- **K2view**: Enterprise data masking
- **Delphix**: Test data management
- **ARX**: Open-source anonymization

### Zero-Knowledge Proofs
- Enable verification without revealing underlying data
- Useful for compliance attestation, identity verification

---

## Deployment Strategy for Portolan

### Recommended Stack

| Function | Tool | Deployment |
|----------|------|------------|
| Team Chat | Mattermost | Self-hosted |
| External Comms | Element | Self-hosted |
| Email | Proton Mail | SaaS (E2EE) |
| Project Mgmt | Plane | Self-hosted |
| Documents | Nextcloud | Self-hosted |
| External Sharing | Tresorit | SaaS (E2EE) |
| CRM | Twenty | Self-hosted |
| Analytics | Plausible + PostHog | Self-hosted |
| Design | Penpot | Self-hosted |
| Code | GitLab CE | Self-hosted |
| AI/ML | Ollama + Azure CC | Hybrid |
| Secrets | Infisical | Self-hosted |
| Docs/Wiki | Outline | Self-hosted |

### Infrastructure Options

1. **Fully Self-Hosted**: Maximum control, higher ops burden
   - Use Kubernetes (k3s) or Docker Compose
   - Host in sovereign data centers

2. **Managed Self-Hosted**: Balance of control and convenience
   - Hetzner, OVH, Scaleway (EU-based)
   - Avoid US hyperscalers for sensitive data

3. **Hybrid**: Self-host sensitive, SaaS for non-sensitive
   - Use E2EE SaaS (Proton, Tresorit) for external comms
   - Self-host internal tools

---

## Key Principles

1. **Zero-Knowledge Architecture**: Provider cannot access your data even if compelled
2. **End-to-End Encryption**: Data encrypted client-side, server sees ciphertext only
3. **Self-Hosted Options**: Full control over data location and access
4. **Open Source Preference**: Auditable code, no vendor lock-in
5. **Data Residency**: Choose EU/local hosting for GDPR/sovereignty

---

## Quick Decision Matrix

| Need | Zero Data Exposure | Some Exposure OK |
|------|-------------------|------------------|
| Chat | Mattermost | Slack |
| Email | Proton Mail | Google Workspace |
| Docs | Nextcloud | Google Drive |
| PM | Plane | Asana |
| CRM | Twenty | HubSpot |
| Analytics | Plausible | Google Analytics |
| Design | Penpot | Figma |
| Code | GitLab CE | GitHub |

---

## References

- [Nextcloud for Government](https://nextcloud.com/government/)
- [Mattermost Security](https://mattermost.com/security/)
- [Plane Open Source PM](https://plane.so/)
- [Twenty CRM](https://twenty.com/)
- [Plausible Analytics](https://plausible.io/self-hosted-web-analytics)
- [Confidential Computing Consortium](https://confidentialcomputing.io/)
- [AWS Clean Rooms](https://aws.amazon.com/clean-rooms/)

---

*Research compiled: 2026-02-01*
