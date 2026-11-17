/* theme: saved choice, else system preference */
const root = document.documentElement, tb = document.getElementById('themeBtn');
const sys = () => matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light';
let theme; try { theme = localStorage.getItem('theme'); } catch(e){}
function setTheme(t){
  theme = t; root.dataset.theme = t;
  tb.textContent = t === 'dark' ? '☀ Light' : '☾ Dark';
  try { localStorage.setItem('theme', t); } catch(e){}
}
setTheme(theme || sys());
tb.onclick = () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');

/* scroll reveal */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }), {threshold:.15});
document.querySelectorAll('.rv').forEach(el => io.observe(el));

/* Spider-Verse polish + easter eggs */
const reduced = matchMedia('(prefers-reduced-motion:reduce)').matches;
const toast = document.getElementById('toast');
function say(t, ms = 3500){ toast.textContent = t; toast.classList.add('on'); setTimeout(() => toast.classList.remove('on'), ms); }

// page-turn wipe between sections
const FULL = 'polygon(0 0,100% 0,100% 100%,0 100%)', WIPE = document.getElementById('wipe');
document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', async e => {
  const t = document.querySelector(a.getAttribute('href'));
  if (!t || reduced) return;
  e.preventDefault();
  const o = {duration:380, easing:'cubic-bezier(.7,0,.3,1)', fill:'forwards'};
  await WIPE.animate([{clipPath:'polygon(0 0,0 0,0 100%,0 100%)'},{clipPath:FULL}], o).finished;
  t.scrollIntoView({behavior:'instant'});
  await WIPE.animate([{clipPath:FULL},{clipPath:'polygon(100% 0,100% 0,100% 100%,100% 100%)'}], o).finished;
  WIPE.getAnimations().forEach(x => x.cancel());
}));

