import FlightModel from "../models/FlightModel.js";
import { showCookieBanner } from "./ViewHelpers.js";
import {
  getFormData,
  showToast,
  closeModal,
  selectOptions,
  updateTable,
} from "./ViewHelpers.js";

// aguarda o DOM
document.addEventListener("DOMContentLoaded", () => {
  //Inicialização do Cookie Banner
  showCookieBanner();

  // Inicialização do slider
  const slider = document.getElementById("slider");
  const btnLeft = document.getElementById("btn-left");
  const btnRight = document.getElementById("btn-right");
  const btnOpenModal = document.getElementById("btn-open");

  if (!slider || !btnLeft || !btnRight) return;

  // quanto rolar ao clicar setas (20% da largura visível)
  const scrollAmount = slider.clientWidth * 0.2;

  btnLeft.addEventListener("click", () =>
    slider.scrollBy({ left: -scrollAmount, behavior: "smooth" })
  );
  btnRight.addEventListener("click", () =>
    slider.scrollBy({ left: scrollAmount, behavior: "smooth" })
  );
  btnOpenModal.addEventListener("click", () => {
    openModal(`modal-from`);
  });

  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;

  // desktop: mouse
  slider.addEventListener("mousedown", (e) => {
    isDown = true;
    slider.classList.add("grabbing");
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
  });
  slider.addEventListener("mouseup", () => {
    isDown = false;
    0;
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
    const walk = (x - startX) * 1;
    slider.scrollLeft = scrollLeft - walk;
  });

  // mobile: touch
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
    const walk = (x - startX) * 1;
    slider.scrollLeft = scrollLeft - walk;
  });

  // Renderizar cards de viagens aleatórias de OPO na homepage
  if (document.querySelector(".card-viagens")) {
    FlightView.renderRandomOPOCards("card-viagens");
  }
});

export default class FlightView {
  static async init() {
    FlightModel.init();
    const data = FlightModel.getAll();
    const config = {
      data,
      columns: [
        { key: `name`, label: `NºVoo`, sortable: true },
        { key: `from`, label: `Origem`, sortable: true },
        { key: `to`, label: `Destino`, sortable: true },
        { key: `company`, label: `Companhia Aeria`, sortable: true },
        {
          key: `leaves`,
          label: `Horario de Partida`,
          sortable: true,
          type: `date`,
        },
        { key: `direct`, label: `Direto`, sortable: true },
      ],
      actions: [
        {
          icon: `edit_square`,
          class: `text-Main-Primary`,
          handler: FlightModel.update,
        },
        { icon: `delete`, class: `text-red-600`, handler: FlightModel.delete },
      ],
      rowsPerPage: 10,
      currentPage: 1,
      onPageChange: (page) => {
        config.currentPage = page;
        updateTable(config);
      },
    };
    updateTable(config);

    // TODO: preencher selects se necessário, e.g.:
    // selectOptions(StorageModel.getAll('destinations'), 'exemplo_select_id');

    document
      .getElementById("add_flight_form")
      .addEventListener("submit", (e) => {
        e.preventDefault();
        this.create(config);
      });
  }

  static create(config) {
    const data = getFormData("add_flight_form");
    FlightModel.add(data);
    showToast("Flight adicionado com sucesso!");
    closeModal("modal-adicionar", "add_flight_form", "Adicionar Flight");
    config.data = FlightModel.getAll();
    updateTable(config);
  }

  static async renderRandomOPOCards(containerClass) {
    // Buscar viagens diretamente da localStorage
    const viagens = JSON.parse(localStorage.getItem("viagens")) || [];
    // Filtrar viagens de OPO - Porto
    const opoViagens = viagens.filter((v) => v.origem === "OPO - Porto");
    // Embaralhar e escolher 18
    const shuffled = opoViagens.sort(() => 0.5 - Math.random()).slice(0, 18);
    // Obter container por classe
    const container = document.querySelector(`.${containerClass}`);
    if (!container) return;
    container.innerHTML = "";
    shuffled.forEach((viagem) => {
      // destino já é uma string
      const cidade = viagem.destino || "Destino";
      // Formatar datas (ex: 22 Mai - 27 Mai)
      const formatarData = (dataStr) => {
        if (!dataStr) return "";
        // Suporta formatos tipo "25/05/2025 08:15"
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
      const card = `
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
      container.innerHTML += card;
    });
  }
}
