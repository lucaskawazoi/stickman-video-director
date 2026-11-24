// R1 · grace-remains ep14 "The Ring": a world where whatever you borrowed and lost floats back to the surface.
// Everything that comes back wears the NAME OF ITS OWNER on a strip of masking tape (the way it is done at home), so the rule reads with the sound off.
// New: tape + item drawers (umbrella, keys, casserole dish, bicycle, book, glove, paddle, football, library book), `popG` (an item jumps out of a
// puddle / bowl, or floats up out of the lake, with a ring of ripples and bubbles), ripples, the gold ring (on a hand, passed hand to hand, falling,
// lying on the lake bottom), a ring box with a ribbon tag, a baby photo, a cereal bowl, a school-photo set, the lake (dock / bank / wide), the lake
// bottom, the rainy street with puddles, grandmother's room with a lake window. Registered into SETS/PROPS on import. NOTHING existing is edited.
import {Path2D} from '@napi-rs/canvas';
import {INK, mix, dark, light} from './r1-rig.mjs';
import {SETS, PROPS} from './r1-world.mjs';
import {fs, rr, el, poly, hashN, glow, olive, sky, cottage, cobbles, room, WARM, easeOutBack} from './r1-world-grace.mjs';
import './r1-world-grace-sign.mjs';   // living room gold, sofa, armchair, door leaf, tableG ...

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const eio = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const eoc = x => 1 - Math.pow(1 - clamp(x), 3);
const lerp = (a, b, k) => a + (b - a) * k;

export const LAKE = {far: 1000, deckTop: 1440, deckFace: 1500, deckEnd: 800};
export const PUDDLES = [[300, 1640, 170], [800, 1560, 130], [560, 1800, 220], [130, 1790, 150], [930, 1760, 170], [500, 1500, 100]];

// ------------------------------------------------------------------ tape: the owner's name, in marker
const TAPE = '#f1e3b8';
function tape(ctx, text, {x = 0, y = 0, w = 150, h = 54, rot = 0, ink = '#2a211e'} = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  const p = new Path2D(), z = h * 0.12;
  p.moveTo(-w / 2, -h / 2); p.lineTo(w / 2, -h / 2);
  for (let i = 0; i < 4; i++) p.lineTo(w / 2 + (i % 2 ? 0 : z), -h / 2 + h * (i + 1) / 4);
  p.lineTo(-w / 2, h / 2);
  for (let i = 0; i < 4; i++) p.lineTo(-w / 2 - (i % 2 ? 0 : z), h / 2 - h * (i + 1) / 4);
  p.closePath();
  fs(ctx, p, TAPE, 3.5);
  ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(-w / 2 + 4, -h / 2 + 3, w - 8, h * 0.16);
  let size = h * 0.8; ctx.font = `${size}px GraceCaption`; const tw = ctx.measureText(text).width;
  if (tw > w * 0.86) { size *= w * 0.86 / tw; ctx.font = `${size}px GraceCaption`; }
  ctx.fillStyle = ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, h * 0.04); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.restore();
}

// ------------------------------------------------------------------ the ring (gold only at the end of the film)
function ringShape(ctx, R, {rot = 0, gem = true} = {}) {
  ctx.save(); ctx.rotate(rot); ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.arc(0, 0, R * 0.6, 0, Math.PI * 2, true);
  ctx.fillStyle = '#ffc94a'; ctx.fill('evenodd'); ctx.lineWidth = Math.max(3, R * 0.14); ctx.strokeStyle = INK; ctx.stroke();
  ctx.strokeStyle = '#fff3c0'; ctx.lineWidth = Math.max(2, R * 0.09); ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, 0, R * 0.8, Math.PI * 1.05, Math.PI * 1.45); ctx.stroke();
  if (gem) { ctx.save(); ctx.translate(0, -R * 1.02); fs(ctx, poly([[-R * 0.3, 0], [-R * 0.18, -R * 0.3], [R * 0.18, -R * 0.3], [R * 0.3, 0], [0, R * 0.26]]), '#fff7e0', Math.max(2.5, R * 0.1)); ctx.restore(); }
  ctx.restore();
}
function star4(ctx, x, y, r, a = 1) {
  ctx.save(); ctx.translate(x, y); ctx.globalAlpha = a; ctx.fillStyle = '#fffbe8'; ctx.strokeStyle = '#ffc94a'; ctx.lineWidth = Math.max(2, r * 0.1);
  ctx.beginPath(); for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4 - Math.PI / 2, q = i % 2 ? r * 0.22 : r; ctx.lineTo(Math.cos(an) * q, Math.sin(an) * q); } ctx.closePath(); ctx.stroke(); ctx.fill(); ctx.restore();
}

