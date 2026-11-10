// R1 · rule-world 2D: flat-vector sets and props on a 1080×1920 world plane (thick ink outline, flat fills).
import {Path2D} from '@napi-rs/canvas';
import {INK, mix, dark, light, drawBaby} from './r1-rig.mjs';

const OL = 5; // outline px
function fs(ctx, path, fill, w = OL) {
  if (fill) { ctx.fillStyle = fill; ctx.fill(path); }
  if (w) { ctx.lineWidth = w; ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.stroke(path); }
}
const rr = (x, y, w, h, r) => { const p = new Path2D(); p.roundRect(x, y, w, h, r); return p; };
const el = (x, y, rx, ry, rot = 0) => { const p = new Path2D(); p.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); return p; };
export const grey = (hex, sat) => sat >= 1 ? hex : mix(desat(hex), hex, Math.max(0, sat));
function desat(hex) { const n = parseInt(hex.slice(1), 16), r = n >> 16 & 255, g = n >> 8 & 255, b = n & 255; const y = Math.round(0.3 * r + 0.59 * g + 0.11 * b); return '#' + ((1 << 24) + (y << 16) + (y << 8) + y).toString(16).slice(1); }

function cloud(ctx, x, y, s, color = '#ffffff') {
  const p = new Path2D();
  for (const [dx, dy, r] of [[0, 0, 42], [46, -18, 52], [98, 0, 40], [50, 14, 44]]) p.ellipse(x + dx * s, y + dy * s, r * s, r * s * 0.8, 0, 0, Math.PI * 2);
  ctx.fillStyle = color; ctx.fill(p);
}
function tree(ctx, x, y, s = 1, sat = 1) {
  fs(ctx, rr(x - 16 * s, y - 170 * s, 32 * s, 175 * s, 8), grey('#6b4a2e', sat));
  const p = new Path2D();
  for (const [dx, dy, r] of [[0, -250, 85], [-70, -190, 70], [70, -190, 72], [0, -150, 70]]) p.ellipse(x + dx * s, y + dy * s, r * s, r * s, 0, 0, Math.PI * 2);
  fs(ctx, p, grey('#5bb24a', sat)); ctx.fillStyle = grey('#77c95f', sat);
  ctx.fill(el(x - 30 * s, y - 280 * s, 30 * s, 20 * s, -0.5));
}
function archWindow(ctx, x, y, w, h, sat = 1, lit = false) {
  const p = new Path2D(); p.moveTo(x, y + h); p.lineTo(x, y + w / 2); p.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); p.lineTo(x + w, y + h); p.closePath();
  fs(ctx, p, '#ffffff', 4);
  const q = new Path2D(); const m = 9; q.moveTo(x + m, y + h - m); q.lineTo(x + m, y + w / 2); q.arc(x + w / 2, y + w / 2, w / 2 - m, Math.PI, 0); q.lineTo(x + w - m, y + h - m); q.closePath();
  ctx.fillStyle = lit ? '#ffd877' : grey('#bfe3f5', sat); ctx.fill(q);
  ctx.save(); ctx.clip(q); ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.moveTo(x, y + h * 0.75); ctx.lineTo(x + w * 0.55, y); ctx.lineTo(x + w * 0.8, y); ctx.lineTo(x, y + h); ctx.fill(); ctx.restore();
  ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + w / 2, y + m); ctx.lineTo(x + w / 2, y + h - m); ctx.stroke();
}
function house(ctx, x, w, top, base, color, sat = 1, opts = {}) {
  const c = grey(color, sat);
  fs(ctx, rr(x, top, w, base - top + 10, 4), c);
  fs(ctx, rr(x - 10, top - 16, w + 20, 30, 6), grey(light(color, 0.55), sat), 4);
  ctx.fillStyle = dark(c, 0.08); ctx.fillRect(x + 4, base - 40, w - 8, 36);
  const cols = w > 245 ? 3 : 2, ww = 54, gap = (w - cols * ww) / (cols + 1);
  for (let row = 0; row < opts.floors; row++) for (let i = 0; i < cols; i++) {
    const wx = x + gap + i * (ww + gap), wy = top + 40 + row * 150;
    if (wy + 100 > base - 160 && opts.door && i === Math.floor(cols / 2)) continue;
    if (wy + 100 > base - 20) continue;
    archWindow(ctx, wx, wy, ww, 100, sat, opts.lit && (i + row) % 2 === 0);
    if (opts.shutters) { fs(ctx, rr(wx + 4, wy + 26, ww - 8, 70, 3), grey('#7d7468', sat), 3); }
  }
  if (opts.door) {
    const dw = 78, dx = x + w / 2 - dw / 2, dy = base - 160;
    const d = new Path2D(); d.moveTo(dx, base); d.lineTo(dx, dy + dw / 2); d.arc(dx + dw / 2, dy + dw / 2, dw / 2, Math.PI, 0); d.lineTo(dx + dw, base); d.closePath();
    fs(ctx, d, grey(opts.doorColor || '#8a5634', sat), 4);
    ctx.fillStyle = '#f4c542'; ctx.fill(el(dx + dw - 14, base - 72, 5, 5));
  }
}
function bunting(ctx, x0, x1, y, sag, sat = 1) {
  ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0, y); ctx.quadraticCurveTo((x0 + x1) / 2, y + sag * 2, x1, y); ctx.stroke();
  const cols = ['#e84a5f', '#f5c518', '#3db37a', '#3f7fd6', '#ff8c2f'];
  for (let i = 1; i < 14; i++) {
    const t = i / 14, px = x0 + (x1 - x0) * t, py = (1 - t) * (1 - t) * y + 2 * (1 - t) * t * (y + sag * 2) + t * t * y;
    const p = new Path2D(); p.moveTo(px - 15, py); p.lineTo(px + 15, py); p.lineTo(px, py + 34); p.closePath(); fs(ctx, p, grey(cols[i % 5], sat), 3);
  }
}
function ground(ctx, y, color = '#e9dcc5', sat = 1, wavy = true) {
  ctx.fillStyle = grey(color, sat); ctx.fillRect(0, y, 1080, 1920 - y);
  ctx.strokeStyle = INK; ctx.lineWidth = OL; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1080, y); ctx.stroke();
  if (wavy) { ctx.strokeStyle = grey(dark(color, 0.22), sat); ctx.lineWidth = 6; ctx.beginPath(); for (let x = -20; x <= 1100; x += 10) ctx.lineTo(x, y + 150 + Math.sin(x / 55) * 14); ctx.stroke(); }
}

