// R1 · grace-remains ep18 "The Shepherd": the thing that eats you always says it's saving you. Three wolves in three costumes (a lifeguard shirt + ring,
// a hero cape + a pill bottle, a headset + a phone with their own smiling face), each with the balloon «I'M SAVING YOU!»; the shepherd (an ordinary man with a staff, a cap and a
// plain jacket) never has one. ONE street (Ray's house, the same arched door from frame 0 to the end), by day and by night; Ray's bed at night (the phone).
// New: SETS gsStreet {time: day|night}, gsBed; PROPS wolfG, shoutG, rayDoorG, sillG, phoneG, eyesG, lifeRingG, gearG, slashG, staffG, capG, tornG, lupaHandG.
// Registered into SETS/PROPS on import. NOTHING existing in the engine is edited.
import {Path2D} from '@napi-rs/canvas';
import {INK, mix, dark} from './r1-rig.mjs';
import {SETS, PROPS} from './r1-world.mjs';
import {fs, rr, el, poly, hashN, glow, olive, sky, cobbles, WARM, room, windowPane} from './r1-world-grace.mjs';
import './r1-world-grace-light.mjs';   // book (blanketG, pillowG), ears (wallClockG), bakery, light
import './r1-world-grace-sign.mjs';    // verseG

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const easeBack = k => { k = clamp(k); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
const rad = d => d * Math.PI / 180;
const quad = (p0, c, p2, u) => [(1 - u) * (1 - u) * p0[0] + 2 * (1 - u) * u * c[0] + u * u * p2[0], (1 - u) * (1 - u) * p0[1] + 2 * (1 - u) * u * c[1] + u * u * p2[1]];

// ------------------------------------------------------------------ the three wolves (identity = fur + costume; the same in every shot)
export const WOLF = {
  A: {fur: '#9b9ea9', furD: '#6c6f7b', belly: '#ebe8ec', costume: 'life'},
  B: {fur: '#b98c5c', furD: '#82592f', belly: '#f2dfc2', costume: 'cape'},
  C: {fur: '#747b8c', furD: '#474d5e', belly: '#d6d9e2', costume: 'phone'},
};
const RED = '#d6402c', CAPE = '#c42f3b', TEAL = '#2f7f86';

// a wolf's face, drawn around the origin (head centre). Head ≈ 40 wide, 33 tall.
// teeth 0..1 opens the grin; glowK 0..1 makes the eyes burn; look = pupil offset; blink 0..1; brow 0..1 how sly/angry
function wolfFace(ctx, W, {teeth = 0, glowK = 0, look = [0, 0], blink = 0, brow = 0.5, ears = true, lw = 1.1} = {}) {
  const {fur, furD, belly} = W;
  ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  if (ears) for (const sg of [-1, 1]) {
    const e = new Path2D(); e.moveTo(sg * 11, -9); e.lineTo(sg * 19.5, -34); e.lineTo(sg * 2.5, -14); e.closePath(); fs(ctx, e, fur, lw);
    const i = new Path2D(); i.moveTo(sg * 11.6, -13); i.lineTo(sg * 16.6, -27.5); i.lineTo(sg * 6.6, -15.5); i.closePath(); ctx.fillStyle = '#eba3a0'; ctx.fill(i);
  }
  for (const sg of [-1, 1]) { // cheek tufts
    const c = new Path2D(); c.moveTo(sg * 16, -3); c.lineTo(sg * 28, 3); c.lineTo(sg * 19, 6.5); c.lineTo(sg * 27, 13.5); c.lineTo(sg * 15.5, 12.5); c.closePath(); fs(ctx, c, fur, lw);
  }
  fs(ctx, el(0, 0, 20, 16.5), fur, lw);
  ctx.fillStyle = furD; ctx.globalAlpha = 0.55; ctx.fill(el(0, -11, 11, 4.2)); ctx.globalAlpha = 1;
  fs(ctx, el(0, 7.2, 12.8, 9.2), belly, lw * 0.8);
  fs(ctx, el(0, 2.4, 4.7, 3.1), INK, 0); ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fill(el(-1.4, 1.4, 1.3, 0.8));
  // eyes: slanted almonds, yellow irises with a slit
  for (const sg of [-1, 1]) {
    const ex = sg * 8.8, ey = -4.4;
    if (glowK > 0) glow(ctx, ex, ey, 11 + 6 * glowK, 0.55 * glowK, '255,225,90');
    const open = 1 - clamp(blink);
    if (open < 0.12) { ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(ex - 4.8, ey + 0.6); ctx.quadraticCurveTo(ex, ey + 2.6, ex + 4.8, ey + 0.6); ctx.stroke(); continue; }
    ctx.save(); ctx.translate(ex, ey); ctx.rotate(sg * 0.3); ctx.scale(1, open);
    fs(ctx, el(0, 0, 5.2, 3.6), glowK > 0.2 ? '#fff6c4' : '#fbf8ee', lw * 0.8);
    ctx.save(); ctx.clip(el(0, 0, 5.2, 3.6)); ctx.fillStyle = glowK > 0.2 ? '#ffe45a' : '#f2bf22'; ctx.fill(el(look[0] * 1.5, look[1], 3.1, 3.1)); ctx.restore();
    ctx.fillStyle = INK; ctx.fillRect(look[0] * 1.5 - 0.65, -3, 1.3, 6);
    ctx.restore();
    // the sly lid: a heavy brow line slanting down toward the nose
    ctx.strokeStyle = INK; ctx.lineWidth = 1.7; ctx.beginPath(); ctx.moveTo(sg * (13.6), -9.6 - 2.2 * brow); ctx.lineTo(sg * 3.6, -6.4 + 1.2 * brow); ctx.stroke();
  }
  // the grin: very wide. upper lip c_u, lower jaw c_d
  const P0 = [-14, 6.6], P2 = [14, 6.6], k = clamp(teeth), cu = 21 - 7 * k, cd = 21 + 20 * k;
  if (k <= 0.02) {
    ctx.strokeStyle = INK; ctx.lineWidth = 1.9; ctx.beginPath(); ctx.moveTo(...P0); ctx.quadraticCurveTo(0, 21, ...P2); ctx.stroke();
    for (const sg of [-1, 1]) { ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(sg * 14, 6.6); ctx.quadraticCurveTo(sg * 16.6, 5.2, sg * 17.4, 2.6); ctx.stroke(); }
  } else {
    const m = new Path2D(); m.moveTo(...P0); m.quadraticCurveTo(0, cu, ...P2); m.quadraticCurveTo(0, cd, ...P0); m.closePath();
    ctx.fillStyle = '#6b1f23'; ctx.fill(m);
    ctx.save(); ctx.clip(m);
    ctx.fillStyle = '#e8737b'; ctx.fill(el(0, quad(P0, [0, cd], P2, 0.5)[1] - 1.5, 7.5, 3.2 + 3.5 * k));
    ctx.fillStyle = '#fffdf3'; ctx.strokeStyle = INK; ctx.lineWidth = 0.7;
    for (let i = 0; i < 9; i++) { // upper teeth, pointing down; two big fangs
      const u = 0.1 + i * 0.1, [x, y] = quad(P0, [0, cu], P2, u), big = i === 2 || i === 6, h = (big ? 6.4 : 3.4) + (big ? 3.2 : 1.8) * k;
      const w = big ? 2.3 : 1.9; const tt = new Path2D(); tt.moveTo(x - w, y - 0.6); tt.lineTo(x + w, y - 0.6); tt.lineTo(x, y + h); tt.closePath(); ctx.fill(tt); ctx.stroke(tt);
    }
    for (let i = 0; i < 6; i++) { // lower teeth, pointing up
      const u = 0.2 + i * 0.12, [x, y] = quad(P0, [0, cd], P2, u), h = 2.6 + 2.2 * k, w = 1.8; const tt = new Path2D(); tt.moveTo(x - w, y + 0.6); tt.lineTo(x + w, y + 0.6); tt.lineTo(x, y - h); tt.closePath(); ctx.fill(tt); ctx.stroke(tt);
    }
    ctx.restore();
    ctx.strokeStyle = INK; ctx.lineWidth = 1.8; ctx.stroke(m);
    for (const sg of [-1, 1]) { ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(sg * 14, 6.6); ctx.quadraticCurveTo(sg * 16.8, 4.8, sg * 17.6, 1.8); ctx.stroke(); }
  }
  ctx.restore();
}

// arms: [shoulder, elbow] like the rig (0 = hanging, + = outward/up). Wolf arms: upper 15, fore 14.
const WPOSE = {rest: {L: [12, 8], R: [12, 8]}, wave: {L: [12, 8], R: [150, -30]}, offer: {L: [10, 6], R: [78, -18]}, hips: {L: [42, -118], R: [42, -118]}, heroR: {L: [10, 6], R: [42, -118]},
  hold: {L: [22, -100], R: [22, -100]}, cheer: {L: [150, 8], R: [150, 8]}, claws: {L: [110, -30], R: [110, -30]}, pillUp: {L: [42, -118], R: [105, -70]}, phoneUp: {L: [58, -88], R: [12, 8]}, point: {L: [12, 8], R: [100, 0]},
  throwBack: {L: [12, 8], R: [150, -40]}, throwFwd: {L: [12, 8], R: [60, 10]}, thumbs: {L: [12, 8], R: [88, -75]}};
const armPts = (a, sg) => { const S = [sg * 15, -61.5]; const E = [S[0] + sg * Math.sin(rad(a[0])) * 15, S[1] + Math.cos(rad(a[0])) * 15]; const Wp = [E[0] + sg * Math.sin(rad(a[0] + a[1])) * 14, E[1] + Math.cos(rad(a[0] + a[1])) * 14]; return {S, E, W: Wp}; };

function phoneBody(ctx, {w = 26, h = 46, screen = '#9fd3f0', lw = 1.6} = {}) { fs(ctx, rr(-w / 2, -h / 2, w, h, 4.5), '#2b2b33', lw); ctx.fillStyle = screen; ctx.fill(rr(-w / 2 + 2.2, -h / 2 + 3.4, w - 4.4, h - 7, 2)); }

// the wolf: origin at the feet, ≈ 100 tall.
function wolfG(ctx, {who = 'A', t = 0, dressed = 1, ring = 1, walk = null, hop = 0, pose = 'rest', aL = null, aR = null, teeth = 0, glowK = 0, look = [0, 0], brow = 0.6, tilt = 0, dir = 1, items = 1, shake = 0, lean = 0, pills = 1, wag = 1, smileScreen = 1, blinkK = 0, capeK = 1} = {}) {
  const W = WOLF[who], {fur, furD, belly} = W, cost = W.costume;
  const dr = clamp(dressed), sw = dr > 0.01;
  const P = WPOSE[pose] || WPOSE.rest, L = aL || P.L, R = aR || P.R;
  const bob = walk != null ? -Math.abs(Math.sin(walk)) * 1.8 : hop ? -Math.abs(Math.sin(t * hop)) * 2.6 : Math.sin(t * 2.3 + who.charCodeAt(0)) * 0.5;
  const per = 2.8 + (who.charCodeAt(0) % 3) * 0.7, q = (t + who.charCodeAt(0) * 0.37) % per, blink = q < 0.12 ? Math.sin(q / 0.12 * Math.PI) : 0;
  ctx.save(); ctx.scale(dir, 1); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.fillStyle = 'rgba(30,20,20,.18)'; ctx.fill(el(0, 0.5, 21, 3.4));
  ctx.translate(0, bob);
  if (lean) { ctx.translate(0, -28); ctx.rotate(rad(lean)); ctx.translate(0, 28); }
  // cape (behind everything)
  if (cost === 'cape' && sw) {
    const wv = (Math.sin(t * 6.5) * 2.4 + 1.2) * capeK, wv2 = Math.sin(t * 5.1 + 1) * 2.2 * capeK;
    const c = new Path2D(); c.moveTo(-14, -62); c.lineTo(14, -62); c.bezierCurveTo(26, -50, 34 + wv, -30, 38 + wv, -5 + wv2);
    c.quadraticCurveTo(26, 1 - wv2, 15, -3 + wv2); c.quadraticCurveTo(0, 3, -15, -3 - wv2); c.quadraticCurveTo(-26, 1 + wv2, -38 - wv, -5 - wv2); c.bezierCurveTo(-34 - wv, -30, -26, -50, -14, -62); c.closePath();
    ctx.save(); ctx.globalAlpha = dr; fs(ctx, c, CAPE, 1.3); ctx.fillStyle = '#8e1f2b'; ctx.globalAlpha = 0.5 * dr; ctx.fill(el(0, -26, 14, 26)); ctx.restore();
  }
  // tail
  ctx.save(); ctx.translate(13, -34); ctx.rotate(rad(wag * Math.sin(t * 6.2) * 14 - 20));
  const tl = new Path2D(); tl.moveTo(0, 0); tl.bezierCurveTo(14, -4, 30, -14, 28, -34); tl.bezierCurveTo(22, -22, 12, -16, -2, -14); tl.closePath(); fs(ctx, tl, fur, 1.2);
  ctx.save(); ctx.clip(tl); ctx.fillStyle = belly; ctx.fill(el(28, -33, 7, 8)); ctx.restore(); ctx.restore();
  // legs
  const la = walk == null ? [0, 0] : [Math.sin(walk) * 20, -Math.sin(walk) * 20];
  [-1, 1].forEach((sg, i) => { ctx.save(); ctx.translate(sg * 8, -29); ctx.rotate(rad(la[i])); fs(ctx, rr(-5.6, -1, 11.2, 25, 4), fur, 1.1); fs(ctx, el(sg * 1.2, 25.5, 8, 4.1), furD, 1.1);
    ctx.strokeStyle = INK; ctx.lineWidth = 0.8; for (const dx of [-2.6, 0, 2.6]) { ctx.beginPath(); ctx.moveTo(sg * 1.2 + dx, 26.6); ctx.lineTo(sg * 1.2 + dx, 28.4); ctx.stroke(); } ctx.restore(); });
  // torso
  fs(ctx, rr(-16, -64, 32, 38, 13), fur, 1.2);
  fs(ctx, el(0, -42, 9.8, 15), belly, 0);
  ctx.strokeStyle = INK; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(-6, -50); ctx.lineTo(-4.4, -47.5); ctx.lineTo(-7, -46); ctx.moveTo(6, -38); ctx.lineTo(4.4, -35.5); ctx.lineTo(7, -34); ctx.stroke();
  // lifeguard shirt over the torso
  if (cost === 'life' && sw) {
    ctx.save(); ctx.globalAlpha = dr;
    const sh = new Path2D(); sh.moveTo(-14.5, -63); sh.lineTo(-7, -63); sh.quadraticCurveTo(0, -57, 7, -63); sh.lineTo(14.5, -63); sh.lineTo(15.6, -27.5); sh.quadraticCurveTo(0, -24.5, -15.6, -27.5); sh.closePath(); fs(ctx, sh, RED, 1.3);
    ctx.save(); ctx.clip(sh); ctx.fillStyle = '#fbf3df'; ctx.fillRect(-18, -35, 36, 4.2); ctx.fillStyle = 'rgba(0,0,0,.14)'; ctx.fillRect(4, -64, 12, 40); ctx.restore();
    ctx.fillStyle = '#fffaf0'; ctx.font = '9.4px GraceCaption'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('RESCUE', 0, -52.4); ctx.strokeStyle = '#fffaf0'; ctx.lineWidth = 1.7; ctx.beginPath(); ctx.moveTo(-3.4, -45); ctx.lineTo(3.4, -45); ctx.moveTo(0, -48); ctx.lineTo(0, -42); ctx.stroke();
    ctx.restore();
  }
  // ruff at the neck
  const ruff = new Path2D(); ruff.moveTo(-17, -63); for (let i = 0; i <= 6; i++) ruff.lineTo(-17 + i * 5.667, i % 2 ? -64 : -57.4); ruff.lineTo(17, -63); ruff.closePath(); fs(ctx, ruff, belly, 1.1);
  if (cost === 'cape' && sw) { ctx.save(); ctx.globalAlpha = dr; fs(ctx, el(0, -60.5, 3.6, 3.6), '#f4b942', 1); // clasp + a gold star on the chest
    const st = new Path2D(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 3.4 : 7.6; i ? st.lineTo(Math.cos(a) * r, -43 + Math.sin(a) * r) : st.moveTo(Math.cos(a) * r, -43 + Math.sin(a) * r); } st.closePath(); fs(ctx, st, '#f9cf4a', 1); ctx.restore(); }
  // arms
  const arms = [[-1, L], [1, R]].map(([sg, a]) => ({sg, ...armPts(a, sg)}));
  arms.forEach(({S, E, W: Wp}) => {
    ctx.strokeStyle = INK; ctx.lineWidth = 9.4; ctx.beginPath(); ctx.moveTo(...S); ctx.lineTo(...E); ctx.lineTo(...Wp); ctx.stroke();
    ctx.strokeStyle = fur; ctx.lineWidth = 7.4; ctx.beginPath(); ctx.moveTo(...S); ctx.lineTo(...E); ctx.lineTo(...Wp); ctx.stroke();
    fs(ctx, el(Wp[0], Wp[1], 6.2, 6), furD, 1.1);
    ctx.strokeStyle = '#fffdf3'; ctx.lineWidth = 1.2; for (const dx of [-2.4, 0, 2.4]) { ctx.beginPath(); ctx.moveTo(Wp[0] + dx, Wp[1] + 4.2); ctx.lineTo(Wp[0] + dx * 1.2, Wp[1] + 7.2); ctx.stroke(); }
  });
  // lifeguard ring over one shoulder
  if (cost === 'life' && sw && ring > 0) { ctx.save(); ctx.globalAlpha = dr; ctx.translate(-16, -37); ctx.rotate(0.5); lifeRingG(ctx, {r: 13.5, w: 5, flat: 0}); ctx.restore(); }
  // head
  ctx.save(); ctx.translate(0, -82); ctx.rotate(rad(tilt));
  wolfFace(ctx, W, {teeth, glowK, look, blink: Math.max(blink, blinkK), brow});
  if (cost === 'phone' && sw) { ctx.save(); ctx.globalAlpha = dr; // headset
    ctx.strokeStyle = INK; ctx.lineWidth = 4.8; ctx.beginPath(); ctx.arc(0, -3, 22.4, Math.PI * 1.06, Math.PI * 1.94); ctx.stroke(); ctx.strokeStyle = TEAL; ctx.lineWidth = 2.8; ctx.beginPath(); ctx.arc(0, -3, 22.4, Math.PI * 1.06, Math.PI * 1.94); ctx.stroke();
    for (const sg of [-1, 1]) fs(ctx, rr(sg * 22.4 - 4.2, -8, 8.4, 14, 3.4), TEAL, 1.1);
    ctx.strokeStyle = INK; ctx.lineWidth = 3.4; ctx.beginPath(); ctx.moveTo(-22, 4); ctx.quadraticCurveTo(-22, 14, -8, 14.6); ctx.stroke(); ctx.strokeStyle = '#3a8f98'; ctx.lineWidth = 1.7; ctx.beginPath(); ctx.moveTo(-22, 4); ctx.quadraticCurveTo(-22, 14, -8, 14.6); ctx.stroke(); fs(ctx, el(-7.4, 14.6, 2.6, 2.2), INK, 0);
    ctx.restore(); }
  ctx.restore();
  // held things (drawn over the paws)
  const hp = s => arms[s].W;
  if (items && sw) {
    ctx.save(); ctx.globalAlpha = dr;
    if (cost === 'life') { const [x, y] = hp(1); ctx.save(); ctx.translate(x + 1, y - 9); ctx.rotate(0.12); fs(ctx, rr(-9.5, -13, 19, 25, 1.4), '#fffaf0', 1.1); ctx.strokeStyle = '#8a8a96'; ctx.lineWidth = 0.9; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-6.4, -8.4 + i * 3.8); ctx.lineTo(6.4, -8.4 + i * 3.8); ctx.stroke(); }
      ctx.strokeStyle = '#d6402c'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-6.4, 6.8); ctx.lineTo(0, 9.2); ctx.moveTo(-6.4, 9.2); ctx.lineTo(0, 6.8); ctx.stroke();
      ctx.strokeStyle = INK; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(8, 8); ctx.lineTo(15, -3); ctx.stroke(); ctx.strokeStyle = '#2f6fd0'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(8, 8); ctx.lineTo(15, -3); ctx.stroke(); ctx.restore(); }
    if (cost === 'cape' && pills > 0) { const [x, y] = hp(1); ctx.save(); ctx.translate(x + 0.5, y - 8 + Math.sin(shake * 26) * 1.4 * clamp(shake)); ctx.rotate(0.1 + Math.sin(shake * 21) * 0.12 * clamp(shake));
      fs(ctx, rr(-6.4, -10, 12.8, 19, 2.6), '#e9902a', 1.1); fs(ctx, rr(-7, -13.4, 14, 5, 1.6), '#fbf3df', 1.1); ctx.fillStyle = '#fbf3df'; ctx.fillRect(-5.2, -4.6, 10.4, 8.4);
      ctx.fillStyle = INK; ctx.font = '5.6px GraceCaption'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('DIET', 0, -0.4); ctx.restore(); }
    if (cost === 'phone') { const [x, y] = hp(0); ctx.save(); ctx.translate(x - 1, y - 4); ctx.rotate(-0.06); phoneBody(ctx, {w: 28, h: 50, screen: '#e9f4d9'});
      if (smileScreen) { ctx.save(); ctx.beginPath(); ctx.rect(-11.4, -21, 22.8, 42); ctx.clip(); ctx.translate(0, -1.2); ctx.scale(0.5, 0.5); wolfFace(ctx, W, {teeth: 0, ears: true, glowK: 0, look: [0, 0], brow: 0.3, lw: 1.5}); ctx.restore(); } ctx.restore(); }
    ctx.restore();
  }
  ctx.restore();
}

