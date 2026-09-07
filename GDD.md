# 《拧螺丝啦》游戏设计文档 (GDD)

**原生微信小游戏版 v3.1** ｜ 目标读者：策划 / 程序 / AI 编程助手

| 项目 | 内容 |
|---|---|
| 游戏名称 | 拧螺丝啦（项目名 `screw-master`） |
| 游戏类型 | 3D 空间规划 / 休闲解压 / 三消 |
| 目标平台 | 微信小游戏（**原生实现**：game.js + Canvas2D 自绘 3D，零引擎、零构建管线） |
| 商业模式 | 奖励双通道（激励视频 ⇄ 邀好友分享，一键切换）+ 金币经济 |
| 核心循环 | 旋转观察 → 拧螺丝 → 暂存槽三消 → 结构坍塌 → 通关结算 |
| 单局时长 | 30s ~ 3min |
| 已上线关卡 | 30 关（新手/成长/挑战/大师四阶段，生成器+校验器管线产出） |
| appid | `wx30bb8fa22ff4c18f`（已接正式环境） |
| 文档版本 | v3.1（2026-09-05，与当前代码逐条对齐） |

> **v3.1 相对 v3.0 的关键修订**（均以现网代码为准）：
> 1. 商业化由「纯广告」升级为**奖励双通道**：`GameConfig.ad.mode` 在 `'share'`（流量主未开通期，当前）与 `'ad'`（开通后）间切换，四个奖励位与全部文案自动跟随；
> 2. 新增**金币经济**：通关产出、提示/撤销/失败救援消耗、`wx.showModal` 弹窗确认；
> 3. 新增**完整外围系统**：三步新手引导、选关菜单（星级/重玩）、暂停面板、帮助面板（可滚动）、轻提示 Toast、结算统计（星/用时/步数）；
> 4. 关卡由 20 → **30**，生成器阶段数值、校验器规则（3 组随机种子 ×100 次 + 1 次确定性贪心、自动 +1 槽）按实现修订；
> 5. 拾取/遮挡方案按实现修订：螺丝头**球体命中** + 上层板**footprint 核心区遮挡判定**（射线-OBB 求交保留为数学工具与测试）；
> 6. 撤销改为**快照式**（还原入槽前槽位数组），失败面板救援为「撤回一步 / 移出 3 颗」；
> 7. 附录 A（GameConfig）与附录 B（运行/验收）同步至当前真实配置与测试现状（141 项断言全绿）。
>
> 维护向信息（模块装配顺序、输入路由细节、排障速查）见配套文档 `ARCHITECTURE.md`；本文件承载设计意图、玩法规格、数值与验收标准。

---

## 1. 游戏概述

### 1.1 核心体验

- **观察**：单指旋转 3D 结构寻找被上板遮挡的螺丝，双指缩放看细节——「转一转才发现可拆点」是解压感的核心来源。
- **操作**：点击可拆螺丝触发拧出动画（540° 旋转 + 上扬），螺丝飞入底部暂存槽，全程无文字教学成本。
- **反馈**：金属摩擦音效 + 震动 + 三消粒子 + 坍塌落地震屏/灰尘，每个动作都有即时视听回馈。
- **成就**：整块木板拆空后坠落露出下一层（串行队列、逐块落地），提供「拆积木」式节奏感；选关页星级与「再快一点」的重玩意愿钩住留存。

### 1.2 核心循环

```
进入关卡 → 旋转观察结构 → 点击可拆螺丝 → 暂存槽 +1
        ↖____________（循环直至拆空，同色×3 自动消除）____________↗
                                    ↓
            所有木板螺丝清空 → 木板逐块坍塌 → 结算（星/金币/翻倍）→ 下一关
```

### 1.3 外围循环（Meta Loop）

```
通关 → 星级（3★ 起步，用撤销/救援扣星）+ 金币（收集数×10）
     → 选关菜单可见进度/星/金币 → 金币可购提示/撤销/失败救援
     → 邀好友（或看视频）每日一次永久扩容暂存槽（上限 8）→ 降低后期难度压力
     → 分享卡片带关卡 query → 好友回流直达对应关卡（不超解锁进度）
```

---

## 2. 核心玩法规格（参数化）

> 本章所有数值与 `js/config/GameConfig.js` 一一对应；**调参只改 GameConfig**，不在模块内散落。

### 2.1 相机操作参数

| 参数 | 规格 | 说明 |
|---|---|---|
| 水平旋转 | 0.6° / 每像素（`camera.yawSpeed`） | 单指左右滑动，绕 Y 轴 |
| 垂直旋转 | 0.4° / 每像素（`camera.pitchSpeed`） | 单指上下滑动，绕 X 轴 |
| 垂直角度限制 | **-35° ~ +30°** | 上限正俯视角，下限防翻转穿模 |
| 缩放范围 | 相机距中心 3 ~ 12（`distMin`/`distMax`） | 双指捏合，指数式（除以比例） |
| 惯性 | 松手后角速度按 0.92/帧 衰减 | 仅水平方向（竖屏单手持握主轴） |
| 阻尼 | 0.15（帧率无关化：`1-(1-k)^frames`） | 目标角度平滑跟随 |
| 初始视角 | yaw 35° / pitch 18° / dist 8 | CameraController 默认 |
| 每关取景 | 目标 = 结构包围盒中心，距离 = clamp(包围球半径×2.4, 3, 12)，pitch 重置 12° | `GameManager.startLevel` |
| 自动聚焦 | `CameraController.focusOn()` 已预留（夹角 ≤30° 不触发），**当前未接线** | 二期候选，勿占用当前版本 |

> **决策 D1**（沿用）：相机只做旋转与缩放，**不做平移**。模型永远居中于画面（Pivot = 包围盒中心），降低实现与调参成本。

### 2.2 点击判定规则（防误触）

| 条件 | 阈值 | 动作 |
|---|---|---|
| 按下后移动累计（曼哈顿距离） | **> 10px** | 立即取消点击候选，转为拖拽 |
| 抬起时位移（欧氏距离平方） | **< 10²** | 才可能判为点击 |
| 按下 → 抬起时间 | **< 300ms**（`tapMaxTime`） | 超出即作废 |
| 第二指落下 | 立即 | 取消点击候选，转双指缩放 |
| 输入锁（拧出中/坍塌队列） | `InputManager.setLocked` | 锁期间触摸不产生点击/拖拽回调 |

> **决策 D2**（沿用）：触摸由 `InputManager` 统一分发（点击 / 拖拽 / 双指），再走拾取，杜绝「旋转相机时误拆螺丝」。`onDragEnd(vx, vy)` 同时回传两轴速度（相机惯性用 vx，滚动类面板惯性用 vy）。

### 2.3 拧螺丝流程（状态机）

```
Screw 状态（ScrewManager.ScrewState）：
  locked(被遮挡) → unlocked(可拆) → screwing(动画中) → inslot(已入槽)
```

1. 点击 `unlocked` 螺丝 → 全局状态切 `screwing` 并锁输入；播放拧出补间（`unscrewAnimTime` 0.35s，quadOut；沿孔位法线上扬 `rise` 0.5m + 绕 Y 轴旋转 `spinDeg` 540°）；
2. 动画结束 → 螺丝节点移出场景图（状态置 `inslot`），`SCREW_COLLECTED` 事件携带屏幕坐标（供入槽飞行起点）；
3. 所在板 `remaining--` → 入槽 + 三消检查 → 板空则进入坍塌队列（见 2.5）；
4. 流程结束且无坍塌队列时释放输入锁。

