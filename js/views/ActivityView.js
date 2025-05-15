import StorageModel from '../models/StorageModel.js';
import ActivityModel from '../models/ActivityModel.js';
import { getFormData, showToast, closeModal, selectOptions, updateTable } from './ViewHelpers.js';

export default class ActivityView {
  static async init() {
    await StorageModel.loadInitialData();
    ActivityModel.init();
    
    const data = ActivityModel.getAll();
    const config = {
      data,
      columns: [
        /* defina as colunas para activities: ex { key: 'campo1' }, { key: 'campo2' } */
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

    document.getElementById('add_activity_form')
      .addEventListener('submit', e => {
        e.preventDefault();
        this.create(config);
      });
  }

  static create(config) {
    const data = getFormData('add_activity_form');
    ActivityModel.add(data);
    showToast('Activity adicionado com sucesso!');
    closeModal('modal-adicionar', 'add_activity_form', 'Adicionar Activity');
    config.data = ActivityModel.getAll();
    updateTable(config);
  }

  // Métodos edit(id) e delete(id) podem ser implementados aqui...
}
