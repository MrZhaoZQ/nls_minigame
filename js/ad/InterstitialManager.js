'use strict';

const Platform = require('../platform/Platform');
const GameConfig = require('../config/GameConfig');
const SaveManager = require('../core/SaveManager');

class InterstitialManager {
  constructor(opts) {
    const o = opts || {};
    this.unitId = o.unitId != null ? o.unitId : GameConfig.ad.interUnitId;
    this.now = o.now || (() => Platform.now());
    this.adMgr = o.adMgr || null;
    this.ad = null;
    this.lastShowTs = 0;
    this.winsSinceShow = 0;
    this.shownCount = 0;
    this.events = [];
  }

  init() {
    this.ad = Platform.createInterstitialAd(this.unitId);
    if (this.ad && this.ad.onError) {
      this.ad.onError(() => {
        this.events.push({ type: 'error' });
      });
    }
  }

  isMock() {
    return !this.unitId || !this.ad;
  }

  noteWin() {
    this.winsSinceShow++;
  }

  canShow(levelId) {
    const cfg = GameConfig.ad;
    if (this.isMock()) return { ok: false, reason: 'mock' };
    const now = this.now();
    if ((levelId || 0) <= cfg.interProtectedLevels) {
      return { ok: false, reason: 'protected' };
    }
    if (this.winsSinceShow < cfg.interWinGap) {
      return { ok: false, reason: 'winGap' };
    }
    if (now - this.lastShowTs < cfg.interCooldownMs) {
      return { ok: false, reason: 'cooldown' };
    }
    if (SaveManager.getDailyInterInfo().count >= cfg.interDailyLimit) {
      return { ok: false, reason: 'dailyLimit' };
    }
    if (this.adMgr && this.adMgr.lastGrantTs &&
        now - this.adMgr.lastGrantTs < cfg.interAfterRewardedMs) {
      return { ok: false, reason: 'afterRewarded' };
    }
    return { ok: true };
  }

  maybeShow(levelId) {
    const gate = this.canShow(levelId);
    this.events.push({ type: 'request', ok: gate.ok, reason: gate.reason || null });
    if (!gate.ok) return gate;
    this.lastShowTs = this.now();
    this.winsSinceShow = 0;
    this.shownCount++;
    SaveManager.recordInterShow();
    const self = this;
    try {
      const p = this.ad.show();
      if (p && p.catch) {
        p.catch(() => {
          if (self.ad.load) {
            self.ad.load().then(() => self.ad.show()).catch(() => {});
          }
        });
      }
    } catch (e) {
      this.events.push({ type: 'error' });
    }
    return gate;
  }
}

module.exports = InterstitialManager;
