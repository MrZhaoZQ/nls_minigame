'use strict';

const { assert, assertEq, section, test } = require('./harness');
const Platform = require('../js/platform/Platform');
const AdManager = require('../js/ad/AdManager');
const GameConfig = require('../js/config/GameConfig');

function setup() {
  const mock = Platform.createMockPlatform();
  Platform.inject(mock);
  let clock = 50000;
  const ad = new AdManager({ now: () => clock });
  ad.startedAt = 0;
  return { ad, mock, setClock: (v) => { clock = v; } };
}

section('AdManager (mock mode)');

test('mock ad grants reward', () => {
  const { ad } = setup();
  let result = null;
  ad.show('win_double', r => { result = r; });
  assert(result && result.rewarded === true);
  assert(result.mock === true);
  Platform.inject(null);
});

test('rewarded ads are user-initiated: no cold-start block', () => {
  const { ad } = setup();
  ad.startedAt = 0;
  const gate = ad.canShow('win_double');
  assertEq(gate.ok, true, 'win_double must be available right after launch');
  const failGate = ad.canShow('fail_undo');
  assertEq(failGate.ok, true, 'fail rescue must be available right after launch');
  Platform.inject(null);
});

test('cooldown blocks consecutive ads', () => {
  const { ad, setClock } = setup();
  let got = null;
  ad.show('win_double', r => { got = r; });
  assert(got.rewarded);
  const second = ad.canShow('win_double');
  assertEq(second.ok, false);
  assertEq(second.reason, 'cooldown');
  setClock(ad.lastShowTs + GameConfig.ad.cooldownMs + 100);
  const third = ad.canShow('win_double');
  assertEq(third.ok, true);
  Platform.inject(null);
});

test('per-level limit for fail placements', () => {
  const { ad, setClock } = setup();
  for (let i = 0; i < GameConfig.ad.perLevelLimit; i++) {
    ad.show('fail_undo', () => {});
    setClock(ad.lastShowTs + GameConfig.ad.cooldownMs + 10);
  }
  const gate = ad.canShow('fail_undo');
  assertEq(gate.ok, false);
  assertEq(gate.reason, 'perLevel');
  const winGate = ad.canShow('win_double');
  assertEq(winGate.ok, true);
  Platform.inject(null);
});

test('daily limit enforced', () => {
  const { ad } = setup();
  Platform.storage.set('screwmaster_adcount', JSON.stringify({
    date: new Date(Date.now()).toDateString(),
    count: GameConfig.ad.dailyLimit,
    lastShowTs: 0
  }));
  const gate = ad.canShow('hint');
  assertEq(gate.ok, false);
  assertEq(gate.reason, 'dailyLimit');
  Platform.inject(null);
});

function setupReal(isEndedResult) {
  let closeCb = null;
  const fakeAd = {
    onClose(cb) { closeCb = cb; },
    onError() {},
    show() { return Promise.resolve(); },
    load() { return Promise.resolve(); }
  };
  const mock = Platform.createMockPlatform({
    createRewardedVideoAd: () => fakeAd
  });
  Platform.inject(mock);
  const clock = { v: 50000 };
  const ad = new AdManager({ unitId: 'adunit-real', now: () => clock.v });
  ad.startedAt = 0;
  ad.init();
  return { ad, fireClose: (res) => closeCb(res) };
}

test('real ad flow respects isEnded', () => {
  const { ad, fireClose } = setupReal();
  let result = null;
  ad.show('win_double', r => { result = r; });
  assertEq(result, null);
  fireClose({ isEnded: true });
  assert(result && result.rewarded === true);
  Platform.inject(null);
});

test('skipped ad not rewarded', () => {
  const { ad, fireClose } = setupReal();
  let result = null;
  ad.show('win_double', r => { result = r; });
  fireClose({ isEnded: false });
  assert(result && result.rewarded === false);
  assertEq(result.reason, 'skipped');
  Platform.inject(null);
});

section('InterstitialManager');

const InterstitialManager = require('../js/ad/InterstitialManager');

function fakeInterAd() {
  return {
    shown: 0,
    show() { this.shown++; return { catch: () => ({ then: () => {} }) }; },
    load() { return { then: () => ({ catch: () => {} }) }; },
    onError() {}
  };
}

function setupInter(opts) {
  const o = opts || {};
  const mock = Platform.createMockPlatform({
    createInterstitialAd: () => (o.noAd ? null : fakeInterAd())
  });
  Platform.inject(mock);
  let clock = 0;
  const im = new InterstitialManager({ now: () => clock, adMgr: o.adMgr || null });
  im.init();
  return { im, setClock: (v) => { clock = v; } };
}

test('interstitial no-op without platform ad', () => {
  const { im } = setupInter({ noAd: true });
  const gate = im.maybeShow(10);
  assertEq(gate.reason, 'mock');
  assertEq(im.shownCount, 0);
  Platform.inject(null);
});

test('interstitial gating chain', () => {
  const { im, setClock } = setupInter();
  assertEq(im.canShow(5).reason, 'coldStart');
  setClock(GameConfig.ad.interColdStartMs + 10);
  assertEq(im.canShow(3).reason, 'protected');
  assertEq(im.canShow(4).reason, 'winGap');
  im.noteWin(); im.noteWin(); im.noteWin();
  assertEq(im.canShow(4).ok, true);
  im.maybeShow(4);
  assertEq(im.ad.shown, 1);
  assertEq(im.winsSinceShow, 0);
  assertEq(im.shownCount, 1);
  im.noteWin(); im.noteWin(); im.noteWin();
  assertEq(im.canShow(4).reason, 'cooldown');
  setClock(GameConfig.ad.interColdStartMs + GameConfig.ad.interCooldownMs + 20);
  assertEq(im.canShow(4).ok, true);
  Platform.storage.set('screwmaster_intercount', JSON.stringify({
    date: new Date(Date.now()).toDateString(),
    count: GameConfig.ad.interDailyLimit,
    lastShowTs: 0
  }));
  assertEq(im.canShow(4).reason, 'dailyLimit');
  Platform.inject(null);
});

test('interstitial suppressed right after rewarded grant', () => {
  const adMgr = { lastGrantTs: 0 };
  const { im, setClock } = setupInter({ adMgr: adMgr });
  setClock(GameConfig.ad.interColdStartMs + 10);
  im.noteWin(); im.noteWin(); im.noteWin();
  adMgr.lastGrantTs = GameConfig.ad.interColdStartMs;
  assertEq(im.canShow(5).reason, 'afterRewarded');
  adMgr.lastGrantTs = 1000;
  assertEq(im.canShow(5).ok, true);
  Platform.inject(null);
});
