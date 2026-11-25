// R1 · grace-remains ep15 "The Book": your name is written in a huge book in the town library, and every night you check it is still there.
// New places (library hall at night, library front at night, Leo's winter bedroom, snowy street) and props: the big open book (names by hand, page
// flips, the same embossed name on every page, side view with the groove through the whole block), a pointing finger/forearm, an exhale puff, a
// flashlight with a beam, a magnifier, a pencil behind an ear, a far queue of pajama figures, snow, a stone arcade pillar, the NIGHTS plate with a
// MISSED tag, a closed book, sleep Zs, knock rings. Registered into SETS/PROPS on import. NOTHING existing in the engine is edited.
// Gold appears ONLY in the groove of the last scene (the name pressed through every page).
import {Path2D} from '@napi-rs/canvas';
import {INK, mix, dark, light} from './r1-rig.mjs';
import {SETS, PROPS} from './r1-world.mjs';
import {fs, rr, el, poly, hashN, glow, olive, sky, windowPane, room, cobbles, easeOutBack, WARM, cottage} from './r1-world-grace.mjs';
import './r1-world-grace-ears.mjs';   // wallClockG, bookcaseG
import './r1-world-grace-bakery.mjs'; // gVerseMeadow
import './r1-world-grace-name.mjs';   // gnDoorNight

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const lerp = (a, b, k) => a + (b - a) * k;
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);

