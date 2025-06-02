// ModelHelpers.js – funções de persistência de dados

/**
 * Carrega um array de objetos do localStorage.
 * @param {string} key - A chave do localStorage onde o array está armazenado.
 * @param {Array} target - O array onde os dados serão carregados.
 * @return {Array} - O array atualizado com os dados carregados.
 * @description
 * Esta função tenta carregar um array de objetos do localStorage usando a chave fornecida.
 * Se os dados forem encontrados e forem um array válido, eles serão copiados para o array `target`.
 * Se não houver dados ou se os dados não forem um array, o array `target` permanecerá inalterado.
 * @example
 * import { loadFromLocalStorage } from './ModelHelpers.js';
 * const myArray = [];
 * loadFromLocalStorage('myKey', myArray);
 * Agora myArray contém os dados carregados da localStorage, se existirem.
 */
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

/**
 * Salva um array de objetos no localStorage.
 * @param {string} key - A chave do localStorage onde o array será armazenado.
 * @param {Array} array - O array de objetos a ser salvo.
 * @description
 * Esta função converte o array fornecido em uma string JSON e o armazena no localStorage sob a chave especificada.
 * Se o array for vazio, ele ainda será salvo como uma string JSON vazia.
 * @example
 * import { saveToLocalStorage } from './ModelHelpers.js';
 * const myArray = [{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }];
 * saveToLocalStorage('myKey', myArray);
 * Agora os dados de myArray estão salvos no localStorage sob a chave 'myKey'.
 */
export function saveToLocalStorage(key, array) {
  localStorage.setItem(key, JSON.stringify(array));
}

/**
 * Gera o próximo ID para um array de objetos.
 * @param {Array} array - O array de objetos onde os IDs são gerenciados.
 * @return {number} - O próximo ID disponível.
 * @description
 * Esta função verifica o array fornecido e determina o próximo ID disponível.
 * Se o array estiver vazio, retorna 1. Caso contrário, encontra o maior ID existente e retorna esse valor mais 1.
 * @example
 * import { getNextId } from './ModelHelpers.js';
 * const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
 * const nextId = getNextId(items);
 * nextId será 4, pois é o próximo ID disponível após os existentes.
 */
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

/**
 * Combina arrays de forma recursiva, gerando todas as combinações possíveis.
 * 
 * @param {Array} arrays 
 * - Arrays a combinar, cada um representando uma dimensão
 * @param {Array} prefix 
 * - Prefixo para as combinações, usado internamente na recursão
 * @returns 
 * - Array com todas as combinações possíveis
 * @example
 * import { combinar } from './ModelHelpers.js';
 * const resultado = combinar([[1, 2], [3, 4]]);
 * resultado [[1, 3], [1, 4], [2, 3], [2, 4]]
 * @description
 * Esta função é útil para gerar combinações de opções, como em formulários dinâmicos ou seleções múltiplas.
 * 
 * Ela utiliza recursão para explorar todas as possibilidades, começando com o primeiro array e combinando cada elemento com os resultados das chamadas subsequentes.
 * 
 * A função retorna um array contendo todas as combinações possíveis de elementos dos arrays fornecidos.
 * 
 * É importante notar que a função pode gerar um número exponencial de combinações dependendo do tamanho dos arrays de entrada, por isso deve ser usada com cautela em casos com muitos elementos.
 */
export function combinar(arrays, prefix = []) {
    if (!arrays.length) return [prefix];
    const [first, ...rest] = arrays;
    return first.flatMap(voo => combinar(rest, [...prefix, voo]));
}