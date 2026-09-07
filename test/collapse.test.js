'use strict';

const { assert, assertEq, section, test } = require('./harness');
const EventBus = require('../js/core/EventBus');
const Events = EventBus.Events;
const TweenManager = require('../js/core/TweenManager');
const Camera = require('../js/render/Camera');
const SceneGraph = require('../js/render/SceneGraph');
const ScrewManager = require('../js/gameplay/ScrewManager');
const SlotManager = require('../js/gameplay/SlotManager');
const GameManager = require('../js/core/GameManager');
const CollapseManager = require('../js/gameplay/CollapseManager');
const ScrewRaycaster = require('../js/interaction/ScrewRaycaster');

function buildGame(levelData) {
  const bus = new EventBus();
  const scene = new SceneGraph();
  const camera = new Camera(375, 667);
  camera.updateFrom(0.5, 0.3, 8, [0, 0, 0], null);
  const tweens = new TweenManager();
  const screwManager = new ScrewManager(tweens);
  const slotManager = new SlotManager();
  const input = { locked: false, setLocked(b) { this.locked = b; } };
  const events = [];
  [Events.LEVEL_WIN, Events.LEVEL_LOSE, Events.BOARD_COLLAPSED].forEach(ev =>
    bus.on(ev, d => events.push({ ev, d })));

  const game = new GameManager({
    bus, scene, camera, camCtrl: null, tweens,
    screwManager, slotManager,
    raycaster: { tryPick: () => null },
    input
  });

  const collapseEvents = [];
  const collapseMgr = new CollapseManager(scene, tweens, {
    onLanding: id => collapseEvents.push({ phase: 'landing', id }),
    onBoardGone: id => { collapseEvents.push({ phase: 'gone', id }); game.onCollapseFinished(id); },
    onQueueChange: a => { if (a) input.setLocked(true); else if (game.state === 'playing') input.setLocked(false); }
  });
  game.collapseMgr = collapseMgr;
  game.onBoardEmptied = id => {
    const b = game.boardById[id];
    if (b) collapseMgr.queueCollapse(b.node);
  };

  game.startLevel(levelData);
  return { game, bus, scene, tweens, screwManager, slotManager, input, events, collapseEvents };
}

function pump(g, seconds) {
  const step = 0.05;
  for (let t = 0; t < seconds; t += step) g.tweens.update(step);
}

const TWO_STACK = {
  id: 10, name: 'stack', colors: ['red', 'blue'], slotCount: 8, gridSize: 4,
  boards: [
    { id: 'b1', prefab: 'Board_Single', position: [0, 0, 0], rotation: [0, 0, 0],
      holes: [
        { id: 'h1', pos: [0, 0, 0.4], color: 'red', coveredBy: ['b2'] },
        { id: 'h2', pos: [1.4, 0, 0], color: 'blue' }
      ] },
    { id: 'b2', prefab: 'Board_Single', position: [0, 1.0, 0], rotation: [0, 0, 0],
      holes: [
        { id: 'h3', pos: [0, 0, 0], color: 'blue' },
        { id: 'h4', pos: [-1.4, 0, 0], color: 'red' }
      ] }
  ]
};

section('CollapseManager');

test('covered screw starts locked', () => {
  const g = buildGame(TWO_STACK);
  const covered = g.game.boardById['b1'].holes.find(h => h.id === 'h1').screw;
  assertEq(covered.state, 'locked');
});

test('emptying top board collapses it and unlocks covered screw', () => {
  const g = buildGame(TWO_STACK);
  const b2 = g.game.boardById['b2'];
  const h3 = b2.holes.find(h => h.id === 'h3').screw;
  const h4 = b2.holes.find(h => h.id === 'h4').screw;
  g.game.beginUnscrew(h3); g.tweens.update(0.5);
  g.game.beginUnscrew(h4); g.tweens.update(0.5);

  assert(g.input.locked, 'input should lock during collapse');
  pump(g, 2.0);

  const gone = g.collapseEvents.filter(e => e.phase === 'gone');
  assertEq(gone.length, 1);
  assertEq(gone[0].id, 'b2');

  const collapsedEvents = g.events.filter(e => e.ev === Events.BOARD_COLLAPSED);
  assertEq(collapsedEvents.length, 1);
  assertEq(collapsedEvents[0].d.boardId, 'b2');
  assertEq(collapsedEvents[0].d.unlocked, 1);

  const covered = g.game.boardById['b1'].holes.find(h => h.id === 'h1').screw;
  assertEq(covered.state, 'unlocked');
  assertEq(g.game.boardById['b2'].node.parent, null);
});

