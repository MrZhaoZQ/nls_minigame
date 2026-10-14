'use strict';

const { assert, assertEq, section, test } = require('./harness');
const Platform = require('../js/platform/Platform');

function freshBootstrap(opts) {
  const storage = {
    screwmaster_tutorial: '1',
    screwmaster_progress: JSON.stringify({ unlockedLevel: opts.unlocked || 1 })
  };
  const frames = [];
  const mockOpts = {
    createCanvas: () => null,
    raf: (cb) => { frames.push(cb); return frames.length; },
    now: () => 0,
    getLaunchOptions: () => (opts.query ? { query: opts.query } : {}),
    storage
  };
  if (opts.capsule) {
    mockOpts.getMenuButtonBoundingClientRect =
      typeof opts.capsule === 'function' ? opts.capsule : () => opts.capsule;
  }
  const mock = Platform.createMockPlatform(mockOpts);
  Platform.inject(mock);
  delete require.cache[require.resolve('../js/main')];
  const bootstrap = require('../js/main');
  const app = bootstrap();
  if (frames.length) frames[0](0);
  return { app, mock, frames };
}

section('Capsule share & launch query');

test('passive share handler registered with level card', () => {
  const { app, mock } = freshBootstrap({ unlocked: 3 });
  assertEq(mock.shareHandlers.length, 1);
  const card = mock.shareHandlers[0]();
  assert(card.title.indexOf('拧螺丝啦') >= 0, 'title has game name');
  assert(card.title.indexOf('第 1 关') >= 0, 'title has level');
  const cfg = require('../js/config/GameConfig').share;
  assertEq(card.imageUrl, cfg.imageUrl);
  assertEq(card.imageUrlId, cfg.imageId);
  assert(card.query.indexOf('level=1') >= 0, 'query carries level');
  assertEq(mock.shareMenuShown, true, 'capsule share menu enabled');
  assertEq(mock.timelineHandlers.length, 1, 'timeline share registered');
  const tl = mock.timelineHandlers[0]();
  assert(tl.title.indexOf('拧螺丝啦') >= 0, 'timeline title');
  assert(tl.query.indexOf('from=timeline') >= 0, 'timeline query');
  assertEq(tl.imageUrl, require('../js/config/GameConfig').share.imageUrl);
  assertEq(tl.imageUrlId, require('../js/config/GameConfig').share.imageId);
  Platform.inject(null);
  delete require.cache[require.resolve('../js/main')];
});

test('launch from share card within unlock starts that level', () => {
  const { app } = freshBootstrap({ unlocked: 5, query: { from: 'share', level: '5' } });
  assertEq(app.currentLevelId, 5);
  assertEq(app.inMenu, false);
  assertEq(app.levelSelect.visible, false);
  Platform.inject(null);
  delete require.cache[require.resolve('../js/main')];
});

test('launch level beyond unlock falls back to menu', () => {
  const { app } = freshBootstrap({ unlocked: 2, query: { from: 'share', level: '9' } });
  assertEq(app.inMenu, true);
  assertEq(app.levelSelect.visible, true);
  Platform.inject(null);
  delete require.cache[require.resolve('../js/main')];
});

test('plain launch without query opens menu', () => {
  const { app, mock } = freshBootstrap({ unlocked: 4 });
  assertEq(app.inMenu, true);
  assert(mock.clubButton, 'game club button created');
  assertEq(mock.clubButton.visible, true, 'club entry shown on menu');
  assertEq(mock.clubButton.style.left, 7);
  assertEq(mock.clubButton.style.top, 26);
  assertEq(mock.clubButton.style.width, 87);
  assertEq(mock.clubButton.style.height, 32);
  assertEq(mock.clubButton.style.borderRadius, 16);
  Platform.inject(null);
  delete require.cache[require.resolve('../js/main')];
});

