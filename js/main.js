'use strict';

const Platform = require('./platform/Platform');
const GameConfig = require('./config/GameConfig');
const EventBus = require('./core/EventBus');
const Events = EventBus.Events;
const TweenManager = require('./core/TweenManager');
const Camera = require('./render/Camera');
const Renderer = require('./render/Renderer');
const SceneGraph = require('./render/SceneGraph');
const CameraController = require('./camera/CameraController');
const InputManager = require('./interaction/InputManager');
const ScrewRaycaster = require('./interaction/ScrewRaycaster');
const ScrewManager = require('./gameplay/ScrewManager');
const SlotManager = require('./gameplay/SlotManager');
const GameManager = require('./core/GameManager');
const SlotUI = require('./ui/SlotUI');
const TopBar = require('./ui/TopBar');
const ResultPanel = require('./ui/ResultPanel');
const FailPanel = require('./ui/FailPanel');
const HelpPanel = require('./ui/HelpPanel');
const HintMarker = require('./ui/HintMarker');
const Toast = require('./ui/Toast');
const Tutorial = require('./ui/Tutorial');
const LevelSelect = require('./ui/LevelSelect');
const PausePanel = require('./ui/PausePanel');
const AdManager = require('./ad/AdManager');
const ShareManager = require('./share/ShareManager');
const AudioManager = require('./audio/AudioManager');
const ParticleFX = require('./ui/ParticleFX');
const Levels = require('./levels/index');
const SaveManager = require('./core/SaveManager');

const UNDO_DENIED_TEXT = {
  quota: '撤销次数用完啦',
  empty: '没有可撤销的操作',
  busy: '坍塌中，稍后再试',
  state: '现在不能撤销'
};

