'use strict';

const Mat3 = {
  identity() { return [1, 0, 0, 0, 1, 0, 0, 0, 1]; },

  multiply(a, b) {
    const r = new Array(9);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        r[i * 3 + j] = a[i * 3] * b[j] + a[i * 3 + 1] * b[3 + j] + a[i * 3 + 2] * b[6 + j];
      }
    }
    return r;
  },

  transform(m, v) {
    return [
      m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
      m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
      m[6] * v[0] + m[7] * v[1] + m[8] * v[2]
    ];
  },

  transpose(m) {
    return [m[0], m[3], m[6], m[1], m[4], m[7], m[2], m[5], m[8]];
  },

  fromAxisAngle(axis, angle) {
    const x = axis[0], y = axis[1], z = axis[2];
    const c = Math.cos(angle), s = Math.sin(angle), t = 1 - c;
    return [
      t * x * x + c,     t * x * y - s * z, t * x * z + s * y,
      t * x * y + s * z, t * y * y + c,     t * y * z - s * x,
      t * x * z - s * y, t * y * z + s * x, t * z * z + c
    ];
  },

  fromEulerXYZ(rx, ry, rz) {
    const cx = Math.cos(rx), sx = Math.sin(rx);
    const cy = Math.cos(ry), sy = Math.sin(ry);
    const cz = Math.cos(rz), sz = Math.sin(rz);
    const Rx = [1, 0, 0, 0, cx, -sx, 0, sx, cx];
    const Ry = [cy, 0, sy, 0, 1, 0, -sy, 0, cy];
    const Rz = [cz, -sz, 0, sz, cz, 0, 0, 0, 1];
    return Mat3.multiply(Rz, Mat3.multiply(Ry, Rx));
  },

  fromYawPitch(yawRad, pitchRad) {
    return Mat3.multiply(Mat3.fromAxisAngle([0, 1, 0], yawRad),
      Mat3.fromAxisAngle([1, 0, 0], pitchRad));
  }
};

module.exports = Mat3;
