/* ============ EDIT THESE ============ */
const SONG_FILE = "song.mp3";   // put this file next to index.html
const SONG_START_AT = 0;        // seconds, e.g. 35 to skip the intro
const SONG_VOLUME = 0.6;        // 0 to 1
const TAP_TEXT = "Tap to open 🌸";
const MESSAGE = "Sorry, Arshee 🌸";   // fades in after the flowers bloom ("" to hide)
const SUB_MESSAGE = "✨"; // small line under it ("" to hide)
/* ==================================== */

// handwritten font for the message
const font = document.createElement("link");
font.rel = "stylesheet";
font.href = "https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&display=swap";
document.head.appendChild(font);

// styles
const style = document.createElement("style");
style.textContent = `
  .tap-screen {
    position: fixed; inset: 0; z-index: 1000;
    display: flex; align-items: center; justify-content: center;
    background: rgba(0, 0, 0, 0.85);
    color: #a7ffee; font-family: system-ui, sans-serif;
    font-size: 26px; letter-spacing: 1px; cursor: pointer;
    transition: opacity .8s;
  }
  .tap-screen span { animation: tap-pulse 1.6s ease-in-out infinite; }
  .tap-screen.gone { opacity: 0; pointer-events: none; }
  @keyframes tap-pulse { 50% { opacity: .45; transform: scale(.96); } }
  .music-btn {
    position: fixed; top: 16px; right: 16px; z-index: 999;
    width: 46px; height: 46px; border-radius: 50%;
    border: 1px solid #39c6d6; background: rgba(0, 0, 0, .5);
    color: #a7ffee; font-size: 20px; cursor: pointer;
    display: none; align-items: center; justify-content: center;
  }
  .music-btn.show { display: flex; }
  .music-btn.playing { animation: music-spin 4s linear infinite; }
  @keyframes music-spin { to { transform: rotate(360deg); } }

  .fx-back, .fx-front { position: fixed; inset: 0; pointer-events: none; }
  .fx-back { z-index: 0; }
  .fx-front { z-index: 500; }

  .love-msg {
    position: fixed; left: 0; right: 0; top: 4vh; z-index: 400;
    text-align: center; pointer-events: none;
    font-family: "Caveat", cursive;
    opacity: 0; transform: translateY(14px);
    transition: opacity 2s ease, transform 2s ease, color 1.2s ease;
    color: #e9fffb;
    text-shadow: 0 0 18px rgba(107, 240, 255, .75), 0 0 40px rgba(107, 240, 255, .35);
  }
  .love-msg.show { opacity: 1; transform: none; }
  .love-msg .big { font-size: clamp(38px, 7vw, 68px); font-weight: 700; display: block;
    animation: msg-float 5s ease-in-out infinite; }
  .love-msg .small { font-size: clamp(18px, 3vw, 24px); opacity: .7; }
  @keyframes msg-float { 50% { transform: translateY(-6px); } }
  html.light .love-msg {
    color: #d6457a;
    text-shadow: 0 0 16px rgba(255, 179, 199, .9), 0 2px 0 rgba(255, 255, 255, .8);
  }
`;
document.head.appendChild(style);

// audio + music button
const bgm = new Audio(SONG_FILE);
bgm.loop = true;
bgm.volume = SONG_VOLUME;

const musicBtn = document.createElement("button");
musicBtn.className = "music-btn";
musicBtn.setAttribute("aria-label", "Toggle music");
musicBtn.textContent = "🎵";
musicBtn.addEventListener("click", () => {
  if (bgm.paused) { bgm.play(); musicBtn.classList.add("playing"); musicBtn.textContent = "🎵"; }
  else { bgm.pause(); musicBtn.classList.remove("playing"); musicBtn.textContent = "🔇"; }
});

// message
const msg = document.createElement("div");
msg.className = "love-msg";
msg.innerHTML =
  (MESSAGE ? `<span class="big">${MESSAGE}</span>` : "") +
  (SUB_MESSAGE ? `<span class="small">${SUB_MESSAGE}</span>` : "");

// tap screen: her tap starts the flowers, the music and the effects
const tap = document.createElement("div");
tap.className = "tap-screen";
tap.innerHTML = `<span>${TAP_TEXT}</span>`;

let started = false;
function start() {
  if (started) return;
  started = true;
  tap.classList.add("gone");
  setTimeout(() => tap.remove(), 900);

  try { bgm.currentTime = SONG_START_AT; } catch (e) {}
  bgm.play()
    .then(() => musicBtn.classList.add("show", "playing"))
    .catch(() => {}); // no song file → flowers still bloom

  setTimeout(() => document.body.classList.remove("not-loaded"), 400);
  setTimeout(() => msg.classList.add("show"), 6500);
  setTimeout(() => { petalsOn = true; }, 2500);
}
tap.addEventListener("click", start);
tap.addEventListener("touchstart", start, { passive: true });

