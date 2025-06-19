// FlightAdminView.js - Flight admin management view
import * as FlightModel from '../models/FlightModel.js';
import { getAllDestinations } from '../models/DestinationModel.js';
import { openModal, closeModal, showToast, showConfirm } from './ViewHelpers.js';
// View configuration
let flightTableConfig = {
    sortColumn: null,
    sortDirection: 'asc',
    currentPage: 1,
    rowsPerPage: 10,
    searchTerm: ''
};
let editingFlightId = null;
// Initialize the view
function init() {
    FlightModel.init();
    setupEventListeners();
    setupTableSorting();
    loadDestinations();
    loadCompanies();
    loadTable();
}
function setupEventListeners() {    // Add flight button
    const addFlightBtn = document.getElementById('add-flight-btn');    if (addFlightBtn) {
        addFlightBtn.addEventListener('click', () => {
            resetForm();
            loadDestinations(); // Refresh destinations before opening modal
            loadCompanies(); // Refresh companies before opening modal
            openModal('modal-adicionar');
        });
    }
    // Create/Update flight button
    const createFlightBtn = document.getElementById('create-flight-btn');
    if (createFlightBtn) {
        createFlightBtn.addEventListener('click', () => {
            if (editingFlightId) {
                updateFlight();
            } else {
                createFlight();
            }
        });
    }
    // Cancel button
    const cancelFlightBtn = document.getElementById('cancel-flight-btn');
    if (cancelFlightBtn) {
        cancelFlightBtn.addEventListener('click', () => {
            closeModalFlight();
        });
    }
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                flightTableConfig.searchTerm = e.target.value;
                flightTableConfig.currentPage = 1;
                loadTable();
            }, 300);
        });
    }
}
function setupTableSorting() {
    const tableHeaders = document.querySelectorAll('th[data-sort]');
    tableHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const column = header.getAttribute('data-sort');
            sortTableBy(column);
        });
    });
}
/**
 * Carrega destinos disponíveis para seleção nos dropdowns de origem e destino
 * Combina aeroportos do FlightModel com destinos do DestinationModel
 * Remove duplicados e ordena alfabeticamente por cidade
 */
function loadDestinations() {
    const airports = FlightModel.getAirports();
    const destinations = getAllDestinations();
    const fromSelect = document.getElementById('from');
    const toSelect = document.getElementById('to');
    
    if (fromSelect && toSelect) {
        fromSelect.innerHTML = '<option value="">Selecionar...</option>';
        toSelect.innerHTML = '<option value="">Selecionar...</option>';
        
        // Create a map to avoid duplicates (using airport code as key)
        const destinationMap = new Map();
        
        // Add airports from FlightModel
        airports.forEach(airport => {
            const key = airport.codigo;
            if (!destinationMap.has(key)) {
                destinationMap.set(key, {
                    codigo: airport.codigo,
                    cidade: airport.cidade,
                    pais: airport.pais,
                    source: 'flight'
                });
            }
        });
        
        // Add destinations from DestinationModel (may override flight model destinations)
        destinations.forEach(destination => {
            const key = destination.aeroporto;
            destinationMap.set(key, {
                codigo: destination.aeroporto,
                cidade: destination.cidade,
                pais: destination.pais,
                source: 'destination'
            });
        });
        
        // Convert to array and sort by city name
        const sortedDestinations = Array.from(destinationMap.values())
            .sort((a, b) => a.cidade.localeCompare(b.cidade));
        
        // Add options to both selects
        sortedDestinations.forEach(dest => {
            const option = `<option value="${dest.codigo} - ${dest.cidade}">${dest.codigo} - ${dest.cidade}, ${dest.pais}</option>`;
            fromSelect.innerHTML += option;
            toSelect.innerHTML += option;
        });
    }
}

/**
 * Carrega companhias aéreas disponíveis para seleção no dropdown de companhia
 */
