'use strict';

const UISystem = require('./UISystem');

class PausePanel {
  constructor(screenW, screenH) {
    this.w = screenW;
    this.h = screenH;
    this.visible = false;
    this.muted = false;
    this.buttons = [];
  }

  resize(w, h) {
    this.w = w;
    this.h = h;
  }

  show(opts) {
    this.visible = true;
    if (opts && opts.muted != null) this.muted = opts.muted;
    this._layout();
  }

  hide() {
    this.visible = false;
  }

  update(dt) {}

  _layout() {
    const bw = 220;
    const bh = 44;
    const gap = 14;
    const ids = [
      { id: 'resume', label: '继续游戏' },
      { id: 'sound', label: this.muted ? '音效：关' : '音效：开' },
      { id: 'help', label: '玩法说明' },
      { id: 'menu', label: '选关菜单' },
      { id: 'restart', label: '重开本关' }
    ];
    const totalH = ids.length * bh + (ids.length - 1) * gap;
    const top = this.h / 2 - totalH / 2;
    this.buttons = [];
    for (let i = 0; i < ids.length; i++) {
      this.buttons.push({
        id: ids[i].id,
        label: ids[i].label,
        x: this.w / 2 - bw / 2,
        y: top + i * (bh + gap),
        w: bw,
        h: bh
      });
    }
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

    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, this.w, this.h);

    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('已暂停', this.w / 2, this.h / 2 - 150);

    for (let i = 0; i < this.buttons.length; i++) {
      const b = this.buttons[i];
      UISystem.roundRect(ctx, b.x, b.y, b.w, b.h, 12);
      ctx.fillStyle = b.id === 'resume' ? '#27ae60'
        : (b.id === 'restart' ? '#e67e22' : 'rgba(255,255,255,0.92)');
      ctx.fill();
      ctx.fillStyle = b.id === 'resume' || b.id === 'restart' ? '#ffffff' : '#2c3e50';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText(b.label, b.x + b.w / 2, b.y + b.h / 2 + 5);
    }
    ctx.restore();
  }
}

module.exports = PausePanel;