test('club entry mirrors LIVE capsule rect', () => {
  const live = { top: 34, height: 30, bottom: 64, left: 268, right: 358, width: 90 };
  const { mock } = freshBootstrap({ unlocked: 3, capsule: live });
  assertEq(mock.clubButton.style.top, 34);
  assertEq(mock.clubButton.style.left, 375 - 358);
  assertEq(mock.clubButton.style.width, 90);
  assertEq(mock.clubButton.style.height, 30);
  assertEq(mock.clubButton.style.borderRadius, 15);
  Platform.inject(null);
  delete require.cache[require.resolve('../js/main')];
});

function stubCtx() {
  const grad = { addColorStop() {} };
  const store = {};
  return new Proxy(store, {
    get(t, k) {
      if (k === 'measureText') return (s) => ({ width: String(s).length * 13 });
      if (k === 'createLinearGradient' || k === 'createRadialGradient') return () => grad;
      if (k in t) return t[k];
      return function () {};
    },
    set(t, k, v) { t[k] = v; return true; }
  });
}

test('idle frames skip rendering (thermal optimization)', () => {
  const { app, frames } = freshBootstrap({ unlocked: 3 });
  app.ctx = stubCtx();
  app.forceRender = true;
  let renders = 0;
  const orig = app.renderer.render.bind(app.renderer);
  app.renderer.render = (ctx, sc, cam, o) => { renders++; return orig(ctx, sc, cam, o); };
  const step = () => { const cb = frames.shift(); if (cb) cb(0); };
  step();
  const base = renders;
  assert(base >= 1, 'forced frame renders');
  step(); step(); step(); step();
  assertEq(renders, base, 'idle menu must not re-render');
  app.levelSelect.onDrag(-20);
  step();
  assert(renders > base, 'interaction triggers render');
  Platform.inject(null);
  delete require.cache[require.resolve('../js/main')];
});

test('capsule rect fetched once, never polled', () => {
  let calls = 0;
  const counting = () => {
    calls++;
    return { top: 30, height: 32, bottom: 62, left: 270, right: 360, width: 90 };
  };
  const { app, frames } = freshBootstrap({ unlocked: 3, capsule: counting });
  assertEq(calls, 1, 'fetched exactly once at bootstrap');
  for (let i = 0; i < 5; i++) {
    const cb = frames.shift();
    if (cb) cb(0);
  }
  assertEq(calls, 1, 'no polling while visible');
  app.startLevelById(1);
  if (frames.length) frames.shift()(0);
  app.showMenu();
  if (frames.length) frames.shift()(0);
  assertEq(calls, 1, 'no re-fetch on show transitions');
  Platform.inject(null);
  delete require.cache[require.resolve('../js/main')];
});

test('warm start from share card jumps to level', () => {
  const { app, mock } = freshBootstrap({ unlocked: 6 });
  assertEq(app.inMenu, true);
  const showCb = mock.showHandlers[0];
  assert(showCb, 'onShow registered');
  showCb({ query: { from: 'share', level: '6' } });
  assertEq(app.currentLevelId, 6);
  assertEq(app.inMenu, false);
  Platform.inject(null);
  delete require.cache[require.resolve('../js/main')];
});

test('startup reports existing progress to rank', () => {
  const { app, mock } = freshBootstrap({ unlocked: 5 });
  const reports = mock.cloudStorage || [];
  assert(reports.length >= 1, 'startup report emitted');
  const kv = reports[0][0];
  assertEq(kv.key, 'WRofNLSL');
  assertEq(JSON.parse(kv.value).wxgame.score, 4);
  const before = reports.length;
  mock.showHandlers[0]({});
  assertEq((mock.cloudStorage || []).length, before + 1, 'onShow re-reports for weekly freshness');
  Platform.inject(null);
  delete require.cache[require.resolve('../js/main')];
});

test('long hide on level select does not show resume overlay', () => {
  const { app, mock } = freshBootstrap({ unlocked: 3 });
  assertEq(app.inMenu, true);
  app.hiddenAt = -70000;
  mock.showHandlers[0]({});
  assertEq(app.pausedReturn, false, 'menu needs no resume gate');
  Platform.inject(null);
  delete require.cache[require.resolve('../js/main')];
});

