/* Importação de helpers e modelos necessários para a renderização dos componentes e manipulação dos dados das viagens */
import { loadComponent } from "./ViewHelpers.js";
import * as Flight from "../models/FlightModel.js";

/* Importa apenas a função de renderização dos cards do FlightView */
import { renderRandomOPOCards as _renderRandomOPOCards } from "./FlightView.js";

/* Tradução dos tipos de turismo para apresentação nos cards */
const TURISMO_LABELS = {
  TurismodeSolePraia: "Turismo de Sol e Praia",
  Turismoreligioso: "Turismo Religioso",
  TurismoUrbano: "Turismo Urbano",
  Turismogastronomico: "Turismo Gastronómico",
  Turismocultural: "Turismo Cultural",
  Turismorural: "Turismo Rural",
  Turismodenegocios: "Turismo de negócios",
  SaudeeBemEstar: "Saúde e Bem-estar",
  Ecourismo: "Ecoturismo",
};

/* Dados dos tipos de turismo */
const TURISMO_CARDS = [
  {
    key: "TurismodeSolePraia",
    label: "Sol e Praia",
    img: "../img/tipos-turismo/praia.png",
  },
  {
    key: "TurismoUrbano",
    label: "Turismo Urbano",
    img: "../img/tipos-turismo/urbano.png",
  },
  {
    key: "Turismogastronomico",
    label: "Turismo Gastronómico",
    img: "../img/tipos-turismo/Gastronómico.png",
  },
  {
    key: "Turismocultural",
    label: "Turismo Cultural",
    img: "../img/tipos-turismo/Cultural.png",
  },
  {
    key: "SaudeeBemEstar",
    label: "Saúde e Bem-estar",
    img: "../img/tipos-turismo/bem-estar.png",
  },
  {
    key: "Ecoturismo",
    label: "Ecoturismo",
    img: "../img/tipos-turismo/Eco.png",
  },
  {
    key: "Turismorural",
    label: "Turismo Rural",
    img: "../img/tipos-turismo/Rural.png",
  },
  {
    key: "Turismoreligioso",
    label: "Turismo Religioso",
    img: "../img/tipos-turismo/Religioso.png",
  },
  {
    key: "Turismodenegocios",
    label: "Turismo de Negócios",
    img: "../img/tipos-turismo/negocios.png",
  },
];

// Função para obter todas as viagens de um tipo de turismo
function getAllTripsForTipoTurismo(tipoTurismo) {
  return Flight.getTripsByTurismo(tipoTurismo);
}

// Função para filtrar e ordenar viagens
function filterAndSortTrips(
  trips,
  { sortDate, sortPrice, minPrice, maxPrice }
) {
  let filtered = [...trips];

  // Filtrar por preço mínimo/máximo
  if (minPrice !== "" && !isNaN(Number(minPrice))) {
    filtered = filtered.filter((v) => Number(v.custo) >= Number(minPrice));
  }
  if (maxPrice !== "" && !isNaN(Number(maxPrice))) {
    filtered = filtered.filter((v) => Number(v.custo) <= Number(maxPrice));
  }

  // Ordenar por data
  if (sortDate === "recent" || sortDate === "oldest") {
    filtered.sort((a, b) => {
      // Assume formato "dd/mm/yyyy ..." para partida
      const parseDate = (str) => {
        if (!str) return new Date(0);
        const [d, m, yRest] = str.split("/");
        const [y] = yRest ? yRest.split(" ") : [""];
        return new Date(`${y}-${m}-${d}`);
      };
      const dateA = parseDate(a.partida);
      const dateB = parseDate(b.partida);
      // "recent": mais próxima da data atual primeiro (crescente)
      // "oldest": mais distante primeiro (decrescente)
      return sortDate === "recent" ? dateA - dateB : dateB - dateA;
    });
  }

  // Ordenar por preço
  if (sortPrice === "price-asc") {
    filtered.sort((a, b) => Number(a.custo) - Number(b.custo));
  } else if (sortPrice === "price-desc") {
    filtered.sort((a, b) => Number(b.custo) - Number(a.custo));
  }

  return filtered;
}

