// R1 · grace-remains ep13 "The Name": every time you call someone a fool, the LAST letter of your own name fades (counter LETTERS).
// New: the «HELLO my name is» chest tag whose last letter lifts off and turns to dust (badgeG, follows the actor), front-view cars with a driver
// seen through the windshield, a traffic road at dusk, a village pitch, a bright cafe, a 1991 newsroom at night, Walter's flat at night, a
// newspaper, an envelope addressed to OCCUPANT, juice (glass, splash, puddle), a pencilled name, the thank-you cake top whose letters light up.
// Registered into SETS/PROPS on import. NOTHING existing in the engine is edited.
import {Path2D} from '@napi-rs/canvas';
import {INK, mix, dark, light, bodyMetrics, PLANS, EXPR} from './r1-rig.mjs';
import {SETS, PROPS} from './r1-world.mjs';
import {fs, rr, el, poly, hashN, glow, olive, sky, windowPane, room, cobbles, easeOutBack, SHADE, WARM} from './r1-world-grace.mjs';
import './r1-world-grace-ears.mjs';
import './r1-world-grace-bakery.mjs';
import './r1-world-grace-clouds.mjs';
import './r1-world-grace-sign.mjs';

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const lerp = (a, b, k) => a + (b - a) * k;
const MARK = '#1c1411';
// an angry face with the mouth held OPEN (the rig's `angry` mouth is closed); added at import, the rig file is untouched
EXPR.snarl = {brow: -20, browY: 1, mouth: 'wail', curve: 0.8, lid: 0.25};

// ------------------------------------------------------------------ the name tag
// args {A: the actor it sits on, t, name: the FULL name, drops: [times at which the LAST remaining letter fades], blank: no letters at all,
//       sc: size factor, dur: seconds a letter takes to turn to dust}
function badgeG(ctx, {A, t = 0, name = '', drops = [], blank = false, sc = 1, dur = 0.62, tilt = -0.05, k = 1} = {}) {
  if (!A || !A._xy || !A._rt || !A._spec || (A._alpha ?? 1) <= 0.02 || k <= 0) return;
  const Pl = PLANS[A._spec.plan || 'adult'], s = A._s, sit = A._st?.sit || 0;
  const [cx, cy] = A._rt(0, (-(Pl.leg + Pl.torso * 0.58) + sit * Pl.leg * 0.45 + (A._st?.bob || 0)) * s);
  const bw = Pl.sw * 0.86 * s * sc, bh = bw * 0.72, N = name.length;
  const done = drops.filter(d => t >= d + dur).length, active = drops.find(d => t >= d && t < d + dur);
  const present = N - done;                         // letters still on the tag (the fading one included)
  ctx.save(); ctx.globalAlpha = (A._alpha ?? 1) * clamp(k); ctx.translate(cx, cy); ctx.rotate(tilt);
  ctx.lineJoin = 'round';
  const body = rr(-bw / 2, -bh / 2, bw, bh, bh * 0.1);
  ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.save(); ctx.translate(0, bh * 0.05); ctx.fill(body); ctx.restore();
  fs(ctx, body, '#fffaf0', Math.max(2, bh * 0.045));
  ctx.save(); ctx.clip(body); ctx.fillStyle = '#d9473a'; ctx.fillRect(-bw / 2, -bh / 2, bw, bh * 0.44); ctx.restore();
  ctx.stroke(body);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fffaf0'; ctx.font = `${bh * 0.25}px GraceCaption`; ctx.fillText('HELLO', 0, -bh * 0.33);
  ctx.font = `${bh * 0.13}px GraceCaption`; ctx.fillText('my name is', 0, -bh * 0.13);
  // the writing field
  const fieldY = bh * 0.2, slot = Math.min(bw * 0.88 / Math.max(N, 1), bw * 0.2), fz = Math.min(bh * 0.46, slot * 2.1);
  if (blank || present <= 0) { ctx.strokeStyle = 'rgba(28,20,17,.45)'; ctx.lineWidth = Math.max(2, bh * 0.03); ctx.setLineDash([bh * 0.08, bh * 0.07]); ctx.beginPath(); ctx.moveTo(-bw * 0.36, fieldY + bh * 0.12); ctx.lineTo(bw * 0.36, fieldY + bh * 0.12); ctx.stroke(); ctx.setLineDash([]); }
  const letterAt = i => [(i - (N - 1) / 2) * slot, fieldY + (hashN(i * 3.7 + N) - 0.5) * bh * 0.04];
  if (!blank) {
    ctx.font = `${fz}px GraceCaption`; ctx.fillStyle = MARK;
    for (let i = 0; i < present; i++) {
      const [lx, ly] = letterAt(i); if (i === present - 1 && active !== undefined) continue;
      ctx.save(); ctx.translate(lx, ly); ctx.rotate((hashN(i * 5.1 + N) - 0.5) * 0.12); ctx.fillText(name[i], 0, 0); ctx.restore();
    }
  }
  // the last letter fades: it lifts off the tag, swells, breaks into dust
  if (!blank && active !== undefined) {
    const q = clamp((t - active) / dur), i = present - 1, [lx, ly] = letterAt(i), ch = name[i];
    ctx.save(); ctx.translate(lx + Math.sin(q * 14) * bh * 0.03, ly - ease(q) * bh * 0.55); ctx.scale(1 + 2.2 * q, 1 + 2.2 * q); ctx.rotate(Math.sin(q * 9) * 0.18 * q);
    ctx.globalAlpha *= q < 0.45 ? 1 : Math.max(0, 1 - (q - 0.45) / 0.5); ctx.font = `${fz}px GraceCaption`; ctx.fillStyle = q < 0.3 ? '#e0372a' : MARK; ctx.fillText(ch, 0, 0); ctx.restore();
    for (let p = 0; p < 46; p++) {                     // dust: ink grains, a few ember ones, flying out and up
      const a = hashN(p * 2.3 + i) * 6.283, v = (0.5 + hashN(p * 5.7 + 1) * 1.6) * bh, d = Math.max(0, q - 0.12 * hashN(p)) * 1.15;
      if (d <= 0) continue; const x = lx + Math.cos(a) * v * d * 1.1, y = ly - bh * 0.1 + Math.sin(a) * v * d * 0.8 - d * bh * 0.45 + d * d * bh * 0.3, r = bh * (0.05 + 0.08 * hashN(p + 9)) * (1 - 0.5 * q);
      ctx.save(); ctx.globalAlpha = (A._alpha ?? 1) * (1 - q) * 0.95; ctx.fillStyle = p % 3 === 0 ? '#e0372a' : p % 3 === 0 ? '#6e5a4a' : MARK; ctx.translate(x, y); ctx.rotate(a + q * 4); ctx.fillRect(-r, -r, 2 * r, 2 * r); ctx.restore();
    }
    if (q < 0.35) { ctx.strokeStyle = `rgba(255,238,200,${0.9 * (1 - q / 0.35)})`; ctx.lineWidth = bh * 0.06 * (1 - q / 0.35) + 1; ctx.beginPath(); ctx.arc(lx, ly - bh * 0.1, bh * (0.3 + 1.2 * q), 0, 7); ctx.stroke(); }
  }
  ctx.restore();
}