/* ================= effects ================= */
const back = document.createElement("canvas");
const front = document.createElement("canvas");
back.className = "fx-back";
front.className = "fx-front";
const bctx = back.getContext("2d");
const fctx = front.getContext("2d");
let W = 0, H = 0, DPR = 1;

function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = innerWidth; H = innerHeight;
  for (const c of [back, front]) {
    c.width = W * DPR; c.height = H * DPR;
    c.getContext("2d").setTransform(DPR, 0, 0, DPR, 0, 0);
  }
}
addEventListener("resize", resize);

const rand = (a, b) => a + Math.random() * (b - a);
const isLight = () => document.documentElement.classList.contains("light");
let day = 0;              // 0 = night, 1 = day (eased so effects fade with the theme)
let petalsOn = false;

// twinkling stars
const stars = Array.from({ length: 140 }, () => ({
  x: Math.random(), y: Math.random() * 0.75,
  r: rand(0.4, 1.6), sp: rand(0.6, 2.2), ph: rand(0, 6.28),
}));

// fireflies
const flies = Array.from({ length: 22 }, () => ({
  x: rand(0, 1), y: rand(0.3, 0.95), a: rand(0, 6.28),
  sp: rand(0.0004, 0.0012), ph: rand(0, 6.28), r: rand(1.5, 3),
  c: Math.random() < 0.5 ? "255, 240, 120" : "120, 245, 255",
}));

// falling petals
const petals = Array.from({ length: 26 }, () => newPetal(true));
function newPetal(anywhere) {
  return {
    x: rand(-0.1, 1.1), y: anywhere ? rand(-1, 1) : rand(-0.15, -0.05),
    s: rand(5, 11), vy: rand(0.0006, 0.0014), sw: rand(0.6, 1.6),
    ph: rand(0, 6.28), rot: rand(0, 6.28), vr: rand(-0.03, 0.03),
  };
}

// shooting stars
let shoot = null, nextShoot = performance.now() + 3000;

// butterflies (day)
const butterflies = Array.from({ length: 3 }, (_, i) => ({
  ph: rand(0, 6.28), sp: rand(0.00012, 0.0002), yb: 0.25 + i * 0.15, s: rand(22, 30), dir: i % 2 ? 1 : -1,
}));

// tap hearts
const hearts = [];
addEventListener("pointerdown", (e) => {
  if (!started) return;
  for (let i = 0; i < 8; i++) {
    const a = rand(0, 6.28), v = rand(1, 3.2);
    hearts.push({
      x: e.clientX, y: e.clientY, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1.5,
      life: 1, s: rand(12, 20), ch: Math.random() < 0.6 ? "💗" : (isLight() ? "🌸" : "✨"),
    });
  }
});

