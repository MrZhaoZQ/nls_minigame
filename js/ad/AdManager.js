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
    this.daily = SaveManager.getDailyAdInfo();
    this.lastShowTs = this.daily.lastShowTs || 0;
    this.levelId = 1;
    this.levelShows = {};
    this.lastGrantTs = 0;
    this._shownOnce = false;
    this.events = [];
  }

  init() {
    this.ad = Platform.createRewardedVideoAd(this.unitId);
    if (this.ad) {
      this.ad.onClose((res) => this._onClose(res));
      if (this.ad.onError) this.ad.onError((err) => this._onError(err));
    }
  }

  _pushEvent(e) {
    this.events.push(e);
    if (this.events.length > 64) this.events.splice(0, this.events.length - 64);
  }

  isMock() {
    return !this.unitId || !this.ad;
  }

  setLevel(id) {
    this.levelId = id;
    this.levelShows = {};
  }

  // 激励视频全部为用户主动触发的奖励点：不设冷却/日限/每关限次（产品决策 2026-10）。
  // 并发防重入由 show() 的 pending 守卫负责；_grant 仍做计数仅作埋点，不参与闸门。
  // 保留方法与签名，供 rewardProvider 双模式接口与结算/失败面板按钮预检调用。
  canShow() {
    this.daily = SaveManager.getDailyAdInfo();
    return { ok: true };
  }

  show(placement, cb) {
    const gate = this.canShow(placement);
    this._pushEvent({ type: 'request', placement, ok: gate.ok });
    if (!gate.ok) {
      if (cb) cb({ rewarded: false, reason: gate.reason });
      return;
    }
    if (this.pending) {
      if (cb) cb({ rewarded: false, reason: 'busy' });
      return;
    }

    if (this.isMock()) {
      this._grant(placement);
      if (cb) cb({ rewarded: true, mock: true });
      return;
    }

    this.pending = { placement, cb };
    this._shownOnce = false;
    const ad = this.ad;
    const self = this;
    ad.show().then(() => { self._shownOnce = true; }).catch(() => {
      ad.load().then(() => ad.show().then(() => { self._shownOnce = true; })).catch((e) => {
        self._onError(e);
      });
    });
  }

  _grant(placement) {
    const now = this.now();
    this.lastShowTs = now;
    this.lastGrantTs = now;
    this.daily = SaveManager.recordAdShow();
    this.levelShows[placement] = (this.levelShows[placement] || 0) + 1;
    this._pushEvent({ type: 'rewarded', placement });
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
    // 广告已成功拉起后的中途报错（网络抖动等）不清 pending：
    // 视频仍可能播放完毕走 onClose 结算，提前判死会吞掉用户看完的奖励
    if (this._shownOnce) {
      this._pushEvent({ type: 'error-during-show' });
      return;
    }
    const p = this.pending;
    this.pending = null;
    if (p && p.cb) p.cb({ rewarded: false, reason: 'error' });
  }
}

module.exports = AdManager;
