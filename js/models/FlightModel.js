import {
  loadFromLocalStorage,
  saveToLocalStorage,
  combinar,
} from "./ModelHelpers.js";

/* Array principal de viagens */
let viagens = [];

/* Dados para os modais - devem estar no model */
let selectedOrigin = null;
let selectedDestination = null;
let datesTravelers = {
  dataPartida: "",
  dataRegresso: "",
  adultos: 1,
  criancas: 0,
  bebes: 0,
};
let selectedAccessibilities = [];
let selectedTourismType = null;

/* Array de tipos de turismo - dados estáticos */
const tourismTypes = [
  {
    id: "TurismodeSolePraia",
    nome: "Sol e Praia",
    imagem: "./img/tipos-turismo/praia.png",
    url: "html/turism.html?turismo=TurismodeSolePraia",
  },
  {
    id: "TurismoUrbano",
    nome: "Turismo Urbano",
    imagem: "./img/tipos-turismo/urbano.png",
    url: "html/turism.html?turismo=TurismoUrbano",
  },
  {
    id: "Turismogastronomico",
    nome: "Turismo Gastronómico",
    imagem: "./img/tipos-turismo/Gastronómico.png",
    url: "html/turism.html?turismo=Turismogastronomico",
  },
  {
    id: "Turismocultural",
    nome: "Turismo Cultural",
    imagem: "./img/tipos-turismo/Cultural.png",
    url: "html/turism.html?turismo=Turismocultural",
  },
  {
    id: "SaudeeBemEstar",
    nome: "Saúde e Bem-estar",
    imagem: "./img/tipos-turismo/bem-estar.png",
    url: "html/turism.html?turismo=SaudeeBemEstar",
  },
  {
    id: "Ecoturismo",
    nome: "Ecoturismo",
    imagem: "./img/tipos-turismo/Eco.png",
    url: "html/turism.html?turismo=Ecoturismo",
  },
  {
    id: "Turismorural",
    nome: "Turismo Rural",
    imagem: "./img/tipos-turismo/Rural.png",
    url: "html/turism.html?turismo=Turismorural",
  },
  {
    id: "Turismoreligioso",
    nome: "Turismo Religioso",
    imagem: "./img/tipos-turismo/Religioso.png",
    url: "html/turism.html?turismo=Turismoreligioso",
  },
  {
    id: "Turismodenegocios",
    nome: "Turismo de Negócios",
    imagem: "./img/tipos-turismo/negocios.png",
    url: "html/turism.html?turismo=Turismodenegocios",
  },
];

/* Inicializar dados */
export function init() {
  viagens = localStorage.viagens
    ? loadFromLocalStorage("viagens", viagens)
    : [];
  loadSavedData();
  return viagens;
}

/* Carregar dados guardados na localStorage */
function loadSavedData() {
  const savedOrigin = localStorage.getItem("origemSelecionada");
  if (savedOrigin) {
    selectedOrigin = JSON.parse(savedOrigin);
  }

  const savedDestination = localStorage.getItem("destinoSelecionado");
  if (savedDestination) {
    selectedDestination = JSON.parse(savedDestination);
  }

  const savedDates = localStorage.getItem("datasViajantes");
  if (savedDates) {
    datesTravelers = JSON.parse(savedDates);
  }

  const savedAccessibilities = localStorage.getItem(
    "acessibilidadesSelecionadas"
  );
  if (savedAccessibilities) {
    selectedAccessibilities = JSON.parse(savedAccessibilities);
  }

  const savedTourismType = localStorage.getItem("tipoTurismoSelecionado");
  if (savedTourismType) {
    selectedTourismType = JSON.parse(savedTourismType);
  }
}

// LER VIAGEM
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

/* Funcoes para gestao de origem */
export function getAirports() {
  return JSON.parse(localStorage.getItem("aeroportos")) || [];
}

