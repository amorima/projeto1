/**
 * Obtém todos os tipos de turismo do armazenamento local
 * @returns {Array} Array com todos os tipos de turismo
 */
export function getAllTourismTypes() {
    try {
        const tiposTurismo = localStorage.getItem('tiposTurismo');
        return tiposTurismo ? JSON.parse(tiposTurismo) : [];
    } catch (error) {
        return [];
    }
}
/**
 * Adiciona um novo tipo de turismo
 * @param {string} tipoTurismo - Tipo de turismo a adicionar
 * @returns {Object} Resultado da operação com success e data/error
 */
export function addTourismType(tipoTurismo) {
    try {
        if (!tipoTurismo || typeof tipoTurismo !== 'string' || tipoTurismo.trim() === '') {
            throw new Error('Invalid tourism type');
        }
        const tipos = getAllTourismTypes();
        const trimmedTipo = tipoTurismo.trim();
        if (tipos.some(tipo => tipo.toLowerCase() === trimmedTipo.toLowerCase())) {
            throw new Error('Este tipo de turismo já existe');
        }
        tipos.push(trimmedTipo);
        localStorage.setItem('tiposTurismo', JSON.stringify(tipos));
        return { success: true, data: trimmedTipo };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
/**
 * Atualiza um tipo de turismo existente
 * @param {string} oldValue - Valor antigo do tipo de turismo
 * @param {string} newValue - Novo valor do tipo de turismo
 * @returns {Object} Resultado da operação com success e data/error
 */
export function updateTourismType(oldValue, newValue) {
    try {
        if (!oldValue || !newValue || typeof oldValue !== 'string' || typeof newValue !== 'string') {
            throw new Error('Invalid tourism type values');
        }
        const tipos = getAllTourismTypes();
        const trimmedNew = newValue.trim();
        if (trimmedNew === '') {
            throw new Error('O tipo de turismo não pode estar vazio');
        }
        const oldIndex = tipos.findIndex(tipo => tipo === oldValue);
        if (oldIndex === -1) {
            throw new Error('Tipo de turismo não encontrado');
        }
        if (tipos.some((tipo, index) => index !== oldIndex && tipo.toLowerCase() === trimmedNew.toLowerCase())) {
            throw new Error('Este tipo de turismo já existe');
        }
        tipos[oldIndex] = trimmedNew;
        localStorage.setItem('tiposTurismo', JSON.stringify(tipos));
        return { success: true, data: trimmedNew };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
/**
 * Remove um tipo de turismo
 * @param {string} tipoTurismo - Tipo de turismo a remover
 * @returns {Object} Resultado da operação com success e data/error
 */
export function deleteTourismType(tipoTurismo) {
    try {
        if (!tipoTurismo || typeof tipoTurismo !== 'string') {
            throw new Error('Invalid tourism type');
        }
        const tipos = getAllTourismTypes();
        const filteredTipos = tipos.filter(tipo => tipo !== tipoTurismo);
        if (filteredTipos.length === tipos.length) {
            throw new Error('Tipo de turismo não encontrado');
        }
        localStorage.setItem('tiposTurismo', JSON.stringify(filteredTipos));
        return { success: true, data: tipoTurismo };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
/**
 * Pesquisa tipos de turismo por termo
 * @param {string} searchTerm - Termo de pesquisa
 * @returns {Array} Array de tipos de turismo que correspondem à pesquisa
 */
export function searchTourismTypes(searchTerm) {
    try {
        const tipos = getAllTourismTypes();
        if (!searchTerm || searchTerm.trim() === '') {
            return tipos;
        }
        const term = searchTerm.toLowerCase().trim();
        return tipos.filter(tipo => tipo.toLowerCase().includes(term));
    } catch (error) {
        return [];
    }
}
