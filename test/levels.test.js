'use strict';

const { assert, assertEq, section, test } = require('./harness');
const validator = require('../js/levels/validator');
const generator = require('../js/levels/generator');
const Levels = require('../js/levels/index');

section('Shipped levels (1-20)');

test('all 30 level files exist', () => {
  for (let id = 1; id <= 30; id++) {
    assert(Levels[id], 'missing level ' + id);
    assertEq(Levels[id].id, id);
  }
});

test('all 30 levels pass validator', function () {
  for (let id = 1; id <= 30; id++) {
    const lvl = Levels[id];
    const res = validator.validate(lvl, { runs: 100, seed: id * 7 + 1 });
    assert(res.ok, 'level ' + id + ': ' + res.errors.join('; '));
    if (id >= 6) {
      assert(typeof res.tightRate === 'number' && res.tightRate >= 0.3,
        'level ' + id + ' must ship with real slot pressure, tight=' + res.tightRate);
    }
  }
});

test('shipped levels escalate in scale', () => {
  const s1 = validator.totalScrews(Levels[1]);
  const s30 = validator.totalScrews(Levels[30]);
  assert(s30 > s1, 'level 30 should have more screws than level 1 (' + s1 + ' vs ' + s30 + ')');
});

section('Generator');

test('generator always emits multiples of 3 per color', () => {
  for (let id = 21; id <= 30; id++) {
    const lvl = generator.generateLevel(id, id * 777);
    const totals = validator.colorTotals(lvl);
    const keys = Object.keys(totals);
    for (let k = 0; k < keys.length; k++) {
      assertEq(totals[keys[k]] % 3, 0, 'level ' + id + ' color ' + keys[k]);
    }
  }
});

test('distributeColors sums exactly', () => {
  const cases = [[9, 2], [18, 4], [21, 4], [30, 5], [33, 6]];
  for (let i = 0; i < cases.length; i++) {
    const out = generator.distributeColors(cases[i][0], cases[i][1]);
    const sum = out.reduce((a, b) => a + b, 0);
    assertEq(sum, cases[i][0]);
    out.forEach(n => assertEq(n % 3, 0));
  }
});

section('Validator');

test('validator rejects bad color counts', () => {
  const bad = {
    id: 90, name: 'bad', colors: ['red'], slotCount: 5, gridSize: 5,
    boards: [{
      id: 'b1', prefab: 'Board_Single', position: [0, 0, 0], rotation: [0, 0, 0],
      holes: [
        { id: 'h1', pos: [0, 0, 0], color: 'red' },
        { id: 'h2', pos: [1, 0, 0], color: 'red' }
      ]
    }]
  };
  const res = validator.validate(bad, { runs: 5 });
  assert(!res.ok);
  assert(res.errors.some(e => e.indexOf('multiple of 3') >= 0));
});

test('validator rejects dangling coveredBy', () => {
  const bad = {
    id: 91, name: 'bad', colors: ['red'], slotCount: 5, gridSize: 5,
    boards: [{
      id: 'b1', prefab: 'Board_Single', position: [0, 0, 0], rotation: [0, 0, 0],
      holes: [
        { id: 'h1', pos: [0, 0, 0], color: 'red', coveredBy: ['ghost'] },
        { id: 'h2', pos: [1, 0, 0], color: 'red' },
        { id: 'h3', pos: [-1, 0, 0], color: 'red' }
      ]
    }]
  };
  const res = validator.validate(bad, { runs: 5 });
  assert(!res.ok);
  assert(res.errors.some(e => e.indexOf('dangling') >= 0));
});

test('validator rejects coverer not above', () => {
  const bad = {
    id: 92, name: 'bad', colors: ['red'], slotCount: 5, gridSize: 5,
    boards: [
      { id: 'b1', prefab: 'Board_Single', position: [0, 0, 0], rotation: [0, 0, 0],
        holes: [
          { id: 'h1', pos: [0, 0, 0], color: 'red', coveredBy: ['b2'] },
          { id: 'h2', pos: [1, 0, 0], color: 'red' },
          { id: 'h3', pos: [-1, 0, 0], color: 'red' }
        ] },
      { id: 'b2', prefab: 'Board_Single', position: [5, 0, 0], rotation: [0, 0, 0],
        holes: [{ id: 'h4', pos: [0, 0, 0], color: 'red' }] }
    ]
  };
  const res = validator.validate(bad, { runs: 5 });
  assert(!res.ok);
  assert(res.errors.some(e => e.indexOf('not above') >= 0));
});

