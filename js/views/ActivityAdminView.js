// ActivityAdminView.js - View for activity admin management

import { showToast, openModal, closeModal } from './ViewHelpers.js';
import { ActivityModel } from '../models/ActivityModel.js';

// State variables
let currentActivities = [];
let currentPage = 1;
let rowsPerPage = 10;
let sortField = 'act_name';
let sortAscending = true;
let editingActivity = null;
let selectedAccessibility = [];

// Initialize the activity admin view
function initActivityAdmin() {
    setupEventListeners();
    loadActivities();
    loadDestinations();
    loadTourismTypes();
}

// Setup all event listeners
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    // Add activity button
    const addBtn = document.getElementById('add-activity-btn');
    if (addBtn) {
        addBtn.addEventListener('click', () => openAddActivityModal());
    }

    // Form submission
    const createBtn = document.getElementById('create-activity-btn');
    if (createBtn) {
        createBtn.addEventListener('click', handleFormSubmit);
    }    // Cancel button
    const cancelBtn = document.getElementById('cancel-activity-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => closeActivityModal());
    }

    // Accessibility management
    const addAccessibilityBtn = document.getElementById('add-accessibility-btn');
    if (addAccessibilityBtn) {
        addAccessibilityBtn.addEventListener('click', handleAddAccessibility);
    }

    // Sort table headers
    setupSortListeners();
}

// Setup sorting listeners for table headers
function setupSortListeners() {
    const sortableHeaders = document.querySelectorAll('[data-sort]');
    sortableHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const field = header.dataset.sort;
            handleSort(field);
        });
    });
}

// Handle search functionality
function handleSearch(event) {
    const searchTerm = event.target.value;
    const filteredActivities = ActivityModel.search(searchTerm);
    currentActivities = ActivityModel.sort(filteredActivities, sortField, sortAscending);
    currentPage = 1;
    renderTable();
}

// Handle sorting
function handleSort(field) {
    if (sortField === field) {
        sortAscending = !sortAscending;
    } else {
        sortField = field;
        sortAscending = true;
    }

    currentActivities = ActivityModel.sort(currentActivities, sortField, sortAscending);
    updateSortIcons(field, sortAscending);
    renderTable();
}

// Update sort icons in table headers
function updateSortIcons(activeColumn, ascending) {
    // Reset all icons
    const allIcons = document.querySelectorAll('[id^="sort-icon-"]');
    allIcons.forEach(icon => {
        icon.textContent = 'unfold_more';
        icon.classList.remove('text-primary');
        icon.classList.add('text-gray-400');
    });

    // Set active icon
    const activeIcon = document.getElementById(`sort-icon-${activeColumn}`);
    if (activeIcon) {
        activeIcon.textContent = ascending ? 'keyboard_arrow_up' : 'keyboard_arrow_down';
        activeIcon.classList.remove('text-gray-400');
        activeIcon.classList.add('text-primary');
    }
}

// Load all activities
function loadActivities() {
    try {
        const allActivities = ActivityModel.getAll();
        currentActivities = ActivityModel.sort(allActivities, sortField, sortAscending);
        renderTable();
    } catch (error) {
        showToast('Erro ao carregar atividades: ' + error.message, 'error');
    }
}

