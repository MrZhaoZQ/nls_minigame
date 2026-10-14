'use strict';

const Vec3 = require('../math/Vec3');
const GameConfig = require('../config/GameConfig');

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16)
  ];
}

const SHADE_MAX = 1.5;
const SHADE_STEPS = 64;
const _shadeLutCache = {};

function shadeLut(colorHex) {
  let lut = _shadeLutCache[colorHex];
  if (lut) return lut;
  const rgb = colorHex ? hexToRgb(colorHex) : [200, 200, 200];
  lut = new Array(SHADE_STEPS);
  for (let i = 0; i < SHADE_STEPS; i++) {
    const f = (i / (SHADE_STEPS - 1)) * SHADE_MAX;
    const r = Math.max(0, Math.min(255, Math.round(rgb[0] * f)));
    const g = Math.max(0, Math.min(255, Math.round(rgb[1] * f)));
    const b = Math.max(0, Math.min(255, Math.round(rgb[2] * f)));
    lut[i] = 'rgb(' + r + ',' + g + ',' + b + ')';
  }
  _shadeLutCache[colorHex] = lut;
  return lut;
}

function shadeLevel(factor) {
  let lv = (factor / SHADE_MAX * (SHADE_STEPS - 1)) | 0;
  if (lv < 0) lv = 0;
  else if (lv > SHADE_STEPS - 1) lv = SHADE_STEPS - 1;
  return lv;
}

const _hlStrokeLut = [];
function hlStroke(pulse) {
  if (_hlStrokeLut.length === 0) {
    for (let k = 0; k < 16; k++) {
      const a = 0.75 + 0.25 * (k / 15);
      _hlStrokeLut.push('rgba(255,214,90,' + a.toFixed(2) + ')');
    }
  }
  let k = (pulse * 15 + 0.5) | 0;
  if (k < 0) k = 0; else if (k > 15) k = 15;
  return _hlStrokeLut[k];
}

function byDepth(a, b) {
  return b.depth - a.depth;
}

class Renderer {
  constructor() {
    this.lightDir = Vec3.normalize(GameConfig.render.lightDir);
    this.ambient = GameConfig.render.ambient;
    this._facePool = [];
    this.highlightScrewId = null;
    this.degraded = false;
  }

