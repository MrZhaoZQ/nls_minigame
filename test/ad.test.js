'use strict';

const { assert, assertEq, section, test } = require('./harness');
const Platform = require('../js/platform/Platform');
const AdManager = require('../js/ad/AdManager');
const GameConfig = require('../js/config/GameConfig');

function setup() {
  const mock = Platform.createMockPlatform();
  Platform.inject(mock);
  let clock = GameConfig.ad.coldStartMs + 10;
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

test('cold start blocks ads', () => {
  const { ad } = setup();
  ad.startedAt = 1000;
  const gate = ad.canShow('hint');
  assertEq(gate.ok, false);
  assertEq(gate.reason, 'coldStart');
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
  const clock = { v: GameConfig.ad.coldStartMs + 10 };
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
