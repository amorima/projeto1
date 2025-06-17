// UserAdminView.js - User admin management view

import * as UserModel from '../models/UserModel.js';
import { openModal, closeModal, showToast } from './ViewHelpers.js';

// View configuration
let userTableConfig = {
    sortColumn: null,
    sortDirection: 'asc',
    currentPage: 1,
    rowsPerPage: 10,
    searchTerm: ''
};

let editingUserId = null;

// Initialize the view
function init() {
    UserModel.init();
    setupEventListeners();
    setupTableSorting();
    loadTable();
}

function setupEventListeners() {
    // Add user button
    const addUserBtn = document.getElementById('add-user-btn');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', () => {
            resetForm();
            editingUserId = null;
            document.querySelector('#modal-adicionar h3').textContent = 'Adicionar Novo Utilizador';
            document.getElementById('create-user-btn').innerHTML = '<span class="material-symbols-outlined text-lg">add</span><span>Adicionar</span>';
            openModal('modal-adicionar');
        });
    }

    // Create/Update user button
    const createUserBtn = document.getElementById('create-user-btn');
    if (createUserBtn) {
        createUserBtn.addEventListener('click', () => {
            if (editingUserId) {
                updateUser();
            } else {
                createUser();
            }
        });
    }

    // Cancel button
    const cancelUserBtn = document.getElementById('cancel-user-btn');
    if (cancelUserBtn) {
        cancelUserBtn.addEventListener('click', () => {
            closeModalUser();
        });
    }

    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            userTableConfig.searchTerm = e.target.value;
            userTableConfig.currentPage = 1;
            loadTable();
        });
    }
}

function setupTableSorting() {
    const tableHeaders = document.querySelectorAll('th[data-sort]');
    tableHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const sortBy = header.getAttribute('data-sort');
            sortTableBy(sortBy);
        });
    });
}

