'use strict';

const GameConfig = require('../config/GameConfig');
const Platform = require('../platform/Platform');

class InputManager {
  constructor() {
    this.locked = false;
    this.onTap = null;
    this.onDrag = null;
    this.onDragEnd = null;
    this.onPinch = null;

    this._touches = new Map();
    this._tapCandidate = null;
    this._pinchDist = 0;
    this._lastSingle = null;
    this._moved = false;
    this._lastVx = 0;
    this._lastVy = 0;

    this._handlers = {
      start: this._onStart.bind(this),
      move: this._onMove.bind(this),
      end: this._onEnd.bind(this),
      cancel: this._onEnd.bind(this)
    };
  }

  attach() {
    Platform.onTouchStart(this._handlers.start);
    Platform.onTouchMove(this._handlers.move);
    Platform.onTouchEnd(this._handlers.end);
    Platform.onTouchCancel(this._handlers.cancel);
  }

  setLocked(b) { this.locked = b; }
  isInteracting() { return this._touches.size > 0; }

  _onStart(e) {
    const changed = e.changedTouches || e.touches || [];
    for (let i = 0; i < changed.length; i++) {
      const t = changed[i];
      const id = t.identifier != null ? t.identifier : 0;
      this._touches.set(id, {
        x: t.clientX, y: t.clientY,
        startX: t.clientX, startY: t.clientY,
        startTime: Platform.now()
      });
    }

    if (this._touches.size === 1) {
      const only = this._touches.values().next().value;
      this._tapCandidate = { x: only.startX, y: only.startY, time: only.startTime };
      this._lastSingle = { x: only.x, y: only.y };
      this._moved = false;
    } else {
      this._tapCandidate = null;
      this._pinchDist = this._currentPinchDist();
      if (this._moved && this.onDragEnd) this.onDragEnd(0);
      this._moved = false;
      this._lastSingle = null;
    }
  }

  _onMove(e) {
    const changed = e.changedTouches || [];
    for (let i = 0; i < changed.length; i++) {
      const t = changed[i];
      const id = t.identifier != null ? t.identifier : 0;
      const existing = this._touches.get(id);
      if (existing) {
        existing.x = t.clientX;
        existing.y = t.clientY;
      }
    }

    if (this.locked) return;

    if (this._touches.size >= 2) {
      const d = this._currentPinchDist();
      if (this._pinchDist > 0 && d > 0 && this.onPinch) {
        this.onPinch(d / this._pinchDist);
      }
      this._pinchDist = d;
      this._tapCandidate = null;
      return;
    }

    if (this._touches.size === 1 && this._lastSingle) {
      const only = this._touches.values().next().value;
      const dx = only.x - this._lastSingle.x;
      const dy = only.y - this._lastSingle.y;
      this._lastSingle = { x: only.x, y: only.y };
      if (dx !== 0 || dy !== 0) {
        if (this._tapCandidate) {
          const total = Math.abs(only.x - this._tapCandidate.x) + Math.abs(only.y - this._tapCandidate.y);
          if (total > GameConfig.input.tapThreshold) {
            this._tapCandidate = null;
            this._moved = true;
          }
        }
        this._lastVx = dx;
        this._lastVy = dy;
        if (this._moved && this.onDrag) this.onDrag(dx, dy);
      }
    }
  }

  _onEnd(e) {
    const changed = e.changedTouches || [];
    const wasSingle = this._touches.size === 1;

    for (let i = 0; i < changed.length; i++) {
      const t = changed[i];
      const id = t.identifier != null ? t.identifier : 0;
      this._touches.delete(id);
    }

    if (this.locked) {
      this._tapCandidate = null;
      this._lastSingle = null;
      return;
    }

    if (wasSingle && this._tapCandidate) {
      const only = changed[0];
      if (only) {
        const dx = only.clientX - this._tapCandidate.x;
        const dy = only.clientY - this._tapCandidate.y;
        const distSq = dx * dx + dy * dy;
        const elapsed = Platform.now() - this._tapCandidate.time;
        if (distSq < GameConfig.input.tapThreshold * GameConfig.input.tapThreshold &&
            elapsed < GameConfig.input.tapMaxTime &&
            this.onTap) {
          this.onTap(this._tapCandidate.x, this._tapCandidate.y);
        }
      }
    } else if (wasSingle && this._moved) {
      if (this.onDragEnd) this.onDragEnd(this._lastVx, this._lastVy);
    }

    this._tapCandidate = null;
    this._moved = false;
    this._lastVx = 0;
    this._lastVy = 0;

    if (this._touches.size === 1) {
      const only = this._touches.values().next().value;
      this._lastSingle = { x: only.x, y: only.y };
    } else if (this._touches.size >= 2) {
      this._pinchDist = this._currentPinchDist();
      this._lastSingle = null;
    } else {
      this._lastSingle = null;
    }
  }

  _currentPinchDist() {
    const vals = [];
    this._touches.forEach(v => vals.push(v));
    if (vals.length < 2) return 0;
    const dx = vals[0].x - vals[1].x;
    const dy = vals[0].y - vals[1].y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

module.exports = InputManager;
