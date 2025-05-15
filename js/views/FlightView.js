import StorageModel from '../models/StorageModel.js';
import FlightModel from '../models/FlightModel.js';
import { getFormData, showToast, closeModal, selectOptions, updateTable } from './ViewHelpers.js';

export default class FlightView {
  static async init() {
    await StorageModel.loadInitialData();
    FlightModel.init();
    
    const data = FlightModel.getAll();
    const config = {
      data,
      columns: [
        /* defina as colunas para flights: ex { key: 'campo1' }, { key: 'campo2' } */
      ],
      actions: [
        { label: '✏️', class: 'btn-edit', handler: id => this.edit(id) },
        { label: '❌', class: 'btn-del',  handler: id => this.delete(id) }
      ],
      rowsPerPage: 10,
      currentPage: 1,
      onPageChange: page => {
        config.currentPage = page;
        updateTable(config);
      }
    };
    updateTable(config);

    // TODO: preencher selects se necessário, e.g.:
    // selectOptions(StorageModel.getAll('destinations'), 'exemplo_select_id');

    document.getElementById('add_flight_form')
      .addEventListener('submit', e => {
        e.preventDefault();
        this.create(config);
      });
  }

  static create(config) {
    const data = getFormData('add_flight_form');
    FlightModel.add(data);
    showToast('Flight adicionado com sucesso!');
    closeModal('modal-adicionar', 'add_flight_form', 'Adicionar Flight');
    config.data = FlightModel.getAll();
    updateTable(config);
  }

  // Métodos edit(id) e delete(id) podem ser implementados aqui...
}
