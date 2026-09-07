'use strict';

const Vec3 = require('../math/Vec3');
const Mat3 = require('../math/Mat3');
const GameConfig = require('../config/GameConfig');

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16)
  ];
}

function shade(rgb, factor) {
  const r = Math.max(0, Math.min(255, Math.round(rgb[0] * factor)));
  const g = Math.max(0, Math.min(255, Math.round(rgb[1] * factor)));
  const b = Math.max(0, Math.min(255, Math.round(rgb[2] * factor)));
  return 'rgb(' + r + ',' + g + ',' + b + ')';
}

class Renderer {
  constructor() {
    this.lightDir = Vec3.normalize(GameConfig.render.lightDir);
    this.ambient = GameConfig.render.ambient;
    this._facePool = [];
    this.highlightScrewId = null;
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

    const drawList = faces.slice(0, countRef.n);
    drawList.sort((a, b) => b.depth - a.depth);

    for (let i = 0; i < drawList.length; i++) {
      const f = drawList[i];
      if (f.alpha < 1) ctx.globalAlpha = f.alpha;
      ctx.fillStyle = f.fill;
      ctx.beginPath();
      ctx.moveTo(f.pts[0].x, f.pts[0].y);
      for (let j = 1; j < f.pts.length; j++) ctx.lineTo(f.pts[j].x, f.pts[j].y);
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
    }

    for (let i = 0; i < nv; i++) {
      const lv = mesh.verts[i];
      const scaled = [lv[0] * scale, lv[1] * scale, lv[2] * scale];
      const w = Mat3.transform(worldRot, scaled);
      w[0] += worldPos[0]; w[1] += worldPos[1]; w[2] += worldPos[2];
      const v = camera.toView(w);
      mesh._viewCache[i] = v;
      mesh._screenCache[i] = camera.project(w);
    }

    const isHighlight = this.highlightScrewId && node.id === this.highlightScrewId;
    const pulse = isHighlight ? 0.5 + 0.5 * Math.sin(Date.now() / 120) : 0;

    for (let i = 0; i < mesh.faces.length; i++) {
      const face = mesh.faces[i];
      const idx = face.idx;
      let cxv = 0, cyv = 0, czv = 0;
      let ok = true;
      const pts = [];
      for (let j = 0; j < idx.length; j++) {
        const v = mesh._viewCache[idx[j]];
        const s = mesh._screenCache[idx[j]];
        if (!s) { ok = false; break; }
        cxv += v[0]; cyv += v[1]; czv += v[2];
        pts.push(s);
      }
      if (!ok) continue;
      const n = idx.length;
      const centroid = [cxv / n, cyv / n, czv / n];
      if (centroid[2] <= camera.near) continue;

      const wn = Mat3.transform(worldRot, face.normal);
      const camN = [
        Vec3.dot(wn, camera.right),
        Vec3.dot(wn, camera.up),
        Vec3.dot(wn, camera.forward)
      ];
      if (Vec3.dot(camN, centroid) >= 0) continue;

      let baseRgb = face.color ? hexToRgb(face.color) : [200, 200, 200];
      let lambert = this.ambient + (1 - this.ambient) * Math.max(0, Vec3.dot(wn, this.lightDir));
      if (isHighlight) lambert = Math.min(1.5, lambert + 0.45 + 0.35 * pulse);

      faces[count] = {
        pts,
        depth: centroid[2],
        fill: shade(baseRgb, lambert),
        stroke: isHighlight
          ? 'rgba(255,214,90,' + (0.75 + 0.25 * pulse).toFixed(2) + ')'
          : ((mesh.outline && !face.topDetail) ? shade(baseRgb, lambert * 0.55) : null),
        highlight: isHighlight,
        alpha
      };
      count++;
    }
    return count;
  }

  _drawShadows(ctx, scene, camera, stamp) {
    const boards = [];
    scene.root.traverse(n => {
      if (n.userData && n.userData.isBoard && n.visible) boards.push(n);
    });
    const groundY = GameConfig.scene.groundY;
    ctx.fillStyle = 'rgba(30,30,40,' + GameConfig.render.shadowAlpha + ')';
    for (let i = 0; i < boards.length; i++) {
      const b = boards[i];
      const wp = b.worldPos(stamp);
      const mesh = b.mesh;
      if (!mesh || !mesh.halfExtents) continue;
      const center = [wp[0], groundY, wp[2]];
      const p = camera.project(center);
      if (!p) continue;
      const rx = mesh.halfExtents[0] * camera.focal / p.z * 1.06;
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
