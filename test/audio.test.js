'use strict';

const fs = require('fs');
const path = require('path');
const { assert, section, test } = require('./harness');

const AUDIO_DIR = path.join(__dirname, '..', 'audio');
const REQUIRED = [
  'sfx_screw_out.wav',
  'sfx_slot_in.wav',
  'sfx_match.wav',
  'sfx_match2.wav',
  'sfx_match3.wav',
  'sfx_collapse.wav',
  'sfx_warn.wav',
  'sfx_win.wav',
  'sfx_lose.wav',
  'bgm_main.wav'
];
const BUDGET_OVERRIDES = { 'bgm_main.wav': 600 * 1024 };

section('Audio assets');

test('all 10 audio files exist', () => {
  for (let i = 0; i < REQUIRED.length; i++) {
    const p = path.join(AUDIO_DIR, REQUIRED[i]);
    assert(fs.existsSync(p), 'missing ' + REQUIRED[i]);
  }
});

test('each sfx under 100KB', () => {
  for (let i = 0; i < REQUIRED.length; i++) {
    const p = path.join(AUDIO_DIR, REQUIRED[i]);
    const st = fs.statSync(p);
    assert(st.size > 0, REQUIRED[i] + ' empty');
    const budget = BUDGET_OVERRIDES[REQUIRED[i]] || 100 * 1024;
    assert(st.size < budget, REQUIRED[i] + ' too big: ' + st.size);
  }
});

test('wav headers valid (RIFF, mono, 22050Hz)', () => {
  for (let i = 0; i < REQUIRED.length; i++) {
    const p = path.join(AUDIO_DIR, REQUIRED[i]);
    const buf = fs.readFileSync(p);
    assert(buf.toString('ascii', 0, 4) === 'RIFF', REQUIRED[i] + ' not RIFF');
    assert(buf.toString('ascii', 8, 12) === 'WAVE', REQUIRED[i] + ' not WAVE');
    const channels = buf.readUInt16LE(22);
    const rate = buf.readUInt32LE(24);
    assert(channels === 1, REQUIRED[i] + ' not mono');
    assert(rate === 22050, REQUIRED[i] + ' wrong rate ' + rate);
  }
});

section('AudioManager bgm resilience');

const Platform = require('../js/platform/Platform');
const AudioManager = require('../js/audio/AudioManager');

function fakeAudioFactory(created) {
  return function (src) {
    const c = {
      src: src, loop: false, volume: 1, plays: 0, pauses: 0,
      playing: false, destroyed: false, _err: [], _can: [],
      play() { this.playing = true; this.plays++; },
      pause() { this.playing = false; this.pauses++; },
      stop() { this.playing = false; },
      destroy() { this.destroyed = true; },
      onError(cb) { this._err.push(cb); },
      onCanplay(cb) { this._can.push(cb); }
    };
    created.push(c);
    return c;
  };
}

test('bgm retried via recreate on error, gated by canplay', () => {
  const created = [];
  Platform.inject(Platform.createMockPlatform({ createAudio: fakeAudioFactory(created) }));
  const am = new AudioManager();
  am.preload();
  const bgm1 = am.bgm;
  assert(bgm1, 'bgm context created');
  assert(bgm1.loop === true, 'bgm loops');

  am.unlock();
  assert(am.bgmOn, 'bgm requested on unlock');
  assert(bgm1.plays >= 1, 'first play attempted');

  bgm1._err.forEach(cb => cb({ errCode: 10002 }));
  assert(am.bgm !== bgm1, 'context recreated after decode error');
  assert(bgm1.destroyed, 'broken context destroyed');
  const bgm2 = am.bgm;
  assert(bgm2.plays >= 1, 'replay attempted on recreated context');

  bgm2.plays = 0;
  bgm2._can.forEach(cb => cb());
  assert(bgm2.plays >= 1, 'canplay re-triggers play while requested');

  bgm2._err.forEach(cb => cb({}));
  const bgm3 = am.bgm;
  assert(am.bgm !== bgm2, 'second error recreates again');
  bgm3._err.forEach(cb => cb({}));
  assert(am.bgmOn === false, 'gives up after attempt limit');
  assert(am.bgm === bgm3, 'no further recreate after limit');

  Platform.inject(null);
});

test('mute stops bgm, unmute resumes, ensureBgm replays', () => {
  const created = [];
  Platform.inject(Platform.createMockPlatform({ createAudio: fakeAudioFactory(created) }));
  const am = new AudioManager();
  am.preload();
  am.unlock();
  const bgm = am.bgm;
  am.setMuted(true);
  assert(am.bgmOn === false, 'mute stops bgm');
  assert(bgm.pauses >= 1, 'bgm paused');
  const playsAfterMute = bgm.plays;
  am.ensureBgm();
  assert(bgm.plays === playsAfterMute, 'ensureBgm silent while muted');
  am.setMuted(false);
  assert(am.bgmOn === true, 'unmute resumes bgm');
  const before = bgm.plays;
  am.ensureBgm();
  assert(bgm.plays > before, 'ensureBgm replays after background');
  Platform.inject(null);
});
