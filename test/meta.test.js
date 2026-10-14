'use strict';

const { assert, assertEq, section, test } = require('./harness');
const Platform = require('../js/platform/Platform');
const SaveManager = require('../js/core/SaveManager');
const Tutorial = require('../js/ui/Tutorial');
const LevelSelect = require('../js/ui/LevelSelect');
const PausePanel = require('../js/ui/PausePanel');
const Toast = require('../js/ui/Toast');
const GameClubEntry = require('../js/ui/GameClubEntry');

section('SaveManager meta');

test('tutorial flag persists', () => {
  Platform.inject(Platform.createMockPlatform());
  assertEq(SaveManager.getTutorialDone(), false);
  SaveManager.setTutorialDone();
  assertEq(SaveManager.getTutorialDone(), true);
  Platform.inject(null);
});

test('recordResult keeps best stars and best time', () => {
  Platform.inject(Platform.createMockPlatform());
  SaveManager.recordResult(3, { stars: 1, costMs: 90000, moves: 20 });
  SaveManager.recordResult(3, { stars: 3, costMs: 120000, moves: 18 });
  const rec = SaveManager.getResults()[3];
  assertEq(rec.stars, 3);
  assertEq(rec.bestMs, 90000);
  Platform.inject(null);
});

section('Tutorial');

test('steps advance drag -> collect -> confirm', () => {
  const t = new Tutorial();
  t.start();
  assertEq(t.step, 0);
  t.notifyDrag();
  assertEq(t.step, 1);
  t.notifyDrag();
  assertEq(t.step, 1);
  t.notifyCollected();
  assertEq(t.step, 2);
  assertEq(t.hitTest(0, 0), null);
  t.btn = { x: 100, y: 100, w: 120, h: 40 };
  assertEq(t.hitTest(150, 120), 'ok');
  t.done();
  assertEq(t.active, false);
});

test('collect during step0 skips straight to confirm (tap-only players)', () => {
  const t = new Tutorial();
  t.start();
  t.notifyCollected();
  assertEq(t.step, 2, 'never-dragging player must not stay stuck on the swipe bubble');
  t.done();
});

section('LevelSelect');

test('locked levels rejected, unlocked returned', () => {
  const ls = new LevelSelect(375, 667, { bottom: 58 });
  ls.show({ levels: [1, 2, 3, 4, 5], unlocked: 2, results: {}, capacity: 5 });
  const c1 = ls.cells[0];
  const c3 = ls.cells[2];
  assertEq(ls.hitTest(c1.x + 5, c1.y + 5), { type: 'level', id: 1 });
  assertEq(ls.hitTest(c3.x + 5, c3.y + 5), { type: 'locked' });
});

test('hidden panel ignores hits', () => {
  const ls = new LevelSelect(375, 667, { bottom: 58 });
  assertEq(ls.hitTest(20, 200), null);
});

test('grid stays clear of the bottom banner reserve', () => {
  const ls = new LevelSelect(375, 667, { bottom: 58 });
  const list = [];
  for (let i = 1; i <= 30; i++) list.push(i);
  ls.show({ levels: list, unlocked: 30, results: {}, capacity: 5, bottomReserve: 144 });
  assertEq(ls.viewBottom, 667 - 144);
  assertEq(ls.hitTest(187, 667 - 70), null, 'banner zone is not hittable');
  ls.onDrag(-5000);
  ls._layout();
  for (let i = 0; i < ls.cells.length; i++) {
    const cy = ls.cells[i].y + ls.cells[i].h / 2;
    if (cy > ls.viewTop - 4) {
      assert(cy <= ls.viewBottom + 4, 'visible cell centers stay above the reserve');
    }
  }
});

section('PausePanel');

test('pause buttons hit', () => {
  const pp = new PausePanel(375, 667);
  pp.show({ muted: false });
  const resume = pp.buttons.find(b => b.id === 'resume');
  const sound = pp.buttons.find(b => b.id === 'sound');
  assertEq(pp.hitTest(resume.x + 5, resume.y + 5), 'resume');
  assertEq(pp.hitTest(sound.x + 5, sound.y + 5), 'sound');
  assertEq(sound.label, '音效：开');
  pp.muted = true;
  pp._layout();
  const sound2 = pp.buttons.find(b => b.id === 'sound');
  assertEq(sound2.label, '音效：关');
});

section('Coins economy');

