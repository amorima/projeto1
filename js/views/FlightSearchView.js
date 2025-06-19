import * as Flight from "../models/FlightModel.js";
import * as User from "../models/UserModel.js";
import { showToast } from "./ViewHelpers.js";
import { getDestinationByCity } from "../models/DestinationModel.js";
// Objeto global para todos os filtros e ordenação
let filters = {
  origem: "",
  destino: "",
  tipoTurismo: "",
  acessibilidade: "",
  dataPartida: "",
  dataRegresso: "",
  adultos: 1,
  criancas: 0,
  bebes: 0,
  minPrice: 0,
  maxPrice: Infinity,
  sortDate: "",
  sortPrice: "",
};
// Preenche os campos do topo da página de pesquisa com os dados vindos do sessionStorage
function preencherCamposPesquisa() {
  const params = sessionStorage.getItem("planit_search");
  if (!params) return null;
  const dados = JSON.parse(params);

  // Origem
  const origemBtn = document.querySelector("#btn-open p");
  if (origemBtn && dados.origem) {
    const origemText = dados.origem.cidade
      ? `${dados.origem.codigo || "XXX"} - ${dados.origem.cidade}`
      : dados.origem;
    origemBtn.textContent = origemText;
    /* Atualizar filtro global */
    filters.origem = origemText;
  }

  // Destino
  const destinoBtn = document.querySelector("#btn-destino p");
  if (destinoBtn && dados.destino) {
    const destinoText = dados.destino.cidade
      ? `${dados.destino.codigo || "XXX"} - ${dados.destino.cidade}`
      : dados.destino;
    destinoBtn.textContent = destinoText;
    /* Atualizar filtro global */
    filters.destino = destinoText;
  }

  // Caso o destino seja um div (como no HTML), procurar pelo texto
  const destinoDiv =
    document.querySelector('div[aria-label="destino"] p') ||
    document.querySelectorAll("form > div")[0]?.querySelector("p");
  if (destinoDiv && dados.destino) {
    const destinoText = dados.destino.cidade
      ? `${dados.destino.codigo || "XXX"} - ${dados.destino.cidade}`
      : dados.destino;
    destinoDiv.textContent = destinoText;
    /* Atualizar filtro global se não foi feito antes */
    if (!filters.destino) {
      filters.destino = destinoText;
    }
  } // Datas e viajantes
  const btnDatas = document.getElementById("btn-datas");
  if (btnDatas && dados.dataPartida) {
    /* Seleciona especificamente os elementos dentro do botão btn-datas */
    const datasP = btnDatas.querySelector("div:first-child p");
    const dataText =
      dados.tripType === "ida"
        ? dados.dataPartida
        : dados.tripType === "multitrip"
        ? "Multitrip"
        : `${dados.dataPartida} - ${dados.dataRegresso || ""}`;
    if (datasP) datasP.textContent = dataText;

    const viajantesP = btnDatas.querySelector("div:nth-child(2) p");
    const viajantes =
      (dados.adultos || 1) + (dados.criancas || 0) + (dados.bebes || 0);
    if (viajantesP)
      viajantesP.textContent = `${viajantes} Viajante${
        viajantes > 1 ? "s" : ""
      }`;

    /* Atualizar filtros globais */
    filters.dataPartida = dados.dataPartida || "";
    filters.dataRegresso = dados.dataRegresso || "";
    filters.adultos = dados.adultos || 1;
    filters.criancas = dados.criancas || 0;
    filters.bebes = dados.bebes || 0;
  }

  // Tipo de turismo
  const tipoTurismoP = document.getElementById("texto-tipo-turismo");
  if (tipoTurismoP && dados.tipoTurismo) {
    const tipoText = dados.tipoTurismo.nome
      ? dados.tipoTurismo.nome
      : dados.tipoTurismo;
    tipoTurismoP.textContent = tipoText !== "Nenhum" ? tipoText : "Nenhum";
    /* Atualizar filtro global */
    filters.tipoTurismo = tipoText;
  } // Acessibilidade - Don't set directly here, let the DOMContentLoaded handler set it properly
  // The accessibility button will be updated after processing the indices

  // Tipo de viagem
  const tipoViagemP = document.getElementById("texto-tipo-viagem");
  if (tipoViagemP && dados.tripType) {
    const tripTypeText =
      dados.tripType === "so-ida"
        ? "Só Ida"
        : dados.tripType === "ida-volta"
        ? "Ida e Volta"
        : dados.tripType === "multitrip"
        ? "Multitrip"
        : "Ida e Volta";
    tipoViagemP.textContent = tripTypeText;
  }
  // Show/hide multitrip container based on trip type
  const multitripContainer = document.getElementById("multitrip-container");
  if (multitripContainer) {
    if (dados.tripType === "multitrip" && dados.multitripSegments) {
      multitripContainer.classList.remove("hidden");
      renderMultitripSegments();
    } else {
      multitripContainer.classList.add("hidden");
    }
  }
  return dados;
}
/**
 * Renderiza cards de voos.
 * @param {Array} filteredFlights - Lista de voos filtrados (opcional).
 * @param {Object} planitFilter - Filtros vindos do formulário PlanIt (opcional, pode ser null).
 * @param {number} maxCards - Número máximo de cards a renderizar (default: 18).
 */
