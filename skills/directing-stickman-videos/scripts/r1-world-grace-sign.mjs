// R1 · grace-remains ep12 "The Sign": the one sin that never comes off is a piece of CARDBOARD on a stick that Owen holds up himself.
// New places (confessional inside, parking lot, shop window, night yard) and props: the cardboard sign (follows its holder, is pulled to another's
// hand), a car, a parking sign, a donut box, sugar on a mustache, the paper rain of a hundred confessions, a reflection of an actor in glass, a
// spiky scribble shout, a gold halo. Registered into SETS/PROPS on import. NOTHING existing in the engine is edited.
import {Path2D} from '@napi-rs/canvas';
import {INK, mix, dark, light, drawCharacter, bodyMetrics, PLANS} from './r1-rig.mjs';
import {SETS, PROPS} from './r1-world.mjs';
import {fs, rr, el, poly, hashN, glow, olive, sky, windowPane, room, cobbles, easeOutBack, SHADE, WARM} from './r1-world-grace.mjs';
import './r1-world-grace-ears.mjs';   // living room at night, sofa, kitchen, bigCtrG, scribbleG...
import './r1-world-grace-bakery.mjs'; // Bruno's shopfront, tableG, gYard

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const lerp = (a, b, k) => a + (b - a) * k;

// ------------------------------------------------------------------ the cardboard sign
function cardboard(ctx, W, H, {seed = 3, n = '1', t = 0} = {}) { // origin = centre of the sign
  const jag = (i, a) => (hashN(seed * 13 + i * 3.7) - 0.5) * a;
  const pts = [], S = 7;
  for (let i = 0; i <= S; i++) pts.push([-W / 2 + W * i / S + (i && i < S ? jag(i, W * 0.06) : 0), -H / 2 + jag(i + 20, H * 0.07)]);        // top edge: torn
  for (let i = 1; i <= S - 1; i++) pts.push([W / 2 + jag(i + 40, W * 0.04), -H / 2 + H * i / S]);                                           // right
  for (let i = 0; i <= S; i++) pts.push([W / 2 - W * i / S + (i && i < S ? jag(i + 60, W * 0.06) : 0), H / 2 + jag(i + 80, H * 0.09)]);   // bottom: torn
  for (let i = 1; i <= S - 1; i++) pts.push([-W / 2 + jag(i + 100, W * 0.04), H / 2 - H * i / S]);                                          // left
  const p = poly(pts);
  ctx.lineJoin = 'round';
  fs(ctx, p, '#c9a068', Math.max(4, W * 0.026));
  ctx.save(); ctx.clip(p);
  ctx.fillStyle = 'rgba(120,80,40,.22)'; for (let i = 0; i < 7; i++) ctx.fillRect(-W / 2, -H / 2 + H * i / 7 + H * 0.02, W, H * 0.03); // corrugation
  ctx.fillStyle = 'rgba(255,235,190,.28)'; ctx.fill(poly([[-W * 0.5, -H * 0.5], [-W * 0.05, -H * 0.5], [-W * 0.35, H * 0.5], [-W * 0.5, H * 0.5]]));
  ctx.fillStyle = 'rgba(90,55,25,.3)'; for (let i = 0; i < 5; i++) ctx.fill(el(jag(i + 5, W * 0.9), jag(i + 9, H * 0.8), W * 0.05, H * 0.025, jag(i, 3)));
  ctx.restore();
  // the marker: a fat, slightly wobbly black «1» (flag, stem, foot), the way someone writes it with a marker and a heavy hand
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#1c1411'; ctx.fillStyle = '#1c1411'; ctx.lineWidth = H * 0.17;
  ctx.beginPath();
  if (n === '1') { ctx.moveTo(-W * 0.2, -H * 0.2); ctx.quadraticCurveTo(-W * 0.07, -H * 0.27, W * 0.02, -H * 0.34); ctx.lineTo(W * 0.02, H * 0.3); ctx.stroke(); ctx.lineWidth = H * 0.13; ctx.beginPath(); ctx.moveTo(-W * 0.17, H * 0.32); ctx.lineTo(W * 0.21, H * 0.31); ctx.stroke(); }
  ctx.restore();
  ctx.fillStyle = 'rgba(28,20,17,.5)'; for (let i = 0; i < 4; i++) ctx.fill(el(W * 0.02 + jag(i + 3, W * 0.05), H * 0.34 + i * H * 0.02, H * 0.012, H * 0.03)); // a marker drip
}
// where the sign sits for a holder A: R = head radius in world px
const handOf = (A, hand) => A && A._hands && A._hands[hand];
function holderPose(A, hand, R, sideK = 0.55) {
  const hp = handOf(A, hand); if (!A || !A._head || !A._top || !hp || (A._alpha ?? 1) <= 0.02) return null;
  const H = 2.15 * R, W = 2.7 * R, sx = A._head[0] + (hp[0] - A._head[0]) * sideK, bottom = A._top[1] - 0.5 * R;
  return {hp, sx, bottom, W, H, cx: sx, cy: bottom - H / 2};
}
// the sign over a head with the hand and the stick HIDDEN (the arm is up behind the head): geometry computed from the actor's keyed numbers, no state
function hiddenGeom({x, y, s, sit = 0, spec, dx = 0, dy = 0}) {
  const M = bodyMetrics(spec), Pl = PLANS[spec.plan || 'adult'], hx = x + dx, hy = y + dy + (M.headY + sit * Pl.leg * 0.45) * s, R = M.head * s;
  const W = 2.5 * R, H = 1.9 * R, bottom = hy - R * 1.13 - 0.1 * R;
  return {hx, hy, R, W, H, cx: hx, cy: bottom - H / 2, bottom, hp: [hx, hy - 0.2 * R]};
}
function cardHiddenG(ctx, {x, y, s, sit = 0, spec, t = 0, fade0 = null, n = '1', dx = 0, dy = 0} = {}) {
  const g = hiddenGeom({x, y, s, sit, spec, dx, dy}); let al = 1; if (fade0 != null) { al = ease((t - fade0) / 0.5); if (al <= 0) return; }
  ctx.save(); ctx.globalAlpha = al; ctx.lineCap = 'round';
  const sw = Math.max(6, g.R * 0.11);
  ctx.strokeStyle = INK; ctx.lineWidth = sw + 5; ctx.beginPath(); ctx.moveTo(g.hp[0], g.hp[1]); ctx.lineTo(g.cx, g.bottom - g.H * 0.2); ctx.stroke();
  ctx.strokeStyle = '#8a5a36'; ctx.lineWidth = sw; ctx.beginPath(); ctx.moveTo(g.hp[0], g.hp[1]); ctx.lineTo(g.cx, g.bottom - g.H * 0.2); ctx.stroke();
  ctx.translate(g.cx, g.cy - (fade0 != null ? (1 - al) * g.R * 0.25 : 0)); ctx.rotate(Math.sin(t * 1.9 + 1) * 0.02);
  cardboard(ctx, g.W, g.H, {n, t});
  ctx.restore();
}
// args: {A: the one who holds it, G: the one who takes it, t, tPull, hand, gHand, R, pop: start time of a pop-in}
function cardSignG(ctx, {A, G = null, t = 0, tPull = 1e9, hand = 'R', gHand = 'R', R = null, pop = null, n = '1', gLen = 2.7, gDx = 0, H0 = null} = {}) {
  const R0 = R ?? (A && A._headR ? A._headR * A._s : (G && G._headR ? G._headR * G._s : 70));
  const a = A ? holderPose(A, hand, R0) : (H0 ? (() => { const h = hiddenGeom(H0); return {hp: h.hp, cx: h.cx, cy: h.cy, bottom: h.bottom, W: h.W, H: h.H}; })() : null); let q = 0, g = null;
  if (G && t >= tPull) {
    const hg = handOf(G, gHand);
    if (hg) { g = {hp: hg, cx: hg[0] + gDx * R0, bottom: hg[1] - gLen * R0, W: a ? a.W : 2.7 * R0, H: a ? a.H : 2.15 * R0}; g.cy = g.bottom - g.H / 2; q = ease((t - tPull) / 0.28); }
  }
  let P = a, hpt = a && a.hp;
  if (g && (q >= 1 || !a)) { P = g; hpt = g.hp; }
  else if (g && a) { P = {cx: lerp(a.cx, g.cx, q), cy: lerp(a.cy, g.cy, q) - Math.sin(q * Math.PI) * R0 * 0.35, W: a.W, H: a.H}; hpt = [lerp(a.hp[0], g.hp[0], q), lerp(a.hp[1], g.hp[1], q)]; }
  if (!P) return;
  let sc = 1; if (pop != null) { const k = clamp((t - pop) / 0.32); if (k <= 0) return; sc = Math.max(0.01, easeOutBack(k)); }
  const sway = Math.sin(t * 1.9 + 1) * 0.025;
  ctx.save();
  const topY = P.cy + P.H * 0.1, sw = Math.max(6, R0 * 0.11), tx = P.cx + (hpt[0] - P.cx) * 0.2;
  ctx.lineCap = 'round';
  ctx.strokeStyle = INK; ctx.lineWidth = sw + 5; ctx.beginPath(); ctx.moveTo(hpt[0], hpt[1]); ctx.lineTo(tx, topY); ctx.stroke();
  ctx.strokeStyle = '#8a5a36'; ctx.lineWidth = sw; ctx.beginPath(); ctx.moveTo(hpt[0], hpt[1]); ctx.lineTo(tx, topY); ctx.stroke();
  ctx.translate(P.cx, P.cy); ctx.rotate(sway); ctx.scale(sc, sc);
  cardboard(ctx, P.W, P.H, {n, t});
  fs(ctx, rr(-P.W * 0.07, P.H * 0.18, P.W * 0.14, P.H * 0.2, 3), 'rgba(246,236,200,.9)', 3); // tape where the stick is fixed
  ctx.restore();
}