> **决策 D3**（沿用）：拧出动画用**自研 Tween**，无物理引擎；场景中螺丝动画播完即移除，由底部槽位 UI 以新实例呈现（2D 贝塞尔飞行 0.15s + 落槽回弹 0.25s）。

### 2.4 暂存槽与三消规则

| 规则 | 规格 |
|---|---|
| 关卡槽位 | 数据 `slotCount`（生成器基础 5，校验器可自动 +1） |
| 扩容 | 奖励通道（邀好友/看视频）每日 1 次、全局 +1，叠加在关卡槽位上；**上限 8**（`slot.maxCount`） |
| 收集顺序 | 按收集时序追加（最新在最右），入槽带飞行与回弹表现 |
| 消除条件 | 同色 **≥3**（`match.needCount`）立即消除；每次入槽后检查，一次入槽可能连锁消 2 组 |
| 消除表现 | 槽条同色闪光 0.4s + 升调「叮」音效（可接连消升调） |
| 满槽预警 | 槽内数量 ≥ `slot.warnAt`（4）且未满时触发：红框呼吸（持续至关卡重置）+ 低鸣音效（每次入槽在预警区即播） |
| 失败判定 | ① 槽满且无任何 ≥3 同色组合；② 槽满时再入槽（`add` 返回 -1）→ 均判 `LEVEL_LOSE` |

> **决策 D4**（沿用）：消除时保持其余螺丝相对顺序不变（`MatchChecker.removeMatch` 保序过滤），实现简单且视觉稳定。

### 2.5 坍塌规则（动画坍塌，串行队列）

| 步骤 | 时长 | 表现 |
|---|---|---|
| 触发 | 板 `remaining` = 0 | `CollapseManager.queueCollapse(node)` 入队，队列非空期间输入锁 |
| 警示 | 0.25s（`collapse.warnTime`） | 板透明度按 `|sin(3π·t)|` 闪烁 3 次；结束发 `COLLAPSE_WARN`（震动） |
| 坠落 | 0.5s（`collapse.fallTime`，quadIn） | y 方向平落 2.5m（`fallDist`）+ 绕随机轴（y 分量 0.3~0.9）旋转 15°~30° |
| 落地 | 瞬间 | 相机震动 `shake(0.1s, 0.02)` + 灰尘粒子（约 10 粒）+ 震动 + 音效（`BOARD_COLLAPSED`） |
| 淡出 | 0.22s | 板淡出后移出场景图 → `onBoardGone` |
| 解锁 | 淡出完成 | 覆盖该板的螺丝逐个解锁（`coveredBy` 计数归零者置 `unlocked`），并发 `BOARD_COLLAPSED` 含解锁数；该板相关撤销操作从栈中清除 |
| 串行间隔 | ≥0.2s（`queueGap`） | 队列中下一块板开始警示 |

> **决策 D5**（沿用）：**禁用物理引擎**。掉落结果不可控（砸飞螺丝、穿模、射线穿帮），动画坍塌视觉接近物理且 100% 可控。
>
> **决策 D10**（沿用）：多板同时待坍塌时**串行排队**，避免视觉混乱与音效/震动叠加。

### 2.6 胜负判定

| 条件 | 判定 | 后续 |
|---|---|---|
| 所有木板孔位清空 | ✅ 通关 | `win_pending` 1.4s 收尾期 → `win` → 结算面板（星/用时/步数/金币/翻倍按钮）；槽内残余螺丝**不影响通关** |
| 槽满且无 ≥3 同色组合，或满槽再入槽 | ❌ 失败 | 失败面板：重试 / 奖励撤回一步 / 奖励移出 3 颗 / 金币救援（余额 ≥50 才显示） |

> 结算面板与失败面板的按钮文案随奖励模式自动切换（「看视频…」⇄「邀好友…」）。

### 2.7 撤销系统（快照式）

| 项 | 规格 |
|---|---|
| 免费配额 | 每关 1 次（`freeUndoLeft`），顶栏按钮角标显示剩余总额 |
| 追加配额 | 失败救援（奖励或金币）各 +1 次且立即执行一次撤销 |
| 金币购买 | 20 金币/次（`economy.undoCost`），`wx.showModal` 弹窗确认（见 2.9） |
| 操作栈 | 上限 30 条（`levels.maxUndoOps`），记录 `{entry, slotSnapshot}`，**快照在入槽前拍摄** |
| 执行 | 恢复槽位快照 → 螺丝节点重挂回原孔位（位置/旋转/透明度复位）→ 按当前覆盖现状重判 `locked` → `board.remaining++` → 配额扣减（免费优先） |
| 清理 | 已坍塌板的撤销记录在 `onCollapseFinished` 中从栈移除；坍塌进行中拒绝撤销（`busy`） |
| 拒绝反馈 | `UNDO_DENIED` → Toast 文案（配额用完 / 无可撤销 / 坍塌中 / 状态不允许） |
| 按钮状态 | 剩余配额为 0 **且**金币不足购买时才置灰；金币可购（≥20）保持亮起 |
| 效果 | `lose` 状态下撤销成功可恢复为 `playing`（救场路径） |

### 2.8 提示系统

| 项 | 规格 |
|---|---|
| 次数 | 每关 1 次（`hintUsed`），用过即置灰路径并 Toast「本关提示已用过」 |
| 消耗路由 | 金币足够（30，`economy.hintCost`）→ `wx.showModal` 弹窗确认；金币不足 → 回落奖励通道（看视频/邀好友） |
| 目标选择 | 当前视角**可见**的首个 `unlocked` 螺丝（投影在屏幕内 + 视线未被其他木板 OBB 遮挡，`ScrewRaycaster.visibleUnlocked`）；当前视角无可见目标时不消耗、不发放，Toast 引导玩家先旋转视角 |
| 表现 | 高亮提亮 + 金色脉冲描边（渲染层）+ `HintMarker` 金环波纹 + 悬浮箭头；**持续到目标螺丝被点击**（收集后自动清除） |
| 卡关检测 | `playing` 且 60s 无任何进度（收集/撤销）→ Toast「卡住了？试试上方的提示按钮」，每关仅一次 |

### 2.9 金币消费确认流（通用）

```
点击消耗按钮（提示/撤销，配额已用完且金币足够）
  → 撤销前检查操作栈：为空 → Toast「没有可撤销的操作」，不弹确认窗
  → wx.showModal 二选一弹窗（「花费 N 金币…？」确定/取消，经 Platform.showModal 封装）
  → 点「确定」→ 执行成功后才扣金币；点「取消」→ 无任何消耗
金币不足 → 提示按钮回落奖励通道；撤销按钮 Toast「撤销次数用完，金币不足」
```

### 2.10 新手引导（三步，仅第 1 关首玩）

| 步骤 | 内容 | 推进条件 |
|---|---|---|
| 0 | 手势动画（滑动双箭头 + 摆动指尖）+ 文案「单指滑动旋转观察视角 / 双指缩放看清螺丝位置」 | 任意拖拽 |
| 1 | 文案「点击发光的螺丝 / 把它拧下来」；首次拖拽后自动点亮一颗可拆螺丝（复用提示高亮 + HintMarker） | 收集到任意螺丝 |
| 2 | 文案「凑齐 3 个同色自动消除 / 清完所有螺丝就过关」+「知道了」按钮 | 点击「知道了」→ 存档 `tutorialDone` |

引导期间顶栏按钮全部置灰（`allDisabled`），其余输入照常。完成态持久化，重进不再触发。

### 2.11 暂停

暂停面板五键：**继续游戏 / 音效开关（运行时切换，不落盘）/ 玩法说明 / 选关菜单 / 重开本关**。暂停（含选关菜单）为**真冻结**：主循环跳过相机/补间/粒子/提示/引导更新，仅绘制。

