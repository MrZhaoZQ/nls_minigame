'use strict';

let _mock = null;

function hasWx() {
  return typeof wx !== 'undefined' && wx !== null;
}

const Platform = {
  inject(mock) {
    _mock = mock;
  },

  isWechat() {
    return hasWx();
  },

  env() {
    if (_mock) return _mock.env || 'mock';
    if (hasWx()) return 'wechat';
    if (typeof window !== 'undefined') return 'browser';
    return 'node';
  },

  createCanvas() {
    if (_mock && _mock.createCanvas) return _mock.createCanvas();
    if (hasWx()) return wx.createCanvas();
    if (typeof document !== 'undefined') {
      const c = document.getElementById('game-canvas');
      if (c) return c;
      const n = document.createElement('canvas');
      n.id = 'game-canvas';
      document.body.appendChild(n);
      return n;
    }
    return null;
  },

  getSystemInfo() {
    if (_mock && _mock.getSystemInfo) return _mock.getSystemInfo();
    if (hasWx()) {
      const info = wx.getSystemInfoSync();
      return {
        width: info.windowWidth,
        height: info.windowHeight,
        pixelRatio: info.pixelRatio || 1,
        safeArea: info.safeArea || null,
        platform: info.platform || 'unknown'
      };
    }
    if (typeof window !== 'undefined') {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
        pixelRatio: window.devicePixelRatio || 1,
        safeArea: null,
        platform: 'browser'
      };
    }
    return { width: 375, height: 667, pixelRatio: 1, safeArea: null, platform: 'test' };
  },

  storage: {
    get(key) {
      try {
        if (_mock && _mock.storage) return _mock.storage[key];
        if (hasWx()) return wx.getStorageSync(key);
        if (typeof localStorage !== 'undefined') return localStorage.getItem(key);
      } catch (e) {
        return '';
      }
      return '';
    },
    set(key, value) {
      try {
        if (_mock && _mock.storage) { _mock.storage[key] = value; return; }
        if (hasWx()) { wx.setStorageSync(key, value); return; }
        if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
      } catch (e) {
        return;
      }
    }
  },

  onTouchStart(cb) {
    if (_mock) { _mock.touchHandlers.start.push(cb); return; }
    if (hasWx()) wx.onTouchStart(cb);
  },
  onTouchMove(cb) {
    if (_mock) { _mock.touchHandlers.move.push(cb); return; }
    if (hasWx()) wx.onTouchMove(cb);
  },
  onTouchEnd(cb) {
    if (_mock) { _mock.touchHandlers.end.push(cb); return; }
    if (hasWx()) wx.onTouchEnd(cb);
  },
  onTouchCancel(cb) {
    if (_mock) { _mock.touchHandlers.cancel.push(cb); return; }
    if (hasWx()) wx.onTouchCancel(cb);
  },

  createAudio(src) {
    if (_mock && _mock.createAudio) return _mock.createAudio(src);
    if (hasWx()) {
      const a = wx.createInnerAudioContext();
      a.src = src;
      return a;
    }
    if (typeof Audio !== 'undefined') return new Audio(src);
    return { src, play() {}, stop() {}, destroy() {}, set volume(v) {}, get volume() { return 0; } };
  },

  createRewardedVideoAd(adUnitId) {
    if (_mock && _mock.createRewardedVideoAd) return _mock.createRewardedVideoAd(adUnitId);
    if (hasWx() && adUnitId && wx.createRewardedVideoAd) {
      return wx.createRewardedVideoAd({ adUnitId });
    }
    return null;
  },

  vibrateShort() {
    try {
      if (_mock && _mock.vibrateShort) { _mock.vibrateShort(); return; }
      if (hasWx() && wx.vibrateShort) wx.vibrateShort({ type: 'light' });
    } catch (e) {
      return;
    }
  },

  onShareAppMessage(cb) {
    if (_mock) { _mock.shareHandlers.push(cb); return; }
    if (hasWx() && wx.onShareAppMessage) wx.onShareAppMessage(cb);
  },

  onShareTimeline(cb) {
    if (_mock) { _mock.timelineHandlers.push(cb); return; }
    if (hasWx() && wx.onShareTimeline) wx.onShareTimeline(cb);
  },

  showShareMenu(opts) {
    if (_mock) {
      if (_mock.showShareMenu) _mock.showShareMenu(opts);
      else _mock.shareMenuShown = true;
      return;
    }
    if (hasWx() && wx.showShareMenu) {
      try {
        wx.showShareMenu(opts || { withShareTicket: true, menus: ['shareAppMessage', 'shareTimeline'] });
      } catch (e) {
        return;
      }
    }
  },

  getLaunchOptions() {
    if (_mock && _mock.getLaunchOptions) return _mock.getLaunchOptions();
    if (_mock) return {};
    if (hasWx() && wx.getLaunchOptionsSync) {
      try {
        return wx.getLaunchOptionsSync() || {};
      } catch (e) {
        return {};
      }
    }
    return {};
  },

  onWindowResize(cb) {
    if (_mock) { _mock.resizeHandlers.push(cb); return; }
    if (hasWx() && wx.onWindowResize) wx.onWindowResize(cb);
    else if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('resize', () => cb());
    }
  },

  onHide(cb) {
    if (_mock) { _mock.hideHandlers.push(cb); return; }
    if (hasWx()) wx.onHide(cb);
  },
  onShow(cb) {
    if (_mock) { _mock.showHandlers.push(cb); return; }
    if (hasWx()) wx.onShow(cb);
  },

  reportEvent(name, params) {
    if (_mock && _mock.reportEvent) { _mock.reportEvent(name, params); return; }
    if (hasWx() && wx.reportEvent) {
      try { wx.reportEvent(name, params || {}); } catch (e) { return; }
    }
  },

  now() {
    if (_mock && typeof _mock.now === 'function') return _mock.now();
    return Date.now();
  },

  showModal(opts) {
    if (_mock && _mock.showModal) return _mock.showModal(opts);
    if (_mock) {
      if (opts && opts.success) opts.success({ confirm: true, cancel: false, errMsg: 'showModal:ok(mock)' });
      return;
    }
    if (hasWx() && wx.showModal) return wx.showModal(opts);
    if (opts && opts.fail) opts.fail({ errMsg: 'showModal:fail(noplatform)' });
  },

  shareAppMessage(opts) {
    if (_mock && _mock.shareAppMessage) return _mock.shareAppMessage(opts);
    if (_mock) {
      if (opts && opts.success) opts.success({ errMsg: 'shareAppMessage:ok(mock)' });
      return;
    }
    if (hasWx() && wx.shareAppMessage) return wx.shareAppMessage(opts);
    if (opts && opts.fail) opts.fail({ errMsg: 'shareAppMessage:fail(noplatform)' });
  },

  getMenuButtonBoundingClientRect() {
    if (_mock && _mock.getMenuButtonBoundingClientRect) return _mock.getMenuButtonBoundingClientRect();
    if (hasWx() && wx.getMenuButtonBoundingClientRect) {
      try {
        const r = wx.getMenuButtonBoundingClientRect();
        if (r && r.width) return r;
      } catch (e) {
        return null;
      }
      return null;
    }
    return null;
  },

  raf(cb) {
    if (_mock && _mock.raf) return _mock.raf(cb);
    if (typeof requestAnimationFrame !== 'undefined') return requestAnimationFrame(cb);
    if (hasWx() && wx.requestAnimationFrame) return wx.requestAnimationFrame(cb);
    return setTimeout(() => cb(Platform.now()), 16);
  }
};

function createMockPlatform(overrides) {
  const mock = Object.assign({
    env: 'mock',
    storage: {},
    touchHandlers: { start: [], move: [], end: [], cancel: [] },
    hideHandlers: [],
    showHandlers: [],
    shareHandlers: [],
    timelineHandlers: [],
    resizeHandlers: [],
    reports: [],
    vibrations: 0,
    getSystemInfo() {
      return { width: 375, height: 667, pixelRatio: 1, safeArea: null, platform: 'test' };
    },
    createCanvas() { return null; },
    createAudio() {
      return { src: '', play() {}, stop() {}, destroy() {}, volume: 0 };
    },
    createRewardedVideoAd() { return null; },
    vibrateShort() { mock.vibrations++; },
    reportEvent(name, params) { mock.reports.push({ name, params }); },
    showModal(opts) {
      if (opts && opts.success) opts.success({ confirm: true, cancel: false, errMsg: 'showModal:ok(mock)' });
    }
  }, overrides || {});
  return mock;
}

module.exports = Platform;
module.exports.createMockPlatform = createMockPlatform;
