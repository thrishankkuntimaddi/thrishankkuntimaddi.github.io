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
