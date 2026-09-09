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
  { max: 5,  layers: 1, boards: [1, 2], colors: [2, 3], screws: [6, 12], cover: 0 },
  { max: 15, layers: [2, 3], boards: [3, 6], colors: [4, 4], screws: [15, 30], cover: 0.5 },
  { max: 25, layers: [3, 4], boards: [6, 10], colors: [5, 5], screws: [25, 40], cover: 0.8 },
  { max: 999, layers: [4, 5], boards: [8, 12], colors: [5, 6], screws: [36, 50], cover: 0.85 }
];

const COLOR_NAMES = ['red', 'blue', 'yellow', 'green', 'purple', 'orange'];

const EARLY = {
  1: { layers: [1, 1], boards: [1, 2], colors: [3, 3], screws: [9, 9], cover: 0 },
  2: { layers: [1, 1], boards: [2, 2], colors: [3, 3], screws: [9, 12], cover: 0 },
  3: { layers: [2, 2], boards: [2, 3], colors: [3, 3], screws: [12, 12], cover: 0.3 },
  4: { layers: [2, 2], boards: [3, 4], colors: [4, 4], screws: [12, 15], cover: 0.4 },
  5: { layers: [2, 2], boards: [3, 4], colors: [4, 4], screws: [15, 18], cover: 0.5 }
};

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

function distributeColors(total, numColors) {
  const triples = Math.floor(total / 3);
  const base = Math.floor(triples / numColors);
  const extra = triples % numColors;
  const counts = [];
  for (let c = 0; c < numColors; c++) {
    counts.push((base + (c < extra ? 1 : 0)) * 3);
  }
  return counts;
}

function boardFootprint(boardDef) {
  const rad = (boardDef.rotation[1] || 0) * Math.PI / 180;
  const w = 3.6, d = 1.2;
  const cos = Math.abs(Math.cos(rad)), sin = Math.abs(Math.sin(rad));
  return {
    hw: (w * cos + d * sin) / 2,
    hd: (w * sin + d * cos) / 2
  };
}

function generateLevel(levelId, seed) {
  const rng = mulberry32(seed != null ? seed : levelId * 7919 + 13);
  const stage = stageOf(levelId);

  const layerCount = pickRange(rng, stage.layers);
  const boardCount = pickRange(rng, stage.boards);
  const colorCount = pickRange(rng, stage.colors);

  const GRID_CAPACITY = 10;
  let targetScrews = pickRange(rng, stage.screws);
  targetScrews = Math.min(targetScrews, boardCount * GRID_CAPACITY);
  targetScrews = Math.max(boardCount * 1, Math.round(targetScrews / 3) * 3);

  const perBoardMin = 1;
  const holesPerBoard = [];
  let assigned = 0;
  for (let b = 0; b < boardCount; b++) {
    if (b === boardCount - 1) {
      holesPerBoard.push(Math.max(perBoardMin, Math.min(GRID_CAPACITY, targetScrews - assigned)));
    } else {
      const remainingBoards = boardCount - b;
      const left = targetScrews - assigned;
      const avg = left / remainingBoards;
      let n = Math.max(perBoardMin, Math.min(GRID_CAPACITY, Math.round(avg + (rng() * 2 - 1))));
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

  const colorCounts = distributeColors(totalScrews, colorCount);
  const colorPool = [];
  for (let c = 0; c < colorCounts.length; c++) {
    for (let k = 0; k < colorCounts[c]; k++) colorPool.push(COLOR_NAMES[c]);
  }
  for (let i = colorPool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
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
    for (let li = 0; li < layerBoards.length; li++) {
      const b = layerBoards[li];
      boardSeq++;
      const rot90 = layerBoards.length === 1 && rng() < 0.3;
      const groupX = (li - (layerBoards.length - 1) / 2) * spacing;
      const px = groupX + (rng() * 0.5 - 0.25);
      const pz = (rng() * 0.7 - 0.35) * (l % 2 === 0 ? 1 : -1);
      const def = {
        id: 'b' + boardSeq,
        prefab: 'Board_Single',
        position: [px, l * layerGap, pz],
        rotation: [0, rot90 ? 90 : 0, 0],
        collapseType: 'tween',
        holes: []
      };
      maxExtent = Math.max(maxExtent, Math.abs(px) + 2.0, Math.abs(pz) + 1.0);

      const n = holesPerBoard[b];
      const slots = [];
      const xs = [-1.4, -0.7, 0, 0.7, 1.4];
      const zs = [-0.26, 0.26];
      const used = {};
      let guard = 0;
      while (slots.length < n && guard++ < 300) {
        const xi = Math.floor(rng() * xs.length);
        const zi = Math.floor(rng() * zs.length);
        const key = xi + '_' + zi;
        if (used[key]) continue;
        used[key] = true;
        slots.push([xs[xi], 0, zs[zi]]);
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
    colors: colorPool.slice(0, colorCount).map((_, i) => COLOR_NAMES[i]),
    slotCount: 5,
    gridSize: Math.max(5, Math.ceil(maxExtent) * 2),
    boards: boards
  };

  assignCovering(level, stage.cover, rng);
  return level;
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
      for (let j = 0; j < board.holes.length; j++) {
        const hole = board.holes[j];
        const wx = board.position[0] + hole.pos[0];
        const wz = board.position[2] + hole.pos[2];
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

module.exports = { generateLevel, stageOf, distributeColors, boardFootprint };
