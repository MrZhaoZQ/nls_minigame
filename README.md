# 拧螺丝啦（nls_minigame）

原生微信小游戏 · **零引擎、零构建管线**（game.js + CommonJS 纯 JS + Canvas2D 自绘 3D）
玩法：3D 空间规划 / 休闲解压 / 三消 —— 旋转观察 → 拧螺丝入槽 → 同色×3 消除 → 木板坍塌 → 通关。

| | |
|---|---|
| 平台 | 微信小游戏（竖屏） |
| 引擎 | 无（自研 Canvas2D 渲染管线；提审引擎项选「自研引擎」） |
| 关卡 | 30 关（生成器 + 校验器管线产出，四阶段难度曲线） |
| 测试 | 146 项 Node 单测 + 30 关无头打通验证 |
| 包体 | ~830KB（预算 4MB） |
| 文档 | `GDD.md`（玩法与数值规格）· `ARCHITECTURE.md`（维护手册） |

---

## 快速开始

```bash
# 1) 微信开发者工具 → 导入本项目目录 → 编译预览（appid 已配置）
# 2) 全量单测
node test/run.js
# 3) 30 关无头打通（模拟贪心玩家，含救援机制）
node scripts/headlessPlaythrough.js
# 4) 重新生成 30 关（生成器+校验器，确定性管线）
node scripts/buildLevels.js
# 5) 重新合成音效（7 个 wav）
python3 scripts/make_audio.py
```

---

## 目录结构

```
├─ game.js / game.json         # 小游戏入口与配置
├─ project.config.json         # 开发者工具配置（appid 已接正式）
├─ logo.png                    # 应用图标
├─ share.png                   # 分享卡设计源稿（实际分享用后台审核图，见 GameConfig.share）
├─ audio/                      # 7 个程序化合成音效（wav）
├─ js/
│  ├─ main.js                 # 组装层：bootstrap、主循环、输入路由、事件接线
│  ├─ config/GameConfig.js    # ★ 唯一调参地（手感/难度/经济/广告/渲染/分享图）
│  ├─ platform/Platform.js    # wx API 适配 + 测试桩注入
│  ├─ math/                   # Vec3 / Mat3 / Ray（射线-OBB/球求交）
│  ├─ render/                 # SceneGraph / Camera / MeshBuilder / Renderer（画家算法）
│  ├─ camera/                 # 轨道相机（阻尼/惯性/缩放/震屏）
│  ├─ interaction/            # InputManager（点击/拖拽/双指）/ ScrewRaycaster（拾取+遮挡校验）
│  ├─ gameplay/               # 纯逻辑：螺丝状态机 / 槽位三消 / 坍塌队列 / 撤销栈 / MatchChecker
│  ├─ levels/                 # LevelLoader / generator / validator / levelData(30 关)
│  ├─ core/                   # GameManager / EventBus / TweenManager / SaveManager
│  ├─ ad/  share/             # AdManager（激励视频+频控）/ ShareManager（转发奖励+频控）
│  ├─ audio/                  # AudioManager（首触点解锁、静默降级）
│  └─ ui/                     # 选关/暂停/帮助/结算/失败/槽位/顶栏/Toast/提示标记/粒子
├─ scripts/                   # buildLevels / headlessPlaythrough / make_audio
└─ test/                      # 146 项单测（harness 微型断言库）
```

---

## 核心系统一览

| 系统 | 说明 |
|---|---|
| 渲染 | 透视投影 + 背面剔除 + 画家排序 + Lambert 着色；假阴影；程序化几何（板/螺丝） |
| 遮挡 | 数据 `coveredBy`（生成器几何判定）+ 点击射线二次校验 |
| 坍塌 | 动画串行队列（警示→坠落→淡出），禁用物理引擎 |
| 关卡 | 生成器分阶段（新手/成长/挑战/大师）；校验器四重标准（3 随机种子贪心 + 确定性贪心，死局率 0） |
| 新手引导 | 第 1 关首玩三步（旋转→点发光螺丝→规则），完成态存档 |
| 选关 | 网格+滚动+星级+回玩；扩容入口（邀好友每日 1 次，上限 8 槽） |
| 金币经济 | 通关产出；消耗：提示 30 / 撤销 20 / 失败救援 50（二次点击确认防误扣） |
| 分享 | 胶囊转发+朋友圈（审核图 `imageUrl`+`imageUrlId`）；奖励分享四出口；冷/热启动 query 回流 |
| 广告 | `GameConfig.ad.mode`：`'share'`（当前）⇄ `'ad'`（开通流量主后切换）；频控齐全 |
| 存档 | 进度/星级/金币/扩容/引导态，wx storage |
| 兼容 | 胶囊避让布局、safeArea、窗口 resize、降帧保护、震动/音频兜底 |

---

## 开发与迭代约定

- **调参只改 `GameConfig.js`**；玩法纯逻辑（gameplay/levels/core/math）不依赖渲染与平台层
- 新功能必须带单测；关卡改动必须过 `buildLevels` + `headlessPlaythrough`
- 迭代操作手册见 `ARCHITECTURE.md` §7（加关卡/木板/面板/音效/广告切换等）
- 真机验收清单见 `ARCHITECTURE.md` §9

## 上线状态

- ✅ 代码与关卡全量自测通过；appid 已接正式；分享审核图已配置
- ⏳ 待人工：流量主开通后填 `GameConfig.ad.unitId` 并切 `mode:'ad'`；隐私指引/类目资质；提审素材
