'use strict';

const { assert, assertEq, section, test } = require('./harness');
const EventBus = require('../js/core/EventBus');
const Events = EventBus.Events;
const TweenManager = require('../js/core/TweenManager');
const Camera = require('../js/render/Camera');
const SceneGraph = require('../js/render/SceneGraph');
const ScrewManager = require('../js/gameplay/ScrewManager');
const ScrewRaycaster = require('../js/interaction/ScrewRaycaster');
const SlotManager = require('../js/gameplay/SlotManager');
const GameManager = require('../js/core/GameManager');
const LevelLoader = require('../js/levels/LevelLoader');
const Vec3 = require('../js/math/Vec3');
const Mat3 = require('../js/math/Mat3');

const LEVEL_MATCH = {
  id: 1, name: 't', colors: ['red'], slotCount: 5, gridSize: 4,
  boards: [{
    id: 'b1', prefab: 'Board_Single', position: [0, 0, 0], rotation: [0, 0, 0],
    holes: [
      { id: 'h1', pos: [-1.4, 0, 0], color: 'red' },
      { id: 'h2', pos: [0, 0, 0], color: 'red' },
      { id: 'h3', pos: [1.4, 0, 0], color: 'red' }
    ]
  }]
};

const LEVEL_NOMATCH = {
  id: 2, name: 't2', colors: ['red', 'blue'], slotCount: 2, gridSize: 4,
  boards: [{
    id: 'b1', prefab: 'Board_Single', position: [0, 0, 0], rotation: [0, 0, 0],
    holes: [
      { id: 'h1', pos: [-1.4, 0, 0], color: 'red' },
      { id: 'h2', pos: [0, 0, 0], color: 'red' },
      { id: 'h3', pos: [1.4, 0, 0], color: 'blue' }
    ]
  }]
};

const LEVEL_WINMIX = {
  id: 3, name: 't3', colors: ['red', 'blue', 'green'], slotCount: 5, gridSize: 4,
  boards: [{
    id: 'b1', prefab: 'Board_Single', position: [0, 0, 0], rotation: [0, 0, 0],
    holes: [
      { id: 'h1', pos: [-1.4, 0, 0], color: 'red' },
      { id: 'h2', pos: [0, 0, 0], color: 'blue' },
      { id: 'h3', pos: [1.4, 0, 0], color: 'green' }
    ]
  }]
};

function makeGame(levelData, scriptedPicks) {
  const bus = new EventBus();
  const scene = new SceneGraph();
  const camera = new Camera(375, 667);
  camera.updateFrom(0.6, 0.3, 8, [0, 0, 0], null);
  const tweens = new TweenManager();
  const screwManager = new ScrewManager(tweens);
  const slotManager = new SlotManager();
  const events = [];
  [Events.SCREW_COLLECTED, Events.SLOT_UPDATED, Events.MATCH_MADE, Events.LEVEL_WIN,
   Events.LEVEL_LOSE, Events.SLOT_FULL_WARNING, Events.BOARD_COLLAPSED].forEach(ev => {
    bus.on(ev, d => events.push({ ev, d }));
  });
  const raycaster = { tryPick: () => scriptedPicks.shift() || null };
  const input = { locked: false, setLocked(b) { this.locked = b; } };
  const game = new GameManager({
    bus, scene, camera, camCtrl: null, tweens,
    screwManager, slotManager, raycaster, input
  });
  game.startLevel(levelData);
  return { game, bus, scene, camera, tweens, screwManager, slotManager, events, input };
}

function runPick(g) {
  const tapped = g.game.handleTap(0, 0);
  assert(tapped, 'tap should pick scripted screw');
  g.tweens.update(0.5);
}

section('LevelLoader');

test('loads boards, holes, screws from data', () => {
  const scene = new SceneGraph();
  const tweens = new TweenManager();
  const sm = new ScrewManager(tweens);
  const loader = new LevelLoader();
  const built = loader.load(LEVEL_MATCH, scene, sm);
  assertEq(built.boards.length, 1);
  assertEq(built.boards[0].remaining, 3);
  assertEq(sm.screws.length, 3);
  assert(built.framing.radius >= 1.5);
});

