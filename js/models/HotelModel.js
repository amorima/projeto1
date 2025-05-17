import { loadFromLocalStorage, saveToLocalStorage } from './ModelHelpers.js';

// ARRAY HOTELS
let hotels

// CARREGAR HOTEIS DA LOCAL STORAGE
export function init() {
  hotels = localStorage.hotels ? loadFromLocalStorage('hotels',hotels) : []
}

// ADICIONAR HOTEL
export function add(name){

}

// ALTERAR DADOS DE HOTEL
export function update(name, newHotel) {

}

// APAGAR HOTEL
export function deleteHotel (name) {

}

// ADICIONAR QUARTO 
export function addRoom (hotel, room) {

}

// REMOVER QUARTO
export function removeRoom (room) {

}

/**
 * CLASSE QUE MODELA UM HOTEL NA APLICAÇÃO
 */
class Hotel {
  id = 0;
  name = '';
  location = '';
  image = '';
  quartos = [];

  constructor(id,name,location,image,quartos){
    this.id = id;
    this.name = name;
    this.location = location;
    this.image = image;
    this.quartos = quartos;
  }
}