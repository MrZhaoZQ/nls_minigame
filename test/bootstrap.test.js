'use strict';

const { assert, assertEq, section, test } = require('./harness');

section('Full bootstrap (headless)');

test('bootstrap + play level to win via simulated taps', () => {
  let clock = 0;
  const frames = [];
  const mock = require('../js/platform/Platform').createMockPlatform({
    createCanvas: () => null,
    raf: (cb) => { frames.push(cb); return frames.length; },
    now: () => clock
  });
  const Platform = require('../js/platform/Platform');
  Platform.inject(mock);

  delete require.cache[require.resolve('../js/main')];
  const bootstrap = require('../js/main');
  const app = bootstrap();

  assert(app, 'app created');
  assertEq(app.currentLevelId, 1);
  assertEq(app.game.state, 'playing');
  assert(frames.length > 0, 'raf scheduled');

  const stepFrames = (n, dtMs) => {
    for (let i = 0; i < n; i++) {
      clock += dtMs;
      const cb = frames.shift();
      assert(cb, 'frame available');
      cb(clock);
    }
  };

  const tapAt = (x, y) => {
    mock.touchHandlers.start.forEach(h => h({ touches: [{ identifier: 0, clientX: x, clientY: y }], changedTouches: [{ identifier: 0, clientX: x, clientY: y }] }));
    mock.touchHandlers.end.forEach(h => h({ touches: [], changedTouches: [{ identifier: 0, clientX: x, clientY: y }] }));
  };

  stepFrames(2, 16);

  assert(app.tutorial.active, 'tutorial active on first launch');
  const pauseBtn = app.topBar.buttons.find(b => b.id === 'pause');
  const helpBtn = app.topBar.buttons.find(b => b.id === 'help');
  const undoBtn = app.topBar.buttons.find(b => b.id === 'undo');
  tapAt(pauseBtn.x, pauseBtn.y);
  tapAt(helpBtn.x, helpBtn.y);
  tapAt(undoBtn.x, undoBtn.y);
  stepFrames(2, 16);
  assertEq(app.pausePanel.visible, false, 'pause blocked during tutorial');
  assertEq(app.helpPanel.visible, false, 'help blocked during tutorial');
  assert(app.topBar.allDisabled, 'topbar visually disabled during tutorial');

  // 教学提示与游戏提示按钮互不影响：教程激活期间 hint 点击被完全吞掉
  const hintBtn = app.topBar.buttons.find(b => b.id === 'hint');
  let tutorialModals = 0;
  mock.showModal = (opts) => { tutorialModals++; if (opts.success) opts.success({ confirm: true, cancel: false }); };
  tapAt(hintBtn.x, hintBtn.y);
  stepFrames(2, 16);
  assertEq(tutorialModals, 0, 'hint button must not open any modal during tutorial');
  assertEq(app.game.hintUsed, false, 'tutorial hint glow is independent of the hint button');
  assertEq(app.topBar.isEnabled('hint'), false, 'hint button greyed while tutorial active');
  app.tutorial.step = 2;
  tapAt(hintBtn.x, hintBtn.y);
  stepFrames(2, 16);
  assertEq(tutorialModals, 0, 'confirm-bubble stage also swallows the hint button');
  app.tutorial.step = 0;

  const scene = app.scene;
  const camera = app.camera;
  const game = app.game;

  let wins = 0;
  app.bus.on('LEVEL_WIN', () => { wins++; });

  let safety = 0;
  while (game.totalRemainingOnBoards() > 0 && safety++ < 400) {
    const slots = game.slotManager.slots;
    const slotCounts = {};
    for (let i = 0; i < slots.length; i++) slotCounts[slots[i]] = (slotCounts[slots[i]] || 0) + 1;
    const free = game.slotManager.capacity - slots.length;
    const colorRemain = {};
    for (let i = 0; i < game.screwManager.screws.length; i++) {
      const s = game.screwManager.screws[i];
      if (s.state === 'locked' || s.state === 'unlocked') {
        colorRemain[s.color] = (colorRemain[s.color] || 0) + 1;
      }
    }
    let target = null;
    let bestScore = -Infinity;
    for (let i = 0; i < game.screwManager.screws.length; i++) {
      const s = game.screwManager.screws[i];
      if (s.state !== 'unlocked') continue;
      const cnt = slotCounts[s.color] || 0;
      let score = cnt * 40;
      if (cnt >= 2) score += 200;
      if (free <= 1 && cnt === 0) score -= 150;
      const b = game.boardById[s.boardId];
      if (b && b.remaining === 1) score += 25;
      score += (colorRemain[s.color] || 0) * 2;
      if (score > bestScore) { bestScore = score; target = s; }
    }
    assert(target, 'always an unlocked screw available (no deadlock)');

    const stamp = scene.beginFrame();
    const wp = target.node.worldPos(stamp);
    const head = [wp[0], wp[1] + 0.06, wp[2]];
    const scr = camera.project(head);
    assert(scr, 'screw visible');
    tapAt(scr.x, scr.y);
    stepFrames(30, 20);
    if (game.state === 'lose') {
      tapAt(10, 300);
      stepFrames(10, 20);
      continue;
    }
  }

  assert(safety < 400, 'level finished within move budget');
  stepFrames(80, 20);
  assertEq(wins, 1);
  assert(app.resultPanel.visible, 'result panel shown');

  const reports = mock.cloudStorage || [];
  assert(reports.length >= 1, 'rank reported on win');
  const kv = reports[reports.length - 1][0];
  assertEq(kv.key, 'WRofNLSL');
  const parsed = JSON.parse(kv.value);
  assertEq(parsed.wxgame.score, 1, 'score = max cleared level');
  assert(typeof parsed.wxgame.update_time === 'number');

  app.resultPanel._layout();
  const nb = app.resultPanel.buttons.find(b => b.id === 'next');
  assert(nb, 'next button exists');
  tapAt(nb.x + nb.w / 2, nb.y + nb.h / 2);
  stepFrames(5, 20);
  assertEq(app.currentLevelId, 2, 'advanced to next level');
  assertEq(game.state, 'playing');

  Platform.inject(null);
  delete require.cache[require.resolve('../js/main')];
});

