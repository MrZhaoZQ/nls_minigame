'use strict';

const Platform = require('../platform/Platform');
const GameConfig = require('../config/GameConfig');
const SaveManager = require('../core/SaveManager');

class AdManager {
  constructor(opts) {
    const o = opts || {};
    this.unitId = o.unitId != null ? o.unitId : GameConfig.ad.unitId;
    this.now = o.now || (() => Platform.now());
    this.ad = null;
    this.pending = null;
    this.startedAt = this.now();
    this.daily = SaveManager.getDailyAdInfo();
    this.lastShowTs = this.daily.lastShowTs || 0;
    this.levelId = 1;
    this.levelShows = {};
    this.onErrorCount = 0;
    this.events = [];
  }

  init() {
    this.ad = Platform.createRewardedVideoAd(this.unitId);
    if (this.ad) {
      this.ad.onClose((res) => this._onClose(res));
      if (this.ad.onError) this.ad.onError((err) => this._onError(err));
      if (this.ad.load) {
        try { this.ad.load(); } catch (e) { return; }
      }
    }
  }

  isMock() {
    return !this.unitId || !this.ad;
  }

  setLevel(id) {
    this.levelId = id;
    this.levelShows = {};
  }

  canShow(placement) {
    const cfg = GameConfig.ad;
    this.daily = SaveManager.getDailyAdInfo();
    const now = this.now();
    if (now - this.startedAt < cfg.coldStartMs) return { ok: false, reason: 'coldStart' };
    if (now - this.lastShowTs < cfg.cooldownMs) return { ok: false, reason: 'cooldown' };
    if (this.daily.count >= cfg.dailyLimit) return { ok: false, reason: 'dailyLimit' };
    if (placement && placement.indexOf('fail') === 0) {
      const used = this.levelShows[placement] || 0;
      if (used >= cfg.perLevelLimit) return { ok: false, reason: 'perLevel' };
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

    if (this.isMock()) {
      this._grant(placement);
      if (cb) cb({ rewarded: true, mock: true });
      return;
    }

    this.pending = { placement, cb };
    const ad = this.ad;
    ad.show().catch(() => {
      ad.load().then(() => ad.show()).catch((e) => {
        this._onError(e);
      });
    });
  }

  _grant(placement) {
    const now = this.now();
    this.lastShowTs = now;
    this.daily = SaveManager.recordAdShow();
    this.levelShows[placement] = (this.levelShows[placement] || 0) + 1;
    this.events.push({ type: 'rewarded', placement });
  }

  _onClose(res) {
    const p = this.pending;
    this.pending = null;
    if (!p) return;
    if (res && res.isEnded) {
      this._grant(p.placement);
      if (p.cb) p.cb({ rewarded: true });
    } else {
      if (p.cb) p.cb({ rewarded: false, reason: 'skipped' });
    }
  }

  _onError(err) {
    this.onErrorCount++;
    const p = this.pending;
    this.pending = null;
    if (p && p.cb) p.cb({ rewarded: false, reason: 'error' });
  }
}

module.exports = AdManager;
