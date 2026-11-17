"""Gives every editable text block in index.html a stable key (data-k="section.tagN")
and writes lib/text-seed.js (key -> {section, original HTML}) for the Studio app's
Page text editor. Safe to re-run: existing keys are kept, new blocks get new keys.
Run: python3 tools/tag-text.py"""
import os, re, json, html
from html.parser import HTMLParser

ROOT = os.path.join(os.path.dirname(__file__), '..')
P = os.path.join(ROOT, 'index.html')
src = open(P).read()
lines = src.split('\n')
offs = [0]
for l in lines: offs.append(offs[-1] + len(l) + 1)
pos = lambda lc: offs[lc[0] - 1] + lc[1]

TEXT_TAGS = {'h1', 'h2', 'h3', 'p', 'li', 'dt', 'dd'}
INLINE = {'em', 'b', 'i', 'u', 'br', 'strong', 'span', 'a', 'code', 'small', 'sup'}
VOID = {'br', 'img', 'input', 'meta', 'link', 'hr', 'source', 'use', 'path', 'circle', 'ellipse', 'rect', 'line', 'stop'}
SKIP_IN = lambda t, a: (t == 'article' and 'project' in a.get('class', '')) or (t == 'a' and 'mini' in a.get('class', '')) \
    or (t == 'div' and 'worlds' in a.get('class', '')) or t in ('svg', 'dialog', 'canvas', 'script', 'style', 'template') \
    or (t == 'ul' and 'poelys-links' in a.get('class', '')) or (t == 'div' and a.get('class', '') in ('rv-tabs',))

class T(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.stack, self.found, self.section, self.in_main = [], [], 'top', False
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'main' or tag == 'footer' or (tag == 'section' and a.get('id') == 'post'): self.in_main = True
        if tag == 'section' and a.get('id'): self.section = a['id']
        if tag == 'footer': self.section = 'footer'
        for e in self.stack:
            if e['cand'] and tag not in INLINE: e['cand'] = False
        skip = any(e['skip'] for e in self.stack) or SKIP_IN(tag, a)
        cand = self.in_main and not skip and tag in TEXT_TAGS and 'id' not in a and 'data-copy' not in a and 'hidden' not in a \
            and 'aria-hidden' not in a and not any(k.startswith('data-') and k != 'data-k' for k in a)
        if tag in VOID: return
        self.stack.append({'tag': tag, 'a': a, 'start': self.getpos(), 'cand': cand, 'skip': skip, 'sec': self.section, 'text': False})
    def handle_startendtag(self, tag, attrs): pass
    def handle_data(self, d):
        if d.strip() and self.stack: self.stack[-1]['text'] = True
        if d.strip():
            for e in self.stack: e['anytext'] = True
    def handle_entityref(self, n): self.handle_data('x')
    def handle_charref(self, n): self.handle_data('x')
    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i]['tag'] == tag:
                e = self.stack.pop(i)
                del self.stack[i:]
                if e['cand'] and e.get('anytext'):
                    self.found.append((e, self.getpos()))
                break

t = T(); t.feed(src)
counts, edits, seed = {}, [], {}
for e, endpos in sorted(t.found, key=lambda x: pos(x[0]['start'])):
    start = pos(e['start'])
    gt = src.index('>', start)
    if re.search(r'\sid="', src[gt + 1:pos(endpos)]): continue  # holds something the scripts update
    key = e['a'].get('data-k')
    if not key:
        n = counts.get((e['sec'], e['tag']), 0)
        key = f"{e['sec']}.{e['tag']}{n}"
        while f'data-k="{key}"' in src: n += 1; key = f"{e['sec']}.{e['tag']}{n}"
        counts[(e['sec'], e['tag'])] = n + 1
        edits.append((gt, f' data-k="{key}"'))
    close = pos(endpos)
    if re.search(r'\sid="', src[gt + 1:close]): continue  # holds something the scripts update
    seed[key] = {'section': e['sec'], 'tag': e['tag'], 'html': src[gt + 1:close].strip()}
for at, ins in sorted(edits, reverse=True):
    src = src[:at] + ins + src[at:]
open(P, 'w').write(src)
# html in seed must be from the final file (keys shifted offsets) — recompute
final = open(P).read()
seed = {}
for m in re.finditer(r'<(h1|h2|h3|p|li|dt|dd)([^>]*?) data-k="([^"]+)"([^>]*)>(.*?)</\1>', final, re.S):
    seed[m.group(3)] = {'section': m.group(3).split('.')[0], 'tag': m.group(1), 'html': m.group(5).strip()}
open(os.path.join(ROOT, 'lib/text-seed.js'), 'w').write(
    '/* Every editable text block on the home page (made by tools/tag-text.py). The Studio app\n'
    '   shows these; changed ones are saved in site/content.text and applied by lib/content-live.js. */\n'
    f'export const TEXT_SEED = {json.dumps(seed, indent=1, ensure_ascii=False)};\n')
print(len(edits), 'new keys,', len(seed), 'blocks')