// the ring (lifebuoy). flat 0 = a front view disc; 1 = lying on the ground (an ellipse).
function lifeRingG(ctx, {r = 34, w = 11, flat = 0, spin = 0, t = 0} = {}) {
  ctx.save(); ctx.lineJoin = 'round'; if (spin) ctx.rotate(spin * t);
  if (flat) ctx.scale(1, 0.34);
  for (const [lw, col] of [[w + 3, INK], [w, '#fbf3df']]) { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke(); }
  ctx.strokeStyle = RED; ctx.lineWidth = w; for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.3; ctx.beginPath(); ctx.arc(0, 0, r, a, a + 0.9); ctx.stroke(); }
  ctx.restore();
}

// the balloon «I'M SAVING YOU!» (a wolf's). origin = the balloon's centre; tail = where the tip points (relative); k = pop-in 0..1
function shoutG(ctx, {text = "I'M SAVING YOU!", size = 56, k = 1, tail = [0, 100], t = 0, shake = 1, fill = '#ffffff', tilt = 0} = {}) {
  if (k <= 0.001) return;
  ctx.save(); const sc = easeBack(k); ctx.rotate(rad(tilt) + Math.sin(t * 17) * 0.012 * shake); ctx.scale(sc, sc); ctx.lineJoin = 'round';
  ctx.font = `${size}px GraceCaption`; const tw = ctx.measureText(text).width, bw = tw + 50, bh = size * 1.02 + 30;
  const tx = clamp(tail[0] * 0.4, -bw / 2 + 50, bw / 2 - 50);
  const tp = new Path2D(); tp.moveTo(tx - 20, bh / 2 - 5); tp.lineTo(tx + 20, bh / 2 - 5); tp.lineTo(tail[0], tail[1]); tp.closePath();
  const bp = new Path2D(); bp.roundRect(-bw / 2, -bh / 2, bw, bh, 24);
  ctx.fillStyle = 'rgba(40,20,0,.2)'; ctx.save(); ctx.translate(0, 7); ctx.fill(bp); ctx.restore();
  ctx.lineWidth = 8; ctx.strokeStyle = INK; ctx.stroke(bp); ctx.stroke(tp); ctx.fillStyle = fill; ctx.fill(bp); ctx.fill(tp);
  ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, 3);
  ctx.restore();
}

