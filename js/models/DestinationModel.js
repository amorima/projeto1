import { loadFromLocalStorage, saveToLocalStorage } from './ModelHelpers.js';

export default class DestinationModel {
  static storageKey = 'destinations';
  static _items = [];

  static init() {
    this._items = [];
    loadFromLocalStorage(this.storageKey, this._items);
  }

  static getAll(filterFn = null) {
    return filterFn ? this._items.filter(filterFn) : this._items;
  }

  static _getNextId() {
    return this._items.length
      ? Math.max(...this._items.map(i => i.id || 0)) + 1
      : 1;
  }

  static add(data) {
    const item = { ...data, id: this._getNextId() };
    this._items.push(item);
    saveToLocalStorage(this.storageKey, this._items);
    return item;
  }

  static update(id, data) {
    const idx = this._items.findIndex(i => i.id == id);
    if (idx !== -1) {
      this._items[idx] = { ...data, id };
      saveToLocalStorage(this.storageKey, this._items);
      return true;
    }
    return false;
  }

  static delete(id) {
    const idx = this._items.findIndex(i => i.id == id);
    if (idx !== -1) {
      this._items.splice(idx, 1);
      saveToLocalStorage(this.storageKey, this._items);
      return true;
    }
    return false;
  }
}
