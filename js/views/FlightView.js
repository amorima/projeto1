import * as Flight from "../models/FlightModel.js";
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

Flight.init();
initView();

// Main init function to be called on DOMContentLoaded
function initView() {
  getUserLocation((location) => {
    if (!location) return;
    const aeroportos = JSON.parse(localStorage.getItem("aeroportos"));
    const closest = closestAirport(location, aeroportos);
    document.querySelector("#btn-open p").innerText = closest.cidade;
  });
  showCookieBanner();
  initSlider();
  setupModalButton();

  // Render random OPO cards on homepage if container exists
  if (document.querySelector(".card-viagens")) {
    renderRandomOPOCards("card-viagens");
  }

  // Initialize table view
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

// --- UI Component Functions ---

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

function setupModalButton() {
  const btnOpenModal = document.getElementById("btn-open");
  if (btnOpenModal) {
    btnOpenModal.addEventListener("click", (e) => {
      e.preventDefault();
      abrirModalOrigem();
    });
  }

  /* botao para abrir modal de destino */
  const btnDestino = document.getElementById("btn-destino");
  if (btnDestino) {
    btnDestino.addEventListener("click", (e) => {
      e.preventDefault();
      abrirModalDestino();
    });
  }

  /* botao para abrir modal de datas */
  const btnDatas = document.getElementById("btn-datas");
  if (btnDatas) {
    btnDatas.addEventListener("click", (e) => {
      e.preventDefault();
      abrirModalDatas();
    });
  }

  /* botao para abrir modal de acessibilidade */
  const btnAcessibilidade = document.getElementById("btn-acessibilidade");
  if (btnAcessibilidade) {
    btnAcessibilidade.addEventListener("click", (e) => {
      e.preventDefault();
      abrirModalAcessibilidade();
    });
  }
}

/* Função para abrir modal de seleção de origem */
function abrirModalOrigem() {
  const modal = document.getElementById("modal-origem");
  const listaAeroportos = document.getElementById("lista-aeroportos");
  const pesquisaInput = document.getElementById("pesquisa-aeroporto");

  /* Obter aeroportos da localStorage */
  const aeroportos = JSON.parse(localStorage.getItem("aeroportos")) || [];

  /* Mostrar modal */
  modal.classList.remove("hidden");
  modal.classList.add("flex");

  /* Função para mostrar lista de aeroportos */
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

      /* Evento de clique para selecionar aeroporto */
      li.addEventListener("click", () => {
        selecionarOrigem(aeroporto);
        fecharModalOrigem();
      });

      listaAeroportos.appendChild(li);
    });
  }

  /* Mostrar todos os aeroportos inicialmente */
  mostrarAeroportos(aeroportos);

  /* Pesquisa em tempo real */
  pesquisaInput.addEventListener("input", (e) => {
    const termoPesquisa = e.target.value.toLowerCase();
    const aeroportosFiltrados = aeroportos.filter(
      (aeroporto) =>
        aeroporto.cidade.toLowerCase().includes(termoPesquisa) ||
        (aeroporto.pais &&
          aeroporto.pais.toLowerCase().includes(termoPesquisa)) ||
        (aeroporto.codigo &&
          aeroporto.codigo.toLowerCase().includes(termoPesquisa))
    );
    mostrarAeroportos(aeroportosFiltrados);
  });

  /* Evento para fechar modal */
  document
    .getElementById("fechar-modal-origem")
    .addEventListener("click", fecharModalOrigem);

  /* Fechar modal ao clicar fora */
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      fecharModalOrigem();
    }
  });
}

/* Função para selecionar origem */
function selecionarOrigem(aeroporto) {
  const btnOrigem = document.querySelector("#btn-open p");
  btnOrigem.textContent = `${aeroporto.codigo || "XXX"} - ${aeroporto.cidade}`;

  /* Guardar seleção no localStorage para uso posterior */
  localStorage.setItem("origemSelecionada", JSON.stringify(aeroporto));
}

