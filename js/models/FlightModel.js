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
    /* Voos diretos */
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
      turismo: ["Turismo Cultural", "Turismo Urbano"],
      tipoViagem: "ida-volta" /* ida, ida-volta, multitrip */,
      segmentos: [
        /* Segmento de ida */
        {
          numeroVoo: "TP123",
          origem: "OPO - Porto",
          destino: "LIS - Lisboa",
          companhia: "TAP Air Portugal",
          partida: "15/01/2025 08:30",
          chegada: "15/01/2025 09:45",
          tipo: "ida",
        },
        /* Segmento de volta */
        {
          numeroVoo: "TP124",
          origem: "LIS - Lisboa",
          destino: "OPO - Porto",
          companhia: "TAP Air Portugal",
          partida: "18/01/2025 18:30",
          chegada: "18/01/2025 19:45",
          tipo: "volta",
        },
      ],
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
      turismo: ["Turismo Cultural", "Turismo Gastronómico"],
      tipoViagem: "ida-volta",
      segmentos: [
        /* Segmento de ida */
        {
          numeroVoo: "TP456",
          origem: "LIS - Lisboa",
          destino: "MAD - Madrid",
          companhia: "TAP Air Portugal",
          partida: "16/01/2025 10:15",
          chegada: "16/01/2025 12:30",
          tipo: "ida",
        },
        /* Segmento de volta */
        {
          numeroVoo: "TP457",
          origem: "MAD - Madrid",
          destino: "LIS - Lisboa",
          companhia: "TAP Air Portugal",
          partida: "20/01/2025 16:45",
          chegada: "20/01/2025 18:00",
          tipo: "volta",
        },
      ],
    },
    /* Voo com uma escala */
    {
      numeroVoo: "LH567",
      origem: "OPO - Porto",
      destino: "ROM - Roma",
      companhia: "Lufthansa",
      partida: "19/01/2025 12:15",
      chegada: "19/01/2025 18:45",
      direto: false,
      custo: "234",
      imagem: "../img/destinos/Roma/roma-1.jpg",
      dataVolta: "26/01/2025 09:20",
      turismo: ["Turismo Cultural", "Turismo Gastronómico"],
      tipoViagem: "ida-volta",
      segmentos: [
        /* Segmentos de ida (com escala) */
        {
          numeroVoo: "LH567",
          origem: "OPO - Porto",
          destino: "FRA - Frankfurt",
          companhia: "Lufthansa",
          partida: "19/01/2025 12:15",
          chegada: "19/01/2025 15:30",
          tipo: "ida",
        },
        {
          numeroVoo: "LH568",
          origem: "FRA - Frankfurt",
          destino: "ROM - Roma",
          companhia: "Lufthansa",
          partida: "19/01/2025 16:45",
          chegada: "19/01/2025 18:45",
          tipo: "ida",
        },
        /* Segmentos de volta (direto) */
        {
          numeroVoo: "LH569",
          origem: "ROM - Roma",
          destino: "OPO - Porto",
          companhia: "Lufthansa",
          partida: "26/01/2025 09:20",
          chegada: "26/01/2025 12:35",
          tipo: "volta",
        },
      ],
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
      turismo: ["Turismo Cultural", "Turismo Urbano"],
      tipoViagem: "ida-volta",
      segmentos: [
        /* Segmento de ida */
        {
          numeroVoo: "FR789",
          origem: "OPO - Porto",
          destino: "LON - Londres",
          companhia: "Ryanair",
          partida: "17/01/2025 06:00",
          chegada: "17/01/2025 08:15",
          tipo: "ida",
        },
        /* Segmento de volta */
        {
          numeroVoo: "FR790",
          origem: "LON - Londres",
          destino: "OPO - Porto",
          companhia: "Ryanair",
          partida: "22/01/2025 14:20",
          chegada: "22/01/2025 16:35",
          tipo: "volta",
        },
      ],
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
      turismo: ["Turismo Cultural", "Turismo Gastronómico"],
      tipoViagem: "ida-volta",
      segmentos: [
        /* Segmento de ida */
        {
          numeroVoo: "AF321",
          origem: "LIS - Lisboa",
          destino: "PAR - Paris",
          companhia: "Air France",
          partida: "18/01/2025 14:40",
          chegada: "18/01/2025 18:55",
          tipo: "ida",
        },
        /* Segmento de volta */
        {
          numeroVoo: "AF322",
          origem: "PAR - Paris",
          destino: "LIS - Lisboa",
          companhia: "Air France",
          partida: "25/01/2025 11:30",
          chegada: "25/01/2025 13:45",
          tipo: "volta",
        },
      ],
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
      turismo: ["Turismo Cultural", "Turismo Urbano"],
      tipoViagem: "ida-volta",
      segmentos: [
        /* Segmento de ida */
        {
          numeroVoo: "KL890",
          origem: "LIS - Lisboa",
          destino: "AMS - Amsterdão",
          companhia: "KLM",
          partida: "20/01/2025 07:30",
          chegada: "20/01/2025 11:10",
          tipo: "ida",
        },
        /* Segmento de volta */
        {
          numeroVoo: "KL891",
          origem: "AMS - Amsterdão",
          destino: "LIS - Lisboa",
          companhia: "KLM",
          partida: "27/01/2025 15:45",
          chegada: "27/01/2025 18:00",
          tipo: "volta",
        },
      ],
    },
  ];

  /* Converter para objetos Trip para garantir consistência */
  viagens = sampleFlights.map(
    (flight) =>
      new Trip(
        flight.numeroVoo,
        flight.origem,
        flight.destino,
        flight.companhia,
        flight.partida,
        flight.chegada,
        flight.direto,
        flight.custo,
        flight.imagem,
        flight.dataVolta,
        flight.segmentos,
        flight.turismo,
        flight.tipoViagem
      )
  );

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
  dataVolta,
  segmentos = null,
  turismo = []
) {
  /* Validar dados antes de adicionar */
  const dadosVoo = {
    numeroVoo,
    origem,
    destino,
    companhia,
    partida,
    chegada,
    direto,
    custo,
    imagem,
    dataVolta,
    segmentos,
    turismo,
  };

  const validacao = validateFlightData(dadosVoo);
  if (!validacao.isValid) {
    throw new Error("Dados inválidos: " + validacao.errors.join(", "));
  }

  if (viagens.some((v) => v.numeroVoo === numeroVoo)) {
    throw Error(`Voo "${numeroVoo}" já existe!`);
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
        dataVolta,
        segmentos,
        turismo
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
    Trips = viagens.filter((v) => {
      /* Filtro por origem */
      const origemMatch = v.origem === filtro;

      /* Filtro por tipo de turismo */
      const turismoMatch =
        Array.isArray(v.turismo) &&
        v.turismo.some((tipo) => tipo.toLowerCase() === filtro.toLowerCase());

      return origemMatch || turismoMatch;
    });
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
      /* Extrair nome da cidade do destino (formato: "XXX - Cidade") */
      const cidadeDestino = trip.destino.includes(" - ")
        ? trip.destino.split(" - ")[1]
        : trip.destino;

      const ap = aps.find(
        (a) => a.cidade.toLowerCase() === cidadeDestino.toLowerCase()
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
  /* Extrair nome da cidade do destino (formato: "XXX - Cidade") */
  const cidadeDestino = destino.includes(" - ")
    ? destino.split(" - ")[1]
    : destino;

  return reviews.filter(
    (review) => review.destino.toLowerCase() === cidadeDestino.toLowerCase()
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
  /* Extrair nome da cidade do destino (formato: "XXX - Cidade") */
  const cidadeDestino = destino.includes(" - ")
    ? destino.split(" - ")[1]
    : destino;

  return viagens.filter((viagem) => {
    const cidadeViagem = viagem.destino.includes(" - ")
      ? viagem.destino.split(" - ")[1]
      : viagem.destino;
    return cidadeViagem.toLowerCase() === cidadeDestino.toLowerCase();
  });
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

  /* Filtragem por origem */
  if (searchData.origem) {
    flights = flights.filter((flight) => {
      if (!flight.origem) return false;

      const origemVoo = flight.origem.toLowerCase();

      /* Se temos um objeto aeroporto com código */
      if (searchData.origem.codigo) {
        const codigoOrigem = searchData.origem.codigo.toLowerCase();
        return origemVoo.startsWith(codigoOrigem + " -");
      }

      /* Se temos apenas string, comparar diretamente */
      let origemPesquisa = searchData.origem.cidade || searchData.origem;
      if (typeof origemPesquisa !== "string") {
        return true; /* Se não conseguir processar, inclui o voo */
      }
      origemPesquisa = origemPesquisa.toLowerCase();
      return origemVoo.includes(origemPesquisa);
    });
  }

  /* Filtragem por destino */
  if (searchData.destino) {
    flights = flights.filter((flight) => {
      if (!flight.destino) return false;

      const destinoVoo = flight.destino.toLowerCase();

      /* Se temos um objeto aeroporto com código */
      if (searchData.destino.codigo) {
        const codigoDestino = searchData.destino.codigo.toLowerCase();
        return destinoVoo.startsWith(codigoDestino + " -");
      }

      /* Se temos apenas string, comparar diretamente */
      let destinoPesquisa = searchData.destino.cidade || searchData.destino;
      if (typeof destinoPesquisa !== "string") {
        return true; /* Se não conseguir processar, inclui o voo */
      }
      destinoPesquisa = destinoPesquisa.toLowerCase();
      return destinoVoo.includes(destinoPesquisa);
    });
  }
  // Filter by tourism type
  if (
    searchData.tipoTurismo &&
    searchData.tipoTurismo.nome &&
    searchData.tipoTurismo.nome !== "Nenhum"
  ) {
    flights = flights.filter(
      (flight) =>
        flight.turismo &&
        Array.isArray(flight.turismo) &&
        flight.turismo.some((tipo) =>
          tipo.toLowerCase().includes(searchData.tipoTurismo.nome.toLowerCase())
        )
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
/* Função de pesquisa robusta que considera escalas e multi-destinos */
export function searchFlightsAdvanced(searchCriteria) {
  let results = [...viagens];

  /* Filtro por origem */
  if (searchCriteria.origem) {
    results = results.filter((flight) => {
      /* Extrair string da origem (pode ser objeto ou string) */
      let origemPesquisa = searchCriteria.origem;
      if (typeof origemPesquisa === "object" && origemPesquisa.codigo) {
        origemPesquisa = origemPesquisa.codigo;
      }
      if (typeof origemPesquisa === "object" && origemPesquisa.cidade) {
        origemPesquisa = origemPesquisa.cidade;
      }
      if (typeof origemPesquisa !== "string") {
        return true; /* Se não conseguir processar, inclui o voo */
      }

      origemPesquisa = origemPesquisa.toLowerCase();
      return (
        flight.origem.toLowerCase().includes(origemPesquisa) ||
        (flight.segmentos &&
          flight.segmentos.length > 0 &&
          flight.segmentos[0].origem &&
          flight.segmentos[0].origem.toLowerCase().includes(origemPesquisa))
      );
    });
  }

  /* Filtro por destino (considera destino final e escalas) */
  if (searchCriteria.destino) {
    results = results.filter((flight) => {
      /* Extrair string do destino (pode ser objeto ou string) */
      let destinoPesquisa = searchCriteria.destino;
      if (typeof destinoPesquisa === "object" && destinoPesquisa.codigo) {
        destinoPesquisa = destinoPesquisa.codigo;
      }
      if (typeof destinoPesquisa === "object" && destinoPesquisa.cidade) {
        destinoPesquisa = destinoPesquisa.cidade;
      }
      if (typeof destinoPesquisa !== "string") {
        return true; /* Se não conseguir processar, inclui o voo */
      }

      destinoPesquisa = destinoPesquisa.toLowerCase();

      /* Verifica destino final */
      const destinoFinalMatch = flight.destino
        .toLowerCase()
        .includes(destinoPesquisa);

      /* Verifica escalas */
      const escalaMatch =
        flight.segmentos &&
        flight.segmentos.length > 0 &&
        flight.segmentos.some(
          (seg) =>
            seg.destino && seg.destino.toLowerCase().includes(destinoPesquisa)
        );

      return destinoFinalMatch || escalaMatch;
    });
  }

  /* Filtro por tipo de turismo */
  if (searchCriteria.tipoTurismo && searchCriteria.tipoTurismo !== "Nenhum") {
    results = results.filter(
      (flight) =>
        flight.turismo &&
        flight.turismo.some((tipo) =>
          tipo.toLowerCase().includes(searchCriteria.tipoTurismo.toLowerCase())
        )
    );
  }

  /* Filtro por voo direto */
  if (searchCriteria.apenasVoosDiretos) {
    results = results.filter((flight) => flight.direto === true);
  }

  /* Filtro por data de partida */
  if (searchCriteria.dataPartida) {
    const dataLimite = new Date(searchCriteria.dataPartida);
    results = results.filter((flight) => {
      const dataVoo = parseFlightDate(flight.partida);
      return dataVoo >= dataLimite;
    });
  }

  /* Filtro por preço máximo */
  if (searchCriteria.precoMaximo) {
    results = results.filter(
      (flight) =>
        parseFloat(flight.custo) <= parseFloat(searchCriteria.precoMaximo)
    );
  }

  /* Filtro por tipo de viagem */
  if (searchCriteria.tripType) {
    results = results.filter((flight) => {
      if (searchCriteria.tripType === "so-ida") {
        /* Para só ida, aceitar voos sem tipoViagem ou com tipoViagem "ida" */
        return !flight.tipoViagem || flight.tipoViagem === "ida";
      } else if (searchCriteria.tripType === "ida-volta") {
        /* Para ida e volta, aceitar apenas voos com tipoViagem "ida-volta" */
        return flight.tipoViagem === "ida-volta";
      } else if (searchCriteria.tripType === "multitrip") {
        /* Para multitrip, aceitar voos com tipoViagem "multidestino" */
        return flight.tipoViagem === "multidestino";
      }
      return true;
    });
  }

  return results;
}

/* Função específica para encontrar voos com escalas entre duas cidades */
export function findFlightsWithStops(origem, destino, maxEscalas = 2) {
  const viagensComEscalas = [];

  viagens.forEach((flight) => {
    /* Verifica se a viagem conecta origem e destino */
    const origemMatch = flight.origem
      .toLowerCase()
      .includes(origem.toLowerCase());
    const destinoMatch = flight.destino
      .toLowerCase()
      .includes(destino.toLowerCase());

    if (origemMatch && destinoMatch) {
      const numEscalas = flight.segmentos.length - 1;
      if (numEscalas <= maxEscalas) {
        viagensComEscalas.push({
          ...flight,
          numEscalas: numEscalas,
          escalas: flight.segmentos.slice(0, -1).map((seg) => seg.destino),
        });
      }
    }
  });

  return viagensComEscalas;
}
/* Helper function to parse flight dates */
function parseFlightDate(dateStr) {
  /* Tratamento de diferentes formatos de data nos dados dos voos */
  if (!dateStr) return new Date();
  if (dateStr instanceof Date) return dateStr;

  /* Formato DD/MM/YYYY HH:MM */
  if (dateStr.includes("/")) {
    const [datePart, timePart] = dateStr.split(" ");
    const [day, month, year] = datePart.split("/");
    const [hour, minute] = timePart ? timePart.split(":") : ["0", "0"];
    return new Date(year, month - 1, day, hour, minute);
  }

  /* Formato ISO ou outro formato padrão */
  return new Date(dateStr);
}
/**
 * CLASSE QUE MODELA UMA VIAGEM NA APLICAÇÃO
 * @class Trip
 * @property {string} numeroVoo - Número único do voo
 * @property {string} origem - Aeroporto de origem (formato: "CODE - Cidade")
 * @property {string} destino - Aeroporto de destino final (formato: "CODE - Cidade")
 * @property {Array} segmentos - Array de segmentos de voo (para escalas)
 * @property {string} companhia - Companhia aérea principal
 * @property {string} partida - Data e hora de partida do primeiro segmento
 * @property {string} chegada - Data e hora de chegada do último segmento
 * @property {boolean} direto - Indica se o voo é direto (sem escalas)
 * @property {number} custo - Custo total do voo
 * @property {string} imagem - URL da imagem do destino
 * @property {string} dataVolta - Data de volta (se aplicável)
 * @property {Array} turismo - Tipos de turismo do destino
 * @description
 * Classe que representa uma viagem com suporte a escalas e multi-segmentos
 */
class Trip {
  numeroVoo = "";
  origem = "";
  destino = "";
  segmentos = [];
  companhia = "";
  partida = "";
  chegada = "";
  direto = true;
  custo = 0;
  imagem = "";
  dataVolta = "";
  turismo = [];
  tipoViagem = "ida-volta"; /* ida, ida-volta, multitrip */

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
    dataVolta,
    segmentos = null,
    turismo = [],
    tipoViagem = "ida-volta"
  ) {
    this.numeroVoo = numeroVoo;
    this.origem = origem;
    this.destino = destino;
    this.companhia = companhia;
    this.partida = partida;
    this.chegada = chegada;
    this.direto = direto === true || direto === "S" || direto === "Sim";
    this.custo = custo;
    this.imagem = imagem;
    this.dataVolta = dataVolta;
    this.turismo = Array.isArray(turismo) ? turismo : [];
    this.tipoViagem = tipoViagem || "ida-volta";

    /* Se não foram fornecidos segmentos, criar um segmento direto */
    if (!segmentos || segmentos.length === 0) {
      this.segmentos = [
        {
          numeroVoo: this.numeroVoo,
          origem: this.origem,
          destino: this.destino,
          companhia: this.companhia,
          partida: this.partida,
          chegada: this.chegada,
        },
      ];
    } else {
      this.segmentos = segmentos;
      /* Atualizar direto baseado no número de segmentos */
      this.direto = segmentos.length === 1;
    }
  }

  /* Método para obter todas as cidades da rota */
  getCidadesRota() {
    const cidades = [this.origem];
    this.segmentos.forEach((seg) => {
      if (!cidades.includes(seg.destino)) {
        cidades.push(seg.destino);
      }
    });
    return cidades;
  }

  /* Método para verificar se a viagem passa por uma cidade */
  passaPorCidade(cidade) {
    return this.getCidadesRota().some((c) =>
      c.toLowerCase().includes(cidade.toLowerCase())
    );
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

/* SEPARAÇÃO DE FILTROS UI DOS FILTROS DE DADOS */

/* Filtros aplicados pela interface do utilizador */
export function applyUIFilters(flights, uiFilters) {
  let filtered = [...flights];

  /* Filtro por preço mínimo/máximo */
  if (uiFilters.minPrice !== undefined && uiFilters.minPrice !== "") {
    filtered = filtered.filter(
      (flight) => parseFloat(flight.custo) >= parseFloat(uiFilters.minPrice)
    );
  }

  if (uiFilters.maxPrice !== undefined && uiFilters.maxPrice !== "") {
    filtered = filtered.filter(
      (flight) => parseFloat(flight.custo) <= parseFloat(uiFilters.maxPrice)
    );
  }

  /* Ordenação por data */
  if (uiFilters.sortDate) {
    filtered.sort((a, b) => {
      const dateA = parseFlightDate(a.partida);
      const dateB = parseFlightDate(b.partida);

      if (uiFilters.sortDate === "recent") {
        return dateA - dateB; /* Mais próxima primeiro */
      } else if (uiFilters.sortDate === "oldest") {
        return dateB - dateA; /* Mais distante primeiro */
      }
      return 0;
    });
  }

  /* Ordenação por preço */
  if (uiFilters.sortPrice) {
    filtered.sort((a, b) => {
      const priceA = parseFloat(a.custo);
      const priceB = parseFloat(b.custo);

      if (uiFilters.sortPrice === "price-asc") {
        return priceA - priceB; /* Mais barato primeiro */
      } else if (uiFilters.sortPrice === "price-desc") {
        return priceB - priceA; /* Mais caro primeiro */
      }
      return 0;
    });
  }

  return filtered;
}

/* Validação robusta de dependências entre modelos */
export function validateFlightData(flightData) {
  const errors = [];

  /* Validação básica */
  if (!flightData.numeroVoo) {
    errors.push("Número do voo é obrigatório");
  }

  if (!flightData.origem || !flightData.destino) {
    errors.push("Origem e destino são obrigatórios");
  }

  /* Validação de segmentos */
  if (flightData.segmentos && flightData.segmentos.length > 0) {
    flightData.segmentos.forEach((segmento, index) => {
      if (!segmento.origem || !segmento.destino) {
        errors.push(`Segmento ${index + 1}: origem e destino são obrigatórios`);
      }

      if (!segmento.partida || !segmento.chegada) {
        errors.push(
          `Segmento ${
            index + 1
          }: horários de partida e chegada são obrigatórios`
        );
      }
    });

    /* Validar continuidade entre segmentos */
    for (let i = 1; i < flightData.segmentos.length; i++) {
      const segmentoAnterior = flightData.segmentos[i - 1];
      const segmentoAtual = flightData.segmentos[i];

      if (segmentoAnterior.destino !== segmentoAtual.origem) {
        errors.push(
          `Segmento ${
            i + 1
          }: origem deve corresponder ao destino do segmento anterior`
        );
      }
    }
  }

  /* Validação de tipos de turismo */
  if (flightData.turismo && !Array.isArray(flightData.turismo)) {
    errors.push("Tipos de turismo devem ser fornecidos como array");
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
  };
}

/* Função utilitária para verificar se um voo passa por uma cidade */
export function flightPassesPorCidade(flight, cidade) {
  if (!flight || !cidade) return false;

  const cidadeLower = cidade.toLowerCase();

  /* Verificar origem e destino principal */
  const origemMatch =
    flight.origem && flight.origem.toLowerCase().includes(cidadeLower);
  const destinoMatch =
    flight.destino && flight.destino.toLowerCase().includes(cidadeLower);

  /* Verificar segmentos se existirem */
  let segmentosMatch = false;
  if (flight.segmentos && Array.isArray(flight.segmentos)) {
    segmentosMatch = flight.segmentos.some(
      (seg) =>
        (seg.origem && seg.origem.toLowerCase().includes(cidadeLower)) ||
        (seg.destino && seg.destino.toLowerCase().includes(cidadeLower))
    );
  }

  return origemMatch || destinoMatch || segmentosMatch;
}
