// ModelHelpers.js – funções de persistência de dados

export function loadFromLocalStorage(key, target) {
  const raw = localStorage.getItem(key);
  if (raw) {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) {
      target.splice(0, target.length, ...arr);
    }
  }
}

export function saveToLocalStorage(key, array) {
  localStorage.setItem(key, JSON.stringify(array));
}

export function getNextId(array) {
  return array.length > 0 ? array.reduce((max, item) => Math.max(max, item.id), 0) + 1 : 1;
}