// R1 · grace-remains ep16 "The Light": a little light floats above every head (brightness = intensity). Ana's mother's light flickers, always on
// the same cadence; Ana prays at her window in the same beat. New places (two facing houses with big windows, day and night) and props: the
// light itself, sunglasses that drop onto a face, a window sill that hides a figure's body, a chair front, a lit match (gold), a soup pot/bowl/
// ladle, falling petals/leaves, a pulsing face glow. Registered into SETS/PROPS on import. NOTHING existing in the engine is edited.
import {Path2D} from '@napi-rs/canvas';
import {INK, mix, dark} from './r1-rig.mjs';
import {SETS, PROPS} from './r1-world.mjs';
import {fs, rr, el, poly, hashN, glow, olive, sky, cobbles, easeOutBack, WARM} from './r1-world-grace.mjs';
import './r1-world-grace-book.mjs';   // blanketG, snowG, swapCloudG, pillowG, gbBedroom
import './r1-world-grace-ears.mjs';   // wallClockG
import './r1-world-grace-bakery.mjs'; // gVerseMeadow

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const hexA = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };

// ------------------------------------------------------------------ the mother's cadence (ONE clock for the whole film)
// ON from each period start for 1.08 s, then an ember for the rest of the period; the period is 37.29 / 18 so that «On.» (37.29), «Off.» (38.37)
// and the second «On.» (39.36 ≈ 39.32) fall exactly on the words, and the light is ON at t = 0.
export const BEAT = {P: 37.29 / 18, ON: 1.08, UP: 0.12, DIM: 0.16, LIT: 0.62};
export const beatPhase = t => ((t % BEAT.P) + BEAT.P) % BEAT.P;
export const beatOn = t => beatPhase(t) < BEAT.ON;
// the mother's brightness at time t (never below DIM)
export function motherV(t) {
  const x = beatPhase(t), {P, ON, UP, DIM, LIT} = BEAT;
  if (x < ON - 0.05) return LIT;
  if (x < ON) return lerp(LIT, DIM, (x - (ON - 0.05)) / 0.05);
  if (x < P - UP * 0.5) return DIM;
  return lerp(DIM, LIT, (x - (P - UP * 0.5)) / (UP * 0.5));
}

