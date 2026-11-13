// R1 · grace-remains ep10 "The Bridge": the ground that cracks open between two people (a chasm), the plank bridge drawn plank by
// plank from a list ({i, k}: plank i of `total`, k = 0..1 falling in), Willow Creek (Walt's hill on the left, Gus's flat-roofed
// house on the right), the spring flood that rises over the field, the porch and the roof, a goat, a fence at dusk, a fishing rod
// and the small props of the comedy (TV, pens, bread). Registered into SETS/PROPS on import. Side view throughout.
import {Path2D} from '@napi-rs/canvas';
import {INK, mix, dark, light} from './r1-rig.mjs';
import {SETS, PROPS} from './r1-world.mjs';
import {fs, rr, el, poly, hashN, glow, olive, sky, cottage, WARM} from './r1-world-grace.mjs';
import {drawCloud} from './r1-world-grace-clouds.mjs';

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const eio = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const EARTH = ['#cf9a62', '#c18a55', '#b27a48', '#9c6640'];
export const CREEK = {hillTop: 1200, hillEdge: 190, field: 1620, bedY: 1790, terraceX: 740, bridgeY: 1200};
const hillX = y => CREEK.hillEdge + clamp((y - CREEK.hillTop) / 560) * 140; // the hill's right face (x at depth y)

// ---- shared ground drawing: earth with strata, grass cap, tufts
function earthBand(ctx, x0, x1, y0, y1, cap = true, shade = 0) {
  ctx.fillStyle = EARTH[1]; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
  for (let i = 0; i < 4; i++) { ctx.fillStyle = EARTH[i]; ctx.globalAlpha = 0.55; ctx.beginPath(); ctx.moveTo(x0, y0 + 60 + i * 90); for (let x = x0; x <= x1; x += 20) ctx.lineTo(x, y0 + 60 + i * 90 + Math.sin(x / 70 + i * 2) * 10); ctx.lineTo(x1, y1); ctx.lineTo(x0, y1); ctx.fill(); }
  ctx.globalAlpha = 1; ctx.fillStyle = 'rgba(80,45,20,.22)'; for (let i = 0; i < 18; i++) ctx.fill(el(x0 + hashN(i + x0) * (x1 - x0), y0 + 50 + hashN(i * 3 + x0) * (y1 - y0 - 80), 26, 9));
  if (cap) { ctx.fillStyle = WARM.olive; ctx.fillRect(x0, y0, x1 - x0, 26); ctx.fillStyle = WARM.oliveD; ctx.fillRect(x0, y0 + 18, x1 - x0, 8); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke();
    ctx.strokeStyle = WARM.oliveD; ctx.lineWidth = 4; ctx.lineCap = 'round'; for (let x = x0 + 14; x < x1; x += 38) { ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x - 5, y0 - 14); ctx.moveTo(x + 6, y0); ctx.lineTo(x + 10, y0 - 12); ctx.stroke(); } }
  if (shade) { ctx.fillStyle = `rgba(40,30,50,${shade})`; ctx.fillRect(x0, y0, x1 - x0, y1 - y0); }
}
function mesas(ctx, tm, y = 1400) {
  const dusk = tm === 'dusk', c1 = dusk ? '#9a5560' : tm === 'dawn' ? '#e9a98a' : '#e6b27a', c2 = dusk ? '#7e4452' : tm === 'dawn' ? '#dd9a7c' : '#d79f68';
  fs(ctx, poly([[-10, y], [-10, y - 170], [120, y - 215], [250, y - 175], [330, y - 120], [420, y]]), c1, 4);
  fs(ctx, poly([[560, y], [640, y - 130], [760, y - 250], [900, y - 262], [1010, y - 170], [1090, y - 190], [1090, y]]), c2, 4);
  fs(ctx, poly([[300, y], [420, y - 80], [560, y - 100], [700, y]]), mix(c1, '#fff4dc', 0.25), 4);
}

