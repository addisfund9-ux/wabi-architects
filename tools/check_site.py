#!/usr/bin/env python3
"""Pre-flight check — runs before every publish. If anything here fails, the site is NOT published.

Checks: only allowed file types, every page carries the security policy, no inline or
outside scripts, no crypto-miner code, every picture/link the pages use exists, the
project list is valid, and no file is unreasonably large.
Run locally:  python3 tools/check_site.py
"""
import os, re, sys, json, subprocess
sys.path.insert(0, os.path.dirname(__file__))
from site_rules import PAGES, CSP, ALLOWED_EXT, NOT_PUBLISHED, BLOCKED_JS

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
errors, warnings = [], []
def err(f, msg): errors.append((f, msg))
def warn(f, msg): warnings.append((f, msg))

def published():
    for dp, dns, fns in os.walk(ROOT):
        rel = os.path.relpath(dp, ROOT)
        top = rel.split(os.sep)[0]
        if top in NOT_PUBLISHED: dns[:] = []; continue
        dns[:] = [d for d in dns if d not in NOT_PUBLISHED]
        for fn in fns:
            r = os.path.normpath(os.path.join(rel, fn))
            if r in NOT_PUBLISHED: continue
            yield r.replace(os.sep, '/')

files = sorted(published())
fileset = set(files)

# 1. file types and sizes
for f in files:
    ext = os.path.splitext(f)[1].lower()
    if ext not in ALLOWED_EXT: err(f, 'file type ' + (ext or '(none)') + ' is not allowed on the website')
    size = os.path.getsize(os.path.join(ROOT, f))
    if size > 15e6: err(f, 'file is %.1f MB (limit 15 MB)' % (size / 1e6))
    elif ext in ('.jpg', '.jpeg', '.png', '.webp') and size > 2.5e6: warn(f, 'large image (%.1f MB) — slows the page' % (size / 1e6))

def exists(base, ref):
    if ref.startswith(('http:', 'https:', 'data:', 'mailto:', 'tel:', '#', '%23', '//', 'javascript:')) or not ref: return True
    ref = ref.split('#')[0].split('?')[0]
    if not ref: return True
    p = os.path.normpath(os.path.join(base, ref)).replace(os.sep, '/')
    return p in fileset

# 2. pages
for p in PAGES:
    if p not in fileset: err(p, 'page is missing'); continue
for f in [x for x in files if x.endswith('.html')]:
    s = open(os.path.join(ROOT, f), encoding='utf-8').read()
    m = re.search(r'<meta http-equiv="Content-Security-Policy" content="([^"]*)"', s)
    if not m: err(f, 'security policy (Content-Security-Policy meta tag) is missing')
    elif m.group(1) != CSP: err(f, 'security policy was changed — it must match tools/site_rules.py')
    for sm in re.finditer(r'<script\b([^>]*)>(.*?)</script>', s, re.S):
        attrs, body = sm.group(1), sm.group(2)
        src = re.search(r'src="([^"]+)"', attrs)
        if src:
            if re.match(r'(https?:)?//', src.group(1)): err(f, 'outside script not allowed: ' + src.group(1))
        elif 'application/ld+json' not in attrs and body.strip():
            err(f, 'inline <script> code not allowed — put it in a file under assets/js/')
    for bad in re.findall(r'<(iframe|object|embed|frame)\b', s, re.I): err(f, '<%s> is not allowed' % bad)
    for h in re.findall(r'\son[a-z]+\s*=\s*["\']', s, re.I): err(f, 'inline event handler (%s) not allowed' % h.strip())
    if re.search(r'href\s*=\s*["\']\s*javascript:', s, re.I): err(f, 'javascript: link not allowed')
    for ref in re.findall(r'(?:src|href|data-img|poster)="([^"]+)"', s):
        if not exists(os.path.dirname(f), ref): err(f, 'broken link or missing file: ' + ref)

# 3. styles
for f in [x for x in files if x.endswith('.css')]:
    s = open(os.path.join(ROOT, f), encoding='utf-8').read()
    for ref in re.findall(r"url\(['\"]?([^'\")]+)", s):
        if not exists(os.path.dirname(f), ref): err(f, 'missing file in stylesheet: ' + ref)
    if re.search(r'@import\s+(url\()?["\']?https?:', s): err(f, 'outside stylesheet import not allowed')

# 4. scripts
for f in [x for x in files if x.endswith('.js')]:
    s = open(os.path.join(ROOT, f), encoding='utf-8').read()
    for pat in BLOCKED_JS:
        if re.search(pat, s, re.I): err(f, 'blocked code pattern found: ' + pat)
    for ref in re.findall(r"['\"](assets/[^'\"]+\.(?:jpg|jpeg|png|webp|svg|mp4|js|css))['\"]", s):
        if '/bole-apartment/' in ref or '/my-project/' in ref: continue  # examples in comments
        if ref not in fileset: err(f, 'missing file: ' + ref)

# 5. project list
try:
    out = subprocess.check_output(['node', '-e', """
global.window = global; require(process.argv[1]); process.stdout.write(JSON.stringify(window.WABI_PROJECTS));""",
        os.path.join(ROOT, 'assets/js/projects-data.js')], stderr=subprocess.STDOUT)
    data = json.loads(out)
    ids = set()
    for i, p in enumerate(data):
        name = p.get('id') or '#%d' % (i + 1)
        if not p.get('id') or not re.match(r'^[a-z0-9-]+$', p['id']): err('assets/js/projects-data.js', name + ': id must be lowercase letters, numbers and dashes')
        if p.get('id') in ids: err('assets/js/projects-data.js', name + ': id used twice')
        ids.add(p.get('id'))
        if not p.get('title'): err('assets/js/projects-data.js', name + ': title is missing')
        for x in (p.get('images') or []) + ([p['cover']] if p.get('cover') else []) + [d.get('src', '') for d in (p.get('drawings') or [])]:
            if x not in fileset: err('assets/js/projects-data.js', name + ': picture not found — ' + x)
    print('Projects in the list: %d' % len(data))
except subprocess.CalledProcessError as e:
    err('assets/js/projects-data.js', 'the project list has a typo and cannot be read: ' + e.output.decode()[-300:])

gha = os.environ.get('GITHUB_ACTIONS') == 'true'
for f, m in warnings: print(('::warning file=%s::%s' if gha else 'WARNING  %s: %s') % (f, m))
for f, m in errors: print(('::error file=%s::%s' if gha else 'ERROR    %s: %s') % (f, m))
print('Checked %d files — %d problem(s), %d warning(s).' % (len(files), len(errors), len(warnings)))
sys.exit(1 if errors else 0)
