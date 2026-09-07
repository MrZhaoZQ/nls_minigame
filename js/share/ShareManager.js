'use strict';

const Platform = require('../platform/Platform');
const GameConfig = require('../config/GameConfig');
const SaveManager = require('../core/SaveManager');

const TITLES = {
  fail_undo: '我在第{level}关手滑了，快来教我拧螺丝！',
  fail_clear: '第{level}关螺丝太多拆不完，来帮我一把！',
  hint: '第{level}关有颗螺丝藏起来了，你能找到吗？',
  win_double: '我通关了第{level}关！拧螺丝啦，你敢来挑战吗？'
};

function titleFor(placement, level) {
  const tpl = TITLES[placement] || '拧螺丝啦，一起来解压！';
  return tpl.replace('{level}', String(level));
}

class ShareManager {
  constructor(opts) {
    const o = opts || {};
    this.now = o.now || (() => Platform.now());
    this.startedAt = this.now();
    this.lastShareTs = 0;
    this.daily = SaveManager.getDailyShareInfo();
    this.levelId = 1;
    this.levelShows = {};
    this.events = [];
  }

  setLevel(id) {
    this.levelId = id;
    this.levelShows = {};
  }

  canShow(placement) {
    const cfg = GameConfig.share;
    this.daily = SaveManager.getDailyShareInfo();
    const now = this.now();
    if (now - this.lastShareTs < cfg.cooldownMs) return { ok: false, reason: 'cooldown' };
    if (this.daily.count >= cfg.dailyLimit) return { ok: false, reason: 'dailyLimit' };
    if (placement && placement.indexOf('fail') === 0) {
      if ((this.levelShows[placement] || 0) >= cfg.perLevelLimit) {
        return { ok: false, reason: 'perLevel' };
      }
    }
    return { ok: true };
  }

  show(placement, cb) {
    const gate = this.canShow(placement);
    this.events.push({ type: 'request', placement, ok: gate.ok });
    if (!gate.ok) {
      if (cb) cb({ rewarded: false, reason: gate.reason });
      return;
    }

    const self = this;
    Platform.shareAppMessage({
      title: titleFor(placement, this.levelId),
      imageUrl: GameConfig.share.imageUrl,
      imageUrlId: GameConfig.share.imageId,
      query: 'from=share&level=' + this.levelId,
      success() {
        self._grant(placement);
        if (cb) cb({ rewarded: true, via: 'share' });
      },
      fail() {
        if (cb) cb({ rewarded: false, reason: 'cancel' });
      }
    });
  }

  _grant(placement) {
    this.lastShareTs = this.now();
    this.daily = SaveManager.recordShare();
    this.levelShows[placement] = (this.levelShows[placement] || 0) + 1;
    this.events.push({ type: 'rewarded', placement, via: 'share' });
  }
}

module.exports = ShareManager;
module.exports.titleFor = titleFor;
