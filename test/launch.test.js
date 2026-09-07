'use strict';

const { assert, assertEq, section, test } = require('./harness');
const Platform = require('../js/platform/Platform');

function freshBootstrap(opts) {
  const storage = {
    screwmaster_tutorial: '1',
    screwmaster_progress: JSON.stringify({ unlockedLevel: opts.unlocked || 1 })
  };
  const mock = Platform.createMockPlatform({
    createCanvas: () => null,
    raf: () => 0,
    now: () => 0,
    getLaunchOptions: () => (opts.query ? { query: opts.query } : {}),
    storage
  });
  Platform.inject(mock);
  delete require.cache[require.resolve('../js/main')];
  const bootstrap = require('../js/main');
  const app = bootstrap();
  return { app, mock };
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
  const { app } = freshBootstrap({ unlocked: 4 });
  assertEq(app.inMenu, true);
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