test('coveredBy marks screws locked', () => {
  const scene = new SceneGraph();
  const tweens = new TweenManager();
  const sm = new ScrewManager(tweens);
  const loader = new LevelLoader();
  const data = {
    id: 9, name: 'c', colors: ['red'], slotCount: 5, gridSize: 4,
    boards: [
      { id: 'b1', prefab: 'Board_Single', position: [0, 0, 0], rotation: [0, 0, 0],
        holes: [{ id: 'h1', pos: [0, 0, 0], color: 'red', coveredBy: ['b2'] }] },
      { id: 'b2', prefab: 'Board_Single', position: [0, 1.2, 0], rotation: [0, 0, 0],
        holes: [{ id: 'h2', pos: [0, 0, 0], color: 'red' }] }
    ]
  };
  const built = loader.load(data, scene, sm);
  assertEq(sm.screws[0].state, 'locked');
  assertEq(sm.screws[1].state, 'unlocked');
  assertEq(built.coverages.length, 1);
});

section('ScrewRaycaster');

test('picks unlocked screw at projected position', () => {
  const scene = new SceneGraph();
  const tweens = new TweenManager();
  const sm = new ScrewManager(tweens);
  const loader = new LevelLoader();
  const built = loader.load(LEVEL_MATCH, scene, sm);
  const camera = new Camera(375, 667);
  camera.updateFrom(0.5, 0.35, 7, [0, 0, 0], null);
  const raycaster = new ScrewRaycaster(camera);

  const entry = sm.screws[0];
  const stamp = scene.beginFrame();
  const wp = entry.node.worldPos(stamp);
  const head = Vec3.add(wp, Mat3.transform(entry.node.worldRot(stamp), [0, 0.05, 0]));
  const scr = camera.project(head);
  assert(scr, 'screw should be on screen');
  const picked = raycaster.tryPick(scr.x, scr.y, sm.screws, built.boards, stamp);
  assertEq(picked, entry);
});

test('locked screw cannot be picked', () => {
  const scene = new SceneGraph();
  const tweens = new TweenManager();
  const sm = new ScrewManager(tweens);
  const loader = new LevelLoader();
  const data = {
    id: 9, name: 'c', colors: ['red'], slotCount: 5, gridSize: 4,
    boards: [
      { id: 'b1', prefab: 'Board_Single', position: [0, 0, 0], rotation: [0, 0, 0],
        holes: [{ id: 'h1', pos: [0, 0, 0], color: 'red', coveredBy: ['b2'] }] },
      { id: 'b2', prefab: 'Board_Single', position: [0, 1.2, 0], rotation: [0, 0, 0],
        holes: [{ id: 'h2', pos: [0, 0, 0], color: 'red' }] }
    ]
  };
  const built = loader.load(data, scene, sm);
  const camera = new Camera(375, 667);
  camera.updateFrom(0.5, 0.35, 7, [0, 0, 0], null);
  const raycaster = new ScrewRaycaster(camera);
  const stamp = scene.beginFrame();
  const locked = built.boards[0].holes[0].screw;
  const wp = locked.node.worldPos(stamp);
  const scr = camera.project(Vec3.add(wp, [0, 0.05, 0]));
  const picked = raycaster.tryPick(scr.x, scr.y, sm.screws, built.boards, stamp);
  assert(picked !== locked, 'locked screw must not be pickable');
});

