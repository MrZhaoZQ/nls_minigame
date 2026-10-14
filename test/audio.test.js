'use strict';

const fs = require('fs');
const path = require('path');
const { assert, assertEq, section, test } = require('./harness');

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

section('AudioManager pooling & leak guards');

test('sfx contexts are created lazily and reused', () => {
  const created = [];
  Platform.inject(Platform.createMockPlatform({ createAudio: fakeAudioFactory(created) }));
  const am = new AudioManager();
  am.preload();
  assertEq(created.length, 1, 'only bgm exists at startup (no 9 pre-created sfx listeners)');
  am.unlocked = true;
  am.play('sfx_match');
  assertEq(created.length, 2, 'sfx created on first use');
  const first = am.pool.sfx_match;
  am.play('sfx_match');
  am.play('sfx_match');
  assertEq(created.length, 2, 'repeat plays reuse the same context');
  assertEq(am.pool.sfx_match, first);
  Platform.inject(null);
});

test('bgm rebuild budget is process-wide and survives unmute churn', () => {
  const created = [];
  Platform.inject(Platform.createMockPlatform({ createAudio: fakeAudioFactory(created) }));
  const am = new AudioManager();
  am.preload();
  am.unlock();
  am.bgm._err.forEach(cb => cb({}));
  assertEq(am.bgmOn, true, 'rebuild 1 keeps playing');
  am.setMuted(true);
  am.setMuted(false);
  am.bgm._err.forEach(cb => cb({}));
  assertEq(am.bgmOn, true, 'rebuild 2 keeps playing');
  am.bgm._err.forEach(cb => cb({}));
  assertEq(am.bgmOn, false, 'gives up after 3 attempts total');
  am.setMuted(true);
  am.setMuted(false);
  assertEq(am.bgmOn, false, 'unmute must not refresh the error budget');
  assertEq(created.length, 3, 'exactly 3 bgm contexts created, no growing leak');
  Platform.inject(null);
});

section('AudioManager WebAudio path');

function fakeWa(spec) {
  const wa = {
    destination: {},
    resumes: 0,
    starts: [],
    stops: [],
    resume() { wa.resumes++; },
    createBufferSource() {
      const s = {
        buffer: null, loop: false, onended: null, _gain: null,
        connect() {}, disconnect() {},
        start() { wa.starts.push(s); },
        stop() { wa.stops.push(s); if (s.onended) s.onended(); }
      };
      return s;
    },
    createGain() { return { gain: { value: 1 }, connect() {}, disconnect() {} }; },
    decodeAudioData(data, ok, fail) {
      const isBgm = data && data.__bgm;
      if (spec && spec.decodeFailBgm && isBgm) { fail(new Error('bgm decode')); return; }
      if (spec && spec.decodeFailIds && data && spec.decodeFailIds.indexOf(data.__id) >= 0) {
        fail(new Error('decode')); return;
      }
      ok({ id: data && data.__id });
    }
  };
  return wa;
}

function webMock(wa, created) {
  const opts = {
    createWebAudio: () => wa,
    readFileBuffer: (p, cb) => cb(null, { __id: p, __bgm: p.indexOf('bgm_main') >= 0 })
  };
  if (created) opts.createAudio = fakeAudioFactory(created);
  return Platform.createMockPlatform(opts);
}

test('web audio uses zero InnerAudioContext instances and buffers for sfx/bgm', () => {
  const created = [];
  const wa = fakeWa(null);
  Platform.inject(webMock(wa, created));
  const am = new AudioManager();
  am.preload();
  assertEq(am._webMode, true, 'web mode on');
  assertEq(created.length, 0, 'no lifecycle-heavy audio contexts created');
  am.unlock();
  assertEq(wa.resumes, 1, 'user gesture resumes the suspended web audio context');
  assertEq(wa.starts.length, 1, 'bgm buffer source started');
  assertEq(wa.starts[0].loop, true, 'bgm loops');
  am.play('sfx_match');
  am.play('sfx_match');
  assertEq(wa.starts.length, 3, 'sfx overlaps via fresh buffer sources');
  am.stopBgm();
  assertEq(wa.stops.length, 1, 'bgm stopped');
  am.playBgm();
  assertEq(wa.starts.length, 4, 'bgm restart source');
  am.webResume();
  assertEq(wa.resumes, 2, 'resume forwarded again on background return');
  Platform.inject(null);
});

test('web node creation failure keeps counters sane and falls back to legacy', () => {
  const wa = fakeWa(null);
  wa.createBufferSource = function () { throw new Error('boom'); };
  const created = [];
  Platform.inject(webMock(wa, created));
  const am = new AudioManager();
  am.preload();
  am.unlocked = true;
  am.play('sfx_win');
  assertEq(am._liveCount, 0, 'live counter must not go negative when node creation throws');
  assertEq(created.length, 1, 'failed web play falls back to a legacy context');
  assertEq(created[0].plays >= 1, true, 'legacy actually played');
  am.play('sfx_win');
  assertEq(created.length, 1, 'legacy instance reused');
  Platform.inject(null);
});

test('bgm decode failure falls back to exactly one InnerAudioContext', () => {
  const created = [];
  const wa = fakeWa({ decodeFailBgm: true });
  Platform.inject(webMock(wa, created));
  const am = new AudioManager();
  am.preload();
  assertEq(am._webBgmFailed, true, 'bgm marked failed');
  assertEq(created.length, 1, 'bgm fell back to one inner audio context');
  am.unlock();
  assertEq(created[0].plays >= 1, true, 'legacy bgm plays');
  am.play('sfx_win');
  assertEq(wa.starts.length, 1, 'sfx still on web buffers');
  assertEq(created.length, 1, 'sfx did not add inner audio contexts');
  Platform.inject(null);
});

test('single sfx decode failure degrades to lazy legacy on demand', () => {
  const created = [];
  const wa = fakeWa({ decodeFailIds: ['audio/sfx_win.wav'] });
  Platform.inject(webMock(wa, created));
  const am = new AudioManager();
  am.preload();
  assertEq(created.length, 0, 'failed decode not eagerly created');
  am.unlocked = true;
  am.play('sfx_win');
  assertEq(created.length, 1, 'legacy context created on demand for failed id');
  assertEq(created[0].plays >= 1, true);
  am.play('sfx_match');
  assertEq(wa.starts.length, 1, 'healthy ids stay on web path');
  assertEq(created.length, 1, 'one instance only');
  Platform.inject(null);
});
