'use strict';

const { assert, assertEq, assertClose, section, test } = require('./harness');
const TweenManager = require('../js/core/TweenManager');
const Easing = TweenManager.Easing;

section('TweenManager');

test('tween completes after duration', () => {
  const tm = new TweenManager();
  let done = false;
  let lastV = -1;
  tm.tween(1.0, {
    onUpdate: (v) => { lastV = v; },
    onComplete: () => { done = true; }
  }).start();
  tm.update(0.5);
  assert(!done);
  assertClose(lastV, 0.5, 1e-9);
  tm.update(0.51);
  assert(done);
  assertEq(tm.count, 0);
});

test('delay defers start', () => {
  const tm = new TweenManager();
  let started = false;
  tm.tween(0.1, {
    delay: 0.5,
    onUpdate: () => { started = true; }
  }).start();
  tm.update(0.4);
  assert(!started);
  tm.update(0.2);
  assert(started);
});

test('chain then() runs sequentially', () => {
  const tm = new TweenManager();
  const order = [];
  const t1 = tm.tween(0.1, { onComplete: () => order.push('a') });
  t1.then(0.1, { onComplete: () => order.push('b') });
  t1.start();
  tm.update(0.11);
  assertEq(order, ['a']);
  tm.update(0.11);
  assertEq(order, ['a', 'b']);
});

test('stop cancels', () => {
  const tm = new TweenManager();
  let done = false;
  const t = tm.tween(0.1, { onComplete: () => { done = true; } }).start();
  t.stop();
  tm.update(1);
  assert(!done);
});

test('easing bounds', () => {
  assertClose(Easing.quadIn(0), 0);
  assertClose(Easing.quadIn(1), 1);
  assertClose(Easing.backOut(1), 1, 1e-9);
  assert(Easing.backOut(0.7) > 1, 'backOut should overshoot');
});
