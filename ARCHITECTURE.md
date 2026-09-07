# 《拧螺丝啦》项目说明与维护手册

> 配套文档：`GDD.md`（玩法与数值规格）。本手册面向代码维护与迭代，描述工程结构、模块职责、数据流、约定与常见迭代操作。
> 运行环境：微信小游戏原生（无引擎）；代码为 **CommonJS 纯 JS、零构建管线**；Node 14+ 可直接跑全部测试。

---

## 1. 目录结构

```
minigame/
├─ game.js                    # 微信小游戏入口：require('./js/main')
├─ game.json                  # 小游戏配置（竖屏等）
├─ project.config.json        # 开发者工具配置（appid 已接正式；test/、scripts/ 不打包）
├─ logo.png                   # 144x144 图标（木板+红螺丝）
├─ GDD.md                     # 游戏设计文档（v3.0 原生版）
├─ ARCHITECTURE.md            # 本文件
├─ audio/                     # 7 个程序化合成音效（22050Hz 单声道 WAV，各 <100KB）
├─ js/
│  ├─ main.js                 # 【组装层】bootstrap()：创建全部模块、接线、主循环、输入路由
│  ├─ config/GameConfig.js    # 【唯一调参地】相机/输入/螺丝/槽位/坍塌/广告/渲染/颜色/木板
│  ├─ platform/Platform.js    # wx API 适配 + 测试桩注入（inject）；环境识别 wechat/browser/node/mock
│  ├─ math/                   # 纯数学，无依赖
│  │  ├─ Vec3.js              # 向量（数组表示）
│  │  ├─ Mat3.js              # 3x3 行主序矩阵；fromAxisAngle/fromEulerXYZ
│  │  └─ Ray.js               # 射线-OBB(slab 法)/球求交；obbFromBox
│  ├─ render/                 # 自研轻量 3D 管线
│  │  ├─ SceneGraph.js        # 逻辑场景树 SGNode（父子链、局部坐标、stamp 世界矩阵缓存）
│  │  ├─ Camera.js            # 轨道相机基（right/up/forward）、project()、rayFromScreen()
│  │  ├─ MeshBuilder.js       # 程序化几何：Box/L板/齿轮板/螺丝（法线朝外约定，有测试守护）
│  │  └─ Renderer.js          # 投影→背面剔除→画家排序→Lambert 着色填充；假阴影；高亮
│  ├─ camera/CameraController.js  # 旋转/缩放/阻尼/惯性/震动（数值走 GameConfig.camera）
│  ├─ interaction/
│  │  ├─ InputManager.js      # 触摸分发：点击(<10px 且 <300ms)/拖拽/双指；setLocked 输入锁
│  │  └─ ScrewRaycaster.js    # 屏幕点→射线→拾取 Unlocked 螺丝 + 木板 OBB 遮挡二次校验
│  ├─ gameplay/               # 【纯逻辑】玩法核心，不依赖渲染/输入
│  │  ├─ MatchChecker.js      # 纯函数：findMatch/removeMatch/isDeadEnd
│  │  ├─ SlotManager.js       # 槽位数据（add/removeMatch/isFull/nearFull/isDeadEnd）
│  │  ├─ ScrewManager.js      # 螺丝状态机 + 拧出补间（540°+上扬）
│  │  ├─ UndoStack.js         # 操作栈（≤30）
│  │  └─ CollapseManager.js   # 坍塌串行队列（警示→坠落→淡出→间隔 0.2s）
│  ├─ levels/
│  │  ├─ levelData/level_001..020.js  # 正式关卡（module.exports=数据；buildLevels 生成）
│  │  ├─ index.js             # id → 关卡数据 映射
│  │  ├─ LevelLoader.js       # 数据 → 场景树（板→孔位→螺丝）+ coveredBy 建表 + 取景计算
│  │  ├─ generator.js         # 关卡生成器（分阶段难度、seed 可复现）
│  │  └─ validator.js         # 校验器：静态规则 + 贪心可解性模拟 + 自动 +1 槽
│  ├─ core/
│  │  ├─ EventBus.js          # 事件总线 + Events 常量表
│  │  ├─ GameManager.js       # 对局状态机/胜负/关卡流转/撤销/提示/清槽
│  │  ├─ TweenManager.js      # 补间引擎（to/then 链/delay；Easing 表）
│  │  └─ SaveManager.js       # 进度/扩容/广告计数 持久化（wx storage）
│  ├─ ad/AdManager.js         # 激励视频封装 + 频控；unitId 为空 = mock 直发奖励
│  ├─ audio/AudioManager.js   # 预载 audio/*.wav；首次交互 unlock；bindGameEvents
│  └─ ui/                     # Canvas 立即式 UI（绘制 + 命中测试）
│     ├─ UISystem.js           # roundRect / 螺丝图标 / 颜色表
│     ├─ TopBar.js             # 顶栏：标题+剩余数+三按钮（撤销/提示/帮助），胶囊避让布局
│     ├─ SlotUI.js             # 底部暂存槽（对称留白、入槽飞行、消除闪光、LEVEL_LOADED 重置）
│     ├─ ResultPanel.js        # 胜利面板（下一关 / 看视频翻倍）
│     ├─ FailPanel.js          # 失败面板（重试 / 看视频撤回 / 看视频清3颗）
│     ├─ HelpPanel.js          # 玩法说明（可滚动+惯性，文案随奖励模式变化）
│     ├─ HintMarker.js         # 提示标记：金环波纹+悬浮箭头，持续到目标螺丝被点击
│     ├─ Tutorial.js           # 首关三步引导（旋转→点发光螺丝→知道了）
│     ├─ LevelSelect.js        # 选关网格（星级/锁/扩容按钮）
│     ├─ PausePanel.js         # 暂停面板（继续/音效开关/帮助/选关/重开）
│     ├─ Toast.js              # 轻提示气泡（UNDO_DENIED 等）
│     └─ ParticleFX.js         # 粒子对象池（三消爆发/坍塌灰尘），halfMode 降帧降级
├─ scripts/
│  ├─ buildLevels.js           # 生成 30 关（生成器+校验器管线，seed 搜索）→ levelData/
│  ├─ headlessPlaythrough.js   # 无头全量打通验证（模拟贪心玩家）
│  └─ make_audio.py            # numpy 程序化合成 7 个 wav
└─ test/                       # Node 单测（harness 微型断言库；run.js 汇总）
```

