import { loadFromLocalStorage, saveToLocalStorage, getNextId} from './ModelHelpers.js';

// ARRAY HOTELS
let hotels

// CARREGAR HOTEIS DA LOCAL STORAGE
export function init() {
  hotels = localStorage.hotels ? loadFromLocalStorage('hotels',hotels) : []
}

// ADICIONAR HOTEL
export function add(name, location, image){
  if (hotels.some((hotel) => hotel.id === id)) {
    throw Error(`Hotel "${name}" already exists!`);
  } else {
    hotels.push(new Hotel(getNextId(hotels), name, location, image));
    saveToLocalStorage('hotels', hotels);
  }
}

// ALTERAR DADOS DE HOTEL
export function update(id, newHotel) {
  const index = hotels.findIndex(h => h.id == id)
  if (index !== -1){
    hotels[index] = newHotel
    saveToLocalStorage('hotels',hotels)
    return true
  }
  throw Error ('No Hotel Found')
}

// APAGAR HOTEL
export function deleteHotel (id) {
  const index = hotels.findIndex(h => h.id == id)
  if(index !== -1){
    hotels.splice(index,1)
    saveToLocalStorage('hotels',hotels)
    return true
  }
  throw Error ('No Hotel Found')
}

// ADICIONAR QUARTO 
export function addRoom (hotel, room) {
  const index = hotels.findIndex(h => h.id == hotel.id)
  if (index !== -1){
    hotels[index].quartos.push(room)
    saveToLocalStorage('hotels',hotels)
    return true
  }
  throw Error ('No Hotel Found')
}

// REMOVER QUARTO
export function removeRoom (room) {
  const index = hotels.findIndex(h => h.quartos == room)
  if (index !== -1){
    const roomIndex = hotels[index].quartos.findIndex(r => r == room)
    if (roomIndex !== -1){
      hotels[index].quartos.splice(roomIndex,1)
      saveToLocalStorage('hotels',hotels)
      return true
    }
    throw Error ('No Room Found')
  }
  throw Error ('No Hotel Found')
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