// ------------------------------------------------------------------ a car seen from the front, origin = bottom centre on the ground;
// the windshield is a HOLE: the driver (an actor drawn before it) shows through. Driver spot: x - 0.13w, feet at y - 0.20w, s = 0.0042w.
function carFrontG(ctx, {w = 640, color = '#7c8f4a', lights = true, plate = 'TRAFFIC', flip = 1, dim = 0} = {}) {
  if (dim) color = mix(color, '#241838', dim);
  ctx.save(); ctx.scale(flip, 1); ctx.lineJoin = 'round';
  const L = (x, y) => [x * w, y * w], P = pts => { const p = new Path2D(); p.moveTo(...L(...pts[0])); for (const q of pts.slice(1)) p.lineTo(...L(...q)); p.closePath(); return p; };
  ctx.fillStyle = 'rgba(30,20,20,.2)'; ctx.fill(el(0, 0, w * 0.5, w * 0.03));
  const cab = new Path2D(); cab.addPath(P([[-0.40, -0.34], [-0.35, -0.70], [0.35, -0.70], [0.40, -0.34]])); cab.addPath(P([[-0.335, -0.375], [-0.30, -0.665], [0.30, -0.665], [0.335, -0.375]]));
  ctx.fillStyle = mix(color, '#ffffff', 0.10); ctx.fill(cab, 'evenodd'); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke(cab);
  const body = rr(-w * 0.5, -w * 0.38, w, w * 0.36, w * 0.06); fs(ctx, body, color, 7);
  fs(ctx, rr(-w * 0.44, -w * 0.38, w * 0.88, w * 0.035, 6), mix(color, '#ffffff', 0.18), 0);
  // dashboard strip along the bottom of the windshield + a steering wheel, drawn in front of the driver
  fs(ctx, rr(-w * 0.335, -w * 0.405, w * 0.67, w * 0.045, 8), '#3b2d27', 5);
  ctx.lineWidth = w * 0.014; ctx.strokeStyle = INK; ctx.beginPath(); ctx.ellipse(-w * 0.13, -w * 0.378, w * 0.075, w * 0.02, 0, 0, 7); ctx.stroke();
  ctx.lineWidth = w * 0.007; ctx.strokeStyle = '#8a7a6a'; ctx.beginPath(); ctx.ellipse(-w * 0.13, -w * 0.378, w * 0.075, w * 0.02, 0, 0, 7); ctx.stroke();
  // grille, headlights, bumper, wheels, plate
  fs(ctx, rr(-w * 0.2, -w * 0.31, w * 0.4, w * 0.13, 10), '#4a3a30', 5); ctx.strokeStyle = '#8a7660'; ctx.lineWidth = 3; for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(i * w * 0.05, -w * 0.30); ctx.lineTo(i * w * 0.05, -w * 0.19); ctx.stroke(); }
  for (const sx of [-1, 1]) { const x = sx * w * 0.37, y = -w * 0.25; if (lights) { const g = ctx.createRadialGradient(x, y, 4, x, y, w * 0.34); g.addColorStop(0, 'rgba(255,226,140,.55)'); g.addColorStop(1, 'rgba(255,226,140,0)'); ctx.fillStyle = g; ctx.fillRect(x - w * 0.34, y - w * 0.34, w * 0.68, w * 0.68); }
    fs(ctx, el(x, y, w * 0.06, w * 0.045), lights ? '#ffeaa6' : '#e8dcc0', 5); }
  fs(ctx, rr(-w * 0.52, -w * 0.115, w * 1.04, w * 0.06, 14), '#d6cab2', 5);
  for (const sx of [-1, 1]) fs(ctx, rr(sx * w * 0.37 - w * 0.07, -w * 0.06, w * 0.14, w * 0.07, 8), '#2b2a2e', 5);
  fs(ctx, rr(-w * 0.07, -w * 0.105, w * 0.14, w * 0.05, 5), '#fbf1dc', 3); ctx.fillStyle = INK; ctx.font = `${w * 0.035}px GraceCaption`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(plate, 0, -w * 0.078); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.restore();
}

