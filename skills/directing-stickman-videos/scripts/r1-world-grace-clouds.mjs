// R1 · grace-remains ep9 "The Clouds": the gray cloud over a head (one per worry, a puff each), a mass of 300 over Mr. Hale's porch
// that releases into stars, rain that falls only where the cloud is, an umbrella, Hale's street (gray / sun / night / morning),
// a clock tower, a busy road, and the small things the story carries. Registered into SETS/PROPS on import.
import {Path2D} from '@napi-rs/canvas';
import {INK, mix, dark, light} from './r1-rig.mjs';
import {SETS, PROPS} from './r1-world.mjs';
import {fs, rr, el, poly, hashN, glow, cobbles, olive, sky, windowPane, cottage, lamp, easeOutBack, SKY, SHADE, WARM} from './r1-world-grace.mjs';

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const eio = x => { x = clamp(x); return x * x * (3 - 2 * x); };
export const CLOUD = {body: '#a8aab1', belly: '#868891', hi: '#cfd1d6', mass: '#b4b6bc', massBelly: '#92949d'};

// ---- one gray cloud. origin = centre of the body; r = scale (width ≈ 2.9 r). k 0..1 = the puff (overshoot + ring + crumbs)
const LUMPS = [[-0.95, 0.05, 0.5], [-0.45, -0.25, 0.62], [0.15, -0.4, 0.72], [0.75, -0.15, 0.58], [1.05, 0.1, 0.45], [0.1, 0.1, 0.62]];
function cloudPath(r) { const p = new Path2D(); for (const [x, y, q] of LUMPS) { p.moveTo(x * r + q * r, y * r); p.arc(x * r, y * r, q * r, 0, Math.PI * 2); } return p; }
export function drawCloud(ctx, x, y, r, {k = 1, body = CLOUD.body, belly = CLOUD.belly, seed = 0, tag = null, alpha = 1, lw} = {}) {
  if (k <= 0 || alpha <= 0) return;
  const sc = Math.max(0.001, easeOutBack(k)), w = lw ?? Math.max(3, r * 0.07);
  ctx.save(); ctx.translate(x, y); ctx.globalAlpha *= alpha;
  if (k < 1) { // the pop: a ring, a flash and crumbs of cloud flying out
    ctx.strokeStyle = `rgba(255,248,226,${0.9 * (1 - k)})`; ctx.lineWidth = 7 * (1 - k) + 1.5; ctx.beginPath(); ctx.ellipse(0, 0, r * (1.1 + 1.6 * k), r * (0.7 + 1.0 * k), 0, 0, 7); ctx.stroke();
    ctx.fillStyle = `rgba(210,212,218,${1 - k})`; for (let i = 0; i < 7; i++) { const a = i * 0.9 + seed, d = r * (1.2 + 1.5 * k); ctx.beginPath(); ctx.arc(Math.cos(a) * d, Math.sin(a) * d * 0.7, r * 0.1 * (1 - k) + 2, 0, 7); ctx.fill(); }
  }
  ctx.scale(sc, sc * (0.92 + 0.08 * sc));
  const P = cloudPath(r); ctx.lineJoin = 'round';
  ctx.strokeStyle = INK; ctx.lineWidth = w * 2; ctx.stroke(P);
  ctx.fillStyle = body; ctx.fill(P);
  ctx.save(); ctx.clip(P); ctx.fillStyle = belly; ctx.fillRect(-2 * r, r * 0.12, 4 * r, r); ctx.fillStyle = CLOUD.hi; ctx.beginPath(); ctx.ellipse(-0.25 * r, -0.62 * r, 0.42 * r, 0.12 * r, -0.25, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(0.62 * r, -0.3 * r, 0.2 * r, 0.07 * r, -0.2, 0, 7); ctx.fill(); ctx.restore();
  ctx.lineWidth = w; ctx.strokeStyle = 'rgba(42,33,30,.55)'; ctx.beginPath(); ctx.moveTo(-0.55 * r, 0.12 * r); ctx.quadraticCurveTo(-0.1 * r, 0.3 * r, 0.5 * r, 0.1 * r); ctx.stroke();
  if (tag) drawTag(ctx, 0, r * 0.1, r * 0.5, tag);
  ctx.restore();
}
// a luggage-tag name stuck on a cloud (the name is the worry's owner)
function drawTag(ctx, x, y, s, text) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.07);
  ctx.font = `${Math.round(s * 0.62)}px GraceCaption`; const w = ctx.measureText(text).width + s * 0.5, h = s * 0.8;
  fs(ctx, rr(-w / 2, -h / 2, w, h, h * 0.22), '#fff4dc', Math.max(3, s * 0.06)); ctx.fillStyle = INK; ctx.fill(el(-w / 2 + h * 0.3, 0, h * 0.07, h * 0.07)); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#3a2412'; ctx.fillText(text, h * 0.12, h * 0.04); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.restore();
}