function renderFlightCards(maxCards = 18) {
  // Get search data from sessionStorage if available
  const searchData = sessionStorage.getItem("planit_search");
  let flights = Flight.getAll();

  // Apply search filters from PlanIt form if available
  if (searchData) {
    const parsedSearchData = JSON.parse(searchData);
    flights = Flight.filterFlights(parsedSearchData);
  } // Apply additional UI filters
  flights = flights.filter((flight) => {
    let match = true;

    // Origem filter (from UI)
    if (
      filters.origem &&
      filters.origem !== "Qualquer" &&
      filters.origem !== "Nenhum" &&
      filters.origem !== "Origem" &&
      flight.origem
    ) {
      /* Usar correspondência exata por código do aeroporto */
      const filtroOrigem = filters.origem.trim().toLowerCase();
      const origemVoo = flight.origem.trim().toLowerCase();

      /* Extrair código do aeroporto do filtro */
      const codigoFiltro = filtroOrigem.split(" - ")[0];

      /* Verificar se o voo começa com o mesmo código */
      const origemMatch = origemVoo.startsWith(codigoFiltro + " -");
      match = match && origemMatch;
    }

    // Destino filter (from UI)
    if (
      filters.destino &&
      filters.destino !== "Qualquer" &&
      filters.destino !== "Nenhum" &&
      filters.destino !== "Destino" &&
      flight.destino
    ) {
      /* Usar correspondência exata por código do aeroporto */
      const filtroDestino = filters.destino.trim().toLowerCase();
      const destinoVoo = flight.destino.trim().toLowerCase();

      /* Extrair código do aeroporto do filtro */
      const codigoFiltro = filtroDestino.split(" - ")[0];

      /* Verificar se o voo começa com o mesmo código */
      const destinoMatch = destinoVoo.startsWith(codigoFiltro + " -");
      match = match && destinoMatch;
    }    // Date filters (from UI)
    if (filters.dataPartida && flight.partida) {
      const filtroData = new Date(filters.dataPartida);
      const dataVoo = new Date(
        flight.partida.split(" ")[0].split("/").reverse().join("-")
      );
      if (dataVoo < filtroData) match = false;
    }
    if (filters.dataRegresso && flight.dataVolta) {
      const filtroData = new Date(filters.dataRegresso);
      const dataVoo = new Date(
        flight.dataVolta.split(" ")[0].split("/").reverse().join("-")
      );
      if (dataVoo > filtroData) match = false;
    }

    // Tourism type filter (from UI)
    if (filters.tipoTurismo && filters.tipoTurismo.trim() !== "" && filters.tipoTurismo !== "Nenhum") {
      if (flight.turismo && Array.isArray(flight.turismo)) {
        const filterTourism = filters.tipoTurismo.toLowerCase();
        const hasTourismMatch = flight.turismo.some(turismo => 
          turismo.toLowerCase().includes(filterTourism)
        );
        if (!hasTourismMatch) match = false;
      } else {
        // If flight has no tourism type info and we're filtering for tourism type, exclude it
        match = false;
      }
    }

    // Accessibility filter (from UI) - match against destination accessibility
    if (filters.acessibilidade && 
        ((typeof filters.acessibilidade === 'string' && filters.acessibilidade.trim() !== "" && filters.acessibilidade !== "Nenhum") ||
         (Array.isArray(filters.acessibilidade) && filters.acessibilidade.length > 0))) {
      
      // Get destination data to check accessibility
      const destinos = JSON.parse(localStorage.getItem("destinos")) || [];
      
      // Extract city name from flight destination (e.g., "LIS - Lisboa" -> "Lisboa")
      const destinoCity = flight.destino ? flight.destino.split(" - ")[1] : "";
      
      if (destinoCity) {
        // Find the destination data
        const destinoData = destinos.find(dest => 
          dest.cidade && dest.cidade.toLowerCase() === destinoCity.toLowerCase()
        );
        
        if (destinoData && destinoData.acessibilidade) {
          // Handle both string and array cases for filters.acessibilidade
          let filterAccessibilities = [];
          if (typeof filters.acessibilidade === 'string') {
            filterAccessibilities = filters.acessibilidade.split(',').map(acc => acc.trim().toLowerCase());
          } else if (Array.isArray(filters.acessibilidade)) {
            filterAccessibilities = filters.acessibilidade.map(acc => acc.toString().toLowerCase());
          }
          
          const destinoAccessibilities = Array.isArray(destinoData.acessibilidade) 
            ? destinoData.acessibilidade 
            : [destinoData.acessibilidade];
          
          const hasMatchingAccessibility = filterAccessibilities.some(filterAcc => 
            destinoAccessibilities.some(destAcc => 
              destAcc.toLowerCase().includes(filterAcc)
            )
          );
          
          if (!hasMatchingAccessibility) match = false;
        } else {
          // If destination has no accessibility info and we're filtering for accessibility, exclude it
          match = false;
        }
      } else {
        // If we can't extract destination city, exclude the flight
        match = false;
      }
    }

    // Price filter (from UI)
    const preco = parseFloat(flight.custo) || 0;
    if (
      preco < (filters.minPrice || 0) ||
      preco > (filters.maxPrice || Infinity)
    )
      match = false;
    return match;
  });
  // Ordenação
  if (filters.sortDate === "recent") {
    flights.sort((a, b) => new Date(b.partida) - new Date(a.partida));
  } else if (filters.sortDate === "oldest") {
    flights.sort((a, b) => new Date(a.partida) - new Date(b.partida));
  }
  if (filters.sortPrice === "price-asc") {
    flights.sort((a, b) => Number(a.custo) - Number(b.custo));
  } else if (filters.sortPrice === "price-desc") {
    flights.sort((a, b) => Number(b.custo) - Number(a.custo));
  } // Limitar o número de cards
  flights = flights.slice(0, maxCards);
  const container = document.querySelector(".card-viagens");
  if (!container) {
    return;
  }
  container.innerHTML = "";
  if (!flights.length) {
    container.innerHTML = `<div class="col-span-full text-center text-gray-500 py-10">Nenhuma viagem encontrada.</div>`;
    return;
  }
  // Função para formatar datas no estilo homepage
  const formatarData = (dataStr) => {
    if (!dataStr) return "";
    const [dia, mes, anoHora] = dataStr.split("/");
    if (!anoHora) return dataStr;
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
  flights.forEach((flight) => {
    const {
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
    } = flight; // Extrair a cidade do destino (remove o código do aeroporto se presente)
    const cidadeDestino = destino?.split(" - ").pop() || destino;
    const cidade = cidadeDestino || "Destino";
    const dataPartida = formatarData(partida);
    const dataRegresso = formatarData(dataVolta);
    const datas =
      dataPartida && dataRegresso
        ? `${dataPartida} - ${dataRegresso}`
        : dataPartida;
    const preco = custo || "-";
    const nVoo = numeroVoo || "AF151";

    // Prioriza a imagem do destino carregada pelo admin.
    let imgSrc = "";
    const destinoEncontrado = getDestinationByCity(cidadeDestino);

    if (destinoEncontrado && destinoEncontrado.imagem) {
      imgSrc = destinoEncontrado.imagem;
    } else if (imagem) {
      // Fallback para a imagem do voo (se existir)
      imgSrc = imagem;
    } else {
      // Fallback para uma imagem de diretório padrão
      imgSrc = `/img/destinos/${cidadeDestino}/1.jpg`;
    }

    const card = document.createElement("div");
    card.className =
      "bg-white dark:bg-gray-800 w-full relative rounded-lg shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)] border border-gray-200 dark:border-gray-700 overflow-hidden";
    card.innerHTML = `
      <img class="w-full h-80 object-cover" src="${imgSrc}" alt="Imagem do destino" onerror="this.onerror=null;this.src='https://placehold.co/413x327';">
      <div class="p-4">
        <p class="text-Text-Body dark:text-gray-100 text-2xl font-bold font-['Space_Mono'] mb-2">${cidade}</p>
        <div class="inline-flex">
          <span class="material-symbols-outlined text-Text-Subtitles dark:text-gray-300">calendar_month</span>
          <p class="text-Text-Subtitles dark:text-gray-300 align-bottom font-normal font-['IBM_Plex_Sans'] mb-4">${datas}</p>
        </div>
        <p class="text-Button-Main dark:text-cyan-400 text-3xl font-bold font-['IBM_Plex_Sans']">${preco} €</p>
        <p class="justify-start text-Text-Subtitles dark:text-gray-300 text-xs font-light font-['IBM_Plex_Sans'] leading-none">Transporte para 1 pessoa</p>
        <a href="flight_itinerary.html?id=${nVoo}" class="ver-oferta absolute bottom-4 right-4 h-8 px-2.5 py-3.5 bg-Main-Secondary dark:bg-cyan-800 rounded-lg  inline-flex justify-center items-center gap-2.5 text-white text-base font-bold font-['Space_Mono'] hover:bg-Main-Primary dark:hover:bg-cyan-600 transition duration-300 ease-in-out">Ver oferta</a>
        <span class="absolute top-4 right-6 material-symbols-outlined text-red-500 cursor-pointer transition-all duration-300 ease-in-out favorite-icon" data-favorito="false">favorite</span>
      </div>
    `;
    container.appendChild(card);
    // Now add the event listener to the heart icon inside this card
    const heart = card.querySelector(".favorite-icon");
    if (heart) {
      // Set initial fill state based on whether this trip is a favorite
      let isFav = false;
      if (User.isLogged()) {
        const user = User.getUserLogged();
        isFav =
          user.favoritos &&
          user.favoritos.some(
            (fav) =>
              (fav.numeroVoo && fav.numeroVoo === flight.numeroVoo) ||
              (fav.nVoo && fav.nVoo === flight.numeroVoo) ||
              (fav.numeroVoo && fav.numeroVoo === flight.nVoo) ||
              (fav.nVoo && fav.nVoo === flight.nVoo)
          );
      }
      heart.setAttribute("data-favorito", isFav ? "true" : "false");
      heart.style.fontVariationSettings = isFav ? "'FILL' 1" : "'FILL' 0";
      heart.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!User.isLogged()) {
          showToast("Faça login para adicionar aos favoritos", "error");
          window.location.href = "_login.html";
          return;
        }
        const user = User.getUserLogged();
        const currentlyFav = heart.getAttribute("data-favorito") === "true";
        if (currentlyFav) {
          User.removeFavorite(user, flight);
          heart.setAttribute("data-favorito", "false");
          heart.style.fontVariationSettings = "'FILL' 0";
          showToast("Removido dos favoritos", "success");
        } else {
          User.addFavorite(user, flight);
          heart.setAttribute("data-favorito", "true");
          heart.style.fontVariationSettings = "'FILL' 1";
          showToast("Adicionado aos favoritos", "success");
        }
        heart.classList.add("scale-110");
        setTimeout(() => heart.classList.remove("scale-110"), 150);
      });
    }
  });
}
// --- Filtros de pesquisa de voos ---
function setupFlightFilters() {
  const sortDate = document.getElementById("sort-date");
  const sortPrice = document.getElementById("sort-price");
  const minPrice = document.getElementById("min-price");
  const maxPrice = document.getElementById("max-price");
  const clearFiltersBtn = document.getElementById("clear-filters-btn");
  function updateAndRender() {
    filters.minPrice = parseFloat(minPrice?.value) || 0;
    filters.maxPrice = parseFloat(maxPrice?.value) || Infinity;
    filters.sortDate = sortDate?.value || "";
    filters.sortPrice = sortPrice?.value || "";
    renderFlightCards();
  }
  if (sortDate) sortDate.addEventListener("change", updateAndRender);
  if (sortPrice) sortPrice.addEventListener("change", updateAndRender);
  if (minPrice) minPrice.addEventListener("input", updateAndRender);
  if (maxPrice) maxPrice.addEventListener("input", updateAndRender);
  // Clear filters functionality
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener("click", () => {
      // Reset all filter values
      if (sortDate) sortDate.value = "";
      if (sortPrice) sortPrice.value = "";
      if (minPrice) minPrice.value = "";
      if (maxPrice) maxPrice.value = "";
      // Reset filter object
      filters.minPrice = 0;
      filters.maxPrice = Infinity;
      filters.sortDate = "";
      filters.sortPrice = "";
      // Reset search form buttons to default values
      const origemBtn = document.querySelector("#btn-open p");
      const destinoBtn = document.querySelector("#btn-destino p");
      const tipoTurismoText = document.getElementById("texto-tipo-turismo");
      const acessibilidadeText = document.getElementById(
        "texto-acessibilidade"
      );
      const tipoViagemText = document.getElementById("texto-tipo-viagem");
      if (origemBtn) origemBtn.textContent = "Origem";
      if (destinoBtn) destinoBtn.textContent = "Destino";
      if (tipoTurismoText) tipoTurismoText.textContent = "Nenhum";
      if (acessibilidadeText) acessibilidadeText.textContent = "Nenhum";
      if (tipoViagemText) tipoViagemText.textContent = "Ida e Volta";
      // Reset dates and travelers button
      const btnDatas = document.getElementById("btn-datas");
      if (btnDatas) {
        const datasP = btnDatas.querySelector("div:nth-child(1) p");
        const viajantesP = btnDatas.querySelector("div:nth-child(2) p");
        if (datasP) datasP.textContent = "Datas";
        if (viajantesP) viajantesP.textContent = "Viajantes";
      }
      // Reset filters object
      filters.origem = "";
      filters.destino = "";
      filters.tipoTurismo = "";
      filters.acessibilidade = "";
      filters.dataPartida = "";
      filters.dataRegresso = "";
      filters.adultos = 1;
      filters.criancas = 0;
      filters.bebes = 0;
      // Hide multitrip container
      const multitripContainer = document.getElementById("multitrip-container");
      if (multitripContainer) {
        multitripContainer.classList.add("hidden");
      }
      // Clear sessionStorage
      sessionStorage.removeItem("planit_search");
      // Reset Flight model state
      if (Flight.resetState) {
        Flight.resetState();
      }
      // Re-render with all flights
      renderFlightCards();
      showToast("Filtros limpos!", "info");
    });
  }
  updateAndRender();
}
function setupModalButtons() {
  const btnOrigem = document.getElementById("btn-open");
  if (btnOrigem) {
    btnOrigem.addEventListener("click", (e) => {
      e.preventDefault();
      abrirModalOrigem();
    });
  }
  const btnDestino = document.getElementById("btn-destino");
  if (btnDestino) {
    btnDestino.addEventListener("click", (e) => {
      e.preventDefault();
      abrirModalDestino();
    });
  }
  const btnDatas = document.getElementById("btn-datas");
  if (btnDatas) {
    btnDatas.addEventListener("click", (e) => {
      e.preventDefault();
      abrirModalDatas();
    });
  }
  const btnAcessibilidade = document.getElementById("btn-acessibilidade");
  if (btnAcessibilidade) {
    btnAcessibilidade.addEventListener("click", (e) => {
      e.preventDefault();
      abrirModalAcessibilidade();
    });
  }
  const btnTipoTurismo = document.getElementById("btn-tipo-turismo");
  if (btnTipoTurismo) {
    btnTipoTurismo.addEventListener("click", (e) => {
      e.preventDefault();
      abrirModalTipoTurismo();
    });
  }
  const btnTipoViagem = document.getElementById("btn-tipo-viagem");
  if (btnTipoViagem) {
    btnTipoViagem.addEventListener("click", (e) => {
      e.preventDefault();
      abrirModalTipoViagem();
    });
  }
}
// --- Inicialização principal ---
function pararScroll() {
  document.body.classList.add("modal-aberto");
}
function deixarScroll() {
  document.body.classList.remove("modal-aberto");
}
document.addEventListener("DOMContentLoaded", () => {
  Flight.init();
  User.init();
  // Fill search fields from sessionStorage
  const planitFilter = preencherCamposPesquisa(); // Update filters from search data or UI
  if (planitFilter) {
    // Update filters from search data - usar formato completo "CÓDIGO - Cidade"
    filters.origem =
      planitFilter.origem && planitFilter.origem.cidade
        ? `${planitFilter.origem.codigo || "XXX"} - ${
            planitFilter.origem.cidade
          }`
        : "";
    filters.destino =
      planitFilter.destino && planitFilter.destino.cidade
        ? `${planitFilter.destino.codigo || "XXX"} - ${
            planitFilter.destino.cidade
          }`
        : "";
    filters.tipoTurismo =
      planitFilter.tipoTurismo && planitFilter.tipoTurismo.nome
        ? planitFilter.tipoTurismo.nome
        : ""; // Handle accessibility data - could be names (strings) or indices (numbers)
    if (
      Array.isArray(planitFilter.acessibilidade) &&
      planitFilter.acessibilidade.length > 0
    ) {
      const allAccessibilities = Flight.getAccessibilities();
      let accessibilityIndices = [];

      // Check if the data contains indices (numbers) or names (strings)
      if (typeof planitFilter.acessibilidade[0] === "number") {
        // Data already contains indices
        accessibilityIndices = planitFilter.acessibilidade;
      } else {
        // Data contains accessibility names, convert to indices
        planitFilter.acessibilidade.forEach((accName) => {
          const index = allAccessibilities.findIndex((acc) => acc === accName);
          if (index !== -1) {
            accessibilityIndices.push(index);
          }
        });
      }

      // Set the selected accessories in FlightModel
      Flight.clearSelectedAccessibilities(); // Clear current selection
      accessibilityIndices.forEach((index) =>
        Flight.toggleAccessibility(index)
      );
      Flight.confirmAccessibilities(); // Save to localStorage

      // Get the actual accessibility names for filters
      const accessibilityNames = accessibilityIndices
        .map((index) => allAccessibilities[index])
        .filter((name) => name);
      filters.acessibilidade = accessibilityNames.join(", ");

      // Update accessibility button to show the correct text
      updateAccessibilityButton();
    } else {
      filters.acessibilidade = "";
    }
    filters.dataPartida = planitFilter.dataPartida || "";
    filters.dataRegresso = planitFilter.dataRegresso || "";
    filters.adultos = planitFilter.adultos || 1;
    filters.criancas = planitFilter.criancas || 0;
    filters.bebes = planitFilter.bebes || 0;
    // Update date button if dates are available
    if (planitFilter.dataPartida) {
      const adultos = planitFilter.adultos || 1;
      const criancas = planitFilter.criancas || 0;
      const bebes = planitFilter.bebes || 0;
      updateDatesButton(
        planitFilter.dataPartida,
        planitFilter.dataRegresso,
        adultos,
        criancas,
        bebes
      );
    }
  } else {
    // Fallback to reading from UI elements
    filters.origem =
      document.querySelector("#btn-open p")?.textContent.trim() || "";
    filters.destino =
      document.querySelector("#btn-destino p")?.textContent.trim() || "";
    filters.tipoTurismo =
      document
        .getElementById("texto-tipo-turismo")
        ?.textContent.trim()
        .replace(/\s+/g, "") || "";
    filters.acessibilidade =
      document.getElementById("texto-acessibilidade")?.textContent.trim() || "";
    // Get dates and travelers from Flight model if available
    if (typeof Flight !== "undefined" && Flight.getDatesTravelers) {
      const dt = Flight.getDatesTravelers();
      filters.dataPartida = dt.dataPartida;
      filters.dataRegresso = dt.dataRegresso;
      filters.adultos = dt.adultos;
      filters.criancas = dt.criancas;
      filters.bebes = dt.bebes;
    }
    // Update accessibility button to reflect any saved selections
    updateAccessibilityButton();
  }
  // Render initial flight cards with any available filters
  renderFlightCards();
  // Setup filters and modal buttons
  setupFlightFilters();
  setupModalButtons();
  setupTripTypeButtons(); // Setup multitrip functionality
  // Prevent default form submission to avoid page reload
  const form = document.querySelector("form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      // Re-render cards when form is submitted
      renderFlightCards();
    });
  }
});
// --- Trip type functions ---
function setupTripTypeButtons() {
  const btnTipoViagem = document.getElementById("btn-tipo-viagem");
  const multitripContainer = document.getElementById("multitrip-container");
  const btnAddSegment = document.getElementById("btn-add-segment");
  if (!btnTipoViagem) return;
  // Set default trip type
  Flight.setTripType("ida-volta");
  // Trip type button handler - opens modal
  btnTipoViagem.addEventListener("click", (e) => {
    e.preventDefault();
    abrirModalTipoViagem();
  });
  // Add segment button handler
  if (btnAddSegment) {
    btnAddSegment.addEventListener("click", (e) => {
      e.preventDefault();
      Flight.addMultitripSegment();
      renderMultitripSegments();
    });
  }
}
function renderMultitripSegments() {
  const segmentsContainer = document.getElementById("multitrip-segments");
  if (!segmentsContainer) return;
  const segments = Flight.getMultitripSegments();
  segmentsContainer.innerHTML = "";
  segments.forEach((segment, index) => {
    const segmentDiv = document.createElement("div");
    segmentDiv.className =
      "flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg";
    segmentDiv.innerHTML = `
      <span class="font-medium text-Main-Primary dark:text-cyan-400">${
        index + 1
      }.</span>
      <button type="button" class="flex-1 text-left px-3 py-2 bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-600" onclick="openSegmentOriginModal(${
        segment.id
      })">
        <span class="text-sm text-gray-500 dark:text-gray-400">Origem</span>
        <div class="font-medium" id="segment-${segment.id}-origem">${
      segment.origem ? segment.origem.cidade : "Selecionar"
    }</div>
      </button>
      <span class="material-symbols-outlined text-gray-400">arrow_forward</span>
      <button type="button" class="flex-1 text-left px-3 py-2 bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-600" onclick="openSegmentDestinationModal(${
        segment.id
      })">
        <span class="text-sm text-gray-500 dark:text-gray-400">Destino</span>
        <div class="font-medium" id="segment-${segment.id}-destino">${
      segment.destino ? segment.destino.cidade : "Selecionar"
    }</div>
      </button>
      ${
        segments.length > 1
          ? `<button type="button" onclick="removeMultitripSegment(${segment.id})" class="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
        <span class="material-symbols-outlined">delete</span>
      </button>`
          : ""
      }
    `;
    segmentsContainer.appendChild(segmentDiv);
  });
}
// Global functions for multitrip segment management
window.removeMultitripSegment = function (segmentId) {
  Flight.removeMultitripSegment(segmentId);
  renderMultitripSegments();
};
window.openSegmentOriginModal = function (segmentId) {
  // Store current segment ID for modal
  window.currentSegmentId = segmentId;
  window.currentSegmentField = "origem";
  abrirModalOrigem();
};
window.openSegmentDestinationModal = function (segmentId) {
  // Store current segment ID for modal
  window.currentSegmentId = segmentId;
  window.currentSegmentField = "destino";
  abrirModalDestino();
};
function abrirModalTipoViagem() {
  pararScroll();
  const modal = document.getElementById("modal-tipo-viagem");
  if (!modal) return;
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  // Add event listeners for trip type options
  const options = modal.querySelectorAll(".trip-type-option");
  options.forEach((option) => {
    option.addEventListener("click", (e) => {
      e.preventDefault();
      const tripType = option.dataset.type;
      Flight.setTripType(tripType);
      // Update UI
      const textoTipoViagem = document.getElementById("texto-tipo-viagem");
      if (textoTipoViagem) {
        const tripTypeText =
          tripType === "so-ida"
            ? "Só Ida"
            : tripType === "ida-volta"
            ? "Ida e Volta"
            : tripType === "multitrip"
            ? "Multitrip"
            : "Ida e Volta";
        textoTipoViagem.textContent = tripTypeText;
      }
      // Show/hide multitrip container
      const multitripContainer = document.getElementById("multitrip-container");
      if (multitripContainer) {
        if (tripType === "multitrip") {
          multitripContainer.classList.remove("hidden");
          if (Flight.getMultitripSegments().length === 0) {
            Flight.addMultitripSegment();
          }
          renderMultitripSegments();
        } else {
          multitripContainer.classList.add("hidden");
        }
      }
      fecharModalTipoViagem();
    });
  });
  // Close modal events
  const fecharBtn = document.getElementById("fechar-modal-tipo-viagem");
  if (fecharBtn) {
    fecharBtn.addEventListener("click", fecharModalTipoViagem);
  }
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      fecharModalTipoViagem();
    }
  });
}
function fecharModalTipoViagem() {
  deixarScroll();
  const modal = document.getElementById("modal-tipo-viagem");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}