/* Função para fechar modal de origem */
function fecharModalOrigem() {
  const modal = document.getElementById("modal-origem");
  const pesquisaInput = document.getElementById("pesquisa-aeroporto");

  modal.classList.add("hidden");
  modal.classList.remove("flex");
  pesquisaInput.value = "";
}

/* Função para abrir modal de seleção de destino */
function abrirModalDestino() {
  const modal = document.getElementById("modal-destino");
  const listaDestinos = document.getElementById("lista-destinos");
  const pesquisaInput = document.getElementById("pesquisa-destino");

  /* Obter aeroportos da localStorage */
  const aeroportos = JSON.parse(localStorage.getItem("aeroportos")) || [];

  /* Mostrar modal */
  modal.classList.remove("hidden");
  modal.classList.add("flex");

  /* Função para mostrar lista de destinos */
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

      /* Evento de clique para selecionar destino */
      li.addEventListener("click", () => {
        selecionarDestino(aeroporto);
        fecharModalDestino();
      });

      listaDestinos.appendChild(li);
    });
  }

  /* Mostrar todos os destinos inicialmente */
  mostrarDestinos(aeroportos);

  /* Pesquisa em tempo real */
  pesquisaInput.addEventListener("input", (e) => {
    const termoPesquisa = e.target.value.toLowerCase();
    const destinosFiltrados = aeroportos.filter(
      (aeroporto) =>
        aeroporto.cidade.toLowerCase().includes(termoPesquisa) ||
        (aeroporto.pais &&
          aeroporto.pais.toLowerCase().includes(termoPesquisa)) ||
        (aeroporto.codigo &&
          aeroporto.codigo.toLowerCase().includes(termoPesquisa))
    );
    mostrarDestinos(destinosFiltrados);
  });

  /* Evento para fechar modal */
  document
    .getElementById("fechar-modal-destino")
    .addEventListener("click", fecharModalDestino);

  /* Fechar modal ao clicar fora */
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      fecharModalDestino();
    }
  });
}

/* Função para selecionar destino */
function selecionarDestino(aeroporto) {
  const btnDestino = document.querySelector("#btn-destino p");
  btnDestino.textContent = `${aeroporto.codigo || "XXX"} - ${aeroporto.cidade}`;

  /* Guardar seleção no localStorage para uso posterior */
  localStorage.setItem("destinoSelecionado", JSON.stringify(aeroporto));
}

/* Função para fechar modal de destino */
function fecharModalDestino() {
  const modal = document.getElementById("modal-destino");
  const pesquisaInput = document.getElementById("pesquisa-destino");

  modal.classList.add("hidden");
  modal.classList.remove("flex");
  pesquisaInput.value = "";
}

/* variáveis globais para guardar valores */
let dataPartidaGlobal = "";
let dataRegressoGlobal = "";
let adultosGlobal = 1;
let criancasGlobal = 0;
let bebesGlobal = 0;

