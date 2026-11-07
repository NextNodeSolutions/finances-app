---
name: Actual Budget
description: Local-first personal finance, set like a private-banking statement
# Light-theme palette mapping. Dark and midnight remap the same semantic
# roles via `theme.*` tokens (see The Semantic Token Rule).
colors:
  ink: '#141413'
  ink-deep: '#0b0b0a'
  ink-soft: '#262523'
  charcoal: '#383734'
  slate: '#4f4e4a'
  graphite: '#63625d'
  stone-subdued: '#75746f'
  stone-quiet: '#b4b3ad'
  hairline-strong: '#d3d2cd'
  hairline: '#e3e2de'
  hairline-subtle: '#ebeae6'
  porcelain: '#f2f2ef'
  vellum: '#f7f7f5'
  paper: '#ffffff'
  sky: '#2f84d6'
  sky-focus: '#4e9de6'
  sky-ink: '#2369b3'
  sky-deep: '#1d5491'
  sky-wash: '#e4f0fc'
  sky-mist: '#f2f8fe'
  signal: '#ee5a24'
  signal-ink: '#c94415'
  signal-wash: '#fff5f0'
  jade: '#16724e'
  jade-ink: '#125c40'
  jade-wash: '#ddf3e8'
  garnet: '#b0322a'
  garnet-wash: '#fef3f2'
  amber: '#9a6713'
typography:
  display:
    fontFamily: 'Noto Serif Display Variable, Iowan Old Style, Times New Roman, serif'
    fontSize: '28px'
    fontWeight: 400
    lineHeight: '34px'
    letterSpacing: '-0.01em'
    fontFeature: 'lnum, tnum'
  headline:
    fontFamily: 'Noto Serif Display Variable, Iowan Old Style, Times New Roman, serif'
    fontSize: '34px'
    fontWeight: 300
    lineHeight: '40px'
    letterSpacing: '-0.015em'
    fontFeature: 'lnum, tnum'
  title:
    fontFamily: 'Inter Variable, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
    fontSize: '15px'
    fontWeight: 600
    lineHeight: '20px'
    letterSpacing: '-0.005em'
  body:
    fontFamily: 'Inter Variable, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
    fontSize: '13px'
    fontWeight: 400
    lineHeight: '18px'
  label:
    fontFamily: 'Inter Variable, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
    fontSize: '13px'
    fontWeight: 500
    lineHeight: '18px'
  data:
    fontFamily: 'Geist Mono Variable, ui-monospace, SF Mono, Menlo, Consolas, monospace'
    fontSize: '13px'
    fontWeight: 400
    letterSpacing: '-0.01em'
    fontFeature: 'tnum'
  label-mono:
    fontFamily: 'Geist Mono Variable, ui-monospace, SF Mono, Menlo, Consolas, monospace'
    fontSize: '10.5px'
    fontWeight: 500
    letterSpacing: '0.07em'
rounded:
  xs: '4px'
  sm: '6px'
  md: '8px'
  menu: '10px'
  lg: '12px'
  xl: '16px'
  sheet: '18px'
  pill: '999px'
spacing:
  xxs: '2px'
  xs: '4px'
  sm: '8px'
  md: '12px'
  lg: '16px'
  xl: '24px'
