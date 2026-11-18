// R1 · grace-remains ep11 "The Ears": ears drawn ON the head from the rule's counter (0 = a smooth head, 20 = elephant ears),
// a hat that sits on the ears, and the places of the story: office, meeting room, family barbecue, kitchen/dinner, the living
// room at night with a lamp and a sofa; thought bubbles with pictures, a scribble bubble (words he cannot hear), a wall clock.
// Registered into SETS/PROPS on import. NOTHING in the engine is edited: the rig's own small ears are hidden for the actors whose
// skin is registered with earSkin() (a tiny hook on the canvas fill/stroke of the rig's ear ellipse), and the ears you see are the
// `earsG` prop, drawn right after its actor from the actor's measured head (actor._head, _headR, _s, _st.tilt, _led).
import {Path2D, createCanvas} from '@napi-rs/canvas';
import {INK, mix, dark, light} from './r1-rig.mjs';
import {SETS, PROPS} from './r1-world.mjs';
import {fs, rr, el, poly, hashN, glow, olive, sky, windowPane, room, cobbles, easeOutBack, SKY, SHADE, WARM} from './r1-world-grace.mjs';

let LWU = 0.053; // the rig's 0.8-unit outline, in head-radius units
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const rad = d => d * Math.PI / 180;

// ---------------------------------------------------------------- hide the rig's default ears for registered skins
const EAR_SKINS = new Set();
// a skin colour that marks "this actor's ears are drawn by earsG": one bit off the real colour, invisible to the eye
export function earSkin(hex) { const n = parseInt(hex.slice(1), 16), m = '#' + ((1 << 24) + ((n & 0xfffffe) | ((n & 1) ^ 1))).toString(16).slice(1); EAR_SKINS.add(m.toLowerCase()); return m; }
if (!globalThis.__graceEarPatch) {
  globalThis.__graceEarPatch = true;
  const ctx0 = createCanvas(4, 4).getContext('2d'), CP = Object.getPrototypeOf(ctx0);
  const oEllipse = Path2D.prototype.ellipse, oFill = CP.fill, oStroke = CP.stroke;
  // the rig's ear is ellipse(±0.93R, 0.08R, 0.2R, 0.26R): rx/ry = .769, y/ry = .308, |x|/rx = 4.65
  Path2D.prototype.ellipse = function (x, y, rx, ry, ...r) { if (ry > 0 && Math.abs(rx / ry - 0.76923) < 2e-3 && Math.abs(y / ry - 0.30769) < 2e-3 && Math.abs(Math.abs(x) / rx - 4.65) < 2e-3) this.__ear = true; return oEllipse.call(this, x, y, rx, ry, ...r); };
  CP.fill = function (p, ...r) { if (p && p.__ear) { this.__skipEar = EAR_SKINS.has(String(this.fillStyle).toLowerCase()); if (this.__skipEar) return; } return oFill.call(this, p, ...r); };
  CP.stroke = function (p, ...r) { if (p && p.__ear && this.__skipEar) return; return oStroke.call(this, p, ...r); };
}

