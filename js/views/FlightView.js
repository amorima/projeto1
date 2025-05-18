import StorageModel from "../models/StorageModel.js";
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
  if (!slider || !btnLeft || !btnRight) return;

  // quanto rolar ao clicar setas (20% da largura visível)
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

  // desktop: mouse
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
});

export default class FlightView {
  static async init() {
    await StorageModel.loadInitialData();
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

  // Métodos edit(id) e delete(id) podem ser implementados aqui...
}
