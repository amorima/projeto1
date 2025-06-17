// TurismAdminView.js - Inline Tourism Types Admin Management

import { openModal, closeModal, showToast } from './ViewHelpers.js';
import { TurismModel } from '../models/TurismModel.js';

let currentEditType = null;
let sortAscending = true;

// Initialize the tourism admin page
function initTurismAdmin() {
    setupEventListeners();
    loadTurismTypes();
    updateStats();
}

// Setup all event listeners
function setupEventListeners() {
    // Add tourism form
    const addForm = document.getElementById('add-turism-inline-form');
    if (addForm) {
        addForm.addEventListener('submit', handleAddTurismType);
    }

    // Search functionality
    const searchInput = document.getElementById('search-turism-inline');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    // Sort button
    const sortBtn = document.getElementById('sort-az-btn');
    if (sortBtn) {
        sortBtn.addEventListener('click', handleSort);
    }

    // Refresh button
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadTurismTypes();
            updateStats();
            showToast('Lista atualizada!', 'success');
        });
    }

    // Edit modal event listeners
    setupEditModalListeners();
}

// Setup edit modal event listeners
function setupEditModalListeners() {
    const editForm = document.getElementById('edit-turism-inline-form');
    if (editForm) {
        editForm.addEventListener('submit', handleEditTurismType);
    }

    const cancelEditBtn = document.getElementById('cancel-edit-turism-inline-btn');
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', () => {
            closeModal('modal-edit-turism-inline');
            currentEditType = null;
        });
    }
}

// Handle adding new tourism type
function handleAddTurismType(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const tipoTurismo = formData.get('tipoTurismo');
    
    if (!tipoTurismo || tipoTurismo.trim() === '') {
        showToast('Por favor, insira um tipo de turismo válido.', 'error');
        return;
    }

    const result = TurismModel.add(tipoTurismo);
    
    if (result.success) {
        showToast('Tipo de turismo adicionado com sucesso!', 'success');
        event.target.reset();
        loadTurismTypes();
        updateStats();
    } else {
        showToast(result.error, 'error');
    }
}

// Handle editing tourism type
function handleEditTurismType(event) {
    event.preventDefault();
    
    if (!currentEditType) {
        showToast('Erro: Tipo de turismo não selecionado.', 'error');
        return;
    }

    const formData = new FormData(event.target);
    const newValue = formData.get('tipoTurismo');
    
    if (!newValue || newValue.trim() === '') {
        showToast('Por favor, insira um tipo de turismo válido.', 'error');
        return;
    }

    const result = TurismModel.update(currentEditType, newValue);
    
    if (result.success) {
        showToast('Tipo de turismo atualizado com sucesso!', 'success');
        closeModal('modal-edit-turism-inline');
        loadTurismTypes();
        updateStats();
        currentEditType = null;
    } else {
        showToast(result.error, 'error');
    }
}

// Handle search functionality
function handleSearch(event) {
    const searchTerm = event.target.value;
    const filteredTypes = TurismModel.search(searchTerm);
    renderTurismTypes(filteredTypes);
    updateTypesCount(filteredTypes.length);
}

// Handle sorting
function handleSort() {
    const types = TurismModel.getAll();
    const sortedTypes = [...types].sort((a, b) => {
        if (sortAscending) {
            return a.localeCompare(b, 'pt', { sensitivity: 'base' });
        } else {
            return b.localeCompare(a, 'pt', { sensitivity: 'base' });
        }
    });
    
    sortAscending = !sortAscending;
    
    // Update button text
    const sortBtn = document.getElementById('sort-az-btn');
    const icon = sortBtn.querySelector('.material-symbols-outlined');
    const text = sortBtn.querySelector('span:not(.material-symbols-outlined)');
    
    if (sortAscending) {
        icon.textContent = 'sort_by_alpha';
        if (text) text.textContent = 'A-Z';
    } else {
        icon.textContent = 'sort_by_alpha';
        if (text) text.textContent = 'Z-A';
    }
    
    renderTurismTypes(sortedTypes);
}