// ---- the ground set of the comedy: flat honey-lit earth at y = 1400 (the chasm is the `chasmG` prop that opens in it).
// v: background — 1 bakery row, 2 olive trees, 3 a cottage
const GAP_SETS = {
  gbGround({time = 'gold', v = 1} = {}) {
    return ctx => {
      sky(ctx, time); mesas(ctx, time);
      if (v === 1) { cottage(ctx, 760, 300, 1150, 1400, WARM.plaster[2], {door: true}); fs(ctx, rr(790, 1090, 240, 56, 8), WARM.wood, 5); ctx.fillStyle = WARM.cream; ctx.font = '48px GraceCaption'; ctx.textAlign = 'center'; ctx.fillText('BREAD', 910, 1132); ctx.textAlign = 'left'; olive(ctx, 40, 1400, 0.9); }
      if (v === 2) { olive(ctx, 90, 1400, 1.0); olive(ctx, 980, 1400, 1.1); olive(ctx, 800, 1400, 0.7); }
      if (v === 3) { cottage(ctx, 40, 280, 1160, 1400, WARM.plaster[0], {door: false}); olive(ctx, 1000, 1400, 1.0); }
      earthBand(ctx, -10, 1090, 1400, 1930);
      if (time === 'dusk' && SHADE_DUSK) { ctx.fillStyle = SHADE_DUSK; ctx.fillRect(0, 0, 1080, 1920); }
    };
  },
  // dusk farm 40 years ago: a long wooden fence across the frame (one man in front of it, one behind), the barn, the low sun
  gbFarm({time = 'dusk'} = {}) {
    return ctx => {
      sky(ctx, time); ctx.fillStyle = 'rgba(255,214,140,.55)'; ctx.fill(el(540, 1180, 330, 330)); ctx.fillStyle = '#ffe2a0'; ctx.fill(el(540, 1180, 150, 150));
      mesas(ctx, time, 1300);
      fs(ctx, rr(740, 980, 300, 330, 6), '#b5483a', 6); fs(ctx, poly([[720, 990], [890, 880], [1060, 990]]), '#8a3a2e', 6); fs(ctx, rr(840, 1130, 100, 180, 4), '#6e2e24', 4);
      olive(ctx, 120, 1330, 0.9);
      ctx.fillStyle = '#9e8f4e'; ctx.fillRect(0, 1300, 1080, 620); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 1300); ctx.lineTo(1080, 1300); ctx.stroke();
      ctx.strokeStyle = 'rgba(80,70,30,.5)'; ctx.lineWidth = 4; for (let r = 0; r < 9; r++) { const yy = 1350 + r * r * 5 + r * 14; ctx.beginPath(); for (let x = -10; x <= 1090; x += 14) ctx.lineTo(x, yy + Math.sin(x / 60 + r) * 5); ctx.stroke(); }
      ctx.fillStyle = 'rgba(120,50,50,.14)'; ctx.fillRect(0, 0, 1080, 1920);
    };
  },
};
const SHADE_DUSK = 'rgba(120,40,40,.16)';