/* funcao para abrir modal de datas e viajantes */
function abrirModalDatas() {
  const modal = document.getElementById("modal-datas");

  /* mostrar modal */
  modal.classList.remove("hidden");
  modal.classList.add("flex");

  /* configurar valores salvos */
  let adultos = adultosGlobal;
  let criancas = criancasGlobal;
  let bebes = bebesGlobal;

  /* elementos dos contadores */
  const contadorAdultos = document.getElementById("contador-adultos");
  const contadorCriancas = document.getElementById("contador-criancas");
  const contadorBebes = document.getElementById("contador-bebes");
  const inputDataPartida = document.getElementById("data-partida");
  const inputDataRegresso = document.getElementById("data-regresso");

  /* carregar valores salvos */
  contadorAdultos.textContent = adultos;
  contadorCriancas.textContent = criancas;
  contadorBebes.textContent = bebes;
  inputDataPartida.value = dataPartidaGlobal;
  inputDataRegresso.value = dataRegressoGlobal;

  /* botoes para adultos */
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

  /* botoes para criancas */
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

  /* botoes para bebes */
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

  /* configurar datas minimas */
  const hoje = new Date().toISOString().split("T")[0];
  inputDataPartida.min = hoje;
  inputDataRegresso.min = hoje;

  /* quando a data de partida muda, ajustar data de regresso */
  inputDataPartida.addEventListener("change", (e) => {
    inputDataRegresso.min = e.target.value;
  });

  /* botao confirmar */
  document.getElementById("confirmar-datas").addEventListener("click", () => {
    const dataPartida = inputDataPartida.value;
    const dataRegresso = inputDataRegresso.value;

    if (dataPartida && dataRegresso) {
      /* guardar valores nas variaveis globais */
      dataPartidaGlobal = dataPartida;
      dataRegressoGlobal = dataRegresso;
      adultosGlobal = adultos;
      criancasGlobal = criancas;
      bebesGlobal = bebes;

      confirmarDatasViajantes(
        dataPartida,
        dataRegresso,
        adultos,
        criancas,
        bebes
      );
      fecharModalDatas();
    }
  });

  /* evento para fechar modal */
  document
    .getElementById("fechar-modal-datas")
    .addEventListener("click", fecharModalDatas);

  /* fechar modal ao clicar fora */
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      fecharModalDatas();
    }
  });
}

/* funcao para confirmar selecao de datas e viajantes */
function confirmarDatasViajantes(
  dataPartida,
  dataRegresso,
  adultos,
  criancas,
  bebes
) {
  /* formatar datas para mostrar */
  const partida = new Date(dataPartida);
  const regresso = new Date(dataRegresso);

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

  /* calcular total de viajantes */
  const totalViajantes = adultos + criancas + bebes;
  const textoViajantes =
    totalViajantes === 1 ? "1 Viajante" : `${totalViajantes} Viajantes`;

  /* atualizar o botao */
  const btnDatas = document.getElementById("btn-datas");
  const textoDatas = btnDatas.querySelector("div:first-child p");
  const textoViajantesElemento = btnDatas.querySelector("div:nth-child(2) p");

  /* mostrar datas formatadas */
  textoDatas.textContent = `${dataPartidaFormatada} - ${dataRegressoFormatada}`;

  /* mostrar numero de viajantes */
  textoViajantesElemento.textContent = textoViajantes;

  /* guardar selecao na localStorage */
  const selecao = {
    dataPartida: dataPartida,
    dataRegresso: dataRegresso,
    adultos: adultos,
    criancas: criancas,
    bebes: bebes,
    totalViajantes: totalViajantes,
  };
  localStorage.setItem("datasViajantes", JSON.stringify(selecao));
}