  render(ctx, scene, camera, opts) {
    const stamp = scene.beginFrame();

    this._drawShadows(ctx, scene, camera, stamp);

    const faces = this._facePool;
    const countRef = { n: 0 };
    const self = this;
    const walk = function (node) {
      if (!node.visible) return;
      if (node.mesh) countRef.n = self._collectMesh(node, camera, stamp, faces, countRef.n);
      for (let i = 0; i < node.children.length; i++) walk(node.children[i]);
    };
    walk(scene.root);

    let drawList = this._drawList;
    if (!drawList) drawList = this._drawList = [];
    drawList.length = 0;
    for (let i = 0; i < countRef.n; i++) drawList.push(faces[i]);
    drawList.sort(byDepth);

    for (let i = 0; i < drawList.length; i++) {
      const f = drawList[i];
      if (f.alpha < 1) ctx.globalAlpha = f.alpha;
      ctx.fillStyle = f.fill;
      ctx.beginPath();
      const pts = f.pts;
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let j = 1; j < pts.length; j++) ctx.lineTo(pts[j].x, pts[j].y);
      ctx.closePath();
      ctx.fill();
      if (f.stroke) {
        ctx.strokeStyle = f.stroke;
        ctx.lineWidth = f.highlight ? 1.8 : 1;
        ctx.stroke();
      }
      if (f.alpha < 1) ctx.globalAlpha = 1;
    }
  }

  _collectMesh(node, camera, stamp, faces, count) {
    const mesh = node.mesh;
    const worldRot = node.worldRot(stamp);
    const worldPos = node.worldPos(stamp);
    const scale = node._effectiveScale();
    const alpha = node.alpha;

    const nv = mesh.verts.length;
    if (!mesh._viewCache || mesh._viewCache.length !== nv) {
      mesh._viewCache = new Array(nv);
      for (let i = 0; i < nv; i++) mesh._viewCache[i] = [0, 0, 0];
      mesh._screenCache = new Array(nv);
      for (let i = 0; i < nv; i++) mesh._screenCache[i] = { x: 0, y: 0, z: 0 };
    }
    const screenCache = mesh._screenCache;

    const r0 = worldRot[0], r1 = worldRot[1], r2 = worldRot[2];
    const r3 = worldRot[3], r4 = worldRot[4], r5 = worldRot[5];
    const r6 = worldRot[6], r7 = worldRot[7], r8 = worldRot[8];
    const px = worldPos[0], py = worldPos[1], pz = worldPos[2];
    const wScratch = this._wScratch || (this._wScratch = [0, 0, 0]);
    for (let i = 0; i < nv; i++) {
      const lv = mesh.verts[i];
      wScratch[0] = px + (r0 * lv[0] + r1 * lv[1] + r2 * lv[2]) * scale;
      wScratch[1] = py + (r3 * lv[0] + r4 * lv[1] + r5 * lv[2]) * scale;
      wScratch[2] = pz + (r6 * lv[0] + r7 * lv[1] + r8 * lv[2]) * scale;
      camera.toViewInto(wScratch, mesh._viewCache[i]);
      camera.projectInto(wScratch, screenCache[i]);
    }

    const isHighlight = this.highlightScrewId && node.id === this.highlightScrewId;
    const pulse = isHighlight ? 0.5 + 0.5 * Math.sin(Date.now() / 120) : 0;
    const lowPolyScrew = this.degraded && mesh.kind === 'screw';

    const SW = camera.screenWidth;
    const SH = camera.screenHeight;
    const MARGIN = 8;
    const near = camera.near;
    const light = this.lightDir;
    const cx0 = camera.right[0], cy0 = camera.right[1], cz0 = camera.right[2];
    const ux0 = camera.up[0], uy0 = camera.up[1], uz0 = camera.up[2];
    const fx0 = camera.forward[0], fy0 = camera.forward[1], fz0 = camera.forward[2];
    const lf = this.ambient;

    for (let i = 0; i < mesh.faces.length; i++) {
      const face = mesh.faces[i];
      if (lowPolyScrew && Math.abs(face.normal[1]) < 0.5) continue;
      const idx = face.idx;
      const n = idx.length;
      let cxv = 0, cyv = 0, czv = 0;
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      const rec = faces[count] || (faces[count] = { pts: [], depth: 0, fill: '', stroke: null, highlight: false, alpha: 1 });
      const pts = rec.pts;
      pts.length = 0;
      let straddle = false;
      for (let j = 0; j < n; j++) {
        const v = mesh._viewCache[idx[j]];
        if (v[2] <= near) straddle = true;
        cxv += v[0]; cyv += v[1]; czv += v[2];
        const s = screenCache[idx[j]];
        pts.push(s);
        if (s.x < minX) minX = s.x;
        if (s.x > maxX) maxX = s.x;
        if (s.y < minY) minY = s.y;
        if (s.y > maxY) maxY = s.y;
      }
      if (straddle) continue;
      const cxx = cxv / n, cyy = cyv / n, cz = czv / n;
      if (cz <= near) continue;

      const fnx = face.normal[0], fny = face.normal[1], fnz = face.normal[2];
      const wnx = r0 * fnx + r1 * fny + r2 * fnz;
      const wny = r3 * fnx + r4 * fny + r5 * fnz;
      const wnz = r6 * fnx + r7 * fny + r8 * fnz;
      const cnx = wnx * cx0 + wny * cy0 + wnz * cz0;
      const cny = wnx * ux0 + wny * uy0 + wnz * uz0;
      const cnz = wnx * fx0 + wny * fy0 + wnz * fz0;
      if (cnx * cxx + cny * cyy + cnz * cz >= 0) continue;

      if (maxX < -MARGIN || minX > SW + MARGIN || maxY < -MARGIN || minY > SH + MARGIN) continue;

      let lambert = lf + (1 - lf) * Math.max(0, wnx * light[0] + wny * light[1] + wnz * light[2]);
      if (isHighlight) lambert = Math.min(SHADE_MAX, lambert + 0.45 + 0.35 * pulse);

      const lut = shadeLut(face.color);
      rec.depth = cz;
      rec.fill = lut[shadeLevel(lambert)];
      rec.stroke = isHighlight ? hlStroke(pulse)
        : ((mesh.outline && !face.topDetail) ? lut[shadeLevel(lambert * 0.55)] : null);
      rec.highlight = !!isHighlight;
      rec.alpha = alpha;
      count++;
    }
    return count;
  }

  _drawShadows(ctx, scene, camera, stamp) {
    if (this.degraded) return;
    const boards = [];
    scene.root.traverse(n => {
      if (n.userData && n.userData.isBoard && n.visible) boards.push(n);
    });
    const groundY = GameConfig.scene.groundY;
    const SW = camera.screenWidth;
    const SH = camera.screenHeight;
    ctx.fillStyle = 'rgba(30,30,40,' + GameConfig.render.shadowAlpha + ')';
    for (let i = 0; i < boards.length; i++) {
      const b = boards[i];
      const wp = b.worldPos(stamp);
      const mesh = b.mesh;
      if (!mesh || !mesh.halfExtents) continue;
      const p = camera.project([wp[0], groundY, wp[2]]);
      if (!p) continue;
      const rx = mesh.halfExtents[0] * camera.focal / p.z * 1.06;
      if (p.x + rx < 0 || p.x - rx > SW || p.y + rx < 0 || p.y - rx > SH) continue;
      const rz = mesh.halfExtents[2] * camera.focal / p.z * 1.06;
      const fade = Math.max(0, 1 - Math.max(0, (wp[1] - groundY)) / 6);
      if (fade <= 0.02) continue;
      ctx.globalAlpha = fade * b.alpha;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, rx, rz * 0.42, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

module.exports = Renderer;
