// TurismModel.js - Model for managing tourism types

export const TurismModel = {
    // Get all tourism types
    getAll() {
        try {
            const tiposTurismo = localStorage.getItem('tiposTurismo');
            return tiposTurismo ? JSON.parse(tiposTurismo) : [];
        } catch (error) {
            console.error('Error getting tourism types:', error);
            return [];
        }
    },

    // Add a new tourism type
    add(tipoTurismo) {
        try {
            if (!tipoTurismo || typeof tipoTurismo !== 'string' || tipoTurismo.trim() === '') {
                throw new Error('Invalid tourism type');
            }

            const tipos = this.getAll();
            const trimmedTipo = tipoTurismo.trim();
            
            // Check if it already exists (case insensitive)
            if (tipos.some(tipo => tipo.toLowerCase() === trimmedTipo.toLowerCase())) {
                throw new Error('Este tipo de turismo já existe');
            }

            tipos.push(trimmedTipo);
            localStorage.setItem('tiposTurismo', JSON.stringify(tipos));
            return { success: true, data: trimmedTipo };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Update a tourism type
    update(oldValue, newValue) {
        try {
            if (!oldValue || !newValue || typeof oldValue !== 'string' || typeof newValue !== 'string') {
                throw new Error('Invalid tourism type values');
            }

            const tipos = this.getAll();
            const trimmedNew = newValue.trim();
            
            if (trimmedNew === '') {
                throw new Error('O tipo de turismo não pode estar vazio');
            }

            const oldIndex = tipos.findIndex(tipo => tipo === oldValue);
            if (oldIndex === -1) {
                throw new Error('Tipo de turismo não encontrado');
            }

            // Check if new value already exists (excluding the current one)
            if (tipos.some((tipo, index) => index !== oldIndex && tipo.toLowerCase() === trimmedNew.toLowerCase())) {
                throw new Error('Este tipo de turismo já existe');
            }

            tipos[oldIndex] = trimmedNew;
            localStorage.setItem('tiposTurismo', JSON.stringify(tipos));
            return { success: true, data: trimmedNew };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Delete a tourism type
    delete(tipoTurismo) {
        try {
            if (!tipoTurismo || typeof tipoTurismo !== 'string') {
                throw new Error('Invalid tourism type');
            }

            const tipos = this.getAll();
            const filteredTipos = tipos.filter(tipo => tipo !== tipoTurismo);
            
            if (filteredTipos.length === tipos.length) {
                throw new Error('Tipo de turismo não encontrado');
            }

            localStorage.setItem('tiposTurismo', JSON.stringify(filteredTipos));
            return { success: true, data: tipoTurismo };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Search tourism types
    search(searchTerm) {
        try {
            const tipos = this.getAll();
            if (!searchTerm || searchTerm.trim() === '') {
                return tipos;
            }
            
            const term = searchTerm.toLowerCase().trim();
            return tipos.filter(tipo => tipo.toLowerCase().includes(term));
        } catch (error) {
            console.error('Error searching tourism types:', error);
            return [];
        }
    }
};
