'use strict';

const { assert, assertEq, section, test } = require('./harness');
const EventBus = require('../js/core/EventBus');
const Platform = require('../js/platform/Platform');

section('EventBus');

test('on/emit delivers data', () => {
  const bus = new EventBus();
  let got = null;
  bus.on('X', d => { got = d; });
  bus.emit('X', { a: 1 });
  assertEq(got, { a: 1 });
});

test('off removes handler', () => {
  const bus = new EventBus();
  let count = 0;
  const h = () => count++;
  bus.on('X', h);
  bus.emit('X');
  bus.off('X', h);
  bus.emit('X');
  assertEq(count, 1);
});

test('on returns unsubscribe fn', () => {
  const bus = new EventBus();
  let count = 0;
  const unsub = bus.on('X', () => count++);
  bus.emit('X');
  unsub();
  bus.emit('X');
  assertEq(count, 1);
});

test('handler error does not break others', () => {
  const bus = new EventBus();
  let got = false;
  bus.on('X', () => { throw new Error('boom'); });
  bus.on('X', () => { got = true; });
  bus.emit('X');
  assert(got);
});

section('Platform mock');

test('mock storage roundtrip', () => {
  const mock = Platform.createMockPlatform();
  Platform.inject(mock);
  Platform.storage.set('k', 'v');
  assertEq(Platform.storage.get('k'), 'v');
  Platform.inject(null);
});

test('mock env detection', () => {
  const mock = Platform.createMockPlatform();
  Platform.inject(mock);
  assertEq(Platform.env(), 'mock');
  Platform.inject(null);
  assertEq(Platform.env(), 'node');
});

test('vibrateShort survives throwing device impl', () => {
  const mock = Platform.createMockPlatform({
    vibrateShort: () => { throw new Error('vibrateShort:fail'); }
  });
  Platform.inject(mock);
  let threw = false;
  try {
    Platform.vibrateShort();
  } catch (e) {
    threw = true;
  }
  assertEq(threw, false);
  Platform.inject(null);
});

test('showModal mock confirms by default', () => {
  Platform.inject(Platform.createMockPlatform());
  let got = null;
  Platform.showModal({ title: 't', content: 'c', success: (r) => { got = r; } });
  assert(got, 'success called');
  assertEq(got.confirm, true);
  assertEq(got.cancel, false);
  Platform.inject(null);
});

test('showModal override can cancel', () => {
  Platform.inject(Platform.createMockPlatform({
    showModal: (opts) => opts.success({ confirm: false, cancel: true })
  }));
  let got = null;
  Platform.showModal({ success: (r) => { got = r; } });
  assertEq(got.confirm, false);
  assertEq(got.cancel, true);
  Platform.inject(null);
});
