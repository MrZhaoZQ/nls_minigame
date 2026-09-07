'use strict';

let passed = 0;
let failed = 0;
const failures = [];

function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (!deepEqual(a[i], b[i])) return false;
    return true;
  }
  if (a && b && typeof a === 'object') {
    const ka = Object.keys(a).sort();
    const kb = Object.keys(b).sort();
    if (!deepEqual(ka, kb)) return false;
    for (let i = 0; i < ka.length; i++) if (!deepEqual(a[ka[i]], b[kb[i]])) return false;
    return true;
  }
  return false;
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'assertion failed');
}

function assertEq(actual, expected, msg) {
  if (!deepEqual(actual, expected)) {
    throw new Error((msg || 'assertEq') + '\n  actual:   ' + JSON.stringify(actual) +
      '\n  expected: ' + JSON.stringify(expected));
  }
}

function assertClose(actual, expected, eps, msg) {
  if (Math.abs(actual - expected) > (eps == null ? 1e-6 : eps)) {
    throw new Error((msg || 'assertClose') + ': ' + actual + ' vs ' + expected);
  }
}

function section(name) {
  console.log('\n# ' + name);
}

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log('  ok - ' + name);
  } catch (e) {
    failed++;
    failures.push({ name, err: e });
    console.log('  FAIL - ' + name + ': ' + e.message);
  }
}

function report() {
  console.log('\n==============================');
  console.log('passed: ' + passed + ', failed: ' + failed);
  if (failed > 0) {
    failures.forEach(f => console.log('  FAILED: ' + f.name));
    process.exit(1);
  }
}

module.exports = { assert, assertEq, assertClose, deepEqual, section, test, report };