// Load and render tourism types
function loadTurismTypes() {
    const types = TurismModel.getAll();
    renderTurismTypes(types);
    updateTypesCount(types.length);
}

// Update types count display
function updateTypesCount(count) {
    const countElement = document.getElementById('types-count');
    if (countElement) {
        countElement.textContent = `${count} tipo${count !== 1 ? 's' : ''} encontrado${count !== 1 ? 's' : ''}`;
    }
}

// Render tourism types grid
function renderTurismTypes(types) {
    const grid = document.getElementById('turism-types-grid');
    const emptyState = document.getElementById('empty-state');
    
    if (!grid) return;

    if (types.length === 0) {
        grid.classList.add('hidden');
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    }

    if (emptyState) emptyState.classList.add('hidden');
    grid.classList.remove('hidden');
    
    grid.innerHTML = types.map(tipo => createTurismTypeCard(tipo)).join('');
    
    // Add event listeners for edit and delete buttons
    setupCardEventListeners();
}

// Create individual tourism type card HTML
function createTurismTypeCard(tipo) {
    return `
        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between">
                <div class="flex-1 min-w-0">
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white truncate">${tipo}</h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Tipo de turismo</p>
                </div>
                <div class="flex items-center gap-1 ml-3">
                    <button 
                        class="edit-turism-card-btn p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors" 
                        data-tipo="${tipo}"
                        title="Editar">
                        <span class="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button 
                        class="delete-turism-card-btn p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors" 
                        data-tipo="${tipo}"
                        title="Eliminar">
                        <span class="material-symbols-outlined text-lg">delete</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Setup event listeners for cards
function setupCardEventListeners() {
    // Edit buttons
    document.querySelectorAll('.edit-turism-card-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tipo = e.currentTarget.dataset.tipo;
            openEditModal(tipo);
        });
    });

    // Delete buttons
    document.querySelectorAll('.delete-turism-card-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tipo = e.currentTarget.dataset.tipo;
            handleDeleteTurismType(tipo);
        });
    });
}

// Open edit modal for specific tourism type
function openEditModal(tipo) {
    currentEditType = tipo;
    const editInput = document.getElementById('edit-turism-type-inline');
    if (editInput) {
        editInput.value = tipo;
    }
    openModal('modal-edit-turism-inline');
}

// Handle deleting tourism type
function handleDeleteTurismType(tipo) {
    const result = TurismModel.delete(tipo);
    
    if (result.success) {
        showToast('Tipo de turismo eliminado com sucesso!', 'success');
        loadTurismTypes();
        updateStats();
    } else {
        showToast(result.error, 'error');
    }
}

// Update statistics display
function updateStats() {
    const types = TurismModel.getAll();
    
    // Total types
    const totalElement = document.getElementById('total-types');
    if (totalElement) {
        totalElement.textContent = types.length;
    }

    // Most popular (just pick the first one alphabetically for demo)
    const popularElement = document.getElementById('popular-type');
    if (popularElement) {
        if (types.length > 0) {
            const sortedTypes = [...types].sort((a, b) => a.localeCompare(b, 'pt', { sensitivity: 'base' }));
            popularElement.textContent = sortedTypes[0];
        } else {
            popularElement.textContent = '-';
        }
    }

    // Latest added (just pick the last one for demo)
    const latestElement = document.getElementById('latest-type');
    if (latestElement) {
        if (types.length > 0) {
            latestElement.textContent = types[types.length - 1];
        } else {
            latestElement.textContent = '-';
        }
    }
}

// Initialize the view when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.body.querySelector('#turism-types-grid')) {
        initTurismAdmin();
    }
});

// Export functions for potential external use
export { initTurismAdmin, loadTurismTypes, updateStats };