// ---- the clouds over ONE head: n (fractional: the last one is puffing in). origin = just above the head. baby = a tiny cloud born on top of the first
const SLOTS = [[0, -0.85], [-1.55, -1.25], [1.6, -1.15], [-0.05, -2.0], [-1.0, -2.55], [1.1, -2.45]];
function cloudsOver(ctx, {n = 1, r = 82, seed = 1, t = 0, baby = 0, baby2 = 0} = {}) {
  const whole = Math.floor(n + 1e-6), frac = n - whole, bob = Math.sin(t * 1.7 + seed) * 4;
  ctx.save(); ctx.translate(0, bob);
  for (let i = Math.min(SLOTS.length, Math.ceil(n - 1e-6)) - 1; i >= 0; i--) { const [sx, sy] = SLOTS[i]; drawCloud(ctx, sx * r, sy * r + Math.sin(t * 1.3 + i * 2 + seed) * 3, r * (i ? 0.86 : 1), {k: i < whole ? 1 : frac, seed: i + seed}); }
  if (baby > 0) drawCloud(ctx, (SLOTS[0][0] + 0.2) * r, SLOTS[0][1] * r - r * 0.78, r * 0.4, {k: baby, seed: seed + 9, body: '#adafb6'});
  if (baby2 > 0) drawCloud(ctx, (SLOTS[0][0] + 0.32) * r, SLOTS[0][1] * r - r * 1.32, r * 0.2, {k: baby2, seed: seed + 11, body: '#b4b6bc', lw: 2.5});
  ctx.restore();
}

// ---- the 300: a mass of clouds. origin = centre of the mass. n = how many are left (with `fn` = n(t), released ones lift off and
// settle into the sky as stars that stay). tags = {index: 'NAME'} on the front-row (hero) clouds
const HERO = [[-230, 190, 150, 30], [10, 250, 165, 18], [250, 180, 150, 42], [-120, 60, 135, 54], [140, 50, 135, 66]]; // x, y, r, threshold (it lifts off when n falls below it)
function cloudMass(ctx, {t = 0, n = 300, total = 300, w = 1100, h = 440, lumps = 64, seed = 3, fn = null, tags = {}, belly = 1, star = true, starX = 1500, starY0 = -430, starH = 500} = {}) {
  const L = [];
  for (let i = 0; i < lumps; i++) { const a = i * 2.39996 + seed, q = Math.sqrt((i + 0.5) / lumps); L.push({i, x: Math.cos(a) * q * w / 2, y: Math.sin(a) * q * h / 2 * 0.8, r: (70 + hashN(i * 1.7 + seed) * 60) * 1.35, rank: hashN(i * 5.3 + seed * 2), hero: -1}); }
  [...L].sort((a, b) => a.rank - b.rank).forEach((l, k) => { l.th = (k + 1) / lumps * total * 0.82 + total * 0.18; });
  HERO.forEach(([x, y, r, th], i) => L.push({i: 100 + i, x, y, r, th, hero: i}));
  const cnt = fn ? fn(t) : n;
  const rel = l => { // when did l lift off? (binary search on the monotone count)
    if (!fn || cnt >= l.th - 1e-6) return Infinity; let a = 0, b = t; for (let q = 0; q < 16; q++) { const m = (a + b) / 2; if (fn(m) >= l.th - 1e-6) a = m; else b = m; } return b; };
  L.sort((a, b) => (a.hero >= 0) - (b.hero >= 0) || a.y - b.y);
  const dying = [];
  for (const l of L) {
    const tr = rel(l); if (tr !== Infinity) { dying.push([l, tr]); continue; }
    if (!fn && cnt < l.th) continue;
    const shade = clamp((l.y + h / 2) / h);
    if (l.hero >= 0) drawCloud(ctx, l.x, l.y, l.r, {body: l.hero % 2 ? '#8f9199' : '#999ba2', belly: CLOUD.massBelly, seed: l.i, tag: tags[l.hero] || null, lw: 5});
    else drawCloud(ctx, l.x, l.y, l.r, {body: mix(CLOUD.mass, CLOUD.massBelly, shade * 0.55 * belly), belly: CLOUD.massBelly, seed: l.i, lw: 4});
  }
  for (const [l, tr] of dying) { // the released: lift off, shrink, turn into a star that stays
    const age = t - tr, k = clamp(age / 1.5), sx = (hashN(l.i * 3.3 + seed) - 0.5) * starX, sy = starY0 + hashN(l.i * 7.7 + seed) * starH;
    const e = eio(k), x = l.x + (sx - l.x) * e + Math.sin(age * 4 + l.i) * 22 * (1 - e), y = l.y + (sy - l.y) * e - Math.sin(Math.min(1, age) * Math.PI) * 70;
    const r = l.r * (1 - 0.72 * e), a = clamp(1.7 - k * 1.8);
    if (a > 0) drawCloud(ctx, x, y, r, {alpha: a, body: CLOUD.mass, belly: CLOUD.massBelly, seed: l.i, lw: 3});
    if (star && k > 0.5) { ctx.save(); ctx.translate(x, y); PROPS.starG(ctx, {k: 1, r: 14 + hashN(l.i) * 14, t: age + l.i, halo: 0.9 * clamp((k - 0.5) / 0.3)}); ctx.restore(); }
  }
}
// a few clouds over a head lifting off one by one and becoming stars (night: "I give them to God"). slots = which cloud slot leaves at each step
function cloudsRise(ctx, {t = 0, t0 = [0], slots = [0], dur = 1.9, y1 = -700, x1 = 0, r = 62} = {}) {
  t0.forEach((tt, i) => {
    const age = t - tt; if (age < 0 || age > dur + 3) return;
    const [sx0, sy0] = SLOTS[slots[i]], sx = sx0 * r, sy = sy0 * r, k = clamp(age / dur), e = eio(k);
    const x = sx + (x1 + (i - 1) * 40 - sx) * e + Math.sin(age * 3 + i) * 24 * (1 - e * 0.5), y = sy + (y1 - sy) * e - 30 * Math.sin(Math.min(1, age * 1.2) * Math.PI), a = clamp(1.8 - k * 1.7);
    if (a > 0) drawCloud(ctx, x, y, r * (i ? 0.86 : 1) * (1 - 0.5 * e), {alpha: a, seed: i});
    if (k > 0.55) { ctx.save(); ctx.translate(x, y); PROPS.starG(ctx, {k: clamp((k - 0.55) * 4), r: 20 + i * 3, t: age + i, halo: 1}); ctx.restore(); }
  });
}

