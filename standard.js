/* The standard universe's two small live details (standard.css):
   - the nav shows the local time in Bengaluru, and "Open to work";
   - a soft light on each project plate follows the pointer.
   Both are harmless in the other universes (the clock is hidden there). */
const clock = document.getElementById('stdClock');
if (clock) {
  const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false });
  const tick = () => { clock.textContent = `Bengaluru ${fmt.format(new Date())} IST · Open to work`; };
  tick(); setInterval(tick, 20000);
}
const root = document.documentElement;
if (matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.project').forEach((p) => {
    const win = p.querySelector('.window');
    if (!win) return;
    p.addEventListener('pointermove', (e) => {
      if (root.dataset.world !== 'standard') return;
      const r = win.getBoundingClientRect();
      win.style.setProperty('--mx', `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
      win.style.setProperty('--my', `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
    }, { passive: true });
  });
}