// ---- Willow Creek, side view. Walt's hill (left, top y 1200), the creek, Gus's field (y 1620) and his flat-roofed house (right,
// terrace y 1200). time: gold | dawn | storm. The water of the flood is the `floodG` prop (it covers this plate).
const CREEK_SETS = {
  gbCreek({time = 'gold'} = {}) {
    return ctx => {
      const storm = time === 'storm', clear = time === 'clear';
      if (clear) { // the storm breaks: pale gold behind thin grey, light on the water
        const g = ctx.createLinearGradient(0, 0, 0, 1500); g.addColorStop(0, '#d9d2c2'); g.addColorStop(1, '#f7e3b6'); ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920); glow(ctx, 640, 700, 800, 0.5, '255,240,200');
        for (const [x, y, r] of [[160, 140, 150], [560, 90, 170], [930, 170, 150]]) drawCloud(ctx, x, y, r, {body: '#e3dfd6', belly: '#c8c4bb', lw: 5});
      } else if (storm) {
        const g = ctx.createLinearGradient(0, 0, 0, 1500); g.addColorStop(0, '#7b7d86'); g.addColorStop(1, '#b3b0ab'); ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
        for (const [x, y, r] of [[120, 120, 190], [420, 60, 230], [760, 140, 220], [1020, 80, 200], [260, 380, 170], [640, 420, 190], [940, 440, 160]]) drawCloud(ctx, x, y, r, {body: '#8b8d96', belly: '#6e7079', lw: 6});
      } else sky(ctx, time, 1500);
      const far = clear ? ['#dcbd90', '#cfa774'] : storm ? ['#a9a190', '#98907f'] : time === 'dawn' ? ['#e9a98a', '#dd9a7c'] : ['#e6b27a', '#d79f68'];
      fs(ctx, poly([[-10, 1500], [-10, 1230], [190, 1180], [380, 1300], [560, 1230], [800, 1330], [1090, 1210], [1090, 1500]]), far[0], 4);
      fs(ctx, poly([[300, 1620], [420, 1440], [600, 1400], [760, 1500], [900, 1440], [1090, 1500], [1090, 1700], [300, 1700]]), far[1], 4);
      // creek bed: the V between the two banks, dry earth with a thin low stream
      const bed = new Path2D(); bed.moveTo(hillX(1200) + 20, 1200); bed.lineTo(hillX(1760), 1790); bed.lineTo(560, 1790); bed.lineTo(600, CREEK.field); bed.lineTo(1090, CREEK.field); bed.lineTo(1090, 1930); bed.lineTo(-10, 1930); bed.closePath();
      ctx.fillStyle = EARTH[2]; ctx.fill(bed);
      // Walt's hill
      const hill = new Path2D(); hill.moveTo(-10, 1930); hill.lineTo(-10, CREEK.hillTop); hill.lineTo(CREEK.hillEdge, CREEK.hillTop); hill.lineTo(hillX(1760), 1790); hill.lineTo(hillX(1760) + 20, 1930); hill.closePath();
      ctx.save(); ctx.clip(hill); earthBand(ctx, -10, 420, CREEK.hillTop, 1930, false); ctx.restore();
      ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.stroke(hill); ctx.restore();
      ctx.fillStyle = WARM.olive; ctx.fillRect(-10, CREEK.hillTop, CREEK.hillEdge + 10, 24); ctx.fillStyle = WARM.oliveD; ctx.fillRect(-10, CREEK.hillTop + 16, CREEK.hillEdge + 10, 8); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-10, CREEK.hillTop); ctx.lineTo(CREEK.hillEdge, CREEK.hillTop); ctx.stroke();
      // Walt's barn on the hill, a fence
      fs(ctx, rr(-60, 1010, 170, 190, 4), '#b5483a', 5); fs(ctx, poly([[-70, 1020], [25, 940], [120, 1020]]), '#8a3a2e', 5); fs(ctx, rr(-10, 1090, 70, 110, 3), '#6e2e24', 4);
      // Gus's field and the cracked bank
      ctx.save(); ctx.beginPath(); ctx.rect(560, CREEK.field, 540, 320); ctx.clip(); earthBand(ctx, 560, 1090, CREEK.field, 1930, false); ctx.restore();
      ctx.fillStyle = '#8fa24f'; ctx.fillRect(590, CREEK.field, 500, 24); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(560, 1790); ctx.lineTo(600, CREEK.field); ctx.lineTo(1090, CREEK.field); ctx.stroke();
      ctx.strokeStyle = '#6e7f3a'; ctx.lineWidth = 6; ctx.lineCap = 'round'; for (let x = 640; x < 740; x += 24) { ctx.beginPath(); ctx.moveTo(x, CREEK.field); ctx.lineTo(x - 4, CREEK.field - 36); ctx.moveTo(x + 8, CREEK.field); ctx.lineTo(x + 14, CREEK.field - 30); ctx.stroke(); } // the crop rows
      // the creek itself (low): a sage-teal ribbon at the bottom of the V
      fs(ctx, poly([[hillX(1760) + 6, 1790], [575, 1790], [585, 1840], [hillX(1760) + 30, 1840]]), '#8bb5a0', 4); ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 3; for (let x = 360; x < 560; x += 46) { ctx.beginPath(); ctx.moveTo(x, 1812); ctx.lineTo(x + 24, 1812); ctx.stroke(); }
      // Gus's house: two-storey plaster block with a flat roof terrace (parapet), a door under a small porch roof
      const hx = CREEK.terraceX, top = 1200;
      fs(ctx, rr(hx, top, 390, CREEK.field - top, 6), storm ? '#d6c3a4' : WARM.plaster[2], 6);
      ctx.fillStyle = dark(WARM.plaster[2], 0.07); for (let i = 0; i < 8; i++) ctx.fill(el(hx + 30 + hashN(i * 2) * 330, top + 50 + hashN(i + 9) * 340, 26, 10));
      fs(ctx, rr(hx - 12, top - 34, 414, 38, 6), mix(WARM.plaster[2], '#ffffff', 0.3), 5); // parapet
      for (const wx of [hx + 40, hx + 250]) { fs(ctx, rr(wx - 8, top + 70, 100, 130, 8), WARM.cream, 4); fs(ctx, rr(wx, top + 78, 84, 114, 4), '#4a3a3e', 4); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(wx + 42, top + 78); ctx.lineTo(wx + 42, top + 192); ctx.moveTo(wx, top + 135); ctx.lineTo(wx + 84, top + 135); ctx.stroke(); }
      const dx = hx + 170, dw = 110, dy = CREEK.field - 190, d = new Path2D(); d.moveTo(dx, CREEK.field); d.lineTo(dx, dy + dw / 2); d.arc(dx + dw / 2, dy + dw / 2, dw / 2, Math.PI, 0); d.lineTo(dx + dw, CREEK.field); d.closePath(); fs(ctx, d, '#8a4a3a', 5);
      fs(ctx, poly([[dx - 70, 1470], [dx + dw + 70, 1470], [dx + dw + 40, 1430], [dx - 40, 1430]]), WARM.roof, 5); for (const px of [dx - 56, dx + dw + 48]) fs(ctx, rr(px - 7, 1470, 14, CREEK.field - 1470, 3), WARM.woodD, 4); // the porch
      if (storm) { ctx.fillStyle = 'rgba(70,78,96,.20)'; ctx.fillRect(0, 0, 1080, 1920); }
      if (time === 'dawn') { glow(ctx, 520, 1010, 700, 0.35, '255,226,150'); }
    };
  },
};
Object.assign(SETS, GAP_SETS, CREEK_SETS);