**分层原则（维护红线）**：
1. `gameplay/`、`levels/`、`core/`、`math/` 为**纯逻辑**，禁止 require `render/`、`ui/`、`platform/` 之外的运行环境 API；
2. 所有手感/难度/视觉数值只改 `GameConfig.js`；
3. 不引入构建步骤与第三方运行时依赖；新增模块用 CommonJS（`module.exports`）；
4. 代码不加注释（项目约定），语义靠命名与测试表达；GDD/本手册承载说明。

---

## 2. 启动与主循环（js/main.js）

`bootstrap()` 仅在 `Platform.env() ∈ {wechat, browser}` 时自动执行；Node 中导出供测试手动调用。

装配顺序（有依赖关系，勿随意调换）：
```
Platform.getSystemInfo / createCanvas
→ SceneGraph + Camera + CameraController + TweenManager + Renderer
→ ScrewManager(tweens) + SlotManager + GameManager({...})
→ CollapseManager(hooks)  ← onBoardGone → game.onCollapseFinished（解锁 coveredBy）
→ TopBar(capsule) / HelpPanel / HintMarker / ResultPanel / FailPanel / ParticleFX / AudioManager
→ AdManager（unitId 空=mock）
→ InputManager 接线（输入路由见下）
→ SaveManager 读进度 → startLevelById(current)
→ 事件订阅（音效/震动/粒子/面板弹出/顶栏计数）
→ requestAnimationFrame 主循环 tick()
```

**tick() 每帧顺序**：
`camCtrl.update → tweens.update → slotUI.update → particles.update → 面板们.update → hintMarker.update → 卡关检测(60s→hintEnabled) → 渲染(背景→Renderer→particles→slotUI→topBar→hintMarker→result→fail→help) → 降帧保护统计`。

**降帧保护**：连续 30 帧 >40ms → `app.degraded=true` → 粒子减半、关震动（`app.vibrate()` 统一闸口）。

---

## 3. 输入路由（main.js input.onTap 优先级）