/* Funcao para filtrar aeroportos por termo de pesquisa */
export function filterAirports(searchTerm) {
  const airports = getAirports();
  return airports.filter(
    (aeroporto) =>
      aeroporto.cidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (aeroporto.pais &&
        aeroporto.pais.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (aeroporto.codigo &&
        aeroporto.codigo.toLowerCase().includes(searchTerm.toLowerCase()))
  );
}

/* Funcao para definir o aeroporto de origem */
export function setOrigin(aeroporto) {
  selectedOrigin = aeroporto;
  localStorage.setItem("origemSelecionada", JSON.stringify(aeroporto));
}

/* Funcao para obter o aeroporto de origem selecionado */
export function getSelectedOrigin() {
  return selectedOrigin;
}

/* Funcoes para gestao de destino */
/* Funcao para definir o aeroporto de destino */
export function setDestination(aeroporto) {
  selectedDestination = aeroporto;
  localStorage.setItem("destinoSelecionado", JSON.stringify(aeroporto));
}

/* Funcao para obter o aeroporto de destino selecionado */
export function getSelectedDestination() {
  return selectedDestination;
}

/* Funcoes para gestao de datas e viajantes */
/* Funcao para definir datas da viagem e numero de viajantes */
export function setDatesTravelers(
  dataPartida,
  dataRegresso,
  adultos,
  criancas,
  bebes
) {
  datesTravelers = {
    dataPartida: dataPartida,
    dataRegresso: dataRegresso,
    adultos: adultos,
    criancas: criancas,
    bebes: bebes,
    totalViajantes: adultos + criancas + bebes,
  };
  localStorage.setItem("datasViajantes", JSON.stringify(datesTravelers));
}

/* Funcao para obter as datas e viajantes definidos */
export function getDatesTravelers() {
  return datesTravelers;
}

/* Funcao para formatar datas para mostrar ao utilizador */
export function formatDatesForDisplay(dataPartida, dataRegresso) {
  const partida = new Date(dataPartida);
  const regresso = new Date(dataRegresso);

  /* Array com nomes dos meses abreviados */
  const meses = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];

  const dataPartidaFormatada = `${partida.getDate()} ${
    meses[partida.getMonth()]
  }`;
  const dataRegressoFormatada = `${regresso.getDate()} ${
    meses[regresso.getMonth()]
  }`;

  return `${dataPartidaFormatada} - ${dataRegressoFormatada}`;
}

/* Funcoes para gestao de acessibilidade */
export function getAccessibilities() {
  return JSON.parse(localStorage.getItem("acessibilidade")) || [];
}

export function filterAccessibilities(searchTerm) {
  const accessibilities = getAccessibilities();
  return accessibilities.filter((acessibilidade) =>
    acessibilidade.toLowerCase().includes(searchTerm.toLowerCase())
  );
}

export function toggleAccessibility(index) {
  const position = selectedAccessibilities.indexOf(index);
  if (position > -1) {
    selectedAccessibilities.splice(position, 1);
  } else {
    selectedAccessibilities.push(index);
  }
}

export function confirmAccessibilities() {
  localStorage.setItem(
    "acessibilidadesSelecionadas",
    JSON.stringify(selectedAccessibilities)
  );
}

export function getSelectedAccessibilities() {
  return selectedAccessibilities;
}

export function getAccessibilitiesText() {
  const quantidade = selectedAccessibilities.length;
  if (quantidade === 0) return "Nenhum";
  if (quantidade === 1) return "1 selecionado";
  return `${quantidade} selecionados`;
}

/* Funcoes para gestao de tipos de turismo */
export function getTourismTypes() {
  return tourismTypes;
}

export function filterTourismTypes(searchTerm) {
  return tourismTypes.filter((tipo) =>
    tipo.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );
}

export function setTourismType(tipo) {
  selectedTourismType = tipo;
  localStorage.setItem("tipoTurismoSelecionado", JSON.stringify(tipo));
}

export function getSelectedTourismType() {
  return selectedTourismType;
}

/* Funcao para obter icone de acessibilidade baseado no texto */
export function getAccessibilityIcon(acessibilidade) {
  if (acessibilidade.includes("Elevador")) return "elevator";
  if (acessibilidade.includes("Banho")) return "wc";
  if (acessibilidade.includes("Quarto")) return "bed";
  if (acessibilidade.includes("Transporte")) return "directions_bus";
  if (acessibilidade.includes("Braille")) return "visibility_off";
  if (acessibilidade.includes("Alarme")) return "hearing_disabled";
  if (acessibilidade.includes("Cães")) return "pets";
  if (acessibilidade.includes("Sensorial")) return "psychology";
  if (acessibilidade.includes("Alimentar")) return "restaurant";
  if (acessibilidade.includes("Comunicação")) return "chat";
  if (acessibilidade.includes("Aluguer")) return "wheelchair_pickup";
  if (acessibilidade.includes("Táteis")) return "touch_app";
  if (acessibilidade.includes("Médicos")) return "medical_services";
  if (acessibilidade.includes("LGBTQIA")) return "favorite";
  if (acessibilidade.includes("Inclusivo")) return "groups";
  if (acessibilidade.includes("Minorias")) return "diversity_3";
  if (acessibilidade.includes("Neutras")) return "family_restroom";
  return "accessibility";
}