test('coins add and spend', () => {
  Platform.inject(Platform.createMockPlatform());
  assertEq(SaveManager.getCoins(), 0);
  SaveManager.addCoins(100);
  assertEq(SaveManager.getCoins(), 100);
  assert(SaveManager.spendCoins(30));
  assertEq(SaveManager.getCoins(), 70);
  assertEq(SaveManager.spendCoins(80), false);
  assertEq(SaveManager.getCoins(), 70);
  Platform.inject(null);
});

test('fail panel shows coin rescue only when affordable', () => {
  const FailPanel = require('../js/ui/FailPanel');
  const f = new FailPanel(375, 667);
  f.show({ coinOffered: true });
  const coin = f.buttons.find(b => b.id === 'coinUndo');
  assert(coin, 'coin button present');
  assertEq(f.hitTest(coin.x + 5, coin.y + 5), 'coinUndo');
  const f2 = new FailPanel(375, 667);
  f2.show({ coinOffered: false });
  assert(!f2.buttons.some(b => b.id === 'coinUndo'));
});

test('fail panel keeps all buttons inside panel bounds', () => {
  const FailPanel = require('../js/ui/FailPanel');
  [true, false].forEach(coinOffered => {
    const f = new FailPanel(375, 667);
    f.show({ undoOffered: true, clearOffered: true, coinOffered: coinOffered });
    assertEq(f.buttons.length, coinOffered ? 4 : 3);
    for (let i = 0; i < f.buttons.length; i++) {
      const b = f.buttons[i];
      assert(b.x >= f.panel.x && b.x + b.w <= f.panel.x + f.panel.w, 'button within panel width');
      assert(b.y >= f.panel.y && b.y + b.h <= f.panel.y + f.panel.h, 'button within panel height');
    }
  });
});

section('GameClubEntry');

test('showAt positions and shows native button', () => {
  const created = [];
  const fakePlatform = {
    createGameClubButton: (opts) => {
      const b = {
        style: opts.style, visible: false,
        show() { this.visible = true; },
        hide() { this.visible = false; },
        onTap() {}, destroy() {}
      };
      created.push(b);
      return b;
    }
  };
  const entry = new GameClubEntry({ platform: fakePlatform });
  entry.showAt(16, 66, 100, 36);
  assertEq(created.length, 1);
  const btn = created[0];
  assertEq(btn.style.left, 16);
  assertEq(btn.style.top, 66);
  assertEq(btn.visible, true);
  entry.hide();
  assertEq(btn.visible, false);
  entry.showAt(20, 30, 220, 36);
  assertEq(btn.style.left, 20);
  assertEq(btn.style.width, 220);
  assertEq(btn.visible, true);
});

test('graceful when API unavailable', () => {
  const entry = new GameClubEntry({ platform: {} });
  entry.showAt(0, 0, 100, 36);
  assertEq(entry.available, false);
  entry.hide();
});

test('repeat showAt same key does not re-show native button', () => {
  let shows = 0;
  let hides = 0;
  const fakeBtn = { style: {}, show() { shows++; }, hide() { hides++; }, destroy() {} };
  const entry = new GameClubEntry({ platform: { createGameClubButton: () => fakeBtn } });
  entry.showAt(10, 20, 87, 32);
  entry.showAt(10, 20, 87, 32);
  entry.showAt(10, 20, 87, 32);
  assertEq(shows, 1, 'same key must not re-show native button');
  entry.showAt(30, 20, 87, 32);
  assertEq(shows, 1, 'move must only update style');
  assertEq(fakeBtn.style.left, 30);
  entry.hide();
  entry.hide();
  assertEq(hides, 2, 'create-hide plus one explicit hide');
  entry.showAt(30, 20, 87, 32);
  assertEq(shows, 2, 'show again after hide');
});

test('throwing native show degrades instead of retrying per frame', () => {
  let shows = 0;
  const badBtn = { style: {}, show() { shows++; throw new Error('native:fail'); }, hide() {}, destroy() {} };
  const entry = new GameClubEntry({ platform: { createGameClubButton: () => badBtn } });
  entry.showAt(10, 20, 87, 32);
  entry.showAt(10, 20, 87, 32);
  entry.showAt(10, 20, 87, 32);
  assertEq(shows, 1, 'must not retry a throwing native show');
  assertEq(entry.available, false, 'degrade to unavailable');
});

section('Toast');

test('toast expires after duration', () => {
  const t = new Toast();
  t.show('hello');
  assertEq(t.msg, 'hello');
  for (let i = 0; i < 100; i++) t.update(0.02);
  assertEq(t.msg, '');
});
