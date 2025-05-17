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

//Inicialização do Cookie Banner
document.addEventListener("DOMContentLoaded", () => {
  showCookieBanner();
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
