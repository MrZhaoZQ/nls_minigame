'use strict';

class UndoStack {
  constructor(maxSize) {
    this.maxSize = maxSize || 30;
    this.ops = [];
  }

  push(op) {
    this.ops.push(op);
    if (this.ops.length > this.maxSize) this.ops.shift();
  }

  pop() {
    if (this.ops.length === 0) return null;
    return this.ops.pop();
  }

  peek() {
    if (this.ops.length === 0) return null;
    return this.ops[this.ops.length - 1];
  }

  size() { return this.ops.length; }

  clear() { this.ops = []; }
}

module.exports = UndoStack;
