# Thrishank Kuntimaddi — Portfolio

A light, pencil-sketch portfolio with retro space styling that runs itself.

- **Auto-tour:** the page scrolls on its own. Any scroll, tap or key press hands control to the visitor at once, and the tour resumes after five idle seconds.
- **Universes:** five light styles (Paper, Pixel, Sketch, Blueprint, Newsprint), each with its own fonts, component shapes, layout and wording, combined with four colour editions. The first open is Paper in the colours for the local time; every refresh and every glitch moves to another universe. Preview one with `?world=pixel&edition=dusk`.
- **Glitches:** on refresh, as the tour passes "More work", and at the end. The picture tears, flickers through other universes and settles on a new one. `assets/glitch.mp3` plays once the visitor has touched the page.
- **Pip:** a guide character that walks, turns and pulls faces so people poke it. Holding it peeks at the previous colours. In the final scene Pip becomes the player.
- **Codes and Morse:** each project has a phone-keypad code that decodes on hover (and at random); project cards blink their name in Morse.
- **Final scene:** a tabbed, readable resume beside two games played by Pip: Catch (true and false words about me) and Pixel run (jump the bugs). They play themselves until the visitor takes over.
- **Quick jump:** a button in the final scene shatters the screen and falls back to the top through every project in 3D, each in its own universe, slow for the big ones and fast for the small. Pip crashes on the way (dot matrix, crash text, erased, redrawn) and the site lands in Paper with the time-based colours.
- **Live 3D gravity scenes:** a real N-body simulation drawn as pastel ink orbits on paper. Each section has its own system, framed by a glossy glass window. The hero orbit changes on every visit.
- **One layout per project:** a window, a card, three points and two buttons (Open live, Code).
- **Coded app previews:** each project window holds a small animated HTML/CSS version of that app's interface, not a screenshot.
- **Self-updating resume:** run `./update-resume.sh` to preview a new PDF, confirm, and publish it. The site's resume buttons, preview and date update on their own.
- **Remembers you:** a returning visitor gets a "Welcome back" note with what is new (from `CHANGELOG` in `content.js`) and a button to carry on where they left off. Pip greets them and grows attached the more it is poked across visits (blush, a star, then a crown). Stored only in the visitor's own browser.
- **Project stories:** a "The story" button on each main project opens the problem, what was built, the decisions and why, what was hard, and the numbers. Text lives in `content.js`.
- **Ask Pip:** in the nav. Pip answers from the facts in `content.js` only, so it never makes anything up, and offers buttons (copy email, resume, stories).
- **Seasons, moon and occasions:** leaves, snow, petals or fireflies drift over the hero by season (hemisphere guessed from the time zone, no location asked). Full and new moons show in the label, and on Diwali, Holi, Eid, Christmas and others the greeting changes and Pip dresses up. Preview with `?season=winter&occasion=diwali&moon=full`.
- **Sticker wall:** at the very end, visitors leave stickers that stay for their next visit.
- **The 30-second version:** a link under the hero buttons for people in a hurry.
- **Universes & settings (`universes.html`, linked in the footer):** live previews of every universe, colour edition, season, occasion outfit and Pip level, plus switches for calm mode, glitches, sound, the auto-tour, Pip and seasonal effects, and pinning a favourite universe or colour. Saved in the visitor's browser (`tk-prefs`) and read by the main site on load.
- **The endless loop (`infinity.js`, `infinity.css`):** after the quick jump, reaching the very end again opens a dark, cinematic, never-ending fall through 22 universes (deep space, Year 3000, robots, rage, joy, rain, retro, the beat, paint, box, village, night city, sky, the deep, fire, ice, brick, toy racer, noir, the glitch, planet fall) with the Core (glowing particle network, golden light, glass panels of every universe passed) every seventh. Pip feels each one, pieces of the portfolio arrive as transmissions, subtitles tell a random action story, and quiet music is generated per universe. Scroll to fly faster, Esc or “Wake up” to return. Preview with `?loop`.
- **Pip:** keeps to the corners, side margins and floor; falls going down, jumps or flies going up; changes colour and get-up now and then.
- **31 page universes, each a whole website (`worlds.js`, `worldbg.js`, `design.css`):** the 5 light ones, the 22 from the endless loop as dark pages with their scene drawn softly behind, and four signature looks — **Liquid Glass**, **Monolith Gloss**, **Unslop** and **Unsloped**. Every universe after the first five is designed in `design.css` as a complete site: its own typefaces, card and button shapes, hero and project layout, section headers, type scale, spacing, motion and colours (cards and buttons are dark in dark universes; app previews stay light, as screens). Each is a short recipe of tokens at the end of `design.css`, written with the [unslop](https://github.com/heydamir/unslop) method by Damir Sokolovsky (CC BY 4.0): one character, one world, quiet chrome, one signature detail. The first open of a visit follows the visitor's local time: the day (from 5 am) is shared between the universes ticked in the Studio — by default the five light ones (Paper 5:00–9:48, Pixel to 14:36, Sketch to 19:24, Blueprint to 00:12, Newsprint to 5:00). Every refresh after that deals the next universe from a shuffled deck of all 31, kept for that tab only, so none repeats until every one has shown; closing the tab starts fresh. Preview any with `?world=fire` (works even for universes left out of the Studio shuffle).
- **Quick jump through all 27:** each project falls past in its own universe with its own short tune (`tunes.js`), the other universes flash between them, and Pip changes face and place in every one.
- **The dive (`dive.js`):** after the quick jump, scrolling down again turns each main project into its own universe, flying in from deep space in 3D, settling in front of you, then diving past.
- **Project tunes:** every project plays a short, quiet tune once when it scrolls into view (when sound is on).
- **Studio app (`admin/`):** the owner's app at `/admin/`, installable on a phone or laptop (Add to Home Screen / Install app). Google sign-in, only for thrishankkuntimaddi@gmail.com. Edit the resume (sections for summary, experience, projects, skills, education, achievements and any custom section, reorder, hide, Letter or A4) with a live one-page preview; edits autosave as a private draft and **Publish** makes them live, with every published version kept for roll-back. Also: Inbox, Feedback, Compliments and Help center (visitor messages, plus the help answers shown on the site) and About the system.
- **Live resume:** the site reads the published resume from Firebase with one small request, draws the same one-page layout and builds a real PDF (selectable text, working links, ATS-friendly) in the visitor's browser (`lib/resume.js`, Carlito font = Calibri metrics). If Firebase can't be reached it falls back to the PDF in `resume/`.
- **Send a message (`lib/contact.js`):** feedback, compliments, questions and messages from the footer, the contact section, Ask Pip and the Studio page land in the Studio inbox.
- **Free themes, prompts & settings (`universes.html`):** 31 theme kits (Liquid Glass, Monolith Gloss, Unslop, Unsloped and all 27 universes), each with `prompt.txt`, a `.css`, a `.csv` of tokens and a `.md` spec, single files or zips, plus a live demo (`kits/demo.html?kit=fire`). Then a help center and the site settings. Rebuild the kits with `node tools/build-kits.mjs` (hand-made kits live in `kits/_src/`: Liquid Glass, Monolith Gloss, Unslop, Unsloped). The 22 dark universe kits take their fonts, cards, buttons and title style from their recipe in `design.css`, so a kit looks like its universe.
- **Tailored links (`?for=acme-k3j9x2`, `lib/tailored.js`):** made in the Studio under *Tailored links*. The visitor sees “Hi Acme team” and the resume you picked for them; the Studio shows opens, people, time spent and resume downloads per link. Links live at `links/{code}`: anyone with the exact code can read one, nobody can list them. Local preview: `?for=demo-acme`.
- **Live project stats (`lib/gh-stats.js`):** each main project card shows GitHub stars, last commit, main language and a “Live now” dot when its live link answers. Free public GitHub API, cached 6 hours in the visitor's browser; a site that doesn't answer just loses the dot.
- **Kind words wall (`lib/kind-wall.js`):** in the Studio inbox, *Show on website* on a compliment or feedback puts it (name you choose + text, never the email) on sticky notes above Contact (`site/kind`). Local preview: `?kind=demo`.
- **Quick read (`read.html`, also `?plain`):** a calm, fast page with the resume first as real text (screen-reader friendly), then projects, kind words and contact. No animation, no web fonts. Offered under the hero and up front on data saver or 2G.
- **Notes (`notes.html`):** short posts written in the Studio (*Content → Notes*, simple Markdown), each shown in its own universe. Stored at `site/notes`; the home page gets a small index for its “Notes” link. Local preview: `notes.html?demo`.
- Works on phones, respects reduced motion (no tour, no animation), and still shows all content without WebGL.

- **Standard universe (`standard.css`, `standard.js`):** every visit opens here. A calm, premium monograph look: warm bone paper by day, graphite by night (6 pm – 6 am local time; preview with `?world=standard&tone=dark`), Instrument Serif set large, DM Mono captions, hairline rules and one vermilion "TK" seal. No 3D scene, doodles, auto-tour or mid-page glitches; Pip is a small ink orb that answers questions. Every refresh after the first open, **Shift universe ↯** in the footer, and reaching the very end of the page glitch into another universe. Everything about it is set in the Studio (*Website → Standard design*, stored under `standard` in `site/config`, applied by `standard.js`): open on Standard or not, stay on refresh, tone (auto/light/dark), accent colour, heading font, both headline lines (`*word*` = accent italic), the menu-bar status, city, clock and time zone, each section on or off, the Shift button and where it goes, and the end-of-page glitch.
- **Publishing website settings:** *Preview ↗* opens the live site with the unpublished settings in the address (`#preview=…`, never sent to a server, not tracked); *Save draft* keeps them private (`private/siteDraft`); *Publish* makes them live (open pages update within ~20 s) and keeps a copy in `siteVersions` for one-tap *Restore*.
- **Contrast guard (`lib/contrast.js`):** after every universe change it measures each piece of text against the colour behind it and switches anything too faint to near-black or near-white, so all 32 universes stay readable.

## Stack

Plain HTML, CSS and JavaScript (ES modules) with no build step. Three.js 0.160 is loaded from jsDelivr through an import map. Physics is a hand-written leapfrog integrator.

```
index.html   page and content
style.css    edition tokens, cards, glass windows, stickers, auto-tour pill
main.js      editions, auto-tour, reveals + the WebGL engine
universes.js the Universes & settings page
worlds.js    the 31 universes (names, wording); tokens at the end of style.css
design.css   the design engine: each universe after the first five as a whole website
worldbg.js   the scene behind the page in the 22 loop universes
tunes.js     each project's universe and signature tune
dive.js      the 3D project dive after the quick jump
infinity.js  the endless loop (loaded only when reached)
chapter.js   memory, stories, Ask Pip, seasons, sticker wall, 30-second version
read.html    quick-read page (read.js, read.css)
notes.html   notes (notes.js)
content.js   the words for chapter.js (easy to edit)
assets/      me.jpg, og.jpg (social preview), favicon.svg
resume/      published resume, preview image and date (written by update-resume.sh)
update-resume.sh   preview, confirm and publish a new resume (fallback PDF)
admin/       the Studio app (resume editor, inbox, help center, about)
lib/         firebase.js, resume.js (layout + PDF), resume-seed.js, contact.js, kits-page.js
kits/        the theme kits + kits.json + demo.html (built by tools/build-kits.mjs)
firestore.rules    who can read/write what (deploy: firebase deploy --only firestore:rules)
```

## Run locally

```
python3 -m http.server 8080
# open http://localhost:8080  (add ?edition=dusk to preview another edition)
```

## Editing the new chapter

All words for the stories, Ask Pip, the "what's new" note and the occasions are in `content.js`. When you ship something new, add an entry at the top of `CHANGELOG` with `v` one higher, and returning visitors will see it.

## Shared counts and analytics (optional, free)

1. Sign up at goatcounter.com (free for personal sites) and pick a code, for example `thrishank`.
2. In GoatCounter's settings, turn on "Allow adding visitor counts on your website".
3. Put the code in `GOATCOUNTER` at the top of `content.js` and publish.

The sticker wall then shows how many visitors poked Pip, reached the end and left a sticker, and the GoatCounter dashboard shows your visits. Only anonymous event names are sent (no cookies). With the code empty, nothing is sent anywhere.

## The Studio app (owner only)

Everything on the website is editable from the Studio (`/admin/` in a browser, or the Android app):
- **Resume:** a library of resumes (name, note, created/edited dates); one is marked *On website*.
- **Content:** main projects, more work and the Poelys orbit (add, edit, hide, reorder, remove; keypad codes are worked out from a word), every text block on the home page (`data-k` keys, see `tools/tag-text.py`), project stories, Ask Pip's answers and *What's new*. Saved to `site/content`, applied by `lib/content-live.js`.
- **Website:** banner, fixed or shuffled universes (All · Light only · Dark only · Signature looks), colours, animations, Pip (line, outfit) and scheduled automations. Saved to `site/config`, applied by `lib/site-config.js` — and **live**: pages visitors already have open check it every 20 seconds while visible (`lib/live.js`) and switch universe, colours and banner without a refresh (a visitor's own pinned choice still wins).
- **Reports:** anonymous visits (approximate city/region/network via get.geojs.io, IP never stored; device, screen, page, referrer, time spent, scroll depth) and resume/kit downloads, from `lib/live.js`. Overview, Visits (tap for details) and People tabs.
- **Resume PDF upload:** a ready-made PDF can be put on the website instead of the built one (`lib/resume-pdf.js`; stored in Firestore in ≤380 KB base64 parts, no Storage).
- **Sign out everywhere:** `private/security.revokedBefore`, checked by `firestore.rules`.
- **Inbox, Feedback, Compliments, Help center, About.**

Protection: only thrishankkuntimaddi@gmail.com signed in with Google (checked in the app and in `firestore.rules`); edits need a sign-in from the last 30 days; fingerprint/face/screen-lock on open and after 5 minutes away; in the Android app, screenshots and backups are blocked.

**Android app** (`app/`, Capacitor): the workflow `.github/workflows/studio-app.yml` builds a signed APK and publishes it on GitHub Releases when a `studio-v*` tag is pushed (raise `version` in `app/package.json` first). The signing key lives outside the repo (`~/Documents/Project Docs/MyPortfolio/`) and in two repository secrets.

## Firebase (free Spark plan)

Project `myprofile-f29f5`. Firestore holds `site/resume` and `site/help` (public read, owner write), `private/resumeDraft` and `versions` (owner only) and `messages` (anyone can create a well-formed one; only the owner can read). Rules are in `firestore.rules`. To sign in to the Studio on the live site, `thrishankkuntimaddi.github.io` must be in Authentication → Settings → Authorized domains. Locally, `http://localhost:8080/admin/?demo` previews the app without signing in (nothing is saved).

## Updating the resume

Edit it in the Studio app (`/admin/`) and press Publish. The script below still updates the fallback PDF:

```
./update-resume.sh                      # uses ~/Documents/Thrishank Kuntimaddi Resume.pdf
./update-resume.sh path/to/other.pdf    # or any other PDF
```

A Quick Look preview opens first. Nothing is published unless you answer `y`.
