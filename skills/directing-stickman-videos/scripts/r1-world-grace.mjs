// R1 · grace-remains look: a warm, timeless village (plaster, terracotta, olive, honey light). Own sets and props so the
// channel never shares a frame grammar with the PT series (blue sky, candy houses). Registered into SETS/PROPS on import.
import {Path2D} from '@napi-rs/canvas';
import {INK, mix, dark, light} from './r1-rig.mjs';
import {SETS, PROPS} from './r1-world.mjs';

const OL = 5;
function fs(ctx, p, fill, w = OL) { if (fill) { ctx.fillStyle = fill; ctx.fill(p); } if (w) { ctx.lineWidth = w; ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.stroke(p); } }
const rr = (x, y, w, h, r) => { const p = new Path2D(); p.roundRect(x, y, w, h, r); return p; };
const el = (x, y, rx, ry, rot = 0) => { const p = new Path2D(); p.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); return p; };
const poly = pts => { const p = new Path2D(); p.moveTo(...pts[0]); for (const q of pts.slice(1)) p.lineTo(...q); p.closePath(); return p; };
const hashN = n => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };

export const WARM = {plaster: ['#f1d9b5', '#e9c38f', '#f4e4c8', '#e7b98a', '#f0cfa0'], roof: '#c4643a', stone: '#d8c3a0', wood: '#8a5a36', woodD: '#6e4426',
  olive: '#7c8f4a', oliveD: '#5f7339', cream: '#fbf1dc', gold: '#f4b942', ink: INK};
const SKY = {gold: ['#f3b66c', '#ffe3b0'], noon: ['#f8d48f', '#fff2d2'], dusk: ['#a8505a', '#f09a62'], night: ['#251b38', '#45305a'], dawn: ['#f0ad88', '#fde2bf']};
const SHADE = {night: 'rgba(30,18,52,.46)', dusk: 'rgba(120,40,40,.16)', dawn: 'rgba(255,160,110,.10)'};

function sky(ctx, time, h = 1300) {
  const [a, b] = SKY[time] || SKY.gold, g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, a); g.addColorStop(1, b);
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
  if (time === 'night') { ctx.fillStyle = '#fff1c4'; ctx.fill(el(820, 210, 54, 54)); ctx.fillStyle = '#fff'; for (const [x, y] of [[110, 140], [290, 250], [520, 110], [690, 320], [990, 400], [400, 380]]) ctx.fill(el(x, y, 4, 4)); }
  else if (time === 'dusk') { ctx.fillStyle = 'rgba(255,214,140,.9)'; ctx.fill(el(300, 700, 120, 120)); }
  else { ctx.fillStyle = 'rgba(255,248,220,.9)'; ctx.fill(el(840, 250, 92, 92)); ctx.fillStyle = 'rgba(255,240,200,.25)'; ctx.fill(el(840, 250, 170, 170)); }
}
function olive(ctx, x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const t = new Path2D(); t.moveTo(-14, 0); t.quadraticCurveTo(-4, -120, -30, -220); t.lineTo(-10, -225); t.quadraticCurveTo(14, -130, 16, 0); t.closePath(); fs(ctx, t, '#7b5a3a');
  for (const [dx, dy, r] of [[-60, -250, 70], [20, -290, 80], [80, -230, 62], [-10, -200, 60]]) fs(ctx, el(dx, dy, r, r * 0.72), WARM.olive);
  ctx.fillStyle = WARM.oliveD; for (const [dx, dy] of [[-50, -240], [30, -300], [70, -220], [0, -260]]) ctx.fill(el(dx, dy, 22, 10, 0.4));
  ctx.restore();
}
// a plaster house with a terracotta roof; light windows at night
function cottage(ctx, x, w, top, base, color, {lit = false, door = true, boarded = false, doorColor = WARM.wood, box = true} = {}) {
  fs(ctx, rr(x, top, w, base - top, 4), color);
  ctx.fillStyle = dark(color, 0.07); for (let i = 0; i < 6; i++) ctx.fill(el(x + 30 + hashN(x + i) * (w - 60), top + 60 + hashN(i + x * 2) * (base - top - 120), 22, 10));
  fs(ctx, poly([[x - 26, top + 6], [x + w / 2, top - 120], [x + w + 26, top + 6]]), WARM.roof);
  ctx.strokeStyle = dark(WARM.roof, 0.2); ctx.lineWidth = 4; for (let i = 1; i < 6; i++) { const k = i / 6; ctx.beginPath(); ctx.moveTo(x - 26 + k * (w / 2 + 26), top + 6 - k * 126); ctx.lineTo(x + w + 26 - k * (w / 2 + 26), top + 6 - k * 126); ctx.stroke(); }
  const ww = 92, wh = 120, wy = top + 70;
  for (const wx of door ? [x + 28] : [x + 28, x + w - 28 - ww]) {
    fs(ctx, rr(wx - 8, wy - 8, ww + 16, wh + 16, 8), WARM.cream, 4);
    fs(ctx, rr(wx, wy, ww, wh, 4), lit ? '#ffd77a' : '#4a3a3e', 4);
    if (boarded) { ctx.save(); ctx.translate(wx + ww / 2, wy + wh / 2); for (const r of [0.5, -0.45]) { ctx.save(); ctx.rotate(r); fs(ctx, rr(-70, -12, 140, 24, 3), '#b07a4a', 3); ctx.restore(); } ctx.restore(); }
    else { ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(wx + ww / 2, wy); ctx.lineTo(wx + ww / 2, wy + wh); ctx.moveTo(wx, wy + wh / 2); ctx.lineTo(wx + ww, wy + wh / 2); ctx.stroke(); }
    if (box) { fs(ctx, rr(wx - 10, wy + wh + 6, ww + 20, 24, 5), '#9a5a34', 3); for (let i = 0; i < 4; i++) fs(ctx, el(wx + 8 + i * 26, wy + wh + 2, 12, 10), ['#e2574c', '#f4b942', '#e2574c', '#f08a5d'][i], 3); }
  }
  if (door) {
    const dw = 96, dx = x + w - dw - 34, dy = base - 190;
    const d = new Path2D(); d.moveTo(dx, base); d.lineTo(dx, dy + dw / 2); d.arc(dx + dw / 2, dy + dw / 2, dw / 2, Math.PI, 0); d.lineTo(dx + dw, base); d.closePath();
    fs(ctx, d, doorColor, 5); ctx.fillStyle = WARM.gold; ctx.fill(el(dx + dw - 18, dy + 110, 6, 6));
  }
}
function cobbles(ctx, y, color = '#d9c19a', night = false) {
  ctx.fillStyle = color; ctx.fillRect(0, y, 1080, 1920 - y);
  ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1080, y); ctx.stroke();
  ctx.strokeStyle = dark(color, 0.16); ctx.lineWidth = 3;
  for (let r = 0; r < 14; r++) { const yy = y + 30 + r * r * 4.2 + r * 18; const sz = 40 + r * 9; for (let x = (r % 2) * sz / 2 - sz; x < 1100; x += sz) { ctx.beginPath(); ctx.ellipse(x, yy, sz * 0.42, 8 + r * 1.6, 0, 0, Math.PI * 2); ctx.stroke(); } }
  if (night) { ctx.fillStyle = 'rgba(25,15,45,.28)'; ctx.fillRect(0, y, 1080, 1920 - y); }
}
function lamp(ctx, x, y, on) {
  fs(ctx, rr(x - 6, y, 12, 1320 - y, 4), '#3c2c24', 3);
  fs(ctx, poly([[x - 28, y - 70], [x + 28, y - 70], [x + 20, y], [x - 20, y]]), on ? '#ffe08a' : '#cdb58a', 4);
  if (on) { const g = ctx.createRadialGradient(x, y - 36, 10, x, y - 36, 340); g.addColorStop(0, 'rgba(255,205,110,.55)'); g.addColorStop(1, 'rgba(255,205,110,0)'); ctx.fillStyle = g; ctx.fillRect(x - 360, y - 400, 720, 760); }
}
function room(ctx, wall, trim, floor, y = 1300) {
  ctx.fillStyle = wall; ctx.fillRect(0, 0, 1080, 1920);
  ctx.fillStyle = dark(wall, 0.04); for (let x = 0; x < 1080; x += 120) ctx.fillRect(x, 0, 4, y);
  fs(ctx, rr(-10, y - 260, 1100, 260, 0), trim, 5);
  ctx.strokeStyle = dark(trim, 0.15); ctx.lineWidth = 4; for (let x = 60; x < 1080; x += 150) ctx.strokeRect(x, y - 220, 110, 180);
  ctx.fillStyle = floor; ctx.fillRect(0, y, 1080, 1920 - y);
  ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1080, y); ctx.stroke();
  ctx.strokeStyle = dark(floor, 0.18); ctx.lineWidth = 3; for (let yy = y + 50; yy < 1920; yy += 64 + (yy - y) * 0.12) { ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(1080, yy); ctx.stroke(); }
}
function glow(ctx, x, y, r, a = 0.45, c = '255,205,120') { const g = ctx.createRadialGradient(x, y, 10, x, y, r); g.addColorStop(0, `rgba(${c},${a})`); g.addColorStop(1, `rgba(${c},0)`); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }
function windowPane(ctx, x, y, w, h, time) {
  fs(ctx, rr(x - 14, y - 14, w + 28, h + 28, 10), WARM.cream, 6);
  const [a, b] = SKY[time] || SKY.gold, g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, a); g.addColorStop(1, b);
  fs(ctx, rr(x, y, w, h, 4), null, 0); ctx.fillStyle = g; ctx.fill(rr(x, y, w, h, 4));
  if (time !== 'night') { ctx.save(); ctx.clip(rr(x, y, w, h, 4)); olive(ctx, x + w * 0.7, y + h + 60, 0.7); ctx.restore(); }
  else { ctx.fillStyle = '#fff1c4'; ctx.fill(el(x + w * 0.7, y + h * 0.3, 26, 26)); }
  ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.strokeRect(x, y, w, h); ctx.beginPath(); ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w / 2, y + h); ctx.moveTo(x, y + h / 2); ctx.lineTo(x + w, y + h / 2); ctx.stroke();
}