// ------------------------------------------------------------------ things that come back (origin = bottom centre of the object, it grows upwards)
const HEIGHT = {umbrella: 330, keys: 190, dish: 150, bike: 190, book: 210, glove: 150, paddle: 330, ball: 90, libbook: 200};
const WIDTH = {umbrella: 280, keys: 120, dish: 250, bike: 340, book: 150, glove: 110, paddle: 100, ball: 160, libbook: 150};
const ITEMS = {
  umbrella(ctx, {label = '', color = '#c4643a', r = 130} = {}) {
    ctx.save(); ctx.lineCap = 'round'; const shaft = 1.45 * r, cy = -shaft - 18, R = r, D = R * 0.75;
    ctx.strokeStyle = INK; ctx.lineWidth = 15; ctx.beginPath(); ctx.moveTo(0, -18); ctx.lineTo(0, cy); ctx.stroke(); ctx.beginPath(); ctx.arc(-18, -18, 18, 0, Math.PI); ctx.stroke();
    ctx.strokeStyle = '#8a5a36'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(0, -18); ctx.lineTo(0, cy); ctx.stroke(); ctx.beginPath(); ctx.arc(-18, -18, 18, 0, Math.PI); ctx.stroke();
    const p = new Path2D(); p.moveTo(-R, cy); p.quadraticCurveTo(-R * 1.02, cy - D * 1.35, 0, cy - D * 1.18); p.quadraticCurveTo(R * 1.02, cy - D * 1.35, R, cy);
    for (let i = 3; i >= 0; i--) { const x0 = -R + (2 * R) * (i + 1) / 4, x1 = -R + (2 * R) * i / 4; p.quadraticCurveTo((x0 + x1) / 2, cy + R * 0.13, x1, cy); } p.closePath();
    fs(ctx, p, color, 6);
    ctx.save(); ctx.clip(p); ctx.strokeStyle = 'rgba(30,10,10,.3)'; ctx.lineWidth = 4; for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(0, cy - D * 1.18); ctx.quadraticCurveTo(i * R * 0.33, cy - D * 0.7, i * R * 0.5, cy + 10); ctx.stroke(); } ctx.restore();
    fs(ctx, rr(-6, cy - D * 1.25, 12, 22, 5), '#5a3a22', 4);
    if (label) tape(ctx, label, {x: 0, y: cy - D * 0.5, w: R * 1.15, h: R * 0.42, rot: -0.08});
    ctx.restore();
  },
  keys(ctx, {label = ''} = {}) {
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const [a, len] of [[-0.42, 66], [0.0, 80], [0.4, 70]]) { // three brass keys fanning down from the ring
      ctx.save(); ctx.translate(0, -150); ctx.rotate(a); ctx.strokeStyle = INK; ctx.lineWidth = 17; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, len); ctx.stroke(); ctx.beginPath(); ctx.arc(0, -3, 17, 0, 7); ctx.stroke();
      ctx.strokeStyle = '#d9a441'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, len); ctx.stroke(); ctx.beginPath(); ctx.arc(0, -3, 17, 0, 7); ctx.stroke();
      ctx.fillStyle = '#d9a441'; ctx.fillRect(4, len - 18, 14, 7); ctx.fillRect(4, len - 6, 11, 7); ctx.restore(); }
    ctx.strokeStyle = INK; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(0, -168, 26, 0, 7); ctx.stroke(); ctx.strokeStyle = '#cfc7b4'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, -168, 26, 0, 7); ctx.stroke();
    fs(ctx, rr(-60, -130, 120, 106, 18), '#f4b942', 6); // the fob
    if (label) { ctx.fillStyle = '#2a211e'; ctx.font = '62px GraceCaption'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, 0, -77); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; }
    ctx.restore();
  },
  dish(ctx, {label = '', stamp = ''} = {}) {
    ctx.save();
    for (const sg of [-1, 1]) fs(ctx, rr(sg * 118 - 22, -78, 44, 20, 10), '#efe2c6', 5); // handles
    fs(ctx, poly([[-112, -86], [112, -86], [96, -4], [-96, -4]]), '#f6ecd4', 6);
    ctx.fillStyle = '#c4643a'; ctx.fillRect(-106, -82, 212, 11);
    const lid = new Path2D(); lid.moveTo(-100, -86); lid.quadraticCurveTo(-90, -150, 0, -152); lid.quadraticCurveTo(90, -150, 100, -86); lid.closePath(); fs(ctx, lid, '#ffffff', 5);
    ctx.fillStyle = 'rgba(190,225,215,.35)'; ctx.fill(lid); fs(ctx, el(0, -156, 12, 9), '#efe2c6', 4);
    if (label) tape(ctx, label, {x: 0, y: -42, w: 130, h: 46, rot: 0.04});
    if (stamp) { ctx.save(); ctx.translate(0, -112); ctx.rotate(-0.08); ctx.strokeStyle = '#b3402a'; ctx.fillStyle = '#b3402a'; ctx.lineWidth = 4; ctx.strokeRect(-52, -22, 104, 44); ctx.font = '700 36px Impact, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(stamp, 0, 2); ctx.restore(); }
    ctx.restore();
  },
  bike(ctx, {label = '', color = '#c4643a'} = {}) {
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const x of [-112, 112]) { ctx.strokeStyle = INK; ctx.lineWidth = 15; ctx.beginPath(); ctx.arc(x, -62, 60, 0, 7); ctx.stroke(); ctx.strokeStyle = '#6a625a'; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(x, -62, 60, 0, 7); ctx.stroke();
      ctx.strokeStyle = 'rgba(80,70,60,.6)'; ctx.lineWidth = 2.5; for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; ctx.beginPath(); ctx.moveTo(x, -62); ctx.lineTo(x + Math.cos(a) * 58, -62 + Math.sin(a) * 58); ctx.stroke(); } }
    const fr = (w, c) => { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(-112, -62); ctx.lineTo(-20, -132); ctx.lineTo(112, -62); ctx.moveTo(-20, -132); ctx.lineTo(70, -132); ctx.lineTo(112, -62); ctx.moveTo(-112, -62); ctx.lineTo(0, -62); ctx.lineTo(-20, -132); ctx.moveTo(70, -132); ctx.lineTo(62, -168); ctx.lineTo(96, -176); ctx.moveTo(-30, -132); ctx.lineTo(-38, -152); ctx.stroke(); };
    fr(18, INK); fr(10, color);
    fs(ctx, rr(-66, -166, 56, 15, 7), '#3a2c24', 4); // saddle
    if (label) tape(ctx, label, {x: -10, y: -112, w: 118, h: 40, rot: -0.2});
    ctx.restore();
  },
  book(ctx, {label = '', color = '#9a7ab0'} = {}) {
    ctx.save(); fs(ctx, rr(-72, -208, 144, 204, 8), color, 6); fs(ctx, rr(-72, -208, 20, 204, 6), dark(color, 0.25), 5);
    ctx.fillStyle = 'rgba(255,244,214,.9)'; ctx.fillRect(-30, -178, 84, 10); ctx.fillRect(-30, -156, 60, 8);
    fs(ctx, rr(-52, -10, 118, 8, 2), '#fbf1dc', 3); if (label) tape(ctx, label, {x: 10, y: -96, w: 104, h: 42, rot: 0.1}); ctx.restore();
  },
  glove(ctx, {label = ''} = {}) {
    ctx.save(); const body = new Path2D(); body.moveTo(-34, -52); body.lineTo(-38, -112); body.quadraticCurveTo(-36, -148, 0, -148); body.quadraticCurveTo(36, -148, 38, -112); body.lineTo(34, -52); body.closePath();
    fs(ctx, poly([[30, -96], [76, -78], [70, -52], [30, -60]]), '#c4643a', 5); fs(ctx, body, '#c4643a', 6);
    ctx.strokeStyle = 'rgba(80,20,10,.35)'; ctx.lineWidth = 3; for (let y = -132; y < -60; y += 14) { ctx.beginPath(); ctx.moveTo(-28, y); ctx.lineTo(28, y); ctx.stroke(); }
    fs(ctx, rr(-42, -62, 84, 58, 10), '#fbf1dc', 5); if (label) tape(ctx, label, {x: 0, y: -33, w: 78, h: 34, rot: -0.05}); ctx.restore();
  },
  paddle(ctx, {label = ''} = {}) {
    ctx.save(); fs(ctx, rr(-9, -318, 18, 230, 7), '#c98f5a', 5); fs(ctx, rr(-26, -324, 52, 16, 7), '#c98f5a', 4);
    const bl = new Path2D(); bl.moveTo(-40, -112); bl.quadraticCurveTo(-46, -14, 0, -4); bl.quadraticCurveTo(46, -14, 40, -112); bl.closePath(); fs(ctx, bl, '#d9a066', 6);
    ctx.strokeStyle = 'rgba(100,60,30,.4)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -112); ctx.lineTo(0, -12); ctx.stroke();
    if (label) tape(ctx, label, {x: 0, y: -190, w: 74, h: 36, rot: 0.06}); ctx.restore();
  },
  ball(ctx, {label = ''} = {}) {
    ctx.save(); ctx.translate(0, -48); ctx.rotate(-0.3); const p = new Path2D(); p.moveTo(-82, 0); p.quadraticCurveTo(0, -78, 82, 0); p.quadraticCurveTo(0, 78, -82, 0); fs(ctx, p, '#8a4a2a', 6);
    ctx.save(); ctx.clip(p); ctx.strokeStyle = '#fbf1dc'; ctx.lineWidth = 7; for (const x of [-52, 52]) { ctx.beginPath(); ctx.moveTo(x, -50); ctx.quadraticCurveTo(x - 12, 0, x, 50); ctx.stroke(); } ctx.restore();
    ctx.strokeStyle = '#fbf1dc'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-26, -9); ctx.lineTo(26, -9); ctx.stroke(); for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(i * 11, -17); ctx.lineTo(i * 11, -1); ctx.stroke(); }
    if (label) { ctx.fillStyle = '#fbf1dc'; ctx.font = '40px GraceCaption'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, 0, 24); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; }
    ctx.restore();
  },
  libbook(ctx, {label = 'LIBRARY'} = {}) {
    ctx.save(); fs(ctx, rr(-76, -204, 152, 200, 8), '#3f6a58', 6); fs(ctx, rr(-76, -204, 20, 200, 6), '#2e5042', 5);
    ctx.fillStyle = '#e8d9a0'; ctx.fillRect(-36, -170, 90, 8); ctx.fillRect(-36, -150, 64, 8);
    fs(ctx, rr(-44, -112, 100, 90, 6), '#fffdf4', 4); ctx.fillStyle = '#2a211e'; ctx.font = '40px GraceCaption'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, 6, -88); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    for (let i = 0; i < 14; i++) ctx.fillRect(-32 + i * 6.2, -62, i % 3 ? 2.4 : 4, 30); ctx.restore();
  },
};
const SINK = {umbrella: 0.18, keys: 0.3, dish: 0.35, bike: 0.4, book: 0.3, glove: 0.3, paddle: 0.4, ball: 0.35, libbook: 0.3};

