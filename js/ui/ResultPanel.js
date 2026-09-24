'use strict';

const UISystem = require('./UISystem');

class ResultPanel {
  constructor(screenW, screenH) {
    this.w = screenW;
    this.h = screenH;
    this.visible = false;
    this.animT = 0;
    this.coins = 0;
    this.doubled = false;
    this.buttons = [];
    this.nextLabel = '下一关';
    this.doubleLabel = '看视频 金币翻倍';
    this.pressedId = null;
    this.pressedT = 0;
  }

  setPressed(id) {
    this.pressedId = id;
    this.pressedT = 0.16;
  }

  resize(w, h) {
    this.w = w;
    this.h = h;
  }

  show(coins, info) {
    this.visible = true;
    this.animT = 0;
    this.coins = coins;
    this.doubled = false;
    this.info = info || null;
  }

  hide() {
    this.visible = false;
  }

  update(dt) {
    if (this.visible && this.animT < 1) this.animT = Math.min(1, this.animT + dt / 0.3);
    if (this.pressedT > 0) {
      this.pressedT -= dt;
      if (this.pressedT <= 0) this.pressedId = null;
    }
  }

  _drawStar(ctx, x, y, r, fill) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const rad = (i % 2 === 0) ? r : r * 0.46;
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const px = x + Math.cos(a) * rad;
      const py = y + Math.sin(a) * rad;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  }

  _starScale(i) {
    const at = 0.3 + i * 0.2;
    if (this.animT < at) return 0;
    const t = Math.min(1, (this.animT - at) / 0.25);
    const s = 1.70158;
    const u = t - 1;
    return u * u * ((s + 1) * u + s) + 1;
  }

  _layout() {
    const pw = Math.min(300, this.w * 0.8);
    const ph = this.info ? 260 : 230;
    const x = (this.w - pw) / 2;
    const y = this.h * 0.5 - ph / 2 - 20;
    const bw = pw - 60;
    const bh = 44;
    this.panel = { x, y, w: pw, h: ph };
    this.buttons = [
      { id: 'next', x: x + pw / 2 - bw / 2, y: y + ph - 64, w: bw, h: bh, label: this.nextLabel, primary: true },
      { id: 'double', x: x + pw / 2 - bw / 2, y: y + ph - 120, w: bw, h: bh,
        label: this.doubled ? '已翻倍' : this.doubleLabel, primary: false }
    ];
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
    ctx.fillText('通关！', this.w / 2, p.y + 42);

    if (this.info) {
      for (let s = 0; s < 3; s++) {
        const filled = s < (this.info.stars || 0);
        const sc = filled ? this._starScale(s) : 1;
        if (sc <= 0.01) continue;
        this._drawStar(ctx, this.w / 2 + (s - 1) * 34, p.y + 70, 14 * sc,
          filled ? '#f5b301' : 'rgba(0,0,0,0.12)');
      }
      const statA = Math.max(0, Math.min(1, (this.animT - 0.8) / 0.2));
      ctx.globalAlpha = statA;
      const sec = Math.round((this.info.costMs || 0) / 1000);
      const mm = Math.floor(sec / 60);
      const ss = ('0' + (sec % 60)).slice(-2);
      ctx.font = '13px sans-serif';
      ctx.fillStyle = '#7f8c8d';
      ctx.fillText('用时 ' + mm + ':' + ss + ' · 步数 ' + (this.info.moves || 0),
        this.w / 2, p.y + 100);
      ctx.globalAlpha = 1;
    }

    const coinA = Math.max(0, Math.min(1, (this.animT - 0.85) / 0.15));
    if (coinA > 0) {
      ctx.globalAlpha = coinA;
      const pop = 1 + 0.3 * Math.sin(coinA * Math.PI);
      ctx.font = 'bold ' + Math.round(15 * pop) + 'px sans-serif';
      ctx.fillStyle = '#7f8c8d';
      const shownCoins = this.doubled ? this.coins * 2 : this.coins;
      let coinText = '金币 +' + shownCoins;
      if (this.info && this.info.balance != null) coinText += ' · 余额 ' + this.info.balance;
      ctx.fillText(coinText, this.w / 2, p.y + (this.info ? 124 : 80));
      ctx.globalAlpha = 1;
    }

    for (let i = 0; i < this.buttons.length; i++) {
      const b = this.buttons[i];
      const disabled = b.id === 'double' && this.doubled;
      const pr = this.pressedId === b.id ? 3 : 0;
      UISystem.roundRect(ctx, b.x + pr, b.y + pr, b.w - pr * 2, b.h - pr * 2, 12);
      ctx.fillStyle = disabled ? '#bdc3c7' : (b.primary ? '#27ae60' : '#f39c12');
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(b.label, b.x + b.w / 2, b.y + b.h / 2 + 6);
    }

    ctx.restore();
  }
}

module.exports = ResultPanel;