---

## 3. 进度与存档

### 3.1 星级与结算统计

| 项 | 规则 |
|---|---|
| 星级 | 3★ 起步；本关用过撤销 −1；本关用过失败救援（奖励或金币）−1；下限 1★ |
| 结算展示 | 星级、用时（m:ss）、步数（收集数）、金币 +N、当前余额 |
| 记录策略 | `SaveManager.recordResult` 保留 **最佳星级与最快用时**（步数记录最近一次） |
| 解锁 | 通关第 N 关解锁第 N+1 关；满 30 关通关标记 `allCleared` |

### 3.2 启动流程

| 场景 | 行为 |
|---|---|
| 首次启动（引导未完成） | 直接进第 1 关并跑三步引导 |
| 冷启动（引导已完成） | 解析 `getLaunchOptions` 的 `query.level`：在解锁范围内 → 直达该关；否则 → 选关菜单 |
| 热启动（`onShow`） | 同上解析 `res.query.level` 直达；无有效 query 且后台 >60s → 「欢迎回来，点击屏幕继续」全屏遮罩（**任意触摸即关闭**——独立触摸监听，长按/手指微移/动画锁定期间均有效；关闭手势的点击被吞，防止误触下层 UI；进入关卡/菜单时强制清除） |
| 选关菜单可见时的后台回归 | 不弹回归遮罩（本来就在菜单态） |

### 3.3 存档键位（`wx.setStorageSync`，前缀 `screwmaster_`）

| 键 | 内容 |
|---|---|
| `progress` | `{unlockedLevel}` |
| `capacity` | 累计扩容次数（叠加在关卡槽位上，封顶 8） |
| `capacityday` | 当日扩容使用数（限 1） |
| `coins` | 金币余额 |
| `results` | 各关 `{stars, bestMs, moves}` |
| `tutorial` | 引导完成标记 |
| `adcount` / `sharecount` | 广告/分享日计数与最近时间戳（跨天自动翻滚，`canShow` 时实时重读） |

> 音效开关当前为运行时状态（暂停面板切换），**未持久化**——见第 10 节待办。

---

## 4. 关卡系统

### 4.1 关卡数据结构

> 微信小游戏 `require` 不支持 JSON，关卡文件写为 `module.exports = {...}`；由 `scripts/buildLevels.js` 生成覆盖，勿手改生成产物。

```js
// 示意（字段与生成产物一致；正式数据为 30 个文件）
module.exports = {
  "id": 6,
  "name": "成长 6",
  "colors": ["red", "blue", "yellow", "green"],
  "slotCount": 5,
  "gridSize": 8,
  "seed": 6123,
  "boards": [
    {
      "id": "b1", "prefab": "Board_Single",
      "position": [0, 0, 0], "rotation": [0, 0, 0],
      "collapseType": "tween",
      "holes": [
        { "id": "h1", "pos": [-1.4, 0, -0.26], "color": "red" },
        { "id": "h2", "pos": [0, 0, 0.26], "color": "blue", "coveredBy": ["b2"] },
        { "id": "h3", "pos": [1.4, 0, -0.26], "color": "red" }
      ]
    },
    {
      "id": "b2", "prefab": "Board_Single",
      "position": [0.3, 1.0, 0], "rotation": [0, 0, 0],
      "collapseType": "tween",
      "holes": [
        { "id": "h1", "pos": [-0.7, 0, 0], "color": "green" },
        { "id": "h2", "pos": [0.7, 0, 0], "color": "yellow" }
      ]
    }
  ]
};
```

| 字段 | 说明 |
|---|---|
| `slotCount` | 本关槽位基数（5 或校验器自动 +1 后的 6），玩家扩容另叠加 |
| `boards[].prefab` | `Board_Single`（3.6×1.2×0.22 单板）。加载器额外支持 `Board_L`（L 形）与 `Board_Gear`（12 齿齿轮盘，半径 1.6）——**当前 30 关只产出单板**，异形板为扩展点（见第 10 节） |
| `boards[].position/rotation` | 世界坐标（米/度）；生成器层间距固定 1.0，同层板间距 3.9，单板层 30% 概率竖转 90° |
| `holes[].pos` | 板局部坐标；生成器孔位网格为 `x∈{-1.4,-0.7,0,0.7,1.4} × z∈{-0.26,0.26}`（每板至多 10 孔） |
| `holes[].coveredBy` | 覆盖本孔位螺丝的木板 id 列表（静态、生成期确定、无环）；无此字段的螺丝开局即可拆 |
| `seed` / `gridSize` | 生成溯源（seed 可复现）；`gridSize` 为元信息，运行时不使用 |

**合法性约束（生成器保证 + 校验器强制）**：
1. 每孔 1 颗螺丝；每板 ≥1 孔；同板孔间距 ≥0.5，且不越出板面（|x| ≤1.6，|z| ≤0.42）；
2. 每种颜色螺丝总数 **为 3 的倍数**；
3. `coveredBy` 引用必须存在、高于被覆盖板至少 0.3、覆盖图无环；
4. 开局至少 1 颗未被覆盖螺丝；
5. 可解性模拟必须全绿（见 4.3）。

### 4.2 难度阶段（生成器 `STAGES`）

| 阶段 | 关卡 | 层数 | 板数 | 颜色数 | 螺丝数 | 覆盖强度 | 槽位 | 设计意图 |
|---|---|---|---|---|---|---|---|---|
| 新手 | 1-5 | 1-2 | 1-4 | 2-4 | 6-18 | 1-2 关无；3-5 关 0.3→0.5 | 5 | 1 关双色不可输；2 关起第 3/4 色制造输的可能；3 关起渐进引入遮挡（`EARLY` 表逐关定制） |
| 成长 | 6-15 | 2-3 | 3-6 | 4 | 15-30 | 0.5 | 5 | 引入空间遮挡 |
| 挑战 | 16-25 | 3-4 | 6-10 | 5 | 25-40 | 0.8 | 5 | 深度规划 |
| 大师 | 26-30 | 4-5 | 8-12 | 5-6 | 36-50 | 0.85 | 5 | 硬核收尾 |

- 覆盖分配：孔位中心落入上层板 footprint **核心区**（每边内缩 0.3）必然被覆盖；**边缘区**按概率覆盖（不低于 0.7），制造「看起来能点其实被挡」的观察陷阱；
- 颜色分配保证每色各为 3 的倍数后洗牌铺孔；
- 随机源为 mulberry32，`seed` 决定一切，关卡 100% 可复现。

### 4.3 校验器（发布管线必跑）

> **决策 D11**（沿用）：关卡由「生成器 + 校验器」双程序产出，**不接受纯手写**。`node test/run.js` 对全部 30 关逐关强制校验。

| 检查 | 规则 |
|---|---|
| 静态规则 | 板 id 唯一、无空板、颜色 3 倍数、孔位面内且不重叠、覆盖引用闭合、覆盖板高度差 ≥0.3、覆盖图无环、开局有可拆点 |
| 可解性模拟 | **3 组不同随机种子 ×100 次贪心拆解 + 1 次确定性贪心**，全部死局率 = 0 才通过 |
| 自动放宽 | 不满足则 `slotCount+1` 重试一轮，仍失败 → 关卡作废 |
| 贪心策略 | 槽内同色数×40，已有 2 颗 +200，仅剩 1 空位时拒新色 −150，板剩最后 1 颗 +25，场上同色余量×2，加噪声随机选 |

### 4.4 构建管线与加载