// ================= props
// the chasm opening in the ground (k 0..1, centre cx, half-width hw at y = 1400): jagged lips, strata, dark depth, falling pebbles
function chasmG(ctx, {k = 1, cx = 540, hw = 170, y = 1400, t = 0} = {}) {
  const e = clamp(k), half = hw * (e < 1 ? 1 - (1 - e) * (1 - e) : 1) + (e > 0 ? 6 : 0); if (e <= 0) return;
  const x0 = cx - half, x1 = cx + half, H = 1930 - y;
  const jag = (x, sg) => { const pts = []; for (let i = 0; i <= 10; i++) pts.push([x + sg * (Math.sin(i * 1.9 + sg) * 12 + (i % 2) * 8 + i * 2.2 * (e < 1 ? 1 : 0.4)), y + i * H / 10]); return pts; };
  const L = jag(x0, -1), R = jag(x1, 1), p = new Path2D(); p.moveTo(L[0][0], y - 3); for (const q of L) p.lineTo(...q); p.lineTo(R[10][0], 1930); for (let i = 10; i >= 0; i--) p.lineTo(...R[i]); p.lineTo(R[0][0], y - 3); p.closePath();
  const g = ctx.createLinearGradient(0, y, 0, 1930); g.addColorStop(0, '#8a5a40'); g.addColorStop(0.35, '#5a3a30'); g.addColorStop(1, '#241418'); ctx.fillStyle = g; ctx.fill(p);
  ctx.save(); ctx.clip(p); ctx.strokeStyle = 'rgba(30,16,16,.45)'; ctx.lineWidth = 4; for (let i = 1; i < 9; i++) { ctx.beginPath(); ctx.moveTo(x0 - 30, y + i * 60); for (let x = x0 - 30; x <= x1 + 30; x += 30) ctx.lineTo(x, y + i * 60 + Math.sin(x / 50 + i) * 8); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,200,140,.12)'; ctx.fillRect(x0, y, half * 2, 90); ctx.restore();
  ctx.lineJoin = 'round'; ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke(p);
  if (e < 1) { ctx.fillStyle = 'rgba(236,214,173,.8)'; for (let i = 0; i < 12; i++) { const q = (t * 3 + hashN(i)) % 1; ctx.beginPath(); ctx.arc(cx + (hashN(i + 3) - 0.5) * half * 2, y + q * 380, 5 + hashN(i + 8) * 7, 0, 7); ctx.fill(); } }
}