test('screw under another board is occluded', () => {
  const scene = new SceneGraph();
  const tweens = new TweenManager();
  const sm = new ScrewManager(tweens);
  const loader = new LevelLoader();
  const data = {
    id: 9, name: 'c', colors: ['red', 'blue'], slotCount: 5, gridSize: 4,
    boards: [
      { id: 'b1', prefab: 'Board_Single', position: [0, 0, 0], rotation: [0, 0, 0],
        holes: [{ id: 'h1', pos: [0, 0, 0], color: 'red' }] },
      { id: 'b2', prefab: 'Board_Single', position: [0, 0.5, 0], rotation: [0, 0, 0],
        holes: [{ id: 'h2', pos: [1.5, 0, 0], color: 'blue' }] }
    ]
  };
  const built = loader.load(data, scene, sm);
  built.boards[0].holes[0].screw.state = 'unlocked';
  const camera = new Camera(375, 667);
  camera.updateFrom(0, 0.78, 6, [0, 0.3, 0], null);
  const raycaster = new ScrewRaycaster(camera);
  const stamp = scene.beginFrame();
  const lower = built.boards[0].holes[0].screw;
  const wp = lower.node.worldPos(stamp);
  const scr = camera.project(Vec3.add(wp, [0, 0.05, 0]));
  assert(scr, 'visible projection exists');
  const picked = raycaster.tryPick(scr.x, scr.y, sm.screws, built.boards, stamp);
  assert(picked !== lower, 'screw beneath b2 must be blocked, got ' + (picked && picked.id));
});

test('visibleUnlocked hides camera-occluded screws, keeps visible ones', () => {
  const scene = new SceneGraph();
  const tweens = new TweenManager();
  const sm = new ScrewManager(tweens);
  const loader = new LevelLoader();
  const data = {
    id: 9, name: 'c', colors: ['red', 'blue'], slotCount: 5, gridSize: 4,
    boards: [
      { id: 'b1', prefab: 'Board_Single', position: [0, 0, 0], rotation: [0, 0, 0],
        holes: [{ id: 'h1', pos: [0, 0, 0], color: 'red' }] },
      { id: 'b2', prefab: 'Board_Single', position: [0, 0.5, 0], rotation: [0, 0, 0],
        holes: [{ id: 'h2', pos: [0.9, 0, 0], color: 'blue' }] }
    ]
  };
  const built = loader.load(data, scene, sm);
  const camera = new Camera(375, 667);
  camera.updateFrom(0, 0.78, 6, [0, 0.3, 0], null);
  const raycaster = new ScrewRaycaster(camera);
  const stamp = scene.beginFrame();
  const visible = raycaster.visibleUnlocked(sm.screws, built.boards, stamp);
  assertEq(visible.length, 1, 'only the upper screw should be visible');
  assertEq(visible[0].boardId, 'b2');

  camera.updateFrom(0, 0.78, 6, [0, 0.3, 20], null);
  const stamp2 = scene.beginFrame();
  const none = raycaster.visibleUnlocked(sm.screws, built.boards, stamp2);
  assertEq(none.length, 0, 'screws behind the camera are not visible');
});

test('requestHint targets camera-visible screw', () => {
  const bus = new EventBus();
  const scene = new SceneGraph();
  const camera = new Camera(375, 667);
  camera.updateFrom(0, 0.78, 6, [0, 0.3, 0], null);
  const tweens = new TweenManager();
  const screwManager = new ScrewManager(tweens);
  const slotManager = new SlotManager();
  const data = {
    id: 9, name: 'c', colors: ['red', 'blue'], slotCount: 5, gridSize: 4,
    boards: [
      { id: 'b1', prefab: 'Board_Single', position: [0, 0, 0], rotation: [0, 0, 0],
        holes: [{ id: 'h1', pos: [0, 0, 0], color: 'red' }] },
      { id: 'b2', prefab: 'Board_Single', position: [0, 0.5, 0], rotation: [0, 0, 0],
        holes: [{ id: 'h2', pos: [0.9, 0, 0], color: 'blue' }] }
    ]
  };
  const game = new GameManager({
    bus: bus, scene: scene, camera: camera, tweens: tweens,
    screwManager: screwManager, slotManager: slotManager,
    raycaster: new ScrewRaycaster(camera), input: null
  });
  game.startLevel(data);
  const hint = game.requestHint();
  assert(hint, 'a visible hint target exists');
  assertEq(hint.boardId, 'b2', 'hint must skip the camera-occluded first screw');

  camera.updateFrom(0, 0.78, 6, [0, 0.3, 20], null);
  assertEq(game.requestHint(), null, 'no visible screw means no hint target');
});

