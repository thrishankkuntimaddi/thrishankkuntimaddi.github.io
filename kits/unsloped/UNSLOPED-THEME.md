# Unsloped — design system

> **Prompt** (paste into an AI coding tool):
>
> Apply the "Unsloped" theme to this project, using unsloped.css, unsloped.csv and UNSLOPED-THEME.md. Made with the unslop method by Damir Sokolovsky (@heydamir) — https://github.com/heydamir/unslop (CC BY 4.0). Follow the rules exactly:

From Thrishank Kuntimaddi's Expense Tracker app (Profile → Appearance → Look → Unsloped). Made with the unslop method by Damir Sokolovsky (@heydamir) — https://github.com/heydamir/unslop (CC BY 4.0).

## Direction
- **Character:** exact, homely, unhurried — and a little ceremonial.
- **World:** the red cloth-bound bahi-khata a family or a shop opens fresh each year: gold foil, cream ledger paper, a red double margin rule, a ribbon to keep the page.
- **Moment:** one cover per screen (`kh-cover`) — red cloth over boards, a gold foil frame, the total stamped in gold.
- **Signature:** ledger pages (`kh-ledger`) ruled with the red double margin.
- **Also:** numbered contents pages, serif section heads, quick entry written on a line, a ribbon bookmark on the current tab.

## Rules
- Load Instrument Sans and Newsreader from Google Fonts, then unsloped.css after the project's own CSS. Put class "kh-root" on <body>. Light (cream ledger paper) is the default; dark is <html data-theme="dark">.
- World: the red cloth-bound bahi-khata. The page is cream ledger paper and ink; colour lives in ONE moment per screen — the cover (kh-cover): red cloth, a gold foil frame, the key total stamped in gold. Never more than one cover on a screen.
- Signature: ledger pages. Lists are kh-ledger with kh-entry rows — the red double margin rule runs down the left; the category is a small dot (kh-entry-mark, style="--dot:<colour>") left of the margin. Day or group headers are kh-day with the day's total in kh-total.
- Type: Instrument Sans for the interface; Newsreader for titles (kh-title), section heads (kh-section), figures (kh-figure) and amounts. Sentence case, no ALL-CAPS labels. Totals only get the double rule (kh-total).
- Actions are written in ink: primary kh-btn--primary (ink fill), others kh-btn. The pen colour (--kh-pen) marks links and focus only.
- Navigation index pages may use kh-contents (numbered entries, no icons). Text inputs that feel like writing use kh-line-input. Bottom navigation uses kh-tabbar — the current tab gets the red ribbon.
- No gradients except inside the cover's cloth; no glow, no glass, no emoji, no overshoot. Motion: one curve, 140–180ms, press = scale(.97).
- Copy: titles name the period or the book, not a greeting. No exclamation marks.
- Must work at 390px, tablet and desktop, light and dark.

## Files
- `unsloped.css` — tokens (light + dark) and the `kh-` components
- `unsloped.csv` — every token with its light and dark value
- `prompt.txt` — the rules above, to paste into an AI tool