// ------------------------------------------------------------------ the shepherd's things
// the staff: origin = the hand. Hanging hand ≈ 37 units above the ground: the foot is 41 below, the crook 86 above.
function staffG(ctx) {
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const path = () => { ctx.beginPath(); ctx.moveTo(0, 41); ctx.lineTo(0, -80); ctx.bezierCurveTo(0, -94, 17, -96, 18, -84); ctx.bezierCurveTo(18.6, -77, 13.4, -75, 12, -81); };
  ctx.strokeStyle = INK; ctx.lineWidth = 6.6; path(); ctx.stroke(); ctx.strokeStyle = '#a9743f'; ctx.lineWidth = 4.2; path(); ctx.stroke();
  ctx.strokeStyle = 'rgba(70,40,15,.45)'; ctx.lineWidth = 1; for (const y of [-52, -24, 4, 28]) { ctx.beginPath(); ctx.moveTo(-1.6, y); ctx.lineTo(1.6, y + 3); ctx.stroke(); }
  ctx.restore();
}
// a plain baseball cap on A's head (front view: dome + a visor)
function capG(ctx, {A = null, color = '#2f78c4', lift = 0} = {}) {
  if (!A || !A._head || (A._alpha ?? 1) <= 0.02) return;
  const R = A._headR * A._s; ctx.save(); ctx.globalAlpha = A._alpha ?? 1; ctx.translate(A._head[0], A._head[1] - R * (0.6 + lift)); ctx.rotate(((A._st?.tilt) || 0) * Math.PI / 180); ctx.lineJoin = 'round';
  const lw = Math.max(3, R * 0.075);
  const d = new Path2D(); d.moveTo(-R * 0.99, 0); d.bezierCurveTo(-R * 1.02, -R * 1.2, R * 1.02, -R * 1.2, R * 0.99, 0); d.closePath(); fs(ctx, d, color, lw);
  ctx.strokeStyle = dark(color, 0.25); ctx.lineWidth = lw * 0.5; ctx.beginPath(); ctx.moveTo(0, -R * 0.98); ctx.lineTo(0, -R * 0.05); ctx.moveTo(-R * 0.5, -R * 0.82); ctx.quadraticCurveTo(-R * 0.4, -R * 0.4, -R * 0.45, -R * 0.04); ctx.moveTo(R * 0.5, -R * 0.82); ctx.quadraticCurveTo(R * 0.4, -R * 0.4, R * 0.45, -R * 0.04); ctx.stroke();
  fs(ctx, el(0, -R * 1.0, R * 0.09, R * 0.09), dark(color, 0.2), lw * 0.6);
  fs(ctx, el(0, R * 0.02, R * 1.16, R * 0.2), dark(color, 0.18), lw);
  ctx.restore();
}
// a torn sleeve + a scratch on A's screen-left arm. k 0..1 (how torn); the loose flap sways
function tornG(ctx, {A = null, t = 0, k = 1, jacket = '#7a8a4a', skin = '#e3b38e', scratch = 1} = {}) {
  if (!A || !A._arms || !A._rt || (A._alpha ?? 1) <= 0.02 || k <= 0) return;
  const r = A._arms, s = A._s, fl = A.flip ? -1 : 1, P = p => A._rt(fl * p[0] * s, (p[1] + r.drop + r.bob) * s), {S, E, W: Wp} = r.arms[0];
  const Sw = P(S), Ew = P(E), Ww = P(Wp), lerpP = (a, b, u) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
  ctx.save(); ctx.globalAlpha = A._alpha ?? 1; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const Q = lerpP(Sw, Ew, 0.34), M = lerpP(Sw, Ew, 0.62), nx = -(Ew[1] - Sw[1]), ny = Ew[0] - Sw[0], nl = Math.hypot(nx, ny) || 1, ux = nx / nl, uy = ny / nl;
  const wd = 4.2 * s;
  if (k > 0.2) { // bare skin where the sleeve was
    ctx.strokeStyle = INK; ctx.lineWidth = wd + 0.8 * 2 * s; ctx.beginPath(); ctx.moveTo(...Q); ctx.lineTo(...M); ctx.stroke(); ctx.strokeStyle = skin; ctx.lineWidth = wd + 0.9 * s; ctx.beginPath(); ctx.moveTo(...Q); ctx.lineTo(...M); ctx.stroke();
    const j = new Path2D(); const n = 4; // the ragged edge of what is left of the sleeve
    j.moveTo(Q[0] + ux * 4.2 * s, Q[1] + uy * 4.2 * s); for (let i = 0; i <= n; i++) { const f = i / n - 0.5, c = [Q[0] + ux * f * 8.4 * s, Q[1] + uy * f * 8.4 * s], out = i % 2 ? 2.4 : -0.2; j.lineTo(c[0] + (Ew[0] - Sw[0]) / nl * out * s, c[1] + (Ew[1] - Sw[1]) / nl * out * s); }
    j.lineTo(Q[0] - ux * 4.2 * s, Q[1] - uy * 4.2 * s); j.lineTo(Sw[0] - ux * 4.2 * s, Sw[1] - uy * 4.2 * s); j.lineTo(Sw[0] + ux * 4.2 * s, Sw[1] + uy * 4.2 * s); j.closePath(); fs(ctx, j, jacket, Math.max(2, 0.7 * s));
    const sw = Math.sin(t * 3.1) * 2.2 * s, fp = new Path2D(); fp.moveTo(Q[0] - ux * 3.6 * s, Q[1] - uy * 3.6 * s); fp.quadraticCurveTo(Q[0] - ux * 7 * s + sw, Q[1] + 6 * s, Q[0] - ux * 5 * s + sw * 1.4, Q[1] + 13 * s);
    fp.lineTo(Q[0] - ux * 1.2 * s + sw * 1.2, Q[1] + 10 * s); fp.lineTo(Q[0] + ux * 1.4 * s + sw, Q[1] + 14 * s); fp.quadraticCurveTo(Q[0] + ux * 3 * s + sw * 0.6, Q[1] + 5 * s, Q[0] + ux * 3.8 * s, Q[1] + uy * 3.8 * s); fp.closePath(); fs(ctx, fp, jacket, Math.max(2, 0.7 * s));
  }
  if (scratch > 0) { // three red scratches across the forearm; no drop (the crítico read it as blood, 28/11)
    const a = lerpP(Ew, Ww, 0.3), b = lerpP(Ew, Ww, 0.78); ctx.globalAlpha *= clamp(scratch);
    for (let i = -1; i <= 1; i++) { const o = i * 2.0 * s, p0 = [a[0] + ux * o - ux * 2.4 * s, a[1] + uy * o - uy * 2.4 * s], p1 = [b[0] + ux * o + ux * 2.4 * s, b[1] + uy * o + uy * 2.4 * s];
      ctx.strokeStyle = '#a3262b'; ctx.lineWidth = Math.max(2, 1.1 * s); ctx.beginPath(); ctx.moveTo(...p0); ctx.lineTo(...p1); ctx.stroke(); ctx.strokeStyle = '#e8574f'; ctx.lineWidth = Math.max(1.2, 0.5 * s); ctx.stroke(); }
  }
  ctx.restore();
}
// Ray's magnifying glass (a gag): the handle from his hand to a disc in front of one eye
function lupaHandG(ctx, {A = null, t = 0, k = 1, side = 1} = {}) {
  if (!A || !A._hands?.R || !A._head || (A._alpha ?? 1) <= 0.02 || k <= 0) return;
  const R = A._headR * A._s, h = A._hands.R, c = [A._head[0] + side * R * 0.2, A._head[1] - R * 0.05 + Math.sin(t * 2.2) * R * 0.04], rd = R * 0.62;
  const dx = c[0] - h[0], dy = c[1] - h[1], dl = Math.hypot(dx, dy) || 1, ex = c[0] - dx / dl * rd, ey = c[1] - dy / dl * rd;
  ctx.save(); ctx.globalAlpha = (A._alpha ?? 1) * clamp(k); ctx.lineCap = 'round';
  ctx.strokeStyle = INK; ctx.lineWidth = R * 0.26; ctx.beginPath(); ctx.moveTo(h[0], h[1]); ctx.lineTo(ex, ey); ctx.stroke(); ctx.strokeStyle = '#8a5a36'; ctx.lineWidth = R * 0.16; ctx.stroke();
  ctx.fillStyle = 'rgba(210,238,242,.5)'; ctx.beginPath(); ctx.arc(c[0], c[1], rd, 0, 7); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = R * 0.24; ctx.beginPath(); ctx.arc(c[0], c[1], rd, 0, 7); ctx.stroke(); ctx.strokeStyle = '#c8943a'; ctx.lineWidth = R * 0.14; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = R * 0.09; ctx.beginPath(); ctx.arc(c[0], c[1], rd * 0.72, 3.5, 4.4); ctx.stroke();
  ctx.restore();
}

