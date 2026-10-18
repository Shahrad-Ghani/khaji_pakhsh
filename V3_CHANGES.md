# KHAJI V3 — Accepted changes and QA list

- [x] Larger brand identity, centered search, sales phone and separate navigation row.
- [x] Desktop category/brand hover dropdowns, mobile touch accordions.
- [x] Links to all 8 category and 13 brand Next.js demo routes.
- [x] Roughly 40% narrower horizontal content padding.
- [x] Replace section heading dashes in six named sections with supplied emblem.
- [x] Remove order step numbers 01/02/03.
- [x] Smooth FAQ open/close transition with button aria-expanded.
- [x] White/gold CTA near footer; unchanged original Khaji logo inside.
- [x] Remove price table footer warning and top demo banner phrase.
- [x] Preserve user V2 manual CSS changes as desktop baseline.
- [x] Use logo-free equipment hero asset previously approved.
- [x] Keep original site colors, IRAN typography and dark footer.
- [x] No basket, login, checkout or real search in this frontend demo.

## User-approved manual desktop CSS

```css
.category-body { transform: translate(-65px, -4px); }
.hero-copy { transform: translate(-75px, -5px); text-align:center; align-items:center; }
.category-card { --image-x:0px; --image-y:0px; --image-scale:1.10; }
.category-card .category-visual img { transform:translate(var(--image-x), var(--image-y)) scale(var(--image-scale)); }
.category-card:hover .category-visual img { transform:translate(var(--image-x), var(--image-y)) scale(1.15); }
.hero-copy h1,.hero-copy p { text-align:center; }
.hero-copy p { margin-inline:auto; }
.hero-copy .hero-rule { margin-left:auto; margin-right:auto; }
.hero-cta { width:100%; justify-content:center; align-items:center; }
```

## Test status

- JSX/TSX transpilation syntax: PASS
- Static asset paths and content counts: PASS
- Independent HTML preview visual regression at 1440px and 390px: PASS via in-memory Chromium rendering; dropdown/FAQ/mobile menu interactions tested
- `next build`: NOT VERIFIED (project dependencies cannot be installed here)
- Verify mobile line breaks, click targets, footer CTA and hover menus in Chrome after `npm run dev`.