test('resume overlay first tap only dismisses', () => {
  const { app, mock } = freshBootstrap({ unlocked: 3 });
  app.startLevelById(1);
  assertEq(app.inMenu, false);
  app.hiddenAt = -70000;
  mock.showHandlers[0]({});
  assertEq(app.pausedReturn, true);
  app.input.onTap(100, 300);
  assertEq(app.pausedReturn, false);
  assertEq(app.game.state, 'playing', 'first tap only dismisses overlay');
  assertEq(app.slotManager.count(), 0, 'first tap does not interact with game');
  Platform.inject(null);
  delete require.cache[require.resolve('../js/main')];
});

test('warm start without query keeps current screen', () => {
  const { app, mock } = freshBootstrap({ unlocked: 6 });
  const showCb = mock.showHandlers[0];
  showCb({});
  assertEq(app.inMenu, true, 'no query no jump');
  showCb({ query: { level: '99' } });
  assertEq(app.inMenu, true, 'beyond unlock no jump');
  Platform.inject(null);
  delete require.cache[require.resolve('../js/main')];
});

test('resume overlay dismisses on touch down even when locked', () => {
  const { app, mock } = freshBootstrap({ unlocked: 3 });
  app.startLevelById(1);
  app.hiddenAt = -70000;
  mock.showHandlers[0]({});
  assertEq(app.pausedReturn, true);
  app.input.setLocked(true);
  mock.touchHandlers.start.forEach(h => h({
    touches: [{ identifier: 0, clientX: 100, clientY: 300 }],
    changedTouches: [{ identifier: 0, clientX: 100, clientY: 300 }]
  }));
  assertEq(app.pausedReturn, false, 'touch down alone dismisses the overlay');
  app.input.setLocked(false);
  Platform.inject(null);
  delete require.cache[require.resolve('../js/main')];
});

test('dismiss gesture does not pass through to gameplay', () => {
  const { app, mock } = freshBootstrap({ unlocked: 3 });
  app.startLevelById(1);
  app.hiddenAt = -70000;
  mock.showHandlers[0]({});
  assertEq(app.pausedReturn, true);
  const touchEvt = {
    touches: [{ identifier: 0, clientX: 100, clientY: 300 }],
    changedTouches: [{ identifier: 0, clientX: 100, clientY: 300 }]
  };
  mock.touchHandlers.start.forEach(h => h(touchEvt));
  mock.touchHandlers.end.forEach(h => h({ touches: [], changedTouches: touchEvt.changedTouches }));
  assertEq(app.pausedReturn, false);
  assertEq(app.slotManager.count(), 0, 'swallowed tap must not collect a screw');
  Platform.inject(null);
  delete require.cache[require.resolve('../js/main')];
});

test('pulse-only animation renders every other frame', () => {
  const { app, frames } = freshBootstrap({ unlocked: 3 });
  app.ctx = stubCtx();
  app.forceRender = true;
  let renders = 0;
  const orig = app.renderer.render.bind(app.renderer);
  app.renderer.render = (ctx, sc, cam, o) => { renders++; return orig(ctx, sc, cam, o); };
  const step = () => { const cb = frames.shift(); if (cb) cb(0); };
  step();
  assertEq(renders, 1, 'forced frame renders');
  app.tutorial.active = true;
  app.tutorial.step = 0;
  step();
  assertEq(renders, 2, 'first pulse frame renders');
  step();
  assertEq(renders, 2, 'pulse-only skips every other frame (30fps highlight)');
  step();
  assertEq(renders, 3, 'pulse resumes on the next parity');
  app.tutorial.active = false;
  step();
  step();
  assertEq(renders, 3, 'idle stops rendering entirely');
  Platform.inject(null);
  delete require.cache[require.resolve('../js/main')];
});

