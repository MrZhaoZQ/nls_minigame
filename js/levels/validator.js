'use strict';

const BOARD_W = 3.6;
const BOARD_D = 1.2;
const HEAD_R = 0.16;
const SCREW_MIN_DIST = 0.5;

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function colorTotals(level) {
  const totals = {};
  for (let i = 0; i < level.boards.length; i++) {
    const holes = level.boards[i].holes;
    for (let j = 0; j < holes.length; j++) {
      const c = holes[j].color;
      totals[c] = (totals[c] || 0) + 1;
    }
  }
  return totals;
}

function totalScrews(level) {
  let n = 0;
  for (let i = 0; i < level.boards.length; i++) n += level.boards[i].holes.length;
  return n;
}

function simulate(level, runs, capacityOverride, rng, deterministic) {
  const capacity = capacityOverride || level.slotCount;
  const baseRand = rng || mulberry32(9999);
  const rand = deterministic ? (() => 0) : baseRand;
  let deaths = 0;

  for (let run = 0; run < runs; run++) {
    const boards = {};
    const allHoles = [];
    for (let i = 0; i < level.boards.length; i++) {
      const bd = level.boards[i];
      const holes = [];
      for (let j = 0; j < bd.holes.length; j++) {
        const h = {
          color: bd.holes[j].color,
          coveredBy: (bd.holes[j].coveredBy || []).slice(),
          removed: false,
          boardId: bd.id
        };
        holes.push(h);
        allHoles.push(h);
      }
      boards[bd.id] = { alive: true, remaining: bd.holes.length, holes };
    }

    const isCovered = (h) => {
      for (let k = 0; k < h.coveredBy.length; k++) {
        if (boards[h.coveredBy[k]] && boards[h.coveredBy[k]].alive) return true;
      }
      return false;
    };

    let slots = [];
    let remaining = allHoles.length;
    let dead = false;
    let guard = 0;

    while (remaining > 0 && !dead && guard++ < 10000) {
      const available = [];
      for (let i = 0; i < allHoles.length; i++) {
        const h = allHoles[i];
        if (!h.removed && !isCovered(h)) available.push(h);
      }
      if (available.length === 0) { dead = true; break; }

      const slotCounts = {};
      for (let i = 0; i < slots.length; i++) slotCounts[slots[i]] = (slotCounts[slots[i]] || 0) + 1;
      const free = capacity - slots.length;

      const colorRemain = {};
      for (let i = 0; i < allHoles.length; i++) {
        const hh = allHoles[i];
        if (!hh.removed) colorRemain[hh.color] = (colorRemain[hh.color] || 0) + 1;
      }

      let best = [];
      let bestScore = -Infinity;
      for (let i = 0; i < available.length; i++) {
        const h = available[i];
        const cnt = slotCounts[h.color] || 0;
        let score = cnt * 40;
        if (cnt >= 2) score += 200;
        if (free <= 1 && cnt === 0) score -= 150;
        const b = boards[h.boardId];
        if (b.remaining === 1) score += 25;
        score += (colorRemain[h.color] || 0) * 2;
        score += rand() * 8;
        if (score > bestScore + 1e-9) { bestScore = score; best = [h]; }
        else if (Math.abs(score - bestScore) <= 1e-9) best.push(h);
      }

      const pick = best[Math.floor(rand() * best.length)];
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
        for (let i = 0; i < slots.length; i++) {
          counts[slots[i]] = (counts[slots[i]] || 0) + 1;
        }
        const keys = Object.keys(counts);
        for (let k = 0; k < keys.length; k++) {
          if (counts[keys[k]] >= 3) {
            let removedCount = 0;
            slots = slots.filter(c => {
              if (c === keys[k] && removedCount < 3) { removedCount++; return false; }
              return true;
            });
            matched = true;
            break;
          }
        }
      }

      if (slots.length >= capacity) {
        const counts = {};
        for (let i = 0; i < slots.length; i++) counts[slots[i]] = (counts[slots[i]] || 0) + 1;
        const keys = Object.keys(counts);
        let any = false;
        for (let k = 0; k < keys.length; k++) if (counts[keys[k]] >= 3) any = true;
        if (!any) { dead = true; break; }
      }
    }

    if (dead) deaths++;
  }

  return { deathRate: deaths / runs, deaths, runs };
}

