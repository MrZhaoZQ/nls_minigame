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

function fakeInterAd(mode) {
  return {
    shown: 0,
    loadCalls: 0,
    show() {
      this.shown++;
      if (mode === 'fail') return { then: (ok, err) => { if (err) err(new Error('no fill')); } };
      return { then: (ok) => { if (ok) ok(); } };
    },
    load() {
      this.loadCalls++;
      return {
        then: (ok) => { if (ok) ok(); return { catch: () => ({ then: () => {} }) }; },
        catch: () => ({})
      };
    },
    onError() {}
  };
}

function setupInter(opts) {
  const o = opts || {};
  const mock = Platform.createMockPlatform({
    createInterstitialAd: () => (o.noAd ? null : fakeInterAd(o.interMode)),
    now: () => clock
  });
  Platform.inject(mock);
  let clock = 0;
  const im = new InterstitialManager({ now: () => clock });
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
  setClock(91000);
  assertEq(im.canShow(1).reason, 'protected');
  assertEq(im.canShow(2).reason, 'winGap');
  im.noteWin(); im.noteWin();
  assertEq(im.canShow(2).ok, true, 'two wins satisfy the gap');
  im.maybeShow(2);
  assertEq(im.ad.shown, 1);
  assertEq(im.winsSinceShow, 0);
  assertEq(im.shownCount, 1);
  im.noteWin(); im.noteWin();
  assertEq(im.canShow(2).reason, 'cooldown');
  const t2 = 91000 + GameConfig.ad.interCooldownMs + 20;
  setClock(t2);
  assertEq(im.canShow(2).ok, true);
  Platform.storage.set('screwmaster_intercount', JSON.stringify({
    date: new Date(t2).toDateString(),
    count: GameConfig.ad.interDailyLimit,
    lastShowTs: 0
  }));
  assertEq(im.canShow(2).reason, 'dailyLimit');
  Platform.inject(null);
});

test('failed interstitial show consumes nothing and never re-shows', () => {
  const { im, setClock } = setupInter({ interMode: 'fail' });
  setClock(91000);
  im.noteWin(); im.noteWin(); im.noteWin();
  im.maybeShow(4);
  assertEq(im.ad.shown, 1);
  assertEq(im.ad.loadCalls, 1, 'failure only preloads for the next transition');
  assertEq(im.winsSinceShow, 3, 'win gap intact after failed show');
  assertEq(im.shownCount, 0);
  assertEq(im.lastShowTs, 0, 'cooldown not consumed by a failed show');
  assertEq(Platform.storage.get('screwmaster_intercount'), undefined, 'daily budget intact');
  assertEq(im.canShow(4).ok, true, 'still eligible on the next transition');
  Platform.inject(null);
});

test('interstitial cooldown persists across sessions', () => {
  const { im, setClock } = setupInter();
  setClock(91000);
  im.noteWin(); im.noteWin(); im.noteWin();
  im.maybeShow(4);
  assertEq(im.shownCount, 1);
  const im2 = new InterstitialManager({ now: () => 95000 });
  im2.init();
  assertEq(im2.lastShowTs, 91000, 'new session restores persisted cooldown anchor');
  im2.noteWin(); im2.noteWin(); im2.noteWin();
  assertEq(im2.canShow(4).reason, 'cooldown');
  Platform.inject(null);
});

test('pending rewarded ad rejects concurrent show requests', () => {
  let closeCb = null;
  const fakeAd = {
    onClose(cb) { closeCb = cb; },
    onError() {},
    show() { return Promise.resolve(); },
    load() { return Promise.resolve(); }
  };
  const mock = Platform.createMockPlatform({
    createRewardedVideoAd: () => fakeAd,
    now: () => 50000
  });
  Platform.inject(mock);
  const ad = new AdManager({ unitId: 'adunit-real', now: () => 50000 });
  ad.init();
  let first = null;
  let second = null;
  ad.show('hint', r => { first = r; });
  ad.show('undo', r => { second = r; });
  assertEq(second && second.rewarded, false);
  assertEq(second && second.reason, 'busy');
  assertEq(first, null, 'first callback kept pending until close');
  closeCb({ isEnded: true });
  assert(first && first.rewarded === true);
  Platform.inject(null);
});

section('TemplateAdManager');

const TemplateAdManager = require('../js/ad/TemplateAdManager');

function fakeCustomAd() {
  return {
    style: { left: 0, top: 0 },
    shown: 0,
    hidden: 0,
    isShow: false,
    errCb: null,
    loadCb: null,
    show() { this.shown++; this.isShow = true; return Promise.resolve(); },
    hide() { this.hidden++; this.isShow = false; },
    onError(cb) { this.errCb = cb; },
    onLoad(cb) { this.loadCb = cb; },
    onResize() {}
  };
}