// ------------------------------------------------------------------ small props
// a folded newspaper held up: origin = centre. args {text: headline, tilt}
function newsG(ctx, {w = 300, text = 'THE DAILY CRITIC', sub = 'ONE STAR', tilt = 0} = {}) {
  ctx.save(); ctx.rotate(tilt); const h = w * 1.25;
  fs(ctx, rr(-w / 2, -h / 2, w, h, 6), '#f1e8d2', 5); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -h / 2 + w * 0.2); ctx.lineTo(0, h / 2); ctx.stroke();
  ctx.fillStyle = MARK; ctx.font = `${w * 0.12}px GraceCaption`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, -h / 2 + w * 0.1);
  fs(ctx, rr(-w * 0.43, -h / 2 + w * 0.24, w * 0.36, w * 0.3, 3), '#cfc3aa', 3); ctx.font = `${w * 0.1}px GraceCaption`; ctx.fillText(sub, w * 0.27, -h / 2 + w * 0.42);
  ctx.fillStyle = 'rgba(28,20,17,.5)'; for (let r = 0; r < 9; r++) for (const sx of [-1, 1]) ctx.fillRect(sx * w * 0.24 - w * 0.2, -h / 2 + w * 0.62 + r * w * 0.066, w * 0.4 * (0.6 + 0.4 * hashN(r * 3 + sx)), w * 0.022);
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.restore();
}
// a newspaper held by an actor: raised in front of the face (up = 1) or lowered to the lap (up = 0); `lower` = time it comes down (0.4 s)
function newsHeldG(ctx, {A, t = 0, lower = 1e9, raise = -1e9, text = 'THE DAILY CRITIC', sub = 'ONE STAR'} = {}) {
  if (!A || !A._xy || !A._spec || !A._head || (A._alpha ?? 1) <= 0.02) return;
  const Pl = PLANS[A._spec.plan || 'adult'], s = A._s, w = Pl.sw * 2.1 * s, h = w * 1.25;
  const up = t < lower ? clamp((t - raise) / 0.3) : 1 - ease((t - lower) / 0.4);
  const yUp = A._head[1] + 0.12 * h, yDown = A._head[1] + 1.55 * h;
  ctx.save(); ctx.translate(A._head[0], lerp(yDown, yUp, up)); ctx.globalAlpha = A._alpha ?? 1; PROPS.newsG(ctx, {w, text, sub, tilt: 0.04 * (1 - up) - 0.02}); ctx.restore();
}
// an envelope addressed to OCCUPANT. origin = centre. args {w, k: 0..1 how much of the writing is shown}
function envelopeG(ctx, {w = 520, k = 1, tilt = -0.06, text = 'OCCUPANT'} = {}) {
  const h = w * 0.64; ctx.save(); ctx.rotate(tilt);
  fs(ctx, rr(-w / 2, -h / 2, w, h, 8), '#f6efde', 6); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-w / 2, -h / 2); ctx.lineTo(0, -h * 0.04); ctx.lineTo(w / 2, -h / 2); ctx.stroke();
  fs(ctx, rr(w * 0.3, -h * 0.4, w * 0.15, h * 0.2, 3), '#e2574c', 3);
  ctx.fillStyle = MARK; ctx.font = `${w * 0.17}px GraceCaption`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha = clamp(k); ctx.fillText(text, 0, h * 0.18); ctx.globalAlpha = 1;
  ctx.strokeStyle = 'rgba(28,20,17,.35)'; ctx.lineWidth = 4; for (let i = 0; i < 2; i++) { ctx.beginPath(); ctx.moveTo(-w * 0.3, h * 0.34 + i * h * 0.07); ctx.lineTo(w * (0.1 + 0.1 * i), h * 0.34 + i * h * 0.07); ctx.stroke(); }
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.restore();
}
// a glass of orange juice; origin = centre of the glass. args {tilt, level 0..1}
function juiceGlassG(ctx, {tilt = 0, level = 0.8, r = 1} = {}) {
  ctx.save(); ctx.rotate(tilt); ctx.scale(r, r);
  const g = poly([[-34, -52], [34, -52], [27, 52], [-27, 52]]);
  fs(ctx, g, 'rgba(226,244,248,.55)', 5);
  if (level > 0) { const top = 52 - 104 * level; ctx.save(); ctx.clip(g); ctx.fillStyle = '#f59a2f'; ctx.fillRect(-40, top, 80, 120); ctx.fillStyle = '#ffc15a'; ctx.fillRect(-40, top, 80, 8); ctx.restore(); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.stroke(g); }
  ctx.restore();
}
// juice leaving a glass and landing: a fat orange arc then a splash + a puddle. origin = where it lands. args {t, t0}
function juiceSplashG(ctx, {t = 0, t0 = 0, from = [-260, -420], puddle = true, pr = 1} = {}) {
  const q = t - t0; if (q < 0) return; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const fall = clamp(q / 0.38);
  const arc = () => { ctx.beginPath(); for (let i = 0; i <= 14; i++) { const k = i / 14 * fall, x = lerp(from[0], 0, k), y = lerp(from[1], 0, k * k); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); };
  if (fall < 1) for (let i = 0; i < 9; i++) { const k = clamp(fall - i * 0.07); if (k <= 0) continue; const x = lerp(from[0], 0, k) + (hashN(i * 5.1) - 0.5) * 26, y = lerp(from[1], 0, k * k) + (hashN(i * 7.7) - 0.5) * 20, r = 12 - i * 0.7; fs(ctx, el(x, y, r, r * 1.25), '#f59a2f', 3); }
  if (puddle) { const g = ease((q - 0.3) / 0.5); if (g > 0) { fs(ctx, el(0, 8, 190 * g * pr, 46 * g * pr), '#f59a2f', 5); ctx.fillStyle = 'rgba(255,230,160,.55)'; ctx.fill(el(-50 * g * pr, 0, 60 * g * pr, 12 * g * pr)); } }
  const sp = clamp((q - 0.32) / 0.5); if (sp > 0 && sp < 1) for (let i = 0; i < 12; i++) { const a = -0.3 - hashN(i * 2.1) * 2.5, v = 160 + hashN(i * 3.3) * 200, x = Math.cos(a) * v * sp, y = Math.sin(a) * v * sp + 380 * sp * sp; ctx.globalAlpha = 1 - sp; fs(ctx, el(x, y, 15 * (1 - sp * 0.5), 15 * (1 - sp * 0.5)), '#f59a2f', 3); ctx.globalAlpha = 1; }
}
// a sheet of paper with the name being written in pencil. origin = centre. args {t, letters: [{t, ch, x}], cross: time the last guess is scribbled out}
function nameSheetG(ctx, {t = 0, letters = [], cross = null, w = 760} = {}) {
  const h = w * 0.62; ctx.save(); ctx.rotate(-0.03);
  fs(ctx, rr(-w / 2, -h / 2, w, h, 8), '#fffaf0', 6); ctx.strokeStyle = 'rgba(80,110,160,.35)'; ctx.lineWidth = 3; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-w / 2 + 14, -h / 2 + h * (0.2 + i * 0.14)); ctx.lineTo(w / 2 - 14, -h / 2 + h * (0.2 + i * 0.14)); ctx.stroke(); }
  ctx.font = `${w * 0.3}px GraceCaption`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#4a4540';
  let lastX = -w * 0.34;
  letters.forEach(({t: tw, ch, x}, i) => { const k = clamp((t - tw) / 0.16); if (k <= 0) return; ctx.save(); ctx.translate(x * w, h * 0.04 + (hashN(i * 4.4) - 0.5) * h * 0.04); ctx.rotate((hashN(i * 2.2) - 0.5) * 0.18); ctx.globalAlpha = k; ctx.fillText(ch, 0, (1 - k) * 12); ctx.restore(); lastX = x * w; });
  if (cross != null) { const k = clamp((t - cross) / 0.25); if (k > 0) { ctx.strokeStyle = '#4a4540'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); const x0 = lastX - w * 0.1, x1 = x0 + w * 0.2 * k; ctx.moveTo(x0, -h * 0.1); for (let i = 1; i <= 8; i++) { const xx = lerp(x0, x1, i / 8); ctx.lineTo(xx, i % 2 ? h * 0.2 : -h * 0.1); } ctx.stroke(); } }
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.restore();
}
// a pencil whose tip is the origin
function pencilG(ctx, {len = 360, tilt = 0.6} = {}) { ctx.save(); ctx.rotate(tilt); ctx.lineJoin = 'round'; fs(ctx, poly([[0, 0], [-14, -50], [14, -50]]), '#e8c39a', 5); fs(ctx, rr(-14, -len, 28, len - 50, 4), '#e0a43a', 5); fs(ctx, rr(-14, -len - 28, 28, 34, 6), '#e87a7a', 5); ctx.fillStyle = INK; ctx.fill(poly([[0, 0], [-4, -14], [4, -14]])); ctx.restore(); }
// the cake top, seen from above, held up to the camera: THANK YOU, / WALTER in blue frosting; the letters of the name light up one by one.
// args {t, thank: [t of THANK, t of YOU,], name: t the name appears, lights: [6 times]}
function cakeTopG(ctx, {t = 0, thank = [1e9, 1e9], name = 1e9, lights = [], w = 760} = {}) {
  const h = w * 0.78; ctx.save(); ctx.lineJoin = 'round';
  fs(ctx, rr(-w / 2 - 22, -h / 2 + 24, w + 44, h, 70), '#6b3a26', 7);            // the sponge edge
  fs(ctx, rr(-w / 2, -h / 2, w, h, 60), '#fbeed6', 7);                             // cream icing
  ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fill(el(-w * 0.2, -h * 0.34, w * 0.18, h * 0.05, -0.3));
  for (let i = 0; i < 26; i++) { const a = i / 26 * 6.283, cx = Math.cos(a) * w * 0.44, cy = Math.sin(a) * h * 0.44; ctx.beginPath(); ctx.arc(cx, cy, w * 0.018, 0, 7); ctx.fillStyle = '#4f7fd0'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = INK; ctx.stroke(); } // piped blue border
  const FRO = '#3f6fc4', FRO2 = '#2a4f9c';
  ctx.save(); ctx.font = `${w * 0.17}px GraceCaption`; const wT = ctx.measureText('THANK ').width, wY = ctx.measureText('YOU,').width, x0 = -(wT + wY) / 2; ctx.restore();
  ctx.save(); ctx.font = `${w * 0.17}px GraceCaption`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.lineWidth = w * 0.017; ctx.strokeStyle = FRO2; ctx.fillStyle = FRO;
  for (const [s, x, tt] of [['THANK', x0, thank[0]], ['YOU,', x0 + wT, thank[1]]]) { const k = clamp((t - tt) / 0.18); if (k <= 0) continue; ctx.globalAlpha = k; ctx.strokeText(s, x, -h * 0.2 + (1 - k) * 14); ctx.fillText(s, x, -h * 0.2 + (1 - k) * 14); } ctx.restore();
  // WALTER: six letters, each its own glow
  const sz = w * 0.27; ctx.save(); ctx.font = `${sz}px GraceCaption`; const word = 'WALTER', ws = [...word].map(c => ctx.measureText(c).width + sz * 0.06), tot = ws.reduce((a, b) => a + b, 0); ctx.restore();
  let x = -tot / 2;
  [...word].forEach((c, i) => {
    const cx = x + ws[i] / 2, cy = h * 0.14; x += ws[i]; const kA = clamp((t - name) / 0.2); if (kA <= 0) return;
    const lk = lights[i] != null ? clamp((t - lights[i]) / 0.3) : 0, pulse = lk > 0 ? 1 + 0.12 * Math.sin(clamp((t - lights[i]) / 0.5) * Math.PI) : 1;
    ctx.save(); ctx.globalAlpha = kA; ctx.translate(cx, cy + (1 - kA) * 16); ctx.scale(pulse, pulse);
    if (lk > 0) { const g = ctx.createRadialGradient(0, 0, 4, 0, 0, sz * 0.9); g.addColorStop(0, `rgba(255,236,150,${0.85 * lk})`); g.addColorStop(1, 'rgba(255,236,150,0)'); ctx.fillStyle = g; ctx.fillRect(-sz, -sz, 2 * sz, 2 * sz); }
    ctx.font = `${sz}px GraceCaption`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = sz * 0.1; ctx.strokeStyle = lk > 0 ? '#b98a1a' : FRO2; ctx.fillStyle = lk > 0 ? mix(FRO, '#ffe9a0', lk) : FRO; ctx.strokeText(c, 0, 0); ctx.fillText(c, 0, 0);
    if (lk > 0) { ctx.fillStyle = `rgba(255,255,255,${0.5 * lk})`; ctx.fillText(c, -2, -3); }
    ctx.restore();
  });
  ctx.restore();
}
// young Walter's desk in the 1991 newsroom: front panel + a typewriter with a sheet + a gold lamp + stacked paper. origin = (centre, desk top)
function deskTypeG(ctx, {w = 1180, press = 0} = {}) {
  fs(ctx, rr(-w / 2, 0, w, 52, 8), '#a8703e', 7); fs(ctx, rr(-w / 2 + 20, 52, w - 40, 640, 6), '#7a4b2a', 7);
  ctx.strokeStyle = 'rgba(40,20,10,.3)'; ctx.lineWidth = 5; for (let x = -w / 2 + 160; x < w / 2; x += 230) { ctx.beginPath(); ctx.moveTo(x, 90); ctx.lineTo(x, 650); ctx.stroke(); }
  const tw = 330; ctx.save(); ctx.translate(-w * 0.27, 0);
  fs(ctx, rr(-tw / 2, -120, tw, 120, 16), '#3f4a52', 6); fs(ctx, rr(-tw * 0.42, -190, tw * 0.84, 80, 10), '#586670', 5);
  fs(ctx, rr(-tw * 0.3, -330, tw * 0.6, 150, 6), '#fffaf0', 4); ctx.strokeStyle = 'rgba(28,20,17,.5)'; ctx.lineWidth = 4; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-tw * 0.22, -300 + i * 30); ctx.lineTo(tw * (0.1 + 0.08 * (i % 2)), -300 + i * 30); ctx.stroke(); }
  ctx.fillStyle = '#d6cab2'; for (let r = 0; r < 2; r++) for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.arc(-tw * 0.36 + i * tw * 0.1, -80 + r * 38 + press * 5, 12, 0, 7); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke(); }
  ctx.restore();
  for (let i = 0; i < 4; i++) fs(ctx, rr(w * 0.26 - i * 6, -34 - i * 24, 220, 30, 3), '#f4ecd6', 4);                  // paper stack
  fs(ctx, rr(w * 0.4 - 50, -30, 100, 26, 6), '#3c2c24', 4); ctx.lineWidth = 9; ctx.strokeStyle = INK; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(w * 0.4, -30); ctx.lineTo(w * 0.4 - 30, -170); ctx.lineTo(w * 0.4 + 30, -290); ctx.stroke();
  fs(ctx, poly([[w * 0.4 + 10, -312], [w * 0.4 + 90, -282], [w * 0.4 + 60, -250], [w * 0.4 - 10, -290]]), '#ffe08a', 5); glow(ctx, w * 0.4 + 40, -260, 420, 0.5);
}