/* Funcao para obter viagens de uma origem especifica */
export function getTripsFrom(filtro = "OPO - Porto", perPage = 18, page = 1) {
  /* Filtra voos cuja origem e OPO (Porto) */
  const Trips = viagens.filter(
    (v) => v.origem === filtro || v.turismo === filtro
  );
  /* Embaralha o array para mostrar viagens diferentes */
  const shuffled = Trips.sort(() => 0.5 - Math.random());
  /* Retorna apenas o numero de viagens pedido para a pagina atual */
  return shuffled.slice(perPage * (page - 1), perPage * page);
}

export function getTripsMulti(
  destinos,
  { dataPartidaMin = null, dataChegadaMax = null, ...filtrosSemDatas } = {},
  perPage = 18,
  page = 1,
  circular = true
) {
  // 1. Obter todosos Voos
  const segmentos = [];
  for (let i = 0; i < destinos.length - 1; i++) {
    const origem = destinos[i];
    const destino = destinos[i + 1];
    const voos = viagens.filter(
      (v) =>
        v.origem === origem &&
        v.destino === destino &&
        Object.entries(filtrosSemDatas).every(
          ([key, value]) =>
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
        if (segmentos[segmentos.length - 1].destino !== destinos[0])
          return false;
      }
      return true;
    })
    .map((segmentos) => ({ viagens: segmentos }));

  // 4. Paginação
  const start = perPage * (page - 1);
  return rotas.slice(start, start + perPage);
}

/**
 * Recomenda viagens multi-destino a partir de uma origem e timeframe.
 * @param {string} origem
 * - Local de partida
 * @param {string} dataInicio
 * - Data de início da viagem (formato ISO 8601)
 * @param {string} dataFim
 * - Data de fim da viagem (formato ISO 8601)
 * @param {number} maxDestinos
 * - Número máximo de destinos na rota (default: 3)
 * @param {Object} filtros
 * - Filtros adicionais para as viagens (ex: companhia, custo, etc.)
 * - Exemplo: { companhia: 'TAP', custo: 100, direto: true }
 * - Se não incluir, apresenta todas as viagens
 * @param {boolean} circular
 * - Se true, a rota deve começar e terminar no mesmo local
 * @returns {Array} Rotas recomendadas
 * - Cada rota é um objeto com a propriedade 'viagens' contendo os voos
 * - Exemplo: [{ viagens: [voo1, voo2, ...] }, ...]
 */
export function getRecommendedTrips(
  origem,
  dataInicio,
  dataFim,
  maxDestinos = 3,
  filtros = {},
  circular = true
) {
  const results = [];

  function rota(atual, rotaAtual, dataAtual, visitados) {
    // Se já atingiu o número máximo de destinos
    if (rotaAtual.length >= maxDestinos) {
      // Se circular, só guarda se o último destino for igual à origem
      if (
        !circular ||
        (rotaAtual.length > 0 &&
          rotaAtual[rotaAtual.length - 1].destino === origem)
      ) {
        results.push({ viagens: [...rotaAtual] });
      }
      return;
    }

    const proximosVoos = viagens.filter(
      (v) =>
        v.origem === atual &&
        !visitados.includes(v.destino) &&
        new Date(v.partida) >= new Date(dataAtual) &&
        new Date(v.chegada) <= new Date(dataFim) &&
        Object.entries(filtros).every(
          ([key, value]) =>
            v[key] !== undefined &&
            (Array.isArray(value) ? value.includes(v[key]) : v[key] == value)
        )
    );

    for (const voo of proximosVoos) {
      rota(voo.destino, [...rotaAtual, voo], voo.chegada, [
        ...visitados,
        voo.destino,
      ]);
    }

    // Se já tem pelo menos 1 destino, pode guardar a rota parcial
    if (rotaAtual.length > 0) {
      if (!circular || rotaAtual[rotaAtual.length - 1].destino === origem) {
        results.push({ viagens: [...rotaAtual] });
      }
    }
  }

  rota(origem, [], dataInicio, [origem]);
  return results;
}

