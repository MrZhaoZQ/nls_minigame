'use strict';

const fs = require('fs');
const path = require('path');
const gen = require('../js/levels/generator');
const val = require('../js/levels/validator');

const TOTAL = 30;
const SEED_BUDGET = 6000;
const outDir = path.join(__dirname, '..', 'js', 'levels', 'levelData');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

function pad3(n) {
  return ('00' + n).slice(-3);
}

let failures = 0;
for (let id = 1; id <= TOTAL; id++) {
  let chosen = null;
  for (let seed = id * 1000; seed < id * 1000 + SEED_BUDGET; seed++) {
    const lvl = gen.generateLevel(id, seed);
    const res = val.validate(lvl, { runs: 100, seed: id * 31 + seed });
    if (res.ok) {
      lvl.slotCount = res.adjustedSlotCount;
      lvl.seed = seed;
      lvl.name = stageName(id) + ' ' + id;
      chosen = lvl;
      break;
    }
  }
  if (!chosen) {
    console.error('level ' + id + ': no valid seed found within budget ' + SEED_BUDGET);
    failures++;
    continue;
  }
  const file = path.join(outDir, 'level_' + pad3(id) + '.js');
  const body = "'use strict';\n\nmodule.exports = " + JSON.stringify(chosen, null, 2) + ';\n';
  fs.writeFileSync(file, body);
  console.log('level ' + id + ': seed=' + chosen.seed +
    ' screws=' + val.totalScrews(chosen) +
    ' colors=' + chosen.colors.length +
    ' boards=' + chosen.boards.length +
    ' slots=' + chosen.slotCount);
}

function stageName(id) {
  if (id <= 5) return '新手';
  if (id <= 15) return '成长';
  if (id <= 25) return '挑战';
  return '大师';
}

const indexLines = [
  "'use strict';",
  '',
  "const GameConfig = require('../config/GameConfig');",
  '',
  'const cache = {};',
  'const Levels = {};',
  '',
  'function pad3(n) {',
  "  return ('00' + n).slice(-3);",
  '}',
  '',
  'for (let id = 1; id <= GameConfig.levels.totalShipped; id++) {',
  '  Object.defineProperty(Levels, id, {',
  '    enumerable: true,',
  '    get: function () {',
  "      if (!cache[id]) cache[id] = require('./levelData/level_' + pad3(id));",
  '      return cache[id];',
  '    }',
  '  });',
  '}',
  '',
  'module.exports = Levels;',
  ''
];
fs.writeFileSync(path.join(__dirname, '..', 'js', 'levels', 'index.js'), indexLines.join('\n'));

if (failures > 0) {
  console.error(failures + ' levels failed to build');
  process.exit(1);
}
console.log('done: ' + TOTAL + ' levels written to ' + outDir);