section('GameManager');

test('collect 3 same color triggers match and clears them', () => {
  const picks = [];
  const g = makeGame(LEVEL_MATCH, picks);
  g.screwManager.screws.forEach(s => picks.push(s));
  runPick(g);
  assertEq(g.slotManager.slots, ['red']);
  runPick(g);
  assertEq(g.slotManager.slots, ['red', 'red']);
  runPick(g);
  assertEq(g.slotManager.slots, []);
  const matches = g.events.filter(e => e.ev === Events.MATCH_MADE);
  assertEq(matches.length, 1);
  assertEq(matches[0].d, { color: 'red', count: 3 });
  assert(!g.input.locked, 'input should be released');
  assertEq(g.game.state, 'win_pending');
});

test('emptying all boards wins', () => {
  const picks = [];
  const g = makeGame(LEVEL_MATCH, picks);
  g.screwManager.screws.forEach(s => picks.push(s));
  runPick(g); runPick(g); runPick(g);
  assertEq(g.slotManager.slots, []);
  assertEq(g.events.filter(e => e.ev === Events.LEVEL_WIN).length, 0);
  g.tweens.update(1.6);
  assertEq(g.events.filter(e => e.ev === Events.LEVEL_WIN).length, 1);
});

test('win even with leftover unmatched screws in slots', () => {
  const picks = [];
  const g = makeGame(LEVEL_WINMIX, picks);
  g.screwManager.screws.forEach(s => picks.push(s));
  runPick(g); runPick(g); runPick(g);
  assertEq(g.slotManager.slots, ['red', 'blue', 'green']);
  g.tweens.update(1.6);
  assertEq(g.events.filter(e => e.ev === Events.LEVEL_WIN).length, 1);
});

test('full slots without match loses', () => {
  const picks = [];
  const g = makeGame(LEVEL_NOMATCH, picks);
  g.screwManager.screws.forEach(s => picks.push(s));
  runPick(g);
  assertEq(g.events.filter(e => e.ev === Events.LEVEL_LOSE).length, 0);
  runPick(g);
  assertEq(g.slotManager.slots, ['red', 'red']);
  const loses = g.events.filter(e => e.ev === Events.LEVEL_LOSE);
  assertEq(loses.length, 1);
  assertEq(g.game.state, 'lose');
});

test('screwing state locks input until done', () => {
  const picks = [];
  const g = makeGame(LEVEL_WINMIX, picks);
  g.screwManager.screws.forEach(s => picks.push(s));
  g.game.handleTap(0, 0);
  assertEq(g.game.state, 'screwing');
  assert(g.input.locked);
  const tappedAgain = g.game.handleTap(0, 0);
  assert(!tappedAgain, 'tap ignored while screwing');
  g.tweens.update(0.5);
  assertEq(g.game.state, 'playing');
  assert(!g.input.locked);
});

test('board emptied fires collapse hook when not the last board', () => {
  const twoBoard = {
    id: 4, name: 't4', colors: ['red', 'blue'], slotCount: 5, gridSize: 4,
    boards: [
      { id: 'b1', prefab: 'Board_Single', position: [0, 0, 0], rotation: [0, 0, 0],
        holes: [
          { id: 'h1', pos: [-1.4, 0, 0], color: 'red' },
          { id: 'h2', pos: [1.4, 0, 0], color: 'red' }
        ] },
      { id: 'b2', prefab: 'Board_Single', position: [0, 1.2, 0], rotation: [0, 0, 0],
        holes: [{ id: 'h3', pos: [0, 0, 0], color: 'blue' }] }
    ]
  };
  const picks = [];
  const g = makeGame(twoBoard, picks);
  const empties = [];
  g.game.onBoardEmptied = id => empties.push(id);
  g.screwManager.screws.forEach(s => picks.push(s));
  runPick(g);
  assertEq(empties, [], 'b1 still has one screw');
  runPick(g);
  assertEq(empties, ['b1'], 'b1 emptied should fire hook');
});
