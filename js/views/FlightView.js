import * as Flight from "../models/FlightModel.js";
import * as User from "../models/UserModel.js";
import {
  showCookieBanner,
  getFormData,
  showToast,
  closeModal,
  selectOptions,
  updateTable,
  getUserLocation,
  closestAirport,
} from "./ViewHelpers.js";
/**
 * Abre o modal de gamificação
 */
window.openGamificationModal = function () {
  const modal = document.getElementById("modal-gamificacao");
  if (modal) {
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }
};
/**
 * Fecha o modal de gamificação
 */
window.closeGamificationModal = function () {
  const modal = document.getElementById("modal-gamificacao");
  if (modal) {
    modal.classList.add("hidden");
    document.body.style.overflow = "";
  }
};
/**
 * Adia o modal de gamificação para mais tarde
 */
window.deferGamificationModal = function () {
  sessionStorage.setItem("gamificationModalDeferred", "true");
  window.closeGamificationModal();
};
/**
 * Ignora permanentemente o modal de gamificação
 */
window.ignoreGamificationModal = function () {
  localStorage.setItem("gamificationModalIgnored", "true");
  window.closeGamificationModal();
};
let filters = {};
Flight.init();
User.init();
initView();
/**
 * Inicializa a vista principal da aplicação
 */
function initView() {
  /* Carregar dados guardados primeiro */
  loadSavedFormData();

  getUserLocation((location) => {
    if (!location) return;

    /* Verificar se já existe uma origem selecionada manualmente */
    const origemJaSelecionada = Flight.getSelectedOrigin();
    if (origemJaSelecionada) return;

    const aeroportos = Flight.getAeroportosComCoordenadas();
    const closest = closestAirport(location, aeroportos);
    const btnOpenElement = document.querySelector("#btn-open p");
    if (btnOpenElement && closest) {
      btnOpenElement.innerText = `${closest.codigo} - ${closest.cidade}`;
      /* Guardar aeroporto mais próximo no localStorage */
      Flight.setOrigin(closest);
    }
  });
  showCookieBanner();
  initSlider();
  setupModalButtons();
  setupTripTypeButtons();
  initGamificationModal();
  setupNewsletterForm();
  if (document.querySelector(".card-viagens")) {
    /* Obtém a localização do utilizador e mostra voos da origem mais próxima */
    getUserLocation((location) => {
      if (location) {
        const aeroportos = Flight.getAeroportosComCoordenadas();
        const closest = closestAirport(location, aeroportos);
        if (closest) {
          const origemProxima = `${closest.codigo} - ${closest.cidade}`;
          renderRandomOPOCards("card-viagens", origemProxima);
        } else {
          renderRandomOPOCards("card-viagens");
        }
      } else {
        /* Sem localização, usa comportamento padrão */
        renderRandomOPOCards("card-viagens");
      }
    });
  }
  const data = Flight.getAll();
  const config = createTableConfig(data);
  updateTable(config);
  const form = document.getElementById("add_flight_form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      createFlight(config);
    });
  }
  loadSavedFormData();
}
/**
 * Inicializa o slider de destinos
 */
function initSlider() {
  const slider = document.getElementById("slider");
  const btnLeft = document.getElementById("btn-left");
  const btnRight = document.getElementById("btn-right");
  if (!slider || !btnLeft || !btnRight) return;
  const scrollAmount = slider.clientWidth * 0.2;
  btnLeft.addEventListener("click", () =>
    slider.scrollBy({ left: -scrollAmount, behavior: "smooth" })
  );
  btnRight.addEventListener("click", () =>
    slider.scrollBy({ left: scrollAmount, behavior: "smooth" })
  );
  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;
  slider.addEventListener("mousedown", (e) => {
    isDown = true;
    slider.classList.add("grabbing");
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
  });
  slider.addEventListener("mouseup", () => {
    isDown = false;
    slider.classList.remove("grabbing");
  });
  slider.addEventListener("mouseleave", () => {
    isDown = false;
    slider.classList.remove("grabbing");
  });
  slider.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    slider.scrollLeft = scrollLeft - (x - startX);
  });
  slider.addEventListener("touchstart", (e) => {
    isDown = true;
    startX = e.touches[0].pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
  });
  slider.addEventListener("touchend", () => {
    isDown = false;
  });
  slider.addEventListener("touchmove", (e) => {
    if (!isDown) return;
    const x = e.touches[0].pageX - slider.offsetLeft;
    slider.scrollLeft = scrollLeft - (x - startX);
  });
}
/**
 * Configura eventos dos botões dos modais
 */
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
/**
 * Para o scroll da página
 */
function pararScroll() {
  document.body.classList.add("modal-aberto");
}
/**
 * Permite o scroll da página
 */