// a soft gold halo (+ rotating rays) above an actor's head: the real number
function haloG(ctx, {A, t = 0, t0 = 0, r = 1, up = 1.9} = {}) {
  if (!A || !A._top || (A._alpha ?? 1) <= 0.02) return; const k = ease((t - t0) / 0.5); if (k <= 0) return;
  const R = A._headR * A._s, x = A._top[0], y = A._top[1] - R * up;
  ctx.save(); ctx.translate(x, y); ctx.globalAlpha = k;
  const g = ctx.createRadialGradient(0, 0, 10, 0, 0, 520 * r); g.addColorStop(0, 'rgba(255,226,130,.75)'); g.addColorStop(0.5, 'rgba(255,214,110,.28)'); g.addColorStop(1, 'rgba(255,214,110,0)');
  ctx.fillStyle = g; ctx.fillRect(-540, -540, 1080, 1080);
  { const q = (t - t0) / 0.7; if (q >= 0 && q < 1) { ctx.strokeStyle = `rgba(255,214,90,${0.9 * (1 - q)})`; ctx.lineWidth = 16 * (1 - q) + 3; ctx.beginPath(); ctx.ellipse(0, 0, 140 + 330 * q, 70 + 165 * q, 0, 0, 7); ctx.stroke(); } }
  ctx.rotate(t * 0.25); ctx.fillStyle = 'rgba(255,240,180,.22)';
  for (let i = 0; i < 12; i++) { ctx.rotate(Math.PI / 6); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-34 * r, -520 * r); ctx.lineTo(34 * r, -520 * r); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}

