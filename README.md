# Thrishank Kuntimaddi — Portfolio

A portfolio that is also a live **3D three-body gravity simulation**.

- **Hero:** the stable figure-8 three-body orbit, with a live energy readout. Press *Disturb* and it turns chaotic until a star escapes.
- **Scroll-driven universe:** every section switches the simulation (Lagrange triangle, binary pair, debris field, planetary system, chaos, the Pythagorean problem), and the camera flies to frame each project's portal.
- **Sandbox:** full-screen mode. Drag to rotate, pinch or scroll to zoom, tap to drop stars. Snapshots save or share a signed PNG, and share links reproduce the same universe.
- **Universe lab** (press `U`): 6 universes (Nebula, Solar, Ice, Eclipse, Terminal, Paper), star colours with a custom picker, and gravity, time, trail and glow sliders.
- Works on phones, respects reduced motion (Calm mode), and falls back to a static page without WebGL.

## Stack

Plain HTML, CSS and JavaScript (ES modules) with no build step. Three.js 0.160 (WebGL + UnrealBloom) is loaded from jsDelivr through an import map. Physics is a hand-written leapfrog N-body integrator with softening.

```
index.html   page, content, import map
style.css    universe tokens, glass UI, 3D tilt and reveals, sandbox and lab UI
main.js      UI layer + the WebGL engine (physics, camera, scenes, sharing)
assets/      me.jpg, og.jpg (social preview), favicon.svg
```

## Run locally

ES modules need a server (not `file://`):

```
python3 -m http.server 8080
# open http://localhost:8080
```

Share links: `#u=paper` opens a universe, and `#play=chaos&seed=123&u=ice` opens the sandbox on a specific system.