test('result panel outranks level select and menu clears dialogs', () => {
  let clock = 0;
  const frames = [];
  const mock = require('../js/platform/Platform').createMockPlatform({
    createCanvas: () => null,
    raf: (cb) => { frames.push(cb); return frames.length; },
    now: () => clock
  });
  const Platform = require('../js/platform/Platform');
  Platform.inject(mock);
  delete require.cache[require.resolve('../js/main')];
  const app = require('../js/main')();

  const stepFrames = (n, dtMs) => {
    for (let i = 0; i < n; i++) {
      clock += dtMs;
      const cb = frames.shift();
      if (cb) cb(clock);
    }
  };
  const tapAt = (x, y) => {
    mock.touchHandlers.start.forEach(h => h({ touches: [{ identifier: 0, clientX: x, clientY: y }], changedTouches: [{ identifier: 0, clientX: x, clientY: y }] }));
    mock.touchHandlers.end.forEach(h => h({ touches: [], changedTouches: [{ identifier: 0, clientX: x, clientY: y }] }));
  };

  stepFrames(2, 16);
  app.tutorial.done();
  app.startLevelById(2);
  stepFrames(2, 16);

  app.resultPanel.show(10, null);
  app.showMenu();
  assertEq(app.resultPanel.visible, false, 'showMenu clears result panel');
  app.failPanel.show({});
  app.showMenu();
  assertEq(app.failPanel.visible, false, 'showMenu clears fail panel');

  app.levelSelect.show({
    levels: [1, 2, 3], unlocked: 3, results: {}, capacity: 5, coins: 0
  });
  app.resultPanel.show(10, null);
  app.resultPanel._layout();
  const nb = app.resultPanel.buttons.find(b => b.id === 'next');
  tapAt(nb.x + nb.w / 2, nb.y + nb.h / 2);
  stepFrames(2, 16);
  assertEq(app.currentLevelId, 3, 'result next tap works while level select visible');
  assertEq(app.levelSelect.visible, false, 'next level hides menu');

  Platform.inject(null);
  delete require.cache[require.resolve('../js/main')];
});

