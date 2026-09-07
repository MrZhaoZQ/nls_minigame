'use strict';

const Platform = require('../js/platform/Platform');

let clock = 0;
const frames = [];
const mock = Platform.createMockPlatform({
  createCanvas: () => null,
  raf: (cb) => { frames.push(cb); return frames.length; },
  now: () => clock
});
Platform.inject(mock);

const main = require('../js/main');
const bootstrap = main;
const app = bootstrap();

function stepFrames(n, dtMs) {
  for (let i = 0; i < n; i++) {
    clock += dtMs;
    const cb = frames.shift();
    if (!cb) throw new Error('no frame scheduled');
    cb(clock);
  }
}

function tapAt(x, y) {
  mock.touchHandlers.start.forEach(h => h({
    touches: [{ identifier: 0, clientX: x, clientY: y }],
    changedTouches: [{ identifier: 0, clientX: x, clientY: y }]
  }));
  mock.touchHandlers.end.forEach(h => h({
    touches: [],
    changedTouches: [{ identifier: 0, clientX: x, clientY: y }]
  }));
}

function pitchUp() {
  mock.touchHandlers.start.forEach(h => h({
    touches: [{ identifier: 0, clientX: 180, clientY: 400 }],
    changedTouches: [{ identifier: 0, clientX: 180, clientY: 400 }]
  }));
  mock.touchHandlers.move.forEach(h => h({
    touches: [{ identifier: 0, clientX: 180, clientY: 280 }],
    changedTouches: [{ identifier: 0, clientX: 180, clientY: 280 }]
  }));
  mock.touchHandlers.end.forEach(h => h({
    touches: [],
    changedTouches: [{ identifier: 0, clientX: 180, clientY: 280 }]
  }));
}

function rotateView() {
  mock.touchHandlers.start.forEach(h => h({
    touches: [{ identifier: 0, clientX: 150, clientY: 300 }],
    changedTouches: [{ identifier: 0, clientX: 150, clientY: 300 }]
  }));
  mock.touchHandlers.move.forEach(h => h({
    touches: [{ identifier: 0, clientX: 210, clientY: 300 }],
    changedTouches: [{ identifier: 0, clientX: 210, clientY: 300 }]
  }));
  mock.touchHandlers.end.forEach(h => h({
    touches: [],
    changedTouches: [{ identifier: 0, clientX: 210, clientY: 300 }]
  }));
}

const Levels = require('../js/levels/index');
const total = require('../js/config/GameConfig').levels.totalShipped;
const results = [];

for (let id = 1; id <= total; id++) {
  app.startLevelById(id);
  stepFrames(3, 20);
  pitchUp();
  stepFrames(10, 20);
  const game = app.game;
  let moves = 0;
  let undoUsed = 0;
  let clearUsed = 0;
  let safety = 0;
  let rotCount = 0;

  while (game.totalRemainingOnBoards() > 0 && safety++ < 2000) {
    if (app.tutorial.active && app.tutorial.step === 2) {
      const tb = app.tutorial.btn;
      tapAt(tb.x + tb.w / 2, tb.y + tb.h / 2);
      stepFrames(2, 20);
    }
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

    const scored = [];
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
      scored.push({ s, score });
    }
    scored.sort((a, b) => b.score - a.score);

    const st = app.scene.beginFrame();
    let target = null;
    let scr = null;
    for (let i = 0; i < scored.length; i++) {
      const cand = scored[i].s;
      const wp = cand.node.worldPos(st);
      const p = app.camera.project([wp[0], wp[1] + 0.06, wp[2]]);
      if (!p) continue;
      if (!app.input.locked &&
          game.raycaster.tryPick(p.x, p.y, game.screwManager.screws, game.boards, st) === cand) {
        target = cand;
        scr = p;
        break;
      }
    }
    if (!target) {
      rotCount++;
      if (rotCount > 24) break;
      rotateView();
      stepFrames(3, 20);
      continue;
    }
    rotCount = 0;

    tapAt(scr.x, scr.y);
    moves++;

    if (game.state !== 'screwing') {
      stepFrames(3, 25);
      if (game.state !== 'screwing') continue;
    }

    let waited = 0;
    while ((game.state === 'screwing' || game.isCollapsePending()) && waited < 200) {
      stepFrames(1, 25);
      waited++;
    }
    stepFrames(2, 25);

    if (game.state === 'lose') {
      if (undoUsed < 3 && game.undoStack.size() > 0) {
        game.adUndoLeft += 1;
        game.undo();
        undoUsed++;
        app.failPanel.hide();
        stepFrames(2, 25);
      } else if (clearUsed < 3) {
        game.adUndoLeft += 1;
        game.clearAnyScrews(3);
        game.state = 'playing';
        clearUsed++;
        app.failPanel.hide();
        stepFrames(2, 25);
      } else {
        break;
      }
    }
    if (game.state === 'win_pending' || game.state === 'win') break;
  }

  while (game.state === 'win_pending' && safety < 4000) {
    stepFrames(1, 40);
    safety++;
    if (game.state === 'win') break;
  }

  if (process.env.DEBUG_LEVEL && String(id) === process.env.DEBUG_LEVEL &&
      game.state !== 'win' && game.totalRemainingOnBoards() > 0) {
    console.log('[dbg] DEADLOCK rotCount=', rotCount, 'state', game.state,
      'collapseBusy', app.collapseMgr.busy, 'queue', app.collapseMgr.queue.length,
      'locked', app.input.locked, 'safety', safety);
    for (const s of game.screwManager.screws) {
      if (s.state === 'locked' || s.state === 'unlocked') {
        console.log('[dbg] left', s.id, s.state, s.boardId);
      }
    }
  }

  results.push({
    level: id,
    win: game.state === 'win',
    moves,
    undoUsed: undoUsed + clearUsed,
    slots: game.slotManager.slots.slice()
  });
  app.resultPanel.hide();
}

let allWin = true;
for (let i = 0; i < results.length; i++) {
  const r = results[i];
  if (!r.win) allWin = false;
  console.log('level ' + r.level + ': ' + (r.win ? 'WIN ' : 'FAIL') +
    ' moves=' + r.moves + ' undo=' + r.undoUsed +
    (r.win ? '' : ' slots=' + JSON.stringify(r.slots)));
}

console.log('================================');
console.log(allWin ? 'ALL ' + total + ' LEVELS CLEARED' : 'SOME LEVELS FAILED');
process.exit(allWin ? 0 : 1);