export const GRACE_SETS = {
  // village lane: four cottages, olive trees, cobbles. boarded: Mr. Abel's house (last) has a boarded window.
  gLane({time = 'gold', boarded = false, lit = false, lamps = false} = {}) {
    return ctx => {
      sky(ctx, time);
      // far hills
      fs(ctx, poly([[0, 1010], [180, 930], [420, 990], [700, 900], [1080, 980], [1080, 1300], [0, 1300]]), time === 'night' ? '#4c3a52' : '#d9b27a', 4);
      const base = 1290, H = [[-60, 260, 640, WARM.plaster[0]], [210, 240, 560, WARM.plaster[1]], [460, 250, 610, WARM.plaster[2]], [720, 300, 590, WARM.plaster[3]]];
      H.forEach(([x, w, top, c], i) => cottage(ctx, x, w, top, base, c, {lit: lit || time === 'night', door: i !== 1, boarded: boarded && i === 3, doorColor: i === 3 ? '#5a6e8a' : WARM.wood}));
      olive(ctx, 120, base + 30, 1.05); olive(ctx, 1010, base + 50, 0.9);
      cobbles(ctx, base, '#dcc29a', time === 'night');
      if (lamps) { lamp(ctx, 330, 900, time === 'night' || time === 'dusk'); }
      if (SHADE[time]) { ctx.fillStyle = SHADE[time]; ctx.fillRect(0, 0, 1080, 1920); }
      if (lamps && time === 'night') glow(ctx, 330, 864, 380, 0.5);
    };
  },
  // a cottage front door, close: stone frame, blue-grey door, porch lamp, potted geranium. The leaf is the gDoorLeaf prop.
  gDoor({time = 'gold', porch = false, doorColor = '#5a6e8a'} = {}) {
    return ctx => {
      const wall = time === 'night' ? '#9a7c68' : '#ecc995';
      ctx.fillStyle = wall; ctx.fillRect(0, 0, 1080, 1920);
      ctx.fillStyle = dark(wall, 0.06); for (let i = 0; i < 26; i++) ctx.fill(el(hashN(i) * 1080, hashN(i + 9) * 1300, 40, 16));
      fs(ctx, rr(340, 650, 400, 720, 16), WARM.stone, 8);
      ctx.strokeStyle = dark(WARM.stone, 0.2); ctx.lineWidth = 4; for (let y = 690; y < 1360; y += 70) { ctx.beginPath(); ctx.moveTo(340, y); ctx.lineTo(380, y); ctx.moveTo(700, y); ctx.lineTo(740, y); ctx.stroke(); }
      fs(ctx, rr(380, 700, 320, 670, 6), '#3a2a26', 5);
      glow(ctx, 540, 1000, 300, 0.18);
      windowPane(ctx, 800, 640, 200, 260, time === 'night' ? 'night' : 'gold');
      for (const px of [190, 880]) {
        fs(ctx, poly([[px - 62, 1240], [px + 62, 1240], [px + 48, 1350], [px - 48, 1350]]), '#c46a3c');
        for (let i = 0; i < 5; i++) fs(ctx, el(px - 44 + i * 22, 1206 - (i % 2) * 22, 22, 18), WARM.olive, 3);
        for (let i = 0; i < 3; i++) fs(ctx, el(px - 30 + i * 30, 1180 - (i % 2) * 26, 14, 14), '#e2574c', 3);
      }
      cobbles(ctx, 1360, '#d4b98e', time === 'night');
      if (time === 'night') { ctx.fillStyle = SHADE.night; ctx.fillRect(0, 0, 1080, 1920); }
      if (time === 'dusk') { ctx.fillStyle = 'rgba(150,60,40,.18)'; ctx.fillRect(0, 0, 1080, 1920); }
      if (porch) { fs(ctx, rr(510, 560, 60, 70, 10), '#3c2c24', 4); fs(ctx, el(540, 600, 22, 26), '#ffe7a0', 3); glow(ctx, 540, 640, 620, 0.62); }
    };
  },
  // warm kitchen: hearth, shelves with jars, window, table edge. time: day | night (lamp)
  gKitchen({time = 'day'} = {}) {
    return ctx => {
      room(ctx, '#f3dcb2', '#c98f5a', '#b98a5e');
      windowPane(ctx, 640, 360, 300, 380, time === 'day' ? 'noon' : 'night');
      fs(ctx, rr(60, 300, 420, 30, 6), WARM.woodD, 4); fs(ctx, rr(60, 520, 420, 30, 6), WARM.woodD, 4);
      [['#d9774b', 90], ['#7c8f4a', 170], ['#f4b942', 250], ['#c4643a', 330], ['#e9d8b8', 410]].forEach(([c, x], i) => { fs(ctx, rr(x, 220 - (i % 2) * 20, 60, 80 + (i % 2) * 20, 10), c, 4); fs(ctx, rr(x + 4, 440, 52, 80, 26), i % 2 ? '#e9d8b8' : '#c98f5a', 4); });
      fs(ctx, rr(80, 760, 360, 300, 20), '#b5552f', 6); fs(ctx, rr(130, 840, 260, 220, 110), '#2a1a16', 5);
      if (time !== 'day') { glow(ctx, 260, 980, 300, 0.55, '255,140,60'); }
      if (time === 'lamp') { glow(ctx, 540, 380, 700, 0.5); fs(ctx, rr(536, 0, 8, 300, 2), '#3c2c24', 0); fs(ctx, el(540, 330, 46, 30), '#ffe08a', 4); }
      fs(ctx, rr(-20, 1220, 1120, 40, 8), WARM.wood, 5);
      if (time === 'night') { ctx.fillStyle = 'rgba(40,20,50,.40)'; ctx.fillRect(0, 0, 1080, 1920); glow(ctx, 540, 380, 560, 0.42); fs(ctx, rr(536, 0, 8, 300, 2), '#3c2c24', 0); fs(ctx, el(540, 330, 46, 30), '#ffe08a', 4); }
    };
  },
  // sunny garden table under a vine pergola (lunch with the in-laws)
  gTable() {
    return ctx => {
      sky(ctx, 'noon');
      fs(ctx, poly([[0, 1000], [300, 930], [640, 980], [1080, 920], [1080, 1300], [0, 1300]]), '#c9b06a', 4);
      olive(ctx, 860, 1150, 1.1);
      for (const x of [40, 1000]) fs(ctx, rr(x, 260, 40, 1060, 8), WARM.wood, 5);
      fs(ctx, rr(0, 240, 1080, 40, 6), WARM.wood, 5);
      for (let i = 0; i < 18; i++) fs(ctx, el(30 + i * 62, 300 + (i % 3) * 14, 46, 28, i * 0.6), i % 4 === 0 ? '#5f7339' : WARM.olive, 3);
      for (let i = 0; i < 5; i++) fs(ctx, el(150 + i * 190, 340, 14, 20), '#7a3b6a', 3);
      cobbles(ctx, 1300, '#e3cba2');
    };
  },
  // bathroom washbasin: cream tiles, mirror, a bright lamp. Bright at night on purpose (the scrub scene).
  gBath({night = false} = {}) {
    return ctx => {
      ctx.fillStyle = '#fbf3e3'; ctx.fillRect(0, 0, 1080, 1920);
      ctx.strokeStyle = '#e6d6b8'; ctx.lineWidth = 4; for (let y = 0; y < 1300; y += 90) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1080, y); ctx.stroke(); } for (let x = 0; x < 1080; x += 90) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1300); ctx.stroke(); }
      if (night) windowPane(ctx, 820, 420, 180, 240, 'night');
      fs(ctx, rr(330, 300, 420, 460, 200), '#c9a46a', 8); fs(ctx, rr(352, 322, 376, 416, 180), '#d9eef0', 5);
      ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.fill(poly([[420, 380], [470, 360], [400, 600], [370, 580]]));
      fs(ctx, rr(500, 180, 80, 70, 14), '#ffe9a6', 4); glow(ctx, 540, 230, 700, 0.35, '255,236,180');
      ctx.fillStyle = '#c9a46a'; ctx.fillRect(0, 1300, 1080, 620); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 1300); ctx.lineTo(1080, 1300); ctx.stroke();
      ctx.fillStyle = 'rgba(0,0,0,.07)'; for (let x = 0; x < 1080; x += 110) for (let y = 1310; y < 1920; y += 110) if (((x + y) / 110 | 0) % 2) ctx.fillRect(x, y, 110, 110);
    };
  },
  // warm bedroom; night = plum dark with a bedside candle
  gBedroom({time = 'night'} = {}) {
    return ctx => {
      const night = time === 'night';
      room(ctx, night ? '#5d4366' : '#f2d7a8', night ? '#4a3352' : '#c98f5a', night ? '#5a3c34' : '#b98a5e');
      windowPane(ctx, 120, 340, 320, 420, night ? 'night' : 'noon');
      for (const x of [80, 450]) fs(ctx, rr(x, 300, 60, 560, 20), night ? '#8a3f4a' : '#c4643a', 4);
      fs(ctx, rr(560, 1010, 40, 420, 10), WARM.wood); fs(ctx, rr(1040, 1110, 40, 320, 10), WARM.wood);
      fs(ctx, rr(560, 1180, 520, 120, 16), '#fbf1dc');
      fs(ctx, rr(820, 640, 180, 220, 8), '#c9a46a', 5); fs(ctx, rr(836, 656, 148, 188, 4), '#efe0c0', 3); // a cross-stitch frame
      ctx.strokeStyle = '#a8503a'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(910, 690); ctx.lineTo(910, 810); ctx.moveTo(870, 730); ctx.lineTo(950, 730); ctx.stroke();
      fs(ctx, rr(40, 1080, 170, 230, 10), WARM.wood); fs(ctx, rr(110, 1000, 30, 80, 6), '#fbf1dc', 4); fs(ctx, el(125, 985, 10, 18), '#ffd25a', 3);
      if (night) glow(ctx, 125, 990, 520, 0.5);
    };
  },
  // chapel interior: whitewashed walls, arched window with a sunbeam (light='sun') or candles only (light='candle')
  gChapel({light = 'sun'} = {}) {
    return ctx => {
      const sun = light === 'sun';
      ctx.fillStyle = sun ? '#f4e6cc' : '#3c2a3a'; ctx.fillRect(0, 0, 1080, 1920);
      ctx.fillStyle = sun ? '#ecd9b6' : '#352434'; for (let x = 0; x < 1080; x += 180) ctx.fillRect(x, 0, 20, 1300);
      const arch = (x, y, w, h) => { const p = new Path2D(); p.moveTo(x, y + h); p.lineTo(x, y + w / 2); p.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); p.lineTo(x + w, y + h); p.closePath(); return p; };
      fs(ctx, arch(400, 220, 280, 560), WARM.stone, 8); fs(ctx, arch(424, 244, 232, 520), sun ? '#ffe9b0' : '#2c2446', 5);
      ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(540, 300); ctx.lineTo(540, 764); ctx.moveTo(470, 470); ctx.lineTo(610, 470); ctx.stroke();
      if (sun) { ctx.fillStyle = 'rgba(255,226,150,.30)'; ctx.fill(poly([[430, 760], [650, 760], [960, 1920], [180, 1920]])); }
      fs(ctx, rr(330, 900, 420, 50, 8), WARM.woodD, 5); fs(ctx, rr(350, 950, 380, 260, 6), '#8a5a36', 5); // altar
      fs(ctx, rr(380, 880, 320, 24, 4), '#fbf1dc', 3);
      for (const x of [420, 660]) { fs(ctx, rr(x - 10, 800, 20, 80, 4), '#fbf1dc', 3); fs(ctx, el(x, 788, 8, 14), '#ffd25a', 3); if (!sun) glow(ctx, x, 790, 360, 0.6); }
      ctx.fillStyle = sun ? '#c8a479' : '#4b3632'; ctx.fillRect(0, 1210, 1080, 710); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 1210); ctx.lineTo(1080, 1210); ctx.stroke();
      if (!sun) { for (const x of [90, 990]) { fs(ctx, rr(x - 40, 1000, 80, 20, 4), '#6e4426', 3); for (let i = 0; i < 3; i++) { fs(ctx, rr(x - 30 + i * 22, 960 - (i % 2) * 14, 14, 40, 3), '#fbf1dc', 2); fs(ctx, el(x - 23 + i * 22, 950 - (i % 2) * 14, 5, 9), '#ffd25a', 2); } glow(ctx, x, 950, 300, 0.55); } }
    };
  },
  // chapel exterior on a Sunday: bell tower, steps, olive, warm sky
  gChapelOut({time = 'noon'} = {}) {
    return ctx => {
      sky(ctx, time);
      fs(ctx, rr(300, 620, 480, 680, 6), '#f6ead2', 6);
      fs(ctx, poly([[270, 630], [540, 430], [810, 630]]), WARM.roof);
      fs(ctx, rr(470, 200, 140, 260, 4), '#f6ead2', 6); fs(ctx, poly([[455, 210], [540, 110], [625, 210]]), WARM.roof);
      fs(ctx, rr(510, 260, 60, 80, 30), '#3a2a26', 4); fs(ctx, el(540, 318, 22, 20), WARM.gold, 3);
      ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(540, 60); ctx.lineTo(540, 112); ctx.moveTo(522, 78); ctx.lineTo(558, 78); ctx.stroke();
      const d = new Path2D(); d.moveTo(470, 1300); d.lineTo(470, 1060); d.arc(540, 1060, 70, Math.PI, 0); d.lineTo(610, 1300); d.closePath(); fs(ctx, d, WARM.wood, 5);
      for (const x of [360, 660]) { const w = new Path2D(); w.moveTo(x, 900); w.arc(x + 30, 900, 30, Math.PI, 0); w.lineTo(x + 60, 1000); w.lineTo(x, 1000); w.closePath(); fs(ctx, w, '#f4b942', 4); }
      olive(ctx, 150, 1320, 1.1); olive(ctx, 960, 1330, 0.95);
      cobbles(ctx, 1300, '#e0c9a0');
      fs(ctx, rr(420, 1300, 240, 40, 6), WARM.stone, 4);
    };
  },
  // a hill path up to the market (stalls with awnings at the top), olive trees; time like gLane
  gHill({time = 'gold'} = {}) {
    return ctx => {
      sky(ctx, time);
      fs(ctx, poly([[0, 760], [300, 640], [620, 560], [1080, 520], [1080, 1920], [0, 1920]]), time === 'night' ? '#4c3a52' : '#d4ac6a', 5);
      for (const [x, c] of [[620, '#c4643a'], [760, '#f4b942'], [900, '#7c8f4a']]) { fs(ctx, rr(x, 470, 120, 80, 4), '#fbf1dc', 4); fs(ctx, poly([[x - 14, 480], [x + 60, 420], [x + 134, 480]]), c, 4); }
      const path = new Path2D(); path.moveTo(760, 560); path.quadraticCurveTo(420, 900, 640, 1250); path.quadraticCurveTo(820, 1560, 300, 1920); path.lineTo(860, 1920); path.quadraticCurveTo(1000, 1500, 820, 1250); path.quadraticCurveTo(620, 900, 830, 560); path.closePath(); fs(ctx, path, '#ecd6ad', 5);
      ctx.strokeStyle = dark('#ecd6ad', 0.12); ctx.lineWidth = 3; for (let i = 0; i < 16; i++) { const y = 620 + i * i * 5.2; ctx.beginPath(); ctx.ellipse(700 + Math.sin(i) * 80, y, 30 + i * 4, 6 + i, 0, 0, Math.PI * 2); ctx.stroke(); }
      olive(ctx, 150, 1180, 1.15); olive(ctx, 1000, 1000, 0.8); olive(ctx, 330, 820, 0.55);
      fs(ctx, rr(120, 1500, 230, 60, 24), WARM.stone, 5);
      if (SHADE[time]) { ctx.fillStyle = SHADE[time]; ctx.fillRect(0, 0, 1080, 1920); }
    };
  },
  // a village school: ochre building with a bell, big windows, a dirt yard and a fig tree
  gSchool({time = 'noon'} = {}) {
    return ctx => {
      sky(ctx, time);
      fs(ctx, rr(60, 520, 960, 780, 6), '#e7c08a', 6);
      fs(ctx, poly([[30, 530], [540, 300], [1050, 530]]), WARM.roof);
      fs(ctx, rr(480, 330, 120, 150, 6), '#f4e4c8', 5); fs(ctx, el(540, 410, 34, 38), WARM.gold, 4);
      for (const x of [120, 330, 640, 850]) { fs(ctx, rr(x, 640, 150, 200, 6), '#fbf1dc', 5); fs(ctx, rr(x + 12, 652, 126, 176, 3), time === 'night' ? '#ffd77a' : '#6a8aa0', 3); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x + 75, 652); ctx.lineTo(x + 75, 828); ctx.stroke(); }
      const d = new Path2D(); d.moveTo(470, 1300); d.lineTo(470, 1020); d.arc(540, 1020, 70, Math.PI, 0); d.lineTo(610, 1300); d.closePath(); fs(ctx, d, '#3f6a7a', 5);
      ctx.fillStyle = INK; ctx.font = '54px GraceCaption'; ctx.textAlign = 'center'; ctx.fillText('SCHOOL', 540, 600); ctx.textAlign = 'left';
      olive(ctx, 990, 1320, 1.1);
      ctx.fillStyle = '#d8b27e'; ctx.fillRect(0, 1300, 1080, 620); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 1300); ctx.lineTo(1080, 1300); ctx.stroke();
      ctx.fillStyle = 'rgba(120,80,40,.12)'; for (let i = 0; i < 40; i++) ctx.fill(el(hashN(i) * 1080, 1320 + hashN(i + 3) * 580, 30, 6));
      if (SHADE[time]) { ctx.fillStyle = SHADE[time]; ctx.fillRect(0, 0, 1080, 1920); }
      if (time === 'night') for (const x of [195, 405, 715, 925]) glow(ctx, x, 740, 240, 0.5); // lit classrooms: night frames keep contrast
    };
  },
  // behind the gym: a long plank wall in shade, a bench, a drainpipe; quiet and a little dim
  gGym({dim = true, bench = true} = {}) {
    return ctx => {
      ctx.fillStyle = '#c99a6b'; ctx.fillRect(0, 0, 1080, 1920);
      ctx.strokeStyle = dark('#c99a6b', 0.18); ctx.lineWidth = 4; for (let x = 0; x < 1080; x += 72) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1300); ctx.stroke(); }
      fs(ctx, rr(860, 0, 34, 1300, 6), '#8a8f96', 4);
      fs(ctx, rr(120, 380, 260, 180, 8), '#fbf1dc', 5); fs(ctx, rr(134, 394, 232, 152, 3), '#6a8aa0', 3);
      ctx.fillStyle = '#9c7a52'; ctx.fillRect(0, 1300, 1080, 620); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 1300); ctx.lineTo(1080, 1300); ctx.stroke();
      if (bench) { fs(ctx, rr(560, 1380, 420, 34, 8), WARM.wood, 5); for (const x of [590, 930]) fs(ctx, rr(x, 1414, 24, 120, 4), WARM.woodD, 4); }
      if (dim) { ctx.fillStyle = 'rgba(40,25,45,.28)'; ctx.fillRect(0, 0, 1080, 1920); }
      glow(ctx, 760, 300, 520, dim ? 0.25 : 0.45, '255,220,150');
    };
  },
  // the city gate: limestone wall, a huge arched double gate under a "1000" plaque, torches; open 0..1 lets the light out.
  // time: night | dawn | shade (the wall's shadow) | day
  gGate({time = 'day', open = 0} = {}) {
    return ctx => {
      sky(ctx, time === 'shade' ? 'gold' : time);
      fs(ctx, rr(-20, 360, 1120, 960, 0), '#e2c79a', 6);
      ctx.strokeStyle = dark('#e2c79a', 0.14); ctx.lineWidth = 4; for (let y = 420; y < 1300; y += 70) for (let x = (y / 70 % 2) * 60 - 60; x < 1100; x += 120) ctx.strokeRect(x, y, 120, 70);
      for (let x = -20; x < 1100; x += 120) fs(ctx, rr(x, 320, 70, 50, 2), '#e2c79a', 5);
      const arch = new Path2D(); arch.moveTo(250, 1300); arch.lineTo(250, 700); arch.arc(540, 700, 290, Math.PI, 0); arch.lineTo(830, 1300); arch.closePath();
      fs(ctx, arch, '#fff3cf', 8);
      const g = ctx.createRadialGradient(540, 900, 40, 540, 900, 520); g.addColorStop(0, '#fffbe8'); g.addColorStop(1, '#ffd98a'); ctx.save(); ctx.clip(arch); ctx.fillStyle = g; ctx.fillRect(250, 400, 580, 900);
      olive(ctx, 420, 1300, 0.8); olive(ctx, 690, 1300, 0.7); ctx.restore();
      const leaf = 290 * (1 - open * 0.92);
      if (leaf > 2) for (const side of [-1, 1]) {
        ctx.save(); ctx.clip(arch); const x0 = side < 0 ? 250 : 830 - leaf;
        fs(ctx, rr(x0, 400, leaf, 900, 0), '#7a4a2a', 6); ctx.strokeStyle = dark('#7a4a2a', 0.25); ctx.lineWidth = 6;
        for (let k = 1; k < 5; k++) { ctx.beginPath(); ctx.moveTo(x0 + leaf * k / 5, 420); ctx.lineTo(x0 + leaf * k / 5, 1300); ctx.stroke(); }
        for (const y of [700, 1050]) fs(ctx, rr(x0 + 8, y, Math.max(0, leaf - 16), 30, 4), '#3c2c24', 3);
        ctx.restore();
      }
      fs(ctx, rr(420, 300, 240, 110, 12), '#c9a46a', 6); ctx.fillStyle = INK; ctx.font = '96px GraceCaption'; ctx.textAlign = 'center'; ctx.fillText('1000', 540, 392); ctx.textAlign = 'left';
      for (const x of [170, 910]) { fs(ctx, rr(x - 10, 760, 20, 120, 4), '#3c2c24', 3); fs(ctx, el(x, 740, 22, 34), '#ffb347', 4); if (time !== 'day') glow(ctx, x, 740, 260, 0.6, '255,170,70'); }
      cobbles(ctx, 1300, '#dcc29a', time === 'night');
      if (time === 'night') { ctx.fillStyle = 'rgba(30,18,52,.55)'; ctx.fillRect(0, 0, 1080, 1920); for (const x of [170, 910]) glow(ctx, x, 740, 300, 0.55, '255,170,70'); }
      if (time === 'dawn') { ctx.fillStyle = 'rgba(60,40,90,.35)'; ctx.fillRect(0, 0, 1080, 1920); }
      if (time === 'shade') { ctx.fillStyle = 'rgba(40,25,50,.42)'; ctx.fillRect(0, 300, 1080, 1620); }
      if (open > 0) { ctx.save(); ctx.clip(arch); glow(ctx, 540, 900, 700, 0.6 * open, '255,245,215'); ctx.restore(); ctx.fillStyle = `rgba(255,240,200,${0.35 * open})`; ctx.fill(poly([[250 + 290 * (1 - open), 1300], [830 - 290 * (1 - open), 1300], [1080, 1920], [0, 1920]])); }
    };
  },
  // warm memory plate (sepia flashback): soft cream with a vignette, no detail to compete with the characters
  // the harbor: sea and breakwater with a small lighthouse, a plank dock in front (characters stand on it), bollards.
  // time: gold | dusk | night
  gHarbor({time = 'dusk', dock = 'full'} = {}) { // dock: 'full' | 'left' (sea in the right foreground, for a moored boat)
    return ctx => {
      sky(ctx, time);
      const night = time === 'night', g = ctx.createLinearGradient(0, 980, 0, 1300);
      g.addColorStop(0, night ? '#1f2e48' : time === 'dusk' ? '#6a6d8a' : '#5f97a8'); g.addColorStop(1, night ? '#2c4460' : time === 'dusk' ? '#8a7e94' : '#7fb2b8');
      ctx.fillStyle = g; ctx.fillRect(0, 980, 1080, 330);
      ctx.strokeStyle = night ? 'rgba(160,190,230,.25)' : 'rgba(255,255,255,.35)'; ctx.lineWidth = 4;
      for (let y = 1010; y < 1290; y += 46) for (let x = (y * 7) % 160 - 80; x < 1080; x += 190) { ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 30, y - 10, x + 60, y); ctx.stroke(); }
      fs(ctx, poly([[560, 990], [1080, 975], [1080, 1010], [560, 1012]]), WARM.stone, 4);
      fs(ctx, rr(930, 840, 46, 150, 4), WARM.cream, 4); fs(ctx, poly([[922, 842], [984, 842], [953, 800]]), WARM.roof, 4);
      fs(ctx, rr(936, 862, 34, 26, 3), night || time === 'dusk' ? '#ffe9a8' : '#9cc3cf', 3);
      if (night || time === 'dusk') glow(ctx, 953, 875, 160, 0.5);
      const DW = dock === 'left' ? 560 : 1080;
      if (DW < 1080) { const g2 = ctx.createLinearGradient(0, 1300, 0, 1920); g2.addColorStop(0, night ? '#2c4460' : '#7fb2b8'); g2.addColorStop(1, night ? '#16263a' : '#4f8798'); ctx.fillStyle = g2; ctx.fillRect(DW, 1300, 1080 - DW, 620); }
      ctx.fillStyle = '#9c7a52'; ctx.fillRect(0, 1300, DW, 620); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 1300); ctx.lineTo(DW, 1300); if (DW < 1080) ctx.lineTo(DW, 1920); ctx.stroke();
      ctx.strokeStyle = dark('#9c7a52', 0.18); ctx.lineWidth = 3; for (let y = 1360; y < 1920; y += 64) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(DW, y); ctx.stroke(); }
      for (let y = 1300, k = 0; y < 1920; y += 64, k++) for (let x = (k % 2) * 140 + 60; x < DW; x += 280) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 64); ctx.stroke(); }
      for (const x of DW < 1080 ? [70, DW - 30] : [70, 1010]) { fs(ctx, rr(x - 26, 1250, 52, 90, 10), '#5a4a3a', 4); fs(ctx, el(x, 1252, 30, 10), '#6a5a48', 4); }
      if (SHADE[time]) { ctx.fillStyle = SHADE[time]; ctx.fillRect(0, 0, 1080, 1920); }
    };
  },
  // the open sea at night; fog 0..1 hides the stars and the horizon
  gSea({fog = 0.7} = {}) {
    return ctx => {
      const g = ctx.createLinearGradient(0, 0, 0, 1100); g.addColorStop(0, '#141a2a'); g.addColorStop(1, '#2b3448'); ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
      if (fog < 0.3) { ctx.fillStyle = '#fff'; for (const [x, y] of [[110, 140], [290, 250], [520, 110], [690, 320], [990, 400], [400, 380]]) ctx.fill(el(x, y, 4, 4)); }
      const w = ctx.createLinearGradient(0, 1080, 0, 1920); w.addColorStop(0, '#1c2a3c'); w.addColorStop(1, '#0d1520'); ctx.fillStyle = w; ctx.fillRect(0, 1080, 1080, 840);
      ctx.strokeStyle = 'rgba(150,180,220,.16)'; ctx.lineWidth = 4;
      for (let y = 1120; y < 1920; y += 70) for (let x = (y * 3) % 200 - 100; x < 1080; x += 230) { ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 40, y - 12, x + 80, y); ctx.stroke(); }
      for (let i = 0; i < 7; i++) { const y = 860 + i * 110, a = 0.14 * fog; const f = ctx.createLinearGradient(0, y - 120, 0, y + 120); f.addColorStop(0, 'rgba(200,210,225,0)'); f.addColorStop(0.5, `rgba(200,210,225,${a})`); f.addColorStop(1, 'rgba(200,210,225,0)'); ctx.fillStyle = f; ctx.fillRect(0, y - 120, 1080, 240); }
    };
  },
  gMemory() {
    return ctx => {
      const g = ctx.createRadialGradient(540, 1000, 80, 540, 1000, 1100); g.addColorStop(0, '#f6e2bd'); g.addColorStop(1, '#b98a5e'); ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
      ctx.fillStyle = 'rgba(120,80,40,.12)'; ctx.fillRect(0, 1300, 1080, 620); ctx.strokeStyle = 'rgba(42,33,30,.5)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 1300); ctx.lineTo(1080, 1300); ctx.stroke();
    };
  },
  // the verse card plate: parchment over warm sky
  gVerse() {
    return ctx => {
      const g = ctx.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, '#f2b26b'); g.addColorStop(0.55, '#fde3b6'); g.addColorStop(1, '#e9a25f'); ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
      ctx.fillStyle = 'rgba(255,248,220,.9)'; ctx.fill(el(540, 1500, 190, 190)); glow(ctx, 540, 1500, 700, 0.5, '255,240,200');
      fs(ctx, poly([[0, 1560], [260, 1470], [560, 1540], [820, 1450], [1080, 1520], [1080, 1920], [0, 1920]]), '#c98f5a', 5);
      olive(ctx, 160, 1640, 0.9); olive(ctx, 940, 1660, 0.8);
    };
  },
};