// ---------------------------------------------------------------- the ears
// head radius units: ear height (half) ry for the counter n. 5 ≈ an ordinary ear; 3 = peas; 20 = an elephant's.
const earRy = n => n <= 0 ? 0 : n < 1 ? 0.3 * n : 0.3 + 0.0447 * (n - 1); // 1 = a small ear (still outside the head outline), 5 ≈ 0.48, 10 ≈ 0.70, 20 ≈ 1.15
// the number of ears to draw now: the counter, with a small pop on a ±1 change and the continuous value while it rolls
function earN(A, t) {
  const L = A._led; if (!L) return 0;
  const {v, cont, changeT, delta} = L;
  if (t < changeT - 1e-6) return cont;
  if (delta && Math.abs(delta) <= 3 && t - changeT < 0.34) return (v - delta) + delta * easeOutBack(clamp((t - changeT) / 0.34));
  return v;
}
function earGeom(n, sg, t, seed, scale = 1, extra = 0, flare = 0) {
  const ry = earRy(n) * scale, rx = ry * 0.78, big = clamp((n - 8) / 12);
  const flap = Math.sin(t * 3.1 + seed + (sg > 0 ? 0 : 1.6)) * 0.07 * big + Math.sin(t * 7.3 + seed) * 0.012 * big;
  const th = sg * (0.12 + 0.011 * n + flap) + extra + sg * flare;
  const ax = sg * 0.945, ay = 0.10; // attach point (head radius units)
  const c = Math.cos(th), s = Math.sin(th);
  return {ax, ay, th, rx, ry, tip: [ax + s * 1.42 * ry, ay - c * 1.42 * ry]};
}
function drawEar(ctx, g, skin) {
  ctx.save(); ctx.translate(g.ax, g.ay); ctx.rotate(g.th);
  ctx.lineJoin = 'round'; ctx.lineWidth = LWU; ctx.strokeStyle = INK;
  fs(ctx, el(0, -0.42 * g.ry, g.rx, g.ry), skin, LWU);
  ctx.fillStyle = dark(skin, 0.1); ctx.fill(el(0, -0.38 * g.ry, g.rx * 0.6, g.ry * 0.7));
  if (g.ry > 0.2) { ctx.lineWidth = Math.max(LWU * 0.5, g.ry * 0.05); ctx.strokeStyle = 'rgba(60,30,20,.45)'; ctx.beginPath(); ctx.arc(0, -0.38 * g.ry, g.rx * 0.38, 0.7, 4.3); ctx.stroke(); }
  ctx.restore();
}
function drawHat(ctx, hat, tips) {
  const col = hat.color || '#7c8f4a';
  ctx.lineJoin = 'round'; ctx.lineWidth = LWU; ctx.strokeStyle = INK;
  if (hat.type === 'perch') { // balanced on the two ear tips: the brim rests on them, the crown above
    const by = Math.min(tips[0][1], tips[1][1]) + 0.13, hw = Math.max(Math.abs(tips[0][0]), Math.abs(tips[1][0])) + 0.15;
    const cr = new Path2D(); cr.moveTo(-0.72, by); cr.quadraticCurveTo(-0.8, by - 0.55, -0.55, by - 0.92); cr.quadraticCurveTo(0, by - 1.02, 0.55, by - 0.92); cr.quadraticCurveTo(0.8, by - 0.55, 0.72, by); cr.closePath();
    fs(ctx, cr, col, LWU); fs(ctx, rr(-0.76, by - 0.32, 1.52, 0.2, 0.05), hat.band || '#f4e4c8', LWU * 0.75);
    fs(ctx, el(0, by, hw, 0.16), dark(col, 0.12), LWU); return;
  }
  const hy = hat.y ?? -0.66; // bucket hat sunk to the eyebrows: crown above the brim line
  const cr = new Path2D(); cr.moveTo(-0.97, hy); cr.quadraticCurveTo(-1.0, hy - 0.5, -0.74, hy - 0.84); cr.quadraticCurveTo(0, hy - 0.96, 0.74, hy - 0.84); cr.quadraticCurveTo(1.0, hy - 0.5, 0.97, hy); cr.closePath();
  fs(ctx, cr, col, LWU); fs(ctx, rr(-0.99, hy - 0.3, 1.98, 0.2, 0.05), hat.band || '#f4e4c8', LWU * 0.75);
  fs(ctx, el(0, hy, 1.2, 0.13), dark(col, 0.12), LWU);
}
// args: {A: the actor object (the same one the shot lists), t, n?: override (number of ears), ears?: false, hat?: {type, color, band, y}}
function earsG(ctx, {A, t = 0, n = null, ears = true, hat = null, swing = 0, hatHop = 0, flare = 0} = {}) {
  if (!A || !A._xy || !A._head || !A._spec || (A._alpha ?? 1) <= 0.02) return;
  const R = A._headR, s = A._s, fl = A.flip ? -1 : 1, skin = A._spec.skin || '#e3b38e'; LWU = 0.8 / R;
  const num = n != null ? n : earN(A, t), seed = (A.id || 'x').length * 1.7 + (A.id || 'x').charCodeAt(0);
  ctx.save(); ctx.globalAlpha *= A._alpha ?? 1;
  ctx.translate(A._head[0], A._head[1]); ctx.rotate(rad(((A._st?.tilt || 0) + (A._st?.lean || 0)) * fl)); ctx.scale(s * fl, s); ctx.scale(R, R);
  const tips = [], L = A._led, dq = L && n == null && L.delta && Math.abs(L.delta) <= 3 ? (t - L.changeT) / 0.34 : 9;
  const sc = dq >= 0 && dq < 1 ? 1 + 0.3 * Math.sin(dq * Math.PI) * Math.sign(L.delta) : 1; // grow: a bulge; shrink: a dip, then settle
  if (ears && num > 0.02) {
    ctx.save();
    const P = new Path2D(); P.rect(-8, -8, 16, 16); P.moveTo(0.93 + 0.03, 0); P.ellipse(0, 0, 0.93 + 0.03, 1.03, 0, 0, Math.PI * 2); ctx.clip(P, 'evenodd');
    for (const sg of [1, -1]) { const g = earGeom(num, sg, t, seed, sc, swing, flare); tips.push(g.tip); drawEar(ctx, g, skin); }
    ctx.restore();
  } else if (hat?.type === 'perch') for (const sg of [1, -1]) tips.push(earGeom(0.0, sg, t, seed).tip);
  if (hat) { ctx.save(); if (hatHop) { ctx.translate(0, -hatHop); ctx.rotate(-hatHop * 0.25); } drawHat(ctx, hat, tips); ctx.restore(); }
  if (L && L.delta && n == null) { // the pop: a ring and ticks around each ear on every change (ember closing in = shrink, gold opening out = grow)
    const q = (t - L.changeT) / 0.6;
    if (q >= 0 && q < 1) {
      const grow = L.delta > 0, pu = 1 / (R * s), col = grow ? '#ffc94a' : '#ff6a4d', num2 = Math.max(0.5, L.v);
      ctx.lineCap = 'round';
      for (const sg of [1, -1]) {
        const g = earGeom(Math.max(0.5, grow ? L.v : L.v - L.delta * 0), sg, t, seed), cx = g.ax + Math.sin(g.th) * 0.42 * g.ry + sg * g.rx * 0.2, cy = g.ay - Math.cos(g.th) * 0.42 * g.ry;
        const rr0 = (g.ry + 0.35) * (grow ? 0.7 + 0.9 * q : 1.7 - 0.9 * q);
        ctx.globalAlpha = (A._alpha ?? 1) * (1 - q); ctx.strokeStyle = col; ctx.lineWidth = 7 * pu * (1 - q * 0.6); ctx.beginPath(); ctx.ellipse(cx, cy, rr0 * 0.8, rr0, 0, 0, 7); ctx.stroke();
        for (let i = 0; i < 6; i++) { const a = i * 1.047 + 0.4, r1 = rr0 * (grow ? 1.05 : 1.45), r2 = rr0 * (grow ? 1.45 : 1.05); ctx.lineWidth = 6 * pu; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r1 * 0.8, cy + Math.sin(a) * r1); ctx.lineTo(cx + Math.cos(a) * r2 * 0.8, cy + Math.sin(a) * r2); ctx.stroke(); }
      }
      ctx.globalAlpha = 1;
    }
  }
  ctx.restore();
}

