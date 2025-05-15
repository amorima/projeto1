import StorageModel from '../models/StorageModel.js';
import AirportModel from '../models/AirportModel.js';
import { getFormData, showToast, closeModal, selectOptions, updateTable } from './ViewHelpers.js';

export default class AirportView {
  static async init() {
    await StorageModel.loadInitialData();
    AirportModel.init();
    
    const data = AirportModel.getAll();
    const config = {
      data,
      columns: [
        /* defina as colunas para airports: ex { key: 'campo1' }, { key: 'campo2' } */
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

    document.getElementById('add_airport_form')
      .addEventListener('submit', e => {
        e.preventDefault();
        this.create(config);
      });
  }

  static create(config) {
    const data = getFormData('add_airport_form');
    AirportModel.add(data);
    showToast('Airport adicionado com sucesso!');
    closeModal('modal-adicionar', 'add_airport_form', 'Adicionar Airport');
    config.data = AirportModel.getAll();
    updateTable(config);
  }

  // Métodos edit(id) e delete(id) podem ser implementados aqui...
}