function setupTemplate() {
  const created = [];
  const mock = Platform.createMockPlatform({
    createCustomAd: (opts) => {
      const a = fakeCustomAd();
      a.style = opts.style;
      created.push(a);
      return a;
    }
  });
  Platform.inject(mock);
  const m = new TemplateAdManager({ screen: { width: 375, height: 667 } });
  m.init();
  return { m, ad: created[0], created };
}

test('template ad is a no-op without platform API', () => {
  const mock = Platform.createMockPlatform();
  Platform.inject(mock);
  const m = new TemplateAdManager({ screen: { width: 375, height: 667 } });
  m.init();
  assertEq(m.isMock(), true);
  assertEq(m.setActive(true), false);
  assertEq(m.active, false);
  Platform.inject(null);
});

test('template ad is created lazily on first activation', () => {
  const created = [];
  const mock = Platform.createMockPlatform({
    createCustomAd: (opts) => {
      const a = fakeCustomAd();
      a.style = opts.style;
      created.push(a);
      return a;
    }
  });
  Platform.inject(mock);
  const m = new TemplateAdManager({ screen: { width: 375, height: 667 } });
  assertEq(created.length, 0, 'no native component at construction');
  assertEq(m.setActive(false), false, 'hide before creation is a no-op');
  assertEq(created.length, 0);
  assertEq(m.setActive(true), true);
  assertEq(created.length, 1, 'created on first activation');
  m.setActive(false);
  m.setActive(true);
  assertEq(created.length, 1, 'instance reused across visits');
  Platform.inject(null);
});

test('template ad stays hidden until activated by a menu surface', () => {
  const { m, ad } = setupTemplate();
  assert(ad, 'instance created');
  assertEq(ad.shown, 0, 'not shown on init');
  assertEq(ad.hidden, 0, 'no preemptive hide before load (would break loading on device)');
  assertEq(m.setActive(true), true);
  assertEq(ad.shown, 1);
  assertEq(m.setActive(true), false, 'repeated activation is a no-op');
  assertEq(ad.shown, 1);
  assertEq(m.setActive(false), true);
  assertEq(ad.isShow, false, 'hidden when leaving menus');
  m.setActive(true);
  assertEq(ad.shown, 2, 'reactivation allowed');
  Platform.inject(null);
});

test('template ad loaded while inactive stays hidden and shows on activation', () => {
  const { m, ad } = setupTemplate();
  ad.loadCb();
  assertEq(ad.isShow, false, 'never shown before activation');
  m.setActive(true);
  assertEq(ad.shown, 1, 'load-then-activate shows immediately');
  Platform.inject(null);
});

test('template banner anchors bottom above safe area with 20:7 ratio', () => {
  const { m, ad } = setupTemplate();
  assertEq(ad.style.top, 536, '667 - round(375*7/20)=131, flush to safe area');
  assertEq(ad.style.left, 0);
  m.layout({ width: 375, height: 667 }, 34);
  assertEq(ad.style.top, 502, 'safe-area inset respected');
  ad.style.height = 80;
  ad.loadCb && ad.loadCb();
  assertEq(ad.style.top, 553, 'repositioned with real template height');
  Platform.inject(null);
});

test('template ad hides on error but retries on next activation', () => {
  const { m, ad } = setupTemplate();
  m.setActive(true);
  assertEq(ad.shown, 1);
  ad.errCb && ad.errCb({ errCode: 1004 });
  assertEq(ad.isShow, false, 'auto-hidden on fill error');
  assert(m.events.some(e => e.type === 'error'), 'error recorded');
  assertEq(m.setActive(false), true);
  m.setActive(true);
  assertEq(ad.shown, 2, 'fill errors do not permanently disable the unit');
  Platform.inject(null);
});

test('template ad creation throw degrades to mock', () => {
  const mock = Platform.createMockPlatform({
    createCustomAd: () => { throw new Error('bad unit'); }
  });
  Platform.inject(mock);
  const m = new TemplateAdManager({});
  m.init();
  assertEq(m.isMock(), true);
  assertEq(m.setActive(true), false);
  Platform.inject(null);
});

test('function-typed isShow (real device quirk) is unwrapped', () => {
  const { m, ad } = setupTemplate();
  let shownFlag = false;
  ad.isShow = () => shownFlag;
  ad.show = () => { ad.shown++; shownFlag = true; return Promise.resolve(); };
  ad.hide = () => { ad.hidden++; shownFlag = false; };
  ad.loadCb();
  m.setActive(true);
  assertEq(ad.shown, 1, 'show invoked when isShow() reports hidden');
  m.setActive(false);
  shownFlag = true;
  m.setActive(true);
  assertEq(ad.shown, 1, 'skips show while isShow() reports visible');
  shownFlag = false;
  m.setActive(false);
  m.setActive(true);
  assertEq(ad.shown, 2, 'shows again once hidden');
  Platform.inject(null);
});
