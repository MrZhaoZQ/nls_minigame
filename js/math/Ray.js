'use strict';

const Vec3 = require('./Vec3');

const EPS = 1e-8;

function intersectOBB(origin, dir, obb) {
  const d = Vec3.sub(obb.center, origin);
  let tmin = -Infinity, tmax = Infinity;
  for (let i = 0; i < 3; i++) {
    const axis = obb.axes[i];
    const half = obb.halfExtents[i];
    const e = Vec3.dot(axis, d);
    const f = Vec3.dot(dir, axis);
    if (Math.abs(f) > EPS) {
      let t1 = (e + half) / f;
      let t2 = (e - half) / f;
      if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; }
      if (t1 > tmin) tmin = t1;
      if (t2 < tmax) tmax = t2;
      if (tmin > tmax) return null;
    } else {
      if (-e - half > 0 || -e + half < 0) return null;
    }
  }
  if (tmax < 0) return null;
  return tmin >= 0 ? tmin : tmax;
}

function intersectSphere(origin, dir, center, radius) {
  const oc = Vec3.sub(origin, center);
  const b = Vec3.dot(oc, dir);
  const c = Vec3.dot(oc, oc) - radius * radius;
  const disc = b * b - c;
  if (disc < 0) return null;
  const sq = Math.sqrt(disc);
  const t1 = -b - sq;
  const t2 = -b + sq;
  if (t1 >= 0) return t1;
  if (t2 >= 0) return t2;
  return null;
}

function intersectSegments(origin, dir, segs, radius) {
  let best = null;
  for (let i = 0; i < segs.length; i++) {
    const t = intersectSphere(origin, dir, segs[i], radius);
    if (t !== null && (best === null || t < best)) best = t;
  }
  return best;
}

function obbFromBox(center, halfExtents, rot) {
  const axes = rot ? [
    [rot[0], rot[3], rot[6]],
    [rot[1], rot[4], rot[7]],
    [rot[2], rot[5], rot[8]]
  ] : [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  return { center, halfExtents, axes };
}

module.exports = { intersectOBB, intersectSphere, intersectSegments, obbFromBox };
