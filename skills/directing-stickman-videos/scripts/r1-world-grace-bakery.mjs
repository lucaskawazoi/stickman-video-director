// R1 · grace-remains ep8 "The Flowers": flowers that bloom (single + fields that grow by count), Bruno's bakery (outside in four
// states: day / night / ruin / rebuilt-by-progress, and inside), a bus, a garden, and the small props the story carries.
// Registered into SETS/PROPS on import (the renderer imports it after r1-world-grace.mjs).
import {Path2D} from '@napi-rs/canvas';
import {INK, mix, dark, light} from './r1-rig.mjs';
import {SETS, PROPS} from './r1-world.mjs';
import {fs, rr, el, poly, hashN, glow, cobbles, olive, sky, room, windowPane, easeOutBack, SHADE, WARM} from './r1-world-grace.mjs';

export const FLOWER_COLORS = ['#e2574c', '#f4b942', '#f08ac0', '#fbf1dc', '#b07ad8', '#ff9a4a', '#6fb3e8', '#ff7a8a'];

// ---- a flower: origin = where the stem meets the ground; r = petal-head scale (height ≈ 2.4 r). k 0..1 = the bloom (overshoot + ring)
function drawFlower(ctx, x, y, r, {k = 1, color = '#e2574c', seed = 0, t = 0} = {}) {
  if (k <= 0) return;
  const sc = Math.max(0.001, easeOutBack(k)), lw = Math.max(2, r * 0.1);
  ctx.save(); ctx.translate(x, y);
  if (k < 1) { // the pop: a ground ring, a halo and a few sparks at the bloom
    ctx.strokeStyle = `rgba(255,244,190,${0.95 * (1 - k)})`; ctx.lineWidth = 6 * (1 - k) + 1.5; ctx.beginPath(); ctx.ellipse(0, 0, r * (0.6 + 2.4 * k), r * (0.22 + 0.8 * k), 0, 0, 7); ctx.stroke();
    const R = r * 3.4, g = ctx.createRadialGradient(0, -r * 2.1, r * 0.3, 0, -r * 2.1, R); g.addColorStop(0, `rgba(255,236,150,${0.7 * (1 - k * 0.5)})`); g.addColorStop(1, 'rgba(255,236,150,0)'); ctx.fillStyle = g; ctx.fillRect(-R, -r * 2.1 - R, 2 * R, 2 * R);
    ctx.fillStyle = `rgba(255,248,214,${1 - k})`; for (let i = 0; i < 6; i++) { const a = i * 1.047 + seed, d = r * (1.2 + 2.2 * k); ctx.fill(el(Math.cos(a) * d, -r * 2.1 + Math.sin(a) * d * 0.8, r * 0.1 * (1 - k) + 1.5, r * 0.1 * (1 - k) + 1.5)); }
  }
  ctx.scale(sc, sc);
  const hx = (hashN(seed * 3.3) - 0.5) * r * 0.45 + Math.sin(t * 2.2 + seed * 5) * r * 0.07, hy = -r * 2.1;
  ctx.lineCap = 'round';
  ctx.strokeStyle = INK; ctx.lineWidth = r * 0.3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(hx * 0.1, hy * 0.5, hx, hy); ctx.stroke();
  ctx.strokeStyle = '#6f9a3a'; ctx.lineWidth = r * 0.15; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(hx * 0.1, hy * 0.5, hx, hy); ctx.stroke();
  for (const [s, yy] of [[-1, 0.42], [1, 0.22]]) { ctx.save(); ctx.translate(hx * 0.12 * yy, hy * yy); ctx.rotate(s * 0.7); fs(ctx, el(s * r * 0.42, 0, r * 0.44, r * 0.17), '#86b650', lw); ctx.restore(); }
  ctx.save(); ctx.translate(hx, hy);
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + seed; fs(ctx, el(Math.cos(a) * r * 0.5, Math.sin(a) * r * 0.5, r * 0.44, r * 0.28, a), color, lw); }
  fs(ctx, el(0, 0, r * 0.31, r * 0.31), color === '#f4b942' || color === '#ff9a4a' ? '#c4643a' : '#ffd25a', lw);
  ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fill(el(-r * 0.08, -r * 0.1, r * 0.08, r * 0.05, -0.5));
  ctx.restore(); ctx.restore();
}
// n flowers (fractional n: the last one is blooming) scattered in an ellipse w × h around the origin (the feet); earlier flowers never move.
// part: 'back' = the ones behind the line y = 0 (draw before the actor), 'front' = the ones in front of it
function flowerField(ctx, {n = 1, total, w = 300, h = 80, r0 = 26, r1 = 38, seed = 1, t = 0, part = 'all', palette = FLOWER_COLORS} = {}) {
  const T = Math.max(1, total ?? Math.ceil(n)), whole = Math.floor(n + 1e-6), frac = n - whole, list = [];
  for (let i = 0; i < Math.ceil(n - 1e-6); i++) {
    const a = i * 2.39996 + seed * 1.7, q = Math.sqrt((i + 0.5) / T), x = Math.cos(a) * q * w / 2, y = Math.sin(a) * q * h / 2;
    list.push({x, y, r: (r0 + (r1 - r0) * hashN(i * 3.1 + seed)) * (0.85 + 0.3 * (y / Math.max(1, h) + 0.5)), k: i < whole ? 1 : frac, color: palette[(i * 3 + seed) % palette.length], i});
  }
  list.sort((a, b) => a.y - b.y);
  for (const f of list) { if (part === 'back' && f.y >= 0) continue; if (part === 'front' && f.y < 0) continue; drawFlower(ctx, f.x, f.y, f.r, {k: f.k, color: f.color, seed: f.i + seed, t}); }
}

