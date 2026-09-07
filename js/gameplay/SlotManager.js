'use strict';

const MatchChecker = require('./MatchChecker');
const GameConfig = require('../config/GameConfig');

class SlotManager {
  constructor(capacity) {
    this.capacity = capacity || GameConfig.slot.defaultCount;
    this.slots = [];
  }

  setCapacity(n) {
    this.capacity = Math.min(n, GameConfig.slot.maxCount);
  }

  isFull() {
    return this.slots.length >= this.capacity;
  }

  count() {
    return this.slots.length;
  }

  add(color) {
    if (this.isFull()) return -1;
    this.slots.push(color);
    return this.slots.length - 1;
  }

  removeMatch(color) {
    const before = this.slots.length;
    this.slots = MatchChecker.removeMatch(this.slots, color, GameConfig.match.needCount);
    return before - this.slots.length;
  }

  removeOneColor(color) {
    for (let i = this.slots.length - 1; i >= 0; i--) {
      if (this.slots[i] === color) {
        this.slots.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  findMatches() {
    return MatchChecker.findMatch(this.slots, GameConfig.match.needCount);
  }

  hasMatch() {
    return MatchChecker.hasAnyMatch(this.slots, GameConfig.match.needCount);
  }

  isDeadEnd() {
    return MatchChecker.isDeadEnd(this.slots, this.capacity, GameConfig.match.needCount);
  }

  nearFull() {
    return this.slots.length >= GameConfig.slot.warnAt;
  }

  clear() {
    this.slots = [];
  }
}

module.exports = SlotManager;