// a big «-1» that pops beside someone (the rule's price), origin = where it sits; args {t, t0}
function minusG(ctx, {t = 0, t0 = 0, text = '-1', size = 230} = {}) {
  const q = (t - t0) / 1.1; if (q < 0 || q > 1) return; const k = easeOutBack(clamp(q * 4)), a = q < 0.7 ? 1 : 1 - (q - 0.7) / 0.3;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(0, -q * 90); ctx.scale(k, k); ctx.font = `${size}px GraceCaption`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.1; ctx.strokeStyle = INK; ctx.strokeText(text, 0, 0); ctx.fillStyle = '#ff6a4d'; ctx.fillText(text, 0, 0); ctx.restore();
}
// a faint letter that drifts through (nothing is given back): origin = centre; args {ch, a}
function ghostLetterG(ctx, {ch = 'W', a = 1, size = 340} = {}) {
  ctx.save(); ctx.globalAlpha = 0.75 * a; const g = ctx.createRadialGradient(0, 0, 10, 0, 0, size * 0.8); g.addColorStop(0, 'rgba(255,226,130,.55)'); g.addColorStop(1, 'rgba(255,226,130,0)'); ctx.fillStyle = g; ctx.fillRect(-size, -size, 2 * size, 2 * size);
  ctx.font = `${size}px GraceCaption`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = size * 0.05; ctx.strokeStyle = 'rgba(180,130,30,.8)'; ctx.strokeText(ch, 0, 0); ctx.fillStyle = 'rgba(255,236,170,.9)'; ctx.fillText(ch, 0, 0); ctx.restore();
}
Object.assign(PROPS, {minusG, ghostLetterG, newsHeldG, badgeG, carFrontG, newsG, envelopeG, juiceGlassG, juiceSplashG, nameSheetG, pencilG, cakeTopG, deskTypeG});