- `node scripts/buildLevels.js`：30 关逐关在 `[id×1000, id×1000+6000)` 种子预算内搜索**首个**通过校验器的种子，写入 `levelData/level_0XX.js`（含 `adjustedSlotCount` 与 `seed`），并重写 `js/levels/index.js`；
- `js/levels/index.js`：按 `GameConfig.levels.totalShipped` 懒加载（`defineProperty` getter + 缓存），启动只解析入口；
- `LevelLoader.load`：数据 → 场景树（板节点 → 孔位节点 → 螺丝节点），建 `coveredBy` 解锁表，并按各板世界包围盒计算取景参数（pivot / 包围球半径）。

---

## 5. 视听与反馈系统

### 5.1 音效清单（7 个，全部程序化合成）

> 资产由 `scripts/make_audio.py`（numpy）合成：22050Hz 单声道 16bit WAV，各文件 <100KB（实测 5~44KB）；`test/audio.test.js` 守护「7 个文件存在 / <100KB / RIFF 单声道 22050Hz」。重生成：`python3 scripts/make_audio.py`。

| ID | 触发 | 合成方向 |
|---|---|---|
| `sfx_screw_out` | 螺丝收集（`SCREW_COLLECTED`） | 金属摩擦 + 咔嗒，清脆高频 |
| `sfx_slot_in` | 入槽落位（`SLOT_UPDATED` 且 arrivedIndex ≥0） | 短促「嗒」 |
| `sfx_match` | 三消（`MATCH_MADE`） | 升调「叮」 |
| `sfx_collapse` | 板坍塌落地（`BOARD_COLLAPSED`） | 沉闷木头落地 + 低频 |
| `sfx_warn` | 满槽预警（`SLOT_FULL_WARNING`） | 311Hz 方波双短音 |
| `sfx_win` | 通关（`LEVEL_WIN`） | 琶音上行 |
| `sfx_lose` | 失败（`LEVEL_LOSE`） | 琶音下行 |

- 启动时全部预创建 InnerAudioContext；**首次触点才解锁播放**（微信策略，在 `onTap` 首调 `unlock()`）；
- 单条播放失败即标记 `_failed` 静默降级，不影响游戏；暂停面板可全局静音（运行时开关）；
- **BGM 暂未实现**（`playBgm()` 为空壳，见第 10 节待办）。

### 5.2 视觉反馈清单

| 事件 | 表现 |
|---|---|
| 收集螺丝 | 收集点同色粒子爆发（10 粒）+ 槽条飞行入槽（2D 贝塞尔抬高 60px，0.15s）+ 落槽回弹（0.25s，放大 1.25↔1） |
| 三消 | 槽条同色闪光渐隐 0.4s（可再接粒子扩展） |
| 满槽预警 | 槽条红框呼吸（`sin(8t)` 调制透明度） |
| 坍塌 | 警示闪透 3 次 → 加速坠落 + 随机翻滚 → 落地相机震 0.1s + 灰尘粒子 → 淡出移除 |
| 提示 | 目标螺丝提亮 + 金色脉冲描边（渲染层）+ 金环双波纹 + 上下浮动橙色箭头，至被点击 |
| 撤销被拒 | 顶部居中 Toast 1.4s（文案按原因区分） |
| 通关/失败 | 面板 0.3s 缩放淡入（cubicOut），半透明压暗背景 |
| 背景 | 竖向渐变（`scene.bgTop`→`scene.bgBottom`）随画布缓存，仅创建/换尺寸时重建 |

### 5.3 震动

- 统一 `Platform.vibrateShort()`（`type:'light'`，全机型 try/catch），由 `app.vibrate()` 闸口——**降级模式触发后全局关闭**；
- 触发点：螺丝收集、坍塌警示（`COLLAPSE_WARN`）、坍塌落地；
- 相机震动与设备震动并行：`CameraController.shake(time, intensity)` 仅位移叠加（幅度与相机距离成正比），不动旋转。

---

## 6. 商业化与经济系统

### 6.1 奖励提供方：双模式一键切换

> **决策 D19**：`GameConfig.ad.mode` = `'share'`（**当前**，流量主未开通）或 `'ad'`（开通后）。`AdManager` 与 `ShareManager` 实现**同一接口** `show(placement, cb) / canShow(placement) / setLevel(id)`，启动时按模式选定唯一 `rewardProvider`。五个奖励位、四段文案（失败面板/结算面板/帮助面板/选关页扩容按钮）随模式自动切换，**业务代码零改动**。

| 奖励位（placement） | 场景 | 奖励 |
|---|---|---|
| `capacity` | 选关页底部「暂存槽永久 +1」 | 槽位 +1（每日 1 次，上限 8） |
| `hint` | 顶栏提示按钮（金币不足时回落） | 高亮 1 颗可拆螺丝 |
| `win_double` | 结算面板「金币翻倍」 | 本关金币再发等额 |
| `fail_undo` | 失败面板「撤回最后一步」 | +1 撤销配额并立即执行 |
| `fail_clear` | 失败面板「移出 3 颗螺丝」 | 槽内**最早** 3 颗移出，状态恢复 `playing` |

失败面板按 `canShow()` 结果**动态裁剪**按钮（频控中的项不展示），金币救援按钮仅在余额 ≥50 时出现。奖励未发放一律 Toast 兜底（频控/取消/加载失败各有文案）。

### 6.2 AdManager（激励视频）

| 频控项 | 数值 |
|---|---|
| 冷启动禁弹 | 启动后 60s 内（`coldStartMs`） |
| 相邻间隔 | ≥45s（`cooldownMs`） |
| 每日上限 | 15 次（`dailyLimit`，日计数每次 `canShow` 重新读盘，跨天翻滚） |
| 单关上限 | `fail*` 位各 ≤2 次/关（`perLevelLimit`），换关清零 |

- 流程：`show()` → 失败自动 `load()` 重试一次 → `onClose.isEnded === true` 才发奖（跳过不发）；`onError` 静默降级并回调失败；
- **mock 模式**：`unitId` 为空（当前）或平台无该 API 时，`show` 直接回调 `{rewarded: true, mock: true}`，全流程可玩；上线时填入广告位即切换真实流程。

### 6.3 ShareManager（邀好友，当前模式）

| 频控项 | 数值 |
|---|---|
| 相邻间隔 | ≥5s（`share.cooldownMs`） |
| 每日上限 | 30 次（`share.dailyLimit`） |
| 单关上限 | `fail*` 位各 ≤3 次/关（`share.perLevelLimit`） |
| 发奖条件 | `wx.shareAppMessage` 的 **success** 回调才发奖；取消/失败不发（回调 `cancel`） |

- 每个奖励位有独立分享标题模板（含关卡号），如 `fail_undo` → 「我在第{level}关手滑了，快来教我拧螺丝！」（`capacity` 等未配置位走通用文案「拧螺丝啦，一起来解压！」）；
- **胶囊被动分享**：启动即 `showShareMenu({menus:['shareAppMessage','shareTimeline']})` 点亮右上角双分享；转发/朋友圈均携带动态关卡文案 + **后台审核通过的网络图**（`GameConfig.share.imageUrl` + `imageUrlId`，勿用本地图！`share.png`/`logo.png` 仅作设计源稿）+ 回流 `query=from=...&level=N`；
- **回流**：冷启动走 `getLaunchOptions`、热启动走 `onShow(res.query)` 双路径；关卡超解锁进度回落选关页；
- **合规提醒**：「分享得奖励」属微信《运营规范》诱导分享灰区，当前文案以「邀好友」弱化利益表述；**流量主开通后务必切回 `mode:'ad'`**（见 7.6 上线流程）。

### 6.4 金币经济（`GameConfig.economy`）

