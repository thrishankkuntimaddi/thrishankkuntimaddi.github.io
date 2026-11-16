# Thrishank Kuntimaddi — Portfolio

A light, paper-and-retro portfolio that runs itself.

- **Auto-tour:** the page scrolls on its own. Any scroll, tap or key press hands control to the visitor at once, and the tour resumes after five idle seconds.
- **Automatic editions:** four light colour palettes (Morning, Noon, Dusk, Night) chosen from the visitor's local time. There are no theme controls.
- **Live 3D gravity scenes:** a real N-body simulation drawn as pastel ink orbits on paper. Each section has its own system, framed by a glossy glass window. The hero orbit changes on every visit.
- **One layout per project:** a window, a card, three points and two buttons (Open live, Code).
- Works on phones, respects reduced motion (no tour, no animation), and still shows all content without WebGL.

## Stack

Plain HTML, CSS and JavaScript (ES modules) with no build step. Three.js 0.160 is loaded from jsDelivr through an import map. Physics is a hand-written leapfrog integrator.

```
index.html   page and content
style.css    edition tokens, cards, glass windows, stickers, auto-tour pill
main.js      editions, auto-tour, reveals + the WebGL engine
assets/      me.jpg, og.jpg (social preview), favicon.svg
```

## Run locally

```
python3 -m http.server 8080
# open http://localhost:8080  (add ?edition=dusk to preview another edition)
```