test('coin purchases go through modal confirm', () => {
  let clock = 0;
  const frames = [];
  const mock = require('../js/platform/Platform').createMockPlatform({
    createCanvas: () => null,
    raf: (cb) => { frames.push(cb); return frames.length; },
    now: () => clock
  });
  const Platform = require('../js/platform/Platform');
  const SaveManager = require('../js/core/SaveManager');
  Platform.inject(mock);

  delete require.cache[require.resolve('../js/main')];
  const bootstrap = require('../js/main');
  const app = bootstrap();

  const stepFrames = (n, dtMs) => {
    for (let i = 0; i < n; i++) {
      clock += dtMs;
      const cb = frames.shift();
      cb(clock);
    }
  };
  const tapAt = (x, y) => {
    mock.touchHandlers.start.forEach(h => h({ touches: [{ identifier: 0, clientX: x, clientY: y }], changedTouches: [{ identifier: 0, clientX: x, clientY: y }] }));
    mock.touchHandlers.end.forEach(h => h({ touches: [], changedTouches: [{ identifier: 0, clientX: x, clientY: y }] }));
  };

  stepFrames(2, 16);
  app.tutorial.done();

  SaveManager.addCoins(100);

  const game = app.game;
  let target = null;
  for (let i = 0; i < game.screwManager.screws.length; i++) {
    const s = game.screwManager.screws[i];
    if (s.state === 'unlocked' && game.boardById[s.boardId].remaining > 1) { target = s; break; }
  }
  assert(target, 'collectable screw found');
  const stamp = app.scene.beginFrame();
  const wp = target.node.worldPos(stamp);
  const scr = app.camera.project([wp[0], wp[1] + 0.06, wp[2]]);
  tapAt(scr.x, scr.y);
  stepFrames(30, 20);
  assertEq(game.slotManager.count(), 1, 'one screw collected');

  game.freeUndoLeft = 0;
  app.topBar.setUndoQuota(0);
  assert(app.topBar.isEnabled('undo'), 'undo lit while coins can buy one');

  const undoBtn = app.topBar.buttons.find(b => b.id === 'undo');
  tapAt(undoBtn.x, undoBtn.y);
  stepFrames(2, 16);
  assertEq(SaveManager.getCoins(), 80, 'undo bought via confirmed modal');
  assertEq(game.slotManager.count(), 0, 'undo restored the slot');
  assert(app.topBar.isEnabled('undo'), 'still affordable after one purchase');

  let modalShown = 0;
  mock.showModal = (opts) => { modalShown++; opts.success({ confirm: true, cancel: false }); };
  tapAt(undoBtn.x, undoBtn.y);
  stepFrames(2, 16);
  assertEq(modalShown, 0, 'empty stack must not open modal');
  assertEq(app.toast.msg, '没有可撤销的操作', 'empty stack toasts');
  assertEq(SaveManager.getCoins(), 80, 'empty stack spends nothing');

  tapAt(scr.x, scr.y);
  stepFrames(30, 20);
  assertEq(game.slotManager.count(), 1, 'collected again for cancel case');

  // 全局最优提示：目标被移出视野也照常成立，确认后相机自动转过去对齐
  app.camCtrl.setTarget([0, 0, -60]);
  stepFrames(1, 16);
  let hintModals = 0;
  mock.showModal = (opts) => { hintModals++; opts.success({ confirm: true, cancel: false }); };
  const hintBtn = app.topBar.buttons.find(b => b.id === 'hint');
  tapAt(hintBtn.x, hintBtn.y);
  stepFrames(2, 16);
  assertEq(hintModals, 1, 'off-view target still opens the confirm modal (global optimum)');
  assertEq(SaveManager.getCoins(), 50, 'hint bought via confirmed modal');
  assertEq(game.hintUsed, true, 'hint consumed');
  assert(app.hintMarker.target, 'hint marker placed');
  assertEq(app.camCtrl.targetPitch, app.camCtrl.pitchMax, 'hint raises pitch to the least-occluded angle');
  stepFrames(60, 16);
  assert(Math.abs(app.camCtrl.target[2] + 60) > 30,
    'camera glides back onto the hinted screw, target z=' + app.camCtrl.target[2].toFixed(1));

  mock.showModal = (opts) => opts.success({ confirm: false, cancel: true });
  tapAt(undoBtn.x, undoBtn.y);
  stepFrames(2, 16);
  assertEq(SaveManager.getCoins(), 50, 'cancelled modal spends nothing');
  assertEq(game.slotManager.count(), 1, 'cancelled undo changes nothing');

  Platform.inject(null);
  delete require.cache[require.resolve('../js/main')];
});