export const GRACE_PROPS = {
  gDoorLeaf(ctx, {open = 0, color = '#5a6e8a'} = {}) { // hinge on the left of the 380..700 doorway
    const w = 320 * (1 - open * 0.85); if (w < 4) return;
    fs(ctx, rr(0, 0, w, 670, 4), color, 5); ctx.strokeStyle = dark(color, 0.25); ctx.lineWidth = 4;
    if (w > 60) { ctx.strokeRect(w * 0.12, 60, w * 0.76, 230); ctx.strokeRect(w * 0.12, 360, w * 0.76, 250); ctx.fillStyle = WARM.gold; ctx.fill(el(w * 0.86, 360, 9, 9)); }
  },
  phone(ctx) { fs(ctx, rr(-14, -26, 28, 52, 6), '#2b2b33', 3); ctx.fillStyle = '#9fd3f0'; ctx.fillRect(-10, -20, 20, 36); },
  bat(ctx) { const p = new Path2D(); p.moveTo(-5, 0); p.lineTo(5, 0); p.lineTo(10, -120); p.quadraticCurveTo(0, -136, -10, -120); p.closePath(); fs(ctx, p, '#d9a066', 3); },
  ball(ctx) { fs(ctx, el(0, 0, 16, 16), '#fbf6ea', 3); ctx.strokeStyle = '#d84a3a'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(-14, 0, 12, -1, 1); ctx.arc(14, 0, 12, Math.PI - 1, Math.PI + 1); ctx.stroke(); },
  glassBurst(ctx, {k = 1} = {}) { ctx.fillStyle = '#d9eef0'; ctx.strokeStyle = INK; ctx.lineWidth = 3; for (let i = 0; i < 9; i++) { const a = i * 0.7, r = 30 + k * 160 * hashN(i + 3); ctx.save(); ctx.translate(Math.cos(a) * r, Math.sin(a) * r * 0.7 + k * k * 80); ctx.rotate(a + k * 3); const p = poly([[-10, -8], [12, -4], [0, 12]]); ctx.fill(p); ctx.stroke(p); ctx.restore(); } },
  cake(ctx) { fs(ctx, rr(-80, -60, 160, 70, 12), '#6b3a26', 4); fs(ctx, rr(-86, -76, 172, 26, 12), '#f6e6c8', 4); fs(ctx, poly([[20, -76], [86, -76], [86, 10], [20, 10]]), '#f7efe0', 0); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(20, -76); ctx.lineTo(20, 10); ctx.stroke(); fs(ctx, rr(-100, 6, 200, 14, 6), '#e8e1d2', 3); },
  bowl(ctx) { const p = new Path2D(); p.moveTo(-60, 0); p.quadraticCurveTo(0, 70, 60, 0); p.closePath(); fs(ctx, p, '#f2e6cf', 4); fs(ctx, el(0, 0, 60, 12), '#c4643a', 3); },
  table(ctx, {w = 620, color = WARM.wood} = {}) { fs(ctx, rr(-w / 2, 0, w, 30, 6), color, 5); fs(ctx, rr(-w / 2 + 30, 30, 26, 300, 4), dark(color, 0.1), 4); fs(ctx, rr(w / 2 - 56, 30, 26, 300, 4), dark(color, 0.1), 4); fs(ctx, rr(-w / 2 - 10, -4, w + 20, 14, 6), '#fbf1dc', 3); },
  suds(ctx, {t = 0} = {}) { for (let i = 0; i < 14; i++) { const r = 10 + hashN(i) * 16, x = (hashN(i + 4) - 0.5) * 200, y = (hashN(i + 7) - 0.5) * 70 - Math.abs(Math.sin(t * 3 + i)) * 14; fs(ctx, el(x, y, r, r), 'rgba(255,255,255,.85)', 2); } },
  glovesPair(ctx, {color = '#7a4a2a'} = {}) { for (const s of [-1, 1]) { ctx.save(); ctx.translate(s * 34, 0); ctx.rotate(s * 0.2); fs(ctx, rr(-20, -30, 40, 56, 14), color, 3); fs(ctx, rr(-22, 22, 44, 14, 4), dark(color, 0.15), 3); ctx.restore(); } },
  pew(ctx, {w = 700} = {}) { fs(ctx, rr(-w / 2, -150, w, 26, 6), WARM.woodD, 4); fs(ctx, rr(-w / 2, -40, w, 34, 6), WARM.wood, 4); for (const x of [-w / 2 + 10, w / 2 - 40]) fs(ctx, rr(x, -150, 30, 260, 6), WARM.woodD, 4); },
  basin(ctx) { // a washbasin in front of the character (origin = rim centre)
    fs(ctx, rr(220, -150, 34, 120, 10), '#b8b8b8', 4); fs(ctx, rr(160, -160, 94, 22, 8), '#b8b8b8', 4); // tap at the side, never over a face
    fs(ctx, rr(-330, -40, 660, 100, 34), '#f7f2ea', 6); fs(ctx, poly([[-90, 56], [90, 56], [60, 420], [-60, 420]]), '#f0e8db', 5);
  },
  nameStone(ctx, {name = 'ADA', glow = 0} = {}) { // a grey stone with a name scratched on it; glow 0..1 as it turns to sand
    const p = new Path2D(); p.moveTo(-90, 10); p.quadraticCurveTo(-100, -60, -20, -70); p.quadraticCurveTo(70, -80, 95, -10); p.quadraticCurveTo(110, 55, 20, 62); p.quadraticCurveTo(-80, 70, -90, 10); p.closePath();
    fs(ctx, p, mix('#8c8f96', '#ffd98a', glow), 5); ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fill(el(-30, -40, 30, 12, -0.3));
    ctx.fillStyle = INK; ctx.font = '62px GraceCaption'; ctx.textAlign = 'center'; ctx.fillText(name, 4, 22); ctx.textAlign = 'left';
    if (glow > 0) { const g = ctx.createRadialGradient(0, 0, 10, 0, 0, 260); g.addColorStop(0, `rgba(255,220,140,${0.6 * glow})`); g.addColorStop(1, 'rgba(255,220,140,0)'); ctx.fillStyle = g; ctx.fillRect(-260, -260, 520, 520); }
  },
  suitcase(ctx, {color = '#7a4a2a'} = {}) { fs(ctx, rr(-80, -110, 160, 120, 12), color, 5); fs(ctx, rr(-30, -140, 60, 34, 10), null, 5); ctx.strokeStyle = dark(color, 0.25); ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-50, -110); ctx.lineTo(-50, 10); ctx.moveTo(50, -110); ctx.lineTo(50, 10); ctx.stroke(); },
  pie(ctx) { fs(ctx, el(0, 0, 90, 26), '#d9a066', 4); fs(ctx, el(0, -8, 80, 20), '#e8b878', 4); ctx.strokeStyle = '#b5552f'; ctx.lineWidth = 4; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(i * 26 - 10, -22); ctx.lineTo(i * 26 + 10, 6); ctx.stroke(); } },
  basket(ctx) { const p = new Path2D(); p.moveTo(-70, -30); p.lineTo(70, -30); p.lineTo(55, 40); p.lineTo(-55, 40); p.closePath(); fs(ctx, p, '#c48a4a', 4); ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, -30, 56, Math.PI, 0); ctx.stroke(); for (const [x, c] of [[-35, '#e2574c'], [0, '#f4b942'], [35, '#7c8f4a']]) fs(ctx, el(x, -38, 18, 16), c, 3); },
  coins(ctx) { for (let i = 0; i < 3; i++) fs(ctx, el(i * 18 - 18, -i * 6, 16, 8), '#f4b942', 3); },
  backpack(ctx, {color = '#3f6a7a'} = {}) { fs(ctx, rr(-60, -150, 120, 150, 30), color, 5); fs(ctx, rr(-44, -90, 88, 60, 14), dark(color, 0.15), 4); ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, -150, 28, Math.PI, 0); ctx.stroke(); },
  // an oil lantern hanging from its ring (origin = top of the ring); lit 0..1 sets flame and glow
  lanternG(ctx, {lit = 1} = {}) {
    if (lit > 0.02) glow(ctx, 0, 90, 300 * lit, 0.55 * lit, '255,200,110');
    ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 14, 16, Math.PI, 0); ctx.stroke();
    fs(ctx, rr(-40, 22, 80, 22, 8), '#4a4a52', 4);
    fs(ctx, rr(-34, 44, 68, 92, 12), lit > 0.02 ? `rgba(255,233,168,${0.55 + 0.45 * lit})` : 'rgba(110,115,130,.85)', 4);
    if (lit > 0.02) { ctx.fillStyle = '#ffb43a'; ctx.fill(el(0, 96, 12 * lit + 3, 22 * lit + 4)); ctx.fillStyle = '#fff3c4'; ctx.fill(el(0, 102, 6 * lit + 1, 11 * lit + 2)); }
    ctx.strokeStyle = INK; ctx.lineWidth = 4; for (const x of [-12, 12]) { ctx.beginPath(); ctx.moveTo(x, 46); ctx.lineTo(x, 134); ctx.stroke(); }
    fs(ctx, rr(-40, 134, 80, 18, 6), '#4a4a52', 4);
  },
  // a rowboat in side view, origin at the waterline centre; a seated rower at the same y shows from the waist up.
  // lantern: -1 none, else 0..1 on a pole at the bow (dir 1 = bow on the right)
  rowboat(ctx, {w = 720, h = 230, color = '#8a5a36', lantern = -1, dir = 1, sea = '#1c2a3c'} = {}) {
    if (lantern >= 0) { const px = dir * (w / 2 - 70); fs(ctx, rr(px - 8, -h - 330, 16, 340, 4), WARM.woodD, 4); fs(ctx, rr(px - 8, -h - 330, dir * 90, 14, 4), WARM.woodD, 4);
      ctx.save(); ctx.translate(px + dir * 78, -h - 316); GRACE_PROPS.lanternG(ctx, {lit: lantern}); ctx.restore(); }
    const hull = new Path2D(); hull.moveTo(-w / 2, -h); hull.lineTo(w / 2, -h); hull.quadraticCurveTo(w / 2 - 30, 20, w / 2 - 170, 40); hull.lineTo(-w / 2 + 170, 40); hull.quadraticCurveTo(-w / 2 + 30, 20, -w / 2, -h); hull.closePath();
    fs(ctx, hull, color, 5); ctx.strokeStyle = dark(color, 0.25); ctx.lineWidth = 4; for (const y of [-h + 70, -h + 140]) { ctx.beginPath(); ctx.moveTo(-w / 2 + 30, y); ctx.lineTo(w / 2 - 30, y); ctx.stroke(); }
    fs(ctx, rr(-w / 2 - 12, -h - 14, w + 24, 24, 8), dark(color, 0.2), 4);
    const wv = new Path2D(); wv.moveTo(-w / 2 - 80, 0); for (let x = -w / 2 - 80; x < w / 2 + 80; x += 80) wv.quadraticCurveTo(x + 40, -18, x + 80, 0); wv.lineTo(w / 2 + 80, 120); wv.lineTo(-w / 2 - 80, 120); wv.closePath();
    const fade = ctx.createLinearGradient(0, -18, 0, 120); fade.addColorStop(0, sea); fade.addColorStop(0.55, sea); fade.addColorStop(1, 'rgba(0,0,0,0)'); // the hull sinks into the sea, no hard box
    ctx.fillStyle = fade; ctx.fill(wv); ctx.strokeStyle = 'rgba(150,180,220,.4)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-w / 2 - 80, 0); for (let x = -w / 2 - 80; x < w / 2 + 80; x += 80) ctx.quadraticCurveTo(x + 40, -18, x + 80, 0); ctx.stroke();
  },
  fish(ctx, {color = '#8fa3b0'} = {}) { const b = new Path2D(); b.ellipse(0, 0, 60, 24, 0, 0, Math.PI * 2); fs(ctx, b, color, 4); fs(ctx, poly([[52, 0], [92, -26], [92, 26]]), dark(color, 0.1), 4); ctx.fillStyle = INK; ctx.fill(el(-34, -6, 5, 5)); ctx.strokeStyle = dark(color, 0.3); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(-18, 0, 16, -1, 1); ctx.stroke(); },
  benchG(ctx, {w = 560, h = 120} = {}) { fs(ctx, rr(-w / 2, -h, w, 26, 8), WARM.wood, 5); for (const x of [-w / 2 + 34, w / 2 - 58]) fs(ctx, rr(x, -h + 26, 24, h - 26, 4), WARM.woodD, 4); }, // a plain bench; seat top at y = -h
  lunchbox(ctx, {color = '#e2574c'} = {}) { fs(ctx, rr(-70, -60, 140, 70, 10), color, 5); fs(ctx, rr(-26, -78, 52, 22, 8), null, 5); ctx.strokeStyle = dark(color, 0.25); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-70, -36); ctx.lineTo(70, -36); ctx.stroke(); },
  sandwich(ctx) { fs(ctx, poly([[-50, 20], [50, 20], [0, -40]]), '#f2d6a0', 4); ctx.strokeStyle = '#7c8f4a'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-36, 6); ctx.lineTo(36, 6); ctx.stroke(); },
  drawing(ctx) { fs(ctx, rr(-80, -100, 160, 120, 4), '#fffdf6', 4); ctx.fillStyle = WARM.gold; ctx.fill(el(40, -70, 18, 18)); ctx.strokeStyle = '#3f6a7a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-60, 0); ctx.lineTo(-20, -50); ctx.lineTo(20, 0); ctx.stroke(); fs(ctx, rr(-40, -20, 30, 20, 2), '#c4643a', 3); },
  bike(ctx) { ctx.strokeStyle = INK; ctx.lineWidth = 7; for (const x of [-80, 80]) { ctx.beginPath(); ctx.arc(x, 0, 52, 0, 7); ctx.stroke(); } ctx.strokeStyle = '#c4643a'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(-80, 0); ctx.lineTo(-10, -70); ctx.lineTo(80, 0); ctx.moveTo(-10, -70); ctx.lineTo(50, -70); ctx.lineTo(80, 0); ctx.stroke(); },
  well(ctx) { fs(ctx, el(0, 0, 130, 40), '#c9b08a', 5); fs(ctx, rr(-130, 0, 260, 150, 6), WARM.stone, 6); ctx.strokeStyle = dark(WARM.stone, 0.2); ctx.lineWidth = 4; for (let y = 40; y < 150; y += 40) { ctx.beginPath(); ctx.moveTo(-130, y); ctx.lineTo(130, y); ctx.stroke(); } fs(ctx, el(0, 0, 110, 28), '#3a5a6a', 4); for (const x of [-110, 100]) fs(ctx, rr(x, -220, 14, 220, 3), WARM.wood, 4); fs(ctx, poly([[-150, -210], [150, -210], [0, -300]]), WARM.roof, 5); },
  cookieJar(ctx, {cookie = true} = {}) { fs(ctx, rr(-60, -120, 120, 130, 30), 'rgba(220,240,245,.85)', 5); fs(ctx, rr(-50, -140, 100, 26, 8), '#c4643a', 4); if (cookie) fs(ctx, el(0, -30, 30, 26), '#c48a4a', 4); },
  ladder(ctx) { for (const x of [-50, 50]) fs(ctx, rr(x - 8, -520, 16, 520, 4), WARM.wood, 4); for (let y = -480; y < 0; y += 80) fs(ctx, rr(-50, y, 100, 12, 3), WARM.woodD, 3); },
  notebook(ctx) { fs(ctx, rr(-60, -80, 120, 160, 6), '#fbf1dc', 4); ctx.strokeStyle = INK; ctx.lineWidth = 3; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-40 + i * 14, -50); ctx.lineTo(-40 + i * 14, -10); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(-46, -20); ctx.lineTo(36, -40); ctx.stroke(); },
  pewFront(ctx, {w = 700} = {}) { fs(ctx, rr(-w / 2, 0, w, 140, 8), WARM.wood, 5); ctx.strokeStyle = dark(WARM.wood, 0.2); ctx.lineWidth = 4; for (let x = -w / 2 + 40; x < w / 2; x += 110) ctx.strokeRect(x, 24, 80, 92); },
  frame(ctx, {kind = 'brothers'} = {}) { // an old sepia photo of two boys
    fs(ctx, rr(-150, -190, 300, 380, 10), '#8a5a36', 8); fs(ctx, rr(-126, -166, 252, 332, 4), '#e9d3a8', 4);
    ctx.fillStyle = 'rgba(110,70,40,.55)'; for (const [x, h] of [[-50, 210], [50, 240]]) { ctx.fill(el(x, 140 - h, 30, 34)); ctx.fill(rr(x - 34, 150 - h + 30, 68, h - 50, 18)); }
  },
  calendarG(ctx, {day = 'MON'} = {}) { fs(ctx, rr(-90, -110, 180, 220, 12), '#fbf1dc', 5); fs(ctx, rr(-90, -110, 180, 56, 12), '#c4643a', 5); ctx.fillStyle = INK; ctx.font = '64px GraceCaption'; ctx.textAlign = 'center'; ctx.fillText(day, 0, 50); ctx.textAlign = 'left'; },
  sunDisk(ctx) { ctx.fillStyle = 'rgba(255,240,200,.95)'; ctx.fill(el(0, 0, 70, 70)); ctx.strokeStyle = '#f4b942'; ctx.lineWidth = 8; for (let a = 0; a < 12; a++) { ctx.beginPath(); ctx.moveTo(Math.cos(a / 12 * 6.28) * 90, Math.sin(a / 12 * 6.28) * 90); ctx.lineTo(Math.cos(a / 12 * 6.28) * 120, Math.sin(a / 12 * 6.28) * 120); ctx.stroke(); } },
  sweat(ctx) { for (const [x, y] of [[-30, 0], [34, -20]]) fs(ctx, (() => { const p = new Path2D(); p.moveTo(x, y - 18); p.quadraticCurveTo(x + 12, y, x, y + 8); p.quadraticCurveTo(x - 12, y, x, y - 18); return p; })(), '#9fd3f0', 3); },
};

Object.assign(SETS, GRACE_SETS);
Object.assign(PROPS, GRACE_PROPS);