function loadCompanies() {
    const companies = FlightModel.getAllCompanhiasAereas();
    const companySelect = document.getElementById('company');
    
    if (companySelect && companies) {
        companySelect.innerHTML = '<option value="">Selecionar...</option>';
        
        // Sort companies alphabetically
        const sortedCompanies = companies.sort((a, b) => a.nome.localeCompare(b.nome));
        
        // Add options to select
        sortedCompanies.forEach(company => {
            const option = document.createElement('option');
            option.value = company.nome;
            option.textContent = company.nome;
            companySelect.appendChild(option);
        });
        
        // Set size attribute to limit visible options (max 8 options visible)
        const maxVisibleOptions = 8;
        if (sortedCompanies.length > maxVisibleOptions) {
            companySelect.setAttribute('data-max-options', maxVisibleOptions);
            // Add CSS class for styling
            companySelect.classList.add('has-many-options');
        }
        
        // Add custom behavior for better dropdown experience
        setupScrollableDropdown(companySelect);
    }
}

/**
 * Configura comportamento personalizado para dropdown com scroll
 * @param {HTMLSelectElement} selectElement - Elemento select
 */
function setupScrollableDropdown(selectElement) {
    // Add event listener for better UX
    selectElement.addEventListener('focus', function() {
        // Optional: Add custom styling when focused
        this.style.maxHeight = '200px';
    });
    
    selectElement.addEventListener('blur', function() {
        // Reset styling when not focused
        this.style.maxHeight = '';
    });
    
    // For browsers that support it, try to limit the dropdown height
    if (selectElement.children.length > 8) {
        selectElement.style.setProperty('--dropdown-max-height', '200px');
    }
}

