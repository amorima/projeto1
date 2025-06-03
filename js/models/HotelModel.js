import {
  loadFromLocalStorage,
  saveToLocalStorage,
  getNextId,
} from "./ModelHelpers.js";

/* array para os hoteis */
let hoteis = [];

/* função para iniciar o modelo com dados da localStorage */
export function init() {
  hoteis = localStorage.hoteis ? loadFromLocalStorage('hoteis', hoteis) : [];
  return hoteis;
}

/* função para obter todos os hoteis */
export function getAll() {
  return hoteis;
}

/* função para obter os primeiros X hoteis */
export function getFirst(quantidade = 5) {
  return hoteis.slice(0, quantidade);
}

/* obter hoteis por cidade */
export function getHoteisByCidade(cidade) {
  return hoteis.filter((hotel) => hotel.cidade === cidade);
}

/**
 * Obtém uma lista de hotéis filtrados por destino.
 * @param {number} destinoId - ID do destino para filtrar os hotéis.
 * @param {number} perPage - Número de hotéis por página (padrão é 18).
 * @param {number} page - Número da página a ser retornada (padrão é 1).
 * @return {Array} - Lista de hotéis filtrados e embaralhados, limitada ao número de itens por página.
 * @description
 * Esta função filtra os hotéis disponíveis com base no ID do destino fornecido.
 * Em seguida, embaralha a lista de hotéis e retorna apenas os itens correspondentes à página solicitada.
 * Se o número de hotéis for menor que o número solicitado, retorna todos os disponíveis.
 * @example
 * import { getHotelsFrom } from './HotelModel.js';
 * const hotels = getHotelsFrom(1, 10, 2);
 * Neste exemplo, a função retorna os hotéis do destino com ID 1,
 * limitados a 10 por página, e retorna a segunda página de resultados.
 */
export function getHotelsFrom(destinoId, perPage = 18, page = 1) {
  // Filtra hoteis cuja origem é OPO (Porto)
  const Hotels = hoteis.filter((h) => h.destinoId === destinoId);
  // Embaralha o array
  const shuffled = Hotels.sort(() => 0.5 - Math.random());
  // Retorna os primeiros 'count' voos
  return shuffled.slice(perPage * (page - 1), perPage * page);
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
 * @description
 * Esta classe representa um hotel na aplicação, contendo informações como ID, destino, nome, foto, tipo, número de camas, capacidade, preço por noite e acessibilidade.
 * Além disso, possui métodos para ocupar e liberar o hotel.
 * @example
 * const hotel = new Hotel(1, 2, 'Hotel Exemplo', 'https://example.com/hotel.jpg', 'Luxo', 2, 4, 150, ['Wi-Fi', 'Acessível'], true);
 * hotel.occupy(); // Marca o hotel como ocupado
 * hotel.free(); // Marca o hotel como disponível novamente
 */
class Hotel {
  id = 0;
  destinoId = 0;
  nome = "";
  foto = ""; // Improvement => []
  tipo = "";
  camas = 0;
  capacidade = 0;
  precoNoite = 0;
  acessibilidade = [];
  available = true;
  constructor(
    id,
    destinoId,
    nome,
    foto,
    tipo,
    camas,
    capacidade,
    precoNoite,
    acessibilidade = [],
    available = true
  ) {
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
