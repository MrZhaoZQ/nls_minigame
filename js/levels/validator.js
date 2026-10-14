'use strict';

const HEAD_R = 0.16;
const SCREW_MIN_DIST = 0.5;
const TIGHT_FROM_LEVEL = 6;
const TIGHT_MIN_RATE = 0.3;
const COGNITIVE_FROM_LEVEL = 6;
const COGNITIVE_MIN_ENTROPY = 0.1;
const COGNITIVE_MIN_STRUCTURE = 1.15;
const SAME_COLOR_CAP_FROM = 3;
const SAME_COLOR_MAX_PER_BOARD = 2;
const EARLY_FAIR_FROM = 3;
const EARLY_FAIR_UNTIL = 5;
const SLOT_RELAX_FROM = 6;

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function fpOf(bd) {
  const rad = ((bd.rotation && bd.rotation[1]) || 0) * Math.PI / 180;
  let w = 3.6, d = 1.2;
  if (bd.prefab === 'Board_L') {
    d = 2.4;
  } else if (bd.prefab === 'Board_Gear') {
    w = 3.2; d = 3.2;
  }
  const cos = Math.abs(Math.cos(rad)), sin = Math.abs(Math.sin(rad));
  return { hw: (w * cos + d * sin) / 2, hd: (w * sin + d * cos) / 2 };
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

function prefabHalfExtents(prefab) {
  if (prefab === 'Board_L') return { hw: 1.8, hd: 1.2 };
  if (prefab === 'Board_Gear') return { hw: 1.6, hd: 1.6 };
  return { hw: 1.8, hd: 0.6 };
}

function holeInFootprint(prefab, x, z, pad) {
  const p = pad || 0;
  if (prefab === 'Board_L') {
    const inMain = x >= -1.8 + p && x <= 1.8 - p && z >= -0.6 + p && z <= 0.6 - p;
    const inArm = x >= -1.8 + p && x <= -0.6 - p && z >= -1.8 + p && z <= -0.6;
    return inMain || inArm;
  }
  const he = prefabHalfExtents(prefab);
  return Math.abs(x) <= he.hw - p && Math.abs(z) <= he.hd - p;
}

function simulate(level, runs, capacityOverride, rng, deterministic, stopAtFirstDeath) {
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
    if (stopAtFirstDeath && deaths > 0) break;
  }

  return { deathRate: deaths / runs, deaths, runs };
}