// ---- fire, smoke, embers, snow (props animated by t)
function fireG(ctx, {t = 0, k = 1, w = 120, seed = 1} = {}) {
  if (k <= 0.01) return;
  glow(ctx, 0, -w * 0.6 * k, w * 2.6 * k, 0.55 * Math.min(1, k * 1.4), '255,150,60');
  for (let i = 0; i < 6; i++) {
    const x = (i / 5 - 0.5) * w * 0.95, fl = 0.8 + 0.2 * Math.sin(t * 9 + i * 2.1 + seed), hgt = w * (0.7 + 0.55 * hashN(i + seed * 7)) * k * fl, wd = w * 0.17 * (0.8 + k * 0.4), sw = Math.sin(t * 6 + i) * wd * 0.6;
    for (const [sc, col] of [[1, '#ff7a2a'], [0.62, '#ffc13a'], [0.3, '#fff0a0']]) {
      const p = new Path2D(); p.moveTo(x - wd * sc, 0); p.quadraticCurveTo(x - wd * sc * 1.1, -hgt * 0.5 * sc, x + sw * sc, -hgt * sc); p.quadraticCurveTo(x + wd * sc * 1.1, -hgt * 0.45 * sc, x + wd * sc, 0); p.closePath();
      if (sc === 1) fs(ctx, p, col, 4); else { ctx.fillStyle = col; ctx.fill(p); }
    }
  }
}
function smokeG(ctx, {t = 0, w = 120, h = 520, a = 0.6, speed = 0.3} = {}) {
  for (let i = 0; i < 9; i++) { const q = ((t * speed + i / 9) % 1), y = -q * h, x = Math.sin(q * 5 + i * 1.7) * w * 0.35 * (0.3 + q), r = w * (0.22 + 0.55 * q);
    ctx.fillStyle = `rgba(${70 + q * 40},${62 + q * 40},${66 + q * 40},${a * (1 - q) * Math.min(1, q * 6)})`; ctx.fill(el(x, y, r, r * 0.85)); }
}
function embersG(ctx, {t = 0, w = 300, h = 420, n = 26} = {}) {
  for (let i = 0; i < n; i++) { const q = ((t * (0.25 + 0.3 * hashN(i)) + hashN(i + 5)) % 1), x = (hashN(i + 11) - 0.5) * w + Math.sin(q * 7 + i) * 26, y = -q * h, r = 3 + hashN(i + 3) * 5 * (1 - q);
    ctx.fillStyle = `rgba(255,${150 + 80 * (1 - q) | 0},60,${1 - q})`; ctx.fill(el(x, y, r, r)); }
}
function snowG(ctx, {t = 0, n = 70} = {}) {
  for (let i = 0; i < n; i++) { const sp = 90 + hashN(i + 2) * 110, x = ((hashN(i) * 1300 + Math.sin(t * 0.8 + i) * 30) % 1180) - 50, y = ((hashN(i + 9) * 2100 + t * sp) % 2100) - 100, r = 3 + hashN(i + 4) * 5;
    ctx.fillStyle = 'rgba(255,255,255,.88)'; ctx.fill(el(x, y, r, r)); }
}