function bootstrap() {
  const info = Platform.getSystemInfo();
  const canvas = Platform.createCanvas();

  const app = {
    config: GameConfig,
    bus: new EventBus(),
    screen: { width: info.width, height: info.height, pixelRatio: info.pixelRatio },
    canvas: canvas,
    ctx: null
  };

  function setupCanvas() {
    if (!canvas) return;
    canvas.width = app.screen.width * app.screen.pixelRatio;
    canvas.height = app.screen.height * app.screen.pixelRatio;
    app.ctx = canvas.getContext('2d');
    if (app.ctx) {
      app.ctx.setTransform(app.screen.pixelRatio, 0, 0, app.screen.pixelRatio, 0, 0);
      const g = app.ctx.createLinearGradient(0, 0, 0, app.screen.height);
      g.addColorStop(0, GameConfig.scene.bgTop);
      g.addColorStop(1, GameConfig.scene.bgBottom);
      app.bgGradient = g;
    }
  }
  setupCanvas();

  const scene = new SceneGraph();
  const camera = new Camera(info.width, info.height);
  const camCtrl = new CameraController(camera);
  const tweens = new TweenManager();
  const renderer = new Renderer();

  const screwManager = new ScrewManager(tweens);
  const slotManager = new SlotManager();
  const slotUI = new SlotUI(app.bus, info.width, info.height,
    info.safeArea ? Math.max(0, info.height - info.safeArea.bottom) : 0);

  const game = new GameManager({
    bus: app.bus,
    scene: scene,
    camera: camera,
    camCtrl: camCtrl,
    tweens: tweens,
    screwManager: screwManager,
    slotManager: slotManager,
    raycaster: new ScrewRaycaster(camera),
    input: null
  });
  game.setExtraCapacity(SaveManager.getExtraCapacity());

  const collapseMgr = require('./gameplay/CollapseManager');
  const collapse = new collapseMgr(scene, tweens, {
    onWarn: () => app.bus.emit('COLLAPSE_WARN', {}),
    onLanding: (boardId) => {
      camCtrl.shake(0.1, 0.02);
      const b = game.boardById[boardId];
      if (b && b.node.parent) {
        const stamp = scene.beginFrame();
        const scr = camera.project(b.node.worldPos(stamp));
        if (scr) particles.dust(scr.x, scr.y, 120);
      }
      app.vibrate();
    },
    onBoardGone: (boardId) => game.onCollapseFinished(boardId),
    onQueueChange: (active) => {
      input.setLocked(active);
    }
  });

  game.collapseMgr = collapse;
  game.onBoardEmptied = (boardId) => {
    const b = game.boardById[boardId];
    if (b) collapse.queueCollapse(b.node);
  };

  function capsuleRectOf(w) {
    return Platform.getMenuButtonBoundingClientRect() || {
      top: 26, height: 32, bottom: 58,
      left: w - 94, right: w - 7, width: 87
    };
  }
  let capsuleRect = capsuleRectOf(info.width);
  app.capsule = capsuleRect;
  app.bottomInset = info.safeArea
    ? Math.max(0, info.height - info.safeArea.bottom) : 0;

  const adMgr = new AdManager();
  adMgr.init();
  const shareMgr = new ShareManager();
  const rewardMode = GameConfig.ad.mode === 'ad' ? 'ad' : 'share';
  const rewardProvider = rewardMode === 'ad' ? adMgr : shareMgr;
  const rewardWord = rewardMode === 'ad' ? '看视频' : '邀好友';
  app.adMgr = adMgr;
  app.shareMgr = shareMgr;
  app.rewardProvider = rewardProvider;

  const topBar = new TopBar(app.bus, info.width, info.height, capsuleRect);
  syncCoins();
  const helpPanel = new HelpPanel(info.width, info.height, capsuleRect, { rewardWord });
  const hintMarker = new HintMarker();
  const resultPanel = new ResultPanel(info.width, info.height);
  const failPanel = new FailPanel(info.width, info.height);
  failPanel.undoLabel = rewardWord + ' 撤回最后一步';
  failPanel.clearLabel = rewardWord + ' 移出3颗螺丝';
  resultPanel.doubleLabel = rewardWord + ' 金币翻倍';
  const toast = new Toast();
  const tutorial = new Tutorial();
  const levelSelect = new LevelSelect(info.width, info.height, capsuleRect);
  const pausePanel = new PausePanel(info.width, info.height);

  const particles = new ParticleFX();
  const audio = new AudioManager();
  audio.preload();
  audio.bindGameEvents(app.bus);
  app.lastProgressAt = Platform.now();

  app.scene = scene;
  app.camera = camera;
  app.camCtrl = camCtrl;
  app.renderer = renderer;
  app.game = game;
  app.slotUI = slotUI;
  app.topBar = topBar;
  app.resultPanel = resultPanel;
  app.failPanel = failPanel;
  app.helpPanel = helpPanel;
  app.hintMarker = hintMarker;
  app.toast = toast;
  app.tutorial = tutorial;
  app.levelSelect = levelSelect;
  app.pausePanel = pausePanel;
  app.collapseMgr = collapse;
  app.tweens = tweens;
  app.winBannerTime = 0;
  app.inMenu = false;
  app.levelStartedAt = 0;
  app.levelStats = { undos: 0, rescues: 0 };
  app.stuckHinted = false;
  app.lastWinCoins = 0;
  app.pausedReturn = false;
  app.resumeTouchAt = 0;
  app.slotManager = slotManager;

  const stageNameOf = (id) => id <= 5 ? '新手' : (id <= 15 ? '成长' : (id <= 25 ? '挑战' : '大师'));

  function rewardFailToast(res) {
    if (!res || res.rewarded) return;
    const map = {
      cooldown: '操作太频繁，稍后再试',
      coldStart: '操作太频繁，稍后再试',
      dailyLimit: '今日次数已用完',
      perLevel: '本关次数已用完',
      cancel: '已取消',
      skipped: '未完成，不发放奖励',
      error: '加载失败，稍后再试'
    };
    toast.show(map[res.reason] || '稍后再试');
  }

  function doHint() {
    const screw = game.requestHint();
    if (!screw) return;
    game.hintUsed = true;
    topBar.hintEnabled = false;
    renderer.highlightScrewId = screw.node.id;
    hintMarker.setTarget(screw);
  }

  function syncCoins() {
    app.coins = SaveManager.getCoins();
    topBar.undoCoinAffordable = app.coins >= GameConfig.economy.undoCost;
  }

  function isFrozen() {
    return pausePanel.visible || levelSelect.visible;
  }

  function showMenu() {
    app.inMenu = true;
    app.pausedReturn = false;
    input.setLocked(false);
    const total = GameConfig.levels.totalShipped;
    const list = [];
    for (let i = 1; i <= total; i++) list.push(i);
    levelSelect.show({
      levels: list,
      unlocked: Math.min(SaveManager.getProgress().unlockedLevel, total),
      results: SaveManager.getResults(),
      capacity: slotManager.capacity,
      coins: SaveManager.getCoins(),
      canExpand: SaveManager.canExpandCapacityToday()
    });
  }

  function startLevelById(id) {
    const total = GameConfig.levels.totalShipped;
    const levelId = Math.max(1, Math.min(id, total));
    app.currentLevelId = levelId;
    app.allCleared = false;
    app.winBannerTime = 0;
    app.inMenu = false;
    app.pausedReturn = false;
    app.levelStartedAt = Platform.now();
    app.levelStats = { undos: 0, rescues: 0 };
    app.stuckHinted = false;
    resultPanel.hide();
    failPanel.hide();
    pausePanel.hide();
    levelSelect.hide();
    resultPanel.nextLabel = levelId >= total ? '再玩一次' : '下一关';
    rewardProvider.setLevel(levelId);
    app.lastProgressAt = Platform.now();
    topBar.hintEnabled = false;
    hintMarker.clear();
    renderer.highlightScrewId = null;
    input.setLocked(false);
    game.startLevel(Levels[levelId]);
    slotUI.setCapacity(slotManager.capacity);
    topBar.setLevel('第 ' + levelId + ' 关 · ' + stageNameOf(levelId));
    topBar.setRemaining(game.totalRemainingOnBoards());
    topBar.setUndoQuota(game.freeUndoLeft + game.adUndoLeft);

    if (levelId === 1 && !SaveManager.getTutorialDone()) {
      tutorial.start();
    } else {
      tutorial.done();
    }
  }

  app.startLevelById = startLevelById;
  app.showMenu = showMenu;
  app.syncCoins = syncCoins;
  app.allCleared = false;

  Platform.onShareAppMessage(() => ({
    title: '我在玩《拧螺丝啦》第 ' + (app.currentLevelId || 1) + ' 关，你能过吗？',
    imageUrl: GameConfig.share.imageUrl,
    imageUrlId: GameConfig.share.imageId,
    query: 'from=menu&level=' + (app.currentLevelId || 1)
  }));
  Platform.onShareTimeline(() => ({
    title: '拧螺丝啦 · 第 ' + (app.currentLevelId || 1) + ' 关，敢来挑战吗？',
    query: 'from=timeline&level=' + (app.currentLevelId || 1),
    imageUrl: GameConfig.share.imageUrl,
    imageUrlId: GameConfig.share.imageId
  }));
  Platform.showShareMenu({ withShareTicket: true, menus: ['shareAppMessage', 'shareTimeline'] });

  const input = new InputManager();
  input.onDrag = (dx, dy) => {
    if (helpPanel.visible) { helpPanel.onDrag(dy); return; }
    if (levelSelect.visible) { levelSelect.onDrag(dy); return; }
    if (isFrozen()) return;
    if (tutorial.active) {
      tutorial.notifyDrag();
      if (tutorial.step === 1 && !hintMarker.target) {
        const t = game.requestHint();
        if (t) {
          renderer.highlightScrewId = t.node.id;
          hintMarker.setTarget(t);
        }
      }
    }
    if (!input.locked) camCtrl.onDrag(dx, dy);
  };
  input.onDragEnd = (vx, vy) => {
    if (helpPanel.visible) { helpPanel.onDragEnd(vy); return; }
    if (levelSelect.visible) return;
    if (isFrozen()) return;
    if (!input.locked) camCtrl.onDragEnd(vx);
  };
  input.onPinch = (r) => {
    if (!helpPanel.visible && !isFrozen()) camCtrl.onPinch(r);
  };
  input.onTap = (x, y) => {
    if (!audio.unlocked) audio.unlock();

    if (app.pausedReturn) {
      app.pausedReturn = false;
      app.lastProgressAt = Platform.now();
      app.resumeTouchAt = Platform.now();
      return;
    }
    if (app.resumeTouchAt && Platform.now() - app.resumeTouchAt <= GameConfig.input.tapMaxTime) {
      return;
    }

    if (levelSelect.visible) {
      const hit = levelSelect.hitTest(x, y);
      if (hit && hit.type === 'level') startLevelById(hit.id);
      else if (hit && hit.type === 'expand') {
        if (slotManager.capacity >= GameConfig.slot.maxCount) {
          toast.show('槽位已满级');
          return;
        }
        if (!SaveManager.canExpandCapacityToday()) {
          toast.show('今日扩容已用过');
          return;
        }
        rewardProvider.show('capacity', (res) => {
          if (!res.rewarded) { rewardFailToast(res); return; }
          SaveManager.addExtraCapacity();
          SaveManager.recordCapacityExpand();
          game.setExtraCapacity(SaveManager.getExtraCapacity());
          toast.show('暂存槽永久 +1！');
          showMenu();
        });
      } else if (hit && hit.type === 'locked') {
        toast.show('通关前面的关卡才可解锁哦');
      }
      return;
    }

    if (pausePanel.visible) {
      const ph = pausePanel.hitTest(x, y);
      if (ph === 'resume') pausePanel.hide();
      else if (ph === 'sound') {
        audio.muted = !audio.muted;
        pausePanel.muted = audio.muted;
      } else if (ph === 'help') {
        pausePanel.hide();
        helpPanel.show();
      } else if (ph === 'menu') {
        pausePanel.hide();
        showMenu();
      } else if (ph === 'restart') {
        startLevelById(app.currentLevelId);
      }
      return;
    }

    if (helpPanel.visible) {
      if (helpPanel.hitTest(x, y) === 'close') helpPanel.hide();
      return;
    }

    if (tutorial.active && tutorial.step === 2) {
      if (tutorial.hitTest(x, y) === 'ok') {
        tutorial.done();
        SaveManager.setTutorialDone();
      }
      return;
    }

    const winHit = resultPanel.hitTest(x, y);
    if (winHit) {
      if (winHit === 'next') {
        resultPanel.hide();
        startLevelById(app.currentLevelId + 1);
      } else if (winHit === 'double' && !resultPanel.doubled) {
        rewardProvider.show('win_double', (res) => {
          if (!res.rewarded) { rewardFailToast(res); return; }
          if (res.rewarded) {
            resultPanel.doubled = true;
            if (resultPanel.info) {
              resultPanel.info.balance = SaveManager.addCoins(app.lastWinCoins || 0);
              syncCoins();
            }
          }
        });
      }
      return;
    }

    const failHit = failPanel.hitTest(x, y);
    if (failHit) {
      if (failHit === 'retry') {
        failPanel.hide();
        startLevelById(app.currentLevelId);
      } else if (failHit === 'adUndo') {
        rewardProvider.show('fail_undo', (res) => {
          if (!res.rewarded) { rewardFailToast(res); return; }
          app.levelStats.rescues++;
          failPanel.hide();
          game.adUndoLeft += 1;
          game.undo();
          topBar.setUndoQuota(game.freeUndoLeft + game.adUndoLeft);
          topBar.setRemaining(game.totalRemainingOnBoards());
        });
      } else if (failHit === 'adClear') {
        rewardProvider.show('fail_clear', (res) => {
          if (!res.rewarded) { rewardFailToast(res); return; }
          app.levelStats.rescues++;
          failPanel.hide();
          game.clearAnyScrews(3);
          game.state = 'playing';
          input.setLocked(false);
          topBar.setRemaining(game.totalRemainingOnBoards());
        });
      } else if (failHit === 'coinUndo') {
        if (SaveManager.spendCoins(GameConfig.economy.rescueCost)) {
          syncCoins();
          app.levelStats.rescues++;
          failPanel.hide();
          game.adUndoLeft += 1;
          game.undo();
          topBar.setUndoQuota(game.freeUndoLeft + game.adUndoLeft);
          topBar.setRemaining(game.totalRemainingOnBoards());
          toast.show('已消耗 ' + GameConfig.economy.rescueCost + ' 金币');
        }
      }
      return;
    }

    const hit = topBar.hitTest(x, y);
    if (hit && tutorial.active) return;
    if (hit === 'undo') {
      if (game.undoStack.size() === 0) {
        app.bus.emit('UNDO_DENIED', { reason: 'empty' });
        return;
      }
      const eco = GameConfig.economy;
      const quota = game.freeUndoLeft + game.adUndoLeft;
      if (quota > 0) {
        const r = game.undo();
        if (!r.ok) {
          app.bus.emit('UNDO_DENIED', { reason: r.reason });
        } else {
          app.levelStats.undos++;
          topBar.setUndoQuota(game.freeUndoLeft + game.adUndoLeft);
          topBar.setRemaining(game.totalRemainingOnBoards());
        }
      } else if (SaveManager.getCoins() >= eco.undoCost) {
        Platform.showModal({
          title: '撤销',
          content: '花费 ' + eco.undoCost + ' 金币撤销一步？',
          confirmText: '确定',
          cancelText: '取消',
          success: (res) => {
            if (!res.confirm) return;
            game.adUndoLeft += 1;
            const r = game.undo();
            if (!r.ok) {
              game.adUndoLeft -= 1;
              return;
            }
            SaveManager.spendCoins(eco.undoCost);
            syncCoins();
            app.levelStats.undos++;
            toast.show('已消耗 ' + eco.undoCost + ' 金币');
            topBar.setUndoQuota(game.freeUndoLeft + game.adUndoLeft);
            topBar.setRemaining(game.totalRemainingOnBoards());
          }
        });
      } else {
        toast.show('撤销次数用完，金币不足');
      }
      return;
    }
    if (hit === 'help') {
      helpPanel.show();
      return;
    }
    if (hit === 'pause') {
      pausePanel.show({ muted: audio.muted });
      return;
    }
    if (hit === 'hint') {
      const eco = GameConfig.economy;
      if (game.hintUsed) {
        toast.show('本关提示已用过');
        return;
      }
      if (!game.requestHint()) {
        toast.show('当前视角看不到可拆的螺丝，先旋转视角试试');
        return;
      }
      if (SaveManager.getCoins() >= eco.hintCost) {
        Platform.showModal({
          title: '提示',
          content: '花费 ' + eco.hintCost + ' 金币使用一次提示？',
          confirmText: '确定',
          cancelText: '取消',
          success: (res) => {
            if (!res.confirm || game.hintUsed || !game.requestHint()) return;
            if (!SaveManager.spendCoins(eco.hintCost)) { syncCoins(); return; }
            syncCoins();
            doHint();
            toast.show('已消耗 ' + eco.hintCost + ' 金币');
          }
        });
      } else {
        rewardProvider.show('hint', (res) => {
          if (!res.rewarded) { rewardFailToast(res); return; }
          doHint();
        });
      }
      return;
    }
    if (hit) return;

    game.handleTap(x, y);
  };
  game.input = input;
  input.attach();
  app.input = input;

  Platform.onTouchStart(() => {
    if (app.pausedReturn) {
      app.pausedReturn = false;
      app.lastProgressAt = Platform.now();
      app.resumeTouchAt = Platform.now();
    }
  });

  app.bus.on(Events.LEVEL_WIN, () => {
    app.winBannerTime = 0.0001;
    const costMs = Platform.now() - app.levelStartedAt;
    const moves = game.collectedCount;
    let stars = 3;
    if (app.levelStats.undos > 0) stars--;
    if (app.levelStats.rescues > 0) stars--;
    stars = Math.max(1, stars);
    SaveManager.recordResult(app.currentLevelId, { stars, costMs, moves });
    if (app.currentLevelId < GameConfig.levels.totalShipped) {
      SaveManager.setUnlockedLevel(app.currentLevelId + 1);
    } else {
      app.allCleared = true;
    }
    const base = game.collectedCount * 10;
    app.lastWinCoins = base;
    const balance = SaveManager.addCoins(base);
    syncCoins();
    resultPanel.show(base, { stars, costMs, moves, balance });
  });
  app.bus.on(Events.LEVEL_LOSE, () => {
    failPanel.coinLabel = '花 ' + GameConfig.economy.rescueCost + ' 金币 撤回一步';
    failPanel.show({
      undoOffered: rewardProvider.canShow('fail_undo').ok,
      clearOffered: rewardProvider.canShow('fail_clear').ok,
      coinOffered: SaveManager.getCoins() >= GameConfig.economy.rescueCost
    });
  });
  app.bus.on(Events.SCREW_COLLECTED, (d) => {
    app.lastProgressAt = Platform.now();
    if (d.screenPos) particles.burst(d.screenPos.x, d.screenPos.y, d.color, 10);
    if (hintMarker.target === d.entry) {
      hintMarker.clear();
      renderer.highlightScrewId = null;
    }
    if (tutorial.active && tutorial.step === 1) {
      tutorial.notifyCollected();
      if (hintMarker.target) {
        hintMarker.clear();
        renderer.highlightScrewId = null;
      }
    }
    app.vibrate();
  });
  app.bus.on('UNDO_DONE', () => {
    app.lastProgressAt = Platform.now();
  });
  app.bus.on('UNDO_DENIED', (d) => {
    toast.show(UNDO_DENIED_TEXT[d && d.reason] || '暂不可撤销');
  });
  app.bus.on('COLLAPSE_WARN', () => {
    app.vibrate();
  });
  app.bus.on(Events.SCREW_COLLECTED, () => {
    topBar.setRemaining(game.totalRemainingOnBoards());
    topBar.setUndoQuota(game.freeUndoLeft + game.adUndoLeft);
  });
  app.bus.on('UNDO_DONE', () => {
    topBar.setRemaining(game.totalRemainingOnBoards());
    topBar.setUndoQuota(game.freeUndoLeft + game.adUndoLeft);
  });

  Platform.onHide(() => {
    app.hiddenAt = Platform.now();
  });
  Platform.onShow((res) => {
    const q = res && res.query;
    const qLevel = parseInt(q && q.level, 10);
    if (qLevel >= 1 && SaveManager.getTutorialDone()) {
      const unlocked = Math.min(
        SaveManager.getProgress().unlockedLevel,
        GameConfig.levels.totalShipped);
      if (qLevel <= unlocked) {
        app.pausedReturn = false;
        app.hiddenAt = null;
        lastTs = Platform.now();
        startLevelById(qLevel);
        return;
      }
    }
    if (app.hiddenAt && Platform.now() - app.hiddenAt > 60000 && !app.inMenu) {
      app.pausedReturn = true;
    }
    app.hiddenAt = null;
    lastTs = Platform.now();
  });

  Platform.onWindowResize(() => {
    const info2 = Platform.getSystemInfo();
    app.screen = { width: info2.width, height: info2.height, pixelRatio: info2.pixelRatio };
    setupCanvas();
    camera.setScreen(info2.width, info2.height);
    capsuleRect = capsuleRectOf(info2.width);
    app.capsule = capsuleRect;
    app.bottomInset = info2.safeArea
      ? Math.max(0, info2.height - info2.safeArea.bottom) : 0;
    slotUI.resize(info2.width, info2.height, app.bottomInset);
    topBar.resize(info2.width, info2.height, capsuleRect);
    resultPanel.resize(info2.width, info2.height);
    failPanel.resize(info2.width, info2.height);
    helpPanel.resize(info2.width, info2.height);
    levelSelect.resize(info2.width, info2.height);
    pausePanel.resize(info2.width, info2.height);
  });

  let lastTs = Platform.now();
  app.slowFrames = 0;
  app.degraded = false;
  app.vibrate = () => {
    if (!app.degraded) Platform.vibrateShort();
  };

  function tick() {
    const now = Platform.now();
    const rawDt = (now - lastTs) / 1000 || 0.016;
    const dt = Math.min(0.05, rawDt);
    lastTs = now;

    if (rawDt > 0.04 && !app.degraded) {
      app.slowFrames++;
      if (app.slowFrames > 30) {
        app.degraded = true;
        particles.halfMode = true;
      }
    } else if (app.slowFrames > 0) {
      app.slowFrames--;
    }

    if (!isFrozen()) {
      camCtrl.update(dt);
      tweens.update(dt);
      particles.update(dt);
      hintMarker.update(dt);
      tutorial.update(dt);
    }
    topBar.allDisabled = tutorial.active;
    slotUI.update(dt);
    resultPanel.update(dt);
    failPanel.update(dt);
    helpPanel.update(dt);
    toast.update(dt);
    if (game.state === 'win') app.winBannerTime += dt;

    topBar.hintEnabled = !game.hintUsed;
    if (game.state === 'playing' && !game.hintUsed && !app.stuckHinted &&
        !tutorial.active && !isFrozen()) {
      if (Platform.now() - app.lastProgressAt > 60000) {
        app.stuckHinted = true;
        toast.show('卡住了？试试上方的提示按钮');
      }
    }

    const ctx = app.ctx;
    if (ctx) {
      const w = app.screen.width;
      const h = app.screen.height;
      ctx.fillStyle = app.bgGradient || GameConfig.scene.bgTop;
      ctx.fillRect(0, 0, w, h);

      renderer.render(ctx, scene, camera, {});
      particles.draw(ctx);
      slotUI.draw(ctx);
      topBar.draw(ctx);
      hintMarker.draw(ctx, camera, scene);
      levelSelect.draw(ctx);
      pausePanel.draw(ctx);
      resultPanel.draw(ctx);
      failPanel.draw(ctx);
      helpPanel.draw(ctx);
      tutorial.draw(ctx, w, h);
      toast.draw(ctx, w, h);

      if (app.pausedReturn) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('欢迎回来', w / 2, h / 2 - 8);
        ctx.font = '13px sans-serif';
        ctx.fillText('点击屏幕继续', w / 2, h / 2 + 18);
      }
    }

    Platform.raf(tick);
  }

  if (SaveManager.getTutorialDone()) {
    const launch = Platform.getLaunchOptions();
    const qLevel = parseInt(launch && launch.query && launch.query.level, 10);
    const unlocked = Math.min(
      SaveManager.getProgress().unlockedLevel,
      GameConfig.levels.totalShipped);
    if (qLevel >= 1 && qLevel <= unlocked) {
      startLevelById(qLevel);
    } else {
      showMenu();
    }
  } else {
    startLevelById(1);
  }

  Platform.raf(tick);
  return app;
}

const _env = Platform.env();
if (_env === 'wechat' || _env === 'browser') {
  bootstrap();
}

module.exports = bootstrap;