test('canvas keeps native DPR for clarity, caps only extreme ratios', () => {
  const fakeCanvas = { width: 0, height: 0, getContext() { return stubCtx(); } };
  const storage = {
    screwmaster_tutorial: '1',
    screwmaster_progress: JSON.stringify({ unlockedLevel: 2 })
  };
  const frames = [];
  const mock = Platform.createMockPlatform({
    getSystemInfo: () => ({
      width: 375, height: 667, pixelRatio: 2, safeArea: null, platform: 'android'
    }),
    createCanvas: () => fakeCanvas,
    raf: (cb) => { frames.push(cb); return frames.length; },
    now: () => 0,
    getLaunchOptions: () => ({}),
    storage
  });
  Platform.inject(mock);
  delete require.cache[require.resolve('../js/main')];
  const bootstrap = require('../js/main');
  const app = bootstrap();
  assertEq(app.renderScale, 2, 'pixelRatio 2 must stay native (clarity first)');
  assertEq(fakeCanvas.width, 750, 'canvas px = logical * scale');
  assertEq(fakeCanvas.height, 1334);
  Platform.inject(null);
  delete require.cache[require.resolve('../js/main')];
  const fakeCanvas2 = { width: 0, height: 0, getContext() { return stubCtx(); } };
  const mock2 = Platform.createMockPlatform({
    getSystemInfo: () => ({
      width: 375, height: 667, pixelRatio: 4, safeArea: null, platform: 'android'
    }),
    createCanvas: () => fakeCanvas2,
    raf: (cb) => { frames.push(cb); return frames.length; },
    now: () => 0,
    getLaunchOptions: () => ({}),
    storage
  });
  Platform.inject(mock2);
  delete require.cache[require.resolve('../js/main')];
  const bootstrap2 = require('../js/main');
  const app2 = bootstrap2();
  assertEq(app2.renderScale, 3, 'extreme DPR 4 capped to 3');
  assertEq(fakeCanvas2.width, 1125);
  Platform.inject(null);
  delete require.cache[require.resolve('../js/main')];
});

test('scene transitions clear stale resume overlay', () => {
  const { app, mock } = freshBootstrap({ unlocked: 3 });
  app.startLevelById(1);
  app.hiddenAt = -70000;
  mock.showHandlers[0]({});
  assertEq(app.pausedReturn, true);
  app.showMenu();
  assertEq(app.pausedReturn, false, 'entering menu clears overlay');
  app.hiddenAt = -70000;
  mock.showHandlers[0]({});
  assertEq(app.pausedReturn, false, 'menu stays overlay-free');
  Platform.inject(null);
  delete require.cache[require.resolve('../js/main')];
});

test('cold start calibrates pixelRatio from factory canvas when systemInfo lies', () => {
  const storage = {
    screwmaster_tutorial: '1',
    screwmaster_progress: JSON.stringify({ unlockedLevel: 2 })
  };
  const frames = [];
  global.wx = {};
  const fakeCanvas = { width: 1125, height: 2001, getContext() { return stubCtx(); } };
  Platform.inject(Platform.createMockPlatform({
    getSystemInfo: () => ({
      width: 375, height: 667, pixelRatio: 1, safeArea: null, platform: 'android'
    }),
    createCanvas: () => fakeCanvas,
    raf: (cb) => { frames.push(cb); return frames.length; },
    now: () => 0,
    getLaunchOptions: () => ({}),
    storage
  }));
  delete require.cache[require.resolve('../js/main')];
  const app = require('../js/main')();
  assertEq(app.screen.pixelRatio, 3, 'factory canvas 1125/375 exposes real DPR 3 over buggy pixelRatio 1');
  assertEq(app.renderScale, 3, 'render scale uses the calibrated DPR');
  assertEq(fakeCanvas.width, 1125, 'canvas built at native resolution, no blurry cold start');

  const fake2 = { width: 750, height: 1334, getContext() { return stubCtx(); } };
  Platform.inject(Platform.createMockPlatform({
    getSystemInfo: () => ({
      width: 375, height: 667, pixelRatio: 2, safeArea: null, platform: 'android'
    }),
    createCanvas: () => fake2,
    raf: (cb) => { frames.push(cb); return frames.length; },
    now: () => 0,
    getLaunchOptions: () => ({}),
    storage
  }));
  delete require.cache[require.resolve('../js/main')];
  const app2 = require('../js/main')();
  assertEq(app2.screen.pixelRatio, 2, 'honest systemInfo path untouched');
  assertEq(fake2.width, 750);
  Platform.inject(null);
  delete global.wx;
  delete require.cache[require.resolve('../js/main')];
});