// ---------- sets (each returns a painter for a cached 1080×1920 plate) ----------
const SKY = {day: ['#9fd3f0', '#cfeaf7'], sunset: ['#f7a26b', '#ffd9a0'], night: ['#1d2547', '#33406e'], dawn: ['#f6b98a', '#fde3c0']};
export const SETS = {
  street({sat = 1, bentoSat = 1, time = 'day', bunt = true, lit = false} = {}) {
    return ctx => {
      const [a, b] = SKY[time]; const g = ctx.createLinearGradient(0, 0, 0, 1300); g.addColorStop(0, grey(a, sat)); g.addColorStop(1, grey(b, sat));
      ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
      if (time === 'night') { ctx.fillStyle = '#fff6c9'; ctx.fill(el(840, 190, 60, 60)); ctx.fillStyle = '#ffffff'; for (const [x, y] of [[120, 120], [300, 260], [520, 90], [700, 300], [980, 420]]) ctx.fill(el(x, y, 4, 4)); }
      else { cloud(ctx, 90, 200, 1.1, grey('#ffffff', sat)); cloud(ctx, 700, 130, 0.9); }
      if (time === 'sunset') { ctx.fillStyle = '#ffe08a'; ctx.fill(el(540, 330, 110, 110)); }
      const base = 1290, H = [['#f2c14e', -70, 250, 620], ['#8fd1b0', 175, 250, 520], ['#f29bb2', 420, 240, 600], ['#8fb5e8', 655, 220, 500], ['#e8925a', 870, 270, 560]];
      H.forEach(([c, x, w, top], i) => {
        const isBento = i === 4, s = isBento ? Math.min(sat, bentoSat) : sat;
        house(ctx, x, w, top, base, c, s, {floors: 5, door: i % 2 === 0 || isBento, shutters: isBento && bentoSat < 0.3, lit: lit && time === 'night', doorColor: isBento ? '#7a4b2a' : '#8a5634'});
      });
      if (bunt) bunting(ctx, -20, 1100, 560, 40, sat);
      ground(ctx, base, '#e9dcc5', sat);
      tree(ctx, 60, base + 40, 1.0, sat); tree(ctx, 1030, base + 60, 0.9, sat);
      if (time === 'night') { ctx.fillStyle = 'rgba(20,25,60,.38)'; ctx.fillRect(0, 0, 1080, 1920); }
      if (time === 'sunset') { ctx.fillStyle = 'rgba(255,150,80,.12)'; ctx.fillRect(0, 0, 1080, 1920); }
    };
  },
  door({sat = 1, alive = 0, time = 'day', porch = false, dim = 0.55} = {}) {
    return ctx => {
      const wall = grey('#e8925a', sat);
      ctx.fillStyle = wall; ctx.fillRect(0, 0, 1080, 1920);
      ctx.strokeStyle = dark(wall, 0.1); ctx.lineWidth = 3;
      for (let y = 40; y < 1360; y += 46) for (let x = (Math.round(y / 46) % 2) ? -50 : 0; x < 1080; x += 100) ctx.strokeRect(x, y, 100, 46);
      fs(ctx, rr(352, 690, 376, 680, 14), '#f4efe6', 8);
      fs(ctx, rr(380, 720, 320, 640, 6), '#2b2330', 5);
      ctx.fillStyle = 'rgba(255,220,150,.22)'; ctx.fillRect(383, 723, 314, 634);
      fs(ctx, rr(500, 600, 80, 56, 8), '#f4efe6', 4); ctx.fillStyle = INK; ctx.font = 'bold 40px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('7', 540, 642); ctx.textAlign = 'left';
      fs(ctx, rr(770, 600, 250, 330, 10), '#f4efe6', 6);
      fs(ctx, rr(792, 622, 206, 286, 4), time === 'night' ? '#ffe39a' : '#3b3242', 4);
      ctx.fillStyle = grey('#d8566b', sat); ctx.fillRect(796, 626, 40, 278); ctx.fillRect(954, 626, 40, 278);
      for (const px of [200, 880]) {
        const k = alive;
        for (let i = -2; i <= 2; i++) {
          const tip = [px + i * 34 + (1 - k) * i * 28, 1190 - 150 * k - 60 + (1 - k) * 90];
          ctx.lineCap = 'round';
          ctx.strokeStyle = INK; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(px + i * 8, 1240); ctx.quadraticCurveTo(px + i * 20, 1150 - 40 * k, ...tip); ctx.stroke();
          ctx.strokeStyle = mix('#8a6a3a', '#3e9a46', k); ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(px + i * 8, 1240); ctx.quadraticCurveTo(px + i * 20, 1150 - 40 * k, ...tip); ctx.stroke();
          if (k > 0.3) { fs(ctx, el(tip[0], tip[1], 22 * k, 13 * k, i * 0.4), '#4fb85a', 3); if (i % 2 === 0) fs(ctx, el(tip[0], tip[1] - 16 * k, 15 * k, 15 * k), ['#ff5d73', '#ffcf2e', '#a66cf0'][(i + 2) / 2 | 0], 3); }
          else { ctx.fillStyle = '#9a7b4f'; ctx.fill(el(tip[0], tip[1], 10, 6, i)); }
        }
        const pot = new Path2D(); pot.moveTo(px - 70, 1230); pot.lineTo(px + 70, 1230); pot.lineTo(px + 52, 1350); pot.lineTo(px - 52, 1350); pot.closePath(); fs(ctx, pot, grey('#c8643b', Math.max(sat, 0.4)));
        fs(ctx, rr(px - 80, 1220, 160, 26, 6), grey('#d9774b', Math.max(sat, 0.4)), 4);
      }
      ground(ctx, 1360, '#d9cdb6', 1, false);
      fs(ctx, rr(400, 1366, 280, 50, 10), grey('#8b3f3f', sat), 4);
      if (time === 'night') {
        ctx.fillStyle = `rgba(15,20,55,${dim})`; ctx.fillRect(0, 0, 1080, 1920);
        if (porch) { const g = ctx.createRadialGradient(540, 560, 10, 540, 860, 560); g.addColorStop(0, 'rgba(255,214,120,.6)'); g.addColorStop(1, 'rgba(255,214,120,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920); fs(ctx, el(540, 540, 30, 22), '#ffe9a6', 4); }
      }
      if (time === 'dawn') { ctx.fillStyle = 'rgba(255,170,110,.14)'; ctx.fillRect(0, 0, 1080, 1920); }
    };
  },
  bedroom({night = true} = {}) {
    return ctx => {
      ctx.fillStyle = night ? '#6a5aa0' : '#f4e3b5'; ctx.fillRect(0, 0, 1080, 1920);
      ctx.fillStyle = night ? '#5f5092' : '#ead79f'; for (let x = 0; x < 1080; x += 90) ctx.fillRect(x, 0, 45, 1300);
      fs(ctx, rr(90, 360, 380, 470, 12), '#f4efe6', 8);
      fs(ctx, rr(115, 385, 330, 420, 4), night ? '#20295a' : '#9fd3f0', 4);
      if (night) { ctx.fillStyle = '#fff6c9'; ctx.fill(el(330, 480, 46, 46)); ctx.fillStyle = '#20295a'; ctx.fill(el(352, 466, 40, 40)); ctx.fillStyle = '#fff'; for (const [x, y] of [[170, 450], [230, 620], [400, 700], [160, 740]]) ctx.fill(el(x, y, 4, 4)); }
      else { ctx.fillStyle = '#ffe08a'; ctx.fill(el(330, 500, 55, 55)); }
      ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(280, 385); ctx.lineTo(280, 805); ctx.moveTo(115, 595); ctx.lineTo(445, 595); ctx.stroke();
      for (const x of [60, 440]) fs(ctx, rr(x, 330, 70, 560, 20), night ? '#d06a8c' : '#e8414b', 4);
      const draws = [[560, 330], [760, 300], [900, 450], [600, 540]];
      draws.forEach(([x, y], i) => {
        ctx.save(); ctx.translate(x, y); ctx.rotate((i % 2 ? 1 : -1) * 0.07);
        fs(ctx, rr(0, 0, 150, 120, 4), '#fffdf6', 4);
        ctx.lineWidth = 7; ctx.lineCap = 'round';
        if (i === 0) { for (const [k, cc] of [[0, '#e84a5f'], [1, '#f5c518'], [2, '#3db37a'], [3, '#3f7fd6']]) { ctx.strokeStyle = cc; ctx.beginPath(); ctx.arc(75, 100, 55 - k * 9, Math.PI, 0); ctx.stroke(); } }
        else if (i === 1) { ctx.fillStyle = '#ff6b8b'; const h = new Path2D(); h.moveTo(75, 95); h.bezierCurveTo(10, 50, 40, 10, 75, 40); h.bezierCurveTo(110, 10, 140, 50, 75, 95); ctx.fill(h); }
        else if (i === 2) { ctx.fillStyle = '#ffcf2e'; ctx.fill(el(75, 60, 26, 26)); ctx.strokeStyle = '#ffcf2e'; for (let a = 0; a < 8; a++) { ctx.beginPath(); ctx.moveTo(75 + Math.cos(a) * 34, 60 + Math.sin(a) * 34); ctx.lineTo(75 + Math.cos(a) * 46, 60 + Math.sin(a) * 46); ctx.stroke(); } }
        else { ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(50, 45, 12, 0, 7); ctx.moveTo(50, 57); ctx.lineTo(50, 90); ctx.moveTo(112, 45); ctx.arc(100, 45, 12, 0, 7); ctx.moveTo(100, 57); ctx.lineTo(100, 90); ctx.moveTo(50, 70); ctx.lineTo(100, 70); ctx.stroke(); }
        ctx.fillStyle = 'rgba(255,240,180,.85)'; ctx.fillRect(60, -8, 30, 16);
        ctx.restore();
      });
      ctx.fillStyle = night ? '#6e4f42' : '#c99a6b'; ctx.fillRect(0, 1300, 1080, 620);
      ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 1300); ctx.lineTo(1080, 1300); ctx.stroke();
      ctx.strokeStyle = 'rgba(0,0,0,.12)'; ctx.lineWidth = 3; for (let y = 1360; y < 1920; y += 70) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1080, y); ctx.stroke(); }
      fs(ctx, el(560, 1610, 330, 70), night ? '#8a5ab0' : '#e8a0c0', 5);
      fs(ctx, rr(560, 1010, 40, 420, 10), '#a0683e'); fs(ctx, rr(1040, 1110, 40, 320, 10), '#a0683e');
      fs(ctx, rr(560, 1180, 520, 120, 16), '#ffffff');
      fs(ctx, rr(40, 1080, 170, 230, 10), '#a0683e'); fs(ctx, rr(100, 980, 50, 100, 6), '#d8d0c0');
      const shade = new Path2D(); shade.moveTo(70, 990); shade.lineTo(180, 990); shade.lineTo(160, 900); shade.lineTo(90, 900); shade.closePath(); fs(ctx, shade, '#ffd36b');
      if (night) { const g = ctx.createRadialGradient(125, 950, 10, 125, 950, 460); g.addColorStop(0, 'rgba(255,214,120,.45)'); g.addColorStop(1, 'rgba(255,214,120,0)'); ctx.fillStyle = g; ctx.fillRect(0, 400, 800, 1000); }
    };
  },
  home() {
    return ctx => {
      ctx.fillStyle = '#f7d9a8'; ctx.fillRect(0, 0, 1080, 1920);
      ctx.fillStyle = '#f2cf96'; for (let y = 0; y < 1300; y += 80) ctx.fillRect(0, y, 1080, 40);
      fs(ctx, rr(620, 380, 360, 420, 12), '#f4efe6', 8); fs(ctx, rr(645, 405, 310, 370, 4), '#9fd3f0', 4); cloud(ctx, 680, 520, 0.7);
      for (const x of [585, 960]) fs(ctx, rr(x, 350, 60, 500, 18), '#3db37a', 4);
      fs(ctx, rr(60, 520, 420, 200, 10), '#e8925a'); fs(ctx, rr(80, 540, 180, 160, 6), '#f3a776', 4); fs(ctx, rr(280, 540, 180, 160, 6), '#f3a776', 4);
      fs(ctx, rr(60, 960, 420, 340, 10), '#e8925a'); fs(ctx, rr(40, 930, 460, 40, 8), '#f4efe6');
      ctx.fillStyle = '#c99a6b'; ctx.fillRect(0, 1300, 1080, 620); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 1300); ctx.lineTo(1080, 1300); ctx.stroke();
      ctx.fillStyle = 'rgba(0,0,0,.08)'; for (let x = 0; x < 1080; x += 120) for (let y = 1320; y < 1920; y += 120) if (((x + y - 1320) / 120) % 2 === 0) ctx.fillRect(x, y, 120, 120);
    };
  },
  park({sat = 1, time = 'day'} = {}) {
    return ctx => {
      const g = ctx.createLinearGradient(0, 0, 0, 1200); g.addColorStop(0, grey('#9fd3f0', sat)); g.addColorStop(1, grey('#d8f0f8', sat)); ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
      cloud(ctx, 600, 230, 1.0); cloud(ctx, 60, 380, 0.8);
      const hill = new Path2D(); hill.moveTo(0, 1100); hill.quadraticCurveTo(300, 920, 620, 1050); hill.quadraticCurveTo(880, 960, 1080, 1040); hill.lineTo(1080, 1920); hill.lineTo(0, 1920); hill.closePath(); fs(ctx, hill, grey('#a7d98a', sat));
      tree(ctx, 180, 1120, 1.2, sat); tree(ctx, 900, 1100, 1.0, sat);
      ground(ctx, 1260, '#8fcf6b', sat, false);
      const path = new Path2D(); path.moveTo(380, 1260); path.lineTo(700, 1260); path.lineTo(900, 1920); path.lineTo(180, 1920); path.closePath(); fs(ctx, path, grey('#eadbb8', sat), 4);
      fs(ctx, rr(700, 1180, 300, 26, 6), grey('#b06b3c', sat), 4); fs(ctx, rr(720, 1206, 18, 70, 4), '#555555'); fs(ctx, rr(960, 1206, 18, 70, 4), '#555555');
      if (time === 'night') {
        ctx.fillStyle = 'rgba(18,22,58,.62)'; ctx.fillRect(0, 0, 1080, 1920);
        ctx.fillStyle = '#fff6c9'; ctx.fill(el(860, 220, 55, 55)); ctx.fillStyle = '#ffffff'; for (const [x, y] of [[120, 160], [330, 300], [560, 120], [980, 480]]) ctx.fill(el(x, y, 4, 4));
        fs(ctx, rr(520, 760, 18, 520, 6), '#3a3f4a'); fs(ctx, el(529, 750, 40, 26), '#ffe9a6', 4);
        const g = ctx.createRadialGradient(529, 900, 20, 529, 1500, 620); g.addColorStop(0, 'rgba(255,220,140,.42)'); g.addColorStop(1, 'rgba(255,220,140,0)'); ctx.fillStyle = g; ctx.fillRect(0, 600, 1080, 1320);
      }
    };
  },
  busStop({sat = 1, time = 'day'} = {}) {
    return ctx => {
      SETS.street({sat, bunt: false, time, lit: time === 'night'})(ctx);
      fs(ctx, rr(860, 860, 16, 520, 6), '#5a6b7d'); fs(ctx, el(868, 830, 62, 62), '#3f7fd6', 5);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 54px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('P', 868, 850); ctx.textAlign = 'left';
    };
  },
  bedroomDay() { return SETS.bedroom({night: false}); },
  blanketFg({night = true, color = '#ffcf2e'} = {}) { // transparent foreground: blanket + bed front, so a sleeper sits "in" the bed
    return ctx => {
      const b = new Path2D(); b.moveTo(600, 1205); b.quadraticCurveTo(820, 1165, 1080, 1195); b.lineTo(1080, 1345); b.lineTo(585, 1345); b.closePath();
      fs(ctx, b, color); ctx.fillStyle = '#ffffff'; for (const [x, y] of [[680, 1262], [800, 1240], [930, 1268], [1020, 1250]]) ctx.fill(el(x, y, 9, 9));
      fs(ctx, rr(560, 1330, 520, 120, 10), '#a0683e');
      if (night) { ctx.fillStyle = 'rgba(30,20,80,.16)'; ctx.fill(b); }
    };
  },
  flash() {
    return ctx => {
      ctx.fillStyle = '#4b4270'; ctx.fillRect(0, 0, 1080, 1920);
      fs(ctx, rr(640, 420, 330, 420, 12), '#f4efe6', 8); fs(ctx, rr(662, 442, 286, 376, 4), '#1d2547', 4);
      ctx.fillStyle = '#fff6c9'; ctx.fill(el(860, 520, 36, 36));
      fs(ctx, rr(80, 560, 300, 740, 10), '#f4efe6', 8); fs(ctx, rr(104, 584, 252, 716, 4), '#7a4b2a', 4); ctx.fillStyle = '#f4c542'; ctx.fill(el(330, 960, 9, 9));
      ctx.fillStyle = '#5b4a3e'; ctx.fillRect(0, 1300, 1080, 620); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 1300); ctx.lineTo(1080, 1300); ctx.stroke();
      const g = ctx.createRadialGradient(560, 1000, 40, 560, 1000, 700); g.addColorStop(0, 'rgba(255,214,140,.35)'); g.addColorStop(1, 'rgba(255,214,140,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
    };
  },
  void() {
    return ctx => { SETS.street({sat: 0.05, bunt: false})(ctx); ctx.fillStyle = 'rgba(70,72,78,.35)'; ctx.fillRect(0, 0, 1080, 1920); };
  },
};

