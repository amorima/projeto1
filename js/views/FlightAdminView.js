// FlightAdminView.js - Flight admin management view

import { openModal, closeModal } from './ViewHelpers.js';

export class FlightAdminView {
    constructor() {
        this.flightTableConfig = {
            sortColumn: null,
            sortDirection: 'asc'
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupTableSorting();
    }

    setupEventListeners() {
        // Add flight button
        const addFlightBtn = document.getElementById('add-flight-btn');
        if (addFlightBtn) {
            addFlightBtn.addEventListener('click', () => {
                openModal('modal-adicionar');
            });
        }

        // Create flight button
        const createFlightBtn = document.getElementById('create-flight-btn');
        if (createFlightBtn) {
            createFlightBtn.addEventListener('click', () => {
                this.createFlight();
            });
        }

        // Cancel button
        const cancelFlightBtn = document.getElementById('cancel-flight-btn');
        if (cancelFlightBtn) {
            cancelFlightBtn.addEventListener('click', () => {
                closeModal('modal-adicionar', 'add_flight_form', 'Adicionar Novo Voo');
            });
        }

        // Search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }
    }

    setupTableSorting() {
        const tableHeaders = document.querySelectorAll('th[data-sort]');
        tableHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const sortBy = header.getAttribute('data-sort');
                this.sortTableBy(sortBy, this.flightTableConfig);
            });
        });
    }

    sortTableBy(column, config) {
        // Determine new sort direction
        if (config.sortColumn === column) {
            config.sortDirection = config.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            config.sortColumn = column;
            config.sortDirection = 'asc';
        }

        // Update UI icons
        this.updateSortIcons(column, config.sortDirection);

        // Here you would typically call your Model to get sorted data
        // Example: FlightModel.getSorted(column, config.sortDirection);
        console.log(`Sorting by ${column} in ${config.sortDirection} order`);
    }

    updateSortIcons(activeColumn, direction) {
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

    handleSearch(searchTerm) {
        // Here you would typically call your Model to filter flights
        // Example: FlightModel.search(searchTerm);
        console.log(`Searching for: ${searchTerm}`);
    }

    createFlight() {
        const form = document.getElementById('add_flight_form');
        if (form) {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            // Basic validation
            if (!data.name || !data.from || !data.to || !data.company) {
                alert('Por favor, preencha todos os campos obrigatórios.');
                return;
            }

            console.log('Creating flight with data:', data);
            
            // Here you would typically call your Model to save the flight
            // Example: FlightModel.create(data);
            
            // Close modal after successful creation
            closeModal('modal-adicionar', 'add_flight_form', 'Adicionar Novo Voo');
            
            // Optionally refresh the table
            // this.refreshTable();
        }
    }

    refreshTable() {
        // This method would reload the flight data and update the table
        // Example: FlightModel.getAll().then(flights => this.renderTable(flights));
        console.log('Refreshing flight table...');
    }
}

// Initialize the view when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.body.querySelector('#add-flight-btn')) {
        new FlightAdminView();
    }
});