// Renderiza os cards das viagens filtradas
function renderFilteredCardsFromList(viagens, tipoTurismo) {
  const container = document.querySelector(".card-viagens");
  if (!container) return;
  container.innerHTML = "";
  if (!viagens.length) {
    container.innerHTML = `<div class="col-span-full text-center text-gray-500 py-10">Nenhuma viagem encontrada.</div>`;
    return;
  }
  viagens.forEach((viagem) => {
    const cidade = viagem.destino || "Destino";
    const formatarData = (dataStr) => {
      if (!dataStr) return "";
      const [dia, mes, anoHora] = dataStr.split("/");
      const [ano, hora] = anoHora.split(" ");
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
      return `${dia} ${meses[parseInt(mes, 10) - 1]}`;
    };
    const dataPartida = formatarData(viagem.partida);
    const dataVolta = formatarData(viagem.dataVolta);
    const datas =
      dataPartida && dataVolta ? `${dataPartida} - ${dataVolta}` : "";
    const preco = viagem.custo || "-";
    const imagem = viagem.imagem || "https://placehold.co/413x327";
    const nVoo = viagem.numeroVoo || "AF151";
    const turismoPills = Array.isArray(viagem.turismo)
      ? viagem.turismo
          .map((tipo) => {
            const nome = TURISMO_LABELS[tipo] || tipo;
            return `
                <span class="bg-Main-Secondary text-white text-xs font-semibold rounded-full px-3 py-1 mr-1 mb-1 shadow-sm whitespace-nowrap" style="backdrop-filter: blur(2px); opacity: 0.95;">
                  ${nome}
                </span>
              `;
          })
          .join("")
      : "";

    container.innerHTML += `
      <div class="bg-white dark:bg-gray-800 w-full relative rounded-lg shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)] border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="relative w-full h-80">
          <img class="w-full h-80 object-cover" src="${imagem}" alt="Imagem do destino">
          <div class="absolute bottom-2 right-2 flex flex-wrap justify-end items-end gap-1 z-10">
            ${turismoPills}
          </div>
        </div>
        <div class="p-4">
          <p class="text-Text-Body dark:text-gray-100 text-2xl font-bold font-['Space_Mono'] mb-2">${cidade}</p>
          <div class="inline-flex">
            <span class="material-symbols-outlined text-Text-Subtitles dark:text-gray-300">calendar_month</span>
            <p class="text-Text-Subtitles dark:text-gray-300 align-bottom font-normal font-['IBM_Plex_Sans'] mb-4">${datas}</p>
          </div>
          <p class="text-Button-Main dark:text-cyan-400 text-3xl font-bold font-['IBM_Plex_Sans']">${preco} €</p>
          <p class="justify-start text-Text-Subtitles dark:text-gray-300 text-xs font-light font-['IBM_Plex_Sans'] leading-none">Transporte para 1 pessoa</p>
          <a href="flight_itinerary.html?id=${nVoo}" class="absolute bottom-4 right-4 h-8 px-2.5 py-3.5 bg-Main-Secondary dark:bg-cyan-800 rounded-lg  inline-flex justify-center items-center gap-2.5 text-white text-base font-bold font-['Space_Mono'] hover:bg-Main-Primary dark:hover:bg-cyan-600 transition duration-300 ease-in-out">Ver oferta</a>
          <span 
            class="absolute top-4 right-6 material-symbols-outlined text-red-500 cursor-pointer transition-all duration-300 ease-in-out favorite-icon"
            data-favorito="false" 
          >favorite</span>
        </div>
      </div>
    `;
  });
  // Ativa/desativa favorito ao clicar no ícone
  container.querySelectorAll(".favorite-icon").forEach((icon) => {
    const initialIsFav = icon.getAttribute("data-favorito") === "true";
    icon.style.fontVariationSettings = initialIsFav ? "'FILL' 1" : "'FILL' 0";
    icon.addEventListener("click", function () {
      const currentIsFav = this.getAttribute("data-favorito") === "true";
      const newIsFav = !currentIsFav;
      this.setAttribute("data-favorito", String(newIsFav));
      this.style.fontVariationSettings = newIsFav ? "'FILL' 1" : "'FILL' 0";
      this.classList.add("scale-110");
      setTimeout(() => this.classList.remove("scale-110"), 150);
    });
  });
}

// Renderiza a barra de tipos de turismo
function renderTourismTypesBar() {
  const bar = document.getElementById("tourism-types-bar");
  if (!bar) return;
  bar.innerHTML = TURISMO_CARDS.map(
    (t) => `
    <div onclick="window.location.href='turism.html?turismo=${t.key}'"
      class="w-[120px] h-32 relative rounded-lg overflow-hidden flex-shrink-0 cursor-pointer group transition-transform hover:scale-105 shadow-md bg-white">
      <img
        draggable="false"
        class="absolute inset-0 w-full h-full object-cover"
        src="${t.img}"
        alt="${t.label}"
      />
      <div class="absolute left-4 bottom-4 text-white text-sm font-bold font-['Space_Mono'] drop-shadow-lg">
        ${t.label}
      </div>
    </div>
  `
  ).join("");
}

// Obtém o tipo de turismo da query string
function getTipoTurismoFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("turismo") || "";
}

// Função para ler os valores dos filtros
function getFilterValues() {
  return {
    sortDate: document.getElementById("sort-date")?.value || "",
    sortPrice: document.getElementById("sort-price")?.value || "",
    minPrice: document.getElementById("min-price")?.value || "",
    maxPrice: document.getElementById("max-price")?.value || "",
  };
}

// Função principal para aplicar filtros e renderizar
function applyFiltersAndRender(tipoTurismo) {
  const allTrips = getAllTripsForTipoTurismo(tipoTurismo);
  const filters = getFilterValues();
  const filteredTrips = filterAndSortTrips(allTrips, filters);
  renderFilteredCardsFromList(filteredTrips, tipoTurismo);
}

// Adiciona listeners aos filtros
function setupFilterListeners(tipoTurismo) {
  ["sort-date", "sort-price", "min-price", "max-price"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("change", () => applyFiltersAndRender(tipoTurismo));
      el.addEventListener("input", () => applyFiltersAndRender(tipoTurismo));
    }
  });
  // Botão "Limpar Filtros"
  const btn = document.getElementById("clear-filters");
  if (btn) {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      // Limpa os filtros
      const sortDate = document.getElementById("sort-date");
      const sortPrice = document.getElementById("sort-price");
      const minPrice = document.getElementById("min-price");
      const maxPrice = document.getElementById("max-price");
      if (sortDate) sortDate.value = "";
      if (sortPrice) sortPrice.value = "";
      if (minPrice) minPrice.value = "";
      if (maxPrice) maxPrice.value = "";
      applyFiltersAndRender(tipoTurismo);
    });
  }
}

// Carrega componentes e inicializa dados ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
  loadComponent("../html/_slider.html", "slider-placeholder");
  Flight.init();
  const tipoTurismo = getTipoTurismoFromURL();
  if (tipoTurismo) {
    applyFiltersAndRender(tipoTurismo);
    // Atualiza o título
    const title = document.getElementById("tourism-title");
    if (title) {
      title.textContent = TURISMO_LABELS[tipoTurismo] || "Turismo";
    }
    setupFilterListeners(tipoTurismo);
  }
  renderTourismTypesBar();
});
