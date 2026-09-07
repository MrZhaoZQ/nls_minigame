'use strict';

const EventBus = require('./EventBus');
const Events = EventBus.Events;
const LevelLoader = require('../levels/LevelLoader');
const GameConfig = require('../config/GameConfig');
const UndoStack = require('../gameplay/UndoStack');
const Mat3 = require('../math/Mat3');

const SCREWING_LOCK = 'screwing';

class GameManager {
  constructor(deps) {
    this.bus = deps.bus;
    this.scene = deps.scene;
    this.camera = deps.camera;
    this.camCtrl = deps.camCtrl || null;
    this.tweens = deps.tweens;
    this.screwManager = deps.screwManager;
    this.slotManager = deps.slotManager;
    this.raycaster = deps.raycaster;
    this.input = deps.input || null;
    this.inputLock = deps.inputLock || { setLocked(b) {}, isLocked() { return false; } };
    this.onBoardEmptied = deps.onBoardEmptied || null;
    this.collapseDoneHook = null;

    this.loader = new LevelLoader();
    this.state = 'idle';
    this.boards = [];
    this.boardById = {};
    this.coverages = [];
    this.coverageByScrew = new Map();
    this.undoStack = new UndoStack(GameConfig.levels.maxUndoOps);
    this.currentLevel = null;
    this.freeUndoLeft = 1;
    this.adUndoLeft = 0;
    this.hintUsed = false;
    this.collectedCount = 0;
    this.extraCapacity = 0;
    this.collapseMgr = null;
    this.isCollapsePending = function () {
      return this.collapseMgr ? this.collapseMgr.isActive() : false;
    };
  }

  setExtraCapacity(n) {
    this.extraCapacity = Math.max(0, n || 0);
  }

  startLevel(levelData) {
    this.currentLevel = levelData;

    const toRemove = [];
    this.scene.root.traverse(n => {
      if (n !== this.scene.root && n.userData && (n.userData.isBoard || n.userData.boardId)) {
        toRemove.push(n);
      }
    });
    for (let i = 0; i < toRemove.length; i++) toRemove[i].removeFromParent();

    this.screwManager.screws = [];
    this.slotManager.clear();
    this.slotManager.setCapacity(
      (levelData.slotCount || GameConfig.slot.defaultCount) + this.extraCapacity);

    const built = this.loader.load(levelData, this.scene, this.screwManager);
    this.boards = built.boards;
    this.boardById = built.boardById;
    this.coverages = built.coverages;
    this.coverageByScrew = new Map();
    for (let i = 0; i < built.coverages.length; i++) {
      this.coverageByScrew.set(built.coverages[i].screw, built.coverages[i]);
    }
    this.undoStack = new UndoStack(GameConfig.levels.maxUndoOps);
    this.freeUndoLeft = 1;
    this.adUndoLeft = 0;
    this.hintUsed = false;
    this.collectedCount = 0;

    if (this.camCtrl) {
      this.camCtrl.setTarget(built.framing.pivot);
      const dist = Math.max(GameConfig.camera.distMin,
        Math.min(GameConfig.camera.distMax, built.framing.radius * 2.4));
      this.camCtrl.setView(this.camCtrl.yaw, Math.max(12, GameConfig.camera.pitchMin + 20), dist);
    }

    this.state = 'playing';
    this.bus.emit('LEVEL_LOADED', { level: levelData.id });
    return built;
  }

  totalRemainingOnBoards() {
    let n = 0;
    for (let i = 0; i < this.boards.length; i++) n += this.boards[i].remaining;
    return n;
  }

  handleTap(x, y) {
    if (this.state !== 'playing') return false;
    const stamp = this.scene.stamp || 0;
    const unlocked = this.screwManager.screws;
    const entry = this.raycaster.tryPick(x, y, unlocked, this.boards, stamp);
    if (!entry) return false;
    this.beginUnscrew(entry);
    return true;
  }

  beginUnscrew(entry) {
    const worldPos = this.scene.stamp ?
      entry.node.worldPos(this.scene.stamp) : entry.node._worldPos;
    const screenStart = this.camera.project(worldPos);

    this.state = SCREWING_LOCK;
    if (this.input) this.input.setLocked(true);

    const board = this.boardById[entry.boardId];
    this.screwManager.unscrew(entry, () => {
      board.remaining--;
      this.bus.emit(Events.SCREW_COLLECTED, {
        color: entry.color,
        boardId: entry.boardId,
        holeId: entry.holeId,
        screenPos: screenStart ? { x: screenStart.x, y: screenStart.y } : null,
        entry
      });
      this.afterCollected(entry, board);
    });
  }

