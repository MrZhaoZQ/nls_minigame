'use strict';

const UISystem = require('./UISystem');

class LevelSelect {
  constructor(screenW, screenH, capsule) {
    this.w = screenW;
    this.h = screenH;
    this.capsule = capsule || { bottom: 58 };
    this.visible = false;
    this.levels = [];
    this.unlocked = 1;
    this.results = {};
    this.capacity = 5;
    this.canExpand = false;
    this.cells = [];
    this.expandBtn = null;
    this.scroll = 0;
    this.maxScroll = 0;
    this.viewTop = 0;
    this.viewBottom = 0;
  }

  resize(w, h) {
    this.w = w;
    this.h = h;
  }

  show(opts) {
    this.visible = true;
    this.levels = opts.levels;
    this.unlocked = opts.unlocked;
    this.results = opts.results || {};
    this.capacity = opts.capacity;
    this.coins = opts.coins || 0;
    this.canExpand = !!opts.canExpand;
    this.scroll = 0;
    this._layout();
  }

  onDrag(dy) {
    if (!this.visible) return;
    this.scroll = Math.max(0, Math.min(this.maxScroll, this.scroll - dy));
  }

  hide() {
    this.visible = false;
  }

  update(dt) {}

  _layout() {
    const cols = 5;
    const gap = 12;
    const margin = 22;
    const cell = (this.w - margin * 2 - gap * (cols - 1)) / cols;
    const pitch = cell + gap + 10;
    this.viewTop = this.capsule.bottom + 70;
    this.viewBottom = this.h - 104;
    this.cells = [];
    for (let i = 0; i < this.levels.length; i++) {
      const id = this.levels[i];
      const col = i % cols;
      const row = Math.floor(i / cols);
      this.cells.push({
        id,
        x: margin + col * (cell + gap),
        y: this.viewTop + row * pitch - this.scroll,
        w: cell,
        h: cell
      });
    }
    const rows = Math.ceil(this.levels.length / cols);
    const contentBottom = this.viewTop + (rows - 1) * pitch + cell;
    this.maxScroll = Math.max(0, contentBottom - this.viewBottom);
    const bw = 240;
    this.expandBtn = {
      x: this.w / 2 - bw / 2,
      y: this.h - 92,
      w: bw,
      h: 46
    };
  }

  hitTest(x, y) {
    if (!this.visible) return null;
    this._layout();
    for (let i = 0; i < this.cells.length; i++) {
      const c = this.cells[i];
      const cy = c.y + c.h / 2;
      if (cy < this.viewTop - 4 || cy > this.viewBottom + 4) continue;
      if (x >= c.x && x <= c.x + c.w && y >= c.y && y <= c.y + c.h) {
        if (c.id <= this.unlocked) return { type: 'level', id: c.id };
        return { type: 'locked' };
      }
    }
    const e = this.expandBtn;
    if (x >= e.x && x <= e.x + e.w && y >= e.y && y <= e.y + e.h) {
      return { type: 'expand' };
    }
    return null;
  }

  _drawStar(ctx, x, y, r, filled) {
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const rad = (i % 2 === 0) ? r : r * 0.45;
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const px = x + Math.cos(a) * rad;
      const py = y + Math.sin(a) * rad;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = filled ? '#f5b301' : 'rgba(0,0,0,0.15)';
    ctx.fill();
    ctx.restore();
  }

  draw(ctx) {
    if (!this.visible) return;
    this._layout();
    const w = this.w;

    ctx.save();
    const grad = ctx.createLinearGradient(0, 0, 0, this.h);
    grad.addColorStop(0, 'rgba(219,231,240,0.97)');
    grad.addColorStop(1, 'rgba(246,239,228,0.97)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, this.h);

    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('拧螺丝啦', w / 2, this.capsule.bottom + 40);
    ctx.font = '12px sans-serif';
    ctx.fillStyle = 'rgba(44,62,80,0.55)';
    ctx.fillText('选择关卡 · 槽位 ' + this.capacity + ' · 我的金币 ' + this.coins,
      w / 2, this.capsule.bottom + 60);

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, this.viewTop - 6, w, this.viewBottom - this.viewTop + 12);
    ctx.clip();

    for (let i = 0; i < this.cells.length; i++) {
      const c = this.cells[i];
      if (c.y + c.h < this.viewTop - 8 || c.y > this.viewBottom + 8) continue;
      const locked = c.id > this.unlocked;
      const rec = this.results[c.id];

      UISystem.roundRect(ctx, c.x, c.y, c.w, c.h, 12);
      if (locked) ctx.fillStyle = 'rgba(120,130,140,0.35)';
      else ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = locked ? 'rgba(0,0,0,0.05)' : 'rgba(39,174,96,0.5)';
      ctx.lineWidth = locked ? 1 : 2;
      ctx.stroke();

      ctx.textAlign = 'center';
      if (locked) {
        ctx.fillStyle = 'rgba(60,70,80,0.5)';
        ctx.fillRect(c.x + c.w / 2 - 6, c.y + c.h / 2 - 4, 12, 9);
        ctx.strokeStyle = 'rgba(60,70,80,0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(c.x + c.w / 2, c.y + c.h / 2 - 4, 4, Math.PI, 0);
        ctx.stroke();
      } else {
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 17px sans-serif';
        ctx.fillText(String(c.id), c.x + c.w / 2, c.y + c.h / 2 + 2);
        const stars = rec ? rec.stars : 0;
        for (let s = 0; s < 3; s++) {
          this._drawStar(ctx, c.x + c.w / 2 + (s - 1) * 14, c.y + c.h - 13, 6, s < stars);
        }
      }
    }

    ctx.restore();

    if (this.maxScroll > 0) {
      const trackH = this.viewBottom - this.viewTop;
      const thumbH = Math.max(30, trackH * (trackH / (trackH + this.maxScroll)));
      const ty = this.viewTop + (this.scroll / this.maxScroll) * (trackH - thumbH);
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      UISystem.roundRect(ctx, w - 7, ty, 4, thumbH, 2);
      ctx.fill();
    }

    const e = this.expandBtn;
    const enabled = this.canExpand && this.capacity < 8;
    UISystem.roundRect(ctx, e.x, e.y, e.w, e.h, 23);
    ctx.fillStyle = enabled ? '#f39c12' : 'rgba(150,150,150,0.5)';
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(enabled
      ? '邀好友 暂存槽永久+1'
      : (this.capacity >= 8 ? '槽位已满级' : '明日可再扩容'), e.x + e.w / 2, e.y + 29);

    ctx.restore();
  }
}

module.exports = LevelSelect;
