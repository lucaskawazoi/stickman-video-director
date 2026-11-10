// R1 · rule-world 2D: full-body flat-vector characters as cutout rigs (head, eyes, lids, brows, mouth, arms, legs).
// Units: adult ≈ 100u tall, origin at the feet, y grows downward (negative = up). The renderer scales u→px.
import {Path2D as P2D} from '@napi-rs/canvas';
export const INK = '#2a211e';
const LW = 0.8; // outline in units

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export function mix(hexA, hexB, k) {
  const a = parseInt(hexA.slice(1), 16), b = parseInt(hexB.slice(1), 16);
  const ch = (v, s) => (v >> s) & 255;
  const m = s => Math.round(ch(a, s) + (ch(b, s) - ch(a, s)) * k);
  return '#' + ((1 << 24) + (m(16) << 16) + (m(8) << 8) + m(0)).toString(16).slice(1);
}
export const dark = (hex, k = 0.18) => mix(hex, '#000000', k);
export const light = (hex, k = 0.25) => mix(hex, '#ffffff', k);

// ---------- body plans ----------
const PLANS = {
  adult: {leg: 40, torso: 28, neck: 3, head: 15, sw: 23, hw: 20, upper: 14.5, fore: 13.5, armW: 4.2, legW: 8.6},
  elder: {leg: 42, torso: 28, neck: 3, head: 15, sw: 22, hw: 19, upper: 15, fore: 14, armW: 4, legW: 8},
  kid: {leg: 25, torso: 20, neck: 2, head: 14.5, sw: 18, hw: 17, upper: 10.5, fore: 10, armW: 3.6, legW: 7},
};

// ---------- poses: [shoulder, elbow] per arm in degrees; 0 = hanging, + = outward/up, − = across the body ----------
export const POSES = {
  rest: {L: [10, 4], R: [10, 4]},
  wave: {L: [10, 4], R: [150, -30]},
  waveL: {L: [150, -30], R: [10, 4]},
  cheer: {L: [155, 10], R: [155, 10]},
  up: {L: [155, 10], R: [155, 10]},      // cheer without the shake (calm beats)
  rock: {L: [-25, -70], R: [-25, -70]},  // carry + rocking (renderer adds the sway)
  hips: {L: [40, -115], R: [40, -115]},
  shrug: {L: [55, 70], R: [55, 70]},
  point: {L: [10, 4], R: [95, 0]},
  pointL: {L: [95, 0], R: [10, 4]},
  cheeks: {L: [30, -150], R: [30, -150]},
  face: {L: [20, -160], R: [20, -160]},
  hold: {L: [25, -95], R: [25, -95]},
  knock: {L: [10, 4], R: [70, 60]},
  reach: {L: [10, 4], R: [70, 15]},
  hugR: {L: [55, -40], R: [80, 20]},      // hugging someone on the screen-right
  hugL: {L: [80, 20], R: [55, -40]},      // hugging someone on the screen-left
  hugBoth: {L: [-60, -60], R: [-60, -60]},
  water: {L: [10, 4], R: [60, 30]},
  heart: {L: [-20, -130], R: [-20, -130]},
  fists: {L: [30, -120], R: [30, -120]},
  sad: {L: [4, 2], R: [4, 2]},
  carry: {L: [-25, -70], R: [-25, -70]},
};

// ---------- expressions ----------
export const EXPR = {
  neutral: {brow: 0, browY: 0, mouth: 'smile', curve: 0.25, lid: 0.12},
  happy: {brow: -6, browY: -1, mouth: 'grin', curve: 0.8, lid: 0},
  joy: {brow: -8, browY: -2, mouth: 'open', curve: 1, lid: 0, closed: 'happy'},
  sad: {brow: 22, browY: 0, mouth: 'sad', curve: 0.6, lid: 0.35},
  cry: {brow: 26, browY: 0, mouth: 'wail', curve: 0.8, lid: 0.2, tears: true},
  worried: {brow: 18, browY: -1, mouth: 'flat', curve: 0.1, lid: 0.15},
  shock: {brow: -12, browY: -3, mouth: 'o', curve: 1, lid: 0, pupil: 0.7},
  angry: {brow: -20, browY: 1, mouth: 'frown', curve: 0.5, lid: 0.25},
  tired: {brow: 10, browY: 1, mouth: 'flat', curve: 0, lid: 0.5},
  love: {brow: -4, browY: -1, mouth: 'smile', curve: 1, lid: 0, closed: 'happy'},
  sleep: {brow: 0, browY: 1, mouth: 'smile', curve: 0.1, lid: 0, closed: 'sleep'},
  grey: {brow: 6, browY: 1, mouth: 'flat', curve: 0, lid: 0.45},
  firm: {brow: 8, browY: 1, mouth: 'flat', curve: 0, lid: 0.3},
};