// ------------------------------------------------------------------ the big book
const NAMES = ['Mara', 'Tom', 'Elias', 'Nora', 'Ivan', 'Sofia', 'Hugo', 'Ada', 'Otto', 'Lena', 'Paul', 'Ruth', 'Anna', 'Joel', 'Mila', 'Karl', 'Eva', 'Luka', 'Iris', 'Noah', 'Rosa', 'Jonah', 'Petra', 'David', 'Clara', 'Sam', 'Vera', 'Oliver', 'Tess', 'Max', 'Uma', 'Ben', 'Lila', 'Gus', 'Zoe', 'Nico', 'Faye', 'Abel', 'June', 'Cal', 'Ines', 'Mateo'];
const PW = 470, PH = 680, ROWS = 9, RH = 66;
const rowY = i => -264 + i * RH;
const nameAt = (p, side, i) => NAMES[Math.floor(hashN(p * 31.7 + (side === 'R' ? 7.3 : 3.1) + i * 5.37) * NAMES.length)];
// one page, origin = its centre. o: {leo, leoRow, ticks, circle:{row,k}, side}
function pageG(ctx, side, p, o = {}) {
  ctx.save(); ctx.beginPath(); ctx.rect(-PW / 2, -PH / 2, PW, PH); ctx.clip();
  const g = ctx.createLinearGradient(side === 'L' ? PW / 2 : -PW / 2, 0, side === 'L' ? -PW / 2 : PW / 2, 0);
  g.addColorStop(0, '#e3cfa4'); g.addColorStop(0.16, '#f8ecd0'); g.addColorStop(1, '#fbf3df'); ctx.fillStyle = g; ctx.fillRect(-PW / 2, -PH / 2, PW, PH);
  ctx.strokeStyle = 'rgba(120,90,50,.16)'; ctx.lineWidth = 3; for (let i = 0; i < ROWS; i++) { ctx.beginPath(); ctx.moveTo(-PW / 2 + 28, rowY(i) + 14); ctx.lineTo(PW / 2 - 28, rowY(i) + 14); ctx.stroke(); }
  const leoRow = o.leoRow ?? 4;
  ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  for (let i = 0; i < ROWS; i++) {
    if (o.leo && side === 'R' && Math.abs(i - leoRow) <= 1) continue;
    const nm = (o.names && o.names[side + i]) || nameAt(p, side, i), jx = (hashN(p * 9.1 + i * 2.3 + (side === 'R' ? 1 : 0)) - 0.5) * 50;
    ctx.save(); ctx.translate(-PW / 2 + 74 + jx, rowY(i) + 6); ctx.rotate((hashN(p * 3.3 + i) - 0.5) * 0.05);
    ctx.font = `${o.size || 52}px GraceVerse`; ctx.fillStyle = 'rgba(48,32,24,.86)'; ctx.fillText(nm, 0, 0); ctx.restore();
  }
  const nt = o.ticks || 0;
  for (let i = 0; i < ROWS; i++) { const k = clamp(nt - i); if (k <= 0) continue; ctx.save(); ctx.translate(-PW / 2 + 44, rowY(i) - 8); ctx.strokeStyle = '#5f7339'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(-4, 14 * k); ctx.lineTo(18 * k, -16 * k); ctx.stroke(); ctx.restore(); }
  if (o.leo && side === 'R') { // the name pressed into the paper: dent + light edge + shade + ink, the same place on every page
    const y = rowY(leoRow), sz = o.leoSize || 150; ctx.font = `${sz}px GraceVerse`; ctx.textAlign = 'center';
    const tw = ctx.measureText('Leo').width;
    const dg = ctx.createRadialGradient(0, y - sz * 0.3, 10, 0, y - sz * 0.3, tw * 0.75); dg.addColorStop(0, 'rgba(110,80,40,.26)'); dg.addColorStop(1, 'rgba(110,80,40,0)'); ctx.fillStyle = dg; ctx.fillRect(-PW / 2, y - sz * 1.2, PW, sz * 1.6);
    ctx.fillStyle = 'rgba(255,252,240,.95)'; ctx.fillText('Leo', 4, y + 4); ctx.fillStyle = 'rgba(140,112,70,.85)'; ctx.fillText('Leo', -3, y - 3);
    ctx.fillStyle = '#2a1a12'; ctx.fillText('Leo', 0, y); ctx.lineWidth = 3; ctx.strokeStyle = '#2a1a12'; ctx.strokeText('Leo', 0, y);
    if (o.mark) { ctx.strokeStyle = `rgba(196,100,58,${0.9 * clamp(o.mark)})`; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-tw / 2 - 6, y + 28); ctx.quadraticCurveTo(0, y + 40, tw / 2 + 6, y + 24); ctx.stroke(); }
  }
  if (o.circle && o.circle.k > 0) { // a hand-drawn loop round a name
    const row = o.circle.row, nm = (o.names && o.names[side + row]) || nameAt(p, side, row), jx = (hashN(p * 9.1 + row * 2.3 + (side === 'R' ? 1 : 0)) - 0.5) * 50;
    ctx.font = `${o.size || 52}px GraceVerse`; const tw = ctx.measureText(nm).width, cx = -PW / 2 + 74 + jx + tw / 2, cy = rowY(row) - 12;
    ctx.strokeStyle = '#c4643a'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath();
    const n = Math.floor(60 * clamp(o.circle.k)); for (let i = 0; i <= n; i++) { const a = -2.2 + i / 60 * 7.2, r = 1 + 0.06 * Math.sin(i * 0.2); const x = cx + Math.cos(a) * (tw / 2 + 40) * r, y = cy + Math.sin(a) * 52 * r; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
  }
  ctx.restore();
}
// the open book, origin = centre. {k scale, p spread index, flip 0..1 (turning from spread p to p+1), leo, ticks:[left,right], circle:{side,row,k}, mark}
function bigBookG(ctx, {k = 1, p = 0, flip = 0, leo = true, leoRow = 4, ticks = [0, 0], circle = null, mark = 0, leoSize = 150, size = 52, shadow = true, names = null} = {}) {
  ctx.save(); ctx.scale(k, k); ctx.lineJoin = 'round';
  if (shadow) { ctx.fillStyle = 'rgba(30,10,30,.22)'; ctx.fill(el(0, 396, 560, 46)); }
  fs(ctx, rr(-526, -366, 1052, 748, 30), '#6a2f36', 9);
  ctx.fillStyle = 'rgba(255,200,160,.10)'; ctx.fill(rr(-516, -358, 1032, 120, 24));
  fs(ctx, rr(-500, -348, 1000, 724, 12), '#efe0bd', 6);
  ctx.strokeStyle = 'rgba(80,50,20,.55)'; ctx.lineWidth = 2.5; for (let i = 1; i <= 6; i++) { ctx.beginPath(); ctx.moveTo(-496 + i * 2, 346 + i * 4); ctx.lineTo(-24, 346 + i * 4); ctx.moveTo(24, 346 + i * 4); ctx.lineTo(496 - i * 2, 346 + i * 4); ctx.stroke(); }
  const opt = side => ({leo, leoRow, ticks: ticks[side === 'L' ? 0 : 1], circle: circle && circle.side === side ? circle : null, mark, leoSize, size, names});
  ctx.save(); ctx.translate(-255, 0); pageG(ctx, 'L', p * 2, opt('L')); ctx.restore();
  ctx.save(); ctx.translate(255, 0); pageG(ctx, 'R', flip > 0 ? (p + 1) * 2 + 1 : p * 2 + 1, opt('R')); ctx.restore();
  if (flip > 0 && flip < 1) { // the leaf: front = right page p, back = left page p+1
    const a = flip * Math.PI, c = Math.cos(a), xe = 490 * c, lift = Math.sin(a) * 58;
    const leaf = poly([[0, -340], [xe * 0.5, -340 - lift * 0.55], [xe, -340 - lift], [xe, 340 - lift * 0.25], [xe * 0.5, 340 - lift * 0.1], [0, 340]]);
    ctx.save(); ctx.fillStyle = '#f6ead0'; ctx.fill(leaf); ctx.clip(leaf);
    ctx.save(); ctx.translate(0, -lift * 0.35);
    if (flip < 0.5) { ctx.scale(Math.max(0.02, Math.abs(c)), 1); ctx.translate(255, 0); pageG(ctx, 'R', p * 2 + 1, opt('R')); }
    else { ctx.scale(Math.max(0.02, Math.abs(c)), 1); ctx.translate(-255, 0); pageG(ctx, 'L', (p + 1) * 2, {...opt('L'), circle: null}); }
    ctx.restore();
    ctx.fillStyle = `rgba(60,30,10,${0.30 * Math.sin(a)})`; ctx.fill(leaf); ctx.restore();
    ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke(leaf);
  }
  const sg = ctx.createLinearGradient(-70, 0, 70, 0); sg.addColorStop(0, 'rgba(60,30,10,0)'); sg.addColorStop(0.5, 'rgba(60,30,10,.34)'); sg.addColorStop(1, 'rgba(60,30,10,0)'); ctx.fillStyle = sg; ctx.fillRect(-70, -340, 140, 680);
  ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.strokeRect(-490, -340, 980, 680); ctx.beginPath(); ctx.moveTo(0, -340); ctx.lineTo(0, 340); ctx.stroke();
  fs(ctx, poly([[-210, 340], [-176, 340], [-176, 440], [-193, 418], [-210, 440]]), '#c4643a', 5);
  ctx.restore();
}
// the same book closed, seen from the cover, origin = centre (carried / hugged)
function bookClosedG(ctx, {w = 460, h = 560, edge = 1} = {}) {
  ctx.save(); ctx.lineJoin = 'round';
  if (edge) { fs(ctx, rr(-w / 2 + 14, -h / 2 + 16, w, h, 14), '#efe0bd', 6); ctx.strokeStyle = 'rgba(80,50,20,.5)'; ctx.lineWidth = 2.5; for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.moveTo(w / 2 + 2 + i * 2, -h / 2 + 30 + i * 3); ctx.lineTo(w / 2 + 2 + i * 2, h / 2 + 8); ctx.stroke(); } }
  fs(ctx, rr(-w / 2, -h / 2, w, h, 16), '#7a2f3a', 9);
  fs(ctx, rr(-w / 2, -h / 2, w * 0.1, h, 14), dark('#7a2f3a', 0.28), 5);
  ctx.strokeStyle = 'rgba(255,214,170,.38)'; ctx.lineWidth = 6; ctx.strokeRect(-w / 2 + w * 0.17, -h / 2 + 34, w * 0.76, h - 68);
  fs(ctx, rr(-w * 0.28, -h * 0.2, w * 0.62, h * 0.26, 10), '#f1dfbd', 5);
  ctx.fillStyle = '#4a2418'; ctx.font = `${h * 0.14}px GraceCaption`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('NAMES', w * 0.03, -h * 0.07); ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) fs(ctx, poly([[sx * w / 2, sy * (h / 2 - 54)], [sx * w / 2, sy * h / 2], [sx * (w / 2 - 54), sy * h / 2]]), '#a8703e', 4);
  ctx.restore();
}
// the book seen from the fore-edge: the whole block of pages, and a line pressed through ALL of them (GOLD: the only gold of the episode)
function pageStackG(ctx, {w = 960, h = 430, t = 0, t0 = 0, dur = 0.9, glw = 1} = {}) {
  ctx.save(); ctx.lineJoin = 'round'; ctx.fillStyle = 'rgba(30,10,30,.25)'; ctx.fill(el(20, h / 2 + 70, w * 0.55, 30));
  const cov = 64, ov = 26, bx = -w / 2 + 70, bw = w - 70, by = -h / 2, bh = h;
  // page block (the fore-edge): cream, many fine leaves, rounded outer edge, shaded toward the spine
  fs(ctx, rr(bx, by, bw, bh, 18), '#f5e8c8', 7);
  ctx.save(); ctx.clip(rr(bx, by, bw, bh, 18)); ctx.strokeStyle = 'rgba(110,80,40,.5)'; ctx.lineWidth = 2; const N = 64; for (let i = 1; i < N; i++) { const y = by + bh * i / N; ctx.beginPath(); ctx.moveTo(bx, y); ctx.lineTo(bx + bw, y + (i % 3) * 1.5); ctx.stroke(); }
  const sh = ctx.createLinearGradient(bx, 0, bx + bw, 0); sh.addColorStop(0, 'rgba(70,40,10,.32)'); sh.addColorStop(0.18, 'rgba(70,40,10,0)'); sh.addColorStop(0.9, 'rgba(255,250,235,.0)'); sh.addColorStop(1, 'rgba(70,40,10,.16)'); ctx.fillStyle = sh; ctx.fillRect(bx, by, bw, bh); ctx.restore();
  // covers (top and bottom boards, overhanging the block) and the spine on the left, with raised bands
  fs(ctx, rr(bx - 40, by - cov, bw + 40 + ov, cov, 16), '#7a2f3a', 9); fs(ctx, rr(bx - 40, by + bh, bw + 40 + ov, cov, 16), '#7a2f3a', 9);
  ctx.fillStyle = 'rgba(255,214,170,.22)'; ctx.fill(rr(bx - 20, by - cov + 10, bw, 12, 6)); ctx.fill(rr(bx - 20, by + bh + 10, bw, 12, 6));
  fs(ctx, rr(bx - 96, by - cov, 112, bh + 2 * cov, 30), '#6a2630', 9);
  ctx.strokeStyle = 'rgba(255,214,170,.35)'; ctx.lineWidth = 7; for (const f of [0.18, 0.5, 0.82]) { ctx.beginPath(); ctx.moveTo(bx - 90, by - cov + (bh + 2 * cov) * f); ctx.lineTo(bx + 10, by - cov + (bh + 2 * cov) * f); ctx.stroke(); }
  // the bookmark ribbon hangs out of the bottom
  fs(ctx, poly([[bx + bw * 0.74, by + bh + cov - 6], [bx + bw * 0.74 + 34, by + bh + cov - 6], [bx + bw * 0.74 + 34, by + bh + cov + 96], [bx + bw * 0.74 + 17, by + bh + cov + 70], [bx + bw * 0.74, by + bh + cov + 96]]), '#c4643a', 5);
  // LEO pressed through every leaf in thick gold (the ONLY gold of the episode); revealed left to right with a spark at the tip
  const q = clamp((t - t0) / dur), gx0 = bx + bw * 0.12, gw = bw * 0.74, fsz = bh * 0.9, xr = lerp(gx0 - 10, gx0 + gw + 10, easeOut(q));
  if (q > 0) {
    ctx.save(); ctx.beginPath(); ctx.rect(gx0 - 20, by, xr - gx0 + 20, bh); ctx.clip(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `${fsz}px GraceCaption`; const cxm = gx0 + gw / 2, cym = by + bh * 0.52;
    ctx.lineJoin = 'round'; ctx.lineWidth = 34; ctx.strokeStyle = '#6d4310'; ctx.strokeText('LEO', cxm, cym);
    if (glw > 0) { ctx.shadowColor = 'rgba(255,214,110,.95)'; ctx.shadowBlur = 40 * glw; }
    ctx.fillStyle = '#ffc94a'; ctx.lineWidth = 8; ctx.strokeStyle = '#ffc94a'; ctx.strokeText('LEO', cxm, cym); ctx.fillText('LEO', cxm, cym); ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,248,200,.8)'; ctx.fillText('LEO', cxm - 5, cym - 6); ctx.restore();
    if (q < 1) { ctx.fillStyle = '#fffbe0'; ctx.fill(el(xr, by + bh * 0.5, 20, 60)); glow(ctx, xr, by + bh * 0.5, 160, 0.8, '255,226,130'); }
    else { const pu = 1 + 0.1 * Math.sin((t - t0 - dur) * 3); glow(ctx, bx + bw / 2, by + bh / 2, 420 * pu, 0.26 * glw, '255,214,110'); }
  }
  ctx.restore();
}

