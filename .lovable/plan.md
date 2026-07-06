# Hero Refinement Plan

All changes are in `src/components/Hero.tsx` (presentation only — no functionality, routing, or backend touched).

## 1. Center the portrait as a backdrop
- Move the portrait wrapper from the hero's bottom edge (`top-full`, `-translate-y-1/2`) to the exact vertical + horizontal center of the section (`inset-0` centered, or `top-1/2 left-1/2 -translate-1/2`).
- Keep it behind the text on `z-[-1]` so the heading, subtitle, and buttons overlay on top (backdrop layout, as chosen).
- Reduce the image height so a centered portrait fits inside the hero instead of overflowing (e.g. from `126vh` down to a contained value that stays fully visible on short screens).
- Soften the mask/fade so edges blend into the black background on all sides rather than only the bottom.

## 2. Keep a subtle scroll effect
- Retain a gentle parallax + fade on scroll (scale/opacity), just toned down, so the centered image still reacts to scroll without sliding into the next section.

## 3. Shorten + shrink the subtitle
- Rewrite the paragraph to a shorter line, e.g.:
  > "AI products, enterprise software, and SaaS platforms — engineered with precision."
- Reduce its font size a notch and tighten its max width for clean readability.

## 4. Everything on one screen (no scroll needed)
- Tighten vertical spacing (badge → heading → subtitle → buttons) so the badge, headline, shortened subtitle, and both buttons (Start Your Project / Explore Our Work) all sit within one viewport height.
- Verify the CTA buttons are visible without scrolling.

## 5. Mobile / responsive care
- Scale the portrait, heading `clamp()`, subtitle, and button stack down for small widths so the centered backdrop and all text remain visible and legible on mobile.
- Keep buttons stacked full-width-friendly on mobile, side-by-side on desktop.

## Verification
- Render the page with Playwright at desktop (the current ~858×529 short viewport) and a mobile width, screenshot both, and confirm: image centered as backdrop, text readable over it, and both CTA buttons visible on one screen.

## Technical notes
- Single file edit: `src/components/Hero.tsx`.
- Portrait positioning switches from bottom-anchored to center-anchored; `useScroll`/`useTransform`/`useSpring` values are kept but re-tuned for a subtle centered effect.
- No changes to `index.tsx`, other sections, or the design tokens in `styles.css`.
