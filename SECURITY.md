# Security

This is a static website (HTML, CSS, JavaScript and pictures) published by GitHub Pages.
There is no server-side code, database or login.

**Found a problem?** Please don't open a public issue. Use **Security → Report a vulnerability**
on this repository, or email dagiendalk@proton.me. We aim to reply within a few days.

What is in place:
- A strict Content-Security-Policy on every page (only our own scripts; no inline code, workers, frames or plugins).
- An automatic pre-publish check (`tools/check_site.py`) and a live integrity check every 30 minutes (`tools/check_live.py`).
- Least-privilege GitHub Actions pinned to commit SHAs, kept current by Dependabot.
