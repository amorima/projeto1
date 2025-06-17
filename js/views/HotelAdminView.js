// HotelAdminView.js - Hotel admin management view

import { openModal, closeModal } from './ViewHelpers.js';

export class HotelAdminView {
    constructor() {
        this.hotelTableConfig = {
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
        // Add hotel button
        const addHotelBtn = document.getElementById('add-hotel-btn');
        if (addHotelBtn) {
            addHotelBtn.addEventListener('click', () => {
                openModal('modal-adicionar');
            });
        }

        // Create hotel button
        const createHotelBtn = document.getElementById('create-hotel-btn');
        if (createHotelBtn) {
            createHotelBtn.addEventListener('click', () => {
                this.createHotel();
            });
        }

        // Cancel button
        const cancelHotelBtn = document.getElementById('cancel-hotel-btn');
        if (cancelHotelBtn) {
            cancelHotelBtn.addEventListener('click', () => {
                closeModal('modal-adicionar', 'add_hotel_form', 'Adicionar Novo Hotel');
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
                this.sortTableBy(sortBy, this.hotelTableConfig);
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
        // Example: HotelModel.getSorted(column, config.sortDirection);
        console.log(`Sorting hotels by ${column} in ${config.sortDirection} order`);
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
        // Here you would typically call your Model to filter hotels
        // Example: HotelModel.search(searchTerm);
        console.log(`Searching hotels for: ${searchTerm}`);
    }

    createHotel() {
        const form = document.getElementById('add_hotel_form');
        if (form) {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            // Basic validation
            if (!data.name || !data.destinoId) {
                alert('Por favor, preencha todos os campos obrigatórios.');
                return;
            }

            console.log('Creating hotel with data:', data);
            
            // Here you would typically call your Model to save the hotel
            // Example: HotelModel.create(data);
            
            // Close modal after successful creation
            closeModal('modal-adicionar', 'add_hotel_form', 'Adicionar Novo Hotel');
            
            // Optionally refresh the table
            // this.refreshTable();
        }
    }

    refreshTable() {
        // This method would reload the hotel data and update the table
        // Example: HotelModel.getAll().then(hotels => this.renderTable(hotels));
        console.log('Refreshing hotel table...');
    }
}

// Initialize the view when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.body.querySelector('#add-hotel-btn')) {
        new HotelAdminView();
    }
});
