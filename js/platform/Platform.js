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
      let info;
      try {
        info = wx.getSystemInfoSync();
      } catch (e) {
        info = null;
      }
      if (!info || !info.windowWidth) {
        return { width: 375, height: 667, pixelRatio: 1, safeArea: null, platform: 'unknown' };
      }
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

  createWebAudio() {
    if (_mock && _mock.createWebAudio) return _mock.createWebAudio();
    if (hasWx() && wx.createWebAudioContext) {
      try { return wx.createWebAudioContext(); } catch (e) { return null; }
    }
    return null;
  },

  readFileBuffer(path, cb) {
    if (_mock && _mock.readFileBuffer) { _mock.readFileBuffer(path, cb); return; }
    if (hasWx() && wx.getFileSystemManager) {
      try {
        wx.getFileSystemManager().readFile({
          filePath: path,
          success: (res) => cb(null, res.data),
          fail: (e) => cb(e, null)
        });
      } catch (e) { cb(e, null); }
      return;
    }
    if (typeof fetch === 'function') {
      fetch(path)
        .then((r) => r.arrayBuffer())
        .then((b) => cb(null, b))
        .catch((e) => cb(e, null));
      return;
    }
    cb(new Error('readFileBuffer unavailable'), null);
  },

  createInterstitialAd(adUnitId) {
    if (_mock && _mock.createInterstitialAd) return _mock.createInterstitialAd(adUnitId);
    if (hasWx() && adUnitId && wx.createInterstitialAd) {
      try { return wx.createInterstitialAd({ adUnitId }); }
      catch (e) { return null; }
    }
    return null;
  },

  createRewardedVideoAd(adUnitId) {
    if (_mock && _mock.createRewardedVideoAd) return _mock.createRewardedVideoAd(adUnitId);
    if (hasWx() && adUnitId && wx.createRewardedVideoAd) {
      try { return wx.createRewardedVideoAd({ adUnitId }); }
      catch (e) { return null; }
    }
    return null;
  },

  createCustomAd(opts) {
    if (_mock && _mock.createCustomAd) return _mock.createCustomAd(opts);
    if (hasWx() && wx.createCustomAd) {
      try { return wx.createCustomAd(opts); }
      catch (e) { return null; }
    }
    return null;
  },

  vibrateShort() {
    try {
      if (_mock && _mock.vibrateShort) { _mock.vibrateShort(); return; }
      if (hasWx() && wx.vibrateShort) wx.vibrateShort({ type: 'light', fail() {} });
    } catch (e) {
      return;
    }
  },

  setUserCloudStorage(kvList) {
    if (!kvList || kvList.constructor !== Array) return;
    if (_mock) {
      _mock.cloudStorage = (_mock.cloudStorage || []).concat([kvList]);
      return;
    }
    if (hasWx() && wx.setUserCloudStorage) {
      const attempt = (n) => {
        wx.setUserCloudStorage({
          KVDataList: kvList,
          success() {},
          fail(err) {
            if (n > 0) setTimeout(() => attempt(n - 1), 2000);
            else console.warn('[rank] setUserCloudStorage fail:', err && err.errMsg);
          }
        });
      };
      attempt(1);
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
        wx.showShareMenu(Object.assign({ fail() {} },
          opts || { withShareTicket: true, menus: ['shareAppMessage', 'shareTimeline'] }));
      } catch (e) {
        return;
      }
    }
  },

  createGameClubButton(opts) {
    if (_mock) {
      if (_mock.createGameClubButton) return _mock.createGameClubButton(opts);
      const btn = {
        style: opts && opts.style,
        visible: false,
        show() { this.visible = true; },
        hide() { this.visible = false; },
        onTap() {},
        onError() {},
        destroy() {}
      };
      _mock.clubButton = btn;
      return btn;
    }
    if (hasWx() && wx.createGameClubButton) {
      try {
        return wx.createGameClubButton(opts);
      } catch (e) {
        return null;
      }
    }
    return null;
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

  _lifecycle: { bound: false, hideCbs: [], showCbs: [] },

  _bindLifecycleOnce() {
    const L = Platform._lifecycle;
    if (L.bound || _mock || !hasWx()) return;
    L.bound = true;
    if (wx.onHide) {
      wx.onHide(() => {
        const list = L.hideCbs.slice();
        for (let i = 0; i < list.length; i++) { try { list[i](); } catch (e) {} }
      });
    }
    if (wx.onShow) {
      wx.onShow((res) => {
        const list = L.showCbs.slice();
        for (let i = 0; i < list.length; i++) { try { list[i](res); } catch (e) {} }
      });
    }
  },

  onHide(cb) {
    if (_mock) { _mock.hideHandlers.push(cb); return; }
    if (hasWx()) {
      Platform._bindLifecycleOnce();
      Platform._lifecycle.hideCbs.push(cb);
    }
  },
  onShow(cb) {
    if (_mock) { _mock.showHandlers.push(cb); return; }
    if (hasWx()) {
      Platform._bindLifecycleOnce();
      Platform._lifecycle.showCbs.push(cb);
    }
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

  setPreferredFramesPerSecond(fps) {
    if (_mock) { _mock.preferredFps = fps; return; }
    if (hasWx() && wx.setPreferredFramesPerSecond) {
      try {
        wx.setPreferredFramesPerSecond(fps);
      } catch (e) {
        return;
      }
    }
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
    createWebAudio() { return null; },
    readFileBuffer(p, cb) { cb(new Error('mock fs'), null); },
    createRewardedVideoAd() { return null; },
    createCustomAd() { return null; },
    createInterstitialAd() { return null; },
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