// ---- small props
const crust = '#d9a066';
function roll(ctx) { fs(ctx, el(0, 0, 30, 21), crust, 4); ctx.strokeStyle = '#a9733a'; ctx.lineWidth = 3; for (const k of [-10, 4]) { ctx.beginPath(); ctx.moveTo(k, -14); ctx.lineTo(k + 8, 10); ctx.stroke(); } }
function brickG(ctx, {n = 3} = {}) { for (let i = 0; i < n; i++) { const x = (i % 2) * 8 - 4, y = -i * 26; fs(ctx, rr(-48 + x, y - 24, 96, 24, 3), i % 2 ? '#b5552f' : '#c4643a', 4); ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-20 + x, y - 22); ctx.lineTo(-20 + x, y - 2); ctx.stroke(); } }
function flourSack(ctx) { const p = new Path2D(); p.moveTo(-50, 8); p.quadraticCurveTo(-62, -70, -38, -96); p.lineTo(38, -96); p.quadraticCurveTo(62, -70, 50, 8); p.quadraticCurveTo(0, 22, -50, 8); p.closePath(); fs(ctx, p, '#f1e6cc', 5); ctx.strokeStyle = '#9a7c52'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-36, -92); ctx.lineTo(36, -92); ctx.stroke(); ctx.fillStyle = '#c4643a'; ctx.fill(el(0, -44, 18, 22)); }
function breadBasket(ctx) { const p = new Path2D(); p.moveTo(-70, -26); p.lineTo(70, -26); p.lineTo(54, 40); p.lineTo(-54, 40); p.closePath(); fs(ctx, p, '#c48a4a', 4);
  for (const [x, y, r] of [[-36, -40, 0.2], [0, -48, -0.1], [36, -40, 0.15]]) { ctx.save(); ctx.translate(x, y); ctx.rotate(r); fs(ctx, el(0, 0, 36, 20), crust, 4); ctx.restore(); } }
function clipboardG(ctx, {marks = 10} = {}) { fs(ctx, rr(-44, -56, 88, 112, 6), '#b07a4a', 5); fs(ctx, rr(-34, -42, 68, 92, 3), '#fffdf6', 3); fs(ctx, rr(-14, -62, 28, 14, 4), '#8a8f96', 3);
  ctx.strokeStyle = INK; ctx.lineWidth = 3; for (let i = 0; i < marks; i++) { const col = i % 5, row = (i / 5) | 0; ctx.beginPath(); ctx.moveTo(-26 + col * 10, -30 + row * 18); ctx.lineTo(-26 + col * 10, -14 + row * 18); ctx.stroke(); } }