// ---- rain: streaks inside a column w × h (origin = top centre) with splashes at the bottom. only where the cloud is
function rainG(ctx, {t = 0, w = 300, h = 600, n = 0, fall = 1500, a = 0.8, slant = 12, splash = true, seed = 1} = {}) {
  const N = n || Math.round(w / 11);
  ctx.save(); ctx.lineCap = 'round';
  for (let i = 0; i < N; i++) {
    const x = (hashN(i * 1.3 + seed) - 0.5) * w, ph = hashN(i * 2.9 + seed), sp = fall * (0.8 + 0.4 * hashN(i + seed * 3)), cyc = (h + 90) / sp, q = ((t / cyc + ph) % 1), y = q * (h + 90) - 60;
    ctx.strokeStyle = `rgba(214,228,246,${a})`; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - slant * 0.4, y + 56); ctx.stroke();
  }
  if (splash) for (let i = 0; i < Math.round(N / 3); i++) {
    const x = (hashN(i * 4.1 + seed) - 0.5) * w, q = ((t * 3.2 + hashN(i + seed * 7)) % 1);
    ctx.strokeStyle = `rgba(214,228,246,${0.8 * (1 - q)})`; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.ellipse(x, h + 4, 8 + q * 26, 3 + q * 8, 0, 0, 7); ctx.stroke();
  }
  ctx.restore();
}

