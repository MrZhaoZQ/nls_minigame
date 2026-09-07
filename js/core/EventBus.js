'use strict';

class EventBus {
  constructor() {
    this._handlers = {};
  }

  on(event, handler) {
    if (!this._handlers[event]) this._handlers[event] = [];
    this._handlers[event].push(handler);
    return () => this.off(event, handler);
  }

  off(event, handler) {
    const list = this._handlers[event];
    if (!list) return;
    const idx = list.indexOf(handler);
    if (idx >= 0) list.splice(idx, 1);
  }

  emit(event, data) {
    const list = this._handlers[event];
    if (!list) return;
    for (let i = 0; i < list.length; i++) {
      try {
        list[i](data);
      } catch (e) {
        if (typeof console !== 'undefined') console.error('EventBus handler error:', event, e);
      }
    }
  }

  clear(event) {
    if (event) delete this._handlers[event];
    else this._handlers = {};
  }
}

const Events = {
  SCREW_COLLECTED: 'SCREW_COLLECTED',
  SLOT_UPDATED: 'SLOT_UPDATED',
  MATCH_MADE: 'MATCH_MADE',
  BOARD_COLLAPSED: 'BOARD_COLLAPSED',
  LEVEL_WIN: 'LEVEL_WIN',
  LEVEL_LOSE: 'LEVEL_LOSE',
  SLOT_FULL_WARNING: 'SLOT_FULL_WARNING',
  GAME_STATE_CHANGED: 'GAME_STATE_CHANGED'
};

module.exports = EventBus;
module.exports.Events = Events;