// ------------------------------------------------------------------ the light
const HUE = {gold: ['#ffc94a', '#fff0b8'], ember: ['#ff6a4d', '#ffd9a8'], violet: ['#b384e0', '#f2e2ff'], leaf: ['#9acd5a', '#eaffc0'], white: ['#fff3c4', '#ffffff'], ouro: ['#ffb81f', '#fff7d6']};
function flameP(x, y, h, w, sway) { const p = new Path2D(); p.moveTo(x, y); p.bezierCurveTo(x - w * 1.1, y - h * 0.12, x - w * 0.72, y - h * 0.6, x + sway, y - h); p.bezierCurveTo(x + w * 0.72, y - h * 0.6, x + w * 1.1, y - h * 0.12, x, y); p.closePath(); return p; }
// a flame floating above A's head. v = brightness (0.16 = an ember … 1 = bright … 2.4 = a floodlight). fix = [x, y] puts the base anywhere.
function lightG(ctx, {A = null, t = 0, v = 1, hue = 'gold', gap = 0.6, dx = 0, dy = 0, size = 1, fix = null, rays = 0, seed = 1, calm = 0.6, over = null} = {}) {
  if (!fix && (!A || !A._top || (A._alpha ?? 1) <= 0.02)) return;
  const R = A ? A._headR * A._s : 60, al = A ? (A._alpha ?? 1) : 1;
  const cx = (fix ? fix[0] : over === 'head' ? A._head[0] : A._top[0]) + dx, base = (fix ? fix[1] : over === 'head' ? A._head[1] - R * gap : A._top[1] - R * gap) + dy; // over:'head' = straight above the head centre (a lying figure)
  const lv = Math.max(0.02, v), k = Math.min(1, lv), big = lv > 1 ? lv : 1;
  const h = R * 0.95 * size * (0.3 + 0.7 * k) * big, w = h * 0.34;
  const fl = 1 + (0.05 * Math.sin(t * 17 + seed) + 0.03 * Math.sin(t * 29 + seed * 2)) * (1 - calm * 0.5), sway = Math.sin(t * 9 + seed * 3) * h * 0.07 * (1 - calm * 0.6);
  const [c0, c1] = HUE[hue] || HUE.gold, hh = h * fl;
  ctx.save(); ctx.globalAlpha = al; ctx.lineJoin = 'round';
  const gr = h * (1.5 + 1.3 * k) * Math.sqrt(big), gy = base - hh * 0.45, g = ctx.createRadialGradient(cx, gy, h * 0.08, cx, gy, gr);
  g.addColorStop(0, hexA(c0, 0.62 * k + 0.08)); g.addColorStop(1, hexA(c0, 0)); ctx.fillStyle = g; ctx.fillRect(cx - gr, gy - gr, 2 * gr, 2 * gr);
  if (rays > 0) { // a floodlight: long rays turning slowly
    ctx.save(); ctx.translate(cx, gy); ctx.rotate(t * 0.35); ctx.fillStyle = hexA(c1, 0.34 * rays);
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6, L = h * (2.6 + (i % 2) * 1.1) * rays; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a - 0.07) * L, Math.sin(a - 0.07) * L); ctx.lineTo(Math.cos(a + 0.07) * L, Math.sin(a + 0.07) * L); ctx.closePath(); ctx.fill(); }
    ctx.restore();
  }
  const f = flameP(cx, base, hh, w, sway); ctx.fillStyle = c0; ctx.fill(f); ctx.lineWidth = Math.max(3, h * 0.07); ctx.strokeStyle = INK; ctx.stroke(f);
  ctx.fillStyle = c1; ctx.fill(flameP(cx, base - hh * 0.04, hh * 0.6, w * 0.55, sway * 0.5));
  ctx.restore();
}
// sunglasses that drop onto a face at t0 (A's head centre; eyes at ±0.37 R)
function shadesG(ctx, {A = null, t = 0, t0 = 0} = {}) {
  if (!A || !A._head || t < t0 || (A._alpha ?? 1) <= 0.02) return;
  const R = A._headR * A._s, q = clamp((t - t0) / 0.26), k = easeOutBack(q), dy = (1 - k) * -R * 2.6;
  ctx.save(); ctx.globalAlpha = (A._alpha ?? 1) * clamp(q * 4); ctx.translate(A._head[0], A._head[1] + dy); ctx.rotate(((A._st?.tilt) || 0) * Math.PI / 180); ctx.lineJoin = 'round';
  const ex = R * 0.37, ey = -R * 0.04, lw = R * 0.4, lh = R * 0.34;
  ctx.strokeStyle = INK; ctx.lineWidth = Math.max(3, R * 0.07); ctx.beginPath(); ctx.moveTo(-ex - lw, ey - lh * 0.1); ctx.lineTo(-R * 0.98, ey - lh * 0.3); ctx.moveTo(ex + lw, ey - lh * 0.1); ctx.lineTo(R * 0.98, ey - lh * 0.3); ctx.moveTo(-ex + lw, ey - lh * 0.2); ctx.quadraticCurveTo(0, ey - lh * 0.55, ex - lw, ey - lh * 0.2); ctx.stroke();
  for (const sg of [-1, 1]) { const p = rr(sg * ex - lw, ey - lh, lw * 2, lh * 2, lh * 0.7); ctx.fillStyle = '#241a1c'; ctx.fill(p); ctx.stroke(p); ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fill(poly([[sg * ex - lw * 0.6, ey - lh * 0.7], [sg * ex - lw * 0.1, ey - lh * 0.7], [sg * ex - lw * 0.55, ey + lh * 0.1], [sg * ex - lw * 0.85, ey + lh * 0.1]])); }
  ctx.restore();
}
// a window sill that hides the body of whoever stands behind it, painted in the wall's own colour (FRONT prop; x = centre, y = the opening's bottom)
function sillG(ctx, {cx = 0, cy = 0, w = 240, time = 'day', drop = 190, box = true, frame = '#fbf1dc'} = {}) {
  ctx.save(); ctx.lineJoin = 'round';
  ctx.save(); ctx.beginPath(); ctx.rect(cx - w / 2 - 14, cy + 4, w + 28, drop); ctx.clip(); SETS.glStreet({time})(ctx); ctx.restore(); // the wall exactly as the set paints it (glows, night shade)
  ctx.translate(cx, cy);
  fs(ctx, rr(-w / 2 - 22, -4, w + 44, 30, 6), frame, 5);
  if (box) { fs(ctx, rr(-w / 2 - 8, 26, w + 16, 40, 6), '#9a5a34', 4); for (let i = 0; i < 6; i++) fs(ctx, el(-w / 2 + 10 + i * (w - 20) / 5, 22, 15, 13), ['#e2574c', '#f4b942', '#e2574c', '#f08a5d', '#f4b942', '#e2574c'][i], 3); }
  ctx.restore();
}
// the front of a chair: seat, two front legs, an apron (FRONT prop, drawn over a seated figure's thighs). x = centre, y = seat top
function chairFrontG(ctx, {w = 330, h = 52, legH = 250} = {}) {
  ctx.save(); ctx.lineJoin = 'round';
  for (const sx of [-1, 1]) fs(ctx, rr(sx * (w / 2 - 22) - 15, h - 6, 30, legH, 8), '#6e4426', 5);
  fs(ctx, rr(-w / 2, 0, w, h, 16), '#8a5a36', 6); fs(ctx, rr(-w / 2 + 12, 5, w - 24, 12, 6), '#b07a4a', 0);
  fs(ctx, rr(-w / 2 + 14, h - 4, w - 28, 26, 6), '#6e4426', 4);
  ctx.restore();
}
// a lit match, drawn from its tip: ang = direction of the stick (the stick lies behind the tip). The flame is NOT drawn here (use lightG with fix)
function matchG(ctx, {ang = 2.4, len = 560, w = 18} = {}) {
  ctx.save(); ctx.rotate(ang); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  fs(ctx, rr(8, -w / 2, len, w, w / 2), '#d9b16c', 5); ctx.fillStyle = 'rgba(255,255,255,.28)'; ctx.fillRect(18, -w / 2 + 3, len - 20, 4);
  fs(ctx, el(2, 0, w * 0.85, w * 0.8), '#ff9d1c', 5); ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.fill(el(-3, -w * 0.25, w * 0.25, w * 0.18));
  ctx.restore();
}
// a pot of soup on a crate, a bowl and a ladle (origin = the base / the hand)
function potG(ctx, {steam = 0, t = 0} = {}) {
  ctx.save(); ctx.lineJoin = 'round';
  fs(ctx, rr(-120, -10, 240, 200, 12), '#8a5a36', 6); ctx.strokeStyle = 'rgba(60,30,10,.35)'; ctx.lineWidth = 4; for (const y of [60, 120]) { ctx.beginPath(); ctx.moveTo(-120, y); ctx.lineTo(120, y); ctx.stroke(); }
  fs(ctx, rr(-100, -150, 200, 148, 26), '#5d4a46', 7); fs(ctx, rr(-112, -168, 224, 30, 12), '#6f5b56', 6); fs(ctx, rr(-100, -138, 200, 14, 7), '#e08a5a', 0);
  for (const sx of [-1, 1]) { ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(sx * 122, -110, 18, sx > 0 ? -1.5 : 1.64, sx > 0 ? 1.5 : 4.64); ctx.stroke(); }
  if (steam) { ctx.strokeStyle = 'rgba(255,248,230,.75)'; ctx.lineWidth = 9; ctx.lineCap = 'round'; for (let i = 0; i < 3; i++) { const ph = t * 1.6 + i * 2.1; ctx.beginPath(); for (let j = 0; j <= 10; j++) { const y = -190 - j * 18, x = -50 + i * 50 + Math.sin(ph + j * 0.5) * 12; j ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); } }
  ctx.restore();
}
function bowlG(ctx, {r = 44, soup = true, steam = 0, t = 0} = {}) {
  ctx.save(); ctx.lineJoin = 'round';
  const b = new Path2D(); b.moveTo(-r, -r * 0.1); b.quadraticCurveTo(-r * 0.9, r * 0.95, 0, r * 0.95); b.quadraticCurveTo(r * 0.9, r * 0.95, r, -r * 0.1); b.closePath(); fs(ctx, b, '#fbf1dc', 6);
  fs(ctx, el(0, -r * 0.1, r, r * 0.26), soup ? '#e08a5a' : '#fbf1dc', 5);
  if (steam) { ctx.strokeStyle = 'rgba(255,248,230,.8)'; ctx.lineWidth = 6; ctx.lineCap = 'round'; for (let i = 0; i < 2; i++) { const ph = t * 1.8 + i * 2; ctx.beginPath(); for (let j = 0; j <= 6; j++) { const y = -r * 0.5 - j * 10, x = -r * 0.3 + i * r * 0.6 + Math.sin(ph + j * 0.6) * 6; j ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); } }
  ctx.restore();
}
function ladleG(ctx, {len = 130} = {}) {
  ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-len * 0.35, -len); ctx.stroke();
  ctx.strokeStyle = '#8a5a36'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-len * 0.35, -len); ctx.stroke();
  fs(ctx, el(-len * 0.38, -len - 12, 26, 20), '#6f5b56', 5); ctx.restore();
}
// petals / leaves falling through a rectangle
function fallG(ctx, {t = 0, x0 = 0, y0 = 0, w = 1080, h = 1920, n = 40, speed = 120, wind = 50, kind = 'petal', seed = 1, clip = true} = {}) {
  ctx.save(); if (clip) { ctx.beginPath(); ctx.rect(x0, y0, w, h); ctx.clip(); } ctx.lineJoin = 'round';
  const cols = kind === 'petal' ? ['#f6a8b6', '#fbd0d8', '#f48da0'] : ['#e0772e', '#c4643a', '#e9a23c', '#a8503a'];
  for (let i = 0; i < n; i++) {
    const sp = speed * (0.6 + hashN(i * 1.7 + seed) * 0.8), sz = kind === 'petal' ? 10 + hashN(i * 2.9 + seed) * 8 : 15 + hashN(i * 2.9 + seed) * 10;
    const y = y0 + ((hashN(i * 3.1 + seed) * h + t * sp) % h), x = x0 + (((hashN(i * 5.3 + seed) * w + t * wind * (0.4 + hashN(i)) + Math.sin(t * 1.9 + i) * 26) % w) + w) % w;
    ctx.save(); ctx.translate(x, y); ctx.rotate(t * (1 + hashN(i)) * 2 + i); ctx.fillStyle = cols[i % cols.length]; const p = el(0, 0, sz, sz * (kind === 'petal' ? 0.55 : 0.7)); ctx.fill(p); ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgba(42,33,30,.7)'; ctx.stroke(p); ctx.restore();
  }
  ctx.restore();
}
// a warm pulse on a face (follows the mother's beat): a soft radial glow at (0,0); a = 0..1
function glowPulseG(ctx, {a = 0.4, r = 220, c = '255,201,74'} = {}) { glow(ctx, 0, 0, r, a, c); }

