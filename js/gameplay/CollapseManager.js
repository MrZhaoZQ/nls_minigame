'use strict';

const Vec3 = require('../math/Vec3');
const Mat3 = require('../math/Mat3');
const GameConfig = require('../config/GameConfig');
const Easing = require('../core/TweenManager').Easing;

class CollapseManager {
  constructor(scene, tweens, hooks) {
    this.scene = scene;
    this.tweens = tweens;
    this.hooks = hooks || {};
    this.queue = [];
    this.busy = false;
    this.collapsingBoardId = null;
  }

  isActive() {
    return this.busy || this.queue.length > 0;
  }

  queueCollapse(board) {
    if (board.userData.collapsing) return;
    board.userData.collapsing = true;
    this.queue.push(board);
    if (this.hooks.onQueueChange) this.hooks.onQueueChange(true);
    this._next();
  }

  _next() {
    if (this.busy) return;
    if (this.queue.length === 0) {
      if (this.hooks.onQueueChange) this.hooks.onQueueChange(false);
      return;
    }
    this.busy = true;
    this.collapsingBoardId = this.queue[0].userData.boardId;
    this._run(this.queue.shift());
  }

  _run(board) {
    const cfg = GameConfig.collapse;
    const baseRot = board.rotation.slice();
    const basePos = board.position.slice();
    const axis = Vec3.normalize([Math.random() - 0.5, Math.random() * 0.6 + 0.3, Math.random() - 0.5]);
    const angle = ((cfg.rotMin + Math.random() * (cfg.rotMax - cfg.rotMin)) * Math.PI) / 180;

    const self = this;

    const tWarn = this.tweens.tween(cfg.warnTime, {
      onUpdate: (v) => {
        board.alpha = 1 - 0.45 * Math.abs(Math.sin(v * Math.PI * 3));
      },
      onComplete: () => {
        if (self.hooks.onWarn) self.hooks.onWarn();
      }
    });
    const tFall = tWarn.then(cfg.fallTime, {
      easing: Easing.quadIn,
      onUpdate: (v) => {
        board.position = [basePos[0], basePos[1] - cfg.fallDist * v, basePos[2]];
        board.rotation = Mat3.multiply(Mat3.fromAxisAngle(axis, angle * v), baseRot);
      },
      onComplete: () => {
        if (self.hooks.onLanding) self.hooks.onLanding(board.userData.boardId);
      }
    });
    tFall.then(0.22, {
      onUpdate: (v) => {
        board.alpha = 1 - v;
      },
      onComplete: () => {
        board.alpha = 1;
        board.removeFromParent();
        self.busy = false;
        self.collapsingBoardId = null;
        if (self.hooks.onBoardGone) self.hooks.onBoardGone(board.userData.boardId);
        if (self.queue.length === 0 && self.hooks.onQueueChange) {
          self.hooks.onQueueChange(false);
        }
        self.tweens.tween(cfg.queueGap, {
          onComplete: () => self._next()
        }).start();
      }
    });
    tWarn.start();
  }
}

module.exports = CollapseManager;
