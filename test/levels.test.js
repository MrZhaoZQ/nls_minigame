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
    const res = validator.validate(lvl, { runs: 60, seed: id * 7 + 1 });
    assert(res.ok, 'level ' + id + ': ' + res.errors.join('; '));
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
