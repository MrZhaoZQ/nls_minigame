'use strict';

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const STAGES = [
  { max: 5,  layers: [1, 2], boards: [2, 3], colors: [3, 3], screws: [9, 15], cover: 0.15 },
  { max: 10, layers: [2, 3], boards: [4, 6], colors: [4, 4], screws: [24, 30], cover: 0.75 },
  { max: 15, layers: [3, 3], boards: [5, 7], colors: [4, 5], screws: [27, 34], cover: 0.8 },
  { max: 20, layers: [3, 4], boards: [6, 9], colors: [5, 5], screws: [30, 38], cover: 0.9 },
  { max: 25, layers: [4, 4], boards: [7, 10], colors: [5, 5], screws: [34, 44], cover: 0.92 },
  { max: 999, layers: [4, 5], boards: [8, 10], colors: [5, 5], screws: [40, 50], cover: 0.85 }
];

const COLOR_NAMES = ['red', 'blue', 'yellow', 'green', 'purple', 'orange'];

const EARLY = {
  1: { layers: [1, 1], boards: [2, 2], colors: [3, 3], screws: [9, 9], cover: 0 },
  2: { layers: [2, 2], boards: [2, 3], colors: [4, 4], screws: [12, 12], cover: 0.3 },
  3: { layers: [2, 2], boards: [3, 3], colors: [4, 4], screws: [15, 15], cover: 0.45 },
  4: { layers: [2, 2], boards: [4, 4], colors: [4, 4], screws: [18, 18], cover: 0.65 },
  5: { layers: [2, 2], boards: [4, 4], colors: [4, 4], screws: [24, 24], cover: 0.6 }
};

const PREFABS = ['Board_Single', 'Board_L', 'Board_Gear'];

const SINGLE_HOLE_GRID = [
  [-1.4, -0.26], [-1.4, 0.26],
  [-0.7, -0.26], [-0.7, 0.26],
  [0, -0.26], [0, 0.26],
  [0.7, -0.26], [0.7, 0.26],
  [1.4, -0.26], [1.4, 0.26]
];

const L_HOLE_GRID = [
  [-1.4, -0.26], [-1.4, 0.26],
  [-0.7, -0.26], [-0.7, 0.26],
  [0, -0.26], [0, 0.26],
  [0.7, -0.26], [0.7, 0.26],
  [1.4, -0.26], [1.4, 0.26],
  [-1.5, -1.1], [-0.9, -1.1]
];

const GEAR_HOLE_GRID = [
  [-1.1, 0], [-0.55, -0.95], [0.55, -0.95],
  [1.1, 0], [0.55, 0.95], [-0.55, 0.95],
  [-0.55, 0], [0.55, 0]
];

function stageOf(levelId) {
  if (EARLY[levelId]) return EARLY[levelId];
  for (let i = 0; i < STAGES.length; i++) {
    if (levelId <= STAGES[i].max) {
      const st = STAGES[i];
      return {
        layers: Array.isArray(st.layers) ? st.layers : [st.layers, st.layers],
        boards: st.boards,
        colors: st.colors,
        screws: st.screws,
        cover: st.cover
      };
    }
  }
  return STAGES[STAGES.length - 1];
}

function pickRange(rng, range) {
  return Math.floor(range[0] + rng() * (range[1] - range[0] + 1));
}

const SAME_COLOR_CAP_FROM = 3;
const SAME_COLOR_MAX_PER_BOARD = 2;
const EARLY_FAIR_FROM = 3;
const EARLY_FAIR_UNTIL = 5;

// cap 契约：调用方须保证 numColors * floor(cap/3)*3 >= total，否则截断后总和不足。
function distributeColors(total, numColors, cap) {
  const triples = Math.floor(total / 3);
  const base = Math.floor(triples / numColors);
  const extra = triples % numColors;
  const counts = [];
  for (let c = 0; c < numColors; c++) {
    counts.push((base + (c < extra ? 1 : 0)) * 3);
  }
  if (cap != null) {
    const capQ = Math.floor(cap / 3) * 3;
    let excess = 0;
    for (let c = 0; c < numColors; c++) {
      if (counts[c] > capQ) { excess += counts[c] - capQ; counts[c] = capQ; }
    }
    let guard = 0;
    while (excess > 0 && guard++ < 1000) {
      let placed = false;
      for (let c = 0; c < numColors && excess > 0; c++) {
        if (counts[c] + 3 <= capQ) { counts[c] += 3; excess -= 3; placed = true; }
      }
      if (!placed) break;
    }
  }
  return counts;
}

