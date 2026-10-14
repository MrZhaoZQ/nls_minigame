'use strict';

const { assert, assertEq, section, test } = require('./harness');
const SceneGraph = require('../js/render/SceneGraph');
const SGNode = SceneGraph.SGNode;
const Camera = require('../js/render/Camera');
const Renderer = require('../js/render/Renderer');
const MeshBuilder = require('../js/render/MeshBuilder');
const Mat3 = require('../js/math/Mat3');
const Platform = require('../js/platform/Platform');

function makeCtx() {
  const calls = { fill: 0, beginPath: 0, ellipse: 0, ops: [] };
  return {
    calls,
    globalAlpha: 1,
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    beginPath() { calls.beginPath++; },
    moveTo() {},
    lineTo() {},
    closePath() {},
    fill() { calls.fill++; },
    stroke() {},
    ellipse() { calls.ellipse++; }
  };
}

section('SceneGraph');

test('child inherits parent world position', () => {
  const scene = new SceneGraph();
  const board = new SGNode('b1');
  board.position = [0, 1, 0];
  scene.add(board);
  const screw = new SGNode('s1');
  screw.position = [0.5, 0.2, 0];
  board.addChild(screw);
  const stamp = scene.beginFrame();
  assertEq(screw.worldPos(stamp), [0.5, 1.2, 0]);
});

test('parent rotation moves child', () => {
  const scene = new SceneGraph();
  const board = new SGNode('b1');
  board.rotation = Mat3.fromAxisAngle([0, 1, 0], Math.PI / 2);
  scene.add(board);
  const screw = new SGNode('s1');
  screw.position = [1, 0, 0];
  board.addChild(screw);
  const stamp = scene.beginFrame();
  const p = screw.worldPos(stamp);
  assert(Math.abs(p[0]) < 1e-9 && Math.abs(p[2] + 1) < 1e-9, JSON.stringify(p));
});

test('removeFromParent detaches', () => {
  const scene = new SceneGraph();
  const n = new SGNode('x');
  scene.add(n);
  n.removeFromParent();
  assertEq(scene.find('x'), null);
});

section('Renderer');

test('renders board + screws without error', () => {
  Platform.inject(Platform.createMockPlatform());
  const scene = new SceneGraph();
  const board = new SGNode('b1');
  board.mesh = MeshBuilder.buildBoxMesh(3.6, 1.2, 0.22, 'wood', '#c9a06c');
  board.userData.isBoard = true;
  scene.add(board);

  const screw = new SGNode('s1');
  screw.position = [0.5, 0.11, 0];
  screw.mesh = MeshBuilder.buildScrewMesh('red');
  board.addChild(screw);

  const cam = new Camera(375, 667);
  cam.updateFrom(0.6, 0.35, 8, [0, 0, 0], null);

  const ctx = makeCtx();
  const renderer = new Renderer();
  renderer.render(ctx, scene, cam, {});

  assert(ctx.calls.fill > 8, 'expected several filled faces, got ' + ctx.calls.fill);
  assert(ctx.calls.ellipse >= 1, 'expected shadow ellipse');
  Platform.inject(null);
});

test('screw mesh face normals consistent (no inverted faces)', () => {
  const mesh = MeshBuilder.buildScrewMesh('blue');
  for (const f of mesh.faces) {
    const a = mesh.verts[f.idx[0]];
    const b = mesh.verts[f.idx[1]];
    const c = mesh.verts[f.idx[f.idx.length - 1]];
    const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    const dot = n[0] * f.normal[0] + n[1] * f.normal[1] + n[2] * f.normal[2];
    assert(dot >= -1e-6, 'face normal inverted, dot=' + dot);
  }
});

test('board mesh has 6 outward faces', () => {
  const mesh = MeshBuilder.buildBoxMesh(2, 1, 0.2, 'wood', '#c9a06c');
  assertEq(mesh.faces.length, 6);
});

function checkNormals(mesh, label) {
  for (const f of mesh.faces) {
    const a = mesh.verts[f.idx[0]];
    const b = mesh.verts[f.idx[1]];
    const c = mesh.verts[f.idx[f.idx.length - 1]];
    const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    const dot = n[0] * f.normal[0] + n[1] * f.normal[1] + n[2] * f.normal[2];
    assert(dot >= -1e-6, label + ' face normal inverted, dot=' + dot);
  }
}

