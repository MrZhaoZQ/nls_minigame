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

  const scene = app.scene;
  const camera = app.camera;
  const game = app.game;

  let wins = 0;
  app.bus.on('LEVEL_WIN', () => { wins++; });

  let safety = 0;
  while (game.totalRemainingOnBoards() > 0 && safety++ < 400) {
    let target = null;
    let fallback = null;
    for (let i = 0; i < game.screwManager.screws.length; i++) {
      const s = game.screwManager.screws[i];
      if (s.state !== 'unlocked') continue;
      if (!fallback) fallback = s;
      if (game.slotManager.slots.indexOf(s.color) >= 0) { target = s; break; }
    }
    if (!target) target = fallback;
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
  stepFrames(60, 20);
  assertEq(wins, 1);
  assert(app.resultPanel.visible, 'result panel shown');

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
  app.syncCoins();

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

  const savedTarget = app.camCtrl.target.slice();
  app.camCtrl.setTarget([0, 0, -60]);
  stepFrames(1, 16);
  let hintModals = 0;
  mock.showModal = (opts) => { hintModals++; opts.success({ confirm: true, cancel: false }); };
  const hintBtn = app.topBar.buttons.find(b => b.id === 'hint');
  tapAt(hintBtn.x, hintBtn.y);
  stepFrames(2, 16);
  assertEq(hintModals, 0, 'hint with nothing visible must not open modal');
  assertEq(app.toast.msg, '当前视角看不到可拆的螺丝，先旋转视角试试');
  assertEq(SaveManager.getCoins(), 80, 'invisible hint spends nothing');
  app.camCtrl.setTarget(savedTarget);
  stepFrames(1, 16);

  tapAt(hintBtn.x, hintBtn.y);
  stepFrames(2, 16);
  assertEq(hintModals, 1, 'visible hint opens the confirm modal');
  assertEq(SaveManager.getCoins(), 50, 'hint bought via confirmed modal');
  assertEq(game.hintUsed, true, 'hint consumed');
  assert(app.hintMarker.target, 'hint marker placed');

  mock.showModal = (opts) => opts.success({ confirm: false, cancel: true });
  tapAt(undoBtn.x, undoBtn.y);
  stepFrames(2, 16);
  assertEq(SaveManager.getCoins(), 50, 'cancelled modal spends nothing');
  assertEq(game.slotManager.count(), 1, 'cancelled undo changes nothing');

  Platform.inject(null);
  delete require.cache[require.resolve('../js/main')];
});
