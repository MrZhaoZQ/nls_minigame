'use strict';

const Platform = require('../platform/Platform');
const GameConfig = require('../config/GameConfig');

class TemplateAdManager {
  constructor(opts) {
    const o = opts || {};
    this.unitId = o.unitId != null ? o.unitId : GameConfig.ad.templateUnitId;
    this.screen = o.screen || { width: 375, height: 667 };
    this.bottomInset = o.bottomInset || 0;
    this.ad = null;
    this.active = false;
    this.realHeight = 0;
    this.tried = false;
    this.events = [];
    this._showing = false;
  }

  _warn() {
    if (Platform.env() === 'wechat') {
      const args = Array.prototype.slice.call(arguments);
      args.unshift('[templateAd]');
      console.warn.apply(console, args);
    }
  }

  init() {
    this._create();
  }

  _create() {
    if (this.tried) return;
    this.tried = true;
    if (!this.unitId) return;
    try {
      this.ad = Platform.createCustomAd({
        adUnitId: this.unitId,
        adIntervals: GameConfig.ad.templateAdIntervals,
        style: this._style()
      });
    } catch (e) {
      this._warn('create threw', e);
      this.ad = null;
      return;
    }
    if (!this.ad) {
      this._warn('create unavailable');
      return;
    }
    const self = this;
    if (this.ad.onError) {
      this.ad.onError((err) => {
        self.events.push({ type: 'error', code: err && err.errCode });
        self._warn('error', err && err.errCode, err && err.errMsg);
        if (self._isShown()) self._hide();
      });
    }
    if (this.ad.onLoad) {
      this.ad.onLoad(() => {
        self._reposition();
        if (self.active) self._show();
      });
    }
    if (this.ad.onResize) {
      this.ad.onResize((res) => {
        if (res && res.height) self.realHeight = res.height;
        self._reposition();
      });
    }
  }

  isMock() {
    return !this.unitId || !this.ad;
  }

  layout(screen, bottomInset) {
    if (screen) this.screen = screen;
    if (bottomInset != null) this.bottomInset = bottomInset;
    this._reposition();
  }

  estimatedHeight() {
    const margin = GameConfig.ad.templateMargin;
    const ratio = GameConfig.ad.templateRatio;
    return Math.round((this.screen.width - margin * 2) * ratio[1] / ratio[0]);
  }

  _top() {
    const styleH = this.ad && this.ad.style && this.ad.style.height;
    const h = this.realHeight || styleH || this.estimatedHeight();
    return this.screen.height - this.bottomInset - h - GameConfig.ad.templateMargin;
  }

  _style() {
    return { left: 0, top: this._top() };
  }

  _reposition() {
    if (!this.ad || !this.ad.style) return;
    try {
      this.ad.style.left = 0;
      this.ad.style.top = this._top();
    } catch (e) {}
  }

  _isShown() {
    try {
      const v = this.ad.isShow;
      return typeof v === 'function' ? !!v.call(this.ad) : !!v;
    } catch (e) {
      return false;
    }
  }

  _hide() {
    this._showing = false;
    try {
      const p = this.ad.hide();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    } catch (e) {}
  }

  _show() {
    if (this._isShown() || this._showing) return;
    const self = this;
    this._showing = true;
    try {
      const p = this.ad.show();
      if (p && typeof p.then === 'function') {
        p.then(
          () => { self._showing = false; },
          (e) => {
            self._showing = false;
            self._warn('show rejected', (e && e.errMsg) || e);
          }
        );
      } else {
        this._showing = false;
      }
      this.events.push({ type: 'show' });
    } catch (e) {
      this._showing = false;
      this._warn('show threw', e);
    }
  }

  setActive(on) {
    if (on) this._create();
    if (this.isMock()) return false;
    if (on === this.active) return false;
    this.active = on;
    if (on) {
      this._reposition();
      this._show();
    } else {
      this._hide();
    }
    return true;
  }
}

module.exports = TemplateAdManager;
