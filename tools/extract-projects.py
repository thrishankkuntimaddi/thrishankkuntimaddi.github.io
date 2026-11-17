"""Reads the hand-written projects in index.html and writes lib/projects-seed.js,
the starting data for the Studio app's Projects editor. Run: python3 tools/extract-projects.py"""
import re, json, html, os
ROOT = os.path.join(os.path.dirname(__file__), '..')
s = open(os.path.join(ROOT, 'index.html')).read()
txt = lambda h: html.unescape(re.sub(r'<[^>]+>', '', h)).strip()
inner = lambda h: html.unescape(h).strip()

main = []
for m in re.finditer(r'<article class="project( flip)?" data-scene="([^"]+)">(.*?)</article>', s, re.S):
    a = m.group(3)
    name = txt(re.search(r'<h3>(.*?)</h3>', a, re.S).group(1))
    links = re.findall(r'<a class="btn (btn-gloss|btn-paper)" href="([^"]+)"', a)
    tag = re.search(r'<p class="win-tag">(.*?)</p>', a, re.S)
    main.append({
        'id': re.sub(r'[^a-z0-9]+', '', name.lower()), 'name': name, 'hidden': False,
        'preview': name, 'scene': m.group(2),
        'label': txt(re.search(r'<div class="win-bar">.*?<span>(.*?)</span>', a, re.S).group(1)),
        'tagline': inner(tag.group(1)).replace('<br>', '\n') if tag else '',
        'what': txt(re.search(r'<p class="p-what">(.*?)</p>', a, re.S).group(1)),
        'points': [txt(x) for x in re.findall(r'<li>(.*?)</li>', re.search(r'<ul class="p-points">(.*?)</ul>', a, re.S).group(1), re.S)],
        'chips': [txt(x) for x in re.findall(r'<li>(.*?)</li>', re.search(r'<ul class="chips">(.*?)</ul>', a, re.S).group(1), re.S)],
        'live': next((u for k, u in links if k == 'btn-gloss'), ''),
        'repo': next((u for k, u in links if k == 'btn-paper'), ''),
    })

more = []
for m in re.finditer(r'<a class="card mini reveal" href="([^"]+)"[^>]*>(.*?)</a>', s, re.S):
    a = m.group(2)
    tag = re.search(r'<span class="mini-tag( live)?">(.*?)</span>', a)
    code = re.search(r'data-code="(\d+)" data-word="([A-Z]+)"', a)
    more.append({
        'id': re.sub(r'[^a-z0-9]+', '', txt(re.search(r'<h3>(.*?)</h3>', a).group(1)).lower()),
        'name': txt(re.search(r'<h3>(.*?)</h3>', a).group(1)), 'hidden': False, 'link': m.group(1),
        'status': txt(tag.group(2)), 'live': bool(tag.group(1)), 'word': code.group(2) if code else '',
        'what': txt(re.search(r'<p>(.*?)</p>', a, re.S).group(1)), 'stack': txt(re.search(r'<span class="mini-stack">(.*?)</span>', a).group(1)),
    })

orbit = []
for m in re.finditer(r'<li><a href="([^"]+)" target="_blank" rel="noopener" aria-label="[^"]*"><svg class="globe".*?data-word="([A-Z]+)">.*?<b>(.*?)</b>', s, re.S):
    orbit.append({'id': re.sub(r'[^a-z0-9]+', '', m.group(3).lower()), 'name': txt(m.group(3)), 'link': m.group(1), 'word': m.group(2), 'hidden': False})

STORY = {'oruinwan': 'oruinwan', 'expensetracker': 'expense', 'sentinelflight': 'sentinel', 'learnvianotes': 'learn'}
for p in main: p['story'] = STORY.get(p['id'], p['id'])
data = {'main': main, 'more': more, 'orbit': orbit}
open(os.path.join(ROOT, 'lib/projects-seed.js'), 'w').write(
    '/* The projects as they are hand-written in index.html (made by tools/extract-projects.py).\n'
    '   The Studio app starts from this; the website uses site/content once published. */\n'
    f'export const PROJECTS_SEED = {json.dumps(data, indent=1, ensure_ascii=False)};\n')
print(len(main), 'main,', len(more), 'more,', len(orbit), 'orbit')
