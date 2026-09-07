'use strict';

const { assert, assertEq, section, test } = require('./harness');
const Platform = require('../js/platform/Platform');
const ShareManager = require('../js/share/ShareManager');
const GameConfig = require('../js/config/GameConfig');

function setup() {
  let lastOpts = null;
  const mock = Platform.createMockPlatform({
    shareAppMessage: (opts) => { lastOpts = opts; }
  });
  Platform.inject(mock);
  let clock = 100000;
  const sm = new ShareManager({ now: () => clock });
  return {
    sm,
    opts: () => lastOpts,
    succeed: () => lastOpts.success(),
    cancel: () => lastOpts.fail(),
    setClock: (v) => { clock = v; }
  };
}

section('ShareManager (invite-friends reward)');

test('share success grants reward', () => {
  const { sm, opts, succeed } = setup();
  let result = null;
  sm.show('fail_undo', r => { result = r; });
  assert(opts(), 'share invoked');
  const cfg = require('../js/config/GameConfig').share;
  assertEq(opts().imageUrl, cfg.imageUrl, 'reward share uses approved image');
  assertEq(opts().imageUrlId, cfg.imageId, 'reward share carries image id');
  assert(opts().title.indexOf('第1关') >= 0, 'title contains level');
  assertEq(result, null, 'reward waits for share callback');
  succeed();
  assert(result && result.rewarded === true);
  assertEq(result.via, 'share');
  Platform.inject(null);
});

test('share cancel gives no reward', () => {
  const { sm, cancel } = setup();
  let result = null;
  sm.show('hint', r => { result = r; });
  cancel();
  assert(result && result.rewarded === false);
  assertEq(result.reason, 'cancel');
  Platform.inject(null);
});

test('cooldown between shares', () => {
  const { sm, succeed, setClock } = setup();
  sm.show('win_double', () => {});
  succeed();
  const gate = sm.canShow('win_double');
  assertEq(gate.ok, false);
  assertEq(gate.reason, 'cooldown');
  setClock(100000 + GameConfig.share.cooldownMs + 10);
  assertEq(sm.canShow('win_double').ok, true);
  Platform.inject(null);
});

test('per-level cap on fail shares', () => {
  const { sm, succeed, setClock } = setup();
  for (let i = 0; i < GameConfig.share.perLevelLimit; i++) {
    sm.show('fail_clear', () => {});
    succeed();
    setClock(100000 + (i + 1) * (GameConfig.share.cooldownMs + 10));
  }
  const gate = sm.canShow('fail_clear');
  assertEq(gate.ok, false);
  assertEq(gate.reason, 'perLevel');
  assertEq(sm.canShow('hint').ok, true);
  Platform.inject(null);
});

test('setLevel resets per-level counters', () => {
  const { sm, succeed, setClock } = setup();
  for (let i = 0; i < GameConfig.share.perLevelLimit; i++) {
    sm.show('fail_undo', () => {});
    succeed();
    setClock(100000 + (i + 1) * (GameConfig.share.cooldownMs + 10));
  }
  sm.setLevel(2);
  assertEq(sm.canShow('fail_undo').ok, true);
  Platform.inject(null);
});

test('titles per placement', () => {
  assert(ShareManager.titleFor('win_double', 7).indexOf('第7关') >= 0);
  assert(ShareManager.titleFor('unknown', 1).length > 0);
});
