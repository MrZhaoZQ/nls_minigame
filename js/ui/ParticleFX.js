'use strict';

const GameConfig = require('../config/GameConfig');
const UISystem = require('./UISystem');

class ParticleFX {
  constructor() {
    this.pool = [];
    this.active = [];
    this.maxParticles = GameConfig.render.maxParticles;
    this.enabled = true;
    this.halfMode = false;
  }

  _spawn(props) {
    if (!this.enabled) return;
    if (this.active.length >= (this.halfMode ? this.maxParticles / 2 : this.maxParticles)) return;
    let p = this.pool.pop();
    if (!p) p = {};
    p.x = props.x;
    p.y = props.y;
    p.vx = props.vx;
    p.vy = props.vy;
    p.gravity = props.gravity == null ? 600 : props.gravity;
    p.life = 0;
    p.maxLife = props.maxLife || 0.5;
    p.size = props.size || 4;
    p.color = props.color;
    p.shape = props.shape || 'circle';
    this.active.push(p);
  }

  burst(x, y, colorName, count) {
    const c = UISystem.screwColorSet(colorName);
    const n = count || 14;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const speed = 120 + Math.random() * 220;
      this._spawn({
        x, y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed - 120,
        size: 2.5 + Math.random() * 3,
        maxLife: 0.35 + Math.random() * 0.25,
        color: Math.random() < 0.5 ? c.main : c.light,
        shape: 'circle'
      });
    }
  }

  dust(x, y, widthPx) {
    const n = 10;
    for (let i = 0; i < n; i++) {
      this._spawn({
        x: x + (Math.random() - 0.5) * widthPx,
        y: y,
        vx: (Math.random() - 0.5) * 90,
        vy: -30 - Math.random() * 60,
        gravity: 60,
        size: 3 + Math.random() * 4,
        maxLife: 0.4 + Math.random() * 0.3,
        color: 'rgba(180,160,130,0.5)',
        shape: 'circle'
      });
    }
  }

  update(dt) {
    for (let i = this.active.length - 1; i >= 0; i--) {
      const p = this.active[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.active.splice(i, 1);
        this.pool.push(p);
        continue;
      }
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
  }

  draw(ctx) {
    if (this.active.length === 0) return;
    ctx.save();
    for (let i = 0; i < this.active.length; i++) {
      const p = this.active[i];
      const alpha = 1 - p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (0.6 + 0.4 * alpha), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

module.exports = ParticleFX;
