/* The projects as they are hand-written in index.html (made by tools/extract-projects.py).
   The Studio app starts from this; the website uses site/content once published. */
export const PROJECTS_SEED = {
 "main": [
  {
   "id": "oruinwan",
   "name": "Oruinwan",
   "hidden": false,
   "preview": "Oruinwan",
   "scene": "lagrange",
   "label": "ORUINWAN.SYS",
   "tagline": "Three people.\nOne conversation.",
   "what": "A team workspace: chat, calls, tasks, notes and AI in one app instead of five.",
   "points": [
    "One interface that adapts from phone to tablet split view to desktop.",
    "Context stays linked: a message becomes a task that points back to it.",
    "My biggest build so far, at 1,091 commits with end-to-end tests."
   ],
   "chips": [
    "React 19",
    "Tailwind",
    "Socket.IO",
    "Yjs",
    "Capacitor"
   ],
   "live": "https://oruinwan.poelys.com",
   "repo": "https://github.com/thrishankkuntimaddi/Oruinwan",
   "story": "oruinwan"
  },
  {
   "id": "expensetracker",
   "name": "Expense Tracker",
   "hidden": false,
   "preview": "Expense Tracker",
   "scene": "binary",
   "label": "EXPENSE.SYS",
   "tagline": "Money in, money out.\nKept in balance.",
   "what": "A calm personal finance app for expenses, bills, budgets and trip splits.",
   "points": [
    "Type “chai 20 vada 15” and it logs two categorised expenses.",
    "One clear “safe to spend today” number instead of confusing charts.",
    "The same soft glass design on web, Android and desktop."
   ],
   "chips": [
    "React",
    "PWA",
    "Capacitor",
    "Tauri",
    "Firebase"
   ],
   "live": "https://expensetracker-in.web.app/",
   "repo": "https://github.com/thrishankkuntimaddi/ExpenseTracker",
   "story": "expense"
  },
  {
   "id": "sentinelflight",
   "name": "SentinelFlight",
   "hidden": false,
   "preview": "SentinelFlight",
   "scene": "debris",
   "label": "SENTINEL.SYS",
   "tagline": "Navigate around\nthe hazards.",
   "what": "A 3D space game where you launch real rockets past real orbital debris.",
   "points": [
    "Complex orbit data turned into a clear game interface with four cameras.",
    "A Three.js scene that stays smooth because the maths runs in Web Workers.",
    "An AI copilot I trained that was 100% safe on 200 unseen tests."
   ],
   "chips": [
    "Three.js",
    "WebGL",
    "Web Workers",
    "Python",
    "PyTorch"
   ],
   "live": "https://sentinelflight.poelys.com/",
   "repo": "https://github.com/thrishankkuntimaddi/Enhanced-Space-Debris-Avoidance-and-Trajectory-Optimization-System",
   "story": "sentinel"
  },
  {
   "id": "learnvianotes",
   "name": "LearnViaNotes",
   "hidden": false,
   "preview": "LearnViaNotes",
   "scene": "solar",
   "label": "LEARN.SYS",
   "tagline": "One concept\nat a time.",
   "what": "Interview prep notes: 22 subjects and 150 coding problems in four languages.",
   "points": [
    "No sign-up wall. Open it and start learning.",
    "Rebuilt phone-first with tinted categories and sticky filters.",
    "Read-aloud, a focus timer and spaced repetition, and it works offline."
   ],
   "chips": [
    "React",
    "TypeScript",
    "PWA",
    "Firebase"
   ],
   "live": "https://www.learnvianotes.in/",
   "repo": "https://github.com/thrishankkuntimaddi/c-note",
   "story": "learn"
  }
 ],
 "more": [
  {
   "id": "yormenu",
   "name": "YorMenu",
   "hidden": false,
   "link": "https://yormenu.poelys.com/",
   "status": "Live",
   "live": true,
   "word": "MENU",
   "what": "A restaurant platform with a separate screen for waiters, kitchen, billing and guests.",
   "stack": "React · TypeScript · Firebase"
  },
  {
   "id": "msminutes",
   "name": "Ms. Minutes",
   "hidden": false,
   "link": "https://github.com/thrishankkuntimaddi/MsMinutes",
   "status": "In progress",
   "live": false,
   "word": "TIME",
   "what": "An AI desk companion with an animated face, spring physics and lip-sync.",
   "stack": "TypeScript · Claude API · ESP32"
  },
  {
   "id": "meditation",
   "name": "Meditation",
   "hidden": false,
   "link": "https://thrishankkuntimaddi.github.io/Meditation/",
   "status": "Live",
   "live": true,
   "word": "CALM",
   "what": "A quiet breathing app that silences your other devices while you practise.",
   "stack": "React · Tailwind · Capacitor · Tauri"
  },
  {
   "id": "clearmymind",
   "name": "ClearMyMind",
   "hidden": false,
   "link": "https://thrishankkuntimaddi.github.io/clearmyMind",
   "status": "Live",
   "live": true,
   "word": "CLEAR",
   "what": "One smart bar to dump your thoughts, sort them, then clear them all away.",
   "stack": "React 19 · Vite · Firebase"
  },
  {
   "id": "myrovers",
   "name": "My Rovers",
   "hidden": false,
   "link": "https://github.com/thrishankkuntimaddi/my-rovers",
   "status": "Hardware",
   "live": false,
   "word": "ROVER",
   "what": "Home-built robot rovers, driven from a tablet cockpit app I designed.",
   "stack": "Android · ESP32 · Arduino"
  },
  {
   "id": "interstellar",
   "name": "Interstellar",
   "hidden": false,
   "link": "https://thrishankkuntimaddi.github.io/interstellar/",
   "status": "Live",
   "live": true,
   "word": "FAR",
   "what": "A 15-minute real-time 3D space journey with a flyable ship and a talking copilot.",
   "stack": "Three.js · GLSL shaders · Web Speech"
  }
 ],
 "orbit": [
  {
   "id": "oruinwan",
   "name": "Oruinwan",
   "link": "https://oruinwan.poelys.com",
   "word": "TEAMS",
   "hidden": false
  },
  {
   "id": "expensetracker",
   "name": "Expense Tracker",
   "link": "https://expensetracker-in.web.app/",
   "word": "CASH",
   "hidden": false
  },
  {
   "id": "sentinelflight",
   "name": "SentinelFlight",
   "link": "https://sentinelflight.poelys.com/",
   "word": "FLY",
   "hidden": false
  },
  {
   "id": "learnvianotes",
   "name": "LearnViaNotes",
   "link": "https://www.learnvianotes.in/",
   "word": "NOTES",
   "hidden": false
  },
  {
   "id": "yormenu",
   "name": "YorMenu",
   "link": "https://yormenu.poelys.com/",
   "word": "MENU",
   "hidden": false
  },
  {
   "id": "parla",
   "name": "Parla",
   "link": "https://app.parla.poelys.com/welcome",
   "word": "SAY",
   "hidden": false
  },
  {
   "id": "interstellar",
   "name": "Interstellar",
   "link": "https://thrishankkuntimaddi.github.io/interstellar/",
   "word": "FAR",
   "hidden": false
  }
 ]
};