// ------------------------------------------------------------------ water: ripples, bubbles, the pop
function ripples(ctx, q0, {rx = 70, n = 3, gap = 0.14, life = 0.85, ratio = 0.28, col = '255,248,226', lw = 5} = {}) {
  for (let i = 0; i < n; i++) { const q = (q0 - i * gap) / life; if (q < 0 || q > 1) continue; const r = rx * (0.22 + 0.95 * eoc(q));
    ctx.strokeStyle = `rgba(${col},${0.95 * (1 - q)})`; ctx.lineWidth = lw * (1 - q * 0.5) + 1; ctx.beginPath(); ctx.ellipse(0, 0, r, r * ratio, 0, 0, 7); ctx.stroke(); }
}
function bubbles(ctx, q, {n = 9, spread = 90, up = 150, seed = 1} = {}) {
  for (let i = 0; i < n; i++) { const u = (q - i * 0.035) / 0.8; if (u < 0 || u > 1) continue; const x = (hashN(i * 3.7 + seed) - 0.5) * spread, y = -u * up * (0.5 + hashN(i + seed) * 0.7), r = 5 + hashN(i * 2.2 + seed) * 8;
    ctx.fillStyle = `rgba(255,252,240,${0.85 * (1 - u * 0.7)})`; ctx.strokeStyle = `rgba(60,70,60,${0.7 * (1 - u)})`; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.stroke(); }
}
// an item surfaces: mode 'hop' = it jumps out of a puddle / a bowl and lands (dx px away); 'float' = it rises out of the water and stays, bobbing
function popG(ctx, {kind = 'umbrella', label = '', t = 0, t0 = 0, mode = 'hop', h = 300, dx = 0, k = 1, restRot = 0.25, color, dry = false, rx = null, seed = 1, noRipples = false, land = 0} = {}) {
  const q = t - t0, wd = (rx ?? WIDTH[kind] * 0.55) * k;
  if (!noRipples) { ctx.save(); ripples(ctx, q, {rx: wd * 1.2, n: mode === 'hop' ? 3 : 4}); ctx.restore(); }
  if (q < 0) return;
  if (!dry) { ctx.save(); bubbles(ctx, q, {spread: wd * 1.3, up: 120 * k, seed}); ctx.restore(); }
  const Hh = HEIGHT[kind] * k; let x = 0, y = 0, rot = 0;
  if (mode === 'hop') {
    const T1 = 0.34, T2 = 0.74;
    if (q < T1) { const u = q / T1; y = -h * (1 - (1 - u) * (1 - u)); x = dx * 0.45 * u; rot = -0.9 * u; }
    else if (q < T2) { const u = (q - T1) / (T2 - T1); y = -h * (1 - u * u); x = dx * (0.45 + 0.55 * u); rot = -0.9 + (restRot + 0.9) * u; }
    else { const u = q - T2; y = -Math.abs(Math.sin(u * 10)) * h * 0.1 * Math.exp(-u * 6); x = dx; rot = restRot; }
    y += land * clamp(q / T2);
  } else {
    const T = 0.5, u = q / T, sink = (SINK[kind] ?? 0.3) * Hh;
    y = u < 1 ? lerp(Hh * 1.05, sink, easeOutBack(u)) : sink + Math.sin((q - T) * 3.1 + seed) * 6; rot = restRot * eio(u) + (u >= 1 ? Math.sin((q - T) * 2.1 + seed) * 0.05 : 0); x = dx * eoc(q / 1.2);
    ctx.save(); ctx.beginPath(); ctx.rect(-900, -2400, 1800, 2400); ctx.clip();
    ctx.translate(x, y); ctx.rotate(rot); ctx.scale(k, k); ITEMS[kind](ctx, {label, ...(color ? {color} : {})}); ctx.restore();
    ctx.save(); ctx.strokeStyle = 'rgba(255,252,236,.8)'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.ellipse(x, 0, wd * 0.62, wd * 0.62 * 0.2, 0, 0.1, Math.PI - 0.1); ctx.stroke(); ctx.restore();
    return;
  }
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(k, k); ITEMS[kind](ctx, {label, ...(color ? {color} : {})}); ctx.restore();
}
function rippleG(ctx, {t = 0, t0 = 0, rx = 90, n = 4, life = 1.1, splash = false, ratio = 0.28} = {}) {
  const q = t - t0; ctx.save(); ripples(ctx, q, {rx, n, gap: 0.2, life, ratio, lw: 5});
  if (splash && q >= 0 && q < 0.6) { for (let i = 0; i < 7; i++) { const u = q / 0.6, a = (i - 3) * 0.28, x = Math.sin(a) * 90 * u, y = -Math.sin(u * Math.PI) * (70 + (i % 3) * 30);
    ctx.fillStyle = `rgba(255,252,240,${1 - u})`; ctx.strokeStyle = `rgba(60,70,60,${0.7 * (1 - u)})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x, y, 7, 10, a, 0, 7); ctx.fill(); ctx.stroke(); } }
  ctx.restore();
}

// ------------------------------------------------------------------ the ring on a hand / passed over / falling / on the lake bottom
const hpos = (A, hand) => A && A._hands && A._hands[hand];
function ringHandG(ctx, {A, hand = 'R', t = 0, t0 = -1, t1 = 1e9, loose = 1, glint = null, R = null, up = 0} = {}) {
  const hp = hpos(A, hand); if (!hp || (A._alpha ?? 1) <= 0.02 || t < t0 || t >= t1) return;
  const r = R ?? A._s * 4.6, w = loose * (0.3 + 0.2 * clamp((t - (t1 - 0.45)) / 0.45));
  ctx.save(); ctx.translate(hp[0] + Math.sin(t * 3.3) * r * 0.16 * loose, hp[1] - up + r * 0.12 + Math.max(0, Math.sin(t * 2.1)) * r * 0.1 * loose);
  ringShape(ctx, r, {rot: 0.25 + Math.sin(t * 4.6) * w, gem: true});
  if (glint != null) { const q = (t - glint) / 0.7; if (q >= 0 && q < 1) star4(ctx, r * 0.5, -r * 1.2, r * (0.9 + 0.8 * Math.sin(q * Math.PI)), 1 - q * 0.6); }
  ctx.restore();
}
// grandmother's hand -> Mia's hand (an arc), then it stays on Mia's, loose
function ringMoveG(ctx, {A, G, hand = 'R', gHand = 'R', t = 0, t0 = 0, t1 = 0.4, R = null, glint = null} = {}) {
  const a = hpos(G, gHand), b = hpos(A, hand); if (!a || !b) return;
  const r = R ?? A._s * 4.6, q = clamp((t - t0) / (t1 - t0));
  if (q <= 0) { ctx.save(); ctx.translate(a[0], a[1]); ringShape(ctx, r * 0.78, {rot: 0.2}); ctx.restore(); return; }
  if (q < 1) { ctx.save(); ctx.translate(lerp(a[0], b[0], eio(q)), lerp(a[1], b[1], eio(q)) - Math.sin(q * Math.PI) * r * 3); ringShape(ctx, lerp(r * 0.78, r, q), {rot: 0.2 + q * 6}); ctx.restore(); return; }
  ringHandG(ctx, {A, hand, t, R: r, glint});
}
// off the hand and into the water at (tx, ty): the ring is NEVER seen again after the plop
function ringDropG(ctx, {A, hand = 'R', t = 0, t0 = 0, t1 = 0.4, tx = null, ty = 1560, R = null} = {}) {
  const hp = hpos(A, hand); const q = (t - t0) / (t1 - t0); if (q < 0 || q >= 1) return;
  const hx = hp ? hp[0] : (tx ?? 880), hy = hp ? hp[1] : ty - 200, r = R ?? (A ? A._s * 4.6 : 20);
  ctx.save(); ctx.translate(lerp(hx, tx ?? hx, eio(q)), lerp(hy, ty, q * q)); ringShape(ctx, r * (1 - 0.3 * q), {rot: q * 9}); ctx.restore();
}
// the ring lying in the sand on the lake bottom: a quiet gold glow, a slow twinkle; it does not move
function ringSandG(ctx, {t = 0, k = 1} = {}) {
  ctx.save(); ctx.scale(k, k);
  const g = ctx.createRadialGradient(0, -30, 10, 0, -30, 420 + 20 * Math.sin(t * 2)); g.addColorStop(0, 'rgba(255,214,90,.62)'); g.addColorStop(0.45, 'rgba(255,201,74,.22)'); g.addColorStop(1, 'rgba(255,201,74,0)'); ctx.fillStyle = g; ctx.fillRect(-460, -480, 920, 900);
  ctx.fillStyle = 'rgba(190,160,100,.55)'; ctx.beginPath(); ctx.ellipse(0, 8, 150, 30, 0, 0, 7); ctx.fill(); // the dent in the sand
  ctx.save(); ctx.translate(0, -34); ctx.scale(1, 0.82); ringShape(ctx, 78, {rot: 0, gem: true}); ctx.restore();
  for (const [x, y, ph] of [[-60, -112, 0], [86, -70, 1.7], [10, -150, 3.1]]) { const a = 0.5 + 0.5 * Math.sin(t * 3 + ph); star4(ctx, x, y, 14 + 22 * a, 0.35 + 0.65 * a); }
  ctx.restore();
}
// junk rising through the quiet water, each with its owner's name, while the ring stays
function junkRiseG(ctx, {t = 0, t0 = 0} = {}) {
  const L = [[-340, 'paddle', 'TED', 0.55, 0], [330, 'ball', 'MAX', 0.7, 0.3], [-150, 'libbook', 'LIBRARY', 0.55, 0.7], [180, 'glove', 'MOM', 0.8, 1.0], [-440, 'umbrella', 'ANN', 0.38, 1.3], [440, 'book', 'LEO', 0.6, 1.6]];
  for (const [x, kind, label, k, d] of L) { const u = (t - t0 - d) / 2.6; if (u < 0 || u > 1) continue; const y = lerp(60, -1360, u * (0.7 + 0.3 * u));
    ctx.save(); ctx.globalAlpha = 0.9 * Math.min(1, u * 8) * (1 - clamp((u - 0.85) / 0.15)); ctx.translate(x + Math.sin(u * 7 + d) * 24, y); ctx.rotate(Math.sin(u * 5 + d * 3) * 0.3); ctx.scale(k, k); ITEMS[kind](ctx, {label}); ctx.restore(); }
}

// ------------------------------------------------------------------ small props
function cerealBowlG(ctx, {w = 300, t = 0} = {}) { // origin = bottom centre; milk surface at (0, -h)
  const h = w * 0.34; ctx.save();
  const b = new Path2D(); b.moveTo(-w / 2, -h); b.quadraticCurveTo(-w * 0.42, 0, 0, 0); b.quadraticCurveTo(w * 0.42, 0, w / 2, -h); b.closePath(); fs(ctx, b, '#f2e6cf', 6);
  ctx.fillStyle = '#c4643a'; ctx.beginPath(); ctx.ellipse(0, -h * 0.52, w * 0.4, h * 0.1, 0, 0, Math.PI); ctx.fill();
  fs(ctx, el(0, -h, w / 2, w * 0.1), '#fffaf0', 6);
  for (let i = 0; i < 10; i++) { const a = hashN(i * 2.3) * 6.28, d = hashN(i * 5.1 + 1) * 0.8; const x = Math.cos(a) * d * w * 0.4, y = -h + Math.sin(a) * d * w * 0.06 + Math.sin(t * 1.5 + i) * 1.2; fs(ctx, el(x, y, 15, 9), '#e0a85a', 3); fs(ctx, el(x, y, 5, 3), '#fffaf0', 0); }
  ctx.restore();
}
function dropsFaceG(ctx, {A, t = 0, t0 = 0, n = 9} = {}) { // milk drops stuck on a face (and one running down)
  if (!A || !A._head || (A._alpha ?? 1) <= 0.02 || t < t0) return; const R = A._headR * A._s, [hx, hy] = A._head, k = clamp((t - t0) / 0.15);
  ctx.save(); ctx.translate(hx, hy); ctx.rotate((((A._st?.tilt) || 0) * (A.flip ? -1 : 1)) * Math.PI / 180); ctx.globalAlpha = k * (A._alpha ?? 1);
  ctx.fillStyle = '#fffdf6'; ctx.strokeStyle = 'rgba(80,60,40,.5)'; ctx.lineWidth = Math.max(2, R * 0.03);
  for (let i = 0; i < n; i++) { const a = hashN(i * 3.3) * 6.28, d = 0.25 + hashN(i * 1.9 + 4) * 0.62, rr0 = R * (0.05 + hashN(i + 9) * 0.07); ctx.beginPath(); ctx.ellipse(Math.cos(a) * R * d, Math.sin(a) * R * d * 0.9 - R * 0.05, rr0, rr0 * 1.3, 0, 0, 7); ctx.fill(); ctx.stroke(); }
  const dr = clamp((t - t0 - 0.2) / 1.2); ctx.beginPath(); ctx.ellipse(R * 0.42, R * 0.15 + dr * R * 0.5, R * 0.06, R * (0.1 + dr * 0.2), 0, 0, 7); ctx.fill(); ctx.stroke();
  ctx.restore();
}
// the ring box: old red velvet, ribbon, a paper tag with the name and the birth date. open 0 closed .. 1 open (the lid flips up), the cushion is EMPTY.
function ringBoxG(ctx, {open = 0, tag = 'FOR MIA', date = 'MAY 14, 2018', k = 1, t = 0} = {}) { // origin = centre of the base's bottom edge
  ctx.save(); ctx.scale(k, k);
  if (open > 0.3) { // the inside, once the lid is up: a dark cavity and a cream cushion with an EMPTY slot
    fs(ctx, rr(-150, -252, 300, 112, 18), '#5a1f2a', 6); fs(ctx, rr(-120, -226, 240, 72, 18), '#f4e6c8', 5);
    ctx.strokeStyle = '#2a211e'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-70, -190); ctx.lineTo(70, -190); ctx.stroke(); }
  fs(ctx, rr(-150, -150, 300, 150, 26), '#7a2f3a', 7); ctx.fillStyle = 'rgba(255,255,255,.1)'; ctx.fillRect(-140, -138, 280, 14);
  const sy = Math.cos(clamp(open) * Math.PI); ctx.save(); ctx.translate(0, -246); ctx.scale(1, sy);
  const lid = rr(-154, 0, 308, 96, 24); fs(ctx, lid, sy > 0 ? '#8a3744' : '#f2e2c0', 7); if (sy > 0) { ctx.fillStyle = 'rgba(255,255,255,.1)'; ctx.fillRect(-140, 10, 280, 12); } ctx.restore();
  if (open < 0.2) { fs(ctx, rr(-22, -246, 44, 246, 6), '#ead9ab', 5); for (const sg of [-1, 1]) { ctx.save(); ctx.translate(0, -246); ctx.rotate(sg * 0.7); fs(ctx, el(sg * 30, 0, 36, 20), '#f3e6c0', 5); ctx.restore(); } fs(ctx, el(0, -246, 14, 14), '#e2cf9a', 4); }
  // the tag hangs off the ribbon
  ctx.save(); ctx.translate(86, -92 + Math.sin(t * 2) * 1.5); ctx.rotate(0.06); ctx.strokeStyle = '#ead9ab'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-70, -60); ctx.lineTo(0, -30); ctx.stroke();
  fs(ctx, poly([[-70, -30], [70, -30], [86, 0], [70, 130], [-70, 130]]), '#e9d3a0', 5); ctx.fillStyle = '#2a211e'; ctx.beginPath(); ctx.arc(0, -12, 7, 0, 7); ctx.fill();
  ctx.font = '70px GraceCaption'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(tag, 0, 50); ctx.font = '33px GraceCaption'; ctx.fillText(date, 0, 108); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.restore(); ctx.restore();
}
// an old photo: a young grandmother with a newborn in a blanket (a pop-in from t0)
function babyPhotoG(ctx, {t = 0, t0 = 0, k = 1} = {}) {
  const q = (t - t0) / 0.4; if (q <= 0) return; const sc = Math.max(0.01, easeOutBack(clamp(q))) * k;
  ctx.save(); ctx.scale(sc, sc); ctx.rotate(-0.06);
  fs(ctx, rr(-190, -230, 380, 460, 10), '#f6ecd4', 8); const g = ctx.createLinearGradient(0, -200, 0, 190); g.addColorStop(0, '#e6c88e'); g.addColorStop(1, '#c79b62'); ctx.fillStyle = g; ctx.fillRect(-160, -200, 320, 360);
  ctx.save(); ctx.beginPath(); ctx.rect(-160, -200, 320, 360); ctx.clip();
  fs(ctx, rr(-120, 20, 240, 200, 40), '#7c8f4a', 6);                   // her dress
  fs(ctx, el(-6, -60, 50, 56), '#e3b38e', 5); fs(ctx, poly([[-58, -64], [-46, -122], [4, -140], [46, -116], [52, -62], [32, -92], [-20, -100]]), '#3a2418', 5); fs(ctx, el(-6, -150, 30, 28), '#3a2418', 5); // face, hair, bun
  ctx.fillStyle = '#2a211e'; ctx.beginPath(); ctx.arc(-24, -62, 4, 0, 7); ctx.arc(14, -62, 4, 0, 7); ctx.fill(); ctx.strokeStyle = '#2a211e'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(-5, -42, 14, 0.2, Math.PI - 0.2); ctx.stroke();
  const bl = new Path2D(); bl.ellipse(10, 60, 100, 56, -0.3, 0, 7); fs(ctx, bl, '#fbf1dc', 6); fs(ctx, el(70, 28, 30, 28), '#c98b5e', 5); ctx.fillStyle = '#2a211e'; ctx.beginPath(); ctx.arc(62, 24, 3, 0, 7); ctx.arc(80, 24, 3, 0, 7); ctx.fill(); // the baby in its blanket
  ctx.restore();
  ctx.fillStyle = '#3a2412'; ctx.font = '36px GraceVerse'; ctx.textAlign = 'center'; ctx.fillText('Mia, day one', 0, 206); ctx.textAlign = 'left';
  ctx.restore();
}
function cameraTripodG(ctx) { // origin = ground, camera looking to the right
  ctx.save(); ctx.lineCap = 'round';
  for (const [x, y] of [[-110, 0], [0, 12], [110, 0]]) { ctx.strokeStyle = INK; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(0, -300); ctx.lineTo(x, y); ctx.stroke(); ctx.strokeStyle = '#7a6a5a'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(0, -300); ctx.lineTo(x, y); ctx.stroke(); }
  fs(ctx, rr(-90, -420, 180, 124, 18), '#3a2c24', 6); fs(ctx, rr(70, -396, 80, 72, 12), '#2a211e', 5); fs(ctx, el(150, -360, 30, 36), '#9fc7b4', 5); fs(ctx, el(150, -360, 12, 15), '#2a211e', 0);
  fs(ctx, rr(-60, -440, 54, 24, 6), '#d9d2c0', 4); ctx.fillStyle = '#e2574c'; ctx.beginPath(); ctx.arc(-60, -380, 8, 0, 7); ctx.fill();
  ctx.restore();
}
function lampStandG(ctx) { // a soft white panel lamp on a stand
  ctx.save(); fs(ctx, rr(-7, -520, 14, 520, 4), '#5d5047', 4); fs(ctx, rr(-150, -800, 300, 290, 14), '#f7f0e0', 7); glow(ctx, 0, -655, 360, 0.5, '255,244,210'); ctx.restore();
}
// a field of small bubbles rising through the whole frame (the quiet of the lake bottom, but alive)
function bubbleFieldG(ctx, {t = 0, t0 = 0, n = 34, speed = 150} = {}) {
  if (t < t0) return;
  for (let i = 0; i < n; i++) { const sp = speed * (0.6 + hashN(i * 1.7) * 0.9), cyc = 2200 / sp, q = (((t - t0) / cyc + hashN(i * 3.9)) % 1), y = 1980 - q * 2200, x = hashN(i * 7.3) * 1080 + Math.sin(q * 9 + i) * 26, r = 6 + hashN(i * 2.1) * 16;
    ctx.fillStyle = 'rgba(255,252,240,.55)'; ctx.strokeStyle = 'rgba(40,70,60,.5)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.stroke(); }
}
// a far-off fish crossing the frame slowly (calm life behind the verse); x runs from -dir*200 across 1280 px in `dur` s
function fishG(ctx, {t = 0, t0 = 0, dur = 6, dir = 1, k = 1, a = 0.5} = {}) {
  const q = (t - t0) / dur; if (q < 0 || q > 1) return; const x = (dir > 0 ? -100 + q * 1280 : 1180 - q * 1280), y = Math.sin(q * 6) * 14;
  ctx.save(); ctx.globalAlpha = a * Math.min(1, q * 6, (1 - q) * 6); ctx.translate(x, y); ctx.scale(dir * k, k);
  fs(ctx, poly([[-46, 0], [-74, -20], [-70, 20]]), '#e08a4a', 3); fs(ctx, el(0, 0, 50, 24), '#f0a35e', 3.5); ctx.fillStyle = '#2a211e'; ctx.beginPath(); ctx.arc(26, -5, 3.6, 0, 7); ctx.fill(); ctx.restore();
}
Object.assign(PROPS, {fishG, bubbleFieldG, tapeG: (ctx, a = {}) => tape(ctx, a.text || '', a), popG, rippleG, ringHandG, ringMoveG, ringDropG, ringSandG, junkRiseG, cerealBowlG, dropsFaceG, ringBoxG, babyPhotoG, cameraTripodG, lampStandG,
  ringG: (ctx, {r = 40, rot = 0} = {}) => ringShape(ctx, r, {rot}), itemG: (ctx, {kind = 'umbrella', label = '', color, stamp} = {}) => ITEMS[kind](ctx, {label, ...(color ? {color} : {}), ...(stamp ? {stamp} : {})}), starG4: (ctx, {r = 30, a = 1} = {}) => star4(ctx, 0, 0, r, a)});

// ------------------------------------------------------------------ places
const WATER = {day: ['#8dbfa6', '#4c8479'], rain: ['#86ae9f', '#4a7269'], dusk: ['#5d4a78', '#2d2347']};
function lakeSky(ctx, time, sun = true) {
  if (time === 'rain') { const g = ctx.createLinearGradient(0, 0, 0, 1010); g.addColorStop(0, '#bdb09a'); g.addColorStop(1, '#e8dbc0'); ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920); return; }
  if (time === 'day' && !sun) { const g = ctx.createLinearGradient(0, 0, 0, 1010); g.addColorStop(0, '#f3b66c'); g.addColorStop(1, '#ffe3b0'); ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920); return; }
  if (time === 'dusk') {
    const g = ctx.createLinearGradient(0, 0, 0, 1010); g.addColorStop(0, '#3b2a58'); g.addColorStop(0.55, '#7d4468'); g.addColorStop(1, '#e58f70'); ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
    ctx.fillStyle = '#fff'; for (const [x, y] of [[110, 140], [290, 250], [520, 110], [690, 320], [990, 400], [400, 380], [200, 460], [610, 480]]) ctx.fill(el(x, y, 4, 4));
    glow(ctx, 820, 300, 300, 0.35, '255,236,190'); ctx.fillStyle = '#fff1c4'; ctx.fill(el(820, 300, 58, 58));
  } else sky(ctx, 'gold', 1010);
}
function farTown(ctx, time) {
  const dusk = time === 'dusk', c1 = dusk ? '#5b3d62' : '#e6b27a', c2 = dusk ? '#4a3052' : '#d79f68';
  fs(ctx, poly([[-10, 1010], [-10, 900], [160, 860], [330, 930], [520, 880], [720, 950], [900, 870], [1090, 930], [1090, 1010]]), c1, 4);
  fs(ctx, poly([[-10, 1010], [-10, 962], [200, 940], [420, 985], [640, 950], [860, 990], [1090, 955], [1090, 1010]]), c2, 4);
  const hs = [[40, 74, 54], [150, 60, 46], [250, 70, 58], [680, 66, 52], [790, 56, 44], [900, 72, 56], [1000, 60, 48]];
  hs.forEach(([x, w, h], i) => { fs(ctx, rr(x, 1004 - h, w, h, 3), dusk ? '#6a5470' : WARM.plaster[i % 5], 3.5); fs(ctx, poly([[x - 8, 1006 - h], [x + w / 2, 984 - h], [x + w + 8, 1006 - h]]), dusk ? '#4e3858' : WARM.roof, 3.5);
    fs(ctx, rr(x + w * 0.3, 1004 - h * 0.62, w * 0.22, h * 0.3, 2), dusk ? '#ffd77a' : '#7a6a60', 2.5); });
  fs(ctx, rr(468, 902, 54, 102, 3), dusk ? '#6a5470' : '#f1d9b5', 4); fs(ctx, poly([[460, 904], [495, 842], [530, 904]]), dusk ? '#4e3858' : WARM.roof, 4); fs(ctx, el(495, 930, 11, 15), dusk ? '#ffd77a' : '#7a6a60', 3);
}
function waterBody(ctx, time) {
  const dusk = time === 'dusk', [a, b] = WATER[time] || WATER.day, g = ctx.createLinearGradient(0, 1000, 0, 1920); g.addColorStop(0, a); g.addColorStop(1, b); ctx.fillStyle = g; ctx.fillRect(0, 1000, 1080, 920);
  ctx.strokeStyle = 'rgba(42,33,30,.5)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 1004); ctx.lineTo(1080, 1004); ctx.stroke();
  ctx.strokeStyle = dusk ? 'rgba(210,180,240,.2)' : 'rgba(255,248,224,.4)'; ctx.lineWidth = 4;
  for (let y = 1040, r = 0; y < 1900; r++) { const sp = 150 + (y - 1000) * 0.18; for (let x = (r * 97) % sp - sp / 2; x < 1100; x += sp) { ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + sp * 0.18, y - 9, x + sp * 0.36, y); ctx.stroke(); } y += 36 + (y - 1000) * 0.07; }
  ctx.fillStyle = dusk ? 'rgba(255,241,196,.28)' : 'rgba(255,244,205,.5)'; for (let i = 0; i < 16; i++) { const y = 1030 + i * 38 + i * i * 2, w = 18 + i * 5; ctx.fillRect(840 - w / 2 + Math.sin(i * 2.1) * 14, y, w, 7); }
}
function reeds(ctx, x, y, s = 1, n = 7) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) { const dx = (i - n / 2) * 20, h = 220 + hashN(i * 3.1) * 140, lean = (hashN(i + 5) - 0.5) * 70; ctx.strokeStyle = INK; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(dx, 0); ctx.quadraticCurveTo(dx + lean * 0.3, -h / 2, dx + lean, -h); ctx.stroke(); ctx.strokeStyle = i % 2 ? '#7c8f4a' : '#5f7339'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(dx, 0); ctx.quadraticCurveTo(dx + lean * 0.3, -h / 2, dx + lean, -h); ctx.stroke();
    if (i % 3 === 0) fs(ctx, rr(dx + lean - 8, -h - 40, 16, 56, 8), '#7a4b2a', 4); }
  ctx.restore();
}
Object.assign(SETS, {
  // the rainy lane: the village street under a soft honey-grey sky, wet cobbles, puddles (PUDDLES) where things come back
  grStreet() {
    return ctx => {
      SETS.gLane({time: 'noon'})(ctx);
      ctx.fillStyle = 'rgba(150,135,118,.16)'; ctx.fillRect(0, 0, 1080, 1296);
      ctx.fillStyle = 'rgba(255,248,230,.08)'; ctx.fillRect(0, 1296, 1080, 624);
      for (const [x, y, rx] of PUDDLES) { fs(ctx, el(x, y, rx, rx * 0.24), '#c9bc9c', 4); ctx.fillStyle = 'rgba(255,246,222,.55)'; ctx.fill(el(x - rx * 0.1, y - rx * 0.03, rx * 0.78, rx * 0.13)); ctx.strokeStyle = 'rgba(120,100,80,.5)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(x, y, rx * 0.5, rx * 0.1, 0, 0, 7); ctx.stroke(); }
    };
  },
  // the lake. view 'dock' = a wooden dock on the left (deck top y 1440, end x 800), water in front and behind; 'shore' = a grassy bank on the left;
  // 'wide' = open water to the bottom. time 'day' | 'dusk' (plum sky, ONE level of dark, everything still readable)
  grLake({time = 'day', view = 'dock', sun = true} = {}) {
    return ctx => {
      lakeSky(ctx, time, sun); farTown(ctx, time); if (time === 'rain') { ctx.fillStyle = 'rgba(150,135,118,.2)'; ctx.fillRect(0, 780, 1080, 230); } waterBody(ctx, time);
      const dusk = time === 'dusk';
      if (view === 'dock') {
        const DE = LAKE.deckEnd;
        ctx.fillStyle = 'rgba(20,40,40,.22)'; ctx.fillRect(0, 1560, DE, 240);
        for (const x of [40, 250, 460, 670, DE - 24]) { fs(ctx, rr(x - 18, 1560, 36, 300, 6), '#5e4028', 5); ctx.strokeStyle = 'rgba(255,248,224,.5)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(x, 1596, 30, 8, 0, 0, 7); ctx.stroke(); }
        fs(ctx, rr(-20, 1440, DE + 20, 60, 4), '#c79a62', 6); ctx.strokeStyle = 'rgba(80,45,20,.4)'; ctx.lineWidth = 3; for (const y of [1458, 1478]) { ctx.beginPath(); ctx.moveTo(-20, y); ctx.lineTo(DE, y); ctx.stroke(); }
        fs(ctx, rr(-20, 1500, DE + 20, 64, 4), '#8a5a36', 6); ctx.strokeStyle = 'rgba(40,20,10,.45)'; ctx.lineWidth = 4; for (let x = 60; x < DE; x += 110) { ctx.beginPath(); ctx.moveTo(x, 1502); ctx.lineTo(x, 1562); ctx.stroke(); }
        fs(ctx, rr(DE - 94, 1366, 48, 70, 8), '#5a4a3a', 4);   // a mooring post near the end
        if (dusk) { ctx.fillStyle = 'rgba(52,26,84,.26)'; ctx.fillRect(0, 1440, DE + 20, 130); }
      } else if (view === 'shore') {
        olive(ctx, 90, 1480, 1.05);
        const bank = new Path2D(); bank.moveTo(-10, 1920); bank.lineTo(-10, 1470); bank.quadraticCurveTo(220, 1440, 430, 1475); bank.quadraticCurveTo(560, 1500, 610, 1580); bank.quadraticCurveTo(650, 1700, 500, 1800); bank.lineTo(380, 1920); bank.closePath();
        ctx.fillStyle = '#c18a55'; ctx.fill(bank); ctx.save(); ctx.clip(bank); for (let i = 0; i < 4; i++) { ctx.fillStyle = ['#cf9a62', '#b27a48', '#9c6640', '#b27a48'][i]; ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.moveTo(-10, 1570 + i * 90); for (let x = -10; x <= 700; x += 20) ctx.lineTo(x, 1570 + i * 90 + Math.sin(x / 70 + i * 2) * 10); ctx.lineTo(700, 1920); ctx.lineTo(-10, 1920); ctx.fill(); } ctx.restore();
        ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.stroke(bank);
        ctx.strokeStyle = WARM.olive; ctx.lineWidth = 26; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-10, 1472); ctx.quadraticCurveTo(220, 1442, 430, 1477); ctx.quadraticCurveTo(560, 1502, 606, 1578); ctx.stroke();
        reeds(ctx, 640, 1640, 0.8, 5);
      } else {
        reeds(ctx, 60, 1920, 1.1, 7); reeds(ctx, 1040, 1920, 1.0, 6);
      }
    };
  },
  // under the water: sage-green light from above, a sand floor, reeds at the sides. Quiet.
  grBottom() {
    return ctx => {
      const g = ctx.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, '#9fcdb2'); g.addColorStop(0.5, '#6aa396'); g.addColorStop(1, '#3f6f68'); ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
      ctx.fillStyle = 'rgba(255,246,212,.22)'; for (const [x, w] of [[180, 120], [470, 170], [760, 110]]) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + w, 0); ctx.lineTo(x + w * 1.9 + 120, 1500); ctx.lineTo(x + 40, 1500); ctx.closePath(); ctx.fill(); }
      ctx.fillStyle = 'rgba(255,250,232,.55)'; ctx.beginPath(); ctx.moveTo(0, 0); for (let x = 0; x <= 1080; x += 60) ctx.lineTo(x, 60 + Math.sin(x / 80) * 14); ctx.lineTo(1080, 0); ctx.fill();
      const sand = new Path2D(); sand.moveTo(-10, 1920); sand.lineTo(-10, 1560); sand.quadraticCurveTo(300, 1500, 540, 1540); sand.quadraticCurveTo(820, 1580, 1090, 1520); sand.lineTo(1090, 1920); sand.closePath(); fs(ctx, sand, '#dcc796', 5);
      ctx.strokeStyle = 'rgba(150,120,70,.35)'; ctx.lineWidth = 4; for (let r = 0; r < 7; r++) { ctx.beginPath(); for (let x = -10; x <= 1090; x += 20) ctx.lineTo(x, 1620 + r * 40 + Math.sin(x / 50 + r * 2) * 6); ctx.stroke(); }
      for (const [x, y, rx] of [[110, 1700, 50], [930, 1740, 64], [740, 1820, 40], [260, 1830, 56]]) fs(ctx, el(x, y, rx, rx * 0.6), '#a99a7c', 4);
      ctx.lineCap = 'round'; for (const [x, s] of [[70, 1], [180, 0.7], [960, 1.05], [860, 0.75]]) for (let i = 0; i < 5; i++) { const h = (330 + hashN(i + x) * 220) * s, lean = (hashN(i * 2 + x) - 0.5) * 90; ctx.strokeStyle = INK; ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(x + i * 18, 1580); ctx.quadraticCurveTo(x + i * 18 + lean, 1580 - h / 2, x + i * 18 + lean * 1.6, 1580 - h); ctx.stroke(); ctx.strokeStyle = i % 2 ? '#86a85a' : '#6a8a45'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(x + i * 18, 1580); ctx.quadraticCurveTo(x + i * 18 + lean, 1580 - h / 2, x + i * 18 + lean * 1.6, 1580 - h); ctx.stroke(); }
      ctx.fillStyle = 'rgba(255,252,240,.55)'; ctx.strokeStyle = 'rgba(40,70,60,.5)'; ctx.lineWidth = 2.5; for (let i = 0; i < 12; i++) { const x = 90 + hashN(i * 4.1) * 900, y = 300 + hashN(i * 7.3) * 1100, r = 6 + hashN(i) * 9; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.stroke(); }
    };
  },
  // grandmother's living room by day: honey walls, a big window onto the lake, bookcase, family photos, a rug
  grRoom() {
    return ctx => {
      room(ctx, '#f0d49e', '#c99a5c', '#a8714a');
      ctx.fillStyle = 'rgba(255,240,200,.18)'; for (let x = 60; x < 1080; x += 120) ctx.fillRect(x, 0, 40, 1040);
      const wx = 90, wy = 330, ww = 300, wh = 450;
      fs(ctx, rr(wx - 16, wy - 16, ww + 32, wh + 32, 12), WARM.cream, 6); ctx.save(); ctx.beginPath(); ctx.rect(wx, wy, ww, wh); ctx.clip();
      const sg = ctx.createLinearGradient(0, wy, 0, wy + wh * 0.55); sg.addColorStop(0, '#f3b66c'); sg.addColorStop(1, '#ffe3b0'); ctx.fillStyle = sg; ctx.fillRect(wx, wy, ww, wh);
      fs(ctx, poly([[wx, wy + wh * 0.5], [wx + 80, wy + wh * 0.42], [wx + 190, wy + wh * 0.5], [wx + ww, wy + wh * 0.44], [wx + ww, wy + wh * 0.58], [wx, wy + wh * 0.58]]), '#e0a770', 3);
      const wg = ctx.createLinearGradient(0, wy + wh * 0.56, 0, wy + wh); wg.addColorStop(0, '#8dbfa6'); wg.addColorStop(1, '#4c8479'); ctx.fillStyle = wg; ctx.fillRect(wx, wy + wh * 0.56, ww, wh * 0.44);
      ctx.strokeStyle = 'rgba(255,248,224,.5)'; ctx.lineWidth = 3; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(wx + 20 + i * 60, wy + wh * 0.66 + i * 24); ctx.lineTo(wx + 70 + i * 60, wy + wh * 0.66 + i * 24); ctx.stroke(); }
      ctx.restore(); ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.strokeRect(wx, wy, ww, wh); ctx.beginPath(); ctx.moveTo(wx + ww / 2, wy); ctx.lineTo(wx + ww / 2, wy + wh); ctx.moveTo(wx, wy + wh / 2 + 30); ctx.lineTo(wx + ww, wy + wh / 2 + 30); ctx.stroke();
      fs(ctx, rr(wx - 40, wy - 40, 56, wh + 90, 26), '#f7ecd2', 5); fs(ctx, rr(wx + ww - 16, wy - 40, 56, wh + 90, 26), '#f7ecd2', 5);
      glow(ctx, 240, 600, 700, 0.22, '255,236,190');
      ctx.save(); ctx.translate(690, 300); PROPS.bookcaseG(ctx); ctx.restore();
      for (const [x, y, w, h, c] of [[450, 400, 150, 190, '#c98f5a'], [470, 640, 110, 140, '#c98f5a']]) { fs(ctx, rr(x, y, w, h, 8), c, 6); fs(ctx, rr(x + 12, y + 12, w - 24, h - 24, 3), '#f1d9b5', 3); fs(ctx, el(x + w / 2, y + h * 0.42, 24, 26), '#e3b38e', 4); fs(ctx, rr(x + w / 2 - 26, y + h * 0.58, 52, 50, 10), '#c4643a', 4); }
      fs(ctx, el(540, 1560, 440, 150), '#b5552f', 7); fs(ctx, el(540, 1560, 360, 112), '#fbf1dc', 0); fs(ctx, el(540, 1560, 300, 90), '#c4643a', 0);
    };
  },
  // picture day: a cream wall, a mottled olive backdrop on two stands, panel lamps; the camera is the cameraTripodG prop
  grPicDay() {
    return ctx => {
      room(ctx, '#f1dfbd', '#d1a870', '#b88455');
      fs(ctx, rr(170, 280, 740, 1100, 10), '#8f9a54', 7); ctx.save(); ctx.beginPath(); ctx.rect(170, 280, 740, 1100); ctx.clip();
      for (let i = 0; i < 28; i++) { ctx.fillStyle = i % 2 ? 'rgba(200,190,100,.28)' : 'rgba(70,90,40,.22)'; ctx.beginPath(); ctx.ellipse(170 + hashN(i * 2.7) * 740, 280 + hashN(i * 5.3) * 1100, 90 + hashN(i) * 120, 40 + hashN(i + 7) * 70, hashN(i + 3) * 3, 0, 7); ctx.fill(); }
      ctx.restore(); fs(ctx, rr(150, 260, 780, 30, 8), '#6e4426', 5); for (const x of [128, 952]) fs(ctx, rr(x - 8, 260, 16, 1100, 5), '#5d5047', 4);
      ctx.fillStyle = '#d9cdb2'; ctx.fillRect(170, 1380, 740, 40);
    };
  },
});