| 项 | 数值/规则 |
|---|---|
| 产出 | 通关 = 本关收集数 ×10；结算「翻倍」再发等额（`SaveManager.addCoins`） |
| 提示 | 30 金币（`hintCost`）；金币足够时优先于奖励通道 |
| 撤销 | 20 金币（`undoCost`），配额耗尽后可购 |
| 失败救援 | 50 金币（`rescueCost`）：「花 50 金币 撤回一步」，仅余额足够时出现在失败面板 |
| 确认 | `wx.showModal` 二选一弹窗（确定/取消），取消零消耗 |
| 展示 | 选关页头部「我的金币 N」；结算面板「金币 +N · 余额 N」 |

路由总原则：**免费配额 → 金币确认流 → 奖励通道**（提示专用；撤销无奖励通道直购，只有失败救援提供奖励版本）。

### 6.5 埋点（预留未接线）

- `Platform.reportEvent(name, params)` 已就绪（`wx.reportEvent` 包装 + mock），**当前无调用点**；
- 规划事件表（接线时参考）：

| 事件 | 参数 |
|---|---|
| `level_start` / `level_win` / `level_lose` | `{level, costMs}` |
| `level_win` 附加 | `{stars, moves, coins}` |
| `reward_request` / `reward_granted` | `{mode, placement}` |
| `coins_spend` | `{type: hint/undo/rescue, amount}` |
| `capacity_expand` | `{level}` |
| `hint_used` / `undo_used` | `{level}` |

---

## 7. 技术架构摘要

> 完整维护视角（装配顺序、输入路由、降帧保护、排障）见 `ARCHITECTURE.md`；此处保留设计决策与模块边界，供策划评审与 AI 协作。

### 7.1 技术选型

| 项 | 选择 | 理由 |
|---|---|---|
| 运行环境 | 微信小游戏原生（`game.js` → `js/main.js`） | 零引擎依赖，包体最小 |
| 渲染 | Canvas2D + 自研轻量 3D 管线：透视投影、背面剔除、画家算法、Lambert 平面着色、假椭圆阴影 | 规则几何体场景，2D 填充即可达标 |
| 语言 | CommonJS 纯 JS（ES5.1 兼容），零构建 | `require` 直载；Node 14+ 直接跑全部测试 |
| 数学 | 自研 `Vec3` / `Mat3`（行主序 3×3，轴角/欧拉角构造）/ `Ray`（OBB-slab、球求交） | 无第三方依赖 |
| 动画 | 自研 `TweenManager`（to/then 链/delay；Easing：linear、quadIn/Out、cubicIn/Out、backOut、sineInOut） | 数值全走 GameConfig |
| 粒子 | `ParticleFX` 对象池（≤300 粒；`burst` 收集爆发、`dust` 坍塌灰尘），降级半量 | 避免 GC 抖动 |
| 物理 | **无**（决策 D5） | 拾取/遮挡靠几何解析 |
| 平台层 | `Platform.js` 统一封装 wx API + `createMockPlatform` 测试桩注入；环境识别 `wechat/browser/node/mock` | 玩法逻辑 100% 离线可测 |
| 存储/音频/广告 | 均经 Platform：`setStorageSync` / `InnerAudioContext` / `createRewardedVideoAd` | 可 mock、可降级 |

### 7.2 分层红线（维护必读）

1. `gameplay/`、`levels/`、`core/`、`math/` 为**纯逻辑**：禁止 require `render/`、`ui/` 与运行环境 API；
2. 所有手感/难度/视觉数值只改 `GameConfig.js`；
3. 不引入构建步骤与第三方运行时依赖；新模块用 CommonJS；
4. 代码不加注释（项目约定），语义靠命名与测试表达；说明沉淀在 GDD/ARCHITECTURE。

### 7.3 模块职责表（现状）

| 模块 | 职责 | 关键接口 |
|---|---|---|
| `GameManager` | 对局状态机、收集/三消/胜负流转、撤销、提示选取、清槽 | `startLevel` `handleTap` `undo` `requestHint` `clearAnyScrews` |
| `LevelLoader` | 数据 → 场景树 + 覆盖表 + 取景参数 | `load(data, scene, screwManager)` |
| `ScrewManager` | 螺丝四态状态机 + 拧出补间 | `create` `setLocked` `unscrew` |
| `SlotManager` | 槽位数组（容量 ≤8）与三消查询 | `add` `findMatches` `removeMatch` `nearFull` `isDeadEnd` |
| `MatchChecker` | 纯函数：`findMatch`/`removeMatch`/`hasAnyMatch`/`isDeadEnd` | — |
| `UndoStack` | 操作栈 ≤30，满则丢最旧 | `push` `pop` |
| `CollapseManager` | 坍塌串行队列（警示→坠→落→淡出→间隔） | `queueCollapse(node)` `isActive()` |
| `CameraController` | 轨道旋转/缩放/阻尼/惯性/震动；`focusOn` 预留 | `onDrag` `onPinch` `shake(time, intensity)` |
| `InputManager` | 点击/拖拽/双指分发 + 输入锁 + 速度回传 | `onTap/onDrag/onDragEnd/onPinch` `setLocked` |
| `ScrewRaycaster` | 屏幕点 → 射线 → 球体命中拾取 + 遮挡复核 | `tryPick` `isCoreBlocked` |
| `SceneGraph` | 逻辑场景树（父子链、局部坐标、stamp 世界矩阵缓存） | `add` `beginFrame` `traverse` |
| `Renderer` | 投影 → 背面剔除 → 画家排序 → Lambert 填充；假阴影；高亮 | `render` `highlightScrewId` |
| `MeshBuilder` | 程序化几何：单板 / L 板 / 齿轮板 / 螺丝（法线朝外，测试守护） | `buildXxxMesh` |
| `Platform` | wx API 适配 + 测试桩 + 环境识别 | 全部静态方法 + `inject` |
| `EventBus` | 事件解耦（事件表见 7.5） | `on` `off` `emit` |
| `TweenManager` | 补间引擎 | `tween` `delay` `update` |
| `SaveManager` | 进度/星级/金币/扩容/广告与分享计数持久化 | 见第 3.3 节 |
| `AdManager` / `ShareManager` | 同接口奖励提供方（频控 + 发奖） | `show` `canShow` `setLevel` |
| `AudioManager` | 7 音效预载/解锁/播放/静音 + 事件绑定 | `preload` `unlock` `play` `bindGameEvents` |
| UI（12 件套） | `UISystem`（圆角矩形/螺丝图标/色表）、`TopBar`、`SlotUI`、`ResultPanel`、`FailPanel`、`HelpPanel`、`HintMarker`、`Toast`、`Tutorial`、`LevelSelect`、`PausePanel`、`ParticleFX` | `show/hide/update/draw/hitTest/resize` |

### 7.4 对局状态机

```
idle → playing ⇄ screwing（拧出动画，锁输入）
             playing → win_pending（1.4s 收尾）→ win → 结算
             playing → lose → undo/救援 → playing
```

子状态输入策略：

| 状态 | 输入 |
|---|---|
| `playing` | 正常分发（顶栏/拾取） |
| `screwing` | 拧出 0.35s，锁输入 |
| 坍塌队列中 | `InputManager.setLocked(true)`（队列清空后释放） |
| `win_pending` / `win` / `lose` | 释放输入，等面板接管 |
| 暂停 / 选关菜单 | 真冻结（跳过逻辑更新），仅响应各自面板 |

### 7.5 事件表（EventBus）