// 同板同色超限修复：与其他板的螺丝成对交换颜色（颜色与 coveredBy 几何无关，交换安全）。
// 贪心 2-cycle 存在罕见死角（双紧颜色互卡），故失败后做合法随机扰动重试（至多 24 轮）；
// 仍失败返回 false——校验器"同板同色"静态闸门会拒收该 seed，buildLevels 自动换 seed。
function disperseSameColor(level, rng, maxPerBoard) {
  const slots = [];
  const slotBoard = [];
  for (let b = 0; b < level.boards.length; b++) {
    const holes = level.boards[b].holes;
    for (let h = 0; h < holes.length; h++) {
      slots.push(holes[h]);
      slotBoard.push(b);
    }
  }
  const n = slots.length;
  const counts = [];
  for (let b = 0; b < level.boards.length; b++) counts.push({});

  function rebuildCounts() {
    for (let b = 0; b < counts.length; b++) counts[b] = {};
    for (let i = 0; i < n; i++) {
      const b = slotBoard[i];
      const c = slots[i].color;
      counts[b][c] = (counts[b][c] || 0) + 1;
    }
  }

  function legalSwap(i, j) {
    const bi = slotBoard[i], bj = slotBoard[j];
    if (bi === bj) return false;
    const ci = slots[i].color, cj = slots[j].color;
    if (ci === cj) return false;
    if ((counts[bi][cj] || 0) + 1 > maxPerBoard) return false;
    if ((counts[bj][ci] || 0) + 1 > maxPerBoard) return false;
    counts[bi][ci]--;
    counts[bi][cj] = (counts[bi][cj] || 0) + 1;
    counts[bj][cj]--;
    counts[bj][ci] = (counts[bj][ci] || 0) + 1;
    slots[i].color = cj;
    slots[j].color = ci;
    return true;
  }

  for (let attempt = 0; attempt < 24; attempt++) {
    rebuildCounts();
    if (attempt > 0) {
      for (let s = 0; s < n; s++) {
        legalSwap(Math.floor(rng() * n), Math.floor(rng() * n));
      }
      rebuildCounts();
    }
    let stuck = false;
    for (let iter = 0; iter < 2000; iter++) {
      let vi = -1;
      for (let i = 0; i < n; i++) {
        if (counts[slotBoard[i]][slots[i].color] > maxPerBoard) { vi = i; break; }
      }
      if (vi < 0) return true;
      const start = Math.floor(rng() * n);
      let swapped = false;
      for (let k = 0; k < n && !swapped; k++) {
        swapped = legalSwap(vi, (start + k) % n);
      }
      if (!swapped) { stuck = true; break; }
    }
    if (stuck) continue;
  }
  return false;
}

function prefabHalfExtents(prefab) {
  if (prefab === 'Board_L') return { hw: 1.8, hd: 1.2 };
  if (prefab === 'Board_Gear') return { hw: 1.6, hd: 1.6 };
  return { hw: 1.8, hd: 0.6 };
}

function holeGridOf(prefab) {
  if (prefab === 'Board_L') return L_HOLE_GRID;
  if (prefab === 'Board_Gear') return GEAR_HOLE_GRID;
  return SINGLE_HOLE_GRID;
}

function woodXReach(prefab, yaw) {
  const rad = yaw * Math.PI / 180;
  const c = Math.cos(rad), s = Math.sin(rad);
  const ac = Math.abs(c), as = Math.abs(s);
  if (prefab === 'Board_Gear') return 1.6;
  const main = 1.8 * ac + 0.6 * as;
  if (prefab === 'Board_L') {
    const arm = Math.abs(-1.2 * c + 1.2 * s) + 0.6 * (ac + as);
    return Math.max(main, arm);
  }
  return main;
}

