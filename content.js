/* =========================================================
   Words for the site's new chapter, kept apart from the code
   so they are easy to edit:
   - CHANGELOG: what a returning visitor is told is new
   - STORIES:   the story behind each main project
   - ASK:       what Pip knows when someone asks a question
   - GOATCOUNTER: your free GoatCounter code (see README)
   Pip only ever answers from ASK, so it cannot make things up.
   ========================================================= */

// Your GoatCounter code, e.g. 'thrishank' for thrishank.goatcounter.com.
// Leave it empty and the shared counters stay hidden and nothing is sent anywhere.
export const GOATCOUNTER = 'thrishank';

export const EMAIL = 'thrishankkuntimaddi@gmail.com';

// Newest first. `v` must go up by one with every entry.
export const CHANGELOG = [
  { v: 5, date: '2026-11-17', items: ['27 universes now: every refresh deals a new one, no repeats until you have seen them all', 'The quick jump falls through all 27, with every project’s own tune', 'After the quick jump, scroll again to dive into each project in 3D'] },
  { v: 4, date: '2026-11-17', items: ['Pip falls, jumps, flies, changes colour and dresses up', 'Something new lives below the bottom of the page…'] },
  { v: 3, date: '2026-11-17', items: ['Universes & settings: see every look, and switch off glitches, motion or sound', 'Tap Pip to ask a question'] },
  { v: 2, date: '2026-11-18', items: ['The story behind each project', 'Ask Pip anything', 'A wall for your stickers', 'The site now follows the seasons and the moon'] },
  { v: 1, date: '2026-11-17', items: ['Five universes, glitches, the quick jump and Pip'] },
];

/* ---------------------------------------------------------
   Project stories. Drafted from each project's README.
   Sections: problem, built, decisions [{d, why}], hard [{d, fix}], numbers [[n, label]].
   --------------------------------------------------------- */
