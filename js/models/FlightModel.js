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
/* Multitrip data */
let tripType = "ida-volta"; // 'ida', 'ida-volta', 'multitrip'
let multitripSegments = [
  {
    origem: null,
    destino: null,
    dataPartida: "",
    id: 1,
  },
];
/* Array de tipos de turismo - dados estáticos */
const tourismTypes = [
  {
    id: "TurismodeSolePraia",
    nome: "Sol e Praia",
    imagem: "../img/tipos-turismo/praia.png",
    url: "html/turism.html?turismo=TurismodeSolePraia",
  },
  {
    id: "TurismoUrbano",
    nome: "Turismo Urbano",
    imagem: "../img/tipos-turismo/urbano.png",
    url: "html/turism.html?turismo=TurismoUrbano",
  },
  {
    id: "Turismogastronomico",
    nome: "Turismo Gastronómico",
    imagem: "../img/tipos-turismo/Gastronómico.png",
    url: "html/turism.html?turismo=Turismogastronomico",
  },
  {
    id: "Turismocultural",
    nome: "Turismo Cultural",
    imagem: "../img/tipos-turismo/Cultural.png",
    url: "html/turism.html?turismo=Turismocultural",
  },
  {
    id: "SaudeeBemEstar",
    nome: "Saúde e Bem-estar",
    imagem: "../img/tipos-turismo/bem-estar.png",
    url: "html/turism.html?turismo=SaudeeBemEstar",
  },
  {
    id: "Ecoturismo",
    nome: "Ecoturismo",
    imagem: "../img/tipos-turismo/Eco.png",
    url: "html/turism.html?turismo=Ecoturismo",
  },
  {
    id: "Turismorural",
    nome: "Turismo Rural",
    imagem: "../img/tipos-turismo/Rural.png",
    url: "html/turism.html?turismo=Turismorural",
  },
  {
    id: "Turismoreligioso",
    nome: "Turismo Religioso",
    imagem: "../img/tipos-turismo/Religioso.png",
    url: "html/turism.html?turismo=Turismoreligioso",
  },
  {
    id: "Turismodenegocios",
    nome: "Turismo de Negócios",
    imagem: "../img/tipos-turismo/negocios.png",
    url: "html/turism.html?turismo=Turismodenegocios",
  },
];
/* Inicializar dados */
export function init() {
  viagens = localStorage.viagens
    ? loadFromLocalStorage("viagens", viagens)
    : [];
  // If no flights in localStorage, load sample data
  if (viagens.length === 0) {
    loadSampleFlights();
  }

  // Garantir que temos a lista atualizada de aeroportos com destinos combinados
  const aeroportosCombinados = getAirports();

  // Salvar de volta para assegurar que os aeroportos incluem todos os destinos
  if (aeroportosCombinados.length > 0) {
    localStorage.setItem("aeroportos", JSON.stringify(aeroportosCombinados));
  }

  loadSavedData();
  return viagens;
}
/* Load sample flight data for testing */
function loadSampleFlights() {
  const sampleFlights = [
    {
      numeroVoo: "TP123",
      origem: "OPO - Porto",
      destino: "LIS - Lisboa",
      companhia: "TAP Air Portugal",
      partida: "15/01/2025 08:30",
      chegada: "15/01/2025 09:45",
      direto: true,
      custo: "89",
      imagem: "../img/destinos/Lisboa/lisboa-1.jpg",
      dataVolta: "18/01/2025 18:30",
    },
    {
      numeroVoo: "TP456",
      origem: "LIS - Lisboa",
      destino: "MAD - Madrid",
      companhia: "TAP Air Portugal",
      partida: "16/01/2025 10:15",
      chegada: "16/01/2025 12:30",
      direto: true,
      custo: "156",
      imagem: "../img/destinos/Madrid/madrid-1.jpg",
      dataVolta: "20/01/2025 16:45",
    },
    {
      numeroVoo: "FR789",
      origem: "OPO - Porto",
      destino: "LON - Londres",
      companhia: "Ryanair",
      partida: "17/01/2025 06:00",
      chegada: "17/01/2025 08:15",
      direto: true,
      custo: "78",
      imagem: "../img/destinos/Londres/londres-1.jpg",
      dataVolta: "22/01/2025 14:20",
    },
    {
      numeroVoo: "AF321",
      origem: "LIS - Lisboa",
      destino: "PAR - Paris",
      companhia: "Air France",
      partida: "18/01/2025 14:40",
      chegada: "18/01/2025 18:55",
      direto: true,
      custo: "198",
      imagem: "../img/destinos/Paris/paris-1.jpg",
      dataVolta: "25/01/2025 11:30",
    },
    {
      numeroVoo: "LH567",
      origem: "OPO - Porto",
      destino: "ROM - Roma",
      companhia: "Lufthansa",
      partida: "19/01/2025 12:15",
      chegada: "19/01/2025 16:45",
      direto: false,
      custo: "234",
      imagem: "../img/destinos/Roma/roma-1.jpg",
      dataVolta: "26/01/2025 09:20",
    },
    {
      numeroVoo: "KL890",
      origem: "LIS - Lisboa",
      destino: "AMS - Amsterdão",
      companhia: "KLM",
      partida: "20/01/2025 07:30",
      chegada: "20/01/2025 11:10",
      direto: true,
      custo: "167",
      imagem: "../img/destinos/Amsterdao/amsterdao-1.jpg",
      dataVolta: "27/01/2025 15:45",
    },
  ];
  viagens = sampleFlights;
  saveToLocalStorage("viagens", viagens);
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
  // Obter aeroportos da localStorage
  const aeroportos = JSON.parse(localStorage.getItem("aeroportos")) || [];

  // Obter destinos da localStorage
  const destinos = JSON.parse(localStorage.getItem("destinos")) || [];

  // Converter destinos para o formato de aeroporto
  const destinosFormatados = destinos.map((dest) => ({
    codigo: dest.aeroporto,
    cidade: dest.cidade,
    pais: dest.pais,
  }));

  // Combinar os arrays, removendo duplicatas pelo código do aeroporto
  const todos = [...aeroportos];

  // Adicionar apenas destinos que não existem nos aeroportos
  destinosFormatados.forEach((dest) => {
    if (!todos.find((ap) => ap.codigo === dest.codigo)) {
      todos.push(dest);
    }
  });

  return todos;
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
export function clearSelectedAccessibilities() {
  selectedAccessibilities = [];
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
export function getTripsFrom(filtro = "all", perPage = 18, page = 1) {
  let Trips;

  /* Se o filtro for "all", retorna todas as viagens; caso contrário, filtra por origem ou tipo de turismo */
  if (filtro === "all") {
    Trips = [...viagens];
  } else {
    Trips = viagens.filter((v) => v.origem === filtro || v.turismo === filtro);
  }

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
 * Obtém todas as companhias aéreas disponíveis
 * @returns {Array} - Array com todas as companhias aéreas
 */
export function getAllCompanhiasAereas() {
  return JSON.parse(localStorage.getItem("companhiasAereas") || "[]");
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
/* Multitrip functions */
export function setTripType(type) {
  tripType = type;
  if (type === "multitrip" && multitripSegments.length === 1) {
    // Add a second segment for multitrip
    addMultitripSegment();
  }
}
export function getTripType() {
  return tripType;
}
export function addMultitripSegment() {
  const newSegment = {
    origem: null,
    destino: null,
    dataPartida: "",
    id: multitripSegments.length + 1,
  };
  multitripSegments.push(newSegment);
  return newSegment;
}
export function removeMultitripSegment(segmentId) {
  if (multitripSegments.length > 1) {
    multitripSegments = multitripSegments.filter((seg) => seg.id !== segmentId);
    // Renumber IDs
    multitripSegments.forEach((seg, index) => {
      seg.id = index + 1;
    });
  }
}
export function updateMultitripSegment(segmentId, data) {
  const segment = multitripSegments.find((seg) => seg.id === segmentId);
  if (segment) {
    Object.assign(segment, data);
  }
}
export function getMultitripSegments() {
  return multitripSegments;
}
export function clearMultitripSegments() {
  multitripSegments = [
    {
      origem: null,
      destino: null,
      dataPartida: "",
      id: 1,
    },
  ];
}
/* Function to build search data for sessionStorage */
export function buildSearchData() {
  const data = {
    tripType: tripType,
    origem: selectedOrigin,
    destino: selectedDestination,
    dataPartida: datesTravelers.dataPartida,
    dataRegresso: datesTravelers.dataRegresso,
    adultos: datesTravelers.adultos,
    criancas: datesTravelers.criancas,
    bebes: datesTravelers.bebes,
    tipoTurismo: selectedTourismType,
    acessibilidade: selectedAccessibilities,
    multitripSegments: tripType === "multitrip" ? multitripSegments : null,
  };
  return data;
}
/* Function to filter flights based on search criteria */
export function filterFlights(searchData) {
  let flights = [...viagens];
  if (!searchData) return flights;
  // Filter by origin
  if (searchData.origem && searchData.origem.cidade) {
    flights = flights.filter(
      (flight) =>
        flight.origem &&
        flight.origem
          .toLowerCase()
          .includes(searchData.origem.cidade.toLowerCase())
    );
  }
  // Filter by destination
  if (searchData.destino && searchData.destino.cidade) {
    flights = flights.filter(
      (flight) =>
        flight.destino &&
        flight.destino
          .toLowerCase()
          .includes(searchData.destino.cidade.toLowerCase())
    );
  }
  // Filter by tourism type
  if (
    searchData.tipoTurismo &&
    searchData.tipoTurismo.nome &&
    searchData.tipoTurismo.nome !== "Nenhum"
  ) {
    flights = flights.filter(
      (flight) =>
        flight.tipoTurismo &&
        flight.tipoTurismo
          .toLowerCase()
          .includes(searchData.tipoTurismo.nome.toLowerCase())
    );
  }
  // Filter by accessibility (if flight has accessibility info)
  if (searchData.acessibilidade && searchData.acessibilidade.length > 0) {
    flights = flights.filter((flight) => {
      if (!flight.acessibilidade) return true; // If no accessibility info, include flight
      return searchData.acessibilidade.some((acc) =>
        flight.acessibilidade.toLowerCase().includes(acc.toLowerCase())
      );
    });
  }
  // Filter by date (if departure date is specified)
  if (searchData.dataPartida) {
    const searchDate = new Date(searchData.dataPartida);
    flights = flights.filter((flight) => {
      if (!flight.partida) return true;
      const flightDate = parseFlightDate(flight.partida);
      return flightDate >= searchDate;
    });
  }
  return flights;
}
/* Helper function to parse flight dates */
function parseFlightDate(dateStr) {
  // Handle different date formats that might be in the flight data
  if (!dateStr) return new Date();
  // If it's already a Date object
  if (dateStr instanceof Date) return dateStr;
  // If it's in DD/MM/YYYY format
  if (dateStr.includes("/")) {
    const [day, month, year] = dateStr.split("/");
    return new Date(year, month - 1, day);
  }
  // Try to parse as ISO date or other standard format
  return new Date(dateStr);
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
/* Reset all state variables to their default values */
export function resetState() {
  selectedOrigin = null;
  selectedDestination = null;
  datesTravelers = {
    dataPartida: "",
    dataRegresso: "",
    adultos: 1,
    criancas: 0,
    bebes: 0,
  };
  selectedAccessibilities = [];
  selectedTourismType = null;
  tripType = "ida-volta";
  multitripSegments = [
    {
      origem: null,
      destino: null,
      dataPartida: "",
      id: 1,
    },
  ];
}
/**
 * Retorna todos os aeroportos com coordenadas geográficas
 * @returns {Array<{cidade:string,location:{latitude:number,longitude:number}}>}
 * - Array de objetos com a cidade e as coordenadas (latitude, longitude)
 */
export function getAeroportosComCoordenadas() {
  /* Aeroportos básicos da localStorage */
  const aeroportosBase = JSON.parse(localStorage.getItem("aeroportos")) || [];

  /* Coordenadas padrão de alguns aeroportos principais */
  const coordenadasPadrao = {
    OPO: { latitude: 41.248, longitude: -8.681 },
    LIS: { latitude: 38.774, longitude: -9.134 },
    MAD: { latitude: 40.416, longitude: -3.703 },
    BCN: { latitude: 41.297, longitude: 2.083 },
    PAR: { latitude: 49.009, longitude: 2.547 },
    LON: { latitude: 51.471, longitude: -0.461 },
    AMS: { latitude: 52.31, longitude: 4.768 },
    ROM: { latitude: 41.804, longitude: 12.25 },
    BER: { latitude: 52.366, longitude: 13.503 },
  };

  /* Adiciona coordenadas aos aeroportos que não têm */
  return aeroportosBase.map((aeroporto) => {
    if (aeroporto.location) return aeroporto;

    /* Extrair código do aeroporto */
    let codigo = "";
    if (aeroporto.codigo) {
      codigo = aeroporto.codigo.split(" ")[0];
    }

    /* Adicionar coordenadas padrão se disponíveis, ou uma estimativa */
    return {
      ...aeroporto,
      location: coordenadasPadrao[codigo] || {
        latitude: 41.0 + Math.random() * 10,
        longitude: -5.0 + Math.random() * 15,
      },
    };
  });
}
