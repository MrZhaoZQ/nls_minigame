'use strict';

const GameConfig = require('../config/GameConfig');

class HintMarker {
  constructor() {
    this.target = null;
    this.t = 0;
  }

  setTarget(entry) {
    this.target = entry || null;
    this.t = 0;
  }

  clear() {
    this.target = null;
    this.t = 0;
  }

  update(dt) {
    if (this.target) this.t += dt;
  }

  draw(ctx, camera, scene) {
    if (!this.target) return;
    const node = this.target.node;
    if (!node.parent) {
      this.target = null;
      return;
    }
    const wp = node.worldPos(scene.stamp);
    const headCenter = [wp[0], wp[1] + GameConfig.screw.headHeight * 0.5, wp[2]];
    const scr = camera.project(headCenter);
    if (!scr) return;

    const pulse = 0.5 + 0.5 * Math.sin(this.t * 6);
    const x = scr.x;
    const y = scr.y;

    ctx.save();

    const ringR = 17 + 3 * pulse;
    ctx.strokeStyle = 'rgba(255,206,64,0.95)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, ringR, 0, Math.PI * 2);
    ctx.stroke();

    const wave = (this.t * 1.4) % 1;
    ctx.globalAlpha = (1 - wave) * 0.55;
    ctx.strokeStyle = 'rgba(255,206,64,1)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 17 + wave * 20, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;

    const bob = 5 * Math.sin(this.t * 4.5);
    const ax = x;
    const tipY = y - 30 + bob;
    const headH = 13;
    const headW = 15;
    const tailW = 7;
    const tailH = 13;

    const path = () => {
      ctx.beginPath();
      ctx.moveTo(ax, tipY + headH);
      ctx.lineTo(ax - headW / 2, tipY);
      ctx.lineTo(ax - tailW / 2, tipY);
      ctx.lineTo(ax - tailW / 2, tipY - tailH);
      ctx.lineTo(ax + tailW / 2, tipY - tailH);
      ctx.lineTo(ax + tailW / 2, tipY);
      ctx.lineTo(ax + headW / 2, tipY);
      ctx.closePath();
    };

    ctx.strokeStyle = 'rgba(255,255,255,0.95)';
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    path();
    ctx.stroke();
    ctx.fillStyle = '#ff9500';
    path();
    ctx.fill();

    ctx.restore();
  }
}

module.exports = HintMarker;
