import { loadFromLocalStorage, saveToLocalStorage } from "./ModelHelpers.js";

// ARRAY FLIGHTS
let viagens = [];

// CARREGAR VIAGEM DA LOCAL STORAGE ATRAVES DO MODEL HELPER
export function init() {
  viagens = localStorage.viagens
    ? loadFromLocalStorage("viagens", viagens)
    : [];
  return viagens;
}

export function getAll() {
  return viagens ? viagens : [];
}

// ADICIONAR VIAGEM
export function add(
  numeroVoo,
  origem,
  destino,
  companhia,
  partida,
  chegada,
  direto,
  custo,
  imagem,
  dataVolta
) {
  if (viagens.some((v) => v.numeroVoo === numeroVoo)) {
    throw Error(`Flight "${numeroVoo}" already exists!`);
  } else {
    viagens.push(
      new Trip(
        numeroVoo,
        origem,
        destino,
        companhia,
        partida,
        chegada,
        direto,
        custo,
        imagem,
        dataVolta
      )
    );
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
export function getTripsFrom(filtro = "OPO - Porto", perPage = 18, page = 1) {
  // Filtra voos cuja origem é OPO (Porto)
  const Trips = viagens.filter(
    (v) => v.origem === filtro || v.turismo === filtro
  );
  // Embaralha o array
  const shuffled = Trips.sort(() => 0.5 - Math.random());
  // Retorna os n voos (perPage) dependendo da pagina (page)
  return shuffled.slice(perPage * (page - 1), perPage * page);
}

export function getTripsByTurismo(turismoTipo) {
  return viagens.filter(
    (v) =>
      Array.isArray(v.turismo) &&
      v.turismo.some((t) => t.toLowerCase() === turismoTipo.toLowerCase())
  );
}

/**
 * Devolve array de aeroportos do localStorage.
 * @returns {Array<{cidade:string,location:{latitude:number,longitude:number}}>}
 */
export function getAeroportos() {
  return JSON.parse(localStorage.getItem("aeroportos")) || [];
}

/**
 * Associa a cada viagem as suas coordenadas, filtrando as que têm dados.
 * @returns {Array<{trip:Object,coords:{latitude:number,longitude:number}}>}
 */
export function getTripsWithCoordinates() {
  const aps = getAeroportos();
  return viagens
    .map((trip) => {
      const ap = aps.find(
        (a) => a.cidade.toLowerCase() === trip.destino.toLowerCase()
      );
      if (ap?.location) return { trip, coords: ap.location };
      return null;
    })
    .filter((x) => x !== null);
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
  constructor(
    numeroVoo,
    origem,
    destino,
    companhia,
    partida,
    chegada,
    direto,
    custo,
    imagem,
    dataVolta
  ) {
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