```
1. levelSelect 可见？    → level=进关 / expand=邀好友扩容 / locked=toast
2. pausePanel 可见？     → resume/sound/help/menu/restart
3. helpPanel 可见？      → 只响应 ✕ 关闭，其余吞掉
4. pausedReturn？        → 任意 touchstart 即关闭（独立于 InputManager 的触摸监听，长按/微移/输入锁均有效；同手势的点击被吞防穿透。后台 >60s 回归提示）
5. tutorial 第3步？      → 只响应「知道了」
6. resultPanel 命中？    → next=下一关 / double=奖励翻倍
7. failPanel 命中？      → retry / adUndo / adClear（奖励回调成功才生效）
8. topBar 命中？         → pause/help/hint/undo
9. 其余                  → game.handleTap(x,y)（射线拾取螺丝）
```
拖拽路由：`helpPanel 可见 → 面板滚动(带惯性)`；`暂停/选关 → 冻结`；tutorial 第0步的拖拽会推进引导并点亮首颗螺丝；其余 `camCtrl.onDrag`。`onDragEnd(vx, vy)` 同时提供两轴速度（相机惯性用 vx，帮助面板惯性用 vy）。

**启动流程**：首次（tutorial 未完成）直接进第 1 关跑引导；否则进 `levelSelect` 选关菜单。
**冻结规则**：`pausePanel/levelSelect` 可见时 tick 跳过 camCtrl/tweens/particles/hint/tutorial 更新（真暂停）。
**窗口 resize**：`Platform.onWindowResize` → 重设 canvas/相机/全部 UI 布局（折叠屏适配）。
**性能**：背景渐变随 canvas 缓存（`app.bgGradient`）；关卡数据 `levels/index.js` 按需 require（启动只解析入口）。
**分享图**：小游戏分享卡**必须用后台上传审核通过的网络图 + 图片 ID**，配置在 `GameConfig.share.imageUrl` / `share.imageId`，三个出口（转发/朋友圈/奖励分享）统一携带 `imageUrl`+`imageUrlId`；本地 `share.png` 仅作设计源稿，`logo.png` 仅作图标。
**反馈兜底**：奖励/扩容被频控、取消、加载失败统一 `rewardFailToast` 出文案；`vibrateShort` 全机型 try/catch。

---

## 4. 核心机制速查

### 4.1 对局状态机（GameManager.state，字符串）
`idle → playing ⇄ screwing（拧出动画锁输入）→ win_pending(0.6s)→ win`；`playing → lose`。
`undo()` 可从 `lose` 恢复为 `playing`（广告救场路径）。

### 4.2 收集一颗粒子的完整链路（afterCollected）
```
undoStack.push({entry, slotSnapshot})   // 快照在入槽前拍
→ slotManager.add(color) → SLOT_UPDATED（SlotUI 飞行入槽）
→ 满槽预警 SLOT_FULL_WARNING（≥warnAt）
→ findMatches → removeMatch → MATCH_MADE（粒子+音高）→ SLOT_UPDATED
→ 判定：全板清空 → win_pending；单板清空 → onBoardEmptied → CollapseManager
→ 槽满且无匹配 → LEVEL_LOSE
```

### 4.3 遮挡判定（双保险）
- 主：关卡数据 `coveredBy`（静态，生成器保证上层板 y 更高、无环）；板坍塌后 `onCollapseFinished` 逐个解锁；
- 兜底：`ScrewRaycaster.tryPick` 点击时射线若被**非父板** OBB 截断则拒点。

### 4.4 坍塌（CollapseManager，串行）
`queueCollapse(node)` → 警示闪烁 0.25s → 坠落 0.5s（quadIn + 随机轴 15~30°）→ 落地（震屏+灰尘+震动）→ 淡出 0.22s 移除 → `onBoardGone` → 间隔 0.2s 处理队列下一块。队列期间 `InputManager.setLocked(true)`。

### 4.5 撤销（快照式）
`undo()`：恢复 `slotSnapshot`、螺丝节点重挂回孔位（位置/旋转/透明度复位）、按 coverage 现状重判 locked、`board.remaining++`、扣配额（先免费后广告）。已坍塌板的 op 在 `onCollapseFinished` 中从栈里清除。