/* funcao para fechar modal de datas */
function fecharModalDatas() {
  const modal = document.getElementById("modal-datas");

  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

/* --- Table & Form Logic --- */

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
      {
        icon: "delete",
        class: "text-red-600",
        handler: Flight.deleteTrip,
      },
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

// --- Home Card Renderer ---

export function renderRandomOPOCards(containerClass) {
  /*   const viagens = JSON.parse(localStorage.getItem("viagens")) || [];
  const opoViagens = viagens.filter((v) => v.origem === "OPO - Porto");
  const shuffled = opoViagens.sort(() => 0.5 - Math.random()).slice(0, 18); */

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

    container.innerHTML += `
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
          <a href="#" class="absolute bottom-4 right-4 h-8 px-2.5 py-3.5 bg-Main-Secondary dark:bg-cyan-800 rounded-lg  inline-flex justify-center items-center gap-2.5 text-white text-base font-bold font-['Space_Mono'] hover:bg-Main-Primary dark:hover:bg-cyan-600 transition duration-300 ease-in-out">Ver oferta</a>
          <span 
            class="absolute top-4 right-6 material-symbols-outlined text-red-500 cursor-pointer transition-all duration-300 ease-in-out favorite-icon"
            data-favorito="false" 
          >favorite</span>
        </div>
      </div>
      `;
  });

  // Ativar toggle de favorito
  container.querySelectorAll(".favorite-icon").forEach((icon) => {
    // Definir o estado visual inicial com base no atributo data-favorito
    const initialIsFav = icon.getAttribute("data-favorito") === "true";
    icon.style.fontVariationSettings = initialIsFav ? "'FILL' 1" : "'FILL' 0";

    icon.addEventListener("click", function () {
      const currentIsFav = this.getAttribute("data-favorito") === "true";
      const newIsFav = !currentIsFav;

      this.setAttribute("data-favorito", String(newIsFav));

      // Altera diretamente o estilo inline para 'FILL' 1 (preenchido) ou 'FILL' 0 (contorno)
      if (newIsFav) {
        this.style.fontVariationSettings = "'FILL' 1";
      } else {
        this.style.fontVariationSettings = "'FILL' 0";
      }

      // Animação de feedback visual
      this.classList.add("scale-110");
      setTimeout(() => this.classList.remove("scale-110"), 150);
    });
  });
}

/* array de acessibilidades disponiveis */
const acessibilidades = [
  {
    id: "cadeira_rodas",
    nome: "Acesso para cadeira de rodas",
    icone: "accessible",
  },
  {
    id: "deficiencia_visual",
    nome: "Apoio para deficiência visual",
    icone: "visibility_off",
  },
  {
    id: "deficiencia_auditiva",
    nome: "Apoio para deficiência auditiva",
    icone: "hearing_disabled",
  },
  { id: "mobilidade_reduzida", nome: "Mobilidade reduzida", icone: "elderly" },
  {
    id: "assistencia_medica",
    nome: "Assistência médica",
    icone: "medical_services",
  },
  { id: "zona_segura", nome: "Zona segura", icone: "shield" },
  { id: "emergencia", nome: "Apoio de emergência", icone: "emergency" },
  { id: "criancas", nome: "Segurança para crianças", icone: "child_care" },
];

/* variavel global para guardar acessibilidades selecionadas */
let acessibilidadesSelecionadas = [];

