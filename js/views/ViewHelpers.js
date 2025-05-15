// ViewHelpers.js – funções de UI para as Views

export function getFormData(formId) {
  const form = document.getElementById(formId);
  const data = {};
  for (let el of form.elements) {
    const key = el.name || el.id;
    if (key) data[key] = el.value;
  }
  return data;
}

export function showToast(msg, type = 'success') {
  alert(msg);
}

export function closeModal(modalId, formId, modalTitle) {
  document.getElementById(modalId).classList.add('hidden');
  document.getElementById(formId).reset();
  document.querySelector(`#${modalId} h2`).innerText = modalTitle;
}

export function selectOptions(items, selectId) {
  const sel = document.getElementById(selectId);
  if (!sel) return;
  sel.innerHTML = '';
  items.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item.id;
    opt.textContent = item.name || item.destination_city || item.username || item.aero_code || item;
    sel.appendChild(opt);
  });
}

export function updatePaginationControls(config) {
  const { data, rowsPerPage = 10, currentPage = 1, onPageChange } = config;
  const container = document.getElementById('pagination-controls');
  if (!container) return;
  container.innerHTML = '';
  const totalPages = Math.ceil(data.length / rowsPerPage);
  const makeBtn = (label, page, disabled = false) => {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.disabled = disabled;
    if (!disabled) btn.addEventListener('click', () => onPageChange(page));
    return btn;
  };
  container.appendChild(makeBtn('<', currentPage > 1 ? currentPage - 1 : 1, currentPage <= 1));
  for (let p = 1; p <= totalPages; p++) {
    container.appendChild(makeBtn(p, p, p === currentPage));
  }
  container.appendChild(makeBtn('>', currentPage < totalPages ? currentPage + 1 : totalPages, currentPage >= totalPages));
}

export function updateTable(config) {
  const { data, columns, actions, rowsPerPage = 10, currentPage = 1, onPageChange } = config;
  const tbody = document.getElementById('tableContent');
  if (!tbody) return;
  tbody.innerHTML = '';
  const start = (currentPage - 1) * rowsPerPage;
  const slice = data.slice(start, start + rowsPerPage);
  slice.forEach(item => {
    const tr = document.createElement('tr');
    columns.forEach(col => {
      const td = document.createElement('td');
      td.textContent = item[col.key] ?? '';
      tr.appendChild(td);
    });
    if (actions) {
      const td = document.createElement('td');
      actions.forEach(a => {
        const btn = document.createElement('button');
        btn.textContent = a.label;
        btn.className = a.class;
        btn.addEventListener('click', () => a.handler(item.id));
        td.appendChild(btn);
      });
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  });
  if (typeof onPageChange === 'function') {
    updatePaginationControls({ data, rowsPerPage, currentPage, onPageChange });
  }
}