// ---------- drawing primitives ----------
function fillStroke(ctx, path, fill, w = LW, ink = INK) {
  if (fill) { ctx.fillStyle = fill; ctx.fill(path); }
  if (w) { ctx.lineWidth = w; ctx.strokeStyle = ink; ctx.lineJoin = 'round'; ctx.stroke(path); }
}
function circle(x, y, r) { const p = new P2D(); p.arc(x, y, r, 0, Math.PI * 2); return p; }
function ellipse(x, y, rx, ry, rot = 0) { const p = new P2D(); p.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); return p; }
function rrect(x, y, w, h, r) { const p = new P2D(); p.roundRect(x, y, w, h, r); return p; }
function segment(ctx, a, b, width, color) {
  ctx.lineCap = 'round';
  ctx.strokeStyle = INK; ctx.lineWidth = width + LW * 2; ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke();
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke();
}
function polyline(ctx, pts, width, color) {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const [w, c] of [[width + LW * 2, INK], [width, color]]) {
    ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(...pts[0]); for (const p of pts.slice(1)) ctx.lineTo(...p); ctx.stroke();
  }
}
const rad = d => d * Math.PI / 180;

// ---------- the character ----------
// spec: {plan, skin, hair:{style,color}, outfit:{type,color,color2}, pants, shoes, glasses, mustache, blush, browColor}
// st: {pose:{L,R}, expr, talk(0..1), blink(0..1), gaze:[dx,dy], walk(phase or null), tilt(deg), bob(u), arms over: 'front'}
export function drawCharacter(ctx, spec, st = {}) {
  const P = PLANS[spec.plan || 'adult'];
  const hipY = -P.leg, shY = -(P.leg + P.torso) + 2, neckY = -(P.leg + P.torso), headY = neckY - P.neck - P.head * 0.92;
  const pose = st.pose || POSES.rest;
  const bob = st.bob || 0;
  // shadow
  ctx.fillStyle = 'rgba(30,20,20,.16)'; ctx.fill(ellipse(0, 0.5, P.hw * 0.9, 2.6));
  ctx.save(); ctx.translate(0, bob);
  // legs
  const walk = st.walk;
  const legA = walk == null ? [0, 0] : [Math.sin(walk) * 16, -Math.sin(walk) * 16];
  const legX = P.hw * 0.26;
  [-1, 1].forEach((sg, i) => {
    ctx.save(); ctx.translate(sg * legX, hipY); ctx.rotate(rad(legA[i] + (st.legSpread || 0) * sg));
    const L = P.leg - 3;
    if (spec.outfit?.type === 'dress' || spec.legsBare) fillStroke(ctx, rrect(-P.legW * 0.28, 0, P.legW * 0.56, L, 2), spec.skin);
    else fillStroke(ctx, rrect(-P.legW / 2, -2, P.legW, L + 1, 2.5), spec.pants || '#3b4a6b');
    // shoe
    ctx.save(); ctx.translate(0, L + 0.5);
    fillStroke(ctx, (() => { const p = new P2D(); p.ellipse(sg * 1.6, 0.6, P.legW * 0.62, 2.6, 0, 0, Math.PI * 2); return p; })(), spec.shoes || '#2c2c34');
    ctx.restore(); ctx.restore();
  });
  // torso
  const o = spec.outfit || {type: 'shirt', color: '#3d5a99'};
  const torsoTop = shY - 2, torsoH = hipY - torsoTop + 2;
  const torso = new P2D();
  torso.moveTo(-P.sw / 2, torsoTop + 5); torso.quadraticCurveTo(-P.sw / 2, torsoTop, -P.sw / 2 + 5, torsoTop);
  torso.lineTo(P.sw / 2 - 5, torsoTop); torso.quadraticCurveTo(P.sw / 2, torsoTop, P.sw / 2, torsoTop + 5);
  torso.lineTo(P.hw / 2, torsoTop + torsoH); torso.lineTo(-P.hw / 2, torsoTop + torsoH); torso.closePath();
  if (o.type === 'dress') {
    fillStroke(ctx, torso, o.color);
    const skirt = new P2D(); const w0 = P.hw * 0.5, y0 = hipY - 6, w1 = P.hw * 0.86, y1 = hipY + P.leg * 0.42;
    skirt.moveTo(-w0, y0); skirt.lineTo(w0, y0); skirt.quadraticCurveTo(w1 * 0.9, (y0 + y1) / 2, w1, y1);
    skirt.quadraticCurveTo(0, y1 + 2.5, -w1, y1); skirt.quadraticCurveTo(-w1 * 0.9, (y0 + y1) / 2, -w0, y0); skirt.closePath();
    fillStroke(ctx, skirt, o.color);
    ctx.strokeStyle = dark(o.color, 0.15); ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(-w0 + 1, y0 + 1); ctx.lineTo(w0 - 1, y0 + 1); ctx.stroke();
    // white collar
    const col = new P2D(); col.moveTo(-5.5, torsoTop + 0.5); col.quadraticCurveTo(-3, torsoTop + 5, 0, torsoTop + 2.5); col.quadraticCurveTo(3, torsoTop + 5, 5.5, torsoTop + 0.5); col.closePath();
    fillStroke(ctx, col, o.color2 || '#ffffff', 0.6);
  } else if (o.type === 'cardigan') {
    fillStroke(ctx, torso, o.color2 || '#f1ece2');
    for (const sg of [-1, 1]) {
      const pnl = new P2D(); pnl.moveTo(sg * 1.2, torsoTop); pnl.lineTo(sg * (P.sw / 2 - 5), torsoTop); pnl.quadraticCurveTo(sg * P.sw / 2, torsoTop, sg * P.sw / 2, torsoTop + 5);
      pnl.lineTo(sg * P.hw / 2, torsoTop + torsoH); pnl.lineTo(sg * 2.2, torsoTop + torsoH); pnl.closePath();
      fillStroke(ctx, pnl, o.color);
    }
    for (let i = 0; i < 3; i++) { ctx.fillStyle = dark(o.color, 0.35); ctx.fill(ellipse(2.4, torsoTop + 7 + i * 6, 0.9, 0.9)); }
  } else {
    fillStroke(ctx, torso, o.color);
    if (o.type === 'stripes') {
      ctx.save(); ctx.clip(torso); ctx.fillStyle = o.color2 || '#ffffff';
      for (let y = torsoTop + 3; y < hipY; y += 5) ctx.fillRect(-P.sw, y, P.sw * 2, 2.2);
      ctx.restore(); ctx.lineWidth = LW; ctx.strokeStyle = INK; ctx.stroke(torso);
    }
    if (o.type === 'blouse') { ctx.strokeStyle = dark(o.color, 0.3); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-P.hw / 2 + 0.6, hipY - 3); ctx.lineTo(P.hw / 2 - 0.6, hipY - 3); ctx.stroke(); }
    if (o.type === 'pajama') { ctx.fillStyle = light(o.color, 0.45); for (const [x, y] of [[-5, 8], [4, 13], [-3, 19], [6, 4]]) ctx.fill(ellipse(x, torsoTop + y, 1.1, 1.1)); }
    // round neck
    const nk = new P2D(); nk.ellipse(0, torsoTop + 0.4, 4.2, 2.2, 0, 0, Math.PI); fillStroke(ctx, nk, dark(o.color, 0.12), 0.6);
  }
  // neck
  fillStroke(ctx, rrect(-2.4, neckY - 1.5, 4.8, P.neck + 3.5, 1.5), spec.skin, 0.6);
  // arms (behind-head order is fine for front view)
  const armColor = spec.armSkin === false ? o.color : spec.skin;
  const sleeve = o.type === 'dress' ? o.color : o.color;
  const arms = [];
  [['L', -1], ['R', 1]].forEach(([k, sg]) => {
    const [a1, a2] = pose[k];
    const S = [sg * (P.sw / 2 - 1.8), shY + 1.2];
    const E = [S[0] + sg * Math.sin(rad(a1)) * P.upper, S[1] + Math.cos(rad(a1)) * P.upper];
    const W = [E[0] + sg * Math.sin(rad(a1 + a2)) * P.fore, E[1] + Math.cos(rad(a1 + a2)) * P.fore];
    arms.push({S, E, W, sg});
  });
  const drawArm = ({S, E, W}) => {
    polyline(ctx, [S, E, W], P.armW, armColor);
    const k = spec.longSleeves ? 1 : 0.6, M = [S[0] + (E[0] - S[0]) * k, S[1] + (E[1] - S[1]) * k];
    segment(ctx, S, M, P.armW + 2.2, sleeve);
    if (spec.longSleeves) segment(ctx, E, [E[0] + (W[0] - E[0]) * 0.75, E[1] + (W[1] - E[1]) * 0.75], P.armW + 1.6, sleeve);
    fillStroke(ctx, circle(W[0], W[1], P.armW * 0.82), spec.skin);
  };
  if (!st.armsFront) arms.forEach(drawArm);
  // head
  ctx.save(); ctx.translate(0, headY); ctx.rotate(rad(st.tilt || 0));
  drawHead(ctx, spec, P.head, st);
  ctx.restore();
  ctx.restore();
  return {arms, drawArm, headTop: headY - P.head * 1.15 + bob, headY: headY + bob, height: -headY + P.head};
}

