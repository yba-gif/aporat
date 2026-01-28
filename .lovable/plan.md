

# Platform Sidebar Menu Redesign

## Overview
Redesign the sidebar navigation menu with new icons, improved visual styling, and a cleaner layout that better reflects the Palantir/GovTech aesthetic.

---

## Current State
- **Icons**: Generic Lucide icons (Cylinder, CircleCheckBig, LayoutGrid)
- **Layout**: Two-line per item (label + sublabel stacked)
- **Styling**: Basic hover states with accent border on active

---

## Proposed Changes

### 1. New Icons (Semantically Meaningful)
| Module | Current | Proposed | Rationale |
|--------|---------|----------|-----------|
| Maris | Cylinder | `Database` or `HardDrive` | Data ingestion/storage |
| Nautica | CircleCheckBig | `Network` or `GitBranch` | Network/graph analysis |
| Meridian | LayoutGrid | `Scale` or `Shield` | Governance/compliance |

### 2. Visual Layout Changes
- Single-line compact design with icon + label only
- Sublabels shown as tooltips on hover (cleaner look)
- Larger icon container with subtle background
- Improved active state with full accent background

### 3. Styling Improvements
- Icon containers with rounded background
- Smooth transition animations
- Better visual hierarchy
- Tooltip support when sidebar is collapsed

---

## Technical Details

### File Changes
**`src/pages/Platform.tsx`**

1. Update icon imports:
```typescript
import { Database, Network, Scale } from 'lucide-react';
```

2. Update navItems configuration:
```typescript
const navItems = [
  { id: 'maris', label: 'Maris', sublabel: 'Evidence', icon: Database },
  { id: 'nautica', label: 'Nautica', sublabel: 'Intelligence', icon: Network },
  { id: 'meridian', label: 'Meridian', sublabel: 'Governance', icon: Scale },
];
```

3. Redesign PlatformSidebar menu items:
- Add icon wrapper with `w-8 h-8 rounded-lg flex items-center justify-center` background
- Use accent color for active state icon container
- Single line layout with tooltip for sublabel
- Enhanced hover transitions

4. Update the top bar header icons to match:
```typescript
{activeModule === 'maris' && <Database className="..." />}
{activeModule === 'nautica' && <Network className="..." />}
{activeModule === 'meridian' && <Scale className="..." />}
```

---

## Visual Preview

```text
+---------------------------+
|  [Compass] Portolan       |
|           v2.4.1          |
+---------------------------+
|                           |
|  [DB]  Maris              |
|                           |
|  [NET] Nautica   <active> |
|        ^^^^^^^^^^^^^^^^   |
|                           |
|  [SCL] Meridian           |
|                           |
+---------------------------+
```

Active state: Full-width accent background with white icon container

---

## Implementation Notes
- Maintains existing module switching logic
- Preserves collapsed sidebar behavior
- Uses existing design system colors (accent: teal #0D9488)
- Follows memory constraint: no em dashes, concise text