function sortTableBy(column) {
    // Determine new sort direction
    if (userTableConfig.sortColumn === column) {
        userTableConfig.sortDirection = userTableConfig.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        userTableConfig.sortColumn = column;
        userTableConfig.sortDirection = 'asc';
    }

    // Update UI icons
    updateSortIcons(column, userTableConfig.sortDirection);

    // Reload table with new sorting
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

function loadTable() {
    try {
        // Get filtered and sorted users
        let users = UserModel.search(userTableConfig.searchTerm);
        
        if (userTableConfig.sortColumn) {
            // Map level column to points for sorting
            let sortColumn = userTableConfig.sortColumn;
            if (sortColumn === 'level') {
                sortColumn = 'pontos';
            }
            // Map private column to correct property name
            if (sortColumn === 'private') {
                sortColumn = 'isPrivate';
            }
            
            users = UserModel.sortBy(sortColumn, userTableConfig.sortDirection);
            if (userTableConfig.searchTerm) {
                // Apply search filter to sorted results
                users = users.filter(user =>
                    user.username.toLowerCase().includes(userTableConfig.searchTerm.toLowerCase()) ||
                    user.email.toLowerCase().includes(userTableConfig.searchTerm.toLowerCase())
                );
            }
        }

        // Apply pagination
        const startIndex = (userTableConfig.currentPage - 1) * userTableConfig.rowsPerPage;
        const endIndex = startIndex + userTableConfig.rowsPerPage;
        const paginatedUsers = users.slice(startIndex, endIndex);

        // Render table
        renderTable(paginatedUsers);

        // Update pagination controls
        updatePaginationControls(users.length);

    } catch (error) {
        console.error('Error loading user table:', error);
        renderTable([]);
    }
}

function renderTable(users) {
    const tableBody = document.getElementById('tableContent');
    if (!tableBody) return;

    if (users.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    ${userTableConfig.searchTerm ? 'Nenhum utilizador encontrado para a pesquisa.' : 'Nenhum utilizador encontrado.'}
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = users.map(user => {
        // Handle both privacidade and isPrivate properties
        const isPrivate = user.privacidade === 'S' || user.isPrivate === true;
        
        return `
        <tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
            <td class="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">${escapeHtml(user.username)}</td>
            <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">${escapeHtml(user.email)}</td>
            <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">${user.pontos || 0}</td>
            <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">${UserModel.getUserLevel(user.pontos || 0)}</td>
            <td class="px-6 py-4 text-sm">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${isPrivate ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}">
                    ${isPrivate ? 'Privado' : 'Público'}
                </span>
            </td>
            <td class="px-6 py-4 text-sm">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${UserModel.isAdmin(user) ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}">
                    ${UserModel.isAdmin(user) ? 'Administrador' : 'Utilizador'}
                </span>
            </td>
            <td class="px-6 py-4 text-sm text-right">
                <div class="flex items-center justify-end gap-2">
                    <button onclick="editUser('${user.id}')" class="p-1.5 text-primary hover:text-primary-dark hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors duration-150" title="Editar utilizador">
                        <span class="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button onclick="deleteUser('${user.id}', '${escapeHtml(user.username)}')" class="p-1.5 text-red-600 hover:text-red-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors duration-150" title="Eliminar utilizador">
                        <span class="material-symbols-outlined text-lg">delete</span>
                    </button>
                </div>
            </td>
        </tr>
        `;
    }).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function updatePaginationControls(totalItems) {
    const totalPages = Math.ceil(totalItems / userTableConfig.rowsPerPage);
    const currentPage = userTableConfig.currentPage;

    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * userTableConfig.rowsPerPage + 1;
    const endItem = Math.min(currentPage * userTableConfig.rowsPerPage, totalItems);

    // Update pagination info
    const paginationInfo = document.querySelector('#pagination-controls .text-sm');
    if (paginationInfo) {
        paginationInfo.innerHTML = `A mostrar <span class="font-medium">${startItem}</span> a <span class="font-medium">${endItem}</span> de <span class="font-medium">${totalItems}</span> resultados`;
    }

    // Update pagination buttons
    const paginationContainer = document.querySelector('#pagination-controls .flex.items-center.gap-1');
    if (paginationContainer) {
        paginationContainer.innerHTML = `
            <button onclick="goToPage(${currentPage - 1})" ${currentPage <= 1 ? 'disabled' : ''} class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-gray-600 rounded-lg border border-gray-300 dark:border-gray-600 transition-colors duration-150 ${currentPage <= 1 ? 'opacity-50 cursor-not-allowed' : ''}">
                <span class="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            ${generatePageButtons(currentPage, totalPages)}
            <button onclick="goToPage(${currentPage + 1})" ${currentPage >= totalPages ? 'disabled' : ''} class="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-gray-600 rounded-lg border border-gray-300 dark:border-gray-600 transition-colors duration-150 ${currentPage >= totalPages ? 'opacity-50 cursor-not-allowed' : ''}">
                <span class="material-symbols-outlined text-lg">chevron_right</span>
            </button>
        `;
    }
}

function generatePageButtons(currentPage, totalPages) {
    let buttons = '';
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const isActive = i === currentPage;
        buttons += `
            <button onclick="goToPage(${i})" class="px-3 py-2 text-sm font-medium ${isActive ? 'text-white bg-primary' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'} rounded-lg transition-colors duration-150">
                ${i}
            </button>
        `;
    }
    
    if (endPage < totalPages) {
        buttons += '<span class="px-3 py-2 text-sm text-gray-500">...</span>';
    }
    
    return buttons;
}

function goToPage(page) {
    const totalItems = UserModel.search(userTableConfig.searchTerm).length;
    const totalPages = Math.ceil(totalItems / userTableConfig.rowsPerPage);
    
    if (page >= 1 && page <= totalPages) {
        userTableConfig.currentPage = page;
        loadTable();
    }
}

function createUser() {
    const form = document.getElementById('add_user_form');
    if (!form) return;

    try {
        // Get form data
        const formData = new FormData(form);
        const userData = {
            username: formData.get('username')?.trim(),
            email: formData.get('email')?.trim(),
            password: formData.get('password'),
            pontos: parseInt(formData.get('points') || '50'),
            privacidade: formData.get('private') || 'N',
            admin: formData.get('admin') || 'User'
        };

        // Validation
        if (!userData.username || !userData.email || !userData.password) {
            showToast('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            showToast('Por favor, insira um email válido.', 'error');
            return;
        }

        // Create user via model
        UserModel.createUser(userData);
        
        // Close modal and refresh table
        closeModalUser();
        loadTable();
        
        showToast('Utilizador criado com sucesso!', 'success');

    } catch (error) {
        console.error('Error creating user:', error);
        showToast(error.message || 'Erro ao criar utilizador. Tente novamente.', 'error');
    }
}

function editUser(userId) {
    try {
        const users = UserModel.getAll();
        const user = users.find(u => u.id == userId); // Use == for type coercion
        
        if (!user) {
            showToast('Utilizador não encontrado.', 'error');
            return;
        }

        // Fill form with user data
        document.getElementById('username').value = user.username;
        document.getElementById('email').value = user.email;
        document.getElementById('password').value = ''; // Don't show existing password
        document.getElementById('points').value = user.pontos || 0;
        
        // Handle both privacidade and isPrivate properties
        const privacidadeValue = user.privacidade || (user.isPrivate ? 'S' : 'N');
        document.getElementById('private').value = privacidadeValue;
        
        // Handle both admin formats
        const adminValue = (user.admin === true || user.admin === 'Admin') ? 'Admin' : 'User';
        document.getElementById('admin').value = adminValue;

        // Update modal for editing
        editingUserId = userId;
        document.querySelector('#modal-adicionar h3').textContent = 'Editar Utilizador';
        document.getElementById('create-user-btn').innerHTML = '<span class="material-symbols-outlined text-lg">save</span><span>Guardar</span>';

        openModal('modal-adicionar');

    } catch (error) {
        console.error('Error loading user for edit:', error);
        showToast('Erro ao carregar dados do utilizador.', 'error');
    }
}

function updateUser() {
    const form = document.getElementById('add_user_form');
    if (!form || !editingUserId) return;

    try {
        // Get form data
        const formData = new FormData(form);
        const userData = {
            username: formData.get('username')?.trim(),
            email: formData.get('email')?.trim(),
            password: formData.get('password'),
            pontos: parseInt(formData.get('points') || '0'),
            privacidade: formData.get('private') || 'N',
            admin: formData.get('admin') || 'User'
        };        // Validation
        if (!userData.username || !userData.email) {
            showToast('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            showToast('Por favor, insira um email válido.', 'error');
            return;
        }

        // Check if email already exists in another user
        const users = UserModel.getAll();
        const emailExists = users.find(u => u.id != editingUserId && u.email === userData.email); // Use != for type coercion
        if (emailExists) {
            showToast(`Email "${userData.email}" já está sendo usado por outro utilizador.`, 'error');
            return;
        }

        // Update user via model
        const userIndex = users.findIndex(u => u.id == editingUserId); // Use == for type coercion
        
        if (userIndex === -1) {
            showToast('Utilizador não encontrado.', 'error');
            return;
        }// Update user data (keep existing password if not provided)
        const existingUser = users[userIndex];
        users[userIndex] = {
            ...existingUser,
            username: userData.username,
            email: userData.email,
            pontos: userData.pontos,
            privacidade: userData.privacidade,
            isPrivate: userData.privacidade === 'S',
            admin: userData.admin === 'Admin'
        };

        // Only update password if provided
        if (userData.password && userData.password.trim() !== '') {
            users[userIndex].password = userData.password;
        }

        // Save to localStorage
        localStorage.setItem('user', JSON.stringify(users));
          // Close modal and refresh table
        closeModalUser();
        loadTable();
        
        showToast('Utilizador atualizado com sucesso!', 'success');

    } catch (error) {
        console.error('Error updating user:', error);
        showToast('Erro ao atualizar utilizador. Tente novamente.', 'error');
    }
}

function deleteUser(userId, username) {
    try {
        // Use the model's delete function
        UserModel.deleteUser(userId);
        
        // Refresh table
        loadTable();
        
        showToast('Utilizador eliminado com sucesso!', 'success');

    } catch (error) {
        console.error('Error deleting user:', error);
        showToast(error.message || 'Erro ao eliminar utilizador. Tente novamente.', 'error');
    }
}

function resetForm() {
    const form = document.getElementById('add_user_form');
    if (form) {
        form.reset();
        document.getElementById('points').value = '50'; // Set default points
    }
}

function closeModalUser() {
    closeModal('modal-adicionar', 'add_user_form', null);
    editingUserId = null;
    resetForm();
    
    // Reset modal state for adding new users
    const modalHeading = document.querySelector('#modal-adicionar h3');
    if (modalHeading) {
        modalHeading.textContent = 'Adicionar Novo Utilizador';
    }
    
    const createBtn = document.getElementById('create-user-btn');
    if (createBtn) {
        createBtn.innerHTML = '<span class="material-symbols-outlined text-lg">add</span><span>Adicionar</span>';
    }
}

// Global functions for onclick events
window.editUser = editUser;
window.deleteUser = deleteUser;
window.goToPage = goToPage;

// Initialize the view when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.body.querySelector('#add-user-btn')) {
        init();
    }
});
