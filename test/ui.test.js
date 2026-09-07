'use strict';

const { assert, assertEq, section, test } = require('./harness');
const TopBar = require('../js/ui/TopBar');
const SlotUI = require('../js/ui/SlotUI');
const HelpPanel = require('../js/ui/HelpPanel');
const HintMarker = require('../js/ui/HintMarker');
const SceneGraph = require('../js/render/SceneGraph');
const Camera = require('../js/render/Camera');
const EventBus = require('../js/core/EventBus');

const CAPSULE = {
  top: 26, height: 32, bottom: 58,
  left: 281, right: 368, width: 87
};

section('TopBar capsule safety');

test('action buttons right-align with capsule right edge', () => {
  const tb = new TopBar(new EventBus(), 375, 667, CAPSULE);
  const undo = tb.buttons.find(b => b.id === 'undo');
  const hint = tb.buttons.find(b => b.id === 'hint');
  assert(Math.abs(undo.x + undo.r - CAPSULE.right) < 1,
    'undo right edge ' + (undo.x + undo.r) + ' must align capsule.right ' + CAPSULE.right);
  assert(hint.x + hint.r < undo.x - undo.r, 'hint must be left of undo');
  for (let i = 0; i < tb.buttons.length; i++) {
    const b = tb.buttons[i];
    assert(b.y - b.r >= CAPSULE.bottom + 2,
      'button ' + b.id + ' must sit below capsule');
  }
});

test('buttons keep clear of screen edge', () => {
  const tb = new TopBar(new EventBus(), 375, 667, CAPSULE);
  for (let i = 0; i < tb.buttons.length; i++) {
    const b = tb.buttons[i];
    assert(b.x - b.r >= 6, 'button must not touch left edge');
  }
});

test('undo stays enabled while coins can buy one', () => {
  const tb = new TopBar(new EventBus(), 375, 667, CAPSULE);
  tb.setUndoQuota(1);
  assert(tb.isEnabled('undo'), 'enabled with quota');
  tb.setUndoQuota(0);
  tb.undoCoinAffordable = false;
  assertEq(tb.isEnabled('undo'), false, 'grey only when quota empty and coins short');
  tb.undoCoinAffordable = true;
  assert(tb.isEnabled('undo'), 'buyable with coins keeps it lit');
  tb.allDisabled = true;
  assertEq(tb.isEnabled('undo'), false, 'tutorial still overrides');
  tb.allDisabled = false;
  assert(tb.isEnabled('pause'), 'other buttons stay enabled');
});

test('help button exists and sits left of hint', () => {
  const tb = new TopBar(new EventBus(), 375, 667, CAPSULE);
  const help = tb.buttons.find(b => b.id === 'help');
  const hint = tb.buttons.find(b => b.id === 'hint');
  assert(help, 'help button must exist');
  assert(help.x + help.r < hint.x - hint.r, 'help must be left of hint');
  assertEq(tb.hitTest(help.x, help.y), 'help');
});

test('topbar draws all buttons without error', () => {
  const tb = new TopBar(new EventBus(), 375, 667, CAPSULE);
  tb.setLevel('第 1 关');
  tb.setRemaining(6);
  tb.setUndoQuota(2);
  const gradObj = {
    addColorStop() {}
  };
  const ctx = {
    save() {}, restore() {},
    beginPath() {}, closePath() {},
    arc() {}, moveTo() {}, lineTo() {}, stroke() {}, fill() {},
    fillRect() {}, fillText() {},
    createRadialGradient() { return gradObj; },
    set fillStyle(v) {}, get fillStyle() { return ''; },
    set strokeStyle(v) {}, get strokeStyle() { return ''; },
    set lineWidth(v) {}, get lineWidth() { return 1; },
    set lineCap(v) {}, set font(v) {}, set textAlign(v) {},
    set shadowColor(v) {}, set shadowBlur(v) {}, set shadowOffsetY(v) {}
  };
  tb.draw(ctx);
  tb.setUndoQuota(0);
  tb.hintEnabled = true;
  tb.draw(ctx);
});

section('HelpPanel');

test('show/hide and close hit', () => {
  const hp = new HelpPanel(375, 667, CAPSULE);
  assertEq(hp.visible, false);
  hp.show();
  assert(hp.visible);
  assertEq(hp.hitTest(hp.closeBtn.x, hp.closeBtn.y), 'close');
  assert(hp.maxScroll > 0, 'content should be scrollable');
  hp.hide();
  assertEq(hp.visible, false);
});

test('scroll clamps within content', () => {
  const hp = new HelpPanel(375, 667, CAPSULE);
  hp.show();
  hp.onDrag(-10000);
  assertEq(hp.scroll, hp.maxScroll);
  hp.onDrag(10000);
  assertEq(hp.scroll, 0);
});

test('scroll has momentum after release and decays', () => {
  const hp = new HelpPanel(375, 667, CAPSULE);
  hp.show();
  hp.onDrag(-5);
  hp.onDrag(-5);
  hp.onDragEnd(-20);
  const atRelease = hp.scroll;
  for (let i = 0; i < 30; i++) hp.update(1 / 60);
  assert(hp.scroll > atRelease + 10, 'momentum should carry scroll further');
  for (let i = 0; i < 300; i++) hp.update(1 / 60);
  assert(Math.abs(hp.vel) < 0.3, 'momentum must decay');
});

test('content keeps breathing room from panel bottom', () => {
  const hp = new HelpPanel(375, 667, CAPSULE);
  const last = hp.blocks[hp.blocks.length - 1];
  const lastLineBottom = last.y + last.fontSize;
  assert(hp.contentHeight - lastLineBottom >= 30,
    'bottom padding too small: ' + (hp.contentHeight - lastLineBottom));
});