### 4.6 渲染管线约定
- 网格法线一律朝外（`test/render.test.js` 有守护测试，改 MeshBuilder 必须保持）；
- 背面剔除：`camN · centroid < 0` 才绘制；排序键 = 面片中心视空间 z（远→近）；
- 光照：`ambient + (1-ambient)·max(0, n·lightDir)`；高亮（提示）= 提亮 + 金色脉冲描边；
- 假阴影：每块板在地面画半透明椭圆，随高度淡出。

### 4.7 布局规范（微信）
- 胶囊：`Platform.getMenuButtonBoundingClientRect()`（缺 API 用兜底矩形）；标题与胶囊垂直居中；按钮行在胶囊正下方、右缘对齐 `capsule.right`；
- 底部：槽条底边 = `h − safeArea 下缺口`；面板内边距上下对称 8px（`SlotUI.panelRect()`）。

### 4.8 奖励提供方（可切换：转发邀请 ⇄ 激励视频）
`GameConfig.ad.mode`：`'share'`（当前，流量主未开通期）或 `'ad'`（开通后）。
main.js 按 mode 选择 `rewardProvider`（`ShareManager` 或 `AdManager`），两者**同接口** `show(placement, cb) / canShow(placement) / setLevel(id)`，四个奖励位（fail_undo/fail_clear/hint/win_double）与全部文案（失败面板/结算面板/帮助面板）随模式自动切换，业务代码零改动。

- **AdManager 频控**：冷启动 60s 禁弹 → 相邻 ≥45s → 每日 ≤15 → `fail*` 每关 ≤2。`unitId` 为空 = mock 直发奖励。
- **ShareManager 频控**：相邻 ≥5s → 每日 ≤30 → `fail*` 每关 ≤3；`wx.shareAppMessage` 的 success 回调才发奖（取消不发），分享计数独立存储（SaveManager.recordShare）。
- **胶囊分享**：启动时 `showShareMenu({menus:['shareAppMessage','shareTimeline']})` 点亮双按钮；`onShareAppMessage`/`onShareTimeline` 均带动态关卡文案+审核图（`imageUrl`+`imageUrlId`）+回流 query。
- **分享回流**：冷启动走 `getLaunchOptions`、**热启动走 `onShow(res.query)`** 双路径解析 level，超解锁回落选关页；日计数每次 `canShow` 重新读取，跨天自动翻滚。
- **合规提醒**：「分享得奖励」属诱导分享灰区，微信《运营规范》有限制；当前文案用「邀好友」弱化利益表述，流量主开通后**务必切回 `'ad'`**（见 7.6）。

---

## 5. 事件表（EventBus）

| 事件 | 触发方 | 主要监听方 |
|---|---|---|
| `SCREW_COLLECTED {color, entry, screenPos...}` | GameManager | SlotUI(飞行)、main(粒子/震动/提示清除/顶栏)、Audio |
| `SLOT_UPDATED {slots, arrivedIndex}` | GameManager | SlotUI |
| `MATCH_MADE {color, count}` | GameManager | SlotUI(闪光)、Audio、(粒子可扩展) |
| `BOARD_COLLAPSED {boardId, unlocked}` | GameManager | Audio |
| `SLOT_FULL_WARNING` | GameManager | SlotUI(红框呼吸)、Audio |
| `LEVEL_WIN` / `LEVEL_LOSE` | GameManager | main(面板/存档)、Audio |
| `LEVEL_LOADED` | GameManager.startLevel | SlotUI(整面板重置) |
| `UNDO_DONE` | GameManager.undo | main(顶栏计数/卡关计时) |
| `COLLAPSE_WARN` | CollapseManager | main(震动) |
| `UNDO_DENIED {reason}` | main | （可扩展 toast） |

---

## 6. 测试体系（test/，当前 141 项）

```
node test/run.js                 # 全量
node scripts/headlessPlaythrough.js  # 30 关无头打通（贪心玩家）
```

