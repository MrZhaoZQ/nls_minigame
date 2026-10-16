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
    this._epoch = 0;
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
    // 代次隔离：旧关卡在飞的 tween（拧出动画/塌缩链/胜利延迟）回调一律作废，
    // 防止分享深链暖启动等绕过 input 锁的路径把幻影螺丝/胜局记录/覆盖解锁带进新关卡。
    this._epoch = (this._epoch || 0) + 1;
    if (this.collapseMgr && this.collapseMgr.reset) this.collapseMgr.reset();

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
    const epoch = this._epoch || 0;
    this.screwManager.unscrew(entry, () => {
      if (epoch !== this._epoch) return;
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
        this.bus.emit(Events.MATCH_MADE, {
          color: matches[i], count: removed, combo: matches.length
        });
      }
      this.bus.emit(Events.SLOT_UPDATED, { slots: this.slotManager.slots.slice(), arrivedIndex: -1 });
    }

    if (board.remaining === 0 && this.onBoardEmptied) {
      this.onBoardEmptied(board.id);
    }

    if (this.totalRemainingOnBoards() === 0) {
      this.state = 'win_pending';
      this.releaseInput();
      const winEpoch = this._epoch || 0;
      this.tweens.tween(1.4, {
        onComplete: () => {
          if (winEpoch !== this._epoch) return;
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

  // 提示 = 全候选最优解（不限当前视野）：所有「数据已解锁且几何可点」的螺丝参与评分，
  // 屏幕外/被侧挡的目标也合法——展示时由 focusHint 自动转相机对齐。纯查询，无副作用。
  requestHint() {
    if (this.state !== 'playing') return null;
    const stamp = this.scene.beginFrame();
    return this._bestHintTarget(this._hintCandidates(stamp), stamp);
  }

  _hintCandidates(stamp) {
    const out = [];
    const screws = this.screwManager.screws;
    for (let i = 0; i < screws.length; i++) {
      const s = screws[i];
      if (s.state !== 'unlocked') continue;
      // 数据虽解锁、但仍在某上层板 core 投影内的「观察陷阱」不可点，不能拿来当提示
      if (this.raycaster.isCoreBlocked && this.raycaster.isCoreBlocked(s, this.boardById, stamp)) continue;
      out.push(s);
    }
    return out;
  }

  focusHint(entry) {
    if (!this.camCtrl || !entry || !entry.node) return;
    const stamp = this.scene.beginFrame();
    const wp = entry.node.worldPos(stamp);
    this.camCtrl.focusTarget([wp[0], wp[1], wp[2]]);
    this.camCtrl.raisePitchForHint();
  }

  refreshHint(current) {
    if (this.state !== 'playing') return null;
    const stamp = this.scene.beginFrame();
    const visible = this.raycaster.visibleUnlocked(this.screwManager.screws, this.boards, stamp);
    if (current && visible.indexOf(current) >= 0) return current;
    return this._bestHintTarget(visible, stamp);
  }

  _bestHintTarget(visible, stamp) {
    if (visible.length === 0) return null;
    const cam = this.camera;

    // 槽位协同（主项）：提示必须目标导向，优先引导凑/续同色三连，
    // 防止连续提示把暂存槽塞满互不相干的新色导致卡死（与校验器贪心策略同源）。
    const slots = this.slotManager ? this.slotManager.slots : [];
    const capacity = this.slotManager ? this.slotManager.capacity : 7;
    const slotCounts = {};
    for (let i = 0; i < slots.length; i++) {
      slotCounts[slots[i]] = (slotCounts[slots[i]] || 0) + 1;
    }
    const onBoard = {};
    const screws = this.screwManager ? this.screwManager.screws : [];
    for (let i = 0; i < screws.length; i++) {
      const s = screws[i];
      if (s.state === 'inslot') continue;
      onBoard[s.color] = (onBoard[s.color] || 0) + 1;
    }
    const freeSlots = capacity - slots.length;

    let best = null;
    let bestScore = -Infinity;
    for (let i = 0; i < visible.length; i++) {
      const s = visible[i];
      if (!s.node || typeof s.node.worldPos !== 'function') continue;
      const wp = s.node.worldPos(stamp);

      const cnt = slotCounts[s.color] || 0;
      let synergy;
      if (cnt >= 2) {
        synergy = 1000;                                   // 点下即三连，绝对优先
      } else if (cnt === 1) {
        synergy = 100;                                    // 已在凑对，续同色进度
      } else if (freeSlots <= 1) {
        synergy = -1000;                                  // 仅剩 1 空位，严禁再引新色
      } else {
        synergy = (onBoard[s.color] || 0) >= 3 ? 0 : -50; // 新色但场上凑不齐整组则降权
      }

      // 次项：上层木板优先（每层权重压过满额居中 bonus，先拆上层打开局面）；
      // 末项：当前视野居中 bonus——屏外目标为 0 分但**不弃选**（focusHint 会转相机），
      // 同档位下免得无谓转屏。
      let viewBonus = 0;
      if (cam && typeof cam.project === 'function') {
        const scr = cam.project([wp[0], wp[1] + GameConfig.screw.headHeight * 0.5, wp[2]]);
        if (scr) {
          const nx = (scr.x - cam.screenWidth / 2) / (cam.screenWidth / 2);
          const ny = (scr.y - cam.screenHeight / 2) / (cam.screenHeight / 2);
          const off = Math.min(1, nx * nx + ny * ny);
          viewBonus = (1 - off) * 10;
        }
      }
      const score = synergy + wp[1] * 6 + viewBonus;
      if (score > bestScore) { bestScore = score; best = s; }
    }
    return best || visible[0];
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