// ---------------------------------------------------------------- pictures, bubbles, clock, small things
function bubbleCloud(ctx, k, r) { // a cloud-shaped thought bubble, origin at its centre
  const p = new Path2D(); for (const [x, y, q] of [[-0.78, 0.1, 0.5], [-0.35, -0.5, 0.55], [0.3, -0.52, 0.55], [0.78, 0.0, 0.52], [0.4, 0.5, 0.5], [-0.3, 0.52, 0.5], [0, 0, 0.8]]) { p.moveTo(x * r + q * r, y * r); p.arc(x * r, y * r, q * r, 0, Math.PI * 2); }
  ctx.lineJoin = 'round'; ctx.lineWidth = 12; ctx.strokeStyle = INK; ctx.stroke(p); ctx.fillStyle = '#fff6e2'; ctx.fill(p);
  for (const [x, y, q] of [[-1.15, 1.05, 0.2], [-1.5, 1.5, 0.12]]) { fs(ctx, el(x * r, y * r, q * r, q * r), '#fff6e2', 6); }
}
function thoughtG(ctx, {kind = 'test', k = 1, r = 170, t = 0} = {}) {
  if (k <= 0) return; const sc = Math.max(0.01, easeOutBack(k)); ctx.save(); ctx.scale(sc, sc); bubbleCloud(ctx, k, r);
  ctx.save(); ctx.scale(r / 170, r / 170);
  if (kind === 'test') { // a test paper with a red mark and a red circled F
    ctx.rotate(-0.08); fs(ctx, rr(-70, -105, 140, 190, 8), '#fffdf4', 6); ctx.strokeStyle = '#b9b3a2'; ctx.lineWidth = 4;
    for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-48, -60 + i * 28); ctx.lineTo(i % 2 ? 36 : 48, -60 + i * 28); ctx.stroke(); }
    ctx.strokeStyle = '#d9382c'; ctx.lineWidth = 9; ctx.beginPath(); ctx.arc(26, -60, 30, 0, 7); ctx.stroke(); ctx.fillStyle = '#d9382c'; ctx.font = '60px GraceCaption'; ctx.textAlign = 'center'; ctx.fillText('F', 26, -40); ctx.textAlign = 'left';
    ctx.beginPath(); ctx.moveTo(-50, 52); ctx.lineTo(10, 70); ctx.stroke();
  } else if (kind === 'boy') { // a boy's face and a heart he does not know about
    fs(ctx, el(0, 8, 62, 68), '#e3b38e', 7); const h = new Path2D(); h.moveTo(-64, -10); h.quadraticCurveTo(-60, -76, 0, -78); h.quadraticCurveTo(64, -76, 62, -8); h.quadraticCurveTo(30, -34, 0, -38); h.quadraticCurveTo(-30, -34, -64, -10); fs(ctx, h, '#3a2218', 6);
    for (const sx of [-24, 24]) { fs(ctx, el(sx, 6, 11, 14), '#fff', 4); ctx.fillStyle = INK; ctx.fill(el(sx + 3, 8, 6, 7)); }
    ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, 30, 22, 0.25, Math.PI - 0.25); ctx.stroke();
    const hh = new Path2D(); hh.moveTo(0, -88); hh.bezierCurveTo(-34, -118, -64, -80, 0, -50); hh.bezierCurveTo(64, -80, 34, -118, 0, -88); ctx.save(); ctx.translate(86, -28); ctx.rotate(0.3); ctx.scale(0.6, 0.6); fs(ctx, hh, '#e2574c', 8); ctx.restore();
  } else { // a friend walking away: small figure from behind, the gap, a dashed line
    fs(ctx, el(80, -8, 28, 30), '#c98b5e', 6); fs(ctx, rr(52, 16, 56, 70, 12), '#9a7ab0', 6); fs(ctx, rr(56, 82, 18, 40, 6), '#3a2a20', 5); fs(ctx, rr(88, 82, 18, 40, 6), '#3a2a20', 5);
    fs(ctx, el(80, -22, 30, 22), '#1f1512', 5);
    ctx.setLineDash([12, 12]); ctx.strokeStyle = '#8a7a66'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-70, 60); ctx.lineTo(30, 60); ctx.stroke(); ctx.setLineDash([]);
    fs(ctx, el(-80, -6, 28, 30), '#e3b38e', 6); fs(ctx, rr(-108, 18, 56, 70, 12), '#5a7fb0', 6); fs(ctx, rr(-102, 84, 18, 36, 6), '#3a2a20', 5); fs(ctx, rr(-72, 84, 18, 36, 6), '#3a2a20', 5);
  }
  ctx.restore(); ctx.restore();
}
// a speech bubble full of scribbles (the words that never arrive). origin = centre; tail = [dx, dy] to the speaker's mouth
function scribbleG(ctx, {k = 1, t = 0, w = 360, h = 190, tail = [-170, 150], fade = 0} = {}) {
  if (k <= 0) return; const sc = Math.max(0.01, easeOutBack(k)); ctx.save(); ctx.scale(sc, sc); ctx.globalAlpha *= 1 - clamp(fade);
  const p = new Path2D(); p.roundRect(-w / 2, -h / 2, w, h, 60);
  const tl = new Path2D(); if (tail) tl.moveTo(tail[0] - 34, tail[1] - 130); if (tail) { tl.lineTo(tail[0], tail[1]); tl.lineTo(tail[0] + 36, tail[1] - 134); tl.closePath(); }
  ctx.lineJoin = 'round'; ctx.lineWidth = 10; ctx.strokeStyle = INK; ctx.stroke(p); ctx.stroke(tl); ctx.fillStyle = '#fffaf0'; ctx.fill(p); ctx.fill(tl); ctx.fill(p);
  ctx.strokeStyle = '#6b5a52'; ctx.lineWidth = 8; ctx.lineCap = 'round';
  for (let row = 0; row < 3; row++) { const y = -52 + row * 52, len = [260, 300, 200][row]; ctx.beginPath(); ctx.moveTo(-len / 2, y);
    for (let i = 1; i <= 14; i++) ctx.lineTo(-len / 2 + len * i / 14, y + (i % 2 ? -1 : 1) * (14 + 4 * Math.sin(t * 9 + i + row))); ctx.stroke(); }
  ctx.restore();
}
function wallClockG(ctx, {h = 12, m = 0, shake = 0} = {}) {
  ctx.save(); if (shake) ctx.translate(Math.sin(shake * 60) * 4, 0);
  fs(ctx, el(0, 0, 135, 135), '#6e4426', 8); fs(ctx, el(0, 0, 112, 112), '#fff6e2', 6);
  ctx.strokeStyle = INK; ctx.lineCap = 'round'; for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; ctx.lineWidth = i % 3 ? 5 : 9; ctx.beginPath(); ctx.moveTo(Math.sin(a) * 92, -Math.cos(a) * 92); ctx.lineTo(Math.sin(a) * 106, -Math.cos(a) * 106); ctx.stroke(); }
  const am = rad(m * 6), ah = rad(((h % 12) + m / 60) * 30); ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(ah) * 56, -Math.cos(ah) * 56); ctx.stroke();
  ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(am) * 84, -Math.cos(am) * 84); ctx.stroke(); fs(ctx, el(0, 0, 10, 10), INK, 0);
  ctx.restore();
}
function sofaG(ctx, {w = 780, color = '#c4643a', k = 1} = {}) { // origin = bottom centre (the floor line under the cushions)
  ctx.save(); ctx.scale(k, k); const d = dark(color, 0.18);
  fs(ctx, rr(-w / 2 + 20, -400, w - 40, 330, 70), d, 7);
  fs(ctx, rr(-w / 2 + 60, -120, w - 120, 110, 30), color, 7);
  fs(ctx, rr(-w / 2 - 30, -250, 110, 250, 44), mix(color, '#000000', 0.08), 7); fs(ctx, rr(w / 2 - 80, -250, 110, 250, 44), mix(color, '#000000', 0.08), 7);
  for (const x of [-w / 2 + 70, w / 2 - 70]) fs(ctx, rr(x - 18, 0, 36, 28, 6), '#3c2c24', 5);
  fs(ctx, rr(-w * 0.3 - 56, -272, 112, 100, 28), '#f4b942', 6); fs(ctx, rr(w * 0.34 - 60, -280, 120, 110, 50), '#e8b878', 6); fs(ctx, el(w * 0.34, -226, 10, 10), '#b5552f', 4);
  ctx.restore();
}
function floorLampG(ctx, {on = 1} = {}) { // origin = foot
  fs(ctx, el(0, 0, 54, 14), '#3c2c24', 5); fs(ctx, rr(-7, -560, 14, 560, 4), '#3c2c24', 4);
  fs(ctx, poly([[-70, -640], [70, -640], [96, -540], [-96, -540]]), on ? '#ffe08a' : '#cdb58a', 6);
}
function peaG(ctx, {r = 22} = {}) { fs(ctx, el(0, 0, r, r), '#7cb04a', 5); ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fill(el(-r * 0.3, -r * 0.35, r * 0.28, r * 0.18, -0.5)); }
function deskFrontG(ctx, {w = 1160, y0 = 0, color = WARM.wood} = {}) { // a table front: slab + apron to the bottom of the frame (origin = top-centre of the slab)
  fs(ctx, rr(-w / 2, 30, w, 540, 8), dark(color, 0.12), 6); fs(ctx, rr(-w / 2 - 20, 0, w + 40, 46, 12), color, 6);
  ctx.strokeStyle = 'rgba(40,20,10,.25)'; ctx.lineWidth = 4; for (let x = -w / 2 + 70; x < w / 2; x += 140) { ctx.beginPath(); ctx.moveTo(x, 80); ctx.lineTo(x, 540); ctx.stroke(); }
}
function dishesG(ctx, {n = 3, w = 700} = {}) { // plates on a table, origin = top-centre of the slab
  for (let i = 0; i < n; i++) { const x = (i - (n - 1) / 2) * (w / n); fs(ctx, el(x, -6, 70, 16), '#fbf1dc', 5); fs(ctx, el(x, -12, 40, 8), '#e9d8b8', 0); ctx.fillStyle = i % 2 ? '#c4643a' : '#7c8f4a'; ctx.fill(el(x - 8, -16, 18, 8)); }
  fs(ctx, rr(-18, -74, 36, 70, 8), '#d9a441', 5); ctx.fillStyle = '#ffd77a'; ctx.fill(el(0, -84, 10, 18));
}
function grillG(ctx, {t = 0} = {}) { // a kettle barbecue (origin = foot of the legs)
  ctx.save(); for (const x of [-60, 60]) fs(ctx, rr(x - 7, -150, 14, 150, 4), '#3c2c24', 4);
  fs(ctx, poly([[-110, -260], [110, -260], [90, -150], [-90, -150]]), '#3c3a40', 7);
  glow(ctx, 0, -255, 180, 0.6, '255,130,50'); fs(ctx, el(0, -262, 100, 16), '#ff8a3a', 4);
  for (let i = 0; i < 4; i++) { const x = -66 + i * 44; fs(ctx, rr(x - 18, -280 - (i % 2) * 4, 40, 18, 9), '#b5552f', 4); }
  fs(ctx, rr(-120, -300, 240, 12, 4), '#555', 3); ctx.restore();
}
function buntingG(ctx, {n = 9, w = 1180} = {}) {
  ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-40, 0); ctx.quadraticCurveTo(w / 2, 90, w + 40, 0); ctx.stroke();
  for (let i = 0; i < n; i++) { const q = (i + 0.5) / n, x = q * w, y = 90 * 2 * q * (1 - q) * 1.0; fs(ctx, poly([[x - 28, y], [x + 28, y], [x, y + 64]]), ['#c4643a', '#f4b942', '#7c8f4a', '#e2574c', '#fbf1dc'][i % 5], 4); }
}
function bookcaseG(ctx) { // origin = top-left corner, 230 × 760
  fs(ctx, rr(0, 0, 230, 760, 8), '#5f3d52', 7);
  for (let r = 0; r < 4; r++) { const y = 30 + r * 180; fs(ctx, rr(14, y + 150, 202, 14, 3), '#3c2c24', 4); let x = 22; for (let i = 0; i < 7; i++) { const bw = 18 + hashN(i + r * 7) * 12, bh = 100 + hashN(i * 3 + r) * 40; fs(ctx, rr(x, y + 150 - bh, bw, bh, 3), ['#c4643a', '#f4b942', '#7c8f4a', '#5a7fb0', '#e2574c', '#d9c9a8', '#9a7ab0'][(i + r * 2) % 7], 3); x += bw + 4; } }
}


