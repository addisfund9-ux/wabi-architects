#!/usr/bin/env python3
"""Health check of the published website — runs every 30 minutes on GitHub.

It rebuilds what *should* be online and compares it with what *is* online:
  * every page answers, over HTTPS, in reasonable time
  * the pages, scripts and styles served are byte-for-byte the ones in this repo
    (so nobody has slipped in other code), and the security policy is present
  * the published version matches the latest commit
  * sample pictures load, the HTTPS certificate is not about to expire
Writes report.md; exits 1 when something is wrong.
"""
import os, sys, ssl, time, socket, hashlib, random, urllib.request, urllib.error, datetime, subprocess
sys.path.insert(0, os.path.dirname(__file__))
from site_rules import PAGES, CSP

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
URL = os.environ['SITE_URL'].rstrip('/')
EXPECT_SHA = os.environ.get('SITE_SHA', '')
subprocess.check_call([sys.executable, os.path.join(ROOT, 'tools/build.py')], stdout=subprocess.DEVNULL)
SITE = os.path.join(ROOT, '_site')

def fetch(path):
    req = urllib.request.Request(URL + '/' + path + ('?nocache=%d' % time.time() if path.endswith('version.txt') else ''),
                                 headers={'User-Agent': 'wabi-health-check', 'Cache-Control': 'no-cache'})
    t = time.time()
    try:
        with urllib.request.urlopen(req, timeout=25) as r:
            return r.status, r.read(), time.time() - t
    except urllib.error.HTTPError as e:
        return e.code, b'', time.time() - t
    except Exception as e:
        return 0, str(e).encode(), time.time() - t

def run():
    rows, bad = [], []
    if not URL.startswith('https://'): bad.append('Site address is not HTTPS: ' + URL)
    targets = list(PAGES) + ['assets/css/home.css', 'assets/css/pages.css', 'assets/css/projects.css'] + \
        ['assets/js/' + f for f in sorted(os.listdir(os.path.join(SITE, 'assets/js')))]
    for p in targets:
        code, body, dt = fetch(p)
        want = open(os.path.join(SITE, p), 'rb').read()
        same = hashlib.sha256(body).hexdigest() == hashlib.sha256(want).hexdigest()
        ok = code == 200 and same
        if p.endswith('.html') and ok and CSP.encode() not in body: ok = False; same = False
        if code != 200: bad.append('%s answered %s' % (p, code or body.decode()[:120]))
        elif not same: bad.append('%s online is DIFFERENT from the repo (possible tampering or an unfinished publish)' % p)
        if dt > 10: bad.append('%s took %.1f s' % (p, dt))
        rows.append('| `%s` | %s | %s | %.2f s |' % (p, code, 'matches repo' if same else '**differs**', dt))
    imgs = [os.path.relpath(os.path.join(d, f), SITE) for d, _, fs in os.walk(os.path.join(SITE, 'assets/img')) for f in fs]
    for p in random.sample(imgs, min(6, len(imgs))):
        code, body, dt = fetch(p)
        if code != 200 or len(body) != os.path.getsize(os.path.join(SITE, p)): bad.append('picture %s did not load correctly (%s)' % (p, code))
        rows.append('| `%s` | %s | %s | %.2f s |' % (p, code, 'ok' if code == 200 else '**failed**', dt))
    code, body, _ = fetch('version.txt')
    live_sha = body.decode().strip()
    if EXPECT_SHA and live_sha != EXPECT_SHA:
        bad.append('Online version %s is not the latest commit %s (a publish may have failed)' % (live_sha[:7] or '?', EXPECT_SHA[:7]))
    host = URL.split('/')[2]
    try:
        ctx = ssl.create_default_context()
        with socket.create_connection((host, 443), timeout=15) as s, ctx.wrap_socket(s, server_hostname=host) as t:
            exp = datetime.datetime.strptime(t.getpeercert()['notAfter'], '%b %d %H:%M:%S %Y %Z')
        days = (exp - datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)).days
        if days < 14: bad.append('HTTPS certificate expires in %d days' % days)
        cert = '%d days left' % days
    except Exception as e:
        bad.append('HTTPS certificate problem: %s' % e); cert = 'error'
    return rows, bad, live_sha, cert

rows, bad, live_sha, cert = run()
if bad:  # one retry after 3 minutes, so a publish that is still rolling out isn't reported as a problem
    time.sleep(int(os.environ.get('HEALTH_RETRY_WAIT', '180'))); rows, bad, live_sha, cert = run()
now = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d %H:%M UTC')
rep = ['## %s Website health — %s' % ('✅' if not bad else '🔴', now), '',
       '**Site:** %s  ·  **Online version:** `%s`  ·  **HTTPS certificate:** %s' % (URL, live_sha[:7] or '?', cert), '']
if bad: rep += ['### Problems', ''] + ['- ' + b for b in bad] + ['']
rep += ['<details><summary>Everything checked</summary>', '', '| File | Status | Content | Time |', '|---|---|---|---|'] + rows + ['', '</details>', '']
open(os.path.join(ROOT, 'report.md'), 'w').write('\n'.join(rep))
print('\n'.join(rep))
sys.exit(1 if bad else 0)
