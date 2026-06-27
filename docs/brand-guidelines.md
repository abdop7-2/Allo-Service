# AlloService — Brand Guidelines

> Source of truth for the design system. Synced to `src/design-system.css`.
> Format follows the `brand` skill (`sync-brand-to-tokens.cjs`).

## Quick Reference

| Token | Value | Usage |
|-------|-------|-------|
| Primary Color | #0D9488 (teal) | Brand, primary CTAs, links |
| Secondary Color | #2563EB (blue) | Client role accent, info |
| Accent Color | #7C3AED (violet) | Admin role accent, highlights |

## Brand Voice

Helpful, trustworthy, local. We connect people with skilled artisans near them.
Tone: warm but professional, clear, French-first, never salesy.

## Color System

### Primary Colors
| Name | Hex | Usage |
|------|-----|-------|
| **Primary** | #0D9488 | Main brand, CTAs, active states |
| **Primary Light** | #14B8A6 | Hover, gradients |
| **Primary Dark** | #0F766E | Pressed, emphasis |

### Secondary Colors
| Name | Hex | Usage |
|------|-----|-------|
| **Secondary** | #2563EB | Client space accent |
| **Secondary Light** | #3B82F6 | Highlights |
| **Secondary Dark** | #1D4ED8 | Pressed |

### Accent Colors
| Name | Hex | Usage |
|------|-----|-------|
| **Accent** | #7C3AED | Admin space accent |
| **Accent Light** | #8B5CF6 | Highlights |
| **Accent Dark** | #6D28D9 | Pressed |

### Role Accents
The active accent (`--accent`) themes the dashboard per user role:
- **Client** → blue `#2563EB`
- **Prestataire** → teal `#0D9488` (brand)
- **Admin** → violet `#7C3AED`

### Neutrals
| Token | Hex | Usage |
|-------|-----|-------|
| Background | #F4F7FB | Page background |
| Surface | #FFFFFF | Cards, modals |
| Text | #0F172A | Headings |
| Text-2 | #475569 | Body |
| Muted | #94A3B8 | Captions |
| Border | #E8EDF3 | Dividers |

### Semantic
| Name | Hex |
|------|-----|
| Success | #16A34A |
| Warning | #D97706 |
| Error | #DC2626 |
| Info | #2563EB |

## Typography

- **UI / Headings:** Plus Jakarta Sans (400/500/600/700/800)
- **Display (hero):** DM Serif Display
- **Type scale:** 1.25 ratio, base 16px
- **Weights:** 400 body · 500 nav/links · 600 emphasis · 700–800 headings
- **Line height:** headings 1.1–1.3, body 1.5–1.6

## Elevation & Shape

- **Radii:** sm 8px · md 12px · lg 16px · xl 20px
- **Shadows:** soft, layered (`--sh-sm/md/lg`); accent glow for primary CTAs

## Do / Don't

- ✅ Use the role accent (`--accent`) for primary actions in the dashboard
- ✅ Keep ≤ 2–3 colors per component; rely on neutrals + one accent
- ❌ No pure black text (use `--text` #0F172A)
- ❌ Don't mix multiple accent hues in a single surface