function boardFootprint(boardDef) {
  const rad = (boardDef.rotation[1] || 0) * Math.PI / 180;
  const he = prefabHalfExtents(boardDef.prefab || 'Board_Single');
  const cos = Math.abs(Math.cos(rad)), sin = Math.abs(Math.sin(rad));
  return {
    hw: he.hw * cos + he.hd * sin,
    hd: he.hw * sin + he.hd * cos
  };
}

function generateLevel(levelId, seed) {
  const rng = mulberry32(seed != null ? seed : levelId * 7919 + 13);
  const stage = stageOf(levelId);

  const layerCount = pickRange(rng, stage.layers);
  const boardCount = pickRange(rng, stage.boards);
  let colorCount = pickRange(rng, stage.colors);

  const shapePool = [];
  const shapeChance = levelId < 3 ? 0 : (levelId <= 5 ? 0.2 : (levelId <= 25 ? 0.35 : 0.15));
  for (let i = 0; i < boardCount; i++) {
    if (rng() < shapeChance) shapePool.push(PREFABS[1 + Math.floor(rng() * 2)]);
    else shapePool.push('Board_Single');
  }
  const yawChance = levelId < 3 ? 0 : (levelId <= 5 ? 0.2 : 0.5);

  const capacityOf = (b) => holeGridOf(shapePool[b]).length;

  let targetScrews = pickRange(rng, stage.screws);
  targetScrews = Math.min(targetScrews, boardCount * 10);
  targetScrews = Math.max(boardCount * 1, Math.round(targetScrews / 3) * 3);

  const perBoardMin = 1;
  const holesPerBoard = [];
  let assigned = 0;
  for (let b = 0; b < boardCount; b++) {
    if (b === boardCount - 1) {
      holesPerBoard.push(Math.max(perBoardMin, Math.min(capacityOf(b), targetScrews - assigned)));
    } else {
      const remainingBoards = boardCount - b;
      const left = targetScrews - assigned;
      const avg = left / remainingBoards;
      let n = Math.max(perBoardMin, Math.min(capacityOf(b), Math.round(avg + (rng() * 2 - 1))));
      n = Math.min(n, left - (remainingBoards - 1) * perBoardMin);
      holesPerBoard.push(n);
      assigned += n;
    }
  }
  let totalScrews = holesPerBoard.reduce((a, b) => a + b, 0);
  while (totalScrews % 3 !== 0) {
    const bi = holesPerBoard.findIndex(n => n > perBoardMin);
    if (bi < 0) break;
    holesPerBoard[bi]--;
    totalScrews--;
  }

  // 同板同色 ≤2 的容量预检（第 3 关起）：每色上限 = floor(2*板数/3)*3；
  // 颜色数装不下 → 自动 +1 色（至 6）；6 色仍不够 → 下调螺丝总数（从孔最多的板减）。
  let capPerColor = null;
  if (levelId >= SAME_COLOR_CAP_FROM) {
    capPerColor = Math.floor((2 * boardCount) / 3) * 3;
    if (capPerColor < 3) {
      capPerColor = null;
    } else {
      while (colorCount < COLOR_NAMES.length && colorCount * capPerColor < totalScrews) {
        colorCount++;
      }
      if (colorCount * capPerColor < totalScrews) {
        let cut = totalScrews - colorCount * capPerColor;
        while (cut > 0) {
          let bi = -1;
          for (let b = 0; b < holesPerBoard.length; b++) {
            if (holesPerBoard[b] > perBoardMin && (bi < 0 || holesPerBoard[bi] < holesPerBoard[b])) bi = b;
          }
          if (bi < 0) break;
          holesPerBoard[bi]--;
          cut--;
          totalScrews--;
        }
      }
    }
  }

  const colorCounts = distributeColors(totalScrews, colorCount, capPerColor);
  const colorPool = [];
  for (let c = 0; c < colorCounts.length; c++) {
    for (let k = 0; k < colorCounts[c]; k++) colorPool.push(COLOR_NAMES[c]);
  }
  const colorRng = mulberry32((seed != null ? seed : levelId * 7919 + 13) ^ 0x9E3779B9);
  for (let i = colorPool.length - 1; i > 0; i--) {
    const j = Math.floor(colorRng() * (i + 1));
    const tmp = colorPool[i]; colorPool[i] = colorPool[j]; colorPool[j] = tmp;
  }

  const boards = [];
  let colorCursor = 0;
  let boardSeq = 0;

  const boardsPerLayer = [];
  for (let l = 0; l < layerCount; l++) boardsPerLayer.push([]);
  for (let b = 0; b < boardCount; b++) {
    const layer = Math.round((b / Math.max(1, boardCount - 1)) * (layerCount - 1));
    boardsPerLayer[Math.min(layerCount - 1, layer)].push(b);
  }

  const layerGap = 1.0;
  const spacing = 3.9;
  let maxExtent = 0;

  for (let l = 0; l < layerCount; l++) {
    const layerBoards = boardsPerLayer[l];
    if (layerBoards.length === 0) continue;
    const n2 = layerBoards.length;
    const yaws = new Array(n2);
    const reaches = new Array(n2);
    for (let li = 0; li < n2; li++) {
      const pref = shapePool[layerBoards[li]];
      const rot90 = pref === 'Board_Single' && n2 === 1 && rng() < 0.3;
      let yaw = rot90 ? 90 : 0;
      if (!rot90 && rng() < yawChance) {
        yaw = [20, 40, 60, 80, -20, -40, -60, -80][Math.floor(rng() * 8)];
      }
      yaws[li] = yaw;
      reaches[li] = woodXReach(pref, yaw);
    }
    const rawX = new Array(n2);
    rawX[0] = 0;
    for (let li = 1; li < n2; li++) {
      rawX[li] = rawX[li - 1] + Math.max(spacing, reaches[li - 1] + reaches[li] + 0.9);
    }
    const jitter = levelId < 3 ? 0.25 : 0.7;

    for (let li = 0; li < layerBoards.length; li++) {
      const b = layerBoards[li];
      boardSeq++;
      const prefab = shapePool[b];
      const yaw = yaws[li];

      const groupX = rawX[li] - rawX[n2 - 1] / 2;
      const px = groupX + (rng() * jitter - jitter / 2);
      const pz = (rng() * 0.7 - 0.35) * (l % 2 === 0 ? 1 : -1);

      const def = {
        id: 'b' + boardSeq,
        prefab: prefab,
        position: [px, l * layerGap, pz],
        rotation: [0, yaw, 0],
        collapseType: 'tween',
        holes: []
      };
      const fp = prefabHalfExtents(prefab);
      maxExtent = Math.max(maxExtent, Math.abs(px) + fp.hw + 0.6, Math.abs(pz) + fp.hd + 0.6);

      const n = holesPerBoard[b];
      const grid = holeGridOf(prefab);
      const slots = [];
      const used = {};
      while (slots.length < n) {
        const gi = Math.floor(rng() * grid.length);
        if (used[gi]) continue;
        used[gi] = true;
        slots.push([grid[gi][0], 0, grid[gi][1]]);
      }

      for (let s = 0; s < slots.length; s++) {
        def.holes.push({
          id: 'h' + (s + 1),
          pos: slots[s],
          color: colorPool[colorCursor++]
        });
      }
      boards.push(def);
    }
  }

  const level = {
    id: levelId,
    name: 'level_' + levelId,
    colors: COLOR_NAMES.slice(0, colorCount),
    slotCount: 5,
    gridSize: Math.max(5, Math.ceil(maxExtent) * 2),
    boards: boards
  };

  assignCovering(level, stage.cover, rng);
  if (capPerColor != null) {
    disperseSameColor(level, rng, SAME_COLOR_MAX_PER_BOARD);
    // 修复失败（罕见贪心死角）不阻断：校验器"同板同色"闸门会拒收该 seed，buildLevels 自动换 seed。
  }
  if (levelId >= EARLY_FAIR_FROM && levelId <= EARLY_FAIR_UNTIL) {
    ensureEntryTriple(level);
  }
  return level;
}

