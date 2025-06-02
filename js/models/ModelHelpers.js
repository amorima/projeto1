// ModelHelpers.js – funções de persistência de dados

export function loadFromLocalStorage(key, target) {
  const raw = localStorage.getItem(key);
  if (raw) {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) {
      target.splice(0, target.length, ...arr);
      return target;
    }
  }
}

export function saveToLocalStorage(key, array) {
  localStorage.setItem(key, JSON.stringify(array));
}

export function getNextId(array) {
  return array.length > 0
    ? array.reduce((max, item) => Math.max(max, item.id), 0) + 1
    : 1;
}

// Funções para gerir preferências de utilizador (tema, cookies, etc.)
export function getUserPreference(key, defaultValue = null) {
  return localStorage.getItem(key) || defaultValue;
}

export function setUserPreference(key, value) {
  localStorage.setItem(key, value);
}

export function isSystemDarkTheme() {
  return (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

export function getThemePreference() {
  // Obtém a preferência de tema guardada ou usa a preferência do sistema
  const savedTheme = getUserPreference("theme");
  if (savedTheme) {
    return savedTheme;
  }
  return isSystemDarkTheme() ? "dark" : "light";
}

export function combinar(arrays, prefix = []) {
    if (!arrays.length) return [prefix];
    const [first, ...rest] = arrays;
    return first.flatMap(voo => combinar(rest, [...prefix, voo]));
}