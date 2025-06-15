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

/* Funções globais para o modal de gamificação */
window.openGamificationModal = function () {
  const modal = document.getElementById("modal-gamificacao");
  if (modal) {
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }
};

window.closeGamificationModal = function () {
  const modal = document.getElementById("modal-gamificacao");
  if (modal) {
    modal.classList.add("hidden");
    document.body.style.overflow = "";
  }
};

window.deferGamificationModal = function () {
  sessionStorage.setItem("gamificationModalDeferred", "true");
  window.closeGamificationModal();
};

window.ignoreGamificationModal = function () {
  localStorage.setItem("gamificationModalIgnored", "true");
  window.closeGamificationModal();
};

/* Inicializar a aplicacao */
let filters = {}
Flight.init();
initView();

function initView() {
  /* Obter localizacao do utilizador e definir aeroporto mais proximo */
  getUserLocation((location) => {
    if (!location) return;
    const aeroportos = Flight.getAirports();
    const closest = closestAirport(location, aeroportos);
    document.querySelector("#btn-open p").innerText = closest.cidade;
  });

  showCookieBanner();
  initSlider();
  setupModalButtons();
  initGamificationModal(); /* Mostrar modal se necessário */

  /* Renderizar cards na homepage se o container existir */
  if (document.querySelector(".card-viagens")) {
    renderRandomOPOCards("card-viagens");
  }

  /* Inicializar vista de tabela */
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
}

/* Funcoes de interface - slider */
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

  /* Variaveis para controlar o arrastar do slider */
  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;

  /* Quando o utilizador pressiona o botao do rato */
  slider.addEventListener("mousedown", (e) => {
    isDown = true;
    slider.classList.add("grabbing");
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
  });

  /* Quando o utilizador solta o botao do rato */
  slider.addEventListener("mouseup", () => {
    isDown = false;
    slider.classList.remove("grabbing");
  });

  /* Quando o rato sai do slider */
  slider.addEventListener("mouseleave", () => {
    isDown = false;
    slider.classList.remove("grabbing");
  });

  /* Quando o utilizador move o rato enquanto arrasta */
  slider.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    slider.scrollLeft = scrollLeft - (x - startX);
  });

  /* Para dispositivos moveis - quando toca no ecra */
  slider.addEventListener("touchstart", (e) => {
    isDown = true;
    startX = e.touches[0].pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
  });

  /* Para dispositivos moveis - quando para de tocar */
  slider.addEventListener("touchend", () => {
    isDown = false;
  });

  /* Para dispositivos moveis - quando move o dedo */
  slider.addEventListener("touchmove", (e) => {
    if (!isDown) return;
    const x = e.touches[0].pageX - slider.offsetLeft;
    slider.scrollLeft = scrollLeft - (x - startX);
  });
}

/* Configurar eventos dos botoes dos modais */
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

/* Funcoes para controlar scroll da pagina */
function pararScroll() {
  document.body.classList.add("modal-aberto");
}

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
export function renderRandomOPOCards(containerClass) {
  const shuffled = Flight.getTripsFrom();
  const container = document.querySelector(`.${containerClass}`);
  if (!container) return;
  container.innerHTML = "";

  shuffled.forEach((viagem) => {
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
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = cardHTML;
    const card = tempDiv.firstElementChild;
    container.appendChild(card);

    // Now add the event listener to the heart icon inside this card
    const heart = card.querySelector('.favorite-icon');
    if (heart) {
      // Set initial fill state based on whether this trip is a favorite
      let isFav = false;
      if (User.isLogged()) {
        const user = User.getUserLogged();
        isFav = user.favoritos && user.favoritos.some(fav => fav.numeroVoo === viagem.numeroVoo);
      }
      heart.setAttribute("data-favorito", isFav ? "true" : "false");
      heart.style.fontVariationSettings = isFav ? "'FILL' 1" : "'FILL' 0";

      heart.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!User.isLogged()) {
          showToast("Faça login para adicionar aos favoritos");
          window.location.href = "../html/login.html";
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

  // Obter valores dos botões/inputs principais
  const origem = document.querySelector('#btn-open p')?.textContent.trim() || '';
  const destino = document.querySelector('#btn-destino p')?.textContent.trim() || '';
  const tipoTurismo = document.getElementById('texto-tipo-turismo')?.textContent.trim() || '';
  const acessibilidade = document.getElementById('texto-acessibilidade')?.textContent.trim() || '';

  // Datas e viajantes (preferir o modelo se disponível)
  let dataPartida = '', dataRegresso = '', adultos = 1, criancas = 0, bebes = 0;
  if (typeof Flight !== 'undefined' && Flight.getDatesTravelers) {
    const savedData = Flight.getDatesTravelers();
    dataPartida = savedData.dataPartida || '';
    dataRegresso = savedData.dataRegresso || '';
    adultos = savedData.adultos || 1;
    criancas = savedData.criancas || 0;
    bebes = savedData.bebes || 0;
  } else {
    dataPartida = document.getElementById('data-partida')?.value || '';
    dataRegresso = document.getElementById('data-regresso')?.value || '';
    adultos = document.getElementById('contador-adultos')?.textContent.trim() || '1';
    criancas = document.getElementById('contador-criancas')?.textContent.trim() || '0';
    bebes = document.getElementById('contador-bebes')?.textContent.trim() || '0';
  }

  // Montar objeto para sessionStorage
  const planitData = {
    origem,
    destino,
    tipoTurismo,
    acessibilidade,
    dataPartida,
    dataRegresso,
    adultos,
    criancas,
    bebes
  };

  sessionStorage.setItem('planit_search', JSON.stringify(planitData));
  window.location.href = 'html/flight_search.html';
}

// Adiciona listener ao submit do formulário principal
// (garante que funciona para submit por enter ou botão)
document.addEventListener('DOMContentLoaded', function() {
  User.init(); // Inicializa o UserModel
  const form = document.querySelector('section form');
  if (form) {
    form.addEventListener('submit', handlePlanItFormSubmit);
  }
});