// ------------------------------------------------------------------ hands, breath, light
// a forearm in a pajama sleeve with a pointing finger; origin = the FINGERTIP; ang = direction the finger points (radians, 0 = right)
function fingerG(ctx, {fx = 0, fy = 0, ang = -0.9, k = 1, sleeve = '#e9d7b0', sleeve2 = '#c4643a', skin = '#e3b38e'} = {}) {
  ctx.save(); ctx.translate(fx, fy); ctx.rotate(ang); ctx.scale(k, k); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const sl = rr(-1400, -86, 1130, 172, 22); fs(ctx, sl, sleeve, 8);
  ctx.save(); ctx.clip(sl); ctx.fillStyle = sleeve2; for (let x = -1400; x < -270; x += 90) ctx.fillRect(x, -90, 28, 180); ctx.restore(); ctx.lineWidth = 8; ctx.strokeStyle = INK; ctx.stroke(sl);
  fs(ctx, rr(-286, -94, 34, 188, 12), dark(sleeve, 0.12), 7);
  fs(ctx, rr(-262, -54, 110, 108, 26), skin, 7);
  fs(ctx, el(-70, 4, 88, 72), skin, 7);
  fs(ctx, rr(-92, -50, 100, 38, 19), skin, 7);
  ctx.fillStyle = 'rgba(255,214,200,.9)'; ctx.fill(el(-8, -37, 13, 9));
  for (let i = 0; i < 3; i++) fs(ctx, el(-34 - i * 3, 16 + i * 22, 34, 17), mix(skin, '#000000', 0.04), 6);
  fs(ctx, el(-118, 62, 50, 23), skin, 6);
  ctx.restore();
}
// an exhale: a soft cloud puffing out of the mouth and rising. origin = mouth. {t, t0, dir}
function puffG(ctx, {t = 0, t0 = 0, dir = 1, r = 1, up = 1} = {}) {
  const q = (t - t0) / 1.0; if (q < 0 || q > 1) return;
  ctx.save(); ctx.scale(dir, 1); ctx.globalAlpha = 1 - q * q * 0.9; ctx.lineJoin = 'round';
  for (let i = 0; i < 5; i++) { const cx = (30 + i * 46) * q * r + 10, cy = (-14 - i * 12 - 130 * q * up), rad = (22 + i * 11) * (0.5 + 0.9 * q) * r; fs(ctx, el(cx, cy, rad, rad * 0.86), '#fffaf0', 5); }
  ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 6; ctx.lineCap = 'round'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(40 + i * 14, 6 + i * 18); ctx.lineTo(120 + i * 30 + 120 * q, 4 + i * 24 - 10 * q); ctx.stroke(); }
  ctx.restore();
}
// a flashlight in a hand (origin = the grip), pointing at angle `aim`; the beam is a soft cone. {on 0..1, aim, len}
function flashG(ctx, {on = 1, aim = 0, len = 560, spread = 150, k = 1} = {}) {
  ctx.save(); ctx.rotate(aim); ctx.scale(k, k); ctx.lineJoin = 'round';
  if (on > 0.02) { const g = ctx.createLinearGradient(170, 0, 170 + len, 0); g.addColorStop(0, `rgba(255,244,190,${0.62 * on})`); g.addColorStop(1, 'rgba(255,244,190,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(170, -30); ctx.lineTo(170 + len, -spread); ctx.lineTo(170 + len, spread); ctx.lineTo(170, 30); ctx.closePath(); ctx.fill(); }
  fs(ctx, rr(-30, -24, 150, 48, 12), '#5b616e', 5); fs(ctx, rr(30, -26, 24, 52, 4), '#f4b942', 4);
  fs(ctx, poly([[118, -24], [176, -48], [176, 48], [118, 24]]), '#3d424d', 5); fs(ctx, el(176, 0, 10, 44), on > 0.02 ? '#fff6c8' : '#9aa0aa', 4);
  ctx.restore();
}
// a light spot (no outline), centre = origin
function spotG(ctx, {rx = 220, ry = 150, a = 0.5, on = 1} = {}) { if (on <= 0.02) return; ctx.save(); ctx.scale(1, ry / rx); const g = ctx.createRadialGradient(0, 0, 10, 0, 0, rx); g.addColorStop(0, `rgba(255,246,200,${a * on})`); g.addColorStop(1, 'rgba(255,246,200,0)'); ctx.fillStyle = g; ctx.fillRect(-rx, -rx, 2 * rx, 2 * rx); ctx.restore(); }
// a magnifying glass; origin = the end of the handle (the grip)
function lupaG(ctx, {r = 120, glint = 0, tilt = 0} = {}) {
  ctx.save(); ctx.rotate(tilt); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.strokeStyle = INK; ctx.lineWidth = 36; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -r * 1.1); ctx.stroke(); ctx.strokeStyle = '#8a5a36'; ctx.lineWidth = 26; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -r * 1.1); ctx.stroke();
  const cy = -r * 1.1 - r * 0.92; fs(ctx, el(0, cy, r, r), 'rgba(205,236,240,.55)', 0);
  ctx.lineWidth = 24; ctx.strokeStyle = INK; ctx.beginPath(); ctx.arc(0, cy, r, 0, 7); ctx.stroke(); ctx.lineWidth = 15; ctx.strokeStyle = '#b8863a'; ctx.beginPath(); ctx.arc(0, cy, r, 0, 7); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 9; ctx.beginPath(); ctx.arc(0, cy, r * 0.74, 3.5, 4.4); ctx.stroke();
  if (glint > 0) { const q = clamp(glint); ctx.fillStyle = `rgba(255,255,255,${0.9 * Math.sin(q * Math.PI)})`; ctx.save(); ctx.translate(r * 0.3, cy - r * 0.3); ctx.rotate(0.8); ctx.fillRect(-4, -26, 8, 52); ctx.fillRect(-26, -4, 52, 8); ctx.restore(); }
  ctx.restore();
}
// a pencil: behind the actor's ear until tPull, then in the right hand. {A, t, tPull}
function pencilG(ctx, {A = null, t = 0, tPull = 1e9, len = 110, hand = 'R', earSide = 1} = {}) {
  if (!A || !A._head || (A._alpha ?? 1) <= 0.02) return;
  const R = A._headR * A._s, fl = (A.flip ? -1 : 1) * earSide; let x, y, rot;
  if (t < tPull) { x = A._head[0] + fl * R * 0.86; y = A._head[1] - R * 0.18; rot = -0.55 * fl - 0.1; }
  else { const h = A._hands && A._hands[hand]; if (!h) return; const q = ease((t - tPull) / 0.2); x = lerp(A._head[0] + fl * R * 0.86, h[0], q); y = lerp(A._head[1] - R * 0.18, h[1], q); rot = lerp(-0.55 * fl - 0.1, -0.35, q) + Math.sin((t - tPull) * 9) * 0.06 * q; }
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.lineJoin = 'round';
  const L = len * (R / 70), w = L * 0.11;
  fs(ctx, rr(-w, -L, w * 2, L * 0.74, w * 0.3), '#f4b942', 4); fs(ctx, rr(-w, -L * 1.1, w * 2, L * 0.12, w * 0.4), '#e7a6b0', 4); fs(ctx, rr(-w, -L * 1.0, w * 2, L * 0.06, 1), '#c9c9cf', 3);
  fs(ctx, poly([[-w, -L * 0.26], [w, -L * 0.26], [0, L * 0.06]]), '#f1d9b5', 4); fs(ctx, poly([[-w * 0.36, -L * 0.04], [w * 0.36, -L * 0.04], [0, L * 0.06]]), '#3a3a40', 2);
  ctx.restore();
}
// a far queue of small pajama figures along a path. {t, from:[x,y,s], to:[x,y,s], n}
function queueG(ctx, {t = 0, from = [1010, 1620, 1.0], to = [420, 1350, 0.32], n = 18, sway = 70, lit = 1, seed = 1, shuffle = 1} = {}) {
  const cols = ['#8fa6c9', '#e7a6b0', '#f4b942', '#9a7ab0', '#7c8f4a', '#fbf1dc', '#c4643a'], hair = ['#2a1a12', '#a0482a', '#d8d3ca', '#6b4a2a', '#1b1210'];
  const fig = [];
  for (let i = 0; i < n; i++) {
    const u = (i + 0.5) / n, w = Math.pow(u, 0.8);
    const x = lerp(from[0], to[0], w) + Math.sin(u * 5 + seed) * sway * (1 - u * 0.4), y = lerp(from[1], to[1], w) + Math.sin(u * 7 + seed * 2) * 12, s = lerp(from[2], to[2], w);
    fig.push({i, x, y, s});
  }
  fig.sort((a, b) => a.y - b.y);
  for (const f of fig) {
    const bob = Math.abs(Math.sin(t * 2.6 + f.i * 1.7)) * 5 * f.s * shuffle, c = cols[Math.floor(hashN(f.i + seed * 7) * cols.length)], hc = hair[Math.floor(hashN(f.i * 3 + seed) * hair.length)];
    ctx.save(); ctx.translate(f.x, f.y - bob); ctx.scale(f.s, f.s); ctx.lineJoin = 'round';
    ctx.fillStyle = 'rgba(30,10,30,.2)'; ctx.fill(el(0, 4, 50, 11));
    fs(ctx, rr(-28, -62, 20, 62, 8), mix(c, '#ffffff', 0.1), 6); fs(ctx, rr(8, -62, 20, 62, 8), mix(c, '#ffffff', 0.1), 6);
    fs(ctx, rr(-36, -170, 72, 120, 26), c, 6); fs(ctx, rr(-52, -158, 22, 80, 10), c, 5); fs(ctx, rr(30, -158, 22, 80, 10), c, 5);
    fs(ctx, el(0, -198, 33, 35), '#e3b38e', 6); ctx.fillStyle = hc; ctx.beginPath(); ctx.ellipse(0, -214, 34, 22, 0, Math.PI, 0); ctx.fill();
    if (f.i % 3 === 1) fs(ctx, rr(-60, -128, 56, 40, 14), '#fbf1dc', 5);
    if (f.i % 2 === 0 && lit) { glow(ctx, 50, -92, 120, 0.7, '255,214,120'); fs(ctx, rr(42, -112, 18, 26, 5), '#ffe08a', 4); }
    ctx.restore();
  }
}
// snow falling in a rectangle (optionally clipped)
function snowG(ctx, {t = 0, x0 = 0, y0 = 0, w = 1080, h = 1920, n = 130, speed = 150, wind = 36, size = [3, 9], a = 0.95, clip = false, seed = 1} = {}) {
  ctx.save(); if (clip) { ctx.beginPath(); ctx.rect(x0, y0, w, h); ctx.clip(); }
  ctx.fillStyle = `rgba(255,255,255,${a})`;
  for (let i = 0; i < n; i++) {
    const sp = speed * (0.6 + hashN(i * 1.7 + seed) * 0.8), sz = lerp(size[0], size[1], hashN(i * 2.9 + seed));
    const y = y0 + ((hashN(i * 3.1 + seed) * h + t * sp) % h), x = x0 + (((hashN(i * 5.3 + seed) * w + t * wind * (0.4 + hashN(i)) + Math.sin(t * 1.3 + i) * 18) % w) + w) % w;
    ctx.beginPath(); ctx.arc(x, y, sz, 0, 7); ctx.fill();
  }
  ctx.restore();
}
// snow settled on an actor's shoulders and hair
function snowOnG(ctx, {A = null, k = 1, hair = 1} = {}) {
  if (!A || !A._rt || !A._spec || (A._alpha ?? 1) <= 0.02) return;
  const Pl = {adult: {leg: 40, torso: 28, sw: 23}, elder: {leg: 42, torso: 28, sw: 22}, kid: {leg: 25, torso: 20, sw: 18}}[A._spec.plan || 'adult'], s = A._s, fl = A.flip ? -1 : 1;
  const shY = -(Pl.leg + Pl.torso) + 1;
  ctx.save(); ctx.fillStyle = '#ffffff'; ctx.strokeStyle = 'rgba(80,100,140,.55)'; ctx.lineWidth = 3; ctx.globalAlpha = (A._alpha ?? 1) * k; ctx.lineJoin = 'round';
  for (const sg of [-1, 1]) for (let i = 0; i < 5; i++) { const lx = sg * (Pl.sw / 2 - 2 - i * 3.9) * fl, [wx, wy] = A._rt(lx * s, (shY - 0.6 - (i % 2) * 1.2) * s); ctx.beginPath(); ctx.ellipse(wx, wy, 11 * s / 4.6, 6.4 * s / 4.6, 0, 0, 7); ctx.fill(); ctx.stroke(); }
  if (hair) for (let i = 0; i < 4; i++) { const R = A._headR * s; ctx.beginPath(); ctx.ellipse(A._top[0] + (i - 1.5) * R * 0.34, A._top[1] + R * 0.12 + Math.abs(i - 1.5) * R * 0.1, R * 0.18, R * 0.11, 0, 0, 7); ctx.fill(); }
  ctx.restore();
}
// a portico pillar; origin = top-centre; goes down h
function pillarG(ctx, {w = 200, h = 2200, color = '#cbb08a'} = {}) {
  ctx.save(); ctx.lineJoin = 'round';
  fs(ctx, rr(-w / 2 - 14, -10, w + 28, 70, 10), dark(color, 0.08), 7);
  fs(ctx, rr(-w / 2, 50, w, h, 6), color, 7);
  ctx.strokeStyle = dark(color, 0.22); ctx.lineWidth = 5; for (let i = 1; i < 5; i++) { const x = -w / 2 + w * i / 5; ctx.beginPath(); ctx.moveTo(x, 60); ctx.lineTo(x, h + 40); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,240,200,.15)'; ctx.fillRect(-w / 2 + 6, 56, w * 0.18, h - 10);
  ctx.fillStyle = 'rgba(48,24,76,.20)'; ctx.fillRect(w * 0.18, 56, w * 0.3, h - 10);
  ctx.restore();
}
// the NIGHTS plate over an actor, with the MISSED tag stuck on it. {A, t, v, lastT (last change), miss (0|1|2), missT}
function nightsG(ctx, {A = null, t = 0, v = 0, lastT = -9, miss = 0, missT = -9, gap = 26, wmin = 360, fix = null, dx = 0} = {}) {
  if (!A || !A._top || (A._alpha ?? 1) <= 0.02) return;
  const R = A._headR * A._s, w = Math.max(wmin, 4.6 * R), h = w * 0.5;
  const cx = fix ? fix[0] : A._top[0] + dx, cy = fix ? fix[1] : A._top[1] - gap - h / 2;
  const q = (t - lastT) / 0.4, pul = q >= 0 && q < 1 ? 1 + 0.08 * Math.sin(q * Math.PI) : 1;
  ctx.save(); ctx.globalAlpha = A._alpha ?? 1; ctx.translate(cx, cy); ctx.scale(pul, pul); ctx.lineJoin = 'round';
  const p = rr(-w / 2, -h / 2, w, h, h * 0.2); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.save(); ctx.translate(0, 8); ctx.fill(p); ctx.restore();
  ctx.fillStyle = '#2a1810'; ctx.fill(p); ctx.lineWidth = 8; ctx.strokeStyle = INK; ctx.stroke(p);
  ctx.lineWidth = 4; ctx.strokeStyle = '#d9a441'; ctx.stroke(rr(-w / 2 + 8, -h / 2 + 8, w - 16, h - 16, h * 0.15));
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#f3dfb8'; ctx.font = `${h * 0.21}px GraceCaption`; ctx.fillText('NIGHTS', 0, -h * 0.3);
  const txt = Math.max(0, Math.round(v)).toLocaleString('en-US'); ctx.font = `${h * 0.62}px GraceCaption`; ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.strokeText(txt, 0, h * 0.1);
  ctx.fillStyle = '#ffae5c'; ctx.shadowColor = '#ffae5c'; ctx.shadowBlur = 14; ctx.fillText(txt, 0, h * 0.1); ctx.shadowBlur = 0;
  ctx.restore();
  if (miss > 0 && t >= missT) {
    const th0 = h * 0.25, k = easeOutBack(clamp((t - missT) / 0.3)), wob = Math.sin((t - missT) * 14) * 0.03 * Math.max(0, 1 - (t - missT) * 2);
    ctx.save(); ctx.globalAlpha = A._alpha ?? 1; ctx.translate(cx - w * 0.3, cy - h * 0.62 - th0); ctx.rotate(-0.05 + wob); ctx.scale(k, k); ctx.lineJoin = 'round';
    const tw = w * 0.74, th = h * 0.5, tg = rr(-tw / 2, -th / 2, tw, th, th * 0.22); ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.save(); ctx.translate(0, 6); ctx.fill(tg); ctx.restore();
    ctx.fillStyle = '#d9473a'; ctx.fill(tg); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke(tg);
    ctx.fillStyle = '#fff4dc'; ctx.font = `${th * 0.7}px GraceCaption`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 6; ctx.strokeStyle = INK; const mt = 'MISSED ' + miss; ctx.strokeText(mt, 0, 3); ctx.fillText(mt, 0, 3);
    ctx.restore();
  }
}
// sleep Zs drifting up from a head
function zzzG(ctx, {A = null, t = 0, t0 = 0, dx = 0.9} = {}) {
  if (!A || !A._head || (A._alpha ?? 1) <= 0.02 || t < t0) return;
  const R = A._headR * A._s; ctx.save(); ctx.lineJoin = 'round'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (let i = 0; i < 3; i++) { const q = ((t - t0) / 1.8 + i / 3) % 1, a = Math.sin(q * Math.PI), x = A._head[0] + R * dx + q * R * 1.6 + Math.sin(q * 5 + i) * R * 0.2, y = A._head[1] - R * 0.9 - q * R * 2.6; ctx.globalAlpha = a * (A._alpha ?? 1); ctx.font = `${R * (0.7 + 0.35 * q + i * 0.1)}px GraceCaption`; ctx.lineWidth = 8; ctx.strokeStyle = INK; ctx.strokeText('Z', x, y); ctx.fillStyle = '#fff4dc'; ctx.fillText('Z', x, y); }
  ctx.restore();
}
// knock rings: arcs that spread from the origin at the given times
function knockG(ctx, {t = 0, at = [], r = 1} = {}) {
  for (const t0 of at) { const q = (t - t0) / 0.5; if (q < 0 || q > 1) continue; ctx.save(); ctx.globalAlpha = 1 - q; ctx.strokeStyle = '#fff4dc'; ctx.lineWidth = 11 * (1 - q) + 3; ctx.lineCap = 'round'; for (let i = 0; i < 2; i++) { ctx.beginPath(); ctx.arc(0, 0, (50 + 110 * q + i * 50) * r, -0.9, 0.9); ctx.stroke(); } ctx.restore(); }
}
// a blanket over the lower half of a bed (FRONT prop): spans x0..x1, top at y. Scalloped hem, stitched squares.
function blanketG(ctx, {x0 = 330, x1 = 830, top = 1180, bottom = 1400, color = '#7c8f4a', color2 = '#fbf1dc'} = {}) {
  ctx.save(); ctx.lineJoin = 'round';
  const p = new Path2D(); p.moveTo(x0, bottom); p.lineTo(x0, top + 40); p.quadraticCurveTo(x0 + 60, top - 20, x0 + 150, top + 10); p.quadraticCurveTo((x0 + x1) / 2, top - 36, x1 - 150, top + 6); p.quadraticCurveTo(x1 - 40, top - 22, x1, top + 36); p.lineTo(x1, bottom); p.closePath();
  fs(ctx, p, color, 7); ctx.save(); ctx.clip(p);
  ctx.strokeStyle = color2; ctx.lineWidth = 6; ctx.globalAlpha = 0.85; for (let x = x0 + 40; x < x1; x += 90) { ctx.beginPath(); ctx.moveTo(x, top - 40); ctx.lineTo(x, bottom); ctx.stroke(); } for (let y = top + 50; y < bottom; y += 70) { ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); }
  ctx.globalAlpha = 1; ctx.fillStyle = 'rgba(255,255,255,.1)'; ctx.fillRect(x0, top, (x1 - x0) * 0.4, 40); ctx.restore();
  ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke(p);
  fs(ctx, rr(x0 - 8, bottom - 36, x1 - x0 + 16, 36, 12), mix(color, '#000000', 0.2), 6);
  ctx.restore();
}
Object.assign(PROPS, {bigBookG, bookClosedG, pageStackG, fingerG, puffG, flashG, spotG, lupaG, pencilG, queueG, snowG, snowOnG, pillarG, nightsG, zzzG, knockG, blanketG});