| 事件 | 载荷 | 主要监听方 |
|---|---|---|
| `SCREW_COLLECTED` | `{color, boardId, holeId, screenPos, entry}` | main（粒子/震动/提示清除/引导/顶栏）、SlotUI（飞行）、Audio |
| `SLOT_UPDATED` | `{slots, arrivedIndex, color}` | SlotUI、Audio（入槽音） |
| `MATCH_MADE` | `{color, count}` | SlotUI（闪光）、Audio |
| `BOARD_COLLAPSED` | `{boardId, unlocked}` | Audio（坍塌音） |
| `SLOT_FULL_WARNING` | `{count}` | SlotUI（红框）、Audio |
| `LEVEL_WIN` / `LEVEL_LOSE` | `{level, ...}` | main（结算/失败面板/存档/金币）、Audio |
| `LEVEL_LOADED` | `{level}` | SlotUI（整面板重置的唯一入口） |
| `COLLAPSE_WARN` | `{}` | main（震动） |
| `UNDO_DONE` | `{boardId, color}` | main（顶栏计数/进度时间戳） |
| `UNDO_DENIED` | `{reason}` | main（Toast） |

> `Events.GAME_STATE_CHANGED` 为常量表预留项，当前无触发方。

### 7.6 拾取与遮挡判定（双保险）

1. **主**：关卡数据 `coveredBy` 静态声明（生成器保证上层板 y 更高、无环）；板坍塌后 `onCollapseFinished` 逐个解锁；
2. **兜底**：点击时 `ScrewRaycaster.tryPick` 先以**螺丝头球体**（半径 = `headRadius`×1.7）做射线命中并按距离排序，再对每个候选跑 `isCoreBlocked`：任何**更高**（y 差 >0.3）的板，其投影 footprint **核心区**（每边内缩 0.3）罩住孔位 → 拒点。

> **决策 D8**（修订）：兜底判定从 v3.0 的「射线-OBB 二次求交」简化为 **footprint 核心区遮挡测试**——与生成器覆盖规则同源（同参数 0.3），行为 100% 确定、无浮点边缘问题；`Ray.intersectOBB`（slab 法）保留为数学工具并有测试守护。
>
> **决策 D9**（沿用）：遮挡数据是**静态**的（建造时确定），不随拆解顺序变化——坍塌只发生在「该板螺丝拆空」之后，上层覆盖物永远先于坍塌存在。

### 7.7 渲染管线约定

| 决策 | 内容 |
|---|---|
| **D12** | Canvas2D + 画家算法：全部面片按视空间 z 远→近统一排序填充（顶点缓存逐帧只做矩阵变换） |
| **D13** | 几何全程序化（板/螺丝无模型贴图）；**网格法线一律朝外**（`test/render.test.js` 守护，改 `MeshBuilder` 必须跑） |
| **D14**（修订） | 排序键 = 面片中心视空间 z；不做特殊偏置。背面剔除：世界法线·质心向量 ≥0 即剔除；近平面（`near` 0.1）剔除 |
| **D15** | UI 与 3D 分层：同画布两阶段（3D 全部绘完再绘 UI 层），UI 不参与深度排序；绘制顺序：背景 → 3D → 粒子 → 槽条 → 顶栏 → 提示标记 → 选关 → 暂停 → 结算 → 失败 → 帮助 → 引导 → Toast → 回归遮罩 |
| **D16** | 假阴影：每板在地面（`scene.groundY` −1.6）画半透明椭圆（α=0.18），随板高度线性淡出（6m 内），坍塌淡出期随板透明度联动 |
| **D17** | 平台差异全部收敛在 `Platform.js`；Node/mock 环境注入桩，无画布时渲染层整体跳过 |
| 高亮 | `Renderer.highlightScrewId`（节点 id）：Lambert 提亮 +0.45~+0.8 脉冲 + 金色描边（α 随脉冲 0.75~1.0，线宽 1.8） |
| 光照 | 单向光 `lightDir [0.5,1,0.35]`，环境光 0.45：`ambient + (1−ambient)·max(0, n·l)` |

### 7.8 主循环与性能保护

```
tick(): now/dt(钳制 ≤0.05) → 慢帧统计 → [非冻结] 相机/补间/粒子/提示/引导更新
     → 槽条/面板/Toast 更新 → 提示按钮状态 → 金币确认窗口过期 → 60s 卡关检测
     → 绘制（7.7 D15 顺序）→ raf 下一帧
```

| 保护项 | 规则 |
|---|---|
| 降帧保护 | 单帧 >40ms 累计满 30 帧 → `degraded=true`：粒子减半（`halfMode`）+ 关闭全部震动 |
| dt 钳制 | 切后台回归等超大 dt 一律按 0.05s 结算，防补间跳变 |
| 窗口 resize | `onWindowResize` → 重建画布/背景渐变/相机/胶囊/安全区/全部 UI 布局（折叠屏兼容） |
| 生命周期 | `onHide` 记时间戳；`onShow` 清时间戳并重置上帧时间（防超大 dt）；>60s 后台回归出遮罩 |
| 背景缓存 | 渐变对象随画布尺寸缓存，不逐帧重建 |
| 关卡懒加载 | `levels/index.js` getter + 缓存，启动只解析入口关卡 |

---

## 8. 性能与兼容性

### 8.1 性能预算（以中低端安卓为基准）

| 指标 | 预算 | 现状 |
|---|---|---|
| 首包体积 | ≤2MB | 代码+30 关+7 音效合计 ≈400KB，余量充足 |
| 单帧可见面片 | ≤3000（2D 填充路径） | 最大关（12 板×50 螺丝）约 1700 面片（板 6 面/个，螺丝 33 面/个，剔除前） |
| 同屏粒子 | ≤300（降级 150） | 收集 10 粒/次、坍塌灰尘 10 粒/次 |
| 常驻内存 | ≤150MB | 无引擎，远低于预算 |
| 帧率 | 低端 ≥30 / 中端 ≥50 | 降帧保护兜底 |

### 8.2 微信小游戏环境注意（避坑）

- **无 DOM**：禁止 `document`/`window.innerWidth`；尺寸走 `Platform.getSystemInfo()`（微信环境取 `windowWidth/windowHeight/pixelRatio/safeArea`）；
- **胶囊避让**：`getMenuButtonBoundingClientRect()` 取真实位置（API 缺失用兜底矩形 `{top:26, height:32, left:w−94, right:w−7}`）；顶栏标题与胶囊垂直居中，四按钮行在胶囊**正下方**、右缘对齐 `capsule.right`；槽条底边避让 `h − safeArea.bottom`；
- **计时**：所有冷却/日限用绝对时间戳（`Platform.now()`），不用帧数；
- **音频**：首触点解锁（见 5.1）；
- **分享图**：必须后台上传审核通过的网络图 + `imageUrlId`，本地 `share.png`/`logo.png` 仅设计源稿；
- **震动**：`vibrateShort` 全机型 try/catch，降级期全局闸口关闭；
- **打包**：`project.config.json` 已排除 `test/`、`scripts/`、`GDD.md` 出包；压缩与 sourceMap 上传开启。

---

## 9. 质量保障

### 9.1 测试体系（`test/`，当前 **141 项断言全绿**）

```
node test/run.js                      # 全量（16 套件）
node scripts/headlessPlaythrough.js   # 30 关无头打通（贪心玩家 + 救援配额）
```

