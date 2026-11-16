"""Shared settings for the WABI website checks and build."""
PAGES = ['index.html', 'about.html', 'services.html', 'contact.html', 'projects.html',
         'finishing.html', 'finishing-proposal.html', '404.html']

# The script policy every page must carry. Only the site's own files may run code;
# no outside scripts, no inline code, no background workers (what crypto-miners use).
CSP = ("default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
       "font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; media-src 'self'; "
       "connect-src https://formsubmit.co; form-action 'self' https://formsubmit.co; "
       "frame-src 'none'; worker-src 'none'; object-src 'none'; base-uri 'self'; upgrade-insecure-requests")

# Only these kinds of files may be published.
ALLOWED_EXT = {'.html', '.css', '.js', '.jpg', '.jpeg', '.png', '.webp', '.svg', '.ico', '.mp4', '.txt', '.xml', '.webmanifest'}
NOT_PUBLISHED = {'.github', 'tools', '.git', '_site', 'README.md', 'SECURITY.md', '.gitignore', 'CODEOWNERS'}

# Tell-tale signs of browser crypto-miners or obfuscated injected code.
BLOCKED_JS = [r'coinhive', r'cryptoloot', r'crypto-loot', r'coinimp', r'webminepool', r'deepminer', r'jsecoin',
              r'cryptonight', r'monero', r'\bxmr\b', r'stratum\+tcp', r'minero\.cc', r'\beval\s*\(', r'new\s+Function\s*\(',
              r'WebAssembly', r'\batob\s*\(', r'fromCharCode\((?:\s*\d+\s*,){8,}']

OLD_DOMAIN = 'https://wabiarchitects.unaux.com'