// the lit match with its gold flame, placed at pos = {x, y} (the tip), stick coming from the lower right. {pos, lit, t}
function matchDynG(ctx, {pos = {x: 0, y: 0}, lit = false, t = 0} = {}) {
  ctx.save(); ctx.translate(pos.x, pos.y); matchG(ctx, {ang: -0.95, len: 700, w: 20});
  if (lit) { const q = clamp((t - 0) , 0, 1); lightG(ctx, {fix: [0, -6], t, v: 0.95, hue: 'ouro', size: 0.9, calm: 0.2, seed: 8}); }
  ctx.restore();
}
Object.assign(PROPS, {matchDynG, lightG, shadesG, sillG, chairFrontG, matchG, potG, bowlG, ladleG, fallG, glowPulseG});

// ------------------------------------------------------------------ places
const WALL_A = WARM.plaster[1], WALL_B = WARM.plaster[3];
export const LIGHT_WIN = {a: {x: 100, y: 620, w: 240, h: 320}, b: {x: 740, y: 620, w: 220, h: 320}}; // Ana's window (left house) and the mother's (right house)
Object.assign(SETS, {
  // two houses facing each other across a lane: Ana's on the left (big window), her mother's on the right (window + door). time: 'day' | 'night'.
  // ONE level per hour: night = the plum shade over the lane, the two windows lit.
  glStreet({time = 'day'} = {}) {
    const night = time === 'night', WIN = LIGHT_WIN;
    return ctx => {
      sky(ctx, night ? 'night' : 'gold', 1300);
      fs(ctx, poly([[0, 1090], [200, 1010], [440, 1070], [700, 990], [1080, 1060], [1080, 1300], [0, 1300]]), night ? '#4c3a52' : '#d9b27a', 4);
      const house = (x, w, c, win, doorX) => {
        fs(ctx, rr(x, 600, w, 690, 4), c); // no stains: the sill patch must match
        fs(ctx, poly([[x - 30, 606], [x + w / 2, 440], [x + w + 30, 606]]), WARM.roof);
        ctx.strokeStyle = dark(WARM.roof, 0.2); ctx.lineWidth = 4; for (let i = 1; i < 6; i++) { const k = i / 6; ctx.beginPath(); ctx.moveTo(x - 30 + k * (w / 2 + 30), 606 - k * 166); ctx.lineTo(x + w + 30 - k * (w / 2 + 30), 606 - k * 166); ctx.stroke(); }
        fs(ctx, rr(win.x - 16, win.y - 16, win.w + 32, win.h + 32, 10), WARM.cream, 5);
        ctx.fillStyle = night ? '#ffcf6e' : '#8a6a5a'; ctx.fillRect(win.x, win.y, win.w, win.h);
        if (!night) { ctx.fillStyle = 'rgba(40,20,10,.22)'; ctx.fillRect(win.x, win.y, win.w, win.h * 0.5); }
        ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.strokeRect(win.x, win.y, win.w, win.h);
        const dw = 120, dy = 1050; const d = new Path2D(); d.moveTo(doorX, 1290); d.lineTo(doorX, dy + dw / 2); d.arc(doorX + dw / 2, dy + dw / 2, dw / 2, Math.PI, 0); d.lineTo(doorX + dw, 1290); d.closePath(); fs(ctx, d, WARM.wood, 5);
        ctx.fillStyle = WARM.gold; ctx.fill(el(doorX + dw - 20, dy + 130, 7, 7));
      };
      house(-20, 460, WALL_A, WIN.a, 300); house(640, 460, WALL_B, WIN.b, 800);
      fs(ctx, rr(494, 880, 12, 410, 4), '#3c2c24', 3); fs(ctx, poly([[470, 820], [530, 820], [520, 880], [480, 880]]), night ? '#ffe08a' : '#cdb58a', 4);
      olive(ctx, 560, 1330, 0.7);
      cobbles(ctx, 1290, '#dcc29a', night);
      if (night) {
        ctx.fillStyle = 'rgba(30,18,52,.40)'; ctx.fillRect(0, 0, 1080, 1920);
        for (const w of [WIN.a, WIN.b]) { ctx.fillStyle = '#ffcf6e'; ctx.fillRect(w.x, w.y, w.w, w.h); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.strokeRect(w.x, w.y, w.w, w.h); glow(ctx, w.x + w.w / 2, w.y + w.h / 2, 460, 0.42, '255,206,120'); }
        glow(ctx, 500, 830, 360, 0.4, '255,206,120');
      } else { glow(ctx, 540, 1100, 760, 0.12, '255,226,170'); }
    };
  },
  // the mother's sickroom at 3 a.m. = the lamp-lit bedroom with ONE night shade over the room (the lamp glows through it). One level for the whole place and hour.
  glSickroom() {
    return ctx => {
      SETS.gbBedroom()(ctx);
      ctx.fillStyle = 'rgba(40,22,64,.42)'; ctx.fillRect(0, 0, 1080, 1920);
      glow(ctx, 208, 1040, 620, 0.5, '255,206,120');
      fs(ctx, rr(186, 1100, 40, 80, 8), '#fbf1dc', 5); fs(ctx, poly([[150, 1100], [266, 1100], [238, 990], [178, 990]]), '#ffe08a', 6);
      glow(ctx, 208, 1040, 300, 0.4, '255,214,140');
    };
  },
});