| 文件 | 覆盖 |
|---|---|
| harness.js | 微型断言库（assert/assertEq/assertClose/deepEqual） |
| core.test | EventBus、Platform mock（含 showModal） |
| math.test | Vec3/Mat3/Ray/Camera 投影与射线往返 |
| render.test | SceneGraph 父子变换、Renderer 冒烟、**网格法线守护** |
| input.test | 点击/拖拽/双指/锁/速度回传 |
| match.test | MatchChecker/UndoStack/SlotManager |
| tween.test | 补间/延迟/链式/停止/Easing |
| gameManager.test | 收集/三消/胜负/输入锁/拾取/遮挡/坍塌钩子 |
| collapse.test | 坍塌串行/解锁/撤销(快照/配额/忙碌/败局恢复/清栈) |
| levels.test | **30 关逐个过校验器**、生成器倍数、校验器反例 |
| bootstrap.test | 无头端到端：bootstrap→模拟点击通关→面板进下一关；金币购买撤销/提示走弹窗确认（含取消分支） |
| ad.test | mock 发奖/冷启动/冷却/每关限次/日限/真广告 isEnded |
| share.test | 分享发奖/取消不发/冷却/单关限次/标题模板 |
| audio.test | 7 个 wav 存在/<100KB/RIFF 单声道 22050Hz |
| ui.test | 胶囊避让/按钮对齐/撤销按钮金币置灰规则/帮助面板滚动惯性/槽位对称留白/重置 |
| meta.test | 存档/引导推进/选关/暂停/金币收支/失败面板条件展示/按钮不越界/Toast |
| launch.test | 被动分享注册/冷启动与热启动 query 直达/超解锁回落/回归遮罩 |

**约定：新功能必须带测试**；纯逻辑直接断言，UI 用假 ctx 冒烟，流程用 bootstrap 无头驱动（mock Platform 的 `raf` 收帧、`now` 控时钟）。

---

## 7. 迭代操作手册

### 7.1 调手感/难度/视觉
只改 `js/config/GameConfig.js`。常用：`camera.*` 手感、`slot.warnAt` 预警时机、`collapse.*` 坍塌节奏、`colors/wood` 配色、`render.lightDir/ambient` 明暗。

### 7.2 加关卡
- 批量：调 `generator.js` 的 `STAGES` 或 `buildLevels.js` 的 `TOTAL/SEED_BUDGET` 后 `node scripts/buildLevels.js`（自动校验+seed 搜索，失败关自动 +1 槽或换 seed）；
- 单关手写：新建 `levelData/level_0XX.js`（结构见 GDD 4.1）+ `index.js` 注册 + `GameConfig.levels.totalShipped`；**必须**过 `validator`（颜色 3 倍数、覆盖闭合、可解性）。

### 7.3 加木板形状
1. `MeshBuilder.js` 写 `buildXxxMesh`（法线朝外！跑 render 测试）；
2. `LevelLoader.buildBoardMesh` 的 switch 增加 prefab 名；
3. 若 footprint 非 3.6×1.2：同步 `generator.boardFootprint` 与 `validator` 的孔位边界常量。

### 7.4 加 UI 面板
`ui/` 新建（参照 FailPanel：show/hide/update/hitTest/draw + `_layout`）→ main 装配 → **插入第 3 节输入路由的合适优先级** → tick 里 update+draw → ui.test 加命中/避让断言。

### 7.5 加音效
`scripts/make_audio.py` 增加合成函数并 `write_wav` → `AudioManager.SFX_LIST` 加 id → `bindGameEvents` 挂事件 → audio.test REQUIRED 加文件名 → 重跑 `python3 scripts/make_audio.py`。

### 7.6 接真广告/上线
1. appid 已接正式（`wx30bb8fa22ff4c18f`），无需再配；
2. `GameConfig.ad.unitId` 填激励视频广告位；
3. `GameConfig.ad.mode` 由 `'share'` 改为 `'ad'` —— 四个奖励位与文案自动切回「看视频」，ShareManager 停用；
AdManager 走真实流程（onClose.isEnded 才发奖，失败静默降级）。提审素材/类目为人工项。

### 7.7 换 logo/图标/分享图
PIL 脚本现画：`logo.png` 为 4 倍超采样+圆角 mask+floodfill 裁角；`share.png` 为 500×400 卡片图（PingFang 渲染中文）。改尺寸/文案重跑对应脚本。