// a big counter that sits over an actor's head (the opening: 2-3x the engine's plate), pulsing on every change (scale + red flash on a fall, gold on a rise)
function bigCtrG(ctx, {A, t = 0, label = 'EARS', k = 1} = {}) {
  if (!A || !A._xy || !A._head || (A._alpha ?? 1) <= 0.02) return;
  const L = A._led; if (!L) return; const R = A._headR * A._s, hx = A._head[0], hy = A._head[1];
  const q = L.delta ? (t - L.changeT) / 0.55 : 9, on = q >= 0 && q < 1, fall = L.delta < 0, pul = on ? 1 + 0.38 * Math.sin(Math.min(1, q * 1.6) * Math.PI) : 1;
  const w = 3.9 * R * k, h = 1.9 * R * k;
  ctx.save(); ctx.translate(hx, hy - R * 1.45 - h * 0.6); ctx.scale(pul, pul);
  const p = new Path2D(); p.roundRect(-w / 2, -h / 2, w, h, h * 0.22);
  ctx.lineJoin = 'round'; ctx.lineWidth = 10; ctx.strokeStyle = INK; ctx.stroke(p); ctx.fillStyle = '#2a1a14'; ctx.fill(p);
  if (on) { ctx.globalAlpha = (fall ? 0.85 : 0.6) * (1 - q); ctx.fillStyle = fall ? '#ff3b2f' : '#ffd23f'; ctx.fill(p); ctx.globalAlpha = 1; }
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#e9d8b8'; ctx.font = `${h * 0.26}px GraceCaption`; ctx.fillText(label, -w * 0.2, -h * 0.02);
  ctx.font = `${h * 0.82}px GraceCaption`; ctx.lineWidth = 8; ctx.strokeStyle = INK; const txt = String(Math.max(0, Math.round(L.v)));
  ctx.fillStyle = on && fall && q < 0.5 ? '#ffffff' : (L.v <= 0 ? '#ffd23f' : '#ff6a4d'); ctx.fillText(txt, w * 0.27, h * 0.05);
  ctx.restore();
}
// a house seen from outside at night: the wall (with a hole = the lit window), trim, sill and warm light spilling on the wall. Draw as a FRONT prop at (0,0) with the camera fixed at z=1 (world = screen).
function nightWallG(ctx, {hx = 120, hy = 540, hw = 840, hh = 760} = {}) {
  const p = new Path2D(); p.rect(-20, -20, 1120, 1960); p.roundRect(hx, hy, hw, hh, 18);
  ctx.save(); ctx.clip(p, 'evenodd');
  const g = ctx.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, '#6f5078'); g.addColorStop(0.55, '#85607f'); g.addColorStop(1, '#4e4a45');
  ctx.fillStyle = g; ctx.fillRect(-20, -20, 1120, 1960);
  ctx.strokeStyle = 'rgba(40,20,50,.22)'; ctx.lineWidth = 4; for (let y = 60; y < 1500; y += 70) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1080, y); ctx.stroke(); for (let x = (y / 70 % 2) * 60; x < 1080; x += 120) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 70); ctx.stroke(); } }
  fs(ctx, rr(-30, -30, 1140, 250, 0), '#8b3f30', 6); ctx.strokeStyle = 'rgba(40,10,10,.35)'; ctx.lineWidth = 4; for (let x = -20; x < 1100; x += 90) { ctx.beginPath(); ctx.arc(x, 120, 50, 0.1, Math.PI - 0.1); ctx.stroke(); }
  fs(ctx, rr(-30, 1500, 1140, 440, 0), '#5d6b3f', 6);
  ctx.restore();
  glow(ctx, 540, 920, 760, 0.35, '255,206,120');
  ctx.save(); ctx.lineJoin = 'round';
  const tr = new Path2D(); tr.roundRect(hx - 30, hy - 30, hw + 60, hh + 60, 30); tr.roundRect(hx, hy, hw, hh, 18);
  ctx.fillStyle = '#f1dfc0'; ctx.fill(tr, 'evenodd'); ctx.lineWidth = 8; ctx.strokeStyle = INK; ctx.stroke(tr);
  fs(ctx, rr(hx - 60, hy + hh + 22, hw + 120, 40, 12), '#d9b98a', 7);
  for (let i = 0; i < 7; i++) fs(ctx, el(hx + 40 + i * 120, hy + hh + 22, 36, 26), i % 2 ? '#e2574c' : '#f4b942', 5);
  fs(ctx, poly([[hx - 8, hy - 8], [hx + 120, hy - 8], [hx + 40, hy + hh * 0.7], [hx - 8, hy + hh * 0.7]]), '#f4b942', 6);
  fs(ctx, poly([[hx + hw + 8, hy - 8], [hx + hw - 120, hy - 8], [hx + hw - 40, hy + hh * 0.7], [hx + hw + 8, hy + hh * 0.7]]), '#f4b942', 6);
  ctx.restore();
}
// a framed old family photo in sepia: a young Frank with little Mia on his shoulders (origin = centre, 700 x 900)
function familyPhotoG(ctx, {k = 1, t = 0} = {}) {
  ctx.save(); ctx.scale(k, k); ctx.rotate(-0.03);
  fs(ctx, rr(-370, -470, 740, 940, 22), '#7a4b2a', 12); fs(ctx, rr(-330, -430, 660, 860, 8), '#f0e0c0', 6);
  const g = ctx.createLinearGradient(0, -400, 0, 400); g.addColorStop(0, '#e3c797'); g.addColorStop(1, '#bb9461'); ctx.fillStyle = g; ctx.fillRect(-300, -400, 600, 800);
  ctx.fillStyle = 'rgba(120,80,40,.25)'; ctx.fillRect(-300, 160, 600, 240);
  const sk = '#c79a6c', cl = '#8a5a34', cl2 = '#6a4224';
  ctx.translate(0, 95);
  fs(ctx, rr(-95, 40, 70, 250, 16), cl2, 8); fs(ctx, rr(25, 40, 70, 250, 16), cl2, 8); // legs
  fs(ctx, rr(-120, -120, 240, 200, 40), cl, 9); // torso
  fs(ctx, rr(-210, -110, 80, 200, 36), cl, 8); fs(ctx, rr(130, -110, 80, 200, 36), cl, 8);
  fs(ctx, el(0, -190, 82, 88), sk, 9); ctx.fillStyle = '#3a2418'; ctx.fill(el(0, -240, 84, 40));
  fs(ctx, el(-88, -186, 22, 34), sk, 7); fs(ctx, el(88, -186, 22, 34), sk, 7);
  for (const sx of [-30, 30]) { fs(ctx, el(sx, -190, 12, 15), '#fff6e2', 4); ctx.fillStyle = INK; ctx.fill(el(sx, -186, 6, 8)); }
  ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, -168, 30, 0.2, Math.PI - 0.2); ctx.stroke();
  // little Mia on his shoulders: her legs hang down both sides of his head, her dress and head are above it, her hands in his hair
  for (const sx of [-1, 1]) { fs(ctx, rr(sx * 112 - 28, -300, 56, 190, 22), '#c79a6c', 7); fs(ctx, el(sx * 112, -108, 36, 20), '#4a2e1c', 6); }
  fs(ctx, rr(-62, -440, 124, 150, 34), '#a8714a', 8);
  fs(ctx, rr(-120, -400, 64, 30, 14), sk, 6); fs(ctx, rr(56, -400, 64, 30, 14), sk, 6);
  fs(ctx, el(0, -490, 52, 56), sk, 8); ctx.fillStyle = '#2a1a12'; ctx.fill(el(0, -522, 54, 30)); ctx.fill(el(-48, -482, 14, 34)); ctx.fill(el(48, -482, 14, 34));
  for (const sx of [-18, 18]) { fs(ctx, el(sx, -492, 8, 10), '#fff6e2', 3); ctx.fillStyle = INK; ctx.fill(el(sx, -490, 4, 5)); }
  ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, -478, 18, 0.1, Math.PI - 0.1); ctx.stroke();
  ctx.restore();
}