function deixarScroll() {
  document.body.classList.remove("modal-aberto");
}
/* Funcoes dos modais - apenas interface */
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
            }</p>          </div>
        </div>
      `;
      li.addEventListener("click", () => {
        // Check if we're updating a multitrip segment
        if (
          window.currentSegmentId &&
          window.currentSegmentField === "origem"
        ) {
          Flight.updateMultitripSegment(window.currentSegmentId, {
            origem: aeroporto,
          });
          renderMultitripSegments(); // Re-render segments to update display
          // Clear segment selection state
          window.currentSegmentId = null;
          window.currentSegmentField = null;
        } else {
          // Regular origin selection
          Flight.setOrigin(aeroporto);
          /* Manter consistência com o formato usado na pesquisa */
          filters.origem = `${aeroporto.codigo || "XXX"} - ${aeroporto.cidade}`;
          updateOriginButton(aeroporto);
        }
        fecharModalOrigem();
      });
      listaAeroportos.appendChild(li);
    });
  }
  /* Mostrar todos os aeroportos inicialmente */
  mostrarAeroportos(Flight.getAirports());
  /* Clear any existing event listener */
  pesquisaInput.value = "";
  /* Pesquisa em tempo real */
  const handleSearch = (e) => {
    const termoPesquisa = e.target.value.toLowerCase();
    const aeroportosFiltrados = Flight.filterAirports(termoPesquisa);
    mostrarAeroportos(aeroportosFiltrados);
  };
  pesquisaInput.removeEventListener("input", handleSearch);
  pesquisaInput.addEventListener("input", handleSearch);
  /* Eventos para fechar modal */
  const fecharBtn = document.getElementById("fechar-modal-origem");
  const handleClose = () => fecharModalOrigem();
  fecharBtn.removeEventListener("click", handleClose);
  fecharBtn.addEventListener("click", handleClose);
  const handleModalClick = (e) => {
    if (e.target === modal) {
      fecharModalOrigem();
    }
  };
  modal.removeEventListener("click", handleModalClick);
  modal.addEventListener("click", handleModalClick);
}
function updateOriginButton(aeroporto) {
  // Check if we're updating a multitrip segment
  if (window.currentSegmentId && window.currentSegmentField === "origem") {
    Flight.updateMultitripSegment(window.currentSegmentId, {
      origem: aeroporto,
    });
    const segmentElement = document.getElementById(
      `segment-${window.currentSegmentId}-origem`
    );
    if (segmentElement) {
      segmentElement.textContent = `${aeroporto.codigo || "XXX"} - ${
        aeroporto.cidade
      }`;
    }
    // Clear the current segment tracking
    window.currentSegmentId = null;
    window.currentSegmentField = null;
  } else {
    // Regular origin button update
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
      `;
      li.addEventListener("click", () => {
        // Check if we're updating a multitrip segment
        if (
          window.currentSegmentId &&
          window.currentSegmentField === "destino"
        ) {
          Flight.updateMultitripSegment(window.currentSegmentId, {
            destino: aeroporto,
          });
          renderMultitripSegments(); // Re-render segments to update display
          // Clear segment selection state
          window.currentSegmentId = null;
          window.currentSegmentField = null;
        } else {
          // Regular destination selection
          Flight.setDestination(aeroporto);
          /* Manter consistência com o formato usado na pesquisa */
          filters.destino = `${aeroporto.codigo || "XXX"} - ${
            aeroporto.cidade
          }`;
          updateDestinationButton(aeroporto);
        }
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
  // Check if we're updating a multitrip segment
  if (window.currentSegmentId && window.currentSegmentField === "destino") {
    Flight.updateMultitripSegment(window.currentSegmentId, {
      destino: aeroporto,
    });
    const segmentElement = document.getElementById(
      `segment-${window.currentSegmentId}-destino`
    );
    if (segmentElement) {
      segmentElement.textContent = `${aeroporto.codigo || "XXX"} - ${
        aeroporto.cidade
      }`;
    }
    // Clear the current segment tracking
    window.currentSegmentId = null;
    window.currentSegmentField = null;
  } else {
    // Regular destination button update
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
  let adultos = Number(savedData.adultos) || 1;
  let criancas = Number(savedData.criancas) || 0;
  let bebes = Number(savedData.bebes) || 0;
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
  document.getElementById("confirmar-datas").onclick = function () {
    // Atualiza os valores dos contadores antes de salvar
    adultos = Number(contadorAdultos.textContent) || 1;
    criancas = Number(contadorCriancas.textContent) || 0;
    bebes = Number(contadorBebes.textContent) || 0;
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
  };
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
  const totalTravelers = Number(adultos) + Number(criancas) + Number(bebes);
  const travelersText =
    totalTravelers === 1 ? "1 Viajante" : `${totalTravelers} Viajantes`;
  const btnDatas = document.getElementById("btn-datas");

  /* Verifica se os elementos existem antes de alterar */
  const textoDatas = btnDatas?.querySelector("div:first-child p");
  const textoViajantesElemento = btnDatas?.querySelector("div:nth-child(2) p");

  if (textoDatas) {
    textoDatas.textContent = formattedDates;
  }
  if (textoViajantesElemento) {
    textoViajantesElemento.textContent = travelersText;
  }
}
function fecharModalDatas() {
  deixarScroll(); /* Deixar scroll da pagina voltar */
  const modal = document.getElementById("modal-datas");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
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
/* Setup trip type buttons functionality */
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
      }.</span>      <button type="button" class="flex-1 text-left px-3 py-2 bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-600" onclick="openSegmentOriginModal(${
      segment.id
    })">
        <span class="text-sm text-gray-500 dark:text-gray-400">Origem</span>
        <div class="font-medium" id="segment-${segment.id}-origem">${
      segment.origem
        ? `${segment.origem.codigo || "XXX"} - ${segment.origem.cidade}`
        : "Selecionar"
    }</div>
      </button>
      <span class="material-symbols-outlined text-gray-400">arrow_forward</span>
      <button type="button" class="flex-1 text-left px-3 py-2 bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-600" onclick="openSegmentDestinationModal(${
        segment.id
      })">
        <span class="text-sm text-gray-500 dark:text-gray-400">Destino</span>
        <div class="font-medium" id="segment-${segment.id}-destino">${
      segment.destino
        ? `${segment.destino.codigo || "XXX"} - ${segment.destino.cidade}`
        : "Selecionar"
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
/* Funcoes de tabela e formulario */
function createTableConfig(data) {
  return {
    data,
    columns: [
      { key: "name", label: "NºVoo", sortable: true },
      { key: "from", label: "Origem", sortable: true },
      { key: "to", label: "Destino", sortable: true },
      { key: "company", label: "Companhia Aeria", sortable: true },
      {
        key: "leaves",
        label: "Horario de Partida",
        sortable: true,
        type: "date",
      },
      { key: "direct", label: "Direto", sortable: true },
    ],
    actions: [
      {
        icon: "edit_square",
        class: "text-Main-Primary",
        handler: Flight.update,
      },
      { icon: "delete", class: "text-red-600", handler: Flight.deleteTrip },
    ],
    rowsPerPage: 10,
    currentPage: 1,
    onPageChange(page) {
      this.currentPage = page;
      updateTable(this);
    },
  };
}
function createFlight(config) {
  const data = getFormData("add_flight_form");
  Flight.add(data);
  showToast("Flight adicionado com sucesso!");
  closeModal("modal-adicionar", "add_flight_form", "Adicionar Flight");
  config.data = Flight.getAll();
  updateTable(config);
}
/* Renderizar cards na homepage */
export function renderRandomOPOCards(containerClass, filtro = null) {
  /* Se não for especificada uma origem, tenta usar a origem do formulário */
  if (filtro === null) {
    const origemSelecionada = Flight.getSelectedOrigin();
    filtro = origemSelecionada
      ? `${origemSelecionada.codigo} - ${origemSelecionada.cidade}`
      : "all";
  }

  const shuffled = Flight.getTripsFrom(filtro);
  const container = document.querySelector(`.${containerClass}`);
  if (!container) return;
  container.innerHTML = "";
  shuffled.forEach((viagem) => {
    // Extract only the city name from "XXX - City" format
    const destinoCompleto = viagem.destino || "Destino";
    const cidade = destinoCompleto.includes(" - ")
      ? destinoCompleto.split(" - ")[1]
      : destinoCompleto;
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
    const cardHTML = `
      <div class="bg-white dark:bg-gray-800 w-full relative rounded-lg shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)] border border-gray-200 dark:border-gray-700 overflow-hidden">
        <img class="w-full h-80 object-cover" src="${imagem}" alt="Imagem do destino">
        <div class="p-4">
          <p class="text-Text-Body dark:text-gray-100 text-2xl font-bold font-['Space_Mono'] mb-2">${cidade}</p>
          <div class="inline-flex">
            <span class="material-symbols-outlined text-Text-Subtitles dark:text-gray-300">calendar_month</span>
            <p class="text-Text-Subtitles dark:text-gray-300 align-bottom font-normal font-['IBM_Plex_Sans'] mb-4">${datas}</p>
          </div>
          <p class="text-Button-Main dark:text-cyan-400 text-3xl font-bold font-['IBM_Plex_Sans']">${preco} €</p>
          <p class="justify-start text-Text-Subtitles dark:text-gray-300 text-xs font-light font-['IBM_Plex_Sans'] leading-none">Transporte para 1 pessoa</p>
          <a href="../html/flight_itinerary.html?id=${nVoo}" class="ver-oferta absolute bottom-4 right-4 h-8 px-2.5 py-3.5 bg-Main-Secondary dark:bg-cyan-800 rounded-lg  inline-flex justify-center items-center gap-2.5 text-white text-base font-bold font-['Space_Mono'] hover:bg-Main-Primary dark:hover:bg-cyan-600 transition duration-300 ease-in-out">Ver oferta</a>
          <span class="absolute top-4 right-6 material-symbols-outlined text-red-500 cursor-pointer transition-all duration-300 ease-in-out favorite-icon" data-favorito="false">favorite</span>
        </div>
      </div>
    `;
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = cardHTML;
    const card = tempDiv.firstElementChild;
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
          user.favoritos.some((fav) => fav.numeroVoo === viagem.numeroVoo);
      }
      heart.setAttribute("data-favorito", isFav ? "true" : "false");
      heart.style.fontVariationSettings = isFav ? "'FILL' 1" : "'FILL' 0";
      heart.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!User.isLogged()) {
          showToast("Faça login para adicionar aos favoritos");
          window.location.href = "../html/_login.html";
          return;
        }
        const user = User.getUserLogged();
        const currentlyFav = heart.getAttribute("data-favorito") === "true";
        if (currentlyFav) {
          User.removeFavorite(user, viagem);
          heart.setAttribute("data-favorito", "false");
          heart.style.fontVariationSettings = "'FILL' 0";
          showToast("Removido dos favoritos");
        } else {
          User.addFavorite(user, viagem);
          heart.setAttribute("data-favorito", "true");
          heart.style.fontVariationSettings = "'FILL' 1";
          showToast("Adicionado aos favoritos");
        }
        heart.classList.add("scale-110");
        setTimeout(() => heart.classList.remove("scale-110"), 150);
      });
    }
  });
}
/* Função para mostrar modal automaticamente no index */
function initGamificationModal() {
  /* Verificar se deve mostrar o modal */
  if (shouldShowModal()) {
    /* Mostrar modal após página carregar */
    setTimeout(() => {
      window.openGamificationModal();
    }, 2000);
  }
}
function shouldShowModal() {
  /* Verificar se modal foi ignorado permanentemente */
  if (localStorage.getItem("gamificationModalIgnored") === "true") {
    return false;
  }
  /* Verificar se foi adiado para mais tarde na sessão atual */ /* Verificar se foi adiado para mais tarde na sessão atual */
  if (sessionStorage.getItem("gamificationModalDeferred") === "true") {
    return false;
  }
  /* Apenas mostrar em desktop */
  return window.innerWidth >= 768;
}
// Formulário PlanIt - captura e redireciona os dados para a página de pesquisa de voos
function handlePlanItFormSubmit(e) {
  e.preventDefault();
  // Build search data using Flight model
  const searchData = Flight.buildSearchData();
  // Save to sessionStorage
  sessionStorage.setItem("planit_search", JSON.stringify(searchData));
  // Redirect to flight search page
  window.location.href = "html/flight_search.html";
}
// Adiciona listener ao submit do formulário principal
// (garante que funciona para submit por enter ou botão)
document.addEventListener("DOMContentLoaded", function () {
  User.init(); // Inicializa o UserModel
  const form = document.querySelector("section form");
  if (form) {
    form.addEventListener("submit", handlePlanItFormSubmit);
  }
});
/* Setup newsletter form submission handling */
function setupNewsletterForm() {
  const newsletterForm = document.getElementById("newsletter-form");
  if (!newsletterForm) return;
  newsletterForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const emailInput = document.getElementById("newsletter-email");
    const email = emailInput.value.trim();
    if (!email) {
      showToast("Por favor, introduza um email válido", "error");
      return;
    }
    // Call the model function to handle subscription
    const result = User.subscribeToNewsletter(email);
    if (result.success) {
      showToast(result.message, "success");
      emailInput.value = ""; // Clear the form
    } else {
      showToast(result.message, "error");
    }
  });
}
/**
 * Carrega dados guardados nos botões do formulário
 */
function loadSavedFormData() {
  /* Carregar origem guardada */
  const origemSelecionada = Flight.getSelectedOrigin();
  if (origemSelecionada) {
    const btnOrigem = document.querySelector("#btn-open p");
    if (btnOrigem) {
      btnOrigem.textContent = `${origemSelecionada.codigo} - ${origemSelecionada.cidade}`;
    }
  }

  /* Carregar destino guardado */
  const destinoSelecionado = Flight.getSelectedDestination();
  if (destinoSelecionado) {
    const btnDestino = document.querySelector("#btn-destino p");
    if (btnDestino) {
      btnDestino.textContent = `${destinoSelecionado.codigo} - ${destinoSelecionado.cidade}`;
    }
  }
}
