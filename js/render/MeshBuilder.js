'use strict';

const GameConfig = require('../config/GameConfig');

function pushQuad(verts, faces, a, b, c, d, colorKey, colorValue) {
  const i = verts.length;
  verts.push(a, b, c, d);
  const n = normalOf([a, b, c]);
  faces.push({ idx: [i, i + 1, i + 2, i + 3], normal: n, colorKey, color: colorValue, poly: true });
}

function normalOf(pts) {
  const ux = pts[1][0] - pts[0][0], uy = pts[1][1] - pts[0][1], uz = pts[1][2] - pts[0][2];
  const vx = pts[2][0] - pts[0][0], vy = pts[2][1] - pts[0][1], vz = pts[2][2] - pts[0][2];
  const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
  const l = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
  return [nx / l, ny / l, nz / l];
}

function buildBoxMesh(w, d, t, colorKey, colorValue, outline) {
  const hw = w / 2, hd = d / 2, ht = t / 2;
  const verts = [];
  const faces = [];
  const P = (x, y, z) => [x, y, z];

  pushQuad(verts, faces, P(-hw, ht, -hd), P(-hw, ht, hd), P(hw, ht, hd), P(hw, ht, -hd), colorKey, colorValue);
  pushQuad(verts, faces, P(-hw, -ht, hd), P(-hw, -ht, -hd), P(hw, -ht, -hd), P(hw, -ht, hd), colorKey, colorValue);
  pushQuad(verts, faces, P(-hw, -ht, hd), P(hw, -ht, hd), P(hw, ht, hd), P(-hw, ht, hd), colorKey, colorValue);
  pushQuad(verts, faces, P(hw, -ht, -hd), P(-hw, -ht, -hd), P(-hw, ht, -hd), P(hw, ht, -hd), colorKey, colorValue);
  pushQuad(verts, faces, P(hw, -ht, hd), P(hw, -ht, -hd), P(hw, ht, -hd), P(hw, ht, hd), colorKey, colorValue);
  pushQuad(verts, faces, P(-hw, -ht, -hd), P(-hw, -ht, hd), P(-hw, ht, hd), P(-hw, ht, -hd), colorKey, colorValue);

  return { verts, faces, outline: outline !== false, kind: 'board',
           halfExtents: [hw, ht, hd] };
}

function buildLBoardMesh(w, d, t, armW, colorKey, colorValue) {
  const main = buildBoxMesh(w, d, t, colorKey, colorValue);
  const arm = buildBoxMesh(armW, d, t, colorKey, colorValue);
  const base = main.verts.length;
  for (let i = 0; i < arm.verts.length; i++) {
    const v = arm.verts[i];
    main.verts.push([v[0] - w / 2 + armW / 2, v[1], v[2] - d]);
  }
  for (let i = 0; i < arm.faces.length; i++) {
    const f = arm.faces[i];
    main.faces.push({
      idx: f.idx.map(ix => ix + base),
      normal: f.normal,
      colorKey: f.colorKey,
      color: f.color,
      poly: true
    });
  }
  main.kind = 'board';
  main.halfExtents = [w / 2, t / 2, d];
  return main;
}

function buildGearMesh(radius, segments, t, colorKey, colorValue) {
  const verts = [];
  const faces = [];
  const ht = t / 2;
  const topCenter = verts.length;
  verts.push([0, ht, 0]);
  const botCenter = topCenter + 1;
  verts.push([0, -ht, 0]);
  const ringTop = verts.length;
  for (let i = 0; i < segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    const r = (i % 2 === 0) ? radius : radius * 0.82;
    verts.push([Math.cos(a) * r, ht, Math.sin(a) * r]);
    verts.push([Math.cos(a) * r, -ht, Math.sin(a) * r]);
  }
  for (let i = 0; i < segments; i++) {
    const j = (i + 1) % segments;
    const t0 = ringTop + i * 2, b0 = ringTop + i * 2 + 1;
    const t1 = ringTop + j * 2, b1 = ringTop + j * 2 + 1;
    faces.push({ idx: [topCenter, t1, t0], normal: [0, 1, 0], colorKey, color: colorValue });
    faces.push({ idx: [botCenter, b0, b1], normal: [0, -1, 0], colorKey, color: colorValue });
    faces.push({ idx: [t0, t1, b1, b0], normal: [Math.cos(((i + 0.5) / segments) * Math.PI * 2), 0, Math.sin(((i + 0.5) / segments) * Math.PI * 2)], colorKey, color: colorValue, poly: true });
  }
  for (let i = 0; i < segments; i++) {
    const a = ((i + 0.5) / segments) * Math.PI * 2;
    faces[2 + i * 2].normal = [Math.cos(a), 0, Math.sin(a)];
  }
  return { verts, faces, outline: false, kind: 'board',
           halfExtents: [radius, t / 2, radius] };
}