test('help panel covers full width and avoids capsule top', () => {
  const hp = new HelpPanel(375, 667, CAPSULE);
  assert(hp.panel.y >= CAPSULE.bottom + 2, 'panel must start below capsule');
  assert(hp.panel.x >= 10 && hp.panel.w >= 330, 'panel spans screen');
});

test('hitTest hits buttons and ignores capsule zone', () => {
  const tb = new TopBar(new EventBus(), 375, 667, CAPSULE);
  const undo = tb.buttons.find(b => b.id === 'undo');
  const hint = tb.buttons.find(b => b.id === 'hint');
  assertEq(tb.hitTest(undo.x, undo.y), 'undo');
  assertEq(tb.hitTest(hint.x, hint.y), 'hint');
  assertEq(tb.hitTest(CAPSULE.left + 20, CAPSULE.top + 10), null);
  assertEq(tb.hitTest(16, 40), null);
});

test('fallback capsule used when API missing', () => {
  const tb = new TopBar(new EventBus(), 375, 667, null);
  assert(tb.buttons.length === 4);
  const undo = tb.buttons.find(b => b.id === 'undo');
  assert(Math.abs(undo.x + undo.r - (375 - 7)) < 1,
    'fallback undo must align with fallback capsule right edge');
});

section('SlotUI safe area');

test('slot bar lifts above home indicator inset', () => {
  const bus = new EventBus();
  const slot = new SlotUI(bus, 375, 812, 34);
  assertEq(slot.y, 812 - slot.barH - 34);
  assert(slot.y + slot.barH <= 812 - 34 + 1);
});

test('slot bar unchanged without inset', () => {
  const slot = new SlotUI(new EventBus(), 375, 667, 0);
  assertEq(slot.y, 667 - slot.barH);
});

test('slot panel has symmetric vertical padding', () => {
  const slot = new SlotUI(new EventBus(), 375, 812, 34);
  const pr = slot.panelRect();
  const topPad = pr.y - slot.y;
  const bottomPad = (slot.y + slot.barH) - (pr.y + pr.h);
  assertEq(topPad, bottomPad);
  assertEq(slot.y + slot.barH, 812 - 34, 'bar bottom sits exactly on safe area');
  const c0 = slot.slotCenter(0);
  assertEq(c0.y, slot.y + slot.barH / 2, 'screws vertically centered');
});

section('HintMarker');

function makeMarkerScene() {
  const scene = new SceneGraph();
  const node = new SceneGraph.SGNode('screw_x');
  node.position = [0, 0, 0];
  scene.add(node);
  const camera = new Camera(375, 667);
  camera.updateFrom(0.4, 0.3, 7, [0, 0, 0], null);
  const entry = { id: 'e1', node };
  return { scene, camera, entry };
}

test('hint persists until explicitly cleared', () => {
  const hm = new HintMarker();
  const { entry } = makeMarkerScene();
  hm.setTarget(entry);
  for (let i = 0; i < 1000; i++) hm.update(1 / 60);
  assertEq(hm.target, entry, 'marker must not expire on its own');
  hm.clear();
  assertEq(hm.target, null);
});

test('marker auto-clears when target removed from scene', () => {
  const hm = new HintMarker();
  const { scene, camera, entry } = makeMarkerScene();
  hm.setTarget(entry);
  scene.beginFrame();
  const ctx = {
    save() {}, restore() {}, beginPath() {}, closePath() {},
    arc() {}, moveTo() {}, lineTo() {}, stroke() {}, fill() {},
    set strokeStyle(v) {}, set fillStyle(v) {}, set lineWidth(v) {},
    set lineJoin(v) {}, set globalAlpha(v) {}, get globalAlpha() { return 1; }
  };
  hm.draw(ctx, camera, scene);
  assertEq(hm.target, entry);
  entry.node.removeFromParent();
  hm.draw(ctx, camera, scene);
  assertEq(hm.target, null, 'marker must vanish with its screw');
});

test('marker draws ring and arrow each frame', () => {
  const hm = new HintMarker();
  const { scene, camera, entry } = makeMarkerScene();
  hm.setTarget(entry);
  let strokes = 0, fills = 0;
  const ctx = {
    save() {}, restore() {}, beginPath() {}, closePath() {},
    arc() {}, moveTo() {}, lineTo() {},
    stroke() { strokes++; }, fill() { fills++; },
    set strokeStyle(v) {}, set fillStyle(v) {}, set lineWidth(v) {},
    set lineJoin(v) {}, set globalAlpha(v) {}, get globalAlpha() { return 1; }
  };
  scene.beginFrame();
  hm.update(0.1);
  hm.draw(ctx, camera, scene);
  assert(strokes >= 2, 'ring strokes expected, got ' + strokes);
  assert(fills >= 1, 'arrow fill expected, got ' + fills);
});

test('slot UI clears on LEVEL_LOADED (retry)', () => {
  const bus = new EventBus();
  const slot = new SlotUI(bus, 375, 667, 0);
  bus.emit('SLOT_UPDATED', { slots: ['red', 'blue'], arrivedIndex: 1 });
  bus.emit('SLOT_FULL_WARNING', {});
  assertEq(slot.slots, ['red', 'blue']);
  bus.emit('LEVEL_LOADED', {});
  assertEq(slot.slots, []);
  assertEq(slot._pendingIndex, -1);
  assertEq(slot.warning, false);
  assertEq(slot.flights.length, 0);
});