components:
  button-primary:
    backgroundColor: '{colors.ink}'
    textColor: '{colors.paper}'
    typography: '{typography.label}'
    rounded: '{rounded.md}'
    padding: '6px 12px'
  button-primary-hover:
    backgroundColor: '{colors.charcoal}'
  button-normal:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.ink-soft}'
    rounded: '{rounded.md}'
    padding: '6px 12px'
  input:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.ink}'
    rounded: '{rounded.md}'
    padding: '6px 10px'
  segmented-active:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.ink}'
    rounded: '{rounded.sm}'
    padding: '4px 12px'
  card:
    backgroundColor: '{colors.paper}'
    rounded: '{rounded.lg}'
  modal-shell:
    backgroundColor: '{colors.porcelain}'
    rounded: '{rounded.sheet}'
    padding: '5px'
  side-panel:
    backgroundColor: '{colors.paper}'
    width: '440px'
    padding: '20px'
  status-pill-due:
    backgroundColor: '{colors.signal-wash}'
    textColor: '{colors.signal-ink}'
    rounded: '{rounded.sm}'
    padding: '2px 8px'
  nav-item-active:
    backgroundColor: '{colors.hairline-subtle}'
    textColor: '{colors.ink}'
    rounded: '{rounded.md}'
    height: '32px'
  table-header:
    backgroundColor: '{colors.vellum}'
    textColor: '{colors.graphite}'
    typography: '{typography.label-mono}'
    height: '36px'
---

# Design System: Actual Budget

## 1. Overview

**Creative North Star: "Statement of Position"**

The app reads like a statement from a private bank: one position, set in exact figures, calmly. Porcelain canvas, white paper ruled with hairlines, ink-black actions, every figure in a mono set like a watch dial, and one headline figure per page engraved in a light display serif. Luxury comes from restraint and precision, never from ornament. Each screen answers one question first: Overview, where do I stand; Budget, is every dollar assigned (in tracking mode, am I on plan); Account, does this match my bank; Reports, how did I get here.

Density stays where routine work lives: 13px base text, 32px rows, every shortcut and inline edit kept. Calm comes from hairlines, margins and a narrow palette, not from bigger type. Depth goes beside the page, never over it: inspecting and editing happen in a non-modal side panel while the page stays live. The world refuses the old Actual look (navy sidebar, purple accent, dense gray grid), now an anti-reference everywhere except the midnight theme, and fintech gloss (gradients, glass, neon, hero metrics).

**Key Characteristics:**

- Stone neutrals, white paper, 1px hairlines, ink-black primary actions.
- One soft sky accent for focus, selection and links; signal orange only where something needs the user.
- Three faces with fixed jobs: Inter for UI, Geist Mono for data, Noto Serif Display for titles and the one headline figure.
- Hairline-first depth: borders carry structure, shadows stay faint and offset.
- Balanced is a moment: a double rule draws once when a difference reaches 0.00.
- Light and dark share the semantic roles; midnight keeps its legacy palette inside the new structure.

## 2. Colors

Warm stone neutrals carry almost every pixel; one sky accent, one signal and two money inks carry meaning. All hex values (frontmatter included) are the light mapping in `packages/component-library/src/themes/light.css`, built from the `--palette-stone*`, `sky*`, `signal*`, `jade*`, `garnet*` and `amber*` scales in `palette.css`.

### Primary