// the bridge: x0..x1 split into `total` planks; planks = [{i, k}] present (k < 1 = still falling in). stringer = a beam under the deck.
// rail = rope handrail over each run of planks. heads = the two posts at the ends. th = plank thickness. Origin = world (0, 0).
function bridgeG(ctx, {x0 = 370, x1 = 710, y = 1400, total = 7, planks = [], stringer = false, rail = false, heads = true, th = 26, tilt = 0, t = 0, drop = 260, fat = 0} = {}) {
  const w0 = (x1 - x0) / total, half = total / 2, wi = i => fat && i < half ? fat : w0, X = i => fat && i < half ? x0 + i * fat : x0 + i * w0, w = w0, thin = w0 < 14 && !fat, cols = ['#d9a066', '#c98f5a', '#e0ad74'], lw = thin ? 2.4 : 4;
  if (heads) for (const [px, sg] of [[x0 - 12, -1], [x1 + 12, 1]]) { fs(ctx, rr(px - 11, y - 52, 22, 78, 5), WARM.woodD, 4); fs(ctx, el(px + sg * 0, y - 52, 13, 8), '#8a5a36', 3); }
  const full = planks.filter(p => p.k >= 1).map(p => p.i).sort((a, b) => a - b);
  if (stringer && full.length) { let a = full[0], b = a; const runs = []; for (const i of full.slice(1)) { if (i === b + 1) b = i; else { runs.push([a, b]); a = b = i; } } runs.push([a, b]); for (const [a2, b2] of runs) fs(ctx, rr(X(a2) - 2, y + th - 3, X(b2) + wi(b2) - X(a2) + 4, 9, 3), WARM.woodD, 2.6); }
  for (const {i, k} of [...planks].sort((a, b) => a.k - b.k)) {
    const kk = clamp(k), fall = kk < 1 ? -(1 - kk) * (1 - kk) * drop : 0, a = kk < 1 ? clamp(kk * 3) : 1, pw = wi(i), pth = fat && i < half ? Math.max(th, 30) : th, x = X(i), s = kk < 1 ? 1.25 : 1;
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(x + pw / 2, y + th / 2 + fall); ctx.rotate(kk < 1 ? (1 - kk) * 0.6 * (i % 2 ? 1 : -1) : tilt); ctx.scale(s, s);
    const big = pw > 30; fs(ctx, rr(-pw / 2 + 0.7, -pth / 2, pw - 1.4, pth, thin ? 2 : 5), cols[i % 3], lw);
    if (!thin) { ctx.strokeStyle = 'rgba(90,55,25,.5)'; ctx.lineWidth = big ? 3.5 : 3; ctx.beginPath(); if (big) { for (const [fy, a1, b1] of [[-0.28, -0.38, 0.4], [0.02, -0.42, 0.3], [0.3, -0.3, 0.42]]) { ctx.moveTo(pw * a1, pth * fy); ctx.quadraticCurveTo(0, pth * fy + 3, pw * b1, pth * fy - 1); } } else { ctx.moveTo(-pw * 0.2, -pth * 0.25); ctx.lineTo(pw * 0.22, -pth * 0.25); ctx.moveTo(-pw * 0.25, pth * 0.15); ctx.lineTo(pw * 0.15, pth * 0.15); } ctx.stroke(); fs(ctx, el(-pw * 0.36, 0, big ? 4.5 : 3.5, big ? 4.5 : 3.5), INK, 0); fs(ctx, el(pw * 0.36, 0, big ? 4.5 : 3.5, big ? 4.5 : 3.5), INK, 0); }
    ctx.restore();
  }
  if (rail && full.length) { let a = full[0], b = a; const runs = []; for (const i of full.slice(1)) { if (i === b + 1) b = i; else { runs.push([a, b]); a = b = i; } } runs.push([a, b]);
    for (const [a2, b2] of runs) { const xa = X(a2) + 3, xb = X(b2) + wi(b2) - 3, n = Math.max(1, Math.round((xb - xa) / 90)), xs = Array.from({length: n + 1}, (_, q) => xa + (xb - xa) * q / n);
      ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); xs.forEach((px, q) => q ? ctx.quadraticCurveTo((xs[q - 1] + px) / 2, y - 62 + 16, px, y - 70) : ctx.moveTo(px, y - 70)); ctx.stroke();
      ctx.strokeStyle = '#d9b98a'; ctx.lineWidth = 3.5; ctx.beginPath(); xs.forEach((px, q) => q ? ctx.quadraticCurveTo((xs[q - 1] + px) / 2, y - 62 + 16, px, y - 70) : ctx.moveTo(px, y - 70)); ctx.stroke();
      for (const px of xs) fs(ctx, rr(px - 4, y - 74, 8, 78, 2), WARM.woodD, 2.6); }
  }
}