test('collapse lands then unlocks (ordering)', () => {
  const g = buildGame(TWO_STACK);
  const b2 = g.game.boardById['b2'];
  g.game.beginUnscrew(b2.holes[0].screw); g.tweens.update(0.5);
  g.game.beginUnscrew(b2.holes[1].screw); g.tweens.update(0.5);
  pump(g, 2.0);
  const phases = g.collapseEvents.map(e => e.phase);
  assertEq(phases, ['landing', 'gone']);
});

section('Undo');

test('undo restores screw to board and slot snapshot', () => {
  const g = buildGame(TWO_STACK);
  const h2 = g.game.boardById['b1'].holes.find(h => h.id === 'h2').screw;
  g.game.beginUnscrew(h2); g.tweens.update(0.5);
  assertEq(g.slotManager.slots, ['blue']);
  const res = g.game.undo();
  assert(res.ok, 'undo should succeed');
  assertEq(g.slotManager.slots, []);
  assertEq(h2.state, 'unlocked');
  assertEq(h2.node.parent.id, h2.holeNode.id);
  assertEq(g.game.boardById['b1'].remaining, 2);
  assertEq(g.game.freeUndoLeft, 0);
});

test('undo denied when quota exhausted', () => {
  const g = buildGame(TWO_STACK);
  const h2 = g.game.boardById['b1'].holes.find(h => h.id === 'h2').screw;
  g.game.beginUnscrew(h2); g.tweens.update(0.5);
  g.game.undo();
  const second = g.game.undo();
  assertEq(second.ok, false);
  assertEq(second.reason, 'quota');
});

test('undo blocked while collapse pending', () => {
  const g = buildGame(TWO_STACK);
  const b2 = g.game.boardById['b2'];
  g.game.beginUnscrew(b2.holes[0].screw); g.tweens.update(0.5);
  g.game.beginUnscrew(b2.holes[1].screw); g.tweens.update(0.5);
  const res = g.game.undo();
  assertEq(res.ok, false);
  assertEq(res.reason, 'busy');
});

test('undo from lose state resumes play', () => {
  const loseLevel = {
    id: 11, name: 'lose', colors: ['red', 'blue'], slotCount: 2, gridSize: 4,
    boards: [
      { id: 'b1', prefab: 'Board_Single', position: [0, 0, 0], rotation: [0, 0, 0],
        holes: [
          { id: 'h1', pos: [-1.4, 0, 0], color: 'red' },
          { id: 'h2', pos: [0, 0, 0], color: 'red' },
          { id: 'h3', pos: [1.4, 0, 0], color: 'blue' }
        ] }
    ]
  };
  const g = buildGame(loseLevel);
  const holes = g.game.boardById['b1'].holes;
  g.game.beginUnscrew(holes[0].screw); g.tweens.update(0.5);
  g.game.beginUnscrew(holes[1].screw); g.tweens.update(0.5);
  assertEq(g.game.state, 'lose');
  const res = g.game.undo();
  assert(res.ok);
  assertEq(g.game.state, 'playing');
  assertEq(g.slotManager.slots, ['red']);
  assertEq(holes[1].screw.state, 'unlocked');
});

test('collapsed board ops purged from undo stack', () => {
  const g = buildGame(TWO_STACK);
  const b2 = g.game.boardById['b2'];
  g.game.beginUnscrew(b2.holes[0].screw); g.tweens.update(0.5);
  g.game.beginUnscrew(b2.holes[1].screw); g.tweens.update(0.5);
  assertEq(g.game.undoStack.size(), 2);
  pump(g, 2.0);
  assertEq(g.game.undoStack.size(), 0);
});