function validate(level, opts) {
  const errors = [];
  const o = opts || {};
  const runs = o.runs || 100;
  const tightFrom = o.tightFrom != null ? o.tightFrom : TIGHT_FROM_LEVEL;
  const tightMin = o.tightMin != null ? o.tightMin : TIGHT_MIN_RATE;
  const cogFrom = o.cogFrom != null ? o.cogFrom : COGNITIVE_FROM_LEVEL;
  const cogEntropyMin = o.cogEntropyMin != null ? o.cogEntropyMin : COGNITIVE_MIN_ENTROPY;
  const cogStructMin = o.cogStructMin != null ? o.cogStructMin : COGNITIVE_MIN_STRUCTURE;
  const sameCapFrom = o.sameColorCapFrom != null ? o.sameColorCapFrom : SAME_COLOR_CAP_FROM;
  const sameCap = o.sameColorCap != null ? o.sameColorCap : SAME_COLOR_MAX_PER_BOARD;

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
    for (let j = 0; j < bd.holes.length; j++) {
      const h = bd.holes[j];
      const prefab = bd.prefab || 'Board_Single';
      if (!holeInFootprint(prefab, h.pos[0], h.pos[2], HEAD_R + 0.04)) {
        errors.push(bd.id + '/' + h.id + ' hole out of footprint');
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

      const rot = ((bd.rotation && bd.rotation[1]) || 0) * Math.PI / 180;
      const lcos = Math.cos(rot), lsin = Math.sin(rot);
      const wx = bd.position[0] + h.pos[0] * lcos - h.pos[2] * lsin;
      const wz = bd.position[2] + h.pos[0] * lsin + h.pos[2] * lcos;
      for (const uid in boardIds) {
        const u = boardIds[uid];
        if (uid === bd.id || u.position[1] <= bd.position[1] + 0.3) continue;
        const fp = fpOf(u);
        const dx = Math.abs(wx - u.position[0]);
        const dz = Math.abs(wz - u.position[2]);
        if (dx < fp.hw - 0.3 && dz < fp.hd - 0.3 &&
            (!h.coveredBy || h.coveredBy.indexOf(uid) < 0)) {
          errors.push(bd.id + '/' + h.id + ' pick-blocked by ' + uid + ' but not coveredBy');
        }
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

    if (level.id >= sameCapFrom) {
      const cc = {};
      for (let j = 0; j < bd.holes.length; j++) {
        const c = bd.holes[j].color;
        cc[c] = (cc[c] || 0) + 1;
      }
      const cnames = Object.keys(cc);
      for (let k = 0; k < cnames.length; k++) {
        if (cc[cnames[k]] > sameCap) {
          errors.push(bd.id + ' same-color ' + cnames[k] + ' x' + cc[cnames[k]] +
            ' exceeds per-board cap ' + sameCap);
        }
      }
    }
  }

  if (!openAtStart) errors.push('no uncovered screw at start');

  const earlyFrom = o.earlyFairFrom != null ? o.earlyFairFrom : EARLY_FAIR_FROM;
  const earlyUntil = o.earlyFairUntil != null ? o.earlyFairUntil : EARLY_FAIR_UNTIL;
  if (level.id >= earlyFrom && level.id <= earlyUntil) {
    const uc = {};
    for (let i = 0; i < level.boards.length; i++) {
      const bd = level.boards[i];
      for (let j = 0; j < bd.holes.length; j++) {
        const h = bd.holes[j];
        if (!h.coveredBy || h.coveredBy.length === 0) {
          uc[h.color] = (uc[h.color] || 0) + 1;
        }
      }
    }
    let maxUc = 0;
    const ukeys = Object.keys(uc);
    for (let i = 0; i < ukeys.length; i++) {
      if (uc[ukeys[i]] > maxUc) maxUc = uc[ukeys[i]];
    }
    if (maxUc < 3) {
      errors.push('early level lacks entry triple among unlocked screws');
    }
  }

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

  function evalCapacity(capacity) {
    const sims = [
      () => simulate(level, 1, capacity, mulberry32(7), true, true),
      () => simulate(level, runs, capacity, randA, false, true),
      () => simulate(level, runs, capacity, randB, false, true),
      () => simulate(level, runs, capacity, randC, false, true)
    ];
    let maxRate = 0;
    for (let i = 0; i < sims.length; i++) {
      const s = sims[i]();
      if (s.deathRate > maxRate) maxRate = s.deathRate;
      if (s.deaths > 0) return { ok: false, deathRate: maxRate };
    }
    return { ok: true, deathRate: 0 };
  }

  const base = evalCapacity(level.slotCount);
  if (base.ok) return finish(level.slotCount, null);

  const slotRelaxFrom = o.slotRelaxFrom != null ? o.slotRelaxFrom : SLOT_RELAX_FROM;
  if (level.id < slotRelaxFrom) {
    return {
      ok: false,
      errors: ['unsolvable at base slotCount (early levels must ship without slot relaxation)'],
      deathRate: base.deathRate,
      adjustedSlotCount: null
    };
  }

  const plus = evalCapacity(level.slotCount + 1);
  if (plus.ok) return finish(level.slotCount + 1, 'auto +1 slot');

  return {
    ok: false,
    errors: ['unsolvable: deathRate ' + plus.deathRate + ' even with +1 slot'],
    deathRate: plus.deathRate,
    adjustedSlotCount: null
  };

  function finish(capacity, note) {
    let cognitive = null;
    let cogError = null;
    if (level.id >= cogFrom) {
      cognitive = measureCognitive();
      if (cognitive.entropy < cogEntropyMin) {
        cogError = 'flat: observation entropy ' + cognitive.entropy.toFixed(3) +
          ' < ' + cogEntropyMin;
      } else if (cognitive.structure < cogStructMin) {
        cogError = 'sparse: structure complexity ' + cognitive.structure.toFixed(3) +
          ' < ' + cogStructMin;
      }
    }
    if (level.id < tightFrom) {
      return {
        ok: !cogError, errors: cogError ? [cogError] : [],
        deathRate: 0, adjustedSlotCount: capacity, note: note, cognitive: cognitive
      };
    }
    const rate = measureTight(capacity - 1);
    if (rate < tightMin) {
      return {
        ok: false,
        errors: ['loose: deathRate at ' + (capacity - 1) + ' slots = ' +
          rate + ' < ' + tightMin],
        deathRate: rate,
        adjustedSlotCount: null
      };
    }
    if (cogError) {
      return {
        ok: false,
        errors: [cogError],
        deathRate: 0,
        adjustedSlotCount: null,
        cognitive: cognitive
      };
    }
    return {
      ok: true, errors: [], deathRate: 0, adjustedSlotCount: capacity,
      note: note, tightRate: rate, cognitive: cognitive
    };
  }

  function measureCognitive() {
    const total = totalScrews(level);
    const colorCounts = {};
    for (let i = 0; i < level.boards.length; i++) {
      for (let j = 0; j < level.boards[i].holes.length; j++) {
        const c = level.boards[i].holes[j].color;
        colorCounts[c] = (colorCounts[c] || 0) + 1;
      }
    }
    const colorNames = Object.keys(colorCounts);

    let entropy = 0;
    for (let i = 0; i < colorNames.length; i++) {
      const p = colorCounts[colorNames[i]] / total;
      if (p > 0) entropy -= p * Math.log(p);
    }
    entropy /= Math.log(Math.max(2, colorNames.length));

    const perColorBoards = {};
    for (let i = 0; i < colorNames.length; i++) perColorBoards[colorNames[i]] = {};
    for (let i = 0; i < level.boards.length; i++) {
      const b = level.boards[i];
      for (let j = 0; j < b.holes.length; j++) {
        const c = b.holes[j].color;
        perColorBoards[c][b.id] = (perColorBoards[c][b.id] || 0) + 1;
      }
    }
    let spreadSum = 0;
    for (let i = 0; i < colorNames.length; i++) {
      const c = colorNames[i];
      const boardsWith = Object.keys(perColorBoards[c]).length;
      if (boardsWith > 1) spreadSum += boardsWith;
    }
    const spread = colorNames.length > 0 ? spreadSum / colorNames.length : 0;

    let distinctShape = 0;
    let yawVariety = 0;
    for (let i = 0; i < level.boards.length; i++) {
      if ((level.boards[i].prefab || 'Board_Single') !== 'Board_Single') distinctShape++;
      const y = Math.abs(level.boards[i].rotation[1] || 0) % 180;
      if (y > 5 && y < 175) yawVariety++;
    }
    const shapeRatio = distinctShape / level.boards.length;
    const yawRatio = yawVariety / level.boards.length;

    return {
      entropy,
      spread,
      structure: 1 + shapeRatio * 3 + yawRatio * 2
    };
  }

  function measureTight(capacity) {
    const tA = mulberry32((31337 + level.id * 17) >>> 0);
    const tB = mulberry32((65577 + level.id * 29) >>> 0);
    const tC = mulberry32((12347 + level.id * 41) >>> 0);
    const sets = [
      simulate(level, 1, capacity, mulberry32(7), true),
      simulate(level, runs, capacity, tA),
      simulate(level, runs, capacity, tB),
      simulate(level, runs, capacity, tC)
    ];
    let deaths = 0;
    let total = 0;
    for (let i = 0; i < sets.length; i++) {
      deaths += sets[i].deaths;
      total += sets[i].runs;
    }
    return deaths / total;
  }
}

module.exports = { validate, simulate, colorTotals, totalScrews, holeInFootprint };