function stopwatchG(ctx) { fs(ctx, el(0, 0, 30, 30), '#e9e2d0', 5); fs(ctx, rr(-7, -42, 14, 12, 3), '#8a8f96', 3); fs(ctx, el(0, 0, 23, 23), '#fffdf6', 3); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(10, -14); ctx.stroke(); }
function crateG(ctx, {w = 200, h = 100} = {}) { fs(ctx, rr(-w / 2, -h, w, h, 6), '#4a3a34', 5); ctx.strokeStyle = '#2a211e'; ctx.lineWidth = 4; for (const y of [-h * 0.66, -h * 0.33]) { ctx.beginPath(); ctx.moveTo(-w / 2, y); ctx.lineTo(w / 2, y); ctx.stroke(); } ctx.fillStyle = 'rgba(160,160,165,.5)'; ctx.fill(el(-w * 0.15, -h, w * 0.3, 10)); }
function bakeryCounter(ctx, {w = 640} = {}) { // origin = top centre of the slab
  fs(ctx, rr(-w / 2 - 12, 0, w + 24, 36, 8), '#a56a3c', 6); fs(ctx, rr(-w / 2 + 6, 36, w - 12, 400, 6), WARM.wood, 6);
  ctx.strokeStyle = dark(WARM.wood, 0.25); ctx.lineWidth = 5; for (let x = -w / 2 + 30; x < w / 2 - 80; x += 170) ctx.strokeRect(x, 70, 130, 280);
  for (const [x, c] of [[-w * 0.36, 0.2], [-w * 0.26, -0.1], [-w * 0.31, 0.1]]) { ctx.save(); ctx.translate(x, -10 - (c > 0.1 ? 22 : 0)); fs(ctx, el(0, 0, 36, 20), crust, 4); ctx.restore(); }
  fs(ctx, rr(w * 0.3, -46, 80, 46, 8), '#d9a441', 5); ctx.fillStyle = INK; ctx.fillRect(w * 0.3 + 12, -36, 56, 12);
}
function plaqueG(ctx, {text = 'SINCE', text2 = '1986'} = {}) { fs(ctx, rr(-62, -42, 124, 84, 10), '#c9a46a', 6); ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.font = '32px GraceCaption'; ctx.fillText(text, 0, -8); ctx.font = '40px GraceCaption'; ctx.fillText(text2, 0, 30); ctx.textAlign = 'left'; }