test('fail panel coin rescue undoes the last step and charges only on success', () => {
  let clock = 0;
  const frames = [];
  const mock = require('../js/platform/Platform').createMockPlatform({
    createCanvas: () => null,
    raf: (cb) => { frames.push(cb); return frames.length; },
    now: () => clock
  });
  const Platform = require('../js/platform/Platform');
  const SaveManager = require('../js/core/SaveManager');
  Platform.inject(mock);

  delete require.cache[require.resolve('../js/main')];
  const bootstrap = require('../js/main');
  const app = bootstrap();

  const stepFrames = (n, dtMs) => {
    for (let i = 0; i < n; i++) {
      clock += dtMs;
      const cb = frames.shift();
      cb(clock);
    }
  };
  const tapAt = (x, y) => {
    mock.touchHandlers.start.forEach(h => h({ touches: [{ identifier: 0, clientX: x, clientY: y }], changedTouches: [{ identifier: 0, clientX: x, clientY: y }] }));
    mock.touchHandlers.end.forEach(h => h({ touches: [], changedTouches: [{ identifier: 0, clientX: x, clientY: y }] }));
  };

  stepFrames(2, 16);
  app.tutorial.done();

  SaveManager.addCoins(100);

  const game = app.game;
  const cap = game.slotManager.capacity;
  const palette = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
  const forceLose = () => {
    game.slotManager.slots = palette.slice(0, cap);
    game.state = 'lose';
    app.bus.emit('LEVEL_LOSE', { level: app.currentLevelId, slots: game.slotManager.slots.slice() });
    stepFrames(2, 16);
  };
  const coinBtn = () => app.failPanel.buttons.find(b => b.id === 'coinUndo');
  const tapCoinBtn = () => {
    const b = coinBtn();
    assert(b, 'coin rescue button offered');
    tapAt(b.x + b.w / 2, b.y + b.h / 2);
    stepFrames(2, 16);
  };

  assertEq(game.undoStack.size(), 0, 'fresh level has empty undo stack');
  forceLose();
  assert(app.failPanel.visible && app.failPanel.coinOffered, 'coin rescue offered when affordable');
  tapCoinBtn();
  assertEq(SaveManager.getCoins(), 100, 'impossible undo spends nothing');
  assertEq(app.toast.msg, '没有可撤销的操作', 'player told why nothing happened');
  assertEq(game.state, 'lose', 'still in fail state');
  assert(app.failPanel.visible, 'fail panel stays for other choices');
  assertEq(game.adUndoLeft, 0, 'no quota leak on denied rescue');

  game.state = 'playing';
  game.slotManager.slots = [];
  app.bus.emit('SLOT_UPDATED', { slots: [], arrivedIndex: -1 });
  app.failPanel.hide();
  stepFrames(2, 16);

  const target = game.screwManager.screws.find(s => s.state === 'unlocked');
  assert(target, 'unlocked screw exists');
  const stamp = app.scene.beginFrame();
  const wp = target.node.worldPos(stamp);
  const scr = app.camera.project([wp[0], wp[1] + 0.06, wp[2]]);
  assert(scr, 'screw visible');
  tapAt(scr.x, scr.y);
  stepFrames(40, 20);
  assertEq(game.slotManager.count(), 1, 'one screw collected');
  const remainingAfterCollect = game.boardById[target.boardId].remaining;

  forceLose();
  tapCoinBtn();
  assertEq(SaveManager.getCoins(), 50, 'charged after the undo executed');
  assertEq(game.state, 'playing', 'rescued back to playing');
  assertEq(game.slotManager.count(), 0, 'slot snapshot before the last screw restored');
  assertEq(game.boardById[target.boardId].remaining, remainingAfterCollect + 1, 'screw returned to its board');
  assertEq(target.state, 'unlocked', 'screw collectable again');
  assertEq(target.node.parent, target.holeNode, 'screw node reattached to its hole');
  assertEq(app.failPanel.visible, false, 'fail panel closed');
  assertEq(app.levelStats.rescues, 1, 'rescue counted once');

  Platform.inject(null);
  delete require.cache[require.resolve('../js/main')];
});

