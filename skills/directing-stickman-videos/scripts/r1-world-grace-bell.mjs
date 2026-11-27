// R1 · grace-remains ep17 "The Bell": on the day Jesus comes back a bell rings; everybody looks at the tower, but it is the little brass bell hung
// by Marta's front door that rings (the replay clue is on screen from frame 0: dusty, cobwebbed, swaying a little). New places: the village street /
// square with a bell tower (belfry is an open arch; the bell is the PROP towerBellG so it can swing or stay still), Marta's front door from outside,
// Linda's night room, Marta's kitchen (day). New props: towerBellG, handBellG, soundG, dustPuffG, suitcaseBigG, hatG, apronG, ironBoardG, ironG,
// dressG, sinkDishesG, lettersG, shelfG, queueThoughtG, calTueG, kDoorG, kLightFanG, doorLightG, tearsG, cobwebG. Registered into SETS/PROPS on import.
// NOTHING existing in the engine is edited.
import {Path2D} from '@napi-rs/canvas';
import {INK, mix, dark} from './r1-rig.mjs';
import {SETS, PROPS} from './r1-world.mjs';
import {fs, rr, el, poly, hashN, glow, olive, sky, cobbles, easeOutBack, WARM, room, windowPane, cottage} from './r1-world-grace.mjs';
import './r1-world-grace-light.mjs';   // book, ears, bakery (tableG, wallClockG), light
import './r1-world-grace-sign.mjs';    // verseG
import './r1-world-grace-clouds.mjs';  // birdsG

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);

// ------------------------------------------------------------------ the brass
const BR = '#e8a92b', BR_D = '#b9791c';
function bellPath(R, H) { const p = new Path2D(); p.moveTo(-R * 0.30, 16); p.bezierCurveTo(-R * 0.34, H * 0.45, -R * 0.52, H * 0.66, -R, H + 16); p.lineTo(R, H + 16); p.bezierCurveTo(R * 0.52, H * 0.66, R * 0.34, H * 0.45, R * 0.30, 16); p.closePath(); return p; }
// a bell hanging from (0, 0): crown, body, lip band, highlight. dull 0..1 = dusty (greyer brass)
function bellBody(ctx, R, H, {dull = 0, lw = 6} = {}) {
  const body = mix(BR, '#9a8d72', 0.55 * dull), band = mix(BR_D, '#6f6552', 0.5 * dull);
  fs(ctx, rr(-R * 0.17, -4, R * 0.34, 26, 6), band, lw - 1);
  const b = bellPath(R, H); fs(ctx, b, body, lw);
  ctx.save(); ctx.clip(b);
  ctx.fillStyle = band; ctx.fillRect(-R - 4, 16 + H * 0.78, 2 * R + 8, H * 0.3);
  ctx.fillStyle = `rgba(255,246,200,${0.78 - 0.4 * dull})`; ctx.fill(el(-R * 0.36, 16 + H * 0.4, R * 0.1, H * 0.26, 0.2));
  ctx.fillStyle = 'rgba(80,40,0,.18)'; ctx.fill(el(R * 0.55, 16 + H * 0.55, R * 0.26, H * 0.4, -0.25));
  ctx.restore();
  ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.stroke(b);
  fs(ctx, el(0, H + 16, R, R * 0.17), '#4a2d10', lw - 1);
}
function clapper(ctx, R, H, off, lw = 5) { ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(0, H + 10); ctx.lineTo(off, H + 10 + R * 0.28); ctx.stroke(); fs(ctx, el(off, H + 12 + R * 0.34, R * 0.2, R * 0.2), '#5a3a14', lw - 1); ctx.restore(); }

// the big bell in the belfry. origin = the beam it hangs from. ONE swing law: strikes from t0, decaying; never moves outside t0 <= t < t0 + 3.2 (still = still)
function towerBellG(ctx, {t = 0, t0 = -9, amp = 17, R = 64, H = 118, beam = true} = {}) {
  const q = t - t0; let ang = 0, kl = 0;
  if (q >= 0 && q < 3.2) { const e = Math.exp(-q * 0.85); ang = amp * e * Math.sin(q * 2 * Math.PI * 1.35); kl = -ang * 0.9; }
  ctx.save(); ctx.lineJoin = 'round';
  ctx.save(); ctx.rotate(ang * Math.PI / 180); bellBody(ctx, R, H); clapper(ctx, R, H, kl * 0.5 + (q >= 0 && q < 3.2 ? Math.sin(q * 11) * 2 : 0)); ctx.restore();
  if (beam) fs(ctx, rr(-R * 1.5, -14, R * 3, 26, 6), '#6e4426', 6);
  ctx.restore();
}

