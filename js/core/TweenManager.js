'use strict';

const Easing = {
  linear(t) { return t; },
  quadIn(t) { return t * t; },
  quadOut(t) { return t * (2 - t); },
  cubicIn(t) { return t * t * t; },
  cubicOut(t) { const u = t - 1; return u * u * u + 1; },
  backOut(t) {
    const s = 1.70158;
    const u = t - 1;
    return u * u * ((s + 1) * u + s) + 1;
  },
  sineInOut(t) { return 0.5 - 0.5 * Math.cos(Math.PI * t); }
};

const STOPPED = 0;
const RUNNING = 1;
const DONE = 2;

class Tween {
  constructor(manager) {
    this._manager = manager;
    this.duration = 0;
    this.delay = 0;
    this.easing = Easing.linear;
    this.onUpdate = null;
    this.onComplete = null;
    this._elapsed = 0;
    this._state = STOPPED;
    this._next = null;
  }

  to(duration, opts) {
    this.duration = duration;
    this.easing = (opts && opts.easing) || Easing.linear;
    this.onUpdate = (opts && opts.onUpdate) || null;
    this.onComplete = (opts && opts.onComplete) || null;
    this.delay = (opts && opts.delay) || 0;
    return this;
  }

  start() {
    if (this._state === RUNNING) return this;
    this._state = RUNNING;
    this._elapsed = 0;
    this._manager.add(this);
    return this;
  }

  stop() {
    this._state = STOPPED;
    this._manager.remove(this);
    return this;
  }

  then(duration, opts) {
    const t = new Tween(this._manager).to(duration, opts);
    this._next = t;
    return t;
  }

  advance(dt) {
    if (this._state !== RUNNING) return;
    this._elapsed += dt;
    if (this._elapsed < this.delay) return;
    const local = this._elapsed - this.delay;
    const t = this.duration <= 0 ? 1 : Math.min(1, local / this.duration);
    const eased = this.easing(t);
    if (this.onUpdate) this.onUpdate(eased, t);
    if (t >= 1) {
      this._state = DONE;
      this._manager.remove(this);
      if (this.onComplete) this.onComplete();
      if (this._next) this._next.start();
    }
  }
}

class TweenManager {
  constructor() {
    this.tweens = [];
  }

  add(tween) {
    if (this.tweens.indexOf(tween) < 0) this.tweens.push(tween);
  }

  remove(tween) {
    const idx = this.tweens.indexOf(tween);
    if (idx >= 0) this.tweens.splice(idx, 1);
  }

  tween(duration, opts) {
    return new Tween(this).to(duration, opts);
  }

  delay(seconds) {
    return new Tween(this).to(0, { delay: seconds });
  }

  update(dt) {
    const list = this.tweens.slice();
    for (let i = 0; i < list.length; i++) list[i].advance(dt);
  }

  clear() {
    this.tweens.length = 0;
  }

  get count() { return this.tweens.length; }
}

module.exports = TweenManager;
module.exports.Tween = Tween;
module.exports.Easing = Easing;
