// R1 · rule-world 2D renderer: vertical 1080×1920 episodes with cutout characters, a rule counter above each
// character, top captions that build word by word, speech bubbles, the reference's shot-entrance move, and audio mix.
//   node r1-render.mjs EPISODE.mjs --out DIR [--workers 10] [--stills 1.5,20,33] [--seconds 20]
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawn, spawnSync} from 'node:child_process';
import {once} from 'node:events';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {createCanvas, GlobalFonts, Path2D} from '@napi-rs/canvas';
import {drawCharacter, drawBaby, bodyMetrics, POSES, EXPR, INK} from './r1-rig.mjs';
import {SETS, PROPS} from './r1-world.mjs';
import './r1-world-grace.mjs'; // grace-remains sets/props register themselves

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
GlobalFonts.registerFromPath(path.join(ROOT, 'assets/r1/fonts/Anton-Regular.ttf'), 'R1Caption');
GlobalFonts.registerFromPath(path.join(ROOT, 'assets/r1/fonts/ShareTechMono-Regular.ttf'), 'R1Digits');
GlobalFonts.registerFromPath(path.join(ROOT, 'assets/grace/fonts/BebasNeue-Regular.ttf'), 'GraceCaption');
GlobalFonts.registerFromPath(path.join(ROOT, 'assets/grace/fonts/Lora-Italic.ttf'), 'GraceVerse');

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const lerp = (a, b, k) => a + (b - a) * k;
const hash = s => { let h = 2166136261; for (const c of String(s)) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return (h >>> 0) / 4294967296; };

// ---------- timeline helpers ----------
function stepAt(list, t, def) { let v = def; for (const [k, val] of list || []) if (t >= k) v = val; return v; }
function keyAt(keys, t, prop, def) {
  const ks = (keys || []).filter(k => k[prop] !== undefined); if (!ks.length) return def;
  if (t <= ks[0].t) return ks[0][prop]; if (t >= ks.at(-1).t) return ks.at(-1)[prop];
  const i = ks.findIndex(k => k.t > t), a = ks[i - 1], b = ks[i];
  return lerp(a[prop], b[prop], (b.ease === 'linear' ? clamp : ease)((t - a.t) / (b.t - a.t)));
}
export function ledgerAt(ledger, t) { // -> {v (shown integer), changeT, delta}
  let v = ledger?.[0]?.v ?? 0, changeT = -9, delta = 0, shown = v;
  for (let i = 0; i < (ledger || []).length; i++) {
    const k = ledger[i]; if (t < k.t) break;
    const prev = v; v = k.v;
    if (i === 0) { shown = v; continue; }
    const d = k.roll || 0;
    if (d && t < k.t + d) { shown = Math.round(lerp(prev, v, easeOut((t - k.t) / d))); }
    else shown = v;
    changeT = k.t + (k.roll || 0); delta = k.v - (ledger[i - 1]?.v ?? k.v);
  }
  return {v: shown, target: v, changeT, delta};
}
const satFor = v => v <= 0 ? 0 : clamp(v / 100);

// ---------- poses with smooth transitions and idle overlays ----------
function poseAt(a, t) {
  const list = a.pose || [[0, 'rest']];
  let cur = list[0], prev = list[0];
  for (let i = 0; i < list.length; i++) if (t >= list[i][0]) { prev = list[i - 1] || list[i]; cur = list[i]; }
  const k = ease((t - cur[0]) / 0.22);
  const P = x => typeof x === 'object' ? x : POSES[x] || POSES.rest, A = P(prev[1]), B = P(cur[1]);
  const mixArm = s => [lerp(A[s][0], B[s][0], k), lerp(A[s][1], B[s][1], k)];
  const p = {L: mixArm('L'), R: mixArm('R')};
  const ph = hash(a.id) * 6.28;
  if (cur[1] === 'wave') p.R[1] += Math.sin(t * 9 + ph) * 20;
  if (cur[1] === 'waveL') p.L[1] += Math.sin(t * 9 + ph) * 20;
  if (cur[1] === 'knock') p.R[1] += Math.max(0, Math.sin(t * 13)) * 35;
  if (cur[1] === 'cheer') { p.L[0] += Math.sin(t * 8 + ph) * 8; p.R[0] += Math.sin(t * 8 + ph + 1) * 8; }
  if (cur[1] === 'water') p.R[0] += Math.sin(t * 2) * 6;
  if (cur[1] === 'rock') { p.L[0] += Math.sin(t * 5) * 9; p.R[0] -= Math.sin(t * 5) * 9; }
  if (cur[1] === 'rest' || cur[1] === 'sad') { p.L[0] += Math.sin(t * 1.3 + ph) * 2; p.R[0] += Math.sin(t * 1.3 + ph + 2) * 2; }
  return p;
}
function talkAt(a, t) {
  for (const [t0, t1] of a.talk || []) if (t >= t0 && t < t1) { const x = Math.sin((t - t0) * 2 * Math.PI * 4.2) * 0.5 + 0.5; return 0.25 + 0.75 * x * (0.7 + 0.3 * Math.sin(t * 23)); }
  return 0;
}
function blinkAt(a, t) {
  const period = 2.6 + hash(a.id + 'b') * 1.6, off = hash(a.id) * period, q = ((t + off) % period);
  return q < 0.13 ? Math.sin(q / 0.13 * Math.PI) : 0;
}

