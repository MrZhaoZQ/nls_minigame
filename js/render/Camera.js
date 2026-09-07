'use strict';

const Vec3 = require('../math/Vec3');
const GameConfig = require('../config/GameConfig');

class Camera {
  constructor(screenWidth, screenHeight) {
    this.fov = GameConfig.render.fov * Math.PI / 180;
    this.near = GameConfig.render.near;
    this.far = GameConfig.render.far;
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    this.target = [0, 0, 0];
    this.position = [0, 0, 8];
    this.right = [1, 0, 0];
    this.up = [0, 1, 0];
    this.forward = [0, 0, -1];
    this._updateFocal();
  }

  _updateFocal() {
    this.focal = (this.screenHeight / 2) / Math.tan(this.fov / 2);
  }

  setScreen(w, h) {
    this.screenWidth = w;
    this.screenHeight = h;
    this._updateFocal();
  }

  updateFrom(yawRad, pitchRad, dist, target, shakeOffset) {
    const cp = Math.cos(pitchRad), sp = Math.sin(pitchRad);
    const cy = Math.cos(yawRad), sy = Math.sin(yawRad);
    const offset = [dist * cp * sy, dist * sp, dist * cp * cy];
    const base = Vec3.add(target, offset);
    this.position = shakeOffset ? Vec3.add(base, shakeOffset) : base;
    this.target = Vec3.clone(target);

    const f = Vec3.normalize(Vec3.sub(target, this.position));
    let r = Vec3.cross(f, [0, 1, 0]);
    if (Vec3.len(r) < 1e-6) r = [1, 0, 0];
    r = Vec3.normalize(r);
    const u = Vec3.cross(r, f);
    this.forward = f;
    this.right = r;
    this.up = u;
  }

  toView(worldPt) {
    const v = Vec3.sub(worldPt, this.position);
    return [
      Vec3.dot(v, this.right),
      Vec3.dot(v, this.up),
      Vec3.dot(v, this.forward)
    ];
  }

  project(worldPt) {
    const v = this.toView(worldPt);
    if (v[2] <= this.near) return null;
    const cx = this.screenWidth / 2;
    const cyy = this.screenHeight / 2;
    return {
      x: cx + (v[0] * this.focal) / v[2],
      y: cyy - (v[1] * this.focal) / v[2],
      z: v[2]
    };
  }

  rayFromScreen(sx, sy) {
    const cx = this.screenWidth / 2;
    const cyy = this.screenHeight / 2;
    const dx = (sx - cx) / this.focal;
    const dy = (cyy - sy) / this.focal;
    const dir = Vec3.normalize(Vec3.add(
      Vec3.add(this.forward, Vec3.scale(this.right, dx)),
      Vec3.scale(this.up, dy)));
    return { origin: Vec3.clone(this.position), dir };
  }
}

module.exports = Camera;
