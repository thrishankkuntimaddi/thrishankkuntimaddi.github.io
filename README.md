# Thrishank Kuntimaddi — Portfolio

A light, pencil-sketch portfolio with retro space styling that runs itself.

- **Auto-tour:** the page scrolls on its own. Any scroll, tap or key press hands control to the visitor at once, and the tour resumes after five idle seconds.
- **Automatic editions:** four light colour palettes (Coral, Sky, Lilac, Mint). The first open matches the visitor's local time; every refresh steps to the next one. There are no theme controls.
- **Glitches:** on every refresh, when the tour passes "More work" (the page keeps scrolling), and at the end. The picture tears, colours split, horizontal strips of the next edition cut in, and the colours change without a reload. `assets/glitch.mp3` plays if the visitor has touched the page.
- **Pip:** a small guide character with hands that walks, waves and flickers so people poke it (any touch enables sound). Holding it peeks at the previous colour edition. It glitches when a game mistake is made.
- **Keypad codes and Morse:** each globe's number is its word typed on a phone keypad and decodes itself; each project card blinks its name in Morse and has its own paper style.
- **Final scene:** the last glitch reveals a readable, tabbed resume next to a rounds game: true and false words about me fall, and catching the true ones scores. It plays itself until the visitor steers, and fits one screen on desktop.
- **Live 3D gravity scenes:** a real N-body simulation drawn as pastel ink orbits on paper. Each section has its own system, framed by a glossy glass window. The hero orbit changes on every visit.
- **One layout per project:** a window, a card, three points and two buttons (Open live, Code).
- **Coded app previews:** each project window holds a small animated HTML/CSS version of that app's interface, not a screenshot.
- **Self-updating resume:** run `./update-resume.sh` to preview a new PDF, confirm, and publish it. The site's resume buttons, preview and date update on their own.
- Works on phones, respects reduced motion (no tour, no animation), and still shows all content without WebGL.

## Stack

Plain HTML, CSS and JavaScript (ES modules) with no build step. Three.js 0.160 is loaded from jsDelivr through an import map. Physics is a hand-written leapfrog integrator.

```
index.html   page and content
style.css    edition tokens, cards, glass windows, stickers, auto-tour pill
main.js      editions, auto-tour, reveals + the WebGL engine
assets/      me.jpg, og.jpg (social preview), favicon.svg
resume/      published resume, preview image and date (written by update-resume.sh)
update-resume.sh   preview, confirm and publish a new resume
```

## Run locally

```
python3 -m http.server 8080
# open http://localhost:8080  (add ?edition=dusk to preview another edition)
```

## Updating the resume

```
./update-resume.sh                      # uses ~/Documents/Thrishank Kuntimaddi Resume.pdf
./update-resume.sh path/to/other.pdf    # or any other PDF
```

A Quick Look preview opens first. Nothing is published unless you answer `y`.
