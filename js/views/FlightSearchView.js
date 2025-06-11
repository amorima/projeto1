import * as Flight from "../models/FlightModel.js";

// Preenche os campos do topo da página de pesquisa com os dados vindos do sessionStorage
function preencherCamposPesquisa() {
  const params = sessionStorage.getItem('planit_search');
  if (!params) return;
  const dados = JSON.parse(params);

  // Origem
  const origemBtn = document.querySelector('#btn-open p');
  if (origemBtn && dados.origem) origemBtn.textContent = dados.origem;

  // Destino
  const destinoBtn = document.querySelector('#btn-destino p');
  if (destinoBtn && dados.destino) destinoBtn.textContent = dados.destino;
  // Caso o destino seja um div (como no HTML), procurar pelo texto
  const destinoDiv = document.querySelector('div[aria-label="destino"] p') || document.querySelectorAll('form > div')[0]?.querySelector('p');
  if (destinoDiv && dados.destino) destinoDiv.textContent = dados.destino;

  // Datas e viajantes
  const datasDiv = document.querySelectorAll('form > div')[1];
  if (datasDiv && dados.dataPartida && dados.dataRegresso) {
    const datasP = datasDiv.querySelector('p');
    if (datasP) datasP.textContent = `${dados.dataPartida} - ${dados.dataRegresso}`;
    const viajantesP = datasDiv.querySelectorAll('p')[1];
    if (viajantesP) viajantesP.textContent = `${dados.adultos} Adulto(s), ${dados.criancas} Criança(s), ${dados.bebes} Bebé(s)`;
  }

  // Tipo de turismo
  const tipoTurismoP = document.querySelectorAll('form > div')[2]?.querySelectorAll('p')[1];
  if (tipoTurismoP && dados.tipoTurismo) tipoTurismoP.textContent = dados.tipoTurismo;

  // Acessibilidade
  const acessibilidadeP = document.querySelectorAll('form > div')[3]?.querySelectorAll('p')[1];
  if (acessibilidadeP && dados.acessibilidade) acessibilidadeP.textContent = dados.acessibilidade;
}

/**
 * Renderiza cards de voos.
 * @param {Array} filteredFlights - Lista de voos filtrados (opcional).
 * @param {Object} planitFilter - Filtros vindos do formulário PlanIt (opcional, pode ser null).
 * @param {number} maxCards - Número máximo de cards a renderizar (default: 18).
 */
