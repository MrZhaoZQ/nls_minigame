'use strict';

const GameConfig = require('../config/GameConfig');

const cache = {};
const Levels = {};

function pad3(n) {
  return ('00' + n).slice(-3);
}

for (let id = 1; id <= GameConfig.levels.totalShipped; id++) {
  Object.defineProperty(Levels, id, {
    enumerable: true,
    get: function () {
      if (!cache[id]) cache[id] = require('./levelData/level_' + pad3(id));
      return cache[id];
    }
  });
}

module.exports = Levels;
