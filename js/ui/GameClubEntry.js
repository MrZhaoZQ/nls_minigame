'use strict';

const Platform = require('../platform/Platform');

const BASE_STYLE = {
  left: 0,
  top: 0,
  width: 100,
  height: 36,
  lineHeight: 36,
  backgroundColor: '#ff9500',
  color: '#ffffff',
  fontSize: 15,
  borderRadius: 18,
  textAlign: 'center'
};

class GameClubEntry {
  constructor(opts) {
    const o = opts || {};
    this.platform = o.platform || Platform;
    this.text = o.text || '游戏圈';
    this.button = null;
    this.available = false;
    this.shown = false;
    this._posKey = '';
  }

  _ensure() {
    if (this.button !== null) return;
    if (!this.platform.createGameClubButton) {
      this.button = false;
      return;
    }
    const btn = this.platform.createGameClubButton({
      type: 'text',
      text: this.text,
      style: Object.assign({}, BASE_STYLE)
    });
    this.button = btn || false;
    this.available = !!btn;
    if (btn && btn.hide) {
      try { btn.hide(); } catch (e) { this.available = false; }
    }
  }

  _key(x, y, w, hh) {
    return Math.round(x) + ',' + Math.round(y) + ',' + Math.round(w) + ',' + Math.round(hh);
  }

  showAt(x, y, w, h) {
    this._ensure();
    if (!this.available) return;
    const hh = Math.round(h || BASE_STYLE.height);
    const key = this._key(x, y, w || BASE_STYLE.width, hh);
    if (this.shown && key === this._posKey) return;
    const st = this.button.style || (this.button.style = {});
    st.left = Math.round(x);
    st.top = Math.round(y);
    st.width = Math.round(w || BASE_STYLE.width);
    st.height = hh;
    st.lineHeight = hh;
    st.borderRadius = Math.round(hh / 2);
    if (!this.shown && this.button.show) {
      try { this.button.show(); } catch (e) { this.available = false; return; }
    }
    this.shown = true;
    this._posKey = key;
  }

  hide() {
    if (this.available && this.shown && this.button.hide) {
      try { this.button.hide(); } catch (e) {}
    }
    this.shown = false;
    this._posKey = '';
  }

  destroy() {
    const btn = this.button;
    // 置 false（而非 null）作为终态：_ensure 的 `!== null` 守卫会阻止销毁后再创建；
    // 且即使此前 show/hide 抛错把 available 置 false，也要无条件尝试销毁原生按钮防泄漏
    this.button = false;
    this.available = false;
    this.shown = false;
    if (btn && btn.destroy) {
      try { btn.destroy(); } catch (e) {}
    }
  }
}

module.exports = GameClubEntry;