  afterCollected(entry, board) {
    this.collectedCount++;
    this.undoStack.push({
      entry: entry,
      slotSnapshot: this.slotManager.slots.slice()
    });

    const idx = this.slotManager.add(entry.color);
    this.bus.emit(Events.SLOT_UPDATED, {
      slots: this.slotManager.slots.slice(),
      arrivedIndex: idx,
      color: entry.color
    });

    if (idx < 0) {
      this.state = 'lose';
      this.releaseInput();
      this.bus.emit(Events.LEVEL_LOSE, {
        level: this.currentLevel ? this.currentLevel.id : 0,
        slots: this.slotManager.slots.slice()
      });
      return;
    }

    if (this.slotManager.nearFull() && !this.slotManager.isFull()) {
      this.bus.emit(Events.SLOT_FULL_WARNING, { count: this.slotManager.count() });
    }

    const matches = this.slotManager.findMatches();
    if (matches.length > 0) {
      for (let i = 0; i < matches.length; i++) {
        const removed = this.slotManager.removeMatch(matches[i]);
        this.bus.emit(Events.MATCH_MADE, { color: matches[i], count: removed });
      }
      this.bus.emit(Events.SLOT_UPDATED, { slots: this.slotManager.slots.slice(), arrivedIndex: -1 });
    }

    if (board.remaining === 0 && this.onBoardEmptied) {
      this.onBoardEmptied(board.id);
    }

    if (this.totalRemainingOnBoards() === 0) {
      this.state = 'win_pending';
      this.releaseInput();
      this.tweens.tween(1.4, {
        onComplete: () => {
          this.state = 'win';
          this.bus.emit(Events.LEVEL_WIN, { level: this.currentLevel ? this.currentLevel.id : 0 });
        }
      }).start();
    }

    if (this.slotManager.isFull() && !this.slotManager.hasMatch() &&
        this.totalRemainingOnBoards() > 0) {
      this.state = 'lose';
      this.releaseInput();
      this.bus.emit(Events.LEVEL_LOSE, {
        level: this.currentLevel ? this.currentLevel.id : 0,
        slots: this.slotManager.slots.slice()
      });
      return;
    }

    if (this.state === SCREWING_LOCK) this.state = 'playing';
    this.releaseInput();
  }

  onCollapseFinished(boardId) {
    const unlocked = [];
    for (let i = 0; i < this.coverages.length; i++) {
      const cov = this.coverages[i];
      const idx = cov.boards.indexOf(boardId);
      if (idx >= 0) {
        cov.boards.splice(idx, 1);
        if (cov.boards.length === 0) {
          this.screwManager.setLocked(cov.screw, false);
          unlocked.push(cov.screw);
        }
      }
    }
    this.undoStack.ops = this.undoStack.ops.filter(op => op.entry.boardId !== boardId);
    this.bus.emit(Events.BOARD_COLLAPSED, { boardId, unlocked: unlocked.length });
  }

  releaseInput() {
    if (this.input && !this.isCollapsePending()) this.input.setLocked(false);
  }

  tryUndo() {
    if (this.state !== 'playing' && this.state !== 'lose') return { ok: false, reason: 'state' };
    if (this.isCollapsePending()) return { ok: false, reason: 'busy' };
    if (this.freeUndoLeft <= 0 && this.adUndoLeft <= 0) return { ok: false, reason: 'quota' };
    if (this.undoStack.size() === 0) return { ok: false, reason: 'empty' };
    return { ok: true };
  }

  undo() {
    const check = this.tryUndo();
    if (!check.ok) return check;

    const op = this.undoStack.pop();
    const entry = op.entry;
    const board = this.boardById[entry.boardId];

    this.slotManager.slots = op.slotSnapshot.slice();

    entry.node.position = entry.baseLocalPos.slice();
    entry.node.rotation = Mat3.identity();
    entry.node.alpha = 1;
    entry.node.visible = true;
    entry.holeNode.addChild(entry.node);

    const cov = this.coverageByScrew.get(entry);
    const stillCovered = cov && cov.boards.length > 0;
    entry.state = 'unlocked';
    if (stillCovered) this.screwManager.setLocked(entry, true);

    board.remaining++;

    if (this.freeUndoLeft > 0) this.freeUndoLeft--;
    else this.adUndoLeft--;

    if (this.state === 'lose') this.state = 'playing';

    this.bus.emit(Events.SLOT_UPDATED, { slots: this.slotManager.slots.slice(), arrivedIndex: -1 });
    this.bus.emit('UNDO_DONE', { boardId: entry.boardId, color: entry.color });
    return { ok: true };
  }

  requestHint() {
    if (this.state !== 'playing') return null;
    const stamp = this.scene.beginFrame();
    const visible = this.raycaster.visibleUnlocked(this.screwManager.screws, this.boards, stamp);
    return visible.length > 0 ? visible[0] : null;
  }

  clearAnyScrews(n) {
    if (this.state !== 'lose' && this.state !== 'playing') return false;
    const removed = this.slotManager.slots.splice(0, n);
    if (this.state === 'lose' && this.slotManager.count() < this.slotManager.capacity) {
      this.state = 'playing';
    }
    this.bus.emit(Events.SLOT_UPDATED, { slots: this.slotManager.slots.slice(), arrivedIndex: -1 });
    return removed.length > 0;
  }
}

module.exports = GameManager;
