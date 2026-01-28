
# 5 Alternative Hero Sections (Similar to Current)

Creating five new hero variants that maintain the **two-column layout with left copy and right visualization** but with fresh, award-winning visual treatments.

---

## Current Hero Analysis
- **Left side**: Headline, subhead, CTA button, proof chips
- **Right side**: Interactive graph with nodes, connection lines, and audit trail
- **Style**: Grid background, subtle animations, data pipeline visualization

---

## 5 New Variants

### Variant 1: Signal Flow
**Concept**: Horizontal signal bars pulsing through verification stages

**Left Column**:
- Same headline structure
- Minimal proof chips (inline text, no icons)

**Right Column**:
- Stacked horizontal bars representing data signals
- Each bar pulses left-to-right showing data flow
- Monochrome with accent highlights on active segments
- Labels: Ingest → Verify → Resolve

---

### Variant 2: Document Stack
**Concept**: Abstract document layers being verified and sealed

**Left Column**:
- Headline with tighter line height
- Single-line subhead
- CTA with secondary text link

**Right Column**:
- Overlapping rectangular layers (documents)
- Top layer shows verification checkmarks appearing
- Subtle depth with border offsets
- Hash signatures appearing at bottom

---

### Variant 3: Timeline Spine
**Concept**: Vertical timeline with decision checkpoints

**Left Column**:
- Centered within its column
- Larger display text
- Proof chips as a horizontal rule

**Right Column**:
- Central vertical line (the "spine")
- Alternating left/right checkpoint cards
- Timestamps and status indicators
- Final node at bottom: "Decision Rendered"

---

### Variant 4: Grid Matrix
**Concept**: Data points populating a verification grid

**Left Column**:
- Headlines with monospace accent text
- Minimal, no proof chips

**Right Column**:
- 6x4 grid of cells
- Cells progressively fill with verification states
- Color coding: empty → processing → verified
- Row/column headers like a spreadsheet

---

### Variant 5: Terminal Feed
**Concept**: Live operations console aesthetic

**Left Column**:
- Headline styled more technical
- Subhead with inline code-style formatting

**Right Column**:
- Terminal-style container with header bar
- Scrolling log entries appearing line by line
- Syntax-highlighted output (timestamps, actions, hashes)
- Blinking cursor at bottom

---

## Technical Implementation

### Files to Create
```text
src/components/heroes/
├── HeroVariantOne.tsx   (Signal Flow)
├── HeroVariantTwo.tsx   (Document Stack)
├── HeroVariantThree.tsx (Timeline Spine)
├── HeroVariantFour.tsx  (Grid Matrix)
├── HeroVariantFive.tsx  (Terminal Feed)
└── index.ts             (exports)
```

### Files to Update
- `src/pages/Demo.tsx` - Update variant metadata

### Shared Elements Across All Variants
- Two-column responsive grid (stacks on mobile)
- Same headline/subhead content structure
- "Request demo" CTA button
- Proof chips or equivalent credibility markers
- Subtle animations (fade-up, fade-in with delays)
- No playful gradients or colors beyond the teal accent

### Animation Approach
- CSS-only where possible (no cheap JS intervals)
- Staggered fade-in for visual hierarchy
- Subtle pulse for active/live indicators
- No bouncing, no springy physics