export const STORIES = {
  oruinwan: {
    name: 'Oruinwan', code: '83267', word: 'TEAMS', live: 'https://oruinwan.poelys.com', repo: 'https://github.com/thrishankkuntimaddi/Oruinwan',
    pip: 'This is the big one. Grab a chai.',
    line: 'One workspace for a team: chat, calls, tasks, notes and AI.',
    problem: 'Most teams talk in one app, meet in another, track work in a third and ask AI in a fourth. The context gets lost in between, and nobody knows which app the answer is in.',
    built: 'A workspace where every conversation lives together: channels, DMs, threads, huddles and meetings, tasks, notes, files and AI agents. It runs in the browser, on macOS, Windows and Linux, and on Android phones and tablets, with split and wide layouts on bigger screens. It is open source and can be self-hosted with Docker.',
    decisions: [
      { d: 'Everything links back to where it started.', why: 'A message becomes a task that points back to the message, and a call ends with a recap from its own transcript. The context travels with the work.' },
      { d: 'Messages are encrypted on the device.', why: 'Each conversation has its own key, wrapped for every member, so the server only ever stores ciphertext. Trust is a feature people cannot see but always feel.' },
      { d: 'Sprints, milestones and roadmaps are off by default.', why: 'They exist, but most teams do not need them on day one. Keeping them switched off keeps the product calm and focused.' },
      { d: 'Admins never see message content or per-person activity.', why: 'A workspace tool should help a team, not watch it.' },
      { d: 'Every plan has every feature.', why: 'Plans differ in room and support, never in what you are allowed to use.' },
    ],
    hard: [
      { d: 'Real-time messages at scale', fix: 'Load-tested with 10K+ simulated sessions; p95 latency went from 850 ms to 45 ms.' },
      { d: 'One interface from phone to desktop', fix: 'A single React 19 interface that adapts from a phone to a tablet split view to a desktop window.' },
    ],
    numbers: [['1,091', 'commits'], ['45 ms', 'p95 message latency'], ['58', 'modules in the monorepo'], ['6', 'platforms']],
  },
  expense: {
    name: 'Expense Tracker', code: '2274', word: 'CASH', live: 'https://expensetracker-in.web.app/', repo: 'https://github.com/thrishankkuntimaddi/ExpenseTracker',
    pip: 'Money, but calm. My favourite kind.',
    line: 'A calm personal finance app on web, Android and desktop.',
    problem: 'Money slips away in small amounts: a chai here, a split dinner there, money lent to a friend, money spent abroad. Spreadsheets are too slow and most trackers drown you in charts.',
    built: 'One account for expenses, income, bills, budgets, savings goals, debts with people, trip splits and a monthly report, in any currency. It ships as an installable web app, an Android app (Capacitor) and a desktop app for Mac, Windows and Linux (Tauri), all from one React codebase, with live sync and offline use.',
    decisions: [
      { d: 'Type it the way you would say it.', why: '“chai 20 vada 15” becomes two categorised expenses. An India-aware keyword engine knows “Swiggy” is food and “petrol” is fuel, and it learns from one correction. Logging has to take seconds or people stop doing it.' },
      { d: 'One number instead of a dashboard.', why: 'A “safe to spend today” figure and a projected month end answer the question people actually have.' },
      { d: 'Bills that ask.', why: '“Have you paid rent?” on the 5th is friendlier than a red overdue badge.' },
      { d: 'Money is never rewritten.', why: 'Each entry keeps its own exchange rate, so history is valued at the rate of its day and what you still hold at today’s rate.' },
    ],
    hard: [
      { d: 'Dates landing on the wrong day near midnight', fix: 'Switched to local-calendar date keys instead of slicing UTC timestamps.' },
      { d: 'Google sign-in failing on some Android phones', fix: 'Credential Manager first, Google’s classic picker as a fallback, and readable guidance when both fail.' },
      { d: 'Reminders on a free plan', fix: 'A scheduled GitHub Action delivers the reminder plans the apps upload, with no paid cloud functions.' },
      { d: 'Updates without reinstalling', fix: 'Over-the-air bundles on Android, a signed updater on desktop and a versioned service worker on the web.' },
    ],
    numbers: [['5', 'platforms, one codebase'], ['216', 'commits'], ['any', 'currency, counted correctly']],
  },
  sentinel: {
    name: 'SentinelFlight', code: '359', word: 'FLY', live: 'https://sentinelflight.poelys.com/', repo: 'https://github.com/thrishankkuntimaddi/Enhanced-Space-Debris-Avoidance-and-Trajectory-Optimization-System',
    pip: 'Real rockets. Real debris. Mind the Starlinks.',
    line: 'A 3D game where you launch real rockets past real orbital debris.',
    problem: 'Low orbit is crowded with tens of thousands of tracked objects, and every launch has to be screened for collisions. The data behind that is dense and hard to read. The question was whether it could become something anyone can play and understand.',
    built: 'A launch and orbit-operations game built on the public space catalog. Every satellite and piece of debris is propagated in the browser, every launch is screened for close approaches, and you fly one of six real vehicles through six missions. Sentinel, an AI copilot, can pick a safe launch plan for you.',
    decisions: [
      { d: 'The maths runs in Web Workers.', why: 'Propagating the whole catalog is heavy. Moving it off the main thread keeps the Three.js scene smooth while the numbers crunch.' },
      { d: 'A launch-window chart instead of tables.', why: 'You pick a safe minute by looking at where the risk is, not by reading probabilities.' },
      { d: 'The AI is checked before it is trusted.', why: 'Sentinel’s chosen plan is screened again, and if anything is still dangerous it falls back to a simple search. That guard took it from 99.5% to 100% safe.' },
      { d: 'Honest results.', why: 'A simple one-step search finds slightly better plans. The learned agent’s real value is speed: 56 times fewer screenings than brute force. The README says so.' },
    ],
    hard: [
      { d: 'Missed close approaches', fix: 'At 15 km/s, samples are 150 km apart. Tests caught that refining only around the nearest sample could miss a closer pass, so every segment is now solved exactly.' },
      { d: 'Running on a 512 MB free server', fix: 'The AI policy is served as a 13 µs numpy forward pass with no PyTorch in production, and heavy plans run one at a time.' },
    ],
    numbers: [['23,805', 'tracked objects'], ['100%', 'safe on 200 unseen tests'], ['56×', 'fewer screenings'], ['15 ms', 're-screening a plan']],
  },
  learn: {
    name: 'LearnViaNotes', code: '66837', word: 'NOTES', live: 'https://www.learnvianotes.in/', repo: 'https://github.com/thrishankkuntimaddi/c-note',
    pip: 'No sign-up. Just learn. I like that.',
    line: 'Interview prep: 22 subjects and 150 coding problems in four languages.',
    problem: 'Interview prep is scattered across tabs, and too often it sits behind a sign-up wall. The goal was one quick, focused sheet you can open and start learning from.',
    built: 'Notes for 22 subjects, from DSA and system design to machine learning and SQL, plus 150 coding problems with solutions in Python, C++, Java and JavaScript. Read-aloud, a focus timer, spaced repetition and offline use come built in.',
    decisions: [
      { d: 'Sign-in is optional.', why: 'Progress stays on the device until someone chooses to sign in, and only then does it sync. Nothing stands between a learner and the first page.' },
      { d: 'Every code example is run before it ships.', why: 'Python, C++, Java, JavaScript and SQL examples are executed at build time and their output is checked. All four versions of an algorithm must print the same thing.' },
      { d: 'Content as data, not pages.', why: 'Subjects live in a database as structured blocks rendered by a few reusable components, so every subject looks the same in light and dark mode.' },
      { d: 'Rebuilt phone-first.', why: 'Most revision happens on a phone, so tinted categories and sticky filters were designed for one thumb first.' },
    ],
    hard: [
      { d: 'Notes that look different in every subject', fix: 'All topic HTML is normalised into one small style vocabulary.' },
      { d: 'Wrong code in study material', fix: 'C++ is compiled with sanitizers and every snippet is validated on each content build; failures are rejected.' },
    ],
    numbers: [['22', 'subjects'], ['150', 'coding problems'], ['4', 'languages per solution'], ['0', 'sign-up walls']],
  },
};

