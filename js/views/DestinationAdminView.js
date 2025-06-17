// DestinationAdminView.js - View for destination admin management

import { showToast, openModal, closeModal } from './ViewHelpers.js';
import { DestinationModel } from '../models/DestinationModel.js';
import { TurismModel } from '../models/TurismModel.js';

// State variables
let currentDestinations = [];
let currentPage = 1;
let rowsPerPage = 10;
let sortField = 'cidade';
let sortAscending = true;
let selectedTourismTypes = [];
let selectedAccessibility = [];
let editingDestination = null;

// Initialize the destination admin view
function initDestinationAdmin() {
    setupEventListeners();
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

    // Add destination button
    const addBtn = document.getElementById('add-destination-btn');
    if (addBtn) {
        addBtn.addEventListener('click', () => openAddDestinationModal());
    }

    // Form submission
    const form = document.getElementById('add_destination_form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    // Cancel button
    const cancelBtn = document.getElementById('cancel-destination-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => closeDestinationModal());
    }

    // Tourism type management
    const addTourismBtn = document.getElementById('add-tourism-type-btn');
    if (addTourismBtn) {
        addTourismBtn.addEventListener('click', handleAddTourismType);
    }

    // Accessibility management
    const addAccessibilityBtn = document.getElementById('add-accessibility-btn');
    if (addAccessibilityBtn) {
        addAccessibilityBtn.addEventListener('click', handleAddAccessibility);
    }

    // Airport code formatting
    const airportInput = document.getElementById('aeroporto');
    if (airportInput) {
        airportInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase();
        });
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
    const filteredDestinations = DestinationModel.search(searchTerm);
    currentDestinations = DestinationModel.sort(filteredDestinations, sortField, sortAscending);
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
    
    updateSortIcons();
    currentDestinations = DestinationModel.sort(currentDestinations, sortField, sortAscending);
    renderTable();
}

// Update sort icons in table headers
function updateSortIcons() {
    // Reset all sort icons
    document.querySelectorAll('[id^="sort-icon-"]').forEach(icon => {
        icon.textContent = 'unfold_more';
        icon.className = 'material-symbols-outlined text-gray-400 text-lg';
    });
    
    // Update current sort field icon
    const currentIcon = document.getElementById(`sort-icon-${sortField}`);
    if (currentIcon) {
        currentIcon.textContent = sortAscending ? 'keyboard_arrow_up' : 'keyboard_arrow_down';
        currentIcon.className = 'material-symbols-outlined text-cyan-600 text-lg';
    }
}

// Load destinations and render table
function loadDestinations() {
    const destinations = DestinationModel.getAll();
    currentDestinations = DestinationModel.sort(destinations, sortField, sortAscending);
    updateSortIcons();
    renderTable();
}

// Load tourism types for the select dropdown
function loadTourismTypes() {
    const select = document.getElementById('tourism-type-select');
    if (!select) return;
    
    const tourismTypes = TurismModel.getAll();
    select.innerHTML = '<option value="">Selecionar tipo de turismo...</option>';
    
    tourismTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        select.appendChild(option);
    });
}