// ------------------------------------------------------------------ things on the ground / in the air
function slashG(ctx, {t = 0, t0 = 0, len = 190, d = 0.45} = {}) { // three claw streaks. origin = start
  const q = (t - t0) / d; if (q < 0 || q > 1) return;
  ctx.save(); ctx.lineCap = 'round'; const k = easeOut(q * 1.6), a = 1 - clamp((q - 0.5) / 0.5);
  for (let i = -1; i <= 1; i++) { const o = i * 30; for (const [w, c] of [[16, `rgba(42,33,30,${0.8 * a})`], [9, `rgba(255,250,235,${a})`]]) { ctx.strokeStyle = c; ctx.lineWidth = w * (1 - 0.5 * q); ctx.beginPath(); ctx.moveTo(-10 + o * 0.3, o); ctx.quadraticCurveTo(len * 0.5 * k, o + 36 * k, len * k, o + 110 * k); ctx.stroke(); } }
  ctx.restore();
}
// what the wolves leave behind (the costumes), lying on the cobbles. origin = the bottom centre of the heap
function gearG(ctx, {kind = 'shirt', face = 1, crack = 0, s = 1} = {}) {
  ctx.save(); ctx.scale(s, s); ctx.lineJoin = 'round';
  if (kind === 'shirt') {
    const p = new Path2D(); p.moveTo(-74, 0); p.bezierCurveTo(-84, -24, -60, -52, -34, -50); p.quadraticCurveTo(-18, -66, 2, -50); p.bezierCurveTo(30, -62, 62, -40, 78, -16); p.quadraticCurveTo(86, 0, 60, 4); p.quadraticCurveTo(0, 12, -74, 0); p.closePath(); fs(ctx, p, RED, 6);
    ctx.save(); ctx.clip(p); ctx.fillStyle = '#fbf3df'; ctx.fillRect(-90, -16, 180, 12); ctx.fillStyle = 'rgba(0,0,0,.16)'; ctx.beginPath(); ctx.ellipse(34, -26, 34, 12, 0.3, 0, 7); ctx.fill(); ctx.restore();
    ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-26, -40); ctx.quadraticCurveTo(-8, -18, -30, -2); ctx.moveTo(30, -44); ctx.quadraticCurveTo(46, -26, 38, -6); ctx.stroke();
    ctx.fillStyle = '#fffaf0'; ctx.font = '26px GraceCaption'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.save(); ctx.translate(-6, -32); ctx.rotate(-0.05); ctx.fillText('RESCUE', 0, 0); ctx.restore();
  } else if (kind === 'cape') {
    const p = new Path2D(); p.moveTo(-96, 2); p.bezierCurveTo(-92, -26, -60, -40, -26, -34); p.quadraticCurveTo(-4, -64, 22, -38); p.bezierCurveTo(60, -52, 96, -30, 100, 0); p.quadraticCurveTo(54, 14, 20, 6); p.quadraticCurveTo(-30, 16, -96, 2); p.closePath(); fs(ctx, p, CAPE, 6);
    ctx.save(); ctx.clip(p); ctx.fillStyle = '#8e1f2b'; ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.ellipse(10, -12, 46, 12, 0.1, 0, 7); ctx.fill(); ctx.restore();
    fs(ctx, el(-18, -30, 10, 10), '#f4b942', 4);
    const st = new Path2D(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 7 : 16; i ? st.lineTo(48 + Math.cos(a) * r, -22 + Math.sin(a) * r) : st.moveTo(48 + Math.cos(a) * r, -22 + Math.sin(a) * r); } st.closePath(); fs(ctx, st, '#f9cf4a', 3);
    ctx.save(); ctx.translate(-70, -2); ctx.rotate(0.2); fs(ctx, rr(-12, -26, 24, 34, 5), '#e9902a', 4); fs(ctx, rr(-13, -34, 26, 10, 3), '#fbf3df', 4); ctx.restore();
  } else if (kind === 'phone') {
    ctx.save(); ctx.rotate(-0.1); ctx.scale(1, 0.62); phoneBody(ctx, {w: 74, h: 128, screen: '#e9f4d9', lw: 5});
    ctx.save(); ctx.beginPath(); ctx.rect(-30, -56, 60, 112); ctx.clip(); ctx.globalAlpha = face; ctx.translate(0, -3); ctx.scale(1.5, 1.5); wolfFace(ctx, WOLF.C, {teeth: 0, brow: 0.3, lw: 1.3}); ctx.restore();
    if (crack) { ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-12, -58); ctx.lineTo(-2, -20); ctx.lineTo(-22, 6); ctx.moveTo(-2, -20); ctx.lineTo(24, 14); ctx.lineTo(14, 50); ctx.stroke(); }
    ctx.restore();
  } else if (kind === 'ring') { ctx.save(); ctx.translate(0, -12); lifeRingG(ctx, {r: 58, w: 18, flat: 1}); ctx.restore(); }
  ctx.restore();
}