/* ---------------------------------------------------------
   What Pip knows. Each entry: words that trigger it, an
   answer, and optional buttons. Keep answers short.
   Actions: 'story:<id>', 'resume', 'quick', 'copy', or a URL.
   --------------------------------------------------------- */
export const ASK = [
  { k: ['hi', 'hello', 'hey', 'yo', 'namaste', 'sup'], a: 'Hi! I know everything on this site. Ask me about Thrishank’s projects, skills, or how to get in touch.' },
  { k: ['who', 'about', 'introduce', 'tell me', 'background'], a: 'Thrishank Kuntimaddi is a frontend developer focused on UI/UX, from Bengaluru, India. Thrishank takes products from the first sketch to a live release on web, Android and desktop, and can build the backend behind them too.', b: [['The 30-second version', 'quick']] },
  { k: ['hire', 'available', 'open', 'job', 'role', 'freelance', 'work with', 'collaborat', 'opportunit', 'looking'], a: 'Yes! Thrishank is open to frontend and UI roles, freelance work and collaborations. The quickest way in is email.', b: [['Copy email', 'copy'], ['See the resume', 'resume']] },
  { k: ['contact', 'email', 'mail', 'reach', 'touch', 'get in touch', 'talk', 'message', 'linkedin', 'phone'], a: 'Email is best: thrishankkuntimaddi@gmail.com. Thrishank is also on LinkedIn and GitHub.', b: [['Copy email', 'copy'], ['LinkedIn ↗', 'https://www.linkedin.com/in/thrishank-kuntimaddi-8b64832b6/'], ['GitHub ↗', 'https://github.com/thrishankkuntimaddi']] },
  { k: ['resume', 'cv', 'pdf'], a: 'Here it is: always the latest version.', b: [['Open the resume', 'resume']] },
  { k: ['skill', 'stack', 'tech', 'react', 'typescript', 'language', 'know', 'tools', 'frontend'], a: 'Frontend: React 19, TypeScript, Next.js, Tailwind, Vite and modern CSS. Motion and 3D: Three.js, WebGL, Canvas. Beyond the UI: Node.js, WebSockets, Redis, PostgreSQL, MongoDB, Firebase, Capacitor and Tauri.' },
  { k: ['design', 'ux', 'ui', 'figma', 'accessib', 'a11y'], a: 'UI/UX is the focus: design tokens, phone-first layouts, accessibility and motion that feels good the hundredth time. Every interface on this site, including me, was designed and coded by hand.' },
  { k: ['project', 'built', 'portfolio', 'best', 'proud', 'show'], a: 'Four main ones: Oruinwan (team workspace), Expense Tracker (calm money app), SentinelFlight (rockets vs space debris) and LearnViaNotes (interview prep). Each has a story.', b: [['Oruinwan', 'story:oruinwan'], ['Expense Tracker', 'story:expense'], ['SentinelFlight', 'story:sentinel'], ['LearnViaNotes', 'story:learn']] },
  { k: ['oruinwan', 'workspace', 'slack', 'chat', 'team'], a: 'Oruinwan is one workspace for a team’s chat, calls, tasks, notes and AI. It is Thrishank’s biggest build: 1,091 commits, end-to-end encryption, six platforms.', b: [['Read the story', 'story:oruinwan'], ['Open it ↗', 'https://oruinwan.poelys.com']] },
  { k: ['expense', 'money', 'finance', 'budget', 'tracker'], a: 'Expense Tracker is a calm finance app. Type “chai 20 vada 15” and it logs two expenses. It runs on web, Android and desktop from one codebase.', b: [['Read the story', 'story:expense'], ['Open it ↗', 'https://expensetracker-in.web.app/']] },
  { k: ['sentinel', 'space', 'rocket', 'debris', 'orbit', 'satellite', 'reinforcement', 'rl', 'dqn'], a: 'SentinelFlight lets you launch real rockets past real orbital debris in 3D. Its AI copilot was 100% safe on 200 unseen tests.', b: [['Read the story', 'story:sentinel'], ['Open it ↗', 'https://sentinelflight.poelys.com/']] },
  { k: ['learnvianotes', 'learn', 'notes', 'interview', 'dsa', 'prep'], a: 'LearnViaNotes covers 22 subjects and 150 coding problems in four languages, with no sign-up wall.', b: [['Read the story', 'story:learn'], ['Open it ↗', 'https://www.learnvianotes.in/']] },
  { k: ['yormenu', 'restaurant', 'menu'], a: 'YorMenu is a restaurant platform with separate screens for waiters, kitchen, billing and guests.', b: [['Open it ↗', 'https://yormenu.poelys.com/']] },
  { k: ['interstellar', 'journey', 'ship'], a: 'Interstellar is a 15-minute real-time 3D space journey with a flyable ship and a talking copilot, built with Three.js and GLSL shaders.', b: [['Open it ↗', 'https://thrishankkuntimaddi.github.io/interstellar/']] },
  { k: ['minutes', 'companion', 'esp32', 'rover', 'robot', 'hardware', 'arduino'], a: 'There is hardware too: Ms. Minutes, an AI desk companion with an animated face, and My Rovers, home-built robot rovers driven from a tablet cockpit app.' },
  { k: ['poelys', 'studio', 'company'], a: 'Poelys is Thrishank’s product studio, running since 2025. Every product lives there, at poelys.com.', b: [['Visit poelys.com ↗', 'https://poelys.com']] },
  { k: ['experience', 'worked', 'career', 'intern', 'founder', 'years'], a: 'Founder and engineer of Oruinwan since June 2025, running Poelys. Before that, internships in Data Science & Machine Learning (2023) and AI with Python (2022).', b: [['See the resume', 'resume']] },
  { k: ['education', 'degree', 'college', 'university', 'study', 'studied', 'gpa', 'btech', 'graduat'], a: 'B.Tech in Computer Science & Engineering (Data Science) at MITS Madanapalle, 2021 to 2025, with a GPA of 8.41 out of 10.' },
  { k: ['award', 'prize', 'hackathon', 'won', 'win', 'achievement'], a: 'First prize at the IISF 2023 Young Scientist Conference, second prize at the ImpactX 2024 Hackathon, and Level 3 at Smart India Hackathon 2023.' },
  { k: ['where', 'location', 'live', 'based', 'city', 'country', 'from', 'relocat', 'remote'], a: 'Bengaluru, India. For remote work or relocation questions, email is best.', b: [['Copy email', 'copy']] },
  { k: ['site', 'website', 'built this', 'made this', 'gravity', 'universe'], a: 'This site is plain HTML, CSS and JavaScript with no build step. The orbits are a real gravity simulation, and the five universes change on every refresh. I come free with it.' },
  { k: ['pip', 'your name', 'who are you', 'are you'], a: 'I’m Pip, the guide. I walk around, pull faces and answer questions. Tap me any time to ask something, and the more you do, the more attached I get.' },
  { k: ['setting', 'disable', 'turn off', 'switch off', 'stop', 'glitch', 'motion', 'animation', 'sound', 'mute', 'theme', 'dark'], a: 'Everything can be tuned on the Universes & settings page: switch off glitches, motion, sound, the auto-tour or me, or pick your favourite universe. (Dark mode isn’t one of them; this site only comes in light.)', b: [['Open settings', 'universes.html']] },
  { k: ['secret', 'easter', 'hidden', 'trick', 'tip'], a: 'Hold me down to peek at the last colours. Hover a globe to decode its keypad code. And at the very end, try the quick jump.' },
  { k: ['salary', 'pay', 'rate', 'price', 'cost', 'age', 'old', 'married', 'religion'], a: 'That one is better asked to Thrishank directly.', b: [['Copy email', 'copy']] },
  { k: ['thank', 'thanks', 'cool', 'nice', 'love', 'awesome', 'great'], a: 'Aw. I’ll tell Thrishank. Want to leave a sticker at the end of the page?' },
];
export const ASK_SUGGEST = ['Is Thrishank open to work?', 'What has Thrishank built?', 'What’s the tech stack?', 'How do I get in touch?'];
export const ASK_FALLBACK = 'I only know what is on this site, and that one is not here. Thrishank can answer it though.';