test('undo falls back to rewarded video when coins run short', () => {
  let clock = 0;
  const frames = [];
  const mock = require('../js/platform/Platform').createMockPlatform({
    createCanvas: () => null,
    raf: (cb) => { frames.push(cb); return frames.length; },
    now: () => clock
  });
  const Platform = require('../js/platform/Platform');
  const SaveManager = require('../js/core/SaveManager');
  Platform.inject(mock);

  delete require.cache[require.resolve('../js/main')];
  const bootstrap = require('../js/main');
  const app = bootstrap();

  const stepFrames = (n, dtMs) => {
    for (let i = 0; i < n; i++) {
      clock += dtMs;
      const cb = frames.shift();
      cb(clock);
    }
  };
  const tapAt = (x, y) => {
    mock.touchHandlers.start.forEach(h => h({ touches: [{ identifier: 0, clientX: x, clientY: y }], changedTouches: [{ identifier: 0, clientX: x, clientY: y }] }));
    mock.touchHandlers.end.forEach(h => h({ touches: [], changedTouches: [{ identifier: 0, clientX: x, clientY: y }] }));
  };

  stepFrames(2, 16);
  app.tutorial.done();
  clock = 50000;

  SaveManager.addCoins(10);

  const game = app.game;
  const target = game.screwManager.screws.find(s => s.state === 'unlocked');
  assert(target, 'collectable screw found');
  const stamp = app.scene.beginFrame();
  const wp = target.node.worldPos(stamp);
  const scr = app.camera.project([wp[0], wp[1] + 0.06, wp[2]]);
  tapAt(scr.x, scr.y);
  stepFrames(30, 20);
  assertEq(game.slotManager.count(), 1, 'one screw collected');

  game.freeUndoLeft = 0;
  game.adUndoLeft = 0;
  const undoBtn = app.topBar.buttons.find(b => b.id === 'undo');
  assert(app.topBar.isEnabled('undo'), 'undo stays lit: ad fallback exists');
  tapAt(undoBtn.x, undoBtn.y);
  stepFrames(2, 16);
  assertEq(game.slotManager.count(), 0, 'video-funded undo restored the slot');
  assertEq(SaveManager.getCoins(), 10, 'no coins touched');
  assertEq(game.adUndoLeft, 0, 'granted credit spent by the undo itself');
  assertEq(game.state, 'playing');

  tapAt(scr.x, scr.y);
  stepFrames(30, 20);
  assertEq(game.slotManager.count(), 1, 'collected again for the lose-state undo leg');
  game.slotManager.slots = ['red', 'blue', 'green', 'yellow', 'purple'];
  game.state = 'lose';
  app.bus.emit('LEVEL_LOSE', { level: app.currentLevelId, slots: game.slotManager.slots.slice() });
  stepFrames(2, 16);
  assert(app.failPanel.visible, 'fail panel up again');
  clock += 50000;
  tapAt(undoBtn.x, undoBtn.y);
  stepFrames(2, 16);
  assertEq(game.state, 'playing', 'top-bar ad undo rescues from lose');
  assertEq(game.slotManager.count(), 0, 'snapshot before the last screw restored');
  assertEq(app.failPanel.visible, false, 'UNDO_DONE closes the stale fail panel');

  Platform.inject(null);
  delete require.cache[require.resolve('../js/main')];
});