// concentric arcs of sound. args {t, t0, d, n, r, gap, lw}
function soundG(ctx, {t = 0, t0 = 0, d = 1.0, n = 3, r = 70, gap = 0.2, lw = 9, grow = 2.4, spread = 0.62} = {}) {
  ctx.save(); ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const q = (t - t0 - i * gap) / d; if (q < 0 || q > 1) continue;
    const rad = r * (0.7 + grow * easeOut(q)), a = 1 - q;
    for (const [w, c] of [[lw + 7, `rgba(42,33,30,${0.55 * a})`], [lw, `rgba(255,243,200,${a})`]]) {
      ctx.strokeStyle = c; ctx.lineWidth = w * (1 - 0.3 * q);
      ctx.beginPath(); ctx.arc(0, 0, rad, -spread, spread); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, rad, Math.PI - spread, Math.PI + spread); ctx.stroke();
    }
  }
  ctx.restore();
}
// dust flakes thrown out of a point. args {t, t0, d, n, r, col}
function dustPuffG(ctx, {t = 0, t0 = 0, d = 1.1, n = 16, r = 90, col = '#e6d8bd', fall = 60} = {}) {
  const q = (t - t0) / d; if (q < 0 || q > 1) return;
  ctx.save();
  for (let i = 0; i < n; i++) {
    const a = hashN(i * 3.1) * Math.PI * 2, sp = 0.5 + hashN(i * 1.7 + 2) * 0.9, e = easeOut(q), x = Math.cos(a) * r * sp * e, y = Math.sin(a) * r * sp * e * 0.8 + fall * q * q, s = (9 + hashN(i + 5) * 16) * (0.6 + 0.8 * q);
    ctx.globalAlpha = (1 - q) * 0.9; const p = el(x, y, s, s * 0.8, a); ctx.fillStyle = col; ctx.fill(p); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(80,60,40,.5)'; ctx.stroke(p);
  }
  ctx.restore();
}
// a cobweb in a corner. origin = the corner; opens to +x and +y
function cobwebG(ctx, {r = 60, a = 0.9} = {}) {
  ctx.save(); ctx.lineCap = 'round';
  for (const [w, c] of [[5, `rgba(60,45,35,${0.4 * a})`], [2.6, `rgba(255,255,255,${a})`]]) {
    ctx.strokeStyle = c; ctx.lineWidth = w;
    for (let i = 0; i <= 4; i++) { const an = i / 4 * Math.PI / 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(an) * r, Math.sin(an) * r); ctx.stroke(); }
    for (let k = 1; k <= 3; k++) { ctx.beginPath(); for (let i = 0; i <= 4; i++) { const an = i / 4 * Math.PI / 2, r2 = r * k / 3.2 * (i % 2 ? 0.86 : 1); i ? ctx.lineTo(Math.cos(an) * r2, Math.sin(an) * r2) : ctx.moveTo(Math.cos(an) * r2, Math.sin(an) * r2); } ctx.stroke(); }
  }
  ctx.restore();
}
function glint(ctx, x, y, k, s = 1) { // a 4-point star flash, k 0..1
  if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s * k, s * k); const p = new Path2D(); p.moveTo(0, -22); p.quadraticCurveTo(3, -3, 22, 0); p.quadraticCurveTo(3, 3, 0, 22); p.quadraticCurveTo(-3, 3, -22, 0); p.quadraticCurveTo(-3, -3, 0, -22); ctx.fillStyle = '#fffbe6'; ctx.fill(p); ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgba(120,80,0,.7)'; ctx.stroke(p); ctx.restore();
}
// the little brass bell by the door. origin = the wall plate; arm to +x, bell hangs at x = 78.
// dust 0..1: how dusty (1 = grey and cobwebbed, 0 = clean brass). amp: swing amplitude of the ringing from t0. The idle sway is tiny and slow (the replay clue).
function handBellG(ctx, {t = 0, t0 = -9, amp = 0, dust = 1, halo = 0, web = 1, sway = 1.6, wind = 0, windT = 1.3, shine = 0} = {}) {
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (halo > 0) glow(ctx, 78, 70, 190, 0.5 * halo, '255,214,120');
  const arm = () => { ctx.beginPath(); ctx.moveTo(-6, -6); ctx.lineTo(78, -6); ctx.lineTo(78, 6); };
  ctx.strokeStyle = INK; ctx.lineWidth = 17; arm(); ctx.stroke(); ctx.strokeStyle = '#4a3a40'; ctx.lineWidth = 9; arm(); ctx.stroke();
  ctx.strokeStyle = INK; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(14, 20, 20, -1.57, 2.4); ctx.stroke(); ctx.strokeStyle = '#4a3a40'; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(14, 20, 20, -1.57, 2.4); ctx.stroke();
  fs(ctx, el(-4, -6, 14, 14), '#4a3a40', 5);
  if (web > 0) { ctx.save(); ctx.translate(0, -2); ctx.scale(1.2, 1); cobwebG(ctx, {r: 66, a: web}); ctx.restore(); }
  const q = t - t0; let ang = sway * Math.sin(t * 1.3 + 1.1);
  if (wind && t >= 0 && t < windT) ang += wind * Math.sin(t * 2 * Math.PI * 1.15) * clamp(1 - t / windT * 0.5) ; // a puff of wind (never a ring: no arcs, no sound): 6-8 degrees in the first second
  if (amp && q >= 0 && q < 3.0) ang = amp * Math.exp(-q * 0.95) * Math.sin(q * 2 * Math.PI * 2.6);
  ctx.save(); ctx.translate(78, 4); ctx.rotate(ang * Math.PI / 180);
  const R = 32, H = 50; bellBody(ctx, R, H, {dull: dust, lw: 5});
  clapper(ctx, R, H, amp && q >= 0 && q < 3 ? -ang * 0.4 : 0, 4);
  if (dust > 0.05) { // dust: grey drifts on the shoulder and a hanging thread of web
    ctx.save(); ctx.clip(bellPath(R, H)); ctx.fillStyle = `rgba(200,190,170,${0.6 * dust})`; for (const [x, y, rx, ry] of [[-12, 30, 14, 7], [10, 36, 12, 6], [0, 24, 18, 8], [-6, 60, 11, 5]]) ctx.fill(el(x, y, rx, ry, 0.2)); ctx.restore();
    ctx.strokeStyle = `rgba(255,255,255,${0.9 * dust})`; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(-R * 0.3, 18); ctx.quadraticCurveTo(-R * 1.1, 40, -R * 0.9, 90); ctx.stroke();
  }
  ctx.restore();
  const gk = clamp(Math.sin(t * 2.7) * 3 - 2.2); if (gk > 0 && !(amp && q > 0)) glint(ctx, 70, 38, gk, 0.9); // the metal winks about every 2.3 s
  if (shine > 0) { glint(ctx, 70, 38, shine, 1.4); glint(ctx, 112, 74, clamp(shine * 1.2 - 0.2), 0.8); } // forced shine of the brass (opening close-up)
  if (amp && q >= 0 && q < 1.6) glint(ctx, 66 + Math.sin(q * 9) * 4, 36, clamp(1 - q), 1.25);
  ctx.restore();
}

