'use strict';

const Mat3 = require('../math/Mat3');
const GameConfig = require('../config/GameConfig');
const Easing = require('../core/TweenManager').Easing;

const ScrewState = {
  LOCKED: 'locked',
  UNLOCKED: 'unlocked',
  SCREWING: 'screwing',
  IN_SLOT: 'inslot'
};

class ScrewManager {
  constructor(tweenManager) {
    this.tweens = tweenManager;
    this.screws = [];
    this._seq = 0;
  }

  create(boardId, holeId, color, node, baseLocalPos) {
    this._seq++;
    const entry = {
      id: 'screw_' + this._seq,
      boardId,
      holeId,
      color,
      state: ScrewState.UNLOCKED,
      node,
      baseLocalPos: baseLocalPos.slice(),
      spin: 0
    };
    this.screws.push(entry);
    return entry;
  }

  setLocked(entry, locked) {
    if (entry.state === ScrewState.SCREWING || entry.state === ScrewState.IN_SLOT) return;
    entry.state = locked ? ScrewState.LOCKED : ScrewState.UNLOCKED;
  }

  remove(entry) {
    const idx = this.screws.indexOf(entry);
    if (idx >= 0) this.screws.splice(idx, 1);
  }

  unscrew(entry, doneCb) {
    if (entry.state !== ScrewState.UNLOCKED) return false;
    entry.state = ScrewState.SCREWING;

    const cfg = GameConfig.screw;
    const startY = entry.node.position[1];
    const rise = cfg.rise;
    const totalTurn = cfg.spinDeg * Math.PI / 180;
    const node = entry.node;
    const base = entry.baseLocalPos;

    const tGrab = this.tweens.tween(0.09, {
      onUpdate: (v) => {
        const sink = Math.sin(v * Math.PI) * 0.035;
        const wobble = Math.sin(v * Math.PI * 4) * 0.1;
        node.position = [base[0], startY - sink, base[2]];
        node.rotation = Mat3.fromAxisAngle([0, 1, 0], wobble);
      }
    });
    tGrab.then(cfg.unscrewAnimTime, {
      easing: Easing.quadOut,
      onUpdate: (v) => {
        node.position = [base[0], startY + rise * v, base[2]];
        node.rotation = Mat3.fromAxisAngle([0, 1, 0], totalTurn * v);
      },
      onComplete: () => {
        entry.state = ScrewState.IN_SLOT;
        node.removeFromParent();
        if (doneCb) doneCb(entry);
      }
    });
    tGrab.start();
    return true;
  }

  byState(state) {
    return this.screws.filter(s => s.state === state);
  }

  allRemovedFromBoards() {
    for (let i = 0; i < this.screws.length; i++) {
      const s = this.screws[i];
      if (s.state === ScrewState.LOCKED || s.state === ScrewState.UNLOCKED ||
          s.state === ScrewState.SCREWING) return false;
    }
    return this.screws.length > 0 || this._seq > 0;
  }
}

module.exports = ScrewManager;
module.exports.ScrewState = ScrewState;
