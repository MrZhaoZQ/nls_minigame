'use strict';

const { assert, assertEq, assertClose, section, test } = require('./harness');
const Vec3 = require('../js/math/Vec3');
const Mat3 = require('../js/math/Mat3');
const Ray = require('../js/math/Ray');
const Camera = require('../js/render/Camera');

section('Vec3');

test('cross product right-hand', () => {
  assertEq(Vec3.cross([1, 0, 0], [0, 1, 0]), [0, 0, 1]);
});

test('normalize unit length', () => {
  assertClose(Vec3.len(Vec3.normalize([3, 4, 0])), 1, 1e-9);
});

section('Mat3');

test('identity transform unchanged', () => {
  assertEq(Mat3.transform(Mat3.identity(), [1, 2, 3]), [1, 2, 3]);
});

test('axisAngle Y 90deg maps x to -z', () => {
  const m = Mat3.fromAxisAngle([0, 1, 0], Math.PI / 2);
  const v = Mat3.transform(m, [1, 0, 0]);
  assertClose(v[0], 0, 1e-9);
  assertClose(v[2], -1, 1e-9);
});

test('axisAngle inverse returns vector', () => {
  const m = Mat3.fromAxisAngle(Vec3.normalize([1, 2, 3]), 0.7);
  const mt = Mat3.transpose(m);
  const v = Mat3.transform(mt, Mat3.transform(m, [0.4, -1.2, 2.5]));
  assertClose(v[0], 0.4, 1e-9);
  assertClose(v[1], -1.2, 1e-9);
  assertClose(v[2], 2.5, 1e-9);
});

test('fromEulerXYZ yaw-only equals axisAngle Y', () => {
  const a = Mat3.fromEulerXYZ(0, Math.PI / 3, 0);
  const b = Mat3.fromAxisAngle([0, 1, 0], Math.PI / 3);
  for (let i = 0; i < 9; i++) assertClose(a[i], b[i], 1e-9);
});

section('Ray');

test('ray hits axis box front', () => {
  const obb = { center: [0, 0, -5], halfExtents: [1, 1, 1], axes: [[1, 0, 0], [0, 1, 0], [0, 0, 1]] };
  const t = Ray.intersectOBB([0, 0, 0], [0, 0, -1], obb);
  assertClose(t, 4, 1e-9);
});

test('ray misses box', () => {
  const obb = { center: [0, 0, -5], halfExtents: [1, 1, 1], axes: [[1, 0, 0], [0, 1, 0], [0, 0, 1]] };
  assertEq(Ray.intersectOBB([0, 3, 0], [0, 0, -1], obb), null);
});

test('ray behind origin rejected', () => {
  const obb = { center: [0, 0, 5], halfExtents: [1, 1, 1], axes: [[1, 0, 0], [0, 1, 0], [0, 0, 1]] };
  assertEq(Ray.intersectOBB([0, 0, 0], [0, 0, -1], obb), null);
});

test('ray hits rotated box at corner distance', () => {
  const rot = Mat3.fromAxisAngle([0, 1, 0], Math.PI / 4);
  const obb = Ray.obbFromBox([0, 0, -5], [1, 1, 1], rot);
  const t = Ray.intersectOBB([0, 0, 0], [0, 0, -1], obb);
  assert(t !== null);
  assertClose(t, 5 - Math.SQRT2, 1e-6);
});

test('sphere hit distance', () => {
  const t = Ray.intersectSphere([0, 0, 0], [0, 0, -1], [0, 0, -5], 1);
  assertClose(t, 4, 1e-9);
});

test('sphere miss', () => {
  assertEq(Ray.intersectSphere([0, 0, 0], [0, 0, -1], [0, 3, -5], 1), null);
});

section('Camera');

test('project center point to screen center', () => {
  const cam = new Camera(375, 667);
  cam.updateFrom(0, 0, 8, [0, 0, 0], null);
  const p = cam.project([0, 0, 0]);
  assertClose(p.x, 375 / 2, 1e-6);
  assertClose(p.y, 667 / 2, 1e-6);
});

test('rayFromScreen center hits forward', () => {
  const cam = new Camera(375, 667);
  cam.updateFrom(0, 0, 8, [0, 0, 0], null);
  const r = cam.rayFromScreen(375 / 2, 667 / 2);
  assertClose(r.dir[2], -1, 1e-6);
  assertClose(r.dir[0], 0, 1e-6);
});

test('project/ray roundtrip hits point', () => {
  const cam = new Camera(375, 667);
  cam.updateFrom(0.6, 0.3, 7, [0.2, -0.4, 0.1], null);
  const target = [0.9, 0.4, -0.3];
  const s = cam.project(target);
  assert(s !== null, 'point should be visible');
  const r = cam.rayFromScreen(s.x, s.y);
  let bestT = 1e9, bestD = 1e9;
  for (let t = 0; t < 20; t += 0.01) {
    const pt = Vec3.add(r.origin, Vec3.scale(r.dir, t));
    const d = Vec3.dist(pt, target);
    if (d < bestD) { bestD = d; bestT = t; }
  }
  assert(bestD < 0.02, 'roundtrip miss by ' + bestD);
});

test('point behind camera not projected', () => {
  const cam = new Camera(375, 667);
  cam.updateFrom(0, 0, 8, [0, 0, 0], null);
  assertEq(cam.project([0, 0, 9]), null);
});
