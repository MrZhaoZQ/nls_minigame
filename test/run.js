'use strict';

const { report } = require('./harness');

const suites = [
  './core.test.js',
  './math.test.js',
  './render.test.js',
  './input.test.js',
  './match.test.js',
  './tween.test.js',
  './gameManager.test.js',
  './collapse.test.js',
  './levels.test.js',
  './bootstrap.test.js',
  './ad.test.js',
  './share.test.js',
  './audio.test.js',
  './ui.test.js',
  './meta.test.js',
  './launch.test.js'
];

suites.forEach(s => require(s));

report();
