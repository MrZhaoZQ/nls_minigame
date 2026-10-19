'use strict';

const Platform = require('../platform/Platform');

const SFX_LIST = [
  'sfx_screw_out', 'sfx_slot_in', 'sfx_match', 'sfx_match2', 'sfx_match3',
  'sfx_collapse', 'sfx_warn', 'sfx_win', 'sfx_lose'
];

const BGM_ID = 'bgm_main';
const WEB_LIVE_MAX = 12;

class AudioManager {
  constructor() {
    this.pool = {};
    this.unlocked = false;
    this.muted = false;
    this.bgmOn = false;
    this.bgm = null;
    this._bgmAttempts = 0;
    this._bgmDead = false;
    this._failed = {};
    this._wa = null;
    this._webMode = false;
    this._webBgmFailed = false;
    this._buffers = {};
    this._webFailed = {};
    this._liveCount = 0;
    this.bgmBuffer = null;
    this.bgmSource = null;
  }

  _srcPathOf(id) {
    return id === BGM_ID ? 'audio/bgm_main.wav' : 'audio/' + id + '.wav';
  }

  preload() {
    const wa = Platform.createWebAudio ? Platform.createWebAudio() : null;
    if (wa && typeof wa.createBufferSource === 'function' &&
        typeof wa.decodeAudioData === 'function') {
      this._wa = wa;
      this._webMode = true;
      this._preloadWeb();
      return;
    }
    this._initBgm();
  }

  _preloadWeb() {
    const all = [BGM_ID].concat(SFX_LIST);
    let i = 0;
    const next = () => {
      if (i >= all.length) return;
      const id = all[i++];
      this._decodeWeb(id, next);
    };
    next();
  }

  _decodeWeb(id, done) {
    const wa = this._wa;
    let settled = false;
    const succeed = (audioBuf) => {
      if (settled) return;
      settled = true;
      this._onDecoded(id, audioBuf);
      done();
    };
    const fail = () => {
      if (settled) return;
      settled = true;
      this._onDecodeFail(id);
      done();
    };
    Platform.readFileBuffer(this._srcPathOf(id), (err, data) => {
      if (err || !data) { fail(); return; }
      try {
        const p = wa.decodeAudioData(data, succeed, fail);
        if (p && typeof p.then === 'function') {
          p.then((ab) => succeed(ab), () => fail());
        }
      } catch (e) {
        fail();
      }
    });
  }

  _onDecoded(id, audioBuf) {
    if (id === BGM_ID) {
      this.bgmBuffer = audioBuf;
      if (this.bgmOn && !this.muted && !this.bgmSource) this._playBgmWeb();
    } else {
      this._buffers[id] = audioBuf;
    }
  }

  _onDecodeFail(id) {
    if (id === BGM_ID) {
      this._webBgmFailed = true;
      this._initBgm();
    } else {
      this._webFailed[id] = true;
    }
  }

  _ensureSfx(id) {
    let ctx = this.pool[id];
    if (ctx || this._failed[id]) return ctx || null;
    ctx = Platform.createAudio('audio/' + id + '.wav');
    if (!ctx) { this._failed[id] = true; return null; }
    this.pool[id] = ctx;
    return ctx;
  }

  _initBgm() {
    if (this._bgmDead) return;
    const bgm = Platform.createAudio('audio/bgm_main.wav');
    if (!bgm) return;
    bgm.loop = true;
    bgm.volume = 0.35;
    this.bgm = bgm;
    if (bgm.onCanplay) {
      bgm.onCanplay(() => {
        if (this.bgmOn && !this.muted && this.bgm === bgm) this._safePlay(bgm);
      });
    }
    if (bgm.onError) {
      bgm.onError(() => {
        if (this.bgm !== bgm || !this.bgmOn) return;
        this._bgmAttempts++;
        if (this._bgmAttempts >= 3) {
          this.bgmOn = false;
          this._bgmDead = true;
          return;
        }
        if (bgm.destroy) { try { bgm.destroy(); } catch (e) {} }
        this.bgm = null;
        this._initBgm();
        if (this.bgm) this._safePlay(this.bgm);
      });
    }
  }

  _safePlay(ctx) {
    try {
      const p = ctx.play();
      if (p && p.catch) p.catch(() => {});
    } catch (e) {}
  }

  _playWeb(id, opts) {
    const buf = this._buffers[id];
    if (!buf || this._webFailed[id]) return false;
    if (this._liveCount >= WEB_LIVE_MAX) return true;
    const self = this;
    let counted = false;
    try {
      const src = this._wa.createBufferSource();
      src.buffer = buf;
      this._liveCount++;
      counted = true;
      const fin = () => { self._liveCount--; };
      if ('onended' in src) src.onended = fin;
      else if (src.addEventListener) src.addEventListener('ended', fin);
      if (this._wa.createGain) {
        const gain = this._wa.createGain();
        gain.gain.value = (opts && opts.volume != null) ? opts.volume : 1;
        src.connect(gain);
        gain.connect(this._wa.destination);
      } else {
        src.connect(this._wa.destination);
      }
      src.start(0);
      return true;
    } catch (e) {
      if (counted) this._liveCount--;
      return false;
    }
  }