// a goat, origin at the feet, facing dir. eat 0..1 lowers the head, bleat 0..1 opens the mouth, walk makes it trot, fish = a fish in its mouth
function goatG(ctx, {t = 0, dir = 1, eat = 0, bleat = 0, walk = 0, fish = 0, s = 1, panic = 0} = {}) {
  ctx.save(); ctx.scale(dir * s, s); const bob = walk ? -Math.abs(Math.sin(t * 9)) * 7 : Math.sin(t * 3) * 1.4 + (panic ? Math.sin(t * 22) * 2 : 0);
  const body = '#e9dcc3', patch = '#9a8468', hoof = '#3a2a24';
  const leg = (x, ph, c) => { const a = walk ? Math.sin(t * 9 + ph) * 16 : 0; ctx.save(); ctx.translate(x, -64 + bob); ctx.rotate(a * Math.PI / 180); fs(ctx, rr(-9, 0, 18, 66, 7), c, 4); fs(ctx, rr(-10, 58, 20, 12, 4), hoof, 3); ctx.restore(); };
  leg(-70, 0, '#d9c8a8'); leg(62, Math.PI, '#d9c8a8');
  ctx.save(); ctx.translate(-104, -128 + bob); ctx.rotate(Math.sin(t * 7) * 0.2 - 0.3); fs(ctx, poly([[0, 0], [30, -34], [24, 10]]), body, 3.5); ctx.restore(); // tail
  fs(ctx, rr(-108, -158 + bob, 208, 104, 46), body, 5);
  ctx.save(); ctx.clip(rr(-108, -158 + bob, 208, 104, 46)); ctx.fillStyle = patch; ctx.globalAlpha = 0.32; ctx.fillRect(-120, -100 + bob, 230, 40); ctx.restore();
  leg(-38, Math.PI, body); leg(92, 0, body);
  const hx = 118, hy = -176 + bob + eat * 74, rot = eat * 0.55 - (bleat ? 0.28 : 0);
  fs(ctx, poly([[70, -150 + bob], [96, -168 + bob], [hx + 6, hy + 8], [hx - 24, hy + 30]]), body, 4.5); // neck
  ctx.save(); ctx.translate(hx, hy); ctx.rotate(rot);
  for (const hdx of [-8, 14]) { ctx.strokeStyle = INK; ctx.lineWidth = 19; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(hdx, -22); ctx.quadraticCurveTo(hdx - 2, -122, hdx - 58, -112); ctx.stroke(); ctx.strokeStyle = '#e0cf9e'; ctx.lineWidth = 11; ctx.beginPath(); ctx.moveTo(hdx, -22); ctx.quadraticCurveTo(hdx - 2, -122, hdx - 58, -112); ctx.stroke(); }
  fs(ctx, el(-22, -6, 22, 12, -0.7), '#e8d3b0', 3.5); // ear
  fs(ctx, el(0, 0, 38, 30, 0.1), body, 5); fs(ctx, rr(14, -4, 52, 36, 16), '#ecdcc0', 4.5); // head and muzzle
  const jaw = bleat ? 14 + Math.sin(t * 20) * 4 : eat ? Math.abs(Math.sin(t * 11)) * 9 : 0; if (jaw) { fs(ctx, el(48, 24 + jaw * 0.3, 20, 5 + jaw * 0.6), '#5a2a2a', 3); }
  ctx.fillStyle = INK; ctx.fill(el(60, 6, 4, 3)); ctx.fill(el(22, -8, 5.5, 7)); ctx.fillStyle = '#e6d255'; ctx.fill(el(22, -8, 3.4, 4.6)); ctx.fillStyle = INK; ctx.fill(el(22.6, -8, 3, 1.4)); // nostril, eye (horizontal pupil)
  fs(ctx, poly([[38, 32], [60, 32], [50, 92]]), '#f4ecd8', 3.5); // beard
  if (fish) { ctx.save(); ctx.translate(58, 24 + jaw * 0.3); ctx.rotate(0.2 + Math.sin(t * 9) * 0.1); PROPS.fish(ctx, {color: '#8fa3b0'}); ctx.restore(); }
  ctx.restore(); ctx.restore();
}

