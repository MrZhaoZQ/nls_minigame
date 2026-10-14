'use strict';

const val = require('../js/levels/validator');
const Levels = require('../js/levels/index');

function play(level, capacity, policy, rng) {
  const boards = {};
  const all = [];
  for (const bd of level.boards) {
    const holes = bd.holes.map(h => ({
      color: h.color, coveredBy: (h.coveredBy || []).slice(),
      removed: false, boardId: bd.id
    }));
    boards[bd.id] = { alive: true, remaining: bd.holes.length, holes };
    for (let i = 0; i < holes.length; i++) all.push(holes[i]);
  }
  const isCovered = (h) => {
    for (let k = 0; k < h.coveredBy.length; k++) {
      if (boards[h.coveredBy[k]] && boards[h.coveredBy[k]].alive) return true;
    }
    return false;
  };
  let slots = [];
  let remaining = all.length;
  let guard = 0;
  while (remaining > 0 && guard++ < 5000) {
    const avail = [];
    for (let i = 0; i < all.length; i++) {
      if (!all[i].removed && !isCovered(all[i])) avail.push(all[i]);
    }
    if (avail.length === 0) return 'stuck';
    let pick;
    if (policy === 'random') {
      pick = avail[Math.floor(rng() * avail.length)];
    } else {
      const counts = {};
      for (let i = 0; i < slots.length; i++) counts[slots[i]] = (counts[slots[i]] || 0) + 1;
      const free = capacity - slots.length;
      const colorRemain = {};
      for (let i = 0; i < all.length; i++) {
        if (!all[i].removed) colorRemain[all[i].color] = (colorRemain[all[i].color] || 0) + 1;
      }
      let best = null;
      let bs = -Infinity;
      for (let i = 0; i < avail.length; i++) {
        const h = avail[i];
        const cnt = counts[h.color] || 0;
        let s = cnt * 40;
        if (cnt >= 2) s += 200;
        if (free <= 1 && cnt === 0) s -= 150;
        if (boards[h.boardId].remaining === 1) s += 25;
        s += (colorRemain[h.color] || 0) * 2;
        if (policy === 'casual') s += rng() * 24;
        if (s > bs) { bs = s; best = h; }
      }
      pick = best;
    }
    pick.removed = true;
    remaining--;
    slots.push(pick.color);
    const b = boards[pick.boardId];
    b.remaining--;
    if (b.remaining === 0) b.alive = false;
    let matched = true;
    while (matched) {
      matched = false;
      const counts = {};
      for (let i = 0; i < slots.length; i++) counts[slots[i]] = (counts[slots[i]] || 0) + 1;
      const keys = Object.keys(counts);
      for (let k = 0; k < keys.length; k++) {
        if (counts[keys[k]] >= 3) {
          let rm = 0;
          slots = slots.filter(c => !(c === keys[k] && rm < 3 && (rm++, true)));
          matched = true;
          break;
        }
      }
    }
    if (slots.length >= capacity) {
      const counts = {};
      for (let i = 0; i < slots.length; i++) counts[slots[i]] = (counts[slots[i]] || 0) + 1;
      let any = false;
      for (const k of Object.keys(counts)) if (counts[k] >= 3) any = true;
      if (!any) return 'full';
    }
  }
  return remaining === 0 ? 'win' : 'stuck';
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function deathRate(level, policy, runs, seedBase) {
  let deaths = 0;
  for (let r = 0; r < runs; r++) {
    const out = play(level, level.slotCount, policy, mulberry32(seedBase + r * 7919));
    if (out !== 'win') deaths++;
  }
  return deaths / runs;
}

const ids = process.argv.slice(2).map(Number);
const target = ids.length ? ids : [4];
for (const id of target) {
  const lvl = Levels[id];
  const layers = new Set(lvl.boards.map(b => Math.round(b.position[1]))).size;
  console.log('level ' + id +
    ' screws=' + val.totalScrews(lvl) +
    ' colors=' + lvl.colors.length +
    ' boards=' + lvl.boards.length +
    ' layers=' + layers +
    ' slots=' + lvl.slotCount +
    ' | greedy-death=' + deathRate(lvl, 'greedy', 200, 11).toFixed(2) +
    ' casual-death=' + deathRate(lvl, 'casual', 400, 500).toFixed(2) +
    ' random-death=' + deathRate(lvl, 'random', 200, 900).toFixed(2));
}