test('level select hosts the persistent template banner', () => {
  let clock = 0;
  const frames = [];
  const created = [];
  const mock = require('../js/platform/Platform').createMockPlatform({
    createCanvas: () => null,
    raf: (cb) => { frames.push(cb); return frames.length; },
    now: () => clock,
    createCustomAd: (o) => {
      const a = {
        style: o.style,
        shown: 0,
        hidden: 0,
        isShow: false,
        show() { this.shown++; this.isShow = true; return Promise.resolve(); },
        hide() { this.hidden++; this.isShow = false; return Promise.resolve(); },
        onError() {}, onLoad() {}, onResize() {}
      };
      created.push(a);
      return a;
    }
  });
  const Platform = require('../js/platform/Platform');
  const SaveManager = require('../js/core/SaveManager');
  Platform.inject(mock);

  delete require.cache[require.resolve('../js/main')];
  const bootstrap = require('../js/main');
  const app = bootstrap();

  const stepFrames = (n, dtMs) => {
    for (let i = 0; i < n; i++) {
      clock += dtMs;
      const cb = frames.shift();
      cb(clock);
    }
  };
  const tapAt = (x, y) => {
    mock.touchHandlers.start.forEach(h => h({ touches: [{ identifier: 0, clientX: x, clientY: y }], changedTouches: [{ identifier: 0, clientX: x, clientY: y }] }));
    mock.touchHandlers.end.forEach(h => h({ touches: [], changedTouches: [{ identifier: 0, clientX: x, clientY: y }] }));
  };

  stepFrames(2, 16);
  SaveManager.setTutorialDone();
  app.tutorial.done();
  app.showMenu();
  stepFrames(2, 16);

  const ad = created[0];
  assert(ad, 'template ad instance created');
  assertEq(created.length, 1, 'only the visible surface unit is created (lazy)');
  assertEq(app.templateAds.levelSelect.active, true, 'banner live on level select');
  assertEq(ad.isShow, true);
  assertEq(app.levelSelect.viewBottom, 667 - app.levelSelect.bottomReserve, 'grid shortened for the banner');
  assert(app.levelSelect.viewBottom <= ad.style.top, 'grid ends above the banner');
  assertEq(app.levelSelect.hitTest(187, 600), null, 'banner zone yields no cell hits');

  const c1 = app.levelSelect.cells[0];
  tapAt(c1.x + c1.w / 2, c1.y + c1.h / 2);
  stepFrames(2, 16);
  assertEq(app.currentLevelId, 1, 'level entered');
  assertEq(app.templateAds.levelSelect.active, false, 'banner hidden during gameplay');
  assertEq(ad.isShow, false);

  const pauseBtn = app.topBar.buttons.find(b => b.id === 'pause');
  tapAt(pauseBtn.x, pauseBtn.y);
  stepFrames(2, 16);
  assertEq(app.pausePanel.visible, true);
  assertEq(created.length, 1, 'pause must NOT create a second CustomAd object (each one carries base-library lifecycle listeners)');
  assertEq(app.templateAds.pause, app.templateAds.levelSelect, 'levelSelect/pause/result share one banner instance');
  assertEq(app.templateAds.result, app.templateAds.levelSelect, 'result surface reuses the same instance too');
  assertEq(ad.isShow, true, 'shared banner re-shown on pause surface');

  Platform.inject(null);
  delete require.cache[require.resolve('../js/main')];
});
test('ad-funded extra hints keep working after the free one', () => {
  let clock = 0;
  const frames = [];
  const Platform = require('../js/platform/Platform');
  const SaveManager = require('../js/core/SaveManager');
  const mock = Platform.createMockPlatform({
    createCanvas: () => null,
    raf: (cb) => { frames.push(cb); return frames.length; },
    now: () => clock
  });
  Platform.inject(mock);
  delete require.cache[require.resolve('../js/main')];
  const app = require('../js/main')();
  const stepFrames = (n, dtMs) => {
    for (let i = 0; i < n; i++) { clock += dtMs; const cb = frames.shift(); if (cb) cb(clock); }
  };
  const tapAt = (x, y) => {
    mock.touchHandlers.start.forEach(h => h({ touches: [{ identifier: 0, clientX: x, clientY: y }], changedTouches: [{ identifier: 0, clientX: x, clientY: y }] }));
    mock.touchHandlers.end.forEach(h => h({ touches: [], changedTouches: [{ identifier: 0, clientX: x, clientY: y }] }));
  };

  stepFrames(2, 16);
  SaveManager.setTutorialDone();
  app.tutorial.done();
  app.startLevelById(2);
  stepFrames(2, 16);
  const game = app.game;
  game.hintUsed = true;
  app.hintMarker.clear();

  const hintBtn = app.topBar.buttons.find(b => b.id === 'hint');
  assert(app.topBar.isEnabled('hint'), 'hint button stays lit for ad-funded extras');

  let hintModals = 0;
  mock.showModal = (opts) => {
    hintModals++;
    assert(opts.content.indexOf('再获得 1 次提示') >= 0, 'confirm copy offers one extra hint');
    opts.success({ confirm: true, cancel: false });
  };
  tapAt(hintBtn.x, hintBtn.y);
  stepFrames(2, 16);
  assertEq(hintModals, 1, 'extra hint must ask for confirmation first');
  assert(app.hintMarker.target, 'confirmed → ad-funded extra hint placed a marker');

  app.hintMarker.clear();
  mock.showModal = (opts) => { hintModals++; opts.success({ confirm: false, cancel: true }); };
  tapAt(hintBtn.x, hintBtn.y);
  stepFrames(2, 16);
  assertEq(hintModals, 2, 'cancel path still opens the modal');
  assertEq(app.hintMarker.target, null, 'cancelled confirm must not run any ad/hint logic');

  mock.showModal = (opts) => { hintModals++; opts.success({ confirm: true, cancel: false }); };
  tapAt(hintBtn.x, hintBtn.y);
  stepFrames(2, 16);
  assert(app.hintMarker.target, 'extra hints are repeatable after a cancel');
  assertEq(app.toast.msg, '', 'no "already used" toast on the ad path');

  Platform.inject(null);
  delete require.cache[require.resolve('../js/main')];
});

