/* =========================================================
   All 31 universes. The first five restyle the light page
   (style.css); the 22 from the endless loop turn the page dark
   with their scene drawn behind it (worldbg.js); the last four
   are the signature looks. The 26 after the first five are each
   designed as a whole website in design.css.
   Generated from one table, with the matching tokens in
   style.css ("The 22 loop universes as page themes").
   ========================================================= */
export const BASE = ['paper', 'pixel', 'sketch', 'blueprint', 'news'];
export const LOOP = ["core", "space", "future", "robots", "rage", "joy", "sad", "retro", "music", "paint", "box", "village", "city", "sky", "water", "fire", "ice", "brick", "racer", "noir", "glitch", "mars"];
// The four signature looks, also whole-site universes (design.css). Liquid Glass, Unslop and
// Unsloped are light pages; Monolith Gloss is dark.
export const KITS = ['liquid', 'monolith', 'unslop', 'unsloped'];
// The standard universe: the calm, premium design every visit opens on (standard.css). Light by day,
// dark by night (6 pm – 6 am, the visitor's local time). Every refresh after the first open moves on to
// another universe with a glitch.
export const STANDARD = 'standard';
export const stdNight = (d = new Date()) => { const q = /[?&]tone=(light|dark)/.exec(typeof location !== 'undefined' ? location.search : ''); if (q) return q[1] === 'dark'; const h = d.getHours(); return h >= 18 || h < 6; };
export const ALL = [STANDARD].concat(BASE, LOOP, KITS);
// Universes the design engine (design.css) styles as a whole website: all but the first five.
export const DESIGNED = [STANDARD].concat(LOOP, KITS);
export const NAMES = { standard: 'Standard', paper: 'Paper', pixel: 'Pixel', sketch: 'Sketch', blueprint: 'Blueprint', news: 'Newsprint', core: "The Core", space: "Deep space", future: "Year 3000", robots: "Robot republic", rage: "Rage", joy: "Pure joy", sad: "The rain", retro: "Retro 1986", music: "The beat", paint: "Paint", box: "Box world", village: "The village", city: "Night city", sky: "Open sky", water: "The deep", fire: "Fire", ice: "Ice", brick: "Brick world", racer: "Toy racer", noir: "Noir", glitch: "The glitch", mars: "Planet fall", liquid: "Liquid Glass", monolith: "Monolith Gloss", unslop: "Unslop", unsloped: "Unsloped" };
export const COPY = {
  standard:  { h2: 'I design and build <em>interfaces</em>', h3: 'that feel considered, end to end.', cta: 'Selected work', work: 'Selected work', poelys: 'Poelys, my studio', more: 'Also built', about: 'About', contact: 'Have something worth building? <em>Let’s talk.</em>' },
  paper:     { h2: 'I design and build <em>interfaces</em>', h3: 'people enjoy using.', cta: 'See my projects', work: 'Projects', poelys: 'Poelys', more: 'More work', about: 'About me', contact: "Let's build something <em>people love</em>." },
  pixel:     { h2: 'I build <em>interfaces</em>', h3: 'worth pressing START for.', cta: 'Start', work: 'Level 01: Projects', poelys: 'Home base: Poelys', more: 'Side quests', about: 'Player stats', contact: 'Insert coin. <em>Hire player 1.</em>' },
  sketch:    { h2: 'I sketch <em>interfaces</em>,', h3: 'then build every line.', cta: 'Flip to my projects', work: 'The good pages', poelys: 'My studio, Poelys', more: 'Scribbles and side work', about: 'About the artist', contact: "Let's draw up something <em>people love</em>." },
  blueprint: { h2: 'I engineer <em>interfaces</em>', h3: 'to spec, then make them human.', cta: 'Open the drawings', work: 'Fig. 01: Projects', poelys: 'Fig. 02: Poelys', more: 'Fig. 03: Further work', about: 'Spec sheet: me', contact: 'Request a build. <em>Tolerances: tight.</em>' },
  news:      { h2: 'Developer builds <em>interfaces</em>', h3: 'people actually enjoy using.', cta: 'Read the full story', work: 'Front page: Projects', poelys: 'Business: Poelys', more: 'In other news', about: 'Profile', contact: 'Wanted: a team that <em>ships</em>.' },
  core: {"h2": "I build the <em>inside</em>", "h3": "of interfaces people love.", "cta": "Enter the core", "work": "Core memory: Projects", "poelys": "The studio at the centre", "more": "Fragments", "about": "Source: me", "contact": "Connect to the <em>core</em>."},
  space: {"h2": "I launch <em>interfaces</em>", "h3": "into orbit.", "cta": "Begin the launch", "work": "Mission log: Projects", "poelys": "Mothership: Poelys", "more": "Satellites", "about": "Commander profile", "contact": "Open a channel. <em>We have liftoff.</em>"},
  future: {"h2": "Interfaces from <em>the year 3000</em>,", "h3": "shipped today.", "cta": "Fast-forward", "work": "Archive 3000: Projects", "poelys": "Megacorp: Poelys", "more": "Prototypes", "about": "Pilot ID", "contact": "Ping me <em>from the future</em>."},
  robots: {"h2": "Human-made <em>interfaces</em>,", "h3": "robot-approved.", "cta": "Run program", "work": "Directory /projects", "poelys": "Mainframe: Poelys", "more": "Subroutines", "about": "whoami", "contact": "Send signal. <em>Await reply.</em>"},
  rage: {"h2": "I build <em>interfaces</em>", "h3": "with ferocious care.", "cta": "Unleash the projects", "work": "THE PROJECTS!!", "poelys": "Poelys. Fired up.", "more": "More. MORE.", "about": "Who dares", "contact": "Hire me. <em>Before it boils over.</em>"},
  joy: {"h2": "I make <em>interfaces</em>", "h3": "that make people smile.", "cta": "Yay, projects!", "work": "Happy things I built", "poelys": "Poelys, the fun factory", "more": "Little joys", "about": "Hi, it’s me!", "contact": "Let’s make something <em>delightful</em>."},
  sad: {"h2": "I build <em>interfaces</em>", "h3": "that hold you on rainy days.", "cta": "Walk through the projects", "work": "Quiet work", "poelys": "Shelter: Poelys", "more": "Small lights", "about": "About me, softly", "contact": "Write to me. <em>I’ll write back.</em>"},
  retro: {"h2": "Radical <em>interfaces</em>,", "h3": "totally tubular since ’86.", "cta": "Press play", "work": "Side A: Projects", "poelys": "Arcade HQ: Poelys", "more": "Side B", "about": "Player 1", "contact": "Call me. <em>Leave a message after the beep.</em>"},
  music: {"h2": "I compose <em>interfaces</em>", "h3": "that move in rhythm.", "cta": "Drop the beat", "work": "Tracklist", "poelys": "Record label: Poelys", "more": "B-sides", "about": "Liner notes", "contact": "Let’s jam. <em>Bring the bass.</em>"},
  paint: {"h2": "I paint <em>interfaces</em>", "h3": "one bold stroke at a time.", "cta": "See the gallery", "work": "The gallery", "poelys": "Studio: Poelys", "more": "Sketches & splatters", "about": "The painter", "contact": "Commission a <em>masterpiece</em>."},
  box: {"h2": "I build <em>interfaces</em>", "h3": "block by perfect block.", "cta": "Open the boxes", "work": "Box 01: Projects", "poelys": "Big box: Poelys", "more": "Small boxes", "about": "Unboxed: me", "contact": "Think inside <em>my box</em>."},
  village: {"h2": "I craft <em>interfaces</em>", "h3": "like a village craftsman.", "cta": "Visit the workshop", "work": "The workshop", "poelys": "Market square: Poelys", "more": "Odds and ends", "about": "The craftsman", "contact": "Drop by <em>for tea</em>."},
  city: {"h2": "I build <em>interfaces</em>", "h3": "for a city that never sleeps.", "cta": "Hit the streets", "work": "Downtown: Projects", "poelys": "HQ: Poelys", "more": "Side streets", "about": "The local", "contact": "Meet me <em>downtown</em>."},
  sky: {"h2": "I design <em>interfaces</em>", "h3": "light enough to float.", "cta": "Take off", "work": "Flight path: Projects", "poelys": "Cloud base: Poelys", "more": "Drifting ideas", "about": "The pilot", "contact": "Let’s fly <em>somewhere new</em>."},
  water: {"h2": "I dive deep into <em>interfaces</em>", "h3": "and surface with calm.", "cta": "Dive in", "work": "Treasures: Projects", "poelys": "Harbour: Poelys", "more": "Shells", "about": "The diver", "contact": "Send a message <em>in a bottle</em>."},
  fire: {"h2": "I forge <em>interfaces</em>", "h3": "in fire, tempered for years.", "cta": "Enter the forge", "work": "Forged: Projects", "poelys": "The forge: Poelys", "more": "Sparks", "about": "The smith", "contact": "Strike while <em>the iron’s hot</em>."},
  ice: {"h2": "Crystal-clear <em>interfaces</em>,", "h3": "polished like ice.", "cta": "Skate in", "work": "Frozen in time: Projects", "poelys": "Ice palace: Poelys", "more": "Snowflakes", "about": "Northern me", "contact": "Break the ice. <em>Say hi.</em>"},
  brick: {"h2": "I build <em>interfaces</em>", "h3": "brick by brick.", "cta": "Open the set", "work": "Set 01: Projects", "poelys": "Big set: Poelys", "more": "Spare bricks", "about": "Minifigure: me", "contact": "Let’s build <em>something huge</em>."},
  racer: {"h2": "I build <em>interfaces</em>", "h3": "at full speed.", "cta": "Start your engines", "work": "Pole position: Projects", "poelys": "Pit crew: Poelys", "more": "Hot laps", "about": "The driver", "contact": "Race you <em>to the finish</em>."},
  noir: {"h2": "Every <em>interface</em> has a story.", "h3": "Mine end well.", "cta": "Open the case files", "work": "Case files", "poelys": "The agency: Poelys", "more": "Loose ends", "about": "The detective", "contact": "Got a case? <em>Knock twice.</em>"},
  glitch: {"h2": "I build <em>interf@ces</em>", "h3": "that never cr̷ash.", "cta": "Run anyway", "work": "ERR_PROJECTS_FOUND", "poelys": "P0ELYS.EXE", "more": "Corrupted files", "about": "user://me", "contact": "Reboot. <em>Then hire me.</em>"},
  mars: {"h2": "Interfaces built for <em>new worlds</em>", "h3": "and the first footprints.", "cta": "Land the rover", "work": "Samples: Projects", "poelys": "Base camp: Poelys", "more": "Rocks of interest", "about": "The astronaut", "contact": "Earth, do you copy? <em>Message me.</em>"},
  liquid:    { h2: 'I build <em>interfaces</em>', h3: 'clear enough to see straight through.', cta: 'Look through', work: 'Projects', poelys: 'Poelys', more: 'More work', about: 'About me', contact: "Let's make something <em>clear</em>." },
  monolith:  { h2: 'I build <em>interfaces</em>', h3: 'solid underneath, polished on top.', cta: 'See the work', work: 'Work', poelys: 'Poelys, the studio', more: 'Other work', about: 'About', contact: 'Have a product to build? <em>Let’s talk.</em>' },
  unslop:    { h2: 'I design and build <em>interfaces</em>', h3: 'for people who use them every day.', cta: 'See my projects', work: 'Projects', poelys: 'Poelys, my studio', more: 'More work', about: 'About me', contact: 'Building something people use daily? <em>Write to me.</em>' },
  unsloped:  { h2: 'I keep a careful <em>ledger</em>', h3: 'of every interface I ship.', cta: 'Open the book', work: 'Projects, page one', poelys: 'Poelys, the studio', more: 'More entries', about: 'About the keeper', contact: 'Open a new page <em>with me</em>.' },
};
export const isLoopWorld = (id) => LOOP.includes(id);
/** A dark page: the 22 loop universes and Monolith Gloss. */
export const isDarkWorld = (id) => LOOP.includes(id) || id === 'monolith' || (id === STANDARD && stdNight());
export const isDesigned = (id) => DESIGNED.includes(id);