// ------------------------------------------------------------------ props: people's things
// a hat on A's head (fedora). lift = how far he raises it (head radii)
function hatG(ctx, {A = null, t = 0, color = '#6e4a2e', band = '#c4643a', lift = 0} = {}) {
  if (!A || !A._head || (A._alpha ?? 1) <= 0.02) return;
  const R = A._headR * A._s; ctx.save(); ctx.globalAlpha = A._alpha ?? 1; ctx.translate(A._head[0], A._head[1] - R * (0.72 + lift)); ctx.rotate(((A._st?.tilt) || 0) * Math.PI / 180 + lift * 0.4); ctx.lineJoin = 'round';
  fs(ctx, el(0, 0, R * 1.42, R * 0.3), color, Math.max(3, R * 0.07));
  const c = new Path2D(); c.moveTo(-R * 0.82, 0); c.bezierCurveTo(-R * 0.86, -R * 0.55, -R * 0.6, -R * 0.92, 0, -R * 0.9); c.bezierCurveTo(R * 0.6, -R * 0.92, R * 0.86, -R * 0.55, R * 0.82, 0); c.closePath(); fs(ctx, c, color, Math.max(3, R * 0.07));
  ctx.fillStyle = band; ctx.fillRect(-R * 0.83, -R * 0.3, R * 1.66, R * 0.2);
  ctx.restore();
}
// an apron over A's torso (cream, a neck strap). Uses the rig's own local→world map, so it follows the body.
function apronG(ctx, {A = null, color = '#fbf1dc', trim = '#c4643a', soil = 0.8} = {}) {
  if (!A || !A._rt || (A._alpha ?? 1) <= 0.02) return;
  const s = A._s, L = (x, y) => A._rt(x * s, y * s); ctx.save(); ctx.globalAlpha = A._alpha ?? 1; ctx.lineJoin = 'round';
  const pts = [L(-8.5, -62), L(8.5, -62), L(13.5, -22), L(-13.5, -22)], p = poly(pts); fs(ctx, p, color, Math.max(3, s * 0.55));
  ctx.save(); ctx.clip(p); ctx.fillStyle = `rgba(160,110,70,${0.3 * soil})`; for (const c of [L(-4, -30), L(6, -42), L(2, -50)]) ctx.fill(el(c[0], c[1], s * 2.6, s * 1.8, 0.3)); ctx.restore(); // a few stains: she is a mess, not filthy
  const a = L(-8, -62), b = L(-4, -68), c = L(4, -68), d = L(8, -62); ctx.strokeStyle = INK; ctx.lineWidth = Math.max(3, s * 0.6); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.moveTo(d[0], d[1]); ctx.lineTo(c[0], c[1]); ctx.stroke();
  const k = L(-11, -30), m = L(11, -30); ctx.strokeStyle = trim; ctx.lineWidth = Math.max(3, s * 0.5); ctx.beginPath(); ctx.moveTo(k[0], k[1]); ctx.lineTo(m[0], m[1]); ctx.stroke();
  ctx.restore();
}
// glossy tears welling: two drops on A's cheeks, from t0
function tearsG(ctx, {A = null, t = 0, t0 = 0, t1 = 1e9} = {}) {
  if (!A || !A._head || t < t0 || t > t1 || (A._alpha ?? 1) <= 0.02) return;
  const R = A._headR * A._s, k = easeOut((t - t0) / 0.5); ctx.save(); ctx.globalAlpha = A._alpha ?? 1; ctx.translate(A._head[0], A._head[1]); ctx.rotate(((A._st?.tilt) || 0) * Math.PI / 180);
  for (const sg of [-1, 1]) {
    ctx.fillStyle = 'rgba(222,244,255,.75)'; ctx.fill(el(sg * R * 0.37, R * 0.14, R * 0.2 * k, R * 0.1 * k));
    const dy = R * (0.16 + 0.5 * k * k), p = new Path2D(); p.moveTo(sg * R * 0.47, dy - R * 0.16); p.quadraticCurveTo(sg * R * 0.57, dy + R * 0.02, sg * R * 0.47, dy + R * 0.1); p.quadraticCurveTo(sg * R * 0.37, dy + R * 0.02, sg * R * 0.47, dy - R * 0.16);
    ctx.globalAlpha = (A._alpha ?? 1) * k; ctx.fillStyle = '#dff3ff'; ctx.fill(p); ctx.lineWidth = Math.max(2, R * 0.04); ctx.strokeStyle = INK; ctx.stroke(p);
  }
  ctx.restore();
}
// a packed suitcase by a door (origin = the base centre). pat 0..1 = squash when he pats it; tag = the label on the handle
function suitcaseBigG(ctx, {pat = 0, tag = '1994', dust = 1} = {}) {
  ctx.save(); ctx.lineJoin = 'round'; ctx.scale(1 + 0.04 * pat, 1 - 0.07 * pat);
  const body = new Path2D(); body.moveTo(-98, 0); body.lineTo(-104, -128); body.bezierCurveTo(-104, -176, 104, -176, 104, -128); body.lineTo(98, 0); body.closePath(); fs(ctx, body, '#8a5230', 6);
  ctx.save(); ctx.clip(body); ctx.strokeStyle = dark('#8a5230', 0.28); ctx.lineWidth = 7; for (const x of [-52, 52]) { ctx.beginPath(); ctx.moveTo(x, -190); ctx.lineTo(x, 4); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,240,210,.18)'; ctx.fill(el(-48, -140, 36, 14, -0.3));
  ctx.fillStyle = `rgba(214,198,166,${0.55 * dust})`; for (const [x, y, rx, ry] of [[-30, -160, 62, 12], [40, -150, 44, 10], [-60, -100, 28, 9], [60, -60, 26, 8]]) ctx.fill(el(x, y, rx, ry));
  ctx.restore();
  ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke(body);
  fs(ctx, rr(-100, -92, 200, 20, 6), '#6e4426', 5); fs(ctx, rr(-14, -98, 28, 34, 5), '#e8c25a', 4);
  fs(ctx, rr(-34, -204, 68, 40, 14), null, 7);
  fs(ctx, poly([[66, -140], [96, -168], [112, -156], [86, -126]]), '#fbf1dc', 4); ctx.strokeStyle = '#c4643a'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(100, -156); ctx.lineTo(90, -146); ctx.stroke(); // a sock sticking out: too full
  ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(30, -196); ctx.quadraticCurveTo(70, -160, 58, -118); ctx.stroke();
  ctx.save(); ctx.translate(58, -112); ctx.rotate(0.08); fs(ctx, rr(-44, -4, 88, 54, 6), '#fffdf2', 5); ctx.fillStyle = INK; ctx.font = '46px GraceCaption'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(tag, 0, 24); ctx.textAlign = 'left'; ctx.restore();
  ctx.restore();
}
// a Sunday dress. hang = on a hanger from a hook (origin = the hook); else laid out (origin = the neckline centre)
function dressG(ctx, {hang = true, color = '#e0a02e', collar = '#fbf1dc', crease = 0} = {}) {
  ctx.save(); ctx.lineJoin = 'round';
  if (hang) {
    fs(ctx, el(0, -14, 10, 10), '#4a3a40', 4); fs(ctx, rr(-34, -22, 68, 10, 4), '#6e4426', 4);
    ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(0, 22); ctx.moveTo(-70, 70); ctx.lineTo(0, 22); ctx.lineTo(70, 70); ctx.stroke();
    ctx.strokeStyle = '#d9b27a'; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(-70, 70); ctx.lineTo(0, 22); ctx.lineTo(70, 70); ctx.stroke();
    const d = new Path2D(); d.moveTo(-26, 58); d.lineTo(-86, 74); d.lineTo(-70, 120); d.lineTo(-42, 106); d.lineTo(-58, 300); d.quadraticCurveTo(0, 320, 58, 300); d.lineTo(42, 106); d.lineTo(70, 120); d.lineTo(86, 74); d.lineTo(26, 58); d.quadraticCurveTo(0, 82, -26, 58); d.closePath();
    fs(ctx, d, color, 6); fs(ctx, poly([[-26, 58], [0, 86], [26, 58], [14, 56], [0, 70], [-14, 56]]), collar, 4); ctx.strokeStyle = dark(color, 0.22); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-42, 106); ctx.lineTo(-46, 300); ctx.moveTo(42, 106); ctx.lineTo(46, 300); ctx.stroke();
    fs(ctx, rr(-44, 136, 88, 12, 5), '#c4643a', 3);
  } else {
    const d = new Path2D(); d.moveTo(-34, 0); d.lineTo(-110, 16); d.lineTo(-96, 64); d.lineTo(-52, 46); d.lineTo(-80, 250); d.quadraticCurveTo(0, 275, 80, 250); d.lineTo(52, 46); d.lineTo(96, 64); d.lineTo(110, 16); d.lineTo(34, 0); d.quadraticCurveTo(0, 28, -34, 0); d.closePath();
    fs(ctx, d, color, 6); fs(ctx, poly([[-34, 0], [0, 32], [34, 0], [18, -2], [0, 14], [-18, -2]]), collar, 4);
    ctx.strokeStyle = `rgba(80,40,0,${0.35 * crease})`; ctx.lineWidth = 5; for (const [x0, y0, x1, y1] of [[-30, 90, -10, 140], [20, 130, 50, 170], [-50, 180, -20, 210]]) { ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); }
  }
  ctx.restore();
}
// the ironing board (FRONT prop; origin = the top surface's centre) with the dress laid on it
function ironBoardG(ctx, {w = 640, legH = 330, dress = 1, t = 0, t0 = 9.6} = {}) {
  ctx.save(); ctx.lineJoin = 'round';
  for (const [dx, a] of [[-1, 0.3], [1, -0.3]]) { ctx.strokeStyle = INK; ctx.lineWidth = 17; ctx.beginPath(); ctx.moveTo(dx * w * 0.2, 30); ctx.lineTo(dx * w * 0.2 + a * legH * 0.9, legH); ctx.stroke(); ctx.strokeStyle = '#8c8498'; ctx.lineWidth = 8; ctx.stroke(); }
  const b = new Path2D(); b.moveTo(-w / 2, -10); b.bezierCurveTo(-w / 2 + 40, -80, w * 0.1, -84, w / 2 - 20, -62); b.quadraticCurveTo(w / 2 + 8, -8, w / 2 - 20, 52); b.bezierCurveTo(w * 0.1, 70, -w / 2 + 40, 70, -w / 2, -10); b.closePath();
  fs(ctx, b, '#f3e4c4', 6);
  if (dress) { // the dress laid flat, seen from above: neck at the left, sleeves up and down, the skirt flaring to the right
    ctx.save(); ctx.translate(-w * 0.3, -6); const cr = 1 - clamp((t - t0) / 1.4) * 0.95;
    fs(ctx, rr(-110, -66, 52, 22, 6), '#e0a02e', 5); fs(ctx, rr(-110, 44, 52, 22, 6), '#e0a02e', 5);
    fs(ctx, poly([[-100, -46], [-40, -46], [150, -78], [150, 78], [-40, 46], [-100, 46]]), '#e0a02e', 6);
    fs(ctx, rr(-108, -22, 30, 44, 8), '#fbf1dc', 4);
    ctx.strokeStyle = `rgba(80,40,0,${0.4 * cr})`; ctx.lineWidth = 5; for (const [x0, y0, x1, y1] of [[10, -40, 40, -10], [60, 10, 100, 40], [30, 30, 60, 55], [90, -50, 120, -20]]) { ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); }
    ctx.restore(); }
  ctx.restore();
}
// an iron held in a hand (origin = the hand). steam rises
function ironG(ctx, {t = 0, steam = 1} = {}) {
  ctx.save(); ctx.lineJoin = 'round';
  const body = new Path2D(); body.moveTo(-62, 0); body.quadraticCurveTo(-72, -46, -22, -52); body.lineTo(48, -52); body.quadraticCurveTo(76, -34, 82, 0); body.closePath(); fs(ctx, body, '#cbc6bd', 6);
  fs(ctx, rr(-60, -4, 142, 12, 4), '#8c8680', 4); ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fill(el(-8, -40, 32, 6, -0.1));
  ctx.strokeStyle = INK; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(-30, -52); ctx.quadraticCurveTo(-10, -112, 36, -104); ctx.lineTo(44, -52); ctx.stroke(); ctx.strokeStyle = '#7a4a2a'; ctx.lineWidth = 8; ctx.stroke();
  if (steam) { ctx.lineCap = 'round'; for (let i = 0; i < 3; i++) { const ph = t * 2.1 + i * 2.2; ctx.strokeStyle = 'rgba(255,252,240,.8)'; ctx.lineWidth = 9; ctx.beginPath(); for (let j = 0; j <= 8; j++) { const y = -62 - j * 20, x = 64 + i * 18 + Math.sin(ph + j * 0.6) * 12; j ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); } }
  ctx.restore();
}
// the sink with the pile of dishes (origin = the counter top, centre). n = items in the pile, shake = px of tremor
function sinkDishesG(ctx, {n = 9, shake = 0, t = 0} = {}) {
  ctx.save(); ctx.lineJoin = 'round';
  const col = ['#fbf1dc', '#e9d8b8', '#f3e4c4', '#c9d6b0', '#fbf1dc', '#e8b8a0'];
  const jit = i => shake ? [Math.sin(t * 70 + i * 2.1) * shake, Math.cos(t * 83 + i) * shake * 0.6] : [0, 0];
  ctx.save(); ctx.translate(...jit(1)); fs(ctx, rr(-170, -150, 140, 112, 18), '#5d4a46', 6); fs(ctx, rr(-182, -166, 164, 24, 10), '#6f5b56', 5); ctx.restore();
  for (let i = 0; i < Math.min(n, 11); i++) { const [jx, jy] = jit(i + 3); const x = -10 + (i % 2 ? 8 : -8) + (i > 7 ? 55 : 0) + jx, y = -22 - i * 21 + (i > 7 ? 120 : 0) + jy, w = 118 - (i % 3) * 8; ctx.save(); ctx.translate(x, y); ctx.rotate(((i % 3) - 1) * 0.05); fs(ctx, el(0, 0, w, 20), col[i % col.length], 5); fs(ctx, el(0, -4, w * 0.62, 10), mix(col[i % col.length], '#c98f5a', 0.25), 0); ctx.restore(); }
  for (let i = 0; i < 3; i++) { const [jx, jy] = jit(i + 20); ctx.save(); ctx.translate(130 + i * 24 + jx, -34 + jy); ctx.rotate(-0.6 + i * 0.12); fs(ctx, el(0, 0, 68, 14), col[(i + 2) % col.length], 4); ctx.restore(); }
  ctx.save(); ctx.translate(...jit(9)); fs(ctx, rr(96, -86, 34, 52, 10), '#e8c25a', 4); ctx.restore();
  ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(60, -230 + jit(5)[1]); ctx.lineTo(110, -170); ctx.stroke(); ctx.strokeStyle = '#c9c6c0'; ctx.lineWidth = 3.5; ctx.stroke();
  for (let i = 0; i < 7; i++) { ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.fill(el(-150 + hashN(i * 2.3) * 300, 6 - hashN(i + 3) * 14, 9 + hashN(i) * 8, 7)); }
  ctx.restore();
}
// three letters from her sister on the table (origin = the table top centre). They arrive one by one (ts); the counter plate rides above them.
function lettersG(ctx, {t = 0, ts = [15.3, 15.62, 16.18], plate = true, plateDx = 70, slideT = 1e9} = {}) {
  ctx.save(); ctx.lineJoin = 'round';
  const slots = [[-120, 0, -0.16], [0, -6, 0.04], [124, 0, 0.18]]; let n = 0;
  slots.forEach(([x, y, a], i) => {
    const q = (t - ts[i]) / 0.3; if (q < 0) return; n++;
    const e = easeOutBack(clamp(q)), dy = (1 - clamp(q)) * -90, dx = (1 - clamp(q)) * 420;
    if (i === 2 && slideT < 1e8) { // the third letter lands on top of the second and, on «never answered», slips off the pile and tumbles into its place
      const sk = clamp((t - slideT) / 0.5), se = sk * sk * (3 - 2 * sk), bounce = Math.sin(clamp((sk - 0.55) / 0.45) * Math.PI) * 14;
      x = lerp(26, x, se) + (sk > 0 && sk < 1 ? 10 * Math.sin(sk * Math.PI) : 0); y = lerp(-46, y, sk * sk) - bounce; a = lerp(0.1, a, se) + 0.5 * Math.sin(sk * Math.PI);
    }
    ctx.save(); ctx.translate(x + dx, y - 20 + dy); ctx.rotate(a + (1 - clamp(q)) * 0.4); ctx.scale(e, e);
    fs(ctx, rr(-82, -52, 164, 104, 6), '#fffaea', 6); ctx.strokeStyle = 'rgba(150,110,70,.55)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-82, -52); ctx.lineTo(0, 8); ctx.lineTo(82, -52); ctx.stroke();
    fs(ctx, el(0, 8, 13, 13), '#b8402e', 4);
    ctx.fillStyle = '#6a4a2e'; ctx.font = '34px GraceCaption'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('SIS', -72, 38);
    fs(ctx, rr(48, -48, 28, 34, 3), '#e8a05a', 3);
    ctx.restore();
  });
  if (plate && n > 0) {
    const pw = 232, ph = 84; ctx.save(); ctx.translate(plateDx, -200);
    const pk = n === 3 && t - ts[2] < 0.5 ? 1 + 0.12 * Math.sin((t - ts[2]) / 0.5 * Math.PI) : 1; ctx.scale(pk, pk);
    fs(ctx, rr(-pw / 2, -ph / 2, pw, ph, 16), '#2a1810', 6); ctx.lineWidth = 5; ctx.strokeStyle = '#d9a441'; ctx.stroke(rr(-pw / 2 + 6, -ph / 2 + 6, pw - 12, ph - 12, 12));
    ctx.fillStyle = '#f3dfb8'; ctx.font = '30px GraceCaption'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('LETTERS', -pw / 2 + 22, 0);
    ctx.fillStyle = n === 3 ? '#ffc94a' : '#ffae5c'; ctx.font = '72px GraceCaption'; ctx.textAlign = 'right'; ctx.fillText(String(n), pw / 2 - 24, 4);
    ctx.restore();
  }
  ctx.restore();
}
// a shelf with a small Bible and a rosary under dust and a cobweb (origin = the shelf's top, centre). hl 0..1 = a gentle warm glow on them
function shelfG(ctx, {hl = 0, t = 0, dust = 1} = {}) {
  ctx.save(); ctx.lineJoin = 'round';
  fs(ctx, rr(-170, 0, 340, 26, 6), WARM.woodD, 5); for (const x of [-120, 120]) fs(ctx, poly([[x - 14, 26], [x + 14, 26], [x, 70]]), WARM.wood, 4);
  if (hl > 0) glow(ctx, 0, -40, 220, 0.55 * hl, '255,214,120');
  fs(ctx, rr(-120, -64, 118, 64, 6), '#7a2f3a', 6); fs(ctx, rr(-112, -58, 104, 50, 3), '#fbf1dc', 3); fs(ctx, rr(-120, -64, 14, 64, 4), '#5a1f2a', 4);
  ctx.save(); ctx.translate(-61, -32); ctx.strokeStyle = '#d9a441'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(0, 12); ctx.moveTo(-9, -4); ctx.lineTo(9, -4); ctx.stroke(); ctx.restore();
  ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(40, -4); ctx.quadraticCurveTo(70, 90, 120, 40); ctx.stroke();
  for (let i = 0; i < 11; i++) { const q = i / 10, x = lerp(40, 120, q), y = -4 + Math.sin(q * Math.PI) * 74 - q * 4; fs(ctx, el(x + Math.sin(q * 3) * 2, y, 8, 8), i % 5 === 2 ? '#e8c25a' : '#7a2f3a', 3); }
  fs(ctx, el(112, 56, 6, 6), '#e8c25a', 3);
  if (dust > 0) { ctx.fillStyle = `rgba(214,204,184,${0.7 * dust})`; for (const [x, y, rx, ry] of [[-78, -62, 40, 7], [-20, 2, 120, 5], [60, -2, 30, 4]]) ctx.fill(el(x, y, rx, ry)); ctx.save(); ctx.translate(-168, -2); ctx.scale(1, -1); cobwebG(ctx, {r: 74, a: dust}); ctx.restore(); }
  if (hl > 0) for (let i = 0; i < 6; i++) { const q = (t * 0.6 + i / 6) % 1, x = -100 + hashN(i * 2) * 200, y = -20 - q * 130; ctx.fillStyle = `rgba(255,236,170,${0.9 * hl * (1 - q)})`; ctx.fill(el(x, y, 5, 5)); }
  ctx.restore();
}
// the thought: the whole town in a tidy queue, and Marta, tiny, last, in her apron. k 0..1 pops it. (origin = the cloud centre)
function queueThoughtG(ctx, {k = 1, t = 0, W = 540, Hh = 300, tail = null} = {}) {
  if (k <= 0) return; ctx.save();
  if (tail) for (const [f, r] of [[0.55, 26], [0.72, 18], [0.88, 12]]) { const p = el(tail[0] * f, tail[1] * f, r, r); ctx.fillStyle = '#fffdf4'; ctx.fill(p); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke(p); }
  ctx.save(); const sc = Math.max(0.01, easeOutBack(clamp(k))); ctx.scale(sc, sc); ctx.lineJoin = 'round';
  const cl = new Path2D(); const bumps = 12; for (let i = 0; i < bumps; i++) { const a = i / bumps * Math.PI * 2, x = Math.cos(a) * W / 2 * 0.86, y = Math.sin(a) * Hh / 2 * 0.86; cl.moveTo(x + 70, y); cl.arc(x, y, 70 + (i % 3) * 8, 0, Math.PI * 2); }
  cl.rect(-W * 0.36, -Hh * 0.36, W * 0.72, Hh * 0.72);
  ctx.lineWidth = 12; ctx.strokeStyle = INK; ctx.stroke(cl); ctx.fillStyle = '#fffdf4'; ctx.fill(cl);
  const cols = ['#e2574c', '#3f8a7a', '#9a7ab0', '#d9a441', '#c4643a', '#7c8f4a', '#3f6a7a'];
  const person = (x, y, s, c, o = {}) => { ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-6, -20); ctx.lineTo(-6, 0); ctx.moveTo(6, -20); ctx.lineTo(6, 0); ctx.stroke();
    fs(ctx, rr(-13, -62, 26, 46, 8), c, 5); if (o.apron) fs(ctx, rr(-10, -54, 20, 36, 5), '#fbf1dc', 4);
    fs(ctx, el(0, -76, 12, 13), o.skin || '#e3b38e', 5); if (o.hat) fs(ctx, rr(-14, -90, 28, 8, 3), '#6e4a2e', 4);
    ctx.restore(); };
  for (let i = 0; i < 7; i++) person(-W * 0.38 + i * (W * 0.1), 38 - i * 2, 1.05, cols[i % cols.length], {hat: i % 3 === 1, skin: ['#e3b38e', '#c98b5e', '#f0c7a4'][i % 3]});
  person(W * 0.37, 34 + Math.sin(t * 3) * 1.5, 0.78, '#e0a02e', {apron: true});
  ctx.fillStyle = '#6a4a2e'; for (let i = 0; i < 3; i++) ctx.fill(el(W * 0.3 + i * 12, 4, 3.5, 3.5));
  ctx.restore(); ctx.restore();
}
// the calendar page that lands: TUESDAY (origin = centre). k 0..1
function calTueG(ctx, {k = 1} = {}) {
  if (k <= 0) return; const e = Math.max(0.01, easeOutBack(clamp(k))); ctx.save(); ctx.scale(e, e); ctx.rotate((1 - clamp(k)) * -0.35 - 0.03);
  fs(ctx, rr(-210, -170, 420, 340, 24), '#fbf1dc', 8); fs(ctx, rr(-210, -170, 420, 100, 24), '#c4643a', 8); ctx.fillStyle = '#c4643a'; ctx.fillRect(-206, -110, 412, 20);
  ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-210, -70); ctx.lineTo(210, -70); ctx.stroke();
  for (const x of [-120, 120]) fs(ctx, rr(x - 10, -196, 20, 54, 8), '#6e4426', 5);
  ctx.fillStyle = '#fff4dc'; ctx.font = '62px GraceCaption'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('NOVEMBER', 0, -118);
  ctx.fillStyle = INK; ctx.font = '150px GraceCaption'; ctx.fillText('TUESDAY', 0, 40); ctx.textAlign = 'left'; ctx.restore();
}
// ------------------------------------------------------------------ props: the kitchen door and the light
// the kitchen's front door seen from inside: the SAME arched plank door as Marta's door outside (origin = the hinge, left of the doorway; leaf 260 wide, 720 high, round top)
function kDoorG(ctx, {open = 0, color = '#7a4a2a'} = {}) {
  const w = 260 * (1 - open * 0.82); if (w < 4) return; ctx.save(); ctx.lineJoin = 'round';
  const H = 720, skew = open * 52, r = w / 2;
  const p = new Path2D(); p.moveTo(0, H); p.lineTo(0, r + 40); p.bezierCurveTo(0, 14, r * 0.55, 0, r, skew * 0.5); p.bezierCurveTo(r * 1.45, skew * 0.5, w, 14 + skew, w, r + 40 + skew); p.lineTo(w, H - skew); p.closePath();
  fs(ctx, p, color, 6);
  ctx.save(); ctx.clip(p); ctx.strokeStyle = dark(color, 0.3); ctx.lineWidth = 5; for (let k = 1; k < 4; k++) { ctx.beginPath(); ctx.moveTo(w * k / 4, -10); ctx.lineTo(w * k / 4, H); ctx.stroke(); }
  for (const y of [260, 560]) { ctx.fillStyle = '#4a3a40'; ctx.fillRect(0, y + skew * 0.3, w, 20); }
  ctx.restore();
  ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.stroke(p);
  if (w > 50) fs(ctx, el(w * 0.84, 430, 10, 10), '#e8c25a', 4);
  ctx.restore();
}
// the gold light entering the room from the doorway (origin = world). k 0..1. NOT a tint: the room stays as it is, only the light comes in.
function kLightFanG(ctx, {k = 1, t = 0, x0 = 800, x1 = 1030, y = 1300} = {}) {
  if (k <= 0) return; ctx.save();
  glow(ctx, (x0 + x1) / 2, 900, 760, 0.42 * k, '255,226,140');
  const g = ctx.createLinearGradient(0, y, 0, 1920); g.addColorStop(0, `rgba(255,226,130,${0.7 * k})`); g.addColorStop(1, `rgba(255,236,170,${0.34 * k})`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.lineTo(x1 - 60, 1920); ctx.lineTo(x0 - 740, 1920); ctx.closePath(); ctx.fill();
  const g2 = ctx.createLinearGradient(x1, 700, x0 - 500, 700); g2.addColorStop(0, `rgba(255,236,170,${0.38 * k})`); g2.addColorStop(1, 'rgba(255,236,170,0)'); ctx.fillStyle = g2; ctx.beginPath(); ctx.moveTo(x0 - 6, 560); ctx.lineTo(x1, 560); ctx.lineTo(x1, y); ctx.lineTo(x0 - 520, y); ctx.lineTo(x0 - 520, 760); ctx.closePath(); ctx.fill();
  for (let i = 0; i < 18; i++) { const q = (t * 0.25 + hashN(i * 2.2)) % 1, x = lerp(x0, x0 - 600, q) + hashN(i + 4) * 120, yy = y - 100 + q * 500 - hashN(i + 9) * 380; ctx.fillStyle = `rgba(255,250,214,${0.85 * k * Math.sin(q * Math.PI)})`; ctx.fill(el(x, yy, 4 + hashN(i) * 4, 4 + hashN(i) * 4)); }
  ctx.restore();
}
// the line of gold under the closed front door + the glow it throws on the ground in front (outside view; origin = world). k 0..1
function doorLightG(ctx, {k = 1, x0 = 210, x1 = 650, y = 1332} = {}) {
  if (k <= 0) return; ctx.save();
  const g = ctx.createLinearGradient(0, y, 0, y + 420); g.addColorStop(0, `rgba(255,222,120,${0.85 * k})`); g.addColorStop(1, 'rgba(255,222,120,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x0 + 10, y); ctx.lineTo(x1 - 10, y); ctx.lineTo(x1 + 150, y + 420); ctx.lineTo(x0 - 150, y + 420); ctx.closePath(); ctx.fill();
  glow(ctx, (x0 + x1) / 2, y - 8, 380 * k + 40, 0.5 * k, '255,226,130');
  ctx.fillStyle = `rgba(255,244,190,${k})`; ctx.fillRect(x0 + 4, y - 10, x1 - x0 - 8, 12 * (0.6 + 0.4 * k));
  ctx.strokeStyle = `rgba(255,226,130,${0.7 * k})`; ctx.lineWidth = 6; ctx.lineCap = 'round'; for (const x of [x0 + 60, x1 - 60, (x0 + x1) / 2]) { ctx.beginPath(); ctx.moveTo(x, y - 20); ctx.lineTo(x, y - 20 - 70 * k); ctx.stroke(); }
  ctx.restore();
}
// birds bursting from a point (the belfry roof) and flying away. origin = the roof. from t0, n birds, they leave in ~1.6 s
function scatterBirdsG(ctx, {t = 0, t0 = 0, n = 9, perch = true} = {}) {
  const q = t - t0; ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (let i = 0; i < n; i++) {
    const hx = (hashN(i * 2.7 + 1) - 0.5) * 220, hy = -hashN(i * 1.3 + 4) * 40, ang = -1.57 + (hashN(i + 7) - 0.5) * 2.6, sp = 420 + hashN(i + 3) * 380;
    let x = hx, y = hy, f = 0;
    if (q < 0) { if (!perch) continue; f = 0; } else { const e = q * (1 + q * 0.6); x = hx + Math.cos(ang) * sp * e; y = hy + Math.sin(ang) * sp * e * 0.9; f = Math.sin(q * 26 + i * 2) * 16; if (q > 2.4) continue; }
    ctx.save(); ctx.translate(x, y); const fl = q < 0 ? 0 : f;
    ctx.strokeStyle = INK; ctx.lineWidth = 11; ctx.beginPath(); ctx.moveTo(-26, -fl); ctx.quadraticCurveTo(-10, -14, 0, 0); ctx.quadraticCurveTo(10, -14, 26, -fl); ctx.stroke();
    ctx.strokeStyle = '#7a4a2a'; ctx.lineWidth = 5.5; ctx.stroke();
    fs(ctx, el(0, 4, 12, 9), '#7a4a2a', 4); ctx.restore();
  }
  ctx.restore();
}

// a little spider lowering itself on a thread from (0, 0) (origin = where the thread is anchored). Drops from t0 over `drop` s, then dangles and bobs. len = px.
function spiderG(ctx, {t = 0, t0 = 0, drop = 0.7, len = 150, s = 1} = {}) {
  const q = t - t0; if (q < 0) return;
  const k = easeOut(clamp(q / drop)), y = len * k + (q > drop ? Math.sin((q - drop) * 5) * 7 * Math.exp(-(q - drop) * 0.8) : 0);
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(60,45,35,.45)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, y); ctx.stroke();
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.8; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, y); ctx.stroke();
  ctx.translate(0, y + 14 * s); ctx.rotate(Math.sin(q * 6) * 0.08); ctx.scale(s, s);
  const kick = q > drop ? Math.sin((q - drop) * 14) * 5 : Math.sin(q * 30) * 6;
  ctx.strokeStyle = INK; ctx.lineWidth = 5;
  for (const sg of [-1, 1]) for (let i = 0; i < 4; i++) { const a = (i - 1.5) * 0.5, x1 = sg * (20 + i * 3), y1 = -8 + i * 8 + (i % 2 ? kick : -kick) * 0.6; ctx.beginPath(); ctx.moveTo(sg * 6, (i - 1.5) * 4); ctx.quadraticCurveTo(sg * (16 + i * 2), y1 - 14, x1, y1 + 10); ctx.stroke(); }
  fs(ctx, el(0, 0, 14, 16), '#3a2a2e', 4); fs(ctx, el(0, -17, 9, 9), '#3a2a2e', 4);
  ctx.fillStyle = '#fffdf4'; ctx.fill(el(-4, -19, 3.4, 3.8)); ctx.fill(el(4, -19, 3.4, 3.8)); ctx.fillStyle = INK; ctx.fill(el(-3.6, -18.4, 1.6, 1.8)); ctx.fill(el(4.4, -18.4, 1.6, 1.8));
  ctx.restore();
}
// warm gold motes drifting up in the air (world coords, whole frame). k 0..1 = how many/bright
function motesG(ctx, {t = 0, k = 1, x0 = 0, x1 = 1080, y0 = 400, y1 = 1500, n = 36} = {}) {
  if (k <= 0) return; ctx.save();
  for (let i = 0; i < n; i++) { const q = (t * (0.07 + hashN(i * 1.9) * 0.06) + hashN(i * 3.3)) % 1, x = lerp(x0, x1, hashN(i * 2.2 + 1)) + Math.sin(t * 0.9 + i) * 14, y = lerp(y1, y0, q), r = 4 + hashN(i + 7) * 6;
    ctx.fillStyle = `rgba(255,232,150,${0.9 * k * Math.sin(q * Math.PI)})`; ctx.fill(el(x, y, r, r)); ctx.fillStyle = `rgba(255,244,200,${0.35 * k * Math.sin(q * Math.PI)})`; ctx.fill(el(x, y, r * 2.2, r * 2.2)); }
  ctx.restore();
}
Object.assign(PROPS, {spiderG, motesG, scatterBirdsG, towerBellG, soundG, dustPuffG, cobwebG, handBellG, hatG, apronG, tearsG, suitcaseBigG, dressG, ironBoardG, ironG, sinkDishesG, lettersG, shelfG, queueThoughtG, calTueG, kDoorG, kLightFanG, doorLightG});

