import { loadFromLocalStorage, saveToLocalStorage } from "./ModelHelpers.js";

// ARRAY FLIGHTS
let viagens = [];

// CARREGAR VIAGEM DA LOCAL STORAGE ATRAVES DO MODEL HELPER
export function init() {
  viagens = localStorage.viagens ? loadFromLocalStorage("viagens", viagens) : [];
  return viagens;
}

export function getAll() {
  return viagens ? viagens : [];
}

// ADICIONAR VIAGEM
export function add(numeroVoo, origem, destino, companhia, partida, chegada, direto, custo, imagem, dataVolta) {
  if (viagens.some((v) => v.numeroVoo ===  numeroVoo)) {
    throw Error(`Flight "${numeroVoo}" already exists!`);
  } else {
    viagens.push(new Trip(numeroVoo, origem, destino, companhia, partida, chegada, direto, custo, imagem, dataVolta));
    saveToLocalStorage("viagens", viagens);
  }
}

// ALTERAR DADOS DE VIAGEM
export function update(numeroVoo, newTrip) {
  const index = viagens.findIndex((v) => v.numeroVoo == numeroVoo);
  if (index !== -1) {
    viagens[index] = newTrip;
    saveToLocalStorage("viagens", viagens);
    return true;
  }
  throw Error("No Flight Found");
}

// APAGAR VIAGEM
export function deleteTrip(numeroVoo) {
  const index = viagens.findIndex((v) => v.numeroVoo == numeroVoo);
  if (index !== -1) {
    viagens.splice(index, 1);
    saveToLocalStorage("viagens", viagens);
    return true;
  }
  throw Error("No Flight Found");
}

// GET FLIGHTS
export function getTripsFrom(origem = "OPO - Porto",perPage = 18, page = 1) {
  // Filtra voos cuja origem é OPO (Porto)
  const Trips = viagens.filter(v => v.origem === origem);
  // Embaralha o array
  const shuffled = Trips.sort(() => 0.5 - Math.random());
  // Retorna os n voos (perPage) dependendo da pagina (page)
  return shuffled.slice(perPage*(page-1), perPage*page);
}

/**
 * CLASSE QUE MODELA UMA VIAGEM NA APLICAÇÃO
 */
class Trip {
  numeroVoo = "";
  origem = "";
  destino = "";
  companhia = "";
  partida = "";
  chegada = "";
  direto = "";
  custo = 0;
  imagem = "";
  dataVolta = "";
    constructor(numeroVoo, origem, destino, companhia, partida, chegada, direto, custo, imagem, dataVolta) {
    this.numeroVoo = numeroVoo;
    this.origem = origem;
    this.destino = destino;
    this.companhia = companhia;
    this.partida = partida;
    this.chegada = chegada;
    this.direto = direto;
    this.custo = custo;
    this.imagem = imagem;
    this.dataVolta = dataVolta;
  }
}