// ------------------------------------------------------------------ places
const SPINES = ['#c4643a', '#7c8f4a', '#d9a441', '#9a7ab0', '#3f6a7a', '#a8503a', '#e2574c', '#8a5a36', '#f4b942', '#5f7339'];
function shelfRow(ctx, y, x0 = -10, x1 = 1090, seed = 1) {
  fs(ctx, rr(x0, y + 150, x1 - x0, 20, 3), '#5e3a22', 5);
  let x = x0 + 6, i = 0;
  while (x < x1 - 20) { const bw = 20 + hashN(i * 1.7 + seed) * 20, bh = 100 + hashN(i * 2.9 + seed * 3) * 46, c = SPINES[Math.floor(hashN(i * 4.3 + seed * 5) * SPINES.length)];
    fs(ctx, rr(x, y + 150 - bh, bw, bh, 3), mix(c, '#000000', 0.12), 4); ctx.fillStyle = 'rgba(255,240,200,.35)'; ctx.fillRect(x + 4, y + 150 - bh + 14, bw - 8, 5); x += bw + 2; i++; if (hashN(i * 7 + seed) > 0.93) x += 26; }
}
function archPath(x, y, w, h) { const p = new Path2D(); p.moveTo(x, y + h); p.lineTo(x, y + w / 2); p.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); p.lineTo(x + w, y + h); p.closePath(); return p; }
const PLUM = 'rgba(48,24,76,';
Object.assign(SETS, {
  // the library hall at night: shelves to the ceiling, a moon in the arched window, two hanging lamps, a runner. ONE night level for the whole place and hour.
  gbHall() {
    return ctx => {
      ctx.fillStyle = '#bd8d62'; ctx.fillRect(0, 0, 1080, 1920);
      for (let r = 0; r < 5; r++) shelfRow(ctx, 20 + r * 236, -10, 1090, r + 1);
      const aw = archPath(360, 120, 360, 560); fs(ctx, archPath(340, 100, 400, 600), WARM.stone, 9); ctx.save(); ctx.clip(aw); const sg = ctx.createLinearGradient(0, 120, 0, 680); sg.addColorStop(0, '#2c2150'); sg.addColorStop(1, '#5a4878'); ctx.fillStyle = sg; ctx.fillRect(340, 100, 400, 600);
      ctx.fillStyle = '#fff1c4'; ctx.fill(el(560, 330, 62, 62)); ctx.fillStyle = 'rgba(255,241,196,.2)'; ctx.fill(el(560, 330, 120, 120)); ctx.fillStyle = '#fff'; for (const [x, y] of [[430, 250], [640, 220], [490, 420], [660, 470], [590, 190]]) ctx.fill(el(x, y, 4, 4)); ctx.restore();
      ctx.lineWidth = 8; ctx.strokeStyle = INK; ctx.stroke(aw); ctx.beginPath(); ctx.moveTo(540, 300); ctx.lineTo(540, 680); ctx.moveTo(360, 470); ctx.lineTo(720, 470); ctx.stroke();
      ctx.save(); ctx.translate(130, 0); fs(ctx, rr(0, 320, 18, 1000, 4), '#6e4426', 5); fs(ctx, rr(120, 320, 18, 1000, 4), '#6e4426', 5); for (let y = 420; y < 1280; y += 110) fs(ctx, rr(0, y, 138, 16, 3), '#8a5a36', 4); ctx.restore();
      ctx.fillStyle = '#a97650'; ctx.fillRect(0, 1300, 1080, 620); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 1300); ctx.lineTo(1080, 1300); ctx.stroke();
      ctx.strokeStyle = 'rgba(50,25,10,.3)'; ctx.lineWidth = 3; for (let y = 1352; y < 1920; y += 56 + (y - 1300) * 0.1) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1080, y); ctx.stroke(); }
      fs(ctx, poly([[380, 1300], [700, 1300], [940, 1920], [140, 1920]]), '#a8453a', 6); fs(ctx, poly([[410, 1310], [670, 1310], [870, 1920], [210, 1920]]), '#c26a4a', 0); ctx.strokeStyle = '#fbf1dc'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(410, 1310); ctx.lineTo(210, 1920); ctx.moveTo(670, 1310); ctx.lineTo(870, 1920); ctx.stroke();
      fs(ctx, poly([[300, 1410], [780, 1410], [740, 1450], [340, 1450]]), '#6e4426', 7);
      fs(ctx, rr(380, 1450, 320, 150, 6), '#8a5a36', 7); fs(ctx, poly([[360, 1600], [720, 1600], [780, 1650], [300, 1650]]), '#6e4426', 7);
      ctx.fillStyle = `${PLUM}.06)`; ctx.fillRect(0, 0, 1080, 1920);
      for (const x of [230, 850]) { ctx.strokeStyle = '#3c2c24'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 640); ctx.stroke(); fs(ctx, poly([[x - 76, 760], [x + 76, 760], [x + 46, 640], [x - 46, 640]]), '#ffe08a', 6); glow(ctx, x, 770, 520, 0.5); }
      glow(ctx, 540, 1180, 760, 0.42, '255,214,140');
    };
  },
  // the front of the library at night: stone block, pediment with the clock at TEN, big arched door glowing, steps, lamps, houses at the sides.
  gbFront() {
    return ctx => {
      sky(ctx, 'night', 1300);
      for (const [x, w, top, c] of [[-170, 330, 700, WARM.plaster[0]], [900, 330, 740, WARM.plaster[2]]]) cottage(ctx, x, w, top, 1290, c, {lit: true, door: true});
      fs(ctx, rr(150, 520, 780, 790, 6), '#d6c19c', 8);
      ctx.fillStyle = dark('#d6c19c', 0.08); for (let i = 0; i < 14; i++) ctx.fill(el(190 + hashN(i) * 700, 600 + hashN(i + 4) * 650, 34, 12));
      fs(ctx, poly([[110, 540], [540, 250], [970, 540]]), '#a8503a', 8); ctx.strokeStyle = dark('#a8503a', 0.25); ctx.lineWidth = 4; for (let i = 1; i < 5; i++) { const k = i / 5; ctx.beginPath(); ctx.moveTo(110 + k * 430, 540 - k * 290); ctx.lineTo(970 - k * 430, 540 - k * 290); ctx.stroke(); }
      fs(ctx, rr(110, 530, 860, 36, 4), '#c8ae84', 7);
      ctx.save(); ctx.translate(540, 420); fs(ctx, el(0, 0, 92, 92), '#6e4426', 8); fs(ctx, el(0, 0, 74, 74), '#fff6e2', 5); ctx.strokeStyle = INK; ctx.lineCap = 'round'; for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; ctx.lineWidth = i % 3 ? 3 : 6; ctx.beginPath(); ctx.moveTo(Math.sin(a) * 60, -Math.cos(a) * 60); ctx.lineTo(Math.sin(a) * 70, -Math.cos(a) * 70); ctx.stroke(); }
      ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(-Math.PI / 3) * 38, -Math.cos(-Math.PI / 3) * 38); ctx.stroke(); ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -58); ctx.stroke(); fs(ctx, el(0, 0, 7, 7), INK, 0); ctx.restore();
      fs(ctx, rr(290, 600, 500, 70, 8), '#3a2a22', 7); ctx.fillStyle = '#fbf1dc'; ctx.font = '58px GraceCaption'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('LIBRARY', 540, 637); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      for (const x of [215, 405, 675, 865]) { fs(ctx, rr(x - 28, 700, 56, 560, 8), '#e2cfa8', 7); fs(ctx, rr(x - 40, 690, 80, 26, 6), '#c8ae84', 5); }
      const door = archPath(430, 800, 220, 520); fs(ctx, archPath(404, 776, 272, 560), '#bfa57c', 8); ctx.save(); ctx.clip(door); const dg = ctx.createLinearGradient(0, 800, 0, 1320); dg.addColorStop(0, '#ffe9a8'); dg.addColorStop(1, '#f0b765'); ctx.fillStyle = dg; ctx.fillRect(430, 800, 220, 520); ctx.fillStyle = 'rgba(160,100,50,.35)'; ctx.fillRect(430, 1200, 220, 120); ctx.restore(); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke(door); ctx.beginPath(); ctx.moveTo(540, 900); ctx.lineTo(540, 1320); ctx.stroke();
      for (const [y0, w0] of [[1290, 800], [1318, 880], [1346, 960]]) fs(ctx, rr(540 - w0 / 2, y0, w0, 30, 6), '#cdb690', 6);
      cobbles(ctx, 1380, '#d3b98c', true);
      ctx.fillStyle = `${PLUM}.44)`; ctx.fillRect(0, 0, 1080, 1920);
      glow(ctx, 540, 1100, 560, 0.5, '255,206,120');
      for (const x of [90, 990]) { ctx.strokeStyle = '#3c2c24'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(x, 800); ctx.lineTo(x, 1400); ctx.stroke(); fs(ctx, poly([[x - 36, 760], [x + 36, 760], [x + 26, 810], [x - 26, 810]]), '#ffe08a', 5); glow(ctx, x, 780, 400, 0.5, '255,206,120'); }
    };
  },
  // the lane at night: the village houses with lit windows and a lamp; snow = white on the ground and drifts at the walls
  gbStreet({snow = false} = {}) {
    return ctx => {
      SETS.gLane({time: 'night', lit: true, lamps: true})(ctx);
      for (const [x, y, r, al] of [[150, 1180, 520, 0.5], [540, 1180, 560, 0.5], [930, 1180, 520, 0.5], [330, 760, 380, 0.4], [760, 760, 380, 0.4]]) glow(ctx, x, y, r, al, '255,206,140');
      if (snow) {
        ctx.fillStyle = 'rgba(236,240,255,.62)'; ctx.fillRect(0, 1290, 1080, 630);
        for (let i = 0; i < 16; i++) { const x = hashN(i) * 1100, y = 1330 + hashN(i + 7) * 560; ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fill(el(x, y, 90 + hashN(i + 3) * 90, 14 + hashN(i + 5) * 14)); }
        fs(ctx, rr(-20, 1270, 1120, 40, 20), '#f2f4ff', 5);
        for (const [x, y, w0] of [[-30, 650, 270], [210, 590, 250], [470, 610, 260], [730, 600, 300]]) { ctx.fillStyle = 'rgba(255,255,255,.88)'; ctx.beginPath(); ctx.moveTo(x, y + 6); ctx.quadraticCurveTo(x + w0 / 2, y - 140, x + w0, y + 6); ctx.quadraticCurveTo(x + w0 / 2, y - 100, x, y + 6); ctx.fill(); }
      }
    };
  },
  // Leo's bedroom, winter, lamp on: a window (the snow is a prop), curtains, a bed with a tall head, a nightstand + lamp. ONE level (lamp-lit night).
  gbBedroom() {
    return ctx => {
      room(ctx, '#e0b2bc', '#bd8c9a', '#a87b64');
      ctx.fillStyle = 'rgba(255,220,200,.07)'; for (let x = 70; x < 1080; x += 130) ctx.fillRect(x, 0, 36, 1050);
      windowPane(ctx, 110, 330, 330, 440, 'night');
      for (const x of [74, 446]) fs(ctx, rr(x, 296, 60, 580, 20), '#8a3f4a', 5);
      fs(ctx, rr(790, 560, 190, 240, 8), '#c9a46a', 5); fs(ctx, rr(806, 576, 158, 208, 4), '#efe0c0', 3); fs(ctx, el(886, 650, 30, 34), '#e3b38e', 4); fs(ctx, rr(852, 686, 68, 74, 14), '#7c8f4a', 4);
      fs(ctx, el(540, 1600, 520, 170), '#b5552f', 7); fs(ctx, el(540, 1600, 430, 128), '#fbf1dc', 0); fs(ctx, el(540, 1600, 360, 104), '#c4643a', 0);
      fs(ctx, rr(980, 880, 70, 540, 22), '#8a5a36', 7); fs(ctx, rr(960, 860, 110, 50, 22), '#a8703e', 6);
      fs(ctx, rr(300, 1330, 760, 100, 16), '#8a5a36', 7); fs(ctx, rr(310, 1250, 700, 100, 30), '#f6ead0', 7);
      fs(ctx, rr(790, 1130, 240, 120, 46), '#fbf1dc', 6); ctx.strokeStyle = 'rgba(120,90,60,.3)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(840, 1190); ctx.lineTo(980, 1186); ctx.stroke();
      for (const x of [330, 1000]) fs(ctx, rr(x - 20, 1420, 40, 90, 8), '#6e4426', 5);
      fs(ctx, rr(120, 1180, 170, 260, 10), '#8a5a36', 7); fs(ctx, rr(130, 1300, 150, 10, 2), '#6e4426', 3); fs(ctx, rr(186, 1100, 40, 80, 8), '#fbf1dc', 5); fs(ctx, poly([[150, 1100], [266, 1100], [238, 990], [178, 990]]), '#ffe08a', 6); glow(ctx, 208, 1040, 560, 0.52, '255,206,120');
      ctx.fillStyle = `${PLUM}.03)`; ctx.fillRect(0, 0, 1080, 1920);
      glow(ctx, 208, 1030, 460, 0.28, '255,214,140');
    };
  },
});