test('simulate detects slot deadlock', () => {
  const lvl = {
    id: 93, name: 'dead', colors: ['red', 'blue', 'green'], slotCount: 2, gridSize: 5,
    boards: [{
      id: 'b1', prefab: 'Board_Single', position: [0, 0, 0], rotation: [0, 0, 0],
      holes: [
        { id: 'h1', pos: [-1, 0, 0], color: 'red' },
        { id: 'h2', pos: [-0.5, 0, 0.3], color: 'red' },
        { id: 'h3', pos: [0, 0, 0], color: 'blue' },
        { id: 'h4', pos: [0.5, 0, 0.3], color: 'blue' },
        { id: 'h5', pos: [1, 0, 0], color: 'green' },
        { id: 'h6', pos: [1.4, 0, -0.3], color: 'green' }
      ]
    }]
  };
  const sim = validator.simulate(lvl, 30, 2);
  assertEq(sim.deathRate, 1);
});

test('loose level rejected by tightness gate', () => {
  const loose = {
    id: 6, name: 'loose', colors: ['red', 'blue', 'green'], slotCount: 5, gridSize: 5,
    boards: [{
      id: 'b1', prefab: 'Board_Single', position: [0, 0, 0], rotation: [0, 0, 0],
      holes: [
        { id: 'h1', pos: [-1.4, 0, -0.26], color: 'red' },
        { id: 'h2', pos: [-0.7, 0, 0.26], color: 'red' },
        { id: 'h3', pos: [0, 0, -0.26], color: 'red' },
        { id: 'h4', pos: [0.7, 0, 0.26], color: 'blue' },
        { id: 'h5', pos: [1.4, 0, -0.26], color: 'blue' },
        { id: 'h6', pos: [1.4, 0, 0.26], color: 'blue' },
        { id: 'h7', pos: [-1.4, 0, 0.26], color: 'green' },
        { id: 'h8', pos: [-0.7, 0, -0.26], color: 'green' },
        { id: 'h9', pos: [0, 0, 0.26], color: 'green' }
      ]
    }]
  };
  const res = validator.validate(loose, { runs: 40, cogFrom: 99, sameColorCapFrom: 99 });
  assertEq(res.ok, false, 'single flat board has no slot pressure');
  assert(res.errors.some(e => e.indexOf('loose') === 0), res.errors.join('; '));
  const exempt = validator.validate(loose, { runs: 40, tightFrom: 99, cogFrom: 99, sameColorCapFrom: 99 });
  assertEq(exempt.ok, true, 'tightFrom override skips the gate');
});

test('cognitive gate rejects a flat mono-shape level', () => {
  const flat = {
    id: 6, name: 'flat', colors: ['red', 'blue', 'green'], slotCount: 5, gridSize: 5,
    boards: [{
      id: 'b1', prefab: 'Board_Single', position: [0, 0, 0], rotation: [0, 0, 0],
      holes: [
        { id: 'h1', pos: [-1.4, 0, -0.26], color: 'red' },
        { id: 'h2', pos: [-0.7, 0, 0.26], color: 'red' },
        { id: 'h3', pos: [0, 0, -0.26], color: 'red' },
        { id: 'h4', pos: [0.7, 0, 0.26], color: 'blue' },
        { id: 'h5', pos: [1.4, 0, -0.26], color: 'blue' },
        { id: 'h6', pos: [1.4, 0, 0.26], color: 'blue' },
        { id: 'h7', pos: [-1.4, 0, 0.26], color: 'green' },
        { id: 'h8', pos: [-0.7, 0, -0.26], color: 'green' },
        { id: 'h9', pos: [0, 0, 0.26], color: 'green' }
      ]
    }]
  };
  const res = validator.validate(flat, { runs: 40, tightFrom: 99, sameColorCapFrom: 99 });
  assertEq(res.ok, false, 'single-board level lacks spatial structure');
  assert(res.errors.some(e => e.indexOf('sparse') === 0 || e.indexOf('flat') === 0), res.errors.join('; '));
  const exempt = validator.validate(flat, { runs: 40, tightFrom: 99, cogFrom: 99, sameColorCapFrom: 99 });
  assertEq(exempt.ok, true, 'cogFrom override skips the structure gate');
});

test('generator emits shape variety and yaw variety from level 3', () => {
  let anyShape = false, anyYaw = false;
  for (let seed = 1; seed <= 200; seed++) {
    const lvl = generator.generateLevel(10, seed * 97);
    for (let i = 0; i < lvl.boards.length; i++) {
      if ((lvl.boards[i].prefab || 'Board_Single') !== 'Board_Single') anyShape = true;
      const y = Math.abs(lvl.boards[i].rotation[1] || 0) % 180;
      if (y > 5 && y < 175) anyYaw = true;
    }
  }
  assert(anyShape, 'growing-stage levels should mix in L/gear boards');
  assert(anyYaw, 'growing-stage levels should mix in yaw rotation');
});