test('box/L/gear mesh normals consistent', () => {
  checkNormals(MeshBuilder.buildBoxMesh(3.6, 1.2, 0.22, 'wood', '#c9a06c'), 'box');
  checkNormals(MeshBuilder.buildLBoardMesh(3.6, 1.2, 0.22, 1.2, 'wood', '#c9a06c'), 'L');
  checkNormals(MeshBuilder.buildGearMesh(1.6, 12, 0.22, 'wood', '#c9a06c'), 'gear');
});

function makeSceneBoardScrew() {
  const scene = new SceneGraph();
  const board = new SGNode('b1');
  board.mesh = MeshBuilder.buildBoxMesh(3.6, 1.2, 0.22, 'wood', '#c9a06c');
  board.userData.isBoard = true;
  scene.add(board);
  const screw = new SGNode('s1');
  screw.position = [0.5, 0.11, 0];
  screw.mesh = MeshBuilder.buildScrewMesh('red');
  board.addChild(screw);
  return scene;
}

test('fully off-screen boards draw zero faces and zero shadows', () => {
  Platform.inject(Platform.createMockPlatform());
  const scene = new SceneGraph();
  const board = new SGNode('bFar');
  board.position = [80, 0, 0];
  board.mesh = MeshBuilder.buildBoxMesh(3.6, 1.2, 0.22, 'wood', '#c9a06c');
  board.userData.isBoard = true;
  scene.add(board);
  const cam = new Camera(375, 667);
  cam.updateFrom(0.6, 0.35, 8, [0, 0, 0], null);
  const ctx = makeCtx();
  new Renderer().render(ctx, scene, cam, {});
  assertEq(ctx.calls.fill, 0, 'off-screen faces must be culled, got ' + ctx.calls.fill);
  assertEq(ctx.calls.ellipse, 0, 'off-screen shadow must be culled');
  Platform.inject(null);
});

test('renderer pools face records and reuses fill strings across frames', () => {
  Platform.inject(Platform.createMockPlatform());
  const scene = makeSceneBoardScrew();
  const cam = new Camera(375, 667);
  cam.updateFrom(0.6, 0.35, 8, [0, 0, 0], null);
  const renderer = new Renderer();

  function record() {
    const c = makeCtx();
    const fills = [];
    Object.defineProperty(c, 'fillStyle', {
      configurable: true,
      get() { return ''; },
      set(v) { fills.push(v); }
    });
    return { c, fills };
  }

  const f1 = record();
  renderer.render(f1.c, scene, cam, {});
  const rec0 = renderer._facePool[0];
  const pts0 = rec0.pts;
  const f2 = record();
  renderer.render(f2.c, scene, cam, {});
  assertEq(renderer._facePool[0], rec0, 'face record object reused, not re-allocated');
  assertEq(renderer._facePool[0].pts, pts0, 'pts array reused');
  assertEq(f2.fills.length, f1.fills.length, 'same draws per frame');
  let shared = 0;
  for (let i = 0; i < f2.fills.length; i++) {
    if (f2.fills[i] === f1.fills[i]) shared++;
  }
  assert(shared >= f1.fills.length - 2,
    'fill strings must be reference-shared LUT entries, got ' + shared + '/' + f1.fills.length);
  Platform.inject(null);
});

test('degraded mode halves screw meshes and disables shadows', () => {
  Platform.inject(Platform.createMockPlatform());
  const scene = makeSceneBoardScrew();
  const cam = new Camera(375, 667);
  cam.updateFrom(0.6, 0.35, 8, [0, 0, 0], null);
  const renderer = new Renderer();

  const c1 = makeCtx();
  renderer.render(c1, scene, cam, {});
  assert(c1.calls.ellipse >= 1, 'shadows on in normal mode');
  const fullFills = c1.calls.fill;

  renderer.degraded = true;
  const c2 = makeCtx();
  renderer.render(c2, scene, cam, {});
  assertEq(c2.calls.ellipse, 0, 'shadows disabled when degraded');
  assert(c2.calls.fill < fullFills, 'screw side faces culled when degraded, ' +
    c2.calls.fill + ' vs ' + fullFills);
  assert(c2.calls.fill >= 4, 'core faces still rendered');
  Platform.inject(null);
});