// ------------------------------------------------------------------ small props
function carG(ctx, {color = '#7c8f4a', w = 560, flip = 1, tilt = 0} = {}) { // side view, origin = bottom centre (on the ground)
  ctx.save(); ctx.scale(flip, 1); ctx.rotate(tilt);
  const h = w * 0.38, body = rr(-w / 2, -h * 0.62, w, h * 0.5, 36), cab = poly([[-w * 0.26, -h * 0.62], [-w * 0.16, -h * 1.02], [w * 0.2, -h * 1.02], [w * 0.34, -h * 0.62]]);
  fs(ctx, cab, mix(color, '#ffffff', 0.12), 7); fs(ctx, body, color, 7);
  fs(ctx, poly([[-w * 0.2, -h * 0.66], [-w * 0.13, -h * 0.96], [w * 0.0, -h * 0.96], [w * 0.0, -h * 0.66]]), '#fbe9c0', 5); fs(ctx, poly([[w * 0.04, -h * 0.66], [w * 0.04, -h * 0.96], [w * 0.17, -h * 0.96], [w * 0.28, -h * 0.66]]), '#fbe9c0', 5);
  fs(ctx, rr(w * 0.44, -h * 0.5, w * 0.06, h * 0.12, 6), '#ffe28a', 4); fs(ctx, rr(-w * 0.5, -h * 0.5, w * 0.05, h * 0.12, 6), '#e2574c', 4);
  for (const x of [-w * 0.27, w * 0.27]) { fs(ctx, el(x, -h * 0.12, h * 0.2, h * 0.2), '#3c3a40', 6); fs(ctx, el(x, -h * 0.12, h * 0.08, h * 0.08), '#cfc3ae', 4); }
  ctx.restore();
}
function parkSignG(ctx, {text = 'RESERVED'} = {}) { // a pole with a plate; origin = foot
  fs(ctx, rr(-8, -420, 16, 420, 4), '#5d5047', 4);
  fs(ctx, rr(-110, -560, 220, 150, 12), '#3f6a58', 7); ctx.strokeStyle = '#fbf1dc'; ctx.lineWidth = 5; ctx.strokeRect(-98, -548, 196, 126);
  ctx.fillStyle = '#fbf1dc'; ctx.font = '50px GraceCaption'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, -484); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
}
function donutG(ctx, {r = 38, glaze = '#f08aa0', sugar = false, bite = 0} = {}) {
  ctx.save(); ctx.lineJoin = 'round';
  fs(ctx, el(0, 0, r, r * 0.8), '#d9a05a', 5);
  fs(ctx, el(0, -r * 0.06, r * 0.9, r * 0.66), sugar ? '#fffdf6' : glaze, 4);
  fs(ctx, el(0, -r * 0.03, r * 0.3, r * 0.2), '#3a2a1e', 3);
  ctx.fillStyle = sugar ? 'rgba(200,190,170,.6)' : '#fff4dc'; for (let i = 0; i < 7; i++) { const a = i * 0.9 + 0.3; ctx.save(); ctx.translate(Math.cos(a) * r * 0.6, Math.sin(a) * r * 0.42 - r * 0.05); ctx.rotate(a * 2); ctx.fillRect(-r * 0.09, -r * 0.03, r * 0.18, r * 0.06); ctx.restore(); }
  ctx.restore();
}
function donutBoxG(ctx, {n = 3, w = 320} = {}) { // an open pink bakery box seen from the front, origin = bottom centre
  const h = w * 0.34;
  fs(ctx, rr(-w / 2, -h, w, h, 10), '#f6d3c6', 6);
  fs(ctx, poly([[-w / 2 + 8, -h], [w / 2 - 8, -h], [w / 2 - 40, -h * 1.22], [-w / 2 + 40, -h * 1.22]]), '#fff0e6', 5);
  for (let i = 0; i < n; i++) { ctx.save(); ctx.translate((i - (n - 1) / 2) * (w / (n + 0.4)), -h * 0.62); donutG(ctx, {r: w * 0.11, sugar: i % 2 === 0}); ctx.restore(); }
  fs(ctx, rr(-w * 0.2, -h * 0.34, w * 0.4, h * 0.22, 6), '#fbf1dc', 4); ctx.fillStyle = '#c4643a'; ctx.font = `${h * 0.17}px GraceCaption`; ctx.textAlign = 'center'; ctx.fillText('DONUTS', 0, -h * 0.17); ctx.textAlign = 'left';
}
// powdered sugar on a mustache: white blobs + a dusting on the cheeks, positioned from the actor's measured head
function sugarG(ctx, {A, t = 0, k = 1} = {}) {
  if (!A || !A._head || (A._alpha ?? 1) <= 0.02) return;
  const R = A._headR * A._s, [hx, hy] = A._head, fl = A.flip ? -1 : 1;
  ctx.save(); ctx.translate(hx, hy); ctx.rotate((((A._st?.tilt) || 0) * fl) * Math.PI / 180); ctx.globalAlpha = k * (A._alpha ?? 1);
  ctx.fillStyle = '#fffdf6'; ctx.strokeStyle = 'rgba(80,60,40,.55)'; ctx.lineWidth = Math.max(2, R * 0.03);
  for (const [x, y, rx, ry] of [[-0.34, 0.27, 0.2, 0.11], [0.34, 0.27, 0.2, 0.11], [0, 0.22, 0.12, 0.09]]) { ctx.beginPath(); ctx.ellipse(x * R, y * R, rx * R, ry * R, x * 0.5, 0, 7); ctx.fill(); ctx.stroke(); }
  for (let i = 0; i < 9; i++) { const a = hashN(i + 2) * 6.28, d = 0.35 + hashN(i + 8) * 0.45; ctx.beginPath(); ctx.arc(Math.cos(a) * R * d, 0.15 * R + Math.sin(a) * R * d * 0.55, R * 0.035, 0, 7); ctx.fill(); }
  ctx.restore();
}
// a hundred confessions: paper sheets rain down onto a pile (origin = the floor under the pile). args {t, t0, t1, n}
function papersG(ctx, {t = 0, t0 = 0, t1 = 2, n = 40, spread = 360, top = -900, fall = 0.9} = {}) {
  const sheet = (x, y, rot, w = 80) => { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); fs(ctx, rr(-w / 2, -w * 0.64, w, w * 1.28, 3), '#fffdf4', 3); ctx.strokeStyle = '#b9b3a2'; ctx.lineWidth = 3; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-w * 0.34, -w * 0.4 + i * w * 0.24); ctx.lineTo(w * (i % 2 ? 0.2 : 0.34), -w * 0.4 + i * w * 0.24); ctx.stroke(); } ctx.restore(); };
  const land = i => [(hashN(i * 1.7) - 0.5) * spread * 0.9, -6 - hashN(i * 2.9) * 40 - Math.floor(i / 6) * 8, (hashN(i * 4.1) - 0.5) * 1.2];
  for (let i = 0; i < n; i++) {
    const ts = t0 + (t1 - t0) * (i / n), q = (t - ts) / fall; if (q < 0) continue;
    const [lx, ly, lr] = land(i);
    if (q >= 1) { sheet(lx, ly, lr); continue; }
    const sx = lx + Math.sin(i * 3.1) * 140, y = lerp(top, ly, q * q * (0.6 + 0.4 * q)), x = lerp(sx, lx, q) + Math.sin(q * 9 + i) * 36;
    sheet(x, y, lr + Math.sin(q * 11 + i) * 0.8);
  }
}
// an actor's reflection in glass: a mirrored, translucent copy of the actor (pose and face from the last drawn frame) + the sign over it.
function reflectG(ctx, {A, t = 0, cx = 540, cy = 1500, s = 3, alpha = 0.5, clip = null, sign = true, signN = '1', fl = -1, pose = null, stick = false} = {}) {
  if (!A || !A._spec || !A._st || (A._alpha ?? 1) <= 0.02) return;
  ctx.save();
  if (clip) ctx.clip(rr(...clip));
  ctx.globalAlpha = alpha * (A._alpha ?? 1); ctx.translate(cx, cy); ctx.scale(fl * s, s);
  const r = drawCharacter(ctx, A._spec, {...A._st, bob: 0, armsFront: false, ...(pose ? {pose} : {})});
  ctx.restore();
  if (!sign) return;
  const hp = r.arms[1] && r.arms[1].W, hd = r.headTop;
  ctx.save(); if (clip) ctx.clip(rr(...clip)); ctx.globalAlpha = alpha * 1.1 * (A._alpha ?? 1);
  const R0 = 15 * s, W = 2.7 * R0, H = 2.15 * R0, hx = cx + fl * (hp ? hp[0] : 20) * s, hy = cy + (hp ? hp[1] : -80) * s, sx = stick ? cx + (hx - cx) * 0.55 : cx, by = cy + hd * s - (stick ? 0.5 : 0.12) * R0;
  ctx.lineCap = 'round'; if (stick) ctx.strokeStyle = INK; ctx.lineWidth = 8; if (stick) { ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(sx, by - H * 0.4); ctx.stroke(); ctx.strokeStyle = '#8a5a36'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(sx, by - H * 0.4); ctx.stroke(); }
  ctx.translate(sx, by - H / 2); cardboard(ctx, W, H, {n: signN}); ctx.restore();
}
// a shout: a spiky white burst full of scribbles and a lightning bolt (the words he cannot repeat). origin = centre. k 0..1 pop
function shoutG(ctx, {k = 1, t = 0, r = 300} = {}) {
  if (k <= 0) return; const sc = Math.max(0.01, easeOutBack(k)) ; ctx.save(); ctx.scale(sc, sc * 0.82);
  const p = new Path2D(), N = 18; for (let i = 0; i < N * 2; i++) { const a = i * Math.PI / N, r0 = i % 2 ? r * 0.72 : r * (1 + 0.08 * Math.sin(i * 2.7)); i ? p.lineTo(Math.cos(a) * r0, Math.sin(a) * r0) : p.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); } p.closePath();
  ctx.lineJoin = 'round'; ctx.lineWidth = 14; ctx.strokeStyle = INK; ctx.stroke(p); ctx.fillStyle = '#fffaf0'; ctx.fill(p);
  ctx.strokeStyle = '#2a211e'; ctx.lineWidth = 11; ctx.lineCap = 'round';
  for (let row = 0; row < 3; row++) { const y = -r * 0.34 + row * r * 0.3, len = r * [1.0, 1.1, 0.8][row]; ctx.beginPath(); ctx.moveTo(-len / 2, y); for (let i = 1; i <= 12; i++) ctx.lineTo(-len / 2 + len * i / 12, y + (i % 2 ? -1 : 1) * (18 + 8 * Math.sin(t * 17 + i * 1.3 + row))); ctx.stroke(); }
  ctx.restore();
}
function pewFrontG(ctx, {w = 1180} = {}) { // a kneeler / pew front, drawn IN FRONT of a kneeling actor (origin = top-centre of the board)
  fs(ctx, rr(-w / 2, 40, w, 600, 10), '#7a4b2a', 7); fs(ctx, rr(-w / 2 - 20, 0, w + 40, 56, 14), '#a8703e', 7);
  ctx.strokeStyle = 'rgba(40,20,10,.3)'; ctx.lineWidth = 5; for (let x = -w / 2 + 120; x < w / 2; x += 200) { ctx.beginPath(); ctx.moveTo(x, 90); ctx.lineTo(x, 620); ctx.stroke(); }
}
function armchairG(ctx, {w = 470, color = '#8a5a8c'} = {}) { // back + arms, origin = bottom centre of the seat
  const d = dark(color, 0.2);
  fs(ctx, rr(-w / 2 + 10, -470, w - 20, 400, 80), d, 7);
  fs(ctx, rr(-w / 2 - 20, -260, 100, 260, 40), mix(color, '#000000', 0.06), 7); fs(ctx, rr(w / 2 - 80, -260, 100, 260, 40), mix(color, '#000000', 0.06), 7);
  fs(ctx, rr(-w / 2 + 50, -110, w - 100, 100, 28), color, 7);
  for (const x of [-w / 2 + 50, w / 2 - 50]) fs(ctx, rr(x - 14, 0, 28, 26, 6), '#3c2c24', 5);
  fs(ctx, rr(-60, -330, 120, 100, 30), '#f4b942', 6);
}
// the verse card with its words revealed one by one at the voice's times. args {lines: [[{w, s}...]], y, t}
function verseG(ctx, {lines = [], y = 570, t = 0, size = 66, lh = 1.32} = {}) {
  ctx.save(); ctx.font = `${size}px GraceVerse`; ctx.textBaseline = 'middle';
  const sp = ctx.measureText(' ').width, wid = lines.map(l => l.reduce((a, w) => a + ctx.measureText(w.w).width, 0) + sp * (l.length - 1));
  const tw = Math.max(...wid) + 110, th = lines.length * size * lh + 90, c = new Path2D(); c.roundRect(540 - tw / 2, y - th / 2, tw, th, 28);
  ctx.fillStyle = 'rgba(60,30,10,.25)'; ctx.save(); ctx.translate(0, 10); ctx.fill(c); ctx.restore(); ctx.fillStyle = 'rgba(255,246,226,.96)'; ctx.fill(c); ctx.lineWidth = 6; ctx.strokeStyle = '#2a211e'; ctx.stroke(c);
  lines.forEach((l, i) => { let x = 540 - wid[i] / 2; const yy = y + (i - (lines.length - 1) / 2) * size * lh;
    for (const w of l) { const k = clamp((t - w.s + 0.04) / 0.18); ctx.globalAlpha = k; ctx.fillStyle = '#3a2412'; ctx.fillText(w.w, x, yy + (1 - k) * 8); x += ctx.measureText(w.w).width + sp; } });
  ctx.restore();
}
Object.assign(PROPS, {verseG, cardHiddenG, cardSignG, haloG, carG, parkSignG, donutG, donutBoxG, sugarG, papersG, reflectG, shoutG, pewFrontG, armchairG});

