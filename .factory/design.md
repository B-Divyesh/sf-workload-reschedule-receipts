# Visual thesis — the plan bends, the truth stays square

## Direction

Deadline Reality Check uses **generative geometry** to make a missed plan visible. A quiet field of ruled paper is crossed by one elastic orange path. Planned blocks sit on the grid; a missed block kinks the path; the revised plan rejoins it without pretending that time has appeared. The geometry explains the product instead of decorating it.

This is intentionally not a calendar-app blue, a productivity gradient, or a dashboard of generic cards. It should feel like a careful margin note made with a ruler, a highlighter, and enough honesty to circle the problem.

## Tokens

- Paper `#F4F0E6`: warm background, like a study notebook.
- Paper raised `#FFFDF7`: forms and receipt sheets.
- Ink `#17201C`: primary text; 14.8:1 on paper.
- Ink muted `#58625B`: secondary text; 5.5:1 on paper.
- Rule `#C9D0C4`: dividers and grid lines.
- Moss `#275D47`: primary action and safe status.
- Moss dark `#163D2E`: active/focus depth.
- Signal orange `#D5532D`: the displaced path and warnings.
- Risk red `#A63333`: deadlines that do not fit.
- Sun `#F2C94C`: estimate and uncertainty markers.
- Night `#111815`, night surface `#1A2520`, night text `#F4F0E6`: explicit dark treatment.

All status colors are paired with words and shapes. Body text and controls meet 4.5:1 contrast; large graphic marks meet 3:1.

## Type

- Display: `Arial Black`, `Arial`, sans-serif. Its blocky geometry gives headings the force of stamped labels without a font download.
- Body: `ui-monospace`, `SFMono-Regular`, `Cascadia Mono`, `Roboto Mono`, monospace. Time estimates and deadline changes align naturally.
- Numbers use tabular figures. Body copy is 16–18 px with a 1.55 line height and a 68-character maximum measure.

System fonts keep the first load small, work offline, and avoid third-party requests.

## Spacing, layout, and shape

- Base rhythm: 8 px; common gaps are 8, 16, 24, 32, 48, 64, and 96 px.
- Corners are clipped rather than rounded: polygonal corners and square receipt perforations echo cut paper.
- Landing layout is asymmetric. Copy occupies the left ledger; original geometry occupies and bleeds from the right.
- The planner becomes two working columns on wide screens and one strict sequence at 390 px: inputs, plan, receipt.
- Touch targets are at least 44 px. Text measures never exceed 70 characters.

## Interaction grammar

- Adding a task extends the plan path.
- Marking a block missed creates a visible kink, then draws a replacement segment into free time.
- A receipt arrives from the selected block with a 220 ms translate-and-fade motion.
- Controls depress by 2 px. Focus uses a 3 px sun-colored outline and a dark offset.
- Errors are inline, specific, and announced. Destructive clearing requires explicit confirmation or offers Undo.

## Motion policy

One signature motion is used: the plan path redraws once after recalculation. UI transitions last 150–220 ms and animate only opacity or transform. Nothing loops. Under `prefers-reduced-motion: reduce`, paths and receipts appear immediately and all smooth scrolling is disabled.

## Original asset plan and provenance

The hero is a generated editorial still of an impossible paper timetable: cream graph paper folded through a precise geometric frame, with one orange strip detouring around a dark missing square and returning to a moss-green sequence. It clarifies the core idea without showing a fake interface.

Prompt sheet:

> Use case: stylized-concept. Asset type: wide landing hero and social crop. Primary request: an editorial still-life of a weekly study plan made from cream graph paper and precise cut-paper geometry; one vivid burnt-orange paper strip leaves a sequence of moss-green blocks, bends around one charcoal missing square, and rejoins the path. Scene: clean warm paper field, subtle ruled grid, restrained depth. Style: tactile cut paper with mathematical generative geometry, crisp edges, quiet Swiss editorial composition, no photoreal people. Composition: landscape, key objects centered-right, generous calm space, useful square crop. Lighting: soft directional desk light, short shadows. Palette: warm cream, near-black ink, moss green, burnt orange, small golden marker. Constraints: no letters, no numbers, no calendars, no UI, no logos, no watermark. Avoid: gradients, glassmorphism, neon, generic 3D blobs, hands, brands, illegible text.

- Generator: Azure AI Foundry image model through `/opt/fleet/lib/gen-image.sh`, deployment `factory-image`.
- Date: 2026-08-28.
- License/provenance: generated expressly for this product; no source artwork, people, brands, or copyrighted characters.
- Source candidates and prompt sidecar live in `assets/src/`. Shipped WebP derivatives live in `public/assets/` and stay below 300 KB.

Hand-authored SVG icons (favicon and PWA mark) use only the same path-and-kink geometry. They are original to this repository.

## Dark treatment

The interface follows the system preference. Paper becomes deep green-black; surfaces become graphite green; ruled lines lower in contrast; orange and sun stay as signal colors. The generated hero keeps a cream border so it remains a physical artifact rather than a glowing panel.
