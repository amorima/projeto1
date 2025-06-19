// HotelAdminView.js - Hotel admin management view (MV Pattern - Functions only)
import { showToast, openModal, showConfirm } from './ViewHelpers.js';
// State variables
let allHotels = [];
let filteredHotels = [];
let currentSortColumn = null;
let currentSortDirection = 'asc';
let currentPage = 1;
let itemsPerPage = 10;
let isEditMode = false;
let editingHotelId = null;
// Initialize the hotel admin view
export function initHotelAdminView() {
    loadHotels();
    loadDestinations();
    setupEventListeners();
    setupTableSorting();
    renderTable();
    updatePagination();
}
// Load all hotels from localStorage (init.js structure)
function loadHotels() {
    const hotelData = localStorage.getItem("hoteis");
    if (hotelData) {
        allHotels = JSON.parse(hotelData);
        filteredHotels = [...allHotels];
    } else {
        allHotels = [];
        filteredHotels = [];
    }
}
// Save hotels to localStorage
function saveHotels() {
    localStorage.setItem("hoteis", JSON.stringify(allHotels));
}
// Get next available ID
function getNextId() {
    if (allHotels.length === 0) return 1;
    return Math.max(...allHotels.map(h => h.id)) + 1;
}
// Load destinations for the dropdown
function loadDestinations() {
    const destinationData = localStorage.getItem("destinos");
    const destinations = destinationData ? JSON.parse(destinationData) : [];
    const select = document.getElementById('destinoId');
    if (select) {
        // Clear existing options except the first
        select.innerHTML = '<option value="">Selecionar...</option>';        destinations.forEach(dest => {
            const option = document.createElement('option');
            option.value = dest.id; // Armazenar o ID do destino para referência
            option.setAttribute('data-cidade', dest.cidade); // Armazenar a cidade como atributo de dados
            option.textContent = `${dest.cidade}, ${dest.pais}`;
            select.appendChild(option);
        });
    }
}
// Setup event listeners
function setupEventListeners() {
    // Add hotel button
    const addHotelBtn = document.getElementById('add-hotel-btn');
    if (addHotelBtn) {
        addHotelBtn.addEventListener('click', openAddModal);
    }
    // Create/Update hotel button
    const createHotelBtn = document.getElementById('create-hotel-btn');
    if (createHotelBtn) {
        createHotelBtn.addEventListener('click', handleFormSubmit);
    }    // Cancel button
    const cancelHotelBtn = document.getElementById('cancel-hotel-btn');
    if (cancelHotelBtn) {
        cancelHotelBtn.addEventListener('click', closeHotelModal);
    }
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            handleSearch(e.target.value);
        });
    }
}
// Setup table sorting
function setupTableSorting() {
    const tableHeaders = document.querySelectorAll('th[data-sort]');
    tableHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const sortBy = header.getAttribute('data-sort');
            sortTable(sortBy);
        });
    });
}
// Open add hotel modal
function openAddModal() {
    isEditMode = false;
    editingHotelId = null;
    // Reset form
    document.getElementById('add_hotel_form').reset();
    // Update modal title and button
    const modalTitle = document.querySelector('#modal-adicionar h3');
    const createBtn = document.getElementById('create-hotel-btn');
    const createBtnText = createBtn.querySelector('span:last-child');
    if (modalTitle) modalTitle.textContent = 'Adicionar Novo Hotel';
    if (createBtnText) createBtnText.textContent = 'Adicionar';
    openModal('modal-adicionar');
}
// Open edit hotel modal
function openEditModal(hotelId) {
    isEditMode = true;
    editingHotelId = hotelId;
    const hotel = allHotels.find(h => h.id === hotelId);
    if (!hotel) {
        showToast('Hotel não encontrado!', 'error');
        return;
    }
    // Get the first (and only) room from the quartos array
    const quarto = hotel.quartos && hotel.quartos.length > 0 ? hotel.quartos[0] : {};    // Populate hotel form data
    document.getElementById('destinoId').value = hotel.destinoId || '';
    document.getElementById('name').value = hotel.nome;
    // Note: File input cannot be pre-populated for security reasons
    // Populate room form data
    document.getElementById('tipo').value = quarto.tipo || '';
    document.getElementById('camas').value = quarto.camas || 1;
    document.getElementById('capacidade').value = quarto.capacidade || 2;
    document.getElementById('precoNoite').value = quarto.precoNoite || 0;
    document.getElementById('descricao').value = quarto.descricao || '';
    // Update modal title and button
    const modalTitle = document.querySelector('#modal-adicionar h3');
    const createBtn = document.getElementById('create-hotel-btn');
    const createBtnText = createBtn.querySelector('span:last-child');
    if (modalTitle) modalTitle.textContent = 'Editar Hotel';
    if (createBtnText) createBtnText.textContent = 'Atualizar';
    openModal('modal-adicionar');
}
// Handle form submission (create or update)
function handleFormSubmit() {
    const form = document.getElementById('add_hotel_form');
    if (!form) return;    const formData = new FormData(form);
    const fileInput = document.getElementById('foto');
    const file = fileInput.files[0];
    // Validation
    const destinoId = formData.get('destinoId');
    const nome = formData.get('name');
    if (!destinoId || !nome) {
        showToast('Por favor, preencha todos os campos obrigatórios.', 'error');
        return;
    }
    
    // Obter a cidade a partir do elemento select
    const selectDestino = document.getElementById('destinoId');
    const selectedOption = selectDestino.options[selectDestino.selectedIndex];
    const cidade = selectedOption ? selectedOption.getAttribute('data-cidade') : '';
    const camas = parseInt(formData.get('camas')) || 1;
    const capacidade = parseInt(formData.get('capacidade')) || 2;
    const precoNoite = parseFloat(formData.get('precoNoite')) || 80;
    if (camas < 1 || capacidade < 1) {
        showToast('O número de camas e capacidade devem ser maior que 0.', 'error');
        return;
    }
    if (precoNoite < 0) {
        showToast('O preço por noite deve ser maior ou igual a 0.', 'error');
        return;
    }
    // Handle file upload or use default    const processHotelData = (fotoUrl) => {
        const hotelData = {
            destinoId: Number(destinoId), // Armazenar o ID do destino como número
            cidade: cidade,
            nome: nome,
            foto: fotoUrl
        };
        const roomData = {
            tipo: formData.get('tipo') || 'Standard',
            camas: camas,
            capacidade: capacidade,
            precoNoite: precoNoite,
            foto: "https://placehold.co/300x200/F4A460/000000?text=Quarto",
            acessibilidade: [],
            dataCheckin: "",
            numeroNoites: 1,
            pequenoAlmocoIncluido: false,
            comodidades: [],
            wifiGratis: true,
            descricao: formData.get('descricao') || ''
        };
        try {
            if (isEditMode) {                // Update existing hotel
                const hotelIndex = allHotels.findIndex(h => h.id === editingHotelId);
                if (hotelIndex !== -1) {
                    allHotels[hotelIndex].destinoId = hotelData.destinoId;
                    allHotels[hotelIndex].cidade = hotelData.cidade;
                    allHotels[hotelIndex].nome = hotelData.nome;
                    allHotels[hotelIndex].foto = hotelData.foto;
                    allHotels[hotelIndex].quartos = [roomData];
                    saveHotels();
                    showToast('Hotel atualizado com sucesso!', 'success');
                    refreshTable();
                    closeHotelModal();
                } else {
                    showToast('Erro ao atualizar hotel.', 'error');
                }
            } else {                // Create new hotel
                const newHotel = {
                    id: getNextId(),
                    destinoId: hotelData.destinoId,
                    cidade: hotelData.cidade,
                    nome: hotelData.nome,
                    foto: hotelData.foto,
                    quartos: [roomData]
                };
                allHotels.push(newHotel);
                saveHotels();
                showToast('Hotel adicionado com sucesso!', 'success');
                refreshTable();
                closeHotelModal();
            }
        } catch (error) {
            showToast('Erro interno. Tente novamente.', 'error');
        }
    };
    // Process file upload or use default
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            processHotelData(e.target.result);
        };
        reader.onerror = function() {
            showToast('Erro ao carregar a imagem. Usando imagem padrão.', 'warning');
            processHotelData('https://placehold.co/600x400/87CEEB/0000CD?text=Hotel+Default');
        };
        reader.readAsDataURL(file);
    } else {
        // Use existing photo for edit mode or default for new hotels
        let defaultPhoto = 'https://placehold.co/600x400/87CEEB/0000CD?text=Hotel+Default';
        if (isEditMode) {
            const existingHotel = allHotels.find(h => h.id === editingHotelId);
            defaultPhoto = existingHotel ? existingHotel.foto : defaultPhoto;
        }
        processHotelData(defaultPhoto);
    }
}
// Delete hotel
function deleteHotel(hotelId) {
    const hotel = allHotels.find(h => h.id === hotelId);
    const hotelName = hotel ? hotel.nome || `Hotel ID ${hotelId}` : `Hotel ID ${hotelId}`;
    
    showConfirm(`Tem a certeza que pretende eliminar o hotel "${hotelName}"? Esta ação não pode ser desfeita.`)
        .then(confirmed => {
            if (confirmed) {
                try {
                    const hotelIndex = allHotels.findIndex(h => h.id === hotelId);
                    if (hotelIndex !== -1) {
                        allHotels.splice(hotelIndex, 1);
                        saveHotels();
                        showToast('Hotel removido com sucesso!', 'success');
                        refreshTable();
                    } else {
                        showToast('Erro ao remover hotel.', 'error');
                    }
                } catch (error) {
                    showToast('Erro interno. Tente novamente.', 'error');
                }
            }
        });
}
// Handle search functionality
function handleSearch(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    if (term === '') {
        filteredHotels = [...allHotels];
    } else {
        filteredHotels = allHotels.filter(hotel => {
            const quarto = hotel.quartos && hotel.quartos.length > 0 ? hotel.quartos[0] : {};
            return hotel.nome.toLowerCase().includes(term) ||
                   (hotel.cidade && hotel.cidade.toLowerCase().includes(term)) ||
                   (quarto.tipo && quarto.tipo.toLowerCase().includes(term)) ||
                   (quarto.precoNoite && quarto.precoNoite.toString().includes(term));
        });
    }
    currentPage = 1;
    renderTable();
    updatePagination();
}
// Sort table
function sortTable(column) {
    if (currentSortColumn === column) {
        currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        currentSortColumn = column;
        currentSortDirection = 'asc';
    }
    filteredHotels.sort((a, b) => {
        let aValue, bValue;
        switch (column) {
            case 'destinoId':
                aValue = a.cidade || '';
                bValue = b.cidade || '';
                break;
            case 'name':
                aValue = a.nome;
                bValue = b.nome;
                break;
            case 'quartos':
                // Sort by room price
                const quartoA = a.quartos && a.quartos.length > 0 ? a.quartos[0] : {};
                const quartoB = b.quartos && b.quartos.length > 0 ? b.quartos[0] : {};
                aValue = quartoA.precoNoite || 0;
                bValue = quartoB.precoNoite || 0;
                break;
            default:
                return 0;
        }
        if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }
        if (aValue < bValue) return currentSortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return currentSortDirection === 'asc' ? 1 : -1;
        return 0;
    });
    updateSortIcons(column, currentSortDirection);
    renderTable();
}
// Update sort icons
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
// Render table
function renderTable() {
    const tbody = document.getElementById('tableContent');
    if (!tbody) return;
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageHotels = filteredHotels.slice(start, end);
    if (pageHotels.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    Nenhum hotel encontrado.
                </td>
            </tr>
        `;
        return;
    }
    tbody.innerHTML = pageHotels.map(hotel => {
        // Get room details from the first (and only) room
        const quarto = hotel.quartos && hotel.quartos.length > 0 ? hotel.quartos[0] : {};
        const roomInfo = quarto.tipo ? `${quarto.tipo} - €${quarto.precoNoite}/noite` : 'N/A';
        return `
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                <td class="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">${hotel.cidade || 'N/A'}</td>
                <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">${hotel.nome}</td>
                <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">${roomInfo}</td>
                <td class="px-6 py-4 text-sm text-right">
                    <div class="flex items-center justify-end gap-2">
                        <button 
                            onclick="window.editHotel(${hotel.id})" 
                            class="p-1.5 text-primary hover:text-primary-dark hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors duration-150"
                        >
                            <span class="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button 
                            onclick="window.deleteHotel(${hotel.id})" 
                            class="p-1.5 text-red-600 hover:text-red-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors duration-150"
                        >
                            <span class="material-symbols-outlined text-lg">delete</span>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}
// Update pagination
function updatePagination() {
    const totalItems = filteredHotels.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(start + itemsPerPage - 1, totalItems);
    // Update info text
    const infoText = document.querySelector('#pagination-controls .text-sm');
    if (infoText) {
        if (totalItems === 0) {
            infoText.innerHTML = 'Nenhum resultado encontrado';
        } else {
            infoText.innerHTML = `A mostrar <span class="font-medium">${start}</span> a <span class="font-medium">${end}</span> de <span class="font-medium">${totalItems}</span> resultados`;
        }
    }
    // Update pagination buttons
    const paginationContainer = document.querySelector('#pagination-controls .flex.items-center.gap-1');
    if (paginationContainer) {
        let paginationHTML = `
            <button 
                onclick="window.goToPage(${currentPage - 1})" 
                ${currentPage <= 1 ? 'disabled' : ''} 
                class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-gray-600 rounded-lg border border-gray-300 dark:border-gray-600 transition-colors duration-150 ${currentPage <= 1 ? 'opacity-50 cursor-not-allowed' : ''}"
            >
                <span class="material-symbols-outlined text-lg">chevron_left</span>
            </button>
        `;
        // Page numbers
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button 
                    onclick="window.goToPage(${i})" 
                    class="px-3 py-2 text-sm font-medium ${i === currentPage ? 'text-white bg-primary' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'} rounded-lg transition-colors duration-150"
                >
                    ${i}
                </button>
            `;
        }
        paginationHTML += `
            <button 
                onclick="window.goToPage(${currentPage + 1})" 
                ${currentPage >= totalPages ? 'disabled' : ''} 
                class="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-gray-600 rounded-lg border border-gray-300 dark:border-gray-600 transition-colors duration-150 ${currentPage >= totalPages ? 'opacity-50 cursor-not-allowed' : ''}"
            >
                <span class="material-symbols-outlined text-lg">chevron_right</span>
            </button>
        `;
        paginationContainer.innerHTML = paginationHTML;
    }
}
// Go to specific page
function goToPage(page) {
    const totalPages = Math.ceil(filteredHotels.length / itemsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderTable();
        updatePagination();
    }
}
// Refresh table after changes
function refreshTable() {
    loadHotels();
    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchInput.value) {
        handleSearch(searchInput.value);
    } else {
        filteredHotels = [...allHotels];
        renderTable();
        updatePagination();
    }
}
// Close modal and reset form
function closeHotelModal() {
    const modal = document.getElementById('modal-adicionar');
    const form = document.getElementById('add_hotel_form');
    if (modal) {
        modal.classList.add('hidden');
    }
    if (form) {
        form.reset();
    }
    isEditMode = false;
    editingHotelId = null;
}
// Export functions to global scope for onclick handlers
window.editHotel = openEditModal;
window.deleteHotel = deleteHotel;
window.goToPage = goToPage;
// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('add-hotel-btn')) {
        initHotelAdminView();
    }
});
