// ActivityAdminView.js - Activity admin management view

import { openModal, closeModal } from './ViewHelpers.js';

export class ActivityAdminView {
    constructor() {
        this.activitiesTableConfig = {
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
        // Add activity button
        const addActivityBtn = document.getElementById('add-activity-btn');
        if (addActivityBtn) {
            addActivityBtn.addEventListener('click', () => {
                openModal('modal-adicionar');
            });
        }

        // Create activity button
        const createActivityBtn = document.getElementById('create-activity-btn');
        if (createActivityBtn) {
            createActivityBtn.addEventListener('click', () => {
                this.createActivitie();
            });
        }

        // Cancel button
        const cancelActivityBtn = document.getElementById('cancel-activity-btn');
        if (cancelActivityBtn) {
            cancelActivityBtn.addEventListener('click', () => {
                closeModal('modal-adicionar', 'add_activitie_form', 'Adicionar Nova Atividade');
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
                this.sortTableBy(sortBy, this.activitiesTableConfig);
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
        // Example: ActivityModel.getSorted(column, config.sortDirection);
        console.log(`Sorting activities by ${column} in ${config.sortDirection} order`);
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
        // Here you would typically call your Model to filter activities
        // Example: ActivityModel.search(searchTerm);
        console.log(`Searching activities for: ${searchTerm}`);
    }

    createActivitie() {
        const form = document.getElementById('add_activitie_form');
        if (form) {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            // Basic validation
            if (!data.act_name || !data.act_destinoId || !data.act_turism) {
                alert('Por favor, preencha todos os campos obrigatórios.');
                return;
            }

            console.log('Creating activity with data:', data);
            
            // Here you would typically call your Model to save the activity
            // Example: ActivityModel.create(data);
            
            // Close modal after successful creation
            closeModal('modal-adicionar', 'add_activitie_form', 'Adicionar Nova Atividade');
            
            // Optionally refresh the table
            // this.refreshTable();
        }
    }

    refreshTable() {
        // This method would reload the activity data and update the table
        // Example: ActivityModel.getAll().then(activities => this.renderTable(activities));
        console.log('Refreshing activity table...');
    }
}

// Initialize the view when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.body.querySelector('#add-activity-btn')) {
        new ActivityAdminView();
    }
});