/* ---------------------------------------------------------
   Occasions. Fixed dates are 'MM-DD'; moving ones are listed
   by year. Each sets a greeting and something Pip wears.
   --------------------------------------------------------- */
export const OCCASIONS = [
  { id: 'newyear', greet: 'Happy New Year', wear: 'party', dates: ['01-01', '01-02'] },
  { id: 'lunar', greet: 'Happy Lunar New Year', wear: 'lantern', dates: ['2026-02-17', '2027-02-06', '2028-01-26', '2029-02-13', '2030-02-03'] },
  { id: 'holi', greet: 'Happy Holi', wear: 'colour', dates: ['2026-03-04', '2027-03-22', '2028-03-11', '2029-03-01', '2030-03-20'] },
  { id: 'pi', greet: 'Happy Pi Day', wear: 'party', dates: ['03-14'] },
  { id: 'eid', greet: 'Eid Mubarak', wear: 'crescent', dates: ['2026-03-20', '2026-03-21', '2027-03-10', '2027-03-11', '2028-02-27', '2028-02-28', '2029-02-15', '2029-02-16', '2030-02-05', '2030-02-06'] },
  { id: 'programmers', greet: 'Happy Programmers’ Day', wear: 'party', dates: ['day-256'] },
  { id: 'halloween', greet: 'Happy Halloween', wear: 'witch', dates: ['10-31'] },
  { id: 'diwali', greet: 'Happy Diwali', wear: 'diya', dates: ['2026-11-08', '2027-10-29', '2028-10-17', '2029-11-05', '2030-10-26'] },
  { id: 'christmas', greet: 'Merry Christmas', wear: 'santa', dates: ['12-24', '12-25'] },
];