// Ray's phone, big, in front of the camera: the wolf's smiling face on the screen (its eyes wander), a message that appears, the glow of the screen. origin = centre.
function phoneG(ctx, {t = 0, buzz = 0, k = 1, msg = '', msgK = 0, off = 0, s = 1, faceZ = 5.2, faceY = -26} = {}) {
  ctx.save(); ctx.scale(s, s); ctx.lineJoin = 'round'; const bz = buzz ? Math.sin(t * 90) * 4 * buzz : 0; ctx.translate(bz, 0);
  const W = 250, H = 460; glow(ctx, 0, 0, 520, 0.5 * k * (1 - off), '210,246,255');
  fs(ctx, rr(-W / 2, -H / 2, W, H, 38), '#2b2b33', 9);
  const sc = new Path2D(); sc.roundRect(-W / 2 + 14, -H / 2 + 26, W - 28, H - 52, 20); ctx.fillStyle = off ? '#1c1c22' : '#e9f4d9'; ctx.fill(sc);
  if (!off) { ctx.save(); ctx.clip(sc); ctx.translate(0, faceY); ctx.scale(faceZ, faceZ); wolfFace(ctx, WOLF.C, {teeth: 0, glowK: 0.0, look: [Math.sin(t * 0.9) * 0.5, 0.2], brow: 0.8, lw: 1.1}); ctx.restore(); }
  if (msgK > 0 && msg) { ctx.save(); ctx.globalAlpha = clamp(msgK); ctx.translate(0, 150 - 14 * (1 - clamp(msgK))); ctx.font = '50px GraceCaption'; const tw = ctx.measureText(msg).width + 40; const b = new Path2D(); b.roundRect(-tw / 2, -34, tw, 68, 26); ctx.fillStyle = '#2f7f86'; ctx.fill(b); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke(b); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(msg, 0, 3); ctx.restore(); }
  ctx.restore();
}
// pairs of glowing eyes in the dark. args: {eyes: [[x, y, size, phase]], t, k}
function eyesG(ctx, {eyes = [], t = 0, k = 1} = {}) {
  for (const [x, y, sz = 1, ph = 0] of eyes) {
    const q = (t * 0.7 + ph) % 3.1, bl = q < 0.14 ? 1 - Math.sin(q / 0.14 * Math.PI) : 1; ctx.save(); ctx.translate(x, y); ctx.scale(sz, sz * Math.max(0.1, bl)); ctx.globalAlpha = clamp(k);
    glow(ctx, -34, 0, 76, 0.9, '255,222,80'); glow(ctx, 34, 0, 76, 0.9, '255,222,80');
    for (const sg of [-1, 1]) { ctx.save(); ctx.translate(sg * 34, 0); ctx.rotate(sg * 0.32); ctx.fillStyle = '#fff3a8'; ctx.beginPath(); ctx.ellipse(0, 0, 21, 12, 0, 0, 7); ctx.fill(); ctx.fillStyle = INK; ctx.fillRect(-2.2, -12, 4.4, 24); ctx.restore(); }
    ctx.restore();
  }
}