export function bodyMetrics(spec) {
  const P = PLANS[spec.plan || 'adult'];
  const neckY = -(P.leg + P.torso), headY = neckY - P.neck - P.head * 0.92;
  return {headY, top: headY - P.head * 1.2, head: P.head};
}

function drawHead(ctx, spec, R, st) {
  const hair = spec.hair || {style: 'short', color: '#3b2a20'};
  const ex = EXPR[st.expr || 'neutral'] || EXPR.neutral;
  // back hair
  if (hair.style === 'puffs') for (const sg of [-1, 1]) {
    fillStroke(ctx, circle(sg * R * 0.92, -R * 0.82, R * 0.58), hair.color);
    ctx.fillStyle = light(hair.color, 0.12); ctx.fill(circle(sg * R * 0.85, -R * 0.95, R * 0.2));
  }
  if (hair.style === 'bun') fillStroke(ctx, circle(0, -R * 1.12, R * 0.42), hair.color);
  if (hair.style === 'long') { const h = new P2D(); h.moveTo(-R * 0.9, -R * 0.2); h.bezierCurveTo(-R * 1.15, R * 0.6, -R * 1.1, R * 1.2, -R * 0.95, R * 1.45); h.lineTo(-R * 0.45, R * 1.4); h.quadraticCurveTo(-R * 0.6, R * 0.6, -R * 0.5, R * 0.2); h.lineTo(R * 0.5, R * 0.2); h.quadraticCurveTo(R * 0.6, R * 0.6, R * 0.45, R * 1.4); h.lineTo(R * 0.95, R * 1.45); h.bezierCurveTo(R * 1.1, R * 1.2, R * 1.15, R * 0.6, R * 0.9, -R * 0.2); h.closePath(); fillStroke(ctx, h, hair.color); }
  if (hair.style === 'bald') for (const sg of [-1, 1]) {
    const t = new P2D(); const x = sg * R * 0.9;
    t.arc(x, -R * 0.05, R * 0.3, 0, Math.PI * 2); t.arc(x + sg * R * 0.1, R * 0.28, R * 0.26, 0, Math.PI * 2);
    fillStroke(ctx, t, hair.color, 0.7);
  }
  // ears
  for (const sg of [-1, 1]) fillStroke(ctx, ellipse(sg * R * 0.93, R * 0.08, R * 0.2, R * 0.26), spec.skin, 0.7);
  // head
  const head = new P2D(); head.ellipse(0, 0, R * 0.93, R, 0, 0, Math.PI * 2);
  fillStroke(ctx, head, spec.skin);
  // jaw shade
  ctx.save(); ctx.clip(head); ctx.fillStyle = 'rgba(80,30,20,.07)'; ctx.fill(ellipse(R * 0.35, R * 0.55, R * 0.9, R * 0.6)); ctx.restore();
  if (hair.style === 'bald') { ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fill(ellipse(-R * 0.35, -R * 0.7, R * 0.25, R * 0.12, -0.4)); }
  // front hair
  const cap = new P2D();
  if (['puffs', 'bun', 'short', 'long', 'young', 'curly'].includes(hair.style)) {
    const low = hair.style === 'short' || hair.style === 'young' ? -0.42 : -0.38;
    cap.moveTo(-R * 0.95, R * 0.05);
    cap.bezierCurveTo(-R * 1.05, -R * 1.25, R * 1.05, -R * 1.25, R * 0.95, R * 0.05);
    if (hair.style === 'young' || hair.style === 'short') {
      cap.quadraticCurveTo(R * 0.85, low * R, R * 0.35, low * R - R * 0.05); cap.quadraticCurveTo(-R * 0.1, low * R + R * 0.12, -R * 0.55, low * R);
      cap.quadraticCurveTo(-R * 0.85, low * R + R * 0.1, -R * 0.95, R * 0.05);
    } else if (hair.style === 'curly') {
      for (let i = 0; i <= 6; i++) { const x = R * 0.95 - i * R * 0.32; cap.quadraticCurveTo(x - R * 0.16, low * R + R * 0.22, x - R * 0.32, low * R); }
    } else {
      cap.quadraticCurveTo(R * 0.7, low * R, R * 0.1, low * R - R * 0.08); cap.quadraticCurveTo(-R * 0.5, low * R + R * 0.05, -R * 0.95, R * 0.05);
    }
    cap.closePath();
    fillStroke(ctx, cap, hair.color);
    ctx.save(); ctx.clip(cap); ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fill(ellipse(-R * 0.3, -R * 0.85, R * 0.4, R * 0.15, -0.3)); ctx.restore();
    if (hair.style === 'puffs') for (const sg of [-1, 1]) fillStroke(ctx, rrect(sg * R * 0.72 - R * 0.12, -R * 0.78, R * 0.24, R * 0.3, 1), hair.band || '#f5c518', 0.6);
  }
  // face
  const eyeX = R * 0.37, eyeY = -R * 0.04, erx = R * 0.25, ery = R * 0.31;
  const blink = clamp(st.blink || 0);
  const gaze = st.gaze || [0, 0];
  for (const sg of [-1, 1]) {
    const x = sg * eyeX;
    if (ex.closed || blink > 0.85) {
      ctx.strokeStyle = INK; ctx.lineWidth = R * 0.075; ctx.lineCap = 'round'; ctx.beginPath();
      if (ex.closed === 'happy') { ctx.moveTo(x - erx, eyeY + ery * 0.2); ctx.quadraticCurveTo(x, eyeY - ery * 0.9, x + erx, eyeY + ery * 0.2); }
      else { ctx.moveTo(x - erx, eyeY); ctx.quadraticCurveTo(x, eyeY + ery * 0.6, x + erx, eyeY); }
      ctx.stroke(); continue;
    }
    const eye = new P2D(); eye.ellipse(x, eyeY, erx, ery, 0, 0, Math.PI * 2);
    fillStroke(ctx, eye, '#ffffff', R * 0.06);
    ctx.save(); ctx.clip(eye);
    const pr = R * 0.14 * (ex.pupil || 1), px = x + gaze[0] * erx * 0.45, py = eyeY + R * 0.03 + gaze[1] * ery * 0.4;
    ctx.fillStyle = spec.eye || '#3a2418'; ctx.fill(circle(px, py, pr));
    ctx.fillStyle = '#ffffff'; ctx.fill(circle(px - pr * 0.35, py - pr * 0.4, pr * 0.32));
    const lid = clamp(Math.max(ex.lid || 0, blink));
    if (lid > 0.01) {
      ctx.fillStyle = spec.skin; ctx.fillRect(x - erx - 1, eyeY - ery - 1, erx * 2 + 2, (ery * 2 + 1) * lid + 0.5);
      ctx.strokeStyle = INK; ctx.lineWidth = R * 0.06; ctx.beginPath(); ctx.moveTo(x - erx, eyeY - ery + ery * 2 * lid); ctx.lineTo(x + erx, eyeY - ery + ery * 2 * lid); ctx.stroke();
    }
    ctx.restore();
    ctx.lineWidth = R * 0.06; ctx.strokeStyle = INK; ctx.stroke(eye);
    if (ex.tears) { ctx.fillStyle = '#7cc6ff'; const tp = new P2D(); tp.moveTo(x + sg * erx * 0.4, eyeY + ery); tp.quadraticCurveTo(x + sg * erx * 0.9, eyeY + ery * 2.2, x + sg * erx * 0.4, eyeY + ery * 2.4); tp.quadraticCurveTo(x - sg * erx * 0.1, eyeY + ery * 2.2, x + sg * erx * 0.4, eyeY + ery); ctx.fill(tp); }
  }
  if (spec.wrinkles) { ctx.strokeStyle = 'rgba(60,30,20,.45)'; ctx.lineWidth = R * 0.04; for (const sg of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sg * (eyeX + erx + R * 0.05), eyeY + ery * 0.1); ctx.lineTo(sg * (eyeX + erx + R * 0.16), eyeY + ery * 0.3); ctx.stroke(); } }
  // brows
  const bw = spec.bushyBrows ? R * 0.11 : R * 0.075;
  for (const sg of [-1, 1]) {
    const x = sg * eyeX, y = eyeY - ery - R * 0.16 + (ex.browY || 0) * R * 0.04, a = -rad(ex.brow || 0) * sg;
    const dx = Math.cos(a) * R * 0.2, dy = Math.sin(a) * R * 0.2;
    ctx.lineCap = 'round';
    if (spec.bushyBrows) { ctx.strokeStyle = INK; ctx.lineWidth = bw + 1.1; ctx.beginPath(); ctx.moveTo(x - dx, y + dy); ctx.lineTo(x + dx, y - dy); ctx.stroke(); }
    ctx.strokeStyle = spec.browColor || INK; ctx.lineWidth = bw; ctx.beginPath(); ctx.moveTo(x - dx, y + dy); ctx.lineTo(x + dx, y - dy); ctx.stroke();
  }
  // nose
  const nose = new P2D(); const nz = spec.bigNose ? 1.5 : 1;
  nose.ellipse(0, R * 0.2, R * 0.11 * nz, R * 0.09 * nz, 0, 0, Math.PI * 2);
  fillStroke(ctx, nose, dark(spec.skin, 0.12), R * 0.045);
  // blush
  if (spec.blush) { ctx.fillStyle = 'rgba(255,110,120,.32)'; for (const sg of [-1, 1]) ctx.fill(ellipse(sg * R * 0.6, R * 0.32, R * 0.16, R * 0.09)); }
  // mouth
  drawMouth(ctx, R, ex, clamp(st.talk || 0), spec);
  if (spec.mustache) {
    const m = new P2D(); m.moveTo(0, R * 0.32);
    m.bezierCurveTo(-R * 0.15, R * 0.24, -R * 0.42, R * 0.3, -R * 0.46, R * 0.47); m.bezierCurveTo(-R * 0.3, R * 0.44, -R * 0.14, R * 0.46, 0, R * 0.4);
    m.bezierCurveTo(R * 0.14, R * 0.46, R * 0.3, R * 0.44, R * 0.46, R * 0.47); m.bezierCurveTo(R * 0.42, R * 0.3, R * 0.15, R * 0.24, 0, R * 0.32);
    fillStroke(ctx, m, spec.mustache, R * 0.04);
  }
  if (spec.glasses) {
    ctx.strokeStyle = spec.glasses; ctx.lineWidth = R * 0.07;
    for (const sg of [-1, 1]) { ctx.beginPath(); ctx.arc(sg * eyeX, eyeY, R * 0.33, 0, Math.PI * 2); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(-eyeX + R * 0.33, eyeY - R * 0.03); ctx.quadraticCurveTo(0, eyeY - R * 0.12, eyeX - R * 0.33, eyeY - R * 0.03); ctx.stroke();
  }
}