/**
 * Devolve array de viagens filtradas por tipo de turismo.
 * @param {string} turismoTipo
 * - Tipo de turismo a filtrar (ex: "cultural", "aventura", etc.)
 * - Ignora maiúsculas/minúsculas
 * @returns {Array}
 * - Array de viagens que incluem o tipo de turismo especificado
 * @example
 * getTripsByTurismo("cultural");
 * Returns: [
 *   { numeroVoo: "TP123", origem: "OPO", destino: "LIS", turismo: ["cultural"] },
 *   { numeroVoo: "TP456", origem: "OPO", destino: "MAD", turismo: ["cultural", "aventura"] }
 * ]
 */
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
 * - Array de objetos com a cidade e as coordenadas (latitude, longitude)
 * @example
 * getAeroportos();
 * Returns: [
 *   { cidade: "Porto", location: { latitude: 41.248, longitude: -8.681 } },
 *   { cidade: "Lisboa", location: { latitude: 38.774, longitude: -9.134 } },
 *   { cidade: "Madrid", location: { latitude: 40.416, longitude: -3.703 } }
 * ]
 */
export function getAeroportos() {
  return JSON.parse(localStorage.getItem("aeroportos")) || [];
}

/**
 * Associa a cada viagem as suas coordenadas, filtrando as que têm dados.
 * @returns {Array<{trip:Object,coords:{latitude:number,longitude:number}}>}
 * - Array de objetos com a viagem e as coordenadas do destino
 * @example
 * getTripsWithCoordinates();
 * Returns: [
 *   { trip: { numeroVoo: "TP123", origem: "OPO", destino: "LIS", ... }, coords: { latitude: 38.774, longitude: -9.134 } },
 *   { trip: { numeroVoo: "TP456", origem: "OPO", destino: "MAD", ... }, coords: { latitude: 40.416, longitude: -3.703 } }
 * ]
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
 * Obtém as avaliações de um destino específico
 * @param {string} destino - Nome do destino (cidade)
 * @returns {Array} - Array de reviews do destino
 */
export function getReviewsByDestino(destino) {
  const reviews = JSON.parse(localStorage.getItem("reviews") || "[]");
  return reviews.filter(
    (review) => review.destino.toLowerCase() === destino.toLowerCase()
  );
}

/**
 * Obtém informações sobre uma companhia aérea pelo nome
 * @param {string} nomeCompanhia - Nome da companhia aérea
 * @returns {Object|null} - Objeto com informações da companhia ou null se não encontrada
 */
export function getCompanhiaAereaByNome(nomeCompanhia) {
  const companhias = JSON.parse(
    localStorage.getItem("companhiasAereas") || "[]"
  );
  return companhias.find((comp) => comp.nome === nomeCompanhia) || null;
}

/**
 * Obtém todos os voos disponíveis para um destino específico
 * @param {string} destino - Nome do destino (cidade)
 * @returns {Array} - Array de voos disponíveis para o destino
 */
export function getVoosByDestino(destino) {
  return viagens.filter(
    (viagem) => viagem.destino.toLowerCase() === destino.toLowerCase()
  );
}

/**
 * Obtém uma viagem pelo número do voo
 * @param {string} numeroVoo - Número do voo
 * @returns {Object|null} - Objeto da viagem correspondente ou null se não encontrado
 */
export function getByNumeroVoo(numeroVoo) {
  return viagens.find((v) => String(v.numeroVoo) === String(numeroVoo)) || null;
}

/**
 * CLASSE QUE MODELA UMA VIAGEM NA APLICAÇÃO
 * @class Trip
 * @property {string} numeroVoo - Número do voo
 * @property {string} origem - Cidade de origem do voo
 * @property {string} destino - Cidade de destino do voo
 * @property {string} companhia - Companhia aérea do voo
 * @property {string} partida - Data e hora de partida do voo
 * @property {string} chegada - Data e hora de chegada do voo
 * @property {string} direto - Indica se o voo é direto (sim/não)
 * @property {number} custo - Custo do voo
 * @property {string} imagem - URL da imagem do voo
 * @property {string} dataVolta - Data de volta do voo (se aplicável)
 * @description
 * Esta classe representa uma viagem na aplicação, contendo informações como número do voo, origem, destino, companhia aérea, horários de partida e chegada, se é um voo direto, custo, imagem e data de volta (se aplicável).
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