function buildScrewMesh(colorName) {
  const c = GameConfig.colors[colorName];
  const headR = GameConfig.screw.headRadius;
  const headH = GameConfig.screw.headHeight;
  const shaftR = GameConfig.screw.shaftRadius;
  const shaftL = GameConfig.screw.shaftLength;
  const seg = 8;
  const verts = [];
  const faces = [];
  const metal = { main: '#b8bec6', light: '#e8edf2', dark: '#7a828c' };

  const headTop = verts.length;
  verts.push([0, headH, 0]);
  const headRingTop = verts.length;
  const headRingBot = headRingTop + seg;
  for (let i = 0; i < seg; i++) {
    const a = (i / seg) * Math.PI * 2;
    verts.push([Math.cos(a) * headR, headH, Math.sin(a) * headR]);
  }
  for (let i = 0; i < seg; i++) {
    const a = (i / seg) * Math.PI * 2;
    verts.push([Math.cos(a) * headR, 0, Math.sin(a) * headR]);
  }
  for (let i = 0; i < seg; i++) {
    const j = (i + 1) % seg;
    faces.push({ idx: [headTop, headRingTop + j, headRingTop + i], normal: [0, 1, 0], colorKey: '__solid', color: c.main });
    faces.push({ idx: [headRingTop + i, headRingTop + j, headRingBot + j, headRingBot + i],
      normal: [Math.cos(((i + 0.5) / seg) * Math.PI * 2), 0, Math.sin(((i + 0.5) / seg) * Math.PI * 2)],
      colorKey: '__solid', color: c.main });
  }

  const slotW = headR * 1.3, slotD = headR * 0.28;
  const sy = headH + 0.004;
  const s0 = verts.length;
  verts.push([-slotW / 2, sy, -slotD / 2]);
  verts.push([slotW / 2, sy, -slotD / 2]);
  verts.push([slotW / 2, sy, slotD / 2]);
  verts.push([-slotW / 2, sy, slotD / 2]);
  faces.push({ idx: [s0, s0 + 3, s0 + 2, s0 + 1], normal: [0, 1, 0], colorKey: '__solid', color: c.dark, topDetail: true });

  const shaftTop = verts.length;
  verts.push([0, 0, 0]);
  const tip = verts.length;
  verts.push([0, -shaftL, 0]);
  const shaftRing = verts.length;
  for (let i = 0; i < seg; i++) {
    const a = (i / seg) * Math.PI * 2;
    verts.push([Math.cos(a) * shaftR, 0, Math.sin(a) * shaftR]);
  }
  const tipRing = verts.length;
  const tipR = shaftR * 0.55;
  for (let i = 0; i < seg; i++) {
    const a = (i / seg) * Math.PI * 2;
    verts.push([Math.cos(a) * tipR, -shaftL, Math.sin(a) * tipR]);
  }
  for (let i = 0; i < seg; i++) {
    const j = (i + 1) % seg;
    faces.push({ idx: [shaftRing + i, shaftRing + j, tipRing + j, tipRing + i],
      normal: [Math.cos(((i + 0.5) / seg) * Math.PI * 2), 0, Math.sin(((i + 0.5) / seg) * Math.PI * 2)],
      colorKey: '__solid', color: metal.main });
    faces.push({ idx: [tip, tipRing + i, tipRing + j],
      normal: [0, -1, 0], colorKey: '__solid', color: metal.dark });
  }

  return { verts, faces, outline: true, kind: 'screw', colorName, metal };
}

module.exports = { buildBoxMesh, buildLBoardMesh, buildGearMesh, buildScrewMesh, normalOf };