function drawMouth(ctx, R, ex, talk, spec) {
  const y = R * 0.52;
  let kind = ex.mouth, open = 0;
  if (talk > 0.05) { open = talk; kind = 'open'; }
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (kind === 'open' || kind === 'wail' || kind === 'grin' || kind === 'o') {
    const w = kind === 'o' ? R * 0.14 : kind === 'grin' ? R * 0.33 : R * 0.26;
    const h = kind === 'o' ? R * 0.2 : kind === 'grin' ? R * 0.26 : R * (0.1 + 0.26 * (open || ex.curve || 0.6));
    const m = new P2D();
    if (kind === 'o') m.ellipse(0, y + h * 0.3, w, h, 0, 0, Math.PI * 2);
    else if (kind === 'wail') { m.moveTo(-w, y + h); m.quadraticCurveTo(0, y - h * 0.6, w, y + h); m.quadraticCurveTo(0, y + h * 1.3, -w, y + h); }
    else { m.moveTo(-w, y); m.quadraticCurveTo(0, y + R * 0.05, w, y); m.quadraticCurveTo(w * 0.8, y + h * 1.25, 0, y + h * 1.3); m.quadraticCurveTo(-w * 0.8, y + h * 1.25, -w, y); }
    ctx.save(); fillStroke(ctx, m, '#6b1f23', R * 0.06); ctx.clip(m);
    if (kind === 'grin') { ctx.fillStyle = '#ffffff'; ctx.fillRect(-w, y - 2, w * 2, h * 0.42 + 2); }
    ctx.fillStyle = '#e8737b'; ctx.fill(ellipse(0, y + h * 1.25, w * 0.62, h * 0.5));
    ctx.restore(); ctx.strokeStyle = INK; ctx.lineWidth = R * 0.06; ctx.stroke(m);
    return;
  }
  ctx.strokeStyle = INK; ctx.lineWidth = R * 0.07; ctx.beginPath();
  const w = R * 0.24, c = (ex.curve || 0) * R * 0.22;
  if (kind === 'smile') { ctx.moveTo(-w, y); ctx.quadraticCurveTo(0, y + c * 1.4, w, y); }
  else if (kind === 'sad' || kind === 'frown') { ctx.moveTo(-w, y + c * 0.7); ctx.quadraticCurveTo(0, y - c * 0.7, w, y + c * 0.7); }
  else { ctx.moveTo(-w * 0.8, y + 1); ctx.lineTo(w * 0.8, y + 1); }
  ctx.stroke();
}