function countColorOn(board, color) {
  let n = 0;
  for (let j = 0; j < board.holes.length; j++) {
    if (board.holes[j].color === color) n++;
  }
  return n;
}

function ensureEntryTriple(level) {
  for (let attempt = 0; attempt < 40; attempt++) {
    const unlocked = [];
    for (let i = 0; i < level.boards.length; i++) {
      const b = level.boards[i];
      for (let j = 0; j < b.holes.length; j++) {
        if (!b.holes[j].coveredBy) unlocked.push({ b: b, h: b.holes[j] });
      }
    }
    const cnt = {};
    for (let i = 0; i < unlocked.length; i++) {
      cnt[unlocked[i].h.color] = (cnt[unlocked[i].h.color] || 0) + 1;
    }
    const names = Object.keys(cnt);
    let ok = false;
    for (let i = 0; i < names.length; i++) {
      if (cnt[names[i]] >= 3) ok = true;
    }
    if (ok) return true;
    let done = false;
    for (let pi = 0; pi < names.length && !done; pi++) {
      const pc = names[pi];
      if (cnt[pc] < 2) continue;
      for (let i = 0; i < level.boards.length && !done; i++) {
        const b = level.boards[i];
        for (let j = 0; j < b.holes.length && !done; j++) {
          const h = b.holes[j];
          if (!h.coveredBy || h.color !== pc) continue;
          for (let u = 0; u < unlocked.length && !done; u++) {
            const ub = unlocked[u].b;
            const uh = unlocked[u].h;
            if (uh.color === pc) continue;
            if (countColorOn(ub, pc) >= SAME_COLOR_MAX_PER_BOARD) continue;
            if (countColorOn(b, uh.color) >= SAME_COLOR_MAX_PER_BOARD) continue;
            const tmp = uh.color;
            uh.color = pc;
            h.color = tmp;
            done = true;
          }
        }
      }
    }
    if (!done) return false;
  }
  return false;
}

