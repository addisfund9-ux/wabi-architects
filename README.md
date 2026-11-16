# WABI Architects — website

[![Publish website](https://github.com/addisfund9-ux/wabi-architects/actions/workflows/publish.yml/badge.svg)](https://github.com/addisfund9-ux/wabi-architects/actions/workflows/publish.yml)
[![Website health](https://github.com/addisfund9-ux/wabi-architects/actions/workflows/health.yml/badge.svg)](https://github.com/addisfund9-ux/wabi-architects/actions/workflows/health.yml)

**Live preview:** https://addisfund9-ux.github.io/wabi-architects/

This repository *is* the website. Whatever is on the `main` branch is what visitors see —
GitHub publishes it automatically a minute or two after every change.

---

## Is the site OK? — the two badges above

| Badge | What it means |
|---|---|
| **Publish website** — green | The last change passed the checks and is online. Red means the change was **blocked** and the site is still showing the previous good version. Click the badge to see why. |
| **Website health** — green | The live site was checked within the last 30 minutes: every page answers, the files online are exactly the files in this repo, the HTTPS certificate is valid. |

When the health check finds a problem it opens an issue called **🔴 Website health alert**
(everyone who *watches* this repo gets an email) and closes it by itself when the site recovers.
To get those emails: click **Watch → All activity** at the top of this page.

## Adding a new project

1. **Pictures** — go to `assets/img/projects/`, click **Add file → Upload files** and drag in a
   folder named after the project in lowercase with dashes, e.g. `bole-apartment`, holding
   `01.jpg`, `02.jpg`, … (`01` is the cover). Landscape JPGs around 1920 px wide are ideal.
   Drawings go in the same folder as `drawing-01.jpg`, `drawing-02.jpg`, …
2. **Details** — open `assets/js/projects-data.js`, click the ✏️ pencil, copy the
   **TEMPLATE** block at the top of the file to the top of the list and fill it in.
3. Click **Commit changes**. The project appears on the Projects page, on the homepage list and
   (if it includes finishing work) on the Finishing page.

If you make a typo — a missing picture, a broken line in the project list — the pre-flight check
stops the publish and the **Publish website** badge turns red with a plain-English reason.
Fix it and commit again.

## What protects the site

- **No server to hack.** It is plain files served by GitHub — no database, no admin login,
  no PHP/WordPress. The attacks that take over servers to mine crypto (such as the
  *WatchDog* cryptojacking campaign, which hunts for exposed Docker and Redis servers)
  have nothing to break into here.
- **Only our own code can run.** Every page carries a strict security policy: no scripts from
  other websites, no hidden inline code, no background workers. Even if someone managed to
  inject a crypto-miner, the browser would refuse to run it.
- **Checks before publishing** (`tools/check_site.py`): blocks unknown file types (`.php`, `.exe` …),
  outside scripts, inline code, known miner code, a weakened security policy, broken links and
  missing pictures.
- **Checks after publishing** (`tools/check_live.py`, every 30 minutes): compares what is online
  byte-for-byte with this repo, so any tampering raises an alert.
- **Contact form** has an invisible bot trap; messages that fill it are thrown away.
- **Workflows** run with the least permissions, use GitHub's own actions pinned to exact
  versions, and Dependabot keeps them updated. Pull requests from outside cannot publish anything.

## Rules for everyone with access

1. Turn on **two-factor authentication** on your GitHub account (Settings → Password and authentication).
   An account without it is the easiest way in.
2. Never put passwords, bank details or private documents in this repo — it is public.
3. Don't change `tools/` or `.github/` — those are the safety checks.
4. Keep design source files (`.psd`, `.ai`, `.rar`) out; only web-ready pictures.

## Going live on our own domain

1. Buy the domain (e.g. `wabiarchitects.com`).
2. **Settings → Pages → Custom domain**: enter it, then add the DNS records GitHub shows at the
   domain registrar. Tick **Enforce HTTPS** once it's offered.
3. **Settings → Secrets and variables → Actions → Variables**: add `SITE_LIVE` = `true`.
   This lets Google list the site and creates the sitemap (until then the preview is hidden from search engines).
4. **Actions → Publish website → Run workflow** to republish.

## Preview on your own computer

```
python3 tools/check_site.py          # same checks GitHub runs
python3 -m http.server 8000          # then open http://localhost:8000
```

Contact: Dagi — dagiendalk@proton.me
