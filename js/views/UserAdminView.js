// UserAdminView.js - User admin management view

import { openModal, closeModal } from './ViewHelpers.js';

export class UserAdminView {
    constructor() {
        this.userTableConfig = {
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
        // Add user button
        const addUserBtn = document.getElementById('add-user-btn');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', () => {
                openModal('modal-adicionar');
            });
        }

        // Create user button
        const createUserBtn = document.getElementById('create-user-btn');
        if (createUserBtn) {
            createUserBtn.addEventListener('click', () => {
                this.createUser();
            });
        }

        // Cancel button
        const cancelUserBtn = document.getElementById('cancel-user-btn');
        if (cancelUserBtn) {
            cancelUserBtn.addEventListener('click', () => {
                closeModal('modal-adicionar', 'add_user_form', 'Adicionar Novo Utilizador');
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
                this.sortTableBy(sortBy, this.userTableConfig);
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
        // Example: UserModel.getSorted(column, config.sortDirection);
        console.log(`Sorting users by ${column} in ${config.sortDirection} order`);
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
        // Here you would typically call your Model to filter users
        // Example: UserModel.search(searchTerm);
        console.log(`Searching users for: ${searchTerm}`);
    }

    createUser() {
        const form = document.getElementById('add_user_form');
        if (form) {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            // Basic validation
            if (!data.username || !data.email || !data.password) {
                alert('Por favor, preencha todos os campos obrigatórios.');
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                alert('Por favor, insira um email válido.');
                return;
            }

            console.log('Creating user with data:', data);
            
            // Here you would typically call your Model to save the user
            // Example: UserModel.create(data);
            
            // Close modal after successful creation
            closeModal('modal-adicionar', 'add_user_form', 'Adicionar Novo Utilizador');
            
            // Optionally refresh the table
            // this.refreshTable();
        }
    }

    refreshTable() {
        // This method would reload the user data and update the table
        // Example: UserModel.getAll().then(users => this.renderTable(users));
        console.log('Refreshing user table...');
    }
}

// Initialize the view when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.body.querySelector('#add-user-btn')) {
        new UserAdminView();
    }
});
