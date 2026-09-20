# Design System Specification — Image Size & Ratio Precision Studio

> Generated per `web-development-master` (v3.1) Visual Anti-Slop Architecture.

---

## 1. Brand Essence & Style Anchor
- **Character**: Precision Darkroom & Optical Studio. High-density, professional utility feel reminiscent of Lightroom, Linear, and studio camera calibration tools.
- **Style Benchmarks**: Linear / Vercel dark mode engineering + physical Leica/Hasselblad camera precision markings.
- **Audience**: Photographers, web developers, content designers, and users preparing official passport/visa documents requiring exact dimensions and file size guarantees.

---

## 2. Functional Tokens (OKLCH & Calibrated Fallbacks)

### Dark Studio Theme (Default)
- `action-primary`: `oklch(0.65 0.22 250)` (`#2563eb`) — Precision cobalt for focused primary action buttons and active cropping handles.
- `action-primary-hover`: `oklch(0.72 0.20 250)`
- `accent-amber`: `oklch(0.78 0.17 72)` (`#f59e0b`) — Photographic calibration & precision guide highlight.
- `bg-canvas`: `oklch(0.12 0.015 255)` (`#0b0e14`) — Deep darkroom obsidian canvas.
- `bg-surface`: `oklch(0.17 0.02 255 / 0.88)` (`rgba(17, 24, 39, 0.85)`) — Precision studio panels.
- `bg-surface-elevated`: `oklch(0.22 0.025 255)` (`#1e2536`) — Modals, popovers, active selection chips.
- `text-primary`: `oklch(0.97 0.005 240)` (`#f8fafc`) — High-contrast primary copy (WCAG AAA).
- `text-secondary`: `oklch(0.72 0.02 240)` (`#94a3b8`) — Secondary specifications and labels.
- `text-muted`: `oklch(0.52 0.015 240)` (`#64748b`) — Minor hints and keyboard cues.
- `border-default`: `oklch(0.97 0.005 240 / 0.12)` — Sharp 1px mechanical structural boundaries.
- `border-focus`: `var(--action-primary)`

### Light Studio Theme
- `action-primary`: `oklch(0.55 0.22 252)` (`#1d4ed8`)
- `bg-canvas`: `oklch(0.98 0.005 240)` (`#f8fafc`)
- `bg-surface`: `oklch(1 0 0 / 0.95)` (`#ffffff`)
- `text-primary`: `oklch(0.16 0.02 240)` (`#0f172a`)
- `border-default`: `oklch(0.16 0.02 240 / 0.12)`

### Semantic Status Tokens
- `status-success`: `oklch(0.68 0.18 150)` (`#10b981`) — Ready/Verified/Downloaded
- `status-warning`: `oklch(0.75 0.17 75)` (`#f59e0b`) — Quality downgrade warning
- `status-danger`: `oklch(0.62 0.22 25)` (`#ef4444`) — File errors & resets

---

## 3. Typographic Hierarchy
- **Display / Headings**: `Plus Jakarta Sans`, system-ui, sans-serif (Weights: 600, 700)
- **Body / Interface**: `Inter`, system-ui, sans-serif (Weights: 400, 500)
- **Technical Metrics / Coordinates**: `JetBrains Mono`, monospace (Weights: 500, 600)
- **Bilingual Arabic (RTL)**: `Cairo`, system-ui, sans-serif (Weights: 600, 700 for titles; 400, 500 for body)

---

## 4. Forbidden Defaults (Anti-Slop Directives)
- NO generic purple ↔ blue gradients on buttons, headers, or backgrounds.
- NO floating ambient blurred purple orbs (`aurora-orb`).
- NO identical 3-card or 5-card copy-paste feature blocks.
- NO unearned floating "✨ Magic" badges above headlines.
- NO repetitive fade-in scroll animations on every section.
- NO mechanical "→" arrows on non-navigational action triggers.
