'use strict';

const UISystem = require('./UISystem');

class Tutorial {
  constructor() {
    this.active = false;
    this.step = 0;
    this.t = 0;
    this.btn = { x: -999, y: -999, w: 0, h: 0 };
  }

  start() {
    this.active = true;
    this.step = 0;
    this.t = 0;
  }

  notifyDrag() {
    if (this.active && this.step === 0) { this.step = 1; this.t = 0; }
  }

  notifyCollected() {
    if (this.active && this.step === 1) { this.step = 2; this.t = 0; }
  }

  done() {
    this.active = false;
  }

  update(dt) {
    if (this.active) this.t += dt;
  }

  hitTest(x, y) {
    if (!this.active || this.step !== 2) return null;
    const b = this.btn;
    if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return 'ok';
    return null;
  }

  _bubble(ctx, w, h, text) {
    const bw = Math.min(w - 60, 300);
    const bh = 64;
    const x = w / 2 - bw / 2;
    const y = h * 0.62;
    UISystem.roundRect(ctx, x, y, bw, bh, 14);
    ctx.fillStyle = 'rgba(30,35,45,0.85)';
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], w / 2, y + 26 + i * 20);
    }
    return { x, y, w: bw, h: bh };
  }

  draw(ctx, w, h) {
    if (!this.active) return;
    ctx.save();

    if (this.step === 0) {
      const cx = w / 2;
      const cy = h * 0.45;
      const swing = Math.sin(this.t * 3) * 46;
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 56, cy);
      ctx.lineTo(cx + 56, cy);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 56, cy); ctx.lineTo(cx - 44, cy - 7);
      ctx.moveTo(cx - 56, cy); ctx.lineTo(cx - 44, cy + 7);
      ctx.moveTo(cx + 56, cy); ctx.lineTo(cx + 44, cy - 7);
      ctx.moveTo(cx + 56, cy); ctx.lineTo(cx + 44, cy + 7);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + swing, cy, 12, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,149,0,0.95)';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      this._bubble(ctx, w, h, '单指滑动旋转观察视角\n双指缩放看清螺丝位置');
    } else if (this.step === 1) {
      this._bubble(ctx, w, h, '点击发光的螺丝\n把它拧下来');
    } else if (this.step === 2) {
      const b = this._bubble(ctx, w, h, '凑齐 3 个同色自动消除\n清完所有螺丝就过关');
      this.btn = { x: w / 2 - 60, y: b.y + b.h + 14, w: 120, h: 40 };
      UISystem.roundRect(ctx, this.btn.x, this.btn.y, this.btn.w, this.btn.h, 20);
      ctx.fillStyle = '#27ae60';
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('知道了', w / 2, this.btn.y + 26);
    }

    ctx.restore();
  }
}

module.exports = Tutorial;
