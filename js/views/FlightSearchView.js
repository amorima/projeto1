import * as Flight from "../models/FlightModel.js";
let filters = {}
// Preenche os campos do topo da página de pesquisa com os dados vindos do sessionStorage
function preencherCamposPesquisa() {
  const params = sessionStorage.getItem('planit_search');
  if (!params) return null;
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
    const viajantes = dados.adultos + dados.criancas + dados.bebes;
    if (viajantesP) viajantesP.textContent = `${viajantes} Viajante${viajantes > 1 ? 's' : ''}`;
  }

  // Tipo de turismo
  const tipoTurismoP = document.querySelectorAll('form > div')[2]?.querySelectorAll('p')[1];
  if (tipoTurismoP && dados.tipoTurismo) tipoTurismoP.textContent = dados.tipoTurismo;

  // Acessibilidade
  const acessibilidadeP = document.querySelectorAll('form > div')[3]?.querySelectorAll('p')[1];
  if (acessibilidadeP && dados.acessibilidade) acessibilidadeP.textContent = dados.acessibilidade;

  return dados;
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
      // Origem: pode ser só cidade ou código+cidade
      if (planitFilter.origem && flight.origem) {
        // Permitir match parcial (ex: "Porto" casa com "OPO - Porto")
        match = match && (flight.origem.toLowerCase().includes(planitFilter.origem.toLowerCase()) || planitFilter.origem.toLowerCase().includes(flight.origem.toLowerCase()));
      }
      // Destino: pode ser só cidade ou código+cidade
      if (planitFilter.destino && flight.destino) {
        match = match && (flight.destino.toLowerCase().includes(planitFilter.destino.toLowerCase()) || planitFilter.destino.toLowerCase().includes(flight.destino.toLowerCase()));
      }
      // Tipo de turismo: só filtra se não for "Nenhum" e se existir no array turismo
      if (planitFilter.tipoTurismo && planitFilter.tipoTurismo !== "Nenhum" && Array.isArray(flight.turismo)) {
        match = match && flight.turismo.some(t => t.toLowerCase().includes(planitFilter.tipoTurismo.toLowerCase()));
      }
      // Datas: só filtra se preenchidas
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
    const nVoo = numeroVoo || "AF151";

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
        <a href="flight_itinerary.html?id=${nVoo}" class="ver-oferta absolute bottom-4 right-4 h-8 px-2.5 py-3.5 bg-Main-Secondary dark:bg-cyan-800 rounded-lg  inline-flex justify-center items-center gap-2.5 text-white text-base font-bold font-['Space_Mono'] hover:bg-Main-Primary dark:hover:bg-cyan-600 transition duration-300 ease-in-out">Ver oferta</a>
        <span class="absolute top-4 right-6 material-symbols-outlined text-red-500 cursor-pointer transition-all duration-300 ease-in-out favorite-icon" data-favorito="false">favorite</span>
      </div>
    `;
    container.appendChild(card);

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
  const planitFilter = preencherCamposPesquisa();
  renderFlightCards(); // Não aplica filtro PlanIt automaticamente
  setupFlightFilters();
  setupModalButtons()

  // Adiciona listener ao botão PlanIt para aplicar o filtro
  const planItBtn = document.querySelector('button, .planit-btn, .group [type="submit"]');
  if (planItBtn) {
    planItBtn.addEventListener('click', (e) => {
      e.preventDefault();
      renderFlightCards(null, planitFilter);
    });
  }
});

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
      `;

      li.addEventListener("click", () => {
        Flight.setOrigin(aeroporto);
        filters.origem = aeroporto.cidade; // Corrigido: salva a cidade do aeroporto
        updateOriginButton(aeroporto);
        fecharModalOrigem();
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
  const btnOrigem = document.querySelector("#btn-open p");
  btnOrigem.textContent = `${aeroporto.codigo || "XXX"} - ${aeroporto.cidade}`;
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
      `;

      li.addEventListener("click", () => {
        Flight.setDestination(aeroporto);
        filters.destino = aeroporto.cidade; // Corrigido: salva a cidade do aeroporto
        updateDestinationButton(aeroporto);
        fecharModalDestino();
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
  const btnDestino = document.querySelector("#btn-destino p");
  btnDestino.textContent = `${aeroporto.codigo || "XXX"} - ${aeroporto.cidade}`;
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
  });

  /* Botao confirmar */
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
  const travelersText = totalTravelers === 1 ? "1 Viajante" : `${totalTravelers} Viajantes`;
  const btnDatas = document.getElementById("btn-datas");
  const textoViajantesElemento = btnDatas.querySelector("div:nth-child(2) p");
  if (textoViajantesElemento) textoViajantesElemento.textContent = travelersText;
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
  });

  document
    .getElementById("confirmar-acessibilidade")
    .addEventListener("click", () => {
      Flight.confirmAccessibilities();
      updateAccessibilityButton();

      filters.acessibilidade = Flight.getSelectedAccessibilities();
      fecharModalAcessibilidade();
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
      `;

      card.addEventListener("click", () => {
        Flight.setTourismType(tipo);
        filters.tipoTurismo = tipo;
        updateTourismButton(tipo);
        fecharModalTipoTurismo();
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