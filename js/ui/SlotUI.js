'use strict';

const UISystem = require('./UISystem');
const GameConfig = require('../config/GameConfig');
const Events = require('../core/EventBus').Events;

class SlotUI {
  constructor(bus, screenW, screenH, bottomInset) {
    this.bus = bus;
    this.resize(screenW, screenH, bottomInset || 0);
    this.slots = [];
    this.capacity = GameConfig.slot.defaultCount;
    this.flights = [];
    this.bounces = [];
    this.warnPulse = 0;
    this.warning = false;
    this._pendingIndex = -1;

    bus.on(Events.SLOT_UPDATED, (d) => {
      this.slots = d.slots.slice();
      if (d.arrivedIndex >= 0 && this._lastFlight) {
        const f = this._lastFlight;
        this._lastFlight = null;
        f.targetIndex = d.arrivedIndex;
        this.flights.push(f);
        this._pendingIndex = d.arrivedIndex;
      }
    });
    bus.on(Events.MATCH_MADE, (d) => {
      this.flash = { color: d.color, t: 0 };
    });
    bus.on(Events.SLOT_FULL_WARNING, () => {
      this.warning = true;
      this.warnPulse = 0;
    });
    bus.on(Events.SCREW_COLLECTED, (d) => {
      if (d.screenPos) {
        this._lastFlight = {
          color: d.color,
          sx: d.screenPos.x, sy: d.screenPos.y,
          t: 0, targetIndex: -1
        };
      }
    });
    bus.on('LEVEL_LOADED', () => {
      this.slots = [];
      this.flights = [];
      this.bounces = [];
      this.warning = false;
      this.warnPulse = 0;
      this._pendingIndex = -1;
      this._lastFlight = null;
      this.flash = null;
    });
  }

  resize(w, h, bottomInset) {
    this.w = w;
    this.h = h;
    this.inset = bottomInset || 0;
    this.barH = Math.min(120, h * 0.16);
    this.y = h - this.barH - this.inset;
  }

  setCapacity(n) {
    this.capacity = n;
  }

  panelRect() {
    const pad = 8;
    return { x: 10, y: this.y + pad, w: this.w - 20, h: this.barH - pad * 2, r: 18 };
  }

  slotCenter(index) {
    const n = this.capacity;
    const pad = 24;
    const usable = this.w - pad * 2;
    const step = usable / n;
    return {
      x: pad + step * index + step / 2,
      y: this.y + this.barH / 2,
      r: Math.min(step * 0.32, 26)
    };
  }

  update(dt) {
    for (let i = this.flights.length - 1; i >= 0; i--) {
      const f = this.flights[i];
      f.t += dt / GameConfig.screw.flyTime;
      if (f.t >= 1) {
        this.flights.splice(i, 1);
        if (f.targetIndex >= 0) {
          this.bounces.push({ index: f.targetIndex, t: 0 });
          if (this._pendingIndex === f.targetIndex) this._pendingIndex = -1;
        }
      }
    }
    for (let i = this.bounces.length - 1; i >= 0; i--) {
      this.bounces[i].t += dt / 0.25;
      if (this.bounces[i].t >= 1) this.bounces.splice(i, 1);
    }
    if (this.warning) this.warnPulse += dt;
    if (this.flash) {
      this.flash.t += dt / 0.4;
      if (this.flash.t >= 1) this.flash = null;
    }
  }

  draw(ctx) {
    ctx.save();
    const pr = this.panelRect();

    UISystem.roundRect(ctx, pr.x, pr.y, pr.w, pr.h, pr.r);
    ctx.fillStyle = 'rgba(255,255,255,0.82)';
    ctx.fill();

    if (this.warning) {
      const pulse = 0.35 + 0.3 * Math.sin(this.warnPulse * 8);
      ctx.strokeStyle = 'rgba(231,76,60,' + pulse + ')';
      ctx.lineWidth = 3;
      UISystem.roundRect(ctx, pr.x, pr.y, pr.w, pr.h, pr.r);
      ctx.stroke();
    } else {
      ctx.strokeStyle = 'rgba(0,0,0,0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    for (let i = 0; i < this.capacity; i++) {
      const pos = this.slotCenter(i);
      let scale = 1;
      for (let j = 0; j < this.bounces.length; j++) {
        if (this.bounces[j].index === i) {
          const bt = this.bounces[j].t;
          scale = 1 + 0.25 * Math.sin(bt * Math.PI);
        }
      }

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, pos.r + 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      ctx.fill();

      if (i === this._pendingIndex) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, pos.r * 0.75, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0,0,0,0.12)';
        ctx.lineWidth = 2;
        ctx.stroke();
        continue;
      }

      if (i < this.slots.length) {
        UISystem.drawScrewIcon(ctx, pos.x, pos.y, pos.r, this.slots[i], { scale });
      } else {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, pos.r * 0.75, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0,0,0,0.12)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    for (let i = 0; i < this.flights.length; i++) {
      const f = this.flights[i];
      const target = this.slotCenter(Math.max(0, f.targetIndex >= 0 ? f.targetIndex : this.capacity - 1));
      const t = Math.min(1, f.t);
      const midX = (f.sx + target.x) / 2;
      const midY = Math.min(f.sy, target.y) - 60;
      const x = (1 - t) * (1 - t) * f.sx + 2 * (1 - t) * t * midX + t * t * target.x;
      const yy = (1 - t) * (1 - t) * f.sy + 2 * (1 - t) * t * midY + t * t * target.y;
      const r = 12 + 8 * t;
      UISystem.drawScrewIcon(ctx, x, yy, r, f.color, { scale: 1 });
    }

    if (this.flash) {
      ctx.globalAlpha = (1 - this.flash.t) * 0.5;
      UISystem.roundRect(ctx, pr.x, pr.y, pr.w, pr.h, pr.r);
      ctx.fillStyle = UISystem.screwColorSet(this.flash.color).light;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }
}

module.exports = SlotUI;