// ------------------------------------------------------------------ Ray's door (the replay clue: the SAME object in every shot of the street)
const DW = 180, DH = 300;
const arch = (w, h) => { const p = new Path2D(), r = w / 2; p.moveTo(0, 0); p.lineTo(0, -(h - r)); p.arc(r, -(h - r), r, Math.PI, 0); p.lineTo(w, 0); p.closePath(); return p; };
// origin = the bottom-left of the doorway. open 0..1: the leaf swings in (hinge on the left); light 0..1: warm light from inside
function rayDoorG(ctx, {open = 0, time = 'day', light = 0} = {}) {
  const night = time === 'night';
  ctx.save(); ctx.lineJoin = 'round';
  const sur = new Path2D(); sur.moveTo(-16, 8); sur.lineTo(-16, -(DH - DW / 2)); sur.arc(DW / 2, -(DH - DW / 2), DW / 2 + 16, Math.PI, 0); sur.lineTo(DW + 16, 8); sur.closePath(); fs(ctx, sur, night ? '#6c5a68' : '#d4bf92', 7);
  const hole = arch(DW, DH); ctx.fillStyle = night ? '#35243c' : '#4a3027'; ctx.fill(hole);
  if (open > 0.02 || light > 0.02) { // the room inside: a lamp and a floor
    ctx.save(); ctx.clip(hole); const g = ctx.createLinearGradient(0, -DH, 0, 0); g.addColorStop(0, night ? '#7a4a3a' : '#5a3a2a'); g.addColorStop(1, night ? '#b0743a' : '#8a5a38'); ctx.fillStyle = g; ctx.globalAlpha = clamp(open * 3 + light); ctx.fillRect(0, -DH, DW, DH);
    ctx.globalAlpha = 1; glow(ctx, DW * 0.5, -150, 200, 0.55 * clamp(light + open * 0.5), '255,214,130'); ctx.fillStyle = 'rgba(40,20,10,.45)'; ctx.fillRect(0, -26, DW, 26); ctx.restore(); }
  const sx = Math.max(0.1, Math.cos(open * 1.38)), leaf = arch(DW, DH);
  ctx.save(); ctx.scale(sx, 1); ctx.fillStyle = night ? '#6a4630' : '#7a4a2a'; ctx.fill(leaf); ctx.save(); ctx.clip(leaf); ctx.strokeStyle = night ? '#4a2e22' : dark('#7a4a2a', 0.3); ctx.lineWidth = 5 / Math.max(0.3, sx);
  for (const x of [45, 90, 135]) { ctx.beginPath(); ctx.moveTo(x, -DH); ctx.lineTo(x, 0); ctx.stroke(); } ctx.fillStyle = '#4a3a40'; for (const y of [-200, -64]) ctx.fillRect(0, y, DW, 18); ctx.restore();
  ctx.lineWidth = 7 / Math.max(0.3, sx); ctx.strokeStyle = INK; ctx.stroke(leaf); if (sx > 0.5) { ctx.fillStyle = '#e8c25a'; ctx.beginPath(); ctx.ellipse(DW - 24, -128, 7 / sx, 7, 0, 0, 7); ctx.fill(); } ctx.restore();
  fs(ctx, rr(-62, -50, DW + 124, 56, 8), night ? '#6e5a68' : '#cdb58a', 6); ctx.fillStyle = night ? 'rgba(255,255,255,.1)' : 'rgba(255,255,255,.35)'; ctx.fillRect(-56, -46, DW + 112, 9); // the doorstep
  ctx.save(); ctx.translate(DW / 2, -DH - 46); fs(ctx, rr(-52, -20, 104, 40, 7), night ? '#7a5a40' : '#a9743f', 5); ctx.fillStyle = night ? '#f2dcb0' : '#fbf1dc'; ctx.font = '34px GraceCaption'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('RAY', 0, 2); ctx.restore();
  ctx.restore();
}
// FRONT prop: the wall and sill under Ray's window (he stands behind it) + a flower box. Absolute coords of the street plate.
const WIN = {x: 880, y: 940, w: 160, h: 250};
const WALLC = time => time === 'night' ? mix('#ecc795', '#2d1c3d', 0.7) : '#ecc795';
function sillG(ctx, {time = 'day'} = {}) {
  const night = time === 'night', wall = WALLC(time);
  ctx.save(); ctx.lineJoin = 'round';
  ctx.fillStyle = wall; ctx.fillRect(WIN.x - 26, WIN.y + WIN.h + 6, WIN.w + 52, 1330 - (WIN.y + WIN.h + 6));
  fs(ctx, rr(WIN.x - 20, WIN.y + WIN.h - 6, WIN.w + 40, 22, 6), night ? '#7a6a78' : '#cdb58a', 5);
  fs(ctx, rr(WIN.x - 12, WIN.y + WIN.h + 14, WIN.w + 24, 34, 6), night ? '#6a4630' : '#9a5a34', 4);
  for (let i = 0; i < 5; i++) fs(ctx, el(WIN.x + 6 + i * 36, WIN.y + WIN.h + 10, 14, 13), night ? ['#a24a4a', '#b09040', '#a24a4a', '#b07a55', '#a24a4a'][i] : ['#e2574c', '#f4b942', '#e2574c', '#f08a5d', '#e2574c'][i], 3);
  ctx.restore();
}

