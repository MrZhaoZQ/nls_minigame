'use strict';

const GameConfig = require('../config/GameConfig');

const DEG = Math.PI / 180;

class CameraController {
  constructor(camera) {
    this.camera = camera;
    const cfg = GameConfig.camera;
    this.yawSpeed = cfg.yawSpeed;
    this.pitchSpeed = cfg.pitchSpeed;
    this.pitchMin = cfg.pitchMin;
    this.pitchMax = cfg.pitchMax;
    this.distMin = cfg.distMin;
    this.distMax = cfg.distMax;
    this.damping = cfg.damping;
    this.inertia = cfg.inertia;

    this.yaw = 35;
    this.pitch = 18;
    this.targetYaw = this.yaw;
    this.targetPitch = this.pitch;
    this.dist = 8;
    this.targetDist = 8;
    this.target = [0, 0, 0];

    this.velYaw = 0;
    this.dragging = false;
    this._lastDragTs = 0;

    this.shakeTime = 0;
    this.shakeDuration = 0;
    this.shakeIntensity = 0;
  }

  setTarget(pos) { this.target = pos.slice(); }

  setView(yawDeg, pitchDeg, dist) {
    this.yaw = this.targetYaw = yawDeg;
    this.pitch = this.targetPitch = pitchDeg;
    this.dist = this.targetDist = dist;
    this.velYaw = 0;
  }

  focusOn(pos) {
    const dx = pos[0] - this.target[0];
    const dy = pos[1] - this.target[1];
    const dz = pos[2] - this.target[2];
    const horizontal = Math.sqrt(dx * dx + dz * dz);
    if (horizontal < 0.01 && Math.abs(dy) < 0.01) return;
    const yaw = Math.atan2(dx, dz) / DEG;
    const pitch = -Math.atan2(dy, horizontal) / DEG;
    this._setTargetAngles(yaw, pitch);
  }

  _setTargetAngles(yaw, pitch) {
    let dyaw = ((yaw - this.targetYaw + 540) % 360) - 180;
    if (Math.abs(dyaw) <= 30) return;
    this.targetYaw += dyaw;
    this.targetPitch = Math.max(this.pitchMin, Math.min(this.pitchMax, pitch));
  }

  onDrag(dx, dy) {
    this.dragging = true;
    this.targetYaw += dx * this.yawSpeed;
    this.targetPitch = Math.max(this.pitchMin,
      Math.min(this.pitchMax, this.targetPitch - dy * this.pitchSpeed));
    this._lastDragTs = Date.now();
  }

  onDragEnd(vx) {
    this.dragging = false;
    this.velYaw = vx * this.yawSpeed;
  }

  onPinch(ratio) {
    if (ratio <= 0) return;
    this.targetDist = Math.max(this.distMin, Math.min(this.distMax, this.targetDist / ratio));
  }

  shake(time, intensity) {
    this.shakeTime = 0;
    this.shakeDuration = time;
    this.shakeIntensity = intensity;
  }

  update(dt) {
    const frames = Math.max(0.001, dt * 60);

    if (!this.dragging) {
      if (Math.abs(this.velYaw) > 0.001) {
        this.targetYaw += this.velYaw * frames;
        this.velYaw *= Math.pow(this.inertia, frames);
      }
    }

    const k = 1 - Math.pow(1 - this.damping, frames);
    this.yaw += (this.targetYaw - this.yaw) * k;
    this.pitch += (this.targetPitch - this.pitch) * k;
    this.dist += (this.targetDist - this.dist) * k;

    let shakeOffset = null;
    if (this.shakeDuration > 0) {
      this.shakeTime += dt;
      if (this.shakeTime >= this.shakeDuration) {
        this.shakeDuration = 0;
      } else {
        const remain = 1 - this.shakeTime / this.shakeDuration;
        const amp = this.shakeIntensity * remain * this.dist;
        shakeOffset = [
          (Math.random() * 2 - 1) * amp,
          (Math.random() * 2 - 1) * amp,
          (Math.random() * 2 - 1) * amp
        ];
      }
    }

    this.camera.updateFrom(
      this.yaw * DEG, this.pitch * DEG, this.dist, this.target, shakeOffset);
  }
}

module.exports = CameraController;