// ------------------------------------------------------------------ places
const ASPH = '#a8957c';
Object.assign(SETS, {
  // a road at dusk, bumper to bumper far away: warm sunset, a row of village houses, the road slab (cars are front props)
  gnJam({time = 'dusk'} = {}) {
    return ctx => {
      sky(ctx, time); fs(ctx, poly([[0, 1010], [180, 930], [420, 990], [700, 900], [1080, 980], [1080, 1250], [0, 1250]]), time === 'dusk' ? '#a56a58' : '#d9b27a', 4);
      for (const [x, w0, top, c] of [[-40, 260, 800, WARM.plaster[0]], [220, 240, 840, WARM.plaster[2]], [740, 260, 810, WARM.plaster[3]], [1000, 220, 850, WARM.plaster[1]]]) { fs(ctx, rr(x, top, w0, 1240 - top, 4), mix(c, '#b86a5a', time === 'dusk' ? 0.18 : 0), 5); fs(ctx, poly([[x - 20, top + 4], [x + w0 / 2, top - 100], [x + w0 + 20, top + 4]]), WARM.roof, 5); }
      for (const x of [60, 290, 800, 1050]) fs(ctx, rr(x, 930, 60, 80, 4), '#ffd77a', 4);
      ctx.fillStyle = ASPH; ctx.fillRect(0, 1240, 1080, 680); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 1240); ctx.lineTo(1080, 1240); ctx.stroke();
      ctx.fillStyle = 'rgba(0,0,0,.08)'; for (let i = 0; i < 40; i++) ctx.fill(el(hashN(i) * 1080, 1270 + hashN(i + 4) * 620, 44, 8));
      ctx.strokeStyle = '#fbf1dc'; ctx.lineWidth = 12; ctx.setLineDash([120, 90]); ctx.beginPath(); ctx.moveTo(0, 1330); ctx.lineTo(1080, 1330); ctx.stroke(); ctx.setLineDash([]);
      for (const [x, c] of [[110, '#c4643a'], [320, '#7c8f4a'], [760, '#d9a441'], [960, '#9a7ab0']]) { fs(ctx, rr(x - 62, 1210, 124, 54, 12), c, 5); fs(ctx, rr(x - 40, 1176, 80, 40, 10), mix(c, '#ffffff', 0.15), 5); fs(ctx, el(x - 44, 1262, 11, 8), '#ffeaa6', 3); fs(ctx, el(x + 44, 1262, 11, 8), '#ffeaa6', 3); }
      if (SHADE[time]) { ctx.fillStyle = SHADE[time]; ctx.fillRect(0, 0, 1080, 1920); }
      if (time === 'night') { ctx.fillStyle = 'rgba(30,16,56,.30)'; ctx.fillRect(0, 0, 1080, 1920); }
      if (time === 'night') for (const x of [20, 540, 1060]) { fs(ctx, rr(x - 6, 1000, 12, 250, 3), '#3c2c24', 3); fs(ctx, el(x, 990, 26, 18), '#ffe08a', 4); glow(ctx, x, 1000, 380, 0.5); }
    };
  },
  // a village football pitch on a sunny afternoon: grass with chalk lines, a goal, a little wooden stand with a crowd, the village on the ridge
  gnPitch({time = 'noon'} = {}) {
    return ctx => {
      sky(ctx, time); fs(ctx, poly([[0, 1000], [200, 920], [430, 980], [720, 890], [1080, 960], [1080, 1260], [0, 1260]]), '#d9b27a', 4);
      for (const [x, y, w0, c] of [[640, 840, 130, WARM.plaster[0]], [790, 800, 150, WARM.plaster[2]], [950, 780, 130, WARM.plaster[3]]]) { fs(ctx, rr(x, y, w0, 90, 4), c, 5); fs(ctx, poly([[x - 10, y + 6], [x + w0 / 2, y - 56], [x + w0 + 10, y + 6]]), WARM.roof, 5); }
      olive(ctx, 90, 1270, 0.8); olive(ctx, 1020, 1280, 0.75);
      // the stand, left: three wooden steps with a crowd of heads
      fs(ctx, rr(20, 1050, 520, 220, 8), WARM.woodD, 6);
      for (let i = 0; i < 3; i++) { fs(ctx, rr(20, 1050 + i * 70, 520, 24, 4), WARM.wood, 5); for (let j = 0; j < 9; j++) { const x = 60 + j * 55 + (i % 2) * 22, y = 1020 + i * 70; fs(ctx, el(x, y, 20, 22), ['#e3b38e', '#c98b5e', '#f0c7a4', '#8a5a3c'][(i + j) % 4], 4); fs(ctx, rr(x - 24, y + 20, 48, 40, 16), ['#c4643a', '#7c8f4a', '#d9a441', '#9a7ab0', '#3f8a7a'][(i * 2 + j) % 5], 4); } }
      fs(ctx, rr(20, 1250, 520, 30, 4), WARM.woodD, 5);
      // the goal, right
      ctx.strokeStyle = INK; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(760, 1290); ctx.lineTo(760, 1090); ctx.lineTo(1020, 1090); ctx.lineTo(1020, 1290); ctx.stroke(); ctx.strokeStyle = '#fbf6ea'; ctx.lineWidth = 9; ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 3; for (let i = 1; i < 8; i++) { ctx.beginPath(); ctx.moveTo(760 + i * 32, 1090); ctx.lineTo(760 + i * 32, 1290); ctx.stroke(); } for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.moveTo(760, 1090 + i * 34); ctx.lineTo(1020, 1090 + i * 34); ctx.stroke(); }
      // the grass + chalk
      ctx.fillStyle = '#a9b865'; ctx.fillRect(0, 1290, 1080, 630); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 1290); ctx.lineTo(1080, 1290); ctx.stroke();
      ctx.fillStyle = 'rgba(111,135,60,.28)'; for (let i = 0; i < 9; i++) ctx.fillRect(0, 1290 + i * 70, 1080, 35);
      ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(60, 1860); ctx.lineTo(180, 1380); ctx.lineTo(900, 1380); ctx.lineTo(1030, 1860); ctx.stroke(); ctx.beginPath(); ctx.ellipse(540, 1620, 150, 56, 0, 0, 7); ctx.stroke();
      if (SHADE[time]) { ctx.fillStyle = SHADE[time]; ctx.fillRect(0, 0, 1080, 1920); }
    };
  },
  // a bright morning cafe: sunny window, a counter with a coffee machine, shelves of cups, hanging lamps
  gnCafe() {
    return ctx => {
      room(ctx, '#f8e8c4', '#dcae6c', '#d9b07c');
      ctx.fillStyle = 'rgba(255,240,200,.18)'; for (let x = 40; x < 1080; x += 160) ctx.fillRect(x, 0, 60, 1050);
      windowPane(ctx, 90, 330, 420, 520, 'noon'); ctx.fillStyle = 'rgba(255,236,170,.25)'; ctx.fill(poly([[100, 850], [510, 850], [700, 1300], [60, 1300]]));
      fs(ctx, rr(60, 280, 480, 40, 6), WARM.woodD, 5);
      fs(ctx, rr(600, 880, 520, 360, 10), WARM.wood, 7); fs(ctx, rr(580, 850, 560, 44, 10), '#a8703e', 6);   // counter
      ctx.strokeStyle = 'rgba(40,20,10,.3)'; ctx.lineWidth = 5; for (let x = 660; x < 1100; x += 110) { ctx.beginPath(); ctx.moveTo(x, 910); ctx.lineTo(x, 1220); ctx.stroke(); }
      fs(ctx, rr(700, 690, 210, 160, 14), '#c9b79a', 6); fs(ctx, rr(730, 740, 150, 60, 8), '#3a2a22', 4); fs(ctx, el(805, 700, 40, 14), '#8a7660', 4); fs(ctx, rr(960, 760, 70, 90, 10), '#d9473a', 5); // coffee machine + a red can
      for (const y of [420, 560]) { fs(ctx, rr(620, y, 440, 24, 6), WARM.woodD, 4); for (let i = 0; i < 7; i++) fs(ctx, rr(640 + i * 60, y - 44, 44, 44, 10), i % 2 ? '#fbf1dc' : '#c4643a', 4); }
      for (const x of [300, 820]) { ctx.strokeStyle = '#3c2c24'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 190); ctx.stroke(); fs(ctx, poly([[x - 60, 270], [x + 60, 270], [x + 34, 190], [x - 34, 190]]), '#ffe08a', 5); glow(ctx, x, 280, 300, 0.32); }
      fs(ctx, rr(560, 300, 200, 100, 8), '#3a2a22', 6); ctx.fillStyle = '#fbf1dc'; ctx.font = '48px GraceCaption'; ctx.textAlign = 'center'; ctx.fillText('CAFE', 660, 366); ctx.textAlign = 'left';
    };
  },
  // the 1991 newsroom at night: a lit desk corner; plum night outside the window, a board of clippings. ONE dim for the whole place and hour.
  gnNews91({dim = 0.30, day = false} = {}) {
    return ctx => {
      room(ctx, day ? '#e8c999' : '#cfa97a', day ? '#b98a56' : '#9a6a40', day ? '#a87c58' : '#8a6444');
      ctx.fillStyle = 'rgba(255,230,170,.06)'; for (let x = 60; x < 1080; x += 140) ctx.fillRect(x, 0, 40, 1050);
      windowPane(ctx, 90, 300, 330, 440, day ? 'noon' : 'night');
      if (!day) for (const [x, y, w0] of [[120, 560, 60], [220, 600, 80], [330, 540, 50]]) { fs(ctx, rr(x, y, w0, 740 - y, 3), '#2a2433', 4); ctx.fillStyle = '#ffd77a'; for (let j = 0; j < 4; j++) ctx.fillRect(x + 10, y + 16 + j * 26, 14, 14); }
      fs(ctx, rr(540, 300, 430, 330, 10), '#7a4b2a', 7); fs(ctx, rr(556, 316, 398, 298, 6), '#b98a5e', 4);
      for (let i = 0; i < 9; i++) { const x = 574 + (i % 3) * 126, y = 332 + Math.floor(i / 3) * 94; ctx.save(); ctx.translate(x + 50, y + 40); ctx.rotate((hashN(i) - 0.5) * 0.14); fs(ctx, rr(-50, -40, 100, 80, 3), '#f4ecd6', 3); ctx.strokeStyle = 'rgba(28,20,17,.45)'; ctx.lineWidth = 3; for (let l = 0; l < 4; l++) { ctx.beginPath(); ctx.moveTo(-38, -22 + l * 16); ctx.lineTo(38 - l * 8, -22 + l * 16); ctx.stroke(); } ctx.restore(); }
      if (!day) { ctx.fillStyle = `rgba(48,24,76,${dim})`; ctx.fillRect(0, 0, 1080, 1920); }
      glow(ctx, 900, 1250, 700, day ? 0.25 : 0.42, '255,214,120');
    };
  },
  // Walter's door at night, lit from inside (the hallway behind the open leaf glows warm): the porch of gDoor, one dim for the whole scene
  gnDoorNight() {
    return ctx => {
      SETS.gDoor({time: 'night', porch: true})(ctx);
      ctx.save(); ctx.beginPath(); ctx.rect(386, 706, 308, 660); ctx.clip(); const g = ctx.createLinearGradient(0, 700, 0, 1370); g.addColorStop(0, '#ffe9a8'); g.addColorStop(1, '#f0b765'); ctx.fillStyle = g; ctx.fillRect(386, 706, 308, 660);
      ctx.fillStyle = 'rgba(160,100,50,.4)'; ctx.fillRect(386, 1240, 308, 126); ctx.restore(); glow(ctx, 540, 1380, 560, 0.5, '255,206,120');
    };
  },
  // Walter's flat at night: a window full of stars, a lamp, a wall with an empty hook. ONE dim for the whole place and hour.
  gnFlat({dim = 0.30} = {}) {
    return ctx => {
      room(ctx, '#dcc095', '#a87a52', '#9a6e48');
      ctx.fillStyle = 'rgba(255,230,170,.05)'; for (let x = 50; x < 1080; x += 150) ctx.fillRect(x, 0, 40, 1060);
      windowPane(ctx, 330, 260, 420, 560, 'night', 'sky');
      fs(ctx, rr(260, 220, 560, 40, 6), '#d9c9a8', 5);
      for (const [x, y] of [[110, 560], [900, 600]]) { fs(ctx, rr(x, y, 110, 140, 6), '#7a4b2a', 5); fs(ctx, rr(x + 12, y + 12, 86, 116, 3), '#e8dcc0', 3); }
      ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(920, 880); ctx.lineTo(920, 930); ctx.stroke(); fs(ctx, el(920, 940, 14, 14), '#8a7660', 4); // an empty hook
      ctx.fillStyle = `rgba(48,24,76,${dim})`; ctx.fillRect(0, 0, 1080, 1920);
      glow(ctx, 880, 1240, 640, 0.5, '255,206,120'); fs(ctx, rr(840, 1060, 80, 20, 4), '#3c2c24', 4); fs(ctx, poly([[820, 1060], [940, 1060], [910, 960], [850, 960]]), '#ffe08a', 5);
    };
  },
});