// comic sound effects on click
const SFX = ['THWIP!','POW!','BAM!','ZAP!','WHAM!','KRAK!'];
addEventListener('click', e => {
  if (reduced) return;
  const s = document.createElement('span');
  s.className = 'pop'; s.textContent = SFX[Math.random()*SFX.length|0];
  s.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;--r:${(Math.random()*30-15)|0}deg`;
  document.body.append(s); setTimeout(() => s.remove(), 700);
});

// 3D tilt on panels, scroll progress bar
document.querySelectorAll('.panel').forEach(p => {
  if (reduced) return;
  p.addEventListener('pointermove', e => {
    const b = p.getBoundingClientRect();
    p.style.setProperty('--ry', ((e.clientX-b.left)/b.width - .5)*14 + 'deg');
    p.style.setProperty('--rx', (.5 - (e.clientY-b.top)/b.height)*14 + 'deg');
  });
  p.addEventListener('pointerleave', () => { p.style.removeProperty('--rx'); p.style.removeProperty('--ry'); });
});
const bar = document.getElementById('bar');
addEventListener('scroll', () => {
  bar.style.transform = `scaleX(${scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)})`;
}, {passive:true});

// confetti when the trophy room scrolls into view
function confetti(){
  if (reduced) return;
  for (let i = 0; i < 48; i++){
    const c = document.createElement('i'); c.className = 'cf';
    c.style.cssText = `left:${Math.random()*100}vw;background:${['#e62429','#ffd400','#00d8ff','#ff2a9d','#1e4bff'][i%5]}`;
    document.body.append(c);
    c.animate([{transform:'translateY(-10vh) rotate(0)'},{transform:`translateY(110vh) rotate(${Math.random()*900|0}deg)`}],
      {duration:1800+Math.random()*1800, easing:'linear', delay:Math.random()*600, fill:'backwards'}).finished.then(() => c.remove());
  }
}
new IntersectionObserver((es, o) => { if (es[0].isIntersecting){ confetti(); o.disconnect(); } }, {threshold:.4}).observe(document.getElementById('wins'));

// egg 1: Konami code → Sandevistan overdrive
const KONAMI = 'ArrowUp,ArrowUp,ArrowDown,ArrowDown,ArrowLeft,ArrowRight,ArrowLeft,ArrowRight,b,a'.split(',');
let ki = 0;
addEventListener('keydown', e => {
  ki = e.key.toLowerCase() === KONAMI[ki].toLowerCase() ? ki + 1 : (e.key === KONAMI[0] ? 1 : 0);
  if (ki < KONAMI.length) return;
  ki = 0; dispatchEvent(new Event('overdrive'));
  root.classList.add('anomaly'); say('⚠ ANOMALY DETECTED: SANDEVISTAN OVERDRIVE', 8000);
  setTimeout(() => root.classList.remove('anomaly'), 8000);
});

// egg 2: click the logo 5 times → a rocket lands
let lc = 0, lt;
document.querySelector('.logo').addEventListener('click', () => {
  clearTimeout(lt); lt = setTimeout(() => lc = 0, 1500);
  if (++lc < 5 || reduced) return;
  lc = 0;
  const r = Object.assign(document.createElement('div'), {id:'rocket', textContent:'🚀'});
  document.body.append(r);
  r.animate([{translate:'0 -110vh'},{translate:'0 0'}], {duration:2200, easing:'cubic-bezier(.15,.85,.3,1)'})
    .finished.then(() => { say('THE EAGLE HAS LANDED 🚀', 2500); setTimeout(() => r.remove(), 2800); });
});

// egg 3: for the people who open DevTools
console.log('%cTHWIP! You found the console.', 'font:700 22px Impact;color:#ffd400;background:#e62429;padding:6px 12px');
console.log('Try the Konami code. Or click the logo 5 times.');

/* Sandevistan: lagging, colour-split afterimages of the cursor */
(() => {
  if (matchMedia('(hover:none)').matches || matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  const cv = document.getElementById('sandy'), ctx = cv.getContext('2d');
  const COLORS = ['#ff2a6d','#fcee0a','#00f0ff'];   // red → yellow → cyan, like the cyberware glow
  let GHOSTS = 14; const STEP = 2;                  // 14 afterimages, 2 frames apart
  let hist = [];
  addEventListener('overdrive', () => { GHOSTS = 32; setTimeout(() => GHOSTS = 14, 8000); });
  const fit = () => { cv.width = innerWidth; cv.height = innerHeight; };
  fit(); addEventListener('resize', fit);
  let moved = false;
  addEventListener('mousemove', e => { hist.push({x:e.clientX, y:e.clientY}); moved = true; });
  function arrow(x, y){
    ctx.beginPath();
    ctx.moveTo(x,y); ctx.lineTo(x,y+17); ctx.lineTo(x+4.5,y+13); ctx.lineTo(x+8,y+20);
    ctx.lineTo(x+10.5,y+19); ctx.lineTo(x+7,y+12); ctx.lineTo(x+13,y+12); ctx.closePath(); ctx.fill();
  }
  (function frame(){
    ctx.clearRect(0,0,cv.width,cv.height);
    // when the mouse stops, the trail drains instead of freezing
    if (!moved) hist.shift();
    moved = false;
    if (hist.length > GHOSTS*STEP + 1) hist.splice(0, hist.length - (GHOSTS*STEP + 1));
    if (hist.length > 1){
      ctx.globalCompositeOperation = 'lighter';
      for (let i = GHOSTS; i >= 1; i--){
        const p = hist[hist.length - 1 - i*STEP]; if (!p) continue;
        const a = 1 - i/(GHOSTS+1), j = (i % 3 - 1) * 2;   // small horizontal glitch
        ctx.fillStyle = COLORS[i % 3]; ctx.globalAlpha = a * .55;
        arrow(p.x + j, p.y);
      }
      // speed streak from oldest ghost to the cursor
      const o = hist[0], n = hist[hist.length-1];
      ctx.globalAlpha = .35; ctx.strokeStyle = COLORS[2]; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(o.x+3,o.y+3); ctx.lineTo(n.x+3,n.y+3); ctx.stroke();
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    }
    requestAnimationFrame(frame);
  })();
})();

// drop the intro cover from the DOM once it has played (also avoids a stuck overlay in Safari)
const cover = document.getElementById('cover');
cover.addEventListener('animationend', () => cover.remove());
setTimeout(() => cover.remove(), 3000);