function drawPetal(ctx, p, alpha) {
  ctx.save();
  ctx.translate(p.x * W, p.y * H);
  ctx.rotate(p.rot);
  ctx.globalAlpha = alpha;
  const g = ctx.createLinearGradient(0, -p.s, 0, p.s);
  const top = mix([167, 255, 238], [255, 182, 203], day);
  const bot = mix([57, 198, 214], [255, 128, 170], day);
  g.addColorStop(0, `rgb(${top})`);
  g.addColorStop(1, `rgb(${bot})`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, 0, p.s * 0.55, p.s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(",");

let last = performance.now();
function frame(now) {
  const dt = Math.min(now - last, 50); last = now;
  day += ((isLight() ? 1 : 0) - day) * Math.min(dt / 400, 1);
  const night = 1 - day;
  const t = now / 1000;

  bctx.clearRect(0, 0, W, H);
  fctx.clearRect(0, 0, W, H);

  // stars
  if (night > 0.01) {
    for (const s of stars) {
      const tw = 0.25 + 0.75 * Math.abs(Math.sin(t * s.sp + s.ph));
      bctx.globalAlpha = tw * night;
      bctx.fillStyle = "#dffcff";
      bctx.beginPath(); bctx.arc(s.x * W, s.y * H, s.r, 0, 6.28); bctx.fill();
    }
    bctx.globalAlpha = 1;
  }

  // shooting star
  if (!shoot && now > nextShoot && night > 0.5) {
    shoot = { x: rand(0.1, 0.7) * W, y: rand(0.02, 0.25) * H, vx: rand(9, 13), vy: rand(3, 5), life: 1 };
  }
  if (shoot) {
    shoot.x += shoot.vx * dt / 16; shoot.y += shoot.vy * dt / 16; shoot.life -= dt / 900;
    const g = bctx.createLinearGradient(shoot.x, shoot.y, shoot.x - shoot.vx * 14, shoot.y - shoot.vy * 14);
    g.addColorStop(0, `rgba(255,255,255,${Math.max(shoot.life, 0) * night})`);
    g.addColorStop(1, "rgba(255,255,255,0)");
    bctx.strokeStyle = g; bctx.lineWidth = 2; bctx.lineCap = "round";
    bctx.beginPath(); bctx.moveTo(shoot.x, shoot.y);
    bctx.lineTo(shoot.x - shoot.vx * 14, shoot.y - shoot.vy * 14); bctx.stroke();
    if (shoot.life <= 0) { shoot = null; nextShoot = now + rand(4000, 9000); }
  }

  // fireflies (softer in daytime)
  for (const f of flies) {
    f.a += Math.sin(t * 0.7 + f.ph) * 0.03;
    f.x += Math.cos(f.a) * f.sp * dt; f.y += Math.sin(f.a) * f.sp * dt;
    if (f.x < -0.05) f.x = 1.05; if (f.x > 1.05) f.x = -0.05;
    if (f.y < 0.2) f.a = Math.abs(f.a); if (f.y > 0.98) f.a = -Math.abs(f.a);
    const glow = (0.35 + 0.65 * Math.abs(Math.sin(t * 1.5 + f.ph))) * (night * 0.9 + 0.15);
    const x = f.x * W, y = f.y * H, R = f.r * 6;
    const g = fctx.createRadialGradient(x, y, 0, x, y, R);
    const c = day > 0.5 ? "255, 160, 190" : f.c;
    g.addColorStop(0, `rgba(${c},${glow})`);
    g.addColorStop(1, `rgba(${c},0)`);
    fctx.fillStyle = g;
    fctx.beginPath(); fctx.arc(x, y, R, 0, 6.28); fctx.fill();
  }

  // petals
  if (petalsOn) {
    for (let i = 0; i < petals.length; i++) {
      const p = petals[i];
      p.y += p.vy * dt / 16 * 1.2;
      p.x += Math.sin(t * p.sw + p.ph) * 0.0006 * dt / 16;
      p.rot += p.vr * dt / 16;
      if (p.y > 1.1) petals[i] = newPetal(false);
      if (p.y > -0.1) drawPetal(fctx, p, 0.55 + day * 0.25);
    }
  }

  // butterflies
  if (day > 0.02) {
    fctx.font = "26px serif";
    fctx.textAlign = "center"; fctx.textBaseline = "middle";
    for (const b of butterflies) {
      const k = now * b.sp + b.ph;
      const x = W * (0.5 + 0.42 * Math.sin(k) * b.dir);
      const y = H * (b.yb + 0.08 * Math.sin(k * 2.3));
      const flap = 0.35 + 0.65 * Math.abs(Math.sin(now / 90 + b.ph));
      fctx.save();
      fctx.globalAlpha = day;
      fctx.translate(x, y);
      fctx.scale(flap * (Math.cos(k) * b.dir > 0 ? 1 : -1), 1);
      fctx.font = `${b.s}px serif`;
      fctx.fillText("🦋", 0, 0);
      fctx.restore();
    }
  }

  // tap hearts
  fctx.textAlign = "center"; fctx.textBaseline = "middle";
  for (let i = hearts.length - 1; i >= 0; i--) {
    const h = hearts[i];
    h.x += h.vx * dt / 16; h.y += h.vy * dt / 16; h.vy -= 0.02 * dt / 16;
    h.life -= dt / 1400;
    if (h.life <= 0) { hearts.splice(i, 1); continue; }
    fctx.globalAlpha = h.life;
    fctx.font = `${h.s * (0.6 + h.life * 0.4)}px serif`;
    fctx.fillText(h.ch, h.x, h.y);
  }
  fctx.globalAlpha = 1;

  requestAnimationFrame(frame);
}

// add everything to the page (script sits at the end, so body exists)
resize();
const flowersEl = document.querySelector(".flowers");
document.body.insertBefore(back, flowersEl);   // stars behind the flowers
document.body.appendChild(front);              // petals, fireflies, hearts in front
document.body.appendChild(msg);
document.body.appendChild(tap);
document.body.appendChild(musicBtn);
requestAnimationFrame(frame);