// ---------- props (drawn at their own origin) ----------
export const PROPS = {
  iceCream(ctx, {dropped = 0} = {}) {
    ctx.save(); ctx.rotate(dropped * 2.4);
    const cone = new Path2D(); cone.moveTo(-14, 0); cone.lineTo(14, 0); cone.lineTo(0, 40); cone.closePath(); fs(ctx, cone, '#e0a55a', 3);
    fs(ctx, el(0, -8, 18, 16), '#ff8fb1', 3); fs(ctx, el(0, -24, 13, 12), '#fff2c2', 3);
    ctx.restore();
  },
  splat(ctx) { fs(ctx, el(0, 0, 40, 12), '#ff8fb1', 3); fs(ctx, el(10, -6, 16, 10), '#fff2c2', 3); const c = new Path2D(); c.moveTo(30, -4); c.lineTo(58, -14); c.lineTo(50, 6); c.closePath(); fs(ctx, c, '#e0a55a', 3); },
  flowers(ctx) {
    for (const [x, y, c] of [[-14, -30, '#ff5d73'], [0, -40, '#ffcf2e'], [14, -30, '#a66cf0'], [-6, -50, '#ff8c2f'], [10, -52, '#ff5d73']]) {
      ctx.strokeStyle = '#3e9a46'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(x, y); ctx.stroke(); fs(ctx, el(x, y, 10, 10), c, 3);
    }
    const wrap = new Path2D(); wrap.moveTo(-16, -14); wrap.lineTo(16, -14); wrap.lineTo(4, 16); wrap.lineTo(-4, 16); wrap.closePath(); fs(ctx, wrap, '#fdf3e0', 3);
  },
  can(ctx) { fs(ctx, rr(-22, -20, 44, 40, 8), '#3f7fd6', 3); const s = new Path2D(); s.moveTo(20, -10); s.lineTo(52, -32); s.lineTo(56, -26); s.lineTo(22, 2); s.closePath(); fs(ctx, s, '#3f7fd6', 3); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, -22, 16, Math.PI, 0); ctx.stroke(); },
  clock(ctx, {ring = 0} = {}) {
    ctx.save(); if (ring) ctx.rotate(Math.sin(ring * 70) * 0.14);
    for (const sg of [-1, 1]) fs(ctx, el(sg * 30, -46, 18, 14), '#e8414b', 4);
    fs(ctx, el(0, 0, 50, 50), '#e8414b'); fs(ctx, el(0, 0, 38, 38), '#ffffff', 3);
    ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -26); ctx.moveTo(0, 0); ctx.lineTo(18, 6); ctx.stroke();
    fs(ctx, rr(-34, 46, 14, 14, 3), '#e8414b', 3); fs(ctx, rr(20, 46, 14, 14, 3), '#e8414b', 3);
    ctx.restore();
  },
  bus(ctx) {
    fs(ctx, rr(-300, -260, 600, 260, 28), '#f5c518', 6);
    for (let i = 0; i < 4; i++) fs(ctx, rr(-270 + i * 135, -230, 110, 90, 10), '#bfe3f5', 4);
    fs(ctx, rr(-300, -110, 600, 30, 4), '#e8414b', 4);
    for (const x of [-180, 180]) { fs(ctx, el(x, 0, 48, 48), '#333333', 5); fs(ctx, el(x, 0, 18, 18), '#aaaaaa', 3); }
  },
  basket(ctx) {
    ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.beginPath(); ctx.arc(0, -30, 80, Math.PI, 0); ctx.stroke(); ctx.strokeStyle = '#c48a4a'; ctx.lineWidth = 4; ctx.stroke();
    const b = new Path2D(); b.moveTo(-90, -30); b.lineTo(90, -30); b.lineTo(70, 40); b.lineTo(-70, 40); b.closePath(); fs(ctx, b, '#c48a4a');
    ctx.strokeStyle = dark('#c48a4a', 0.25); ctx.lineWidth = 3; for (let x = -70; x <= 70; x += 20) { ctx.beginPath(); ctx.moveTo(x, -28); ctx.lineTo(x * 0.8, 38); ctx.stroke(); }
  },
  crib(ctx) {
    fs(ctx, rr(-185, -200, 22, 300, 6), '#b08055'); fs(ctx, rr(163, -200, 22, 300, 6), '#b08055');
    fs(ctx, rr(-170, -150, 340, 26, 8), '#c9a27a'); fs(ctx, rr(-170, 40, 340, 26, 8), '#c9a27a');
  },
  cribFront(ctx) { for (let x = -150; x <= 150; x += 30) fs(ctx, rr(x - 5, -128, 10, 170, 3), '#e3c49f', 3); },
  doorLeaf(ctx, {open = 0, sat = 1} = {}) { // anchored at the hinge (left edge of the doorway at 380,720)
    const w = 320 * (1 - open * 0.85);
    fs(ctx, rr(0, 0, w, 640, 6), grey('#7a4b2a', sat), 5);
    if (w > 120) { ctx.strokeStyle = dark(grey('#7a4b2a', sat), 0.25); ctx.lineWidth = 5; ctx.strokeRect(w * 0.14, 50, w * 0.72, 230); ctx.strokeRect(w * 0.14, 340, w * 0.72, 250); ctx.fillStyle = '#f4c542'; ctx.fill(el(w - 34, 340, 12, 12)); }
  },
  cloudGrey(ctx) { cloud(ctx, -110, 0, 1.4, '#7c7f86'); ctx.strokeStyle = '#9aa3b5'; ctx.lineWidth = 5; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-80 + i * 34, 60); ctx.lineTo(-92 + i * 34, 100); ctx.stroke(); } },
  calendar(ctx, {day = 1} = {}) { fs(ctx, rr(-70, -80, 140, 160, 10), '#ffffff'); fs(ctx, rr(-70, -80, 140, 44, 10), '#e8414b'); ctx.fillStyle = INK; ctx.font = 'bold 70px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(String(day), 0, 50); ctx.textAlign = 'left'; },
  cane(ctx) { ctx.strokeStyle = INK; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 150); ctx.arc(-14, 0, 14, 0, Math.PI, true); ctx.stroke(); ctx.strokeStyle = '#8a5a36'; ctx.lineWidth = 6; ctx.stroke(); },
  heart(ctx) { const h = new Path2D(); h.moveTo(0, 18); h.bezierCurveTo(-30, -2, -18, -26, 0, -10); h.bezierCurveTo(18, -26, 30, -2, 0, 18); fs(ctx, h, '#ff4d6d', 3); },
  photo(ctx, {baby = {kind: 'baby', skin: '#8a5a3c', blanket: '#f3d36b', hairColor: '#1f1512'}} = {}) { // framed photo of a grey newborn in a crib
    ctx.save(); ctx.rotate(-0.04);
    fs(ctx, rr(-160, -190, 320, 380, 10), '#c49a62', 8); fs(ctx, rr(-132, -162, 264, 324, 4), '#8f8c86', 4);
    ctx.save(); ctx.beginPath(); ctx.rect(-132, -162, 264, 324); ctx.clip();
    ctx.fillStyle = '#6f6c67'; ctx.fillRect(-132, 60, 264, 110);
    ctx.save(); ctx.translate(0, 40); ctx.scale(5.2, 5.2); ctx.filter = 'saturate(0)'; drawBaby(ctx, baby, {expr: 'sad'}); ctx.filter = 'none'; ctx.restore();
    for (let x = -120; x <= 120; x += 30) fs(ctx, rr(x - 4, 40, 8, 120, 3), '#bdb8ae', 3);
    fs(ctx, rr(-132, 30, 264, 16, 4), '#a8a39a', 3);
    ctx.restore();
    ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.beginPath(); ctx.moveTo(-132, -162); ctx.lineTo(-20, -162); ctx.lineTo(-132, 0); ctx.closePath(); ctx.fill();
    ctx.restore();
  },
  note(ctx) { ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(0, 0, 12, 9, -0.4, 0, 7); ctx.fill(); ctx.fillRect(9, -42, 5, 42); ctx.fillRect(9, -42, 22, 7); },
};