// ---- Bruno's shopfront on Olive Street. state: 'day' | 'ruin' | 'build' (p 0..1 rises from the ash) ; time: gold | night | dawn | moon
function loaves(ctx, x, y, w) { for (let i = 0; i < 4; i++) { ctx.save(); ctx.translate(x + w * (0.14 + i * 0.24), y - 22 + (i % 2) * 4); ctx.rotate((i % 2 ? 0.12 : -0.1)); fs(ctx, el(0, 0, 44, 20), i % 2 ? '#d9a066' : '#c98a4a', 4); ctx.restore(); } }
function chimney(ctx, base, top) { fs(ctx, rr(930, top, 96, base - top, 4), '#b5552f', 6); ctx.strokeStyle = 'rgba(0,0,0,.2)'; ctx.lineWidth = 3; for (let y = top + 36; y < base; y += 36) { ctx.beginPath(); ctx.moveTo(930, y); ctx.lineTo(1026, y); ctx.stroke(); for (let x = 955 + ((y / 36 | 0) % 2) * 24; x < 1026; x += 48) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 36); ctx.stroke(); } } fs(ctx, rr(920, top - 16, 116, 22, 4), '#8a5a36', 5); }
function shopBody(ctx, {fresh = false, time = 'gold', fire = false} = {}) {
  const base = 1290, wall = fresh ? '#fbe8c4' : '#f1d9b5', night = time === 'night' || time === 'moon';
  fs(ctx, rr(60, 560, 960, base - 560, 4), wall, 6);
  ctx.fillStyle = dark(wall, 0.06); for (let i = 0; i < 9; i++) ctx.fill(el(100 + hashN(i) * 840, 600 + hashN(i + 3) * 640, 40, 14));
  fs(ctx, poly([[28, 580], [540, 370], [1052, 580], [1052, 612], [28, 612]]), fresh ? '#d9703f' : WARM.roof, 6);
  ctx.strokeStyle = dark(WARM.roof, 0.22); ctx.lineWidth = 4; for (let i = 1; i < 5; i++) { ctx.beginPath(); ctx.moveTo(40 + i * 40, 590 - i * 34); ctx.lineTo(1040 - i * 40, 590 - i * 34); ctx.stroke(); }
  chimney(ctx, 560, 300);
  fs(ctx, rr(300, 612, 480, 110, 10), '#6e4426', 6); ctx.fillStyle = '#fbf1dc'; ctx.font = '104px GraceCaption'; ctx.textAlign = 'center'; ctx.fillText("BRUNO'S", 540, 700); ctx.textAlign = 'left';
  // window with the loaves, awning, door
  fs(ctx, rr(110, 850, 440, 340, 10), WARM.cream, 6); fs(ctx, rr(128, 868, 404, 304, 6), night || fire ? (fire ? '#ff9a3a' : '#ffd77a') : '#fbe9c0', 4);
  fs(ctx, rr(128, 1010, 404, 16, 3), '#8a5a36', 4); loaves(ctx, 128, 1010, 404); fs(ctx, rr(128, 1128, 404, 16, 3), '#8a5a36', 4); loaves(ctx, 128, 1128, 404);
  ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(330, 868); ctx.lineTo(330, 1172); ctx.stroke();
  const stripes = 9, sw = 440 / stripes; for (let i = 0; i < stripes; i++) fs(ctx, poly([[110 + i * sw, 760], [110 + (i + 1) * sw, 760], [100 + (i + 1) * sw * 1.02, 850], [100 + i * sw * 1.02, 850]]), i % 2 ? '#fbf1dc' : '#c4643a', 4);
  const door = new Path2D(); door.moveTo(640, base); door.lineTo(640, 1000); door.arc(750, 1000, 110, Math.PI, 0); door.lineTo(860, base); door.closePath(); fs(ctx, door, fresh ? '#9a6a3c' : WARM.wood, 6);
  fs(ctx, el(750, 1010, 52, 62), night || fire ? (fire ? '#ff9a3a' : '#ffd77a') : '#f6e0b0', 4); ctx.fillStyle = WARM.gold; ctx.fill(el(826, 1160, 8, 8));
  fs(ctx, rr(590, 1268, 330, 36, 6), '#cfc3ae', 5); // the bare stone doorstep
  ctx.save(); ctx.translate(950, 1090); PROPS.plaqueG(ctx); ctx.restore();
}
function scaffold(ctx, p) { // poles and planks around the rising walls
  const top = 1290 - (1290 - 420) * Math.min(1, p / 0.85 + 0.15); ctx.strokeStyle = INK; ctx.lineWidth = 6;
  for (const x of [70, 330, 590, 880, 1000]) fs(ctx, rr(x - 9, top - 60, 18, 1290 - top + 70, 3), '#9a6a3c', 4);
  for (let y = 1130; y > top - 60; y -= 220) fs(ctx, rr(60, y, 960, 18, 3), '#b07a4a', 4);
}
function ruin(ctx, {time = 'dawn'} = {}) {
  const base = 1290, char = '#3a302e', char2 = '#5a4a44';
  // charred wall stumps with jagged tops
  fs(ctx, poly([[60, base], [60, 1010], [110, 980], [150, 1040], [200, 960], [250, 1030], [262, 1060], [262, base]]), '#8f7e6e', 6);
  fs(ctx, poly([[790, base], [790, 880], [840, 840], [880, 930], [930, 870], [1020, 920], [1020, base]]), '#8f7e6e', 6);
  ctx.fillStyle = 'rgba(30,22,20,.45)'; for (const [x, y, w, h] of [[60, 1000, 200, 290], [800, 860, 220, 430]]) ctx.fillRect(x, y, w, h);
  chimney(ctx, base, 520); ctx.fillStyle = 'rgba(30,22,20,.4)'; ctx.fillRect(930, 520, 96, base - 520);
  // leaning charred beams
  for (const [x1, y1, x2, y2, w] of [[250, base - 20, 470, 1010, 26], [650, base - 10, 560, 940, 24], [380, base - 6, 700, 1090, 22], [820, 880, 660, 1010, 22]]) {
    ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = w + 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.strokeStyle = char; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore(); }
  // the sign, fallen and charred
  ctx.save(); ctx.translate(430, 1262); ctx.rotate(-0.12); fs(ctx, rr(-150, -52, 300, 96, 8), char2, 6); ctx.fillStyle = '#d9c9a8'; ctx.font = '84px GraceCaption'; ctx.textAlign = 'center'; ctx.fillText('BRU', -52, 22); ctx.textAlign = 'left'; ctx.restore();
  // ash heaps and the step
  ctx.fillStyle = '#6d6764'; ctx.strokeStyle = INK; ctx.lineWidth = 5;
  for (const [x, w, h] of [[200, 300, 90], [520, 340, 120], [860, 280, 80]]) { ctx.beginPath(); ctx.ellipse(x, base + 6, w / 2, h / 2, 0, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  fs(ctx, rr(590, 1268, 330, 36, 6), '#b9ad98', 5);
}
SETS_GRACE_BAKERY();
function SETS_GRACE_BAKERY() {
  const street = (ctx, time) => { sky(ctx, time); fs(ctx, poly([[0, 1010], [180, 930], [420, 990], [700, 900], [1080, 980], [1080, 1300], [0, 1300]]), time === 'night' || time === 'moon' ? '#4c3a52' : '#d9b27a', 4); };
  Object.assign(SETS, {
    gBakery({state = 'day', time = 'gold', p = 1, fresh = false, fire = false} = {}) {
      return ctx => {
        const night = time === 'night' || time === 'moon';
        street(ctx, time);
        if (state === 'ruin') { cobbles(ctx, 1290, '#cdb792', night); ctx.fillStyle = 'rgba(95,90,92,.5)'; ctx.fillRect(0, 1294, 1080, 626); ruin(ctx, {time}); }
        else if (state === 'build') {
          cobbles(ctx, 1290, '#dcc29a', night);
          const ash = Math.max(0, 1 - p * 3); if (ash > 0.02) { ctx.save(); ctx.globalAlpha = ash; ctx.fillStyle = '#6d6764'; for (const [x, w, h] of [[200, 300, 90], [520, 340, 120], [860, 280, 80]]) ctx.fill(el(x, 1296, w / 2, h / 2 * ash)); ctx.restore(); }
          const rise = Math.min(1, p / 0.85), top = 1290 - (1290 - 290) * rise;
          ctx.save(); ctx.beginPath(); ctx.rect(0, top, 1080, 2000); ctx.clip(); shopBody(ctx, {fresh: true, time}); ctx.restore();
          if (p < 0.99) scaffold(ctx, p);
          if (p < 0.5) { ctx.save(); ctx.translate(120, 1330); brickG(ctx, {n: 4}); ctx.translate(120, 0); brickG(ctx, {n: 3}); ctx.restore(); }
        } else {
          shopBody(ctx, {fresh, time, fire}); cobbles(ctx, 1290, '#dcc29a', night);
          fs(ctx, rr(590, 1268, 330, 36, 6), '#cfc3ae', 5);
        }
        olive(ctx, 40, 1320, 0.8);
        if (SHADE[time]) { ctx.fillStyle = SHADE[time]; ctx.fillRect(0, 0, 1080, 1920); }
        if (time === 'night' || time === 'moon') { ctx.fillStyle = 'rgba(20,12,40,.22)'; ctx.fillRect(0, 0, 1080, 1920); }
        if (fire) { glow(ctx, 330, 1020, 600, 0.55, '255,140,50'); glow(ctx, 750, 1000, 420, 0.4, '255,140,50'); }
        if (state === 'ruin') { ctx.fillStyle = 'rgba(110,105,120,.18)'; ctx.fillRect(0, 0, 1080, 1920); }
      };
    },
    // inside the bakery: a brick oven on the left, shelves of bread on the right, a window. time: day | dawn | night; fire 0..1 = the oven's glow
    gBakeryIn({time = 'day', fire = 0} = {}) {
      return ctx => {
        const dawn = time === 'dawn', night = time === 'night';
        room(ctx, dawn ? '#e6cfae' : '#f3dcb2', '#c98f5a', '#b98a5e');
        windowPane(ctx, 700, 360, 280, 330, dawn ? 'dawn' : night ? 'night' : 'noon');
        // brick oven
        fs(ctx, rr(40, 640, 480, 660, 20), '#b5552f', 7); ctx.strokeStyle = 'rgba(0,0,0,.2)'; ctx.lineWidth = 4;
        for (let y = 680; y < 1290; y += 44) { ctx.beginPath(); ctx.moveTo(40, y); ctx.lineTo(520, y); ctx.stroke(); for (let x = 70 + ((y / 44 | 0) % 2) * 40; x < 520; x += 80) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 44); ctx.stroke(); } }
        const mouth = new Path2D(); mouth.moveTo(130, 1250); mouth.lineTo(130, 1000); mouth.arc(280, 1000, 150, Math.PI, 0); mouth.lineTo(430, 1250); mouth.closePath(); fs(ctx, mouth, fire > 0 ? mix('#2a1a16', '#ff7a2a', Math.min(1, fire)) : '#2a1a16', 7);
        if (fire <= 0) { ctx.fillStyle = '#ff9a3a'; for (const [x, y] of [[220, 1215], [300, 1230], [350, 1210]]) ctx.fill(el(x, y, 16, 10)); } // a few embers
        fs(ctx, rr(180, 470, 130, 190, 6), '#8a5a36', 6); fs(ctx, rr(150, 450, 190, 34, 6), '#6e4426', 5);
        // shelves with bread
        for (const y of [520, 790]) { fs(ctx, rr(580, y, 460, 26, 6), WARM.woodD, 5); for (let i = 0; i < 5; i++) { ctx.save(); ctx.translate(620 + i * 90, y - 24); ctx.rotate(i % 2 ? 0.2 : -0.15); fs(ctx, i % 2 ? el(0, 0, 38, 18) : rr(-36, -14, 72, 26, 12), i % 2 ? '#d9a066' : '#c98a4a', 4); ctx.restore(); } }
        fs(ctx, rr(580, 1090, 460, 26, 6), WARM.woodD, 5); for (let i = 0; i < 4; i++) { fs(ctx, rr(620 + i * 100, 1030, 56, 60, 22), '#f1e6cc', 4); }
        glow(ctx, 280, 1100, 360, 0.18 + 0.5 * Math.min(1, fire), '255,150,60');
        if (dawn) { ctx.fillStyle = 'rgba(90,100,150,.20)'; ctx.fillRect(0, 0, 1080, 1920); }
        if (night) { ctx.fillStyle = 'rgba(40,20,50,.38)'; ctx.fillRect(0, 0, 1080, 1920); glow(ctx, 280, 1100, 460, 0.45 + 0.4 * Math.min(1, fire), '255,150,60'); }
      };
    },
    // a bus (side view, facing right) at the stop: honey body, a cab window at x 490..680 (the driver is an actor behind the prop busCab)
    gBus({time = 'gold'} = {}) {
      return ctx => {
        street(ctx, time);
        for (const [x, w, top, c] of [[760, 280, 700, WARM.plaster[2]]]) { fs(ctx, rr(x, top, w, 1290 - top, 4), c, 6); fs(ctx, poly([[x - 24, top + 6], [x + w / 2, top - 110], [x + w + 24, top + 6]]), WARM.roof, 6); }
        olive(ctx, 1010, 1320, 0.8);
        cobbles(ctx, 1290, '#dcc29a', time === 'night');
        // the bus
        fs(ctx, rr(-80, 640, 810, 650, 70), '#f4b942', 7);
        fs(ctx, rr(-80, 1080, 810, 60, 0), '#c4643a', 5);
        for (let i = 0; i < 4; i++) fs(ctx, rr(-30 + i * 118, 700, 100, 170, 14), '#dfe8d6', 5);
        fs(ctx, rr(330, 700, 130, 560, 12), '#a8691f', 6); fs(ctx, rr(345, 716, 100, 220, 8), '#dfe8d6', 4); fs(ctx, rr(345, 960, 100, 270, 8), '#dfe8d6', 4); // the door
        fs(ctx, rr(480, 690, 220, 215, 14), '#f7e6c0', 6);
        fs(ctx, el(690, 1180, 16, 26), '#fff3c4', 4);
        for (const x of [130, 610]) { fs(ctx, el(x, 1290, 100, 100), '#2a211e', 7); fs(ctx, el(x, 1290, 46, 46), '#d9c9a8', 5); }
        fs(ctx, rr(860, 760, 14, 530, 4), '#3c2c24', 4); fs(ctx, el(867, 740, 56, 56), '#c4643a', 6); ctx.fillStyle = WARM.cream; ctx.font = '70px GraceCaption'; ctx.textAlign = 'center'; ctx.fillText('BUS', 867, 764); ctx.textAlign = 'left';
        if (SHADE[time]) { ctx.fillStyle = SHADE[time]; ctx.fillRect(0, 0, 1080, 1920); }
      };
    },
    // a sunny garden for a lunch/play scene with a long fence of vine; characters stand on cobbles y>=1300
    gYard({time = 'noon'} = {}) {
      return ctx => {
        sky(ctx, time);
        fs(ctx, poly([[0, 1000], [300, 930], [640, 980], [1080, 920], [1080, 1300], [0, 1300]]), '#c9b06a', 4);
        fs(ctx, rr(-20, 1000, 1120, 300, 0), '#e7c08a', 6); for (let x = 20; x < 1080; x += 90) fs(ctx, rr(x, 1000, 70, 300, 4), WARM.woodD, 4);
        for (let i = 0; i < 14; i++) fs(ctx, el(40 + i * 80, 990, 46, 30, i * 0.5), i % 3 ? WARM.olive : '#5f7339', 3);
        olive(ctx, 150, 1320, 1.05); olive(ctx, 960, 1330, 1.0);
        ctx.fillStyle = '#d8b27e'; ctx.fillRect(0, 1300, 1080, 620); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 1300); ctx.lineTo(1080, 1300); ctx.stroke();
        ctx.fillStyle = 'rgba(120,80,40,.12)'; for (let i = 0; i < 40; i++) ctx.fill(el(hashN(i) * 1080, 1320 + hashN(i + 3) * 580, 30, 6));
      };
    },
  });
  // a final card plate with a flower meadow along the bottom (the verse sits above it)
  SETS.gVerseMeadow = () => ctx => {
    SETS.gVerse()(ctx);
    for (let i = 0; i < 26; i++) { const x = 40 + (i / 25) * 1000 + (hashN(i) - 0.5) * 40, y = 1760 + hashN(i + 3) * 140; drawFlower(ctx, x, y, 32 + hashN(i + 5) * 14, {color: FLOWER_COLORS[i % 8], seed: i, k: 1}); }
  };
}
Object.assign(PROPS, {
  flowerG(ctx, {k = 1, r = 40, color = '#e2574c', seed = 1, t = 0} = {}) { drawFlower(ctx, 0, 0, r, {k, color, seed, t}); },
  flowerField(ctx, a = {}) { flowerField(ctx, a); },
  // a dining table with a cloth hanging to the floor (origin = top centre of the slab): hides the legs of whoever stands behind it
  tableG(ctx, {w = 720} = {}) { fs(ctx, rr(-w / 2, 40, w - 40, 300, 6), '#f3e4c4', 6); ctx.strokeStyle = '#c98f5a'; ctx.lineWidth = 6; for (let x = -w / 2 + 40; x < w / 2 - 50; x += 80) { ctx.beginPath(); ctx.moveTo(x, 70); ctx.lineTo(x, 330); ctx.stroke(); } fs(ctx, rr(-w / 2 - 14, 0, w, 44, 10), WARM.wood, 6); },
  fireG, smokeG, embersG, snowG, roll, brickG, flourSack, breadBasket, clipboardG, stopwatchG, crateG, bakeryCounter, plaqueG,
  // the bus's front panel + steering wheel, drawn right after the driver actor so the lower body is hidden behind it
  busCab(ctx) { fs(ctx, rr(470, 900, 250, 380, 20), '#f4b942', 7); fs(ctx, rr(470, 896, 250, 14, 4), '#a8691f', 5); fs(ctx, el(560, 898, 54, 18), '#2a211e', 5); },
});