// ------------------------------------------------------------------ places
const ROADC = '#c3ad8e';
Object.assign(SETS, {
  // the inside of a confessional: two wooden cabins, a lattice window in the partition, a candle on each side, a cross. A lit interior with dark
  // wood, READABLE: every surface keeps its colour. The priest is a silhouette behind the lattice.
  gsConfess({light: lt = 1, dim = 0.42} = {}) {
    return ctx => {
      ctx.fillStyle = '#55341f'; ctx.fillRect(0, 0, 1080, 1920);
      for (let x = 0; x < 1080; x += 90) { ctx.fillStyle = x % 180 ? '#6a4228' : '#5a3822'; ctx.fillRect(x, 0, 90, 1500); }
      ctx.strokeStyle = 'rgba(20,8,0,.4)'; ctx.lineWidth = 4; for (let x = 90; x < 1080; x += 90) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1500); ctx.stroke(); }
      ctx.fillStyle = `rgba(30,12,36,${dim})`; ctx.fillRect(0, 0, 1080, 1500);
      fs(ctx, rr(500, 160, 80, 1380, 10), '#7a4b2a', 7);
      fs(ctx, rr(430, 900, 220, 330, 20), '#3a2212', 7);
      fs(ctx, rr(448, 918, 184, 294, 12), '#f0b765', 0);
      glow(ctx, 540, 1060, 330, 0.5 * lt, '255,196,110');
      ctx.fillStyle = 'rgba(40,20,10,.86)'; ctx.fill(el(590, 1100, 56, 68)); ctx.fill(poly([[520, 1212], [540, 1160], [640, 1160], [650, 1212]]));
      ctx.strokeStyle = '#2a1608'; ctx.lineWidth = 7; for (let i = 0; i < 5; i++) { const x = 460 + i * 40; ctx.beginPath(); ctx.moveTo(x, 918); ctx.lineTo(x, 1212); ctx.stroke(); } for (let i = 0; i < 6; i++) { const y = 940 + i * 50; ctx.beginPath(); ctx.moveTo(448, y); ctx.lineTo(632, y); ctx.stroke(); }
      fs(ctx, rr(236, 380, 26, 150, 5), '#d9a441', 5); fs(ctx, rr(190, 430, 118, 26, 5), '#d9a441', 5); glow(ctx, 250, 450, 280, 0.35 * lt, '255,206,120');
      for (const [x, y] of [[130, 1010], [880, 1010]]) { fs(ctx, rr(x - 30, y + 20, 60, 14, 4), '#3c2c24', 4); fs(ctx, rr(x - 9, y - 50, 18, 70, 4), '#fbf1dc', 4); fs(ctx, el(x, y - 66, 9, 17), '#ffd25a', 3); glow(ctx, x, y - 60, 330, 0.55 * lt, '255,196,100'); }
      fs(ctx, rr(700, 300, 300, 1190, 12), '#7a2f3a', 7); ctx.fillStyle = 'rgba(0,0,0,.18)'; for (let x = 730; x < 990; x += 52) ctx.fillRect(x, 320, 18, 1150);
      ctx.fillStyle = '#8a6a50'; ctx.fillRect(0, 1500, 1080, 420); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 1500); ctx.lineTo(1080, 1500); ctx.stroke();
      ctx.strokeStyle = 'rgba(40,20,10,.3)'; ctx.lineWidth = 4; for (let y = 1560; y < 1920; y += 70) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1080, y); ctx.stroke(); }
    };
  },
  // a street with painted parking spaces: the village lane with a road slab and cream lines (a car straddles the middle line)
  gsLot({time = 'noon', lines = true} = {}) {
    return ctx => {
      SETS.gLane({time})(ctx);
      ctx.fillStyle = ROADC; ctx.fillRect(0, 1296, 1080, 624); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 1296); ctx.lineTo(1080, 1296); ctx.stroke();
      ctx.fillStyle = 'rgba(90,60,30,.10)'; for (let i = 0; i < 40; i++) ctx.fill(el(hashN(i) * 1080, 1330 + hashN(i + 3) * 570, 40, 7));
      fs(ctx, rr(-10, 1296, 1100, 46, 0), '#d9cdb6', 5);
      if (lines) { ctx.strokeStyle = '#fbf1dc'; ctx.lineWidth = 12; ctx.lineCap = 'round'; for (const x of [-60, 280, 620, 960]) { ctx.beginPath(); ctx.moveTo(x + 40, 1370); ctx.lineTo(x - 60, 1900); ctx.stroke(); } }
    };
  },
  // a shop front: cream wall, a big golden-framed window with hats on a shelf, awning, cobbles
  gsShop({time = 'noon'} = {}) {
    return ctx => {
      sky(ctx, time);
      ctx.fillStyle = '#efd7ad'; ctx.fillRect(0, 380, 1080, 920);
      ctx.fillStyle = dark('#efd7ad', 0.05); for (let i = 0; i < 18; i++) ctx.fill(el(hashN(i) * 1080, 420 + hashN(i + 3) * 840, 36, 14));
      fs(ctx, poly([[-20, 440], [1100, 440], [1100, 380], [-20, 380]]), WARM.roof, 6);
      const st = 10, sw = 1160 / st; for (let i = 0; i < st; i++) fs(ctx, poly([[-40 + i * sw, 470], [-40 + (i + 1) * sw, 470], [-60 + (i + 1) * sw * 1.02, 590], [-60 + i * sw * 1.02, 590]]), i % 2 ? '#fbf1dc' : '#c4643a', 4);
      fs(ctx, rr(110, 640, 860, 560, 14), '#d9a441', 9); fs(ctx, rr(136, 666, 808, 508, 8), '#ffe3a8', 0);
      ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.fill(poly([[160, 1170], [420, 668], [520, 668], [260, 1170]])); ctx.fill(poly([[600, 1170], [790, 668], [830, 668], [650, 1170]]));
      fs(ctx, rr(150, 960, 780, 22, 4), WARM.woodD, 4); fs(ctx, rr(150, 1130, 780, 22, 4), WARM.woodD, 4);
      [['#c4643a', 220], ['#7c8f4a', 420], ['#f4b942', 640], ['#9a7ab0', 830]].forEach(([c, x]) => { fs(ctx, el(x, 940, 70, 22), c, 5); fs(ctx, poly([[x - 40, 934], [x - 26, 880], [x + 26, 880], [x + 40, 934]]), c, 5); });
      cobbles(ctx, 1300, '#dcc29a');
      if (SHADE[time]) { ctx.fillStyle = SHADE[time]; ctx.fillRect(0, 0, 1080, 1920); }
    };
  },
  // the back yard at night: gYard under a plum sky and a big moon, a warm kitchen window glowing on the left. ONE dim for the whole place and hour.
  gsYardNight({dim = 0.34} = {}) {
    return ctx => {
      SETS.gYard({time: 'night'})(ctx);
      ctx.fillStyle = `rgba(48,24,76,${dim})`; ctx.fillRect(0, 0, 1080, 1920);
      fs(ctx, rr(60, 600, 250, 330, 14), '#fbf1dc', 6); fs(ctx, rr(80, 620, 210, 290, 8), '#ffd77a', 4); ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(185, 620); ctx.lineTo(185, 910); ctx.moveTo(80, 765); ctx.lineTo(290, 765); ctx.stroke();
      glow(ctx, 185, 770, 520, 0.4, '255,206,120');
      ctx.fillStyle = '#fff1c4'; ctx.fill(el(820, 260, 78, 78)); ctx.fillStyle = 'rgba(255,241,196,.18)'; ctx.fill(el(820, 260, 150, 150));
    };
  },
});
