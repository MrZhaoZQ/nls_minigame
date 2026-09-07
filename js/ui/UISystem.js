'use strict';

const GameConfig = require('../config/GameConfig');

const UISystem = {
  roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  },

  screwColorSet(colorName) {
    const c = GameConfig.colors[colorName];
    return c || { main: '#999999', light: '#cccccc', dark: '#666666' };
  },

  drawScrewIcon(ctx, x, y, r, colorName, opts) {
    const c = UISystem.screwColorSet(colorName);
    const o = opts || {};
    const scale = o.scale || 1;
    const alpha = o.alpha == null ? 1 : o.alpha;

    ctx.save();
    ctx.globalAlpha = alpha;

    const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    grad.addColorStop(0, c.light);
    grad.addColorStop(0.75, c.main);
    grad.addColorStop(1, c.dark);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = Math.max(1.5, r * 0.18);
    ctx.lineCap = 'round';
    const half = r * 0.55 * scale;
    ctx.beginPath();
    ctx.moveTo(x - half, y);
    ctx.lineTo(x + half, y);
    ctx.stroke();

    if (o.glow) {
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, r * scale + 3, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }
};

module.exports = UISystem;
