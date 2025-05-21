import * as Flight from "../models/FlightModel.js";
import {
  showCookieBanner,
  getFormData,
  showToast,
  closeModal,
  selectOptions,
  updateTable,
} from "./ViewHelpers.js";

// Main init function to be called on DOMContentLoaded
function initView() {
  showCookieBanner();
  initSlider();
  setupModalButton();

  // Render random OPO cards on homepage if container exists
  if (document.querySelector(".card-viagens")) {
    renderRandomOPOCards("card-viagens");
  }

  // Initialize table view
  Flight.init();
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
    btnOpenModal.addEventListener("click", () => {
      openModal("modal-from");
    });
  }
}

// --- Table & Form Logic ---

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
  const viagens = JSON.parse(localStorage.getItem("viagens")) || [];
  const opoViagens = viagens.filter((v) => v.origem === "OPO - Porto");
  const shuffled = opoViagens.sort(() => 0.5 - Math.random()).slice(0, 18);

  const container = document.querySelector(`.${containerClass}`);
  if (!container) return;
  container.innerHTML = "";

  shuffled.forEach((viagem) => {
    const cidade = viagem.destino || "Destino";

    const formatarData = (dataStr) => {
      if (!dataStr) return "";
      const [dia, mes, anoHora] = dataStr.split("/");
      const [ano, hora] = anoHora.split(" ");
      const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
      return `${dia} ${meses[parseInt(mes, 10) - 1]}`;
    };

    const dataPartida = formatarData(viagem.partida);
    const dataVolta = formatarData(viagem.dataVolta);
    const datas = dataPartida && dataVolta ? `${dataPartida} - ${dataVolta}` : "";

    const preco = viagem.custo || "-";
    const imagem = viagem.imagem || "https://placehold.co/413x327";

    container.innerHTML += `
      <div class="bg-white w-full relative rounded-lg shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)] border border-gray-200 overflow-hidden">
        <img class="w-full h-80 object-cover" src="${imagem}" alt="Imagem do destino">
        <div class="p-4">
          <p class="text-Text-Body text-2xl font-bold font-['Space_Mono'] mb-2">${cidade}</p>
          <div class="inline-flex">
            <span class="material-symbols-outlined text-Text-Subtitles">calendar_month</span>
            <p class="text-Text-Subtitles align-bottom font-normal font-['IBM_Plex_Sans'] mb-4">${datas}</p>
          </div>
          <p class="text-Button-Main text-3xl font-bold font-['IBM_Plex_Sans']">${preco} €</p>
          <p class="justify-start text-Text-Subtitles text-xs font-light font-['IBM_Plex_Sans'] leading-none">Transporte para 1 pessoa</p>
          <a href="#" class="absolute bottom-4 right-4 h-8 px-2.5 py-3.5 bg-Main-Secondary rounded-lg  inline-flex justify-center items-center gap-2.5 text-white text-base font-bold font-['Space_Mono'] hover:bg-Main-Primary transition duration-300 ease-in-out">Ver oferta</a>
          <span class="absolute top-4 right-6 material-symbols-outlined text-text-Text-Subtitles cursor-pointer">favorite</span>
        </div>
      </div>
      `;
  });
}
initView()