function renderFlightCards(filteredFlights = null, planitFilter = null, maxCards = 18) {
  let flights = filteredFlights || Flight.getAll();

  if (planitFilter) {
    flights = flights.filter(flight => {
      let match = true;
      if (planitFilter.origem && flight.origem) {
        match = match && flight.origem.toLowerCase().includes(planitFilter.origem.toLowerCase());
      }
      if (planitFilter.destino && flight.destino) {
        match = match && flight.destino.toLowerCase().includes(planitFilter.destino.toLowerCase());
      }
      if (planitFilter.dataPartida && flight.partida) {
        match = match && flight.partida.includes(planitFilter.dataPartida);
      }
      if (planitFilter.dataRegresso && flight.dataVolta) {
        match = match && flight.dataVolta.includes(planitFilter.dataRegresso);
      }
      return match;
    });
  }

  // Limitar o número de cards
  flights = flights.slice(0, maxCards);

  const container = document.querySelector(".card-viagens");
  if (!container) return;
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
      "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"
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
      dataVolta
    } = flight;
    const cidade = destino || "Destino";
    const dataPartida = formatarData(partida);
    const dataRegresso = formatarData(dataVolta);
    const datas = dataPartida && dataRegresso ? `${dataPartida} - ${dataRegresso}` : dataPartida;
    const preco = custo || "-";
    const imgSrc = imagem || "https://placehold.co/413x327";

    const card = document.createElement("div");
    card.className = "bg-white dark:bg-gray-800 w-full relative rounded-lg shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)] border border-gray-200 dark:border-gray-700 overflow-hidden";
    card.innerHTML = `
      <img class="w-full h-80 object-cover" src="${imgSrc}" alt="Imagem do destino">
      <div class="p-4">
        <p class="text-Text-Body dark:text-gray-100 text-2xl font-bold font-['Space_Mono'] mb-2">${cidade}</p>
        <div class="inline-flex">
          <span class="material-symbols-outlined text-Text-Subtitles dark:text-gray-300">calendar_month</span>
          <p class="text-Text-Subtitles dark:text-gray-300 align-bottom font-normal font-['IBM_Plex_Sans'] mb-4">${datas}</p>
        </div>
        <p class="text-Button-Main dark:text-cyan-400 text-3xl font-bold font-['IBM_Plex_Sans']">${preco} €</p>
        <p class="justify-start text-Text-Subtitles dark:text-gray-300 text-xs font-light font-['IBM_Plex_Sans'] leading-none">Transporte para 1 pessoa</p>
        <a href="#" class="ver-oferta absolute bottom-4 right-4 h-8 px-2.5 py-3.5 bg-Main-Secondary dark:bg-cyan-800 rounded-lg  inline-flex justify-center items-center gap-2.5 text-white text-base font-bold font-['Space_Mono'] hover:bg-Main-Primary dark:hover:bg-cyan-600 transition duration-300 ease-in-out">Ver oferta</a>
        <span class="absolute top-4 right-6 material-symbols-outlined text-red-500 cursor-pointer transition-all duration-300 ease-in-out favorite-icon" data-favorito="false">favorite</span>
      </div>
    `;
    container.appendChild(card);

    // Adiciona evento ao botão "Ver oferta" para redirecionar
    const btnOferta = card.querySelector('.ver-oferta');
    if (btnOferta) {
      btnOferta.addEventListener('click', function(e) {
        e.preventDefault();
        // Guardar o número do voo na window
        window.selectedFlightNumber = flight.numeroVoo;
        window.location.href = '/html/flight_itinerary.html';
      });
    }
  });

  // Ativar toggle de favorito
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

// --- Filtros de pesquisa de voos ---
function setupFlightFilters() {
  const sortDate = document.getElementById("sort-date");
  const sortPrice = document.getElementById("sort-price");
  const minPrice = document.getElementById("min-price");
  const maxPrice = document.getElementById("max-price");

  function applyFilters() {
    let flights = Flight.getAll();

    // Filtro por preço
    const min = parseFloat(minPrice?.value) || 0;
    const max = parseFloat(maxPrice?.value) || Infinity;
    flights = flights.filter((f) => {
      const preco = parseFloat(f.custo) || 0;
      return preco >= min && preco <= max;
    });

    // Ordenação por data de partida
    if (sortDate && sortDate.value === "recent") {
      flights.sort((a, b) => new Date(b.partida) - new Date(a.partida));
    } else if (sortDate && sortDate.value === "oldest") {
      flights.sort((a, b) => new Date(a.partida) - new Date(b.partida));
    }

    // Ordenação por preço
    if (sortPrice && sortPrice.value === "price-asc") {
      flights.sort((a, b) => Number(a.custo) - Number(b.custo));
    } else if (sortPrice && sortPrice.value === "price-desc") {
      flights.sort((a, b) => Number(b.custo) - Number(a.custo));
    }

    renderFlightCards(flights);
  }

  if (sortDate) sortDate.addEventListener("change", applyFilters);
  if (sortPrice) sortPrice.addEventListener("change", applyFilters);
  if (minPrice) minPrice.addEventListener("input", applyFilters);
  if (maxPrice) maxPrice.addEventListener("input", applyFilters);

  // Inicializa com todos os voos
  applyFilters();
}

// --- Inicialização principal ---
document.addEventListener("DOMContentLoaded", () => {
  Flight.init();
  renderFlightCards();
  setupFlightFilters();
  preencherCamposPesquisa();
});