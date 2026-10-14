'use strict';

const Platform = require('../platform/Platform');
const GameConfig = require('../config/GameConfig');
const SaveManager = require('../core/SaveManager');

class InterstitialManager {
  constructor(opts) {
    const o = opts || {};
    this.unitId = o.unitId != null ? o.unitId : GameConfig.ad.interUnitId;
    this.now = o.now || (() => Platform.now());
    this.ad = null;
    this.lastShowTs = SaveManager.getDailyInterInfo().lastShowTs || 0;
    this.winsSinceShow = 0;
    this.shownCount = 0;
    this.events = [];
  }

  init() {
    this.ad = Platform.createInterstitialAd(this.unitId);
    if (this.ad && this.ad.onError) {
      this.ad.onError(() => {
        this._pushEvent({ type: 'error' });
      });
    }
  }

  _pushEvent(e) {
    this.events.push(e);
    if (this.events.length > 64) this.events.splice(0, this.events.length - 64);
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
    return { ok: true };
  }

  maybeShow(levelId) {
    const gate = this.canShow(levelId);
    this._pushEvent({ type: 'request', ok: gate.ok, reason: gate.reason || null });
    if (!gate.ok) return gate;
    const self = this;
    const ts = this.now();
    try {
      const p = this.ad.show();
      if (p && typeof p.then === 'function') {
        p.then(
          () => self._commit(ts),
          () => self._onShowFail()
        );
      } else {
        this._commit(ts);
      }
    } catch (e) {
      this._onShowFail();
    }
    return gate;
  }

  _onShowFail() {
    this._pushEvent({ type: 'showFail' });
    try {
      const lp = this.ad.load && this.ad.load();
      if (lp && typeof lp.catch === 'function') lp.catch(() => {});
    } catch (e) {}
  }

  _commit(shownAt) {
    this.lastShowTs = shownAt;
    this.winsSinceShow = 0;
    this.shownCount++;
    SaveManager.recordInterShow();
    this._pushEvent({ type: 'shown' });
  }
}

module.exports = InterstitialManager;