- **Ink** (#141413): `pageText`, `buttonPrimaryBackground`, active nav text, checked checkboxes and toggles. Primary hover lifts to **Charcoal** (#383734), also the bare-button text.
- **Deep Ink** (#0b0b0a): `pageTextDark`. Headline figures, card and panel titles, the Settle rule, the PaceGauge fill.

### Secondary

- **Sky** (#2f84d6): `accent`. The chart cursor and pinned point, the current budget month's underline, the text caret.
- **Sky Focus** (#4e9de6): `focusRing`, focused input borders, the inset border of a selected row. **Sky Ink** (#2369b3): `accentText` and `pageTextLink`, for links and the selected menu item.
- **Sky Wash** (#e4f0fc): selected rows. **Sky Mist** (#f2f8fe): `accentSubtle` and the upcoming pill, with **Sky Deep** (#1d5491) text.

### Tertiary

- **Signal** (#ee5a24), with **Signal Ink** (#c94415) on **Signal Wash** (#fff5f0): attention only. The Attention dot, the Overbudgeted pill, due and warning pills (`warning*` maps onto this scale), sync failures that need action.
- **Jade** (#16724e): `numberPositive`, a rise in a change column, funded templates. Notice and paid pills use **Jade Ink** (#125c40) on **Jade Wash** (#ddf3e8).
- **Garnet** (#b0322a): `numberNegative` and `errorText`. Negative balances, overspending, missed schedules; error pills sit on **Garnet Wash** (#fef3f2). **Amber** (#9a6713) marks underfunded templates only.

### Neutral

- **Porcelain** (#f2f2ef): canvas, trays, the mobile page. **Paper** (#ffffff): cards, tables, sidebar, titlebar, menus, inputs, the side panel. **Vellum** (#f7f7f5): table header band, row hover.
- **Hairline** (#e3e2de): borders of cards, panels, menus, titlebar and sidebar. **Hairline Subtle** (#ebeae6): row separators, the active nav fill, neutral pills. **Hairline Strong** (#d3d2cd): input borders, hover borders, total rules, scrollbar thumbs.
- **Ink Soft** (#262523): table, menu and normal-button text. **Slate** (#4f4e4a): sidebar items, form labels. **Graphite** (#63625d): secondary text, table header labels. **Stone Subdued** (#75746f): placeholders and subdued text, the lightest color allowed for readable text on white. **Stone Quiet** (#b4b3ad): zero values and disabled text only.

### Dark and midnight

Dark (`dark.css`) remaps the same roles. The canvas is onyx (#0d0d0c), cards and tables graphite (#171716), sidebar, titlebar, trays and header band a deeper onyx (#121211), menus #1d1d1b, hairlines #2b2b29, text #e8e7e2. Ink inverts to ivory (#f5f4f0): primary buttons turn ivory with onyx text, and headline figures use ivory, never pure white. The accent steps to Sky Focus with #7fb9f0 text; signal lifts to #fa7340, jade to #66c197, garnet to #ec7e73. Midnight (`midnight.css`) keeps its legacy gray-and-purple palette, purple primary and accent included, and maps only the new roles (trays, hairlines, focus, signal, titlebar, shadows) onto it: it inherits the new structure, type and radii, not the new colors.

### Named Rules

**The Semantic Token Rule.** Components use only `theme.*` tokens (`--color-*`): never a hex value, never `--palette-*` in TSX. A new role lands in `theme.ts` and all three theme files at once. A hardcoded hex in a component is a bug.

**The One Accent Rule.** Sky marks focus, selection, links, the current month and the chart cursor. It never fills anything larger than a selected row, never decorates and never colors a button: primary actions are ink.

**The Attention Rule.** Signal orange appears on the titlebar Attention control and on the offending figure or pill, nowhere else.

**The Stock-Not-Gain Rule.** A balance reads in ink unless it is owed (garnet). Jade marks a rise, always with its plus sign. Zero reads in Stone Quiet; an unknown value shows an em dash. Color never works alone: the sign and the context carry the state, and jade and garnet only reinforce it.

## 3. Typography

**Display Font:** Noto Serif Display Variable (with Iowan Old Style, Times New Roman, serif)
**Body Font:** Inter Variable (with the system sans stack)
**Label/Mono Font:** Geist Mono Variable (with ui-monospace, SF Mono, Menlo, Consolas)

**Character:** A quiet grotesk does the work, a mono sets every figure like an instrument readout, and a light, high-contrast serif engraves the few words and the one figure that head a page. The faces live in `fontFamily` (`ui`, `mono`, `display`), overridable through `--font-family`, `--font-family-mono` and `--font-family-display`.

### Hierarchy

- **Display** (400, 28px/34px, -0.01em, `styles.display`): page titles through `PageHeader`, the budget month title, the account name. Modal titles 22px (20px narrow), side panel titles 20px/26px, mobile sheet titles 21px/28px, the sidebar budget name 18px.
- **Headline figure** (300–400, 34–36px, lining tabular figures): one per page. Account balance 34px/40px at 300 and -0.015em, To budget 34px, net worth 36px/42px; mobile 28–30px.
- **Title** (600, 15px/20px, -0.005em): card and section titles, the rail month name. Sidebar section labels 13px/600.
- **Body** (400, 13px/18px): the base size set on `html`; prose, table cells, menus.
- **Label** (500, 13px/18px): buttons, form labels, nav items. Pills and menu section headers 11.5px/500, panel subtitles 12.5px.
- **Data** (Geist Mono 400, 12.5–13px, -0.01em, `styles.tnum`): every figure. Subtotals 500, the grand total 600, never 700. Keycaps and menu keybindings 11px.
- **Mono label** (Geist Mono 500, 10.5px, 0.07em, uppercase from CSS, `styles.monoLabel`): table header bands, instrument strip labels, sidebar group labels, register section rows, chart axis ticks.

### Standard Component Sizes

`Button`, `Text` and `Input` accept a `size` prop: `small` | `medium` | `large` | `extra-large` (the `ComponentSize` vocabulary in `packages/component-library/src/tokens.ts`). `Button` and `Input` render the `medium` row when the prop is omitted. Sizes are responsive: they step up one notch on mobile/narrow for readability and touch targets, and collapse to the compact desktop scale from 512px/730px up. Breakpoint groups mirror the `useResponsive` view modes: narrow <512, small 512–729, medium 730–1099, wide ≥1100.

Text values (fontSize / lineHeight, px):

| Size        | narrow  | small   | medium  | wide    |
| ----------- | ------- | ------- | ------- | ------- |
| small       | 12 / 16 | 12 / 16 | 12 / 16 | 12 / 16 |
| medium      | 13 / 18 | 13 / 18 | 13 / 18 | 13 / 18 |
| large       | 16 / 22 | 15 / 20 | 15 / 20 | 15 / 20 |
| extra-large | 17 / 24 | 17 / 24 | 16 / 22 | 16 / 22 |

Control values for Button/Input (paddingY / paddingX / min-height, px):

| Size        | narrow       | small       | medium      | wide        |
| ----------- | ------------ | ----------- | ----------- | ----------- |
| small       | 3 / 8 / 24   | 3 / 8 / 24  | 3 / 8 / 24  | 3 / 8 / 24  |
| medium      | 6 / 12 / —   | 6 / 12 / —  | 6 / 12 / —  | 6 / 12 / —  |
| large       | 8 / 12 / 36  | 6 / 12 / 32 | 6 / 12 / 32 | 6 / 12 / 32 |
| extra-large | 10 / 14 / 40 | 8 / 12 / 36 | 8 / 12 / 36 | 8 / 12 / 36 |

`medium` is the default control look (6px/12px padding, 13px text, no min-height, about 30px tall) and inherits line-height on controls; the other sizes apply their scale line-height. Inputs subtract 2px from paddingX at every size so a value lines up with the label of the button beside it; bare buttons use paddingY on all sides. `Text` always applies its size's line-height, while the omitted prop forces none. `extra-large` narrow hits the 40px mobile touch target: at narrow, use `large` or `extra-large` for controls the user taps; `small` stays the compact 24px desktop-density choice at every breakpoint.

### Named Rules

**The Tabular Number Rule.** Every standalone financial figure goes through `FinancialText` or `styles.tnum`: Geist Mono with `"tnum"` and `tabular-nums`, so digits align in columns. A headline figure keeps `FinancialText` and swaps the face by spreading `styles.display` into its `style`. A proportional money column is a bug.

**The Three Faces Rule.** Mono is for data only: figures, figure-column headers, labels naming a group of figures, keycaps, axis ticks. Nav items, buttons, prose and headings stay Inter. Serif is for display only: page, panel, modal and sheet titles, the budget name and the one headline figure per page; never body text, buttons or table cells.

**The Sentence-Case Source Rule.** Labels are written in sentence case; uppercase comes only from `styles.monoLabel`, so DOM text stays e2e-matchable. Legacy `styles.veryLargeText`, `largeText` and `mediumText` remain for existing callers only.

## 4. Layout

- **Frame.** Sidebar 240px by default (200px minimum, resizable, collapsible). Titlebar 44px; the sidebar header shares that height so both bottom hairlines align.
- **Page.** A 20px side gutter for title and content (10px narrow), 28px from the titlebar hairline to the page title, 20px under the header. The header stacks the title row (actions right-aligned), the headline figure and the instrument strip (24px column gap). Spacing steps 2/4/8/12/16/24; card gutters 20px; rows 32px, header bands 36px, total rows 40px.
- **Overview.** Capped at 1136px and centered; a `1fr` + 360px grid with a 16px gap, one column (month card first) below 1100px. **Budget:** a 320px sticky rail when one month is shown. **Side panel:** 440px, a flex sibling of the page scroll view; the page narrows instantly.
- **Breakpoints.** 512px, 730px, 1100px. The titlebar shows labels from 1280px, narrows the palette trigger to 240px at 1024–1279px and keeps only icons below 1024px.
- **Mobile.** A 50px header plus the top safe-area inset; one always-visible 56px bottom bar plus the bottom inset, with five slots and a 44px ink circle in the middle for a new transaction. Touch targets are at least 40px.

## 5. Elevation & Depth

Hairline-first. Structure comes from 1px rules and from paper sitting on porcelain; shadows are faint, always offset and softly blurred. Persistent surfaces carry a hairline and `elevation.card` at most. Transient surfaces (menus, popovers, tooltips, the SelectionBar, the command palette, modals) add `elevation.popover` or `elevation.modal`. Recipes live in each theme as `--shadow-*`; dark deepens them and adds a 1px inset top highlight (white at 2–6%) so surfaces separate on onyx.

### Shadow Vocabulary

- **xs** (`box-shadow: 0 1px 1px rgba(20,20,19,0.04)`): normal buttons, the active segment, the modal card, big inputs, the toggle knob.
- **card** (`box-shadow: 0 1px 2px rgba(20,20,19,0.04), 0 2px 6px -2px rgba(20,20,19,0.04)`): cards and table containers.
- **raised** (`box-shadow: 0 1px 2px rgba(20,20,19,0.05), 0 8px 20px -6px rgba(20,20,19,0.1)`): `styles.shadow`, small floating widgets.
- **popover** (`box-shadow: 0 1px 2px rgba(20,20,19,0.05), 0 10px 28px -6px rgba(20,20,19,0.14), 0 24px 56px -16px rgba(20,20,19,0.12)`): menus, popovers, tooltips, the SelectionBar.
- **modal** (`box-shadow: 0 2px 4px rgba(20,20,19,0.04), 0 24px 64px -12px rgba(20,20,19,0.24)`): the modal shell, the command palette.
- **buttonPrimary** (`box-shadow: 0 1px 2px rgba(20,20,19,0.24), inset 0 1px 0 rgba(255,255,255,0.1)`): ink buttons only.

Desktop modals sit on `overlayBackground` (ink at 28% in light, black at 55% in dark) with a 2px backdrop blur, the only blur in the system. Mobile sheets use `styles.shadowSheet` (`0 -4px 24px rgba(0,0,0,0.2)`).

### Named Rules

**The Hairline-First Rule.** A surface that stays on screen is defined by its 1px hairline; its shadow, if any, is `elevation.card`. Heavier depth is earned only by appearing on interaction.

**The Beside-Not-Over Rule.** The side panel is not elevated: no shadow, no scrim, `aria-modal="false"`, and the page stays interactive. Centered modals are only for confirmations, destructive actions and wide editors.

## 6. Shapes

Corners are concentric and soft, never capsules on controls: badges 4px (`radius.xs`), pills and menu items 6px (`sm`), buttons, inputs and nav rows 8px (`md`), menus, popovers and tooltips 10px (`md + 2`), cards and table containers 12px (`lg`), the command palette 16px (`xl`), the modal shell and mobile sheets 18px (`sheet`; top corners only on sheets). `radius.pill` is for count badges, toggles, dots, the PaceGauge bar and the 36×4 sheet grab handle.

**The Concentric Tray Rule.** An outer radius equals the inner radius plus the inset plus the border: modal shell 18 = card 12 + bezel 5 + border 1; segmented tray 8 = segment 6 + padding 2. A tray (Porcelain fill, 1px `trayBorder`, 2–6px padding) holding white pieces is the only earned nesting: segmented controls, the modal shell, and grouped choice cards such as the budget method cards in Settings.

## 7. Components

### Buttons

- **Shape:** softly rounded (8px), medium padding 6px 12px, Inter 13px/500.
- **Primary:** Ink fill and border, Paper text, `elevation.buttonPrimary`. Hover lifts to Charcoal; pressed deepens to Ink Soft and drops the shadow. Ivory with onyx text in dark, purple in midnight.
- **Normal:** Paper, 1px Hairline, Ink Soft text, `elevation.xs`. Hover takes #fbfbfa (`buttonNormalBackgroundHover`) and a Hairline Strong border; pressed takes Porcelain.
- **Bare:** transparent, Charcoal text, ink at 5% on hover and 9% on press. The workhorse for in-table actions and the 30×30 titlebar and header icon buttons (Graphite icons).
- **Focus:** `styles.focusRing`, a 2px Sky Focus outline held 2px off the edge. Pressing never translates or bounces (the `bounce` prop is deprecated and inert).

### Inputs / Fields

- **Style:** Paper, 1px Hairline Strong border, 8px radius, 6px 10px padding, Stone Subdued placeholder. Labels sit 4px above in 13px/500 Slate.
- **Focus:** Sky Focus border plus a 3px `formInputShadowSelected` halo (#b0d3f7), transitioned at `motion.base`. **Disabled:** `buttonNormalDisabledBackground` with a Hairline border. Big inputs keep the hairline on `elevation.xs`. Toggles are a 30×18 capsule with a 14px knob; toggles and checkboxes turn ink when on.

### Cards and trays

- **Card:** `styles.tableContainer` (Paper, 1px Hairline, 12px, `elevation.card`, clipped). A title row of at least 48px with a 20px gutter: Title style in Deep Ink, an optional link-like action on the right.
- **Segmented control:** a `ModeButtonGroup` tray (8px, 2px padding and gap) of `ModeButton` segments (6px, 4px 12px, Graphite at 500). The active segment is Paper with a Hairline border, `elevation.xs` and Ink text.
- **Modal:** the double bezel. A Porcelain tray shell (18px, 5px bezel, `elevation.modal`) carries a 48px title row (display 22px, left-aligned, bare close on the right) above a Paper card (12px, 1px Hairline, 22px padding). Narrow screens get bottom sheets.

### Badges and pills

- **Status pill:** a tinted chip, never a capsule: 6px radius, 2px 8px, Inter 11.5px/16px at 500, an optional 6px dot in `currentColor`. Upcoming is Sky Mist with Sky Deep, due and warning Signal Wash with Signal Ink, missed and error Garnet Wash with Garnet, paid and notice Jade Wash with Jade Ink. The Overbudgeted pill uses the signal pair at 600.
- **Count badge:** mono 10.5px/500 in a 16px capsule, Hairline Subtle with Charcoal figures. **Editor pills** (rule conditions, filters): `styles.editorPill`, 6px, 2px 7px.

### Navigation

- **Sidebar:** Paper with a 1px right Hairline. The header holds the logo tile, the budget name in display 18px and the sync status line. Nav rows are 32px, 8px radius, 0 10px padding, Inter 13px/500 Slate with 15px icons; hover fills Porcelain, active fills Hairline Subtle with Ink text, never a stripe. Group labels ("Accounts", "Manage") are mono labels in Stone Subdued. Account rows are 28px: name 13px/500, balance mono 12px in Graphite, garnet when negative.
- **Titlebar:** 44px, Paper, bottom Hairline, a three-column grid. Left: sidebar toggle and back crumb. Center: the palette trigger. Right: Attention, privacy, sync, a 1px divider, the user menu and help, as 30×30 bare icon buttons.
- **Palette trigger:** a bare button dressed as a field (320×30, Paper, 1px Hairline Strong, 8px) with a search glyph, "Search or jump to…" in Stone Subdued and a mono 11px `⌘K` keycap in a 4px Hairline box. It opens the command palette: Paper, Hairline, 16px radius, `elevation.modal`, at most 600px wide.
- **Mobile:** the 56px bottom bar (Overview, Budget, the ink new-transaction circle, Accounts, More); secondary pages open from the More sheet, which has a grab handle and hairline row dividers.

### Side panel

A 440px non-modal panel, full height under the titlebar: Paper with a 1px left Hairline, `role="dialog"`, `aria-modal="false"`, no scrim, no shadow. A 20px header holds the title (display 20px/26px Deep Ink; it takes focus on open), an optional 12.5px Stone Subdued subtitle and headline figure, and a bare close. The body scrolls with 20px gutters; a sticky footer right-aligns actions under a hairline. Esc closes, ⌘↵ runs the primary action, and focus returns to the opener on close. It fades in at `motion.base`; narrow screens fall back to the mobile page or sheet.

### Settle rule

Two 1px Deep Ink rules 3px apart span the figure column, with the label right-aligned in Inter 12px/500 Stone Subdued ("Balanced", or the existing "All reconciled!"). It draws once on a non-zero to 0.00 transition (opacity over `motion.slow`), renders static when already settled on mount, and announces through `aria-live="polite"`. It appears in exactly four places: envelope To budget, reconcile difference, split remainder and the last step of the cover stepper.

### Pace gauge

A 6px capsule track in Vellum with a Deep Ink fill for spent over budgeted (garnet when over), and a 2×14px Stone Subdued tick at the share of the month gone. Under it, the same reading in words, mono 12px: "88% spent · 68% of the month gone". The words carry the meaning; the bar reinforces it. It sits in the Overview month card, both budget rails and the mobile budget.

### Selection bar

A floating toolbar centered 16px above the bottom of the register while a selection exists: Paper, 1px `menuBorder`, 12px radius, `elevation.popover`, padding 4px 4px 4px 12px. A summary in Inter 13px/500 ("3 selected · −232.85") leads the actions (Edit, Duplicate, Delete, More). Payees and rules reuse it.

### Attention list

The titlebar Attention button (bare: a signal dot, a mono count, a label from 1280px) opens a 360px popover. Each row has a 6px dot (Signal for signal severity, Stone Subdued for notice), an ellipsized Inter 13px label and a mono 12.5px amount (garnet when negative), with 8px 10px padding, 6px radius and a Porcelain hover. The Overview attention strip and the budget overspent card read the same items.

### Statement header

The register header reads like the top of a statement. The account name is display 28px (editable), with actions on the right: Reconcile and Import as normal buttons, Add transaction as primary, the account menu as a 30×30 bare icon. Under it sit the headline balance (display 34px/40px at 300, ink unless owed) and the instrument strip: an always-visible row of readings, each a Graphite mono label and a mono 13px/500 figure (CLEARED, UNCLEARED, UPCOMING · 7 DAYS, plus SELECTED and FILTERED when they apply). The reconcile strip opens beneath it with CLEARED, STATEMENT and DIFFERENCE and closes on the Settle rule. The Overview position card has the same shape: net worth in display 36px, a mono change line, asset and liability readings.

### Signature Component: The Statement Ledger

The core surface: the budget table, registers, the balance sheet, schedules, payees and report tables. A `styles.tableContainer` inset by the page gutter, topped by a 36px Vellum header band with a bottom Hairline and Graphite mono labels. Rows are 32px with Hairline Subtle separators and a Vellum hover; a selected row takes Sky Wash with a 1px inset Sky Focus border. Figures are right-aligned mono, colored by The Stock-Not-Gain Rule. Subtotal rows set group labels at 12.5px/500 Graphite and side labels at 13px/600 Deep Ink; totals sit in a 40px foot row under Hairline Strong. UPCOMING and POSTED are non-focusable mono-label section rows. The current budget month carries a 2px Sky underline on its column header; empty future months show an em dash. Striping is off by default and theme-controlled. Loading shows hairline skeleton rows at final size, never a spinner or a shimmer.

### Motion

Motion confirms a change; it never performs. Tokens: `motion.fast` 120ms, `motion.base` 160ms, `motion.slow` 240ms, `motion.ease` cubic-bezier(0.2, 0.8, 0.2, 1).

- **Color, background, border, shadow, opacity:** `motion.base` with `motion.ease`. Hover and press change color only; the toggle knob's transform is the one moving control.
- **Side panel:** opacity at `motion.base`; the page reflows instantly. **Budget month change:** a crossfade at `motion.base`, no slide. **Settle rule:** opacity at `motion.slow`.
- **Popovers and menus:** no choreography; at most opacity plus a 4px translate at `motion.fast`.
- **Mobile sheets:** slide up over 240ms (cubic-bezier(0.22, 1, 0.36, 1)), out over 180ms, with a fading overlay.
- **Forbidden:** layout animation (height, width, position), entrance choreography, staggered lists, number counting, spring bounce, skeleton shimmer, parallax, anything over 240ms. Rewind swaps figures instantly.
- **Reduced motion:** the global guard in `index.html` collapses every transition and animation to 0.01ms; the side panel and the Settle rule also drop their fades explicitly.

## 8. Do's and Don'ts

### Do:

- **Do** route every color through `theme.*` and check light, dark and midnight.
- **Do** make primary actions ink and keep sky for focus, selection, links, the current month and the chart cursor.
- **Do** set every figure through `FinancialText` or `styles.tnum`, and keep the minus sign on negatives.
- **Do** give each page one serif title and at most one serif headline figure.
- **Do** define persistent surfaces with a 1px hairline and `elevation.card` at most; keep `popover` and `modal` elevation for transient surfaces.
- **Do** inspect and edit in the 440px side panel; open a modal only for confirmations, destructive actions and wide editors.
- **Do** keep radii concentric, rows at 32px and controls compact; mobile tap targets are at least 40px.

### Don't:

- **Don't** use fintech gloss: gradients (chart areas use a flat 6% fill), glassmorphism, neon accents, the hero-metric template.
- **Don't** bring back the purple accent outside midnight: no purple buttons, selection, nav or mobile header.
- **Don't** rebuild the old look (navy sidebar, dense gray grid) or a corporate portal (navy-and-gold, enterprise density).
- **Don't** add colored side stripes: no `border-left` or `border-right` over 1px as an accent on cards, rows, nav items or alerts. Active nav is a fill.
- **Don't** put eyebrow or kicker labels above headings; mono labels name columns and groups of figures, never headings.
- **Don't** nest cards in cards; a tray holding white pieces is the only earned nesting.
- **Don't** use mono as a costume on nav items, buttons, prose or headings, or set body text, buttons or cells in serif.
- **Don't** color a normal state signal orange or a positive balance jade, and don't rely on color alone for money state.
- **Don't** use hard offset shadows, zero-offset glows, or a shadow or scrim on the side panel.
- **Don't** hardcode hex values or raw `--palette-*` colors in components, or set Inter or mono at 700.