// ---- an umbrella held by the hand at the origin: shaft up h, canopy radius r. open 0..1 (0 = furled)
function umbrellaG(ctx, {open = 1, h = 250, r = 190, color = '#7a2e2e', lean = 0, down = 0} = {}) {
  ctx.save(); ctx.lineCap = 'round'; const ang = Math.atan2(lean, h); ctx.rotate(ang + Math.PI * eio(down)); h = Math.hypot(h, lean); ctx.translate(0, 0);
  ctx.strokeStyle = INK; ctx.lineWidth = 15; ctx.beginPath(); ctx.moveTo(0, 36); ctx.lineTo(0, -h); ctx.stroke();
  ctx.strokeStyle = '#8a5a36'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(0, 36); ctx.lineTo(0, -h); ctx.stroke();
  ctx.strokeStyle = INK; ctx.lineWidth = 15; ctx.beginPath(); ctx.arc(-14, 38, 14, 0, Math.PI, false); ctx.stroke(); ctx.strokeStyle = '#8a5a36'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(-14, 38, 14, 0, Math.PI, false); ctx.stroke();
  const k = clamp(open);
  if (k < 0.12) { // furled: a long narrow cone along the shaft
    const p = poly([[-17, -h * 0.35], [17, -h * 0.35], [8, -h - 70], [-8, -h - 70]]); fs(ctx, p, color, 5); ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -h * 0.35); ctx.lineTo(0, -h - 66); ctx.stroke();
  } else {
    const R = r * (0.18 + 0.82 * eio(k)), D = R * (0.5 + 0.5 * k), cy = -h;
    const p = new Path2D(); p.moveTo(-R, cy); p.quadraticCurveTo(-R * 1.02, cy - D * 1.35, 0, cy - D * 1.18); p.quadraticCurveTo(R * 1.02, cy - D * 1.35, R, cy);
    for (let i = 3; i >= 0; i--) { const x0 = -R + (2 * R) * (i + 1) / 4, x1 = -R + (2 * R) * i / 4; p.quadraticCurveTo((x0 + x1) / 2, cy + R * 0.13, x1, cy); } p.closePath();
    fs(ctx, p, color, 6);
    ctx.save(); ctx.clip(p); ctx.strokeStyle = 'rgba(30,10,10,.35)'; ctx.lineWidth = 4; for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(0, cy - D * 1.18); ctx.quadraticCurveTo(i * R * 0.33, cy - D * 0.7, i * R * 0.5, cy + 10); ctx.stroke(); }
    ctx.fillStyle = '#a05a3a'; ctx.beginPath(); ctx.ellipse(R * 0.35, cy - D * 0.55, R * 0.14, D * 0.16, 0.3, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(-R * 0.45, cy - D * 0.4, R * 0.1, D * 0.12, -0.2, 0, 7); ctx.fill(); ctx.restore();
    fs(ctx, rr(-6, cy - D * 1.25, 12, 22, 5), '#5a3a22', 4);
  }
  ctx.restore();
}

