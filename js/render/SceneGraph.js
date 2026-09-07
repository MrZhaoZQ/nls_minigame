'use strict';

const Vec3 = require('../math/Vec3');
const Mat3 = require('../math/Mat3');

let _nodeSeq = 0;

class SGNode {
  constructor(id) {
    _nodeSeq++;
    this.id = id || ('node_' + _nodeSeq);
    this.position = [0, 0, 0];
    this.rotation = Mat3.identity();
    this.scale = 1;
    this.parent = null;
    this.children = [];
    this.visible = true;
    this.alpha = 1;
    this.mesh = null;
    this.userData = {};
    this._stamp = -1;
    this._worldPos = [0, 0, 0];
    this._worldRot = Mat3.identity();
  }

  addChild(child) {
    if (child.parent) child.parent.removeChild(child);
    child.parent = this;
    this.children.push(child);
    return child;
  }

  removeChild(child) {
    const idx = this.children.indexOf(child);
    if (idx >= 0) {
      this.children.splice(idx, 1);
      child.parent = null;
    }
    return child;
  }

  removeFromParent() {
    if (this.parent) this.parent.removeChild(this);
    return this;
  }

  setEulerXYZ(rx, ry, rz) {
    this.rotation = Mat3.fromEulerXYZ(rx, ry, rz);
  }

  setAxisAngle(axis, angle) {
    this.rotation = Mat3.multiply(
      Mat3.fromAxisAngle(axis, angle), this.rotation);
  }

  computeWorld(stamp) {
    if (this._stamp === stamp) return;
    this._stamp = stamp;
    if (this.parent) {
      this.parent.computeWorld(stamp);
      const p = this.parent;
      const scaled = Vec3.scale(this.position, p._effectiveScale());
      this._worldRot = Mat3.multiply(p._worldRot, this.rotation);
      this._worldPos = Vec3.add(p._worldPos, Mat3.transform(p._worldRot, scaled));
    } else {
      this._worldRot = this.rotation;
      this._worldPos = Vec3.clone(this.position);
    }
  }

  _effectiveScale() {
    let s = this.scale;
    let n = this.parent;
    while (n) { s *= n.scale; n = n.parent; }
    return s;
  }

  worldPos(stamp) {
    this.computeWorld(stamp);
    return this._worldPos;
  }

  worldRot(stamp) {
    this.computeWorld(stamp);
    return this._worldRot;
  }

  traverse(fn) {
    fn(this);
    for (let i = 0; i < this.children.length; i++) this.children[i].traverse(fn);
  }
}

class SceneGraph {
  constructor() {
    this.root = new SGNode('root');
    this.stamp = 0;
  }

  add(node, parent) {
    return (parent || this.root).addChild(node);
  }

  remove(node) {
    node.removeFromParent();
  }

  find(id) {
    let found = null;
    this.root.traverse(n => { if (n.id === id) found = n; });
    return found;
  }

  beginFrame() {
    this.stamp++;
    return this.stamp;
  }
}

module.exports = SceneGraph;
module.exports.SGNode = SGNode;