test('poor-player hint asks for confirmation before the rewarded path', () => {
  let clock = 0;
  const frames = [];
  const Platform = require('../js/platform/Platform');
  const SaveManager = require('../js/core/SaveManager');
  const mock = Platform.createMockPlatform({
    createCanvas: () => null,
    raf: (cb) => { frames.push(cb); return frames.length; },
    now: () => clock
  });
  Platform.inject(mock);
  delete require.cache[require.resolve('../js/main')];
  const app = require('../js/main')();
  const stepFrames = (n, dtMs) => {
    for (let i = 0; i < n; i++) { clock += dtMs; const cb = frames.shift(); if (cb) cb(clock); }
  };
  const tapAt = (x, y) => {
    mock.touchHandlers.start.forEach(h => h({ touches: [{ identifier: 0, clientX: x, clientY: y }], changedTouches: [{ identifier: 0, clientX: x, clientY: y }] }));
    mock.touchHandlers.end.forEach(h => h({ touches: [], changedTouches: [{ identifier: 0, clientX: x, clientY: y }] }));
  };
  stepFrames(2, 16);
  SaveManager.setTutorialDone();
  app.tutorial.done();
  app.startLevelById(2);
  stepFrames(2, 16);
  assert(SaveManager.getCoins() < 30, 'fixture is coin-poor');

  const hintBtn = app.topBar.buttons.find(b => b.id === 'hint');
  const modals = [];
  mock.showModal = (opts) => { modals.push(opts); opts.success({ confirm: false, cancel: true }); };
  tapAt(hintBtn.x, hintBtn.y);
  stepFrames(2, 16);
  assertEq(modals.length, 1, 'coin-poor hint must open a confirm modal');
  assert(modals[0].content.indexOf('金币不足') >= 0, 'copy explains insufficient coins: ' + modals[0].content);
  assertEq(app.hintMarker.target, null, 'cancel closes the modal and does nothing else');
  assertEq(app.game.hintUsed, false);

  mock.showModal = (opts) => { modals.push(opts); opts.success({ confirm: true, cancel: false }); };
  tapAt(hintBtn.x, hintBtn.y);
  stepFrames(2, 16);
  assertEq(modals.length, 2);
  assert(app.hintMarker.target, 'confirm → ad-funded hint placed (mock provider grants)');
  assertEq(app.game.hintUsed, true, 'hint consumed via the rewarded path');

  Platform.inject(null);
  delete require.cache[require.resolve('../js/main')];
});

