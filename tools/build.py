#!/usr/bin/env python3
"""Prepare the files GitHub Pages will publish (in _site/).

  SITE_URL   full address of the site, e.g. https://addisfund9-ux.github.io/wabi-architects
  SITE_LIVE  "true" once the site is launched on its own domain; until then search
             engines are asked not to list it (it's a preview for the partners).
  SITE_SHA   the commit being published (written to version.txt for the health check).
Run locally:  SITE_URL=http://localhost:8000 python3 tools/build.py
"""
import os, re, sys, shutil, datetime
sys.path.insert(0, os.path.dirname(__file__))
from site_rules import NOT_PUBLISHED, OLD_DOMAIN

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
OUT = os.path.join(ROOT, '_site')
URL = os.environ.get('SITE_URL', '').rstrip('/') or 'http://localhost:8000'
LIVE = os.environ.get('SITE_LIVE', '').lower() == 'true'
SHA = os.environ.get('SITE_SHA', 'local')
base_path = re.sub(r'^https?://[^/]+', '', URL) or ''

shutil.rmtree(OUT, ignore_errors=True)
def skip(d, names): return [n for n in names if n in NOT_PUBLISHED] if os.path.abspath(d) == ROOT else []
shutil.copytree(ROOT, OUT, ignore=skip)

# small (960px) copies of project pictures for cards and lists, made automatically
# for any project added without them (the page falls back to the full picture otherwise)
def make_small():
    import glob
    try:
        from PIL import Image
    except ImportError:
        print('Pillow not installed: skipping small pictures'); return
    made = 0
    for f in glob.glob(os.path.join(OUT, 'assets/img/projects/*/*.jpg')):
        for sub, side, q in (('sm', 960, 76), ('xs', 480, 66)):   # small: cards; extra-small: hover previews
            o = os.path.join(os.path.dirname(f), sub, os.path.basename(f))
            if os.path.exists(o): continue
            os.makedirs(os.path.dirname(o), exist_ok=True)
            im = Image.open(f).convert('RGB'); im.thumbnail((side, side), Image.LANCZOS)
            im.save(o, 'JPEG', quality=q, optimize=True, progressive=True); made += 1
    if made: print('Made %d small pictures' % made)
make_small()

pages = []
for dp, _, fns in os.walk(OUT):
    for fn in fns:
        if not fn.endswith('.html'): continue
        fp = os.path.join(dp, fn); s = open(fp, encoding='utf-8').read()
        # cache-busting: each publish gets fresh scripts and styles, never a stale mix of old and new
        s = re.sub(r'((?:src|href)="assets/(?:js|css)/[A-Za-z0-9_.-]+\.(?:js|css))"', r'\1?v=' + SHA[:8] + '"', s)
        s = s.replace(OLD_DOMAIN + '/', URL + '/').replace(OLD_DOMAIN, URL)
        if fn == '404.html':  # works from any missing address, however deep
            s = s.replace('<meta charset="UTF-8">', '<meta charset="UTF-8">\n<base href="' + base_path + '/">', 1)
        if not LIVE and 'name="robots"' not in s:
            s = s.replace('<meta charset="UTF-8">', '<meta charset="UTF-8">\n<meta name="robots" content="noindex, nofollow">', 1)
        open(fp, 'w', encoding='utf-8').write(s)
        if fn not in ('404.html', 'finishing-proposal.html'): pages.append(os.path.relpath(fp, OUT))

if LIVE:
    today = datetime.date.today().isoformat()
    open(os.path.join(OUT, 'sitemap.xml'), 'w').write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
        ''.join('  <url><loc>%s/%s</loc><lastmod>%s</lastmod></url>\n' % (URL, '' if p == 'index.html' else p, today) for p in sorted(pages)) + '</urlset>\n')
    open(os.path.join(OUT, 'robots.txt'), 'w').write('User-agent: *\nAllow: /\nSitemap: %s/sitemap.xml\n' % URL)
else:
    open(os.path.join(OUT, 'robots.txt'), 'w').write('# Preview — not for search engines yet\nUser-agent: *\nDisallow: /\n')
open(os.path.join(OUT, 'version.txt'), 'w').write(SHA + '\n')
print('Built %s for %s (%s)' % (OUT, URL, 'live' if LIVE else 'preview, hidden from search engines'))
