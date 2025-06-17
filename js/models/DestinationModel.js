// DestinationModel.js - Model for managing destinations

import { loadFromLocalStorage, saveToLocalStorage, getNextId } from './ModelHelpers.js';

const destinations = [];
const STORAGE_KEY = 'destinos';

// Load destinations from localStorage on module initialization
loadFromLocalStorage(STORAGE_KEY, destinations);

export const DestinationModel = {
    // Get all destinations
    getAll() {
        loadFromLocalStorage(STORAGE_KEY, destinations);
        return [...destinations];
    },

    // Get destination by ID
    getById(id) {
        loadFromLocalStorage(STORAGE_KEY, destinations);
        return destinations.find(dest => dest.id === parseInt(id));
    },

    // Get destinations by city or country
    search(searchTerm) {
        loadFromLocalStorage(STORAGE_KEY, destinations);
        if (!searchTerm || searchTerm.trim() === '') {
            return [...destinations];
        }
        
        const term = searchTerm.toLowerCase().trim();
        return destinations.filter(dest => 
            dest.cidade.toLowerCase().includes(term) ||
            dest.pais.toLowerCase().includes(term) ||
            dest.aeroporto.toLowerCase().includes(term) ||
            dest.tiposTurismo.some(tipo => tipo.toLowerCase().includes(term)) ||
            dest.acessibilidade.some(acc => acc.toLowerCase().includes(term))
        );
    },

    // Add new destination
    add(destinationData) {
        try {
            // Validate required fields
            if (!destinationData.cidade || !destinationData.pais || !destinationData.aeroporto) {
                throw new Error('Cidade, país e aeroporto são obrigatórios');
            }

            // Validate airport code format (3 letters)
            if (!/^[A-Z]{3}$/.test(destinationData.aeroporto.toUpperCase())) {
                throw new Error('Código do aeroporto deve ter exatamente 3 letras');
            }

            loadFromLocalStorage(STORAGE_KEY, destinations);

            // Check if destination already exists (same city, country, and airport)
            const existing = destinations.find(dest => 
                dest.cidade.toLowerCase() === destinationData.cidade.toLowerCase() &&
                dest.pais.toLowerCase() === destinationData.pais.toLowerCase() &&
                dest.aeroporto.toUpperCase() === destinationData.aeroporto.toUpperCase()
            );

            if (existing) {
                throw new Error('Este destino já existe');
            }

            // Create new destination
            const newDestination = {
                id: getNextId(destinations),
                cidade: destinationData.cidade.trim(),
                pais: destinationData.pais.trim(),
                aeroporto: destinationData.aeroporto.toUpperCase().trim(),
                tiposTurismo: Array.isArray(destinationData.tiposTurismo) ? destinationData.tiposTurismo : [],
                acessibilidade: Array.isArray(destinationData.acessibilidade) ? destinationData.acessibilidade : []
            };

            destinations.push(newDestination);
            saveToLocalStorage(STORAGE_KEY, destinations);

            return { success: true, data: newDestination };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Update destination
    update(id, destinationData) {
        try {
            loadFromLocalStorage(STORAGE_KEY, destinations);
            
            const index = destinations.findIndex(dest => dest.id === parseInt(id));
            if (index === -1) {
                throw new Error('Destino não encontrado');
            }

            // Validate required fields
            if (!destinationData.cidade || !destinationData.pais || !destinationData.aeroporto) {
                throw new Error('Cidade, país e aeroporto são obrigatórios');
            }

            // Validate airport code format (3 letters)
            if (!/^[A-Z]{3}$/.test(destinationData.aeroporto.toUpperCase())) {
                throw new Error('Código do aeroporto deve ter exatamente 3 letras');
            }

            // Check if another destination with same data exists (excluding current one)
            const existing = destinations.find((dest, idx) => 
                idx !== index &&
                dest.cidade.toLowerCase() === destinationData.cidade.toLowerCase() &&
                dest.pais.toLowerCase() === destinationData.pais.toLowerCase() &&
                dest.aeroporto.toUpperCase() === destinationData.aeroporto.toUpperCase()
            );

            if (existing) {
                throw new Error('Já existe outro destino com estes dados');
            }

            // Update destination
            const updatedDestination = {
                ...destinations[index],
                cidade: destinationData.cidade.trim(),
                pais: destinationData.pais.trim(),
                aeroporto: destinationData.aeroporto.toUpperCase().trim(),
                tiposTurismo: Array.isArray(destinationData.tiposTurismo) ? destinationData.tiposTurismo : [],
                acessibilidade: Array.isArray(destinationData.acessibilidade) ? destinationData.acessibilidade : []
            };

            destinations[index] = updatedDestination;
            saveToLocalStorage(STORAGE_KEY, destinations);

            return { success: true, data: updatedDestination };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Delete destination
    delete(id) {
        try {
            loadFromLocalStorage(STORAGE_KEY, destinations);
            
            const index = destinations.findIndex(dest => dest.id === parseInt(id));
            if (index === -1) {
                throw new Error('Destino não encontrado');
            }

            const deletedDestination = destinations[index];
            destinations.splice(index, 1);
            saveToLocalStorage(STORAGE_KEY, destinations);

            return { success: true, data: deletedDestination };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Get destinations by country
    getByCountry(country) {
        loadFromLocalStorage(STORAGE_KEY, destinations);
        return destinations.filter(dest => 
            dest.pais.toLowerCase() === country.toLowerCase()
        );
    },

    // Get available tourism types from all destinations
    getAvailableTourismTypes() {
        loadFromLocalStorage(STORAGE_KEY, destinations);
        const allTypes = new Set();
        destinations.forEach(dest => {
            dest.tiposTurismo.forEach(tipo => allTypes.add(tipo));
        });
        return Array.from(allTypes).sort();
    },

    // Get available accessibility options from all destinations
    getAvailableAccessibilityOptions() {
        loadFromLocalStorage(STORAGE_KEY, destinations);
        const allOptions = new Set();
        destinations.forEach(dest => {
            dest.acessibilidade.forEach(opt => allOptions.add(opt));
        });
        return Array.from(allOptions).sort();
    },

    // Sort destinations by field
    sort(destinations, field, ascending = true) {
        return destinations.sort((a, b) => {
            let aVal = a[field];
            let bVal = b[field];
            
            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }
            
            if (ascending) {
                return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            } else {
                return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
            }
        });
    },

    // Get paginated destinations
    paginate(destinations, page = 1, limit = 10) {
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        
        return {
            data: destinations.slice(startIndex, endIndex),
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(destinations.length / limit),
                totalItems: destinations.length,
                itemsPerPage: limit,
                startIndex: startIndex + 1,
                endIndex: Math.min(endIndex, destinations.length)
            }
        };
    }
};
