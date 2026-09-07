'use strict';

const { assert, assertEq, section, test } = require('./harness');
const MatchChecker = require('../js/gameplay/MatchChecker');
const UndoStack = require('../js/gameplay/UndoStack');
const SlotManager = require('../js/gameplay/SlotManager');

section('MatchChecker');

test('findMatch detects >=3 same color', () => {
  assertEq(MatchChecker.findMatch(['red', 'blue', 'red', 'red']), ['red']);
});

test('findMatch none under 3', () => {
  assertEq(MatchChecker.findMatch(['red', 'blue', 'red']), []);
});

test('findMatch multiple colors', () => {
  const r = MatchChecker.findMatch(['red', 'red', 'red', 'blue', 'blue', 'blue']).sort();
  assertEq(r, ['blue', 'red']);
});

test('removeMatch removes exactly 3 preserving order', () => {
  assertEq(
    MatchChecker.removeMatch(['red', 'blue', 'red', 'green', 'red', 'blue'], 'red'),
    ['blue', 'green', 'blue']);
});

test('removeMatch with 6 removes only 3', () => {
  const r = MatchChecker.removeMatch(['red', 'red', 'red', 'red', 'red', 'red'], 'red');
  assertEq(r, ['red', 'red', 'red']);
});

test('isDeadEnd full without match', () => {
  assert(MatchChecker.isDeadEnd(['red', 'red', 'blue', 'blue', 'green'], 5));
});

test('isDeadEnd not full is never dead', () => {
  assert(!MatchChecker.isDeadEnd(['red', 'red'], 5));
});

test('isDeadEnd full with match is fine', () => {
  assert(!MatchChecker.isDeadEnd(['red', 'red', 'red', 'blue', 'blue'], 5));
});

section('UndoStack');

test('push/pop LIFO', () => {
  const st = new UndoStack(30);
  st.push({ a: 1 });
  st.push({ a: 2 });
  assertEq(st.pop(), { a: 2 });
  assertEq(st.pop(), { a: 1 });
  assertEq(st.pop(), null);
});

test('caps at maxSize dropping oldest', () => {
  const st = new UndoStack(3);
  for (let i = 0; i < 5; i++) st.push({ i });
  assertEq(st.size(), 3);
  assertEq(st.pop(), { i: 4 });
});

section('SlotManager');

test('add respects capacity', () => {
  const sm = new SlotManager(2);
  assert(sm.add('red') === 0);
  assert(sm.add('blue') === 1);
  assertEq(sm.add('green'), -1);
  assert(sm.isFull());
});

test('removeMatch clears triple', () => {
  const sm = new SlotManager(5);
  sm.add('red'); sm.add('red'); sm.add('blue'); sm.add('red');
  const removed = sm.removeMatch('red');
  assertEq(removed, 3);
  assertEq(sm.slots, ['blue']);
});

test('removeOneColor removes last occurrence', () => {
  const sm = new SlotManager(5);
  sm.add('red'); sm.add('blue'); sm.add('red');
  assert(sm.removeOneColor('red'));
  assertEq(sm.slots, ['red', 'blue']);
});

test('nearFull at warnAt', () => {
  const sm = new SlotManager(5);
  sm.add('red'); sm.add('blue'); sm.add('red'); sm.add('blue');
  assert(sm.nearFull());
});
