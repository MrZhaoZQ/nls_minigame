'use strict';

const MatchChecker = {
  findMatch(slots, needCount) {
    const need = needCount || 3;
    const counts = {};
    for (let i = 0; i < slots.length; i++) {
      const c = slots[i];
      counts[c] = (counts[c] || 0) + 1;
    }
    const colors = [];
    const keys = Object.keys(counts);
    for (let i = 0; i < keys.length; i++) {
      if (counts[keys[i]] >= need) colors.push(keys[i]);
    }
    return colors;
  },

  removeMatch(slots, color, needCount) {
    const need = needCount || 3;
    const result = [];
    let removed = 0;
    for (let i = 0; i < slots.length; i++) {
      if (slots[i] === color && removed < need) {
        removed++;
      } else {
        result.push(slots[i]);
      }
    }
    return result;
  },

  hasAnyMatch(slots, needCount) {
    return MatchChecker.findMatch(slots, needCount).length > 0;
  },

  isDeadEnd(slots, capacity, needCount) {
    const need = needCount || 3;
    if (slots.length < capacity) return false;
    return !MatchChecker.hasAnyMatch(slots, need);
  }
};

module.exports = MatchChecker;