test('early levels 1-2 stay single-board teaching shapes', () => {
  for (let seed = 1; seed <= 50; seed++) {
    const lvl = generator.generateLevel(1, seed);
    assertEq(lvl.boards.length, 2, 'level 1 must always ship exactly 2 boards (no single 9-hole board)');
    for (let i = 0; i < lvl.boards.length; i++) {
      assertEq(lvl.boards[i].prefab, 'Board_Single', 'level 1 must stay teaching shape');
    }
    const lvl2 = generator.generateLevel(2, seed);
    for (let i = 0; i < lvl2.boards.length; i++) {
      assertEq(lvl2.boards[i].prefab, 'Board_Single', 'level 2 must stay teaching shape');
    }
  }
});

test('L board and gear holes sit inside their footprints', () => {
  const l = { id: 90, name: 'l', colors: ['red'], slotCount: 5, gridSize: 5,
    boards: [{
      id: 'b1', prefab: 'Board_L', position: [0, 0, 0], rotation: [0, 0, 0],
      holes: [
        { id: 'h1', pos: [-1.5, 0, -1.1], color: 'red' },
        { id: 'h2', pos: [-0.9, 0, -1.1], color: 'red' },
        { id: 'h3', pos: [0, 0, 0.26], color: 'red' }
      ]
    }] };
  const res = validator.validate(l, { runs: 1, tightFrom: 99, cogFrom: 99, sameColorCapFrom: 99 });
  assertEq(res.ok, true, 'L-board arm holes are inside footprint: ' + res.errors.join('; '));
});

test('per-board same-color cap rejects 3+ same-color screws from level 3', () => {
  const lvl = { id: 6, name: 'sc', colors: ['red', 'blue'], slotCount: 5, gridSize: 5,
    boards: [{
      id: 'b1', prefab: 'Board_Single', position: [0, 0, 0], rotation: [0, 0, 0],
      holes: [
        { id: 'h1', pos: [-1.4, 0, -0.26], color: 'red' },
        { id: 'h2', pos: [-0.7, 0, 0.26], color: 'red' },
        { id: 'h3', pos: [0, 0, -0.26], color: 'red' },
        { id: 'h4', pos: [0.7, 0, 0.26], color: 'blue' },
        { id: 'h5', pos: [1.4, 0, -0.26], color: 'blue' },
        { id: 'h6', pos: [1.4, 0, 0.26], color: 'blue' }
      ]
    }] };
  const res = validator.validate(lvl, { runs: 1, tightFrom: 99, cogFrom: 99 });
  assertEq(res.ok, false, 'a board holding 3 same-color screws is free progress');
  assert(res.errors.some(e => e.indexOf('same-color') >= 0), res.errors.join('; '));

  lvl.id = 2;
  const exempt = validator.validate(lvl, { runs: 1, tightFrom: 99, cogFrom: 99 });
  assert(!exempt.errors.some(e => e.indexOf('same-color') >= 0), 'teaching levels 1-2 are exempt');

  lvl.id = 6;
  const override = validator.validate(lvl, { runs: 1, tightFrom: 99, cogFrom: 99, sameColorCap: 3 });
  assert(!override.errors.some(e => e.indexOf('same-color') >= 0), 'sameColorCap override honored');
});

test('early levels keep fair entry: generator emits entry triple', () => {
  for (let ii = 0; ii < 40; ii++) {
    for (const id of [3, 4, 5]) {
      const lvl = generator.generateLevel(id, 4000 + ii * 17);
      const layers = {};
      for (let i = 0; i < lvl.boards.length; i++) {
        layers[Math.round(lvl.boards[i].position[1])] = 1;
      }
      assert(Object.keys(layers).length <= 2, 'level ' + id + ' seed ' + ii + ' exceeds 2 layers');
      const uc = {};
      for (let i = 0; i < lvl.boards.length; i++) {
        const b = lvl.boards[i];
        for (let j = 0; j < b.holes.length; j++) {
          const h = b.holes[j];
          if (!h.coveredBy || h.coveredBy.length === 0) uc[h.color] = (uc[h.color] || 0) + 1;
        }
      }
      let maxUc = 0;
      for (const k of Object.keys(uc)) maxUc = Math.max(maxUc, uc[k]);
      assert(maxUc >= 3, 'level ' + id + ' seed ' + ii + ' lacks entry triple');
    }
  }

  const noEntryTriple = {
    id: 4, name: 'nt', colors: ['red', 'blue'], slotCount: 5, gridSize: 5,
    boards: [
      { id: 'b1', prefab: 'Board_Single', position: [0, 0, 0], rotation: [0, 0, 0],
        holes: [
          { id: 'h1', pos: [-1.4, 0, 0], color: 'red', coveredBy: ['b2'] },
          { id: 'h2', pos: [1.4, 0, 0], color: 'blue', coveredBy: ['b2'] }
        ] },
      { id: 'b2', prefab: 'Board_Single', position: [0, 1, 0], rotation: [0, 0, 0],
        holes: [
          { id: 'h3', pos: [-1.4, 0, 0], color: 'red' },
          { id: 'h4', pos: [-0.5, 0, 0], color: 'red' },
          { id: 'h5', pos: [0.5, 0, 0], color: 'blue' },
          { id: 'h6', pos: [1.4, 0, 0], color: 'blue' }
        ] }
    ]
  };
  const r2 = validator.validate(noEntryTriple, { runs: 1, tightFrom: 99, cogFrom: 99 });
  assert(r2.errors.some(e => e.indexOf('entry triple') >= 0), r2.errors.join('; '));
  const r3 = validator.validate(noEntryTriple,
    { runs: 1, tightFrom: 99, cogFrom: 99, earlyFairFrom: 99 });
  assert(!r3.errors.some(e => e.indexOf('entry triple') >= 0), 'earlyFair override honored');
});

