'use strict';

class TopBar {
  constructor(bus, screenW, screenH, capsule) {
    this.bus = bus;
    this.w = screenW;
    this.h = screenH;
    this.capsule = capsule || {
      top: 26, height: 32, bottom: 58,
      left: screenW - 94, right: screenW - 7, width: 87
    };
    this.levelLabel = '';
    this.remaining = 0;
    this.undoQuota = 1;
    this.undoCoinAffordable = false;
    this.hintEnabled = false;
    this.allDisabled = false;
    this.buttons = [];
    this._layout();
  }

  resize(w, h, capsule) {
    this.w = w;
    this.h = h;
    if (capsule) this.capsule = capsule;
    this._layout();
  }

  _layout() {
    const cap = this.capsule;
    const r = 20;
    const rowY = cap.bottom + 16 + r;
    const rightEdge = cap.right;
    this.titleY = cap.top + cap.height / 2;
    this.buttons = [
      { id: 'undo', x: rightEdge - r, y: rowY, r: r },
      { id: 'hint', x: rightEdge - r * 3 - 12, y: rowY, r: r },
      { id: 'help', x: rightEdge - r * 5 - 24, y: rowY, r: r },
      { id: 'pause', x: rightEdge - r * 7 - 36, y: rowY, r: r }
    ];
  }

  setLevel(label) { this.levelLabel = label; }
  setRemaining(n) { this.remaining = n; }
  setUndoQuota(n) { this.undoQuota = n; }

  isEnabled(id) {
    if (this.allDisabled) return false;
    if (id === 'undo') return this.undoQuota > 0 || this.undoCoinAffordable;
    if (id === 'hint') return this.hintEnabled;
    return true;
  }

  hitTest(x, y) {
    for (let i = 0; i < this.buttons.length; i++) {
      const b = this.buttons[i];
      const dx = x - b.x;
      const dy = y - b.y;
      if (dx * dx + dy * dy <= (b.r + 6) * (b.r + 6)) return b.id;
    }
    return null;
  }

  update(dt) {}

  _drawButtonBase(ctx, b, enabled) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.shadowColor = 'rgba(31,45,61,0.18)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetY = 2;
    const g = ctx.createRadialGradient(
      b.x - b.r * 0.35, b.y - b.r * 0.4, b.r * 0.15,
      b.x, b.y, b.r * 1.05);
    if (enabled) {
      g.addColorStop(0, '#ffffff');
      g.addColorStop(1, '#e9edf2');
    } else {
      g.addColorStop(0, 'rgba(255,255,255,0.78)');
      g.addColorStop(1, 'rgba(235,238,242,0.55)');
    }
    ctx.fillStyle = g;
    ctx.fill();
    ctx.shadowColor = 'rgba(0,0,0,0)';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.strokeStyle = enabled ? 'rgba(31,45,61,0.12)' : 'rgba(31,45,61,0.06)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }

  _drawUndoIcon(ctx, b, color) {
    const r0 = b.r * 0.44;
    const aArrow = Math.PI * 0.95;
    const aTail = Math.PI * 0.55;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(b.x, b.y, r0, aArrow, aTail + Math.PI * 2, false);
    ctx.stroke();

    const px = b.x + r0 * Math.cos(aArrow);
    const py = b.y + r0 * Math.sin(aArrow);
    const dirX = Math.sin(aArrow);
    const dirY = -Math.cos(aArrow);
    const perpX = -dirY;
    const perpY = dirX;
    const L = 7.2, W = 4.2;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(px + dirX * L, py + dirY * L);
    ctx.lineTo(px + perpX * W - dirX * 1.5, py + perpY * W - dirY * 1.5);
    ctx.lineTo(px - perpX * W - dirX * 1.5, py - perpY * W - dirY * 1.5);
    ctx.closePath();
    ctx.fill();
  }

  _drawHintIcon(ctx, b, color) {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(b.x, b.y - 3, 6.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(b.x - 3, b.y + 6);
    ctx.lineTo(b.x + 3, b.y + 6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(b.x - 2, b.y + 9.5);
    ctx.lineTo(b.x + 2, b.y + 9.5);
    ctx.stroke();
  }

  _drawHelpIcon(ctx, b, color) {
    ctx.fillStyle = color;
    ctx.font = 'bold 21px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('?', b.x, b.y + 7.5);
  }

  draw(ctx) {
    ctx.save();
    const cap = this.capsule;

    ctx.fillStyle = 'rgba(31,45,61,0.55)';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(this.levelLabel, 16, this.titleY + 5);

    ctx.font = '11px sans-serif';
    ctx.fillStyle = 'rgba(31,45,61,0.4)';
    ctx.fillText('剩余螺丝 ' + this.remaining, 16, cap.bottom + 20);

    for (let i = 0; i < this.buttons.length; i++) {
      const b = this.buttons[i];
      const enabled = this.isEnabled(b.id);

      this._drawButtonBase(ctx, b, enabled);

      const iconColor = enabled ? 'rgba(45,55,70,0.9)' : 'rgba(45,55,70,0.3)';
      if (b.id === 'undo') {
        this._drawUndoIcon(ctx, b, iconColor);
        if (this.undoQuota > 0) {
          const bx = b.x + b.r * 0.72;
          const by = b.y - b.r * 0.72;
          ctx.save();
          ctx.shadowColor = 'rgba(31,45,61,0.25)';
          ctx.shadowBlur = 3;
          ctx.shadowOffsetY = 1;
          ctx.beginPath();
          ctx.arc(bx, by, 8.5, 0, Math.PI * 2);
          ctx.fillStyle = '#e67e22';
          ctx.fill();
          ctx.restore();
          ctx.strokeStyle = 'rgba(255,255,255,0.9)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(bx, by, 8.5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(String(this.undoQuota), bx, by + 4);
        }
      } else if (b.id === 'hint') {
        this._drawHintIcon(ctx, b, iconColor);
      } else if (b.id === 'pause') {
        ctx.fillStyle = iconColor;
        const bw2 = 3.2, bh2 = 13, off = 4.5;
        ctx.save();
        ctx.lineCap = 'round';
        ctx.strokeStyle = iconColor;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(b.x - off, b.y - bh2 / 2);
        ctx.lineTo(b.x - off, b.y + bh2 / 2);
        ctx.moveTo(b.x + off, b.y - bh2 / 2);
        ctx.lineTo(b.x + off, b.y + bh2 / 2);
        ctx.stroke();
        ctx.restore();
      } else {
        this._drawHelpIcon(ctx, b, iconColor);
      }
    }

    ctx.restore();
  }
}

module.exports = TopBar;
