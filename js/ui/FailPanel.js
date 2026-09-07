'use strict';

const UISystem = require('./UISystem');

class FailPanel {
  constructor(screenW, screenH) {
    this.w = screenW;
    this.h = screenH;
    this.visible = false;
    this.animT = 0;
    this.buttons = [];
    this.undoOffered = true;
    this.clearOffered = true;
    this.coinOffered = false;
    this.undoLabel = '看视频 撤回最后一步';
    this.clearLabel = '看视频 移出3颗螺丝';
    this.coinLabel = '花 50 金币 撤回一步';
  }

  resize(w, h) {
    this.w = w;
    this.h = h;
  }

  show(opts) {
    this.visible = true;
    this.animT = 0;
    if (opts) {
      if (opts.undoOffered != null) this.undoOffered = opts.undoOffered;
      if (opts.clearOffered != null) this.clearOffered = opts.clearOffered;
      if (opts.coinOffered != null) this.coinOffered = opts.coinOffered;
    }
    this._layout();
  }

  hide() {
    this.visible = false;
  }

  update(dt) {
    if (this.visible && this.animT < 1) this.animT = Math.min(1, this.animT + dt / 0.3);
  }

  _layout() {
    const pw = Math.min(300, this.w * 0.8);
    const bw = pw - 60;
    const bh = 44;
    const items = [];
    if (this.undoOffered) {
      items.push({ id: 'adUndo', label: this.undoLabel });
    }
    if (this.clearOffered) {
      items.push({ id: 'adClear', label: this.clearLabel });
    }
    if (this.coinOffered) {
      items.push({ id: 'coinUndo', label: this.coinLabel });
    }
    items.push({ id: 'retry', label: '重新挑战', primary: true });
    const ph = 90 + items.length * (bh + 14) + 36;
    const x = (this.w - pw) / 2;
    const y = this.h * 0.5 - ph / 2 - 20;
    this.panel = { x, y, w: pw, h: ph };
    for (let i = 0; i < items.length; i++) {
      items[i].x = x + pw / 2 - bw / 2;
      items[i].y = y + 90 + i * (bh + 14);
      items[i].w = bw;
      items[i].h = bh;
    }
    this.buttons = items;
  }

  hitTest(x, y) {
    if (!this.visible) return null;
    this._layout();
    for (let i = 0; i < this.buttons.length; i++) {
      const b = this.buttons[i];
      if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return b.id;
    }
    return null;
  }

  draw(ctx) {
    if (!this.visible) return;
    this._layout();
    const p = this.panel;
    const ease = 1 - Math.pow(1 - this.animT, 3);

    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,' + (0.45 * ease) + ')';
    ctx.fillRect(0, 0, this.w, this.h);

    const cx = this.w / 2;
    const cy = this.h * 0.5 - 20;
    ctx.translate(cx, cy);
    ctx.scale(0.7 + 0.3 * ease, 0.7 + 0.3 * ease);
    ctx.translate(-cx, -cy);

    UISystem.roundRect(ctx, p.x, p.y, p.w, p.h, 20);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('槽位已满', this.w / 2, p.y + 42);
    ctx.font = '13px sans-serif';
    ctx.fillStyle = '#7f8c8d';
    ctx.fillText('别灰心，调整拆解顺序再来', this.w / 2, p.y + 68);

    for (let i = 0; i < this.buttons.length; i++) {
      const b = this.buttons[i];
      UISystem.roundRect(ctx, b.x, b.y, b.w, b.h, 12);
      ctx.fillStyle = b.id === 'coinUndo' ? '#3498db' : (b.primary ? '#e74c3c' : '#f39c12');
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(b.label, b.x + b.w / 2, b.y + b.h / 2 + 5);
    }

    ctx.restore();
  }
}

module.exports = FailPanel;