// ---------------------------------------------------------------- places
Object.assign(SETS, {
  // an office: window with a view of the village, a filing cabinet, a wall clock, a bulletin board, a desk behind. Warm honey, daylight.
  geOffice({time = 'noon', clock = true} = {}) {
    return ctx => {
      room(ctx, '#efd7ad', '#c98f5a', '#b98a5e');
      windowPane(ctx, 80, 300, 340, 520, time);
      ctx.strokeStyle = 'rgba(120,80,40,.28)'; ctx.lineWidth = 6; for (let y = 320; y < 800; y += 44) { ctx.beginPath(); ctx.moveTo(86, y); ctx.lineTo(414, y); ctx.stroke(); }
      fs(ctx, rr(560, 300, 420, 300, 10), '#c98f5a', 8); fs(ctx, rr(580, 320, 380, 260, 6), '#e9c38f', 4);
      for (const [x, y, c] of [[600, 340, '#fffdf4'], [700, 360, '#f9e6a8'], [810, 340, '#fffdf4'], [620, 460, '#f9e6a8'], [760, 470, '#fffdf4'], [870, 450, '#fbd9c8']]) { ctx.save(); ctx.translate(x + 40, y + 50); ctx.rotate((hashN(x + y) - 0.5) * 0.2); fs(ctx, rr(-40, -50, 80, 100, 4), c, 4); ctx.strokeStyle = '#b9b3a2'; ctx.lineWidth = 3; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-28, -30 + i * 20); ctx.lineTo(28, -30 + i * 20); ctx.stroke(); } ctx.restore(); }
      if (clock) { ctx.save(); ctx.translate(780, 680); wallClockG(ctx, {h: 2, m: 40}); ctx.restore(); }
      fs(ctx, rr(890, 800, 150, 500, 10), '#7c8f4a', 7); for (const y of [840, 990, 1140]) { fs(ctx, rr(906, y, 118, 120, 6), '#8fa35a', 5); fs(ctx, rr(948, y + 44, 34, 12, 4), '#3c2c24', 3); }
      fs(ctx, rr(430, 1040, 430, 48, 8), WARM.wood, 6); fs(ctx, rr(450, 1088, 28, 212, 4), WARM.woodD, 5); fs(ctx, rr(812, 1088, 28, 212, 4), WARM.woodD, 5);
      fs(ctx, rr(520, 1000, 70, 44, 6), '#fbf1dc', 4); fs(ctx, rr(660, 1010, 120, 30, 4), '#e2574c', 4);
      glow(ctx, 250, 560, 520, 0.18, '255,230,160');
    };
  },
  // the kitchen of gKitchen with the black "hole" turned into an oven: cream door, glass window with the glow of the heat, handle, knobs
  geKitchen({time = 'day'} = {}) {
    return ctx => {
      SETS.gKitchen({time})(ctx);
      fs(ctx, rr(80, 760, 360, 300, 20), '#b5552f', 6);
      for (let i = 0; i < 4; i++) fs(ctx, el(130 + i * 80, 786, 17, 17), '#fbf1dc', 4);
      fs(ctx, rr(112, 820, 296, 224, 22), '#f1dfc0', 6); fs(ctx, rr(144, 856, 232, 128, 16), '#8a4a2a', 5); glow(ctx, 260, 930, 140, 0.55, '255,170,70');
      fs(ctx, rr(150, 862, 70, 30, 8), 'rgba(255,255,255,.35)', 0); fs(ctx, rr(140, 1004, 240, 16, 8), '#c9c0ae', 5);
      if (time === 'night') { ctx.fillStyle = 'rgba(40,20,50,.40)'; ctx.fillRect(0, 0, 1080, 1920); }
    };
  },
  // the garden at the end of the day: the dusk sky with the long shadows of the hour on everything (a property of the place, the whole scene)
  geYardDusk() { return ctx => { SETS.gYard({time: 'dusk'})(ctx); ctx.fillStyle = 'rgba(70,24,44,.34)'; ctx.fillRect(0, 0, 1080, 1920); glow(ctx, 300, 760, 420, 0.35, '255,170,90'); }; },
  // a house at night from outside: only the lit room behind the window (the wall with the hole is the FRONT prop nightWallG)
  geNightOut() {
    return ctx => {
      room(ctx, '#b080a2', '#876079', '#a8714a', 1240);
      windowPane(ctx, 130, 330, 220, 360, 'night');
      ctx.save(); ctx.translate(690, 300); bookcaseG(ctx); ctx.restore();
      fs(ctx, rr(400, 380, 170, 220, 10), '#c98f5a', 7); fs(ctx, rr(414, 394, 142, 192, 4), '#f1d9b5', 4);
      ctx.save(); ctx.translate(880, 1240); floorLampG(ctx, {on: 1}); ctx.restore();
      glow(ctx, 880, 700, 700, 0.5, '255,206,120'); glow(ctx, 540, 1100, 600, 0.2, '255,220,160');
      fs(ctx, el(540, 1280, 400, 90), '#b5552f', 7); fs(ctx, el(540, 1280, 330, 66), '#fbf1dc', 0); fs(ctx, el(540, 1280, 270, 50), '#c4643a', 0);
    };
  },
  // a meeting room: a whiteboard with a lightbulb scribble, a big window, a long table drawn as the deskFrontG prop in front.
  geMeeting({time = 'noon'} = {}) {
    return ctx => {
      room(ctx, '#ecd2a6', '#b98a5e', '#a97a52');
      windowPane(ctx, 700, 280, 300, 520, time);
      fs(ctx, rr(70, 290, 520, 400, 12), '#fffdf4', 9); fs(ctx, rr(70, 290, 520, 56, 12), '#c4643a', 9);
      ctx.fillStyle = '#fffdf4'; ctx.font = '44px GraceCaption'; ctx.fillText('IDEAS', 96, 334);
      ctx.strokeStyle = '#5a7fb0'; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(110, 450); ctx.lineTo(250, 450); ctx.moveTo(110, 500); ctx.lineTo(300, 500); ctx.moveTo(110, 550); ctx.lineTo(210, 550); ctx.stroke();
      ctx.strokeStyle = '#d9a441'; ctx.lineWidth = 9; ctx.beginPath(); ctx.arc(440, 500, 52, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(420, 560); ctx.lineTo(460, 560); ctx.moveTo(424, 580); ctx.lineTo(456, 580); ctx.stroke();
      for (let i = 0; i < 6; i++) { const a = -2.5 + i * 0.5; ctx.beginPath(); ctx.moveTo(440 + Math.cos(a) * 70, 500 + Math.sin(a) * 70); ctx.lineTo(440 + Math.cos(a) * 92, 500 + Math.sin(a) * 92); ctx.stroke(); }
      fs(ctx, rr(70, 690, 520, 18, 4), '#8a8f96', 5);
      glow(ctx, 850, 520, 480, 0.2, '255,230,160');
    };
  },
  // the family barbecue: the garden, bunting, a table is a prop in front.
  geBBQ({time = 'noon'} = {}) {
    return ctx => { SETS.gYard({time})(ctx); ctx.save(); ctx.translate(-50, 330); buntingG(ctx, {}); ctx.restore(); };
  },
  // the living room at night: plum walls, a window with the moon, a bookcase, a lit floor lamp with a big pool of light on the wall and floor, a rug.
  // Dark on purpose but READABLE (it is a lit interior): every surface keeps its colour, the lamp glow lifts the middle of the room.
  geLiving({lamp = 1} = {}) {
    return ctx => {
      room(ctx, '#b080a2', '#876079', '#a8714a');
      ctx.fillStyle = 'rgba(255,235,200,.05)'; for (let x = 60; x < 1080; x += 120) ctx.fillRect(x, 0, 40, 1040);
      windowPane(ctx, 90, 330, 260, 430, 'night');
      ctx.save(); ctx.translate(660, 300); bookcaseG(ctx); ctx.restore();
      fs(ctx, rr(400, 380, 170, 220, 10), '#c98f5a', 7); fs(ctx, rr(414, 394, 142, 192, 4), '#f1d9b5', 4); fs(ctx, el(485, 470, 26, 28), '#e3b38e', 4); fs(ctx, rr(458, 498, 54, 60, 10), '#c4643a', 4);
      fs(ctx, el(540, 1560, 440, 150), '#b5552f', 7); fs(ctx, el(540, 1560, 360, 112), '#fbf1dc', 0); fs(ctx, el(540, 1560, 300, 90), '#c4643a', 0);
      ctx.save(); ctx.translate(955, 1300); floorLampG(ctx, {on: lamp}); ctx.restore();
      if (lamp) { glow(ctx, 955, 700, 900, 0.62, '255,206,120'); glow(ctx, 955, 1320, 500, 0.28, '255,206,120'); glow(ctx, 540, 900, 700, 0.12, '255,220,160'); }
      ctx.fillStyle = 'rgba(28,12,50,.05)'; ctx.fillRect(0, 0, 1080, 1920);
      if (lamp) glow(ctx, 955, 700, 760, 0.32, '255,206,120');
    };
  },
});
Object.assign(PROPS, {bigCtrG, nightWallG, familyPhotoG, earsG, thoughtG, scribbleG, wallClockG, sofaG, peaG, deskFrontG, dishesG, grillG, buntingG, bookcaseG});
