'use strict';

const Vec3 = {
  create(x, y, z) { return [x || 0, y || 0, z || 0]; },
  add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; },
  sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; },
  scale(a, s) { return [a[0] * s, a[1] * s, a[2] * s]; },
  dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; },
  cross(a, b) {
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0]
    ];
  },
  len(a) { return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]); },
  normalize(a) {
    const l = Vec3.len(a);
    if (l < 1e-9) return [0, 0, 0];
    return [a[0] / l, a[1] / l, a[2] / l];
  },
  dist(a, b) { return Vec3.len(Vec3.sub(a, b)); },
  clone(a) { return [a[0], a[1], a[2]]; }
};

module.exports = Vec3;
