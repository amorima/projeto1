import StorageModel from '../models/StorageModel.js';
import HotelModel from '../models/HotelModel.js';
import { getFormData, showToast, closeModal, selectOptions, updateTable } from './ViewHelpers.js';

export default class HotelView {
  static async init() {
    await StorageModel.loadInitialData();
    HotelModel.init();
    
    const data = HotelModel.getAll();
    const config = {
      data,
      columns: [
        /* defina as colunas para hotels: ex { key: 'campo1' }, { key: 'campo2' } */
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

    document.getElementById('add_hotel_form')
      .addEventListener('submit', e => {
        e.preventDefault();
        this.create(config);
      });
  }

  static create(config) {
    const data = getFormData('add_hotel_form');
    HotelModel.add(data);
    showToast('Hotel adicionado com sucesso!');
    closeModal('modal-adicionar', 'add_hotel_form', 'Adicionar Hotel');
    config.data = HotelModel.getAll();
    updateTable(config);
  }

  // Métodos edit(id) e delete(id) podem ser implementados aqui...
}