// FRONT prop: the lip of the doorstep drawn IN FRONT of a seated actor (rig `sit`): it hides the hips and thighs, so he reads as sitting ON the step (shins and shoes below), not as a short man standing.
function stepFrontG(ctx, {time = 'day', x0 = 558, x1 = 862, top = 1294, h = 34} = {}) {
  const night = time === 'night'; ctx.save(); ctx.lineJoin = 'round';
  fs(ctx, rr(x0, top, x1 - x0, h, 7), night ? '#6e5a68' : '#cdb58a', 6); ctx.fillStyle = night ? 'rgba(0,0,0,.18)' : 'rgba(120,80,40,.16)'; ctx.fillRect(x0 + 6, top + h - 10, x1 - x0 - 12, 6);
  ctx.restore();
}

// ------------------------------------------------------------------ places
const GY = 1330;
const nightify = (hex, k = 0.68) => mix(hex, '#2a1a3a', k);
function house(ctx, x, w, top, base, wall, roof, {wins = null} = {}) {
  fs(ctx, rr(x, top, w, base - top, 4), wall, 6);
  ctx.fillStyle = dark(wall, 0.07); for (let i = 0; i < 7; i++) { const ex = x + 30 + hashN(x + i) * (w - 60), ey = top + 80 + hashN(i + x * 2) * (base - top - 160); if (wins && ex > wins[0] && ex < wins[1] && ey > wins[2]) continue; ctx.fill(el(ex, ey, 22, 10)); }
  fs(ctx, poly([[x - 26, top + 6], [x + w / 2, top - 130], [x + w + 26, top + 6]]), roof, 6);
  ctx.strokeStyle = dark(roof, 0.2); ctx.lineWidth = 4; for (let i = 1; i < 6; i++) { const k = i / 6; ctx.beginPath(); ctx.moveTo(x - 26 + k * (w / 2 + 26), top + 6 - k * 136); ctx.lineTo(x + w + 26 - k * (w / 2 + 26), top + 6 - k * 136); ctx.stroke(); }
}
function smallWin(ctx, x, y, w, h, night, lit) {
  fs(ctx, rr(x - 8, y - 8, w + 16, h + 16, 8), night ? '#8a7a86' : WARM.cream, 4); fs(ctx, rr(x, y, w, h, 4), lit ? '#ffd77a' : night ? '#2a1c36' : '#4a3a3e', 4);
  ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w / 2, y + h); ctx.moveTo(x, y + h / 2); ctx.lineTo(x + w, y + h / 2); ctx.stroke();
  if (lit) glow(ctx, x + w / 2, y + h / 2, 150, 0.4, '255,214,120');
}
Object.assign(SETS, {
  // The street: Ray's house (arched door at x 620..800, the PROP rayDoorG; his window at x 880..1040, the front prop sillG covers the wall below it), a neighbour on the left,
  // an olive, cobbles. day = honey sky, plaster; night = plum sky, moon, a wall lantern by the door (its pool of light), lit windows. ONE level per hour.
  gsStreet({time = 'day'} = {}) {
    return ctx => {
      const night = time === 'night', wall = WALLC(time), roof = night ? nightify('#c4643a', 0.62) : '#c4643a', nc = c => night ? nightify(c) : c;
      sky(ctx, night ? 'night' : 'gold', GY);
      fs(ctx, poly([[0, 1130], [200, 1050], [440, 1110], [700, 1040], [1080, 1100], [1080, GY], [0, GY]]), night ? '#3a2a4a' : '#d9b27a', 4);
      house(ctx, -90, 330, 800, GY, nc(WARM.plaster[2]), roof);
      smallWin(ctx, -40, 900, 90, 120, night, night); smallWin(ctx, 110, 900, 90, 120, night, false);
      fs(ctx, rr(-10, 1210, 220, 60, 4), nc('#d9b27a'), 4);
      house(ctx, 480, 700, 800, GY, wall, roof, {wins: [850, 1080, 1100]});
      smallWin(ctx, 880, 940, 160, 250, night, night);
      if (!night) { ctx.fillStyle = '#6a4a3a'; ctx.fillRect(880, 940, 160, 250); ctx.fillStyle = 'rgba(255,214,150,.35)'; ctx.fillRect(880, 940, 160, 120); }
      else { ctx.fillStyle = '#e8b45a'; ctx.fillRect(880, 940, 160, 250); glow(ctx, 960, 1060, 300, 0.5, '255,206,120'); }
      ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(960, 940); ctx.lineTo(960, 1190); ctx.moveTo(880, 1065); ctx.lineTo(1040, 1065); ctx.stroke();
      olive(ctx, 410, GY + 6, 0.62);
      // a wall lantern by the door
      fs(ctx, rr(536, 930, 12, 60, 4), '#3c2c24', 3); fs(ctx, poly([[520, 930], [564, 930], [554, 898], [530, 898]]), night ? '#ffe08a' : '#cdb58a', 4);
      cobbles(ctx, GY, night ? '#6d5a76' : '#dcc29a', night);
      if (night) { glow(ctx, 542, 900, 420, 0.5, '255,206,120'); glow(ctx, 710, 1260, 520, 0.42, '255,206,120'); ctx.fillStyle = 'rgba(25,12,45,.12)'; ctx.fillRect(0, 0, 1080, 1920); }
      else glow(ctx, 540, 1100, 760, 0.1, '255,226,170');
    };
  },
  // Ray's bedroom at night: plum walls, a window with the moon, a bed with a tall head, a nightstand, a wall clock (prop wallClockG). The light is the phone (prop phoneG).
  gsBed() {
    return ctx => {
      room(ctx, '#4d3560', '#3a2848', '#4a3234');
      ctx.fillStyle = 'rgba(255,255,255,.03)'; for (let x = 70; x < 1080; x += 130) ctx.fillRect(x, 0, 36, 1050);
      windowPane(ctx, 90, 330, 300, 420, 'night');
      for (const xx of [54, 394]) fs(ctx, rr(xx, 296, 60, 580, 20), '#6a3a50', 5);
      fs(ctx, rr(250, 880, 600, 560, 26), '#6e4426', 7); fs(ctx, rr(272, 900, 556, 520, 16), '#7e5230', 4);
      fs(ctx, el(540, 1560, 520, 170), '#6a3a32', 7); fs(ctx, el(540, 1560, 430, 128), '#8a6a5a', 0);
      fs(ctx, rr(900, 1220, 150, 230, 8), '#6e4426', 6); fs(ctx, rr(912, 1170, 126, 56, 8), '#7e5230', 5);
      fs(ctx, rr(960, 1130, 14, 50, 3), '#2c2030', 3); fs(ctx, poly([[930, 1130], [1004, 1130], [990, 1070], [944, 1070]]), '#9a8a70', 5);
      ctx.fillStyle = 'rgba(14,6,26,.22)'; ctx.fillRect(0, 0, 1080, 1920);
    };
  },
});
Object.assign(PROPS, {stepFrontG, wolfG, shoutG, rayDoorG, sillG, phoneG, eyesG, lifeRingG, gearG, slashG, staffG, capG, tornG, lupaHandG});
export const GEO = {GY, DOOR: [620, GY], DW, DH, WIN};