// Render the destinations table
function renderTable() {
    const tableBody = document.getElementById('tableContent');
    if (!tableBody) return;

    const paginatedResult = DestinationModel.paginate(currentDestinations, currentPage, rowsPerPage);
    const { data: destinations, pagination } = paginatedResult;

    if (destinations.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <div class="flex flex-col items-center gap-2">
                        <span class="material-symbols-outlined text-4xl">location_off</span>
                        <p>Nenhum destino encontrado</p>
                    </div>
                </td>
            </tr>
        `;
    } else {
        tableBody.innerHTML = destinations.map(destination => createDestinationRow(destination)).join('');
        setupRowEventListeners();
    }

    updatePagination(pagination);
}

// Create a table row for a destination
function createDestinationRow(destination) {
    const tourismTypesBadges = destination.tiposTurismo.slice(0, 2).map(type => 
        `<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">${type}</span>`
    ).join(' ');
    
    const moreTypes = destination.tiposTurismo.length > 2 ? 
        `<span class="text-xs text-gray-500">+${destination.tiposTurismo.length - 2} mais</span>` : '';

    const accessibilityBadges = destination.acessibilidade.slice(0, 1).map(acc => 
        `<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">${acc}</span>`
    ).join(' ');
    
    const moreAccessibility = destination.acessibilidade.length > 1 ? 
        `<span class="text-xs text-gray-500">+${destination.acessibilidade.length - 1} mais</span>` : '';

    return `
        <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900 dark:text-white">${destination.cidade}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900 dark:text-white">${destination.pais}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-mono font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">${destination.aeroporto}</div>
            </td>
            <td class="px-6 py-4">
                <div class="flex flex-wrap gap-1">
                    ${tourismTypesBadges}
                    ${moreTypes}
                </div>
            </td>
            <td class="px-6 py-4">
                <div class="flex flex-wrap gap-1">
                    ${accessibilityBadges}
                    ${moreAccessibility}
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end gap-2">
                    <button 
                        class="edit-destination-btn inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-150"
                        data-id="${destination.id}"
                    >
                        <span class="material-symbols-outlined text-sm">edit</span>
                        Editar
                    </button>
                    <button 
                        class="delete-destination-btn inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-150"
                        data-id="${destination.id}"
                    >
                        <span class="material-symbols-outlined text-sm">delete</span>
                        Eliminar
                    </button>
                </div>
            </td>
        </tr>
    `;
}

// Setup event listeners for table row buttons
function setupRowEventListeners() {
    // Edit buttons
    document.querySelectorAll('.edit-destination-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            openEditDestinationModal(id);
        });
    });

    // Delete buttons
    document.querySelectorAll('.delete-destination-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            handleDeleteDestination(id);
        });
    });
}

// Update pagination controls
function updatePagination(pagination) {
    const controls = document.getElementById('pagination-controls');
    if (!controls) return;

    const { currentPage, totalPages, totalItems, startIndex, endIndex } = pagination;

    // Update info text
    const infoText = controls.querySelector('.text-sm');
    if (infoText) {
        const spans = infoText.querySelectorAll('span');
        if (spans.length >= 3) {
            spans[0].textContent = startIndex;
            spans[1].textContent = endIndex;
            spans[2].textContent = totalItems;
        }
    }

    // Update pagination buttons
    const buttonContainer = controls.querySelector('.flex.items-center.gap-1');
    if (!buttonContainer) return;

    buttonContainer.innerHTML = '';

    // Previous button
    const prevBtn = createPaginationButton('←', currentPage - 1, currentPage === 1);
    buttonContainer.appendChild(prevBtn);

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            const pageBtn = createPaginationButton(i.toString(), i, false, i === currentPage);
            buttonContainer.appendChild(pageBtn);
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.className = 'px-2 text-gray-500';
            buttonContainer.appendChild(ellipsis);
        }
    }

    // Next button
    const nextBtn = createPaginationButton('→', currentPage + 1, currentPage === totalPages);
    buttonContainer.appendChild(nextBtn);
}

// Create pagination button
function createPaginationButton(text, page, disabled, active = false) {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.className = `px-3 py-2 text-sm rounded-lg transition-colors duration-150 ${
        disabled 
            ? 'text-gray-400 cursor-not-allowed' 
            : active
                ? 'bg-cyan-500 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
    }`;
    
    if (!disabled) {
        btn.addEventListener('click', () => {
            currentPage = page;
            renderTable();
        });
    }
    
    return btn;
}

// Open add destination modal
function openAddDestinationModal() {
    editingDestination = null;
    resetForm();
    updateModalTitle('Adicionar Novo Destino');
    openModal('modal-adicionar');
}