// Load destinations for dropdown
function loadDestinations() {
    try {
        const destinos = JSON.parse(localStorage.getItem('destinos') || '[]');
        const select = document.getElementById('act_destinoId');
        
        if (select) {
            // Clear existing options except the first one
            select.innerHTML = '<option value="">Selecionar...</option>';
            
            destinos.forEach(destino => {
                const option = document.createElement('option');
                option.value = destino.id;
                option.textContent = `${destino.cidade}, ${destino.pais}`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading destinations:', error);
    }
}

// Load tourism types for dropdown
function loadTourismTypes() {
    try {
        const tipos = JSON.parse(localStorage.getItem('tiposTurismo') || '[]');
        const select = document.getElementById('act_turism');
        
        if (select) {
            // Clear existing options except first one
            const defaultOptions = select.innerHTML;
            select.innerHTML = '<option value="">Selecionar...</option>';
            
            if (tipos.length > 0) {
                tipos.forEach(tipo => {
                    const option = document.createElement('option');
                    // Handle both string and object formats
                    const tipoName = typeof tipo === 'string' ? tipo : tipo.nome;
                    option.value = tipoName;
                    option.textContent = tipoName;
                    select.appendChild(option);
                });
            } else {
                // Fallback to default options
                select.innerHTML = defaultOptions;
            }
        }
    } catch (error) {
        console.error('Error loading tourism types:', error);
    }
}

// Render the activities table
function renderTable() {
    const tbody = document.getElementById('tableContent');
    if (!tbody) return;

    // Calculate pagination
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageActivities = currentActivities.slice(start, end);

    if (pageActivities.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    <div class="flex flex-col items-center gap-2">
                        <span class="material-symbols-outlined text-4xl">search_off</span>
                        <span>Nenhuma atividade encontrada</span>
                    </div>
                </td>
            </tr>
        `;
    } else {
        tbody.innerHTML = pageActivities.map(activity => createActivityRow(activity)).join('');
    }

    // Update pagination
    updatePaginationControls();
}

// Create a table row for an activity
function createActivityRow(activity) {
    const destinationName = ActivityModel.getDestinationName(activity.destinoId);
    const accessibilityDisplay = getAccessibilityBadge(activity.acessibilidade);
    
    return `
        <tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
            <td class="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                ${destinationName}
            </td>
            <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    ${activity.tipoTurismo}
                </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                ${activity.nome}
            </td>
            <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                <div class="max-w-xs truncate" title="${activity.descricao}">
                    ${activity.descricao || 'Sem descrição'}
                </div>
            </td>
            <td class="px-6 py-4 text-sm">
                ${accessibilityDisplay}
            </td>
            <td class="px-6 py-4 text-sm text-right">
                <div class="flex items-center justify-end gap-2">
                    <button 
                        onclick="openEditActivityModal(${activity.id})"
                        class="p-1.5 text-primary hover:text-primary-dark hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors duration-150"
                        title="Editar atividade"
                    >
                        <span class="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button 
                        onclick="deleteActivity(${activity.id})"
                        class="p-1.5 text-red-600 hover:text-red-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors duration-150"
                        title="Apagar atividade"
                    >
                        <span class="material-symbols-outlined text-lg">delete</span>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

// Get accessibility badge
function getAccessibilityBadge(acessibilidade) {
    if (!Array.isArray(acessibilidade) || acessibilidade.length === 0) {
        return '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">Não especificado</span>';
    }

    // Show first accessibility option in pill and count outside
    const firstOption = acessibilidade[0];
    const additionalCount = acessibilidade.length - 1;
    
    // Create a tooltip with all accessibility options
    const allOptions = acessibilidade.join(', ');
    
    let html = `<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 cursor-help" title="${allOptions}">${firstOption}</span>`;
    
    if (additionalCount > 0) {
        html += ` <span class="text-xs text-gray-500 dark:text-gray-400 ml-1">+${additionalCount} mais</span>`;
    }
    
    return html;
}

// Update pagination controls
function updatePaginationControls() {
    const totalPages = Math.ceil(currentActivities.length / rowsPerPage);
    const startItem = currentActivities.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
    const endItem = Math.min(currentPage * rowsPerPage, currentActivities.length);

    // Update pagination info
    const paginationInfo = document.querySelector('#pagination-controls .text-sm');
    if (paginationInfo) {
        paginationInfo.innerHTML = `
            A mostrar <span class="font-medium">${startItem}</span> a 
            <span class="font-medium">${endItem}</span> de 
            <span class="font-medium">${currentActivities.length}</span> resultados
        `;
    }

    // Update pagination buttons
    const buttonsContainer = document.querySelector('#pagination-controls .flex.items-center.gap-1');
    if (buttonsContainer) {
        buttonsContainer.innerHTML = createPaginationButtons(totalPages);
    }
}

// Create pagination buttons
function createPaginationButtons(totalPages) {
    if (totalPages <= 1) {
        return '<span class="text-sm text-gray-500 dark:text-gray-400">Página 1 de 1</span>';
    }

    let buttons = `
        <button 
            onclick="changePage(${currentPage - 1})" 
            ${currentPage === 1 ? 'disabled' : ''}
            class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-gray-600 rounded-lg border border-gray-300 dark:border-gray-600 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <span class="material-symbols-outlined text-lg">chevron_left</span>
        </button>
    `;

    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
        const isActive = i === currentPage;
        buttons += `
            <button 
                onclick="changePage(${i})"
                class="px-3 py-2 text-sm font-medium ${isActive 
                    ? 'text-white bg-primary' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                } rounded-lg transition-colors duration-150"
            >
                ${i}
            </button>
        `;
    }

    buttons += `
        <button 
            onclick="changePage(${currentPage + 1})" 
            ${currentPage === totalPages ? 'disabled' : ''}
            class="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-gray-600 rounded-lg border border-gray-300 dark:border-gray-600 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <span class="material-symbols-outlined text-lg">chevron_right</span>
        </button>
    `;

    return buttons;
}

// Change page function
window.changePage = function(page) {
    const totalPages = Math.ceil(currentActivities.length / rowsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderTable();
    }
};

// Open add activity modal
function openAddActivityModal() {
    editingActivity = null;
    clearForm();
    
    // Update modal title and button
    const modalTitle = document.querySelector('#modal-adicionar h3');
    const submitBtn = document.getElementById('create-activity-btn');
    
    if (modalTitle) modalTitle.textContent = 'Adicionar Nova Atividade';
    if (submitBtn) {
        submitBtn.innerHTML = '<span class="material-symbols-outlined text-lg">add</span><span>Adicionar</span>';
    }
    
    openModal('modal-adicionar');
}

// Open edit activity modal
window.openEditActivityModal = function(activityId) {
    const activity = ActivityModel.getById(activityId);
    if (!activity) {
        showToast('Atividade não encontrada', 'error');
        return;
    }

    editingActivity = activity;
    fillForm(activity);
    
    // Update modal title and button
    const modalTitle = document.querySelector('#modal-adicionar h3');
    const submitBtn = document.getElementById('create-activity-btn');
    
    if (modalTitle) modalTitle.textContent = 'Editar Atividade';
    if (submitBtn) {
        submitBtn.innerHTML = '<span class="material-symbols-outlined text-lg">save</span><span>Guardar</span>';
    }
    
    openModal('modal-adicionar');
};

// Delete activity
window.deleteActivity = function(activityId) {
    const activity = ActivityModel.getById(activityId);
    if (!activity) {
        showToast('Atividade não encontrada', 'error');
        return;
    }

    if (confirm(`Tem certeza que deseja apagar a atividade "${activity.nome}"?`)) {
        const result = ActivityModel.delete(activityId);
        
        if (result.success) {
            showToast('Atividade apagada com sucesso', 'success');
            loadActivities();
        } else {
            showToast('Erro ao apagar atividade: ' + result.error, 'error');
        }
    }
};

// Handle form submission
function handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = getFormData();
    if (!formData) return;
    
    let result;
    if (editingActivity) {
        result = ActivityModel.update(editingActivity.id, formData);
    } else {
        result = ActivityModel.add(formData);
    }
    
    if (result.success) {
        const action = editingActivity ? 'atualizada' : 'adicionada';
        showToast(`Atividade ${action} com sucesso`, 'success');
        closeActivityModal();
        loadActivities();
    } else {
        showToast('Erro: ' + result.error, 'error');
    }
}

// Get form data
function getFormData() {
    const nome = document.getElementById('act_name')?.value?.trim();
    const destinoId = document.getElementById('act_destinoId')?.value;
    const tipoTurismo = document.getElementById('act_turism')?.value;
    const descricao = document.getElementById('act_description')?.value?.trim();

    // Validation
    if (!nome) {
        showToast('Por favor, insira o nome da atividade', 'error');
        return null;
    }
    
    if (!destinoId) {
        showToast('Por favor, selecione um destino', 'error');
        return null;
    }
    
    if (!tipoTurismo) {
        showToast('Por favor, selecione o tipo de turismo', 'error');
        return null;
    }

    // If no accessibility options selected, use default
    if (selectedAccessibility.length === 0) {
        selectedAccessibility.push('Não especificado');
    }

    return {
        nome,
        destinoId: parseInt(destinoId),
        tipoTurismo,
        descricao: descricao || '',
        acessibilidade: [...selectedAccessibility]
    };
}

// Fill form with activity data
function fillForm(activity) {
    document.getElementById('act_name').value = activity.nome || '';
    document.getElementById('act_destinoId').value = activity.destinoId || '';
    document.getElementById('act_turism').value = activity.tipoTurismo || '';
    document.getElementById('act_description').value = activity.descricao || '';
    
    // Set selected accessibility options
    selectedAccessibility = Array.isArray(activity.acessibilidade) ? [...activity.acessibilidade] : [];
    updateSelectedAccessibility();
}

// Clear form
function clearForm() {
    document.getElementById('act_name').value = '';
    document.getElementById('act_destinoId').value = '';
    document.getElementById('act_turism').value = '';
    document.getElementById('act_description').value = '';
    
    // Clear selected accessibility options
    selectedAccessibility = [];
    updateSelectedAccessibility();
}

// Close activity modal
function closeActivityModal() {
    closeModal('modal-adicionar');
    clearForm();
    editingActivity = null;
}

// Handle accessibility addition
function handleAddAccessibility() {
    const select = document.getElementById('accessibility-select');
    const selectedOption = select.value;
    
    if (selectedOption && !selectedAccessibility.includes(selectedOption)) {
        selectedAccessibility.push(selectedOption);
        updateSelectedAccessibility();
        select.value = '';
    }
}

// Update selected accessibility display
function updateSelectedAccessibility() {
    const container = document.getElementById('selected-accessibility');
    if (!container) return;
    
    container.innerHTML = selectedAccessibility.map(acc => `
        <span class="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm">
            ${acc}
            <button type="button" onclick="removeAccessibility('${acc}')" class="hover:bg-green-200 dark:hover:bg-green-800 rounded-full p-0.5">
                <span class="material-symbols-outlined text-sm">close</span>
            </button>
        </span>
    `).join('');
}

// Remove accessibility (global function for onclick)
window.removeAccessibility = function(acc) {
    selectedAccessibility = selectedAccessibility.filter(a => a !== acc);
    updateSelectedAccessibility();
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.body.querySelector('#add-activity-btn')) {
        initActivityAdmin();
    }
});