// ------------------------------------------------------------------ small extras
// a pillow (origin = centre); a dust poof where someone slips behind a pillar and out the other side older
function pillowG(ctx, {w = 190, h = 130, color = '#fbf1dc'} = {}) {
  ctx.save(); ctx.lineJoin = 'round';
  fs(ctx, rr(-w / 2, -h / 2, w, h, h * 0.42), color, 6);
  ctx.strokeStyle = 'rgba(120,90,60,.35)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-w * 0.36, -h * 0.08); ctx.quadraticCurveTo(0, h * 0.2, w * 0.36, -h * 0.08); ctx.stroke();
  for (const sx of [-1, 1]) fs(ctx, el(sx * w * 0.5, -h * 0.5 + 6, 9, 9), '#c4643a', 4);
  ctx.restore();
}
function puffDustG(ctx, {t = 0, t0 = 0, r = 1} = {}) {
  const q = (t - t0) / 0.5; if (q < 0 || q > 1) return;
  ctx.save(); ctx.globalAlpha = 1 - q; ctx.lineJoin = 'round';
  for (let i = 0; i < 7; i++) { const dir = (i / 6 - 0.5) * 2, rad = (26 + 16 * hashN(i + 3)) * (0.6 + q * 1.4) * r; fs(ctx, el(dir * 170 * easeOut(q) * r, -20 - q * 50 - hashN(i) * 40, rad, rad * 0.8), '#f1e2c2', 4); }
  ctx.restore();
}
Object.assign(PROPS, {pillowG, puffDustG});

// a big cartoon cloud that hides a whole figure while it changes (time passes): origin free, drawn at (x, y) = the figure's feet. {t, t0, x, y, h}
function swapCloudG(ctx, {t = 0, t0 = 0, x = 0, y = 1640, h = 520, dur = 0.5} = {}) {
  const q = (t - t0) / dur; if (q < 0 || q > 1) return;
  const g = Math.sin(q * Math.PI), a = clamp(g * 1.6);
  ctx.save(); ctx.translate(x, y); ctx.globalAlpha = a; ctx.lineJoin = 'round';
  for (let i = 0; i < 13; i++) { const u = hashN(i * 2.1 + 1), v = hashN(i * 3.7 + 2), cx = (u - 0.5) * h * 0.62 * g, cy = -v * h * 0.95 * (0.5 + 0.5 * g), rad = (h * 0.14 + h * 0.07 * hashN(i + 9)) * (0.5 + g); fs(ctx, el(cx, cy, rad, rad * 0.88), '#f6ecd8', 5); }
  ctx.restore();
}
Object.assign(PROPS, {swapCloudG});
