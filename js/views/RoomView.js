import StorageModel from '../models/StorageModel.js';
import RoomModel from '../models/RoomModel.js';
import { getFormData, showToast, closeModal, selectOptions, updateTable } from './ViewHelpers.js';

export default class RoomView {
  static async init() {
    await StorageModel.loadInitialData();
    RoomModel.init();
    
    const data = RoomModel.getAll();
    const config = {
      data,
      columns: [
        /* defina as colunas para rooms: ex { key: 'campo1' }, { key: 'campo2' } */
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

    document.getElementById('add_room_form')
      .addEventListener('submit', e => {
        e.preventDefault();
        this.create(config);
      });
  }

  static create(config) {
    const data = getFormData('add_room_form');
    RoomModel.add(data);
    showToast('Room adicionado com sucesso!');
    closeModal('modal-adicionar', 'add_room_form', 'Adicionar Room');
    config.data = RoomModel.getAll();
    updateTable(config);
  }

  // Métodos edit(id) e delete(id) podem ser implementados aqui...
}
