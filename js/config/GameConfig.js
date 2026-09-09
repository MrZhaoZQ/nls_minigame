'use strict';

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
  social: { rankKey: 'WRofNLSL' },
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

module.exports = GameConfig;