// ---------- baby (swaddled) ----------
export function drawBaby(ctx, spec, st = {}) {
  const R = 11;
  const blanket = new P2D(); blanket.ellipse(0, 10, 14, 13, 0, 0, Math.PI * 2);
  fillStroke(ctx, blanket, spec.blanket || '#f3d36b');
  ctx.strokeStyle = dark(spec.blanket || '#f3d36b', 0.2); ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(-10, 6); ctx.quadraticCurveTo(0, 14, 11, 4); ctx.stroke();
  ctx.save(); ctx.translate(0, -4);
  fillStroke(ctx, circle(0, 0, R), spec.skin);
  ctx.fillStyle = spec.hairColor || '#3b2a20'; const tuft = new P2D(); tuft.moveTo(-2, -R + 0.5); tuft.quadraticCurveTo(0, -R - 4, 3, -R - 1); tuft.quadraticCurveTo(1, -R + 1, -2, -R + 0.5); fillStroke(ctx, tuft, spec.hairColor || '#3b2a20', 0.6);
  const ex = EXPR[st.expr || 'sleep'];
  for (const sg of [-1, 1]) {
    const x = sg * 4;
    ctx.strokeStyle = INK; ctx.lineWidth = 0.9; ctx.lineCap = 'round';
    if (ex.closed || (st.blink || 0) > 0.8) { ctx.beginPath(); ctx.moveTo(x - 2, 0); ctx.quadraticCurveTo(x, 1.6, x + 2, 0); ctx.stroke(); }
    else { fillStroke(ctx, ellipse(x, 0, 2.2, 2.6), '#ffffff', 0.7); ctx.fillStyle = INK; ctx.fill(circle(x, 0.4, 1.2)); }
  }
  ctx.fillStyle = 'rgba(255,110,120,.35)'; for (const sg of [-1, 1]) ctx.fill(ellipse(sg * 6.5, 3.5, 1.8, 1.1));
  ctx.strokeStyle = INK; ctx.lineWidth = 0.8; ctx.beginPath();
  if (ex.mouth === 'wail' || ex.mouth === 'sad') { ctx.moveTo(-1.6, 5.4); ctx.quadraticCurveTo(0, 4.2, 1.6, 5.4); } else { ctx.moveTo(-1.4, 4.6); ctx.quadraticCurveTo(0, 5.8, 1.4, 4.6); }
  ctx.stroke();
  ctx.restore();
  return {headTop: -4 - R};
}
