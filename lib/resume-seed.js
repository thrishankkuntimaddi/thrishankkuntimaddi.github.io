/* The resume as it was on 2026-11-17 (taken from the PDF).
   Used as the first draft in the editor and as the site's
   fallback when the published version can't be fetched. */
export const SEED = {
  v: 1,
  page: 'letter',
  accent: '#1A5276',
  name: 'Thrishank Kuntimaddi',
  title: 'Software Development Engineer',
  contacts: [
    { text: '+91 9381870544', url: '' },
    { text: 'thrishankkuntimaddi@gmail.com', url: 'mailto:thrishankkuntimaddi@gmail.com' },
    { text: 'chttrix', url: 'https://chttrix.vercel.app/' },
    { text: 'LinkedIn', url: 'https://www.linkedin.com/in/thrishank-kuntimaddi' },
    { text: 'GitHub', url: 'https://github.com/thrishankkuntimaddi' },
    { text: 'Bengaluru, India', url: '' },
  ],
  sections: [
    { id: 'summary', type: 'text', title: 'Summary', justify: true,
      body: 'SDE focused on distributed systems, real-time infrastructure, and full-stack product engineering. Built and scaled Chttrix — a production SaaS platform — with strong emphasis on performance, security, and system design. Hands-on experience across the full product lifecycle with strong DSA and problem-solving skills.' },
    { id: 'experience', type: 'entries', title: 'Experience', items: [
      { title: 'Software Development Engineer', org: 'Chttrix — SaaS Product', date: 'Jun 2025 – Present', sub: '', subRight: '', bullets: [
        '**Real-Time Messaging:** Built an E2EE WebSocket system using Socket.IO + Redis pub/sub; load-tested with **10K+ simulated concurrent sessions** and reduced p95 latency from 850ms to 45ms (94.7%) through parallelized MongoDB queries, .lean() projections, and async side-effect decoupling.',
        '**End-to-End Encryption:** Implemented X25519 ECDH key exchange + AES-256-GCM with random IVs per message; designed a blind-relay architecture with no plaintext stored or transmitted by the server; used PBKDF2 for key derivation.',
        '**Auth & Identity:** Implemented JWT rotation (15min/7day), SHA-256 token hashing, HTTP Only cookies, bcrypt, multi-provider OAuth 2.0, and 6-tier RBAC embedded in JWT; designed concurrent-safe refresh with retry logic and minimized database lookups during authentication.',
        '**Task Engine:** Designed a 7-state FSM with validated transitions, atomic Jira-style key generation, 3-tier soft deletion, immutable audit logs, and compound-indexed queries for multi-tenant isolation; **tested against 100K+ task records** to evaluate query and indexing performance.',
        '**Full-Stack Platform:** Built **58 modules** across a React 19 + Node.js/Express 5 monorepo, workflow automation, GitHub/Zoom integrations, SSO/SAML/SCIM, GDPR-related features, and a developer API with a bot marketplace.',
      ] },
    ] },
    { id: 'projects', type: 'entries', title: 'Projects', items: [
      { title: 'Space Debris Avoidance & Trajectory Optimization System', org: '', date: '2024 – 2025', sub: 'Python · Reinforcement Learning · Async Inference Pipelines', subRight: '', bullets: [
        'Designed an RL-based satellite trajectory optimizer to autonomously navigate space debris fields using custom reward shaping and policy learning in a simulated orbital environment.',
        'Implemented custom RL reward functions penalizing collision risk and fuel waste; built async inference pipelines to decouple simulation and prediction steps, reducing computation overhead by 30%.',
        'Achieved 90% reduction in simulated collision rate with sub-5s end-to-end computation.',
      ] },
    ] },
    { id: 'skills', type: 'skills', title: 'Technical skills', items: [
      { label: 'Languages', value: 'JavaScript, Python, SQL' },
      { label: 'Backend', value: 'Node.js, Express, REST APIs, WebSockets, JWT, OAuth 2.0, Redis, MongoDB, PostgreSQL' },
      { label: 'Security', value: 'AES-256-GCM, X25519 ECDH, PBKDF2, SHA-256, E2EE, SSO, TOTP/2FA' },
      { label: 'Frontend', value: 'React 19, Next.js, TailwindCSS' },
      { label: 'Architecture', value: 'Distributed systems, event-driven design, FSM, multi-tenancy, pub/sub' },
      { label: 'DevOps', value: 'Docker, Vercel, Railway, Google Cloud Run/Storage, CI/CD' },
      { label: 'CS Fundamentals', value: 'Data Structures & Algorithms, System Design, OOPs, Operating System, Computer Networks, DBMS' },
    ] },
    { id: 'education', type: 'entries', title: 'Education', subStyle: 'muted', items: [
      { title: 'B.Tech Computer Science & Engineering (Data Science)', org: '', date: 'GPA: 8.41 / 10', sub: 'Madanapalle Institute of Technology and Science (MITS)', subRight: 'Dec 2021 – May 2025', bullets: [] },
    ] },
    { id: 'achievements', type: 'list', title: 'Achievements', justify: true, items: [
      "**First Prize — IISF'23 Young Scientist Conference** (Indian International Science Festival 2023, national level, 150+ participants): Recognised for building an autonomous flying copter for public safety using drone technology.",
      '**Second Prize — ImpactX 2024 Hackathon** (Sustainability track, 100+ teams, 24-hour): Developed a full-stack carbon footprint calculator addressing real-world sustainability challenges.',
    ] },
  ],
};
