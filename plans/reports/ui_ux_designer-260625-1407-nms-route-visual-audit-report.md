# NMS Route Visual Audit

Scope: Apps, Networks, Creative Library. Audit only. No source edits.

Inputs:
- Screenshots provided in task.
- Route files: `src/pages/AppsList.tsx`, `src/pages/NetworksList.tsx`, `src/pages/MediaLibraries.tsx`.
- Shared UI wrappers from `src/components/ui`, selected creative wrappers, and `src/components/ui-kit-compat`.
- ui-kit references: ikame Core DS 1.1 tokens, visual hierarchy, component specs.
- Web Interface Guidelines: https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md

## Overall Diagnosis

The migration changed many colors/classes to tokens, but the UI still uses old AntD-like page composition: oversized cards, nested bordered panels, arbitrary inline colors, and page-local styling. Result: visually tokenized but not system-designed.

For quiet operational SaaS, these pages should read as dense work surfaces: stable toolbar, compact data rows/cards, neutral hierarchy, one clear primary action, and restrained semantic color. Current screenshots read as chaotic because every object competes: headers, filter bars, cards, badges, buttons, borders, giant logos, and media thumbnails all try to be focal.

Important code evidence:
- Apps uses custom status meta with pulse/spin and page-local status colors at `AppsList.tsx:12`, `AppsList.tsx:17`, `AppsList.tsx:35`.
- Apps card grid uses `Row/Col/Card` with page-local card styles at `AppsList.tsx:119` to `AppsList.tsx:128`, then renders network logos as visual content at `AppsList.tsx:201` to `AppsList.tsx:204`.
- Networks repeats nested KPI cards via `StatCard` at `NetworksList.tsx:116` to `NetworksList.tsx:118`; network color is used as action color at `NetworksList.tsx:171`.
- Creative Library has competing primary actions and control clusters at `MediaLibraries.tsx:87` to `MediaLibraries.tsx:148`.
- `FilterBar` is a generic bordered flex row with `ml-auto`, causing uneven wrapping and hierarchy at `FilterBar.tsx:27` to `FilterBar.tsx:35`.
- `StatCard` renders heavy bordered mini-cards with accent strips and 2xl values at `StatCard.tsx:51`, `StatCard.tsx:55`, `StatCard.tsx:78`.
- `ui-kit-compat` `Col` resolves only one span, not breakpoint behavior, at `layout.tsx:42`; this makes responsive intent unreliable.
- `ui-kit-compat` `Progress` ignores `strokeColor`/`trailColor` at `display.tsx:116`, while page code passes network color.
- Global CSS still includes token overrides and `transition: all` at `index.css:175` to `index.css:201`, `index.css:240`.

## Page Critique

### Apps

Current visual problem: app cards look like broken ad previews, not app management records. The massive network logos dominate the screen, overflow the card rhythm, and show transparent checkerboard artifacts. The user cannot quickly compare app status, OS, spend, installs, ROAS, or connected networks because the card body is swallowed by brand imagery.

Why chaotic:
- The page uses a 3-column card gallery for operational data. This is the wrong mental model for app admin. Apps should scan like records.
- Card borders are too visually loud in screenshot; outlines become the main structure.
- Metrics are too small while logos are huge. Important data is visually subordinate to decorative brand assets.
- Connected networks are rendered as images rather than compact chips or a count/summary.
- Status badges use custom animation and page-local styling, which adds noise for normal states.
- OS label and app package use mixed font sizes/weights without a clear hierarchy.

Redesign direction:
- Replace gallery cards with a compact app list/table or dense 2-column record cards with fixed height.
- Primary row: app icon, app name, bundle ID, OS, status.
- Secondary row: spend, installs, ROAS, connected networks as 20px official-logo chips plus count.
- Remove giant network logo thumbnails entirely. A network relationship is metadata, not hero content.
- Keep `Add App` as the single primary CTA.

### Networks

Current visual problem: each network card is too large and repetitive. The KPI blocks are stacked as big nested cards, making the page look like a form builder instead of a network overview. The user needs to compare networks, but the layout forces vertical scrolling and repeated reading.

Why chaotic:
- `StatCard` makes every KPI a bordered sub-card. Three nested cards inside every network card creates border noise.
- Network color is used on primary buttons and intended progress color, so each card starts inventing its own CTA system.
- "Enter Workspace" appears as a primary action on every card, violating the one-primary-action rule for quiet SaaS.
- The card description is too large relative to the core facts: connection status, spend, installs, active campaigns, keys.
- Progress bar meaning is weak. It uses a hardcoded total denominator and the compat wrapper ignores passed stroke colors.
- Connected app chips are small but visually disconnected from the action/footer.

Redesign direction:
- Use a network comparison table or compact network rows. If cards remain, make them shorter and fixed-height.
- Convert metrics into one inline KPI row, not nested cards.
- Use neutral row actions: `Open workspace` as dim button or link, not per-network primary.
- Keep network color only in logo/chip/accent marker, not action surfaces.
- Add a summary row above list: total spend, connected networks, API warnings.

### Creative Library

Current visual problem: this page has too many equal-weight controls before the content. Header actions, data freshness, filters, performance filters, format tabs, sync, and grid cards all compete. The work surface looks busy before the user sees assets.

Why chaotic:
- Multiple primary orange actions exist on one screen: `Upload`, `Top performers` when active, and `Sync Assets`.
- Filter groups are split across too many bars. The user sees a toolbar, freshness pill, filter row, performance panel, format tabs, and sync row as separate surfaces.
- Performance filters use tiny labels, unframed numeric values, slider handles without clear tracks, a native select, and a raw checkbox. They do not feel like one component.
- Creative cards are too large for a library. Thumbnails dominate; performance data and metadata are awkwardly packed under them.
- Placeholder scenic imagery undermines creative-management credibility if seen outside demo.
- Status badges float over media and can read detached from the asset.