// ------------------------------------------------------------------ places
const STONE = '#ead3a6';
// the bell tower: shaft + belfry (open arch, dark inside) + roof + cross. x = left edge, w = width, top = the belfry's top.
function tower(ctx, x, w, top, base) {
  const cx = x + w / 2;
  fs(ctx, rr(x, top + 200, w, base - top - 200, 4), STONE);
  ctx.strokeStyle = 'rgba(150,110,60,.28)'; ctx.lineWidth = 4; for (let y = top + 250; y < base - 20; y += 64) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.stroke(); for (let xx = x + 40 + ((y / 64 | 0) % 2) * 40; xx < x + w; xx += 80) { ctx.beginPath(); ctx.moveTo(xx, y); ctx.lineTo(xx, y + 64); ctx.stroke(); } }
  fs(ctx, rr(x - 14, top + 186, w + 28, 26, 6), '#d6b786', 5);
  fs(ctx, rr(x - 6, top, w + 12, 190, 4), STONE);
  const ax = x + 36, aw = w - 72, ay = top + 28; const arch = new Path2D(); arch.moveTo(ax, ay + 160); arch.lineTo(ax, ay + aw / 2); arch.arc(ax + aw / 2, ay + aw / 2, aw / 2, Math.PI, 0); arch.lineTo(ax + aw, ay + 160); arch.closePath();
  fs(ctx, arch, '#4a343a', 6);
  fs(ctx, poly([[x - 26, top + 2], [cx, top - 170], [x + w + 26, top + 2]]), WARM.roof, 6);
  ctx.strokeStyle = dark(WARM.roof, 0.2); ctx.lineWidth = 4; for (let i = 1; i < 6; i++) { const k = i / 6; ctx.beginPath(); ctx.moveTo(x - 26 + k * (w / 2 + 26), top + 2 - k * 172); ctx.lineTo(x + w + 26 - k * (w / 2 + 26), top + 2 - k * 172); ctx.stroke(); }
  fs(ctx, rr(cx - 5, top - 232, 10, 66, 3), '#3c2c24', 3); fs(ctx, rr(cx - 26, top - 212, 52, 10, 3), '#3c2c24', 3);
  fs(ctx, el(cx, top + 330, 70, 70), '#fff8e8', 7); ctx.strokeStyle = INK; ctx.lineWidth = 5; for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; ctx.beginPath(); ctx.moveTo(cx + Math.sin(a) * 56, top + 330 - Math.cos(a) * 56); ctx.lineTo(cx + Math.sin(a) * 64, top + 330 - Math.cos(a) * 64); ctx.stroke(); }
  ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx, top + 330); ctx.lineTo(cx, top + 286); ctx.moveTo(cx, top + 330); ctx.lineTo(cx + 34, top + 346); ctx.stroke();
  const d = new Path2D(); d.moveTo(cx - 44, base); d.lineTo(cx - 44, base - 96); d.arc(cx, base - 96, 44, Math.PI, 0); d.lineTo(cx + 44, base); d.closePath(); fs(ctx, d, WARM.wood, 5);
}
// where things hang: the bell tower's beam (towerBellG) and the little bell's plate (handBellG) in each view
export const BELL_AT = {street: [155, 612], square: [540, 612]};
export const HAND_AT = [768, 1010];
Object.assign(SETS, {
  // the village: view 'street' = the tower on the left, Henderson's cottage (door x 400..496), Marta's cottage on the right (door x 640..760; the little bell at HAND_AT);
  // view 'square' = the tower in the middle, a house either side, a fountain. ONE level of light (day).
  gbTown({view = 'street'} = {}) {
    return ctx => {
      sky(ctx, 'gold', 1300);
      fs(ctx, poly([[0, 1090], [200, 1010], [440, 1070], [700, 990], [1080, 1060], [1080, 1300], [0, 1300]]), '#d9b27a', 4);
      if (view === 'street') {
        tower(ctx, 20, 270, 560, 1290);
        cottage(ctx, 300, 230, 700, 1290, WARM.plaster[2], {door: true});
        const mx = 560; fs(ctx, rr(mx, 700, 520, 590, 4), '#e2b184');
        ctx.fillStyle = dark('#e2b184', 0.07); for (let i = 0; i < 6; i++) ctx.fill(el(mx + 40 + hashN(i * 3) * 440, 760 + hashN(i + 9) * 460, 26, 11));
        fs(ctx, poly([[mx - 30, 706], [mx + 260, 540], [mx + 550, 706]]), WARM.roof, 6);
        ctx.strokeStyle = dark(WARM.roof, 0.2); ctx.lineWidth = 4; for (let i = 1; i < 6; i++) { const k = i / 6; ctx.beginPath(); ctx.moveTo(mx - 30 + k * 290, 706 - k * 166); ctx.lineTo(mx + 550 - k * 290, 706 - k * 166); ctx.stroke(); }
        fs(ctx, rr(mx + 300, 820, 100, 130, 6), WARM.cream, 4); fs(ctx, rr(mx + 308, 828, 84, 114, 3), '#4a3a3e', 4); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(mx + 350, 828); ctx.lineTo(mx + 350, 942); ctx.moveTo(mx + 308, 885); ctx.lineTo(mx + 392, 885); ctx.stroke();
        const dw = 120, dx = 640, dy = 1050, d = new Path2D(); d.moveTo(dx, 1290); d.lineTo(dx, dy + dw / 2); d.arc(dx + dw / 2, dy + dw / 2, dw / 2, Math.PI, 0); d.lineTo(dx + dw, 1290); d.closePath(); fs(ctx, d, '#7a4a2a', 6);
        ctx.fillStyle = WARM.gold; ctx.fill(el(dx + dw - 20, dy + 130, 7, 7)); fs(ctx, rr(dx - 14, 1284, dw + 28, 14, 3), '#cdb58a', 4);
        olive(ctx, 322, 1330, 0.7);
      } else {
        tower(ctx, 390, 300, 560, 1290);
        cottage(ctx, -60, 400, 780, 1290, WARM.plaster[0], {door: true}); cottage(ctx, 700, 440, 760, 1290, WARM.plaster[3], {door: true});
        olive(ctx, 90, 1340, 0.85); olive(ctx, 1000, 1340, 0.8);
      }
      cobbles(ctx, 1290, '#dcc29a', false);
      if (view === 'square') { fs(ctx, el(540, 1500, 250, 70), '#cdb58a', 6); fs(ctx, el(540, 1490, 215, 52), '#bfe6e0', 5); fs(ctx, rr(520, 1380, 40, 100, 6), '#cdb58a', 5); fs(ctx, el(540, 1380, 56, 18), '#cdb58a', 5); }
      glow(ctx, 540, 1100, 760, 0.12, '255,226,170');
    };
  },
  // Marta's front door, close, outside: plaster wall, a heavy wooden door (shut), a dry pot. The little bell hangs at (880, 700) (prop); the gold light is the prop doorLightG.
  gbMartaDoor() {
    return ctx => {
      ctx.fillStyle = '#e2b184'; ctx.fillRect(0, 0, 1080, 1920); ctx.fillStyle = dark('#e2b184', 0.07); for (let i = 0; i < 26; i++) ctx.fill(el(hashN(i) * 1080, hashN(i + 9) * 1300, 40, 16));
      ctx.strokeStyle = 'rgba(120,80,40,.3)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(120, 420); ctx.lineTo(150, 520); ctx.lineTo(120, 600); ctx.lineTo(160, 700); ctx.stroke();
      ctx.save(); ctx.translate(-110, 0);
      fs(ctx, rr(290, 580, 500, 760, 16), WARM.stone, 8);
      const d = new Path2D(); d.moveTo(320, 1330); d.lineTo(320, 840); d.arc(540, 840, 220, Math.PI, 0); d.lineTo(760, 1330); d.closePath(); fs(ctx, d, '#7a4a2a', 8);
      ctx.strokeStyle = dark('#7a4a2a', 0.3); ctx.lineWidth = 5; for (let x = 400; x < 760; x += 110) { ctx.beginPath(); ctx.moveTo(x, 700); ctx.lineTo(x, 1330); ctx.stroke(); }
      for (const y of [900, 1180]) fs(ctx, rr(320, y, 440, 22, 4), '#4a3a40', 4);
      fs(ctx, el(690, 1100, 22, 22), '#e8c25a', 5); fs(ctx, rr(280, 1326, 520, 22, 4), '#cdb58a', 5);
      ctx.restore();
      fs(ctx, poly([[880, 1230], [980, 1230], [966, 1340], [894, 1340]]), '#c46a3c'); ctx.strokeStyle = '#8a6a3a'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(930, 1230); ctx.quadraticCurveTo(960, 1160, 920, 1110); ctx.moveTo(940, 1230); ctx.quadraticCurveTo(990, 1180, 1000, 1130); ctx.stroke();
      cobbles(ctx, 1348, '#d4b98e', false);
      glow(ctx, 540, 1000, 700, 0.1, '255,226,170');
    };
  },
  // Linda's room at night: the ONE night of the story (the line says «every single night»). Plum walls, a lamp, a window; lit by the lamp.
  gbIronRoom() {
    return ctx => {
      room(ctx, '#6a4a72', '#52385a', '#5a3c34');
      windowPane(ctx, 700, 340, 260, 400, 'night');
      for (const x of [650, 1000]) fs(ctx, rr(x, 300, 50, 520, 18), '#8a3f4a', 4);
      fs(ctx, rr(60, 520, 220, 640, 10), WARM.woodD, 6); fs(ctx, rr(76, 540, 188, 600, 6), '#7a5030', 4); fs(ctx, el(240, 840, 9, 9), '#e8c25a', 3);
      fs(ctx, rr(496, 1196, 12, 120, 3), '#3c2c24', 3); fs(ctx, poly([[456, 1196], [548, 1196], [530, 1080], [474, 1080]]), '#ffe08a', 6);
      glow(ctx, 502, 1100, 760, 0.55, '255,206,120'); glow(ctx, 502, 1100, 360, 0.4, '255,224,150');
    };
  },
  // Marta's kitchen, day: window, a shelf (prop shelfG at 330, 700), the sink on the left (dishes are the prop sinkDishesG at (250, 1070)), the front door on the right (leaf = kDoorG at 790, 580).
  gbKitchen() {
    return ctx => {
      room(ctx, '#f3dcb2', '#c98f5a', '#b98a5e');
      windowPane(ctx, 560, 380, 260, 360, 'noon');
      fs(ctx, rr(20, 1090, 470, 210, 8), '#b5552f', 6); fs(ctx, rr(8, 1070, 494, 34, 8), WARM.wood, 6); fs(ctx, rr(60, 1100, 260, 40, 14), '#8a8a90', 5);
      fs(ctx, rr(400, 880, 22, 200, 6), '#8c8c92', 4); fs(ctx, rr(360, 870, 90, 20, 8), '#8c8c92', 4);
      fs(ctx, rr(40, 360, 380, 26, 6), WARM.woodD, 4); [['#d9774b', 70], ['#7c8f4a', 150], ['#f4b942', 230], ['#c4643a', 310]].forEach(([c, x], i) => fs(ctx, rr(x, 290 - (i % 2) * 18, 56, 70 + (i % 2) * 18, 10), c, 4));
      const arch = (x, w, y0, y1) => { const p = new Path2D(); p.moveTo(x, y1); p.lineTo(x, y0 + w / 2); p.arc(x + w / 2, y0 + w / 2, w / 2, Math.PI, 0); p.lineTo(x + w, y1); p.closePath(); return p; };
      fs(ctx, arch(768, 296, 558, 1306), '#e8d49a', 8); const g = ctx.createLinearGradient(790, 0, 1040, 0); g.addColorStop(0, '#fff3c0'); g.addColorStop(1, '#ffe9a0'); ctx.fillStyle = g; ctx.fill(arch(790, 260, 580, 1300));
      fs(ctx, rr(1070, 700, 20, 610, 4), '#cdb58a', 5);
    };
  },
});