### 7.8 迁移 Cocos（数据验证后的路线）
`gameplay/ levels/ core/（除 TweenManager） math/` 整体平移；替换 `render/ camera/ interaction/ ui/ platform/` 为引擎等价物。GDD 附录 B 有对照表。

---

## 8. 已知限制与待办（迭代候选）

| 项 | 现状 | 说明 |
|---|---|---|
| 埋点 Analytics | `Platform.reportEvent` 未接线 | GDD 6.3 事件表已定，补监听器即可 |
| BGM | `playBgm()` 空实现 | 需素材后补 InnerAudioContext 循环 |
| 自动聚焦镜头 | 未做（GDD 二期） | CameraController 留 `focusOn()` |
| 提示按钮 | 卡关 60s 才亮 | 若数据需要可改常驻（main 卡关检测段） |
| 物理坍塌 Pro | 未做 | 原生路线无物理引擎，属 Cocos 迁移项 |
| 无尽模式 | 未做 | 生成器现成，加循环与计分即可 |

**已完成（本批次）**：选关菜单+星级+回玩、暂停/设置（音效开关）、新手三步引导、UNDO 轻提示、结算星级/用时/步数、被动分享菜单、窗口 resize 适配、槽位扩容入口（选关页底部，邀好友每日 1 次，上限 8）。

**星级规则**：3 星起步；用过撤销 −1；用过失败救援 −1；下限 1 星。存 `SaveManager.results`（保留最佳星/最快时间）。

### 8.1 金币经济（`GameConfig.economy`）

- **产出**：通关 `collectedCount×10`，结算「翻倍」奖励再发等额；`SaveManager.addCoins` 持久化
- **消耗**：提示 30 / 撤销 20 / 失败救援 50；顶栏提示/撤销走 `wx.showModal` 弹窗确认（`Platform.showModal` 封装，执行成功后才扣币，取消零消耗）
- **路由**：提示/撤销优先消耗免费配额；无配额且金币足 → 弹窗确认流；金币不足 → 提示回落到奖励（广告/分享）通道
- **置灰规则**：撤销按钮仅在剩余配额为 0 且金币不足购买时置灰（`topBar.undoCoinAffordable`，由 `syncCoins()` 在金币变动时同步）
- **展示**：选关页头部与结算面板余额；失败面板「花 50 金币 撤回一步」仅在余额足够时出现

---

## 9. 真机验收清单（上线前人工过一遍）

| 类别 | 检查项 |
|---|---|
| 兼容 | iOS（音频首触点解锁）、低端安卓（帧率≥30、降帧保护触发后粒子减半）、刘海/折叠屏（resize 后布局不炸）、旧基础库（胶囊 API 缺失走兜底矩形） |
| 布局 | 胶囊不遮顶栏按钮；Home 指示条不压暂存槽；横竖屏锁定竖屏 |
| 生命周期 | 切后台 >60s 回前台出「欢迎回来」；切后台瞬间不产生超大 dt |
| 分享 | 胶囊菜单转发卡片标题/图正常；奖励分享成功发奖、取消不发 |
| 存档 | 杀进程重进：进度/星级/扩容/引导完成态都在 |
| 审核 | 无诱导分享文案残留（切 share 模式期间）；广告位开通后切回 `mode:'ad'` |

---

## 10. 排障速查

| 症状 | 先看 |
|---|---|
| 点螺丝无反应 | InputManager.locked（坍塌队列/拧出中）→ 螺丝 state 是否 locked → Raycaster 遮挡 |
| 画面不刷新 | tick 是否启动（env 判断）→ Platform.raf mock 是否吞帧（测试环境） |
| 槽位残留旧螺丝 | `LEVEL_LOADED` 是否被 SlotUI 收到（重置唯一入口） |
| 广告不弹 | AdManager.canShow 的 reason（coldStart/cooldown/dailyLimit/perLevel） |
| 音效不响 | 是否 unlock（首次点击）→ audio/*.wav 是否存在 → _failed 标记 |
| 关卡死局 | `node scripts/headlessPlaythrough.js` 复现 → validator runs 提高 → 换 seed/加槽 |
| 顶栏被胶囊挡 | `Platform.getMenuButtonBoundingClientRect` 真机返回值 vs 兜底矩形 |
