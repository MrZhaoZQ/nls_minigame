'use strict';

const { assert, assertEq, assertClose, section, test } = require('./harness');
const Platform = require('../js/platform/Platform');
const InputManager = require('../js/interaction/InputManager');

function setup() {
  const mock = Platform.createMockPlatform();
  Platform.inject(mock);
  const im = new InputManager();
  im.attach();
  const fire = {
    start(t) { mock.touchHandlers.start.forEach(h => h(t)); },
    move(t) { mock.touchHandlers.move.forEach(h => h(t)); },
    end(t) { mock.touchHandlers.end.forEach(h => h(t)); },
    cancel(t) { mock.touchHandlers.cancel.forEach(h => h(t)); }
  };
  return { im, fire, mock };
}

function ev(list) {
  return { touches: list, changedTouches: list };
}
function pt(id, x, y) { return { identifier: id, clientX: x, clientY: y }; }

section('InputManager');

test('quick still touch fires tap', () => {
  const { im, fire } = setup();
  let tap = null;
  im.onTap = (x, y) => { tap = { x, y }; };
  fire.start(ev([pt(0, 100, 200)]));
  fire.end(ev([pt(0, 101, 201)]));
  assert(tap !== null, 'tap expected');
  assertEq(tap, { x: 100, y: 200 });
  Platform.inject(null);
});

test('drag beyond threshold fires onDrag not tap', () => {
  const { im, fire } = setup();
  let tap = false;
  let drags = 0;
  let lastDx = 0;
  im.onTap = () => { tap = true; };
  im.onDrag = (dx) => { drags++; lastDx = dx; };
  fire.start(ev([pt(0, 100, 200)]));
  fire.move(ev([pt(0, 112, 200)]));
  fire.move(ev([pt(0, 130, 200)]));
  fire.end(ev([pt(0, 130, 200)]));
  assert(!tap, 'no tap after drag');
  assert(drags >= 1, 'drag expected');
  assertEq(lastDx, 18);
  Platform.inject(null);
});

test('locked ignores taps and drags', () => {
  const { im, fire } = setup();
  im.setLocked(true);
  let tap = false, drag = 0;
  im.onTap = () => { tap = true; };
  im.onDrag = () => { drag++; };
  fire.start(ev([pt(0, 50, 50)]));
  fire.move(ev([pt(0, 90, 50)]));
  fire.end(ev([pt(0, 90, 50)]));
  assert(!tap && drag === 0);
  Platform.inject(null);
});

test('pinch out fires onPinch with ratio > 1', () => {
  const { im, fire } = setup();
  let ratio = 0;
  im.onPinch = r => { ratio = r; };
  fire.start(ev([pt(0, 100, 300), pt(1, 200, 300)]));
  fire.move(ev([pt(0, 50, 300), pt(1, 250, 300)]));
  assert(ratio > 1.5, 'expected expand ratio, got ' + ratio);
  Platform.inject(null);
});

test('drag velocity passed to onDragEnd', () => {
  const { im, fire } = setup();
  let endedVx = null;
  im.onDragEnd = vx => { endedVx = vx; };
  fire.start(ev([pt(0, 100, 200)]));
  fire.move(ev([pt(0, 120, 200)]));
  fire.move(ev([pt(0, 145, 200)]));
  fire.end(ev([pt(0, 145, 200)]));
  assertEq(endedVx, 25);
  Platform.inject(null);
});

test('second finger cancels tap candidate', () => {
  const { im, fire } = setup();
  let tap = false;
  im.onTap = () => { tap = true; };
  fire.start(ev([pt(0, 100, 200)]));
  fire.start(ev([pt(1, 300, 200)]));
  fire.end(ev([pt(0, 100, 200)]));
  fire.end(ev([pt(1, 300, 200)]));
  assert(!tap);
  Platform.inject(null);
});
