/* =========================================================
   Live project stats on each main project card:
     ★ stars · updated 3 days ago · main language
   From GitHub's free public API (no key; 60 requests an hour
   per visitor, so results, and misses such as a private
   repo, are kept for 6 hours in the browser).
   ========================================================= */
const CACHE = 'tk-gh';
const TTL = 6 * 3600e3;
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function readCache() { try { const c = JSON.parse(localStorage.getItem(CACHE)) || {}; return c; } catch { return {}; } }
function writeCache(c) { try { localStorage.setItem(CACHE, JSON.stringify(c)); } catch { /* private mode */ } }

const ago = (iso) => {
  const d = (Date.now() - new Date(iso).getTime()) / 864e5;
  if (!(d >= 0)) return '';
  if (d < 1) return 'today';
  if (d < 2) return 'yesterday';
  if (d < 30) return `${Math.floor(d)} days ago`;
  if (d < 365) { const m = Math.floor(d / 30); return `${m} month${m === 1 ? '' : 's'} ago`; }
  const y = Math.floor(d / 365); return `${y} year${y === 1 ? '' : 's'} ago`;
};

async function repo(full, cache) {
  const hit = cache[full];
  if (hit && Date.now() - hit.t < TTL) return hit.miss ? null : hit;
  const r = await fetch(`https://api.github.com/repos/${full}`, { headers: { Accept: 'application/vnd.github+json' }, credentials: 'omit', referrerPolicy: 'no-referrer' });
  if (!r.ok) { // private repo: remember the miss; rate-limited: keep the old numbers if any
    if (r.status === 404) cache[full] = { t: Date.now(), miss: true };
    return hit && !hit.miss ? hit : null;
  }
  const j = await r.json();
  const out = { t: Date.now(), stars: j.stargazers_count || 0, pushed: j.pushed_at, lang: j.language || '' };
  cache[full] = out;
  return out;
}

function line(card) {
  let p = card.querySelector('.p-stats');
  if (!p) { p = document.createElement('p'); p.className = 'p-stats'; (card.querySelector('.chips') || card.querySelector('.p-actions')).after(p); }
  return p;
}

export async function initStats(root = document) {
  const cards = [...root.querySelectorAll('#work .project-card')];
  if (!cards.length) return;
  const cache = readCache();
  await Promise.all(cards.map(async (card) => {
    const code = card.querySelector('.p-actions a[href*="github.com/"]');
    const m = code && /github\.com\/([^/]+\/[^/#?]+)/.exec(code.href);
    const g = m ? await repo(m[1].replace(/\.git$/, ''), cache).catch(() => null) : null;
    const bits = [];
    if (g) {
      if (g.stars) bits.push(`<span title="GitHub stars">★ ${g.stars}</span>`);
      if (g.pushed) bits.push(`<span title="Last commit">Updated ${esc(ago(g.pushed))}</span>`);
      if (g.lang) bits.push(`<span title="Main language">${esc(g.lang)}</span>`);
    }
    if (!bits.length) return;
    const p = line(card);
    p.innerHTML = bits.join('<i aria-hidden="true">·</i>');
    p.setAttribute('aria-label', `Project status: ${[...p.querySelectorAll('span')].map((x) => x.textContent.replace('★', 'stars:').trim()).join(', ')}`);
  }));
  writeCache(cache);
}