  _playBgmWeb() {
    if (!this.bgmBuffer || this.bgmSource) return;
    this._resumeWeb();
    const self = this;
    try {
      const src = this._wa.createBufferSource();
      src.buffer = this.bgmBuffer;
      src.loop = true;
      if ('onended' in src) {
        src.onended = function () {
          if (self.bgmSource === src) self.bgmSource = null;
          if (src._gain) { try { src._gain.disconnect(); } catch (e) {} src._gain = null; }
        };
      }
      if (this._wa.createGain) {
        src._gain = this._wa.createGain();
        src._gain.gain.value = 0.35;
        src.connect(src._gain);
        src._gain.connect(this._wa.destination);
      } else {
        src.connect(this._wa.destination);
      }
      src.start(0);
      this.bgmSource = src;
    } catch (e) {
      this.bgmBuffer = null;
      this._webBgmFailed = true;
      this._initBgm();
      if (this.bgm && this.bgmOn) this._safePlay(this.bgm);
    }
  }

  // 激励视频播放期间微信会回收音频会话并挂起 WebAudioContext（广告 SDK 走异常路径时
  // onShow 恢复链可能缺失/过早），任何播放入口与广告结算回调都必须先尝试恢复。
  // resume 对 running 状态是幂等的，直接无条件调用，不依赖 state 字段的实现差异。
  _resumeWeb() {
    if (!this._webMode || !this._wa || !this._wa.resume) return;
    // state 可用且已 running 走快路径；无 state 字段（老实现/mock）则保守地总是 resume
    if (this._wa.state === 'running') return;
    try {
      const p = this._wa.resume();
      if (p && p.catch) p.catch(() => {});
    } catch (e) {}
  }

  _stopBgmWeb() {
    const src = this.bgmSource;
    if (!src) return;
    this.bgmSource = null;
    try {
      if (src.onended) src.onended();
      src.stop(0);
    } catch (e) {}
  }

  play(id, opts) {
    if (!this.unlocked || this.muted) return;
    if (this._webMode) {
      this._resumeWeb();
      if (this._playWeb(id, opts)) return;
    }
    const ctx = this._ensureSfx(id);
    if (!ctx) return;
    try {
      if (opts && opts.volume != null) ctx.volume = opts.volume;
      if (ctx.stop) ctx.stop();
      if (ctx.seek) ctx.seek(0);
      ctx.startTime = 0;
      ctx.play();
    } catch (e) {
      this._failed[id] = true;
    }
  }

  playMatch(combo) {
    if (combo >= 3) this.play('sfx_match3');
    else if (combo === 2) this.play('sfx_match2');
    else this.play('sfx_match');
  }

  unlock() {
    if (this.unlocked) return;
    this.unlocked = true;
    this._resumeWeb();
    this.playBgm();
  }

  playBgm() {
    if (this.bgmOn || this.muted || this._bgmDead) return;
    if (this._webMode && !this._webBgmFailed) {
      this.bgmOn = true;
      this._resumeWeb();  // context 被广告挂起时，恢复原有 source 播放即可
      if (this.bgmBuffer) this._playBgmWeb();
      return;
    }
    if (!this.bgm) return;
    this.bgmOn = true;
    this._safePlay(this.bgm);
  }

  stopBgm() {
    this.bgmOn = false;
    if (this.bgmSource) this._stopBgmWeb();
    if (this.bgm && this.bgm.pause) {
      try { this.bgm.pause(); } catch (e) {}
    }
  }

  ensureBgm() {
    if (!this.bgmOn || this.muted) return;
    if (this._webMode && !this._webBgmFailed) {
      this._resumeWeb();  // source 还挂着但 context 被广告挂起时，resume 即恢复
      if (this.bgmBuffer && !this.bgmSource) this._playBgmWeb();
      return;
    }
    if (!this._bgmDead && this.bgm) this._safePlay(this.bgm);
  }

  webResume() {
    this._resumeWeb();
    this.ensureBgm();
  }

  setMuted(m) {
    this.muted = m;
    if (m) this.stopBgm();
    else this.playBgm();
  }

  bindGameEvents(bus) {
    const Events = require('../core/EventBus').Events;
    bus.on(Events.SCREW_COLLECTED, () => this.play('sfx_screw_out'));
    bus.on(Events.SLOT_UPDATED, (d) => {
      if (d.arrivedIndex >= 0) this.play('sfx_slot_in');
    });
    bus.on(Events.MATCH_MADE, (d) => this.playMatch((d && d.combo) || 1));
    bus.on(Events.BOARD_COLLAPSED, () => this.play('sfx_collapse'));
    bus.on(Events.SLOT_FULL_WARNING, () => this.play('sfx_warn'));
    bus.on(Events.LEVEL_WIN, () => this.play('sfx_win'));
    bus.on(Events.LEVEL_LOSE, () => this.play('sfx_lose'));
  }
}

module.exports = AudioManager;