// ------------------------------------------------------------------ small extras
// the contract «SIGN HERE» (a big prop for the close-up). origin = centre. tap: a pen tap on the X (0..1)
function contractG(ctx, {t = 0, k = 1, tap = 0} = {}) {
  if (k <= 0) return;
  ctx.save(); ctx.scale(k, k); ctx.lineJoin = 'round';
  fs(ctx, rr(-170, -230, 340, 460, 10), '#fffaf0', 8);
  ctx.strokeStyle = '#8a8a96'; ctx.lineWidth = 5; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-124, -170 + i * 36); ctx.lineTo(i % 2 ? 100 : 124, -170 + i * 36); ctx.stroke(); }
  ctx.fillStyle = INK; ctx.font = '40px GraceCaption'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('LOAN  0%*', 0, -206);
  ctx.strokeStyle = '#d6402c'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-132, 70); ctx.lineTo(-84, 118); ctx.moveTo(-132, 118); ctx.lineTo(-84, 70); ctx.stroke();
  ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-70, 112); ctx.lineTo(120, 112); ctx.stroke();
  ctx.fillStyle = '#d6402c'; ctx.font = '44px GraceCaption'; ctx.fillText('SIGN HERE', 10, 76);
  ctx.fillStyle = '#6a6a76'; ctx.font = '19px GraceCaption'; ctx.fillText('*terms apply. all of them.', 0, 206);
  const ty = Math.sin(clamp(tap) * Math.PI) * 24; ctx.save(); ctx.translate(-108 + 20, 94 - ty); ctx.rotate(0.5);
  ctx.strokeStyle = INK; ctx.lineWidth = 24; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -130); ctx.stroke(); ctx.strokeStyle = '#2f6fd0'; ctx.lineWidth = 14; ctx.stroke(); ctx.restore();
  ctx.restore();
}
// a soft round light (the phone's glow on a face, a lantern's pool). args {r, a, c}
function bloomG(ctx, {r = 300, a = 0.4, c = '210,246,255'} = {}) { glow(ctx, 0, 0, r, a, c); }
// the shepherd's two empty pockets turned inside out (white linings hanging from his hips). k 0..1
function pocketsG(ctx, {A = null, k = 1, t = 0} = {}) {
  if (!A || !A._arms || !A._rt || (A._alpha ?? 1) <= 0.02 || k <= 0.01) return;
  const r = A._arms, s = A._s, fl = A.flip ? -1 : 1, P = p => A._rt(fl * p[0] * s, (p[1] + r.drop + r.bob) * s);
  ctx.save(); ctx.globalAlpha = (A._alpha ?? 1) * clamp(k * 1.5); ctx.lineJoin = 'round';
  for (const sg of [-1, 1]) {
    const o = P([sg * 11, -57]), sw = Math.sin(t * 7 + sg) * 1.6 * s, L = 17 * s * clamp(k), W = 8.5 * s;
    const pp = new Path2D(); pp.moveTo(o[0] - W * 0.6, o[1]); pp.lineTo(o[0] + W * 0.6, o[1]); pp.quadraticCurveTo(o[0] + W * 1.1 + sw, o[1] + L * 0.6, o[0] + W * 0.55 + sw, o[1] + L); pp.quadraticCurveTo(o[0] + sw, o[1] + L * 1.12, o[0] - W * 0.55 + sw, o[1] + L); pp.quadraticCurveTo(o[0] - W * 1.1 + sw, o[1] + L * 0.6, o[0] - W * 0.6, o[1]); pp.closePath();
    fs(ctx, pp, '#f6efdc', Math.max(2, 0.8 * s));
  }
  ctx.restore();
}
Object.assign(PROPS, {contractG, bloomG, pocketsG});

// a big wolf paw that swipes across the frame (for the claw that tears the sleeve). origin = where the swipe starts; k 0..1 along the swipe; the arm trails behind it.
function pawG(ctx, {who = 'B', k = 0, len = 260, drop = 90, s = 1} = {}) {
  if (k <= 0 || k >= 1) return;
  const W = WOLF[who], q = easeOut(k), x = len * q, y = drop * q, a = 0.35 + 0.5 * q; ctx.save(); ctx.scale(s, s); ctx.translate(x, y); ctx.rotate(a); ctx.lineJoin = 'round';
  ctx.globalAlpha = 1 - clamp((k - 0.8) / 0.2);
  fs(ctx, rr(-240, -26, 250, 52, 20), W.fur, 6);
  fs(ctx, el(30, 0, 66, 54), W.furD, 6);
  for (const dy of [-30, 0, 30]) { const c = new Path2D(); c.moveTo(80, dy - 12); c.lineTo(150, dy + 2); c.lineTo(80, dy + 14); c.closePath(); fs(ctx, c, '#fffdf3', 4); }
  ctx.restore();
}
Object.assign(PROPS, {pawG});
