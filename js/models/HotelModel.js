import { loadFromLocalStorage, saveToLocalStorage, getNextId} from './ModelHelpers.js';

// ARRAY HOTELS
let hotels

// CARREGAR HOTEIS DA LOCAL STORAGE
export function init() {
  hotels = localStorage.hotels ? loadFromLocalStorage('hotels',hotels) : [];
  return hotels;
}

export function getAll() {
  return hotels ? hotels : [];
}

// ADICIONAR HOTEL
export function add(destinoId, nome, foto, tipo, camas, capacidade, precoNoite, acessibilidade = [], available = true) {
  const id = getNextId(hotels);
  if (hotels.some((h) => h.name === nome && h.destinoId === destinoId)) {
    throw Error(`Hotel "${nome}" already exists!`);
  } else {
    hotels.push(new Hotel(id, destinoId, nome, foto, tipo, camas, capacidade, precoNoite, acessibilidade, available));
    saveToLocalStorage('hotels', hotels);
  }
}

// ALTERAR DADOS DE HOTEL
export function update(id, newHotel) {
  const index = hotels.findIndex((h) => h.id == id);
  if (index !== -1) {
    hotels[index] = newHotel;
    saveToLocalStorage('hotels', hotels);
    return true;
  }
  throw Error('No Hotel Found');
}

// APAGAR HOTEL
export function deleteHotel(id) {
  const index = hotels.findIndex((h) => h.id == id);
  if (index !== -1) {
    hotels.splice(index, 1);
    saveToLocalStorage('hotels', hotels);
    return true;
  }
  throw Error('No Hotel Found');
}

export function getHotelsFrom(destinoId, perPage = 18, page = 1) {
  // Filtra hoteis cuja origem é OPO (Porto)
  const Hotels = hotels.filter(h => h.destinoId === destinoId);
  // Embaralha o array
  const shuffled = Hotels.sort(() => 0.5 - Math.random());
  // Retorna os primeiros 'count' voos
  return shuffled.slice(perPage*(page-1), perPage*page);
}

/**
 * CLASSE QUE MODELA UM HOTEL NA APLICAÇÃO
 * @param {number} id - ID do hotel
 * @param {number} destinoId - ID do destino
 * @param {string} nome - Nome do hotel
 * @param {string} foto - URL da foto do hotel
 * @param {string} tipo - Tipo de hotel
 * @param {number} camas - Número de camas
 * @param {number} capacidade - Capacidade do hotel
 * @param {number} precoNoite - Preço por noite
 * @param {Array} acessibilidade - Lista de acessibilidade
 * @param {boolean} available - Disponibilidade do hotel
 */
class Hotel {
  id = 0;
  destinoId = 0;
  nome = '';
  foto = ''; // Improvement => []
  tipo = '';
  camas = 0;
  capacidade = 0;
  precoNoite = 0;
  acessibilidade = [];
  available = true;
  constructor(id, destinoId, nome, foto, tipo, camas, capacidade, precoNoite, acessibilidade = [], available = true) {
    this.id = id;
    this.destinoId = destinoId;
    this.nome = nome;
    this.foto = foto;
    this.tipo = tipo;
    this.camas = camas;
    this.capacidade = capacidade;
    this.precoNoite = precoNoite;
    this.acessibilidade = acessibilidade;
    this.available = available;
  }
  occupy() {
    this.available = false;
  }
  free() {
    this.available = true;
  }
}