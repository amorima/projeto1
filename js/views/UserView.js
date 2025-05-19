import StorageModel from '../models/StorageModel.js';
import UserModel from '../models/UserModel.js';
import { getFormData, showToast, closeModal, selectOptions, updateTable } from './ViewHelpers.js';

export default class UserView {
  static async init() {
    await StorageModel.loadInitialData();
    UserModel.init();
    
    const data = UserModel.getAll();
    const config = {
      data,
      columns: [
        /* defina as colunas para users: ex { key: 'campo1' }, { key: 'campo2' } */
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

    document.getElementById('add_user_form')
      .addEventListener('submit', e => {
        e.preventDefault();
        this.create(config);
      });
  }

  static create(config) {
    const data = getFormData('add_user_form');
    UserModel.add(data);
    showToast('User adicionado com sucesso!');
    closeModal('modal-adicionar', 'add_user_form', 'Adicionar User');
    config.data = UserModel.getAll();
    updateTable(config);
  }

  // Métodos edit(id) e delete(id) podem ser implementados aqui...
}