| 套件 | 覆盖 |
|---|---|
| `core` | EventBus 收发/解绑/异常隔离、Platform mock 与 vibrate 容错 |
| `math` | Vec3/Mat3/Ray(OBB+球)/Camera 投影与射线往返 |
| `render` | SceneGraph 父子变换、Renderer 冒烟、**四类网格法线朝外守护** |
| `input` | 点击/拖拽阈值/双指/输入锁/速度回传/第二指取消点击 |
| `match` | MatchChecker 全组合、UndoStack 上限、SlotManager 容量/预警 |
| `tween` | 补间完成/延迟/链式/停止/缓动边界 |
| `gameManager` | 收集/三消/胜负/输入锁/拾取/遮挡/坍塌钩子/撤销五态 |
| `collapse` | 坍塌串行/落地解锁时序/快照撤销/配额/败局恢复/坍塌板清栈 |
| `levels` | **30 关逐个过校验器**、生成器 3 倍数性质、校验器四类反例 |
| `bootstrap` | 无头端到端：bootstrap → 模拟点击通关 → 面板进下一关 |
| `ad` | mock 发奖/冷启动/冷却/每关限次/日限/真广告 isEnded/跳过不发 |
| `share` | 成功发奖/取消不发/冷却/单关限次/换关清零/标题模板 |
| `audio` | 7 文件存在/<100KB/RIFF 单声道 22050Hz |
| `ui` | 胶囊避让/按钮右缘对齐/帮助面板滚动与惯性/槽条安全区与对称留白/提示标记生命周期/重置 |
| `meta` | 存档（引导标记/最佳星时/每日扩容）、引导推进、选关命中、暂停命中、金币收支、失败面板条件展示、Toast 过期 |
| `launch` | 被动分享注册/冷启动 query 直达/超解锁回落/无 query 菜单/热启动直达/菜单态不弹回归/回归遮罩单击仅关闭 |

**约定：新功能必须带测试**；纯逻辑直接断言，UI 用假 ctx 冒烟，流程用 `Platform.inject` + `raf` 收帧 + `now` 控时钟做无头驱动。

### 9.2 无头打通验证

`headlessPlaythrough.js` 模拟贪心玩家：评分选点（同槽同色优先、拒绝新色占位、优先清空剩 1 的板）→ 投影取屏幕坐标 → 走真实拾取链 `tryPick` 才允许点击（验证射线/遮挡与真实一致）→ 失败时用撤销（≤3）与清 3（≤3）救援 → 30 关必须全部 `win` 否则退出码 1。`DEBUG_LEVEL=N` 可复现单关死锁现场。

### 9.3 真机验收清单（上线前人工过一遍）

| 类别 | 检查项 |
|---|---|
| 兼容 | iOS 音频首触点解锁；低端安卓帧率 ≥30 且降级生效；刘海/折叠屏 resize 后布局正常；旧基础库胶囊 API 缺失走兜底矩形 |
| 布局 | 胶囊不遮顶栏按钮；Home 指示条不压暂存槽；竖屏锁定 |
| 生命周期 | 后台 >60s 回归出「欢迎回来」；切后台不产生超大 dt |
| 分享 | 胶囊菜单转发卡片标题/图正常；奖励分享成功发奖、取消不发；回流直达正确关卡 |
| 存档 | 杀进程重进：进度/星级/金币/扩容/引导完成态全部保持 |
| 审核 | 无诱导分享文案残留（share 模式期间）；广告位开通后切回 `mode:'ad'` |

---

## 10. 交付状态与后续规划

### 10.1 已交付（对应 v3.0 里程碑 M0–M7，全部完成）

| 里程碑 | 状态 |
|---|---|
| M0 工程骨架（Platform/主循环/渲染） | ✅ |
| M1 相机手感与输入分发 | ✅ |
| M2 单板三消循环 | ✅ |
| M3 多层遮挡 + 动画坍塌 | ✅ |
| M4 关卡管线（生成器/校验器/30 关） | ✅（`node test/run.js` 自动化验收） |
| M5 反馈系统（音效/粒子/震动/面板） | ✅ |
| M6 商业化（奖励双通道 + 频控 + 金币经济） | ✅（share 模式运行中，ad 通道随时切换） |
| M7 性能优化 + 真机适配 | ✅（降帧保护/resize/胶囊避让；提审素材为人工项） |

额外完成：三步新手引导、选关菜单+星级+回玩、暂停/设置、帮助面板、Toast、结算统计、被动分享与回流、金币弹窗确认流。

### 10.2 待办（迭代候选，按优先级）

| 项 | 现状 | 说明 |
|---|---|---|
| 埋点接线 | `Platform.reportEvent` 就绪、无调用点 | 按 6.5 事件表补监听即可 |
| 切正式广告 | `ad.unitId` 空、`mode:'share'` | 流量主开通后填位 + 改 `'ad'`，四个奖励位与文案自动切换 |
| BGM | `playBgm()` 空实现 | 需素材（建议 ≤500KB 循环段）后接 InnerAudioContext |
| 音效开关持久化 | 仅运行时状态 | 落 `SaveManager` 一键补 |
| 异形板型投入关卡 | `Board_L`/`Board_Gear` 渲染/加载已支持，生成器未产出 | 扩 `generator`（footprint/孔位网格同步校验器）+ 关卡混搭 |
| 自动聚焦镜头 | `focusOn()` 预留未接线 | 点击遮挡区时提示性转视角 |
| 提示按钮常驻化 | 当前常驻可用（每关 1 次） | 若数据需要可改卡关 60s 才亮 |
| 无尽模式 | 未做 | 生成器现成，加循环 + 计分 + 广告复活 |
| 物理坍塌 | 未做 | 原生路线无物理引擎，属 Cocos 迁移项（附录 C） |

---

## 11. 风险清单与兜底方案

| # | 风险 | 等级 | 现状/兜底 |
|---|---|---|---|
| 1 | 自绘 3D 视觉「廉价」，玩家不买账 | 中 | 已强化：描边/渐变光照/假阴影/坍塌粒子与震屏；最坏仅换渲染层回 Cocos（纯逻辑整体平移，附录 C） |
| 2 | 画家算法在复杂叠层下排序穿帮 | 中 | 面片级深度排序 + 关卡限制单板尺寸；真机巡检发现穿帮关卡由生成器换 seed 重出 |
| 3 | 低端机 Canvas2D 帧率不达标 | 中 | 降帧保护（粒子减半+关震动）、dt 钳制、顶点缓存；极端低模螺丝为备用项 |
| 4 | 「分享得奖励」触碰诱导分享红线 | **高** | 当前文案「邀好友」弱化利益；频控严格（5s/30 日）；**流量主开通后第一优先级切 `mode:'ad'`** |
| 5 | 三消「卡死局」引发负面情绪 | 中 | 校验器保证 3 组随机 ×100 次贪心零死局（不足自动 +1 槽）；满槽前预警（≥4）；失败面板三路救援（撤销/清 3/金币） |
| 6 | 无构建纯 JS 项目规模膨胀难维护 | 中 | 分层红线（7.2）+ 141 项测试 + 每模块职责表；`gameplay/levels/core/math` 禁触运行环境 |
| 7 | 广告位未开通导致变现空窗 | 低 | share 通道过渡中；mock 保证全流程可玩；切广告为纯配置操作（见 `ARCHITECTURE.md`「接真广告/上线」小节） |
| 8 | 分享图审核不通过 | 低 | 使用后台已审图 + `imageUrlId`；设计源稿与线上图分离 |

---

## 12. AI 协作 Prompt 模板库（迭代版）

> 使用约定：每次只喂 1 个模板，并附本 GDD 对应章节 + `GameConfig.js` 相关段；输出到对应 `js/` 目录，**新功能必须附 `test/` 用例**并跑通 `node test/run.js`。以下模板均基于当前代码形态（CommonJS、无注释、数值走 GameConfig）。

