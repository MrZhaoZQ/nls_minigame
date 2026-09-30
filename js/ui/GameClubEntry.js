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
    if (btn && btn.hide) btn.hide();
  }

  showAt(x, y, w, h) {
    this._ensure();
    if (!this.available) return;
    const hh = Math.round(h || BASE_STYLE.height);
    const st = this.button.style || (this.button.style = {});
    st.left = Math.round(x);
    st.top = Math.round(y);
    st.width = Math.round(w || BASE_STYLE.width);
    st.height = hh;
    st.lineHeight = hh;
    st.borderRadius = Math.round(hh / 2);
    if (this.button.show) this.button.show();
    this.shown = true;
    this._posKey = st.left + ',' + st.top + ',' + st.width;
  }

  hide() {
    if (this.available && this.shown && this.button.hide) {
      this.button.hide();
    }
    this.shown = false;
    this._posKey = '';
  }

  destroy() {
    if (this.available && this.button.destroy) this.button.destroy();
    this.button = null;
    this.available = false;
    this.shown = false;
  }
}

module.exports = GameClubEntry;