// Open edit destination modal
function openEditDestinationModal(id) {
    const destination = DestinationModel.getById(id);
    if (!destination) {
        showToast('Destino não encontrado', 'error');
        return;
    }

    editingDestination = destination;
    populateForm(destination);
    updateModalTitle('Editar Destino');
    openModal('modal-adicionar');
}

// Close destination modal
function closeDestinationModal() {
    closeModal('modal-adicionar');
    resetForm();
    editingDestination = null;
}

// Update modal title
function updateModalTitle(title) {
    const titleElement = document.querySelector('#modal-adicionar h3');
    if (titleElement) {
        titleElement.textContent = title;
    }
}

// Reset form
function resetForm() {
    const form = document.getElementById('add_destination_form');
    if (form) form.reset();
    
    selectedTourismTypes = [];
    selectedAccessibility = [];
    updateSelectedTourismTypes();
    updateSelectedAccessibility();
}

// Populate form with destination data
function populateForm(destination) {
    document.getElementById('id').value = destination.id;
    document.getElementById('cidade').value = destination.cidade;
    document.getElementById('pais').value = destination.pais;
    document.getElementById('aeroporto').value = destination.aeroporto;
    
    selectedTourismTypes = [...destination.tiposTurismo];
    selectedAccessibility = [...destination.acessibilidade];
    updateSelectedTourismTypes();
    updateSelectedAccessibility();
}

// Handle form submission
function handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const destinationData = {
        cidade: formData.get('cidade'),
        pais: formData.get('pais'),
        aeroporto: formData.get('aeroporto'),
        tiposTurismo: selectedTourismTypes,
        acessibilidade: selectedAccessibility
    };

    let result;
    if (editingDestination) {
        result = DestinationModel.update(editingDestination.id, destinationData);
    } else {
        result = DestinationModel.add(destinationData);
    }

    if (result.success) {
        const action = editingDestination ? 'atualizado' : 'adicionado';
        showToast(`Destino ${action} com sucesso!`, 'success');
        closeDestinationModal();
        loadDestinations();
    } else {
        showToast(result.error, 'error');
    }
}

// Handle tourism type addition
function handleAddTourismType() {
    const select = document.getElementById('tourism-type-select');
    const selectedType = select.value;
    
    if (selectedType && !selectedTourismTypes.includes(selectedType)) {
        selectedTourismTypes.push(selectedType);
        updateSelectedTourismTypes();
        select.value = '';
    }
}

// Handle accessibility addition
function handleAddAccessibility() {
    const input = document.getElementById('accessibility-input');
    const accessibilityOption = input.value.trim();
    
    if (accessibilityOption && !selectedAccessibility.includes(accessibilityOption)) {
        selectedAccessibility.push(accessibilityOption);
        updateSelectedAccessibility();
        input.value = '';
    }
}

// Update selected tourism types display
function updateSelectedTourismTypes() {
    const container = document.getElementById('selected-tourism-types');
    if (!container) return;
    
    container.innerHTML = selectedTourismTypes.map(type => `
        <span class="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm">
            ${type}
            <button type="button" onclick="removeTourismType('${type}')" class="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5">
                <span class="material-symbols-outlined text-sm">close</span>
            </button>
        </span>
    `).join('');
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

// Remove tourism type (global function for onclick)
window.removeTourismType = function(type) {
    selectedTourismTypes = selectedTourismTypes.filter(t => t !== type);
    updateSelectedTourismTypes();
};

// Remove accessibility (global function for onclick)
window.removeAccessibility = function(acc) {
    selectedAccessibility = selectedAccessibility.filter(a => a !== acc);
    updateSelectedAccessibility();
};

// Handle destination deletion
function handleDeleteDestination(id) {
    const result = DestinationModel.delete(id);
    
    if (result.success) {
        showToast('Destino eliminado com sucesso!', 'success');
        loadDestinations();
    } else {
        showToast(result.error, 'error');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('add-destination-btn')) {
        initDestinationAdmin();
    }
});

// Export functions for external use
export { initDestinationAdmin, loadDestinations };
