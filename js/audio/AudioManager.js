'use strict';

const Platform = require('../platform/Platform');

const SFX_LIST = [
  'sfx_screw_out', 'sfx_slot_in', 'sfx_match', 'sfx_match2', 'sfx_match3',
  'sfx_collapse', 'sfx_warn', 'sfx_win', 'sfx_lose'
];

class AudioManager {
  constructor() {
    this.pool = {};
    this.unlocked = false;
    this.muted = false;
    this.bgmOn = false;
    this._failed = {};
  }

  preload() {
    for (let i = 0; i < SFX_LIST.length; i++) {
      const id = SFX_LIST[i];
      const ctx = Platform.createAudio('audio/' + id + '.wav');
      if (ctx) this.pool[id] = ctx;
    }
    const bgm = Platform.createAudio('audio/bgm_main.wav');
    if (bgm) {
      bgm.loop = true;
      bgm.volume = 0.35;
      this.bgm = bgm;
    }
  }

  unlock() {
    if (this.unlocked) return;
    this.unlocked = true;
    this.playBgm();
  }

  play(id, opts) {
    if (!this.unlocked || this.muted) return;
    const ctx = this.pool[id];
    if (!ctx || this._failed[id]) return;
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

  playBgm() {
    if (this.bgmOn || this.muted || !this.bgm) return;
    this.bgmOn = true;
    try {
      this.bgm.play();
    } catch (e) {
      return;
    }
  }

  stopBgm() {
    this.bgmOn = false;
    if (this.bgm && this.bgm.pause) {
      try { this.bgm.pause(); } catch (e) { return; }
    }
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
