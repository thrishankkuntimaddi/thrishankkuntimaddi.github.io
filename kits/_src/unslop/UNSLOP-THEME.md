# Unslop — design system

> **Prompt** (paste into an AI coding tool):
>
> Apply the "Unslop" theme to this project, using unslop.css, unslop.csv and UNSLOP-THEME.md. Made with the unslop method by Damir Sokolovsky (@heydamir) — https://github.com/heydamir/unslop (CC BY 4.0). Follow the rules exactly:

From Thrishank Kuntimaddi's Expense Tracker app (Profile → Appearance → Look → Unslop). Made with the unslop method by Damir Sokolovsky (@heydamir) — https://github.com/heydamir/unslop (CC BY 4.0).

## Direction
- **Product:** a daily money diary — what people spend, earn, owe and pay, line by line.
- **Character:** exact, homely, unhurried.
- **World:** the household hisaab notebook — ruled paper, blue ballpoint ink, a sum closed off at the foot of the page.
- **Moments:** the month's total set large in Newsreader; a chart line drawn in blue ink on faint ruled paper (`us-card--ruled`).
- **Signature:** the accountant's double rule under totals (`us-total`) — totals only.

## What it removes
Colour-blob wallpapers, glass and bevels on every surface, a different colour per tile, gradient fills, ALL-CAPS tracked labels, overshooting springs and hover lifts, emoji and sparkles.

## Rules
- Load Instrument Sans and Newsreader from Google Fonts, then unslop.css after the project's own CSS. Put class "us-root" on <body>. Light is the default; dark is <html data-theme="dark">.
- World: the household hisaab notebook. Surfaces stay near-neutral paper (--us-canvas, --us-surface); the world shows in the blue-ink accent (--us-accent), the serif figures and the double rule — never in tinted backgrounds, gradients, glows or glass.
- One accent, used rarely: the primary action (us-btn--primary), the selection (segmented, tab bar) and the one key figure. Money in/out may use --us-positive / --us-negative; everything else is ink.
- Type: Instrument Sans for the interface (400/500, 600 at most); Newsreader only for page titles (us-title) and large figures (us-figure). Sentence case everywhere — no ALL-CAPS tracked labels. Numbers are tabular.
- Signature, and only here: totals get the accountant's double rule (us-total). Never on non-totals.
- Map components: cards → us-card (us-card--ruled only for a chart); lists → us-list + us-row with us-tile (category as a dot: us-tile--dot, style="--dot:<colour>"); buttons → us-btn (primary / ghost); choices → us-segmented; inputs → us-input; toggles → us-switch; budget bars → us-meter (data-state near|over); bottom navigation → us-tabbar; sheets and dialogs → us-sheet / us-dialog.
- Radii by size: controls 10px, cards 14px, sheets 20px. Hairlines are the ink at 8%. Light shadows are tiny and warm; dark mode uses surface steps, not shadows.
- Motion: one curve (--us-ease), 140–180ms for presses and toggles, a press is scale(.97). No overshoot, no hover lift, no looping animation.
- Copy: titles name the place or the period, not a greeting. No exclamation marks, no emoji, no hype words.
-  Must work at 390px, tablet and desktop, light and dark.

## Files
- `unslop.css` — tokens (light + dark) and the `us-` components
- `unslop.csv` — every token with its light and dark value
- `prompt.txt` — the rules above, to paste into an AI tool