// ---------- painter ----------
export function painter(tl) {
  const W = tl.W, H = tl.H, SS = 1.5;
  const out = createCanvas(W, H), o = out.getContext('2d');
  const world = createCanvas(W, H), w = world.getContext('2d');
  const plates = new Map();
  function plate(set, args) {
    const key = set + JSON.stringify(args || {});
    if (!plates.has(key)) {
      const c = createCanvas(W * SS, H * SS), x = c.getContext('2d'); x.scale(SS, SS); SETS[set](args || {})(x);
      plates.set(key, c);
      if (plates.size > 24) plates.delete(plates.keys().next().value);
    }
    return plates.get(key);
  }
  const shots = tl.shots;
  function cameraAt(shot, t) {
    const dt = t - shot.start, span = shot.end - shot.start, k = clamp(dt / span);
    const c0 = shot.cam?.from || {z: 1, x: 540, y: 960}, c1 = shot.cam?.to || c0;
    let z = lerp(c0.z, c1.z, k), x = lerp(c0.x, c1.x, k), y = lerp(c0.y, c1.y, k);
    if (shot.cam?.keys) { z = keyAt(shot.cam.keys, t, 'z', 1); x = keyAt(shot.cam.keys, t, 'x', 540); y = keyAt(shot.cam.keys, t, 'y', 960); }
    const enter = shot.enter ?? 'pull', e = easeOut(dt / 0.3);
    if (enter === 'pull') z *= lerp(1.32, 1, e);
    if (enter === 'whipL') x += lerp(-320, 0, e) / z;
    if (enter === 'whipR') x += lerp(320, 0, e) / z;
    if (enter === 'drop') y += lerp(-260, 0, e) / z;
    for (const p of shot.punch || []) { const q = (t - p.t) / (p.d || 0.35); if (q >= 0 && q < 1) z *= 1 + (p.z || 0.08) * Math.sin(q * Math.PI) * (1 - q * 0.3); }
    if (shot.shake) { const s = shot.shake; if (t >= s.t && t < s.t + s.d) { x += Math.sin(t * 61) * 9; y += Math.cos(t * 47) * 7; } }
    z = Math.max(1, z); // never show past the 1080×1920 set
    x = clamp(x, 540 / z, 1080 - 540 / z); y = clamp(y, 960 / z, 1920 - 960 / z);
    return {z, x, y};
  }
  function drawActor(a, t, shot) {
    const spec = tl.cast[a.char || a.id];
    if (!spec) throw new Error(`No cast entry for actor ${a.id} (char ${a.char})`);
    const x = keyAt(a.keys, t, 'x', a.x), y = keyAt(a.keys, t, 'y', a.y);
    let s = keyAt(a.keys, t, 's', a.s || 7);
    if (tl.counter?.size) { const LG = a.ledger !== false ? tl.ledgers[a.ledger || a.id] : null; if (LG) s *= clamp(ledgerAt(LG, t).v / (a.natural || LG[0].v), 0.22, 1.4); } // the rule changes your height
    const L = a.ledger !== false ? tl.ledgers[a.ledger || a.id] : null;
    const led = L ? ledgerAt(L, t) : null;
    const sat = a.sat ?? (led && tl.counter?.sat !== false ? satFor(led.v) : 1);
    const walkSeg = (a.walk || []).find(([t0, t1]) => t >= t0 && t < t1);
    const walk = walkSeg ? (t - walkSeg[0]) * (walkSeg[2] || 9) : null;
    const st = {
      pose: poseAt(a, t), expr: stepAt(a.expr, t, a.exprDefault || 'neutral'), talk: talkAt(a, t), blink: blinkAt(a, t),
      gaze: stepAt(a.gaze, t, tl.counter?.pack && led?.v >= 25 && a.bend !== 0 ? [0, 0.7] : [0, 0]), tilt: stepAt(a.tilt, t, 0) + Math.sin(t * 1.1 + hash(a.id) * 9) * 1.2 + (a.sway ? Math.sin(t * a.sway[0]) * a.sway[1] : 0),
      marks: tl.counter?.hands && led && a.marks !== false ? led.v : 0, gloves: stepAt(a.gloves, t, false), gloveColor: a.gloveColor,
      walk, bob: walk != null ? -Math.abs(Math.sin(walk)) * 1.4 : a.hop ? -Math.abs(Math.sin(t * a.hop)) * 3 : Math.sin(t * 2.4 + hash(a.id) * 9) * 0.35,
    };
    const alpha = keyAt(a.keys, t, 'alpha', a.alpha ?? 1); if (alpha <= 0.001) { a._xy = null; return; }
    w.save(); w.globalAlpha = alpha; w.translate(x, y); w.scale(s * (a.flip ? -1 : 1), s);
    // a sack of the rule's stones on the back (tl.counter.pack): grows with the count; the carrier stoops
    const packV = tl.counter?.pack && led && a.pack !== false && spec.kind !== 'baby' ? Math.max(0, led.v) : 0;
    const bend = a.bend ?? Math.min(1, packV / 40);
    if (bend > 0.01) w.scale(1, 1 - 0.1 * bend);
    if (packV > 0) { // a burlap sack on the back: wider than the body when heavy, stones showing at the open neck
      const M = bodyMetrics(spec), r = 5 + 2.9 * Math.sqrt(packV), rx = r * 1.15, ry = r * 1.0, cy = M.neckY + 16;
      const sack = new Path2D();
      sack.moveTo(-rx * 0.45, cy - ry * 0.95); sack.quadraticCurveTo(-rx * 1.05, cy - ry * 0.7, -rx, cy + ry * 0.1);
      sack.quadraticCurveTo(-rx * 0.95, cy + ry * 1.0, 0, cy + ry * 1.0); sack.quadraticCurveTo(rx * 0.95, cy + ry * 1.0, rx, cy + ry * 0.1);
      sack.quadraticCurveTo(rx * 1.05, cy - ry * 0.7, rx * 0.45, cy - ry * 0.95); sack.closePath();
      w.fillStyle = '#a5845a'; w.fill(sack); w.lineWidth = 0.9; w.strokeStyle = INK; w.stroke(sack);
      w.strokeStyle = 'rgba(60,40,20,.35)'; w.lineWidth = 0.5; for (let k = -2; k <= 2; k++) { w.beginPath(); w.moveTo(k * rx * 0.3, cy - ry * 0.6); w.quadraticCurveTo(k * rx * 0.36, cy, k * rx * 0.3, cy + ry * 0.8); w.stroke(); }
      const n = Math.min(9, 2 + Math.ceil(packV / 6));
      for (let k = 0; k < n; k++) { const q = n === 1 ? 0.5 : k / (n - 1), sx = (q - 0.5) * rx * 1.25, sy = cy - ry * 0.92 - Math.sin(q * Math.PI) * r * 0.25 - (k % 2) * 1.6, sr = 2.2 + Math.min(2.4, r * 0.09);
        const st = new Path2D(); st.ellipse(sx, sy, sr * 1.25, sr, (k - n / 2) * 0.3, 0, Math.PI * 2); w.fillStyle = k % 2 ? '#9a9da4' : '#868990'; w.fill(st); w.lineWidth = 0.6; w.strokeStyle = INK; w.stroke(st); }
    }
    if (sat < 0.995) w.filter = `saturate(${sat.toFixed(3)}) brightness(${(0.9 + 0.1 * sat).toFixed(3)})`;
    let top;
    if (spec.kind === 'baby') { top = drawBaby(w, spec, st).headTop; }
    else {
      const r = drawCharacter(w, spec, {...st, armsFront: !!a.armsFront});
      top = r.headTop;
      a._arms = r; // arms drawn later when armsFront (over a hug partner)
    }
    w.filter = 'none'; w.restore();
    a._alpha = alpha; a._top = [x, y + top * s]; a._headR = spec.kind === 'baby' ? 11 : bodyMetrics(spec).head; a._head = [x, y + (spec.kind === 'baby' ? -4 : bodyMetrics(spec).headY) * s]; a._s = s; a._sat = sat; a._led = led; a._xy = [x, y]; a._st = st; a._spec = spec;
  }
  function drawFrontArms(a) {
    if (!a.armsFront || !a._arms) return;
    w.save(); w.translate(...a._xy); w.scale(a._s * (a.flip ? -1 : 1), a._s);
    if (a._sat < 0.995) w.filter = `saturate(${a._sat.toFixed(3)}) brightness(${(0.9 + 0.1 * a._sat).toFixed(3)})`;
    w.translate(0, a._st.bob || 0);
    a._arms.arms.forEach(a._arms.drawArm);
    w.filter = 'none'; w.restore();
  }
  // Overlays are placed in SCREEN space (after the camera), so they never cover the top caption band or leave the frame.
  const SAFE_TOP = 400, SAFE_X = 24;
  const toScreen = (cam, [x, y]) => [(x - cam.x) * cam.z + W / 2, (y - cam.y) * cam.z + H / 2];
  function counter(a, t, cam, placed) {
    if (!a._led || a.counter === false || t < (a.counterT0 ?? -1)) return;
    const {v, changeT, delta} = a._led;
    const cs = clamp((a.counterScale || 1) * Math.max(0.8, Math.min(1.25, a._s / 7)) * Math.sqrt(cam.z), 0.75, 1.6);
    const pw = 236, ph = 84, hw = pw / 2 * cs, hh = ph / 2 * cs;
    const [hx, hy] = toScreen(cam, a._top), [, hc] = toScreen(cam, a._head);
    if (hx < -60 || hx > W + 60 || hc < -100 || hc > H + 60) return; // only characters in frame carry a counter
    const r = (a._headR || 15) * a._s * cam.z;
    let cx = hx + (a.counterDx || 0) * cam.z, cy = hy - (a.counterGap ?? 0) * cam.z - hh - 14;
    if (cy - hh < SAFE_TOP) { // no room above the head
      const right = hx + r + 24 + 2 * hw < W - SAFE_X, left = hx - r - 24 - 2 * hw > SAFE_X;
      if (right || left) { cx = hx + (right ? r + 24 + hw : -(r + 24 + hw)); cy = Math.max(SAFE_TOP + hh, hc - r * 0.2); }
      else { cx = hx; cy = hc + r * 1.25 + hh; } // under the chin
    }
    if (a.counterAt) [cx, cy] = a.counterAt; // close-ups: a fixed screen spot so the plate never covers the hands
    cx = clamp(cx, SAFE_X + hw, W - SAFE_X - hw); cy = clamp(cy, SAFE_TOP + hh, H - 120 - hh);
    for (let pass = 0; pass < 3; pass++) for (const q of placed) {
      if (Math.abs(q[0] - cx) < q[2] + hw + 8 && Math.abs(q[1] - cy) < q[3] + hh + 8) {
        const dx = q[2] + hw + 12, toRight = cx >= q[0] ? q[0] + dx : q[0] - dx;
        if (toRight - hw >= SAFE_X && toRight + hw <= W - SAFE_X) cx = toRight; else cy = q[1] - q[3] - hh - 12 < SAFE_TOP + hh ? q[1] + q[3] + hh + 12 : q[1] - q[3] - hh - 12;
      }
    }
    placed.push([cx, cy, hw, hh]);
    const pop = t - changeT < 0.28 ? 1 + 0.28 * Math.sin(clamp((t - changeT) / 0.28) * Math.PI) : 1;
    o.save(); o.globalAlpha = a._alpha ?? 1; o.translate(cx, cy); o.scale(cs * pop, cs * pop);
    const plate = new Path2D(); plate.roundRect(-pw / 2, -ph / 2, pw, ph, 18);
    o.fillStyle = 'rgba(0,0,0,.25)'; o.translate(0, 6); o.fill(plate); o.translate(0, -6);
    const C = tl.counter || {};
    o.fillStyle = C.plate || '#1b1d24'; o.fill(plate); o.lineWidth = 5; o.strokeStyle = INK; o.stroke(plate);
    if (C.border) { o.lineWidth = 3; o.strokeStyle = C.border; const inner = new Path2D(); inner.roundRect(-pw / 2 + 6, -ph / 2 + 6, pw - 12, ph - 12, 13); o.stroke(inner); }
    if (!C.label) {
      o.save(); o.clip(plate);
      const rb = ['#e84a5f', '#ff8c2f', '#f5c518', '#3db37a', '#3f7fd6', '#8e5bd6'], sat = clamp(v / 100);
      rb.forEach((c, i) => { o.fillStyle = c; o.globalAlpha = 0.2 + 0.8 * sat; o.fillRect(-pw / 2 + i * 7, -ph / 2, 7, ph); });
      o.globalAlpha = 1; o.restore();
    }
    o.fillStyle = C.labelColor || '#9aa3b2'; o.font = C.label ? `30px ${C.font || 'GraceCaption'}` : '22px R1Caption'; o.textBaseline = 'middle'; o.fillText(C.label || 'CORES', -pw / 2 + (C.label ? 26 : 52), 1);
    const col = C.color ? C.color(v) : v < 0 ? '#ff2e4d' : v < 20 ? '#ff4d4d' : v < 50 ? '#ffd23f' : '#47f08a';
    o.font = '64px R1Digits'; o.textAlign = 'right';
    if (a.glitch && t >= a.glitch[0] && t < a.glitch[1]) {
      const j = Math.sin(t * 90) * 7; o.globalAlpha = 0.75; o.fillStyle = '#33ffff'; o.fillText(String(v), pw / 2 - 18 + j, 2); o.fillStyle = '#ff33ff'; o.fillText(String(v), pw / 2 - 18 - j, 2); o.globalAlpha = 1;
    }
    o.fillStyle = col; o.shadowColor = col; o.shadowBlur = 14; o.fillText(String(v), pw / 2 - 18, 3); o.shadowBlur = 0; o.textAlign = 'left';
    o.restore();
    const q = (t - changeT) / 0.95;
    if (delta && q >= 0 && q < 1 && !a.noDelta) {
      o.save(); o.globalAlpha = 1 - q * q; o.translate(cx + hw * 0.55, Math.max(SAFE_TOP - 20, cy - hh - 18 * cs - q * 70 * cs)); o.scale(cs, cs);
      o.font = `60px ${tl.captionFont || 'R1Caption'}`; o.textAlign = 'center'; o.lineWidth = 10; o.strokeStyle = INK; o.lineJoin = 'round';
      const txt = (delta > 0 ? '+' : '') + delta, good = (tl.counter?.bad === 'up') ? delta < 0 : delta > 0;
      o.strokeText(txt, 0, 0); o.fillStyle = good ? (tl.counter?.goodColor || '#ffd23f') : (tl.counter?.badColor || '#ff4d4d'); o.fillText(txt, 0, 0);
      o.restore();
    }
  }
  function bubble(b, t, actors, cam, placed) {
    if (t < b.t0 || t >= b.t1) return;
    const a = actors.find(x => x.id === b.actor); if (!a || !a._head) return;
    const k = easeOut((t - b.t0) / 0.16);
    const size = b.size || 50;
    o.font = `${size}px ${tl.captionFont || 'R1Caption'}`;
    const lines = b.text.split('\n'), tw = Math.max(...lines.map(l => o.measureText(l).width)), lh = size * 1.12;
    const bw = tw + 60, bh = lines.length * lh + 34;
    const [mx, my] = toScreen(cam, [a._head[0], a._head[1] + (a._headR || 15) * a._s * 0.45]);
    const r = (a._headR || 15) * a._s * cam.z;
    let side = b.side || 'right';
    if (side === 'right' && mx + r + 40 + bw > W - SAFE_X) side = 'left';
    if (side === 'left' && mx - r - 40 - bw < SAFE_X) side = 'right';
    let bx = side === 'above' ? mx - bw / 2 : side === 'right' ? mx + r * 0.9 + 30 : mx - r * 0.9 - 30 - bw, by = side === 'above' ? my - r * 2.3 - bh : my - r * 1.3 - bh;
    bx = clamp(bx + (b.dx || 0), SAFE_X, W - SAFE_X - bw); by = clamp(by + (b.dy || 0), SAFE_TOP - 10, H - 200 - bh);
    for (const rc of placed) if (bx < rc[0] + rc[2] && bx + bw > rc[0] - rc[2] && by < rc[1] + rc[3] && by + bh > rc[1] - rc[3]) by = Math.min(H - 200 - bh, rc[1] + rc[3] + 12);
    o.save(); o.translate(mx, my); o.scale(k, k); o.translate(-mx, -my);
    const p = new Path2D(); p.roundRect(bx, by, bw, bh, 26);
    const tail = new Path2D(); const tx = clamp(mx, bx + 40, bx + bw - 40); tail.moveTo(tx - 22, by + bh - 4); tail.lineTo(tx + 22, by + bh - 4); tail.lineTo(mx + (side === 'right' ? r * 0.5 : -r * 0.5), my - r * 0.25); tail.closePath();
    o.lineWidth = 10; o.strokeStyle = INK; o.lineJoin = 'round'; o.stroke(p); o.stroke(tail);
    o.fillStyle = b.fill || '#ffffff'; o.fill(p); o.fill(tail);
    o.fillStyle = INK; o.textAlign = 'center'; o.textBaseline = 'middle';
    lines.forEach((l, i) => o.fillText(l, bx + bw / 2, by + 17 + lh * (i + 0.5)));
    o.textAlign = 'left'; o.restore();
  }
  function particles(f, t, actors) {
    if (t < f.t0 || t >= f.t1 + 1.2) return;
    const find = id => actors.find(x => x.id === id);
    if (f.type === 'flow') { // rainbow color dots travel from one actor's chest to another's
      const A = find(f.from), B = find(f.to); if (!A?._xy || !B?._xy) return;
      const pa = [A._xy[0], A._xy[1] - 55 * A._s], pb = [B._xy[0], B._xy[1] - 60 * B._s];
      const cols = ['#ff4d6d', '#ff9f1c', '#ffd23f', '#3ddc84', '#3fa7ff', '#a66cff'];
      for (let i = 0; i < (f.n || 26); i++) {
        const t0 = f.t0 + (i / (f.n || 26)) * (f.t1 - f.t0), q = (t - t0) / 0.9; if (q < 0 || q > 1) continue;
        const arc = Math.sin(q * Math.PI) * (f.arc ?? 160), x = lerp(pa[0], pb[0], easeOut(q)) + Math.sin(i * 7) * 20, y = lerp(pa[1], pb[1], easeOut(q)) - arc;
        w.fillStyle = cols[i % 6]; w.globalAlpha = 1 - q * 0.4; w.beginPath(); w.arc(x, y, 13 * (1 - q * 0.5), 0, 7); w.fill();
        w.lineWidth = 3; w.strokeStyle = INK; w.stroke();
      }
      w.globalAlpha = 1;
    }
    if (f.type === 'hearts' || f.type === 'notes' || f.type === 'sparkle' || f.type === 'drain') {
      const A = f.actor ? find(f.actor) : null, base = A?._xy ? [A._xy[0], A._xy[1] - (f.h || 110) * A._s] : [f.x, f.y];
      const n = f.n || 7;
      for (let i = 0; i < n; i++) {
        const t0 = f.t0 + i * (f.t1 - f.t0) / n, q = (t - t0) / 1.2; if (q < 0 || q > 1) continue;
        const dx = (hash(i + f.type) - 0.5) * 260, x = base[0] + dx + Math.sin(q * 6 + i) * 18;
        const y = f.type === 'drain' ? base[1] + 40 + q * 220 : base[1] - q * 220;
        w.save(); w.translate(x, y); w.globalAlpha = 1 - q; const sc = 1.2 + hash(i) * 0.6; w.scale(sc, sc);
        if (f.type === 'hearts') PROPS.heart(w);
        else if (f.type === 'notes') PROPS.note(w);
        else if (f.type === 'drain') { w.fillStyle = f.color || '#8d9097'; w.beginPath(); w.arc(0, 0, f.r || 10, 0, 7); w.fill(); }
        else { w.fillStyle = ['#ffd23f', '#ffffff', '#ff9f1c'][i % 3]; const st = new Path2D(); for (let k = 0; k < 8; k++) { const r = k % 2 ? 6 : 18, a = k * Math.PI / 4; st.lineTo(Math.cos(a) * r, Math.sin(a) * r); } st.closePath(); w.fill(st); }
        w.restore();
      }
    }
    if (f.type === 'stoneDrop') { // a stone falls into the actor's sack (rule: a grudge becomes a stone)
      const A = find(f.actor), q = (t - f.t0) / 0.38; if (!A?._xy || q < 0 || q > 1.3) return;
      const top = A._head[1] - (A._headR || 15) * A._s * 2.2, y = lerp(top - 420, A._head[1] + 10 * A._s, Math.min(1, q * q));
      w.save(); w.translate(A._xy[0] + (f.dx || 0), y); w.rotate(q * 3); w.fillStyle = '#8c8f96'; w.beginPath(); w.ellipse(0, 0, 34, 26, 0, 0, 7); w.fill(); w.lineWidth = 5; w.strokeStyle = INK; w.stroke(); w.restore();
    }
    if (f.type === 'rain' && t < f.t1) {
      w.strokeStyle = 'rgba(190,210,255,.55)'; w.lineWidth = 4;
      for (let i = 0; i < 90; i++) { const x = (hash(i) * 1300 + t * 160) % 1200 - 60, y = (hash(i + 'y') * 2100 + t * 1500) % 2100 - 100; w.beginPath(); w.moveTo(x, y); w.lineTo(x - 14, y + 60); w.stroke(); }
    }
  }
  function captions(t) {
    if ((tl.captionsOff || []).some(([a, b]) => t >= a && t < b)) return;
    const G = tl.captionGroups; const g = G.find(g => t >= g.start && t < g.end); if (!g) return;
    const shown = g.words.filter(x => t >= x.s - 0.02);
    if (!shown.length) return;
    o.font = `${tl.captionSize || 112}px ${tl.captionFont || 'R1Caption'}`; o.textBaseline = 'alphabetic';
    const space = 26, widths = shown.map(x => o.measureText(x.text).width), total = widths.reduce((a, b) => a + b, 0) + space * (shown.length - 1);
    const sc = Math.min(1, 1000 / total); o.save(); o.translate(W / 2, tl.captionY || 268); o.scale(sc, sc);
    let x = -total / 2;
    shown.forEach((wd, i) => {
      const age = t - wd.s;
      o.save(); o.globalAlpha = clamp(0.35 + age / 0.08); o.translate(x + widths[i] / 2, 0);
      o.lineJoin = 'round'; o.textAlign = 'center';
      o.fillStyle = 'rgba(0,0,0,.35)'; o.fillText(wd.text, 4, 8);
      o.lineWidth = 16; o.strokeStyle = '#141414'; o.strokeText(wd.text, 0, 0);
      o.fillStyle = wd.color || '#ffffff'; o.fillText(wd.text, 0, 0);
      o.restore(); x += widths[i] + space;
    });
    o.restore();
  }
  function titles(shot, t) {
    for (const ti of shot.titles || []) {
      if (t < ti.t0 || t >= ti.t1) continue;
      const k = easeOut((t - ti.t0) / 0.2);
      o.save(); o.translate(ti.x ?? W / 2, ti.y ?? 1500); o.scale(lerp(1.4, 1, k), lerp(1.4, 1, k)); o.globalAlpha = k;
      const size = ti.size || 92, lines = ti.text.split('\n'), lh = size * (ti.lh || 1.18);
      o.font = `${size}px ${ti.font || tl.captionFont || 'R1Caption'}`; o.textAlign = 'center'; o.lineJoin = 'round'; o.textBaseline = 'middle';
      if (ti.card) { const tw = Math.max(...lines.map(l => o.measureText(l).width)) + 110, th = lines.length * lh + 90, c = new Path2D(); c.roundRect(-tw / 2, -th / 2, tw, th, 28);
        o.fillStyle = 'rgba(60,30,10,.25)'; o.translate(0, 10); o.fill(c); o.translate(0, -10); o.fillStyle = ti.card; o.fill(c); o.lineWidth = 6; o.strokeStyle = '#2a211e'; o.stroke(c); }
      lines.forEach((l, i) => { const y = (i - (lines.length - 1) / 2) * lh;
        if (ti.stroke !== 0) { o.lineWidth = ti.stroke || 14; o.strokeStyle = '#141414'; o.strokeText(l, 0, y); }
        o.fillStyle = ti.color || '#ffd23f'; o.fillText(l, 0, y); });
      o.textBaseline = 'alphabetic'; o.restore();
    }
  }
  return function frame(t) {
    const i = shots.findIndex(s => t >= s.start && t < s.end), shot = shots[i >= 0 ? i : shots.length - 1];
    const cam = cameraAt(shot, t);
    w.resetTransform(); w.filter = 'none'; w.fillStyle = '#000'; w.fillRect(0, 0, W, H);
    w.save(); w.translate(W / 2, H / 2); w.scale(cam.z, cam.z); w.translate(-cam.x, -cam.y);
    w.drawImage(plate(shot.set, typeof shot.setArgs === 'function' ? shot.setArgs(t) : shot.setArgs), 0, 0, W, H);
    const actors = shot.actors || [];
    const drawProps = layer => { for (const p of shot.props || []) {
      if ((p.after ? 'after:' + p.after : p.layer || 'back') !== layer || t < (p.t0 ?? -1) || t >= (p.t1 ?? 1e9)) continue;
      w.save(); w.translate(keyAt(p.keys, t, 'x', p.x), keyAt(p.keys, t, 'y', p.y)); const sc = keyAt(p.keys, t, 's', p.s || 1); w.scale(sc, sc);
      w.rotate(keyAt(p.keys, t, 'r', p.r || 0)); PROPS[p.type](w, typeof p.args === 'function' ? p.args(t) : p.args || {}); w.restore();
    } };
    drawProps('back');
    for (const a of actors) {
      if (t >= (a.t0 ?? -1) && t < (a.t1 ?? 1e9)) drawActor(a, t, shot); else a._xy = null;
      drawProps('after:' + a.id);
    }
    for (const a of actors) if (a._xy) drawFrontArms(a);
    drawProps('front');
    for (const fg of shot.fg || []) w.drawImage(plate(fg.set, fg.args), 0, 0, W, H);
    for (const f of shot.fx || []) particles(f, t, actors);
    w.restore();
    // compose with the shot-entrance blur and grade
    const fr = Math.round((t - shot.start) * tl.fps);
    o.resetTransform(); o.filter = 'none';
    const blur = shot.enter === 'none' ? 0 : [18, 9, 3][fr] || 0;
    const grade = shot.grade || '';
    o.filter = (blur ? `blur(${blur}px) ` : '') + grade || 'none';
    o.drawImage(world, 0, 0);
    o.filter = 'none';
    if (shot.vignette) { const g = o.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(20,10,0,${shot.vignette})`); o.fillStyle = g; o.fillRect(0, 0, W, H); }
    if (shot.tint) { o.fillStyle = shot.tint; o.fillRect(0, 0, W, H); }
    if (tl.look?.tint) { o.fillStyle = tl.look.tint; o.fillRect(0, 0, W, H); }
    if (tl.look?.vignette) { const g = o.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.8); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(60,25,5,${tl.look.vignette})`); o.fillStyle = g; o.fillRect(0, 0, W, H); }
    if (shot.flash) { const q = (t - shot.flash) / 0.25; if (q >= 0 && q < 1) { o.fillStyle = `rgba(255,255,255,${(1 - q) * 0.85})`; o.fillRect(0, 0, W, H); } }
    const placed = [];
    const hidden = (shot.hideCounters || []).some(([a, b]) => t >= a && t < b);
    if (!hidden) for (const a of actors) if (a._xy) counter(a, t, cam, placed);
    for (const pc of shot.plates || []) if (t >= pc.t0 && t < (pc.t1 ?? 1e9)) counter({_led: {v: pc.v, changeT: -9, delta: 0}, _top: [pc.x, pc.y], _head: [pc.x, pc.y + 40], _s: 7, counterScale: pc.scale || 1}, t, cam, placed);
    for (const b of shot.bubbles || []) bubble(b, t, actors, cam, placed);
    titles(shot, t);
    captions(t);
    return out;
  };
}

