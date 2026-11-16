/* mark JS available + failsafe so content can never stay hidden */
document.documentElement.classList.add('js');
window.__revealTimer = setTimeout(function () { document.documentElement.classList.add('reveal-all'); }, 2600);