// ---- small props
function watchG(ctx, {t = 0, fast = 1} = {}) { // a pocket watch held in the hand (origin = the hand)
  ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, -30); ctx.quadraticCurveTo(-40, 10, -20, 60); ctx.stroke();
  fs(ctx, el(0, -6, 38, 38), '#d9a441', 5); fs(ctx, el(0, -6, 29, 29), '#fffaf0', 3);
  ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.lineCap = 'round'; const a = t * 5 * fast, b = t * 0.8 * fast; ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(Math.sin(a) * 23, -6 - Math.cos(a) * 23); ctx.moveTo(0, -6); ctx.lineTo(Math.sin(b) * 15, -6 - Math.cos(b) * 15); ctx.stroke(); fs(ctx, rr(-6, -50, 12, 12, 3), '#b8872a', 3);
}
function clockHands(ctx, {t = 0, speed = 3, r = 70} = {}) {
  ctx.lineCap = 'round'; ctx.strokeStyle = INK; const a = t * speed * 2.4, b = t * speed * 0.2 + 1;
  ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(b) * r * 0.55, -Math.cos(b) * r * 0.55); ctx.stroke();
  ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(a) * r * 0.85, -Math.cos(a) * r * 0.85); ctx.stroke(); fs(ctx, el(0, 0, 9, 9), INK, 0);
}
function boxG(ctx, {w = 120, h = 96, color = '#c48a4a'} = {}) { fs(ctx, rr(-w / 2, -h / 2, w, h, 5), color, 5); ctx.strokeStyle = 'rgba(60,35,15,.5)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-w / 2, -h * 0.18); ctx.lineTo(w / 2, -h * 0.18); ctx.moveTo(0, -h / 2); ctx.lineTo(0, -h * 0.18); ctx.stroke(); fs(ctx, rr(-w * 0.2, -h * 0.5, w * 0.4, h * 0.14, 3), '#e6c88a', 3); }
function wagonG(ctx, {t = 0, roll = 1, load = 3, dir = 1} = {}) {
  ctx.save(); ctx.scale(dir, 1); // pulled by the hand at the origin: handle then a wooden cart with boxes, trailing to the left
  ctx.strokeStyle = INK; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(4, 8); ctx.lineTo(-170, 52); ctx.stroke(); ctx.strokeStyle = '#8a5a36'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(4, 8); ctx.lineTo(-170, 52); ctx.stroke();
  ctx.save(); ctx.translate(-170, 0);
  const boxes = [[-150, -60, 130, 100, '#c48a4a'], [-290, -60, 120, 100, '#b57a3a'], [-215, -158, 124, 96, '#d9a066'], [-340, -150, 90, 80, '#c48a4a']].slice(0, load);
  for (const [x, y, w, h, c] of boxes) { ctx.save(); ctx.translate(x + w / 2, y + h / 2 + 50); boxG(ctx, {w, h, color: c}); ctx.restore(); }
  fs(ctx, rr(-390, 40, 380, 28, 6), '#9a6a3c', 6);
  for (const x of [-320, -80]) { const a = roll ? t * 7 : 0; fs(ctx, el(x, 84, 40, 40), '#6e4426', 6); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x - Math.cos(a) * 36, 84 - Math.sin(a) * 36); ctx.lineTo(x + Math.cos(a) * 36, 84 + Math.sin(a) * 36); ctx.moveTo(x - Math.sin(a) * 36, 84 + Math.cos(a) * 36); ctx.lineTo(x + Math.sin(a) * 36, 84 - Math.cos(a) * 36); ctx.stroke(); }
  ctx.restore(); ctx.restore();
}
function mailboxG(ctx, {open = 1, letters = 0} = {}) { // a post with a mailbox, door hanging open when empty
  fs(ctx, rr(-14, -120, 28, 340, 5), '#6e4426', 5); const b = rr(-90, -250, 180, 130, 20); fs(ctx, b, '#c4643a', 6);
  fs(ctx, rr(-72, -226, 144, 84, 12), '#2a1a16', 4); if (open) { ctx.save(); ctx.translate(90, -140); ctx.rotate(0.9); fs(ctx, rr(-10, -6, 14, 110, 4), '#a8503a', 5); ctx.restore(); }
  if (letters) for (let i = 0; i < letters; i++) { ctx.save(); ctx.translate(-20 + i * 14, -190); ctx.rotate(0.2 * i - 0.1); letterG(ctx, {}); ctx.restore(); }
  fs(ctx, rr(100, -300, 16, 100, 3), '#e2574c', 4); fs(ctx, rr(100, -300, 70, 36, 6), '#e2574c', 4);
}
function letterG(ctx, {color = '#fffdf6'} = {}) { fs(ctx, rr(-34, -22, 68, 44, 4), color, 4); ctx.strokeStyle = INK; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(-34, -22); ctx.lineTo(0, 4); ctx.lineTo(34, -22); ctx.stroke(); fs(ctx, rr(18, -14, 12, 14, 2), '#e2574c', 2); }
function bucketG(ctx, {fill = 0.4} = {}) { const p = poly([[-52, -80], [52, -80], [40, 0], [-40, 0]]); fs(ctx, p, '#8f9aa0', 5); ctx.save(); ctx.clip(p); ctx.fillStyle = '#7fb6d8'; ctx.fillRect(-60, -80 * fill, 120, 90); ctx.restore(); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, -80, 52, Math.PI, 0); ctx.stroke(); }
function leakG(ctx, {t = 0, w = 220, fall = 560} = {}) { // a brown water stain with a drop that forms, falls and splashes (origin = the ceiling spot; the drop falls 560 px)
  ctx.fillStyle = 'rgba(120,80,40,.55)'; ctx.beginPath(); ctx.ellipse(0, 0, w * 0.5, w * 0.16, 0, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(95,60,28,.6)'; ctx.beginPath(); ctx.ellipse(0, 4, w * 0.3, w * 0.09, 0, 0, 7); ctx.fill();
  for (const [off, sd] of [[0, 0], [0.5, 1]]) { const q = ((t * 1.6 + off) % 1); const y = q < 0.45 ? 14 + q * 40 : 14 + (q - 0.45) / 0.55 * fall; const sz = q < 0.45 ? 6 + q * 22 : 15;
    const d = new Path2D(); d.moveTo(0, y - sz * 1.8); d.quadraticCurveTo(sz, y, 0, y + sz); d.quadraticCurveTo(-sz, y, 0, y - sz * 1.8); fs(ctx, d, '#9fd0ee', 3);
    if (q > 0.97 || q < 0.08) { ctx.strokeStyle = 'rgba(159,208,238,.9)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, fall + 14, 30 + (q < 0.08 ? q * 300 : 0), 8, 0, 0, 7); ctx.stroke(); } }
}
function vanG(ctx, {color = '#6fa0a8', dir = 1, t = 0} = {}) { // a delivery van, side view (faces dir)
  ctx.save(); ctx.scale(dir, 1); ctx.translate(0, Math.sin(t * 17) * 1.6);
  fs(ctx, rr(-230, -210, 330, 200, 14), color, 6); fs(ctx, poly([[100, -210], [100, -10], [210, -10], [214, -80], [170, -150], [130, -210]]), mix(color, '#ffffff', 0.12), 6);
  fs(ctx, poly([[118, -192], [118, -100], [190, -100], [160, -150], [138, -192]]), '#dff0ea', 4); fs(ctx, rr(-210, -170, 180, 70, 8), 'rgba(255,255,255,.28)', 0);
  fs(ctx, rr(-232, -50, 450, 40, 8), '#3a3a40', 5); fs(ctx, rr(205, -66, 18, 22, 4), '#fff3c4', 3);
  for (const x of [-150, 130]) { fs(ctx, el(x, -8, 44, 44), '#2a211e', 5); fs(ctx, el(x, -8, 20, 20), '#d9c9a8', 4); }
  ctx.restore();
}
function birdsG(ctx, {t = 0, n = 5, span = 760} = {}) { // small gold-brown birds crossing, wings flapping
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (let i = 0; i < n; i++) { const q = ((t * 0.13 + hashN(i * 3 + 1)) % 1), x = -span / 2 + q * span, y = Math.sin(q * 6 + i * 2) * 40 + (i % 3) * 56, f = Math.sin(t * 13 + i * 2) * 14;
    ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(x - 30, y - f); ctx.quadraticCurveTo(x - 12, y - 14, x, y); ctx.quadraticCurveTo(x + 12, y - 14, x + 30, y - f); ctx.stroke();
    ctx.strokeStyle = '#7a4a2a'; ctx.lineWidth = 4.5; ctx.beginPath(); ctx.moveTo(x - 30, y - f); ctx.quadraticCurveTo(x - 12, y - 14, x, y); ctx.quadraticCurveTo(x + 12, y - 14, x + 30, y - f); ctx.stroke(); }
  ctx.restore();
}
function sunBeam(ctx, {k = 1, w = 420, h = 900} = {}) { // a soft slanted band of sunlight (origin = top centre)
  if (k <= 0) return; const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, `rgba(255,243,196,${0.5 * k})`); g.addColorStop(1, `rgba(255,243,196,${0.12 * k})`); ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(-w * 0.2, 0); ctx.lineTo(w * 0.2, 0); ctx.lineTo(w * 0.7, h); ctx.lineTo(-w * 0.45, h); ctx.closePath(); ctx.fill();
}
function bigHands(ctx, {k = 1, s = 1} = {}) { // two huge open hands of warm light reaching in from both sides to take the clouds (soft, outlined like the rest)
  if (k <= 0) return; ctx.save(); ctx.scale(s, s); ctx.globalAlpha *= clamp(k * 1.4);
  glow(ctx, 0, 0, 560, 0.55 * k, '255,236,170');
  for (const sg of [-1, 1]) { ctx.save(); ctx.scale(sg, 1); ctx.translate(-150 - (1 - eio(k)) * 380, 0); ctx.rotate(0.1);
    const col = '#ffe08a', cap = (x, y, w, h, r, c = col) => fs(ctx, rr(x, y, w, h, r), c, 7);
    cap(-360, -30, 200, 70, 34); // forearm
    ctx.save(); ctx.translate(-120, 52); ctx.rotate(0.62); cap(0, -17, 140, 38, 19); ctx.restore(); // thumb (behind the palm)
    cap(-200, -132, 230, 180, 66); // palm
    for (let i = 0; i < 4; i++) { const len = 200 - Math.abs(i - 1.1) * 34; ctx.save(); ctx.translate(14, -112 + i * 46); ctx.rotate(-0.16 + i * 0.07); cap(0, -17, len, 34, 17, '#ffe9a6'); ctx.restore(); } // four fingers, a little fanned
    ctx.strokeStyle = 'rgba(160,110,30,.5)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-130, -10); ctx.quadraticCurveTo(-60, 20, 0, -30); ctx.stroke();
    ctx.restore(); }
  ctx.restore();
}

// ---- sets
function houseGray(ctx, x, w, top, color, o) { cottage(ctx, x, w, top, 1290, color, {lit: o.lit, door: true, doorColor: o.door || WARM.wood}); }
function fence(ctx, x0, x1, y = 1290) { fs(ctx, rr(x0, y - 78, x1 - x0, 12, 3), '#b8864f', 4); for (let x = x0 + 8; x < x1 - 20; x += 44) fs(ctx, poly([[x, y], [x, y - 90], [x + 14, y - 106], [x + 28, y - 90], [x + 28, y]]), '#d9aa6a', 4); }
const SETS_ADD = {
  // Mr. Hale's porch (left) and Milo's cottage (right) on Cypress Lane. state: gray (rain over Hale only) | sun | night | dawn
  gcStreet({state = 'gray', time = null, dim = 0} = {}) {
    return ctx => {
      const tm = time || (state === 'night' ? 'night' : state === 'dawn' ? 'dawn' : 'gold'), night = tm === 'night' || tm === 'moon';
      sky(ctx, tm);
      fs(ctx, poly([[0, 1010], [180, 930], [420, 990], [700, 900], [1080, 980], [1080, 1300], [0, 1300]]), night ? '#4c3a52' : '#d9b27a', 4);
      if (state === 'gray') { // the weather stops at the fence: gray wash left of x ≈ 560, sun on the right
        const g = ctx.createLinearGradient(0, 0, 0, 1100); g.addColorStop(0, dim ? '#5a5c63' : '#c0c1c5'); g.addColorStop(1, dim ? '#8d8b89' : '#dcd8d0'); ctx.save(); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(600, 0); ctx.quadraticCurveTo(540, 500, 600, 1000); ctx.lineTo(560, 1300); ctx.lineTo(0, 1300); ctx.closePath(); ctx.fillStyle = g; ctx.fill(); ctx.restore();
      }
      // Hale's house (left) with a porch
      houseGray(ctx, -80, 560, 600, state === 'gray' ? '#d4c1a4' : night ? '#e9c38f' : '#f1d9b5', {lit: night, door: '#5a4a3a'});
      fs(ctx, poly([[-60, 905], [120, 860], [500, 860], [520, 905], [520, 926], [-60, 926]]), state === 'gray' ? '#8c5a40' : WARM.roof, 6);
      for (const x of [20, 470]) fs(ctx, rr(x - 14, 926, 28, 364, 4), '#8a5a36', 5);
      fs(ctx, rr(-40, 1250, 560, 40, 6), '#9a6a3c', 5); fs(ctx, rr(-40, 1180, 540, 12, 3), '#8a5a36', 4);
      for (let x = 50; x < 480; x += 62) fs(ctx, rr(x, 1190, 14, 60, 3), '#a87a48', 3);
      // Milo's cottage (right), fresh and cream, shutters; a fence between
      houseGray(ctx, 640, 520, 640, night ? '#f0cfa0' : '#fbe8c4', {lit: night, door: '#c4643a'});
      if (!night && state !== 'gray') { glow(ctx, 900, 800, 420, 0.28, '255,226,150'); }
      fence(ctx, 520, 650); olive(ctx, 1010, 1330, 0.95); olive(ctx, 585, 1325, 0.6);
      cobbles(ctx, 1290, state === 'gray' ? '#cdb792' : '#dcc29a', night);
      if (state === 'gray') { ctx.fillStyle = `rgba(95,100,112,${dim ? 0.3 : 0.1})`; ctx.fillRect(0, 0, 560, 1920); ctx.fillStyle = `rgba(80,86,98,${dim ? 0.25 : 0.08})`; ctx.fillRect(0, 1290, 560, 630); }
      if (SHADE[tm]) { ctx.fillStyle = SHADE[tm]; ctx.fillRect(0, 0, 1080, 1920); }
      if (night) { ctx.fillStyle = tm === 'moon' ? 'rgba(20,24,60,.04)' : 'rgba(20,12,40,.12)'; ctx.fillRect(0, 0, 1080, 1920); glow(ctx, 250, 1100, 500, 0.4, '255,200,120'); }
      if (dim) { ctx.fillStyle = `rgba(40,50,90,${dim})`; ctx.fillRect(0, 0, 1080, 1920); }
    };
  },
  // a small square with a clock tower (the late woman); the hands are the clockHands prop at (230, 700)
  gcSquare({time = 'gold'} = {}) {
    return ctx => {
      sky(ctx, time); fs(ctx, poly([[0, 1010], [180, 930], [420, 990], [700, 900], [1080, 980], [1080, 1300], [0, 1300]]), '#d9b27a', 4);
      cottage(ctx, 620, 440, 760, 1290, WARM.plaster[2], {door: true, lit: time === 'night'}); cottage(ctx, 860, 260, 820, 1290, WARM.plaster[3], {door: false, lit: time === 'night'});
      fs(ctx, rr(130, 480, 200, 810, 6), '#e6cba0', 7); fs(ctx, poly([[110, 500], [230, 330], [350, 500]]), WARM.roof, 7); fs(ctx, rr(120, 1180, 220, 110, 4), '#cdb08a', 5);
      fs(ctx, el(230, 700, 92, 92), '#fff8e8', 8); ctx.strokeStyle = INK; ctx.lineWidth = 5; for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; ctx.beginPath(); ctx.moveTo(230 + Math.sin(a) * 74, 700 - Math.cos(a) * 74); ctx.lineTo(230 + Math.sin(a) * 86, 700 - Math.cos(a) * 86); ctx.stroke(); }
      fs(ctx, rr(210, 540, 40, 60, 6), '#3a2a26', 4);
      cobbles(ctx, 1290, '#dcc29a', time === 'night'); olive(ctx, 1020, 1320, 0.9);
      if (SHADE[time]) { ctx.fillStyle = SHADE[time]; ctx.fillRect(0, 0, 1080, 1920); }
      if (time === 'night') { ctx.fillStyle = 'rgba(14,10,40,.22)'; ctx.fillRect(0, 0, 1080, 1920); glow(ctx, 230, 700, 300, 0.55, '255,224,140'); lamp(ctx, 930, 930, true); fs(ctx, el(230, 700, 92, 92), '#fff0a8', 8); ctx.strokeStyle = INK; ctx.lineWidth = 5; for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; ctx.beginPath(); ctx.moveTo(230 + Math.sin(a) * 74, 700 - Math.cos(a) * 74); ctx.lineTo(230 + Math.sin(a) * 86, 700 - Math.cos(a) * 86); ctx.stroke(); } }
    };
  },
  // a busy road: honey sky, a few houses, a wide road with a dashed line; the twins stand on the near kerb (y ≈ 1700)
  gcRoad({time = 'gold'} = {}) {
    return ctx => {
      sky(ctx, time); fs(ctx, poly([[0, 1010], [180, 930], [420, 990], [700, 900], [1080, 980], [1080, 1250], [0, 1250]]), '#d9b27a', 4);
      cottage(ctx, 40, 300, 760, 1240, WARM.plaster[0], {door: true}); cottage(ctx, 700, 330, 740, 1240, WARM.plaster[3], {door: false}); olive(ctx, 560, 1290, 0.8);
      ctx.fillStyle = '#8c7a68'; ctx.fillRect(0, 1240, 1080, 560); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 1240); ctx.lineTo(1080, 1240); ctx.stroke();
      ctx.fillStyle = '#fbf1dc'; for (let x = -20; x < 1100; x += 190) { ctx.fillRect(x, 1480, 110, 16); }
      ctx.fillStyle = 'rgba(0,0,0,.08)'; for (let i = 0; i < 40; i++) ctx.fill(el(hashN(i) * 1080, 1260 + hashN(i + 4) * 520, 40, 8));
      ctx.fillStyle = '#d9c19a'; ctx.fillRect(0, 1800, 1080, 120); ctx.beginPath(); ctx.moveTo(0, 1800); ctx.lineTo(1080, 1800); ctx.stroke(); fs(ctx, rr(-20, 1790, 1120, 22, 0), '#b8a37e', 5);
      if (SHADE[time]) { ctx.fillStyle = SHADE[time]; ctx.fillRect(0, 0, 1080, 1920); }
    };
  },
  // Rosa's room with the leaky ceiling (the stain is the leakG prop at (560, 300))
  gcLeakRoom() {
    return ctx => { SETS.gKitchen({time: 'day'})(ctx); ctx.fillStyle = 'rgba(70,80,96,.22)'; ctx.fillRect(0, 0, 1080, 1920); };
  },
  // a cloud-shaped window onto the worry (foreground plate): gray cloud frame with a hole; label = whose worry
  gcCloudFrame({label = '', hole = [540, 980, 400, 640]} = {}) {
    return ctx => {
      const [hx, hy, hw, hh] = hole, win = new Path2D();
      for (const [x, y, q] of [[-0.78, 0.5, 0.4], [-0.95, -0.1, 0.4], [-0.6, -0.68, 0.38], [0, -0.92, 0.42], [0.6, -0.68, 0.38], [0.95, -0.05, 0.4], [0.78, 0.55, 0.4], [0.05, 0.9, 0.44]]) { win.moveTo(hx + x * hw + q * hw, hy + y * hh); win.arc(hx + x * hw, hy + y * hh, q * hw, 0, Math.PI * 2); }
      win.rect(hx - hw * 0.82, hy - hh * 0.72, hw * 1.64, hh * 1.44);
      ctx.fillStyle = '#4d4f56'; ctx.fillRect(-10, -10, 1100, 1940);
      for (let i = 0; i < 26; i++) { const x = hashN(i) * 1080, y = hashN(i + 7) * 1920; ctx.fillStyle = i % 2 ? 'rgba(130,132,140,.5)' : 'rgba(60,62,70,.35)'; ctx.fill(el(x, y, 90 + hashN(i + 2) * 80, 38 + hashN(i + 4) * 30)); }
      ctx.lineJoin = 'round'; ctx.lineWidth = 22; ctx.strokeStyle = INK; ctx.stroke(win);
      ctx.save(); ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = '#000'; ctx.fill(win); ctx.restore();
      if (label) drawTag(ctx, hx, hy + hh * 0.98 + 40, 96, label);
    };
  },
};
Object.assign(SETS, SETS_ADD);
Object.assign(PROPS, {cloudG: (ctx, a = {}) => drawCloud(ctx, 0, 0, a.r ?? 82, a), cloudsOver, cloudMass, cloudsRise, rainG, umbrellaG, watchG, clockHands, boxG, wagonG, mailboxG, letterG, bucketG, leakG, vanG, birdsG, sunBeam, bigHands});