test('generator keeps per-board same-color <= 2 across all stages', () => {
  const ids = [3, 4, 5, 6, 10, 16, 21, 26, 30];
  for (let ii = 0; ii < ids.length; ii++) {
    for (let seed = 1; seed <= 60; seed++) {
      const lvl = generator.generateLevel(ids[ii], seed * 911);
      const tot = {};
      for (let i = 0; i < lvl.boards.length; i++) {
        const b = lvl.boards[i];
        const cc = {};
        for (let j = 0; j < b.holes.length; j++) {
          const c = b.holes[j].color;
          cc[c] = (cc[c] || 0) + 1;
          tot[c] = (tot[c] || 0) + 1;
        }
        for (const c in cc) {
          assert(cc[c] <= 2, 'level ' + ids[ii] + ' seed ' + (seed * 911) +
            ' board ' + b.id + ' color ' + c + ' x' + cc[c]);
        }
      }
      for (const c in tot) assertEq(tot[c] % 3, 0, 'color totals stay multiples of 3 after repair');
      assert(Object.keys(tot).length <= lvl.colors.length, 'colors field covers every used color');
    }
  }
});

test('distributeColors respects the per-color capacity cap', () => {
  const counts = generator.distributeColors(30, 5, 6);
  assertEq(counts.reduce((a, b) => a + b, 0), 30, 'cap-aware distribution keeps the total');
  for (let i = 0; i < counts.length; i++) assert(counts[i] <= 6, 'each color within cap');
  const even = generator.distributeColors(30, 5);
  assertEq(even.reduce((a, b) => a + b, 0), 30, 'uncapped path unchanged');
});

test('L arm hole off the mesh quadrant is rejected', () => {
  const bad = { id: 90, name: 'bad', colors: ['red'], slotCount: 5, gridSize: 5,
    boards: [{
      id: 'b1', prefab: 'Board_L', position: [0, 0, 0], rotation: [0, 0, 0],
      holes: [
        { id: 'h1', pos: [0, 0, -1.1], color: 'red' },
        { id: 'h2', pos: [-0.9, 0, -1.1], color: 'red' },
        { id: 'h3', pos: [0, 0, 0.26], color: 'red' }
      ]
    }] };
  const res = validator.validate(bad, { runs: 1, tightFrom: 99, cogFrom: 99 });
  assertEq(res.ok, false, 'hole at x=0,z=-1.1 floats outside the L arm (mesh arm is x[-1.8,-0.6])');
  assert(res.errors.some(e => e.indexOf('out of footprint') >= 0), res.errors.join('; '));
});

test('single-board z out-of-plane holes are rejected', () => {
  assertEq(validator.holeInFootprint('Board_Single', 0, 1.0, 0.2), false,
    'z must be clamped by board depth, not width');
  assertEq(validator.holeInFootprint('Board_Single', 0, 0.26, 0.2), true);
  assertEq(validator.holeInFootprint('Board_Gear', 1.1, 0, 0.2), true);
});

test('every generated hole sits on its board mesh', () => {
  const ids = [3, 6, 10, 16, 21, 26, 30];
  for (let ii = 0; ii < ids.length; ii++) {
    for (let seed = 1; seed <= 60; seed++) {
      const lvl = generator.generateLevel(ids[ii], seed * 131);
      for (let i = 0; i < lvl.boards.length; i++) {
        const b = lvl.boards[i];
        for (let j = 0; j < b.holes.length; j++) {
          const p = b.holes[j].pos;
          assert(validator.holeInFootprint(b.prefab, p[0], p[2], 0.2),
            'level ' + ids[ii] + ' seed ' + seed * 131 + ' ' + b.id + '/' + b.holes[j].id +
            ' hole off ' + b.prefab + ' mesh');
        }
      }
    }
  }
});
