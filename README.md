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
- Works on phones, respects reduced motion (no tour, no animation), and still shows all content without WebGL.

## Stack

Plain HTML, CSS and JavaScript (ES modules) with no build step. Three.js 0.160 is loaded from jsDelivr through an import map. Physics is a hand-written leapfrog integrator.

```
index.html   page and content
style.css    edition tokens, cards, glass windows, stickers, auto-tour pill
main.js      editions, auto-tour, reveals + the WebGL engine
universes.js the Universes & settings page
infinity.js  the endless loop (loaded only when reached)
chapter.js   memory, stories, Ask Pip, seasons, sticker wall, 30-second version
content.js   the words for chapter.js (easy to edit)
assets/      me.jpg, og.jpg (social preview), favicon.svg
resume/      published resume, preview image and date (written by update-resume.sh)
update-resume.sh   preview, confirm and publish a new resume
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

## Updating the resume

```
./update-resume.sh                      # uses ~/Documents/Thrishank Kuntimaddi Resume.pdf
./update-resume.sh path/to/other.pdf    # or any other PDF
```

A Quick Look preview opens first. Nothing is published unless you answer `y`.