/* funcao para abrir modal de acessibilidade */
function abrirModalAcessibilidade() {
  const modal = document.getElementById("modal-acessibilidade");
  const listaAcessibilidades = document.getElementById("lista-acessibilidades");
  const pesquisaInput = document.getElementById("pesquisa-acessibilidade");

  /* obter acessibilidades da localStorage */
  const acessibilidades =
    JSON.parse(localStorage.getItem("acessibilidade")) || [];

  /* mostrar modal */
  modal.classList.remove("hidden");
  modal.classList.add("flex");

  /* funcao para mostrar lista de acessibilidades */
  function mostrarAcessibilidades(lista) {
    listaAcessibilidades.innerHTML = "";

    lista.forEach((acessibilidade, index) => {
      const li = document.createElement("li");
      li.className =
        "p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors";

      /* verificar se esta selecionada */
      const selecionada = acessibilidadesSelecionadas.includes(index);

      /* escolher icone baseado no tipo de acessibilidade */
      let icone = "accessibility";
      if (acessibilidade.includes("Elevador")) icone = "elevator";
      else if (acessibilidade.includes("Banho")) icone = "wc";
      else if (acessibilidade.includes("Quarto")) icone = "bed";
      else if (acessibilidade.includes("Transporte")) icone = "directions_bus";
      else if (acessibilidade.includes("Braille")) icone = "visibility_off";
      else if (acessibilidade.includes("Alarme")) icone = "hearing_disabled";
      else if (acessibilidade.includes("Cães")) icone = "pets";
      else if (acessibilidade.includes("Sensorial")) icone = "psychology";
      else if (acessibilidade.includes("Alimentar")) icone = "restaurant";
      else if (acessibilidade.includes("Comunicação")) icone = "chat";
      else if (acessibilidade.includes("Aluguer")) icone = "wheelchair_pickup";
      else if (acessibilidade.includes("Táteis")) icone = "touch_app";
      else if (acessibilidade.includes("Médicos")) icone = "medical_services";
      else if (acessibilidade.includes("LGBTQIA")) icone = "favorite";
      else if (acessibilidade.includes("Inclusivo")) icone = "groups";
      else if (acessibilidade.includes("Minorias")) icone = "diversity_3";
      else if (acessibilidade.includes("Neutras")) icone = "family_restroom";

      li.innerHTML = `
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-Main-Primary dark:text-cyan-400">${icone}</span>
            <p class="font-semibold text-gray-900 dark:text-white">${acessibilidade}</p>
          </div>
          <div class="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded flex items-center justify-center ${
            selecionada ? "bg-Main-Primary dark:bg-cyan-400" : ""
          }">
            ${
              selecionada
                ? '<span class="material-symbols-outlined text-white text-sm">check</span>'
                : ""
            }
          </div>
        </div>
      `;

      /* evento de clique para selecionar/desselecionar */
      li.addEventListener("click", () => {
        toggleAcessibilidade(index);
        mostrarAcessibilidades(lista);
      });

      listaAcessibilidades.appendChild(li);
    });
  }

  /* mostrar todas as acessibilidades inicialmente */
  mostrarAcessibilidades(acessibilidades);

  /* pesquisa em tempo real */
  pesquisaInput.addEventListener("input", (e) => {
    const termoPesquisa = e.target.value.toLowerCase();
    const acessibilidadesFiltradas = acessibilidades.filter((acessibilidade) =>
      acessibilidade.toLowerCase().includes(termoPesquisa)
    );
    mostrarAcessibilidades(acessibilidadesFiltradas);
  });

  /* evento para confirmar selecao */
  document
    .getElementById("confirmar-acessibilidade")
    .addEventListener("click", () => {
      confirmarAcessibilidade();
      fecharModalAcessibilidade();
    });

  /* evento para fechar modal */
  document
    .getElementById("fechar-modal-acessibilidade")
    .addEventListener("click", fecharModalAcessibilidade);

  /* fechar modal ao clicar fora */
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      fecharModalAcessibilidade();
    }
  });
}

/* funcao para selecionar/desselecionar acessibilidade */
function toggleAcessibilidade(index) {
  const posicao = acessibilidadesSelecionadas.indexOf(index);
  if (posicao > -1) {
    /* remover se ja esta selecionada */
    acessibilidadesSelecionadas.splice(posicao, 1);
  } else {
    /* adicionar se nao esta selecionada */
    acessibilidadesSelecionadas.push(index);
  }
}

/* funcao para confirmar selecao de acessibilidade */
function confirmarAcessibilidade() {
  const textoAcessibilidade = document.getElementById("texto-acessibilidade");
  const quantidadeSelecionada = acessibilidadesSelecionadas.length;

  /* atualizar texto do botao */
  if (quantidadeSelecionada === 0) {
    textoAcessibilidade.textContent = "Nenhum";
  } else if (quantidadeSelecionada === 1) {
    textoAcessibilidade.textContent = "1 selecionado";
  } else {
    textoAcessibilidade.textContent = `${quantidadeSelecionada} selecionados`;
  }

  /* guardar selecao na localStorage */
  localStorage.setItem(
    "acessibilidadesSelecionadas",
    JSON.stringify(acessibilidadesSelecionadas)
  );
}

/* funcao para fechar modal de acessibilidade */
function fecharModalAcessibilidade() {
  const modal = document.getElementById("modal-acessibilidade");
  const pesquisaInput = document.getElementById("pesquisa-acessibilidade");

  modal.classList.add("hidden");
  modal.classList.remove("flex");
  pesquisaInput.value = "";
}