// ---------- captions: accumulate up to 3 words, break on punctuation/pauses ----------
export function captionGroups(words, keywords = {}, {max = 3, gap = 0.32} = {}) {
  const groups = []; let cur = null;
  const clean = s => s.replace(/["“”«»]/g, '').replace(/[.,:;!?…]+$/g, '').replace(/^[.,:;!?…]+/g, '').toUpperCase();
  words.forEach((wd, i) => {
    const text = clean(wd.w); if (!text) return;
    const prev = words[i - 1];
    if (!cur || cur.words.length >= max || (prev && (/[.,:;!?…"]$/.test(prev.w) || wd.s - prev.e > gap))) { cur = {words: []}; groups.push(cur); }
    const key = text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    cur.words.push({text, s: wd.s, e: wd.e, color: keywords[key]});
  });
  groups.forEach((g, i) => { g.start = g.words[0].s - 0.04; g.end = i + 1 < groups.length ? groups[i + 1].words[0].s - 0.04 : g.words.at(-1).e + 0.6; });
  return groups;
}

// ---------- encode ----------
async function encode(tl, frame, a, b, target) {
  const child = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pixel_format', 'rgba', '-video_size', `${tl.W}x${tl.H}`, '-framerate', String(tl.fps), '-i', 'pipe:0',
    '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-g', String(tl.fps * 2), target], {stdio: ['pipe', 'ignore', 'inherit']});
  const done = new Promise((res, rej) => child.on('close', c => c === 0 ? res() : rej(new Error('ffmpeg ' + c))));
  for (let f = a; f < b; f++) { const buf = frame(f / tl.fps).data(); if (!child.stdin.write(buf)) await once(child.stdin, 'drain'); }
  child.stdin.end(); await done;
}

function mixAudio(tl, video, target) {
  const A = tl.audio, args = ['-v', 'error', '-y', '-i', video, '-i', A.voice];
  // voice-first mix: music, beds and effects form one bus that ducks under the narration (sidechain), then join the voice
  // voiceLevel: long TTS takes drift quieter (measured −19 → −39 dB over 95 s on eleven_multilingual_v2); a slow dynamic
  // normaliser (≈9 s window) levels the narration before the mix, and the levelled voice is what drives the ducking.
  const level = A.voiceLevel ? ',dynaudnorm=f=300:g=31:p=0.9:m=40:s=0,loudnorm=I=-18:TP=-3:LRA=7' : '';
  // apad: the voice is the mix's clock (amix duration=first) and the leveller eats its tail; pad so the mix covers the whole film
  const filters = [`[1:a]aresample=48000,aformat=channel_layouts=stereo,apad=pad_dur=8${level},volume=${A.voiceGain ?? 1},asplit=2[v][vkey]`], buses = [];
  let n = 2;
  if (A.music) {
    args.push('-stream_loop', '-1', '-i', A.music.path);
    filters.push(`[${n}:a]aresample=48000,aformat=channel_layouts=stereo,atrim=0:${tl.duration},volume=${A.music.gain},afade=t=in:d=0.4,afade=t=out:st=${tl.duration - 2.5}:d=2.5[m]`);
    buses.push('[m]'); n++;
  }
  for (const b of A.beds || []) {
    args.push('-stream_loop', '-1', '-i', b.path);
    filters.push(`[${n}:a]aresample=48000,aformat=channel_layouts=stereo,atrim=0:${b.end - b.start},asetpts=PTS-STARTPTS,volume=${b.gain},afade=t=in:d=${b.fade ?? 0.5},afade=t=out:st=${Math.max(0, b.end - b.start - (b.fade ?? 0.5))}:d=${b.fade ?? 0.5},adelay=${Math.round(b.start * 1000)}:all=1[b${n}]`);
    buses.push(`[b${n}]`); n++;
  }
  for (const s of A.sfx || []) {
    args.push('-i', s.path);
    const trim = s.dur ? `atrim=0:${s.dur},afade=t=out:st=${Math.max(0, s.dur - 0.15)}:d=0.15,` : '';
    filters.push(`[${n}:a]aresample=48000,aformat=channel_layouts=stereo,${trim}volume=${s.gain ?? 0.6},adelay=${Math.round(Math.max(0, s.t) * 1000)}:all=1[s${n}]`);
    buses.push(`[s${n}]`); n++;
  }
  const duck = A.duck ?? {threshold: 0.025, ratio: 5, attack: 12, release: 280};
  filters.push(`${buses.join('')}amix=inputs=${buses.length}:normalize=0[bg]`);
  filters.push(`[bg][vkey]sidechaincompress=threshold=${duck.threshold}:ratio=${duck.ratio}:attack=${duck.attack}:release=${duck.release}:makeup=1[bgd]`);
  filters.push(`[v][bgd]amix=inputs=2:normalize=0:duration=first,atrim=0:${tl.duration},loudnorm=I=${A.lufs ?? -14}:TP=-3:LRA=9,aresample=48000,alimiter=limit=0.7:level=false[a]`);
  args.push('-filter_complex', filters.join(';'), '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', '-t', String(tl.duration), target);
  const r = spawnSync('ffmpeg', args, {encoding: 'utf8', maxBuffer: 64 << 20});
  if (r.status !== 0) throw new Error(r.stderr.slice(-3000));
}

// ---------- CLI ----------
async function loadTimeline(file) {
  const mod = await import(pathToFileURL(path.resolve(file)).href);
  const tl = await mod.default();
  tl.captionGroups = captionGroups(tl.captions.words, tl.captions.keywords, tl.captions.opts);
  return tl;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const argv = process.argv.slice(2), opt = k => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; };
  const ep = argv[0], out = path.resolve(opt('--out') || 'render');
  fs.mkdirSync(out, {recursive: true});
  const tl = await loadTimeline(ep);
  const seconds = Number(opt('--seconds') || tl.duration), total = Math.ceil(Math.min(seconds, tl.duration) * tl.fps);
  if (opt('--remix')) { // audio only: re-mix onto an existing silent render (DIR/video-silent.mp4)
    mixAudio({...tl, duration: total / tl.fps}, path.join(out, 'video-silent.mp4'), path.join(out, opt('--name') || 'episodio.mp4'));
    console.log('remix ok');
  } else if (opt('--stills')) {
    const frame = painter(tl);
    for (const s of opt('--stills').split(',').map(Number)) fs.writeFileSync(path.join(out, `still-${s.toFixed(2)}.png`), frame(s).toBuffer('image/png'));
    console.log('stills ok');
  } else if (opt('--worker')) {
    const [a, b] = opt('--worker').split(':').map(Number);
    await encode(tl, painter(tl), a, b, path.join(out, `seg-${String(a).padStart(6, '0')}.mp4`));
  } else {
    const workers = Number(opt('--workers') || Math.max(2, os.cpus().length - 4)), per = Math.ceil(total / workers);
    for (const f of fs.readdirSync(out)) if (f.startsWith('seg-')) fs.unlinkSync(path.join(out, f));
    const t0 = Date.now();
    await Promise.all(Array.from({length: workers}, (_, k) => [k * per, Math.min(total, (k + 1) * per)]).filter(([a, b]) => b > a).map(([a, b]) => new Promise((res, rej) => {
      const c = spawn(process.execPath, [fileURLToPath(import.meta.url), ep, '--out', out, '--worker', `${a}:${b}`], {stdio: 'inherit'});
      c.on('close', code => code === 0 ? res() : rej(new Error('worker ' + code)));
    })));
    const segs = fs.readdirSync(out).filter(f => f.startsWith('seg-')).sort();
    fs.writeFileSync(path.join(out, 'segs.txt'), segs.map(f => `file '${f}'`).join('\n'));
    const silent = path.join(out, 'video-silent.mp4');
    const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(out, 'segs.txt'), '-c', 'copy', silent]);
    if (r.status !== 0) throw new Error(String(r.stderr));
    const final = path.join(out, opt('--name') || 'episodio.mp4');
    mixAudio({...tl, duration: total / tl.fps}, silent, final);
    for (const f of segs) fs.unlinkSync(path.join(out, f));
    console.log(JSON.stringify({final, seconds: total / tl.fps, render_s: Math.round((Date.now() - t0) / 1000)}));
  }
}