function validate(level, opts) {
  const errors = [];
  const o = opts || {};
  const runs = o.runs || 100;

  const boardIds = {};
  for (let i = 0; i < level.boards.length; i++) {
    const bd = level.boards[i];
    if (boardIds[bd.id]) errors.push('duplicate board id ' + bd.id);
    boardIds[bd.id] = bd;
    if (bd.holes.length === 0) errors.push('board ' + bd.id + ' has no holes');
  }

  const totals = colorTotals(level);
  const colors = Object.keys(totals);
  for (let i = 0; i < colors.length; i++) {
    if (totals[colors[i]] % 3 !== 0) {
      errors.push('color ' + colors[i] + ' count ' + totals[colors[i]] + ' not multiple of 3');
    }
  }

  let openAtStart = false;
  const coverGraph = {};

  for (let i = 0; i < level.boards.length; i++) {
    const bd = level.boards[i];
    const seen = {};
    for (let j = 0; j < bd.holes.length; j++) {
      const h = bd.holes[j];
      if (Math.abs(h.pos[0]) > BOARD_W / 2 - HEAD_R - 0.04) {
        errors.push(bd.id + '/' + h.id + ' hole x out of footprint');
      }
      if (Math.abs(h.pos[2]) > BOARD_D / 2 - HEAD_R - 0.02) {
        errors.push(bd.id + '/' + h.id + ' hole z out of footprint');
      }
      if (h.coveredBy && h.coveredBy.length) {
        for (let k = 0; k < h.coveredBy.length; k++) {
          const cid = h.coveredBy[k];
          if (!boardIds[cid]) {
            errors.push(bd.id + '/' + h.id + ' coveredBy dangling ref ' + cid);
            continue;
          }
          if (boardIds[cid].position[1] <= bd.position[1] + 0.3) {
            errors.push(bd.id + '/' + h.id + ' coverer ' + cid + ' not above');
          }
          if (!coverGraph[cid]) coverGraph[cid] = [];
          if (coverGraph[cid].indexOf(bd.id) < 0) coverGraph[cid].push(bd.id);
        }
      } else {
        openAtStart = true;
      }
    }

    for (let a = 0; a < bd.holes.length; a++) {
      for (let bIdx = a + 1; bIdx < bd.holes.length; bIdx++) {
        const pa = bd.holes[a].pos, pb = bd.holes[bIdx].pos;
        const dx = pa[0] - pb[0], dz = pa[2] - pb[2];
        if (dx * dx + dz * dz < SCREW_MIN_DIST * SCREW_MIN_DIST) {
          errors.push(bd.id + ' holes ' + bd.holes[a].id + '/' + bd.holes[bIdx].id + ' overlap');
        }
      }
    }
  }

  if (!openAtStart) errors.push('no uncovered screw at start');

  const state = {};
  const ids = Object.keys(coverGraph);
  for (let i = 0; i < ids.length; i++) state[ids[i]] = 0;
  let cycle = false;
  const dfs = (id) => {
    state[id] = 1;
    const next = coverGraph[id] || [];
    for (let i = 0; i < next.length; i++) {
      if (state[next[i]] === 1) { cycle = true; return; }
      if (state[next[i]] === 0) dfs(next[i]);
    }
    state[id] = 2;
  };
  for (let i = 0; i < ids.length; i++) {
    if (state[ids[i]] === 0) dfs(ids[i]);
  }
  if (cycle) errors.push('covering graph has cycle');

  if (errors.length > 0) {
    return { ok: false, errors, deathRate: null, adjustedSlotCount: null };
  }

  const randA = mulberry32((4242 + level.id * 101) >>> 0);
  const randB = mulberry32((777 + level.id * 13) >>> 0);
  const randC = mulberry32((999 + level.id * 7) >>> 0);
  const det1 = simulate(level, 1, level.slotCount, mulberry32(7), true);
  const simA1 = simulate(level, runs, level.slotCount, randA);
  const simB1 = simulate(level, runs, level.slotCount, randB);
  const simC1 = simulate(level, runs, level.slotCount, randC);
  if (simA1.deathRate === 0 && simB1.deathRate === 0 &&
      simC1.deathRate === 0 && det1.deathRate === 0) {
    return { ok: true, errors: [], deathRate: 0, adjustedSlotCount: level.slotCount };
  }

  const det2 = simulate(level, 1, level.slotCount + 1, mulberry32(7), true);
  const simA2 = simulate(level, runs, level.slotCount + 1, randA);
  const simB2 = simulate(level, runs, level.slotCount + 1, randB);
  const simC2 = simulate(level, runs, level.slotCount + 1, randC);
  if (simA2.deathRate === 0 && simB2.deathRate === 0 &&
      simC2.deathRate === 0 && det2.deathRate === 0) {
    return {
      ok: true, errors: [],
      deathRate: Math.max(simA1.deathRate, simB1.deathRate, simC1.deathRate),
      adjustedSlotCount: level.slotCount + 1,
      note: 'auto +1 slot'
    };
  }

  return {
    ok: false,
    errors: ['unsolvable: deathRate ' +
      Math.max(simA2.deathRate, simB2.deathRate, simC2.deathRate) + ' even with +1 slot'],
    deathRate: Math.max(simA2.deathRate, simB2.deathRate, simC2.deathRate),
    adjustedSlotCount: null
  };
}

module.exports = { validate, simulate, colorTotals, totalScrews };