test('fail-panel retry requires finishing the rewarded video', () => {
  let clock = 0;
  const frames = [];
  const Platform = require('../js/platform/Platform');
  const SaveManager = require('../js/core/SaveManager');
  let closeCb = null;
  const fakeRewarded = {
    onClose(cb) { closeCb = cb; },
    onError() {},
    show() { return Promise.resolve(); },
    load() { return Promise.resolve(); }
  };
  const mock = Platform.createMockPlatform({
    createCanvas: () => null,
    createRewardedVideoAd: () => fakeRewarded,
    raf: (cb) => { frames.push(cb); return frames.length; },
    now: () => clock,
    storage: {
      screwmaster_tutorial: '1',
      screwmaster_progress: JSON.stringify({ unlockedLevel: 3 })
    }
  });
  Platform.inject(mock);
  delete require.cache[require.resolve('../js/main')];
  const app = require('../js/main')();
  const stepFrames = (n, dtMs) => {
    for (let i = 0; i < n; i++) { clock += dtMs; const cb = frames.shift(); if (cb) cb(clock); }
  };
  const tapAt = (x, y) => {
    mock.touchHandlers.start.forEach(h => h({ touches: [{ identifier: 0, clientX: x, clientY: y }], changedTouches: [{ identifier: 0, clientX: x, clientY: y }] }));
    mock.touchHandlers.end.forEach(h => h({ touches: [], changedTouches: [{ identifier: 0, clientX: x, clientY: y }] }));
  };
  stepFrames(2, 16);
  app.startLevelById(2);
  stepFrames(2, 16);

  app.game.slotManager.slots = ['red', 'blue', 'yellow', 'green', 'purple'];
  app.game.state = 'lose';
  app.bus.emit('LEVEL_LOSE', { level: app.currentLevelId, slots: app.game.slotManager.slots.slice() });
  stepFrames(2, 16);
  assert(app.failPanel.visible, 'fail panel up');
  const retryBtn = app.failPanel.buttons.find(b => b.id === 'retry');
  assert(retryBtn && retryBtn.label.indexOf('重新挑战') >= 0, 'retry label carries the reward word: ' + (retryBtn && retryBtn.label));

  tapAt(retryBtn.x, retryBtn.y);
  stepFrames(2, 16);
  assert(app.failPanel.visible, 'no restart before the video settles');
  closeCb({ isEnded: false });
  stepFrames(2, 16);
  assert(app.failPanel.visible, 'skipping the video must not restart the level');
  assert(app.toast.msg.indexOf('未完成') >= 0, 'skip explains why: ' + app.toast.msg);

  let audioResumes = 0;
  const realWebResume = app.audio.webResume.bind(app.audio);
  app.audio.webResume = () => { audioResumes++; realWebResume(); };
  tapAt(retryBtn.x, retryBtn.y);
  stepFrames(2, 16);
  assert(closeCb, 'second attempt re-armed the ad');
  closeCb({ isEnded: true });
  stepFrames(2, 16);
  assertEq(app.failPanel.visible, false, 'finished video restarts the level');
  assertEq(app.currentLevelId, 2, 'same level restarted');
  assertEq(app.game.state, 'playing', 'fresh attempt is playable');
  assert(audioResumes >= 1, 'reward settlement restores the audio session (ad takes it over)');

  Platform.inject(null);
  delete require.cache[require.resolve('../js/main')];
});