// --- Modal functions ---
function abrirModalOrigem() {
  pararScroll(); /* Parar scroll da pagina */
  const modal = document.getElementById("modal-origem");
  const listaAeroportos = document.getElementById("lista-aeroportos");
  const pesquisaInput = document.getElementById("pesquisa-aeroporto");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  function mostrarAeroportos(lista) {
    listaAeroportos.innerHTML = "";
    lista.forEach((aeroporto) => {
      const li = document.createElement("li");
      li.className =
        "p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors";
      li.innerHTML = `
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-Main-Primary dark:text-cyan-400">flight_takeoff</span>
          <div>
            <p class="font-semibold text-gray-900 dark:text-white">${
              aeroporto.codigo || "XXX"
            } - ${aeroporto.cidade}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">${
              aeroporto.pais || "País"
            }</p>
          </div>
        </div>
      `;      li.addEventListener("click", () => {
        Flight.setOrigin(aeroporto);
        /* Atualizar o filtro com o formato completo "CÓDIGO - Cidade" */
        filters.origem = `${aeroporto.codigo || ""} - ${
          aeroporto.cidade || ""
        }`;
        updateOriginButton(aeroporto);
        fecharModalOrigem();
        /* Re-render flights with new filter */
        renderFlightCards();
      });
      listaAeroportos.appendChild(li);
    });
  }
  /* Mostrar todos os aeroportos inicialmente */
  mostrarAeroportos(Flight.getAirports());
  /* Pesquisa em tempo real */
  pesquisaInput.addEventListener("input", (e) => {
    const termoPesquisa = e.target.value.toLowerCase();
    const aeroportosFiltrados = Flight.filterAirports(termoPesquisa);
    mostrarAeroportos(aeroportosFiltrados);
  });
  /* Eventos para fechar modal */
  document
    .getElementById("fechar-modal-origem")
    .addEventListener("click", fecharModalOrigem);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      fecharModalOrigem();
    }
  });
}
function updateOriginButton(aeroporto) {
  // Check if we're updating a multitrip segment
  if (window.currentSegmentId && window.currentSegmentField === "origem") {
    Flight.updateMultitripSegment(window.currentSegmentId, {
      origem: aeroporto,
    });
    renderMultitripSegments(); // Re-render segments to update display
    window.currentSegmentId = null;
    window.currentSegmentField = null;
  } else {
    const btnOrigem = document.querySelector("#btn-open p");
    btnOrigem.textContent = `${aeroporto.codigo || "XXX"} - ${
      aeroporto.cidade
    }`;
  }
}
function fecharModalOrigem() {
  deixarScroll(); /* Deixar scroll da pagina voltar */
  const modal = document.getElementById("modal-origem");
  const pesquisaInput = document.getElementById("pesquisa-aeroporto");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  pesquisaInput.value = "";
}
function abrirModalDestino() {
  pararScroll(); /* Parar scroll da pagina */
  const modal = document.getElementById("modal-destino");
  const listaDestinos = document.getElementById("lista-destinos");
  const pesquisaInput = document.getElementById("pesquisa-destino");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  function mostrarDestinos(lista) {
    listaDestinos.innerHTML = "";
    lista.forEach((aeroporto) => {
      const li = document.createElement("li");
      li.className =
        "p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors";
      li.innerHTML = `
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-Main-Primary dark:text-cyan-400">flight_land</span>
          <div>
            <p class="font-semibold text-gray-900 dark:text-white">${
              aeroporto.codigo || "XXX"
            } - ${aeroporto.cidade}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">${
              aeroporto.pais || "País"
            }</p>
          </div>
        </div>
      `;      li.addEventListener("click", () => {
        Flight.setDestination(aeroporto);
        /* Atualizar o filtro com o formato completo "CÓDIGO - Cidade" */
        filters.destino = `${aeroporto.codigo || ""} - ${
          aeroporto.cidade || ""
        }`;
        updateDestinationButton(aeroporto);
        fecharModalDestino();
        /* Re-render flights with new filter */
        renderFlightCards();
      });
      listaDestinos.appendChild(li);
    });
  }
  mostrarDestinos(Flight.getAirports());
  pesquisaInput.addEventListener("input", (e) => {
    const termoPesquisa = e.target.value.toLowerCase();
    const destinosFiltrados = Flight.filterAirports(termoPesquisa);
    mostrarDestinos(destinosFiltrados);
  });
  document
    .getElementById("fechar-modal-destino")
    .addEventListener("click", fecharModalDestino);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      fecharModalDestino();
    }
  });
}
function updateDestinationButton(aeroporto) {
  // Check if we're updating a multitrip segment
  if (window.currentSegmentId && window.currentSegmentField === "destino") {
    Flight.updateMultitripSegment(window.currentSegmentId, {
      destino: aeroporto,
    });
    renderMultitripSegments(); // Re-render segments to update display
    window.currentSegmentId = null;
    window.currentSegmentField = null;
  } else {
    const btnDestino = document.querySelector("#btn-destino p");
    btnDestino.textContent = `${aeroporto.codigo || "XXX"} - ${
      aeroporto.cidade
    }`;
  }
}
function fecharModalDestino() {
  deixarScroll(); /* Deixar scroll da pagina voltar */
  const modal = document.getElementById("modal-destino");
  const pesquisaInput = document.getElementById("pesquisa-destino");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  pesquisaInput.value = "";
}
function abrirModalDatas() {
  pararScroll(); /* Parar scroll da pagina */
  const modal = document.getElementById("modal-datas");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  /* Obter dados salvos */
  const savedData = Flight.getDatesTravelers();
  let adultos = savedData.adultos;
  let criancas = savedData.criancas;
  let bebes = savedData.bebes;
  /* Elementos dos contadores */
  const contadorAdultos = document.getElementById("contador-adultos");
  const contadorCriancas = document.getElementById("contador-criancas");
  const contadorBebes = document.getElementById("contador-bebes");
  const inputDataPartida = document.getElementById("data-partida");
  const inputDataRegresso = document.getElementById("data-regresso");
  /* Carregar valores salvos */
  contadorAdultos.textContent = adultos;
  contadorCriancas.textContent = criancas;
  contadorBebes.textContent = bebes;
  inputDataPartida.value = savedData.dataPartida;
  inputDataRegresso.value = savedData.dataRegresso;
  /* Configurar botoes de contadores */
  setupCounters(
    contadorAdultos,
    contadorCriancas,
    contadorBebes,
    adultos,
    criancas,
    bebes
  );
  /* Configurar datas minimas */
  const hoje = new Date().toISOString().split("T")[0];
  inputDataPartida.min = hoje;
  inputDataRegresso.min = hoje;
  inputDataPartida.addEventListener("change", (e) => {
    inputDataRegresso.min = e.target.value;
  });  /* Botao confirmar */
  document.getElementById("confirmar-datas").addEventListener("click", () => {
    const dataPartida = inputDataPartida.value;
    const dataRegresso = inputDataRegresso.value;
    if (dataPartida && dataRegresso) {
      Flight.setDatesTravelers(
        dataPartida,
        dataRegresso,
        adultos,
        criancas,
        bebes
      );
      updateDatesButton(dataPartida, dataRegresso, adultos, criancas, bebes);
      filters.dataPartida = dataPartida;
      filters.dataRegresso = dataRegresso;
      filters.adultos = adultos;
      filters.criancas = criancas;
      filters.bebes = bebes;
      fecharModalDatas();
      /* Re-render flights with new filters */
      renderFlightCards();
    }
  });
  document
    .getElementById("fechar-modal-datas")
    .addEventListener("click", fecharModalDatas);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      fecharModalDatas();
    }
  });
}
function setupCounters(
  contadorAdultos,
  contadorCriancas,
  contadorBebes,
  adultos,
  criancas,
  bebes
) {
  /* Botoes para adultos */
  document.getElementById("aumentar-adultos").addEventListener("click", () => {
    adultos++;
    contadorAdultos.textContent = adultos;
  });
  document.getElementById("diminuir-adultos").addEventListener("click", () => {
    if (adultos > 1) {
      adultos--;
      contadorAdultos.textContent = adultos;
    }
  });
  /* Botoes para criancas */
  document.getElementById("aumentar-criancas").addEventListener("click", () => {
    criancas++;
    contadorCriancas.textContent = criancas;
  });
  document.getElementById("diminuir-criancas").addEventListener("click", () => {
    if (criancas > 0) {
      criancas--;
      contadorCriancas.textContent = criancas;
    }
  });
  /* Botoes para bebes */
  document.getElementById("aumentar-bebes").addEventListener("click", () => {
    bebes++;
    contadorBebes.textContent = bebes;
  });
  document.getElementById("diminuir-bebes").addEventListener("click", () => {
    if (bebes > 0) {
      bebes--;
      contadorBebes.textContent = bebes;
    }
  });
}
function updateDatesButton(
  dataPartida,
  dataRegresso,
  adultos,
  criancas,
  bebes
) {
  const formattedDates = Flight.formatDatesForDisplay(
    dataPartida,
    dataRegresso
  );
  const totalTravelers = adultos + criancas + bebes;
  const travelersText =
    totalTravelers === 1 ? "1 Viajante" : `${totalTravelers} Viajantes`;
  const btnDatas = document.getElementById("btn-datas");
  const textoDatas = btnDatas.querySelector("div:first-child p");
  const textoViajantesElemento = btnDatas.querySelector("div:nth-child(2) p");
  textoDatas.textContent = formattedDates;
  textoViajantesElemento.textContent = travelersText;
}
function fecharModalDatas() {
  deixarScroll(); /* Deixar scroll da pagina voltar */
  const modal = document.getElementById("modal-datas");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  // Atualizar o número de viajantes ao fechar o modal
  const contadorAdultos = document.getElementById("contador-adultos");
  const contadorCriancas = document.getElementById("contador-criancas");
  const contadorBebes = document.getElementById("contador-bebes");
  const adultos = parseInt(contadorAdultos?.textContent) || 0;
  const criancas = parseInt(contadorCriancas?.textContent) || 0;
  const bebes = parseInt(contadorBebes?.textContent) || 0;
  const totalTravelers = adultos + criancas + bebes;
  const travelersText =
    totalTravelers === 1 ? "1 Viajante" : `${totalTravelers} Viajantes`;
  const btnDatas = document.getElementById("btn-datas");
  const textoViajantesElemento = btnDatas.querySelector("div:nth-child(2) p");
  if (textoViajantesElemento)
    textoViajantesElemento.textContent = travelersText;
}
function abrirModalAcessibilidade() {
  pararScroll(); /* Parar scroll da pagina */
  const modal = document.getElementById("modal-acessibilidade");
  const listaAcessibilidades = document.getElementById("lista-acessibilidades");
  const pesquisaInput = document.getElementById("pesquisa-acessibilidade");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  function mostrarAcessibilidades(lista) {
    listaAcessibilidades.innerHTML = "";
    lista.forEach((acessibilidade, index) => {
      const li = document.createElement("li");
      li.className =
        "p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors";
      const selected = Flight.getSelectedAccessibilities().includes(index);
      const icon = Flight.getAccessibilityIcon(acessibilidade);
      li.innerHTML = `
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-Main-Primary dark:text-cyan-400">${icon}</span>
            <p class="font-semibold text-gray-900 dark:text-white">${acessibilidade}</p>
          </div>
          <div class="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded flex items-center justify-center ${
            selected ? "bg-Main-Primary dark:bg-cyan-400" : ""
          }">
            ${
              selected
                ? '<span class="material-symbols-outlined text-white text-sm">check</span>'
                : ""
            }
          </div>
        </div>
      `;
      li.addEventListener("click", () => {
        Flight.toggleAccessibility(index);
        mostrarAcessibilidades(lista);
      });
      listaAcessibilidades.appendChild(li);
    });
  }
  mostrarAcessibilidades(Flight.getAccessibilities());
  pesquisaInput.addEventListener("input", (e) => {
    const termoPesquisa = e.target.value.toLowerCase();
    const filteredAccessibilities = Flight.filterAccessibilities(termoPesquisa);
    mostrarAcessibilidades(filteredAccessibilities);
  });  document
    .getElementById("confirmar-acessibilidade")
    .addEventListener("click", () => {
      Flight.confirmAccessibilities();
      updateAccessibilityButton();
      
      // Convert indices to actual accessibility names for filtering
      const selectedIndices = Flight.getSelectedAccessibilities();
      const allAccessibilities = Flight.getAccessibilities();
      const selectedNames = selectedIndices
        .map(index => allAccessibilities[index])
        .filter(name => name); // Remove any undefined names
      
      filters.acessibilidade = selectedNames.join(", ");
      fecharModalAcessibilidade();
      /* Re-render flights with new filters */
      renderFlightCards();
    });
  document
    .getElementById("fechar-modal-acessibilidade")
    .addEventListener("click", fecharModalAcessibilidade);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      fecharModalAcessibilidade();
    }
  });
}
function updateAccessibilityButton() {
  const textoAcessibilidade = document.getElementById("texto-acessibilidade");
  textoAcessibilidade.textContent = Flight.getAccessibilitiesText();
}
function fecharModalAcessibilidade() {
  deixarScroll(); /* Deixar scroll da pagina voltar */
  const modal = document.getElementById("modal-acessibilidade");
  const pesquisaInput = document.getElementById("pesquisa-acessibilidade");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  pesquisaInput.value = "";
}
function abrirModalTipoTurismo() {
  pararScroll(); /* Parar scroll da pagina */
  const modal = document.getElementById("modal-tipo-turismo");
  const gridTipos = document.getElementById("grid-tipos-turismo");
  const pesquisaInput = document.getElementById("pesquisa-tipo-turismo");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  function mostrarTiposTurismo(lista) {
    gridTipos.innerHTML = "";
    lista.forEach((tipo) => {
      const card = document.createElement("div");
      card.className =
        "w-full h-32 relative rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200";
      card.innerHTML = `
        <img draggable="false" class="absolute inset-0 w-full h-full object-cover" src="${tipo.imagem}" alt="${tipo.nome}" />
        <div class="absolute inset-0 bg-black bg-opacity-30 flex items-end p-3">
          <div class="text-white text-sm font-bold font-['Space_Mono'] leading-tight">
            ${tipo.nome}
          </div>
        </div>
      `;      card.addEventListener("click", () => {
        Flight.setTourismType(tipo);
        filters.tipoTurismo = tipo.nome; // Store the name instead of the object
        updateTourismButton(tipo);
        fecharModalTipoTurismo();
        /* Re-render flights with new filters */
        renderFlightCards();
      });
      gridTipos.appendChild(card);
    });
  }
  mostrarTiposTurismo(Flight.getTourismTypes());
  pesquisaInput.addEventListener("input", (e) => {
    const termoPesquisa = e.target.value.toLowerCase();
    const filteredTypes = Flight.filterTourismTypes(termoPesquisa);
    mostrarTiposTurismo(filteredTypes);
  });
  document
    .getElementById("fechar-modal-tipo-turismo")
    .addEventListener("click", fecharModalTipoTurismo);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      fecharModalTipoTurismo();
    }
  });
}
function updateTourismButton(tipo) {
  const textoTipoTurismo = document.getElementById("texto-tipo-turismo");
  textoTipoTurismo.textContent = tipo.nome;
}
function fecharModalTipoTurismo() {
  deixarScroll(); /* Deixar scroll da pagina voltar */
  const modal = document.getElementById("modal-tipo-turismo");
  const pesquisaInput = document.getElementById("pesquisa-tipo-turismo");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  pesquisaInput.value = "";
}
