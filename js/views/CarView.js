import StorageModel from '../models/StorageModel.js';
import CarModel from '../models/CarModel.js';
import { getFormData, showToast, closeModal, selectOptions, updateTable } from './ViewHelpers.js';

export default class CarView {
  static async init() {
    await StorageModel.loadInitialData();
    CarModel.init();
    
    const data = CarModel.getAll();
    const config = {
      data,
      columns: [
        /* defina as colunas para cars: ex { key: 'campo1' }, { key: 'campo2' } */
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

    document.getElementById('add_car_form')
      .addEventListener('submit', e => {
        e.preventDefault();
        this.create(config);
      });
  }

  static create(config) {
    const data = getFormData('add_car_form');
    CarModel.add(data);
    showToast('Car adicionado com sucesso!');
    closeModal('modal-adicionar', 'add_car_form', 'Adicionar Car');
    config.data = CarModel.getAll();
    updateTable(config);
  }

  // Métodos edit(id) e delete(id) podem ser implementados aqui...
}
