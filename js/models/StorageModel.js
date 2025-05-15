// StorageModel.js – carrega dados iniciais de db.json para localStorage

export default class StorageModel {
  static async loadInitialData() {
    try {
      const res = await fetch('../db.json');
      const data = await res.json();
      for (const key in data) {
        localStorage.setItem(key, JSON.stringify(data[key] || []));
      }
    } catch (e) {
      console.error('Erro ao carregar db.json:', e);
    }
  }
}