function loadTable() {
    const tableBody = document.getElementById('tableContent');
    if (!tableBody) return;
    try {
        let flights = FlightModel.getAll() || [];
          // Apply search filter
        if (flightTableConfig.searchTerm) {
            const searchTerm = flightTableConfig.searchTerm.toLowerCase();
            flights = flights.filter(flight => 
                flight.numeroVoo.toLowerCase().includes(searchTerm) ||
                flight.origem.toLowerCase().includes(searchTerm) ||
                flight.destino.toLowerCase().includes(searchTerm) ||
                flight.companhia.toLowerCase().includes(searchTerm) ||
                flight.partida.toLowerCase().includes(searchTerm) ||
                (flight.direto === 'S' ? 'sim' : 'não').includes(searchTerm) ||
                (flight.custo ? flight.custo.toString().includes(searchTerm) : false)
            );
        }
        // Apply sorting
        if (flightTableConfig.sortColumn) {
            flights.sort((a, b) => {
                let aValue = getSortValue(a, flightTableConfig.sortColumn);
                let bValue = getSortValue(b, flightTableConfig.sortColumn);
                const comparison = aValue.localeCompare(bValue, 'pt', { numeric: true });
                return flightTableConfig.sortDirection === 'asc' ? comparison : -comparison;
            });
        }
        // Apply pagination
        const totalFlights = flights.length;
        const totalPages = Math.ceil(totalFlights / flightTableConfig.rowsPerPage);
        const startIndex = (flightTableConfig.currentPage - 1) * flightTableConfig.rowsPerPage;
        const endIndex = startIndex + flightTableConfig.rowsPerPage;
        const paginatedFlights = flights.slice(startIndex, endIndex);        // Render table
        tableBody.innerHTML = paginatedFlights.map(flight => `
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                <td class="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">${escapeHtml(flight.numeroVoo)}</td>
                <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">${escapeHtml(flight.origem)}</td>
                <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">${escapeHtml(flight.destino)}</td>
                <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">${escapeHtml(flight.companhia)}</td>
                <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">${escapeHtml(flight.partida)}</td>
                <td class="px-6 py-4 text-sm">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${flight.direto === 'S' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}">
                        ${flight.direto === 'S' ? 'Sim' : 'Não'}
                    </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 font-medium">€${parseFloat(flight.custo || 0).toFixed(2)}</td>
                <td class="px-6 py-4 text-sm text-right">
                    <div class="flex items-center justify-end gap-2">
                        <button onclick="editFlight('${flight.numeroVoo}')" class="p-1.5 text-primary hover:text-primary-dark hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors duration-150" title="Editar voo">
                            <span class="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button onclick="deleteFlight('${flight.numeroVoo}', '${escapeHtml(flight.numeroVoo)}')" class="p-1.5 text-red-600 hover:text-red-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors duration-150" title="Eliminar voo">
                            <span class="material-symbols-outlined text-lg">delete</span>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        if (paginatedFlights.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        <div class="flex flex-col items-center gap-2">
                            <span class="material-symbols-outlined text-4xl">flight</span>
                            <p class="text-lg font-medium">Nenhum voo encontrado</p>
                            <p class="text-sm">Tente ajustar os filtros de pesquisa ou adicione um novo voo.</p>
                        </div>
                    </td>
                </tr>
            `;
        }
        // Update pagination
        updatePaginationControls(totalPages, flightTableConfig.currentPage);
    } catch (error) {
        showToast('Erro ao carregar voos.', 'error');
    }
}
function getSortValue(flight, column) {
    switch (column) {
        case 'name': return flight.numeroVoo || '';
        case 'from': return flight.origem || '';
        case 'to': return flight.destino || '';
        case 'company': return flight.companhia || '';
        case 'leaves': return flight.partida || '';
        case 'direct': return flight.direto === 'S' ? 'Sim' : 'Não';
        case 'custo': return (parseFloat(flight.custo) || 0).toString().padStart(10, '0');
        default: return '';
    }
}
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text ? text.replace(/[&<>"']/g, m => map[m]) : '';
}
function sortTableBy(column) {
    if (flightTableConfig.sortColumn === column) {
        flightTableConfig.sortDirection = flightTableConfig.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        flightTableConfig.sortColumn = column;
        flightTableConfig.sortDirection = 'asc';
    }
    updateSortIcons(column, flightTableConfig.sortDirection);
    loadTable();
}
function updateSortIcons(activeColumn, direction) {
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
        activeIcon.textContent = direction === 'asc' ? 'keyboard_arrow_up' : 'keyboard_arrow_down';
        activeIcon.classList.remove('text-gray-400');
        activeIcon.classList.add('text-primary');
    }
}
function updatePaginationControls(totalPages, currentPage) {
    const paginationContainer = document.getElementById('pagination-controls');
    if (!paginationContainer) return;
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '<div class="text-sm text-gray-600 dark:text-gray-400">Total de resultados: 0</div>';
        return;
    }
    const startRecord = (currentPage - 1) * flightTableConfig.rowsPerPage + 1;
    const endRecord = Math.min(currentPage * flightTableConfig.rowsPerPage, totalPages * flightTableConfig.rowsPerPage);
    const totalRecords = totalPages * flightTableConfig.rowsPerPage;
    paginationContainer.innerHTML = `
        <div class="text-sm text-gray-600 dark:text-gray-400">
            Mostrando ${startRecord}-${endRecord} de ${totalRecords} resultados
        </div>
        <div class="flex items-center gap-2">
            <button ${currentPage === 1 ? 'disabled' : ''} onclick="goToPage(${currentPage - 1})" class="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-gray-600 rounded-lg border border-gray-300 dark:border-gray-600 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed">
                <span class="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            ${generatePageNumbers(totalPages, currentPage)}
            <button ${currentPage === totalPages ? 'disabled' : ''} onclick="goToPage(${currentPage + 1})" class="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-gray-600 rounded-lg border border-gray-300 dark:border-gray-600 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed">
                <span class="material-symbols-outlined text-lg">chevron_right</span>
            </button>
        </div>
    `;
}
function generatePageNumbers(totalPages, currentPage) {
    let pages = '';
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
        const isActive = i === currentPage;
        pages += `
            <button onclick="goToPage(${i})" class="px-3 py-2 text-sm font-medium ${isActive ? 'text-white bg-primary' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'} rounded-lg transition-colors duration-150">
                ${i}
            </button>
        `;
    }
    return pages;
}
function goToPage(page) {
    flightTableConfig.currentPage = page;
    loadTable();
}
function createFlight() {
    try {
        const form = document.getElementById('add_flight_form');
        const formData = new FormData(form);
        
        // Extract city name from destination (format: "XXX - CityName")
        const destinoCompleto = formData.get('to');
        const cityName = destinoCompleto.includes(' - ') 
            ? destinoCompleto.split(' - ')[1] 
            : destinoCompleto;
        
        // Try to get the actual destination image from localStorage
        let imagemUrl = `/img/destinos/${cityName}/1.jpg`; // Default fallback
        
        try {
            const destinosData = localStorage.getItem('destinos');
            if (destinosData) {
                const destinos = JSON.parse(destinosData);
                const destinoEncontrado = destinos.find(dest => dest.cidade === cityName);
                if (destinoEncontrado && destinoEncontrado.imagem) {
                    imagemUrl = destinoEncontrado.imagem;
                }
            }
        } catch (error) {
            console.log('Could not load destination image, using default path');
        }
        
        const flightData = {
            numeroVoo: formData.get('name'),
            origem: formData.get('from'),
            destino: formData.get('to'),
            companhia: formData.get('company'),
            partida: formatDateTime(formData.get('leaves')),
            chegada: '', // Could be calculated or left empty
            direto: formData.get('direct') === 'Sim' ? 'S' : 'N',
            custo: parseFloat(formData.get('custo')) || 0,
            imagem: imagemUrl, // Use actual destination image or default path
            dataVolta: '' // Default empty
        };
        // Validation
        if (!flightData.numeroVoo || !flightData.origem || !flightData.destino || !flightData.companhia || !flightData.partida) {
            showToast('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }
        if (flightData.custo < 0) {
            showToast('O custo não pode ser negativo.', 'error');
            return;
        }
        FlightModel.add(
            flightData.numeroVoo,
            flightData.origem,
            flightData.destino,
            flightData.companhia,
            flightData.partida,
            flightData.chegada,
            flightData.direto,
            flightData.custo,
            flightData.imagem,
            flightData.dataVolta
        );
        closeModalFlight();
        loadTable();
        showToast('Voo criado com sucesso!', 'success');
    } catch (error) {
        showToast(error.message || 'Erro ao criar voo. Tente novamente.', 'error');
    }
}
function editFlight(numeroVoo) {
    try {
        const flights = FlightModel.getAll();
        const flight = flights.find(f => f.numeroVoo === numeroVoo);
        if (!flight) {
            showToast('Voo não encontrado.', 'error');
            return;
        }
          // Refresh destinations and companies before opening modal
        loadDestinations();
        loadCompanies();
        
        // Fill form with flight data
        document.getElementById('name').value = flight.numeroVoo;
        document.getElementById('from').value = flight.origem;
        document.getElementById('to').value = flight.destino;
        document.getElementById('company').value = flight.companhia;
        document.getElementById('leaves').value = parseDateTime(flight.partida);
        document.getElementById('custo').value = flight.custo || 0;
        document.getElementById('direct').value = flight.direto === 'S' ? 'Sim' : 'Não';
        // Update modal title and button
        const modalTitle = document.querySelector('#modal-adicionar h3');
        const createBtn = document.getElementById('create-flight-btn');
        if (modalTitle) modalTitle.textContent = 'Editar Voo';
        if (createBtn) {
            createBtn.innerHTML = '<span class="material-symbols-outlined text-lg">save</span><span>Guardar</span>';
        }
        editingFlightId = numeroVoo;
        openModal('modal-adicionar');
    } catch (error) {
        showToast('Erro ao carregar dados do voo.', 'error');
    }
}
function updateFlight() {
    try {
        const form = document.getElementById('add_flight_form');
        const formData = new FormData(form);
        
        // Extract city name from destination (format: "XXX - CityName")
        const destinoCompleto = formData.get('to');
        const cityName = destinoCompleto.includes(' - ') 
            ? destinoCompleto.split(' - ')[1] 
            : destinoCompleto;
        
        // Try to get the actual destination image from localStorage
        let imagemUrl = `/img/destinos/${cityName}/1.jpg`; // Default fallback
        
        try {
            const destinosData = localStorage.getItem('destinos');
            if (destinosData) {
                const destinos = JSON.parse(destinosData);
                const destinoEncontrado = destinos.find(dest => dest.cidade === cityName);
                if (destinoEncontrado && destinoEncontrado.imagem) {
                    imagemUrl = destinoEncontrado.imagem;
                }
            }
        } catch (error) {
            console.log('Could not load destination image, using default path');
        }
        
        const flightData = {
            numeroVoo: formData.get('name'),
            origem: formData.get('from'),
            destino: formData.get('to'),
            companhia: formData.get('company'),
            partida: formatDateTime(formData.get('leaves')),
            chegada: '', // Keep existing or empty
            direto: formData.get('direct') === 'Sim' ? 'S' : 'N',
            custo: parseFloat(formData.get('custo')) || 0,
            imagem: imagemUrl, // Use actual destination image or default path
            dataVolta: '' // Keep existing or empty
        };
        // Validation
        if (!flightData.numeroVoo || !flightData.origem || !flightData.destino || !flightData.companhia || !flightData.partida) {
            showToast('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }
        if (flightData.custo < 0) {
            showToast('O custo não pode ser negativo.', 'error');
            return;
        }
        // Get existing flight to preserve other properties
        const flights = FlightModel.getAll();
        const existingFlight = flights.find(f => f.numeroVoo === editingFlightId);
        if (!existingFlight) {
            showToast('Voo não encontrado.', 'error');
            return;
        }        // Create updated flight object preserving existing properties
        const updatedFlight = {
            ...existingFlight,
            numeroVoo: flightData.numeroVoo,
            origem: flightData.origem,
            destino: flightData.destino,
            companhia: flightData.companhia,
            partida: flightData.partida,
            direto: flightData.direto,
            custo: flightData.custo
        };
        FlightModel.update(editingFlightId, updatedFlight);
        closeModalFlight();
        loadTable();
        showToast('Voo atualizado com sucesso!', 'success');
    } catch (error) {
        showToast('Erro ao atualizar voo. Tente novamente.', 'error');
    }
}
function deleteFlight(numeroVoo, flightName) {
    showConfirm(`Tem a certeza que pretende eliminar o voo "${numeroVoo}"? Esta ação não pode ser desfeita.`)
        .then(confirmed => {
            if (confirmed) {
                try {
                    FlightModel.deleteTrip(numeroVoo);
                    loadTable();
                    showToast('Voo eliminado com sucesso!', 'success');
                } catch (error) {
                    showToast('Erro ao eliminar voo. Tente novamente.', 'error');
                }
            }
        });
}
function formatDateTime(dateTimeString) {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('pt-PT') + ' ' + date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
}
function parseDateTime(dateTimeString) {
    if (!dateTimeString) return '';
    // Convert "01/07/2025 08:15" to "2025-07-01T08:15"
    const [datePart, timePart] = dateTimeString.split(' ');
    const [day, month, year] = datePart.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${timePart}`;
}
function resetForm() {
    const form = document.getElementById('add_flight_form');
    if (form) {
        form.reset();
    }
}
function closeModalFlight() {
    closeModal('modal-adicionar', 'add_flight_form', null);
    editingFlightId = null;
    resetForm();
    // Reset modal state for adding new flights
    const modalTitle = document.querySelector('#modal-adicionar h3');
    const createBtn = document.getElementById('create-flight-btn');
    if (modalTitle) modalTitle.textContent = 'Adicionar Novo Voo';
    if (createBtn) {
        createBtn.innerHTML = '<span class="material-symbols-outlined text-lg">add</span><span>Adicionar</span>';
    }
}
// Global functions for onclick events
window.editFlight = editFlight;
window.deleteFlight = deleteFlight;
window.goToPage = goToPage;
// Initialize the view when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.body.querySelector('#add-flight-btn')) {
        init();
    }
});
