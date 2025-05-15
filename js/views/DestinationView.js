import StorageModel from '../models/StorageModel.js';
import DestinationModel from '../models/DestinationModel.js';
import { getFormData, showToast, closeModal, selectOptions, updateTable } from './ViewHelpers.js';

export default class DestinationView {
  static async init() {
    await StorageModel.loadInitialData();
    DestinationModel.init();
    
    const data = DestinationModel.getAll();
    const config = {
      data,
      columns: [
        /* defina as colunas para destinations: ex { key: 'campo1' }, { key: 'campo2' } */
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

    document.getElementById('add_destination_form')
      .addEventListener('submit', e => {
        e.preventDefault();
        this.create(config);
      });
  }

  static create(config) {
    const data = getFormData('add_destination_form');
    DestinationModel.add(data);
    showToast('Destination adicionado com sucesso!');
    closeModal('modal-adicionar', 'add_destination_form', 'Adicionar Destination');
    config.data = DestinationModel.getAll();
    updateTable(config);
  }

  // Métodos edit(id) e delete(id) podem ser implementados aqui...
}