// the flood: muddy water over the field, the creek and the foot of the house (right of Walt's hill), rising to `level` (screen y).
// Waves, foam, and things that float by. Drawn in FRONT of the plate and the actors' feet region is below level only for Gus.
function floodG(ctx, {t = 0, level = 1900, calm = 0, debris = 1} = {}) {
  if (level >= 1780) return;
  const T = x => x < CREEK.hillEdge ? CREEK.hillTop : x < 330 ? CREEK.hillTop + (x - CREEK.hillEdge) / 140 * 560 : x < 560 ? 1790 : x < 600 ? 1790 - (x - 560) / 40 * 170 : CREEK.field; // the ground under the water
  const amp = (7 + 9 * (1 - calm)) * (level < 1700 ? 1 : 0.7), topY = x => level + Math.sin(x / 46 + t * 3.1) * amp + Math.sin(x / 19 - t * 4.3) * amp * 0.4;
  const xs = []; for (let x = 150; x <= 1090; x += 10) if (T(x) > level + 2) xs.push(x); if (!xs.length) return;
  const xe = xs[0], p = new Path2D(); p.moveTo(xe, topY(xe)); for (const x of xs) p.lineTo(x, topY(x)); for (let i = xs.length - 1; i >= 0; i--) p.lineTo(xs[i], T(xs[i]) + 4); p.closePath();
  const g = ctx.createLinearGradient(0, level, 0, 1930); g.addColorStop(0, '#8fae9f'); g.addColorStop(0.5, '#6f8f86'); g.addColorStop(1, '#4f6a66');
  ctx.save(); ctx.globalAlpha = 0.93; ctx.fillStyle = g; ctx.fill(p); ctx.globalAlpha = 1; ctx.clip(p);
  ctx.strokeStyle = 'rgba(255,238,205,.5)'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  for (let i = 0; i < 26; i++) { const x = ((hashN(i * 1.7) * 1200 - t * (130 + 70 * hashN(i + 4))) % 1200 + 1200) % 1200 - 60, y = level + 26 + hashN(i * 3.1) * (1930 - level - 40); ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 22, y - 7, x + 48, y); ctx.stroke(); }
  ctx.restore(); ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(42,33,30,.8)'; ctx.lineWidth = 5; ctx.beginPath(); xs.forEach((x, i) => i ? ctx.lineTo(x, topY(x)) : ctx.moveTo(x, topY(x))); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,246,226,.85)'; ctx.lineWidth = 5; ctx.beginPath(); xs.forEach(x => { if (x % 30 === 0) { const y = topY(x) - 3; ctx.moveTo(x, y); ctx.lineTo(x + 14, y - 4); } }); ctx.stroke();
  if (debris) for (let i = 0; i < 4; i++) { // a barrel, a crate, a cabbage and a hat drift left across the water
    const x = ((hashN(i * 5.3) * 1000 + 700 - t * (70 + 25 * i)) % 900 + 900) % 900 + xe - 40, y = topY(x) + 6 + Math.sin(t * 2 + i) * 4; if (x < xe + 30 || x > 1070 || T(x) <= level) continue;
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 1.5 + i * 2) * 0.12);
    if (i === 0) { fs(ctx, rr(-30, -46, 60, 56, 10), '#a56a3c', 4); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-30, -26); ctx.lineTo(30, -26); ctx.moveTo(-30, -6); ctx.lineTo(30, -6); ctx.stroke(); }
    if (i === 1) { fs(ctx, rr(-36, -34, 72, 42, 4), '#c89a62', 4); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-36, -34); ctx.lineTo(36, 8); ctx.moveTo(36, -34); ctx.lineTo(-36, 8); ctx.stroke(); }
    if (i === 2) { fs(ctx, el(0, -16, 24, 22), '#9bb36a', 4); ctx.strokeStyle = '#6e8a3e'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, -16, 12, 0.5, 3); ctx.stroke(); }
    if (i === 3) { fs(ctx, el(0, -6, 46, 10), '#e0c070', 4); fs(ctx, el(0, -16, 24, 14), '#d4b05a', 4); }
    ctx.restore(); }
}

