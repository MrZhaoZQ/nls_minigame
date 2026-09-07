'use strict';

const Platform = require('../platform/Platform');

const KEYS = {
  progress: 'screwmaster_progress',
  capacity: 'screwmaster_capacity',
  adCount: 'screwmaster_adcount',
  shareCount: 'screwmaster_sharecount',
  tutorial: 'screwmaster_tutorial',
  results: 'screwmaster_results',
  capacityDay: 'screwmaster_capacityday',
  coins: 'screwmaster_coins'
};

const SaveManager = {
  getProgress() {
    const raw = Platform.storage.get(KEYS.progress);
    if (!raw) return { unlockedLevel: 1 };
    try {
      const data = JSON.parse(raw);
      return { unlockedLevel: data.unlockedLevel || 1 };
    } catch (e) {
      return { unlockedLevel: 1 };
    }
  },

  setUnlockedLevel(level) {
    const cur = SaveManager.getProgress();
    if (level > cur.unlockedLevel) {
      Platform.storage.set(KEYS.progress, JSON.stringify({ unlockedLevel: level }));
      return true;
    }
    return false;
  },

  getExtraCapacity() {
    const raw = Platform.storage.get(KEYS.capacity);
    return raw ? parseInt(raw, 10) || 0 : 0;
  },

  addExtraCapacity() {
    const cur = SaveManager.getExtraCapacity();
    Platform.storage.set(KEYS.capacity, String(cur + 1));
    return cur + 1;
  },

  getDailyAdInfo() {
    const raw = Platform.storage.get(KEYS.adCount);
    try {
      const data = raw ? JSON.parse(raw) : null;
      const today = new Date(Platform.now()).toDateString();
      if (data && data.date === today) return data;
      return { date: today, count: 0, lastShowTs: 0 };
    } catch (e) {
      return { date: new Date(Platform.now()).toDateString(), count: 0, lastShowTs: 0 };
    }
  },

  recordAdShow() {
    const info = SaveManager.getDailyAdInfo();
    info.count++;
    info.lastShowTs = Platform.now();
    Platform.storage.set(KEYS.adCount, JSON.stringify(info));
    return info;
  },

  getDailyShareInfo() {
    const raw = Platform.storage.get(KEYS.shareCount);
    try {
      const data = raw ? JSON.parse(raw) : null;
      const today = new Date(Platform.now()).toDateString();
      if (data && data.date === today) return data;
      return { date: today, count: 0, lastShareTs: 0 };
    } catch (e) {
      return { date: new Date(Platform.now()).toDateString(), count: 0, lastShareTs: 0 };
    }
  },

  recordShare() {
    const info = SaveManager.getDailyShareInfo();
    info.count++;
    info.lastShareTs = Platform.now();
    Platform.storage.set(KEYS.shareCount, JSON.stringify(info));
    return info;
  },

  getCoins() {
    const raw = Platform.storage.get(KEYS.coins);
    const n = parseInt(raw, 10);
    return isNaN(n) ? 0 : n;
  },

  addCoins(n) {
    Platform.storage.set(KEYS.coins, String(SaveManager.getCoins() + n));
    return SaveManager.getCoins();
  },

  spendCoins(n) {
    if (SaveManager.getCoins() < n) return false;
    Platform.storage.set(KEYS.coins, String(SaveManager.getCoins() - n));
    return true;
  },

  getTutorialDone() {
    return Platform.storage.get(KEYS.tutorial) === '1';
  },

  setTutorialDone() {
    Platform.storage.set(KEYS.tutorial, '1');
  },

  getResults() {
    const raw = Platform.storage.get(KEYS.results);
    if (!raw) return {};
    try {
      return JSON.parse(raw) || {};
    } catch (e) {
      return {};
    }
  },

  recordResult(levelId, rec) {
    const all = SaveManager.getResults();
    const old = all[levelId];
    if (!old) {
      all[levelId] = { stars: rec.stars, bestMs: rec.costMs, moves: rec.moves };
    } else {
      all[levelId] = {
        stars: Math.max(old.stars, rec.stars),
        bestMs: Math.min(old.bestMs || Infinity, rec.costMs),
        moves: rec.moves
      };
    }
    Platform.storage.set(KEYS.results, JSON.stringify(all));
    return all[levelId];
  },

  getCapacityDayInfo() {
    const raw = Platform.storage.get(KEYS.capacityDay);
    try {
      const data = raw ? JSON.parse(raw) : null;
      const today = new Date(Platform.now()).toDateString();
      if (data && data.date === today) return data;
      return { date: today, used: 0 };
    } catch (e) {
      return { date: new Date(Platform.now()).toDateString(), used: 0 };
    }
  },

  canExpandCapacityToday() {
    return SaveManager.getCapacityDayInfo().used < 1;
  },

  recordCapacityExpand() {
    const info = SaveManager.getCapacityDayInfo();
    info.used++;
    Platform.storage.set(KEYS.capacityDay, JSON.stringify(info));
    return info;
  }
};

module.exports = SaveManager;
