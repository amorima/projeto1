import { loadFromLocalStorage, saveToLocalStorage, combinar } from "./ModelHelpers.js";

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
getTrip
/**
 * @param {Array} destinos 
 * - Locais a Visitar (por ordem)
 * @param {Object} filtros
 * -Se não incluir apresenta todas as viagens
 * -Datas:
 *  filtros.dataPartidaMin
 *  filtros.dataChagadaMax
 * @param {number} [page=1] 
 * -Página atula
 * @param {number} [perPage=18]  
 * -Limite Paginação
 * @param {boolean} [circular=true] 
 * -Viagem começa e termina no mesmo local
 */
export function getTripsMulti(
  destinos,
  {
    dataPartidaMin = null,
    dataChegadaMax = null,
    ...filtrosSemDatas
  } = {},
  perPage = 18,
  page = 1,
  circular = true
) {
  // 1. Obter todosos Voos
  const segmentos = [];
  for (let i = 0; i < destinos.length - 1; i++) {
    const origem = destinos[i];
    const destino = destinos[i + 1];
    const voos = viagens.filter((v) =>
      v.origem === origem &&
      v.destino === destino &&
      Object.entries(filtrosSemDatas).every(([key, value]) =>
        v[key] !== undefined &&
        (Array.isArray(value) ? value.includes(v[key]) : v[key] == value)
      )
    );
    if (voos.length === 0) return []; // Not dound
    segmentos.push(voos);
  }

  // 3. Filtrar por datas
  const rotas = combinar(segmentos)
    .filter((segmentos) => {
      // Restrições da Datas
      for (let i = 0; i < segmentos.length; i++) {
        const voo = segmentos[i];
        // 1º voo: partida >= dataPartidaMin (se definida)
        if (i === 0 && dataPartidaMin) {
          if (new Date(voo.partida) < new Date(dataPartidaMin)) return false;
        }
        // Último voo: chegada <= dataChegadaMax (se definida)
        if (i === segmentos.length - 1 && dataChegadaMax) {
          if (new Date(voo.chegada) > new Date(dataChegadaMax)) return false;
        }
        // Voos: partida >= chegada do voo anterior
        if (i > 0) {
          const chegadaAnterior = new Date(segmentos[i - 1].chegada);
          const partidaAtual = new Date(voo.partida);
          if (partidaAtual < chegadaAnterior) return false;
        }
      }
      // Se circular, o último destino deve ser igual ao primeiro
      if (circular && segmentos.length > 0) {
        if (segmentos[segmentos.length - 1].destino !== destinos[0]) return false;
      }
      return true;
    })
    .map(segmentos => ({viagens: segmentos }));

  // 4. Paginação
  const start = perPage * (page - 1);
  return rotas.slice(start, start + perPage);
}

/**
 * Recomenda viagens multi-destino a partir de uma origem e timeframe.
 * @param {string} origem
 * @param {string} dataInicio
 * @param {string} dataFim
 * @param {number} maxDestinos
 * @param {Object} filtros
 * @returns {Array} Rotas recomendadas
 */
export function getRecommendedTrips(origem, dataInicio, dataFim, maxDestinos = 3, filtros = {}, circular = true) {
  const results = [];

  function rota(atual, rotaAtual, dataAtual, visitados) {
    // Se já atingiu o número máximo de destinos
    if (rotaAtual.length >= maxDestinos) {
      // Se circular, só guarda se o último destino for igual à origem
      if (!circular || (rotaAtual.length > 0 && rotaAtual[rotaAtual.length - 1].destino === origem)) {
        results.push({ viagens: [...rotaAtual] });
      }
      return;
    }

    const proximosVoos = viagens.filter(v =>
      v.origem === atual &&
      !visitados.includes(v.destino) &&
      new Date(v.partida) >= new Date(dataAtual) &&
      new Date(v.chegada) <= new Date(dataFim) &&
      Object.entries(filtros).every(([key, value]) =>
        v[key] !== undefined &&
        (Array.isArray(value) ? value.includes(v[key]) : v[key] == value)
      )
    );

    for (const voo of proximosVoos) {
      rota(
        voo.destino,
        [...rotaAtual, voo],
        voo.chegada,
        [...visitados, voo.destino]
      );
    }

    // Se já tem pelo menos 1 destino, pode guardar a rota parcial
    if (rotaAtual.length > 0) {
      if (!circular || (rotaAtual[rotaAtual.length - 1].destino === origem)) {
        results.push({ viagens: [...rotaAtual] });
      }
    }
  }

  rota(origem, [], dataInicio, [origem]);
  return results;
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