// a fishing rod held by the hand at the origin (dir = which way it leans), line down to a bobber on the water
function rodG(ctx, {t = 0, dir = 1, len = 230, line = 520, bite = 0} = {}) {
  ctx.save(); ctx.scale(dir, 1); const ang = -0.95, tx = Math.cos(ang) * len, ty = Math.sin(ang) * len - 20;
  ctx.strokeStyle = INK; ctx.lineWidth = 13; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-10, 14); ctx.lineTo(tx, ty); ctx.stroke(); ctx.strokeStyle = '#8a5a36'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(-10, 14); ctx.lineTo(tx, ty); ctx.stroke();
  const by = ty + line + Math.sin(t * 2.2) * 4 + bite * Math.sin(t * 25) * 14; ctx.strokeStyle = 'rgba(42,33,30,.8)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.quadraticCurveTo(tx + 24, (ty + by) / 2, tx + 8, by - 14); ctx.stroke();
  fs(ctx, el(tx + 8, by, 11, 14), '#e2574c', 3.5); ctx.fillStyle = '#fbf1dc'; ctx.beginPath(); ctx.ellipse(tx + 8, by - 6, 8, 6, 0, Math.PI, 0); ctx.fill();
  ctx.restore();
}
function penG(ctx, {color = '#c4643a'} = {}) { ctx.save(); ctx.rotate(-0.7); fs(ctx, rr(-44, -7, 80, 14, 7), color, 3.5); fs(ctx, poly([[36, -7], [58, 0], [36, 7]]), '#2a211e', 2.5); fs(ctx, rr(-30, -10, 22, 5, 2), WARM.gold, 2); ctx.restore(); }
function tvG(ctx, {text = 'THE END', t = 0, show = 1} = {}) { // an old TV on a three-legged stool, origin at the foot
  for (const x of [-64, 0, 64]) fs(ctx, rr(x - 7, -90, 14, 90, 3), WARM.woodD, 4);
  fs(ctx, rr(-110, -250, 220, 168, 18), '#8a5a36', 6); fs(ctx, rr(-92, -232, 150, 130, 10), show ? '#fff4dc' : '#3a3a40', 5);
  if (show) { ctx.fillStyle = INK; ctx.font = '44px GraceCaption'; ctx.textAlign = 'center'; ctx.fillText(text, -17, -154); ctx.textAlign = 'left'; ctx.fillStyle = `rgba(255,255,255,${0.2 + 0.1 * Math.sin(t * 9)})`; ctx.fillRect(-92, -232, 150, 130); }
  fs(ctx, el(82, -200, 12, 12), '#e6c070', 3); fs(ctx, el(82, -158, 12, 12), '#e6c070', 3);
  ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-30, -250); ctx.lineTo(-70, -312); ctx.moveTo(10, -250); ctx.lineTo(50, -312); ctx.stroke();
}
function fenceG(ctx, {broken = 0, w = 1100} = {}) { // a wooden fence, left to right, origin at the left foot; `broken` = how many boards are gone around the middle
  fs(ctx, rr(0, -96, w, 16, 4), '#a8743f', 4); fs(ctx, rr(0, -48, w, 16, 4), '#a8743f', 4);
  for (let x = 20, i = 0; x < w - 30; x += 58, i++) { const mid = Math.abs(x - w / 2) < 60 * broken; if (mid) continue; fs(ctx, poly([[x, 0], [x, -130], [x + 17, -150], [x + 34, -130], [x + 34, 0]]), '#d1a05c', 4.5); }
}
// wind: leaves and streaks sweeping across the frame (rows between y0 and y1), fast
function windG(ctx, {t = 0, y0 = 500, y1 = 1500, n = 16, speed = 1.1} = {}) {
  ctx.save(); ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const q = ((t * speed * (0.7 + 0.6 * hashN(i + 3)) + hashN(i * 2.3)) % 1), x = -80 + q * 1240, y = y0 + hashN(i * 5.1) * (y1 - y0) + Math.sin(q * 9 + i) * 40;
    ctx.strokeStyle = 'rgba(255,244,220,.55)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x - 90, y + 6); ctx.lineTo(x, y); ctx.stroke();
    ctx.save(); ctx.translate(x, y); ctx.rotate(q * 14 + i); fs(ctx, el(0, 0, 15, 7), i % 2 ? '#8a7a3a' : '#a8683a', 3); ctx.restore();
  }
  ctx.restore();
}
Object.assign(PROPS, {windG, chasmG, bridgeG, goatG, floodG, rodG, penG, tvG, fenceG});