Redesign direction:
- Collapse controls into a single library toolbar: search, network/app filters, active chips, count, view toggle, secondary sync.
- Put performance filters behind `Advanced filters` disclosure or a secondary drawer/panel.
- Keep `Upload` as the single primary CTA. Make `Sync` secondary. Make bulk remove danger/borderless and visible only after selection/filter context.
- Redesign cards as asset tiles: fixed thumbnail aspect ratio, one title line, compact metrics row, status/network chips in one metadata row.
- Default desktop should show more assets per viewport, not two oversized cards.

## Prioritized Design Fixes

1. Convert Apps and Networks from gallery-first cards to data-first lists.
Rationale: these are operational comparison screens. Dense rows/tables support scanning better than oversized cards.

2. Remove giant brand/network logos from Apps cards.
Rationale: logos are relationship metadata. They currently overpower app identity and metrics.

3. Enforce one primary CTA per screen.
Rationale: ikame DS reserves brand orange for the main action. Apps = Add App. Networks = no page primary or maybe Configure Key if needed. Creative = Upload.

4. Reduce border/card nesting.
Rationale: current UI uses borders to separate everything. Use whitespace, background tiers, and table/list structure first; borders only for focal surfaces.

5. Rebuild metric presentation.
Rationale: metrics should use tabular numbers, compact KPI rows, and consistent labels. Avoid `StatCard` inside repeated cards.

6. Normalize status and network badges.
Rationale: one badge system prevents rainbow noise. Use semantic color only for real state; network chips should be compact and mostly neutral.

7. Redesign filters as one coherent toolbar.
Rationale: filters are utility controls, not content. Use sunken `bg_tertiary` inputs, active filter chips, count, and reset link.

8. Move advanced/performance filters behind disclosure.
Rationale: Creative Library currently exposes too much filtering upfront. Default view should prioritize assets and common search/filter.

9. Replace per-network inline action colors.
Rationale: inline `net.color` buttons break token consistency and make every card look like a separate product.

10. Fix responsive grid behavior or stop using AntD compat Row/Col for new layouts.
Rationale: `Col` chooses one resolved span, so breakpoint props do not behave like AntD. Screenshot layout mismatches expected grid intent.

11. Tighten typography scale.
Rationale: too many `10px/11px/12px` labels and bold uppercase fragments reduce readability. Use `body_s` baseline, `body_xs` for support, tabular numbers for data.

12. Improve asset hygiene.
Rationale: transparent checkerboards and random `picsum` photos make the product feel unfinished. Use official cropped logo assets and real creative thumbnails/placeholders.

13. Clean token usage.
Rationale: legacy CSS variables, ui-kit utility classes, raw Tailwind-ish classes, and inline styles are mixed. Use ui-kit functional tokens as the main source.

14. Polish interaction/accessibility states.
Rationale: Web guidelines flag `transition: all`, icon buttons need labels, URL should reflect stateful filters/tabs, and images should reserve dimensions/lazy-load.

## Reusable Component Improvements

### `PageHeader`

Make it a strict operational header:
- Token-only icon tone, no arbitrary `iconBg`.
- Title variants: page label vs entity title.
- Action slots: `primaryAction`, `secondaryActions`, `utilities`.
- Enforce one primary action visually.
- Better responsive wrapping so controls do not compress title/subtitle.

### `FilterBar`

Promote it from generic flex row to real toolbar:
- Slots for search, filters, active chips, result count, reset link, utilities.
- Use `bg_secondary` container with `bg_tertiary` sunken controls.
- Replace `ml-auto` behavior with CSS grid or named slots to avoid awkward wrapping.
- Support dense mode for operational pages.

### `StatCard`

Add a compact KPI variant:
- No nested card border by default.
- Optional left accent only for summary dashboards, not repeated network cards.
- Use tabular numbers and smaller value scale in card/list contexts.
- Consider `MetricStrip`/`MetricRow` as better reusable primitive.

### `SurfaceSection`

Add hierarchy controls:
- `framed=false` option for nested sections.
- Density variants.
- Clear mapping to ikame background tiers. Avoid every nested block becoming another bordered card.

### `StatusBadge` and `NetworkBadge`

Unify:
- One size scale.
- Optional icon, no default animation except processing.
- Network chips should support logo + short label and neutral tone by default.
- Status color should indicate state, not decoration.

### `ui-kit-compat`

Highest leverage fixes:
- `Row/Col`: implement real responsive breakpoint classes or mark deprecated for page layouts.
- `Card`: avoid double padding/borders when page passes body style. Prefer direct ui-kit card/surface.
- `Progress`: either honor semantic color props or remove unsupported props.
- `Select`: replace native select with ui-kit Select for consistent height, focus, and menu styling.
- `Radio/Segmented`: align with DS segmented spec, no detached pill buttons.

### `CreativeGridCard`

Make asset tiles library-grade:
- Fixed aspect ratio and fixed tile height.
- Status and network metadata in one predictable strip.
- Clamp names, show full via tooltip.
- Lazy-load/reserve thumbnail dimensions.
- Replace random scenic placeholders with generated/real creative placeholders.
- Move destructive action into overflow or selection mode.

## Unresolved Questions

- Should Apps remain card-based for product reasons, or can this become a table/list?
- Is `picsum.photos` only dev mock data, or visible in current demos?
- Should network brand colors be allowed anywhere beyond logo/chip accents?

Status: DONE
Summary: Audited three route pages and related shared UI wrappers. Produced concrete redesign brief with page critiques, 14 prioritized fixes, and reusable component improvements.
Concerns/Blockers: `CLAUDE.md` and `docs/design-guidelines.md` were absent. No source code changed.
