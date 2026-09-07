'use strict';

const UISystem = require('./UISystem');

class Toast {
  constructor() {
    this.msg = '';
    this.t = 0;
    this.duration = 1.4;
  }

  show(msg) {
    this.msg = msg;
    this.t = 0;
  }

  update(dt) {
    if (this.t >= 0 && this.msg) this.t += dt;
    if (this.t > this.duration) this.msg = '';
  }

  draw(ctx, w, h) {
    if (!this.msg) return;
    const alpha = this.t < 0.15 ? this.t / 0.15
      : (this.duration - this.t < 0.3 ? Math.max(0, (this.duration - this.t) / 0.3) : 1);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = '13px sans-serif';
    const tw = ctx.measureText(this.msg).width;
    const bw = tw + 32;
    const bh = 34;
    const x = w / 2 - bw / 2;
    const y = h * 0.32;
    UISystem.roundRect(ctx, x, y, bw, bh, 17);
    ctx.fillStyle = 'rgba(30,35,45,0.82)';
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(this.msg, w / 2, y + 22);
    ctx.restore();
  }
}

module.exports = Toast;