function assignCovering(level, coverRatio, rng) {
  const byLayer = {};
  for (let i = 0; i < level.boards.length; i++) {
    const b = level.boards[i];
    const l = Math.round(b.position[1] / 1.0);
    if (!byLayer[l]) byLayer[l] = [];
    byLayer[l].push(b);
  }
  const layers = Object.keys(byLayer).map(Number).sort((a, b) => a - b);

  const PICK_R = 0.3;
  for (let li = 0; li < layers.length - 1; li++) {
    const lower = byLayer[layers[li]];
    for (let i = 0; i < lower.length; i++) {
      const board = lower[i];
      const rot = (board.rotation[1] || 0) * Math.PI / 180;
      const cos = Math.cos(rot), sin = Math.sin(rot);
      for (let j = 0; j < board.holes.length; j++) {
        const hole = board.holes[j];
        const lx = hole.pos[0], lz = hole.pos[2];
        const wx = board.position[0] + lx * cos - lz * sin;
        const wz = board.position[2] + lx * sin + lz * cos;
        const covers = [];
        for (let ul = li + 1; ul < layers.length; ul++) {
          const upper = byLayer[layers[ul]];
          for (let u = 0; u < upper.length; u++) {
            const up = upper[u];
            const fp = boardFootprint(up);
            const dx = Math.abs(wx - up.position[0]);
            const dz = Math.abs(wz - up.position[2]);
            const inCore = dx < fp.hw - PICK_R && dz < fp.hd - PICK_R;
            const inEdge = dx < fp.hw - 0.1 && dz < fp.hd - 0.05;
            if (inCore) covers.push(up.id);
            else if (inEdge && rng() < Math.max(coverRatio, 0.7)) covers.push(up.id);
          }
        }
        if (covers.length > 0) hole.coveredBy = covers;
      }
    }
  }
}

module.exports = { generateLevel, stageOf, distributeColors, boardFootprint, prefabHalfExtents, holeGridOf, disperseSameColor };