### 模板 1：无限循环模式（无尽模式）
> 微信小游戏纯 CommonJS 项目（无注释、数值集中 GameConfig）。请基于现有 `generator.generateLevel` / `validator.validate` 增加无尽模式：每通关一「波」生成下一关（关卡序号从 31 递增、难度按 STAGES 封顶后继续爬升：板数 +1、覆盖强度向 0.9 收敛），失败即结算；计分 = 累计收集数；不写存档进度（独立 score 键，前缀 `screwmaster_`）。入口复用选关菜单加一个按钮。附 Node 单测：无限生成 200 波全部过校验器。

### 模板 2：接入正式激励视频
> 项目当前 `GameConfig.ad.mode === 'share'`。请在不改业务代码的前提下完成切换验收：把 `mode` 改 `'ad'`、`unitId` 占位说明填法；补充 `test/ad.test.js` 真实流程用例（onClose.skipped 不发、error 静默、load 重试一次）；并核对四个奖励位文案在 ad 模式下全部显示「看视频」。不要动 `ShareManager` 代码（保留回落能力）。

### 模板 3：新增一个异形板型进生成器
> 现有 `MeshBuilder.buildLBoardMesh` / `LevelLoader` 已支持 `Board_L`（arm 1.2×1.2）。请扩展 `generator.js`：成长期起按 15% 概率产出 L 板；同步 `boardFootprint` 与 `validator` 的孔位边界/遮挡核心区（L 板 footprint 为 `[w/2, t/2, d]` 外扩矩形近似即可，注明误差）；`buildLevels` 重出 30 关后 `node test/run.js` 与 `headlessPlaythrough` 必须全绿。

### 模板 4：埋点接线
> `Platform.reportEvent` 已就绪。请按 GDD 6.5 事件表，在 `main.js` 事件订阅段接线：`level_start/level_win/level_lose`（附 stars/moves/costMs）、`reward_request/granted`（附 mode/placement）、`coins_spend`、`capacity_expand`。不改现有玩法逻辑；补 `test/` 用例断言 mock 收到正确事件与参数。

### 模板 5：新增一个结算面板变体（如满星彩蛋）
> 参照 `ui/ResultPanel.js`（show/hide/update/hitTest/draw/_layout 五件套 + resize），在不改其职责的前提下：满 3 星且用时低于该关历史最佳时，面板顶部加一条庆祝文案与粒子（`ParticleFX.burst`）。布局走 `GameConfig` 新增色值，禁止硬编码；`test/ui.test.js` 补命中与绘制冒烟。

### 模板 6：音效开关落盘 + BGM 接入
> `AudioManager.muted` 目前仅运行时。请：① 落 `SaveManager`（键 `screwmaster_sound`，默认开）；② `playBgm()` 接 8s 循环段（`audio/bgm_main.wav`，占位即可），首触点解锁后播放、静音联动，`test/audio.test.js` 相应放宽为 8 文件校验。

---

## 附录 A：GameConfig.js 集中调参清单

> 以下为 `js/config/GameConfig.js` 当前内容的镜像；**所有手感/难度/视觉/经济数值只允许在此调整**。

```js
const GameConfig = {
  camera: { yawSpeed: 0.6, pitchSpeed: 0.4, pitchMin: -35, pitchMax: 30,
            distMin: 3, distMax: 12, damping: 0.15, inertia: 0.92 },
  input: { tapThreshold: 10, tapMaxTime: 300 },
  screw: { unscrewAnimTime: 0.35, flyTime: 0.15, rise: 0.5, spinDeg: 540,
           headRadius: 0.16, headHeight: 0.1, shaftRadius: 0.06, shaftLength: 0.35 },
  slot: { defaultCount: 5, maxCount: 8, warnAt: 4 },
  match: { needCount: 3 },
  collapse: { warnTime: 0.25, fallTime: 0.5, rotMin: 15, rotMax: 30,
              fallDist: 2.5, queueGap: 0.2 },
  ad: { unitId: '', mode: 'share', cooldownMs: 45000, dailyLimit: 15,
        coldStartMs: 60000, perLevelLimit: 2 },
  share: {
    cooldownMs: 5000, perLevelLimit: 3, dailyLimit: 30,
    imageUrl: 'https://mmocgame.qpic.cn/wechatgame/Ywjy1K1L6eNtDDlF1cdWvqrdUriat9MAygoC1eZNAdicUOq0aNCKmJnQwZodpjhdKV/0',
    imageId: 'NhraUZjpQfuVp2CrmYHT/A=='
  },
  economy: { hintCost: 30, undoCost: 20, rescueCost: 50 },
  levels: { totalShipped: 30, maxUndoOps: 30 },
  render: { fov: 45, near: 0.1, far: 50,
            lightDir: [0.5, 1, 0.35], ambient: 0.45,
            shadowAlpha: 0.18, maxParticles: 300, dpr: 1 },
  board: { width: 3.6, depth: 1.2, thickness: 0.22,
           sizeL: { w: 3.6, d: 1.2, h: 1.2 },
           gearRadius: 1.6, gearSegments: 12 },
  colors: {
    red:    { main: '#e74c3c', light: '#ff8a7c', dark: '#a83226' },
    blue:   { main: '#3498db', light: '#79c6f7', dark: '#20689c' },
    yellow: { main: '#f1c40f', light: '#ffe469', dark: '#a88a0a' },
    green:  { main: '#2ecc71', light: '#7cf2ac', dark: '#1e8c4d' },
    purple: { main: '#9b59b6', light: '#cd97e4', dark: '#6a3b7d' },
    orange: { main: '#e67e22', light: '#f7ac67', dark: '#a05616' }
  },
  wood: { main: '#c9a06c', light: '#e6c79f', dark: '#8f6c45' },
  scene: { groundY: -1.6, bgTop: '#dbe7f0', bgBottom: '#f6efe4' }
};
```

---

## 附录 B：本地运行与上线清单

```
# 全部单测（16 套件、141 项断言）
node test/run.js

# 30 关无头打通验证（贪心玩家 + 救援配额，全绿退出码 0）
node scripts/headlessPlaythrough.js

# 重出 30 关（生成器 + 校验器管线，种子搜索预算 6000，覆盖 js/levels/levelData/ 并重写 index.js）
node scripts/buildLevels.js

# 重新合成音效（22050Hz 单声道，7 个文件）
python3 scripts/make_audio.py

# 微信开发者工具
# 1) 导入本目录（minigame/）；appid 已接正式（wx30bb8fa22ff4c18f）
# 2) 编译即玩；真机预览走工具「预览」二维码
```

**上线/迭代前需项目方人工确认**：
- `GameConfig.ad.unitId`（留空 = mock 直发奖励）与 `GameConfig.ad.mode`（流量主开通后切 `'ad'`）；
- 分享图后台审核状态（`share.imageUrl` / `imageId` 指向已审资源）；
- 提审素材与类目、隐私协议等合规项。

---

## 附录 C：与 Cocos 版（v2.0）迁移对照

| v2.0（Cocos） | v3.0/3.1（原生）等价物 |
|---|---|
| Node/prefab 父子层级 | `SceneGraph` 逻辑节点 + 父指针 |
| `tween()` API | `TweenManager` |
| Physics BoxCollider + Raycast | `math/Ray` 求交 + footprint 遮挡判定 |
| Camera 组件 | `Camera`（手写投影/反投影）+ `CameraController` |
| `wx.*` 直调 | `Platform.js` 封装（可注入测试桩） |
| 编辑器场景/预制体 | 关卡数据 `.js` 程序化构建 |
| Cocos UI 系统 | 12 件套立即式 Canvas UI（`ui/`） |
| 引擎事件系统 | `EventBus` |

> 若数据验证成功需升级到 Cocos：`gameplay/ levels/ core/（除 TweenManager） math/` 全部模块可直接平移，仅替换 `render/ camera/ interaction/ ui/ platform/` 为引擎等价物。
