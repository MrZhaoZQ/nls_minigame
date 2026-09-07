'use strict';

const Vec3 = require('../math/Vec3');
const Mat3 = require('../math/Mat3');
const Ray = require('../math/Ray');
const GameConfig = require('../config/GameConfig');

class ScrewRaycaster {
  constructor(camera) {
    this.camera = camera;
    this.epislon = 0.02;
  }

  screwHeadWorld(entry, stamp) {
    const node = entry.node;
    const rot = node.worldRot(stamp);
    const pos = node.worldPos(stamp);
    const headCenterLocal = [0, GameConfig.screw.headHeight * 0.5, 0];
    return Vec3.add(pos, Mat3.transform(rot, headCenterLocal));
  }

  tryPick(sx, sy, screws, boards, stamp) {
    const ray = this.camera.rayFromScreen(sx, sy);
    const pickRadius = GameConfig.screw.headRadius * 1.7;

    const candidates = [];
    for (let i = 0; i < screws.length; i++) {
      const s = screws[i];
      if (s.state !== 'unlocked') continue;
      const center = this.screwHeadWorld(s, stamp);
      const t = Ray.intersectSphere(ray.origin, ray.dir, center, pickRadius);
      if (t !== null) candidates.push({ screw: s, t });
    }
    candidates.sort((a, b) => a.t - b.t);

    const byId = {};
    for (let i = 0; i < boards.length; i++) byId[boards[i].id] = boards[i];

    for (let i = 0; i < candidates.length; i++) {
      const cand = candidates[i];
      if (!this.isCoreBlocked(cand.screw, byId, stamp)) return cand.screw;
    }
    return null;
  }

  visibleUnlocked(screws, boards, stamp) {
    const origin = this.camera.position;
    const out = [];
    for (let i = 0; i < screws.length; i++) {
      const s = screws[i];
      if (s.state !== 'unlocked' || !s.node.parent) continue;
      const head = this.screwHeadWorld(s, stamp);
      const scr = this.camera.project(head);
      if (!scr || scr.x < 0 || scr.x > this.camera.screenWidth ||
          scr.y < 0 || scr.y > this.camera.screenHeight) continue;
      const toHead = Vec3.sub(head, origin);
      const tHead = Vec3.len(toHead);
      if (tHead < 1e-6) { out.push(s); continue; }
      const dir = Vec3.scale(toHead, 1 / tHead);
      let blocked = false;
      for (let j = 0; j < boards.length; j++) {
        const b = boards[j];
        if (b.id === s.boardId || !b.node.parent || !b.node.mesh) continue;
        const he = b.node.mesh.halfExtents;
        const scale = b.node._effectiveScale();
        const obb = Ray.obbFromBox(b.node.worldPos(stamp),
          [he[0] * scale, he[1] * scale, he[2] * scale], b.node.worldRot(stamp));
        const t = Ray.intersectOBB(origin, dir, obb);
        if (t !== null && t < tHead - 0.02) { blocked = true; break; }
      }
      if (!blocked) out.push(s);
    }
    return out;
  }

  isCoreBlocked(screw, byId, stamp) {
    const own = byId[screw.boardId];
    if (!own || !own.node.parent) return false;
    const ownY = own.node.worldPos(stamp)[1];
    const hole = screw.node.worldPos(stamp);
    const CORE = 0.3;
    for (const id in byId) {
      if (id === screw.boardId) continue;
      const b = byId[id];
      if (!b.node.parent || !b.node.userData.fp) continue;
      const bp = b.node.worldPos(stamp);
      if (bp[1] <= ownY + 0.3) continue;
      const dx = Math.abs(hole[0] - bp[0]);
      const dz = Math.abs(hole[2] - bp[2]);
      if (dx < b.node.userData.fp.hw - CORE && dz < b.node.userData.fp.hd - CORE) {
        return true;
      }
    }
    return false;
  }
}

module.exports = ScrewRaycaster;
